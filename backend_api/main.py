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

@app.on_event("startup")
def startup_db():
    init_db()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# === Vercel Path Correction Middleware ===
# This ensures that /api/user/login is correctly handled as /user/login
@app.middleware("http")
async def fix_api_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path.startswith("/api"):
        # Strip '/api' from the beginning of the path
        new_path = path[4:] if path.startswith("/api/") else path.replace("/api", "", 1)
        request.scope["path"] = new_path or "/"
    return await call_next(request)

# === Unified Router ===
api_router = APIRouter()

api_router.include_router(users.router)
api_router.include_router(user_login.router)
api_router.include_router(admins.router)
api_router.include_router(admin_login.router)
api_router.include_router(flowers.router)
api_router.include_router(orders.router)
api_router.include_router(order_items.router)
api_router.include_router(reports.router)
api_router.include_router(cart.router)
api_router.include_router(support.router)
api_router.include_router(superadmin.router)

app.include_router(api_router)



@app.post("/user/login")
async def direct_login(login: schemas.UserLogin, db: Session = Depends(get_db)):
    return user_login.login_user(login, db)

@app.get("/")
def root():

    return {"message": "Florry API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy", "message": "Backend is running"}