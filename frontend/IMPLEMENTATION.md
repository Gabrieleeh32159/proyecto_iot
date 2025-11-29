# 🎯 Frontend - Sistema de Detección de Armas en Tiempo Real

## ✅ Implementación Completa

Se ha integrado el sistema de detección de armas en tiempo real usando WebSocket y almacenamiento local.

---

## 📁 Archivos Creados

### 1. `/frontend/src/services/websocket.ts`
**Servicio de WebSocket** que conecta con el backend.

**Características:**
- ✅ Conexión a `ws://localhost:8000/ws/display`
- ✅ Reconexión automática si se pierde conexión
- ✅ Manejo de estados: `connecting`, `connected`, `disconnected`, `error`
- ✅ Handlers para mensajes y cambios de estado
- ✅ Auto-limpieza al desmontar componente

**Uso:**
```typescript
const ws = new WebSocketService('ws://localhost:8000/ws/display');
ws.onMessage((data) => { /* handle data */ });
ws.onStatus((status) => { /* handle status */ });
ws.connect();
```

### 2. `/frontend/src/services/incidentStorage.ts`
**Servicio de persistencia** usando `localStorage`.

**Características:**
- ✅ Guardar/cargar incidentes en localStorage
- ✅ Cálculo automático de estadísticas
- ✅ Límite de 200 incidentes máximo
- ✅ Paginación incorporada
- ✅ Limpieza de incidentes antiguos (> 30 días)

**Métodos:**
```typescript
incidentStorage.saveIncident(incident)    // Guardar
incidentStorage.loadIncidents()           // Cargar todos
incidentStorage.getStats()                // Estadísticas
incidentStorage.getIncidentsByPage(1, 6)  // Paginación
incidentStorage.clearAllIncidents()       // Limpiar todo
```

### 3. `/frontend/src/App.tsx` (Modificado)
**Componente principal** con lógica de sesiones.

---

## 🔄 Flujo de Funcionamiento

### **Estado 1: Sistema Inactivo**
```
- Sin detección activa
- WebSocket recibiendo frames continuamente
- UI muestra: "Dashboard normal" + Stats
```

### **Estado 2: Nueva Detección (tracking_active: false → true)**
```
Backend detecta arma por primera vez
    ↓
WebSocket envía: { weapon_detected: true, tracking_active: true }
    ↓
Frontend:
  1. Crea nueva sesión (activeIncident)
  2. Muestra frame en pantalla grande
  3. Incrementa contador (+1) ✅
  4. Guarda timestamp, bbox, confidence
    ↓
UI muestra:
  - Banner rojo pulsante
  - Frame de detección (500px)
  - "🔴 EN VIVO"
  - Tipo de arma + confianza
```

### **Estado 3: Tracking Activo (tracking_active: true)**
```
Tracker sigue el arma (frames 2-100)
    ↓
WebSocket envía: { weapon_detected: true, tracking_active: true }
    ↓
Frontend:
  - Actualiza frame en pantalla
  - Mantiene misma sesión (NO incrementa contador)
  - Actualiza confianza si es mayor
    ↓
UI continúa mostrando:
  - Mismo banner
  - Frame actualizado en tiempo real
```

### **Estado 4: Fin de Detección (tracking_active: true → false)**
```
Tracker pierde objetivo O timeout 5s
    ↓
WebSocket envía: { weapon_detected: false, tracking_active: false }
    ↓
Frontend:
  1. Calcula duración del incidente
  2. Determina severidad (por confidence)
  3. Espera 10 segundos
  4. Guarda incidente en localStorage
  5. Agrega a lista de historial
  6. Oculta banner
  7. Scroll a lista
  8. Reset sesión
    ↓
UI muestra:
  - Incidente en historial
  - Banner desaparece
  - Contador queda en nuevo total
```

---

## 🎨 UI/UX Implementada

### **Indicador de Conexión** (Header derecho)
```tsx
🟢 Conectado      - WebSocket activo
🟡 Conectando...  - Intentando conectar
🔴 Desconectado   - Sin conexión
```

### **Banner de Detección en Vivo**
```
┌─────────────────────────────────────────────┐
│ 🔴 Nueva Incidencia Detectada               │
│                                 Gun | 89.3% │
├─────────────────────────────────────────────┤
│                                             │
│         [IMAGEN 500px EN VIVO]              │
│                          🔴 EN VIVO         │
│                                             │
│ Rastreando objetivo...                      │
│ Se guardará cuando finalice la detección    │
└─────────────────────────────────────────────┘
```

### **Cards de Incidentes** (Historial)
```
┌──────────────────────┐
│ [Imagen capturada]   │
│ Alta/Media/Baja      │
├──────────────────────┤
│ 🕐 28/11/2025 15:30 │
│ 📍 Camera 1          │
│ 🔫 Gun               │
└──────────────────────┘
```

---

## 📊 Sistema de Sesiones

### **Deduplicación de Incidentes**

**Problema:** YOLO detecta cada 10 frames → Generaría 100s de incidentes duplicados

**Solución:** Sistema de sesiones basado en `tracking_active`

```typescript
interface ActiveIncidentSession {
  id: number;              // timestamp único
  startTime: string;       // ISO timestamp inicio
  firstFrame: string;      // Base64 del primer frame
  weaponType: string;      // "Gun", "Pistol", etc.
  confidence: number;      // 0-1 (se actualiza al máximo)
  bbox: { x1, y1, x2, y2 }; // Coordenadas
}
```

**Lógica:**
```typescript
if (weapon_detected && tracking_active) {
  if (!activeIncident) {
    // NUEVO INCIDENTE
    crear_sesion()
    contador++  // ✅ Solo aquí se incrementa
  } else {
    // MISMO INCIDENTE
    actualizar_sesion()
    // contador sin cambios
  }
} else if (!tracking_active && activeIncident) {
  // FIN DE INCIDENTE
  guardar_incidente()
  cerrar_sesion()
}
```

---

## 🗄️ Estructura de Datos

### **Formato en localStorage**

**Key:** `weapon_incidents`
```json
[
  {
    "id": 1732823456789,
    "timestamp": "2025-11-28T15:30:45.123Z",
    "location": "Camera 1",
    "weaponType": "Gun",
    "imageUrl": "data:image/jpeg;base64,...",
    "severity": "high",
    "confidence": 0.89,
    "duration": 7,
    "bbox": { "x1": 117, "y1": 106, "x2": 402, "y2": 454 }
  }
]
```

**Key:** `weapon_stats`
```json
{
  "total": 15,
  "thisMonth": 8,
  "lastUpdate": "2025-11-28T15:35:00.000Z"
}
```

---

## 🎯 Criterios Implementados

### **Severidad (Basada en Confianza)**
```typescript
confidence >= 0.85 → "high"   (rojo)
confidence >= 0.70 → "medium" (amarillo)
confidence <  0.70 → "low"    (verde)
```

### **Localización**
```typescript
location = "Camera 1"  // Fijo por ahora
```

### **Almacenamiento de Imágenes**
```typescript
imageUrl = `data:image/jpeg;base64,${frame}`
// Se guarda inline en JSON (simple pero funcional)
```

### **Límites**
```typescript
MAX_INCIDENTS = 200  // Límite de almacenamiento
AUTO_DELETE = 30     // Días antes de auto-limpiar
```

---

## 🚀 Cómo Ejecutar

### **1. Iniciar Backend**
```bash
cd backend
python main.py
# Backend corriendo en localhost:8000
```

### **2. Iniciar Frontend**
```bash
cd frontend
npm install  # (solo primera vez)
npm run dev
# Frontend en localhost:5173
```

### **3. Verificar Conexión**
- Abrir navegador en `http://localhost:5173`
- Ver indicador verde "Conectado" en header
- Consola del navegador debe mostrar: `[WebSocket] Connected successfully`

---

## 🧪 Testing

### **Test Manual 1: Nueva Detección**
1. Mostrar arma a la cámara
2. ✅ Banner rojo debe aparecer
3. ✅ Contador debe incrementar (+1)
4. ✅ Frame se actualiza en tiempo real

### **Test Manual 2: Tracking Continuo**
1. Mantener arma visible (5-10 segundos)
2. ✅ Banner permanece visible
3. ✅ Contador NO incrementa (mismo incidente)
4. ✅ Frame se actualiza constantemente

### **Test Manual 3: Fin de Detección**
1. Quitar arma del cuadro
2. Esperar 5 segundos (timeout)
3. ✅ Después de 10s más, banner desaparece
4. ✅ Incidente aparece en historial
5. ✅ Se guarda en localStorage

### **Test Manual 4: Persistencia**
1. Detectar varias armas
2. Refrescar página (F5)
3. ✅ Incidentes siguen ahí
4. ✅ Contador mantiene valor
5. ✅ Estadísticas correctas

### **Debugging en Consola**
```javascript
// Ver incidentes guardados
JSON.parse(localStorage.getItem('weapon_incidents'))

// Ver estadísticas
JSON.parse(localStorage.getItem('weapon_stats'))

// Limpiar todo
localStorage.clear()
```

---

## 📈 Características Adicionales Implementadas

✅ **Auto-reconexión WebSocket**
- Si se pierde conexión, reintenta cada 3 segundos

✅ **Actualización de Stats en Tiempo Real**
- Total de incidentes
- Incidentes del mes actual
- Última actualización

✅ **Paginación**
- 6 incidentes por página
- Navegación entre páginas

✅ **Responsive Design**
- Grid adaptable (1/2/3 columnas)
- Banner full-width

✅ **Limpieza Automática**
```typescript
incidentStorage.deleteOldIncidents(30); // Borra incidentes > 30 días
```

---

## 🔧 Configuración

### **Cambiar URL del Backend**
```typescript
// src/App.tsx línea ~50
const ws = new WebSocketService('ws://localhost:8000/ws/display');
// Cambiar a tu URL
```

### **Cambiar Límite de Incidentes**
```typescript
// src/services/incidentStorage.ts línea 32
const MAX_INCIDENTS = 200; // Cambiar aquí
```

### **Cambiar Tiempo de Visualización**
```typescript
// src/App.tsx línea ~82
setTimeout(() => {
  // Guardar incidente
}, 10000); // 10 segundos → cambiar aquí
```

---

## ✅ Estado Final

**Sistema completamente funcional:**
- ✅ WebSocket conectado al backend
- ✅ Detección de armas en tiempo real
- ✅ Sistema de sesiones (sin duplicados)
- ✅ Contador preciso de incidentes
- ✅ Persistencia en localStorage
- ✅ UI completa y responsiva
- ✅ Auto-reconexión
- ✅ Estadísticas en tiempo real

**Listo para producción** 🚀
