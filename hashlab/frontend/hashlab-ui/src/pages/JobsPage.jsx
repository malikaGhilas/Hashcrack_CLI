import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  async function loadJobs() {
    try {
      const res = await api.get("/jobs/me");
      setJobs(res.data.jobs || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les jobs");
    }
  }

  useEffect(() => {
    loadJobs();

    // 🔥 Auto-refresh every 5 seconds
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    PENDING: "text-amber-400 bg-amber-900/30 border-amber-700",
    RUNNING: "text-cyan-400 bg-cyan-900/30 border-cyan-700",
    DONE: "text-emerald-400 bg-emerald-900/30 border-emerald-700",
    FAILED: "text-rose-400 bg-rose-900/30 border-rose-700",
  };

  return (
    <div className="p-6 space-y-6 text-slate-200 text-sm">
      <h2 className="text-xl font-semibold">Jobs</h2>
      <p className="text-slate-400">Liste de tous vos jobs de cracking.</p>

      {/* Erreur */}
      {error && (
        <div className="text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2 text-xs">
          {error}
        </div>
      )}

      {/* Tableau */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg overflow-hidden">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wide">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Stratégie</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plaintext</th>
              <th className="px-4 py-3">Tentatives</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-slate-500">
                  Aucun job pour le moment
                </td>
              </tr>
            )}

            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{job.id}</td>

                <td className="px-4 py-3 capitalize text-slate-300">
                  {job.strategy}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={
                      "px-2 py-1 rounded border text-[11px] " +
                      (statusColors[job.status] || "bg-slate-800 border-slate-700")
                    }
                  >
                    {job.status}
                  </span>
                </td>

                <td className="px-4 py-3 font-mono text-emerald-400">
                  {job.plaintext || "—"}
                </td>

                <td className="px-4 py-3 text-slate-400">
                  {job.tried ?? 0}
                </td>

                <td className="px-4 py-3 text-slate-400">
                  {job.duration ? `${job.duration.toFixed(3)}s` : "—"}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {job.created_at
                    ? new Date(job.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
