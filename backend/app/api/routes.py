# app/api/routes.py
from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse

from app.models.sensor_data import SensorData
from app.core.config import MONGO_URL, DATABASE_NAME, COLLECTION_NAME
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import json
from bson import ObjectId
import os
from app.lm.data_loader import load_real_data
from app.lm.train import train_lstm_model, simulate_data
from app.lm.predict import predict_future_efficiency
from app.lm.projection import get_efficiency_projection_data
import logging
from app.lm.load_mode import load_trained_model

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB client
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Custom JSON encoder to handle ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

@router.post("/data/")
async def insert_data(sensor_data: SensorData):
    """
    Insert new sensor data into the database
    """
    result = await collection.insert_one(sensor_data.dict())
    return {"id": str(result.inserted_id), "message": "Data inserted successfully"}

@router.get("/data/")
async def get_data(limit: int = 100):
    """
    Get the most recent sensor data
    """
    try:
        # Get most recent data, sorted by timestamp in descending order
        cursor = collection.find().sort("timestamp", -1).limit(limit)
        data = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for d in data:
            d["_id"] = str(d["_id"])
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/data/source/{source}")
async def get_data_by_source(source: str, limit: int = 100):
    """
    Get the most recent sensor data for a specific source (entrada/salida)
    """
    if source not in ["entrada", "salida"]:
        raise HTTPException(status_code=400, detail="Source must be 'entrada' or 'salida'")
    
    try:
        cursor = collection.find({"source": source}).sort("timestamp", -1).limit(limit)
        data = await cursor.to_list(length=limit)
        
        for d in data:
            d["_id"] = str(d["_id"])
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/data/stats")
async def get_stats():
    """
    Get statistics about the sensor data
    """
    try:
        # Count total records
        total_count = await collection.count_documents({})
        
        # Count by source
        entrada_count = await collection.count_documents({"source": "entrada"})
        salida_count = await collection.count_documents({"source": "salida"})
        
        # Get latest timestamp
        latest = await collection.find_one(sort=[("timestamp", -1)])
        latest_timestamp = latest["timestamp"] if latest else None
        
        return {
            "total_records": total_count,
            "entrada_records": entrada_count,
            "salida_records": salida_count,
            "latest_timestamp": latest_timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
@router.get("/efficiency/projection")
def get_efficiency_projection():

    df_real = load_real_data()
    
    df = simulate_data()
    
    print(os.path.dirname(__file__))
    logger.info(os.path.dirname(__file__))
    
    if not os.path.exists("/backend/app/lm/models/lstm_model.h5"):
        print("🔁 Entrenando modelo LSTM...")
        model, scaler_X, scaler_y, features_columns = train_lstm_model(df)
    else:
        print("✅ Cargando modelo ya entrenado...")
        model, scaler_X, scaler_y, features_columns = load_trained_model(path="app/lm/models")
        
        

    if df_real.empty:
        return JSONResponse(status_code=404, content={"message": "No real data found"})

    df_real = df_real.drop(columns=['_id', 'timestamp'], errors='ignore')
    column_list = list(features_columns) + ['eficiencia']
    df_real = df_real[column_list]

    eficiencia_real, horas_futuras = predict_future_efficiency(
        model, df_real, scaler_X, scaler_y, features_columns, df
    )

    result = get_efficiency_projection_data(df_real, eficiencia_real, horas_futuras, "Predicción Eficiencia del Filtro")
    return result