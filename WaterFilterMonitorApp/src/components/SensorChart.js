// components/SensorChart.js
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function SensorChart({ data, label, color }) {
  const chartData = {
    labels: data.map((point) => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        data: data.map((point) => point[label]),
        color: () => color || '#007AFF',
      },
    ],
  };

  return (
    <View>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => '#333',
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
}
