import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { fetchLatestSensorData } from '../api/sensorApi';
import SensorChartGifted from '../components/SensorChartGifted';

export default function HomeScreen() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const response = await fetchLatestSensorData();
    if (response) setData(response);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <SensorChartGifted data={data} label="ph" color="#f44336" />
      <SensorChartGifted data={data} label="conductividad" color="#2196f3" />
      <SensorChartGifted data={data} label="turbidez" color="#ff9800" />
      <SensorChartGifted data={data} label="color" color="#4caf50" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
