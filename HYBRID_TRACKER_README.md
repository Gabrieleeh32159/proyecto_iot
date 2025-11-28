# 🎯 Integración del Sistema de Tracking Híbrido

## Cambios Implementados

### 1. **Nuevo Archivo: `backend/hybrid_tracker.py`**
Clase `HybridWeaponTracker` que combina:
- ✅ **YOLO** para detección de armas (cada 10 frames)
- ✅ **Tracker Clásico** (CSRT/KCF) para seguimiento continuo
- ✅ **Sistema de Timeout** de 5 segundos
- ✅ **Umbrales Duales**: 0.8 para detección inicial, 0.6 para redetección

### 2. **Modificado: `backend/main.py`**
Cambios principales:
- Reemplazado `WeaponDetector` por `HybridWeaponTracker`
- **Servos apuntan al arma** cuando hay tracking activo
- **Servos regresan a (90°, 90°)** cuando no hay detección

### 3. **Comportamiento del Sistema**

#### **Estado 1: Sin Detección**
```
No weapon → Servos en centro (90°, 90°)
```

#### **Estado 2: Detección Inicial**
```
YOLO detecta arma (confianza ≥ 0.8)
  ↓
Activa tracker CSRT/KCF
  ↓
Servos apuntan al arma (bbox verde)
```

#### **Estado 3: Tracking Activo**
```
Tracker sigue el arma entre frames
  ↓
Servos actualizan posición continuamente
  ↓
YOLO revalida cada 10 frames
```

#### **Estado 4: Período de Gracia (0.5s - 5s sin YOLO)**
```
Tracker continúa funcionando (bbox roja)
  ↓
Servos siguen apuntando
  ↓
Contador visual: "Tracking [4.2s]"
```

#### **Estado 5: Timeout o Pérdida**
```
5s sin YOLO O tracker pierde objeto
  ↓
Desactiva tracker
  ↓
Servos regresan a centro (90°, 90°)
```

## Ventajas del Sistema Híbrido

### **vs. YOLO Solo:**
- ✅ **Tracking fluido** entre detecciones YOLO
- ✅ **Menos jitter** en los movimientos de los servos
- ✅ **Mejor rendimiento** (YOLO cada 10 frames, no todos)
- ✅ **Tolerancia a oclusiones temporales**

### **vs. Tracker Solo:**
- ✅ **Detección precisa** con YOLO
- ✅ **Auto-corrección** cada 10 frames
- ✅ **Manejo de pérdida** con timeout
- ✅ **Re-inicialización inteligente**

## Configuración

### Ajustar Sensibilidad
En `backend/hybrid_tracker.py`:
```python
HybridWeaponTracker(
    conf_threshold_initial=0.8,   # ↑ más estricto, ↓ más permisivo
    conf_threshold_redetect=0.6,  # ↑ más estricto, ↓ más permisivo
    yolo_refresh_every=10,        # ↓ más YOLO, ↑ menos YOLO
    timeout_seconds=5.0,          # tiempo antes de resetear
)
```

### Clases Detectadas
En `shared/config.py`:
```python
WEAPON_CLASSES = ["pistol", "rifle", "knife", "weapon"]
```

En `fusion.py` y `hybrid_tracker.py`:
```python
target_labels=["Gun"]  # Ajustar según tu modelo
```

## Flujo de Datos

```
Webcam/ESP32
    ↓
WebSocket → main.py
    ↓
HybridWeaponTracker.process_frame()
    ├─ YOLO detection (cada 10 frames)
    ├─ Classical tracking (todos los frames)
    └─ Timeout check (5 segundos)
    ↓
tracking_info (bbox, center, class, confidence)
    ↓
ServoController.get_servo_command()
    ↓
WebSocket → ESP32 Servos
    ├─ Si weapon: (X°, Y°) apuntando al arma
    └─ Si no weapon: (90°, 90°) centro
```

## Visualización

### Colores de Bounding Box
- 🟦 **Azul (fino)**: Última detección YOLO
- 🟢 **Verde**: Tracker con respaldo YOLO reciente (< 0.5s)
- 🔴 **Rojo**: Tracker en período de gracia (> 0.5s sin YOLO)

### Labels
- `"Tracking: Gun"` - Tracking activo con YOLO reciente
- `"Tracking [4.2s]"` - Período de gracia, muestra tiempo restante

## Testing

### Probar el Tracker
```bash
cd backend
python test_tracker.py
```

### Ejecutar el Backend
```bash
cd backend
python main.py
```

### Logs a Observar
```
[HybridTracker] 🎯 Detected: Gun (0.85)
🎯 Servo: X=95° Y=88° → Gun (source: yolo)
[HybridTracker] ✓ Redetected: Gun (0.72), keeping tracker
🎯 Servo: X=96° Y=89° → Gun (source: tracker)
[HybridTracker] ⏰ Timeout: 5.1s without YOLO detection
🟢 No weapon detected - Servos at center (90°, 90°)
```

## Troubleshooting

### Tracker pierde el objeto muy rápido
- ↑ Aumentar `timeout_seconds` (ej: 8.0)
- ↓ Bajar `conf_threshold_redetect` (ej: 0.5)

### Demasiados falsos positivos
- ↑ Aumentar `conf_threshold_initial` (ej: 0.9)
- ↑ Aumentar `conf_threshold_redetect` (ej: 0.7)

### Servos se mueven mucho (jitter)
- ↑ Aumentar `yolo_refresh_every` (ej: 15)
- Implementar filtro de suavizado en `servo_controller.py`

### YOLO no detecta tu modelo de arma
- Verificar que la clase esté en `target_labels`
- Revisar `shared/config.py` → `WEAPON_CLASSES`
- Confirmar que el modelo HuggingFace use esas clases

## Archivos Modificados

```
backend/
├── hybrid_tracker.py          [NUEVO] - Tracker híbrido
├── main.py                    [MODIFICADO] - Integración del tracker
├── test_tracker.py            [NUEVO] - Script de prueba
├── model_handler.py           [SIN CAMBIOS] - Mantener para referencia
└── servo_controller.py        [SIN CAMBIOS] - Funciona igual

tracking/
└── fusion.py                  [SIN CAMBIOS] - Script standalone
```

## Próximos Pasos Opcionales

1. **Suavizado de Servos**: Implementar filtro promedio móvil
2. **Múltiples Armas**: Tracking de varios objetivos simultáneos
3. **Kalman Filter**: Predicción de movimiento (ya en clasicov2.py)
4. **Historial**: Grabar trayectorias de tracking
5. **Alertas**: Notificaciones cuando se detecta arma

---
**Estado**: ✅ Implementación completa y funcional
**Última actualización**: 27 Nov 2025
