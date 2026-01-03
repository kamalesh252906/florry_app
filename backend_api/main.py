from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from sqlalchemy import text
import models 
from routers import (users, admins, flowers, orders, order_items, 
                     reports, cart, 
                     user_login, admin_login, superadmin, support)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        
        # Migration for support_messages table
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id)"))
                conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS reply TEXT"))
                conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'"))
                conn.commit()
            except Exception as e:
                print(f"Migration error (support_messages): {e}")

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

# === Vercel Path-Stripping Middleware (Absolute Fallback) ===
# This ensures that even if Vercel doesn't strip /api, we do it manually.
@app.middleware("http")
async def strip_api_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path.startswith("/api/"):
        request.scope["path"] = path.replace("/api", "", 1)
    elif path == "/api":
        request.scope["path"] = "/"
    return await call_next(request)

@app.on_event("startup")
def startup_db():
    init_db()

# === DEFINITIVE ROUTING (Redundant Safety) ===
# We register routers under both root and /api to ensure 100% method compatibility
for pfx in ["", "/api"]:
    app.include_router(users.router, prefix=pfx)
    app.include_router(user_login.router, prefix=pfx)
    app.include_router(admins.router, prefix=pfx)
    app.include_router(admin_login.router, prefix=pfx)
    app.include_router(flowers.router, prefix=pfx)
    app.include_router(orders.router, prefix=pfx)
    app.include_router(order_items.router, prefix=pfx)
    app.include_router(reports.router, prefix=pfx)
    app.include_router(cart.router, prefix=pfx)
    app.include_router(support.router, prefix=pfx)
    app.include_router(superadmin.router, prefix=pfx)

@app.get("/api/test-direct")
@app.get("/test-direct")
def test_direct():
    return {"status": "ok", "message": "Routing is working"}

@app.get("/")
def root():
    return {"message": "Florry API is running", "docs": "/api/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}


