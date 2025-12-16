from backend.app.extensions import db
from datetime import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # 🔥 MANQUAIT

    def __repr__(self):
        return f"<User {self.email}>"


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    target_hash = db.Column(db.String(255), nullable=False)
    strategy = db.Column(db.String(50), nullable=False)
    algo = db.Column(db.String(50), nullable=True)

    options = db.Column(db.JSON, nullable=True)

    status = db.Column(db.String(20), default="PENDING")
    plaintext = db.Column(db.String(255), nullable=True)
    tried = db.Column(db.Integer, default=0)
    duration = db.Column(db.Float, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_hash": self.target_hash,
            "strategy": self.strategy,
            "algo": self.algo,
            "options": self.options,
            "status": self.status,
            "plaintext": self.plaintext,
            "tried": self.tried,
            "duration": self.duration,
            "created_at": self.created_at.strftime("%d/%m/%Y %H:%M:%S"),
        }
