// src/utils/parameterUtils.js

import { FontAwesome5, SimpleLineIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

/**
 * Obtiene el título y unidades para el parámetro seleccionado
 * @param {string} param - Nombre del parámetro
 * @returns {Object} - Objeto con título y unidades
 */
export const getParameterInfo = (param) => {
  switch (param) {
    case "ph":
      return { title: "pH", units: "" };
    case "temperatura":
      return { title: "Temperatura", units: "°C" };
    case "turbidez":
      return { title: "Turbidez", units: "NTU" };
    case "conductividad":
      return { title: "Conductividad", units: "μS/cm" };
    case "oxigeno_disuelto":
      return { title: "Oxígeno Disuelto", units: "mg/L" };
    case "color":
      return { title: "Color", units: "" };
    case "eficiencia":
      return { title: "Eficiencia", units: "%" };
    case "filter_operating_hours":
      return { title: "Horas de Operación del Filtro", units: "h" };
    default:
      return { title: param, units: "" };
  }
};

// Mapa para convertir del parámetro seleccionado a las claves del nuevo formato
export const getParameterKeys = (param) => {
  switch (param) {
    case "ph":
      return { entrada: "in_ph", salida: "out_ph" };
    case "temperatura":
      return { entrada: "in_temperatura", salida: "out_temperatura" };
    case "turbidez":
      return { entrada: "in_turbidity", salida: "out_turbidity" };
    case "conductividad":
      return { entrada: "in_conductivity", salida: "out_conductivity" };
    case "oxigeno_disuelto":
      return { entrada: "in_oxigeno_disuelto", salida: "out_oxigeno_disuelto" };
    case "color":
      return { entrada: "in_color", salida: "out_color" };
    default:
      return { entrada: `in_${param}`, salida: `out_${param}` };
  }
};

const styles = StyleSheet.create({
  paramIcon: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 4,
    color: "#fff",
  },
});

/**
 * Lista de parámetros disponibles para selección
 */
export const PARAMETERS = [
  { label: "pH", value: "ph", iconLib: "SimpleLineIcons", iconName: "chemistry" },
  { label: "Temperatura", value: "temperatura", iconLib: "MaterialCommunityIcons", iconName: "temperature-celsius" },
  { label: "Turbidez", value: "turbidez", iconLib: "MaterialCommunityIcons", iconName: "water-opacity" },
  { label: "Conductividad", value: "conductividad", iconLib: "SimpleLineIcons", iconName: "energy" },
  { label: "Oxígeno Disuelto", value: "oxigeno_disuelto", iconLib: "MaterialCommunityIcons", iconName: "alpha-o-circle-outline" },
  { label: "Color", value: "color", iconLib: "MaterialCommunityIcons", iconName: "palette" },
  { label: "Eficiencia", value: "eficiencia", iconLib: "MaterialCommunityIcons", iconName: "percent" },
  { label: "Horas de Operación", value: "filter_operating_hours", iconLib: "MaterialCommunityIcons", iconName: "clock-outline" },
];