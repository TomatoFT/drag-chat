from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from odmantic import Model, ObjectId, Field

class Message(BaseModel):
    question: str
    answer: str
    timestamp: datetime = datetime.now(timezone.utc)

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        if isinstance(data["timestamp"], datetime):
            data["timestamp"] = data["timestamp"].isoformat()
        return data

class ChatBase(BaseModel):
    name: str
    document_id: ObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    messages: List[Message] = []

class ChatCreate(BaseModel):
    name: str
    document_id: str

class ChatUpdate(BaseModel):
    name: str

class Chat(ChatBase):
    id: ObjectId = Field(default_factory=ObjectId)
    
    class Config:
        from_attributes = True

class ChatInDB(Model):
    name: str
    document_id: ObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    messages: List[Message] = []
    
    model_config = {
        "collection": "chats"
    }