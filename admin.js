/* ==========================================================================
   DCN — Panel de administración (frontend)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const state = { type: "inscripciones", year: "", from: "", to: "", q: "" };
  let rows = [];
  let summary = null;

  const loginView = $("#loginView");
  const dashView = $("#dashView");
  const logoutBtn = $("#logoutBtn");

  function showLogin() {
    loginView.hidden = false;
    dashView.hidden = true;
    logoutBtn.hidden = true;
    $("#password")?.focus();
  }
  function showDash() {
    loginView.hidden = true;
    dashView.hidden = false;
    logoutBtn.hidden = false;
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...opts
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && !path.includes("/login")) showLogin();
      const err = new Error(data.error || "No se pudo completar la solicitud");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function fmtDate(value) {
    if (!value) return "—";
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  }
  function fmtMoney(n) {
    return Number(n || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function monthLabel(m) {
    const d = new Date(m + "-01T12:00:00");
    if (Number.isNaN(d.getTime())) return m;
    return d.toLocaleDateString("es-VE", { month: "short", year: "numeric" });
  }
  function topEntry(obj) {
    const entries = Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);
    return entries[0] || ["—", 0];
  }

  function queryParams() {
    const p = new URLSearchParams({ type: state.type });
    if (state.year) p.set("year", state.year);
    if (state.from) p.set("from", state.from);
    if (state.to) p.set("to", state.to);
    if (state.q) p.set("q", state.q);
    return p;
  }

  function populateYears(years) {
    const select = $("#year");
    if (!select) return;
    const current = state.year;
    select.innerHTML = '<option value="">Todos</option>' +
      (years || []).map((y) => `<option value="${esc(y)}">${esc(y)}</option>`).join("");
    if (current && !years.includes(current)) {
      select.insertAdjacentHTML("beforeend", `<option value="${esc(current)}">${esc(current)}</option>`);
    }
    select.value = current;
  }

  function card(label, value, hint, accent = false) {
    return `<article class="adm-card${accent ? " adm-card--accent" : ""}">
      <span class="mono">${esc(label)}</span>
      <strong>${value}</strong>
      <span>${esc(hint)}</span>
    </article>`;
  }

  function renderSummary() {
    const wrap = $("#summary");
    if (!wrap || !summary) return;

    if (state.type === "ofrendas") {
      const [dest, destCount] = topEntry(summary.byDesignation);
      wrap.innerHTML = [
        card("Total en dólares", `$${fmtMoney(summary.totalUsd)}`, `${summary.count} aporte(s) registrados`, true),
        card("Total en bolívares", `Bs ${fmtMoney(summary.totalBs)}`, "Aportes en moneda nacional"),
        card("Donantes únicos", String(summary.donorCount || 0), "Titulares que reportaron"),
        card("Destino principal", esc(dest), `${destCount} aporte(s)`)
      ].join("");
    } else if (state.type === "contactos") {
      const [topic, topicCount] = topEntry(summary.byTopic);
      const latest = summary.latest ? fmtDate(summary.latest) : "—";
      const pending = rows.filter((r) => r.status === "nuevo").length;
      wrap.innerHTML = [
        card("Mensajes recibidos", String(summary.count), "En el período consultado", true),
        card("Motivo principal", esc(topic), `${topicCount} mensaje(s)`),
        card("Sin atender", String(pending), "Estado nuevo"),
        card("Último mensaje", latest, "Fecha del más reciente")
      ].join("");
    } else {
      const [course, courseCount] = topEntry(summary.byCourse);
      const [mode, modeCount] = topEntry(summary.byMode);
      const latest = rows[0]?.created_at ? fmtDate(rows[0].created_at) : "—";
      wrap.innerHTML = [
        card("Total inscripciones", String(summary.count), "En el período consultado", true),
        card("Módulo más solicitado", esc(course), `${courseCount} inscripción(es)`),
        card("Modalidad principal", esc(mode), `${modeCount} inscripción(es)`),
        card("Último registro", latest, "Fecha de la inscripción más reciente")
      ].join("");
    }
  }

  function renderMonthly() {
    const wrap = $("#monthly");
    const note = $("#monthlyNote");
    if (!wrap || !summary) return;

    if (state.type === "ofrendas") {
      const entries = Object.entries(summary.byMonth || {}).sort((a, b) => a[0].localeCompare(b[0]));
      const max = Math.max(1, ...entries.map(([, v]) => v.count));
      wrap.innerHTML = entries.length ? entries.map(([m, v]) => `
        <div class="adm-bar-row">
          <span class="mono">${esc(monthLabel(m))}</span>
          <span class="adm-bar"><i style="width:${Math.max(3, (v.count / max) * 100)}%"></i></span>
          <strong>${v.count} · $${fmtMoney(v.usd)} · Bs ${fmtMoney(v.bs)}</strong>
        </div>`).join("") : '<p class="mono">Sin aportes en este período.</p>';
      if (note) note.textContent = "Cantidad de aportes por mes · montos en USD y Bs";
    } else {
      const entries = Object.entries(summary.byMonth || {}).sort((a, b) => a[0].localeCompare(b[0]));
      const max = Math.max(1, ...entries.map(([, v]) => v));
      const label = state.type === "contactos" ? "mensajes" : "inscripciones";
      wrap.innerHTML = entries.length ? entries.map(([m, v]) => `
        <div class="adm-bar-row">
          <span class="mono">${esc(monthLabel(m))}</span>
          <span class="adm-bar"><i style="width:${Math.max(3, (v / max) * 100)}%"></i></span>
          <strong>${v}</strong>
        </div>`).join("") : `<p class="mono">Sin ${label} en este período.</p>`;
      if (note) note.textContent = `${label.charAt(0).toUpperCase() + label.slice(1)} por mes`;
    }
  }

  function renderTable() {
    const head = $("#tableHead");
    const body = $("#tableBody");
    if (!head || !body) return;

    const isOfertas = state.type === "ofrendas";
    const isContactos = state.type === "contactos";
    const headers = isOfertas
      ? ["Fecha", "Código", "Titular", "Cédula / RIF", "Método", "Monto", "Referencia", "Destino"]
      : isContactos
        ? ["Fecha", "Código", "Nombre", "WhatsApp", "Correo", "Motivo", "Mensaje", "Estado"]
        : ["Fecha", "Código", "Nombre", "WhatsApp", "Correo", "Edad", "Módulo", "Horario", "Modalidad"];

    head.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;

    if (!rows.length) {
      body.innerHTML = `<tr><td class="adm-empty" colspan="${headers.length}">No hay registros con esos filtros.</td></tr>`;
      return;
    }

    body.innerHTML = rows.map((r) => {
      if (isOfertas) {
        const amount = `<strong>${fmtMoney(r.amount)}</strong> <span class="adm-badge adm-badge--${r.currency === "Bs" ? "bs" : "usd"}">${esc(r.currency)}</span>`;
        const method = `${esc(r.method || "—")}${r.bank ? `<br><span class="mono">${esc(r.bank)}</span>` : ""}`;
        return `<tr>
          <td>${esc(fmtDate(r.date))}</td>
          <td class="mono">${esc(r.code)}</td>
          <td><strong>${esc(r.name)}</strong></td>
          <td>${esc(r.id_number || "—")}</td>
          <td>${method}</td>
          <td>${amount}</td>
          <td>${esc(r.ref || "—")}</td>
          <td>${esc(r.designation || "—")}</td>
        </tr>`;
      }
      if (isContactos) {
        return `<tr>
          <td>${esc(fmtDate(r.created_at))}</td>
          <td class="mono">${esc(r.code)}</td>
          <td><strong>${esc(r.name)}</strong></td>
          <td>${esc(r.phone || "—")}</td>
          <td>${esc(r.email || "—")}</td>
          <td>${esc(r.topic || "—")}</td>
          <td class="adm-msg">${esc(r.message)}</td>
          <td>
            <select class="adm-select-status" data-id="${esc(r.id)}" aria-label="Estado del mensaje">
              <option value="nuevo" ${r.status === "nuevo" ? "selected" : ""}>Nuevo</option>
              <option value="respondido" ${r.status === "respondido" ? "selected" : ""}>Respondido</option>
            </select>
          </td>
        </tr>`;
      }
      return `<tr>
        <td>${esc(fmtDate(r.created_at))}</td>
        <td class="mono">${esc(r.code)}</td>
        <td><strong>${esc(r.first_name)} ${esc(r.last_name)}</strong></td>
        <td>${esc(r.phone || "—")}</td>
        <td>${esc(r.email || "—")}</td>
        <td>${esc(r.age || "—")}</td>
        <td>${esc(r.course || "—")}</td>
        <td>${esc(r.schedule || "—")}</td>
        <td>${esc(r.mode || "—")}</td>
      </tr>`;
    }).join("");
  }

  function updateHeadings() {
    const isOfertas = state.type === "ofrendas";
    const isContactos = state.type === "contactos";
    const title = $("#tableTitle");
    if (title) title.textContent = isOfertas ? "Ofrendas reportadas" : isContactos ? "Mensajes recibidos" : "Inscripciones a clases";
    $$(".adm-tab").forEach((btn) => {
      const active = btn.dataset.type === state.type;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  async function load() {
    const status = $("#status");
    try {
      if (status) status.textContent = "Cargando…";
      const data = await api(`/api/admin/data?${queryParams().toString()}`);
      rows = data.rows || [];
      summary = data.summary || {};
      populateYears(data.years || []);
      updateHeadings();
      renderSummary();
      renderMonthly();
      renderTable();

      const count = $("#tableCount");
      if (count) count.textContent = `${rows.length} registro(s)`;
      if (status) {
        const time = new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
        status.textContent = `${rows.length} registro(s) encontrados · actualizado ${time}`;
      }

      const exportBtn = $("#exportBtn");
      if (exportBtn) exportBtn.href = `/api/admin/export?${queryParams().toString()}`;
    } catch (err) {
      if (err.status !== 401 && status) status.textContent = "No se pudo cargar la información. Revisa la conexión.";
      console.error(err);
    }
  }

  /* ── EVENTOS ─────────────────────────────────────────────────────────── */
  $("#loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginForm button[type=submit]");
    const error = $("#loginError");
    if (error) error.textContent = "";
    if (btn) btn.disabled = true;
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: $("#password").value })
      });
      $("#password").value = "";
      showDash();
      await load();
    } catch (err) {
      if (error) error.textContent = err.status === 401 ? "Clave incorrecta. Intenta de nuevo." : err.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try { await api("/api/admin/logout", { method: "POST" }); } catch {}
    rows = [];
    summary = null;
    showLogin();
  });

  $$(".adm-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.type === btn.dataset.type) return;
      state.type = btn.dataset.type;
      load();
    });
  });

  $("#filterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.year = $("#year").value;
    state.from = $("#from").value;
    state.to = $("#to").value;
    state.q = $("#q").value.trim();
    load();
  });

  $("#clearBtn")?.addEventListener("click", () => {
    state.year = ""; state.from = ""; state.to = ""; state.q = "";
    $("#year").value = ""; $("#from").value = ""; $("#to").value = ""; $("#q").value = "";
    load();
  });

  $("#tableBody")?.addEventListener("change", async (e) => {
    const select = e.target.closest(".adm-select-status");
    if (!select) return;
    try {
      await api(`/api/admin/contactos/${select.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: select.value })
      });
      const status = $("#status");
      if (status) status.textContent = "Estado actualizado.";
      await load();
    } catch (err) {
      const status = $("#status");
      if (status) status.textContent = "No se pudo cambiar el estado.";
    }
  });

  $("#printBtn")?.addEventListener("click", () => window.print());

  /* ── INICIO ──────────────────────────────────────────────────────────── */
  (async function init() {
    try {
      await api("/api/admin/me");
      showDash();
      await load();
    } catch (err) {
      showLogin();
    }
  })();
})();
