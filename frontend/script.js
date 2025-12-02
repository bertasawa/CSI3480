// We serve frontend and backend from the same origin via Flask,
// so we can just use relative URLs.
const API = {
  HEALTH: "/api/health",
  REGISTER: "/api/register",
  LOGIN: "/api/login",
  STRONG_PASSWORD: "/api/strong_password",
};

// ---------- Helper: generic JSON fetch ----------
async function jsonRequest(url, options = {}) {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await resp.json();
  } catch (e) {
    // If backend ever returns non-JSON, avoid crash.
    data = null;
  }

  if (!resp.ok) {
    const errorMessage =
      (data && (data.error || data.message)) ||
      `HTTP ${resp.status}`;
    const err = new Error(errorMessage);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ---------- Backend health ----------
async function checkBackendHealth() {
  const statusEl = document.getElementById("backend-status");

  try {
    statusEl.textContent = "Checking backend status...";
    statusEl.classList.remove("alert-success", "alert-danger");
    statusEl.classList.add("alert-secondary");

    const data = await jsonRequest(API.HEALTH, { method: "GET" });

    statusEl.classList.remove("alert-secondary", "alert-danger");
    statusEl.classList.add("alert-success");
    statusEl.textContent =
      data.message || "Backend is connected.";
  } catch (err) {
    statusEl.classList.remove("alert-secondary", "alert-success");
    statusEl.classList.add("alert-danger");
    statusEl.textContent =
      "Could not reach backend: " + err.message;
  }
}

// ---------- Registration ----------
function setupRegisterForm() {
  const form = document.getElementById("register-form");
  const submitBtn = document.getElementById("reg-submit");
  const msgEl = document.getElementById("reg-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document
      .getElementById("reg-username")
      .value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById(
      "reg-password-confirm"
    ).value;
    const hashType = document.getElementById("reg-hash-type").value;

    msgEl.classList.remove("text-success", "text-danger");
    msgEl.textContent = "";

    if (!username || !password || !confirm) {
      msgEl.classList.add("text-danger");
      msgEl.textContent =
        "Please fill in username and both password fields.";
      return;
    }

    if (password !== confirm) {
      msgEl.classList.add("text-danger");
      msgEl.textContent = "Passwords do not match.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const payload = {
        username: username,
        password: password,
        hash_type: hashType, // matches backend app.py
      };

      const data = await jsonRequest(API.REGISTER, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      msgEl.classList.add("text-success");
      msgEl.textContent =
        data.message || "User registered successfully.";

      // Clear password fields on success
      document.getElementById("reg-password").value = "";
      document.getElementById("reg-password-confirm").value = "";
    } catch (err) {
      msgEl.classList.add("text-danger");
      msgEl.textContent = err.message || "Registration failed.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });
}

// Login 
function setupLoginForm() {
  const form = document.getElementById("login-form");
  const submitBtn = document.getElementById("login-submit");
  const msgEl = document.getElementById("login-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document
      .getElementById("login-username")
      .value.trim();
    const password = document.getElementById("login-password").value;
    const hashType = document.getElementById("login-hash-type").value;

    msgEl.classList.remove("text-success", "text-danger");
    msgEl.textContent = "";

    if (!username || !password) {
      msgEl.classList.add("text-danger");
      msgEl.textContent =
        "Please enter both username and password.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const payload = {
        username: username,
        password: password,
        hash_type: hashType, 
      };

      const data = await jsonRequest(API.LOGIN, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      msgEl.classList.add("text-success");
      msgEl.textContent =
        data.message || "Login successful.";
    } catch (err) {
      msgEl.classList.add("text-danger");
      msgEl.textContent =
        err.message || "Login failed.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
    }
  });
}

// Strong password generator
function setupStrongPasswordGenerator() {
  const btn = document.getElementById("generate-password-btn");
  const output = document.getElementById("strong-password-output");
  const msgEl = document.getElementById(
    "strong-password-message"
  );

  btn.addEventListener("click", async () => {
    msgEl.classList.remove("text-danger");
    msgEl.textContent = "";

    btn.disabled = true;
    btn.textContent = "Generating...";

    try {
      const resp = await fetch(API.STRONG_PASSWORD);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const password = data.password || "";

      output.value = password;
      msgEl.textContent =
        "Generated using /api/strong_password on the backend.";
    } catch (err) {
      msgEl.classList.add("text-danger");
      msgEl.textContent =
        "Failed to generate password: " + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = "Generate";
    }
  });
}

//  Init 
window.addEventListener("DOMContentLoaded", () => {
  checkBackendHealth();
  setupRegisterForm();
  setupLoginForm();
  setupStrongPasswordGenerator();
});
