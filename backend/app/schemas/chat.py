from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    recipient_id: int
    content: str
    image_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    image_url: Optional[str] = None
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    user_id: int
    full_name: str
    profile_picture: Optional[str] = None
    last_message: str
    last_message_time: datetime
    unread_count: int
