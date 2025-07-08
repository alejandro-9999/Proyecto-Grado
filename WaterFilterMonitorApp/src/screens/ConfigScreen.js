// src/screens/ConfigScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  Platform,
  PermissionsAndroid,
  FlatList, // Usaremos FlatList para un mejor rendimiento
} from "react-native";
import { colors } from "../components/styles/colors";
// Importar la nueva librería
import { RNBluetoothClassic } from "react-native-bluetooth-classic";

const ConfigScreen = ({ route }) => {
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Un solo estado para todas las operaciones BT
  const [connectedDevice, setConnectedDevice] = useState(null); // Almacena el objeto de conexión
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false); // Iniciar en modo real por defecto
  const [dataSubscription, setDataSubscription] = useState(null);

  // Hook para limpiar la suscripción a datos al desmontar el componente
  useEffect(() => {
    return () => {
      if (dataSubscription) {
        dataSubscription.remove();
      }
      // Asegurarse de desconectar al salir de la pantalla
      if (connectedDevice) {
        connectedDevice.disconnect();
      }
    };
  }, [dataSubscription, connectedDevice]);

  // --- LÓGICA DE PERMISOS (Obligatorio para Android 12+) ---
  const requestBluetoothPermissions = async () => {
    
    console.log("============== "+Platform.OS);
    
    if (Platform.OS === "android") {
      const apiLevel = Platform.Version;
      
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permiso de Ubicación",
            message:
              "La app necesita acceso a la ubicación para buscar dispositivos Bluetooth.",
            buttonNeutral: "Pregúntame Después",
            buttonNegative: "Cancelar",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          granted["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true;
  };

  // --- FUNCIONES BLUETOOTH CON LA NUEVA LIBRERÍA ---

  const scanForDevices = async () => {
    
    console.log("Iniciando escaneo de dispositivos Bluetooth...");
    console.log("Modo Demo:", isDemoMode);
    if (isDemoMode) {
      setIsProcessing(true);
      setTimeout(() => {
        setAvailableDevices([
          { address: "AA:BB:CC:DD:EE:FF", name: "ESP32-WiFiConfig-Demo" },
        ]);
        setIsProcessing(false);
      }, 2000);
      return;
    }

    console.log("Solicitando permisos de Bluetooth...");

    const permissionsGranted = await requestBluetoothPermissions();

    console.log("Permisos de Bluetooth:", permissionsGranted);
    if (!permissionsGranted) {
      Alert.alert(
        "Permisos requeridos",
        "No se pueden buscar dispositivos sin los permisos necesarios."
      );
      return;
    }

    setIsProcessing(true);
    setAvailableDevices([]);
    try {
      const unpaired = await RNBluetoothClassic.startDiscovery();
      setAvailableDevices(unpaired);
      Alert.alert(
        "Escaneo finalizado",
        `${unpaired.length} dispositivos encontrados.`
      );
    } catch (error) {
      Alert.alert("Error de Escaneo", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const connectToDevice = async (device) => {
    if (isDemoMode) {
      setIsProcessing(true);
      setTimeout(() => {
        setConnectedDevice({ name: device.name }); // Simula objeto de conexión
        setIsProcessing(false);
        Alert.alert("Éxito (Demo)", `Conectado a ${device.name}`);
      }, 1500);
      return;
    }

    setIsProcessing(true);
    try {
      const connection = await RNBluetoothClassic.connectToDevice(
        device.address
      );
      setConnectedDevice(connection);
      setAvailableDevices([]); // Limpiar la lista

      // Suscribirse a los datos entrantes
      const subscription = connection.onDataReceived((data) =>
        handleDeviceResponse(data.data)
      );
      setDataSubscription(subscription);

      Alert.alert("Éxito", `Conectado a ${device.name}`);
    } catch (error) {
      Alert.alert("Error de Conexión", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnectDevice = async () => {
    if (dataSubscription) {
      dataSubscription.remove();
      setDataSubscription(null);
    }
    if (connectedDevice) {
      try {
        await connectedDevice.disconnect();
      } catch (error) {
        console.error("Error al desconectar:", error.message);
      } finally {
        setConnectedDevice(null);
      }
    }
  };

  const sendCommandToESP32 = async (command, data = {}) => {
    if (!connectedDevice && !isDemoMode) {
      Alert.alert("Error", "No hay dispositivo conectado.");
      return;
    }

    const payload = JSON.stringify({ command, data }) + "\n";

    if (isDemoMode) {
      // Simular la respuesta después de un delay
      handleDeviceResponse(await simulateESP32Response(command, data));
      return;
    }

    try {
      await connectedDevice.write(payload);
    } catch (error) {
      Alert.alert("Error de Comunicación", error.message);
      setIsProcessing(false);
    }
  };

  const handleDeviceResponse = (responseData) => {
    try {
      // Si la respuesta no es un objeto (viene de la simulación), usarla directamente.
      // Si es un string (viene del BT real), parsearla.
      const response =
        typeof responseData === "object"
          ? responseData
          : JSON.parse(responseData.trim());

      if (response.success) {
        Alert.alert(
          "Éxito desde ESP32",
          `${response.message}\n${response.ip ? `IP: ${response.ip}` : ""}`
        );
      } else {
        Alert.alert("Error desde ESP32", response.message);
      }
    } catch (e) {
      console.error(
        "Error al procesar respuesta:",
        e,
        "Dato crudo:",
        responseData
      );
      Alert.alert(
        "Respuesta inválida",
        "Se recibió una respuesta no válida del dispositivo."
      );
    } finally {
      setIsProcessing(false); // Detener el indicador de carga
    }
  };

  const sendWiFiCredentials = () => {
    if (!wifiSSID || !wifiPassword) {
      Alert.alert("Error", "Por favor ingresa SSID y contraseña");
      return;
    }
    setIsProcessing(true);
    sendCommandToESP32("CONNECT_WIFI", {
      ssid: wifiSSID,
      password: wifiPassword,
    });
  };

  const checkESP32Status = () => {
    setIsProcessing(true);
    sendCommandToESP32("GET_STATUS");
  };

  const getStatusText = () => {
    if (connectedDevice) return `Conectado a ${connectedDevice.name}`;
    if (isProcessing) return "Procesando...";
    return "Desconectado";
  };

  const getStatusColor = () => {
    if (connectedDevice) return "#4CAF50";
    if (isProcessing) return "#FF9800";
    return "#9E9E9E";
  };

  // --- LÓGICA DE SIMULACIÓN (sin cambios) ---
  const simulateESP32Response = (command, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // ... (tu lógica de simulación)
        resolve({ success: true, message: `Simulación de ${command} exitosa` });
      }, 1500);
    });
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración WiFi ESP32</Text>
        <View style={styles.modeSwitch}>
          <Text style={styles.label}>Modo Demo</Text>
          <Switch
            value={isDemoMode}
            onValueChange={setIsDemoMode}
            thumbColor={isDemoMode ? colors.PRIMARY : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conexión Bluetooth</Text>
        {!connectedDevice && (
          <TouchableOpacity
            style={[styles.button, styles.scanButton]}
            onPress={scanForDevices}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? "Escaneando..." : "Buscar Dispositivos"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View>
      {connectedDevice && (
        <>
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnectDevice}
            >
              <Text style={styles.buttonText}>Desconectar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración WiFi</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de Red (SSID)</Text>
              <TextInput
                style={styles.input}
                value={wifiSSID}
                onChangeText={setWifiSSID}
                placeholder="Ingresa el nombre de la red WiFi"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder="Ingresa la contraseña"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, styles.sendButton]}
              onPress={sendWiFiCredentials}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? "Enviando..." : "Configurar WiFi"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.statusButton]}
              onPress={checkESP32Status}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Verificar Estado</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Información</Text>
        <Text style={styles.infoText}>
          • En modo demo, se simula la comunicación con ESP32
        </Text>
        <Text style={styles.infoText}>
          • Para uso real, se usa: react-native-bluetooth-classic
        </Text>
        <Text style={styles.infoText}>
          • El ESP32 debe tener firmware compatible con este protocolo
        </Text>
      </View>
    </View>
  );

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
      disabled={isProcessing}
    >
      <Text style={styles.deviceName}>
        {item.name || "Dispositivo sin nombre"}
      </Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={connectedDevice ? [] : availableDevices} // Solo muestra la lista si no estás conectado
        renderItem={renderDeviceItem}
        keyExtractor={(item) => item.address}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => {
          // Muestra el indicador de carga solo si se está escaneando y no hay dispositivos
          if (isProcessing && !connectedDevice) {
            return (
              <ActivityIndicator
                size="large"
                color={colors.PRIMARY}
                style={{ marginVertical: 20 }}
              />
            );
          }
          return null;
        }}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContentContainer: {
    paddingBottom: 20, // Asegura que haya espacio al final
  },
  header: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  modeSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 0, // El espacio ahora es manejado por el contenedor
    marginTop: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  scanButton: {
    backgroundColor: "#2196F3",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
  },
  disconnectButton: {
    backgroundColor: "#F44336",
  },
  statusButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  deviceItem: {
    backgroundColor: "#FFF",
    padding: 12,
    marginHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deviceAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default ConfigScreen;
