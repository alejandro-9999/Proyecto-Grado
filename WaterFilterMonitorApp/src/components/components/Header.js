import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { styles } from '../styles/headerStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const Header = ({ connected, connectionStatus }) => {
  return (
    <View>
      <StatusBar backgroundColor={colors.PRIMARY} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metrics</Text>
        <View style={styles.statusContainer}>
          <Ionicons
            name={connected ? 'cloud-done' : 'cloud-offline'}
            size={18}
            color={connected ? colors.SUCCESS : colors.DANGER}
          />
          <Text style={styles.connectionStatus}>{connectionStatus}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
