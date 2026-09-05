from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from prisma import Prisma
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests

from app.schemas.user import UserCreate, UserLogin, GoogleLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID" # This should ideally be in env vars

# Dependency to get db
# In MIGRATION_PLAN.md it says use prisma.connect() in lifespan and import prisma
# Let's assume a global prisma client or we can import it.
# Wait, MIGRATION_PLAN: "Use prisma.connect() in FastAPI's @asynccontextmanager lifespan... Ensure all database operations are explicitly awaited (e.g., await prisma.port.find_unique(...))."
# Let's import the global client from a place, or just instantiate it. Wait, Prisma Client is usually instantiated in prisma\.py or main.py. Let's use `from prisma import Prisma; db = Prisma()` pattern, but since it's async, we might need the one initialized in main.py.
# Actually, the standard Prisma Python way is:
from app.api.dependencies import prisma


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    if not prisma.is_connected():
        await prisma.connect()
        
    user = await prisma.user.find_unique(where={"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    if not prisma.is_connected():
        await prisma.connect()
        
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
async def login(user_in: UserLogin):
    if not prisma.is_connected():
        await prisma.connect()
        
    user = await prisma.user.find_unique(where={"email": user_in.email})
    if not user or not user.passwordHash:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(user_in.password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
async def google_login(google_in: GoogleLogin):
    try:
        # Validate Google token
        idinfo = id_token.verify_oauth2_token(google_in.token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        name = idinfo.get("name")
        google_id = idinfo.get("sub")
        avatar_url = idinfo.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        if not prisma.is_connected():
            await prisma.connect()
            
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
