from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(15))
    password = Column(String(255))
    address = Column(Text)
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("Cart", back_populates="user", cascade="all, delete-orphan")




class Admin(Base):
    __tablename__ = "admin"
    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(15))
    password = Column(String(255))
    shop_name = Column(String(100))
    shop_image_url = Column(Text)  # Changed to Text for base64 images
    aadhaar_number = Column(String(20))
    aadhaar_image_url = Column(Text)  # Changed to Text for base64 images
    status = Column(String(20), default="pending") # pending, approved, rejected
    latitude = Column(Numeric(9,6))
    longitude = Column(Numeric(9,6))
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    flowers = relationship("Flower", back_populates="admin", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="admin")
    reports = relationship("Report", back_populates="admin", cascade="all, delete-orphan")



class Flower(Base):
    __tablename__ = "flowers"
    flower_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin.admin_id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10,2))
    image_url = Column(Text)  # Changed to Text for base64 images
    category = Column(String(50))
    stock_quantity = Column(Integer, default=0)
    weight_grams = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    admin = relationship("Admin", back_populates="flowers")
    order_items = relationship("OrderItem", back_populates="flower", cascade="all, delete-orphan")
    cart_items = relationship("Cart", back_populates="flower", cascade="all, delete-orphan")



class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("admin.admin_id"), nullable=True)
    total_amount = Column(Numeric(12,2))
    payment_method = Column(String(50))
    order_status = Column(String(50))
    delivery_address = Column(Text)
    delivery_time = Column(TIMESTAMP(timezone=False))
    ordered_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    user = relationship("User", back_populates="orders")
    admin = relationship("Admin", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    flower_id = Column(Integer, ForeignKey("flowers.flower_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10,2))
    subtotal = Column(Numeric(12,2))

    order = relationship("Order", back_populates="items")
    flower = relationship("Flower", back_populates="order_items")


class Report(Base):
    __tablename__ = "reports"
    report_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin.admin_id"), nullable=False)
    total_orders = Column(Integer)
    total_sales = Column(Numeric(12,2))
    most_ordered_flower = Column(String(100))
    report_date = Column(TIMESTAMP(timezone=False), server_default=func.now())

    admin = relationship("Admin", back_populates="reports")


class Cart(Base):
    __tablename__ = "cart"
    cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    flower_id = Column(Integer, ForeignKey("flowers.flower_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    added_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    user = relationship("User", back_populates="cart_items")
    flower = relationship("Flower", back_populates="cart_items")








class SupportMessage(Base):
    __tablename__ = "support_messages"
    message_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(150))
    message = Column(Text, nullable=False)
    reply = Column(Text, nullable=True)
    status = Column(String(20), default="open") # open, replied
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())

    user = relationship("User")

