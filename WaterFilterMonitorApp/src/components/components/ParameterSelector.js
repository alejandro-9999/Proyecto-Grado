// src/components/ParameterSelector.js
import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles/styles';
import { PARAMETERS } from '../utils/parameterUtils';

/**
 * Componente selector de parámetros
 * @param {string} selectedParameter - Parámetro actualmente seleccionado
 * @param {function} onParameterChange - Función a llamar cuando cambia el parámetro
 */
const ParameterSelector = ({ selectedParameter, onParameterChange }) => {
  return (
    <View style={styles.parameterSelector}>
      <Text style={styles.sectionTitle}>Parámetro:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedParameter}
          style={styles.picker}
          onValueChange={onParameterChange}>
          {PARAMETERS.map((param) => (
            <Picker.Item key={param.value} label={param.label} value={param.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default ParameterSelector;