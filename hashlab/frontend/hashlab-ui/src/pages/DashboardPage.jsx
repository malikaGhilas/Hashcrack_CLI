import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.get("/jobs/me");
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les jobs");
      }
    }

    loadJobs();
  }, []);

  const total = jobs.length;
  const successCount = jobs.filter((j) => j.status === "DONE" && j.plaintext).length;
  const successRate = total === 0 ? 0 : Math.round((successCount / total) * 100);

  const strategies = [...new Set(jobs.map((j) => j.strategy))];

  return (
    <div className="p-6 space-y-6 text-slate-200 text-sm">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="text-slate-400">Vue d’ensemble des jobs et performances.</p>

      {/* --- Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total jobs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            JOBS TOTAUX
          </div>
          <div className="mt-2 text-4xl font-bold">{total}</div>
        </div>

        {/* Success */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            SUCCÈS
          </div>
          <div className="mt-2 text-4xl font-bold text-emerald-400">
            {successRate}%
          </div>
          <div className="text-xs text-slate-400">taux de réussite</div>
        </div>

        {/* Strategies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            STRATÉGIES UTILISÉES
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {strategies.length === 0 && (
              <span className="text-slate-500 text-xs">—</span>
            )}

            {strategies.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- Last jobs --- */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-3">Derniers jobs</h3>

        {error && (
          <p className="text-rose-400 text-xs mb-2">{error}</p>
        )}

        {jobs.length === 0 && (
          <p className="text-slate-500 text-xs">Aucun job pour le moment.</p>
        )}

        <div className="space-y-2">
          {jobs.slice(0, 5).map((job) => (
            <div
              key={job.id}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-medium text-slate-200">
                  {job.strategy.toUpperCase()}
                </div>
                <div className="text-slate-500">
                  Status: {job.status}
                </div>
              </div>

              {job.plaintext ? (
                <div className="text-emerald-400 font-mono">{job.plaintext}</div>
              ) : (
                <div className="text-slate-500">—</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
