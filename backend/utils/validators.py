from email_validator import validate_email, EmailNotValidError

def is_valid_email(email):
    """Strict email validation."""
    if not email:
        return False
    try:
        validate_email(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        return False

def is_valid_password(password):
    """Enforce minimum password length for security."""
    if not password or len(password) < 8:
        return False
    return True

def require_fields(data, required_keys):
    """Check if required fields are present in the dictionary."""
    missing = []
    for key in required_keys:
        if key not in data or data[key] is None or str(data[key]).strip() == '':
            missing.append(key)
    return missing
