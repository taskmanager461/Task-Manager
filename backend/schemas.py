from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Difficulty = Literal["easy", "medium", "hard"]
TaskStatus = Literal["pending", "completed", "failed"]


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=100)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    user_id: int
    username: str
    name: str
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    name: str
    streak: int
    created_at: datetime


Priority = Literal["low", "medium", "high"]
Recurring = Literal["none", "daily", "weekly"]

class TaskCreate(BaseModel):
    user_id: Optional[int] = None
    title: str = Field(min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = Field(default="general", min_length=2, max_length=50)
    difficulty: Optional[Difficulty] = "medium"
    priority: Optional[Priority] = "medium"
    recurring: Optional[Recurring] = "none"
    due_date: Optional[date] = None
    time: Optional[str] = None
    date: date


class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    time: Optional[str] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    category: str
    difficulty: Difficulty
    priority: Priority
    recurring: Recurring
    due_date: Optional[date]
    time: Optional[str]
    status: TaskStatus
    date: date
    created_at: datetime


class DailyScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: date
    score: float
    success_rate: float


class DailyScoreRequest(BaseModel):
    user_id: Optional[int] = None
    day: Optional[date] = None


class DailyScoreComputationResponse(BaseModel):
    date: date
    score: float
    success_rate: float
    streak: int
    multiplier: float
    total_tasks: int
