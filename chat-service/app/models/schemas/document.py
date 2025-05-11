from datetime import datetime
from typing import Optional, ClassVar
from pydantic import BaseModel, Field as PydanticField
from odmantic import Model, Field as OdmanticField, ObjectId

# ---------- Pydantic schemas ----------

class DocumentBase(BaseModel):
    filename: str
    content_type: str = "application/json"
    created_at: datetime = PydanticField(default_factory=datetime.utcnow)

class DocumentCreate(BaseModel):
    filename: str
    content_type: str = "application/json"
    created_at: Optional[datetime] = None

class Document(BaseModel):
    id: ObjectId = PydanticField(alias="_id")
    filename: str
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------- ODMantic model ----------

class DocumentInDB(Model):
    collection_name: ClassVar[str] = "documents"  # ✅ MUST use ClassVar

    filename: str
    content_type: str
    created_at: datetime = OdmanticField(default_factory=datetime.utcnow)
