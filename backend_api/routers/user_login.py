from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, auth_utils
from deps import get_db
from sqlalchemy import or_

router = APIRouter(prefix="/user", tags=["user-login"])

@router.post("/login")
def login_user(login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            or_(
                models.User.email == login.email,
                models.User.phone == login.email
            )
        )
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or phone")

    # Verify password (checks both hash and plain for backward compatibility if needed, 
    # but strictly verify_password is better)
    if not auth_utils.verify_password(login.password, user.password):
        # Fallback for old plain-text passwords (optional, remove for better security)
        if user.password != login.password:
            raise HTTPException(status_code=401, detail="Invalid password")
        
    # Create JWT token
    access_token = auth_utils.create_access_token(
        data={"sub": str(user.user_id), "role": "user"}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address
        }
    }

@router.post("/forgot-password")
def forgot_password(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    # In a real app, send reset link here. For now, just confirm email exists.
    return {"message": "Email verified. You can now reset your password."}

@router.post("/reset-password")
def reset_password(req: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password = auth_utils.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successful"}
