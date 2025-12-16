import pytest

from backend.app.extensions import db
from backend.app.models import User, Job
from backend.app.services.cracking import hash_of


def _create_user(app, email="task@test.com", password_hash="$2b$fakehash"):
    with app.app_context():
        u = User(email=email, password=password_hash)
        db.session.add(u)
        db.session.commit()
        return u.id


def _create_job(app, user_id, target_hash, strategy, algo=None, options=None):
    with app.app_context():
        j = Job(
            user_id=user_id,
            target_hash=target_hash,
            strategy=strategy,
            algo=algo,
            options=options,
            status="PENDING",
        )
        db.session.add(j)
        db.session.commit()
        return j.id


def test_crack_job_returns_error_if_job_not_found(app, monkeypatch):
    import backend.app.tasks.crack_job as mod

    with app.app_context():
        res = mod.crack_job(999999)
        assert "error" in res


