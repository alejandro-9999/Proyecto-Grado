// src/components/styles/notificationStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const notificationStyles = StyleSheet.create({
  // Contenedor principal de la lista de notificaciones
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  
  // Estilo para cada notificación individual
  notificationItem: {
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    // Efecto de apilamiento
    marginLeft: 2,
    marginRight: 2,
  },
  
  // Estilos para las notificaciones críticas
  criticalNotification: {
    borderLeftColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  
  // Estilos para las notificaciones de advertencia
  warningNotification: {
    borderLeftColor: '#ff9800',
    backgroundColor: '#fff3e0',
  },
  
  // Estilos para las notificaciones informativas
  infoNotification: {
    borderLeftColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  
  // Estilos para las notificaciones de éxito
  successNotification: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  
  // Indicador de no leído
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f44336',
    zIndex: 1,
  },
  
  // Estilo para la cabecera de la notificación
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  
  // Contenedor para el icono de la notificación
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  // Iconos para diferentes tipos de notificación
  criticalIcon: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  
  warningIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  
  infoIcon: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  
  successIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  
  // Contenido principal de la notificación
  notificationContent: {
    flex: 1,
  },
  
  // Título de la notificación
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  
  // Hora o tiempo relativo de la notificación
  notificationTime: {
    fontSize: 12,
    color: '#757575',
  },
  
  // Botón para expandir/colapsar la notificación
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Contenido expandible
  expandableContent: {
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  
  // Mensaje principal de la notificación
  notificationMessage: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
    lineHeight: 20,
  },
  
  // Fuente de la notificación
  notificationSource: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 8,
  },
  
  // Valor de la notificación
  notificationValue: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 4,
  },
  
  // Destacar valores importantes
  valueHighlight: {
    fontWeight: '700',
    color: '#424242',
  },
  
  // Umbral de la notificación
  notificationThreshold: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 8,
  },
  
  // Contenedor para los botones de acción
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    marginTop: 8,
  },
  
  // Botón de acción genérico
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginLeft: 8,
  },
  
  // Texto para el botón de acción
  actionButtonText: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 4,
  },
  
  // Botón de acción principal
  primaryActionButton: {
    backgroundColor: '#2196f3',
  },
  
  // Texto para el botón de acción principal
  primaryActionText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Filtros de notificaciones
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  // Cada opción de filtro individual
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 4,
  },
  
  // Texto para las opciones de filtro
  filterText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#616161',
  },
  
  // Cabecera de la pantalla de alertas
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  // Título de la pantalla de alertas
  alertsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  
  // Contenedor para el contador de alertas
  alertsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  // Número de alertas
  alertsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f44336',
    marginRight: 4,
  },
  
  // Etiqueta para el contador de alertas
  alertsCountLabel: {
    fontSize: 12,
    color: '#757575',
  },
  
  // Botón para limpiar todas las notificaciones
  clearAllButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  
  // Texto para el botón de limpiar todas
  clearAllButtonText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  
  // Contenedor para mensaje de notificaciones vacías
  emptyNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  // Texto para mensaje de notificaciones vacías
  emptyNotificationsText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  
  // Efectos de apilamiento para notificaciones agrupadas
  stackEffect: {
    position: 'relative',
  },
  
  // Efecto de sobra para notificaciones apiladas
  stackShadow: {
    position: 'absolute',
    bottom: -3,
    left: 4,
    right: 4,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: -1,
  },
  
  // Efecto de tarjeta para las notificaciones
  cardEffect: {
    backgroundColor: '#fff',
  },
  
  // Animación para expandir/colapsar
  animatedContent: {
    overflow: 'hidden',
  },
});
