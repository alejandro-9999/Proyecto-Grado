// SensorCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SensorCard({ ph, conductividad, turbidez, color, timestamp, source }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Fuente: {source}</Text>
      <Text>pH: {ph}</Text>
      <Text>Conductividad: {conductividad}</Text>
      <Text>Turbidez: {turbidez}</Text>
      <Text>Color: {color}</Text>
      <Text style={styles.timestamp}>Fecha: {new Date(timestamp).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#e0f7fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});
