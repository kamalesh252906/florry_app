from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import Base, engine
from deps import get_db
from sqlalchemy import text
import models, schemas
import traceback
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
                print(f"Migration notice: {e}")
    except Exception as e:
        print(f"Database sync notice: {e}")

app = FastAPI(title="Florry Flower Shop API")

# ERROR HANDLER MIDDLEWARE (Shows exact error if app crashes during request)
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "RUNTIME_ERROR",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )

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
    init_db()

# DUAL ROUTING
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
