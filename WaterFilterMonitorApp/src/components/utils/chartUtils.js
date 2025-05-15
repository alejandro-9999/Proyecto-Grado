// src/components/utils/chartUtils.js (con métodos adicionales para soportar las gráficas combinadas)

import { Dimensions } from 'react-native';

// Número máximo de puntos a mostrar en los gráficos
export const MAX_POINTS = 20;

/**
 * Obtiene la configuración básica para los gráficos
 * @returns {Object} Configuración del gráfico
 */
export const getChartConfig = () => {
  return {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 119, 182, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#fafafa',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };
};

/**
 * Obtiene el valor actual (último) de un conjunto de datos
 * @param {Object} data - Datos del gráfico
 * @returns {string} Valor actual formateado
 */
export const getCurrentValue = (data) => {
  if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data || data.datasets[0].data.length === 0) {
    return '---';
  }
  
  const lastValue = data.datasets[0].data[data.datasets[0].data.length - 1];
  return lastValue.toFixed(2);
};

/**
 * Obtiene el ancho de la pantalla para dimensionar los gráficos
 * @returns {number} Ancho de la pantalla menos un margen
 */
export const getScreenWidth = () => {
  return Dimensions.get('window').width - 16;
};

/**
 * Sincroniza los datos de dos gráficos para visualización combinada
 * @param {Object} inputData - Datos de entrada
 * @param {Object} outputData - Datos de salida
 * @returns {Object} Datos sincronizados para visualización combinada
 */
export const synchronizeChartData = (inputData, outputData) => {
  // Obtener todas las etiquetas de tiempo únicas y ordenarlas
  const allLabels = [...new Set([...inputData.labels, ...outputData.labels])].sort();
  
  // Crear mapas de valores para entrada y salida
  const inputMap = new Map();
  const outputMap = new Map();
  
  // Llenar el mapa de entrada
  inputData.labels.forEach((label, index) => {
    inputMap.set(label, inputData.datasets[0].data[index]);
  });
  
  // Llenar el mapa de salida
  outputData.labels.forEach((label, index) => {
    outputMap.set(label, outputData.datasets[0].data[index]);
  });
  
  // Crear nuevos arreglos de datos sincronizados
  const syncedInputData = [];
  const syncedOutputData = [];
  
  // Para cada etiqueta, obtener los valores correspondientes o interpolar si es necesario
  allLabels.forEach(label => {
    // Para datos de entrada
    if (inputMap.has(label)) {
      syncedInputData.push(inputMap.get(label));
    } else {
      // Podríamos implementar interpolación aquí si es necesario
      // Por ahora, usamos null para indicar datos faltantes
      syncedInputData.push(null);
    }
    
    // Para datos de salida
    if (outputMap.has(label)) {
      syncedOutputData.push(outputMap.get(label));
    } else {
      // Podríamos implementar interpolación aquí si es necesario
      syncedOutputData.push(null);
    }
  });
  
  // Crear el objeto de datos combinados
  return {
    labels: allLabels,
    datasets: [
      {
        data: syncedInputData,
        color: () => 'rgba(0, 119, 182, 0.8)',
        strokeWidth: 2,
      },
      {
        data: syncedOutputData,
        color: () => 'rgba(3, 192, 60, 0.8)',
        strokeWidth: 2,
      },
    ],
    legend: ["Entrada", "Salida"],
  };
};

/**
 * Compara dos conjuntos de datos para determinar si hay cambios significativos
 * @param {Object} data1 - Primer conjunto de datos
 * @param {Object} data2 - Segundo conjunto de datos
 * @returns {boolean} True si hay cambios significativos, False en caso contrario
 */
export const hasSignificantChanges = (data1, data2) => {
  if (!data1 || !data2) return true;
  
  // Comparar longitud de datos
  if (data1.datasets[0].data.length !== data2.datasets[0].data.length) return true;
  
  // Comparar últimos 3 valores si existen
  const length = data1.datasets[0].data.length;
  if (length > 0) {
    const lastIndex = length - 1;
    if (data1.datasets[0].data[lastIndex] !== data2.datasets[0].data[lastIndex]) return true;
    
    if (length > 1) {
      const secondLastIndex = length - 2;
      if (data1.datasets[0].data[secondLastIndex] !== data2.datasets[0].data[secondLastIndex]) return true;
      
      if (length > 2) {
        const thirdLastIndex = length - 3;
        if (data1.datasets[0].data[thirdLastIndex] !== data2.datasets[0].data[thirdLastIndex]) return true;
      }
    }
  }
  
  return false;
};