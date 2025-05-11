from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    engine: AIOEngine = None

mongodb = MongoDB()

async def connect_to_mongo():
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongodb.engine = AIOEngine(
        client=mongodb.client,
        database=settings.MONGODB_DB
    )

async def close_mongo_connection():
    mongodb.client.close() 