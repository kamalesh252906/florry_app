from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from deps import get_db, get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=list[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.user_id).order_by(models.Notification.sent_at.desc()).all()

@router.put("/{notification_id}", response_model=schemas.NotificationOut)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id,
        models.Notification.user_id == current_user.user_id
    ).first()
    if not note:
        raise HTTPException(404, "Notification not found")
    note.is_read = True
    db.commit(); db.refresh(note)
    return note
