from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    allowed_origins = [
    "http://localhost:8100",
    "http://127.0.0.1:8100",
    ]
    # Add your deployed frontend (Netlify) from env var
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)


    
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    db.init_app(app)
    jwt.init_app(app)

    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app
