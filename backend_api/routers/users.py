from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, auth_utils
from deps import get_db
router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.UserOut)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    u = models.User(
        name=user_in.name, email=user_in.email, phone=user_in.phone,
        password=auth_utils.get_password_hash(user_in.password), address=user_in.address
    )
    db.add(u); db.commit(); db.refresh(u)
    return u

@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    return u

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, upd: schemas.UserUpdate, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    for k, v in upd.dict(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit(); db.refresh(u)
    return u

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    db.delete(u); db.commit()
    return {"message": "User deleted"}






