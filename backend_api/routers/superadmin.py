from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, auth_utils
from deps import get_db

router = APIRouter(prefix="/superadmin", tags=["superadmin"])

# Hardcoded super admin credentials for simplicity
SUPER_ADMIN_EMAIL = "super@florry.com"
SUPER_ADMIN_PASSWORD = "admin"

class SuperAdminLogin(schemas.BaseModel):
    email: str
    password: str

@router.post("/login")
def super_admin_login(login: SuperAdminLogin):
    if login.email == SUPER_ADMIN_EMAIL and login.password == SUPER_ADMIN_PASSWORD:
        access_token = auth_utils.create_access_token(data={"sub": "superadmin", "role": "superadmin"})
        return {
            "message": "Success", 
            "role": "superadmin", 
            "access_token": access_token
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/admins/pending", response_model=list[schemas.AdminOut])
def list_pending_admins(db: Session = Depends(get_db)):
    return db.query(models.Admin).filter(models.Admin.status == "pending").all()

@router.put("/admins/{admin_id}/approve")
def approve_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not admin: raise HTTPException(404, "Admin not found")
    admin.status = "approved"
    db.commit()
    return {"message": "Admin approved"}

@router.put("/admins/{admin_id}/reject")
def reject_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not admin: raise HTTPException(404, "Admin not found")
    admin.status = "rejected"
    db.commit()
    return {"message": "Admin rejected"}
