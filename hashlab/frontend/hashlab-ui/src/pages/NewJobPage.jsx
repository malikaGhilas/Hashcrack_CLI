import React, { useState } from "react";
import api from "../api/client";

export default function NewJobPage() {
  const [hash, setHash] = useState("");
  const [strategy, setStrategy] = useState("dictionary");
  const [algo, setAlgo] = useState("auto");

  const [options, setOptions] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submitJob(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!hash.trim()) {
      setError("Veuillez entrer un hash valide.");
      return;
    }

    const payload = {
      hash: hash.trim(),
      strategy,
      algo: algo === "auto" ? null : algo,
      options,
    };

    setLoading(true);
    try {
      const res = await api.post("/jobs", payload);
      setMessage(`Job créé (#${res.data.job_id})`);
      setHash("");
      setOptions({});
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erreur lors de la création du job"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- UI dynamique selon stratégie ---
  function renderOptions() {
    switch (strategy) {
      case "dictionary":
        return (
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Wordlist (serveur)</label>
            <input
              type="text"
              placeholder="ex: dico.txt"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
              value={options.wordlist || ""}
              onChange={(e) =>
                setOptions({ ...options, wordlist: e.target.value })
              }
            />
          </div>
        );

      case "bruteforce":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Charset</label>
              <input
                type="text"
                placeholder="0123456789abcdef"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                value={options.charset || ""}
                onChange={(e) =>
                  setOptions({ ...options, charset: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Min length</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                  value={options.min_length || ""}
                  onChange={(e) =>
                    setOptions({ ...options, min_length: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Max length</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                  value={options.max_length || ""}
                  onChange={(e) =>
                    setOptions({ ...options, max_length: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "hybrid":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Wordlist</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                placeholder="dico.txt"
                value={options.wordlist || ""}
                onChange={(e) =>
                  setOptions({ ...options, wordlist: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Charset</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                placeholder="abc123"
                value={options.charset || ""}
                onChange={(e) =>
                  setOptions({ ...options, charset: e.target.value })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="p-6 space-y-6 text-slate-200 text-sm">
      <h2 className="text-xl font-semibold">Nouveau Job</h2>
      <p className="text-slate-400 mb-4">Créer un job de cracking.</p>

      {message && (
        <div className="rounded-lg border border-emerald-700 bg-emerald-900/40 text-emerald-300 px-4 py-2 text-xs">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-700 bg-rose-900/40 text-rose-300 px-4 py-2 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={submitJob} className="space-y-6">
        {/* HASH */}
        <div>
          <label className="text-xs text-slate-400">Hash à cracker</label>
          <input
            type="text"
            placeholder="e10adc3949ba59abbe56e057f20f883e"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
          />
        </div>

        {/* Stratégie */}
        <div>
          <label className="text-xs text-slate-400">Stratégie</label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm capitalize"
            value={strategy}
            onChange={(e) => {
              setStrategy(e.target.value);
              setOptions({});
            }}
          >
            <option value="dictionary">Dictionary</option>
            <option value="bruteforce">Bruteforce</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Algo */}
        <div>
          <label className="text-xs text-slate-400">Algorithme</label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
          >
            <option value="auto">Auto (détection)</option>
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
          </select>
        </div>

        {/* Options dynamiques */}
        <div>{renderOptions()}</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-semibold py-2 hover:bg-cyan-400 transition disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer le job"}
        </button>
      </form>
    </div>
  );
}
