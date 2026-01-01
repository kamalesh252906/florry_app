from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from deps import get_db
import models
import schemas

router = APIRouter(
    prefix="/support",
    tags=["support"]
)

@router.post("/", response_model=schemas.SupportMessageOut)
def create_support_message(msg: schemas.SupportMessageCreate, db: Session = Depends(get_db)):
    db_msg = models.SupportMessage(
        user_id=msg.user_id,
        name=msg.name,
        email=msg.email,
        subject=msg.subject,
        message=msg.message
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.get("/", response_model=List[schemas.SupportMessageOut])
def get_support_messages(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.SupportMessage)
    if user_id:
        query = query.filter(models.SupportMessage.user_id == user_id)
    return query.order_by(models.SupportMessage.created_at.desc()).all()

@router.put("/{message_id}/reply", response_model=schemas.SupportMessageOut)
def reply_to_message(message_id: int, reply_data: schemas.SupportReply, db: Session = Depends(get_db)):
    db_msg = db.query(models.SupportMessage).filter(models.SupportMessage.message_id == message_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db_msg.reply = reply_data.reply
    db_msg.status = "replied"
    db.commit()
    db.refresh(db_msg)
    
    # Create a notification for the user if they exist
    if db_msg.user_id:
        notif = models.Notification(
            user_id=db_msg.user_id,
            title="Support Reply",
            message=f"You have received a reply for your inquiry: {db_msg.subject}"
        )
        db.add(notif)
        db.commit()
        
    return db_msg

@router.delete("/{message_id}")
def delete_support_message(message_id: int, db: Session = Depends(get_db)):
    db_msg = db.query(models.SupportMessage).filter(models.SupportMessage.message_id == message_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(db_msg)
    db.commit()
    
    return {"message": "Support message deleted successfully"}
