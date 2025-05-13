// src/components/Header.js
import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { styles } from '../styles/styles';

/**
 * Componente de encabezado con título y estado de conexión
 * @param {boolean} connected - Estado de conexión al WebSocket
 * @param {string} connectionStatus - Mensaje de estado de la conexión
 */
const Header = ({ connected, connectionStatus }) => {
  return (
    <View>
      <StatusBar backgroundColor="#0077B6" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitoreo de Calidad del Agua</Text>
        <Text style={styles.connectionStatus}>
          Estado: <Text style={connected ? styles.connected : styles.disconnected}>
            {connectionStatus}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Header;