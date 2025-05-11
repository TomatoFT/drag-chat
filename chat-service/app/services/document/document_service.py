from typing import List, Optional
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from app.models.schemas.document import DocumentCreate, DocumentInDB
from app.models.db.mongodb import mongodb
from datetime import datetime
import os
import uuid
from odmantic import ObjectId
import logging

log = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = CharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
    async def process_document(self, file: UploadFile) -> DocumentInDB:
        # Create temp file
        temp_path = f"./tmp/{uuid.uuid4()}_{file.filename}"
        try:
            with open(temp_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Load document based on file type
            if file.filename.endswith('.pdf'):
                loader = PyPDFLoader(temp_path)
                log.info(f"Loaded PDF document: {temp_path}")
            elif file.filename.endswith('.docx'):
                loader = Docx2txtLoader(temp_path)
            else:
                loader = TextLoader(temp_path)
                
            documents = loader.load()
            chunks = self.text_splitter.split_documents(documents)
            
            # Create document record first to get ID
            document = DocumentCreate(
                filename=file.filename,
                content_type="application/json",
                created_at=datetime.now()            
            )
            db_document = await mongodb.engine.save(DocumentInDB(**document.dict()))
            
            # Create and save vector store using document ID
            vectorstore = FAISS.from_documents(chunks, self.embeddings)
            store_path = os.path.join("data/vector_store", str(db_document.id))
            print(f"Store path: {store_path}")
            vectorstore.save_local(store_path)
            
            return db_document
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    async def get_document(self, document_id: str) -> Optional[DocumentInDB]:
        try:
            return await mongodb.engine.find_one(DocumentInDB, DocumentInDB.id == ObjectId(document_id))
        except Exception as e:
            raise HTTPException(status_code=404, detail="Document not found")
            
    async def get_document_vector_store(self, document_id: str):
        document = await self.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        print(f"Document found: {document}")
        store_path = os.path.join("data/vector_store", str(document.id))
        print(f"Document found: {document.id}")
        if not os.path.exists(store_path):
            raise HTTPException(status_code=404, detail="Vector store not found")
            
        return FAISS.load_local(store_path, self.embeddings) 