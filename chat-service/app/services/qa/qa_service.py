from typing import List, Optional
from fastapi import HTTPException
from langchain_openai import OpenAI
from langchain.chains import RetrievalQA
from app.services.document.document_service import DocumentService
from app.services.chat.chat_service import ChatService
from app.models.schemas.chat import Message

class QAService:
    def __init__(self):
        self.document_service = DocumentService()
        self.chat_service = ChatService()
        self.llm = OpenAI(temperature=0)
        
    async def ask_question(self, chat_id: str, question: str) -> Message:
        """
        Ask a question to the chatbot
        
        Args:
            chat_id: The id of the chat
            question: The question to ask the chatbot
            
        Returns:
            A message with the markdown formatted answer
        """
        # Get chat and document
        chat = await self.chat_service.get_chat(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        # Get document vector store
        vectorstore = await self.document_service.get_document_vector_store(str(chat.document_id))
        
        # Create QA chain with context
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="map_reduce",
            retriever=vectorstore.as_retriever(),
            return_source_documents=True
        )
        
        # Get answer
        result = qa_chain({"query": question})
        raw_answer = result["result"]
        
        # Format answer with markdown
        formatted_answer = f"""# Answer

{raw_answer}

---
*Generated by AI based on the provided documents*"""
        
        # Create message
        message = Message(
            question=question,
            answer=formatted_answer
        )
        
        # Save message to chat
        await self.chat_service.add_message(chat_id, message)
        
        return message 