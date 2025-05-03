import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, StatusBar, AppState } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constantes para la conexión WebSocket
const WS_URL = 'ws://192.168.1.12:8000/ws';
const MAX_POINTS = 30; // Aumentado para mostrar más datos históricos
const CACHE_KEY_PREFIX = 'water_quality_data_';
const RECONNECT_TIMEOUT = 3000; // 3 segundos para reconectar

const App = () => {
  // Estado para almacenar los datos de calidad del agua
  const [entradaData, setEntradaData] = useState({
    labels: [],
    datasets: [
      { data: [], color: () => 'rgba(0, 119, 182, 0.8)', strokeWidth: 2 },
    ],
    legend: ['Entrada']
  });
  
  const [salidaData, setSalidaData] = useState({
    labels: [],
    datasets: [
      { data: [], color: () => 'rgba(3, 192, 60, 0.8)', strokeWidth: 2 },
    ],
    legend: ['Salida']
  });
  
  // Estado para el parámetro actualmente seleccionado (pH, temperatura, etc.)
  const [selectedParameter, setSelectedParameter] = useState('ph');
  
  // Estado para la conexión WebSocket
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  
  // Referencias para mantener el estado más reciente en callbacks
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const selectedParameterRef = useRef(selectedParameter);
  const entradaDataRef = useRef(entradaData);
  const salidaDataRef = useRef(salidaData);
  
  // Actualizar la referencia cuando cambie el parámetro seleccionado
  useEffect(() => {
    selectedParameterRef.current = selectedParameter;
  }, [selectedParameter]);
  
  // Actualizar las referencias cuando cambien los datos
  useEffect(() => {
    entradaDataRef.current = entradaData;
  }, [entradaData]);
  
  useEffect(() => {
    salidaDataRef.current = salidaData;
  }, [salidaData]);
  
  // Función para guardar datos en caché
  const saveDataToCache = async (source, data) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${source}_${selectedParameterRef.current}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos en caché:', error);
    }
  };
  
  // Función para cargar datos desde caché
  const loadDataFromCache = async (source) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${source}_${selectedParameterRef.current}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        if (source === 'entrada') {
          setEntradaData(data);
        } else if (source === 'salida') {
          setSalidaData(data);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cargando datos desde caché:', error);
      return false;
    }
  };
  
  // Función para actualizar los datos del gráfico con optimización
  const updateChartData = (source, newData) => {
    const timestamp = new Date();
    const timeStr = `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
    
    // Obtener el valor del parámetro seleccionado
    const value = parseFloat(newData[selectedParameterRef.current]);
    
    if (isNaN(value)) return;
    
    if (source === 'entrada') {
      setEntradaData(prevData => {
        // Crear nuevas copias de arrays para evitar mutaciones
        const newLabels = [...prevData.labels, timeStr];
        const newValues = [...prevData.datasets[0].data, value];
        
        // Mantener solo los últimos MAX_POINTS puntos de datos
        if (newLabels.length > MAX_POINTS) {
          newLabels.shift();
          newValues.shift();
        }
        
        const updatedData = {
          ...prevData,
          labels: newLabels,
          datasets: [{ 
            ...prevData.datasets[0], 
            data: newValues
          }]
        };
        
        // Guardar en caché
        saveDataToCache('entrada', updatedData);
        
        return updatedData;
      });
    } else if (source === 'salida') {
      setSalidaData(prevData => {
        // Crear nuevas copias de arrays para evitar mutaciones
        const newLabels = [...prevData.labels, timeStr];
        const newValues = [...prevData.datasets[0].data, value];
        
        // Mantener solo los últimos MAX_POINTS puntos de datos
        if (newLabels.length > MAX_POINTS) {
          newLabels.shift();
          newValues.shift();
        }
        
        const updatedData = {
          ...prevData,
          labels: newLabels,
          datasets: [{ 
            ...prevData.datasets[0], 
            data: newValues
          }]
        };
        
        // Guardar en caché
        saveDataToCache('salida', updatedData);
        
        return updatedData;
      });
    }
  };
  
  // Función para conectar al WebSocket con manejo mejorado
  const connectWebSocket = () => {
    try {
      // Limpiar cualquier timeout pendiente
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Cerrar cualquier conexión existente
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      setConnectionStatus('Conectando...');
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
        setConnected(true);
        setConnectionStatus('Conectado');
      };
      
      ws.onclose = (e) => {
        console.log('Conexión WebSocket cerrada', e.code, e.reason);
        setConnected(false);
        setConnectionStatus(`Desconectado (${e.code})`);
        
        // Solo reconectar automáticamente si la aplicación está en primer plano
        if (appStateRef.current === 'active') {
          setConnectionStatus('Reconectando...');
          // Reconectar después del tiempo especificado
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_TIMEOUT);
        }
      };
      
      ws.onerror = (e) => {
        console.error('Error en WebSocket:', e);
        setConnectionStatus('Error de conexión');
      };
      
      ws.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          
          // Procesar los datos recibidos
          if (message && message.source && message.data) {
            updateChartData(message.source, message.data);
          }
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      setConnectionStatus('Error al conectar');
      
      // Reintentar la conexión después del tiempo especificado
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, RECONNECT_TIMEOUT);
    }
  };
  
  // Cargar datos en caché cuando cambia el parámetro seleccionado
  useEffect(() => {
    const loadCachedData = async () => {
      const entradaLoaded = await loadDataFromCache('entrada');
      const salidaLoaded = await loadDataFromCache('salida');
      
      // Si no hay datos en caché, inicializar con arrays vacíos
      if (!entradaLoaded) {
        setEntradaData({
          labels: [],
          datasets: [{ data: [], color: () => 'rgba(0, 119, 182, 0.8)', strokeWidth: 2 }],
          legend: ['Entrada']
        });
      }
      
      if (!salidaLoaded) {
        setSalidaData({
          labels: [],
          datasets: [{ data: [], color: () => 'rgba(3, 192, 60, 0.8)', strokeWidth: 2 }],
          legend: ['Salida']
        });
      }
    };
    
    loadCachedData();
  }, [selectedParameter]);
  
  // Monitorear el estado de la aplicación para manejar reconexiones
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App ha vuelto a primer plano
        console.log('App ha vuelto a primer plano - reconectando WebSocket');
        connectWebSocket();
      } else if (nextAppState.match(/inactive|background/) && appStateRef.current === 'active') {
        // App ha ido a segundo plano
        console.log('App ha ido a segundo plano - cerrando WebSocket');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      }
      
      appStateRef.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Conectar WebSocket al montar el componente
  useEffect(() => {
    connectWebSocket();
    
    // Limpiar conexión WebSocket al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Configuración del gráfico optimizada para animaciones fluidas
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1, // Reducido para mejor rendimiento
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3', // Reducido para mejor rendimiento
      strokeWidth: '1',
    },
    // Optimizaciones para animaciones más fluidas
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
      strokeDasharray: '', // Líneas sólidas para mejor rendimiento
    },
    propsForLabels: {
      fontSize: 10, // Tamaño de fuente más pequeño para mejor rendimiento
    },
  };
  
  const screenWidth = Dimensions.get('window').width - 20;
  
  // Obtener el título y unidades para el parámetro seleccionado
  const getParameterInfo = (param) => {
    switch (param) {
      case 'ph':
        return { title: 'pH', units: '' };
      case 'temperatura':
        return { title: 'Temperatura', units: '°C' };
      case 'turbidez':
        return { title: 'Turbidez', units: 'NTU' };
      case 'conductividad':
        return { title: 'Conductividad', units: 'μS/cm' };
      case 'oxigeno_disuelto':
        return { title: 'Oxígeno Disuelto', units: 'mg/L' };
      default:
        return { title: param, units: '' };
    }
  };
  
  const paramInfo = getParameterInfo(selectedParameter);
  
  // Función para mostrar el valor actual en tiempo real
  const getCurrentValue = (data) => {
    if (data.datasets[0].data.length > 0) {
      return data.datasets[0].data[data.datasets[0].data.length - 1].toFixed(2);
    }
    return "---";
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0077B6" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitoreo de Calidad del Agua</Text>
        <Text style={styles.connectionStatus}>
          Estado: <Text style={connected ? styles.connected : styles.disconnected}>
            {connectionStatus}
          </Text>
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.parameterSelector}>
          <Text style={styles.sectionTitle}>Parámetro:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedParameter}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedParameter(itemValue)}>
              <Picker.Item label="pH" value="ph" />
              <Picker.Item label="Temperatura" value="temperatura" />
              <Picker.Item label="Turbidez" value="turbidez" />
              <Picker.Item label="Conductividad" value="conductividad" />
              <Picker.Item label="Oxígeno Disuelto" value="oxigeno_disuelto" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>
              {paramInfo.title} - Entrada {paramInfo.units}
            </Text>
            <Text style={styles.currentValueText}>
              Actual: <Text style={styles.valueHighlight}>{getCurrentValue(entradaData)} {paramInfo.units}</Text>
            </Text>
          </View>
          
          {entradaData.labels.length > 0 ? (
            <LineChart
              data={entradaData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false} // Optimización para renderizado
              withOuterLines={true}
              withDots={entradaData.datasets[0].data.length < 15} // Mostrar puntos solo si hay pocos datos
              withShadow={false} // Optimización para renderizado
              segments={4} // Reducido para mejor rendimiento
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Esperando datos...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>
              {paramInfo.title} - Salida {paramInfo.units}
            </Text>
            <Text style={styles.currentValueText}>
              Actual: <Text style={styles.valueHighlight}>{getCurrentValue(salidaData)} {paramInfo.units}</Text>
            </Text>
          </View>
          
          {salidaData.labels.length > 0 ? (
            <LineChart
              data={salidaData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false} // Optimización para renderizado
              withOuterLines={true}
              withDots={salidaData.datasets[0].data.length < 15} // Mostrar puntos solo si hay pocos datos
              withShadow={false} // Optimización para renderizado
              segments={4} // Reducido para mejor rendimiento
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Esperando datos...</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.reconnectButton} 
          onPress={() => {
            connectWebSocket();
          }}>
          <Text style={styles.reconnectButtonText}>Reconectar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    backgroundColor: '#0077B6',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  connectionStatus: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  connected: {
    color: '#4ADE80',
    fontWeight: 'bold',
  },
  disconnected: {
    color: '#F87171',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  parameterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentValueText: {
    fontSize: 14,
    color: '#555',
  },
  valueHighlight: {
    fontWeight: 'bold',
    color: '#0077B6',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
  },
  reconnectButton: {
    backgroundColor: '#0077B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  reconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;