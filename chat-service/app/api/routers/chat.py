from fastapi import APIRouter, HTTPException
from typing import List
from app.services.chat.chat_service import ChatService
from app.models.schemas.chat import Chat, ChatCreate, ChatUpdate

router = APIRouter()
chat_service = ChatService()

@router.post("", response_model=Chat)
async def create_chat(chat_data: ChatCreate):
    return await chat_service.create_chat(chat_data)

@router.get("", response_model=List[Chat])
async def get_chats():
    return await chat_service.get_chats()

@router.get("/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str):
    return await chat_service.get_chat(chat_id)

@router.put("/{chat_id}", response_model=Chat)
async def update_chat(chat_id: str, chat_data: ChatUpdate):
    return await chat_service.update_chat(chat_id, chat_data)

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str):
    await chat_service.delete_chat(chat_id)
    return {"message": "Chat deleted successfully"} 