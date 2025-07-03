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

  // Estado local para los datos de los gráficos
  const [entradaData, setEntradaData] = useState(getInitialChartData('entrada'));
  const [salidaData, setSalidaData] = useState(getInitialChartData('salida'));
  
  // Usar el hook personalizado para WebSocket
  const {
    entradaData: wsEntradaData,
    salidaData: wsSalidaData,
    connected,
    connectionStatus,
    connectWebSocket
  } = useWebSocket(selectedParameter);
  
  // Función auxiliar para inicializar datos del gráfico
  function getInitialChartData(source) {
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
  }

  // Obtener información del parámetro seleccionado
  const paramInfo = getParameterInfo(selectedParameter);
  
  // Efecto para resetear los datos cuando cambia el parámetro
  useEffect(() => {
    // Resetear los datos cuando cambia el parámetro seleccionado
    setEntradaData(getInitialChartData('entrada'));
    setSalidaData(getInitialChartData('salida'));
    
    // Volver a conectar WebSocket para obtener los datos del nuevo parámetro
    connectWebSocket();
  }, [selectedParameter]);
  
  // Efecto para actualizar los datos cuando llegan nuevos del websocket
  useEffect(() => {
    if (wsEntradaData && wsEntradaData.datasets[0].data.length > 0) {
      setEntradaData(wsEntradaData);
    }
    
    if (wsSalidaData && wsSalidaData.datasets[0].data.length > 0) {
      setSalidaData(wsSalidaData);
    }
  }, [wsEntradaData, wsSalidaData]);

  // Verificar si el parámetro seleccionado es un parámetro único (solo salida)
  const isSingleParameter = ['eficiencia', 'filter_operating_hours'].includes(selectedParameter);

  // Manejador para cambio de parámetro
  const handleParameterChange = (value) => {
    setSelectedParameter(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        connected={connected}
        connectionStatus={connectionStatus}
      />
      
      <ScrollView style={styles.scrollView}>
        <ParameterSelector
          selectedParameter={selectedParameter}
          onParameterChange={handleParameterChange}
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