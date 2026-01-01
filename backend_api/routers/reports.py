from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from deps import get_db

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=schemas.ReportOut)
def create_report(r: schemas.ReportCreate, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.admin_id == r.admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")
    rep = models.Report(
        admin_id=r.admin_id,
        total_orders=r.total_orders,
        total_sales=r.total_sales,
        most_ordered_flower=r.most_ordered_flower
    )
    db.add(rep); db.commit(); db.refresh(rep)
    return rep

@router.get("/", response_model=list[schemas.ReportOut])
def list_reports(db: Session = Depends(get_db)):
    return db.query(models.Report).all()

@router.get("/{report_id}", response_model=schemas.ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(models.Report).filter(models.Report.report_id == report_id).first()
    if not rep:
        raise HTTPException(404, "Report not found")
    return rep

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(models.Report).filter(models.Report.report_id == report_id).first()
    if not rep:
        raise HTTPException(404, "Report not found")
    db.delete(rep); db.commit()
    return {"message": "Report deleted"}
