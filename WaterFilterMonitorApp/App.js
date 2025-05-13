// App.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { styles } from './src/styles/styles';
import Header from './src/components/Header';
import ParameterSelector from './src/components/ParameterSelector';
import WaterQualityChart from './src/components/WaterQualityChart';
import ReconnectButton from './src/components/ReconnectButton';
import useWebSocket from './src/hooks/useWebSocket';
import { getParameterInfo } from './src/utils/parameterUtils';
import { getInitialChartData } from './src/utils/chartUtils';
import { loadDataFromCache } from './src/utils/storageUtils';

const App = () => {
  // Estado para el parámetro actualmente seleccionado
  const [selectedParameter, setSelectedParameter] = useState('ph');
  
  // Usar el hook personalizado para WebSocket
  const {
    entradaData,
    setEntradaData,
    salidaData,
    setSalidaData,
    connected,
    connectionStatus,
    connectWebSocket
  } = useWebSocket(selectedParameter);
  
  // Obtener información del parámetro seleccionado
  const paramInfo = getParameterInfo(selectedParameter);
  
  // Efecto para cargar datos desde caché cuando cambia el parámetro
  useEffect(() => {
    const loadCachedData = async () => {
      const entradaLoaded = await loadDataFromCache('entrada', selectedParameter);
      const salidaLoaded = await loadDataFromCache('salida', selectedParameter);
      
      // Si hay datos en caché, actualizarlos
      if (entradaLoaded) {
        setEntradaData(entradaLoaded);
      } else {
        // Si no hay datos en caché, inicializar con arrays vacíos
        setEntradaData(getInitialChartData('entrada'));
      }
      
      if (salidaLoaded) {
        setSalidaData(salidaLoaded);
      } else {
        setSalidaData(getInitialChartData('salida'));
      }
    };
    
    loadCachedData();
  }, [selectedParameter, setEntradaData, setSalidaData]);
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        connected={connected}
        connectionStatus={connectionStatus}
      />
      
      <ScrollView style={styles.scrollView}>
        <ParameterSelector
          selectedParameter={selectedParameter}
          onParameterChange={(value) => setSelectedParameter(value)}
        />
        
        <WaterQualityChart
          title={`${paramInfo.title} - Entrada`}
          units={paramInfo.units}
          data={entradaData}
          showTime={true}
        />
        
        <WaterQualityChart
          title={`${paramInfo.title} - Salida`}
          units={paramInfo.units}
          data={salidaData}
        />
        
        <ReconnectButton onPress={connectWebSocket} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;