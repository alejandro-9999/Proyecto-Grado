import time
import json
import random
import os
import paho.mqtt.client as mqtt

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "127.0.0.1")  # or the actual IP address
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)

while True:
    data_entrada = {
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ'),
        "ph": round(random.uniform(6.5, 8.0), 2),
        "conductividad": random.randint(300, 600),
        "turbidez": random.uniform(0, 5),
        "color": random.uniform(0, 1)
    }

    data_salida = {
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ'),
        "ph": round(random.uniform(7.0, 7.5), 2),
        "conductividad": random.randint(100, 300),
        "turbidez": random.uniform(0, 2),
        "color": random.uniform(0, 0.5)
    }

    client.publish("sensores/entrada", json.dumps(data_entrada))
    client.publish("sensores/salida", json.dumps(data_salida))

    time.sleep(5)  # Publica cada 5 segundos
