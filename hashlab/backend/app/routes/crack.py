from flask import Blueprint, request, jsonify
from backend.app.services.cracking import (
    DictionaryStrategy,
    BruteForceStrategy,
    HybridStrategy
)

bp = Blueprint("crack", __name__)



@bp.route("/crack", methods=["POST"])
def crack():
    """
    Body JSON attendu :
    {
      "hash": "...",            # requis
      "algo": "md5" | "sha1" | "sha256",  # optionnel (obligatoire pour brute force)
      "strategy": "dictionary" | "bruteforce" | "hybrid",
      "options": { ... }        # options spécifiques
    }
    """
    payload = request.get_json(silent=True) or {}
    target = (payload.get("hash") or "").strip().lower()
    algo = (payload.get("algo") or None)
    strategy_name = (payload.get("strategy") or "dictionary").lower()
    options = payload.get("options") or {}

    if not target:
        return jsonify({"ok": False, "error": "missing hash"}), 400

    try:
        if strategy_name == "dictionary":
            wordlist = options.get("wordlist", "dico.txt")
            strat = DictionaryStrategy(wordlist=wordlist)
        elif strategy_name == "bruteforce":
            charset = options.get("charset")
            min_len = int(options.get("min_length", 1))
            max_len = int(options.get("max_length", 4))
            max_comb = int(options.get("max_combinations", 500_000))
            strat = BruteForceStrategy(
                charset=charset,
                min_length=min_len,
                max_length=max_len,
                max_combinations=max_comb,
            )
        elif strategy_name == "hybrid":
            wordlist = options.get("wordlist", "dico.txt")
            suffixes = options.get("suffixes") or None
            strat = HybridStrategy(wordlist=wordlist, suffixes=suffixes)
        else:
            return jsonify({"ok": False, "error": f"unknown strategy: {strategy_name}"}), 400

        result = strat.crack(target_hash=target, algo=algo)
        return jsonify({"ok": True, "strategy": strategy_name, "result": result}), 200

    except FileNotFoundError as e:
        return jsonify({"ok": False, "error": str(e)}), 400
    except ValueError as e:
        return jsonify({"ok": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
