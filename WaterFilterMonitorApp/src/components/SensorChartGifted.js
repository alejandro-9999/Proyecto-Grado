// components/SensorChartGifted.js
import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function SensorChartGifted({ data, label, color }) {
  const chartData = data.map((item) => ({
    value: item[label],
    label: new Date(item.timestamp).toLocaleTimeString(),
    dataPointText: item[label].toFixed(2),
  }));

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{label.toUpperCase()}</Text>
      <LineChart
        data={chartData}
        height={220}
        width={350}
        isAnimated
        animateOnDataChange
        dataPointsColor={color || '#007AFF'}
        hideDataPoints={false}
        areaChart
        startFillColor={color || '#007AFF'}
        endFillColor="transparent"
        startOpacity={0.4}
        endOpacity={0}
        thickness={2}
        color={color || '#007AFF'}
        yAxisColor="#ccc"
        xAxisColor="#ccc"
      />
    </View>
  );
}
