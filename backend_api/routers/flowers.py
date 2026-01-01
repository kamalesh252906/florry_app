from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from deps import get_db
from seed_data import SEED_FLOWERS

router = APIRouter(prefix="/flowers", tags=["flowers"])

@router.post("/seed")
def seed_flowers(db: Session = Depends(get_db)):
    # Check for existing admin 1
    admin_id = 1
    admin = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not admin:
        # Create a default admin if not exists
        admin = models.Admin(
            admin_id=admin_id,
            name="Default Admin",
            email="admin@florry.com",
            password="password",
            shop_name="Florry Shop"
        )
        db.add(admin)
        db.commit()

    count = 0
    for flower_data in SEED_FLOWERS:
        exists = db.query(models.Flower).filter(models.Flower.name == flower_data["name"]).first()
        if not exists:
            flower = models.Flower(
                name=flower_data["name"],
                category=flower_data["category"],
                price=flower_data["price"],
                image_url=flower_data["image_url"],
                description=flower_data["description"],
                admin_id=admin_id,
                stock_quantity=100
            )
            db.add(flower)
            count += 1
    
    db.commit()
    return {"message": f"Seeded {count} flowers"}

@router.get("/", response_model=List[schemas.FlowerOut])
def get_flowers(admin_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Flower)
    if admin_id:
        query = query.filter(models.Flower.admin_id == admin_id)
    return query.all()

@router.post("/", response_model=schemas.FlowerOut)
def create_flower(flower: schemas.FlowerCreate, db: Session = Depends(get_db)):
    admin_id = flower.admin_id
    admin = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Shop admin not found")

    new_flower = models.Flower(**flower.dict())
    db.add(new_flower)
    db.commit()
    db.refresh(new_flower)
    return new_flower

@router.put("/{flower_id}", response_model=schemas.FlowerOut)
def update_flower(flower_id: int, flower: schemas.FlowerUpdate, db: Session = Depends(get_db)):
    db_flower = db.query(models.Flower).filter(models.Flower.flower_id == flower_id).first()
    if not db_flower:
        raise HTTPException(status_code=404, detail="Flower not found")
    
    for k, v in flower.dict(exclude_unset=True).items():
        setattr(db_flower, k, v)
    
    db.commit()
    db.refresh(db_flower)
    return db_flower

@router.delete("/{flower_id}")
def delete_flower(flower_id: int, db: Session = Depends(get_db)):
    db_flower = db.query(models.Flower).filter(models.Flower.flower_id == flower_id).first()
    if not db_flower:
        raise HTTPException(status_code=404, detail="Flower not found")
    
    db.delete(db_flower)
    db.commit()
    return {"message": "Flower deleted"}

@router.get("/{flower_id}", response_model=schemas.FlowerOut)
def get_flower(flower_id: int, db: Session = Depends(get_db)):
    flower = db.query(models.Flower).filter(models.Flower.flower_id == flower_id).first()
    if not flower:
        raise HTTPException(status_code=404, detail="Flower not found")
    return flower
