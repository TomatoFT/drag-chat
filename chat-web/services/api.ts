import axios from 'axios';
import { Chat, Document, Message } from '../types';

const API_BASE_URL = 'http://localhost:8123';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Document API
export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/v1/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Chat API
export const getChats = async (): Promise<Chat[]> => {
  const response = await api.get('/api/v1/chats');
  return response.data;
};

export const getChat = async (chatId: string): Promise<Chat> => {
  const response = await api.get(`/api/v1/chats/${chatId}`);
  return response.data;
};

export const createChat = async (name: string, documentId: string): Promise<Chat> => {
  const response = await api.post('/api/v1/chats', {
    name,
    document_id: documentId,
  });
  return response.data;
};

export const updateChat = async (chatId: string, name: string): Promise<Chat> => {
  const response = await api.put(`/api/v1/chats/${chatId}`, {
    name,
  });
  return response.data;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  await api.delete(`/api/v1/chats/${chatId}`);
};

// QA API
export const askQuestion = async (chatId: string, question: string): Promise<Message> => {
  const response = await api.post('/api/v1/qa/ask', {
    chat_id: chatId,
    question,
  });
  return response.data;
}; 