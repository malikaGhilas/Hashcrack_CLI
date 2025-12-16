import React, { useState } from "react";
import api from "../api/client";

export default function HashToolsPage() {
  // HASH TEXT
  const [inputText, setInputText] = useState("");
  const [algo, setAlgo] = useState("md5");
  const [hashResult, setHashResult] = useState(null);

  // VERIFY
  const [verifyText, setVerifyText] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  // FILE HASH
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState(null);

  const [error, setError] = useState(null);

  async function hashText() {
    setError(null);
    setHashResult(null);

    if (!inputText.trim()) {
      setError("Veuillez entrer un texte.");
      return;
    }

    try {
      const res = await api.post("/hash/hash", {
        text: inputText,
        algo,
      });
      setHashResult(res.data.hash);
    } catch (err) {
      setError("Erreur lors du hash");
    }
  }

  async function verifyHashRequest() {
    setError(null);
    setVerifyResult(null);

    if (!verifyText.trim() || !verifyHash.trim()) {
      setError("Veuillez remplir les deux champs.");
      return;
    }

    try {
      const res = await api.post("/hash/hash/verify", {
        text: verifyText,
        hash: verifyHash,
        algo,
      });

      setVerifyResult(res.data.match);
    } catch (err) {
      setError("Erreur lors de la vérification");
    }
  }

  async function hashFile() {
    setError(null);
    setFileHash(null);

    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("algo", algo);

    try {
      const res = await api.post("/hash/hash/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileHash(res.data.hash);
    } catch (err) {
      setError("Erreur lors du hash du fichier");
    }
  }

  return (
    <div className="p-6 space-y-10 text-sm text-slate-200">
      <h2 className="text-xl font-semibold">Outils Hash</h2>
      <p className="text-slate-400">Hash, vérification et hash de fichiers.</p>

      {error && (
        <div className="rounded-lg border border-rose-700 bg-rose-900/40 text-rose-300 px-4 py-2 text-xs">
          {error}
        </div>
      )}

      {/* ------------------- HASH TEXTE --------------------- */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Hash d’un texte</h3>

        <div>
          <label className="text-xs text-slate-400">Texte</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
            placeholder="Bonjour"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Algorithme</label>
          <select
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg"
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
          </select>
        </div>

        <button
          onClick={hashText}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
        >
          Générer le hash
        </button>

        {hashResult && (
          <div className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-lg break-all border border-slate-700">
            <span className="text-slate-400">Résultat :</span>
            <br />
            {hashResult}
          </div>
        )}
      </section>

      {/* ------------------- VERIFICATION --------------------- */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Vérifier un hash</h3>

        <div>
          <label className="text-xs text-slate-400">Texte</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
            placeholder="Bonjour"
            value={verifyText}
            onChange={(e) => setVerifyText(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Hash à vérifier</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
            placeholder="5d41402abc4b2a76b9719d911017c592"
            value={verifyHash}
            onChange={(e) => setVerifyHash(e.target.value)}
          />
        </div>

        <button
          onClick={verifyHashRequest}
          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400"
        >
          Vérifier
        </button>

        {verifyResult !== null && (
          <div
            className={`mt-4 text-xs px-3 py-2 rounded-lg border ${
              verifyResult
                ? "bg-emerald-900/40 border-emerald-700 text-emerald-300"
                : "bg-rose-900/40 border-rose-700 text-rose-300"
            }`}
          >
            {verifyResult ? "Correspond !" : "Ne correspond pas."}
          </div>
        )}
      </section>

      {/* ------------------- HASH FICHIER --------------------- */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-lg font-semibold">Hash d’un fichier</h3>

        <input
          type="file"
          className="text-xs"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={hashFile}
          className="px-4 py-2 rounded-lg bg-violet-500 text-slate-950 font-semibold hover:bg-violet-400"
        >
          Hasher le fichier
        </button>

        {fileHash && (
          <div className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-lg break-all border border-slate-700">
            <span className="text-slate-400">Résultat :</span>
            <br />
            {fileHash}
          </div>
        )}
      </section>
    </div>
  );
}
