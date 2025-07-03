// src/screens/ConfigScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch
} from 'react-native';
import { colors } from "../components/styles/colors";

const ConfigScreen = ({ route }) => {
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [deviceName, setDeviceName] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true); // Switch entre demo y real
  const [esp32Status, setEsp32Status] = useState('offline');

  // Simulación del comportamiento del ESP32
  const simulateESP32Response = (command, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (command) {
          case 'CONNECT_WIFI':
            // Simula éxito/fallo de conexión WiFi
            const success = Math.random() > 0.3; // 70% de éxito
            resolve({
              success,
              message: success ? 'WiFi conectado exitosamente' : 'Error al conectar WiFi',
              ip: success ? '192.168.1.100' : null
            });
            break;
          case 'GET_STATUS':
            resolve({
              success: true,
              status: 'online',
              ip: '192.168.1.100',
              signal: -45
            });
            break;
          default:
            resolve({ success: false, message: 'Comando no reconocido' });
        }
      }, 2000 + Math.random() * 1000); // Simula latencia variable
    });
  };

  // Función para escanear dispositivos Bluetooth (demo)
  const scanForDevices = () => {
    if (isDemoMode) {
      setIsScanning(true);
      // Simula dispositivos encontrados
      setTimeout(() => {
        setAvailableDevices([
          { id: '1', name: 'ESP32-WiFiConfig', address: 'AA:BB:CC:DD:EE:FF' },
          { id: '2', name: 'ESP32-IoT-Device', address: 'FF:EE:DD:CC:BB:AA' },
          { id: '3', name: 'Arduino-BT', address: '11:22:33:44:55:66' }
        ]);
        setIsScanning(false);
      }, 3000);
    } else {
      // Aquí iría la lógica real de Bluetooth
      // Necesitarías react-native-bluetooth-serial o similar
      Alert.alert('Bluetooth Real', 'Implementar con react-native-bluetooth-serial');
    }
  };

  // Conectar a dispositivo Bluetooth
  const connectToDevice = (device) => {
    if (isDemoMode) {
      setIsConnecting(true);
      setConnectionStatus('Conectando...');
      
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('Conectado');
        setDeviceName(device.name);
        setEsp32Status('online');
        setIsConnecting(false);
        Alert.alert('Éxito', `Conectado a ${device.name}`);
      }, 2000);
    } else {
      // Lógica real de conexión Bluetooth
      Alert.alert('Bluetooth Real', 'Implementar conexión real');
    }
  };

  // Desconectar dispositivo
  const disconnectDevice = () => {
    setIsConnected(false);
    setConnectionStatus('Desconectado');
    setDeviceName('');
    setEsp32Status('offline');
    setAvailableDevices([]);
  };

  // Enviar credenciales WiFi al ESP32
  const sendWiFiCredentials = async () => {
    if (!wifiSSID || !wifiPassword) {
      Alert.alert('Error', 'Por favor ingresa SSID y contraseña');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Enviando credenciales...');

    try {
      let response;
      
      if (isDemoMode) {
        response = await simulateESP32Response('CONNECT_WIFI', {
          ssid: wifiSSID,
          password: wifiPassword
        });
      } else {
        // Aquí enviarías los datos reales vía Bluetooth
        // const bluetoothData = JSON.stringify({ ssid: wifiSSID, password: wifiPassword });
        // response = await BluetoothSerial.write(bluetoothData);
        response = { success: false, message: 'Implementar Bluetooth real' };
      }

      if (response.success) {
        Alert.alert(
          'Éxito',
          `WiFi configurado correctamente\n${response.ip ? `IP: ${response.ip}` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setConnectionStatus('WiFi Configurado');
                setEsp32Status('wifi_connected');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message);
        setConnectionStatus('Error en configuración');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar credenciales: ' + error.message);
      setConnectionStatus('Error de comunicación');
    } finally {
      setIsConnecting(false);
    }
  };

  // Obtener estado del ESP32
  const checkESP32Status = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    try {
      let response;
      
      if (isDemoMode) {
        response = await simulateESP32Response('GET_STATUS');
      } else {
        // Lógica real para obtener estado
        response = { success: false, message: 'Implementar Bluetooth real' };
      }

      if (response.success) {
        Alert.alert(
          'Estado del ESP32',
          `Estado: ${response.status}\n${response.ip ? `IP: ${response.ip}` : ''}\n${response.signal ? `Señal: ${response.signal} dBm` : ''}`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Error al obtener estado: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route.name === 'MetricsScreen' ? 'Configuración de Métricas' : 'Configuración WiFi ESP32'}
        </Text>
        
        {/* Switch para modo demo/real */}
        <View style={styles.modeSwitch}>
          <Text style={styles.label}>Modo Demo</Text>
          <Switch
            value={isDemoMode}
            onValueChange={setIsDemoMode}
            thumbColor={isDemoMode ? colors.PRIMARY : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      {/* Estado de conexión */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{connectionStatus}</Text>
        {deviceName && <Text style={styles.deviceText}>Dispositivo: {deviceName}</Text>}
      </View>

      {/* Sección de Bluetooth */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conexión Bluetooth</Text>
        
        {!isConnected ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.scanButton]}
              onPress={scanForDevices}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Buscar Dispositivos</Text>
              )}
            </TouchableOpacity>

            {availableDevices.length > 0 && (
              <View style={styles.deviceList}>
                <Text style={styles.label}>Dispositivos encontrados:</Text>
                {availableDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                    onPress={() => connectToDevice(device)}
                    disabled={isConnecting}
                  >
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceAddress}>{device.address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectDevice}
          >
            <Text style={styles.buttonText}>Desconectar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sección de configuración WiFi */}
      {isConnected && (
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
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Configurar WiFi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.statusButton]}
            onPress={checkESP32Status}
          >
            <Text style={styles.buttonText}>Verificar Estado</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Información</Text>
        <Text style={styles.infoText}>
          • En modo demo, se simula la comunicación con ESP32
        </Text>
        <Text style={styles.infoText}>
          • Para uso real, instala: react-native-bluetooth-serial
        </Text>
        <Text style={styles.infoText}>
          • El ESP32 debe tener firmware compatible con este protocolo
        </Text>
      </View>
    </ScrollView>
  );

  function getStatusColor() {
    switch (connectionStatus) {
      case 'Conectado':
      case 'WiFi Configurado':
        return '#4CAF50';
      case 'Conectando...':
      case 'Enviando credenciales...':
        return '#FF9800';
      case 'Error en configuración':
      case 'Error de comunicación':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colors.PRIMARY,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    flex: 1,
  },
  deviceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  scanButton: {
    backgroundColor: '#2196F3',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  statusButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    marginTop: 15,
  },
  deviceItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default ConfigScreen;