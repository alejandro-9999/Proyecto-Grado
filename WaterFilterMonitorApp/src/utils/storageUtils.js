// src/utils/storageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefijo para las claves de caché
const CACHE_KEY_PREFIX = 'water_quality_data_';

/**
 * Guarda datos en caché
 * @param {string} source - Fuente de datos ('entrada' o 'salida')
 * @param {string} parameter - Parámetro seleccionado (pH, temperatura, etc.)
 * @param {Object} data - Datos a guardar
 * @returns {Promise<void>}
 */
export const saveDataToCache = async (source, parameter, data) => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${source}_${parameter}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando datos en caché:', error);
  }
};

/**
 * Carga datos desde caché
 * @param {string} source - Fuente de datos ('entrada' o 'salida')
 * @param {string} parameter - Parámetro seleccionado (pH, temperatura, etc.)
 * @returns {Promise<Object|null>} - Datos cargados o null si no existen
 */
export const loadDataFromCache = async (source, parameter) => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${source}_${parameter}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error cargando datos desde caché:', error);
    return null;
  }
};