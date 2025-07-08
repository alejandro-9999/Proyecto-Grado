# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

muestrame la estructura de todo el proyecto tanto backend y frontend

*Session: bf0c63d3976c99b467c3f8f975795bb5 | Generated: 7/4/2025, 9:31:42 AM*

### Analysis Summary

# Estructura del Proyecto

Este proyecto se compone de dos partes principales: un **Backend** desarrollado en Python con FastAPI y un **Frontend** construido con React Native (Expo). Ambos interactúan para proporcionar una aplicación de monitoreo de filtros de agua.

## 1. Backend

El **Backend** se encuentra en el directorio [backend/](backend/) y es responsable de la lógica de negocio, la gestión de datos, la comunicación MQTT, las predicciones de Machine Learning y la exposición de APIs REST y WebSockets.

### 1.1. Estructura Principal del Backend

El punto de entrada principal de la aplicación backend es [main.py](backend/app/main.py).

*   **Propósito:** Sirve como el orquestador principal de la aplicación FastAPI, montando las rutas de la API, configurando la aplicación y gestionando los eventos de inicio y apagado.
*   **Partes Internas Clave:**
    *   [main.py](backend/app/main.py): Inicializa la aplicación FastAPI y registra los routers de la API.
    *   [api/](backend/app/api/): Contiene las definiciones de las rutas de la API.
    *   [core/](backend/app/core/): Almacena la configuración de la aplicación.
    *   [lm/](backend/app/lm/): Módulo de Machine Learning para predicciones.
    *   [models/](backend/app/models/): Define los modelos de datos utilizados en la aplicación.
    *   [mqtt/](backend/app/mqtt/): Gestiona la suscripción a temas MQTT.
    *   [websockets/](backend/app/websockets/): Maneja las conexiones WebSocket.
*   **Relaciones Externas:** Se comunica con el **Frontend** a través de APIs REST y WebSockets. También interactúa con un broker MQTT (configurado en [mosquitto/config/mosquitto.conf](mosquitto/config/mosquitto.conf)) para recibir datos de sensores.

### 1.2. Módulos Clave del Backend

#### 1.2.1. API Routes

Las rutas de la API se definen en el directorio [api/](backend/app/api/).

*   **Propósito:** Exponer los endpoints REST y WebSocket para la comunicación con el frontend y otros servicios.
*   **Partes Internas Clave:**
    *   [routes.py](backend/app/api/routes.py): Define las rutas RESTful para la interacción con los datos y la lógica de negocio.
    *   [websocket_routes.py](backend/app/api/websocket_routes.py): Establece los endpoints para la comunicación en tiempo real a través de WebSockets.
*   **Relaciones Externas:** Consumidas por el **Frontend**.

#### 1.2.2. Core Configuration

La configuración de la aplicación se gestiona en [core/config.py](backend/app/core/config.py).

*   **Propósito:** Centralizar las variables de entorno y configuraciones globales de la aplicación.
*   **Partes Internas Clave:**
    *   [config.py](backend/app/core/config.py): Contiene la clase `Settings` para cargar configuraciones desde variables de entorno.
*   **Relaciones Externas:** Utilizado por varios módulos del backend para acceder a configuraciones como las credenciales MQTT o la URL del broker.

#### 1.2.3. Machine Learning (LM) Module

El módulo de Machine Learning se encuentra en [lm/](backend/app/lm/).

*   **Propósito:** Cargar modelos pre-entrenados, procesar datos y realizar predicciones relacionadas con el monitoreo del filtro de agua.
*   **Partes Internas Clave:**
    *   [data_loader.py](backend/app/lm/data_loader.py): Carga y preprocesa los datos para el modelo.
    *   [predict.py](backend/app/lm/predict.py): Contiene la lógica para realizar predicciones utilizando el modelo cargado.
    *   [models/](backend/app/lm/models/): Almacena los archivos del modelo pre-entrenado ([lstm_model.h5](backend/app/lm/models/lstm_model.h5)) y los escaladores ([scaler_X.pkl](backend/app/lm/models/scaler_X.pkl), [scaler_y.pkl](backend/app/lm/models/scaler_y.pkl)).
*   **Relaciones Externas:** Utilizado por las rutas de la API para proporcionar funcionalidades de predicción al frontend.

#### 1.2.4. MQTT Subscriber

El módulo de suscripción MQTT está en [mqtt/subscriber.py](backend/app/mqtt/subscriber.py).

*   **Propósito:** Conectarse a un broker MQTT y suscribirse a temas específicos para recibir datos de sensores en tiempo real.
*   **Partes Internas Clave:**
    *   [subscriber.py](backend/app/mqtt/subscriber.py): Implementa la lógica de conexión y manejo de mensajes MQTT.
*   **Relaciones Externas:** Se conecta al broker MQTT (definido en [docker-compose.yml](docker-compose.yml) y configurado en [mosquitto/config/mosquitto.conf](mosquitto/config/mosquitto.conf)).

#### 1.2.5. WebSockets Manager

La gestión de WebSockets se encuentra en [websockets/manager.py](backend/app/websockets/manager.py).

*   **Propósito:** Administrar las conexiones WebSocket activas y permitir el envío de mensajes a los clientes conectados.
*   **Partes Internas Clave:**
    *   [manager.py](backend/app/websockets/manager.py): Contiene la clase `ConnectionManager` para añadir, remover y enviar mensajes a las conexiones.
*   **Relaciones Externas:** Utilizado por las rutas WebSocket de la API para comunicarse en tiempo real con el **Frontend**.

## 2. Frontend

El **Frontend** se encuentra en el directorio [WaterFilterMonitorApp/](WaterFilterMonitorApp/) y es una aplicación móvil desarrollada con React Native (Expo). Es la interfaz de usuario que permite a los usuarios interactuar con el sistema de monitoreo.

### 2.1. Estructura Principal del Frontend

El punto de entrada principal de la aplicación frontend es [App.js](WaterFilterMonitorApp/App.js).

*   **Propósito:** Inicializar la aplicación React Native y configurar la navegación principal.
*   **Partes Internas Clave:**
    *   [App.js](WaterFilterMonitorApp/App.js): Contiene el componente raíz de la aplicación.
    *   [navigation/](WaterFilterMonitorApp/src/navigation/): Define la estructura de navegación de la aplicación.
    *   [screens/](WaterFilterMonitorApp/src/screens/): Contiene los componentes de las diferentes pantallas de la aplicación.
    *   [components/](WaterFilterMonitorApp/src/components/components/): Agrupa los componentes UI reutilizables.
    *   [assets/](WaterFilterMonitorApp/assets/): Almacena los recursos gráficos de la aplicación.
*   **Relaciones Externas:** Se comunica con el **Backend** a través de llamadas a la API REST y conexiones WebSocket.

### 2.2. Módulos Clave del Frontend

#### 2.2.1. Navigation

La navegación de la aplicación se define en el directorio [navigation/](WaterFilterMonitorApp/src/navigation/).

*   **Propósito:** Organizar las diferentes pantallas y flujos de usuario dentro de la aplicación.
*   **Partes Internas Clave:**
    *   [AppNavigator.js](WaterFilterMonitorApp/src/navigation/AppNavigator.js): El navegador principal de la aplicación.
    *   [TabNavigator.js](WaterFilterMonitorApp/src/navigation/TabNavigator.js): Define la navegación por pestañas.
    *   [MetricsStackNavigator.js](WaterFilterMonitorApp/src/navigation/MetricsStackNavigator.js): Define la pila de navegación para la sección de métricas.
*   **Relaciones Externas:** Utiliza los componentes de pantalla definidos en [screens/](WaterFilterMonitorApp/src/screens/).

#### 2.2.2. Screens

Las pantallas de la aplicación se encuentran en el directorio [screens/](WaterFilterMonitorApp/src/screens/).

*   **Propósito:** Representar las diferentes vistas de la interfaz de usuario.
*   **Partes Internas Clave:**
    *   [AlertsScreen.js](WaterFilterMonitorApp/src/screens/AlertsScreen.js): Pantalla para mostrar alertas.
    *   [ConfigScreen.js](WaterFilterMonitorApp/src/screens/ConfigScreen.js): Pantalla para la configuración de la aplicación.
    *   [MetricsScreen.js](WaterFilterMonitorApp/src/screens/MetricsScreen.js): Pantalla para visualizar métricas.
    *   [PredictionScreen.js](WaterFilterMonitorApp/src/screens/PredictionScreen.js): Pantalla para mostrar predicciones.
*   **Relaciones Externas:** Utilizan componentes de [components/](WaterFilterMonitorApp/src/components/components/) y se comunican con el backend a través de las APIs y WebSockets.

#### 2.2.3. Components

Los componentes reutilizables de la UI se encuentran en [src/components/components/](WaterFilterMonitorApp/src/components/components/).

*   **Propósito:** Proporcionar bloques de construcción reutilizables para la interfaz de usuario.
*   **Partes Internas Clave:**
    *   [EfficiencyChart.js](WaterFilterMonitorApp/src/components/components/EfficiencyChart.js): Componente para mostrar gráficos de eficiencia.
    *   [WaterQualityChart.js](WaterFilterMonitorApp/src/components/components/WaterQualityChart.js): Componente para mostrar gráficos de calidad del agua.
    *   [ParameterSelector.js](WaterFilterMonitorApp/src/components/components/ParameterSelector.js): Componente para seleccionar parámetros.
    *   [NotificationItem.js](WaterFilterMonitorApp/src/components/components/NotificationItem.js): Componente para mostrar elementos de notificación.
*   **Relaciones Externas:** Utilizados por las pantallas y otros componentes.

#### 2.2.4. API and Hooks

La lógica de comunicación con el backend y los hooks personalizados se encuentran en [src/components/api/](WaterFilterMonitorApp/src/components/api/) y [src/components/hooks/](WaterFilterMonitorApp/src/components/hooks/).

*   **Propósito:** Gestionar las llamadas a la API y la lógica de estado reutilizable.
*   **Partes Internas Clave:**
    *   [fetchPrediction.js](WaterFilterMonitorApp/src/components/api/fetchPrediction.js): Función para realizar llamadas a la API de predicción.
    *   [useWebSocket.js](WaterFilterMonitorApp/src/components/hooks/useWebSocket.js): Hook personalizado para gestionar la conexión WebSocket.
*   **Relaciones Externas:** Utilizados por las pantallas y componentes para interactuar con el **Backend**.

#### 2.2.5. Styles and Utils

Los estilos y utilidades se encuentran en [src/components/styles/](WaterFilterMonitorApp/src/components/styles/) y [src/components/utils/](WaterFilterMonitorApp/src/components/utils/).

*   **Propósito:** Centralizar la definición de estilos y funciones de utilidad para mantener la consistencia y la modularidad.
*   **Partes Internas Clave:**
    *   [colors.js](WaterFilterMonitorApp/src/components/styles/colors.js): Define la paleta de colores de la aplicación.
    *   [styles.js](WaterFilterMonitorApp/src/components/styles/styles.js): Estilos generales de la aplicación.
    *   [chartUtils.js](WaterFilterMonitorApp/src/components/utils/chartUtils.js): Funciones de utilidad para gráficos.
    *   [notificationUtils.js](WaterFilterMonitorApp/src/components/utils/notificationUtils.js): Funciones de utilidad para notificaciones.
*   **Relaciones Externas:** Utilizados por los componentes y pantallas de la aplicación.

## 3. Otros Componentes y Configuraciones

Además del backend y el frontend, el proyecto incluye otros archivos y directorios importantes:

*   **Docker Compose:** [docker-compose.yml](docker-compose.yml) define los servicios de Docker para el backend, el frontend (emulator) y el broker MQTT, facilitando el despliegue y la orquestación.
*   **Mosquitto:** El directorio [mosquitto/](mosquitto/) contiene la configuración del broker MQTT ([mosquitto.conf](mosquitto/config/mosquitto.conf)).
*   **Emulator:** El directorio [emulator/](emulator/) contiene una aplicación de emulación con su propio [Dockerfile](emulator/Dockerfile) y [app.py](emulator/app.py), probablemente para simular datos de sensores.
*   **CI/CD:** El directorio [cicd/](cicd/) contiene la configuración del pipeline de CI/CD ([pipeline.yml](cicd/pipeline.yml)).
*   **Datasets:** [dataset_30dias_8horas.csv](dataset_30dias_8horas.csv) y [dataset.py](dataset.py) son utilizados para la gestión de datos, probablemente para el entrenamiento o prueba del modelo de Machine Learning.
*   **Jupyter Notebook:** [eda_filtro_agua.ipynb](eda_filtro_agua.ipynb) es un cuaderno de Jupyter para el Análisis Exploratorio de Datos (EDA) relacionado con el filtro de agua.

