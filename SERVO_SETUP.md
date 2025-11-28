# Sistema de Apuntado Automático con Servos

## 🎯 Sistema Implementado

El sistema ahora detecta armas y calcula automáticamente los ángulos para que 2 servos apunten al objetivo.

## 📁 Archivos Creados/Modificados

### **Backend:**
- ✅ `backend/servo_controller.py` - Lógica de cálculo de ángulos
- ✅ `backend/main.py` - Endpoint `/ws/servos` agregado
- ✅ `shared/config.py` - Configuración de FOV y servos

### **ESP32:**
- ✅ `esp32_servos/esp32_servos.ino` - Código Arduino para controlar servos

---

## 🔧 Configuración del Hardware

### **Componentes Necesarios:**
1. ESP32 Dev Board
2. 2x Servo Motors SG90 (o similar, 0-180°)
3. Fuente de alimentación externa 5V para servos (recomendado)
4. Cables jumper

### **Conexiones:**
```
ESP32        Servo X (Pan)    Servo Y (Tilt)
GPIO 12  →   Signal (X)
GPIO 13  →                    Signal (Y)
GND      →   GND              GND
VIN/5V   →   VCC              VCC (use fuente externa si es posible)
```

---

## 🚀 Cómo Usar

### **1. Configurar ESP32-Servos:**

Edita `esp32_servos/esp32_servos.ino`:

```cpp
// WiFi
const char* WIFI_SSID = "TU_SSID";
const char* WIFI_PASS = "TU_PASSWORD";

// Backend server (local)
String ws_host = "192.168.1.100";  // IP de tu Mac
int ws_port = 8000;
```

**Para ngrok (remoto):**
```cpp
String ws_host = "xxxx.ngrok-free.app";
int ws_port = 443;
// Y cambiar webSocket.begin() → webSocket.beginSSL()
```

### **2. Subir código al ESP32:**
1. Abrir Arduino IDE
2. Instalar librerías:
   - `WebSocketsClient` by Markus Sattler
   - `ArduinoJson` by Benoit Blanchon
   - `ESP32Servo` by Kevin Harrington
3. Seleccionar placa: `ESP32 Dev Module`
4. Subir código

### **3. Iniciar el Sistema:**

**Terminal 1 - Backend:**
```bash
cd backend
python3 main.py
```

Verás:
```
Starting server on port 8000
Endpoints:
  - WebSocket (webcam): ws://localhost:8000/ws/webcam
  - WebSocket (display): ws://localhost:8000/ws/display
  - WebSocket (servos): ws://localhost:8000/ws/servos
```

**Terminal 2 - Webcam (o ESP32-CAM):**
```bash
cd client
python3 webcam_client.py
```

**Terminal 3 - Display:**
```bash
cd client
python3 display_client.py
```

**ESP32-Servos** se conectará automáticamente al iniciar.

---

## 📊 Funcionamiento

### **Flujo de Datos:**
```
1. Webcam/ESP32-CAM → frames → Backend
2. Backend → detección de armas → YOLOv8
3. Backend → cálculo de ángulos → ServoController
4. Backend → comando → /ws/servos → ESP32-Servos
5. ESP32-Servos → mueve servos → apunta al arma
```

### **Cálculo de Ángulos:**
- **FOV Cámara**: 60° horizontal × 45° vertical
- **Centro Frame**: (320, 240) → Servos en (90°, 90°)
- **Arma detectada**: BBox → Centro → Normalizar → Ángulos

**Ejemplo:**
```
Arma en pixel (400, 200)
→ Normalizado: (0.25, -0.083)
→ Offset: (+15°, -3.75°)
→ Servos: (105°, 86°)
```

### **Prioridad de Objetivos:**
- Si hay **múltiples armas** → Apunta a la **más grande** (más cercana)
- Si **NO hay armas** → Mantiene **última posición**

---

## 🎮 Comandos JSON

### **Backend → ESP32-Servos:**
```json
{
  "type": "servo_command",
  "x_angle": 105,
  "y_angle": 86,
  "weapon_class": "pistol",
  "confidence": 0.87,
  "target_position": {
    "center_x": 400,
    "center_y": 200,
    "width": 80,
    "height": 60
  }
}
```

### **ESP32-Servos → Backend (status):**
```json
{
  "type": "status",
  "current_x": 105,
  "current_y": 86,
  "ready": true
}
```

---

## 🔍 Debugging

### **Ver comandos de servos en backend:**
Cuando se detecta un arma verás:
```
🎯 Servo command: X=105° Y=86° → pistol
```

### **Monitor Serial del ESP32:**
```
🟢 Connected to WebSocket!
🎯 Target detected: pistol (0.87) → Move to X=105° Y=86°
✓ Position reached: X=105° Y=86°
```

---

## ⚙️ Ajustes y Calibración

### **En `shared/config.py`:**
```python
# Ajustar FOV si tu cámara es diferente
CAMERA_FOV_HORIZONTAL = 60.0  # Cambiar según tu cámara
CAMERA_FOV_VERTICAL = 45.0

# Ajustar rangos de servos si es necesario
SERVO_X_CENTER = 90  # Cambiar si tu centro es diferente
SERVO_Y_CENTER = 90
```

### **En `esp32_servos.ino`:**
```cpp
// Velocidad de movimiento (1-10)
const int SERVO_SPEED = 5;  // Menor = más suave, Mayor = más rápido

// Pines de los servos
const int PIN_SERVO_X = 12;  // Cambiar según tu conexión
const int PIN_SERVO_Y = 13;
```

---

## 🎯 Prueba del Sistema

1. **Sin servos físicos**: Backend mostrará comandos en consola
2. **Con servos**: Los servos apuntarán automáticamente a las armas detectadas
3. **Con ESP32-CAM**: Sistema completo funcionando

---

## 📝 Notas Importantes

- ✅ Los servos necesitan **alimentación externa** (5V 1-2A recomendado)
- ✅ El ESP32 puede **no tener suficiente corriente** para alimentar 2 servos desde VIN
- ✅ **GND común** entre ESP32 y fuente externa de servos
- ✅ El sistema funciona en **tiempo real** (~10 FPS)
- ✅ Los ángulos se calculan automáticamente según el **FOV de la cámara**

---

## 🚀 ¡Sistema Listo!

El sistema de apuntado automático está completamente implementado y listo para usar!
