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
    default:
      return { title: param, units: "" };
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
];


