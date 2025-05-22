import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  container: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  chartWrapper: {
    marginBottom: 24,
    height: 320, // Aumentar altura para mejor visualización
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  chartPlaceholder: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    padding: 20,
  },
  chartLines: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chartLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  chartLineIndicator: {
    width: 12,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  chartLineText: {
    fontSize: 12,
    color: '#666',
  },
  chartNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    marginBottom: 12,
    marginTop: 12
  },
  infoContainer: {
    backgroundColor: '#EBF5FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 26,

  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    width: '48%',
    margin: '1%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  warningText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
});
