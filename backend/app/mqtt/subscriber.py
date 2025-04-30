import asyncio
import json
import os
import time
import paho.mqtt.client as mqtt
from app.core.config import MONGO_URL, DATABASE_NAME, COLLECTION_NAME
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_CLIENT = AsyncIOMotorClient(MONGO_URL)
db = MONGO_CLIENT[DATABASE_NAME]
collection = db[COLLECTION_NAME]
loop = asyncio.get_event_loop()

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected to MQTT Broker with reason code {reason_code}")
    client.subscribe("sensores/#")


def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    payload["source"] = msg.topic.split('/')[-1]  # entrada o salida
    asyncio.run_coroutine_threadsafe(save_to_db(payload), loop)

async def save_to_db(data):
    await collection.insert_one(data)

def start_mqtt():
    # Use VERSION2 of the API to fix deprecation warning
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    
    # Implement retry logic
    connected = False
    retries = 0

    def on_message_inner(client, userdata, msg):
        payload = json.loads(msg.payload.decode())
        payload["source"] = msg.topic.split('/')[-1]
        asyncio.run_coroutine_threadsafe(save_to_db(payload), loop)

    client.on_message = on_message_inner
    
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
    return client  # Return the client so it can be managed by the application lifecycle