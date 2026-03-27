from __future__ import annotations

from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Callable

import jwt
from flask import jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from app.core.config import settings
from app.db.extensions import db
from app.models.entities import User


class AuthService:
    def seed_admin(self) -> None:
        existing = User.query.filter_by(email=settings.admin_email).first()
        if existing:
            return

        db.session.add(
            User(
                email=settings.admin_email,
                full_name=settings.admin_name,
                role="admin",
                password_hash=generate_password_hash(settings.admin_password),
            )
        )
        db.session.commit()

    def authenticate(self, email: str, password: str) -> tuple[str | None, User | None]:
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return None, None

        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_exp_minutes)
        token = jwt.encode(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role,
                "exp": expires_at,
            },
            settings.secret_key,
            algorithm="HS256",
        )
        return token, user

    def decode_token(self, token: str) -> dict | None:
        try:
            return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        except jwt.PyJWTError:
            return None

    def current_user(self) -> User | None:
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        token = header.replace("Bearer ", "", 1).strip()
        payload = self.decode_token(token)
        if not payload:
            return None
        return db.session.get(User, int(payload["sub"]))

    def login_required(self, fn: Callable):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = self.current_user()
            if not user:
                return jsonify({"message": "Unauthorized"}), 401
            return fn(*args, **kwargs, current_user=user)

        return wrapper


auth_service = AuthService()
