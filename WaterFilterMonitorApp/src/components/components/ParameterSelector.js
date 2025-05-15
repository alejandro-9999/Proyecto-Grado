import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { styles } from "../styles/styles";
import { PARAMETERS } from "../utils/parameterUtils";
import { Ionicons } from "@expo/vector-icons";
import { renderIcon } from "../utils/iconUtils";

const ParameterSelector = ({ selectedParameter, onParameterChange }) => {
  return (
    <View style={styles.parameterSelector}>
      <Text style={styles.sectionTitle}>Parámetro:</Text>
      <View style={styles.buttonGroup}>
        {PARAMETERS.map((param) => {
          const isSelected = selectedParameter === param.value;
          return (
            <TouchableOpacity
              key={param.value}
              style={[
                styles.parameterButton,
                isSelected && styles.parameterButtonSelected,
              ]}
              onPress={() => onParameterChange(param.value)}
            >
              {renderIcon(param.iconLib, param.iconName, isSelected)}
              <Text
                style={[
                  styles.parameterButtonText,
                  isSelected && styles.parameterButtonTextSelected,
                ]}
              >
                {param.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ParameterSelector;
