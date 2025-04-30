import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:password@localhost:27017")
DATABASE_NAME = "water_filter"
COLLECTION_NAME = "sensor_data"
