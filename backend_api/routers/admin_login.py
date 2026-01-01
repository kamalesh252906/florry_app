from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, auth_utils
from deps import get_db
from sqlalchemy import or_

router = APIRouter(prefix="/login", tags=["admin-login"])

@router.post("/login")
def admin_login(login: schemas.AdminLogin, db: Session = Depends(get_db)):
    # Check for Super Admin first
    if login.email == "super@florry.com" and login.password == "admin":
         access_token = auth_utils.create_access_token(data={"sub": "superadmin", "role": "superadmin"})
         return {
            "message": "Super Admin login successful",
            "role": "superadmin",
            "access_token": access_token
        }

    admin = (
        db.query(models.Admin)
        .filter(
            or_(
                models.Admin.email == login.email,
                models.Admin.phone == login.email
            )
        )
        .first()
    )

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid email or phone")
    
    if admin.status != 'approved':
        raise HTTPException(status_code=403, detail="Account pending approval by Super Admin")

    if not auth_utils.verify_password(login.password, admin.password):
        # Fallback for old plain-text passwords (optional)
        if admin.password != login.password:
            raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create JWT token
    access_token = auth_utils.create_access_token(
        data={"sub": str(admin.admin_id), "role": "admin"}
    )

    return {
        "message": "Admin login successful",
        "role": "admin",
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "admin_id": admin.admin_id,
            "name": admin.name,
            "email": admin.email,
            "phone": admin.phone,
            "shop_name": admin.shop_name
        }
    }

@router.post("/forgot-password")
def forgot_password(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.email == req.email).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin with this email not found")
    return {"message": "Email verified. You can now reset your password."}

@router.post("/reset-password")
def reset_password(req: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.email == req.email).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    admin.password = auth_utils.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successful"}
