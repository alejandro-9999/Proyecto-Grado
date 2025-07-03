// src/components/WaterQualityChart.js (actualizado)
import React from 'react';
import { View, Text, Switch } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles, getScreenWidth } from '../styles/styles';
import { getChartConfig, getCurrentValue } from '../utils/chartUtils';

/**
 * Componente para mostrar un gráfico de calidad del agua
 * @param {string} title - Título del gráfico
 * @param {string} units - Unidades del parámetro
 * @param {Object} inputData - Datos de entrada para el gráfico
 * @param {Object} outputData - Datos de salida para el gráfico
 * @param {boolean} showTime - Indica si mostrar la hora actual
 * @param {boolean} combined - Indica si mostrar datos combinados
 * @param {function} onCombinedChange - Función para cambiar entre vista combinada y separada
 */
const WaterQualityChart = ({ 
  title, 
  units, 
  inputData, 
  outputData, 
  showTime = false,
  combined = false,
  onCombinedChange
}) => {
  const chartConfig = getChartConfig();
  const screenWidth = getScreenWidth();
  
  // Si no se proporciona outputData, asumimos que es un gráfico simple (para compatibilidad)
  const isSingleChart = !outputData;
  const data = isSingleChart ? inputData : null;
  
  // Preparar datos combinados si es necesario
  const combinedData = !isSingleChart && combined ? {
    labels: [...new Set([...inputData.labels, ...outputData.labels])].sort(),
    datasets: [
      { 
        data: inputData.datasets[0].data, 
        color: () => 'rgba(0, 119, 182, 0.8)', 
        strokeWidth: 2 
      },
      { 
        data: outputData.datasets[0].data, 
        color: () => 'rgba(3, 192, 60, 0.8)', 
        strokeWidth: 2 
      }
    ],
    legend: ["Entrada", "Salida"]
  } : null;
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitle}>
          {title} {units}
        </Text>
        
        {isSingleChart ? (
          <Text style={styles.currentValueText}>
            Actual: <Text style={styles.valueHighlight}>
              {getCurrentValue(data)} {units}
            </Text>
          </Text>
        ) : (
          <View style={styles.valuesSummary}>
            <Text style={styles.currentValueText}>
              Entrada: <Text style={styles.valueHighlight}>
                {getCurrentValue(inputData)} {units}
              </Text>
            </Text>
            <Text style={styles.currentValueText}>
              Salida: <Text style={styles.valueHighlight}>
                {getCurrentValue(outputData)} {units}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {showTime && (
        <Text style={styles.currentTimeText}>
          Hora actual: {new Date().toLocaleTimeString()}
        </Text>
      )}
      
      {/* {!isSingleChart && (
        <View style={styles.chartControls}>
          <Text>Mostrar datos combinados</Text>
          <Switch
            value={combined}
            onValueChange={onCombinedChange}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={combined ? "#0077b6" : "#f4f3f4"}
          />
        </View>
      )} */}

      {isSingleChart ? (
        // Gráfico único (compatibilidad con versión anterior)
        data.labels.length > 0 ? (
          <LineChart
            data={{
              ...data,
              labels: [], // Ocultar labels del eje X
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withDots={data.datasets[0].data.length < 15}
            withShadow={false}
            segments={4}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Esperando datos...</Text>
          </View>
        )
      ) : combined ? (
        // Gráfico combinado
        combinedData.labels.length > 0 ? (
          <LineChart
            data={{
              ...combinedData,
              labels: [], // Ocultar labels del eje X
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withDots={Math.max(
              inputData.datasets[0].data.length,
              outputData.datasets[0].data.length
            ) < 15}
            withShadow={false}
            segments={4}
            legend={true}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Esperando datos...</Text>
          </View>
        )
      ) : (
        // Vista separada (entrada y salida en diferentes gráficos)
        <View>
          <View style={styles.chartSection}>
            <Text style={styles.chartSubtitle}>Entrada</Text>
            {inputData.labels.length > 0 ? (
              <LineChart
                data={{
                  ...inputData,
                  labels: [], // Ocultar labels del eje X
                }}
                width={screenWidth}
                height={160}
                chartConfig={{
                  ...chartConfig,
                  color: () => 'rgba(0, 119, 182, 0.8)',
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withDots={inputData.datasets[0].data.length < 15}
                withShadow={false}
                segments={4}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Esperando datos...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.chartSection}>
            <Text style={styles.chartSubtitle}>Salida</Text>
            {outputData.labels.length > 0 ? (
              <LineChart
                data={{
                  ...outputData,
                  labels: [], // Ocultar labels del eje X
                }}
                width={screenWidth}
                height={160}
                chartConfig={{
                  ...chartConfig,
                  color: () => 'rgba(3, 192, 60, 0.8)',
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withDots={outputData.datasets[0].data.length < 15}
                withShadow={false}
                segments={4}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Esperando datos...</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default WaterQualityChart;