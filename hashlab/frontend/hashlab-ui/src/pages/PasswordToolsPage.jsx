import React, { useState } from "react";
import api from "../api/client";

export default function PasswordToolsPage() {
  const [generated, setGenerated] = useState("");
  const [strengthInput, setStrengthInput] = useState("");
  const [strengthResult, setStrengthResult] = useState(null);
  const [error, setError] = useState(null);

  // Options du générateur
  const [length, setLength] = useState(12);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  async function generatePassword() {
    setError(null);
    setGenerated("");

    try {
      const res = await api.get("/password/password/generate", {
        params: {
          length,
          uppercase,
          lowercase,
          numbers,
          symbols,
        },
      });

      setGenerated(res.data.password);
    } catch (err) {
      setError("Erreur lors de la génération");
    }
  }

  async function checkStrength() {
    setError(null);
    setStrengthResult(null);

    if (!strengthInput.trim()) {
      setError("Veuillez entrer un mot de passe.");
      return;
    }

    try {
      const res = await api.post("/password/password/strength", {
        password: strengthInput,
      });

      setStrengthResult(res.data);
    } catch (err) {
      setError("Erreur lors de l’analyse de la force");
    }
  }

  return (
    <div className="p-6 space-y-10 text-sm text-slate-200">
      <h2 className="text-xl font-semibold">Outils mot de passe</h2>
      <p className="text-slate-400">Génération & analyse de force (backend connecté).</p>

      {error && (
        <div className="rounded-lg border border-rose-700 bg-rose-900/40 text-rose-300 px-4 py-2 text-xs">
          {error}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 🔵 GÉNÉRATEUR */}
      {/* -------------------------------------------------- */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Générateur de mot de passe</h3>

        <div className="space-y-3">
          <label className="block text-xs text-slate-400">
            Longueur : {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full"
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={() => setUppercase(!uppercase)}
              />
              Majuscules
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={() => setLowercase(!lowercase)}
              />
              Minuscules
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={numbers}
                onChange={() => setNumbers(!numbers)}
              />
              Chiffres
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={symbols}
                onChange={() => setSymbols(!symbols)}
              />
              Symboles
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
          >
            Générer
          </button>

          {generated && (
            <div className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 break-all">
              <span className="text-slate-400">Mot de passe généré :</span>
              <br />
              {generated}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 🟣 ANALYSE DE FORCE */}
      {/* -------------------------------------------------- */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Analyse de force</h3>

        <div>
          <label className="text-xs text-slate-400">Mot de passe à analyser</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
            placeholder="Ex : Bonjour123!"
            value={strengthInput}
            onChange={(e) => setStrengthInput(e.target.value)}
          />
        </div>

        <button
          onClick={checkStrength}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
        >
          Vérifier la force
        </button>

        {strengthResult && (
          <div className="mt-4 space-y-2 text-xs bg-slate-800 px-3 py-3 rounded-lg border border-slate-700">
            <div className="text-slate-400">Score : {strengthResult.score}/4</div>

            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-full rounded ${
                    strengthResult.score > i ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                ></div>
              ))}
            </div>

            <div className="text-slate-300">
              {strengthResult.feedback?.warning || "OK"}
            </div>

            {strengthResult.feedback?.suggestions?.length > 0 && (
              <ul className="list-disc pl-4 text-slate-400">
                {strengthResult.feedback.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
