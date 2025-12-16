import pytest
from backend.app.services.cracking import (
    hash_of,
    DictionaryStrategy,
    BruteForceStrategy,
    HybridStrategy,
)


def test_hash_of_md5():
    assert hash_of("123456", "md5") == "e10adc3949ba59abbe56e057f20f883e"


def test_hash_of_sha1():
    assert hash_of("123456", "sha1") == "7c4a8d09ca3762af61e59520943dc26494f8941b"


def test_hash_of_sha256():
    assert hash_of("123456", "sha256") == "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"


def test_dictionary_finds_word(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("hello\nmomo\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is True
    assert res["plaintext"] == "momo"
    assert res["tried"] >= 1


def test_dictionary_ignores_blank_lines(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("\n\nmomo\n\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "md5")
    res = strat.crack(target, "md5")
    assert res["found"] is True
    assert res["plaintext"] == "momo"


def test_dictionary_not_found(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("aaa\nbbb\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is False
    assert res["plaintext"] is None


def test_dictionary_infers_md5_when_algo_none(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("momo\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "md5")

    res = strat.crack(target, None)
    assert res["found"] is True
    assert res["algo"] == "md5"


def test_dictionary_infers_sha1_when_algo_none(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("momo\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "sha1")

    res = strat.crack(target, None)
    assert res["found"] is True
    assert res["algo"] == "sha1"


def test_dictionary_infers_sha256_when_algo_none(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("momo\n", encoding="utf-8")

    strat = DictionaryStrategy(str(wl))
    target = hash_of("momo", "sha256")

    res = strat.crack(target, None)
    assert res["found"] is True
    assert res["algo"] == "sha256"


def test_bruteforce_requires_algo():
    strat = BruteForceStrategy(charset="01", min_length=1, max_length=4, max_combinations=1000)
    with pytest.raises(ValueError):
        strat.crack(hash_of("1", "md5"), None)


def test_bruteforce_finds_numeric_fast():
    strat = BruteForceStrategy(charset="0123456789", min_length=1, max_length=4, max_combinations=20000)
    target = hash_of("1234", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is True
    assert res["plaintext"] == "1234"


def test_bruteforce_finds_letters_when_charset_letters():
    # charset réduit => super rapide
    strat = BruteForceStrategy(charset="mo", min_length=4, max_length=4, max_combinations=1000)
    target = hash_of("momo", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is True
    assert res["plaintext"] == "momo"


def test_bruteforce_stops_at_max_combinations():
    strat = BruteForceStrategy(charset="0123456789", min_length=1, max_length=8, max_combinations=50)
    target = hash_of("99999999", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is False
    assert res.get("stopped") is True
    assert res.get("reason") == "max_combinations reached"


def test_hybrid_finds_capitalize_variant(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("bonjour\n", encoding="utf-8")

    strat = HybridStrategy(str(wl), suffixes=[""])
    target = hash_of("Bonjour", "md5")

    res = strat.crack(target, None)
    assert res["found"] is True
    assert res["plaintext"] == "Bonjour"


def test_hybrid_finds_suffix_variant(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("momo\n", encoding="utf-8")

    strat = HybridStrategy(str(wl), suffixes=["", "123"])
    target = hash_of("momo123", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is True
    assert res["plaintext"] == "momo123"


def test_hybrid_not_found(tmp_path):
    wl = tmp_path / "words.txt"
    wl.write_text("aaa\nbbb\n", encoding="utf-8")

    strat = HybridStrategy(str(wl))
    target = hash_of("momo", "md5")

    res = strat.crack(target, "md5")
    assert res["found"] is False
    assert res["plaintext"] is None
