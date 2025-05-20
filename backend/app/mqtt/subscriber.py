import asyncio
import json
import os
import time
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
    
    # Prepare full document
    document = {
        **payload,
        "filter_operating_hours": round(operating_hours, 2)
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