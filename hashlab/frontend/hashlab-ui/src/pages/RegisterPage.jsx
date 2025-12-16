// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        email,
        password,
      });

      if (res.data.ok) {
        navigate("/login");
      } else {
        setError(res.data.error || "Impossible de créer le compte.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erreur lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-cyan-500/10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-2xl font-black">
            H
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
              HashLab
            </div>
            <div className="text-sm text-slate-200">
              Création de compte
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-semibold py-2.5 hover:bg-cyan-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Création…" : "Créer le compte"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-[11px] text-slate-500 text-center">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
