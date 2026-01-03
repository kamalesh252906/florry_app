from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine
from deps import get_db
from sqlalchemy import text
import models, schemas
from typing import Optional
from routers import (users, admins, flowers, orders, order_items, 
                     reports, cart, 
                     user_login, admin_login, superadmin, support)

def init_db():
    try:
        # metadata.create_all handles table creation if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Safe migration for flowers
        with engine.begin() as conn:
            try:
                conn.execute(text("ALTER TABLE flowers ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 0"))
            except Exception as e:
                # We skip if it already exists or if there's a minor DB issue
                print(f"Migration notice: {e}")
    except Exception as e:
        print(f"Database sync notice (may be normal if tables were just deleted): {e}")

app = FastAPI(title="Florry Flower Shop API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    # We call this, but errors won't crash the whole app boot
    init_db()

# DUAL ROUTING
# Every route works with and without /api prefix
for prefix in ["", "/api"]:
    app.include_router(users.router, prefix=prefix)
    app.include_router(user_login.router, prefix=prefix)
    app.include_router(admins.router, prefix=prefix)
    app.include_router(admin_login.router, prefix=prefix)
    app.include_router(flowers.router, prefix=prefix)
    app.include_router(orders.router, prefix=prefix)
    app.include_router(order_items.router, prefix=prefix)
    app.include_router(reports.router, prefix=prefix)
    app.include_router(cart.router, prefix=prefix)
    app.include_router(support.router, prefix=prefix)
    app.include_router(superadmin.router, prefix=prefix)

@app.get("/")
def root():
    return {"message": "Florry API is active"}

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy"}
