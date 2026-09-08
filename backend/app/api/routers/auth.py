from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from prisma import Prisma
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.user import UserCreate, UserLogin, GoogleLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

GOOGLE_CLIENT_ID = settings.google_client_id
limiter = Limiter(key_func=get_remote_address)

from app.api.dependencies import prisma


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = await prisma.user.find_unique(where={"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
async def register(request: Request, user_in: UserCreate):
    existing_user = await prisma.user.find_unique(where={"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user = await prisma.user.create(
        data={
            "email": user_in.email,
            "passwordHash": hashed_password,
            "name": user_in.name,
        }
    )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, user_in: UserLogin):
    user = await prisma.user.find_unique(where={"email": user_in.email})
    if not user or not user.passwordHash:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(user_in.password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
@limiter.limit("10/minute")
async def google_login(request: Request, google_in: GoogleLogin):
    try:
        # Validate Google token
        idinfo = id_token.verify_oauth2_token(google_in.token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        name = idinfo.get("name")
        google_id = idinfo.get("sub")
        avatar_url = idinfo.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        user = await prisma.user.find_unique(where={"email": email})
        if not user:
            user = await prisma.user.create(
                data={
                    "email": email,
                    "name": name,
                    "googleId": google_id,
                    "avatarUrl": avatar_url
                }
            )
        elif not user.googleId:
            # Link existing account to google
            user = await prisma.user.update(
                where={"email": email},
                data={"googleId": google_id, "avatarUrl": avatar_url}
            )
            
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
