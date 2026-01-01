from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
import schemas, models
from deps import get_db, get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.OrderOut)
def create_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Always use current_user.user_id for security
    total = Decimal("0.00")
    new_order = models.Order(
        user_id=current_user.user_id,
        admin_id=order_in.admin_id,
        payment_method=order_in.payment_method,
        order_status="created",
        delivery_address=order_in.delivery_address,
        delivery_time=order_in.delivery_time
    )
    db.add(new_order)
    db.flush()

    for item in order_in.items:
        flower = db.query(models.Flower).filter(models.Flower.flower_id == item.flower_id).first()
        if not flower:
            db.rollback()
            raise HTTPException(404, f"Flower {item.flower_id} not found")
        unit_price = flower.price
        subtotal = unit_price * item.quantity
        oi = models.OrderItem(
            order_id=new_order.order_id,
            flower_id=item.flower_id,
            quantity=item.quantity,
            price=unit_price,
            subtotal=subtotal
        )
        db.add(oi)
        total += subtotal
        if flower.stock_quantity is not None:
            flower.stock_quantity = max(0, (flower.stock_quantity or 0) - item.quantity)

    new_order.total_amount = total
    db.commit(); db.refresh(new_order)
    
    # Return with joined data
    return db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.flower)
    ).filter(models.Order.order_id == new_order.order_id).first()

@router.get("/", response_model=list[schemas.OrderOut])
def list_orders(status: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Users only see their own orders
    query = db.query(models.Order).filter(models.Order.user_id == current_user.user_id).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.flower)
    )
    if status:
        query = query.filter(models.Order.order_status == status)
    return query.all()

@router.get("/admin", response_model=list[schemas.OrderOut])
def admin_list_orders(status: str = None, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    # Admins see orders for their shop
    query = db.query(models.Order).filter(models.Order.admin_id == current_admin.admin_id).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.flower)
    )
    if status:
        query = query.filter(models.Order.order_status == status)
    return query.all()

@router.put("/{order_id}/shop_accept", response_model=schemas.OrderOut)
def shop_accept_order(order_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    o = db.query(models.Order).filter(
        models.Order.order_id == order_id,
        models.Order.admin_id == current_admin.admin_id
    ).first()
    if not o: raise HTTPException(404, "Order not found in your shop")
    o.order_status = "accepted"
    db.commit(); db.refresh(o)
    return o

@router.put("/{order_id}/out_for_delivery", response_model=schemas.OrderOut)
def out_for_delivery(order_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    o = db.query(models.Order).filter(
        models.Order.order_id == order_id,
        models.Order.admin_id == current_admin.admin_id
    ).first()
    if not o: raise HTTPException(404, "Order not found")
    o.order_status = "out_for_delivery"
    
    notif = models.Notification(
        user_id=o.user_id,
        title="Out for Delivery",
        message=f"Your order #{o.order_id} is out for delivery with the shop owner."
    )
    db.add(notif)
    db.commit(); db.refresh(o)
    return o

@router.put("/{order_id}/complete", response_model=schemas.OrderOut)
def complete_order(order_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    o = db.query(models.Order).filter(
        models.Order.order_id == order_id,
        models.Order.admin_id == current_admin.admin_id
    ).first()
    if not o: raise HTTPException(404, "Order not found")
    
    o.order_status = "completed"
    db.commit(); db.refresh(o)
    return o

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    o = db.query(models.Order).filter(
        models.Order.order_id == order_id,
        models.Order.admin_id == current_admin.admin_id
    ).first()
    if not o: raise HTTPException(404, "Order not found")
    
    db.delete(o)
    db.commit()
    return {"message": "Order deleted successfully"}
