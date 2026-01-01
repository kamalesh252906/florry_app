from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
import models, schemas
from deps import get_db, get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/")
def add_to_cart(item: schemas.CartCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Ensure items are added for the current user
    existing_item = db.query(models.Cart).filter(
        models.Cart.user_id == current_user.user_id,
        models.Cart.flower_id == item.flower_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
            
    new_item = models.Cart(
        user_id=current_user.user_id,
        flower_id=item.flower_id,
        quantity=item.quantity
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/")
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Join with Flower to get details
    cart_items = db.query(models.Cart).filter(models.Cart.user_id == current_user.user_id).all()
    
    # We want to return item details too
    results = []
    for item in cart_items:
        flower = db.query(models.Flower).filter(models.Flower.flower_id == item.flower_id).first()
        results.append({
            "cart_id": item.cart_id,
            "flower_id": item.flower_id,
            "quantity": item.quantity,
            "flower": {
                "name": flower.name,
                "price": float(flower.price),
                "image_url": flower.image_url
            }
        })
    return results

@router.put("/{cart_id}")
def update_cart_quantity(cart_id: int, upd: schemas.CartUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cart_item = db.query(models.Cart).filter(
        models.Cart.cart_id == cart_id,
        models.Cart.user_id == current_user.user_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if upd.quantity <= 0:
        db.delete(cart_item)
        db.commit()
        return {"message": "Item removed"}
    
    cart_item.quantity = upd.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/{cart_id}")
def delete_cart_item(cart_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cart_item = db.query(models.Cart).filter(
        models.Cart.cart_id == cart_id,
        models.Cart.user_id == current_user.user_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed"}
