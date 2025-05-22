from fastapi import WebSocket
from typing import Dict, List, Any
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.latest_data: Dict[str, Any] = None

    @staticmethod
    def clean_data(data):
        return {
            k: str(v) if isinstance(v, ObjectId) else v
            for k, v in data.items()
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        if self.latest_data:
            await websocket.send_json(self.latest_data)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        self.latest_data = self.clean_data(data)
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(self.latest_data)
            except Exception:
                self.disconnect(connection)

# Singleton instance
manager = ConnectionManager()
