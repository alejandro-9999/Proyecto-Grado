// src/hooks/useWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { WS_URL } from '../config/config';
import { saveDataToCache } from '../utils/storageUtils';
import { MAX_POINTS } from '../utils/chartUtils';

// Tiempo de reconexión en milisegundos
const RECONNECT_TIMEOUT = 3000;

/**
 * Hook personalizado para gestionar la conexión WebSocket y los datos
 * @param {string} selectedParameter - Parámetro actualmente seleccionado
 * @returns {Object} - Estado y funciones para el WebSocket
 */
const useWebSocket = (selectedParameter) => {
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
  
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  
  // Referencias para mantener el estado más reciente en callbacks
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const selectedParameterRef = useRef(selectedParameter);
  const entradaDataRef = useRef(entradaData);
  const salidaDataRef = useRef(salidaData);
  
  // Actualizar las referencias cuando cambien los valores
  useEffect(() => {
    selectedParameterRef.current = selectedParameter;
  }, [selectedParameter]);
  
  useEffect(() => {
    entradaDataRef.current = entradaData;
  }, [entradaData]);
  
  useEffect(() => {
    salidaDataRef.current = salidaData;
  }, [salidaData]);
  
  // Función para actualizar los datos del gráfico
  const updateChartData = useCallback((source, newData) => {
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
        saveDataToCache('entrada', selectedParameterRef.current, updatedData);
        
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
        saveDataToCache('salida', selectedParameterRef.current, updatedData);
        
        return updatedData;
      });
    }
  }, []);
  
  // Función para conectar al WebSocket
  const connectWebSocket = useCallback(() => {
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
  }, [updateChartData]);
  
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
  }, [connectWebSocket]);
  
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
  }, [connectWebSocket]);
  
  return {
    entradaData,
    setEntradaData,
    salidaData,
    setSalidaData,
    connected,
    connectionStatus,
    connectWebSocket
  };
};

export default useWebSocket;