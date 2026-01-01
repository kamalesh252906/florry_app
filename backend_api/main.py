from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from sqlalchemy import text
import models 
from routers import (users, admins, flowers, orders, order_items, 
                     reports, cart, ratings, notifications, 
                     user_login, admin_login, superadmin, support)

Base.metadata.create_all(bind=engine)

# Migration for support_messages table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id)"))
        conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS reply TEXT"))
        conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'"))
        conn.commit()
    except Exception as e:
        print(f"Migration error: {e}")

# Migration for flowers table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE flowers ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 0"))
        conn.commit()
    except Exception as e:
        print(f"Migration error (flowers): {e}")

app = FastAPI(title="Florry Flower Shop API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(user_login.router)
app.include_router(admins.router)
app.include_router(admin_login.router)
app.include_router(flowers.router)
app.include_router(orders.router)
app.include_router(order_items.router)
app.include_router(reports.router)
app.include_router(cart.router)
app.include_router(ratings.router)
app.include_router(notifications.router)
app.include_router(support.router)

app.include_router(superadmin.router)

@app.get("/")
def root():
    return {"message": "Florry API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "message": "Backend is running"}