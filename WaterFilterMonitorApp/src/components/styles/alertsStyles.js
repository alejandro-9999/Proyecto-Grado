import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  alertsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  alertsCountContainer: {
    backgroundColor: "#ff3b30",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  alertsCount: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  alertsCountLabel: {
    color: "#fff",
    fontSize: 14,
  },

  notificationsContainer: {
    marginTop: 10,
    marginBottom: 16,
  },

  clearAllButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },

  clearAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  emptyNotificationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  emptyNotificationsText: {
    fontSize: 16,
    color: "#7a7a7a",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  notificationFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap", // permite que se acomoden si no caben en una línea
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  // Contenedor de los chips de filtros
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 10,
  },

  // Cada chip de filtro
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },

  // Estilo activo (cuando el filtro está seleccionado)
  filterChipActive: {
    backgroundColor: "#f1f1f1",
  },

  // Texto de los chips
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },

  // Contenedor para el switch "solo no leídas"
  unreadFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 4,
  },

  unreadFilterText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
