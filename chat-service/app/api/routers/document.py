from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.document.document_service import DocumentService
from app.models.schemas.document import Document, DocumentCreate
import json

router = APIRouter()
document_service = DocumentService()

@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...)
):
    return await document_service.process_document(file) 

