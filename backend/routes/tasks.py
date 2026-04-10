from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.task import Task
from backend.models.user import User
from backend.schemas import TaskCreate, TaskResponse, TaskUpdate
from backend.services.auth_service import get_current_user

router = APIRouter(tags=["tasks"])


@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    user_id: int | None = Query(default=None),
    day: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    tasks = (
        db.query(Task)
        .filter(Task.user_id == target_user_id, Task.date == day)
        .order_by(Task.created_at.asc())
        .all()
    )
    return tasks


@router.post("/tasks", response_model=TaskResponse)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target_user_id = payload.user_id or current_user.id
    if target_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    task = Task(
        user_id=target_user_id,
        title=payload.title,
        category=payload.category.lower(),
        difficulty=payload.difficulty,
        status="pending",
        date=payload.date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if payload.status not in {"completed", "failed", "pending"}:
        raise HTTPException(status_code=400, detail="Invalid task status")

    task.status = payload.status
    db.commit()
    db.refresh(task)

    return task
