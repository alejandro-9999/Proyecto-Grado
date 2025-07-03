import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Dimensions } from "react-native";
import { Divider, Surface } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { styles } from "../styles/efficiencyChartStyles";
import { fetchPredictionData } from "../api/fetchPrediction";

// Since we need to adapt recharts for React Native, we'll use react-native-chart-kit
const ResponsiveLineChart = ({ data, umbralCritico, horaCambio }) => {
  const screenWidth = Dimensions.get("window").width - 20; // Reducir margen para más ancho

  // Prepare data for the chart
  const chartData = {
    labels: [], // Will be generated below
    datasets: [
      {
        data: [],
        color: () => "#2196F3", // Blue line color
        strokeWidth: 2,
      },
      // Agregar línea del umbral crítico
      {
        data: [],
        color: () => "#FF5722", // Red line color for threshold
        strokeWidth: 2,
        withDots: false,
      },
    ],
  };

  // Extract data points for the chart (show more points to see better projection)
  const dataPoints =
    data.length > 20
      ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0)
      : data;

  // Encontrar el valor máximo para configurar el rango del eje Y
  const maxEfficiency = Math.max(...data.map((point) => point.eficiencia));
  const yAxisMax = Math.max(100, Math.ceil(maxEfficiency / 10) * 10); // Mínimo 100, redondeado hacia arriba

  // Populate the chart data with better label spacing
  dataPoints.forEach((point, index) => {
    // Show labels every few points to avoid crowding
    const showLabel =
      index % Math.max(1, Math.floor(dataPoints.length / 8)) === 0 ||
      index === dataPoints.length - 1;
    chartData.labels.push(showLabel ? Math.round(point.hora).toString() : "");
    chartData.datasets[0].data.push(point.eficiencia);
    // Agregar el umbral crítico para cada punto
    chartData.datasets[1].data.push(umbralCritico);
  });

  return (
    <View style={styles.chartContainer}>
      {dataPoints.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={280}
          chartConfig={{
            backgroundColor: "#f9f9f9",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 8,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "1",
              stroke: "#2196F3",
            },
          }}
          // Configurar el rango del eje Y para que inicie en 0
          fromZero={true}
          segments={5} // Número de segmentos en el eje Y
          yAxisSuffix="%"
          bezier
          style={styles.chart}
          // Configurar el rango manualmente
          formatYLabel={(yValue) => {
            return Math.round(parseFloat(yValue)).toString() + "%";
          }}
        />
      ) : (
        <Text style={styles.chartPlaceholder}>No hay datos disponibles</Text>
      )}

      <View style={styles.chartLines}>
        <View style={styles.chartLine}>
          <View
            style={[styles.chartLineIndicator, { backgroundColor: "#2196F3" }]}
          />
          <Text style={styles.chartLineText}>Eficiencia</Text>
        </View>
        <View style={styles.chartLine}>
          <View
            style={[styles.chartLineIndicator, { backgroundColor: "#FF5722" }]}
          />
          <Text style={styles.chartLineText}>
            Umbral Crítico ({umbralCritico}%)
          </Text>
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
    fetchPredictionData(
      setData,
      setUmbralCritico,
      setHoraCambio,
      setVidaUtil,
      setUltimaHora,
      setLoading
    );
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
        <Divider />
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
            <Text style={styles.infoValue}>
              {Math.round(horaCambio * 100) / 100} horas
            </Text>
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

export default EfficiencyChart;
