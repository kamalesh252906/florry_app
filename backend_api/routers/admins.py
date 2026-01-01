from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, auth_utils
from deps import get_db

router = APIRouter(prefix="/admins", tags=["admins"])

@router.post("/", response_model=schemas.AdminOut)
def create_admin(admin_in: schemas.AdminCreate, db: Session = Depends(get_db)):
    if db.query(models.Admin).filter(models.Admin.email == admin_in.email).first():
        raise HTTPException(400, "Email already registered")
    a = models.Admin(
        name=admin_in.name, email=admin_in.email, phone=admin_in.phone,
        password=auth_utils.get_password_hash(admin_in.password), shop_name=admin_in.shop_name,
        shop_image_url=admin_in.shop_image_url,
        aadhaar_number=admin_in.aadhaar_number,
        aadhaar_image_url=admin_in.aadhaar_image_url,
        latitude=admin_in.latitude,
        longitude=admin_in.longitude,
        status="pending"
    )
    db.add(a); db.commit(); db.refresh(a)
    return a

@router.get("/", response_model=list[schemas.AdminOut])
def list_admins(lat: float = None, lng: float = None, radius: float = 20.0, db: Session = Depends(get_db)):
    query = db.query(models.Admin).filter(models.Admin.status == 'approved')
    admins = query.all()

    if lat is not None and lng is not None:
        import math
        filtered = []
        for admin in admins:
            if admin.latitude is None or admin.longitude is None:
                continue
            
            # Haversine formula
            R = 6371 # Earth radius in km
            d_lat = math.radians(float(admin.latitude) - lat)
            d_lng = math.radians(float(admin.longitude) - lng)
            a = (math.sin(d_lat/2) * math.sin(d_lat/2) +
                 math.cos(math.radians(lat)) * math.cos(math.radians(float(admin.latitude))) *
                 math.sin(d_lng/2) * math.sin(d_lng/2))
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            distance = R * c
            
            if distance <= radius:
                filtered.append(admin)
        return filtered
    
    return admins

@router.get("/{admin_id}", response_model=schemas.AdminOut)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    a = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not a:
        raise HTTPException(404, "Admin not found")
    return a

@router.put("/{admin_id}", response_model=schemas.AdminOut)
def update_admin(admin_id: int, upd: schemas.AdminUpdate, db: Session = Depends(get_db)):
    a = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not a:
        raise HTTPException(404, "Admin not found")
    for k, v in upd.dict(exclude_unset=True).items():
        setattr(a, k, v)
    db.commit(); db.refresh(a)
    return a

@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    a = db.query(models.Admin).filter(models.Admin.admin_id == admin_id).first()
    if not a:
        raise HTTPException(404, "Admin not found")
    db.delete(a); db.commit()
    return {"message": "Admin deleted"}

