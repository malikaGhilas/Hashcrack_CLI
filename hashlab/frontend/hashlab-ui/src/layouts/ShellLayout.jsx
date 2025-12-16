// src/layouts/ShellLayout.jsx
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ShellLayout() {
  const { email, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { to: "/", label: "Dashboard" },
    { to: "/jobs", label: "Jobs" },
    { to: "/jobs/new", label: "Nouveau job" },
    { to: "/tools/hash", label: "Outils hash" },
    { to: "/tools/password", label: "Outils mot de passe" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xl font-black">
              H
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                HashLab
              </div>
              <div className="text-xs text-emerald-400">Hash cracking suite</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {menuItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-slate-800 text-slate-100 font-medium"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                }`}
              >
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Connecté en tant que{" "}
            <span className="text-slate-200 font-medium">{email}</span>
          </span>
          <button
            onClick={logout}
            className="text-[11px] px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/70 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Dashboard de cracking
            </h1>
            <p className="text-xs text-slate-400">
              Suivi des jobs, stratégies, performances…
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Backend connecté</span>
          </div>
        </header>

        {/* 🔥 C'est ici que les pages changent */}
        <section className="flex-1 overflow-auto p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
