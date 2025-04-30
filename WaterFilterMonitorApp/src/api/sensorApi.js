import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web'
  ? 'http://192.168.1.12:8000'
  : 'http://192.168.1.12:8000';

export async function fetchLatestSensorData() {
  try {
    const response = await fetch(`${API_URL}/data/`);
    if (!response.ok) throw new Error('Error en la solicitud');
    const data = await response.json();
    return data;
  } catch (err) {
    alert('Error al cargar los datos del sensor'+err.message);
    console.error(err);
    return null;
  }
}
