from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket connection attempt received")
    await manager.connect(websocket)
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Keep the connection alive, waiting for client messages
            data = await websocket.receive_text()
            logger.info(f"Received message: {data}")
            
            # You could add custom handling for client messages here
            # For example:
            # try:
            #     json_data = json.loads(data)
            #     if "command" in json_data:
            #         # Handle commands from client
            #         pass
            # except Exception as e:
            #     logger.error(f"Error processing message: {e}")
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)