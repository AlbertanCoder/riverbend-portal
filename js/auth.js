/* auth.js — sign-in, registration, and password strength meter. */
document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tab-login");
  const tabReg = document.getElementById("tab-register");
  const paneLogin = document.getElementById("pane-login");
  const paneReg = document.getElementById("pane-register");

  function show(which) {
    const login = which === "login";
    tabLogin.classList.toggle("active", login);
    tabReg.classList.toggle("active", !login);
    tabLogin.setAttribute("aria-selected", String(login));
    tabReg.setAttribute("aria-selected", String(!login));
    paneLogin.classList.toggle("hidden", !login);
    paneReg.classList.toggle("hidden", login);
  }
  tabLogin.addEventListener("click", () => show("login"));
  tabReg.addEventListener("click", () => show("register"));
  if (window.location.hash === "#register") show("register");

  function routeByRole(role) {
    const target = role === "resident" ? "portal" : "admin";
    window.location.href = RB.apiBase ? target + ".html" : "/" + target;
  }

  async function signIn(username, password) {
    const msg = document.getElementById("login-msg");
    msg.textContent = "Signing in…";
    try {
      const body = await RB.api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      RB.setToken(body.token);
      routeByRole(body.user.role);
    } catch (err) {
      msg.textContent = err.message;
    }
  }

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    signIn(document.getElementById("li-user").value.trim(),
           document.getElementById("li-pass").value);
  });

  document.querySelectorAll(".persona").forEach((b) =>
    b.addEventListener("click", () => signIn(b.dataset.u, b.dataset.p)));

  /* live strength meter */
  const passInput = document.getElementById("rg-pass");
  const bar = document.getElementById("strength-bar");
  const text = document.getElementById("strength-text");
  passInput.addEventListener("input", () => {
    const s = RB.strength(passInput.value);
    bar.style.width = s.pct + "%";
    bar.style.background = s.color;
    text.textContent = passInput.value
      ? "Password strength: " + s.label + " — minimum 8 characters."
      : "Minimum 8 characters. Use a mix of upper and lower case letters, numbers, and symbols.";
  });

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("register-msg");
    const s = RB.strength(document.getElementById("rg-pass").value);
    if (s.score < 2) {
      msg.textContent = "Please choose a stronger password (at least 8 characters, mixed types).";
      return;
    }
    msg.textContent = "Creating your account…";
    try {
      const body = await RB.api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: document.getElementById("rg-name").value.trim(),
          username: document.getElementById("rg-user").value.trim(),
          password: document.getElementById("rg-pass").value,
          email: document.getElementById("rg-email").value.trim() || null,
        }),
      });
      RB.setToken(body.token);
      window.location.href = RB.apiBase ? "portal.html" : "/portal";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
});