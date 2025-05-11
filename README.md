# RAG Chatbot Backend

Backend service cho ứng dụng chatbot sử dụng RAG (Retrieval-Augmented Generation).

## Tính năng

- Upload và xử lý tài liệu (PDF, DOCX, TXT)
- Tạo và quản lý các phiên chat
- Hỏi đáp dựa trên nội dung tài liệu
- Lưu trữ lịch sử chat

## Yêu cầu

- Python 3.10+
- MongoDB
- OpenAI API Key

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd rag-chatbot-be
```

2. Tạo và kích hoạt môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
.\venv\Scripts\activate  # Windows
```

3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

4. Cập nhật file `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=mongodb://admin:password@localhost:27017
MONGODB_DB=rag_chatbot
```

5. Khởi động MongoDB:
```bash
docker-compose up -d
```

## Chạy ứng dụng

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8123
```

Truy cập API documentation tại: http://localhost:8123/docs

## API Endpoints

### Health Check
- GET `/api/v1/health`

### Documents
- POST `/api/v1/documents/upload` - Upload tài liệu

### Chats
- POST `/api/v1/chats` - Tạo chat mới
- GET `/api/v1/chats` - Lấy danh sách chats
- GET `/api/v1/chats/{chat_id}` - Lấy thông tin chat
- PUT `/api/v1/chats/{chat_id}` - Cập nhật tên chat
- DELETE `/api/v1/chats/{chat_id}` - Xóa chat

### QA
- POST `/api/v1/qa/ask` - Hỏi câu hỏi trong chat

## Cấu trúc dự án

```
.
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   └── routers/
│   ├── models/
│   │   ├── schemas/
│   │   └── db/
│   ├── services/
│   │   ├── document/
│   │   ├── chat/
│   │   └── qa/
│   └── core/
├── data/
│   └── vector_store/
├── tests/
├── .env
├── docker-compose.yml
├── main.py
├── requirements.txt
└── README.md
``` 