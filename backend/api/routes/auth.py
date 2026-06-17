"""
Authentication routes for GAIA.
Simple JWT-based auth with in-memory user store.
"""
from datetime import datetime, timedelta
import hashlib
from fastapi import APIRouter, HTTPException
from jose import jwt

from api.models.schemas import UserRegister, UserLogin, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "gaia-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """Simple SHA-256 hash for demo purposes."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


# In-memory user store
users_db = {
    "admin@gaia.gov.in": {
        "email": "admin@gaia.gov.in",
        "name": "Dr. Priya Sharma",
        "role": "administrator",
        "password_hash": hash_password("admin123"),
        "organization": "Urban Planning Authority",
    },
    "planner@gaia.gov.in": {
        "email": "planner@gaia.gov.in",
        "name": "Rajesh Kumar",
        "role": "planner",
        "password_hash": hash_password("planner123"),
        "organization": "Municipal Corporation",
    },
}


def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    users_db[user.email] = {
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "password_hash": hash_password(user.password),
        "organization": "Unassigned",
    }

    token = create_token({"sub": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user={"email": user.email, "name": user.name, "role": user.role},
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = users_db.get(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": user["email"], "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user={
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "organization": user.get("organization", ""),
        },
    )
