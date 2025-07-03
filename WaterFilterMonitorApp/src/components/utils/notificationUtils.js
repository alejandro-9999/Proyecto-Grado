// src/components/utils/notificationUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Clave para almacenar notificaciones en AsyncStorage
const NOTIFICATIONS_STORAGE_KEY = '@water_app_notifications';

// Ejemplo de datos de notificación para pruebas
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: 'critical',
    title: 'Nivel de pH crítico',
    message: 'El nivel de pH en la entrada del sistema ha excedido el umbral crítico. Se recomienda acción inmediata.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutos atrás
    source: 'Sensor de entrada',
    value: 9.8,
    threshold: 9.5,
    units: 'pH',
    read: false,
    actionable: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'Turbidez elevada',
    message: 'La turbidez en la salida del sistema está cerca del umbral de advertencia.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutos atrás
    source: 'Sensor de salida',
    value: 4.2,
    threshold: 5.0,
    units: 'NTU',
    read: false,
    actionable: true
  },
  {
    id: '3',
    type: 'info',
    title: 'Mantenimiento programado',
    message: 'Se realizará un mantenimiento programado del sistema el próximo viernes a las 10:00 AM. No se interrumpirá el servicio durante este período.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 horas atrás
    read: true,
    actionable: false
  },
  {
    id: '4',
    type: 'success',
    title: 'Calibración completada',
    message: 'La calibración automática de los sensores de pH se ha completado exitosamente.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 día atrás
    source: 'Sistema de calibración',
    read: true,
    actionable: false
  }
];

/**
 * Obtiene todas las notificaciones del almacenamiento
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getAllNotifications = async () => {
  try {
    const notificationsJSON = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    
    if (notificationsJSON) {
      return JSON.parse(notificationsJSON);
    } else {
      // Si no hay notificaciones guardadas, usar las de ejemplo y guardarlas
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(SAMPLE_NOTIFICATIONS));
      return SAMPLE_NOTIFICATIONS;
    }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

/**
 * Añade una nueva notificación
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} Notificación creada
 */
export const addNotification = async (notification) => {
  try {
    const notifications = await getAllNotifications();
    
    // Crear la nueva notificación con ID único y timestamp
    const newNotification = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
      actionable: false,
      ...notification
    };
    
    // Añadir al inicio del array para que aparezca primero
    const updatedNotifications = [newNotification, ...notifications];
    
    // Guardar en almacenamiento
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    
    return newNotification;
  } catch (error) {
    console.error('Error al añadir notificación:', error);
    throw error;
  }
};

/**
 * Marca una notificación como leída
 * @param {string} id - ID de la notificación
 * @returns {Promise<void>}
 */
export const markAsRead = async (id) => {
  try {
    const notifications = await getAllNotifications();
    
    // Actualizar el estado de la notificación
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    );
    
    // Guardar en almacenamiento
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

/**
 * Marca todas las notificaciones como leídas
 * @returns {Promise<void>}
 */
export const markAllAsRead = async () => {
  try {
    const notifications = await getAllNotifications();
    
    // Marcar todas como leídas
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    // Guardar en almacenamiento
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

/**
 * Elimina una notificación
 * @param {string} id - ID de la notificación
 * @returns {Promise<void>}
 */
export const deleteNotification = async (id) => {
  try {
    const notifications = await getAllNotifications();
    
    // Filtrar para eliminar la notificación
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    
    // Guardar en almacenamiento
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};

/**
 * Elimina todas las notificaciones
 * @returns {Promise<void>}
 */
export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
    throw error;
  }
};

/**
 * Crea una notificación basada en valores de parámetros
 * @param {string} parameter - Nombre del parámetro
 * @param {string} source - Fuente del dato (entrada/salida)
 * @param {number} value - Valor del parámetro
 * @param {Object} thresholds - Umbrales para diferentes niveles
 * @returns {Promise<Object|null>} Notificación creada o null si no requiere notificación
 */
export const createParameterNotification = async (parameter, source, value, thresholds) => {
  // Determinar el tipo de notificación basado en los umbrales
  let type = null;
  let title = null;
  let threshold = null;
  
  const parameterLabels = {
    ph: 'pH',
    turbidity: 'Turbidez',
    conductivity: 'Conductividad',
    temperature: 'Temperatura',
    oxygen: 'Oxígeno disuelto',
    chlorine: 'Cloro'
  };
  
  const sourceLabel = source === 'entrada' ? 'Entrada' : 'Salida';
  const paramLabel = parameterLabels[parameter] || parameter;
  
  // Verificar contra umbrales
  if (value >= thresholds.critical.max || value <= thresholds.critical.min) {
    type = 'critical';
    title = `${paramLabel} crítico en ${sourceLabel}`;
    threshold = value >= thresholds.critical.max ? thresholds.critical.max : thresholds.critical.min;
  } else if (value >= thresholds.warning.max || value <= thresholds.warning.min) {
    type = 'warning';
    title = `${paramLabel} en nivel de advertencia (${sourceLabel})`;
    threshold = value >= thresholds.warning.max ? thresholds.warning.max : thresholds.warning.min;
  }
  
  // Si no se requiere notificación, retornar null
  if (!type) return null;
  
  // Crear mensaje
  const message = value > threshold
    ? `El nivel de ${paramLabel} en ${sourceLabel} ha excedido el umbral ${type === 'critical' ? 'crítico' : 'de advertencia'}.`
    : `El nivel de ${paramLabel} en ${sourceLabel} está por debajo del umbral ${type === 'critical' ? 'crítico' : 'de advertencia'}.`;
  
  // Crear y añadir la notificación
  const newNotification = {
    type,
    title,
    message,
    source: `Sensor de ${sourceLabel}`,
    value,
    threshold,
    units: getUnits(parameter),
    actionable: true
  };
  
  return await addNotification(newNotification);
};

/**
 * Obtiene las unidades para un parámetro específico
 * @param {string} parameter - Nombre del parámetro
 * @returns {string} Unidades del parámetro
 */
const getUnits = (parameter) => {
  const units = {
    ph: 'pH',
    turbidity: 'NTU',
    conductivity: 'μS/cm',
    temperature: '°C',
    oxygen: 'mg/L',
    chlorine: 'mg/L'
  };
  
  return units[parameter] || '';
};

/**
 * Verifica si hay notificaciones no leídas
 * @returns {Promise<boolean>} True si hay notificaciones no leídas
 */
export const hasUnreadNotifications = async () => {
  try {
    const notifications = await getAllNotifications();
    return notifications.some(notification => !notification.read);
  } catch (error) {
    console.error('Error al verificar notificaciones no leídas:', error);
    return false;
  }
};

/**
 * Obtiene el recuento de notificaciones no leídas
 * @returns {Promise<number>} Número de notificaciones no leídas
 */
export const getUnreadCount = async () => {
  try {
    const notifications = await getAllNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error al obtener recuento de no leídas:', error);
    return 0;
  }
};