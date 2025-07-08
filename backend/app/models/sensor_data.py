from pydantic import BaseModel
from datetime import datetime

class SensorData(BaseModel):
    timestamp: datetime
    ph: float
    conductividad: float
    turbidez: float
    color: float
    source: str  # "entrada" o "salida"
