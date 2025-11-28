#include <ESP32Servo.h>

Servo miServo1;
Servo miServo2;

#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "iPhone de Gabriel";
const char* password = "deldosalnueve";

WebSocketsClient webSocket;

// Pines para los servos
#define PIN_SERVO_X 2
#define PIN_SERVO_Y 4

void onWebSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("🟢 Conectado al Server");
      break;
      
    case WStype_TEXT:
      // Llegó un texto! Ej: "90,97"
      String texto = (char*)payload;
      Serial.print("🎯 Comando recibido: ");
      Serial.println(texto);

      // --- PARSEO DE DATOS (Separar por coma) ---
      int comaIndex = texto.indexOf(',');
      if (comaIndex > 0) {
        String sX = texto.substring(0, comaIndex);
        String sY = texto.substring(comaIndex + 1);
        
        int valX = sX.toInt();
        int valY = sY.toInt();

        // Mover Servos
        miServo1.write(valX);
        miServo2.write(valY);
        
        Serial.printf("✓ Servos movidos -> X: %d°, Y: %d°\n", valX, valY);
      }
      break;
      
    case WStype_DISCONNECTED:
      Serial.println("🔴 Desconectado del Server");
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  // Configurar servos
  miServo1.attach(PIN_SERVO_X);
  miServo2.attach(PIN_SERVO_Y);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  // Configura tu Host de Ngrok
  webSocket.setExtraHeaders("ngrok-skip-browser-warning: true");
  webSocket.beginSSL("b6afd4cbe291.ngrok-free.app", 443, "/ws/servos");
  webSocket.onEvent(onWebSocketEvent);
  
  Serial.println("✓ Esperando comandos de servos...");
}

void loop() {
  for(int i=0; i<10; i++) {
    webSocket.loop(); // <--- Mantiene la escucha activa
    delay(100);       // Espera 100ms x 10 = 1000ms
  }
}