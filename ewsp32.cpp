#include <WiFi.h>
#include <TFT_eSPI.h>
#include <math.h> // Necesario para la función exp() de la simulación

// --- SELECTOR DEL MODO DE OPERACIÓN ---
// Cambia esta línea para elegir el modo de funcionamiento:
// MODO_NORMAL      -> Lee los sensores físicos.
// DEMO_30_DIAS     -> Simula el decaimiento en 30 días (el proceso completo tarda 30 días reales).
// DEMO_30_MINUTOS  -> Simula el decaimiento en 30 minutos (el proceso completo se acelera para durar 30 minutos).
enum ModoOperacion { MODO_NORMAL, DEMO_30_DIAS, DEMO_30_MINUTOS };
const ModoOperacion MODO_OPERACION = DEMO_30_MINUTOS;

// Definiciones de colores
#define TFT_GRAY 0x8410
#define TFT_LIGHT_BLUE 0x841F
#define TFT_DARK_GREEN 0x03E0
#define TFT_ORANGE 0xFD20

// Configuración WiFi
const char* ssid = "BERNAL";
const char* password = "Persia1992";


// Objeto del servidor web en el puerto 80
WiFiServer server(80);

// Configuración del sensor TSW-20M para ESP32 Dev 30 pines
const int SENSOR_ANALOGICO = 34;  // GPIO34 (Pin 6) - Pin analógico (A)
const int SENSOR_DIGITAL = 33;    // GPIO33 (Pin 9) - Pin digital (D) - opcional

// Configuración del sensor de pH
const int PH_ANALOGICO = 35;      // GPIO35 (Pin 8) - Po (pH Output)
const int PH_DIGITAL = 32;        // GPIO32 (Pin 10) - Do (Digital Output) - opcional  
const int TEMP_ANALOGICO = 39;    // GPIO39 (Pin 5) - To (Temperature Output) - opcional

// Configuración del sensor de conductividad
const int CONDUCTIVIDAD_ANALOGICO = 26;  // GPIO36 (Pin 4) - Señal analógica
const int CONDUCTIVIDAD_DIGITAL = 25;    // GPIO25 (Pin 11) - Señal digital (opcional)

// Variables del sensor de turbidez
float voltaje = 0;
float turbidez = 0;
int valorADC = 0;

// Variables del sensor de pH
float voltajePH = 0;
float valorPH = 0;
int valorPH_ADC = 0;
float temperatura = 0;

// Variables del sensor de conductividad
float voltajeConductividad = 0;
float conductividad = 0;
int valorConductividad_ADC = 0;
float tds = 0; // Total Dissolved Solids (Sólidos Disueltos Totales)

// Variables de tiempo
unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_LECTURA = 2000; // Leer/actualizar cada 2 segundos

// Calibración del pH (ajustar según tu sensor)
const float PH_OFFSET = 0.0;  // Ajuste de calibración
const float PH_SLOPE = 3.5;   // Pendiente de calibración (voltios por unidad pH)

// Calibración de conductividad (ajustar según tu sensor)
const float CONDUCTIVIDAD_OFFSET = 0.0;  // Ajuste de calibración
const float CONDUCTIVIDAD_FACTOR = 1000.0; // Factor de conversión µS/cm

// --- VARIABLES Y CONSTANTES PARA EL MODO DEMO ---
unsigned long demoStartTime = 0;
const int NUM_PARAMS = 4; // pH, Temp, Turbidez, Conductividad
// Orden de los parámetros: pH, Temperatura (°C), Turbidez (NTU), Conductividad (uS/cm)
const float initial_values[NUM_PARAMS] = {10.45, 20.8, 336.0, 1729.0};   // Sin filtrar
const float filtered_values[NUM_PARAMS] = {7.89, 20.0, 184.0, 191.0};      // Post-filtrado día 0
float efficiency_0[NUM_PARAMS];
const float decay_rate = 0.05;

TFT_eSPI tft = TFT_eSPI();

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Configurar pines de los sensores (solo si es modo normal)
  if (MODO_OPERACION == MODO_NORMAL) {
    pinMode(SENSOR_ANALOGICO, INPUT);
    pinMode(SENSOR_DIGITAL, INPUT);
    pinMode(PH_ANALOGICO, INPUT);
    pinMode(PH_DIGITAL, INPUT);
    pinMode(TEMP_ANALOGICO, INPUT);
    pinMode(CONDUCTIVIDAD_ANALOGICO, INPUT);
    pinMode(CONDUCTIVIDAD_DIGITAL, INPUT);
  }
  
  // Inicializar pantalla
  inicializarPantalla();
  
  // Conectar WiFi
  conectarWiFi();
  
  // Mostrar pantalla principal
  mostrarPantallaPrincipal();
  
  // Iniciar el servidor web
  server.begin();
  Serial.println("Servidor HTTP iniciado. Accede con la IP.");


  // Iniciar modo demo si está seleccionado
  iniciarDemo();
  
  Serial.println("Sistema iniciado.");
}

void loop() {

  // Gestionar peticiones del servidor web en cada ciclo
  handleWebServer();

  if (MODO_OPERACION == MODO_NORMAL) {
    // --- MODO NORMAL: LEER SENSORES ---
    if (millis() - ultimaLectura >= INTERVALO_LECTURA) {
      leerSensorTSW20M();
      leerSensorPH();
      leerSensorConductividad();
      actualizarPantalla();
      ultimaLectura = millis();
    }
    // Verificar conexión WiFi (y reiniciar si se pierde)
    if (WiFi.status() != WL_CONNECTED) {
      mostrarErrorWiFi();
      delay(5000);
      ESP.restart();
    }
  } else {
    // --- MODO DEMO: EJECUTAR SIMULACIÓN ---
    ejecutarModoDemo();
  }
  
  delay(10);
}


void handleWebServer() {
  WiFiClient client = server.available(); // Escucha por clientes entrantes
  if (!client) {
    return; // Si no hay cliente, salir
  }

  Serial.println("Nuevo cliente web conectado.");
  
  // Esperar a que el cliente envíe datos
  while (client.connected() && !client.available()) {
    delay(1);
  }
  
  // Leer la primera línea de la petición (no la usamos, pero hay que leerla)
  String req = client.readStringUntil('\r');
  client.flush(); // Limpiar el buffer de entrada

  // --- PREPARAR LA RESPUESTA HTML ---
  String html = "<!DOCTYPE html><html><head><title>Monitor de Agua ESP32</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<meta http-equiv='refresh' content='5'>"; // Auto-refrescar cada 5 segundos
  html += "<style>body{background-color:#1e1e1e; color:#e0e0e0; font-family:sans-serif; text-align:center;}";
  html += ".container{display:flex; flex-wrap:wrap; justify-content:center; gap:20px; padding:20px;}";
  html += ".card{background-color:#333; border-radius:10px; padding:20px; min-width:200px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);}";
  html += "h1{color:#00bcd4;} h2{font-size:1.2em; color:#ff9800;} h3{color:#ccc;}";
  html += ".value{font-size:2em; font-weight:bold; color:white;}";
  html += ".status-buena{color:#4caf50;} .status-regular{color:#ffeb3b;} .status-mala{color:#f44336;}</style>";
  html += "</head><body><h1>Monitor de Calidad de Agua</h1>";
  
  // Mostrar el modo de operación actual
  html += "<h2>Modo: ";
  if (MODO_OPERACION == MODO_NORMAL) html += "NORMAL";
  else if (MODO_OPERACION == DEMO_30_DIAS) html += "DEMO 30 DIAS";
  else html += "DEMO 30 MINUTOS";
  html += "</h2>";
  
  html += "<div class='container'>";
  
  // Tarjeta de Estado General
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
  
  // Tarjeta de pH
  html += "<div class='card'><h3>pH</h3><p class='value'>" + String(valorPH, 1) + "</p></div>";
  
  // Tarjeta de Turbidez
  html += "<div class='card'><h3>Turbidez</h3><p class='value'>" + String(turbidez, 0) + " <span style='font-size:0.5em'>NTU</span></p></div>";
  
  // Tarjeta de Conductividad
  html += "<div class='card'><h3>Conductividad</h3><p class='value'>" + String(conductividad, 0) + " <span style='font-size:0.5em'>µS/cm</span></p></div>";
  
  // Tarjeta de TDS
  html += "<div class='card'><h3>TDS</h3><p class='value'>" + String(tds, 0) + " <span style='font-size:0.5em'>ppm</span></p></div>";

  // Tarjeta de Temperatura
  html += "<div class='card'><h3>Temperatura</h3><p class='value'>" + String(temperatura, 1) + " <span style='font-size:0.5em'>°C</span></p></div>";

  html += "</div></body></html>";
  
  // Enviar la respuesta al cliente
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Connection: close"); // La conexión se cerrará después de la respuesta
  client.println(); // Línea en blanco obligatoria
  client.println(html);

  delay(1);
  client.stop(); // Cerrar la conexión
  Serial.println("Cliente web desconectado.");
}


// --- NUEVAS FUNCIONES PARA EL MODO DEMO ---

void iniciarDemo() {
  if (MODO_OPERACION != MODO_NORMAL) {
    Serial.println("MODO DEMO ACTIVADO.");
    // Calcular la eficiencia inicial para cada parámetro
    for (int i = 0; i < NUM_PARAMS; i++) {
      efficiency_0[i] = 1.0 - (filtered_values[i] / initial_values[i]);
      Serial.print("Eficiencia inicial Param[");
      Serial.print(i);
      Serial.print("]: ");
      Serial.println(efficiency_0[i]);
    }
    // Registrar el tiempo de inicio del demo
    demoStartTime = millis();
    ultimaLectura = demoStartTime; // Sincronizar la primera lectura
  }
}

void ejecutarModoDemo() {
  if (millis() - ultimaLectura >= INTERVALO_LECTURA) {
    unsigned long elapsedTime = millis() - demoStartTime;
    float t_simulado = 0.0;
    
    if (MODO_OPERACION == DEMO_30_DIAS) {
      // Mapear el tiempo real a 30 días simulados
      // 1 día real = 1 día simulado
      t_simulado = (float)elapsedTime / (24.0 * 60.0 * 60.0 * 1000.0);
    } else if (MODO_OPERACION == DEMO_30_MINUTOS) {
      // Mapear el tiempo real a 30 "días" simulados en 30 minutos
      // 1 minuto real = 1 "día" simulado
      const unsigned long DEMO_DURATION_MS = 30UL * 60 * 1000;
      t_simulado = ((float)elapsedTime / DEMO_DURATION_MS) * 30.0;
    }
    
    // Limitar la simulación a 30 días
    if (t_simulado > 30.0) {
      t_simulado = 30.0;
    }
    
    Serial.print("Día simulado: ");
    Serial.println(t_simulado, 2);
    
    // Calcular los valores simulados y actualizar las variables globales
    calcularValoresSimulados(t_simulado);
    
    // Actualizar la pantalla con los nuevos valores
    actualizarPantalla();
    
    ultimaLectura = millis();
  }
}

void calcularValoresSimulados(float t_simulado) {
  // Fórmula: value = initial * (1 - (efficiency_0 * exp(-decay_rate * t)))
  
  // Parámetro 0: pH
  float eff_ph = efficiency_0[0] * exp(-decay_rate * t_simulado);
  valorPH = initial_values[0] * (1.0 - eff_ph);

  // Parámetro 1: Temperatura
  float eff_temp = efficiency_0[1] * exp(-decay_rate * t_simulado);
  temperatura = initial_values[1] * (1.0 - eff_temp);

  // Parámetro 2: Turbidez
  float eff_turb = efficiency_0[2] * exp(-decay_rate * t_simulado);
  turbidez = initial_values[2] * (1.0 - eff_turb);

  // Parámetro 3: Conductividad
  float eff_cond = efficiency_0[3] * exp(-decay_rate * t_simulado);
  conductividad = initial_values[3] * (1.0 - eff_cond);
  
  // Calcular TDS a partir de la conductividad simulada
  tds = conductividad * 0.5;
}


// --- FUNCIONES ORIGINALES (con pequeñas modificaciones) ---

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

void conectarWiFi() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("Buscando WiFi...");
  
  Serial.println("Escaneando redes WiFi...");
  int numRedes = WiFi.scanNetworks();
  bool redEncontrada = false;
  
  tft.setCursor(10, 40);
  tft.setTextSize(1);
  tft.print("Redes encontradas: ");
  tft.println(numRedes);
  
  for (int i = 0; i < numRedes; i++) {
    if (WiFi.SSID(i) == ssid) {
      redEncontrada = true;
      break;
    }
  }
  
  if (!redEncontrada) {
    mostrarErrorRed();
    return;
  }
  
  tft.setCursor(10, 70);
  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.setTextSize(2);
  tft.println("Conectando...");
  
  WiFi.begin(ssid, password);
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    tft.setCursor(10 + (attempts % 20) * 10, 100);
    tft.setTextColor(TFT_ORANGE, TFT_BLACK);
    tft.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    mostrarConexionExitosa();
  } else {
    mostrarErrorConexion();
  }
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
  tft.println(ssid);
  tft.setCursor(10, 90);
  tft.print("IP: ");
  tft.println(WiFi.localIP());
  
  Serial.println("\nConectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  delay(3000);
}

void mostrarErrorRed() {
  tft.fillScreen(TFT_RED);
  tft.setTextColor(TFT_WHITE, TFT_RED);
  tft.setTextSize(2);
  tft.setCursor(10, 30);
  tft.println("Red no");
  tft.setCursor(10, 60);
  tft.println("encontrada!");
  
  Serial.println("La red especificada no fue encontrada.");
  delay(5000);
  ESP.restart();
}

void mostrarErrorConexion() {
  tft.fillScreen(TFT_RED);
  tft.setTextColor(TFT_WHITE, TFT_RED);
  tft.setTextSize(2);
  tft.setCursor(10, 30);
  tft.println("Error de");
  tft.setCursor(10, 60);
  tft.println("conexion!");
  
  Serial.println("\nFallo de conexión.");
  delay(5000);
  ESP.restart();
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
  
  // Mostrar modo de operación actual
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
  tft.println(ssid);
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
  if (turbidez > 4550) turbidez = 4550;
  
  Serial.print("Turbidez - ADC: "); Serial.print(valorADC);
  Serial.print(", V: "); Serial.print(voltaje, 2);
  Serial.print("V, Turb: "); Serial.print(turbidez, 0); Serial.println(" NTU");
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
  
  Serial.print("pH - ADC: "); Serial.print(valorPH_ADC);
  Serial.print(", V: "); Serial.print(voltajePH, 2);
  Serial.print("V, pH: "); Serial.print(valorPH, 1);
  Serial.print(", Temp: "); Serial.print(temperatura, 1); Serial.println("°C");
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
  if (conductividad > 5000) conductividad = 5000;
  
  tds = conductividad * 0.5;
  
  Serial.print("Conduct. - ADC: "); Serial.print(valorConductividad_ADC);
  Serial.print(", V: "); Serial.print(voltajeConductividad, 2);
  Serial.print("V, Cond: "); Serial.print(conductividad, 0);
  Serial.print(" uS/cm, TDS: "); Serial.print(tds, 0); Serial.println(" ppm");
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
  
  bool turbiaOK = turbidez < 500;
  bool phOK = (valorPH >= 6.5 && valorPH <= 8.5);
  bool conductividadOK = (conductividad >= 50 && conductividad <= 800);
  bool tdsOK = (tds < 300);
  
  int parametrosOK = turbiaOK + phOK + conductividadOK + tdsOK;
  
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