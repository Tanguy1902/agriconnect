from fastapi import APIRouter, Depends, HTTPException, WebSocket, UploadFile, File, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Dict
from app.api import deps
from app.schemas import chat as chat_schema
from app.models import message as message_model
from app.models import user as user_model
from app.database import get_db
import json
import os
import uuid
import shutil
import time
from app.utils.encryption import encrypt_message, decrypt_message
from fastapi.responses import FileResponse
from app.config import settings
from jose import jwt, JWTError

router = APIRouter()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # Map user_id to their active WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            # Convert datetime to string for JSON serialization
            if "timestamp" in message and not isinstance(message["timestamp"], str):
                message["timestamp"] = message["timestamp"].isoformat()
            await websocket.send_text(json.dumps(message))

manager = ConnectionManager()

# Simple Rate Limiting
# user_id -> last_message_time
last_message_times: Dict[int, float] = {}
RATE_LIMIT_SECONDS = 2.0 # 1 message every 2 seconds

@router.post("/", response_model=chat_schema.MessageResponse)
async def send_message(
    message: chat_schema.MessageCreate,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Send a message to another user"""
    # Rate limiting check
    now = time.time()
    if current_user.id in last_message_times:
        elapsed = now - last_message_times[current_user.id]
        if elapsed < RATE_LIMIT_SECONDS:
            raise HTTPException(
                status_code=429, 
                detail=f"Too many messages. Please wait {RATE_LIMIT_SECONDS - elapsed:.1f}s"
            )
    
    last_message_times[current_user.id] = now
    # Verify recipient exists
    recipient = db.query(user_model.User).filter(user_model.User.id == message.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create message
    db_message = message_model.Message(
        sender_id=current_user.id,
        recipient_id=message.recipient_id,
        content=encrypt_message(message.content),
        image_url=message.image_url
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Real-time notification via WebSocket
    message_data = {
        "id": db_message.id,
        "sender_id": db_message.sender_id,
        "recipient_id": db_message.recipient_id,
        "content": decrypt_message(db_message.content),
        "image_url": db_message.image_url,
        "timestamp": db_message.timestamp,
        "is_read": db_message.is_read
    }
    
    # Notify recipient
    await manager.send_personal_message(message_data, message.recipient_id)
    
    # Notify sender (optional, if they have multiple tabs open)
    await manager.send_personal_message(message_data, current_user.id)
    
    # Decrypt for the response
    db_message.content = decrypt_message(db_message.content)
    return db_message

@router.get("/conversations", response_model=List[chat_schema.ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """List all active conversations for the current user"""
    # Subquery to find the latest message for each conversation
    # We need to group by the OTHER user involved in the chat
    
    # This is a bit complex in SQL. 
    # Strategy: 
    # 1. Get all messages where user is sender or recipient
    # 2. Group by the other party
    # 3. Get the latest message for each group
    
    # Simplified approach: Get all messages involving user, order by time desc
    messages = db.query(message_model.Message).filter(
        or_(
            message_model.Message.sender_id == current_user.id,
            message_model.Message.recipient_id == current_user.id
        )
    ).order_by(message_model.Message.timestamp.desc()).all()
    
    conversations = {}
    for msg in messages:
        other_id = msg.recipient_id if msg.sender_id == current_user.id else msg.sender_id
        
        if other_id not in conversations:
            # Get other user details
            other_user = db.query(user_model.User).filter(user_model.User.id == other_id).first()
            if not other_user:
                continue
                
            conversations[other_id] = {
                "user_id": other_id,
                "full_name": other_user.full_name,
                "profile_picture": other_user.profile_picture,
                "last_message": decrypt_message(msg.content) if not msg.image_url else "[Image]",
                "last_message_time": msg.timestamp,
                "unread_count": 0
            }
        
        # Count unread messages from this user
        if msg.recipient_id == current_user.id and not msg.is_read:
            conversations[other_id]["unread_count"] += 1
            
    return list(conversations.values())

@router.get("/unread-count")
def get_unread_messages_count(
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get the total number of unread messages for the current user"""
    count = db.query(message_model.Message).filter(
        message_model.Message.recipient_id == current_user.id,
        message_model.Message.is_read == False
    ).count()
    return {"count": count}

@router.get("/{user_id}", response_model=List[chat_schema.MessageResponse])
def get_message_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Get message history with a specific user"""
    messages = db.query(message_model.Message).filter(
        or_(
            and_(message_model.Message.sender_id == current_user.id, message_model.Message.recipient_id == user_id),
            and_(message_model.Message.sender_id == user_id, message_model.Message.recipient_id == current_user.id)
        )
    ).order_by(message_model.Message.timestamp.asc()).all()
    for msg in messages:
        msg.content = decrypt_message(msg.content)
    
    return messages

@router.put("/{user_id}/read")
def mark_conversation_as_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Mark all messages from a specific user as read"""
    db.query(message_model.Message).filter(
        message_model.Message.sender_id == user_id,
        message_model.Message.recipient_id == current_user.id,
        message_model.Message.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    return {"status": "success"}

@router.post("/upload")
async def upload_chat_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: deps.User = Depends(deps.get_current_active_user)
):
    """Upload an image for chat"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    upload_dir = "private_uploads/chats"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Use the new media endpoint
    image_url = f"/api/chats/media/{filename}"
    return {"url": image_url}

@router.get("/media/{filename}")
async def get_chat_media(
    filename: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Serve chat images only to authorized users"""
    current_user = None
    
    # 1. Try to get user from token in query param
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email:
                current_user = db.query(user_model.User).filter(user_model.User.email == email).first()
        except JWTError:
            pass

    # 2. Note: If we wanted to support the Authorization header here too, 
    # we would need to manually extract it from request.headers.
    # But for <img> tags, the token param is the primary way.

    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # Check if user is part of any message containing this image
    # Note: In a production app, you might want a more efficient way to track media ownership
    image_url = f"/api/chats/media/{filename}"
    message = db.query(message_model.Message).filter(
        message_model.Message.image_url == image_url,
        or_(
            message_model.Message.sender_id == current_user.id,
            message_model.Message.recipient_id == current_user.id
        )
    ).first()
    
    if not message:
        raise HTTPException(status_code=403, detail="Not authorized to view this media")
    
    file_path = os.path.join("private_uploads/chats", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and listen for messages (though we primarily use REST for sending)
            # We can also handle incoming messages here if we want full WS chat
            data = await websocket.receive_text()
            # For now, we just echo or ignore, as sending is done via REST POST
            # await manager.send_personal_message(f"You wrote: {data}", user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
