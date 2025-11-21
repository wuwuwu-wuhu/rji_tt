from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn

from app.api.routes import auth, users, settings, entertainment, goals, diary, schedule, ai
from app.core.config import settings as app_settings

app = FastAPI(
    title="LifeLog AI API",
    description="智能生活日志助手后端服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(entertainment.router, prefix="/api/entertainment", tags=["entertainment"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(diary.router, prefix="/api/diary", tags=["diary"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to LifeLog AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=app_settings.HOST,
        port=app_settings.PORT,
    )  # Changed from } to )