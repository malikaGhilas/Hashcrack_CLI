import api from "./client";

export async function fetchMyJobs() {
  try {
    const res = await api.get("/jobs/me");
    return res.data.jobs || [];
  } catch (err) {
    console.error("Erreur fetch jobs:", err);
    return [];
  }
}
