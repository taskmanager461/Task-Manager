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


class TaskCreate(BaseModel):
    user_id: Optional[int] = None
    title: str = Field(min_length=2, max_length=255)
    category: str = Field(min_length=2, max_length=50)
    difficulty: Difficulty
    date: date


class TaskUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    category: str
    difficulty: Difficulty
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
