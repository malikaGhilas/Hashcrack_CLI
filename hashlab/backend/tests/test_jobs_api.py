import pytest
from backend.app.models import Job


def test_create_job_requires_auth(client):
    res = client.post("/api/v1/jobs", json={"hash": "e10adc3949ba59abbe56e057f20f883e", "strategy": "dictionary"})
    assert res.status_code in (401, 422)


def test_create_job_success_dictionary(app, client, auth_headers):
    res = client.post(
        "/api/v1/jobs",
        headers=auth_headers,
        json={"hash": "e10adc3949ba59abbe56e057f20f883e", "strategy": "dictionary"},
    )
    assert res.status_code in (200, 202)
    data = res.get_json()
    assert data["ok"] is True
    assert "job_id" in data

    with app.app_context():
        job = Job.query.get(data["job_id"])
        assert job is not None
        assert job.strategy == "dictionary"
        assert job.target_hash == "e10adc3949ba59abbe56e057f20f883e"


def test_create_job_missing_hash(client, auth_headers):
    res = client.post("/api/v1/jobs", headers=auth_headers, json={"strategy": "dictionary"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["ok"] is False


def test_create_job_default_strategy_dictionary(app, client, auth_headers):
    res = client.post("/api/v1/jobs", headers=auth_headers, json={"hash": "e10adc3949ba59abbe56e057f20f883e"})
    assert res.status_code in (200, 202)
    job_id = res.get_json()["job_id"]

    with app.app_context():
        job = Job.query.get(job_id)
        assert job.strategy == "dictionary"


def test_create_job_lowercases_hash(app, client, auth_headers):
    res = client.post("/api/v1/jobs", headers=auth_headers, json={"hash": "E10ADC3949BA59ABBE56E057F20F883E"})
    assert res.status_code in (200, 202)
    job_id = res.get_json()["job_id"]

    with app.app_context():
        job = Job.query.get(job_id)
        assert job.target_hash == "e10adc3949ba59abbe56e057f20f883e"


def test_create_job_accepts_algo(app, client, auth_headers):
    res = client.post(
        "/api/v1/jobs",
        headers=auth_headers,
        json={"hash": "e10adc3949ba59abbe56e057f20f883e", "strategy": "bruteforce", "algo": "md5"},
    )
    assert res.status_code in (200, 202)
    job_id = res.get_json()["job_id"]

    with app.app_context():
        job = Job.query.get(job_id)
        assert job.algo == "md5"


@pytest.mark.xfail(reason="TODO: dans create_job, stocker payload['options'] dans Job.options")
def test_create_job_persists_options(app, client, auth_headers):
    res = client.post(
        "/api/v1/jobs",
        headers=auth_headers,
        json={
            "hash": "e10adc3949ba59abbe56e057f20f883e",
            "strategy": "bruteforce",
            "algo": "md5",
            "options": {"charset": "0123", "min_length": 1, "max_length": 4},
        },
    )
    assert res.status_code in (200, 202)
    job_id = res.get_json()["job_id"]

    with app.app_context():
        job = Job.query.get(job_id)
        assert job.options == {"charset": "0123", "min_length": 1, "max_length": 4}


def test_create_job_accepts_unknown_strategy(app, client, auth_headers):
    res = client.post(
        "/api/v1/jobs",
        headers=auth_headers,
        json={"hash": "e10adc3949ba59abbe56e057f20f883e", "strategy": "unknown"},
    )
    assert res.status_code in (200, 202)
    job_id = res.get_json()["job_id"]

    with app.app_context():
        job = Job.query.get(job_id)
        assert job.strategy == "unknown"


def test_job_status_requires_auth(client):
    res = client.get("/api/v1/jobs/1")
    assert res.status_code in (401, 422)


def test_job_status_not_found(client, auth_headers):
    res = client.get("/api/v1/jobs/999999", headers=auth_headers)
    assert res.status_code == 404
    data = res.get_json()
    assert data["ok"] is False


def test_job_status_ok_payload(app, client, auth_headers):
    create = client.post("/api/v1/jobs", headers=auth_headers, json={"hash": "e10adc3949ba59abbe56e057f20f883e"})
    job_id = create.get_json()["job_id"]

    res = client.get(f"/api/v1/jobs/{job_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["ok"] is True
    assert "job" in data
    assert set(data["job"].keys()) >= {"id", "status", "plaintext", "tried", "duration", "strategy"}


def test_my_jobs_requires_auth(client):
    res = client.get("/api/v1/jobs/me")
    assert res.status_code in (401, 422)


def test_my_jobs_contains_created_job(client, auth_headers):
    create = client.post("/api/v1/jobs", headers=auth_headers, json={"hash": "e10adc3949ba59abbe56e057f20f883e"})
    assert create.status_code in (200, 202)

    res = client.get("/api/v1/jobs/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["ok"] is True
    assert isinstance(data["jobs"], list)
    assert len(data["jobs"]) >= 1


def test_my_jobs_returns_only_my_jobs(app, client, make_user):
    user1 = make_user()
    user2 = make_user()

    h1 = {"Authorization": f"Bearer {user1['token']}"}
    h2 = {"Authorization": f"Bearer {user2['token']}"}

    j1 = client.post("/api/v1/jobs", headers=h1, json={"hash": "e10adc3949ba59abbe56e057f20f883e"}).get_json()["job_id"]
    j2 = client.post("/api/v1/jobs", headers=h2, json={"hash": "e10adc3949ba59abbe56e057f20f883e"}).get_json()["job_id"]

    res1 = client.get("/api/v1/jobs/me", headers=h1).get_json()["jobs"]
    res2 = client.get("/api/v1/jobs/me", headers=h2).get_json()["jobs"]

    ids1 = {x["id"] for x in res1}
    ids2 = {x["id"] for x in res2}

    assert j1 in ids1
    assert j2 not in ids1

    assert j2 in ids2
    assert j1 not in ids2
