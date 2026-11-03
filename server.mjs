/* ==========================================================================
   DCN Internacional — servidor local + API + panel de administración
   Node.js sin dependencias externas. Base de datos SQLite (node:sqlite).

   Uso:  node server.mjs [puerto]
   Admin: http://localhost:8080/admin
   Clave: variable DCN_ADMIN_PASSWORD (por defecto dcn2026)
   ========================================================================== */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_PASSWORD = process.env.DCN_ADMIN_PASSWORD || "dcn2026";
const SESSION_MS = 8 * 60 * 60 * 1000;

/* ── BASE DE DATOS ─────────────────────────────────────────────────────── */
const DATA_DIR = process.env.DCN_DATA_DIR || path.join(ROOT, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "dcn.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS inscripciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    age INTEGER,
    source TEXT,
    experience TEXT,
    notes TEXT,
    course TEXT NOT NULL,
    course_code TEXT,
    schedule TEXT,
    mode TEXT,
    status TEXT DEFAULT 'nuevo',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ofrendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    name TEXT NOT NULL,
    id_number TEXT,
    phone TEXT,
    email TEXT,
    method TEXT,
    bank TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    date TEXT NOT NULL,
    ref TEXT,
    designation TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pendiente',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    topic TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'nuevo',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_ins_created ON inscripciones(created_at);
  CREATE INDEX IF NOT EXISTS idx_ofr_date ON ofrendas(date);
  CREATE INDEX IF NOT EXISTS idx_con_created ON contactos(created_at);
`);

/* Respaldo automático: 14 copias diarias dentro del disco persistente */
const BACKUP_DIR = path.join(DATA_DIR, "backups");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

function backupDatabase() {
  try {
    const stamp = nowLocalIso().slice(0, 16).replace(/[:T]/g, "-");
    const target = path.join(BACKUP_DIR, `dcn-${stamp}.db`);
    if (fs.existsSync(target)) return;
    db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}';`);
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((name) => /^dcn-.*\.db$/.test(name))
      .sort();
    while (files.length > 14) {
      const old = files.shift();
      fs.unlinkSync(path.join(BACKUP_DIR, old));
    }
    console.log(`[DCN] Respaldo automático: ${target}`);
  } catch (error) {
    console.error("[DCN] No se pudo crear el respaldo automático:", error.message);
  }
}

setTimeout(backupDatabase, 8000);
setInterval(backupDatabase, 24 * 60 * 60 * 1000);

/* ── SESIONES ──────────────────────────────────────────────────────────── */
const sessions = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of sessions) if (exp < now) sessions.delete(token);
}, 10 * 60 * 1000).unref();

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies.dcn_session;
  if (!token) return null;
  const exp = sessions.get(token);
  if (!exp) return null;
  if (exp < Date.now()) { sessions.delete(token); return null; }
  return token;
}

/* ── UTILIDADES ────────────────────────────────────────────────────────── */
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || "";
  raw.split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function sendJson(res, status, obj, extra = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extra,
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 120000) { reject(new Error("Solicitud demasiado grande")); req.destroy(); return; }
      raw += chunk;
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error("JSON inválido")); }
    });
    req.on("error", reject);
  });
}

const str = (v, max = 220) => String(v ?? "").trim().slice(0, max);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const dateOk = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + "T12:00:00"));
function nowLocalIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}-04:00`;
}

function csvCell(value) {
  let text = String(value ?? "");
  // Evita fórmulas maliciosas al abrir el CSV en Excel
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}
function toCsv(headers, rows) {
  const lines = [headers.map((h) => csvCell(h.label)).join(";")];
  for (const row of rows) lines.push(headers.map((h) => csvCell(h.get(row))).join(";"));
  return "\uFEFF" + lines.join("\r\n");
}

/* Límite de intentos de login por IP */
const loginAttempts = new Map();
function allowLogin(ip) {
  const now = Date.now();
  const arr = (loginAttempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  if (arr.length >= 10) return false;
  arr.push(now);
  loginAttempts.set(ip, arr);
  return true;
}

/* Límite simple de envíos públicos por IP */
const rate = new Map();
function allowPost(ip) {
  const now = Date.now();
  const arr = (rate.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (arr.length >= 60) return false;
  arr.push(now);
  rate.set(ip, arr);
  return true;
}

/* ── FILTROS ───────────────────────────────────────────────────────────── */
function buildFilters(type, params) {
  const where = [];
  const args = [];
  const year = params.get("year") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const q = str(params.get("q") || "", 80);
  const dateExpr = type === "ofrendas" ? "date" : "substr(created_at, 1, 10)";
  const yearExpr = type === "ofrendas" ? "substr(date, 1, 4)" : "substr(created_at, 1, 4)";

  if (/^\d{4}$/.test(year)) { where.push(`${yearExpr} = ?`); args.push(year); }
  if (dateOk(from)) { where.push(`${dateExpr} >= ?`); args.push(from); }
  if (dateOk(to)) { where.push(`${dateExpr} <= ?`); args.push(to); }

  if (q) {
    const like = `%${q}%`;
    if (type === "ofrendas") {
      where.push("(name LIKE ? OR id_number LIKE ? OR email LIKE ? OR phone LIKE ? OR ref LIKE ? OR code LIKE ?)");
      args.push(like, like, like, like, like, like);
    } else if (type === "contactos") {
      where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? OR code LIKE ?)");
      args.push(like, like, like, like, like);
    } else {
      where.push("(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR code LIKE ? OR course LIKE ?)");
      args.push(like, like, like, like, like, like);
    }
  }

  return { clause: where.length ? ` WHERE ${where.join(" AND ")}` : "", args };
}

function listYears() {
  const rows = db.prepare(`
    SELECT DISTINCT substr(created_at, 1, 4) AS y FROM inscripciones
    UNION
    SELECT DISTINCT substr(date, 1, 4) AS y FROM ofrendas
    UNION
    SELECT DISTINCT substr(created_at, 1, 4) AS y FROM contactos
    ORDER BY y DESC
  `).all();
  const years = rows.map((r) => r.y).filter((y) => /^\d{4}$/.test(y));
  const current = String(new Date().getFullYear());
  if (!years.includes(current)) years.unshift(current);
  return years;
}

/* ── API ───────────────────────────────────────────────────────────────── */
async function handleApi(req, res, url) {
  const { pathname } = url;
  const ip = req.socket.remoteAddress || "local";

  /* Registro público de inscripción */
  if (req.method === "POST" && pathname === "/api/inscripciones") {
    if (!allowPost(ip)) return sendJson(res, 429, { error: "Demasiados envíos. Intenta más tarde." });
    let body;
    try { body = await readJson(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }

    const data = {
      firstName: str(body.firstName, 80),
      lastName: str(body.lastName, 80),
      email: str(body.email, 160).toLowerCase(),
      phone: str(body.phone, 40),
      age: Number(body.age),
      source: str(body.source, 80),
      experience: str(body.experience, 120),
      notes: str(body.notes, 800),
      course: str(body.course, 140),
      courseCode: str(body.courseCode, 40),
      schedule: str(body.schedule, 80),
      mode: str(body.mode, 40)
    };

    const errors = [];
    if (!data.firstName) errors.push("Nombre requerido");
    if (!data.lastName) errors.push("Apellido requerido");
    if (data.email && !emailOk(data.email)) errors.push("Correo inválido");
    if (data.phone.replace(/\D/g, "").length < 7) errors.push("WhatsApp inválido");
    if (!Number.isFinite(data.age) || data.age < 10 || data.age > 99) errors.push("Edad inválida");
    if (!data.course) errors.push("Módulo requerido");
    if (!data.schedule) errors.push("Horario requerido");
    if (!data.mode) errors.push("Modalidad requerida");
    if (errors.length) return sendJson(res, 400, { error: errors[0], errors });

    const info = db.prepare(`
      INSERT INTO inscripciones
        (code, first_name, last_name, email, phone, age, source, experience, notes, course, course_code, schedule, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("", data.firstName, data.lastName, data.email, data.phone, data.age,
      data.source, data.experience, data.notes, data.course, data.courseCode,
      data.schedule, data.mode, nowLocalIso());

    const code = `DCN-INS-${String(info.lastInsertRowid).padStart(4, "0")}`;
    db.prepare("UPDATE inscripciones SET code = ? WHERE id = ?").run(code, info.lastInsertRowid);
    return sendJson(res, 201, { ok: true, code, id: Number(info.lastInsertRowid) });
  }

  /* Registro público de ofrenda */
  if (req.method === "POST" && pathname === "/api/ofrendas") {
    if (!allowPost(ip)) return sendJson(res, 429, { error: "Demasiados envíos. Intenta más tarde." });
    let body;
    try { body = await readJson(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }

    const data = {
      name: str(body.name, 120),
      idNumber: str(body.idNumber, 40),
      phone: str(body.phone, 40),
      email: str(body.email, 160).toLowerCase(),
      method: str(body.method, 60),
      bank: str(body.bank, 80),
      amount: Number(body.amount),
      currency: body.currency === "Bs" ? "Bs" : "USD",
      date: str(body.date, 10),
      ref: str(body.ref, 80),
      designation: str(body.designation, 60) || "Diezmo",
      notes: str(body.notes, 800)
    };

    const errors = [];
    if (!data.name) errors.push("Nombre requerido");
    if (!data.idNumber) errors.push("Cédula o RIF requerido");
    if (data.phone.replace(/\D/g, "").length < 7) errors.push("WhatsApp inválido");
    if (data.email && !emailOk(data.email)) errors.push("Correo inválido");
    if (!data.method) errors.push("Método requerido");
    if (!Number.isFinite(data.amount) || data.amount <= 0) errors.push("Monto inválido");
    if (!dateOk(data.date)) errors.push("Fecha inválida");
    if (!data.ref) errors.push("Referencia requerida");
    if (errors.length) return sendJson(res, 400, { error: errors[0], errors });

    const info = db.prepare(`
      INSERT INTO ofrendas
        (code, name, id_number, phone, email, method, bank, amount, currency, date, ref, designation, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("", data.name, data.idNumber, data.phone, data.email, data.method,
      data.bank, data.amount, data.currency, data.date, data.ref, data.designation,
      data.notes, nowLocalIso());

    const code = `DCN-PAGO-${String(info.lastInsertRowid).padStart(4, "0")}`;
    db.prepare("UPDATE ofrendas SET code = ? WHERE id = ?").run(code, info.lastInsertRowid);
    return sendJson(res, 201, { ok: true, code, id: Number(info.lastInsertRowid) });
  }

  /* Mensaje de contacto */
  if (req.method === "POST" && pathname === "/api/contactos") {
    if (!allowPost(ip)) return sendJson(res, 429, { error: "Demasiados envíos. Intenta más tarde." });
    let body;
    try { body = await readJson(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }

    const data = {
      name: str(body.name, 120),
      email: str(body.email, 160).toLowerCase(),
      phone: str(body.phone, 40),
      topic: str(body.topic, 80) || "Contacto",
      message: str(body.message, 1600)
    };

    const errors = [];
    if (!data.name) errors.push("Nombre requerido");
    if (!emailOk(data.email)) errors.push("Correo inválido");
    if (!data.message) errors.push("Mensaje requerido");
    if (errors.length) return sendJson(res, 400, { error: errors[0], errors });

    const info = db.prepare(`
      INSERT INTO contactos (code, name, email, phone, topic, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("", data.name, data.email, data.phone, data.topic, data.message, nowLocalIso());

    const code = `DCN-MSG-${String(info.lastInsertRowid).padStart(4, "0")}`;
    db.prepare("UPDATE contactos SET code = ? WHERE id = ?").run(code, info.lastInsertRowid);
    return sendJson(res, 201, { ok: true, code, id: Number(info.lastInsertRowid) });
  }

  /* Login */
  if (req.method === "POST" && pathname === "/api/admin/login") {
    if (!allowLogin(ip)) return sendJson(res, 429, { error: "Demasiados intentos. Espera 15 minutos." });
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const given = str(body.password, 200);
    const a = Buffer.from(given);
    const b = Buffer.from(ADMIN_PASSWORD);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 350));
      return sendJson(res, 401, { error: "Clave incorrecta" });
    }
    const token = createSession();
    const secure = (req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
    return sendJson(res, 200, { ok: true }, {
      "set-cookie": `dcn_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`
    });
  }

  if (req.method === "POST" && pathname === "/api/admin/logout") {
    const token = getSession(req);
    if (token) sessions.delete(token);
    return sendJson(res, 200, { ok: true }, {
      "set-cookie": "dcn_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    });
  }

  if (req.method === "GET" && pathname === "/api/admin/me") {
    if (!getSession(req)) return sendJson(res, 401, { error: "No autorizado" });
    return sendJson(res, 200, { ok: true });
  }

  /* Rutas protegidas */
  if (pathname.startsWith("/api/admin/")) {
    if (!getSession(req)) return sendJson(res, 401, { error: "No autorizado" });
  }

  if (req.method === "PATCH" && /^\/api\/admin\/contactos\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop());
    let body;
    try { body = await readJson(req); } catch { return sendJson(res, 400, { error: "Solicitud inválida" }); }
    const status = body.status === "respondido" ? "respondido" : body.status === "nuevo" ? "nuevo" : null;
    if (!status) return sendJson(res, 400, { error: "Estado inválido" });
    const info = db.prepare("UPDATE contactos SET status = ? WHERE id = ?").run(status, id);
    if (!info.changes) return sendJson(res, 404, { error: "Mensaje no encontrado" });
    return sendJson(res, 200, { ok: true, status });
  }

  if (req.method === "GET" && pathname === "/api/admin/data") {
    const requested = url.searchParams.get("type");
    const type = ["ofrendas", "contactos"].includes(requested) ? requested : "inscripciones";
    const { clause, args } = buildFilters(type, url.searchParams);
    const order = type === "ofrendas" ? "date DESC, id DESC" : "created_at DESC, id DESC";
    const rows = db.prepare(`SELECT * FROM ${type}${clause} ORDER BY ${order}`).all(...args);

    let summary;
    if (type === "ofrendas") {
      let totalUsd = 0, totalBs = 0;
      const byDesignation = {}, byMethod = {}, byMonth = {}, donors = {};
      for (const r of rows) {
        if (r.currency === "Bs") totalBs += r.amount; else totalUsd += r.amount;
        byDesignation[r.designation || "Sin destino"] = (byDesignation[r.designation || "Sin destino"] || 0) + 1;
        byMethod[r.method || "Sin método"] = (byMethod[r.method || "Sin método"] || 0) + 1;
        const m = (r.date || "").slice(0, 7);
        if (m) {
          byMonth[m] = byMonth[m] || { usd: 0, bs: 0, count: 0 };
          byMonth[m].count++;
          if (r.currency === "Bs") byMonth[m].bs += r.amount; else byMonth[m].usd += r.amount;
        }
        const key = `${r.name}|${r.id_number || ""}`;
        donors[key] = donors[key] || { name: r.name, idNumber: r.id_number || "", usd: 0, bs: 0, count: 0 };
        donors[key].count++;
        if (r.currency === "Bs") donors[key].bs += r.amount; else donors[key].usd += r.amount;
      }
      summary = {
        count: rows.length,
        totalUsd,
        totalBs,
        donorCount: Object.keys(donors).length,
        donors: Object.values(donors).sort((a, b) => b.usd - a.usd || b.bs - a.bs).slice(0, 12),
        byDesignation,
        byMethod,
        byMonth
      };
    } else if (type === "contactos") {
      const byTopic = {}, byMonth = {};
      for (const r of rows) {
        byTopic[r.topic || "Otro"] = (byTopic[r.topic || "Otro"] || 0) + 1;
        const m = (r.created_at || "").slice(0, 7);
        if (m) byMonth[m] = (byMonth[m] || 0) + 1;
      }
      summary = {
        count: rows.length,
        byTopic,
        byMonth,
        latest: rows[0]?.created_at || null
      };
    } else {
      const byCourse = {}, byMode = {}, byMonth = {}, bySource = {};
      for (const r of rows) {
        byCourse[r.course] = (byCourse[r.course] || 0) + 1;
        byMode[r.mode || "—"] = (byMode[r.mode || "—"] || 0) + 1;
        bySource[r.source || "—"] = (bySource[r.source || "—"] || 0) + 1;
        const m = (r.created_at || "").slice(0, 7);
        if (m) byMonth[m] = (byMonth[m] || 0) + 1;
      }
      summary = { count: rows.length, byCourse, byMode, byMonth, bySource };
    }

    return sendJson(res, 200, { ok: true, rows, summary, years: listYears() });
  }

  if (req.method === "GET" && pathname === "/api/admin/export") {
    const requested = url.searchParams.get("type");
    const type = ["ofrendas", "contactos"].includes(requested) ? requested : "inscripciones";
    const { clause, args } = buildFilters(type, url.searchParams);
    const order = type === "ofrendas" ? "date DESC, id DESC" : "created_at DESC, id DESC";
    const rows = db.prepare(`SELECT * FROM ${type}${clause} ORDER BY ${order}`).all(...args);

    let headers, filename;
    if (type === "ofrendas") {
      filename = `ofrendas-${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        { label: "Fecha del aporte", get: (r) => r.date },
        { label: "Registrado", get: (r) => (r.created_at || "").slice(0, 10) },
        { label: "Código", get: (r) => r.code },
        { label: "Titular", get: (r) => r.name },
        { label: "Cédula / RIF", get: (r) => r.id_number },
        { label: "WhatsApp", get: (r) => r.phone },
        { label: "Correo", get: (r) => r.email },
        { label: "Método", get: (r) => r.method },
        { label: "Banco", get: (r) => r.bank },
        { label: "Monto", get: (r) => String(r.amount).replace(".", ",") },
        { label: "Moneda", get: (r) => r.currency },
        { label: "Referencia", get: (r) => r.ref },
        { label: "Destino", get: (r) => r.designation },
        { label: "Observaciones", get: (r) => r.notes },
        { label: "Estado", get: (r) => r.status }
      ];
    } else if (type === "contactos") {
      filename = `mensajes-${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        { label: "Fecha", get: (r) => (r.created_at || "").slice(0, 10) },
        { label: "Código", get: (r) => r.code },
        { label: "Nombre", get: (r) => r.name },
        { label: "Correo", get: (r) => r.email },
        { label: "WhatsApp", get: (r) => r.phone },
        { label: "Motivo", get: (r) => r.topic },
        { label: "Mensaje", get: (r) => r.message },
        { label: "Estado", get: (r) => r.status }
      ];
    } else {
      filename = `inscripciones-${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        { label: "Fecha de inscripción", get: (r) => (r.created_at || "").slice(0, 10) },
        { label: "Código", get: (r) => r.code },
        { label: "Nombre", get: (r) => r.first_name },
        { label: "Apellido", get: (r) => r.last_name },
        { label: "Correo", get: (r) => r.email },
        { label: "WhatsApp", get: (r) => r.phone },
        { label: "Edad", get: (r) => r.age },
        { label: "Módulo", get: (r) => r.course },
        { label: "Código del módulo", get: (r) => r.course_code },
        { label: "Horario", get: (r) => r.schedule },
        { label: "Modalidad", get: (r) => r.mode },
        { label: "Experiencia previa", get: (r) => r.experience },
        { label: "Cómo se enteró", get: (r) => r.source },
        { label: "Observaciones", get: (r) => r.notes },
        { label: "Estado", get: (r) => r.status }
      ];
    }

    const csv = toCsv(headers, rows);
    res.writeHead(200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store"
    });
    return res.end(csv);
  }

  if (req.method === "GET" && pathname === "/api/admin/backup") {
    try { db.exec("PRAGMA wal_checkpoint(TRUNCATE)"); } catch {}
    const filename = `dcn-respaldo-${new Date().toISOString().slice(0, 10)}.db`;
    res.writeHead(200, {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store"
    });
    return fs.createReadStream(DB_PATH).pipe(res);
  }

  if (req.method === "GET" && pathname === "/api/admin/backups") {
    let files = [];
    try {
      files = fs.readdirSync(BACKUP_DIR)
        .filter((name) => /^dcn-[A-Za-z0-9._-]+\.db$/.test(name))
        .map((name) => {
          const full = path.join(BACKUP_DIR, name);
          const stat = fs.statSync(full);
          return { name, size: stat.size, created_at: stat.mtime.toISOString() };
        })
        .filter((item) => fs.lstatSync(path.join(BACKUP_DIR, item.name)).isFile())
        .sort((a, b) => b.name.localeCompare(a.name));
    } catch (error) {
      console.error("[DCN] No se pudo listar respaldos:", error.message);
    }
    return sendJson(res, 200, { backups: files });
  }

  if (req.method === "GET" && pathname.startsWith("/api/admin/backups/")) {
    let name = "";
    try { name = decodeURIComponent(pathname.slice("/api/admin/backups/".length)); } catch {}
    name = path.basename(name);
    if (!/^dcn-[A-Za-z0-9._-]+\.db$/.test(name)) {
      return sendJson(res, 400, { error: "Nombre de respaldo inválido" });
    }
    const full = path.join(BACKUP_DIR, name);
    if (!full.startsWith(BACKUP_DIR + path.sep)) {
      return sendJson(res, 400, { error: "Ruta inválida" });
    }
    let stat;
    try { stat = fs.lstatSync(full); } catch { return sendJson(res, 404, { error: "Respaldo no encontrado" }); }
    if (!stat.isFile()) return sendJson(res, 404, { error: "Respaldo no encontrado" });
    res.writeHead(200, {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${name}"`,
      "content-length": stat.size,
      "cache-control": "no-store"
    });
    return fs.createReadStream(full).pipe(res);
  }

  return sendJson(res, 404, { error: "Ruta no encontrada" });
}

/* ── ESTÁTICOS ─────────────────────────────────────────────────────────── */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};

function serveFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      return res.end("404 — no encontrado");
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "referrer-policy": "strict-origin-when-cross-origin"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/api/")) return await handleApi(req, res, url);
    if (pathname === "/admin" || pathname === "/admin/") {
      return serveFile(res, path.join(ROOT, "admin.html"));
    }

    const isPrivate =
      pathname === "/data" || pathname.startsWith("/data/") ||
      pathname === "/backups" || pathname.startsWith("/backups/") ||
      pathname === "/server.mjs" || pathname === "/README.md" ||
      pathname === "/package.json" || pathname === "/package-lock.json" ||
      pathname === "/Dockerfile" || pathname === "/start.cmd" ||
      pathname === "/DESPLIEGUE.md" ||
      pathname.endsWith(".md") || pathname.startsWith("/.");
    if (isPrivate) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      return res.end("404 — no encontrado");
    }

    let filePath = path.join(ROOT, path.normalize(pathname).replace(/^([/\\])+/, ""));
    if (pathname.endsWith("/")) filePath = path.join(filePath, "index.html");
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { "content-type": "text/plain" });
      return res.end("403");
    }

    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isDirectory()) {
        res.writeHead(301, { location: pathname.replace(/\/?$/, "/") });
        return res.end();
      }
      if (err || !stat.isFile()) {
        return serveFile(res, path.join(ROOT, "index.html"));
      }
      res.writeHead(200, {
        "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Error interno" }));
    }
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  El puerto ${PORT} está ocupado. Prueba: node server.mjs ${PORT + 1}\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`\n  DCN Internacional — servidor`);
  console.log(`  Sitio:  http://localhost:${PORT}/dcn/`);
  console.log(`  Admin:  http://localhost:${PORT}/admin`);
  console.log(`  Datos:  ${DB_PATH}`);
  console.log(`  Clave admin: ${process.env.DCN_ADMIN_PASSWORD ? "(definida por variable)" : "dcn2026 (cámbiala con DCN_ADMIN_PASSWORD)"}`);
  console.log(`  Detén con Ctrl+C\n`);
});
