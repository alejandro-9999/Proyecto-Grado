import { PREDICTION_URL } from "../config/config";

export const fetchPredictionData = async (
  setData,
  setUmbralCritico,
  setHoraCambio,
  setVidaUtil,
  setUltimaHora,
  setLoading
) => {
  try {
    const response = await fetch(PREDICTION_URL);

    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }

    const responseData = await response.json();

    // Preparar los datos para el gráfico
    const historicData = responseData.historico.map((item) => ({
      hora: item.x,
      eficiencia: item.y,
      tipo: "Histórico",
    }));

    const projectionData = responseData.proyeccion.map((item) => ({
      hora: item.x,
      eficiencia: item.y,
      tipo: "Proyección",
    }));

    // Combinar datos históricos y proyección
    const combinedData = [...historicData, ...projectionData];

    // Reducir la cantidad de puntos para mejor visualización pero mantener más para la proyección
    const sampledData = [];
    const step = Math.max(1, Math.floor(combinedData.length / 80)); // Aumentamos de 50 a 80 puntos

    for (let i = 0; i < combinedData.length; i += step) {
      sampledData.push(combinedData[i]);
    }

    // Asegurar que el último punto siempre esté incluido
    if (
      combinedData.length > 0 &&
      sampledData[sampledData.length - 1] !==
        combinedData[combinedData.length - 1]
    ) {
      sampledData.push(combinedData[combinedData.length - 1]);
    }

    setData(sampledData);
    setUmbralCritico(responseData.umbral_critico);
    setHoraCambio(responseData.hora_cambio);
    setVidaUtil(responseData.vida_util_restante);
    setUltimaHora(responseData.ultima_hora);
    setLoading(false);
  } catch (error) {
    console.error("Error al obtener datos de predicción:", error);
    Alert.alert(
      "Error de conexión",
      "No se pudieron cargar los datos de predicción. Por favor, inténtelo de nuevo más tarde.",
      [{ text: "OK" }]
    );
    setLoading(false);
  }
};
