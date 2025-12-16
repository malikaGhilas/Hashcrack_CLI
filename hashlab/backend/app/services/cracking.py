import hashlib
import itertools
import string
import time
from pathlib import Path


def hash_of(text: str, algo: str | None) -> str:
    """Calcule le hash d'un texte avec l'algo donné."""
    algo = (algo or "md5").lower()
    try:
        h = hashlib.new(algo)
    except Exception:
        if algo == "sha256":
            h = hashlib.sha256()
        elif algo == "sha1":
            h = hashlib.sha1()
        else:
            h = hashlib.md5()
    h.update(text.encode("utf-8"))
    return h.hexdigest()


class CrackingStrategy:
    """Interface de base pour les stratégies de cracking."""

    name = "base"

    def crack(self, target_hash: str, algo: str | None) -> dict:
        raise NotImplementedError


class DictionaryStrategy(CrackingStrategy):
    """Stratégie par dictionnaire."""

    name = "dictionary"

    def __init__(self, wordlist: str):
        self.wordlist = Path(wordlist)

    def crack(self, target_hash: str, algo: str | None) -> dict:
        start = time.time()
        tried = 0

        if not self.wordlist.exists():
            raise FileNotFoundError(f"wordlist not found: {self.wordlist}")

        with self.wordlist.open("r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                cand = line.strip()
                if not cand:
                    continue
                tried += 1
                # heuristique : si algo non fourni, déduire par longueur
                use_algo = algo
                if not use_algo:
                    l = len(target_hash)
                    if l == 32:
                        use_algo = "md5"
                    elif l == 40:
                        use_algo = "sha1"
                    elif l == 64:
                        use_algo = "sha256"
                    else:
                        use_algo = "md5"

                if hash_of(cand, use_algo).lower() == target_hash:
                    return {
                        "found": True,
                        "plaintext": cand,
                        "algo": use_algo,
                        "tried": tried,
                        "duration": time.time() - start,
                        "strategy": self.name,
                    }

        return {
            "found": False,
            "plaintext": None,
            "algo": algo,
            "tried": tried,
            "duration": time.time() - start,
            "strategy": self.name,
        }


class BruteForceStrategy(CrackingStrategy):
    """
    Stratégie brute force bornée.
    ATTENTION : bornes par défaut petites pour éviter de bloquer la machine.
    """

    name = "bruteforce"

    def __init__(
        self,
        charset: str | None = None,
        min_length: int = 1,
        max_length: int = 6,
        max_combinations: int = 5_000_000,
    ):
        # Charset par défaut (plus rapide pour les tests)
        self.charset = charset or "0123456789"
        self.min_length = min_length
        self.max_length = max_length
        self.max_combinations = max_combinations

    def crack(self, target_hash: str, algo: str | None) -> dict:
        start = time.time()
        tried = 0

        if not algo:
            # en brute force, on oblige à préciser l'algo
            raise ValueError("algo is required for brute force")

        for length in range(self.min_length, self.max_length + 1):
            for combo in itertools.product(self.charset, repeat=length):
                cand = "".join(combo)
                tried += 1
                if tried > self.max_combinations:
                    return {
                        "found": False,
                        "plaintext": None,
                        "algo": algo,
                        "tried": tried,
                        "duration": time.time() - start,
                        "strategy": self.name,
                        "stopped": True,
                        "reason": "max_combinations reached",
                    }

                if hash_of(cand, algo).lower() == target_hash:
                    return {
                        "found": True,
                        "plaintext": cand,
                        "algo": algo,
                        "tried": tried,
                        "duration": time.time() - start,
                        "strategy": self.name,
                    }

        return {
            "found": False,
            "plaintext": None,
            "algo": algo,
            "tried": tried,
            "duration": time.time() - start,
            "strategy": self.name,
            "stopped": False,
        }


class HybridStrategy(CrackingStrategy):
    """
    Stratégie hybride :
    - parcourt une wordlist
    - génère des variations simples (Capitalized, suffixes, leet)
    """

    name = "hybrid"

    LEET_MAP = str.maketrans({
        "a": "@",
        "e": "3",
        "i": "1",
        "o": "0",
        "s": "$",
    })

    def __init__(self, wordlist: str, suffixes: list[str] | None = None):
        self.wordlist = Path(wordlist)
        self.suffixes = suffixes or ["", "1", "123", "!", "2024"]

    def generate_variants(self, word: str):
        base = word.strip()
        if not base:
            return []

        variants = set()
        variants.add(base)
        variants.add(base.capitalize())
        variants.add(base.upper())

        # leet
        variants.add(base.translate(self.LEET_MAP))

        # suffixes
        for s in self.suffixes:
            variants.add(base + s)
            variants.add(base.capitalize() + s)

        return variants

    def crack(self, target_hash: str, algo: str | None) -> dict:
        start = time.time()
        tried = 0

        if not self.wordlist.exists():
            raise FileNotFoundError(f"wordlist not found: {self.wordlist}")

        with self.wordlist.open("r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                for cand in self.generate_variants(line):
                    tried += 1

                    use_algo = algo
                    if not use_algo:
                        l = len(target_hash)
                        if l == 32:
                            use_algo = "md5"
                        elif l == 40:
                            use_algo = "sha1"
                        elif l == 64:
                            use_algo = "sha256"
                        else:
                            use_algo = "md5"

                    if hash_of(cand, use_algo).lower() == target_hash:
                        return {
                            "found": True,
                            "plaintext": cand,
                            "algo": use_algo,
                            "tried": tried,
                            "duration": time.time() - start,
                            "strategy": self.name,
                        }

        return {
            "found": False,
            "plaintext": None,
            "algo": algo,
            "tried": tried,
            "duration": time.time() - start,
            "strategy": self.name,
        }
