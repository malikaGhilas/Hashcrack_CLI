// frontend/static/js/jobs.js

// Redirection si pas connecté
function ensureAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location = "index.html";
  }
}

// Navigation helpers
function goToDashboard() {
  window.location = "dashboard.html";
}

function goToNewJob() {
  window.location = "new_job.html";
}

// Changer l'affichage des options selon la stratégie
function onStrategyChange() {
  const strategy = document.getElementById("strategy").value;

  const dicBlock = document.getElementById("options-dictionary");
  const bfBlock = document.getElementById("options-bruteforce");

  if (strategy === "dictionary") {
    dicBlock.classList.remove("hidden");
    bfBlock.classList.add("hidden");
  } else if (strategy === "bruteforce") {
    dicBlock.classList.add("hidden");
    bfBlock.classList.remove("hidden");
  } else if (strategy === "hybrid") {
    // hybrid = dictionary + variations → on peut garder wordlist
    dicBlock.classList.remove("hidden");
    bfBlock.classList.add("hidden");
  }
}

// Chargement des jobs + stats
async function loadJobs(manual = false) {
  ensureAuth();
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API}/me/jobs`, {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();

    if (data.msg === "Token has expired" || data.msg === "Invalid token") {
      logout();
      return;
    }

    if (!data.ok) {
      console.error("Erreur jobs:", data);
      return;
    }

    const jobs = data.jobs || [];
    const tbody = document.getElementById("jobs-body");
    const emptyMsg = document.getElementById("jobs-empty");
    tbody.innerHTML = "";

    if (jobs.length === 0) {
      emptyMsg && emptyMsg.classList.remove("hidden");
    } else {
      emptyMsg && emptyMsg.classList.add("hidden");
    }

    // Stats
    let total = jobs.length;
    let success = jobs.filter((j) => j.status === "DONE" && j.plaintext).length;
    let running = jobs.filter((j) =>
      ["PENDING", "RUNNING"].includes(j.status)
    ).length;

    const statTotal = document.getElementById("stat-total");
    const statSuccess = document.getElementById("stat-success");
    const statRunning = document.getElementById("stat-running");

    if (statTotal) statTotal.textContent = total;
    if (statSuccess) statSuccess.textContent = success;
    if (statRunning) statRunning.textContent = running;

    // Table
    jobs.forEach((job) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${job.id}</td>
        <td>${job.strategy}</td>
        <td>
          <span class="badge ${
            job.status === "DONE"
              ? "badge-success"
              : job.status === "ERROR"
              ? "badge-error"
              : "badge-warning"
          }">
            ${job.status}
          </span>
        </td>
        <td>${job.plaintext || "-"}</td>
        <td>${job.duration ? job.duration.toFixed(3) : "-"}</td>
        <td>${job.created_at ? new Date(job.created_at).toLocaleString() : "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erreur réseau loadJobs:", err);
    if (manual) {
      alert("Erreur lors du rafraîchissement des jobs.");
    }
  }
}

// Création d'un job (avec options)
async function createJob() {
  ensureAuth();
  const token = localStorage.getItem("token");
  const hash = document.getElementById("hash").value.trim();
  const strategy = document.getElementById("strategy").value;
  const algo = document.getElementById("algo") ? document.getElementById("algo").value : "";
  const errorEl = document.getElementById("job-error");

  errorEl.textContent = "";

  if (!hash) {
    errorEl.textContent = "Veuillez saisir un hash.";
    return;
  }

  // Construction des options selon la stratégie
  let options = {};

  if (strategy === "dictionary") {
    const wl = document.getElementById("wordlist").value.trim();
    if (wl) options.wordlist = wl;
  } else if (strategy === "bruteforce") {
    const charset = document.getElementById("charset").value || "0123456789";
    const minLen = parseInt(document.getElementById("min_length").value || "1", 10);
    const maxLen = parseInt(document.getElementById("max_length").value || "4", 10);

    options.charset = charset;
    options.min_length = minLen;
    options.max_length = maxLen;
  } else if (strategy === "hybrid") {
    const wl = document.getElementById("wordlist").value.trim();
    if (wl) options.wordlist = wl;
  }

  const payload = {
    hash,
    strategy,
  };

  if (algo) payload.algo = algo;
  if (Object.keys(options).length > 0) payload.options = options;

  try {
    const res = await fetch(`${API}/jobs`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.msg === "Token has expired" || data.msg === "Invalid token") {
      logout();
      return;
    }

    if (data.ok) {
      goToDashboard();
    } else {
      errorEl.textContent = data.error || "Erreur lors de la création du job.";
    }
  } catch (err) {
    console.error("Erreur création job:", err);
    errorEl.textContent = "Erreur réseau.";
  }
}

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("dashboard.html")) {
    ensureAuth();
    loadJobs();
    setInterval(loadJobs, 3000);
  } else if (path.endsWith("new_job.html")) {
    ensureAuth();
    onStrategyChange(); // mettre l'UI au bon état au chargement
  }
});
