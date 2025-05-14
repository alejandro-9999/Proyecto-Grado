// src/screens/DefaultScreen.js (ejemplo básico)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DefaultScreen = ({ route }) => {
  // Puedes usar route.name para mostrar contenido diferente basado en la ruta
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {route.name === 'MetricsScreen' ? 'Contenido de Metrics' : `Pantalla ${route.name}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default DefaultScreen;