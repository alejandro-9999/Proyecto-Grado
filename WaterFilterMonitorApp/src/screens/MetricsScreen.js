import { useEffect, useState } from "react";
import ParameterSelector from "../components/components/ParameterSelector";
import WaterQualityChart from "../components/components/WaterQualityChart";
import ReconnectButton from "../components/components/ReconnectButton";
import { styles } from "../components/styles/styles";


import { SafeAreaView, ScrollView, View, Text, Switch } from "react-native";
import { colors } from "../components/styles/colors";
import { Divider } from "react-native-paper";
import useWebSocket from "../components/hooks/useWebSocket";
import { getParameterInfo } from "../components/utils/parameterUtils";
import Header from "../components/components/Header";

const MetricsScreen = () => {
  // Estado para el parámetro actualmente seleccionado
  const [selectedParameter, setSelectedParameter] = useState('ph');
  
  // Estado para controlar la visualización combinada
  const [showCombined, setShowCombined] = useState(true);
  
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
  
  // Función auxiliar para inicializar datos del gráfico
  const getInitialChartData = (source) => {
    return {
      labels: [],
      datasets: [
        { 
          data: [], 
          color: () => source === 'entrada' ? 'rgba(0, 119, 182, 0.8)' : 'rgba(3, 192, 60, 0.8)', 
          strokeWidth: 2 
        },
      ],
      legend: [source === 'entrada' ? 'Entrada' : 'Salida']
    };
  };

  // Verificar si el parámetro seleccionado es un parámetro único (solo salida)
  const isSingleParameter = ['eficiencia', 'filter_operating_hours'].includes(selectedParameter);

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
        <Divider/>

        {!isSingleParameter && (
          <View style={styles.visualizationControls}>
            <View style={styles.viewModeToggle}>
              <Text>Separado</Text>
              <Switch
                value={showCombined}
                onValueChange={(value) => setShowCombined(value)}
                trackColor={{ true: colors.PRIMARY }}
                thumbColor={showCombined ? colors.SECONDARY : "#f4f3f4"}
                style={styles.viewModeSwitch}
              />
              <Text>Combinado</Text>
            </View>
          </View>
        )}
        
        {isSingleParameter ? (
          // Para parámetros que solo tienen un valor (eficiencia, horas de operación)
          <WaterQualityChart
            title={`${paramInfo.title}`}
            units={paramInfo.units}
            inputData={salidaData} // Solo usamos el dataset de "salida" para estos parámetros
            showTime={true}
          />
        ) : showCombined ? (
          // Vista combinada para parámetros con entrada/salida
          <WaterQualityChart
            title={`${paramInfo.title}`}
            units={paramInfo.units}
            inputData={entradaData}
            outputData={salidaData}
            showTime={true}
            combined={true}
            onCombinedChange={() => setShowCombined(false)}
          />
        ) : (
          // Vista separada para parámetros con entrada/salida
          <>
            <WaterQualityChart
              title={`${paramInfo.title} - Entrada`}
              units={paramInfo.units}
              inputData={entradaData}
              showTime={true}
            />
            
            <WaterQualityChart
              title={`${paramInfo.title} - Salida`}
              units={paramInfo.units}
              inputData={salidaData}
            />
          </>
        )}
        
        <ReconnectButton onPress={connectWebSocket} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MetricsScreen;