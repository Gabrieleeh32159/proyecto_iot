# SafeGuard AI - Sistema de Detección y Seguimiento de Armas

## 📋 Descripción del Proyecto

SafeGuard AI es un sistema inteligente de vigilancia que detecta armas de fuego en tiempo real y las rastrea automáticamente mediante un sistema de servomotores. El sistema está diseñado para entornos de seguridad donde se requiere monitoreo continuo y respuesta rápida ante amenazas potenciales.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────┐     WiFi      ┌─────────────────────┐     WiFi     ┌─────────────────┐
│   📱 iPhone     │ ─────────────>│   💻 Backend        │<────────────>│   🎛️ ESP32      │
│   (Cámara)      │   WebSocket   │   (FastAPI + YOLO)  │  WebSocket   │   (Servos)      │
└─────────────────┘               └─────────────────────┘              └─────────────────┘
                                           │
                                           │ WebSocket
                                           ▼
                                  ┌─────────────────────┐
                                  │   🖥️ Dashboard      │
                                  │   (React + Vite)    │
                                  └─────────────────────┘
```

### Flujo de Datos

1. **Captura de Imagen**: El iPhone actúa como cámara IP conectada vía WiFi a la laptop
2. **Cliente de Streaming** (`client/webcam_client.py`): Captura frames a 2 FPS y los envía al backend
3. **Servidor Backend** (`backend/main.py`): Procesa frames con YOLO, detecta armas y calcula ángulos
4. **Microcontrolador ESP32** (`esp32_servos/esp32_servos.ino`): Recibe comandos y mueve los servos
5. **Dashboard Frontend** (`frontend/`): Visualiza detecciones, historial y estadísticas

## 🔌 Protocolos de Comunicación

### WebSocket (Puerto 8000)

| Endpoint | Descripción | Formato |
|----------|-------------|---------|
| `/ws/webcam` | Recibe frames del cliente | JSON: `{frame: base64, timestamp}` |
| `/ws/display` | Envía frames anotados al dashboard | JSON: `{frame, detections, weapon_detected}` |
| `/ws/servos` | Envía comandos al ESP32 | Texto: `"X,Y"` (ej: `"90,120"`) |

### REST API (Puerto 8000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/incidents` | Lista todos los incidentes con estadísticas |
| POST | `/api/save-gif` | Guarda GIF animado de un incidente |
| DELETE | `/api/incidents/{id}` | Elimina un incidente |

## 🧠 Modelo de Detección

- **Modelo**: YOLOv8 fine-tuned para armas de fuego
- **Fuente**: `Subh775/Firearm_Detection_Yolov8n` (HuggingFace)
- **Tracker**: ByteTrack para seguimiento persistente de objetos
- **Clases detectadas**: Gun (pistolas, armas de fuego)
- **Threshold de confianza**: 0.6 (60%)
- **Timeout de tracking**: 5 segundos sin detección

## ⚙️ Configuración Técnica

### Cámara (shared/config.py)
- Resolución: 640x480 pixels
- FPS objetivo: 2 frames por segundo
- Calidad JPEG: 85%

### Servos (shared/config.py)
- Campo de visión horizontal: 78°
- Campo de visión vertical: 62°
- Rango de servos: 0° - 180°
- Posición central: 90°, 90°

### ESP32 (esp32_servos.ino)
- Pin Servo X (pan): GPIO 2
- Pin Servo Y (tilt): GPIO 4
- Conexión: WiFi → ngrok → Backend WebSocket

## 💰 Sistema de Facturación

- **Tarifa**: $0.01 USD por segundo de detección activa
- **Cálculo**: Se mide la duración de cada incidente (desde primera detección hasta 5s sin detección)
- **Estadísticas**: Total mensual, costo acumulado, historial por mes

## 📁 Estructura del Proyecto

```
proyecto_iot/
├── backend/
│   ├── main.py                 # Servidor FastAPI principal
│   ├── simple_yolo_tracker.py  # Tracker YOLO con ByteTrack
│   ├── servo_controller.py     # Cálculo de ángulos para servos
│   ├── incident_gifs/          # Almacenamiento de GIFs e incidentes
│   └── requirements.txt
├── client/
│   ├── webcam_client.py        # Cliente de captura de frames
│   └── requirements.txt
├── esp32_servos/
│   └── esp32_servos.ino        # Firmware del microcontrolador
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Dashboard principal
│   │   └── components/         # Componentes React
│   └── package.json
├── shared/
│   └── config.py               # Configuración compartida
└── contexto.md                 # Este archivo
```

## 🚀 Ejecución del Sistema

### 1. Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Cliente de Cámara (Terminal 2)
```bash
cd client
python webcam_client.py
```

### 3. Frontend (Terminal 3)
```bash
cd frontend
npm install
npm run dev
```

### 4. ESP32
- Cargar el firmware `esp32_servos.ino` usando Arduino IDE
- Configurar credenciales WiFi y URL de ngrok
- Conectar servos a pines GPIO 2 y GPIO 4

## 🔧 Tecnologías Utilizadas

### Backend
- Python 3.10+
- FastAPI (servidor web async)
- Ultralytics YOLO (detección de objetos)
- OpenCV (procesamiento de imagen)
- WebSockets (comunicación en tiempo real)

### Frontend
- React 18
- TypeScript
- Vite (bundler)
- Tailwind CSS (estilos)
- Recharts (gráficas)
- gifshot (creación de GIFs)

### Hardware
- iPhone (cámara IP vía Continuity Camera)
- ESP32 (microcontrolador WiFi)
- 2x Servomotores SG90 (pan/tilt)
- Laptop MacBook (procesamiento)

## 📊 Características del Dashboard

1. **Monitoreo en Vivo**: Stream de video con detecciones marcadas
2. **Historial de Incidentes**: Galería con GIFs animados de cada detección
3. **Estadísticas**: Total de incidentes, costo mensual, gráficas temporales
4. **Filtros**: Búsqueda por mes, paginación
5. **Estado de Conexión**: Indicador WebSocket en tiempo real
