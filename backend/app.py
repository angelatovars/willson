from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from settings.config import Config
from utils.db_config import create_connection

# Initialize the Flask application
app = Flask(__name__)

# Application configuration
app.config.from_object(Config)
app.config["JWT_SECRET_KEY"] = "your-secret-key"
# app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# Enable CORS for specified routes
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
from routes.profile_routes import api as profile_api
from routes.auth_routes import api as auth_api
from routes.ranking_routes import ranking_bp

app.register_blueprint(ranking_bp, url_prefix="/api")
app.register_blueprint(auth_api, url_prefix="/api/auth")
app.register_blueprint(profile_api, url_prefix="/api/profile")

# Import and register other routes
from routes.activity_routes import api as activity_api
from routes.games_routes import api as games_api

app.register_blueprint(activity_api, url_prefix="/api")
app.register_blueprint(games_api, url_prefix="/api")


# Token verification for revoked tokens
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    connection = create_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM RevokedTokens WHERE jti = %s"
            cursor.execute(query, (jti,))
            result = cursor.fetchone()
            return result is not None
    except Exception as e:
        print(f"Error checking if the token is revoked: {e}")
        return True
    finally:
        if connection:
            connection.close()


# Error handler for expired tokens
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {"message": "Token has expired", "error": "token_expired"}, 401


# Error handler for invalid tokens
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {"message": "Invalid token", "error": "invalid_token"}, 401


# Error handler for missing tokens
@jwt.unauthorized_loader
def missing_token_callback(error):
    return {
        "message": "Access token not provided",
        "error": "authorization_required",
    }, 401


if __name__ == "__main__":
    # Verify database connection on startup
    connection = create_connection()
    if connection:
        print("Database connection established successfully")
        connection.close()
    else:
        print("Error connecting to the database")

    print(app.url_map)

    app.run(debug=True, port=5000)
