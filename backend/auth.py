
"""
VulneraAI Authentication and CSRF Protection

Authentication:
- PostgreSQL-backed server-side sessions
- HttpOnly session cookies
- CSRF protection using Synchronizer Token Pattern
- Email verification
- Login, logout, profile and password endpoints
"""

import os
import re
import secrets
import smtplib

from datetime import timedelta
from email.message import EmailMessage
from functools import wraps
from hashlib import sha256
from hmac import compare_digest

from flask import Blueprint, g, jsonify, request
from limiter import limiter
from logger import logger
from sqlalchemy import func, select
from werkzeug.security import check_password_hash, generate_password_hash

from database import (
    AuthSession,
    EmailVerification,
    SessionLocal,
    User,
    utc_now,
)


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# --------------------------------------------------
# Configuration
# --------------------------------------------------

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_SECONDS = 60

PASSWORD_RESET_EXPIRY_MINUTES = 5
PASSWORD_RESET_MAX_ATTEMPTS = 5
PASSWORD_RESET_RESEND_SECONDS = 60

SESSION_COOKIE_NAME = "vulneraai_session"

SESSION_EXPIRES_HOURS = int(
    os.getenv("SESSION_EXPIRES_HOURS", "24")
)

SESSION_COOKIE_HTTPONLY = True

SESSION_COOKIE_SECURE = (
    os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
)

SESSION_COOKIE_SAMESITE = os.getenv(
    "SESSION_COOKIE_SAMESITE", "Lax"
)

SESSION_COOKIE_PATH = "/"

# CSRF configuration
CSRF_HEADER_NAME = "X-CSRF-Token"

CSRF_PROTECTED_METHODS = {
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
}


# Persistent secret required for OTP hashing.
OTP_SECRET_KEY = (
    os.getenv("OTP_SECRET_KEY")
    or os.getenv("SECRET_KEY")
    or os.getenv("JWT_SECRET_KEY")
)

if not OTP_SECRET_KEY:
    OTP_SECRET_KEY = secrets.token_hex(32)
    logger.warning(
        "OTP_SECRET_KEY is not configured. "
        "OTP verification may stop working after a restart."
    )


# Temporary reset OTP storage.
# This will be migrated to PostgreSQL in a later step.
password_reset_otps = {}


# --------------------------------------------------
# General helpers
# --------------------------------------------------

# Password policy shared by signup, change-password and reset-password.
# Keep in sync with frontend/src/lib/password.ts.
COMMON_PASSWORDS = {
    "password", "passw0rd", "12345678", "123456789", "1234567890",
    "qwertyui", "qwerty123", "iloveyou", "welcome1", "admin123",
    "letmein1", "abc12345", "password1", "sunshine", "princess",
    "football", "monkey123", "dragon123", "trustno1", "superman",
    "starwars", "whatever", "zaq12wsx", "qazwsxed", "1q2w3e4r",
    "1qaz2wsx", "baseball", "michael1", "shadow123", "ashley123",
    "jordan23", "hunter02", "harley123", "ranger123", "buster123",
    "thomas123", "robert123", "soccer123", "batman123", "test1234",
    "summer2024", "winter2024", "spring2024", "autumn2024",
    "changeme", "letmein123", "welcome123", "admin1234", "root1234",
    "user1234", "demo1234", "vulneraai", "vulneraai1", "polyguard",
    "polyguard1",
}


def validate_password(password: str) -> str | None:
    """Return an error message when the password fails the policy.

    Policy: at least 8 characters with an uppercase letter, a lowercase
    letter, a number and a symbol, and not a known common password.
    Returns None when the password is acceptable.
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        return (
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
        )
    if not re.search(r"[A-Z]", password):
        return "Password must include an uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must include a lowercase letter."
    if not re.search(r"[0-9]", password):
        return "Password must include a number."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password must include a symbol."
    if password.lower() in COMMON_PASSWORDS:
        return "This password is too common. Please choose another."
    return None

def error(message, status):
    return jsonify({"error": message}), status


def read_json():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def clean_email(value) -> str:
    return str(value or "").strip().lower()


def email_taken(email: str, exclude_user_id: int | None = None) -> bool:
    query = select(User.id).where(func.lower(User.email) == email)

    if exclude_user_id is not None:
        query = query.where(User.id != exclude_user_id)

    return SessionLocal.execute(query).first() is not None


# --------------------------------------------------
# Server-side session helpers
# --------------------------------------------------

def hash_session_id(session_id: str) -> str:
    """Hash the raw session ID before storing it in PostgreSQL."""

    return sha256(session_id.encode("utf-8")).hexdigest()


def create_server_session(user: User) -> tuple[str, str]:
    """
    Create an authenticated server-side session.

    The raw session ID is returned only for the HttpOnly cookie.
    A separate CSRF token is stored in the session data.
    """

    old_session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if old_session_id:
        delete_server_session(old_session_id)

    session_id = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)

    now = utc_now()

    auth_session = AuthSession(
        session_id_hash=hash_session_id(session_id),
        session_data={
            "user_id": user.id,
            "csrf_token": csrf_token,
        },
        created_at=now,
        expires_at=now + timedelta(hours=SESSION_EXPIRES_HOURS),
    )

    SessionLocal.add(auth_session)
    SessionLocal.commit()

    return session_id, csrf_token


def create_anonymous_session() -> tuple[str, str]:
    """
    Create a temporary anonymous session.

    This allows CSRF protection to work before login,
    including signup, login and password-reset requests.
    """

    old_session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if old_session_id:
        delete_server_session(old_session_id)

    session_id = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)

    now = utc_now()

    auth_session = AuthSession(
        session_id_hash=hash_session_id(session_id),
        session_data={
            "csrf_token": csrf_token,
        },
        created_at=now,
        expires_at=now + timedelta(hours=SESSION_EXPIRES_HOURS),
    )

    SessionLocal.add(auth_session)
    SessionLocal.commit()

    return session_id, csrf_token


def set_session_cookie(response, session_id: str):
    """Set the authentication cookie."""

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=SESSION_EXPIRES_HOURS * 60 * 60,
        httponly=SESSION_COOKIE_HTTPONLY,
        secure=SESSION_COOKIE_SECURE,
        samesite=SESSION_COOKIE_SAMESITE,
        path=SESSION_COOKIE_PATH,
    )

    return response


def clear_session_cookie(response):
    """Clear the authentication cookie from the browser."""

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path=SESSION_COOKIE_PATH,
        httponly=SESSION_COOKIE_HTTPONLY,
        secure=SESSION_COOKIE_SECURE,
        samesite=SESSION_COOKIE_SAMESITE,
    )

    return response


def delete_server_session(session_id: str) -> None:
    """Delete one server-side session."""

    if not session_id:
        return

    session_hash = hash_session_id(session_id)

    auth_session = SessionLocal.get(AuthSession, session_hash)

    if auth_session is not None:
        SessionLocal.delete(auth_session)
        SessionLocal.commit()


def get_server_session(session_id: str):
    """Return a valid PostgreSQL session or None."""

    if not session_id:
        return None

    session_hash = hash_session_id(session_id)

    auth_session = SessionLocal.get(AuthSession, session_hash)

    if auth_session is None:
        return None

    if utc_now() >= auth_session.expires_at:
        SessionLocal.delete(auth_session)
        SessionLocal.commit()
        return None

    return auth_session


def delete_user_sessions(user_id: int) -> None:
    """
    Invalidate all sessions belonging to a user.

    Current schema stores user_id inside session_data JSON.
    """

    sessions = SessionLocal.execute(
        select(AuthSession)
    ).scalars().all()

    for auth_session in sessions:
        session_data = auth_session.session_data or {}

        if str(session_data.get("user_id")) == str(user_id):
            SessionLocal.delete(auth_session)

    SessionLocal.commit()


def create_authenticated_response(user: User, message: str):
    """
    Create a new authenticated session.

    Returns the new CSRF token in JSON.
    The session ID remains inside the HttpOnly cookie.
    """

    session_id, csrf_token = create_server_session(user)

    response = jsonify({
        "message": message,
        "user": user.to_dict(),
        "csrf_token": csrf_token,
    })

    return set_session_cookie(response, session_id)


# --------------------------------------------------
# CSRF protection
# --------------------------------------------------

@auth_bp.route("/csrf-token", methods=["GET"])
def get_csrf_token():
    """
    Get a CSRF token.

    If no valid session exists, create an anonymous session.
    Otherwise, return the CSRF token associated with the
    existing server-side session.
    """

    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    auth_session = (
        get_server_session(session_id)
        if session_id
        else None
    )

    if auth_session is None:

        session_id, csrf_token = create_anonymous_session()

        response = jsonify({
            "csrf_token": csrf_token,
        })

        response.headers["Cache-Control"] = "no-store"

        return set_session_cookie(response, session_id)

    session_data = dict(auth_session.session_data or {})

    csrf_token = session_data.get("csrf_token")

    if not csrf_token:

        csrf_token = secrets.token_urlsafe(32)

        session_data["csrf_token"] = csrf_token

        # Assign a new dictionary so SQLAlchemy detects the change.
        auth_session.session_data = session_data

        SessionLocal.commit()

    response = jsonify({
        "csrf_token": csrf_token,
    })

    response.headers["Cache-Control"] = "no-store"

    return response


@auth_bp.before_app_request
def validate_csrf_token():
    """
    Validate CSRF tokens for unsafe HTTP methods.

    The token must match the value stored in the
    PostgreSQL server-side session.

    This hook also protects unsafe authenticated API
    requests outside the auth blueprint.
    """

    if request.method not in CSRF_PROTECTED_METHODS:
        return None

    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    # Requests without a session cookie are not authenticated
    # through cookie-based sessions. Auth endpoints still require
    # an anonymous session for CSRF protection.
    is_auth_endpoint = (
        request.endpoint is not None
        and request.endpoint.startswith("auth.")
    )

    if not session_id:

        if is_auth_endpoint:
            return error(
                "CSRF session missing. Please refresh and try again.",
                403,
            )

        return None

    auth_session = get_server_session(session_id)

    if auth_session is None:
        return error(
            "Invalid session. Please refresh and try again.",
            403,
        )

    session_data = auth_session.session_data or {}

    stored_token = session_data.get("csrf_token")

    submitted_token = request.headers.get(CSRF_HEADER_NAME)

    if not stored_token or not submitted_token:
        return error("CSRF token missing.", 403)

    if not compare_digest(
        str(stored_token),
        str(submitted_token),
    ):
        return error("Invalid CSRF token.", 403)

    return None


# --------------------------------------------------
# Email OTP helpers
# --------------------------------------------------

def _otp_digest(code: str) -> str:
    """Store a keyed digest instead of the OTP itself."""

    value = f"{OTP_SECRET_KEY}:{code}".encode("utf-8")

    return sha256(value).hexdigest()


def _send_email(to_email: str, code: str) -> None:

    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_email or not smtp_password:
        raise RuntimeError(
            "SMTP_EMAIL or SMTP_PASSWORD is missing from the root .env file."
        )

    message = EmailMessage()
    message["Subject"] = "Verify your VulneraAI account"
    message["From"] = smtp_email
    message["To"] = to_email

    message.set_content(
        f"""Hello,

Thank you for signing up for VulneraAI.

Your email verification code is:

{code}

This code expires in {OTP_EXPIRY_MINUTES} minutes.

If you did not create this account, you can ignore this email.

VulneraAI Security Team
"""
    )

    with smtplib.SMTP(smtp_server, smtp_port, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_email, smtp_password)
        server.send_message(message)


def issue_verification_code(user: User):
    """Create and email a new verification OTP."""

    now = utc_now()

    verification = SessionLocal.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id
        )
    ).scalar_one_or_none()

    if verification is not None:

        elapsed = (now - verification.sent_at).total_seconds()
        remaining = OTP_RESEND_SECONDS - int(elapsed)

        if remaining > 0:
            return (
                False,
                f"Please wait {remaining} seconds before requesting another code.",
                429,
            )

    code = f"{secrets.randbelow(10 ** OTP_LENGTH):0{OTP_LENGTH}d}"

    if verification is None:

        verification = EmailVerification(
            user_id=user.id,
            otp_hash=_otp_digest(code),
            expires_at=now + timedelta(minutes=OTP_EXPIRY_MINUTES),
            sent_at=now,
            attempts=0,
        )

        SessionLocal.add(verification)

    else:

        verification.otp_hash = _otp_digest(code)
        verification.expires_at = now + timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
        verification.sent_at = now
        verification.attempts = 0

    SessionLocal.commit()

    try:
        _send_email(user.email, code)

    except Exception:
        # Full traceback goes to the log file; the user sees a generic message.
        logger.exception("Verification email could not be sent to %s", user.email)

        SessionLocal.delete(verification)
        SessionLocal.commit()

        return (
            False,
            "We could not send the verification email. Check SMTP settings and try again.",
            503,
        )

    return True, "Verification code sent successfully.", 200


# --------------------------------------------------
# Password reset email helper
# --------------------------------------------------

def _send_password_reset_email(to_email: str, code: str) -> None:

    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_email or not smtp_password:
        raise RuntimeError(
            "SMTP_EMAIL or SMTP_PASSWORD is missing from the root .env file."
        )

    message = EmailMessage()
    message["Subject"] = "VulneraAI Password Reset Code"
    message["From"] = smtp_email
    message["To"] = to_email

    message.set_content(
        f"""Hello,

We received a request to reset your VulneraAI password.

Your password reset code is:

{code}

This code expires in {PASSWORD_RESET_EXPIRY_MINUTES} minutes.

If you did not request this reset, please ignore this email.

VulneraAI Security Team
"""
    )

    with smtplib.SMTP(smtp_server, smtp_port, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_email, smtp_password)
        server.send_message(message)


# --------------------------------------------------
# PostgreSQL session authentication decorator
# --------------------------------------------------

def login_required(view):
    """
    Require a valid server-side session cookie.

    No JWT or Authorization Bearer header is used.
    """

    @wraps(view)
    def wrapper(*args, **kwargs):

        session_id = request.cookies.get(SESSION_COOKIE_NAME)

        if not session_id:
            return error("Please log in to continue.", 401)

        auth_session = get_server_session(session_id)

        if auth_session is None:

            response, status = error(
                "Your session is invalid or expired. Please log in again.",
                401,
            )

            clear_session_cookie(response)

            return response, status

        session_data = auth_session.session_data or {}

        user_id = session_data.get("user_id")

        if user_id is None:
            delete_server_session(session_id)
            return error("Invalid session. Please log in again.", 401)

        try:
            user = SessionLocal.get(User, int(user_id))

        except (TypeError, ValueError):
            delete_server_session(session_id)
            return error("Invalid session. Please log in again.", 401)

        if user is None:
            delete_server_session(session_id)
            return error("Account not found. Please log in again.", 401)

        if not user.email_verified:
            delete_server_session(session_id)
            return error("Please verify your email to continue.", 403)

        g.user = user
        g.auth_session = auth_session

        return view(*args, **kwargs)

    return wrapper


# --------------------------------------------------
# Signup
# --------------------------------------------------

@auth_bp.route("/signup", methods=["POST"])
@limiter.limit("3 per minute")
def signup():

    data = read_json()

    name = str(data.get("name") or "").strip()
    email = clean_email(data.get("email"))
    password = str(data.get("password") or "")

    if not name:
        return error("Please enter your name.", 400)

    if len(name) > 120:
        return error("Name must be 120 characters or fewer.", 400)

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    password_error = validate_password(password)
    if password_error:
        return error(password_error, 400)

    existing_user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    if existing_user is not None:

        if existing_user.email_verified:
            return error("An account with this email already exists.", 409)

        if not check_password_hash(
            existing_user.password_hash,
            password,
        ):
            return error(
                "An unverified account already exists with this email. "
                "Use the original password or contact support.",
                409,
            )

        success, message, status = issue_verification_code(existing_user)

        if not success:
            return error(message, status)

        return jsonify({
            "message": message,
            "email": existing_user.email,
        }), 200

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        email_verified=False,
    )

    SessionLocal.add(user)
    SessionLocal.commit()

    success, message, status = issue_verification_code(user)

    if not success:
        return error(message, status)

    return jsonify({
        "message": message,
        "email": user.email,
    }), 201


# --------------------------------------------------
# Verify email
# --------------------------------------------------

@auth_bp.route("/verify-email", methods=["POST"])
@limiter.limit("5 per minute")
def verify_email():

    data = read_json()

    email = clean_email(data.get("email"))
    code = str(data.get("code") or "").strip()

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    if not re.fullmatch(r"\d{6}", code):
        return error("Please enter the 6-digit verification code.", 400)

    user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    if user is None:
        return error("Invalid email or verification code.", 400)

    if user.email_verified:
        return error("This email address is already verified.", 400)

    verification = SessionLocal.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id
        )
    ).scalar_one_or_none()

    if verification is None:
        return error(
            "No active verification code. Please request a new code.",
            400,
        )

    now = utc_now()

    if now > verification.expires_at:

        SessionLocal.delete(verification)
        SessionLocal.commit()

        return error(
            "Verification code has expired. Request a new one.",
            400,
        )

    if verification.attempts >= OTP_MAX_ATTEMPTS:

        SessionLocal.delete(verification)
        SessionLocal.commit()

        return error(
            "Maximum attempts reached. Please request a new code.",
            429,
        )

    submitted_digest = _otp_digest(code)

    if not compare_digest(
        submitted_digest,
        verification.otp_hash,
    ):

        verification.attempts += 1
        SessionLocal.commit()

        remaining = OTP_MAX_ATTEMPTS - verification.attempts

        if remaining <= 0:

            SessionLocal.delete(verification)
            SessionLocal.commit()

            return error(
                "Maximum attempts reached. Please request a new code.",
                429,
            )

        return error(
            f"Incorrect verification code. {remaining} attempts remaining.",
            400,
        )

    user.email_verified = True

    SessionLocal.delete(verification)
    SessionLocal.commit()

    return create_authenticated_response(
        user,
        "Email verified successfully.",
    )


# --------------------------------------------------
# Resend verification code
# --------------------------------------------------

@auth_bp.route("/resend-verification", methods=["POST"])
@limiter.limit("2 per minute")
def resend_verification():

    data = read_json()

    email = clean_email(data.get("email"))

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    if user is None:
        return error(
            "No unverified account was found for this email.",
            404,
        )

    if user.email_verified:
        return error("This email address is already verified.", 400)

    success, message, status = issue_verification_code(user)

    if not success:
        return error(message, status)

    return jsonify({"message": message}), 200


# --------------------------------------------------
# Login
# --------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():

    data = read_json()

    email = clean_email(data.get("email"))
    password = str(data.get("password") or "")

    user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    if user is None or not check_password_hash(
        user.password_hash,
        password,
    ):
        return error("Incorrect email or password.", 401)

    if not user.email_verified:
        return error(
            "Please verify your email before logging in. "
            "Return to signup to request a new verification code.",
            403,
        )

    return create_authenticated_response(
        user,
        "Login successful.",
    )


# --------------------------------------------------
# Logout
# --------------------------------------------------

@auth_bp.route("/logout", methods=["POST"])
def logout():

    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if session_id:
        delete_server_session(session_id)

    response = jsonify({
        "message": "Logged out successfully."
    })

    return clear_session_cookie(response)


# --------------------------------------------------
# Profile
# --------------------------------------------------

@auth_bp.route("/me", methods=["GET"])
@login_required
def get_me():

    return jsonify({
        "user": g.user.to_dict()
    })


@auth_bp.route("/me", methods=["PATCH"])
@login_required
def update_me():

    data = read_json()
    user = g.user

    if "name" in data:

        name = str(data.get("name") or "").strip()

        if not name:
            return error("Name cannot be empty.", 400)

        if len(name) > 120:
            return error("Name must be 120 characters or fewer.", 400)

        user.name = name

    if "email" in data:

        email = clean_email(data.get("email"))

        if not EMAIL_PATTERN.match(email):
            return error("Please enter a valid email address.", 400)

        if email_taken(email, exclude_user_id=user.id):
            return error("Another account already uses this email.", 409)

        user.email = email

    SessionLocal.commit()

    return jsonify({
        "user": user.to_dict()
    })


# --------------------------------------------------
# Change password
# --------------------------------------------------

@auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password():

    data = read_json()

    current_password = str(data.get("current_password") or "")
    new_password = str(data.get("new_password") or "")

    if not check_password_hash(
        g.user.password_hash,
        current_password,
    ):
        return error("Current password is incorrect.", 400)

    password_error = validate_password(new_password)
    if password_error:
        return error(password_error, 400)

    user_id = g.user.id

    g.user.password_hash = generate_password_hash(new_password)
    SessionLocal.commit()

    delete_user_sessions(user_id)

    response = jsonify({
        "message": "Password updated successfully. Please log in again."
    })

    return clear_session_cookie(response)


# --------------------------------------------------
# Delete account
# --------------------------------------------------

@auth_bp.route("/me", methods=["DELETE"])
@login_required
def delete_me():

    data = read_json()
    password = str(data.get("password") or "")

    if not check_password_hash(
        g.user.password_hash,
        password,
    ):
        return error("Password is incorrect.", 400)

    user_id = g.user.id

    delete_user_sessions(user_id)

    SessionLocal.delete(g.user)
    SessionLocal.commit()

    response = jsonify({
        "message": "Account deleted."
    })

    return clear_session_cookie(response)


# --------------------------------------------------
# Forgot password: request OTP
# --------------------------------------------------

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per minute")
def forgot_password():

    data = read_json()

    email = clean_email(data.get("email"))

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    generic_message = (
        "If an account exists with this email, a reset code has been sent."
    )

    if user is None or not user.email_verified:
        return jsonify({"message": generic_message}), 200

    now = utc_now()

    existing = password_reset_otps.get(email)

    if existing:

        elapsed = (now - existing["sent_at"]).total_seconds()
        remaining = PASSWORD_RESET_RESEND_SECONDS - int(elapsed)

        if remaining > 0:
            return error(
                f"Please wait {remaining} seconds before requesting another code.",
                429,
            )

    code = f"{secrets.randbelow(10 ** OTP_LENGTH):0{OTP_LENGTH}d}"

    password_reset_otps[email] = {
        "otp_hash": _otp_digest(code),
        "expires_at": now + timedelta(
            minutes=PASSWORD_RESET_EXPIRY_MINUTES
        ),
        "sent_at": now,
        "attempts": 0,
        "verified": False,
    }

    try:
        _send_password_reset_email(user.email, code)

    except Exception:
        # Full traceback goes to the log file; the user sees a generic message.
        logger.exception("Password reset email could not be sent to %s", email)

        password_reset_otps.pop(email, None)

        return error(
            "We could not send the reset email. Please try again later.",
            503,
        )

    return jsonify({
        "message": generic_message
    }), 200


# --------------------------------------------------
# Forgot password: verify OTP
# --------------------------------------------------

@auth_bp.route("/verify-reset-otp", methods=["POST"])
@limiter.limit("5 per minute")
def verify_reset_otp():

    data = read_json()

    email = clean_email(data.get("email"))
    code = str(data.get("code") or "").strip()

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    if not re.fullmatch(r"\d{6}", code):
        return error("Please enter the 6-digit reset code.", 400)

    record = password_reset_otps.get(email)

    if record is None:
        return error(
            "No active reset code. Please request a new one.",
            400,
        )

    if utc_now() > record["expires_at"]:

        password_reset_otps.pop(email, None)

        return error(
            "Reset code has expired. Request a new one.",
            400,
        )

    if record["attempts"] >= PASSWORD_RESET_MAX_ATTEMPTS:

        password_reset_otps.pop(email, None)

        return error(
            "Maximum attempts reached. Please request a new code.",
            429,
        )

    if not compare_digest(
        _otp_digest(code),
        record["otp_hash"],
    ):

        record["attempts"] += 1

        remaining = PASSWORD_RESET_MAX_ATTEMPTS - record["attempts"]

        if remaining <= 0:

            password_reset_otps.pop(email, None)

            return error(
                "Maximum attempts reached. Please request a new code.",
                429,
            )

        return error(
            f"Incorrect reset code. {remaining} attempts remaining.",
            400,
        )

    record["verified"] = True

    return jsonify({
        "message": "Reset code verified successfully."
    }), 200


# --------------------------------------------------
# Forgot password: set new password
# --------------------------------------------------

@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("5 per minute")
def reset_password():

    data = read_json()

    email = clean_email(data.get("email"))
    code = str(data.get("code") or "").strip()
    new_password = str(data.get("new_password") or "")

    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)

    if not re.fullmatch(r"\d{6}", code):
        return error("Please enter the 6-digit reset code.", 400)

    password_error = validate_password(new_password)
    if password_error:
        return error(password_error, 400)

    record = password_reset_otps.get(email)

    if record is None:
        return error(
            "Please request a new password reset code.",
            400,
        )

    if utc_now() > record["expires_at"]:

        password_reset_otps.pop(email, None)

        return error(
            "Reset code has expired. Request a new one.",
            400,
        )

    if not record["verified"]:
        return error(
            "Please verify your reset code first.",
            403,
        )

    if not compare_digest(
        _otp_digest(code),
        record["otp_hash"],
    ):
        return error("Invalid reset code.", 400)

    user = SessionLocal.execute(
        select(User).where(func.lower(User.email) == email)
    ).scalar_one_or_none()

    if user is None or not user.email_verified:

        password_reset_otps.pop(email, None)

        return error(
            "Unable to reset password for this account.",
            400,
        )

    user.password_hash = generate_password_hash(new_password)
    SessionLocal.commit()

    delete_user_sessions(user.id)

    password_reset_otps.pop(email, None)

    return jsonify({
        "message": "Password reset successfully. Please log in."
    }), 200
