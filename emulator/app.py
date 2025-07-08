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
PUBLISH_INTERVAL = float(os.getenv("PUBLISH_INTERVAL", 2.5))  # Default to 2.5 seconds

# Initial values - consolidated into a single structure
current_values = {
    "in_ph": 7.2,
    "in_conductivity": 450,
    "in_turbidity": 2.5,
    "in_color": 0.5,
    "out_ph": 7.3,
    "out_conductivity": 200,
    "out_turbidity": 1.0,
    "out_color": 0.2
}

# Variance ranges - how much each reading can change
variance = {
    "in_ph": 0.1,
    "in_conductivity": 20,
    "in_turbidity": 0.3,
    "in_color": 0.1,
    "out_ph": 0.1,
    "out_conductivity": 20,
    "out_turbidity": 0.3,
    "out_color": 0.1
}

# Bounds - realistic limits for each parameter
bounds = {
    "in_ph": (6.0, 9.0),
    "in_conductivity": (100, 800),
    "in_turbidity": (0, 10),
    "in_color": (0, 2),
    "out_ph": (6.0, 9.0),
    "out_conductivity": (100, 800),
    "out_turbidity": (0, 10),
    "out_color": (0, 2)
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
def generate_sensor_data():
    global current_values
    
    # Update each parameter with realistic drift
    for param in current_values:
        # Apply small random drift
        change = random.uniform(-variance[param], variance[param])
        new_value = current_values[param] + change
        
        # Keep values within realistic bounds
        min_val, max_val = bounds[param]
        new_value = max(min_val, min(new_value, max_val))
        
        # Update the current value
        current_values[param] = new_value
    
    # Create sensor data dict
    data = {
        "timestamp": datetime.now().isoformat(),
        "in_ph": round(current_values["in_ph"], 2),
        "in_conductivity": int(current_values["in_conductivity"]),
        "in_turbidity": round(current_values["in_turbidity"], 2),
        "in_color": round(current_values["in_color"], 2),
        "out_ph": round(current_values["out_ph"], 2),
        "out_conductivity": int(current_values["out_conductivity"]),
        "out_turbidity": round(current_values["out_turbidity"], 2),
        "out_color": round(current_values["out_color"], 2)
    }
    
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
            # Generate and publish consolidated data
            data = generate_sensor_data()
            client.publish("sensores/data", json.dumps(data))
            
            print(f"Published data: pH in={data['in_ph']}, pH out={data['out_ph']}, " 
                  f"Conductivity in={data['in_conductivity']}, Conductivity out={data['out_conductivity']}")
            
            # Wait for next interval
            time.sleep(PUBLISH_INTERVAL)
    except Exception as e:
        print(f"Error in simulator: {e}")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_simulator()