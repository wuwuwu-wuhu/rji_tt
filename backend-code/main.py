from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import uvicorn
import os

from app.api.routes import auth, users, settings, entertainment, goals, diary, schedule, ai, agents, upload
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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
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
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

# 静态文件服务
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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