from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine
from deps import get_db
from sqlalchemy import text
import models, schemas
from routers import (users, admins, flowers, orders, order_items, 
                     reports, cart, 
                     user_login, admin_login, superadmin, support)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        # Migration for flowers table
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE flowers ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 0"))
                conn.commit()
            except Exception as e:
                print(f"Migration error (flowers): {e}")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Run initialization


app = FastAPI(title="Florry Flower Shop API")

# CORS Configuration (Highest Priority)
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
    init_db()

# 2. DEFINITIVE DUAL ROUTING
# Handle routes with AND without the /api prefix explicitly
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



from typing import Optional

@app.get("/")
def root():
    return {"message": "Florry API is running"}


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy"}



