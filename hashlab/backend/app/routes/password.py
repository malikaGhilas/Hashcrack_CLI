from flask import Blueprint, request, jsonify
import secrets
import string

bp = Blueprint("password", __name__)

@bp.route("/password/generate", methods=["GET"])
def generate_password():
    length = int(request.args.get("length", 16))
    length = max(8, min(length, 64))  # borne 8–64

    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    pwd = "".join(secrets.choice(alphabet) for _ in range(length))

    return jsonify({"ok": True, "password": pwd, "length": length}), 200


@bp.route("/password/strength", methods=["POST"])
def password_strength():
    payload = request.get_json(silent=True) or {}
    pwd = (payload.get("password") or "")

    if not pwd:
        return jsonify({"ok": False, "error": "missing password"}), 400

    score = 0
    criteria = {}

    criteria["length"] = len(pwd) >= 12
    criteria["upper"] = any(c.isupper() for c in pwd)
    criteria["lower"] = any(c.islower() for c in pwd)
    criteria["digit"] = any(c.isdigit() for c in pwd)
    criteria["symbol"] = any(not c.isalnum() for c in pwd)

    score = sum(1 for v in criteria.values() if v)

    if score <= 2:
        level = "weak"
    elif score == 3:
        level = "medium"
    else:
        level = "strong"

    return jsonify({
        "ok": True,
        "length": len(pwd),
        "score": score,
        "level": level,
        "criteria": criteria
    }), 200
