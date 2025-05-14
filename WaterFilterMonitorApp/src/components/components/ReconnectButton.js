// src/components/ReconnectButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/styles';

/**
 * Botón para reconectar al WebSocket
 * @param {function} onPress - Función a llamar al presionar el botón
 */
const ReconnectButton = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.reconnectButton} 
      onPress={onPress}>
      <Text style={styles.reconnectButtonText}>Reconectar</Text>
    </TouchableOpacity>
  );
};

export default ReconnectButton;