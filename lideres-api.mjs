/* ==========================================================================
   DCN — API de líderes y células
   ========================================================================== */
import crypto from "node:crypto";

const GROUPS = new Set(["hombres", "mujeres", "jovenes"]);
const SESSION_MS = 8 * 60 * 60 * 1000;
const RESET_MS = 60 * 60 * 1000;
const leaderSessions = new Map();
const loginAttempts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of leaderSessions) if (data.exp < now) leaderSessions.delete(token);
}, 10 * 60 * 1000).unref();

export function ensureLideresSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lideres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      telefono TEXT,
      usuario TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      grupo TEXT NOT NULL CHECK (grupo IN ('hombres', 'mujeres', 'jovenes')),
      activo INTEGER NOT NULL DEFAULT 1,
      reset_hash TEXT,
      reset_expires TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS celulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lider_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      palabra TEXT NOT NULL,
      personas INTEGER NOT NULL,
      notas TEXT,
      grupo TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lider_id) REFERENCES lideres(id)
    );
    CREATE INDEX IF NOT EXISTS idx_lideres_usuario ON lideres(usuario);
    CREATE INDEX IF NOT EXISTS idx_celulas_fecha ON celulas(fecha);
    CREATE INDEX IF NOT EXISTS idx_celulas_lider ON celulas(lider_id);
    CREATE INDEX IF NOT EXISTS idx_celulas_grupo ON celulas(grupo);
  `);
}

function str(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function getLeaderSession(req) {
  const token = parseCookies(req).dcn_lider;
  if (!token) return null;
  const data = leaderSessions.get(token);
  if (!data) return null;
  if (data.exp < Date.now()) { leaderSessions.delete(token); return null; }
  return token;
}

function createLeaderSession(id) {
  const token = crypto.randomBytes(24).toString("hex");
  leaderSessions.set(token, { id, exp: Date.now() + SESSION_MS });
  return token;
}

function cookieFor(req, token) {
  const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  return `dcn_lider=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`;
}

function clearCookie() {
  return "dcn_lider=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0";
}

function allowLogin(ip) {
  const now = Date.now();
  const list = (loginAttempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  if (list.length >= 12) return false;
  list.push(now);
  loginAttempts.set(ip, list);
  return true;
}

function originOf(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() || (req.socket.encrypted ? "https" : "http");
  const host = req.headers.host || "localhost";
  return `${proto}://${host}`;
}

function resetUrl(req, token) {
  return `${originOf(req)}/lideres?reset=${encodeURIComponent(token)}`;
}

async function sendResetEmail({ to, nombre, link }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[DCN] Enlace de recuperación para ${to}: ${link}`);
    return false;
  }
  const from = process.env.MAIL_FROM || "DCN Internacional <no-reply@dcninternacionalsf.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Restablecer contraseña — Portal de líderes DCN",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#122033">
        <h2>Portal de líderes DCN</h2>
        <p>Hola ${nombre || "líder"},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. El enlace vence en 1 hora.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#0b2a4a;color:#fff;text-decoration:none;border-radius:8px">Restablecer contraseña</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      </div>`
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${text.slice(0, 200)}`);
  }
  return true;
}

export async function handleLideresApi(req, res, url, ctx) {
  const { db, sendJson, readJson, nowLocalIso, getAdminSession } = ctx;
  const path = url.pathname;

  /* ── LOGIN / SESIÓN DE LÍDER ─────────────────────────────────────────── */
  if (req.method === "POST" && path === "/api/lideres/login") {
    const ip = req.socket.remoteAddress || "local";
    if (!allowLogin(ip)) return sendJson(res, 429, { error: "Demasiados intentos. Espera 15 minutos." });
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const usuario = str(body.usuario, 80);
    const password = str(body.password, 200);
    const row = db.prepare("SELECT * FROM lideres WHERE usuario = ? COLLATE NOCASE").get(usuario);
    if (!row || !row.activo || !verifyPassword(password, row.password_hash)) {
      await new Promise((r) => setTimeout(r, 350));
      return sendJson(res, 401, { error: "Usuario o contraseña incorrectos." });
    }
    const token = createLeaderSession(row.id);
    return sendJson(res, 200, {
      ok: true,
      lider: { id: row.id, nombre: row.nombre, grupo: row.grupo, usuario: row.usuario }
    }, { "set-cookie": cookieFor(req, token) });
  }

  if (req.method === "POST" && path === "/api/lideres/logout") {
    return sendJson(res, 200, { ok: true }, { "set-cookie": clearCookie() });
  }

  if (req.method === "GET" && path === "/api/lideres/me") {
    const session = getLeaderSession(req);
    if (!session) return sendJson(res, 401, { error: "No autorizado" });
    const sessionData = leaderSessions.get(session);
    const row = db.prepare("SELECT id, nombre, email, telefono, usuario, grupo FROM lideres WHERE id = ? AND activo = 1").get(sessionData.id);
    if (!row) return sendJson(res, 401, { error: "No autorizado" });
    return sendJson(res, 200, { lider: row });
  }

  /* ── RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────────────── */
  if (req.method === "POST" && path === "/api/lideres/forgot") {
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const email = str(body.email, 160).toLowerCase();
    const generic = { ok: true, message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." };
    if (!email) return sendJson(res, 200, generic);
    const row = db.prepare("SELECT id, nombre, email FROM lideres WHERE email = ? COLLATE NOCASE AND activo = 1").get(email);
    if (!row) return sendJson(res, 200, generic);
    const token = crypto.randomBytes(24).toString("hex");
    db.prepare("UPDATE lideres SET reset_hash = ?, reset_expires = ? WHERE id = ?").run(
      tokenHash(token),
      new Date(Date.now() + RESET_MS).toISOString(),
      row.id
    );
    const link = resetUrl(req, token);
    try { await sendResetEmail({ to: row.email, nombre: row.nombre, link }); }
    catch (error) { console.error("[DCN] No se pudo enviar el correo:", error.message); }
    return sendJson(res, 200, generic);
  }

  if (req.method === "POST" && path === "/api/lideres/reset") {
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const token = str(body.token, 200);
    const password = str(body.password, 200);
    if (password.length < 8) return sendJson(res, 400, { error: "La contraseña debe tener al menos 8 caracteres." });
    const row = db.prepare("SELECT id FROM lideres WHERE reset_hash = ? AND reset_expires > ? AND activo = 1").get(
      tokenHash(token), new Date().toISOString()
    );
    if (!row) return sendJson(res, 400, { error: "El enlace no es válido o venció." });
    db.prepare("UPDATE lideres SET password_hash = ?, reset_hash = NULL, reset_expires = NULL WHERE id = ?").run(
      hashPassword(password), row.id
    );
    return sendJson(res, 200, { ok: true });
  }

  /* ── REPORTES DE CÉLULAS (LÍDER) ─────────────────────────────────────── */
  if (path === "/api/lideres/celulas" && (req.method === "GET" || req.method === "POST")) {
    const session = getLeaderSession(req);
    const sessionData = session ? leaderSessions.get(session) : null;
    const liderId = sessionData ? sessionData.id : null;
    if (!session || !liderId) return sendJson(res, 401, { error: "No autorizado" });
    const lider = db.prepare("SELECT id, nombre, grupo FROM lideres WHERE id = ? AND activo = 1").get(liderId);
    if (!lider) return sendJson(res, 401, { error: "No autorizado" });

    if (req.method === "GET") {
      const rows = db.prepare(`
        SELECT id, fecha, palabra, personas, notas, grupo, created_at
        FROM celulas WHERE lider_id = ? ORDER BY fecha DESC, id DESC
      `).all(liderId);
      return sendJson(res, 200, { lider, celulas: rows });
    }

    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const fecha = str(body.fecha, 10);
    const palabra = str(body.palabra, 160);
    const personas = Number(body.personas);
    const notas = str(body.notas, 800);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha + "T12:00:00"))) {
      return sendJson(res, 400, { error: "Fecha inválida." });
    }
    if (palabra.length < 2) return sendJson(res, 400, { error: "Escribe la palabra utilizada en la célula." });
    if (!Number.isInteger(personas) || personas < 1 || personas > 1000) {
      return sendJson(res, 400, { error: "La cantidad de personas debe estar entre 1 y 1000." });
    }
    const info = db.prepare(`
      INSERT INTO celulas (lider_id, fecha, palabra, personas, notas, grupo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(liderId, fecha, palabra, personas, notas, lider.grupo, nowLocalIso());
    return sendJson(res, 201, { ok: true, id: Number(info.lastInsertRowid) });
  }

  /* ── ADMINISTRACIÓN ──────────────────────────────────────────────────── */
  if (!path.startsWith("/api/admin/lideres") && path !== "/api/admin/celulas") return false;
  if (!getAdminSession(req)) return sendJson(res, 401, { error: "No autorizado" });

  if (req.method === "GET" && path === "/api/admin/lideres") {
    const rows = db.prepare(`
      SELECT l.id, l.nombre, l.email, l.telefono, l.usuario, l.grupo, l.activo, l.created_at,
             (SELECT COUNT(*) FROM celulas c WHERE c.lider_id = l.id) AS reportes,
             (SELECT COALESCE(SUM(c.personas), 0) FROM celulas c WHERE c.lider_id = l.id) AS personas
      FROM lideres l ORDER BY l.grupo, l.nombre COLLATE NOCASE
    `).all();
    return sendJson(res, 200, { lideres: rows });
  }

  if (req.method === "POST" && path === "/api/admin/lideres") {
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const nombre = str(body.nombre, 120);
    const email = str(body.email, 160).toLowerCase();
    const telefono = str(body.telefono, 40);
    const usuario = str(body.usuario, 80).toLowerCase();
    const password = str(body.password, 200);
    const grupo = str(body.grupo, 20);
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !usuario) {
      return sendJson(res, 400, { error: "Nombre, correo y usuario son obligatorios." });
    }
    if (!GROUPS.has(grupo)) return sendJson(res, 400, { error: "Grupo inválido." });
    if (password.length < 8) return sendJson(res, 400, { error: "La contraseña debe tener al menos 8 caracteres." });
    try {
      const info = db.prepare(`
        INSERT INTO lideres (nombre, email, telefono, usuario, password_hash, grupo, activo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(nombre, email, telefono, usuario, hashPassword(password), grupo, nowLocalIso());
      return sendJson(res, 201, { ok: true, id: Number(info.lastInsertRowid) });
    } catch (error) {
      if (String(error.message).includes("UNIQUE")) return sendJson(res, 409, { error: "El usuario o el correo ya existen." });
      throw error;
    }
  }

  const leaderMatch = path.match(/^\/api\/admin\/lideres\/(\d+)$/);
  if (req.method === "PATCH" && leaderMatch) {
    const id = Number(leaderMatch[1]);
    const current = db.prepare("SELECT * FROM lideres WHERE id = ?").get(id);
    if (!current) return sendJson(res, 404, { error: "Líder no encontrado." });
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const nombre = body.nombre !== undefined ? str(body.nombre, 120) : current.nombre;
    const email = body.email !== undefined ? str(body.email, 160).toLowerCase() : current.email;
    const telefono = body.telefono !== undefined ? str(body.telefono, 40) : current.telefono;
    const grupo = body.grupo !== undefined ? str(body.grupo, 20) : current.grupo;
    const activo = body.activo !== undefined ? (body.activo ? 1 : 0) : current.activo;
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !GROUPS.has(grupo)) {
      return sendJson(res, 400, { error: "Datos inválidos." });
    }
    const password = body.password ? str(body.password, 200) : "";
    if (password && password.length < 8) return sendJson(res, 400, { error: "La contraseña debe tener al menos 8 caracteres." });
    const hash = password ? hashPassword(password) : current.password_hash;
    try {
      db.prepare("UPDATE lideres SET nombre = ?, email = ?, telefono = ?, grupo = ?, activo = ?, password_hash = ? WHERE id = ?")
        .run(nombre, email, telefono, grupo, activo, hash, id);
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      if (String(error.message).includes("UNIQUE")) return sendJson(res, 409, { error: "El correo ya está registrado." });
      throw error;
    }
  }

  const resetMatch = path.match(/^\/api\/admin\/lideres\/(\d+)\/reset-link$/);
  if (req.method === "POST" && resetMatch) {
    const id = Number(resetMatch[1]);
    const row = db.prepare("SELECT id, nombre, email FROM lideres WHERE id = ?").get(id);
    if (!row) return sendJson(res, 404, { error: "Líder no encontrado." });
    const token = crypto.randomBytes(24).toString("hex");
    db.prepare("UPDATE lideres SET reset_hash = ?, reset_expires = ? WHERE id = ?").run(
      tokenHash(token), new Date(Date.now() + RESET_MS).toISOString(), id
    );
    return sendJson(res, 200, { ok: true, url: resetUrl(req, token), nombre: row.nombre });
  }

  if (req.method === "GET" && path === "/api/admin/celulas") {
    const group = str(url.searchParams.get("grupo") || "", 20);
    const from = str(url.searchParams.get("from") || "", 10);
    const to = str(url.searchParams.get("to") || "", 10);
    const liderId = Number(url.searchParams.get("lider_id") || 0);
    const where = [];
    const args = [];
    if (GROUPS.has(group)) { where.push("c.grupo = ?"); args.push(group); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { where.push("c.fecha >= ?"); args.push(from); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { where.push("c.fecha <= ?"); args.push(to); }
    if (liderId > 0) { where.push("c.lider_id = ?"); args.push(liderId); }
    const clause = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const rows = db.prepare(`
      SELECT c.id, c.fecha, c.palabra, c.personas, c.notas, c.grupo, c.created_at,
             l.nombre AS lider, l.usuario
      FROM celulas c JOIN lideres l ON l.id = c.lider_id
      ${clause}
      ORDER BY c.fecha DESC, c.id DESC
    `).all(...args);
    const byGroup = { hombres: 0, mujeres: 0, jovenes: 0 };
    const peopleByGroup = { hombres: 0, mujeres: 0, jovenes: 0 };
    const byMonth = {};
    const byMonthGroup = {};
    let totalPersonas = 0;
    for (const row of rows) {
      totalPersonas += row.personas;
      if (byGroup[row.grupo] !== undefined) byGroup[row.grupo]++;
      if (peopleByGroup[row.grupo] !== undefined) peopleByGroup[row.grupo] += row.personas;
      const month = String(row.fecha).slice(0, 7);
      if (month) {
        byMonth[month] = (byMonth[month] || 0) + row.personas;
        if (!byMonthGroup[month]) byMonthGroup[month] = { hombres: 0, mujeres: 0, jovenes: 0 };
        if (byMonthGroup[month][row.grupo] !== undefined) byMonthGroup[month][row.grupo] += row.personas;
      }
    }
    return sendJson(res, 200, {
      celulas: rows,
      resumen: {
        reportes: rows.length,
        totalRegistros: rows.length,
        personas: totalPersonas,
        porGrupo: byGroup,
        personasPorGrupo: peopleByGroup,
        porMes: byMonth,
        porMesGrupo: byMonthGroup
      }
    });
  }

  return sendJson(res, 404, { error: "Ruta no encontrada" });
}

export function getLeaderSessionIds(req) {
  const session = getLeaderSession(req);
  return session ? leaderSessions.get(session)?.id || null : null;
}
