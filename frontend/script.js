console.log("frontend script loaded");

const API_BASE = "http://127.0.0.1:5000";

document.getElementById("check-backend").addEventListener("click", async () => {
  const statusEl = document.getElementById("backend-status");
  statusEl.textContent = "Checking...";

  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    statusEl.textContent = `Backend says: ${data.status} - ${data.message}`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error: could not reach backend.";
  }
});