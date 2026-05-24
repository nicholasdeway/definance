from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    user_id: str
    user_name: str
    phone_number: str
    message: str
    token: str
    audio_url: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
