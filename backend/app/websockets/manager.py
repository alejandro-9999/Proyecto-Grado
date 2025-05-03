from fastapi import WebSocket
from typing import Dict, List, Any
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.latest_data: Dict[str, Any] = {
            "entrada": None,
            "salida": None
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send the latest data immediately upon connection
        if self.latest_data["entrada"]:
            await websocket.send_json({"source": "entrada", "data": self.latest_data["entrada"]})
        if self.latest_data["salida"]:
            await websocket.send_json({"source": "salida", "data": self.latest_data["salida"]})

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, source: str, data: dict):
        # Store the latest data
        self.latest_data[source] = data
        
        # Broadcast to all connected clients
        message = {"source": source, "data": data}
        for connection in self.active_connections.copy():  # Create a copy to avoid modification during iteration
            try:
                await connection.send_json(message)
            except Exception:
                # Connection might be closed
                self.disconnect(connection)

# Singleton instance
manager = ConnectionManager()