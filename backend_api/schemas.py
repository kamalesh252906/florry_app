from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = None
    address: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    address: Optional[str]

class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str # Can be email or phone
    password: str

class AdminLogin(BaseModel):
    email: str # Can be email or phone
    password: str

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = None
    shop_name: Optional[str] = None
    shop_image_url: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_image_url: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

class AdminUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    shop_name: Optional[str]
    shop_image_url: Optional[str]
    aadhaar_number: Optional[str]
    aadhaar_image_url: Optional[str]
    status: Optional[str]
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]

class AdminOut(BaseModel):
    admin_id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    shop_name: Optional[str]
    shop_image_url: Optional[str]
    status: str
    aadhaar_number: Optional[str]
    aadhaar_image_url: Optional[str]
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ... existing Flower schemas ...

class RiderCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    aadhaar_number: Optional[str] = None
    aadhaar_image_url: Optional[str] = None

class RiderLogin(BaseModel):
    email: str
    password: str

class RiderOut(BaseModel):
    rider_id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    status: str
    is_available: bool
    earnings: Optional[Decimal]
    aadhaar_number: Optional[str]
    aadhaar_image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class FlowerCreate(BaseModel):
    admin_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = 0

class FlowerUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[Decimal]
    image_url: Optional[str]
    category: Optional[str]
    stock_quantity: Optional[int]

class FlowerOut(BaseModel):
    flower_id: int
    admin_id: int
    name: str
    description: Optional[str]
    price: Decimal
    image_url: Optional[str]
    category: Optional[str]
    stock_quantity: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    flower_id: int
    quantity: int
    price: Optional[Decimal] = 0

class OrderItemOut(BaseModel):
    item_id: int
    order_id: int
    flower_id: int
    quantity: int
    price: Decimal
    subtotal: Decimal
    flower: Optional[FlowerOut]

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: int
    admin_id: Optional[int] = None
    payment_method: Optional[str] = None
    order_status: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_time: Optional[datetime] = None
    items: List[OrderItemCreate] = []

class OrderUpdate(BaseModel):
    order_status: Optional[str]
    delivery_time: Optional[datetime]
    delivery_address: Optional[str]

class OrderOut(BaseModel):
    order_id: int
    user_id: int
    admin_id: Optional[int]
    total_amount: Optional[Decimal]
    payment_method: Optional[str]
    order_status: Optional[str]
    delivery_address: Optional[str]
    delivery_time: Optional[datetime]
    ordered_at: datetime
    items: List[OrderItemOut] = []
    user: Optional[UserOut]

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    admin_id: int
    total_orders: Optional[int]
    total_sales: Optional[Decimal]
    most_ordered_flower: Optional[str]

class ReportOut(BaseModel):
    report_id: int
    admin_id: int
    total_orders: Optional[int]
    total_sales: Optional[Decimal]
    most_ordered_flower: Optional[str]
    report_date: datetime

    class Config:
        from_attributes = True

class CartCreate(BaseModel):
    user_id: int
    flower_id: int
    quantity: int

class CartUpdate(BaseModel):
    quantity: int

class CartOut(BaseModel):
    cart_id: int
    user_id: int
    flower_id: int
    quantity: int
    added_at: datetime

    class Config:
        from_attributes = True

class RatingCreate(BaseModel):
    user_id: int
    admin_id: Optional[int] = None
    flower_id: int
    rating: int
    review: Optional[str] = None

class RatingOut(BaseModel):
    rating_id: int
    user_id: int
    admin_id: Optional[int]
    flower_id: int
    rating: int
    review: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    user_id: int
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = False

class NotificationOut(BaseModel):
    notification_id: int
    user_id: int
    title: Optional[str]
    message: Optional[str]
    class Config:
        from_attributes = True



class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    new_password: str


class SupportMessageCreate(BaseModel):
    user_id: Optional[int] = None
    name: str
    email: str
    subject: str
    message: str

class SupportReply(BaseModel):
    reply: str

class SupportMessageOut(BaseModel):
    message_id: int
    user_id: Optional[int]
    name: str
    email: str
    subject: str
    message: str
    reply: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
