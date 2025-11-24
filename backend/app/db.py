# backend/app/db.py
from odmantic import AIOEngine
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv() 

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise RuntimeError("MONGODB_URI not set in .env")

client = AsyncIOMotorClient(MONGO_URI)

engine = AIOEngine(client, database="daymate")
