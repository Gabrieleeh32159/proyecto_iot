import cv2
import sys
import os
import torch
from clasicov2 import create_tracker  # tu función para crear CSRT/KCF/MOSSE
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import MODEL_NAME, CONFIDENCE_THRESHOLD, WEAPON_CLASSES

# =========================
# CONFIGURACIÓN
# =========================
CAM_INDEX = 0  # cámara por defecto (ajusta si usas otra)

# Configuración del modelo de HuggingFace para detección de armas
YOLO_MODEL_HF = MODEL_NAME  # "Subh775/Firearm_Detection_Yolov8n"
YOLO_TARGET_LABELS = ["Gun"]  # Clases de armas a detectar
YOLO_CONF_THRESHOLD_INITIAL = 0.8  # Para detección inicial (muy seguro)
YOLO_CONF_THRESHOLD_REDETECT = 0.6  # Para redetecciones (más permisivo)
YOLO_REFRESH_EVERY = 10  # cada cuántos frames refresca YOLO
YOLO_TIMEOUT = 5.0  # segundos sin detección YOLO antes de desactivar tracker

WINDOW_NAME = "Hybrid YOLO + Tracker (Weapon Detection)"


def get_device() -> str:
    """Determine the best available device (MPS for M3, CPU fallback)"""
    if torch.backends.mps.is_available():
        return "mps"
    elif torch.cuda.is_available():
        return "cuda"
    else:
        return "cpu"


def load_weapon_detection_model():
    """Load the YOLOv8 weapon detection model from HuggingFace"""
    try:
        print(f"[INFO] Descargando modelo de detección de armas: {YOLO_MODEL_HF}")
        # Download model weights from HuggingFace
        model_path = hf_hub_download(
            repo_id=YOLO_MODEL_HF,
            filename="weights/best.pt"
        )
        model = YOLO(model_path)
        print(f"[INFO] Modelo cargado exitosamente desde: {model_path}")
        return model
    except Exception as e:
        print(f"[ERROR] Error cargando modelo de armas: {e}")
        print("[WARN] Usando modelo YOLOv8 genérico para demo...")
        print("⚠️  ADVERTENCIA: Detectará objetos generales, no armas específicamente")
        return YOLO("yolov8m.pt")


def main():
    # --- Cargar modelo YOLO ---
    print(f"[DEBUG] Configuración:")
    print(f"  - Modelo HuggingFace: {YOLO_MODEL_HF}")
    print(f"  - Clases objetivo: {YOLO_TARGET_LABELS}")
    print(f"  - Umbral inicial: {YOLO_CONF_THRESHOLD_INITIAL}")
    print(f"  - Umbral redetección: {YOLO_CONF_THRESHOLD_REDETECT}")
    print(f"  - Refresh cada: {YOLO_REFRESH_EVERY} frames")
    print(f"  - Timeout tracker: {YOLO_TIMEOUT}s")
    
    device = get_device()
    print(f"  - Device: {device}")
    
    yolo_model = load_weapon_detection_model()

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print("[ERROR] No se pudo abrir la cámara")
        return

    # Obtener FPS de la cámara
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0 or fps is None:
        fps = 30.0  # Fallback a 30 FPS
    print(f"[INFO] FPS de la cámara: {fps}")

    tracker = None
    tracking = False
    last_yolo_detection_time = None  # Timestamp de última detección YOLO exitosa

    frame_idx = 0
    last_yolo_box = None  # (x1, y1, x2, y2) en coords de imagen

    print("[INFO] Controles:")
    print("   ESC : salir")
    print(f"[INFO] Timeout de tracker: {YOLO_TIMEOUT}s sin detección YOLO")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] No se pudo leer frame, saliendo...")
            break

        frame_idx += 1

        # =============================
        # 1) REFRESCO PERIÓDICO CON YOLO
        # =============================
        if frame_idx % YOLO_REFRESH_EVERY == 0:
            print(f"[DEBUG] Frame {frame_idx}: Ejecutando detección YOLO...")
            # usamos una copia para que YOLO pueda dibujar sin afectar el frame principal
            frame_for_yolo = frame.copy()

            results = yolo_model.predict(frame_for_yolo)[0]
            print(f"[DEBUG] Total de detecciones en frame: {len(results.boxes)}")

            best_box = None
            best_class_name = None
            best_confidence = 0.0
            
            # Determinar umbral según si ya estamos tracking o no
            current_threshold = YOLO_CONF_THRESHOLD_INITIAL if not tracking else YOLO_CONF_THRESHOLD_REDETECT
            
            for box in results.boxes:
                class_id = int(box.cls[0])
                class_name = results.names[class_id]
                confidence = float(box.conf[0])
                print(f"[DEBUG] Detectado: clase='{class_name}', confianza={confidence:.2f}")

                # Verificar si es una clase de arma y supera el threshold
                if class_name.lower() in [c.lower() for c in YOLO_TARGET_LABELS] and confidence >= current_threshold:
                    print(f"[DEBUG] ✓ Arma detectada: '{class_name}' con confianza {confidence:.2f} (threshold: {current_threshold})")
                    if best_box is None or confidence > float(best_box.conf[0]):
                        best_box = box
                        best_class_name = class_name
                        best_confidence = confidence
                else:
                    print(f"[DEBUG] ✗ No es arma objetivo o baja confianza. Buscando: {YOLO_TARGET_LABELS}, conf>={current_threshold}")

            if best_box is not None:
                # YOLO detectó un arma con confianza suficiente
                x1, y1, x2, y2 = map(int, best_box.xyxy[0])
                last_yolo_box = (x1, y1, x2, y2)
                
                # Actualizar timestamp de última detección
                last_yolo_detection_time = frame_idx / fps
                print(f"[DEBUG] ✓✓ Mejor detección: {best_class_name} conf={best_confidence:.2f} bbox=({x1}, {y1}, {x2}, {y2})")

                # Reiniciar tracker solo si YOLO está MUY seguro (>= 0.9)
                if best_confidence >= YOLO_CONF_THRESHOLD_INITIAL:
                    w = x2 - x1
                    h = y2 - y1
                    bbox = (x1, y1, w, h)

                    tracker = create_tracker()
                    tracker.init(frame, bbox)
                    tracking = True
                    print(f"[DEBUG] Tracker reiniciado con alta confianza ({best_confidence:.2f})")
                elif not tracking:
                    # Primera detección con confianza moderada, iniciar tracker
                    w = x2 - x1
                    h = y2 - y1
                    bbox = (x1, y1, w, h)

                    tracker = create_tracker()
                    tracker.init(frame, bbox)
                    tracking = True
                    print(f"[DEBUG] Tracker iniciado con detección inicial")
                else:
                    print(f"[DEBUG] YOLO detecta pero confianza < 0.9, manteniendo tracker actual")

                # Dibujar la caja YOLO (rectángulo azul)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Azul en BGR
                label = f"YOLO: {best_class_name} {best_confidence:.2f}"
                cv2.putText(frame, label,
                            (x1, max(y1 - 10, 0)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            (255, 0, 0), 2)

            else:
                # YOLO NO detectó arma, pero NO desactivamos tracker inmediatamente
                # Solo limpiamos la caja YOLO
                last_yolo_box = None
                print("[INFO] YOLO no detecta armas en este frame.")

        # =============================
        # 1.5) VERIFICAR TIMEOUT DE DETECCIÓN
        # =============================
        if tracking and last_yolo_detection_time is not None:
            current_time = frame_idx / fps
            time_since_detection = current_time - last_yolo_detection_time
            
            if time_since_detection >= YOLO_TIMEOUT:
                print(f"[WARN] ⏰ Timeout: {time_since_detection:.1f}s sin detección YOLO. Desactivando tracker.")
                tracking = False
                tracker = None
                last_yolo_detection_time = None
                last_yolo_box = None

        # =============================
        # 2) SEGUIMIENTO CLÁSICO ENTRE REFRESCOS
        # =============================
        if tracking and tracker is not None:
            ok, bbox = tracker.update(frame)
            if ok:
                x, y, w, h = [int(v) for v in bbox]
                cx = x + w // 2
                cy = y + h // 2
                
                # Calcular tiempo desde última detección YOLO
                if last_yolo_detection_time is not None:
                    current_time = frame_idx / fps
                    time_since_detection = current_time - last_yolo_detection_time
                else:
                    time_since_detection = 0.0
                
                print(f"[DEBUG] Tracker activo: bbox=({x}, {y}, {w}, {h}), sin YOLO por {time_since_detection:.1f}s")

                # Dibujar caja del tracker (ROJO durante período de gracia)
                color = (0, 0, 255) if time_since_detection > 0.5 else (0, 255, 0)  # Rojo si lleva tiempo sin YOLO
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.circle(frame, (cx, cy), 4, color, -1)
                
                # Mostrar tiempo restante si estamos en período de gracia
                if time_since_detection > 0.5:
                    time_remaining = YOLO_TIMEOUT - time_since_detection
                    label = f"Tracking [{time_remaining:.1f}s]"
                else:
                    label = "Tracking weapon"
                    
                cv2.putText(frame, label,
                            (x, max(y - 10, 0)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            color, 2)
            else:
                # Tracker perdió el objeto -> desactivar inmediatamente
                print("[WARN] ❌ Tracker perdió el objeto. Desactivando.")
                tracking = False
                tracker = None
                last_yolo_detection_time = None
                last_yolo_box = None

        # =============================
        # 3) INFORMACIÓN EN PANTALLA
        # =============================
        # Mostrar estado del sistema
        status_y = 20
        if tracking and last_yolo_detection_time is not None:
            current_time = frame_idx / fps
            time_since_detection = current_time - last_yolo_detection_time
            status_text = f"Tracking activo | Sin YOLO: {time_since_detection:.1f}s / {YOLO_TIMEOUT}s"
            cv2.putText(frame, status_text, (10, status_y), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        elif tracking:
            cv2.putText(frame, "Tracking activo | YOLO OK", (10, status_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        else:
            cv2.putText(frame, "Esperando deteccion...", (10, status_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 1)

        # =============================
        # 4) VISUALIZACIÓN Y TECLADO
        # =============================
        cv2.putText(frame, "ESC: salir",
                    (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4,
                    (255, 255, 255), 1)

        cv2.imshow(WINDOW_NAME, frame)

        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
