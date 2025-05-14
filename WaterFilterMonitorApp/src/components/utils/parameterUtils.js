// src/utils/parameterUtils.js

/**
 * Obtiene el título y unidades para el parámetro seleccionado
 * @param {string} param - Nombre del parámetro
 * @returns {Object} - Objeto con título y unidades
 */
export const getParameterInfo = (param) => {
    switch (param) {
      case 'ph':
        return { title: 'pH', units: '' };
      case 'temperatura':
        return { title: 'Temperatura', units: '°C' };
      case 'turbidez':
        return { title: 'Turbidez', units: 'NTU' };
      case 'conductividad':
        return { title: 'Conductividad', units: 'μS/cm' };
      case 'oxigeno_disuelto':
        return { title: 'Oxígeno Disuelto', units: 'mg/L' };
      default:
        return { title: param, units: '' };
    }
  };
  
  /**
   * Lista de parámetros disponibles para selección
   */
  export const PARAMETERS = [
    { label: 'pH', value: 'ph' },
    { label: 'Temperatura', value: 'temperatura' },
    { label: 'Turbidez', value: 'turbidez' },
    { label: 'Conductividad', value: 'conductividad' },
    { label: 'Oxígeno Disuelto', value: 'oxigeno_disuelto' },
  ];