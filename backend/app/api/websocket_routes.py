from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URL, DATABASE_NAME, COLLECTION_NAME
import json
import asyncio
import logging
import asyncio

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global latest_record
    await manager.connect(websocket)
    logger.info("WebSocket connection established")

    async def poll_changes():
        nonlocal latest_record
        try:
            while True:
                latest = await collection.find_one(sort=[("timestamp", -1)])
                if latest:
                    latest["_id"] = str(latest["_id"])
                    if latest_record is None or latest["_id"] != latest_record.get("_id"):
                        latest_record = latest
                        await manager.broadcast("data", latest_record)
                        logger.info("Broadcasted new data from polling")
                await asyncio.sleep(2)  # Ajusta el intervalo según tu necesidad
        except Exception as e:
            logger.error(f"Polling error: {e}")

    poll_task = asyncio.create_task(poll_changes())

    try:
        while True:
            await websocket.receive_text()  # Mantiene viva la conexión
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        manager.disconnect(websocket)
        poll_task.cancel()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
        poll_task.cancel()