from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from deps import get_db

router = APIRouter(prefix="/ratings" , tags=["ratings"])

@router.post("/", response_model=schemas.RatingOut)
def create_rating(r: schemas.RatingCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == r.user_id).first()
    flower = db.query(models.Flower).filter(models.Flower.flower_id == r.flower_id).first()
    if not user or not flower:
        raise HTTPException(404, "User or Flower not found")
    rating = models.Rating(
        user_id=r.user_id, admin_id=r.admin_id,
        flower_id=r.flower_id, rating=r.rating, review=r.review
    )
    db.add(rating); db.commit(); db.refresh(rating)
    return rating

@router.get("/", response_model=list[schemas.RatingOut])
def list_ratings(db: Session = Depends(get_db)):
    return db.query(models.Rating).all()

@router.delete("/{rating_id}")
def delete_rating(rating_id: int, db: Session = Depends(get_db)):
    rr = db.query(models.Rating).filter(models.Rating.rating_id == rating_id).first()
    if not rr:
        raise HTTPException(404, "Rating not found")
    db.delete(rr); db.commit()
    return {"message": "Rating deleted"}

