from typing import List, Optional
from fastapi import HTTPException
from app.models.schemas.chat import ChatCreate, ChatUpdate, ChatInDB, Message
from app.models.db.mongodb import mongodb
from bson import ObjectId

class ChatService:
    async def create_chat(self, chat_data: ChatCreate) -> ChatInDB:
        try:
            chat = ChatInDB(
                name=chat_data.name,
                document_id=ObjectId(chat_data.document_id)
            )
            return await mongodb.engine.save(chat)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
            
    async def get_chat(self, chat_id: str) -> Optional[ChatInDB]:
        try:
            return await mongodb.engine.find_one(ChatInDB, ChatInDB.id == ObjectId(chat_id))
        except Exception as e:
            raise HTTPException(status_code=404, detail="Chat not found")
            
    async def get_chats(self) -> List[ChatInDB]:
        return await mongodb.engine.find(ChatInDB)
        
    async def update_chat(self, chat_id: str, chat_data: ChatUpdate) -> ChatInDB:
        chat = await self.get_chat(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        chat.name = chat_data.name
        return await mongodb.engine.save(chat)
        
    async def delete_chat(self, chat_id: str):
        chat = await self.get_chat(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        await mongodb.engine.remove(chat)
        
    async def add_message(self, chat_id: str, message: Message) -> ChatInDB:
        chat = await self.get_chat(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        chat.messages.append(message.model_dump())
        return await mongodb.engine.save(chat) 