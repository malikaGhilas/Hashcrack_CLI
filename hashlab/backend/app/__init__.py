from flask import Flask
from flask_cors import CORS
from backend.app.config import Config
from backend.app.extensions import db, bcrypt, jwt


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS FULL FIX
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from backend.app.routes import register_blueprints
    register_blueprints(app)

    @app.get("/health")
    def health():
        return {"status": "ok"}, 200

    return app
