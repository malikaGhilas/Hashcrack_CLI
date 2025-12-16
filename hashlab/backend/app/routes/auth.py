from flask import Blueprint, request
from backend.app.extensions import db, bcrypt
from backend.app.models import User
from flask_jwt_extended import create_access_token

bp = Blueprint("auth", __name__)


@bp.post("/register")
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"ok": False, "error": "missing email or password"}, 400

    if User.query.filter_by(email=email).first():
        return {"ok": False, "error": "email already exists"}, 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(email=email, password=hashed)

    db.session.add(user)
    db.session.commit()

    return {"ok": True, "message": "user registered"}, 200


@bp.post("/login")
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"ok": False, "error": "missing credentials"}, 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"ok": False, "error": "invalid credentials"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"ok": False, "error": "invalid credentials"}, 401

    token = create_access_token(identity=str(user.id))

    return {"ok": True, "token": token}, 200


__all__ = ["bp"]
