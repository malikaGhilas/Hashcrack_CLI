from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.app.extensions import db
from backend.app.models import Job

bp = Blueprint("jobs", __name__)

@bp.post("")
@jwt_required()
def create_job():
    payload = request.get_json(silent=True) or {}
    target = (payload.get("hash") or "").strip().lower()
    algo = payload.get("algo")
    strategy = (payload.get("strategy") or "dictionary").lower()

    if not target:
        return jsonify({"ok": False, "error": "missing hash"}), 400

    user_id = int(get_jwt_identity())

    job = Job(
        user_id=user_id,
        target_hash=target,
        algo=algo,
        strategy=strategy,
        status="PENDING",
    )
    db.session.add(job)
    db.session.commit()

    from backend.app.tasks.crack_job import crack_job
    crack_job.delay(job.id)

    return jsonify({"ok": True, "job_id": job.id}), 202


@bp.get("/<int:job_id>")
@jwt_required()
def job_status(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"ok": False, "error": "Job not found"}), 404

    return jsonify({
        "ok": True,
        "job": {
            "id": job.id,
            "status": job.status,
            "plaintext": job.plaintext,
            "tried": job.tried,
            "duration": job.duration,
            "strategy": job.strategy
        }
    })


@bp.get("/me")
@jwt_required()
def my_jobs():
    user_id = int(get_jwt_identity())
    jobs = Job.query.filter_by(user_id=user_id).order_by(Job.created_at.desc()).all()

    return jsonify({
        "ok": True,
        "jobs": [
            {
                "id": j.id,
                "status": j.status,
                "strategy": j.strategy,
                "plaintext": j.plaintext,
                "duration": j.duration,
                "created_at": j.created_at.isoformat()
            }
            for j in jobs
        ]
    })
