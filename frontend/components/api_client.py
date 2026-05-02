from __future__ import annotations

from datetime import date
from typing import Any

import requests


class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.access_token: str | None = None

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def set_token(self, token: str | None) -> None:
        self.access_token = token

    def _auth_headers(self) -> dict[str, str]:
        if not self.access_token:
            return {}
        return {"Authorization": f"Bearer {self.access_token}"}

    def signup(self, username: str, email: str, password: str, name: str) -> dict[str, Any]:
        response = requests.post(
            self._url("/signup"),
            json={
                "username": username,
                "email": email,
                "password": password,
                "name": name,
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def login(self, username: str, password: str) -> dict[str, Any]:
        response = requests.post(
            self._url("/login"),
            json={"username": username, "password": password},
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def get_tasks(self, user_id: int, day: date) -> list[dict[str, Any]]:
        response = requests.get(
            self._url("/tasks"),
            params={"user_id": user_id, "day": day.isoformat()},
            headers=self._auth_headers(),
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def create_task(self, user_id: int, title: str, category: str, difficulty: str, day: date) -> dict[str, Any]:
        response = requests.post(
            self._url("/tasks"),
            json={
                "user_id": user_id,
                "title": title,
                "category": category,
                "difficulty": difficulty,
                "date": day.isoformat(),
            },
            headers=self._auth_headers(),
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def update_task_status(self, task_id: int, status: str) -> dict[str, Any]:
        response = requests.patch(
            self._url(f"/tasks/{task_id}"),
            json={"status": status},
            headers=self._auth_headers(),
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def compute_daily_score(self, user_id: int, day: date) -> dict[str, Any]:
        response = requests.post(
            self._url("/score/daily"),
            json={"user_id": user_id, "day": day.isoformat()},
            headers=self._auth_headers(),
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def score_history(self, user_id: int) -> list[dict[str, Any]]:
        response = requests.get(
            self._url("/score/history"),
            params={"user_id": user_id},
            headers=self._auth_headers(),
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
