import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:password@localhost:27017")
DATABASE_NAME = "water_filter"
COLLECTION_NAME = "sensor_data"


async def fetch_sensor_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Fetch consolidated data (no separation by source)
    cursor = collection.find({})
    data = await cursor.to_list(length=None)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # No need to join dataframes as data is already consolidated
    # Just ensure numeric columns are properly converted
    df = df.apply(pd.to_numeric, errors='ignore')
    
    # Sort by operating hours
    if 'filter_operating_hours' in df.columns:
        df.sort_values("filter_operating_hours", inplace=True)
    elif 'timestamp' in df.columns:
        # Fallback to timestamp if operating hours not available
        df.sort_values("timestamp", inplace=True)
    
    # Make sure we drop any NaN values
    df = df.dropna(subset=['in_ph', 'out_ph'])  # Minimal requirement
    
    return df.reset_index(drop=True)

def load_real_data():
    return asyncio.run(fetch_sensor_data())