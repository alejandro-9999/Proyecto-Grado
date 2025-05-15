// src/styles/styles.js
import { StyleSheet, Dimensions } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    backgroundColor: "#fcfcfc",
  },
  scrollView: {
    backgroundColor: "#fcfcfc",
    marginHorizontal: 5,
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    padding: 10,
  },
  parameterSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: "100%",
  },
  chartContainer: {},
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  currentValueText: {
    fontSize: 14,
    color: "#555",
  },
  valueHighlight: {
    fontWeight: "bold",
    color: colors.PRIMARY,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
  },
  reconnectButton: {
    backgroundColor: colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom:16
  },
  reconnectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentTimeText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  // Nuevos estilos para controles de visualización
  visualizationControls: {
    flexDirection: "row",
  },

  visualizationText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  viewModeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  viewModeSwitch: {
    marginHorizontal: 8,
  },

  // Estilos para el nuevo diseño de gráficos
  chartControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },

  chartSection: {
    marginBottom: 16,
  },

  chartSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#555",
  },

  valuesSummary: {
    flexDirection: "column",
    alignItems: "flex-end",
  },

  // Mejoras para los estilos existentes
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },

  currentValueText: {
    fontSize: 14,
    color: "#555",
  },

  valueHighlight: {
    fontWeight: "bold",
    color: "#0077b6",
  },
  parameterSelector: {
    marginVertical: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  parameterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 8,
    margin: 4,
  },

  parameterButtonSelected: {
    backgroundColor: colors.PRIMARY,
  },

  parameterButtonText: {
    color: "#333",
    fontSize: 14
  },

  parameterButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export const getScreenWidth = () => Dimensions.get("window").width - 20;
