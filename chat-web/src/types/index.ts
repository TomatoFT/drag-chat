export interface Message {
  question: string;
  answer: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  document_id: string;
  created_at: string;
  messages: Message[];
}

export interface Document {
  _id: string;
  filename: string;
  content_type: string;
  created_at: string;
} 