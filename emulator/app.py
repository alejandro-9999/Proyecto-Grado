# sensor_simulator.py
import time
import json
import random
import os
import paho.mqtt.client as mqtt
import signal
import sys
from datetime import datetime

# Configuration
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "127.0.0.1")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
PUBLISH_INTERVAL = float(os.getenv("PUBLISH_INTERVAL", 2.5))  # Default to 1 second for more real-time feel

# Initial values - starting with baseline values
current_values = {
    "entrada": {
        "ph": 7.2,
        "conductividad": 450,
        "turbidez": 2.5,
        "color": 0.5
    },
    "salida": {
        "ph": 7.3,
        "conductividad": 200,
        "turbidez": 1.0,
        "color": 0.2
    }
}

# Variance ranges - how much each reading can change
variance = {
    "ph": 0.1,           # pH typically varies slightly
    "conductividad": 20,  # Conductivity can fluctuate more
    "turbidez": 0.3,      # Turbidity changes gradually
    "color": 0.1         # Color changes slightly
}

# Bounds - realistic limits for each parameter
bounds = {
    "ph": (6.0, 9.0),
    "conductividad": (100, 800),
    "turbidez": (0, 10),
    "color": (0, 2)
}

# Connect to MQTT broker
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def connect_mqtt():
    try:
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
        print(f"Connected to MQTT broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        client.loop_start()
        return True
    except Exception as e:
        print(f"Failed to connect to MQTT broker: {e}")
        return False

# Generate realistic sensor data with trends
def generate_sensor_data(source):
    global current_values
    
    # Get current values for this source
    values = current_values[source]
    
    # Update each parameter with realistic drift
    for param in values:
        # Apply small random drift
        change = random.uniform(-variance[param], variance[param])
        new_value = values[param] + change
        
        # Keep values within realistic bounds
        min_val, max_val = bounds[param]
        new_value = max(min_val, min(new_value, max_val))
        
        # Update the current value
        values[param] = new_value
    
    # Create sensor data dict
    data = {
        "timestamp": datetime.now().isoformat(),
        "ph": round(values["ph"], 2),
        "conductividad": int(values["conductividad"]),
        "turbidez": round(values["turbidez"], 2),
        "color": round(values["color"], 2)
    }
    
    # Save the current values
    current_values[source] = values
    
    return data

# Handle graceful shutdown
def signal_handler(sig, frame):
    print("Shutting down sensor simulator...")
    client.loop_stop()
    client.disconnect()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Main simulation loop
def run_simulator():
    if not connect_mqtt():
        print("Exiting due to MQTT connection failure")
        return

    print(f"Sensor simulator running. Publishing data every {PUBLISH_INTERVAL} seconds...")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            # Generate and publish entrada data
            data_entrada = generate_sensor_data("entrada")
            client.publish("sensores/entrada", json.dumps(data_entrada))
            print(f"Published entrada data: pH={data_entrada['ph']}, Conductivity={data_entrada['conductividad']}")
            
            # Generate and publish salida data
            data_salida = generate_sensor_data("salida")
            client.publish("sensores/salida", json.dumps(data_salida))
            print(f"Published salida data: pH={data_salida['ph']}, Conductivity={data_salida['conductividad']}")
            
            # Wait for next interval
            time.sleep(PUBLISH_INTERVAL)
            
    except Exception as e:
        print(f"Error in simulator: {e}")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_simulator()