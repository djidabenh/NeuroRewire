import json
import os
import tempfile
import time
from datetime import timedelta
from functools import wraps

try:
    import speech_recognition as sr
except ImportError:  # Keeps the app importable before requirements are installed.
    sr = None

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
except ImportError:  # Keeps the app importable before requirements are installed.
    firebase_admin = None
    firebase_auth = None
    credentials = None

from dotenv import load_dotenv
from flask import Flask, abort, g, jsonify, redirect, render_template, request, url_for
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
except ImportError:
    Limiter = None

    def get_remote_address():
        return request.remote_addr or "unknown"


load_dotenv()

app = Flask(__name__)

# Flask SECRET_KEY is required for secure session signing (even when using Firebase
# cookies). Generate with: python -c "import secrets; print(secrets.token_hex(32))"
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "")
if not app.config["SECRET_KEY"]:
    import secrets as _secrets
    app.logger.warning(
        "FLASK_SECRET_KEY is not set. A random key will be used, "
        "which means server restarts will invalidate all sessions. "
        "Set FLASK_SECRET_KEY in your .env file for production."
    )
    app.config["SECRET_KEY"] = _secrets.token_hex(32)

# ---------------------------------------------------------------------------
# Security configuration
# ---------------------------------------------------------------------------

def _bool_env(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _csv_env(name, default=""):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


DATABASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://neuro-rewire-default-rtdb.firebaseio.com",
)

SESSION_COOKIE_NAME = os.getenv("FIREBASE_SESSION_COOKIE_NAME", "nrw_session")
SESSION_COOKIE_DAYS = int(os.getenv("FIREBASE_SESSION_COOKIE_DAYS", "5"))
SESSION_COOKIE_SECURE = _bool_env("SESSION_COOKIE_SECURE", default=False)
SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
CHECK_REVOKED_TOKENS = _bool_env("FIREBASE_CHECK_REVOKED_TOKENS", default=True)

MAX_AUDIO_UPLOAD_BYTES = int(os.getenv("MAX_AUDIO_UPLOAD_BYTES", str(2 * 1024 * 1024)))
app.config["MAX_CONTENT_LENGTH"] = MAX_AUDIO_UPLOAD_BYTES

ALLOWED_SPEECH_LANGUAGES = set(
    _csv_env("ALLOWED_SPEECH_LANGUAGES", "ar-DZ,fr-FR,en-US,en-GB")
)
ALLOWED_AUDIO_MIMETYPES = {
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/vnd.wave",
}

# CORS is now limited to API routes and explicit trusted origins only.
# Same-origin browser requests do not need CORS at all.
ALLOWED_ORIGINS = _csv_env(
    "CORS_ALLOWED_ORIGINS",
    "http://127.0.0.1:5000,http://localhost:5000",
)
if ALLOWED_ORIGINS:
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ALLOWED_ORIGINS,
                "methods": ["POST", "GET", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"],
                "supports_credentials": True,
                "max_age": 600,
            }
        },
    )

class _NoopLimiter:
    def limit(self, *_args, **_kwargs):
        def decorator(func):
            return func
        return decorator

    def exempt(self, func):
        return func

if Limiter is not None:
    try:
        from limits.storage import MemoryStorage
        default_limits = _csv_env("RATELIMIT_DEFAULTS", "200 per day,60 per hour")
        storage_uri = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
        try:
            limiter = Limiter(
                key_func=get_remote_address,
                app=app,
                default_limits=default_limits,
                storage_uri=storage_uri,
            )
        except Exception:
            limiter = Limiter(
                key_func=get_remote_address,
                app=app,
                default_limits=default_limits,
                storage=MemoryStorage(),
            )
    except Exception:
        limiter = _NoopLimiter()
else:
    limiter = _NoopLimiter()


VALID_CATEGORIES = {
    "memory",
    "attention",
    "coordination",
    "trajectory",
    "language",
    "quiz",
}


# ---------------------------------------------------------------------------
# Firebase Admin and auth helpers
# ---------------------------------------------------------------------------

def init_firebase_admin():
    """Initialize Firebase Admin once, using a service account or ADC."""
    if firebase_admin is None:
        app.logger.error("firebase-admin is not installed. Run: pip install -r requirements.txt")
        return False

    if firebase_admin._apps:
        return True

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

    try:
        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        elif service_account_path:
            cred = credentials.Certificate(service_account_path)
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            cred = credentials.ApplicationDefault()
        else:
            app.logger.error(
                "Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_PATH, "
                "FIREBASE_SERVICE_ACCOUNT_JSON, or GOOGLE_APPLICATION_CREDENTIALS."
            )
            return False

        firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
        return True
    except Exception as exc:
        app.logger.exception("Firebase Admin initialization failed: %s", exc)
        return False


def firebase_unavailable_response():
    return jsonify({"error": "Firebase Admin is not configured on the server."}), 503


def _extract_bearer_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    return token or None


def verify_bearer_id_token():
    """Verify a Firebase ID token sent with Authorization: Bearer <token>."""
    token = _extract_bearer_token()
    if not token:
        return None, jsonify({"error": "Missing Firebase ID token."}), 401

    if not init_firebase_admin():
        return None, firebase_unavailable_response(), 503

    try:
        decoded = firebase_auth.verify_id_token(token, check_revoked=CHECK_REVOKED_TOKENS)
        return decoded, None, None
    except Exception:
        app.logger.warning("Invalid or revoked Firebase ID token.", exc_info=True)
        return None, jsonify({"error": "Invalid or expired Firebase ID token."}), 401


def bearer_token_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        decoded, response, status = verify_bearer_id_token()
        if response is not None:
            return response, status
        g.current_user = decoded
        g.current_uid = decoded.get("uid")
        return view_func(*args, **kwargs)

    return wrapper


def verify_session_cookie_from_request():
    cookie = request.cookies.get(SESSION_COOKIE_NAME)
    if not cookie:
        return None

    if not init_firebase_admin():
        abort(503, description="Firebase Admin is not configured on the server.")

    try:
        return firebase_auth.verify_session_cookie(
            cookie,
            check_revoked=CHECK_REVOKED_TOKENS,
        )
    except Exception:
        app.logger.warning("Invalid or revoked Firebase session cookie.", exc_info=True)
        return None


def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        decoded = verify_session_cookie_from_request()
        if not decoded:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Authentication required."}), 401
            return redirect(url_for("index"))

        g.current_user = decoded
        g.current_uid = decoded.get("uid")
        return view_func(*args, **kwargs)

    return wrapper


# ---------------------------------------------------------------------------
# Generic security responses
# ---------------------------------------------------------------------------

@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "microphone=(self), camera=(), geolocation=()")

    return response


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(_error):
    return jsonify({"error": "Audio file is too large."}), 413


@app.errorhandler(503)
def handle_service_unavailable(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": getattr(error, "description", "Service unavailable.")}), 503
    return render_template("index.html"), 503


# ---------------------------------------------------------------------------
# Auth session endpoints
# ---------------------------------------------------------------------------

@app.route("/api/session-login", methods=["POST"])
@limiter.limit("10 per minute")
def session_login():
    decoded, response, status = verify_bearer_id_token()
    if response is not None:
        return response, status

    # Avoid minting a long-lived cookie from an old ID token.
    auth_time = int(decoded.get("auth_time", 0))
    if time.time() - auth_time > 5 * 60:
        return jsonify({"error": "Recent sign-in required."}), 401

    token = _extract_bearer_token()
    expires_in = timedelta(days=SESSION_COOKIE_DAYS)

    try:
        session_cookie = firebase_auth.create_session_cookie(token, expires_in=expires_in)
    except Exception:
        app.logger.exception("Could not create Firebase session cookie.")
        return jsonify({"error": "Could not create server session."}), 500

    result = jsonify({"status": "ok", "uid": decoded.get("uid")})
    result.set_cookie(
        SESSION_COOKIE_NAME,
        session_cookie,
        max_age=int(expires_in.total_seconds()),
        httponly=True,
        secure=SESSION_COOKIE_SECURE,
        samesite=SESSION_COOKIE_SAMESITE,
        path="/",
    )
    return result


@app.route("/api/session-logout", methods=["POST"])
@limiter.limit("30 per minute")
def session_logout():
    result = jsonify({"status": "ok"})
    result.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return result


@app.route("/api/session-status", methods=["GET"])
def session_status():
    decoded = verify_session_cookie_from_request()
    if not decoded:
        return jsonify({"authenticated": False}), 200
    return jsonify({"authenticated": True, "uid": decoded.get("uid")}), 200


# ---------------------------------------------------------------------------
# Public and protected pages
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")


@app.route("/settings")
@login_required
def settings():
    return render_template("settings.html")


@app.route("/progress")
@login_required
def progress():
    return render_template("progress.html")


@app.route("/avc")
@login_required
def avc():
    return render_template("avc.html")


@app.route("/exercises")
@login_required
def exercises():
    return render_template("exercises.html")


@app.route("/exercises/<category>")
@login_required
def exercise_category(category):
    if category not in VALID_CATEGORIES:
        abort(404)
    return render_template("exercise_category.html", category=category)


@app.route("/games/memory-images")
@login_required
def game_memory_images():
    return render_template("game_memory_images.html")


@app.route("/games/memory-order")
@login_required
def game_memory_order():
    return render_template("game_memory_order.html")


@app.route("/games/memory-pairs")
@login_required
def game_memory_pairs():
    return render_template("game_memory_pairs.html")


@app.route("/games/attention-intruder")
@login_required
def game_attention_intruder():
    return render_template("game_attention_intruder.html")


@app.route("/games/attention-click-target")
@login_required
def game_attention_click_target():
    return render_template("game_attention_click_target.html")


@app.route("/games/attention-scene-search")
@login_required
def game_attention_scene_search():
    return render_template("game_attention_scene_search.html")


@app.route("/games/coordination-catch-fruits")
@login_required
def game_coordination_catch_fruits():
    return render_template("game_coordination_catch_fruits.html")


@app.route("/games/coordination-drag-drop")
@login_required
def game_coordination_drag_drop():
    return render_template("game_coordination_drag_drop.html")


@app.route("/games/coordination-tap-target")
@login_required
def game_coordination_tap_target():
    return render_template("game_coordination_tap_target.html")


@app.route("/games/quiz-general")
@login_required
def game_quiz_general():
    return render_template("game_quiz_general.html")


@app.route("/games/quiz-rapid-compare")
@login_required
def game_quiz_rapid_compare():
    return render_template("game_quiz_rapid_compare.html")


@app.route("/games/quiz-rapid-math")
@login_required
def game_quiz_rapid_math():
    return render_template("game_quiz_rapid_math.html")


@app.route("/games/trajectory-connect-dots")
@login_required
def game_trajectory_connect_dots():
    return render_template("game_trajectory_connect_dots.html")


@app.route("/games/trajectory-draw-shapes")
@login_required
def game_trajectory_draw_shapes():
    return render_template("game_trajectory_draw_shapes.html")


@app.route("/games/trajectory-maze")
@login_required
def game_trajectory_maze():
    return render_template("game_trajectory_maze.html")


@app.route("/games/language-word-image")
@login_required
def game_language_word_image():
    return render_template("game_language_word_image.html")


@app.route("/games/language-complete-word")
@login_required
def game_language_complete_word():
    return render_template("game_language_complete_word.html")


@app.route("/games/language-categorize")
@login_required
def game_language_categorize():
    return render_template("game_language_categorize.html")


@app.route("/motor")
@login_required
def motor():
    return render_template("motor.html")


# ---------------------------------------------------------------------------
# Protected speech-to-text API
# ---------------------------------------------------------------------------

def _uploaded_file_size(file_storage):
    stream = file_storage.stream
    current_pos = stream.tell()
    stream.seek(0, os.SEEK_END)
    size = stream.tell()
    stream.seek(current_pos, os.SEEK_SET)
    return size


@app.route("/api/speech-to-text", methods=["POST"])
def speech_to_text():
    if sr is None:
        return jsonify({"error": "SpeechRecognition is not installed on the server."}), 503

    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files["audio"]
    language = request.form.get("language", "ar-DZ")

    if language not in ALLOWED_SPEECH_LANGUAGES:
        return jsonify({"error": "Unsupported speech language."}), 400

    if not audio_file.filename:
        return jsonify({"error": "Audio filename is missing."}), 400

    mimetype = (audio_file.mimetype or "").lower()
    if mimetype and mimetype not in ALLOWED_AUDIO_MIMETYPES:
        return jsonify({"error": "Unsupported audio format. Please send WAV audio."}), 415

    try:
        file_size = _uploaded_file_size(audio_file)
    except Exception:
        return jsonify({"error": "Could not inspect uploaded audio."}), 400

    if file_size <= 0:
        return jsonify({"error": "Audio file is empty."}), 400

    if file_size > MAX_AUDIO_UPLOAD_BYTES:
        return jsonify({"error": "Audio file is too large."}), 413

    temp_path = None
    recognizer = sr.Recognizer()

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        with sr.AudioFile(temp_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=language)
            return jsonify({"text": text.strip()})
    except sr.UnknownValueError:
        return jsonify({"text": ""}), 200
    except sr.RequestError:
        app.logger.exception("Speech recognition provider request failed.")
        return jsonify({"error": "Speech recognition provider is unavailable."}), 502
    except Exception:
        app.logger.exception("Speech-to-text failed.")
        return jsonify({"error": "Speech-to-text failed."}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes", "on"}
    port = int(os.getenv("PORT", 5000))
    if debug_mode:
        app.run(debug=True, host="0.0.0.0", port=port)
    else:
        from waitress import serve
        serve(app, host="0.0.0.0", port=port)
