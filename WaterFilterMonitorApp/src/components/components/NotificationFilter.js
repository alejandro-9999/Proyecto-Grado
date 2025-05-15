// src/components/components/NotificationFilter.js
import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles/alertsStyles';
import { colors } from '../styles/colors';

/**
 * Componente para filtrar las notificaciones
 * @param {Object} filters - Estado actual de los filtros
 * @param {Function} setFilters - Función para actualizar los filtros
 */
const NotificationFilter = ({ filters, setFilters }) => {
  // Función para alternar un filtro específico
  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };
  
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filtros:</Text>
      
      <View style={styles.filtersRow}>
        {/* Filtro de Críticas */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.critical ? styles.filterChipActive : null,
            { borderColor: '#d32f2f' }
          ]}
          onPress={() => toggleFilter('critical')}
        >
          <MaterialIcons 
            name="error" 
            size={18} 
            color={filters.critical ? '#d32f2f' : '#999'} 
          />
          <Text 
            style={[
              styles.filterChipText, 
              filters.critical ? { color: '#d32f2f' } : null
            ]}
          >
            Críticas
          </Text>
        </TouchableOpacity>
        
        {/* Filtro de Advertencias */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.warning ? styles.filterChipActive : null,
            { borderColor: '#ff9800' }
          ]}
          onPress={() => toggleFilter('warning')}
        >
          <MaterialIcons 
            name="warning" 
            size={18} 
            color={filters.warning ? '#ff9800' : '#999'} 
          />
          <Text 
            style={[
              styles.filterChipText, 
              filters.warning ? { color: '#ff9800' } : null
            ]}
          >
            Advertencias
          </Text>
        </TouchableOpacity>
        
        {/* Filtro de Información */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.info ? styles.filterChipActive : null,
            { borderColor: '#2196f3' }
          ]}
          onPress={() => toggleFilter('info')}
        >
          <MaterialIcons 
            name="info" 
            size={18} 
            color={filters.info ? '#2196f3' : '#999'} 
          />
          <Text 
            style={[
              styles.filterChipText, 
              filters.info ? { color: '#2196f3' } : null
            ]}
          >
            Info
          </Text>
        </TouchableOpacity>
        
        {/* Filtro de Éxito */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.success ? styles.filterChipActive : null,
            { borderColor: '#4caf50' }
          ]}
          onPress={() => toggleFilter('success')}
        >
          <MaterialIcons 
            name="check-circle" 
            size={18} 
            color={filters.success ? '#4caf50' : '#999'} 
          />
          <Text 
            style={[
              styles.filterChipText, 
              filters.success ? { color: '#4caf50' } : null
            ]}
          >
            Éxito
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filtro de solo no leídas */}
      <View style={styles.unreadFilterContainer}>
        <Text style={styles.unreadFilterText}>Mostrar solo no leídas</Text>
        <Switch
          value={filters.unreadOnly}
          onValueChange={() => toggleFilter('unreadOnly')}
          trackColor={{ true: colors.PRIMARY }}
          thumbColor={filters.unreadOnly ? colors.SECONDARY : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

export default NotificationFilter;