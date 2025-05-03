// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View, Text, Button } from 'react-native';
import { fetchLatestSensorData } from '../api/sensorApi';
import SensorChartGifted from '../components/SensorChartGifted';
import websocketService from '../api/websocketService';

export default function HomeScreen() {
  // Separate state for each source
  const [entradaData, setEntradaData] = useState([]);
  const [salidaData, setSalidaData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  
  // Limit data points to prevent memory issues
  const MAX_DATA_POINTS = 50;

  // Load initial data from API
  const loadData = useCallback(async () => {
    setRefreshing(true);
    const response = await fetchLatestSensorData();
    if (response) {
      // Separate data by source
      const entrada = response.filter(item => item.source === 'entrada');
      const salida = response.filter(item => item.source === 'salida');
      
      setEntradaData(entrada.slice(-MAX_DATA_POINTS));
      setSalidaData(salida.slice(-MAX_DATA_POINTS));
    }
    setRefreshing(false);
  }, []);

  // Handle WebSocket connection
  useEffect(() => {
    // WebSocket message handler
    const handleWebSocketMessage = (message) => {
      const { source, data } = message;
      
      if (source === 'entrada') {
        setEntradaData(prevData => {
          const newData = [...prevData, data];
          return newData.slice(-MAX_DATA_POINTS); // Keep only the latest points
        });
      } else if (source === 'salida') {
        setSalidaData(prevData => {
          const newData = [...prevData, data];
          return newData.slice(-MAX_DATA_POINTS); // Keep only the latest points
        });
      }
    };

    // Add listener for WebSocket messages
    const removeListener = websocketService.addListener(handleWebSocketMessage);
    
    // Setup connection status checker
    const intervalId = setInterval(() => {
      setConnectionStatus(websocketService.isConnected ? 'Connected' : 'Disconnected');
    }, 1000);

    // Connect to WebSocket
    websocketService.connect();
    
    // Initial data load
    loadData();

    // Cleanup on unmount
    return () => {
      removeListener();
      clearInterval(intervalId);
      websocketService.disconnect();
    };
  }, [loadData]);

  // Reconnect WebSocket manually
  const handleReconnect = () => {
    websocketService.connect();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionText}>
          WebSocket: <Text style={connectionStatus === 'Connected' ? styles.connected : styles.disconnected}>
            {connectionStatus}
          </Text>
        </Text>
        {connectionStatus === 'Disconnected' && (
          <Button title="Reconnect" onPress={handleReconnect} />
        )}
      </View>

      <Text style={styles.sectionHeader}>Entrada de Agua</Text>
      <SensorChartGifted data={entradaData} label="ph" color="#f44336" />
      <SensorChartGifted data={entradaData} label="conductividad" color="#2196f3" />
      <SensorChartGifted data={entradaData} label="turbidez" color="#ff9800" />
      <SensorChartGifted data={entradaData} label="color" color="#4caf50" />
      
      <Text style={styles.sectionHeader}>Salida de Agua</Text>
      <SensorChartGifted data={salidaData} label="ph" color="#f44336" />
      <SensorChartGifted data={salidaData} label="conductividad" color="#2196f3" />
      <SensorChartGifted data={salidaData} label="turbidez" color="#ff9800" />
      <SensorChartGifted data={salidaData} label="color" color="#4caf50" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  connectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  connectionText: {
    fontSize: 16,
  },
  connected: {
    color: 'green',
    fontWeight: 'bold',
  },
  disconnected: {
    color: 'red',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 4,
  },
});