from fastapi import APIRouter
from app.models.sensor_data import SensorData
from app.core.config import MONGO_URL, DATABASE_NAME, COLLECTION_NAME
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

@router.post("/data/")
async def insert_data(sensor_data: SensorData):
    await collection.insert_one(sensor_data.dict())
    return {"message": "Data inserted successfully"}

@router.get("/data/")
async def get_data():
    data = await collection.find().to_list(1000)
    for d in data:
        d["_id"] = str(d["_id"])
    return data