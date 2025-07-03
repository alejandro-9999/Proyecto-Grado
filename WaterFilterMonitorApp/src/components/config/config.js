// src/config/config.js
export const BASE_IP = '192.168.1.12';
export const WS_PORT = 8000;
export const WS_URL = `ws://${BASE_IP}:${WS_PORT}/ws`;
export const PREDICTION_URL = `http://${BASE_IP}:${WS_PORT}/api/efficiency/projection`;

