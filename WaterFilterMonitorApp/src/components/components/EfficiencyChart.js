import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Dimensions } from 'react-native';
import { Divider, Surface } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { PREDICTION_URL } from '../config/config';

// Since we need to adapt recharts for React Native, we'll use react-native-chart-kit
const ResponsiveLineChart = ({ data, umbralCritico, horaCambio }) => {
  const screenWidth = Dimensions.get('window').width - 40; // Margin for padding
  
  // Prepare data for the chart
  const chartData = {
    labels: [], // Will be generated below
    datasets: [
      {
        data: [],
        color: () => '#2196F3', // Blue line color
        strokeWidth: 2
      }
    ]
  };
  
  // Extract data points for the chart (we'll use a subset for better display)
  const dataPoints = data.length > 10 ? data.filter((_, i) => i % Math.ceil(data.length / 10) === 0) : data;
  
  // Populate the chart data
  dataPoints.forEach(point => {
    chartData.labels.push(Math.round(point.hora).toString());
    chartData.datasets[0].data.push(point.eficiencia);
  });
  
  return (
    <View style={styles.chartContainer}>
      {dataPoints.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={256}
          chartConfig={{
            backgroundColor: '#f9f9f9',
            backgroundGradientFrom: '#f9f9f9',
            backgroundGradientTo: '#f9f9f9',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 8
            },
            propsForDots: {
              r: '4',
              strokeWidth: '1',
              stroke: '#2196F3'
            }
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.chartPlaceholder}>No hay datos disponibles</Text>
      )}
      
      <View style={styles.chartLines}>
        <View style={styles.chartLine}>
          <View style={[styles.chartLineIndicator, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.chartLineText}>Eficiencia</Text>
        </View>
        <View style={styles.chartLine}>
          <View style={[styles.chartLineIndicator, { backgroundColor: 'red' }]} />
          <Text style={styles.chartLineText}>Umbral Crítico ({umbralCritico}%)</Text>
        </View>
      </View>
      
      <Text style={styles.chartNote}>
        Cambio recomendado: {Math.round(horaCambio)} horas
      </Text>
    </View>
  );
};

const EfficiencyChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [umbralCritico, setUmbralCritico] = useState(0);
  const [horaCambio, setHoraCambio] = useState(0);
  const [vidaUtil, setVidaUtil] = useState(0);
  const [ultimaHora, setUltimaHora] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(PREDICTION_URL);
        
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Preparar los datos para el gráfico
        const historicData = responseData.historico.map(item => ({
          hora: item.x,
          eficiencia: item.y,
          tipo: 'Histórico'
        }));

        const projectionData = responseData.proyeccion.map(item => ({
          hora: item.x,
          eficiencia: item.y,
          tipo: 'Proyección'
        }));

        // Combinar datos históricos y proyección
        const combinedData = [...historicData, ...projectionData];
        
        // Reducir la cantidad de puntos para mejor visualización
        const sampledData = [];
        const step = Math.max(1, Math.floor(combinedData.length / 50));
        
        for (let i = 0; i < combinedData.length; i += step) {
          sampledData.push(combinedData[i]);
        }
        
        // Asegurar que el último punto siempre esté incluido
        if (combinedData.length > 0 && sampledData[sampledData.length - 1] !== combinedData[combinedData.length - 1]) {
          sampledData.push(combinedData[combinedData.length - 1]);
        }

        setData(sampledData);
        setUmbralCritico(responseData.umbral_critico);
        setHoraCambio(responseData.hora_cambio);
        setVidaUtil(responseData.vida_util_restante);
        setUltimaHora(responseData.ultima_hora);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos de predicción:', error);
        Alert.alert(
          'Error de conexión',
          'No se pudieron cargar los datos de predicción. Por favor, inténtelo de nuevo más tarde.',
          [{ text: 'OK' }]
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Eficiencia del Filtro</Text>
      
      <View style={styles.chartWrapper}>
        <ResponsiveLineChart 
          data={data} 
          umbralCritico={umbralCritico} 
          horaCambio={horaCambio} 
        />
      </View>
      <View style={styles.divider}>
        <Divider/>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Información del Filtro</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Umbral crítico:</Text>
            <Text style={styles.infoValue}>{umbralCritico}%</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Hora actual:</Text>
            <Text style={styles.infoValue}>{ultimaHora} horas</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Cambio requerido a las:</Text>
            <Text style={styles.infoValue}>{Math.round(horaCambio * 100) / 100} horas</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Vida útil restante:</Text>
            <Text style={styles.infoValue}>{Math.round(vidaUtil)} horas</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          ⚠️ Reemplazar filtro en {Math.round(vidaUtil)} horas de uso
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
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
    height: 300,
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

export default EfficiencyChart;