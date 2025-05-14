import { useEffect, useState } from "react";
import useWebSocket from "../components/hooks/useWebSocket";
import { getParameterInfo } from "../components/utils/parameterUtils";
import { loadDataFromCache } from "../components/utils/storageUtils";
import Header from "../components/components/Header";
import ParameterSelector from "../components/components/ParameterSelector";
import WaterQualityChart from "../components/components/WaterQualityChart";
import ReconnectButton from "../components/components/ReconnectButton";
import { styles } from "../components/styles/styles";
import { SafeAreaView, ScrollView } from "react-native";

const MetricsScreen = () => {
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

export default MetricsScreen;