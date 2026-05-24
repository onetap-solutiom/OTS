import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_talisman import Talisman
import logging

# Import configurations
from config import config

# Import database and migrate
from database.db import db, migrate

# Import Error Handlers & Middleware
from middleware.error_handler import register_error_handlers
from middleware.rate_limiter import limiter

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.project_routes import project_bp
from routes.service_routes import service_bp
from routes.contact_routes import contact_bp
from routes.team_routes import team_bp
from routes.testimonial_routes import testimonial_bp
from routes.newsletter_routes import newsletter_bp
from routes.user_routes import user_bp
from routes.news_routes import news_bp
from routes.stats_routes import stats_bp
from routes.setting_routes import setting_bp
from models.visit_model import Visit
from models.setting_model import Setting
from models.token_blocklist import TokenBlocklist


def create_app(config_name='default'):
    """Factory function to create and configure the Flask app."""
    # Configure logging
    logging.basicConfig(
        filename=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'security.log'),
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    origins = app.config.get('FRONTEND_URL', '*')
    if config_name == 'production' and origins == '*':
        raise ValueError("FRONTEND_URL must be strictly defined in production!")
    CORS(app, resources={r"/api/*": {"origins": origins}})
    
    # Initialize Talisman for security headers
    is_prod = config_name == 'production'
    # For API, we might need to adjust CSP, but default is usually fine for pure JSON APIs
    Talisman(app, force_https=is_prod, session_cookie_secure=is_prod)
    
    # Initialize Database and Migrate
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize global Rate Limiter
    limiter.init_app(app)
    
    # Auto-create tables (e.g. visits)
    with app.app_context():
        db.create_all()
        # Add new columns to settings table if they don't exist
        try:
            from sqlalchemy import text
            for col, col_type in [
                ('projects_done', 'INTEGER NOT NULL DEFAULT 1'),
                ('trusted_partners', 'INTEGER NOT NULL DEFAULT 20'),
                ('services_provided', 'INTEGER NOT NULL DEFAULT 7'),
                ('satisfaction_rate', 'INTEGER NOT NULL DEFAULT 99')
            ]:
                try:
                    db.session.execute(text(f"ALTER TABLE settings ADD COLUMN {col} {col_type}"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()  # Column probably already exists
        except Exception as e:
            app.logger.warning(f"Auto-migration warning: {e}")
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
        return token is not None
    
    # Create uploads directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register Error Handlers
    register_error_handlers(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(service_bp, url_prefix='/api/services')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(team_bp, url_prefix='/api/team')
    app.register_blueprint(testimonial_bp, url_prefix='/api/testimonials')
    app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(news_bp, url_prefix='/api/news')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(setting_bp, url_prefix='/api/settings')
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {"success": True, "message": "Backend is running flawlessly."}, 200
        
    return app

# Determine environment
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
