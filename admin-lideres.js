/* ==========================================================================
   DCN — Administración de líderes y células
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const state = { leaders: [], cells: [], summary: null };

  function grupoLabel(grupo) {
    return { hombres: "Hombres", mujeres: "Mujeres", jovenes: "Jóvenes" }[grupo] || "—";
  }

  function fmtDate(value) {
    if (!value) return "—";
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("es-VE", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      location.href = "/admin";
      throw new Error("No autorizado");
    }
    if (!res.ok) {
      const error = new Error(data.error || "No se pudo completar la solicitud.");
      error.status = res.status;
      throw error;
    }
    return data;
  }

  function setError(id, message = "") {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
  }

  function renderLeaders() {
    const body = $("#leaderBody");
    if (!body) return;
    const leaders = state.leaders || [];
    if ($("#leaderCount")) $("#leaderCount").textContent = `${leaders.length} líder(es)`;
    if (!leaders.length) {
      body.innerHTML = '<tr><td class="lead-empty" colspan="6">Todavía no hay líderes registrados.</td></tr>';
    } else {
      body.innerHTML = leaders.map((l) => `
        <tr>
          <td>
            <strong>${esc(l.nombre)}</strong><br />
            <span class="lead-group">${esc(l.email)}</span>
          </td>
          <td><span class="lead-group">${esc(grupoLabel(l.grupo))}</span></td>
          <td class="mono">${esc(l.usuario)}</td>
          <td>${esc(l.reportes || 0)} <span class="lead-group">· ${esc(l.personas || 0)} pers.</span></td>
          <td><span class="adm-badge ${l.activo ? "adm-badge--usd" : ""}">${l.activo ? "Activo" : "Inactivo"}</span></td>
          <td>
            <div class="lead-actions">
              <button class="lead-action" type="button" data-reset="${l.id}" data-name="${esc(l.nombre)}">Enlace clave</button>
              <button class="lead-action ${l.activo ? "lead-action--danger" : ""}" type="button" data-toggle="${l.id}" data-active="${l.activo ? "1" : "0"}">
                ${l.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </td>
        </tr>`).join("");
    }

    const filter = $("#fLider");
    if (filter) {
      const current = filter.value;
      filter.innerHTML = '<option value="">Todos</option>' + leaders.map((l) =>
        `<option value="${l.id}">${esc(l.nombre)} · ${esc(grupoLabel(l.grupo))}</option>`).join("");
      filter.value = current;
    }
  }

  function renderSummary(summary = {}) {
    const wrap = $("#cellSummary");
    if (!wrap) return;
    const groups = summary.personasPorGrupo || {};
    wrap.innerHTML = `
      <article class="lead-admin-stat"><span class="mono">Total registros</span><strong>${esc(summary.totalRegistros ?? summary.reportes ?? 0)}</strong></article>
      <article class="lead-admin-stat"><span class="mono">Total personas</span><strong>${esc(summary.personas || 0)}</strong></article>
      <article class="lead-admin-stat"><span class="mono">Hombres</span><strong>${esc(groups.hombres || 0)}</strong></article>
      <article class="lead-admin-stat"><span class="mono">Mujeres</span><strong>${esc(groups.mujeres || 0)}</strong></article>
      <article class="lead-admin-stat"><span class="mono">Jóvenes</span><strong>${esc(groups.jovenes || 0)}</strong></article>`;
  }

  function monthLabel(month) {
    const date = new Date(month + "-01T12:00:00");
    if (Number.isNaN(date.getTime())) return month;
    const value = date.toLocaleDateString("es-VE", { month: "short", year: "numeric" });
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function renderChart(summary = {}) {
    const wrap = $("#cellChart");
    const note = $("#chartNote");
    if (!wrap) return;
    const byMonth = summary.porMesGrupo || {};
    const months = Object.keys(byMonth).sort();
    if (!months.length) {
      wrap.innerHTML = '<p class="lead-chart-empty">No hay datos para graficar con los filtros seleccionados.</p>';
      if (note) note.textContent = "Sin datos";
      return;
    }

    const groups = [
      { key: "hombres", label: "Hombres", color: "#9cdaf3" },
      { key: "mujeres", label: "Mujeres", color: "#e8cf9a" },
      { key: "jovenes", label: "Jóvenes", color: "#8fd6b0" }
    ];
    const values = months.map((month) => groups.map((group) => Number(byMonth[month]?.[group.key] || 0)));
    const max = Math.max(1, ...values.flat());
    const width = 760;
    const height = 300;
    const left = 48;
    const right = 18;
    const top = 24;
    const bottom = 44;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const step = innerWidth / months.length;
    const barWidth = Math.max(8, Math.min(22, step * 0.17));
    const gap = 3;
    const groupWidth = barWidth * groups.length + gap * (groups.length - 1);

    let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Progreso mensual de personas por grupo">`;
    for (let i = 0; i <= 4; i++) {
      const y = top + (innerHeight * i) / 4;
      const value = Math.round(max * (1 - i / 4));
      svg += `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#ffffff" stroke-opacity="0.08" />`;
      svg += `<text x="${left - 9}" y="${y + 4}" fill="#8ea6bb" font-size="10" text-anchor="end">${value}</text>`;
    }

    months.forEach((month, index) => {
      const center = left + step * index + step / 2;
      const start = center - groupWidth / 2;
      groups.forEach((group, groupIndex) => {
        const value = Number(byMonth[month]?.[group.key] || 0);
        const barHeight = (value / max) * innerHeight;
        const x = start + groupIndex * (barWidth + gap);
        const y = top + innerHeight - barHeight;
        svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(0, barHeight).toFixed(1)}" rx="2" fill="${group.color}"><title>${esc(group.label)} · ${esc(monthLabel(month))}: ${value} personas</title></rect>`;
        if (value > 0 && months.length <= 8) {
          svg += `<text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="#dce9f3" font-size="9" text-anchor="middle">${value}</text>`;
        }
      });
      if (months.length <= 10 || index % 2 === 0) {
        svg += `<text x="${center.toFixed(1)}" y="${height - 18}" fill="#8ea6bb" font-size="9" text-anchor="middle">${esc(monthLabel(month))}</text>`;
      }
    });

    svg += `<line x1="${left}" y1="${top + innerHeight}" x2="${width - right}" y2="${top + innerHeight}" stroke="#ffffff" stroke-opacity="0.16" />`;
    svg += "</svg>";
    wrap.innerHTML = svg;
    if (note) note.textContent = `${months.length} mes(es) · ${summary.personas || 0} personas`;
  }

  function renderCells() {
    const body = $("#cellBody");
    if (!body) return;
    const rows = state.cells || [];
    if ($("#cellCount")) $("#cellCount").textContent = `${rows.length} reporte(s)`;
    if (!rows.length) {
      body.innerHTML = '<tr><td class="lead-empty" colspan="6">No hay reportes con esos filtros.</td></tr>';
      return;
    }
    body.innerHTML = rows.map((c) => `
      <tr>
        <td>${esc(fmtDate(c.fecha))}</td>
        <td><strong>${esc(c.lider)}</strong><br /><span class="lead-group mono">${esc(c.usuario)}</span></td>
        <td><span class="lead-group">${esc(grupoLabel(c.grupo))}</span></td>
        <td><strong>${esc(c.palabra)}</strong></td>
        <td>${esc(c.personas)}</td>
        <td class="lead-notes">${esc(c.notas || "—")}</td>
      </tr>`).join("");
  }

  async function loadLeaders() {
    const data = await api("/api/admin/lideres");
    state.leaders = data.lideres || [];
    renderLeaders();
  }

  async function loadCells() {
    const params = new URLSearchParams();
    if ($("#fGrupo")?.value) params.set("grupo", $("#fGrupo").value);
    if ($("#fDesde")?.value) params.set("from", $("#fDesde").value);
    if ($("#fHasta")?.value) params.set("to", $("#fHasta").value);
    if ($("#fLider")?.value) params.set("lider_id", $("#fLider").value);
    const status = $("#cellStatus");
    if (status) status.textContent = "Cargando…";
    const data = await api(`/api/admin/celulas?${params.toString()}`);
    state.cells = data.celulas || [];
    state.summary = data.resumen || {};
    renderSummary(state.summary);
    renderChart(state.summary);
    renderCells();
    if (status) status.textContent = `${state.cells.length} reporte(s) encontrados.`;
  }

  /* ── REGISTRAR LÍDER ─────────────────────────────────────────────────── */
  $("#leaderForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setError("leaderError");
    const ok = $("#leaderOk");
    if (ok) ok.textContent = "";
    const button = $("#leaderForm button[type=submit]");
    if (button) button.disabled = true;
    try {
      await api("/api/admin/lideres", {
        method: "POST",
        body: JSON.stringify({
          nombre: $("#lNombre").value.trim(),
          email: $("#lEmail").value.trim(),
          telefono: $("#lTelefono").value.trim(),
          usuario: $("#lUsuario").value.trim(),
          password: $("#lPassword").value,
          grupo: $("#lGrupo").value
        })
      });
      if (ok) ok.textContent = "Líder creado. Ya puede iniciar sesión en /lideres.";
      $("#leaderForm").reset();
      await loadLeaders();
    } catch (error) {
      setError("leaderError", error.message);
    } finally {
      if (button) button.disabled = false;
    }
  });

  /* ── ACCIONES ────────────────────────────────────────────────────────── */
  $("#leaderBody")?.addEventListener("click", async (event) => {
    const resetBtn = event.target.closest("[data-reset]");
    if (resetBtn) {
      try {
        const data = await api(`/api/admin/lideres/${resetBtn.dataset.reset}/reset-link`, { method: "POST" });
        const dialog = $("#resetDialog");
        const input = $("#resetUrl");
        if (input) input.value = data.url || "";
        if ($("#resetNote")) $("#resetNote").textContent = `Enlace para ${data.nombre || "el líder"}. Vence en 1 hora.`;
        if (dialog?.showModal) dialog.showModal();
        else dialog?.setAttribute("open", "");
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    const toggleBtn = event.target.closest("[data-toggle]");
    if (toggleBtn) {
      try {
        await api(`/api/admin/lideres/${toggleBtn.dataset.toggle}`, {
          method: "PATCH",
          body: JSON.stringify({ activo: toggleBtn.dataset.active !== "1" })
        });
        await loadLeaders();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  /* ── FILTROS ─────────────────────────────────────────────────────────── */
  $("#filterForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try { await loadCells(); } catch (error) { setError("cellStatus", error.message); }
  });

  $("#clearFilters")?.addEventListener("click", async () => {
    $("#fGrupo").value = "";
    $("#fDesde").value = "";
    $("#fHasta").value = "";
    $("#fLider").value = "";
    try { await loadCells(); } catch (error) { setError("cellStatus", error.message); }
  });

  /* ── MODAL / COPIA ───────────────────────────────────────────────────── */
  function closeReset() {
    const dialog = $("#resetDialog");
    if (dialog?.open) dialog.close();
    else dialog?.removeAttribute("open");
  }
  $("#resetClose")?.addEventListener("click", closeReset);
  $("#closeReset2")?.addEventListener("click", closeReset);
  $("#copyReset")?.addEventListener("click", async () => {
    const input = $("#resetUrl");
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      $("#copyReset").textContent = "Copiado ✓";
      setTimeout(() => { $("#copyReset").textContent = "Copiar enlace"; }, 1600);
    } catch {
      input.select();
      document.execCommand("copy");
    }
  });

  /* ── SALIR ───────────────────────────────────────────────────────────── */
  $("#logoutBtn")?.addEventListener("click", async () => {
    try { await api("/api/admin/logout", { method: "POST" }); } catch {}
    location.href = "/admin";
  });

  /* ── INICIO ──────────────────────────────────────────────────────────── */
  (async function init() {
    try {
      await loadLeaders();
      await loadCells();
    } catch (error) {
      if (error.status !== 401) {
        setError("cellStatus", error.message);
      }
    }
  })();
})();
