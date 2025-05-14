// api/websocketService.js
import { Platform } from 'react-native';

// Use same IP as your API, but with ws:// protocol instead of http://
// Adjust according to your server address
const WS_URL = Platform.OS === 'web'
  ? 'ws://192.168.1.12:8000/ws'
  : 'ws://192.168.1.12:8000/ws';

class WebSocketService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.listeners = [];
    this.reconnectInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.websocket) {
      this.disconnect();
    }

    console.log('Connecting to WebSocket server...');
    this.websocket = new WebSocket(WS_URL);

    this.websocket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.clearReconnectInterval();
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.attemptReconnect();
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (!this.reconnectInterval) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.reconnectInterval = setInterval(() => {
          if (!this.isConnected) {
            this.connect();
          } else {
            this.clearReconnectInterval();
          }
        }, 5000);
      }
    }
  }

  clearReconnectInterval() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.isConnected = false;
      this.clearReconnectInterval();
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }
}

// Export as singleton
export default new WebSocketService();