// src/components/WaterQualityChart.js
import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles, getScreenWidth } from '../styles/styles';
import { getChartConfig, getCurrentValue } from '../utils/chartUtils';

/**
 * Componente para mostrar un gráfico de calidad del agua
 * @param {string} title - Título del gráfico
 * @param {string} units - Unidades del parámetro
 * @param {Object} data - Datos para el gráfico
 * @param {boolean} showTime - Indica si mostrar la hora actual
 */
const WaterQualityChart = ({ title, units, data, showTime = false }) => {
  const chartConfig = getChartConfig();
  const screenWidth = getScreenWidth();
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitle}>
          {title} {units}
        </Text>
        <Text style={styles.currentValueText}>
          Actual: <Text style={styles.valueHighlight}>
            {getCurrentValue(data)} {units}
          </Text>
        </Text>
      </View>

      {showTime && (
        <Text style={styles.currentTimeText}>
          Hora actual: {new Date().toLocaleTimeString()}
        </Text>
      )}

      {data.labels.length > 0 ? (
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
      )}
    </View>
  );
};

export default WaterQualityChart;