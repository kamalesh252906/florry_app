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



@app.api_route("/user/login", methods=["GET", "POST"])
@app.api_route("/api/user/login", methods=["GET", "POST"])
def unified_login(login: schemas.UserLogin = None, db: Session = Depends(get_db)):
    if login is None:
        return {"status": "Login endpoint is available. Please use POST."}
    from routers.user_login import login_user
    return login_user(login, db)

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy"}



