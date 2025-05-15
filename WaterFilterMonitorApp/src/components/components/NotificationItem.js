import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { notificationStyles } from "../styles/notificationStyles";

// Habilitar LayoutAnimation para Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Componente para mostrar una notificación individual con apilamiento visual
 * @param {Object} notification - Datos de la notificación
 * @param {Function} onMarkAsRead - Función para marcar como leída
 * @param {Number} index - Índice en la lista de notificaciones (para efecto de apilamiento)
 * @param {String} groupId - ID del grupo al que pertenece (si está agrupada)
 */
const NotificationItem = ({
  notification,
  onMarkAsRead,
  index = 0,
  groupId = null,
}) => {
  const [expanded, setExpanded] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Obtener detalles basados en el tipo de notificación
  const getNotificationStyles = () => {
    switch (notification.type) {
      case "critical":
        return {
          containerStyle: notificationStyles.criticalNotification,
          iconName: "error",
          iconColor: "#d32f2f",
          iconContainerStyle: notificationStyles.criticalIcon,
        };
      case "warning":
        return {
          containerStyle: notificationStyles.warningNotification,
          iconName: "warning",
          iconColor: "#ff9800",
          iconContainerStyle: notificationStyles.warningIcon,
        };
      case "info":
        return {
          containerStyle: notificationStyles.infoNotification,
          iconName: "info",
          iconColor: "#2196f3",
          iconContainerStyle: notificationStyles.infoIcon,
        };
      case "success":
        return {
          containerStyle: notificationStyles.successNotification,
          iconName: "check-circle",
          iconColor: "#4caf50",
          iconContainerStyle: notificationStyles.successIcon,
        };
      default:
        return {
          containerStyle: {},
          iconName: "notifications",
          iconColor: "#757575",
          iconContainerStyle: {},
        };
    }
  };

  const notificationTypeStyles = getNotificationStyles();

  // Formatear la fecha relativa (ej: "hace 5 minutos")
  const formattedTime = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: es,
  });

  // Alternar la expansión de la notificación con animación
  const toggleExpand = () => {
    // Configurar animación suave
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Animar la escala al tocar
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animar la expansión/colapso
    Animated.timing(animationValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  // Manejar cuando se marca como leída
  const handleMarkAsRead = () => {
    if (!notification.read) {
      // Animar la notificación al marcarla como leída
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onMarkAsRead(notification.id);
      });
    }
  };

  // Calcular la altura máxima para la animación
  const maxHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Valor alto para asegurar que se muestre todo el contenido
  });

  // Calcular la opacidad para la animación
  const contentOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  // Efecto de apilamiento visual con índice
  const stackOffset = Math.min(index, 2) * 1; // Limitar el efecto a máximo 3 niveles

  return (
    <Animated.View
      style={[
        notificationStyles.stackEffect,
        {
          transform: [{ scale: scaleValue }],
          marginTop: stackOffset > 0 ? -8 : 0, // Superponer ligeramente las notificaciones
          zIndex: 10 - index, // Mayor índice en z para las más recientes
        },
      ]}
    >
      {/* Efecto de sombra para el apilamiento */}
      {stackOffset > 0 && <View style={notificationStyles.stackShadow} />}

      <TouchableOpacity
        style={[
          notificationStyles.notificationItem,
          notificationTypeStyles.containerStyle,
          notificationStyles.cardEffect,
          {
            opacity: notification.read ? 0.75 : 1,
            marginHorizontal: stackOffset * 4, // Crea un efecto escalonado
          },
        ]}
        onPress={toggleExpand}
        activeOpacity={0.9}
      >
        {/* Indicador de no leído */}
        {!notification.read && (
          <View style={notificationStyles.unreadIndicator} />
        )}

        {/* Parte superior de la notificación (siempre visible) */}
        <View style={notificationStyles.notificationHeader}>
          <View
            style={[
              notificationStyles.notificationIconContainer,
              notificationTypeStyles.iconContainerStyle,
            ]}
          >
            <MaterialIcons
              name={notificationTypeStyles.iconName}
              size={24}
              color={notificationTypeStyles.iconColor}
            />
          </View>

          <View style={notificationStyles.notificationContent}>
            <Text style={notificationStyles.notificationTitle}>
              {notification.title}
            </Text>
            <Text style={notificationStyles.notificationTime}>
              {formattedTime}
            </Text>
          </View>

          <TouchableOpacity
            style={notificationStyles.expandButton}
            onPress={toggleExpand}
          >
            <MaterialIcons
              name={expanded ? "expand-less" : "expand-more"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Contenido expandible con animación */}
        <Animated.View
          style={[
            notificationStyles.expandableContent,
            {
              maxHeight: maxHeight,
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={notificationStyles.notificationMessage}>
            {notification.message}
          </Text>

          {notification.source && (
            <Text style={notificationStyles.notificationSource}>
              Fuente: {notification.source}
            </Text>
          )}

          {notification.value !== undefined && (
            <Text style={notificationStyles.notificationValue}>
              Valor:{" "}
              <Text style={notificationStyles.valueHighlight}>
                {notification.value} {notification.units || ""}
              </Text>
            </Text>
          )}

          {notification.threshold !== undefined && (
            <Text style={notificationStyles.notificationThreshold}>
              Umbral:{" "}
              <Text style={notificationStyles.valueHighlight}>
                {notification.threshold} {notification.units || ""}
              </Text>
            </Text>
          )}

          {/* Botones de acción */}
          <View style={notificationStyles.notificationActions}>
            {!notification.read && (
              <TouchableOpacity
                style={notificationStyles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
              >
                <MaterialIcons name="done" size={16} color="#666" />
                <Text style={notificationStyles.actionButtonText}>
                  Marcar como leída
                </Text>
              </TouchableOpacity>
            )}

            {notification.actionable && (
              <TouchableOpacity
                style={[
                  notificationStyles.actionButton,
                  notificationStyles.primaryActionButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  // Acción específica asociada a esta notificación
                  if (notification.onAction) notification.onAction();
                }}
              >
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                <Text style={notificationStyles.primaryActionText}>
                  Ver detalles
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationItem;
