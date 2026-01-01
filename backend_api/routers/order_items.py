from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from deps import get_db

router = APIRouter(prefix="/order-items", tags=["order-items"])

@router.get("/", response_model=list[schemas.OrderItemOut])
def list_items(db: Session = Depends(get_db)):
    return db.query(models.OrderItem).all()

@router.get("/{item_id}", response_model=schemas.OrderItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    it = db.query(models.OrderItem).filter(models.OrderItem.item_id == item_id).first()
    if not it:
        raise HTTPException(404, "Order item not found")
    return it

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    it = db.query(models.OrderItem).filter(models.OrderItem.item_id == item_id).first()
    if not it:
        raise HTTPException(404, "Order item not found")
    db.delete(it); db.commit()
    return {"message": "Order item deleted"}
