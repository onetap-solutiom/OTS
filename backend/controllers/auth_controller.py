from flask import request
from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import datetime, timezone

from database.db import db
from models.user_model import User
from utils.security import check_password
from utils.responses import success_response, error_response
from utils.validators import require_fields, is_valid_email, is_valid_password
import logging

logger = logging.getLogger('security')

from datetime import timedelta

# Simple in-memory rate limiter to prevent brute-force attacks
# Structure: { ip_address: [failed_attempts, locked_until_datetime] }
failed_logins = {}

def login():
    data = request.get_json(silent=True) or {}

    missing = require_fields(data, ['email', 'password'])
    if missing:
        return error_response(f"Missing fields: {', '.join(missing)}", 400)

    email    = data['email'].strip().lower()
    password = data['password'].strip()
    
    if not is_valid_email(email):
        logger.warning(f"Invalid email format attempted: {email} from IP {request.remote_addr}")
        return error_response("Invalid email format", 400)
        
    if not is_valid_password(password):
        logger.warning(f"Invalid password format attempted for email: {email} from IP {request.remote_addr}")
        return error_response("Invalid email or password", 401)
    ip       = request.remote_addr
    now      = datetime.now(timezone.utc)

    # Check rate limit
    if ip in failed_logins:
        attempts, locked_until = failed_logins[ip]
        if locked_until and now < locked_until:
            return error_response("Too many failed attempts. Try again later.", 429)
        elif locked_until and now >= locked_until:
            # Reset after lock expires
            failed_logins[ip] = [0, None]

    # Find active, non-deleted user
    user = User.query.filter_by(email=email, is_deleted=0, status='Active').first()

    if not user or not check_password(password, user.password_hash):
        # Increment failed attempts
        if ip not in failed_logins:
            failed_logins[ip] = [0, None]
        failed_logins[ip][0] += 1
        
        if failed_logins[ip][0] >= 5:
            # Lock out for 15 minutes after 5 failed attempts
            failed_logins[ip][1] = now + timedelta(minutes=15)
            logger.warning(f"BRUTE FORCE PROTECTION TRIGGERED: IP {ip} locked out for 15 minutes.")
            
        logger.warning(f"Failed login attempt for {email} from IP {ip}")
        return error_response("Invalid email or password", 401)

    # On success, clear attempts
    if ip in failed_logins:
        del failed_logins[ip]

    # Only superadmin / admin can log into the admin panel
    if user.role_slug not in ('superadmin', 'admin'):
        return error_response("Admin access required", 403)

    # Update last login info
    user.last_login_at = datetime.now(timezone.utc)
    user.last_login_ip = ip
    db.session.commit()
    
    logger.info(f"Successful admin login for {email} from IP {ip}")

    # Create JWT token
    access_token = create_access_token(identity=str(user.id))

    return success_response({
        'token': access_token,
        'user':  user.to_dict()
    }, "Login successful")


def get_current_user():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    if not user or user.is_deleted:
        return error_response("User not found", 404)

    return success_response({'user': user.to_dict()})
