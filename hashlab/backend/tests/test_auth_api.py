from backend.app.models import User
from backend.app.extensions import db


def test_register_success(app, client):
    res = client.post("/api/v1/auth/register", json={"email": "a@test.com", "password": "123456"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["ok"] is True


def test_register_missing_email(client):
    res = client.post("/api/v1/auth/register", json={"password": "123456"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_register_missing_password(client):
    res = client.post("/api/v1/auth/register", json={"email": "b@test.com"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_register_missing_both(client):
    res = client.post("/api/v1/auth/register", json={})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_register_duplicate_email(client):
    client.post("/api/v1/auth/register", json={"email": "dup@test.com", "password": "123456"})
    res = client.post("/api/v1/auth/register", json={"email": "dup@test.com", "password": "123456"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_login_success_returns_token(client):
    client.post("/api/v1/auth/register", json={"email": "login@test.com", "password": "123456"})
    res = client.post("/api/v1/auth/login", json={"email": "login@test.com", "password": "123456"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["ok"] is True
    assert isinstance(data["token"], str)
    # JWT = 3 parties séparées par des points
    assert data["token"].count(".") == 2


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"email": "badpw@test.com", "password": "123456"})
    res = client.post("/api/v1/auth/login", json={"email": "badpw@test.com", "password": "WRONG"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["ok"] is False


def test_login_unknown_email(client):
    res = client.post("/api/v1/auth/login", json={"email": "unknown@test.com", "password": "123456"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["ok"] is False


def test_login_missing_both(client):
    res = client.post("/api/v1/auth/login", json={})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_login_missing_email(client):
    res = client.post("/api/v1/auth/login", json={"password": "123456"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_login_missing_password(client):
    res = client.post("/api/v1/auth/login", json={"email": "x@test.com"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_password_is_hashed_in_db(app, client):
    email = "hash@test.com"
    password = "123456"
    client.post("/api/v1/auth/register", json={"email": email, "password": password})

    with app.app_context():
        u = User.query.filter_by(email=email).first()
        assert u is not None
        assert u.password != password
        # bcrypt hash contient souvent "$2"
        assert "$2" in u.password
        db.session.rollback()
