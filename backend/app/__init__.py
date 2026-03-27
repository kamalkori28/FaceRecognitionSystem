from flask import Flask
from flask_cors import CORS
from flask_sock import Sock

from app.api.routes import api_bp, register_websocket_routes
from app.core.config import settings
from app.db.extensions import db
from app.services.activity_service import activity_service
from app.services.auth_service import auth_service
from app.services.encoding_service import encoding_service
from app.services.recognition_service import recognition_service


sock = Sock()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(
        app,
        resources={r"/api/*": {"origins": settings.cors_origins}},
        supports_credentials=True,
    )
    db.init_app(app)
    sock.init_app(app)

    with app.app_context():
        db.create_all()
        auth_service.seed_admin()
        encoding_service.ensure_encoding_file()
        recognition_service.refresh_known_faces()
        activity_service.log(
            level="system",
            message="Face recognition backend booted successfully.",
        )

    app.register_blueprint(api_bp, url_prefix="/api")
    register_websocket_routes(sock)
    return app
