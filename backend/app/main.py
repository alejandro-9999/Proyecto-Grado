from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import traceback
from app.api import routes
from app.api import websocket_routes
from app.mqtt.subscriber import start_mqtt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Water Quality Monitoring API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
    )

# Include API routes
app.include_router(routes.router, prefix="/api")

# Include WebSocket routes - NO PREFIX to ensure the path is truly at /ws
app.include_router(websocket_routes.router)

# Debug route to verify server is working
@app.get("/")
async def root():
    return {"status": "online", "message": "Water Quality Monitoring API is running"}

# Debug route to check WebSocket availability
@app.get("/ws-info")
async def websocket_info():
    from app.websockets.manager import manager
    return {
        "websocket_path": "/ws",
        "active_connections": len(manager.active_connections),
        "routes": [
            {"path": route.path, "name": route.name, "methods": route.methods}
            for route in app.routes
        ]
    }

# MQTT client instance
mqtt_client = None

@app.on_event("startup")
async def startup_event():
    global mqtt_client
    logger.info("Starting FastAPI application...")
    
    try:
        # Start MQTT client
        mqtt_client = start_mqtt()
        logger.info("MQTT client started successfully")
    except Exception as e:
        logger.error(f"Error starting MQTT client: {e}")
        logger.error(traceback.format_exc())

@app.on_event("shutdown")
async def shutdown_event():
    global mqtt_client
    logger.info("Shutting down FastAPI application...")
    
    if mqtt_client:
        logger.info("Stopping MQTT client...")
        mqtt_client.loop_stop()
        mqtt_client.disconnect()