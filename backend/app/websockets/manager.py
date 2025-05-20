from fastapi import WebSocket
from typing import Dict, List, Any
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.latest_data: Dict[str, Any] = None  # Will store the latest sensor data

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send the latest data immediately upon connection if available
        if self.latest_data:
            await websocket.send_json(self.latest_data)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        # Store the latest data
        self.latest_data = data
        print("hola test")
        
        # Broadcast to all connected clients
        for connection in self.active_connections.copy():  # Create a copy to avoid modification during iteration
            try:
                await connection.send_json(data)
            except Exception:
                # Connection might be closed
                self.disconnect(connection)

# Singleton instance
manager = ConnectionManager()
