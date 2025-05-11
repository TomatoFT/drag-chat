import { Chat, ChatCreate, ChatUpdate, Document, Message } from '../types/api';

const API_URL = 'http://localhost:8000'; // Replace with your API URL

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const api = {
  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      throw new APIError('Health check failed');
    }
  },

  // Document endpoints
  async uploadDocument(file: FormData): Promise<Document> {
    try {
      const response = await fetch(`${API_URL}/api/v1/documents/upload`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new APIError('Failed to upload document');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Document upload failed');
    }
  },

  // Chat endpoints
  async getChats(): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats`);
      
      if (!response.ok) {
        throw new APIError('Failed to fetch chats');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Failed to get chats');
    }
  },

  async createChat(data: ChatCreate): Promise<Chat> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new APIError('Failed to create chat');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Chat creation failed');
    }
  },

  async getChat(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`);

      if (!response.ok) {
        throw new APIError('Failed to fetch chat');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Failed to get chat');
    }
  },

  async updateChat(chatId: string, data: ChatUpdate): Promise<Chat> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new APIError('Failed to update chat');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Chat update failed');
    }
  },

  async deleteChat(chatId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new APIError('Failed to delete chat');
      }
    } catch (error) {
      throw new APIError('Chat deletion failed');
    }
  },

  // Message endpoints
  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new APIError('Failed to send message');
      }

      return response.json();
    } catch (error) {
      throw new APIError('Message sending failed');
    }
  },
}; 