from fastapi import APIRouter
from pydantic import BaseModel
from app.services.qa.qa_service import QAService
from app.models.schemas.chat import Message

router = APIRouter()
qa_service = QAService()

class QuestionRequest(BaseModel):
    chat_id: str
    question: str

@router.post("/ask", response_model=Message)
async def ask_question(request: QuestionRequest):
    return await qa_service.ask_question(request.chat_id, request.question) 