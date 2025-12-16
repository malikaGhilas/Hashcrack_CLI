import uuid
import pytest
from datetime import timedelta

from backend.app import create_app
from backend.app.extensions import db


class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret"
    JWT_SECRET_KEY = "test-jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture()
def app(tmp_path):
    db_path = tmp_path / "test.db"

    class _Cfg(TestConfig):
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"

    app = create_app(_Cfg)

    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _register(client, email: str, password: str):
    return client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )


def _login(client, email: str, password: str):
    return client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )


@pytest.fixture()
def make_user(client):
    """
    Crée un user + login et retourne {email, password, token}.
    """
    def _make(email=None, password="123456"):
        if email is None:
            email = f"user_{uuid.uuid4().hex[:10]}@test.com"

        r = _register(client, email, password)
        # On accepte soit 200 OK (créé), soit 400 si déjà exist (dans certains cas)
        # mais en tests on génère un email unique donc normalement 200.
        assert r.status_code in (200, 400)

        l = _login(client, email, password)
        assert l.status_code == 200
        data = l.get_json()
        assert data and data.get("ok") is True
        token = data.get("token")
        assert token

        return {"email": email, "password": password, "token": token}

    return _make


@pytest.fixture()
def auth_headers(make_user):
    user = make_user()
    return {"Authorization": f"Bearer {user['token']}"}


@pytest.fixture(autouse=True)
def stub_celery_delay(monkeypatch):
    """
    Pour que les tests API ne dépendent pas de Redis/Celery.
    Le endpoint POST /api/v1/jobs appelle crack_job.delay() => on le neutralise.
    """
    try:
        import backend.app.tasks.crack_job as crack_job_module
        # crack_job est une task celery décorée, elle a un .delay()
        monkeypatch.setattr(
            crack_job_module.crack_job,
            "delay",
            lambda *args, **kwargs: None,
            raising=False,
        )
    except Exception:
        # si l'import échoue dans certains tests, on ignore
        pass
