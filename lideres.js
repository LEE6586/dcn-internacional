/* ==========================================================================
   DCN — Portal de líderes
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const views = ["loginView", "forgotView", "resetView", "dashView"];
  const state = { lider: null, celulas: [] };
  let resetToken = new URLSearchParams(location.search).get("reset") || "";

  function show(id) {
    for (const view of views) {
      const el = document.getElementById(view);
      if (el) el.hidden = view !== id;
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || "No se pudo completar la solicitud.");
      error.status = res.status;
      throw error;
    }
    return data;
  }

  function todayLocal() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
  }

  function fmtDate(value) {
    if (!value) return "—";
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("es-VE", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  function grupoLabel(grupo) {
    return { hombres: "Equipo de 12 · Hombres", mujeres: "Equipo de 12 · Mujeres", jovenes: "Equipo de 12 · Jóvenes" }[grupo] || "Equipo de 12";
  }

  function setLoginError(message = "") {
    const el = $("#loginError");
    if (el) el.textContent = message;
  }

  function showDash() {
    const name = $("#leaderName");
    if (name) name.textContent = state.lider?.nombre || "Hola";
    const meta = $("#leaderMeta");
    if (meta) meta.textContent = `${grupoLabel(state.lider?.grupo)} · Registra la palabra, las personas y la fecha de tu célula.`;
    const group = $("#leaderGroup");
    if (group) group.textContent = grupoLabel(state.lider?.grupo);
    const logout = $("#logoutBtn");
    if (logout) logout.hidden = false;
    show("dashView");
  }

  function renderHistory() {
    const body = $("#historyBody");
    if (!body) return;
    const rows = state.celulas || [];
    const totalPeople = rows.reduce((sum, row) => sum + Number(row.personas || 0), 0);
    if ($("#statReports")) $("#statReports").textContent = String(rows.length);
    if ($("#statPeople")) $("#statPeople").textContent = String(totalPeople);
    if ($("#historyCount")) $("#historyCount").textContent = `${rows.length} reporte(s)`;
    if (!rows.length) {
      body.innerHTML = '<tr><td class="lead-empty" colspan="4">Aún no has reportado una célula.</td></tr>';
      return;
    }
    body.innerHTML = rows.map((row) => `
      <tr>
        <td>${esc(fmtDate(row.fecha))}</td>
        <td><strong>${esc(row.palabra)}</strong></td>
        <td>${esc(row.personas)}</td>
        <td class="lead-notes">${esc(row.notas || "—")}</td>
      </tr>`).join("");
  }

  async function loadCells() {
    const data = await api("/api/lideres/celulas");
    state.celulas = data.celulas || [];
    if (data.lider) state.lider = { ...state.lider, ...data.lider };
    renderHistory();
  }

  async function enterDashboard() {
    const data = await api("/api/lideres/me");
    state.lider = data.lider;
    showDash();
    await loadCells();
  }

  /* ── LOGIN ───────────────────────────────────────────────────────────── */
  $("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    const button = $("#loginForm button[type=submit]");
    if (button) button.disabled = true;
    try {
      const data = await api("/api/lideres/login", {
        method: "POST",
        body: JSON.stringify({
          usuario: $("#usuario").value.trim(),
          password: $("#password").value
        })
      });
      state.lider = data.lider;
      $("#password").value = "";
      showDash();
      await loadCells();
    } catch (error) {
      setLoginError(error.status === 401 ? "Usuario o contraseña incorrectos." : error.message);
    } finally {
      if (button) button.disabled = false;
    }
  });

  $("#forgotBtn")?.addEventListener("click", () => {
    const error = $("#forgotError");
    const ok = $("#forgotOk");
    if (error) error.textContent = "";
    if (ok) ok.textContent = "";
    show("forgotView");
  });

  $("#backLogin")?.addEventListener("click", () => show("loginView"));
  $("#resetBack")?.addEventListener("click", () => {
    resetToken = "";
    history.replaceState({}, "", "/lideres");
    show("loginView");
  });

  /* ── RECUPERAR ───────────────────────────────────────────────────────── */
  $("#forgotForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("#forgotError");
    const ok = $("#forgotOk");
    if (error) error.textContent = "";
    if (ok) ok.textContent = "";
    const button = $("#forgotForm button[type=submit]");
    if (button) button.disabled = true;
    try {
      const data = await api("/api/lideres/forgot", {
        method: "POST",
        body: JSON.stringify({ email: $("#forgotEmail").value.trim() })
      });
      if (ok) ok.textContent = data.message || "Revisa tu correo.";
    } catch (err) {
      if (error) error.textContent = err.message;
    } finally {
      if (button) button.disabled = false;
    }
  });

  /* ── NUEVA CONTRASEÑA ────────────────────────────────────────────────── */
  $("#resetForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("#resetError");
    const ok = $("#resetOk");
    if (error) error.textContent = "";
    if (ok) ok.textContent = "";
    const p1 = $("#resetPassword").value;
    const p2 = $("#resetPassword2").value;
    if (p1.length < 8) { if (error) error.textContent = "Usa al menos 8 caracteres."; return; }
    if (p1 !== p2) { if (error) error.textContent = "Las contraseñas no coinciden."; return; }
    const button = $("#resetForm button[type=submit]");
    if (button) button.disabled = true;
    try {
      await api("/api/lideres/reset", {
        method: "POST",
        body: JSON.stringify({ token: resetToken, password: p1 })
      });
      resetToken = "";
      history.replaceState({}, "", "/lideres");
      if (ok) ok.textContent = "Contraseña actualizada. Ya puedes iniciar sesión.";
      $("#resetPassword").value = "";
      $("#resetPassword2").value = "";
      setTimeout(() => show("loginView"), 1200);
    } catch (err) {
      if (error) error.textContent = err.message;
    } finally {
      if (button) button.disabled = false;
    }
  });

  /* ── REPORTE ─────────────────────────────────────────────────────────── */
  $("#cellForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("#cellError");
    const ok = $("#cellOk");
    if (error) error.textContent = "";
    if (ok) ok.textContent = "";
    const button = $("#cellForm button[type=submit]");
    if (button) button.disabled = true;
    try {
      await api("/api/lideres/celulas", {
        method: "POST",
        body: JSON.stringify({
          fecha: $("#fecha").value,
          palabra: $("#palabra").value.trim(),
          personas: Number($("#personas").value),
          notas: $("#notas").value.trim()
        })
      });
      if (ok) ok.textContent = "Reporte guardado correctamente.";
      $("#palabra").value = "";
      $("#personas").value = "";
      $("#notas").value = "";
      await loadCells();
    } catch (err) {
      if (err.status === 401) {
        show("loginView");
        setLoginError("Tu sesión venció. Vuelve a iniciar sesión.");
      } else if (error) {
        error.textContent = err.message;
      }
    } finally {
      if (button) button.disabled = false;
    }
  });

  /* ── SALIR ───────────────────────────────────────────────────────────── */
  async function logout() {
    try { await api("/api/lideres/logout", { method: "POST" }); } catch {}
    state.lider = null;
    state.celulas = [];
    show("loginView");
    const logoutBtn = $("#logoutBtn");
    if (logoutBtn) logoutBtn.hidden = true;
  }
  $("#logoutBtn")?.addEventListener("click", logout);
  $("#logoutBtn2")?.addEventListener("click", logout);

  /* ── INICIO ──────────────────────────────────────────────────────────── */
  (async function init() {
    const fecha = $("#fecha");
    if (fecha && !fecha.value) fecha.value = todayLocal();

    if (resetToken) {
      show("resetView");
      return;
    }

    try {
      await enterDashboard();
    } catch {
      show("loginView");
      resetToken = "";
    }
  })();
})();
