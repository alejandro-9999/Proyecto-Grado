// ===================================================================
// LIBRERÍAS
// ===================================================================
#include <WiFi.h>
#include "BluetoothSerial.h"
#include <TFT_eSPI.h>
#include <math.h>
#include <ArduinoJson.h>

// ===================================================================
// CONFIGURACIÓN DEL PROYECTO
// ===================================================================
enum ModoOperacion { MODO_NORMAL, DEMO_30_DIAS, DEMO_30_MINUTOS };
const ModoOperacion MODO_OPERACION = DEMO_30_MINUTOS;
String device_name = "ESP32-WaterMonitor-Config";
BluetoothSerial SerialBT;
TFT_eSPI tft = TFT_eSPI();
#define TFT_GRAY 0x8410
#define TFT_LIGHT_BLUE 0x841F
#define TFT_DARK_GREEN 0x03E0
#define TFT_ORANGE 0xFD20
const int SENSOR_ANALOGICO = 34;
const int SENSOR_DIGITAL = 33;
const int PH_ANALOGICO = 35;
const int PH_DIGITAL = 32;
const int TEMP_ANALOGICO = 39;
const int CONDUCTIVIDAD_ANALOGICO = 26;
const int CONDUCTIVIDAD_DIGITAL = 25;

// ===================================================================
// VARIABLES GLOBALES
// ===================================================================
bool wifiConfigured = false;
WiFiServer server(80);
String current_ssid = "";
float voltaje = 0, turbidez = 0;
int valorADC = 0;
float voltajePH = 0, valorPH = 0;
int valorPH_ADC = 0;
float temperatura = 0;
float voltajeConductividad = 0, conductividad = 0, tds = 0;
int valorConductividad_ADC = 0;
unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_LECTURA = 2000;
const float PH_OFFSET = 0.0;
const float PH_SLOPE = 3.5;
const float CONDUCTIVIDAD_OFFSET = 0.0;
const float CONDUCTIVIDAD_FACTOR = 1000.0;
unsigned long demoStartTime = 0;
const int NUM_PARAMS = 4;
const float initial_values[NUM_PARAMS] = {10.45, 20.8, 336.0, 1729.0};
const float filtered_values[NUM_PARAMS] = {7.89, 20.0, 184.0, 191.0};
float efficiency_0[NUM_PARAMS];
const float decay_rate = 0.05;

// ===================================================================
// FUNCIÓN DE SETUP
// ===================================================================
void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando sistema...");
  inicializarPantalla();
  SerialBT.begin(device_name);
  Serial.printf("Dispositivo Bluetooth '%s' iniciado. Esperando conexión para configurar WiFi.\n", device_name.c_str());
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(10, 30);
  tft.println("Esperando App...");
  tft.setCursor(10, 60);
  tft.println("Conecte via BT");
  tft.setTextSize(1);
  tft.setCursor(10, 100);
  tft.print("Nombre: ");
  tft.println(device_name);
}

// ===================================================================
// BUCLE PRINCIPAL (LOOP)
// ===================================================================
void loop() {
  if (SerialBT.available()) {
    handleBluetoothCommands();
  }
  if (wifiConfigured) {
    handleWebServer();
    if (MODO_OPERACION == MODO_NORMAL) {
      if (millis() - ultimaLectura >= INTERVALO_LECTURA) {
        leerSensores();
        actualizarPantalla();
        ultimaLectura = millis();
      }
    } else {
      ejecutarModoDemo();
    }
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Conexión WiFi perdida. Intentando reconectar...");
      mostrarErrorWiFi();
      delay(5000);
      ESP.restart();
    }
  }
  delay(10);
}

// ===================================================================
// FUNCIONES DE COMUNICACIÓN Y CONTROL
// ===================================================================

// <<--- PROTOTIPO DE LA FUNCIÓN (SOLUCIÓN AL ERROR) ---<<
void sendBluetoothResponse(bool success, String message, String ip = "");

void handleBluetoothCommands() {
  String incomingString = SerialBT.readStringUntil('\n');
  if (incomingString.length() == 0) return;

  Serial.print("Comando BT recibido: ");
  Serial.println(incomingString);

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, incomingString);

  if (error) {
    Serial.print("Error al parsear JSON: ");
    Serial.println(error.c_str());
    sendBluetoothResponse(false, "Comando JSON invalido");
    return;
  }

  const char* command = doc["command"];

  if (strcmp(command, "CONNECT_WIFI") == 0) {
    const char* ssid = doc["data"]["ssid"];
    const char* password = doc["data"]["password"];
    connectToWifi(ssid, password);
  } else if (strcmp(command, "GET_STATUS") == 0) {
    if (wifiConfigured) {
      String msg = "Conectado a " + current_ssid;
      sendBluetoothResponse(true, msg, WiFi.localIP().toString());
    } else {
      sendBluetoothResponse(false, "WiFi no configurado");
    }
  } else {
    sendBluetoothResponse(false, "Comando desconocido");
  }
}

void connectToWifi(const char* ssid, const char* password) {
  if (!ssid || !password || strlen(ssid) == 0) {
    sendBluetoothResponse(false, "SSID o password vacios");
    return;
  }
  
  Serial.printf("Intentando conectar a la red: %s\n", ssid);
  tft.fillScreen(TFT_BLACK);
  tft.setCursor(10, 30);
  tft.setTextSize(2);
  tft.println("Conectando a:");
  tft.setTextSize(1);
  tft.setCursor(10, 60);
  tft.println(ssid);

  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConexion Exitosa!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    current_ssid = String(ssid);
    sendBluetoothResponse(true, "Conexion WiFi exitosa", WiFi.localIP().toString());
    
    wifiConfigured = true;
    startMonitorSystem();
    
  } else {
    Serial.println("\nFallo la conexion.");
    WiFi.disconnect(true);
    sendBluetoothResponse(false, "Error de conexion. Verifique credenciales.");
    tft.fillScreen(TFT_RED);
    tft.setTextColor(TFT_WHITE, TFT_RED);
    tft.setCursor(10, 30);
    tft.println("Error de WiFi");
    delay(3000);
    setup(); 
  }
}

void sendBluetoothResponse(bool success, String message, String ip) {
  JsonDocument responseDoc;
  responseDoc["success"] = success;
  responseDoc["message"] = message;
  if (ip.length() > 0) {
    responseDoc["ip"] = ip;
  }
  
  String jsonResponse;
  serializeJson(responseDoc, jsonResponse);
  
  SerialBT.println(jsonResponse);
  Serial.print("Respuesta BT enviada: ");
  Serial.println(jsonResponse);
}

void startMonitorSystem() {
  mostrarConexionExitosa();
  server.begin();
  Serial.println("Servidor HTTP iniciado.");
  if (MODO_OPERACION == MODO_NORMAL) {
    pinMode(SENSOR_ANALOGICO, INPUT);
    pinMode(SENSOR_DIGITAL, INPUT);
    pinMode(PH_ANALOGICO, INPUT);
    pinMode(PH_DIGITAL, INPUT);
    pinMode(TEMP_ANALOGICO, INPUT);
    pinMode(CONDUCTIVIDAD_ANALOGICO, INPUT);
    pinMode(CONDUCTIVIDAD_DIGITAL, INPUT);
  }
  iniciarDemo();
  mostrarPantallaPrincipal();
  Serial.println("Sistema de monitoreo iniciado.");
}

// ===================================================================
// OTRAS FUNCIONES (sin cambios)
// ===================================================================

void handleWebServer() {
  WiFiClient client = server.available();
  if (!client) return;
  Serial.println("Nuevo cliente web conectado.");
  while (client.connected() && !client.available()) delay(1);
  String req = client.readStringUntil('\r');
  client.flush();
  String html = "<!DOCTYPE html><html><head><title>Monitor de Agua ESP32</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<meta http-equiv='refresh' content='5'>";
  html += "<style>body{background-color:#1e1e1e; color:#e0e0e0; font-family:sans-serif; text-align:center;}";
  html += ".container{display:flex; flex-wrap:wrap; justify-content:center; gap:20px; padding:20px;}";
  html += ".card{background-color:#333; border-radius:10px; padding:20px; min-width:200px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);}";
  html += "h1{color:#00bcd4;} h2{font-size:1.2em; color:#ff9800;} h3{color:#ccc;}";
  html += ".value{font-size:2em; font-weight:bold; color:white;}";
  html += ".status-buena{color:#4caf50;} .status-regular{color:#ffeb3b;} .status-mala{color:#f44336;}</style>";
  html += "</head><body><h1>Monitor de Calidad de Agua</h1>";
  html += "<h2>Modo: ";
  if (MODO_OPERACION == MODO_NORMAL) html += "NORMAL";
  else if (MODO_OPERACION == DEMO_30_DIAS) html += "DEMO 30 DIAS";
  else html += "DEMO 30 MINUTOS";
  html += "</h2>";
  html += "<div class='container'>";
  String estadoStr = "MALA";
  String estadoClass = "status-mala";
  bool turbiaOK = turbidez < 500;
  bool phOK = (valorPH >= 6.5 && valorPH <= 8.5);
  bool conductividadOK = (conductividad >= 50 && conductividad <= 800);
  bool tdsOK = (tds < 300);
  int parametrosOK = turbiaOK + phOK + conductividadOK + tdsOK;
  if (parametrosOK >= 3) { estadoStr = "BUENA"; estadoClass = "status-buena"; } 
  else if (parametrosOK >= 2) { estadoStr = "REGULAR"; estadoClass = "status-regular"; }
  html += "<div class='card'><h3>Estado General</h3><p class='value " + estadoClass + "'>" + estadoStr + "</p></div>";
  html += "<div class='card'><h3>pH</h3><p class='value'>" + String(valorPH, 1) + "</p></div>";
  html += "<div class='card'><h3>Turbidez</h3><p class='value'>" + String(turbidez, 0) + " <span style='font-size:0.5em'>NTU</span></p></div>";
  html += "<div class='card'><h3>Conductividad</h3><p class='value'>" + String(conductividad, 0) + " <span style='font-size:0.5em'>µS/cm</span></p></div>";
  html += "<div class='card'><h3>TDS</h3><p class='value'>" + String(tds, 0) + " <span style='font-size:0.5em'>ppm</span></p></div>";
  html += "<div class='card'><h3>Temperatura</h3><p class='value'>" + String(temperatura, 1) + " <span style='font-size:0.5em'>°C</span></p></div>";
  html += "</div></body></html>";
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Connection: close");
  client.println();
  client.println(html);
  delay(1);
  client.stop();
  Serial.println("Cliente web desconectado.");
}
void leerSensores() {
  leerSensorTSW20M();
  leerSensorPH();
  leerSensorConductividad();
}
void iniciarDemo() {
  if (MODO_OPERACION != MODO_NORMAL) {
    Serial.println("MODO DEMO ACTIVADO.");
    for (int i = 0; i < NUM_PARAMS; i++) {
      efficiency_0[i] = 1.0 - (filtered_values[i] / initial_values[i]);
    }
    demoStartTime = millis();
    ultimaLectura = demoStartTime;
  }
}
void ejecutarModoDemo() {
  if (millis() - ultimaLectura >= INTERVALO_LECTURA) {
    unsigned long elapsedTime = millis() - demoStartTime;
    float t_simulado = 0.0;
    if (MODO_OPERACION == DEMO_30_DIAS) {
      t_simulado = (float)elapsedTime / (24.0 * 60.0 * 60.0 * 1000.0);
    } else if (MODO_OPERACION == DEMO_30_MINUTOS) {
      const unsigned long DEMO_DURATION_MS = 30UL * 60 * 1000;
      t_simulado = ((float)elapsedTime / DEMO_DURATION_MS) * 30.0;
    }
    if (t_simulado > 30.0) t_simulado = 30.0;
    calcularValoresSimulados(t_simulado);
    actualizarPantalla();
    ultimaLectura = millis();
  }
}
void calcularValoresSimulados(float t_simulado) {
  float eff_ph = efficiency_0[0] * exp(-decay_rate * t_simulado);
  valorPH = initial_values[0] * (1.0 - eff_ph);
  float eff_temp = efficiency_0[1] * exp(-decay_rate * t_simulado);
  temperatura = initial_values[1] * (1.0 - eff_temp);
  float eff_turb = efficiency_0[2] * exp(-decay_rate * t_simulado);
  turbidez = initial_values[2] * (1.0 - eff_turb);
  float eff_cond = efficiency_0[3] * exp(-decay_rate * t_simulado);
  conductividad = initial_values[3] * (1.0 - eff_cond);
  tds = conductividad * 0.5;
}
void inicializarPantalla() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setTextSize(3);
  tft.setCursor(30, 10);
  tft.println("MONITOR");
  tft.setCursor(10, 40);
  tft.println("AGUA COMPLETO");
  tft.setTextSize(1);
  tft.setTextColor(TFT_GRAY, TFT_BLACK);
  tft.setCursor(20, 80);
  tft.println("TSW-20M + pH + Conductividad");
  tft.setCursor(60, 95);
  tft.println("Iniciando...");
  delay(2000);
}
void mostrarConexionExitosa() {
  tft.fillScreen(TFT_DARK_GREEN);
  tft.setTextColor(TFT_WHITE, TFT_DARK_GREEN);
  tft.setTextSize(2);
  tft.setCursor(50, 30);
  tft.println("CONECTADO!");
  tft.setTextSize(1);
  tft.setCursor(10, 70);
  tft.print("Red: ");
  tft.println(WiFi.SSID());
  tft.setCursor(10, 90);
  tft.print("IP: ");
  tft.println(WiFi.localIP());
  delay(3000);
}
void mostrarErrorWiFi() {
  tft.fillRect(0, 0, 320, 30, TFT_RED);
  tft.setTextColor(TFT_WHITE, TFT_RED);
  tft.setTextSize(1);
  tft.setCursor(10, 10);
  tft.println("WiFi desconectado - Reiniciando...");
}
void mostrarPantallaPrincipal() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(30, 5);
  tft.println("MONITOR AGUA");
  tft.drawLine(10, 25, 310, 25, TFT_GRAY);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(1);
  tft.setCursor(10, 30);
  tft.println("Turbidez:");
  tft.setCursor(10, 45);
  tft.println("pH:");
  tft.setCursor(10, 60);
  tft.println("Conductiv:");
  tft.setCursor(10, 75);
  tft.println("TDS:");
  tft.setCursor(10, 90);
  tft.println("Temp:");
  tft.setCursor(10, 105);
  tft.println("Estado:");
  tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  tft.setCursor(180, 155);
  if (MODO_OPERACION == MODO_NORMAL) {
    tft.print("MODO: NORMAL");
  } else if (MODO_OPERACION == DEMO_30_DIAS) {
    tft.print("DEMO: 30 DIAS");
  } else {
    tft.print("DEMO: 30 MIN");
  }
  tft.setTextColor(TFT_GRAY, TFT_BLACK);
  tft.setCursor(10, 140);
  tft.println("TSW-20M + pH + Conductividad");
  tft.setCursor(10, 155);
  tft.print("WiFi: ");
  tft.println(current_ssid);
}
void leerSensorTSW20M() {
  int suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(SENSOR_ANALOGICO);
    delay(10);
  }
  valorADC = suma / 10;
  voltaje = valorADC * (3.3 / 4095.0);
  if (voltaje >= 3.0) { turbidez = map(voltaje * 100, 300, 330, 0, 100); }
  else if (voltaje >= 2.5) { turbidez = map(voltaje * 100, 250, 300, 100, 500); }
  else if (voltaje >= 2.0) { turbidez = map(voltaje * 100, 200, 250, 500, 1000); }
  else if (voltaje >= 1.5) { turbidez = map(voltaje * 100, 150, 200, 1000, 2000); }
  else if (voltaje >= 1.0) { turbidez = map(voltaje * 100, 100, 150, 2000, 3000); }
  else { turbidez = map(voltaje * 100, 0, 100, 3000, 4550); }
  if (turbidez < 0) turbidez = 0;
}
void leerSensorPH() {
  int suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(PH_ANALOGICO);
    delay(10);
  }
  valorPH_ADC = suma / 10;
  voltajePH = valorPH_ADC * (3.3 / 4095.0);
  valorPH = 7.0 + ((2.5 - voltajePH) / PH_SLOPE) + PH_OFFSET;
  if (valorPH < 0) valorPH = 0;
  if (valorPH > 14) valorPH = 14;
  int tempADC = analogRead(TEMP_ANALOGICO);
  float voltajeTemp = tempADC * (3.3 / 4095.0);
  temperatura = (voltajeTemp - 0.5) * 100.0;
}
void leerSensorConductividad() {
  int suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(CONDUCTIVIDAD_ANALOGICO);
    delay(10);
  }
  valorConductividad_ADC = suma / 10;
  voltajeConductividad = valorConductividad_ADC * (3.3 / 4095.0);
  if (voltajeConductividad < 0.1) { conductividad = 0; } 
  else { conductividad = (voltajeConductividad / 3.3) * CONDUCTIVIDAD_FACTOR + CONDUCTIVIDAD_OFFSET; }
  if (conductividad < 0) conductividad = 0;
  tds = conductividad * 0.5;
}
void actualizarPantalla() {
  tft.fillRect(80, 25, 160, 100, TFT_BLACK);
  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.setTextSize(1);
  tft.setCursor(80, 30); tft.print(turbidez, 0); tft.print(" NTU");
  tft.setCursor(80, 45);
  if (valorPH < 6.5) tft.setTextColor(TFT_RED, TFT_BLACK);
  else if (valorPH > 8.5) tft.setTextColor(TFT_BLUE, TFT_BLACK);
  else tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.print(valorPH, 1);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setCursor(80, 60); tft.print(conductividad, 0); tft.print(" uS/cm");
  tft.setCursor(80, 75);
  if (tds < 150) tft.setTextColor(TFT_GREEN, TFT_BLACK);
  else if (tds < 300) tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  else if (tds < 600) tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  else tft.setTextColor(TFT_RED, TFT_BLACK);
  tft.print(tds, 0); tft.print(" ppm");
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setCursor(80, 90); tft.print(temperatura, 1); tft.print(" C");
  tft.setTextSize(1);
  tft.setCursor(80, 105);
  int parametrosOK = (turbidez < 500) + (valorPH >= 6.5 && valorPH <= 8.5) + (conductividad >= 50 && conductividad <= 800) + (tds < 300);
  if (parametrosOK >= 3) { tft.setTextColor(TFT_GREEN, TFT_BLACK); tft.println("BUENA"); }
  else if (parametrosOK >= 2) { tft.setTextColor(TFT_YELLOW, TFT_BLACK); tft.println("REGULAR"); }
  else { tft.setTextColor(TFT_RED, TFT_BLACK); tft.println("MALA"); }
  mostrarBarraTurbidez();
  mostrarBarraPH();
  mostrarBarraConductividad();
}
void mostrarBarraTurbidez() {
  int barraX = 250, barraY = 25, barraAncho = 15, barraAlto = 25;
  tft.fillRect(barraX, barraY, barraAncho, barraAlto, TFT_BLACK);
  tft.drawRect(barraX, barraY, barraAncho, barraAlto, TFT_WHITE);
  int alturaRelleno = map(turbidez, 0, 4550, 0, barraAlto - 2);
  if (alturaRelleno > barraAlto - 2) alturaRelleno = barraAlto - 2;
  uint16_t colorBarra;
  if (turbidez > 2000) colorBarra = TFT_RED;
  else if (turbidez > 1000) colorBarra = TFT_ORANGE;
  else if (turbidez > 500) colorBarra = TFT_YELLOW;
  else colorBarra = TFT_GREEN;
  if (alturaRelleno > 0) tft.fillRect(barraX + 1, barraY + barraAlto - 1 - alturaRelleno, barraAncho - 2, alturaRelleno, colorBarra);
}
void mostrarBarraPH() {
  int barraX = 270, barraY = 25, barraAncho = 15, barraAlto = 25;
  tft.fillRect(barraX, barraY, barraAncho, barraAlto, TFT_BLACK);
  tft.drawRect(barraX, barraY, barraAncho, barraAlto, TFT_WHITE);
  int alturaRelleno = map(valorPH * 10, 0, 140, 0, barraAlto - 2);
  if (alturaRelleno > barraAlto - 2) alturaRelleno = barraAlto - 2;
  uint16_t colorBarra;
  if (valorPH < 4.0) colorBarra = TFT_RED;
  else if (valorPH < 6.5) colorBarra = TFT_ORANGE;
  else if (valorPH <= 8.5) colorBarra = TFT_GREEN;
  else if (valorPH <= 10.0) colorBarra = TFT_BLUE;
  else colorBarra = TFT_MAGENTA;
  if (alturaRelleno > 0) tft.fillRect(barraX + 1, barraY + barraAlto - 1 - alturaRelleno, barraAncho - 2, alturaRelleno, colorBarra);
}
void mostrarBarraConductividad() {
  int barraX = 290, barraY = 25, barraAncho = 15, barraAlto = 25;
  tft.fillRect(barraX, barraY, barraAncho, barraAlto, TFT_BLACK);
  tft.drawRect(barraX, barraY, barraAncho, barraAlto, TFT_WHITE);
  int alturaRelleno = map(conductividad, 0, 2000, 0, barraAlto - 2);
  if (alturaRelleno > barraAlto - 2) alturaRelleno = barraAlto - 2;
  uint16_t colorBarra;
  if (conductividad < 50) colorBarra = TFT_BLUE;
  else if (conductividad < 200) colorBarra = TFT_GREEN;
  else if (conductividad < 800) colorBarra = TFT_YELLOW;
  else if (conductividad < 1500) colorBarra = TFT_ORANGE;
  else colorBarra = TFT_RED;
  if (alturaRelleno > 0) tft.fillRect(barraX + 1, barraY + barraAlto - 1 - alturaRelleno, barraAncho - 2, alturaRelleno, colorBarra);
}