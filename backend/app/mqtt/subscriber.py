import asyncio
import json
import os
import time
import numpy as np
from datetime import datetime
import paho.mqtt.client as mqtt
from app.core.config import MONGO_URL, DATABASE_NAME, COLLECTION_NAME
from motor.motor_asyncio import AsyncIOMotorClient
from app.websockets.manager import manager

# MongoDB setup
MONGO_CLIENT = AsyncIOMotorClient(MONGO_URL)
db = MONGO_CLIENT[DATABASE_NAME]
collection = db[COLLECTION_NAME]
loop = asyncio.get_event_loop()

# MQTT Configuration
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds

# Global to cache the initial timestamp
initial_timestamp = None

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected to MQTT Broker with reason code {reason_code}")
    client.subscribe("sensores/#")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        
        # Add timestamp if missing
        if "timestamp" not in payload:
            payload["timestamp"] = datetime.utcnow().isoformat()
        
        # Wrap save and broadcast in coroutine
        asyncio.run_coroutine_threadsafe(process_and_save(payload), loop)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def calculate_efficiency(operating_hours, data):
    """
    Calculate filter efficiency based on operating hours and sensor data
    The efficiency decreases with operating time and is affected by water quality
    """
    # Base efficiency starts at 100% and decreases over time
    base_efficiency = 100 - (operating_hours * 0.1)
    
    # Add some randomness to simulate real-world variations
    # Use the input-output differential as a factor 
    # Higher differentials between input and output suggest better filter performance
    try:
        # Use water quality parameters to adjust efficiency
        ph_factor = 1.0 - (abs(data.get('in_ph', 7.0) - data.get('out_ph', 7.0)) / 10)
        turbidity_factor = 2.0 * abs(data.get('in_turbidity', 2.0) - data.get('out_turbidity', 1.0)) / 5.0
        conductivity_factor = abs(data.get('in_conductivity', 400) - data.get('out_conductivity', 300)) / 500
        
        # Add random noise
        random_factor = np.random.normal(0, 1.5)
        
        # Calculate final efficiency
        efficiency = base_efficiency + random_factor + (turbidity_factor * 5) - (ph_factor * 2) + (conductivity_factor * 3)
        
        # Ensure efficiency stays within valid range (0-100%)
        efficiency = max(0, min(100, efficiency))
        
        return round(efficiency, 2)
    except Exception as e:
        print(f"Error calculating efficiency: {e}")
        # Return a fallback efficiency calculation if there's an error
        return max(0, min(100, 100 - (operating_hours * 0.1) + np.random.normal(0, 1.5)))

async def process_and_save(payload):
    global initial_timestamp
    
    # Parse timestamp
    try:
        current_ts = datetime.fromisoformat(payload["timestamp"])
    except Exception:
        current_ts = datetime.utcnow()
    
    # Get initial timestamp from DB if not cached
    if initial_timestamp is None:
        first_doc = await collection.find_one(sort=[("timestamp", 1)])
        if first_doc:
            initial_timestamp = datetime.fromisoformat(first_doc["timestamp"])
        else:
            initial_timestamp = current_ts  # First ever message
    
    # Calculate operating time in hours
    delta = current_ts - initial_timestamp
    operating_hours = delta.total_seconds() / 3600
    
    # Calculate efficiency based on operating hours and sensor data
    efficiency = calculate_efficiency(operating_hours, payload)
    
    # Prepare full document
    document = {
        **payload,
        "filter_operating_hours": round(operating_hours, 2),
        "eficiencia": efficiency
    }
    
    # Save to DB
    await save_to_db(document)
    
    # Broadcast via WebSocket
    await manager.broadcast("data", document)

async def save_to_db(data):
    try:
        await collection.insert_one(data)
    except Exception as e:
        print(f"Error saving to database: {e}")

def start_mqtt():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    
    connected = False
    retries = 0
    
    while not connected and retries < MAX_RETRIES:
        try:
            print(f"Attempting to connect to MQTT broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT} (attempt {retries+1}/{MAX_RETRIES})")
            client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
            connected = True
            print("Successfully connected to MQTT broker")
        except Exception as e:
            retries += 1
            print(f"Failed to connect to MQTT broker: {e}")
            if retries < MAX_RETRIES:
                print(f"Retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                print("Maximum retries reached. Could not connect to MQTT broker.")
                raise
    
    client.loop_start()
    return client