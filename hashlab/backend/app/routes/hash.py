from flask import Blueprint, request, jsonify
import hashlib

bp = Blueprint("hash", __name__)

def hash_of(text: str, algo: str | None):
    algo = (algo or "md5").lower()
    h = hashlib.new(algo)
    h.update(text.encode("utf-8"))
    return h.hexdigest()

@bp.route("/hash", methods=["POST"])
def compute_hash():
    payload = request.get_json() or {}
    text = payload.get("text")
    algo = payload.get("algo")

    digest = hash_of(text, algo)
    return jsonify({"ok": True, "hash": digest})



@bp.route("/hash/verify", methods=["POST"])
def verify_hash():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    given_hash = (payload.get("hash") or "").strip().lower()
    algo = (payload.get("algo") or "md5").lower()

    if not text or not given_hash:
        return jsonify({"ok": False, "error": "missing text or hash"}), 400

    computed = hash_of(text, algo).lower()
    match = (computed == given_hash)

    return jsonify({
        "ok": True,
        "algo": algo,
        "text": text,
        "given_hash": given_hash,
        "computed_hash": computed,
        "match": match
    }), 200

@bp.route("/hash/file", methods=["POST"])
def hash_file():
    from werkzeug.utils import secure_filename

    algo = (request.form.get("algo") or "md5").lower()
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "missing file"}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"ok": False, "error": "empty filename"}), 400

    filename = secure_filename(f.filename)

    try:
        try:
            h = hashlib.new(algo)
        except Exception:
            if algo == "sha256":
                h = hashlib.sha256()
            elif algo == "sha1":
                h = hashlib.sha1()
            else:
                h = hashlib.md5()

        f.stream.seek(0)
        chunk = f.stream.read(8192)
        while chunk:
            h.update(chunk)
            chunk = f.stream.read(8192)

        digest = h.hexdigest()

        return jsonify({
            "ok": True,
            "filename": filename,
            "algo": algo,
            "hash": digest
        }), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
