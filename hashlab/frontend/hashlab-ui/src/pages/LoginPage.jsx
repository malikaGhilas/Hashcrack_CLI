// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("test@test.com"); // pour tester vite
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const res = await login(email, password);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || "Erreur de connexion");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-cyan-500/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-2xl font-black">
            H
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
              HashLab
            </div>
            <div className="text-sm text-slate-200">
              Connexion à la console de cracking
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>Backend attendu sur <code>http://127.0.0.1:5000</code></span>
          <Link
            to="/register"
            className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
          >
            Créer un compte
          </Link>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
