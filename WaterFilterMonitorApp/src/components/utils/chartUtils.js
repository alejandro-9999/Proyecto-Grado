// src/utils/chartUtils.js

/**
 * Obtiene la configuración del gráfico optimizada para animaciones fluidas
 * @returns {Object} - Configuración del gráfico
 */
export const getChartConfig = () => {
    return {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 1, // Reducido para mejor rendimiento
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '3', // Reducido para mejor rendimiento
        strokeWidth: '1',
      },
      // Optimizaciones para animaciones más fluidas
      useShadowColorFromDataset: false,
      propsForBackgroundLines: {
        strokeDasharray: '', // Líneas sólidas para mejor rendimiento
      },
      propsForLabels: {
        fontSize: 10, // Tamaño de fuente más pequeño para mejor rendimiento
      },
    };
  };
  
  /**
   * Obtiene el valor actual del conjunto de datos
   * @param {Object} data - Datos del gráfico
   * @returns {string} - Valor actual formateado
   */
  export const getCurrentValue = (data) => {
    if (data.datasets[0].data.length > 0) {
      return data.datasets[0].data[data.datasets[0].data.length - 1].toFixed(2);
    }
    return "---";
  };
  
  /**
   * Genera datos iniciales vacíos para un gráfico
   * @param {string} source - Fuente de los datos ('entrada' o 'salida')
   * @returns {Object} - Estructura de datos inicial para el gráfico
   */
  export const getInitialChartData = (source) => {
    const color = source === 'entrada' 
      ? () => 'rgba(0, 119, 182, 0.8)' 
      : () => 'rgba(3, 192, 60, 0.8)';
    
    return {
      labels: [],
      datasets: [{ 
        data: [],
        color,
        strokeWidth: 2 
      }],
      legend: [source === 'entrada' ? 'Entrada' : 'Salida']
    };
  };
  
  // Número máximo de puntos a mostrar en el gráfico
  export const MAX_POINTS = 30;