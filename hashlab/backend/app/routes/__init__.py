from backend.app.routes.auth import bp as auth_bp
from backend.app.routes.jobs import bp as jobs_bp
from backend.app.routes.crack import bp as crack_bp
from backend.app.routes.hash import bp as hash_bp
from backend.app.routes.password import bp as password_bp


def register_blueprints(app):
    """
    Enregistre TOUS les blueprints de l'application.
    """

    # Authentification
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")

    # Gestion des jobs (cracking async)
    app.register_blueprint(jobs_bp, url_prefix="/api/v1/jobs")

    # Crack synchrone (optionnel)
    app.register_blueprint(crack_bp, url_prefix="/api/v1/crack")

    # Hash utilitaire
    app.register_blueprint(hash_bp, url_prefix="/api/v1/hash")

    # Vérification de force de mot de passe (placeholder)
    app.register_blueprint(password_bp, url_prefix="/api/v1/password")
