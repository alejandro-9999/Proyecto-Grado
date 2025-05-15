// src/screens/AlertsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch 
} from 'react-native';
import Header from '../components/components/Header';
import { styles } from '../components/styles/alertsStyles';
import { 
  getAllNotifications, 
  markAsRead, 
  clearAllNotifications 
} from '../components/utils/notificationUtils';
import NotificationItem from '../components/components/NotificationItem';
import NotificationFilter from '../components/components/NotificationFilter';

const AlertsScreen = () => {
  // Estado para almacenar todas las notificaciones
  const [notifications, setNotifications] = useState([]);
  
  // Estado para controlar los filtros activos
  const [filters, setFilters] = useState({
    critical: true,
    warning: true,
    info: true,
    success: true,
    unreadOnly: false
  });
  

  
  // Cargar notificaciones al iniciar
  useEffect(() => {
    loadNotifications();
    
    // Configurar un intervalo para comprobar nuevas notificaciones
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  // Cargar notificaciones desde la utilidad
  const loadNotifications = async () => {
    try {
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };
  
  // Manejar cuando se marca una notificación como leída
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      // Actualizar el estado local para reflejar el cambio
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };
  
  // Limpiar todas las notificaciones
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
    }
  };
  
  // Aplicar filtros a las notificaciones
  const filteredNotifications = notifications.filter(notification => {
    // Filtrar por tipo
    if (!filters[notification.type]) return false;
    
    // Filtrar por estado de lectura si está activado
    if (filters.unreadOnly && notification.read) return false;
    
    return true;
  });
  
  // Ordenar por fecha (más recientes primero) y por prioridad
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    // Priorizar notificaciones no leídas
    if (a.read !== b.read) return a.read ? 1 : -1;
    
    // Luego por prioridad
    const priorityOrder = { critical: 1, warning: 2, info: 3, success: 4 };
    if (priorityOrder[a.type] !== priorityOrder[b.type]) {
      return priorityOrder[a.type] - priorityOrder[b.type];
    }
    
    // Finalmente por fecha (más recientes primero)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.alertsHeader}>
        <Text style={styles.alertsTitle}>Notificaciones</Text>
        <View style={styles.alertsCountContainer}>
          <Text style={styles.alertsCount}>
            {sortedNotifications.filter(n => !n.read).length}
          </Text>
          <Text style={styles.alertsCountLabel}>No leídas</Text>
        </View>
      </View>
      
      <NotificationFilter 
        filters={filters}
        setFilters={setFilters}
      />
      
      {sortedNotifications.length > 0 ? (
        <ScrollView style={styles.notificationsContainer}>
          {sortedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearAllButtonText}>Limpiar Todas</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyNotificationsContainer}>
          <Text style={styles.emptyNotificationsText}>
            No hay notificaciones {filters.unreadOnly ? 'sin leer' : ''} en este momento
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AlertsScreen;