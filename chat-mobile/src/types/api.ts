export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  document_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  chat_id: string;
  created_at: string;
}

export interface ChatCreate {
  document_id: string;
  title?: string;
}

export interface ChatUpdate {
  title: string;
}

export interface MessageCreate {
  content: string;
}

export interface APIError {
  detail: string;
} 