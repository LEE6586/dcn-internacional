/* ==========================================================================
   DCN INTERNACIONAL — interacciones
   Brújula sagrada · galería · donativos · inscripción · formularios
   ========================================================================== */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const isEnrollPage = !!$("#enrollForm");

  /* ── CONTENIDO ────────────────────────────────────────────────────────── */
  const COURSES = [
    {
      id: "universidad",
      code: "UVD-101",
      title: "Universidad de la Vida",
      level: "Fundamentos",
      duration: "10 semanas",
      schedules: ["Lunes · 5:30–7:00 PM"],
      modes: ["Presencial", "En línea"],
      desc: "Formación integral para la vida cristiana: identidad, familia, finanzas, carácter y propósito.",
      hours: "20 horas"
    },
    {
      id: "destino-1",
      code: "DES-201",
      title: "Capacitación Destino 1",
      level: "Nivel 1",
      duration: "8 semanas",
      schedules: ["Miércoles · 5:30–7:00 PM"],
      modes: ["Presencial", "Híbrido"],
      desc: "El primer paso del discipulado: fundamentos de la fe, identidad en Cristo y vida devocional.",
      hours: "16 horas"
    },
    {
      id: "destino-2",
      code: "DES-202",
      title: "Capacitación Destino 2",
      level: "Nivel 2",
      duration: "8 semanas",
      schedules: ["Miércoles · 5:30–7:00 PM"],
      modes: ["Presencial", "Híbrido"],
      desc: "Crecemos en carácter, sanidad interior y relaciones familiares restauradas.",
      hours: "16 horas"
    },
    {
      id: "destino-3",
      code: "DES-203",
      title: "Capacitación Destino 3",
      level: "Nivel 3",
      duration: "8 semanas",
      schedules: ["Miércoles · 5:30–7:00 PM"],
      modes: ["Presencial"],
      desc: "Formación de líderes: llamado, servicio, mayordomía y multiplicación de discípulos.",
      hours: "16 horas"
    }
  ];

  const MINISTRIES = [
    {
      name: "Alabanza y Adoración",
      icon: "music",
      desc: "Guiar a la iglesia a la presencia de Dios con música, excelencia y un corazón rendido.",
      day: "Sábados · 5:00 PM",
      detail: "Ensayos semanales, formación musical y técnica. Audiciones abiertas dos veces al año."
    },
    {
      name: "Kids",
      icon: "child",
      desc: "Un espacio seguro y creativo donde los niños descubren que Jesús los ama desde su edad.",
      day: "Domingos · 9:00–11:00 AM",
      detail: "Clases por edades, maestras capacitadas y protocolo de seguridad para cada niño."
    },
    {
      name: "Teens",
      icon: "spark",
      desc: "Acompañamos a los adolescentes en su identidad, sus amistades y su fe.",
      day: "Sábados · 4:00 PM",
      detail: "Encuentros, retiros y grupos pequeños adaptados a su edad. De 13 a 17 años."
    },
    {
      name: "Jóvenes",
      icon: "users",
      desc: "Una generación con propósito, amigos reales y una fe que transforma su entorno.",
      day: "Viernes · 7:00 PM",
      detail: "Encuentros, retiros, grupos pequeños y servicio en la ciudad. De 18 a 28 años."
    },
    {
      name: "Media",
      icon: "camera",
      desc: "Comunicamos el mensaje con excelencia: diseño, redes, fotografía y producción audiovisual.",
      day: "Sábados · 2:00 PM",
      detail: "Cobertura de eventos, diseño gráfico, redes sociales y edición de video."
    },
    {
      name: "Intercesión",
      icon: "flame",
      desc: "El motor invisible de la iglesia: un equipo que dobla rodillas por la familia, la ciudad y las naciones.",
      day: "Lunes a viernes · 6:00 AM",
      detail: "Turnos de oración, vigilias mensuales y acompañamiento espiritual confidencial."
    },
    {
      name: "Consolidación",
      icon: "consolidate",
      desc: "Recibimos, acompañamos y conectamos a cada persona nueva con la vida de la iglesia.",
      day: "Domingos · 12:30 PM",
      detail: "Seguimiento a nuevos creyentes, visitas, consejería inicial y conexión con grupos pequeños."
    },
    {
      name: "Hombres",
      icon: "shield",
      desc: "Hombres íntegros que lideran su casa con amor, trabajan con honra y sirven con humildad.",
      day: "Sábados · 7:00 PM",
      detail: "Mentoría, estudio bíblico y salidas de servicio. Una hermandad que no deja a nadie atrás."
    },
    {
      name: "Mujeres",
      icon: "flower",
      desc: "Mujeres que se acompañan, se forman y descubren su identidad y su llamado en Cristo.",
      day: "Sábados · 4:00 PM",
      detail: "Estudios bíblicos, encuentros de oración y proyectos de servicio a familias."
    },
    {
      name: "Matrimonios",
      icon: "rings",
      desc: "Fortalecemos los matrimonios con acompañamiento, consejería y encuentros de restauración.",
      day: "Un viernes al mes · 7:00 PM",
      detail: "Encuentros de parejas, consejería y herramientas prácticas para construir un hogar firme."
    },
    {
      name: "Sonido",
      icon: "speaker",
      desc: "El equipo técnico que hace posible que cada palabra y cada nota se escuchen con claridad.",
      day: "Sábados · 3:00 PM",
      detail: "Consolas, microfonía, monitores y transmisión en vivo. Formación técnica incluida."
    },
    {
      name: "Protocolo",
      icon: "clipboard",
      desc: "Recibimos, orientamos y cuidamos a cada persona que llega a la casa.",
      day: "Domingos · 8:00 AM",
      detail: "Recibimiento, acomodación, información y atención a visitantes, pastores e invitados."
    }
  ];

  const LEADERS = [
    {
      initials: "ES",
      name: "Pastor Edgar Soto",
      role: "Pastor",
      bio: "Pastorea la iglesia junto a su esposa Yazmín, con el llamado de predicar la Palabra y acompañar a las familias."
    },
    {
      initials: "JG",
      name: "Pastora Yazmín González de Soto",
      role: "Pastora",
      bio: "Camina junto a las familias y las mujeres de la casa, con un corazón de oración, consejería y restauración."
    }
  ];

  const TEAMS = [
    {
      id: "mujeres",
      name: "Mujeres",
      label: "Equipo de 12",
      icon: "flower",
      desc: "Doce mujeres que se acompañan, oran juntas y crecen en la Palabra, caminando hacia la restauración de sus familias.",
      meta: "12 integrantes · Reunión semanal"
    },
    {
      id: "hombres",
      name: "Hombres",
      label: "Equipo de 12",
      icon: "shield",
      desc: "Doce hombres que se fortalecen en la fe, se hacen responsables unos de otros y lideran con integridad.",
      meta: "12 integrantes · Reunión semanal"
    }
  ];

  const GALLERY = [
    { id: 1, type: "foto", cat: "adoracion", theme: "adoracion", title: "Noche de adoración", kicker: "Conferencia", date: "Nov 2026", size: "big", verse: "«Te alabaré, oh Jehová, con todo mi corazón»" },
    { id: 2, type: "video", cat: "jovenes", theme: "jovenes", title: "Retiro de jóvenes", kicker: "Video · 2:14", date: "Oct 2026", size: "", verse: "Una generación con propósito" },
    { id: 3, type: "foto", cat: "misiones", theme: "misiones", title: "Salida misionera", kicker: "Misiones", date: "Sep 2026", size: "", verse: "«Id por todo el mundo»" },
    { id: 4, type: "foto", cat: "bautismo", theme: "bautismo", title: "Bautizos de octubre", kicker: "Celebración", date: "Oct 2026", size: "tall", verse: "Nuevas criaturas en Cristo" },
    { id: 5, type: "video", cat: "adoracion", theme: "oracion", title: "Vigilia de oración", kicker: "Video · 1:32", date: "Ago 2026", size: "", verse: "«Velad y orad»" },
    { id: 6, type: "foto", cat: "familia", theme: "familia", title: "Encuentro de matrimonios", kicker: "Familia", date: "Jul 2026", size: "", verse: "«Una sola carne»" },
    { id: 7, type: "foto", cat: "jovenes", theme: "jovenes", title: "Campamento de verano", kicker: "Jóvenes", date: "Ago 2026", size: "wide", verse: "Cuatro días que cambiaron vidas" },
    { id: 8, type: "foto", cat: "damas", theme: "damas", title: "Encuentro de damas", kicker: "Mujeres", date: "Jun 2026", size: "", verse: "«Mujer virtuosa, ¿quién la hallará?»" },
    { id: 9, type: "foto", cat: "navidad", theme: "navidad", title: "Navidad DCN", kicker: "Celebración", date: "Dic 2026", size: "", verse: "«Os ha nacido un Salvador»" },
    { id: 10, type: "video", cat: "misiones", theme: "misiones", title: "Misión Guajira", kicker: "Video · 3:05", date: "May 2026", size: "", verse: "El evangelio cruzó la frontera" },
    { id: 11, type: "foto", cat: "adoracion", theme: "oracion", title: "Conferencia de avivamiento", kicker: "Conferencia", date: "Abr 2026", size: "", verse: "«Fuego extraño, corazón limpio»" },
    { id: 12, type: "foto", cat: "familia", theme: "familia", title: "Día de la familia", kicker: "Familia", date: "May 2026", size: "wide", verse: "Una mesa, una casa, una fe" }
  ];

  const PAY_METHODS = [
    { title: "Pago Móvil", detail: "—" },
    { title: "Zelle", detail: "—" },
    { title: "Transferencia", detail: "Banesco · 0134-0000-00-0000000000" },
    { title: "Binance / USDT", detail: "Solicita la dirección por WhatsApp" }
  ];

  const MINISTRY_ICONS = {
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
    child: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6"/><path d="M9 8h.01M15 8h.01"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/><circle cx="12" cy="12" r="3"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 1.6 5 4.5"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/><circle cx="7" cy="12" r="2.2"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z"/><path d="M12 14c1 1 2 2 2 3a2 2 0 1 1-4 0c0-1 1-2 2-3Z"/></svg>',
    consolidate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20s-7-4.2-7-9a3.8 3.8 0 0 1 7-2.1A3.8 3.8 0 0 1 19 11c0 4.8-7 9-7 9Z"/><path d="M12 8.5v5M9.5 11h5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
    flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21c0-5 2-8 6-9M12 21c0-5-2-8-6-9"/><circle cx="12" cy="7" r="4"/></svg>',
    rings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="14" r="5"/><circle cx="15" cy="10" r="5"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 9v6h3l5 4V5L7 9H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 11h8M8 15h5"/></svg>'
  };

  /* ── UTILIDADES ───────────────────────────────────────────────────────── */
  const toastEl = $("#toast");
  let toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      ta.remove();
      return ok;
    }
  }

  function setInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", invalid);
    el.setAttribute("aria-invalid", String(invalid));
  }

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  /* ── BRÚJULA SAGRADA (canvas) ─────────────────────────────────────────── */
  function initCompass() {
    const canvas = $("#guiaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, t0 = performance.now();
    let mx = 0, my = 0, tx = 0, ty = 0;
    const reduce = reduceMotion.matches;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function star(x, y, r, alpha) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 235, 255, ${alpha})`;
      ctx.fill();
    }

    /* estrellas deterministas */
    const stars = Array.from({ length: 46 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const s = seed / 233280;
      return { x: (s * 1.7) % 1, y: (Math.sin(i * 12.9898) * 0.5 + 0.5) % 1, r: 0.5 + (i % 3) * 0.45, p: s };
    });

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + mx * 12;
      const cy = h / 2 + my * 10;
      const R = Math.min(w, h) * 0.4;

      /* halo */
      const halo = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.35);
      halo.addColorStop(0, "rgba(120, 200, 240, 0.20)");
      halo.addColorStop(0.45, "rgba(46, 110, 170, 0.10)");
      halo.addColorStop(1, "rgba(5, 11, 21, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      /* estrellas */
      stars.forEach((s) => star(s.x * w, s.y * h, s.r, 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.7 + s.p * 9))));

      /* anillos */
      const rings = [
        { r: R * 1.0, a: 0.1, dash: [1, 5], speed: 0 },
        { r: R * 0.82, a: 0.14, dash: [2, 10], speed: 0.02 },
        { r: R * 0.62, a: 0.2, dash: [24, 8], speed: -0.03 },
        { r: R * 0.42, a: 0.24, dash: [], speed: 0.04 }
      ];
      rings.forEach((ring, i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * ring.speed + i * 0.4);
        ctx.beginPath();
        ctx.setLineDash(ring.dash);
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(156, 218, 243, ${ring.a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      /* marcas de grados */
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 72; i++) {
        const ang = (i / 72) * Math.PI * 2;
        const major = i % 9 === 0;
        const r1 = R * 0.9;
        const r2 = R * (major ? 0.86 : 0.88);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
        ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
        ctx.strokeStyle = `rgba(156, 218, 243, ${major ? 0.38 : 0.14})`;
        ctx.lineWidth = major ? 1.2 : 0.8;
        ctx.stroke();
      }
      ctx.restore();

      /* puntos cardinales */
      const labels = [
        { text: "N", ang: -Math.PI / 2, cross: true },
        { text: "E", ang: 0 },
        { text: "S", ang: Math.PI / 2 },
        { text: "O", ang: Math.PI }
      ];
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      labels.forEach((l) => {
        const x = cx + Math.cos(l.ang) * R * 0.98;
        const y = cy + Math.sin(l.ang) * R * 0.98;
        if (l.cross) {
          /* la cruz: el norte */
          ctx.save();
          ctx.translate(x, y);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 26);
          g.addColorStop(0, "rgba(156, 218, 243, 0.5)");
          g.addColorStop(1, "rgba(156, 218, 243, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(220, 245, 255, 0.95)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(0, -9); ctx.lineTo(0, 9);
          ctx.moveTo(-6, -3); ctx.lineTo(6, -3);
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = "rgba(200, 235, 255, 0.75)";
          ctx.fillText("N", x, y + 22);
        } else {
          ctx.fillStyle = "rgba(200, 235, 255, 0.38)";
          ctx.fillText(l.text, x, y);
        }
      });

      /* aguja: oscila y apunta al norte (la cruz) */
      const wobble = reduce ? 0 : Math.sin(t * 0.5) * 0.05 + Math.sin(t * 1.7) * 0.012;
      const angle = -Math.PI / 2 + wobble + mx * 0.06;
      const len = R * 0.56;
      const backLen = R * 0.2;
      const tipX = cx + Math.cos(angle) * len;
      const tipY = cy + Math.sin(angle) * len;
      const backX = cx - Math.cos(angle) * backLen;
      const backY = cy - Math.sin(angle) * backLen;

      ctx.save();
      const needleGrad = ctx.createLinearGradient(backX, backY, tipX, tipY);
      needleGrad.addColorStop(0, "rgba(120, 180, 220, 0.25)");
      needleGrad.addColorStop(0.55, "rgba(156, 218, 243, 0.85)");
      needleGrad.addColorStop(1, "rgba(235, 250, 255, 1)");
      ctx.strokeStyle = needleGrad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(156, 218, 243, 0.6)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(backX, backY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.restore();

      /* eje */
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#eaf6ff";
      ctx.shadowColor = "rgba(156, 218, 243, 0.8)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(156, 218, 243, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* etiqueta */
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(200, 235, 255, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText("LA CRUZ ES NUESTRO NORTE", cx, cy + R * 1.18);
    }

    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1);
      ty = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1);
    }, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);

    if (reduce) { t0 = performance.now() - 5000; }
  }

  /* ── NAVEGACIÓN ───────────────────────────────────────────────────────── */
  function initNav() {
    const hdr = $("#hdr");
    const btn = $("#menuBtn");
    const menu = $("#mobileNav");

    window.addEventListener("scroll", () => {
      if (hdr) hdr.classList.toggle("is-solid", window.scrollY > 30);
    }, { passive: true });

    function setMenu(open) {
      if (!btn || !menu) return;
      btn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("is-locked", open);
      $$("a", menu).forEach((a, i) => {
        a.style.transitionDelay = open ? `${0.08 + i * 0.04}s` : "0s";
      });
    }
    btn?.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
    $$("a", menu || document.createElement("div")).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

    /* enlaces internos con desplazamiento suave */
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", href);
      });
    });

    /* año */
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    /* botón flotante de WhatsApp: aparece tras el hero */
    const wa = $(".wa-float");
    if (wa) {
      wa.style.opacity = "0";
      wa.style.transform = "translateY(10px)";
      wa.style.transition = "opacity .5s ease, transform .5s ease";
      window.addEventListener("scroll", () => {
        const show = window.scrollY > 500;
        wa.style.opacity = show ? "1" : "0";
        wa.style.transform = show ? "none" : "translateY(10px)";
        wa.style.pointerEvents = show ? "auto" : "none";
      }, { passive: true });
    }
  }

  /* ── REVEALS + CONTADORES ─────────────────────────────────────────────── */
  function initReveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));

    const counters = $$("[data-count]");
    if (!counters.length) return;
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        cio.unobserve(el);
        const target = Number(el.dataset.count) || 0;
        if (reduceMotion.matches) { el.textContent = String(target); return; }
        const start = performance.now();
        const dur = 1400;
        (function step(now) {
          const t = clamp((now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ── MINISTERIOS ──────────────────────────────────────────────────────── */
  function initMinistries() {
    const wrap = $("#ministries");
    if (!wrap) return;
    wrap.innerHTML = MINISTRIES.map((m, i) => `
      <article class="ministry" data-ministry="${i}" tabindex="0" role="button" aria-expanded="false" aria-label="Conocer el ministerio de ${m.name}">
        <span class="ministry__icon" aria-hidden="true">${MINISTRY_ICONS[m.icon] || MINISTRY_ICONS.spark}</span>
        <span class="ministry__kicker mono">Ministerio de</span>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <span class="ministry__meta">
          <span>${m.day}</span>
          <span>Abierto a nuevos servidores</span>
        </span>
        <span class="ministry__detail">
          <p>${m.detail}</p>
          <span class="ministry__cta mono">Toca de nuevo para cerrar · <a href="#contacto">quiero unirme ↗</a></span>
        </span>
      </article>`).join("");

    wrap.addEventListener("click", (e) => {
      const card = e.target.closest("[data-ministry]");
      if (!card) return;
      if (e.target.closest("a")) return;
      const open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", String(open));
    });
    wrap.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest("[data-ministry]");
      if (!card) return;
      e.preventDefault();
      const open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", String(open));
    });
  }

  /* ── CLASES (home) ────────────────────────────────────────────────────── */
  function initClassPreview() {
    const wrap = $("#classPreview");
    if (!wrap) return;
    wrap.innerHTML = COURSES.slice(0, 4).map((c) => `
      <article class="class-card">
        <span class="class-card__bar" aria-hidden="true"></span>
        <div class="class-card__top">
          <span class="class-card__code mono">${c.code}</span>
          <span class="class-card__level">${c.level}</span>
        </div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <div class="class-card__info">
          <span class="mono">Horario <strong>${c.schedules[0]}</strong></span>
          <span class="mono">Modalidad <strong>${c.modes[0]}</strong></span>
        </div>
        <a class="class-card__link mono" href="inscripcion.html?clase=${c.id}">Inscribirme ↗</a>
      </article>`).join("");
  }

  /* ── PASTORADO ────────────────────────────────────────────────────────── */
  function initLeaders() {
    const wrap = $("#leaders");
    if (!wrap) return;
    wrap.innerHTML = LEADERS.map((l) => `
      <article class="leader">
        <div class="leader__photo" aria-hidden="true">
          <span class="leader__initials">${l.initials}</span>
        </div>
        <div class="leader__body">
          <h3>${l.name}</h3>
          <span class="leader__role mono">${l.role}</span>
          <p class="leader__bio">${l.bio}</p>
        </div>
      </article>`).join("");
  }

  /* ── EQUIPOS DE 12 ────────────────────────────────────────────────────── */
  function initTeams() {
    const wrap = $("#teams");
    if (!wrap) return;
    const seats = Array.from({ length: 12 }, (_, i) =>
      `<span class="seat">${String(i + 1).padStart(2, "0")}</span>`).join("");
    wrap.innerHTML = TEAMS.map((t) => `
      <article class="team">
        <div class="team__top">
          <span class="team__icon" aria-hidden="true">${MINISTRY_ICONS[t.icon] || MINISTRY_ICONS.users}</span>
          <span class="team__count mono">12</span>
        </div>
        <span class="team__label mono">${t.label}</span>
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
        <div class="team__seats" aria-hidden="true">${seats}</div>
        <div class="team__foot">
          <span class="team__meta">${t.meta}</span>
          <button type="button" class="team__join" data-team-join="${t.id}">
            Quiero unirme
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>
          </button>
        </div>
      </article>`).join("");

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-team-join]");
      if (!btn) return;
      const women = btn.dataset.teamJoin === "mujeres";
      const topic = $("#contactTopic");
      if (topic) topic.value = "equipos";
      const msg = $("#contactMessage");
      if (msg && !msg.value.trim()) {
        msg.value = `Quiero unirme al Equipo de 12 de ${women ? "Mujeres" : "Hombres"}.`;
      }
      $("#contacto")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    });
  }

  /* ── GALERÍA ──────────────────────────────────────────────────────────── */
  let galFilter = "todos";

  function posterHTML(item, extraClass = "") {
    return `
      <div class="gal-item__poster theme--${item.theme} ${extraClass}">
        <span class="gal-item__content">
          <span class="gal-item__kicker">${item.kicker}</span>
          <span class="gal-item__title">${item.title}</span>
          <span class="gal-item__verse">${item.verse}</span>
        </span>
        <span class="gal-item__cross" aria-hidden="true">✝</span>
      </div>`;
  }

  function renderGallery() {
    const wrap = $("#gallery");
    const count = $("#galleryCount");
    if (!wrap) return;
    const items = GALLERY.filter((g) => {
      if (galFilter === "todos") return true;
      if (galFilter === "fotos") return g.type === "foto";
      if (galFilter === "videos") return g.type === "video";
      return g.cat === galFilter;
    });

    wrap.innerHTML = items.map((g, i) => `
      <button class="gal-item ${g.size === "big" ? "gal-item--big" : g.size === "wide" ? "gal-item--wide" : g.size === "tall" ? "gal-item--tall" : ""}"
        type="button" data-gal="${g.id}" aria-label="${g.title}, ${g.type === "video" ? "video" : "foto"} de ${g.kicker}"
        style="animation-delay:${i * 40}ms">
        <span class="gal-item__hover" aria-hidden="true"></span>
        <span class="gal-item__type">
          ${g.type === "video"
            ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 4 6 4-6 4V4Z"/></svg> Video'
            : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="2.5"/><path d="M5 4 6 2h4l1 2"/></svg> Foto'}
        </span>
        ${posterHTML(g)}
        ${g.type === "video" ? '<span class="gal-item__play" aria-hidden="true"><span><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5 12 8l-7 4.5v-9Z"/></svg></span></span>' : ""}
      </button>`).join("");

    if (count) count.textContent = `${items.length} ${items.length === 1 ? "recuerdo" : "recuerdos"}`;
  }

  function initGallery() {
    const wrap = $("#gallery");
    if (!wrap) return;
    renderGallery();

    $("#galleryFilters")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      galFilter = btn.dataset.filter;
      $$(".filter").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      renderGallery();
    });

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-gal]");
      if (!btn) return;
      openLightbox(Number(btn.dataset.gal));
    });

    const lb = $("#lightbox");
    $("#lightboxClose")?.addEventListener("click", () => lb.close());
    lb?.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

    function openLightbox(id) {
      const item = GALLERY.find((g) => g.id === id);
      if (!item || !lb) return;
      const media = $("#lightboxMedia");
      $("#lightboxTitle").textContent = item.title;
      $("#lightboxDate").textContent = item.date;
      $("#lightboxType").textContent = item.type === "video" ? "Video · DCN Internacional" : "Fotografía · DCN Internacional";
      media.innerHTML = posterHTML(item) +
        (item.type === "video" ? `
          <div class="gal-item__play" aria-hidden="true" style="position:absolute;inset:0">
            <span style="width:72px;height:72px"><svg viewBox="0 0 16 16" fill="currentColor" style="width:22px;height:22px;margin-left:4px"><path d="M5 3.5 12 8l-7 4.5v-9Z"/></svg></span>
          </div>` : "");
      lb.showModal();
    }
  }

  /* ── DONATIVOS ────────────────────────────────────────────────────────── */
  function initGiving() {
    const form = $("#giveForm");
    if (!form) return;
    const modal = $("#donateModal");
    const dateInput = $("#giveDate");
    const setToday = () => {
      if (!dateInput) return;
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      dateInput.value = local.toISOString().slice(0, 10);
    };
    setToday();

    $("#donateClose")?.addEventListener("click", () => modal.close());
    modal?.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

    let lastReport = null;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const get = (sel) => $(sel)?.value.trim() || "";
      const name = get("#giveName");
      const idNumber = get("#giveId");
      const phone = get("#givePhone");
      const email = get("#giveEmail");
      const method = get("#giveMethod");
      const bank = get("#giveBank");
      const amount = Number(get("#giveAmount"));
      const currency = $("#giveCurrency")?.value || "USD";
      const date = get("#giveDate");
      const ref = get("#giveRef");
      const designation = $("#giveDesignation")?.value || "Diezmo";
      const notes = get("#giveNotes");
      const consent = $("#giveConsent")?.checked;

      let ok = true;
      const required = [
        ["#giveName", !!name],
        ["#giveId", !!idNumber],
        ["#givePhone", phone.replace(/\D/g, "").length >= 7],
        ["#giveMethod", !!method],
        ["#giveAmount", Number.isFinite(amount) && amount > 0],
        ["#giveDate", !!date],
        ["#giveRef", !!ref]
      ];
      required.forEach(([sel, valid]) => {
        setInvalid($(sel), !valid);
        if (!valid) ok = false;
      });
      if (email && !emailOk(email)) { setInvalid($("#giveEmail"), true); ok = false; }
      if (!consent) {
        $("#giveConsent")?.closest(".check")?.classList.add("is-invalid");
        ok = false;
      }
      if (!ok) { toast("Revisa los campos obligatorios"); return; }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtn = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }

      let code = "DCN-PAGO-" + String(Math.floor(1000 + Math.random() * 8999));
      let synced = false;
      try {
        const res = await fetch("/api/ofrendas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, idNumber, phone, email, method, bank, amount, currency, date, ref, designation, notes })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(data.error || "No se pudo registrar");
          error.status = res.status;
          throw error;
        }
        if (data.code) code = data.code;
        synced = true;
      } catch (err) {
        if (err.status && err.status < 500 && err.status !== 404 && err.status !== 405) {
          toast(err.message || "Revisa los datos e intenta de nuevo.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; }
          return;
        }
        console.warn("[DCN] Aporte guardado solo en el navegador:", err);
      }

      const formatted = `${currency === "USD" ? "$" : "Bs."} ${amount.toLocaleString("es-VE", {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })}`;
      lastReport = { code, name, idNumber, phone, email, method, bank, amount, currency, date, ref, designation, notes };
      try {
        const prev = JSON.parse(localStorage.getItem("dcn:pagos") || "[]");
        prev.push(Object.assign({}, lastReport, { createdAt: new Date().toISOString() }));
        localStorage.setItem("dcn:pagos", JSON.stringify(prev));
      } catch {}

      $("#donateSummary").innerHTML = `
        <div><dt>Código</dt><dd>${code}</dd></div>
        <div><dt>Titular</dt><dd>${name}</dd></div>
        <div><dt>Cédula / RIF</dt><dd>${idNumber}</dd></div>
        <div><dt>WhatsApp</dt><dd>${phone}</dd></div>
        <div><dt>Método</dt><dd>${method}${bank ? " · " + bank : ""}</dd></div>
        <div><dt>Monto</dt><dd>${formatted}</dd></div>
        <div><dt>Fecha</dt><dd>${date}</dd></div>
        <div><dt>Referencia</dt><dd>${ref}</dd></div>
        <div><dt>Destino</dt><dd>${designation}</dd></div>`;

      const waText = [
        "Hola DCN Internacional, envío mi aporte.",
        "Código: " + code,
        "Titular: " + name,
        "Cédula/RIF: " + idNumber,
        "WhatsApp: " + phone,
        "Método: " + method + (bank ? " (" + bank + ")" : ""),
        "Monto: " + formatted,
        "Fecha: " + date,
        "Referencia: " + ref,
        "Destino: " + designation,
        notes ? "Observaciones: " + notes : ""
      ].filter(Boolean).join("\n");
      $("#donateWhatsApp").href = "https://wa.me/584140000000?text=" + encodeURIComponent(waText);

      const headP = modal?.querySelector(".donate-modal__head p");
      if (headP) {
        headP.textContent = synced
          ? "Guarda el código y envía tu comprobante por WhatsApp para que tesorería confirme la transferencia."
          : "No se pudo conectar con el servidor. Guarda tu código y envía el comprobante por WhatsApp.";
      }
      modal?.showModal();
      toast(synced ? "Aporte registrado · " + code : "Aporte guardado localmente · " + code);
      form.reset();
      setToday();
      $("#giveConsent")?.closest(".check")?.classList.remove("is-invalid");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; }
    });

    $("#donateCopy")?.addEventListener("click", async () => {
      if (!lastReport) return;
      const text = [
        "DCN Internacional — Reporte de pago",
        "Código: " + lastReport.code,
        "Titular: " + lastReport.name,
        "Cédula/RIF: " + lastReport.idNumber,
        "WhatsApp: " + lastReport.phone,
        "Correo: " + (lastReport.email || "—"),
        "Método: " + lastReport.method + (lastReport.bank ? " (" + lastReport.bank + ")" : ""),
        "Monto: " + lastReport.amount + " " + lastReport.currency,
        "Fecha: " + lastReport.date,
        "Referencia: " + lastReport.ref,
        "Destino: " + lastReport.designation,
        lastReport.notes ? "Observaciones: " + lastReport.notes : ""
      ].join("\n");
      const ok = await copyText(text);
      toast(ok ? "Reporte copiado" : "No se pudo copiar");
    });
  }

  /* ── CONTACTO ─────────────────────────────────────────────────────────── */
  function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    const status = $("#contactStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#contactName");
      const email = $("#contactEmail");
      const message = $("#contactMessage");
      const privacy = $("#contactPrivacy");
      const phone = $("#contactPhone");
      const topic = $("#contactTopic")?.selectedOptions[0]?.textContent || "Contacto";
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtn = submitBtn ? submitBtn.innerHTML : "";
      let ok = true;

      if (!name.value.trim()) { setInvalid(name, true); ok = false; } else setInvalid(name, false);
      if (!emailOk(email.value)) { setInvalid(email, true); ok = false; } else setInvalid(email, false);
      if (!message.value.trim()) { setInvalid(message, true); ok = false; } else setInvalid(message, false);
      if (privacy && !privacy.checked) {
        ok = false;
        if (status) { status.textContent = "Debes aceptar para que podamos contactarte."; status.classList.add("is-error"); }
      }
      if (!ok) {
        if (status && !status.textContent) {
          status.textContent = "Revisa los campos marcados.";
          status.classList.add("is-error");
        }
        return;
      }

      if (status) { status.classList.remove("is-error"); status.textContent = "Enviando…"; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }

      try {
        const res = await fetch("/api/contactos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            phone: phone?.value.trim() || "",
            topic,
            message: message.value.trim()
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(data.error || "No se pudo enviar el mensaje");
          error.status = res.status;
          throw error;
        }
        if (status) status.textContent = `Mensaje recibido (${data.code || "DCN"}). Te contactaremos pronto.`;
        toast("Gracias, " + name.value.trim().split(" ")[0] + ". Tu mensaje fue recibido.");
        form.reset();
      } catch (err) {
        if (err.status && err.status < 500 && err.status !== 404 && err.status !== 405) {
          if (status) { status.textContent = err.message || "Revisa los datos e intenta de nuevo."; status.classList.add("is-error"); }
        } else {
          // Respaldo: abrir el correo si la API no está disponible
          if (status) status.textContent = "No pudimos enviarlo al servidor. Abriendo tu correo…";
          const subject = encodeURIComponent(`[Web] ${topic} — ${name.value.trim()}`);
          const body = encodeURIComponent(
            `Nombre: ${name.value.trim()}\nCorreo: ${email.value.trim()}\nTeléfono: ${phone?.value.trim() || "—"}\nMotivo: ${topic}\n\n${message.value.trim()}`
          );
          window.location.href = `mailto:dcninternacionalsanfrancisco@gmail.com?subject=${subject}&body=${body}`;
          setTimeout(() => {
            if (status) status.textContent = "Si tu gestor de correo no se abrió, escríbenos por WhatsApp.";
          }, 900);
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; }
      }
    });

    /* WhatsApp con el mismo mensaje */
    const waBtn = $("#contactWhatsApp");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        const name = $("#contactName")?.value.trim() || "";
        const message = $("#contactMessage")?.value.trim() || "";
        const topic = $("#contactTopic")?.selectedOptions[0]?.textContent || "";
        const text = encodeURIComponent(`Hola DCN, soy ${name || "un visitante"}. Motivo: ${topic}. ${message}`);
        const base = waBtn.href.split("?")[0];
        waBtn.href = `${base}?text=${text}`;
      });
    }
  }

  /* ── INSCRIPCIÓN ──────────────────────────────────────────────────────── */
  function initEnrollment() {
    const form = $("#enrollForm");
    if (!form) return;

    const state = {
      course: null,
      schedule: null,
      mode: null,
      step: 1,
      data: {}
    };

    const pickWrap = $("#coursePick");
    const schedWrap = $("#schedulePick");
    const modeWrap = $("#modePick");

    if (pickWrap) {
      pickWrap.innerHTML = COURSES.map((c) => `
        <button type="button" class="course-option" data-course="${c.id}">
          <span class="course-option__code">${c.code} · ${c.level}</span>
          <strong>${c.title}</strong>
          <span>${c.schedules[0]} · ${c.modes[0]}</span>
        </button>`).join("");
    }
    if (schedWrap) {
      schedWrap.innerHTML = '<span class="pick-hint mono">Elige un módulo para ver sus horarios</span>';
    }
    if (modeWrap) {
      modeWrap.innerHTML = '<span class="pick-hint mono">Elige un módulo para ver sus modalidades</span>';
    }

    function renderPicks(course) {
      if (schedWrap) {
        schedWrap.innerHTML = course.schedules.map((s) => `
          <button type="button" class="pick${s === state.schedule ? " is-active" : ""}" data-schedule="${s}">${s}</button>`).join("");
      }
      if (modeWrap) {
        modeWrap.innerHTML = course.modes.map((m) => `
          <button type="button" class="pick${m === state.mode ? " is-active" : ""}" data-mode="${m}">${m}</button>`).join("");
      }
    }

    function selectCourse(id) {
      const course = COURSES.find((c) => c.id === id);
      if (!course) return;
      state.course = course;
      state.schedule = course.schedules[0];
      state.mode = course.modes[0];
      $$(".course-option", pickWrap).forEach((b) => b.classList.toggle("is-active", b.dataset.course === id));
      renderPicks(course);
      updateSummary();
    }

    pickWrap?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-course]");
      if (btn) selectCourse(btn.dataset.course);
    });
    schedWrap?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-schedule]");
      if (!btn) return;
      state.schedule = btn.dataset.schedule;
      $$(".pick", schedWrap).forEach((b) => b.classList.toggle("is-active", b === btn));
      updateSummary();
    });
    modeWrap?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mode]");
      if (!btn) return;
      state.mode = btn.dataset.mode;
      $$(".pick", modeWrap).forEach((b) => b.classList.toggle("is-active", b === btn));
      updateSummary();
    });

    function updateSummary() {
      const text = (sel, value) => { const el = $(sel); if (el) el.textContent = value; };
      const c = state.course;
      text("#sumCourse", c ? c.title : "Elige un módulo");
      text("#sumSchedule", state.schedule || "—");
      text("#sumMode", state.mode || "—");
      text("#sumDuration", c ? c.duration : "8 semanas");
      text("#sumPrice", "Sin costo");
      $("#summaryCard")?.classList.toggle("is-ready", !!c);
    }

    /* pasos */
    const steps = $$(".enroll-step");
    function showStep(n) {
      state.step = n;
      steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
      $$("[data-step-dot]").forEach((dot) => {
        const num = Number(dot.dataset.stepDot);
        dot.classList.toggle("is-active", num === n);
        dot.classList.toggle("is-done", num < n);
        const bar = dot.nextElementSibling;
        if (bar && bar.classList.contains("steps__bar")) bar.classList.toggle("is-done", num < n);
      });
      const card = $(".enroll__main");
      const top = card ? card.getBoundingClientRect().top + window.scrollY - 110 : 0;
      window.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }

    function validateStep(n) {
      let ok = true;
      if (n === 1) {
        if (!state.course) { toast("Elige un módulo para continuar"); ok = false; }
      }
      if (n === 2) {
        const first = $("#firstName"), last = $("#lastName"), email = $("#email"), phone = $("#phone"), age = $("#age"), consent = $("#consent");
        [[first, !!first.value.trim()], [last, !!last.value.trim()], [email, emailOk(email.value)], [phone, phone.value.trim().length >= 8], [age, Number(age.value) >= 12]].forEach(([el, valid]) => {
          setInvalid(el, !valid);
          if (!valid) ok = false;
        });
        if (consent && !consent.checked) { ok = false; $(consent).closest(".check")?.classList.add("is-invalid"); }
      }
      if (!ok) toast("Revisa los campos obligatorios");
      return ok;
    }

    $$("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.dataset.next);
        if (target === 3) {
          if (!validateStep(2)) return;
          state.data = readData();
          renderReview();
          showStep(3);
          return;
        }
        if (!validateStep(state.step)) return;
        showStep(target);
      });
    });
    $$("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => showStep(Number(btn.dataset.back)));
    });

    function readData() {
      const val = (sel) => $(sel)?.value.trim() || "";
      const pick = (sel) => $(sel)?.selectedOptions[0]?.textContent || "—";
      return {
        firstName: val("#firstName"),
        lastName: val("#lastName"),
        email: val("#email"),
        phone: val("#phone"),
        age: val("#age"),
        source: pick("#source"),
        notes: val("#notes"),
        experience: pick("#experience")
      };
    }

    function renderReview() {
      const c = state.course;
      const d = state.data;
      $("#review").innerHTML = `
        <div><dt>Módulo</dt><dd>${c.title} <span class="mono">(${c.code})</span></dd></div>
        <div><dt>Horario</dt><dd>${state.schedule}</dd></div>
        <div><dt>Modalidad</dt><dd>${state.mode}</dd></div>
        <div><dt>Nombre</dt><dd>${d.firstName} ${d.lastName}</dd></div>
        <div><dt>Correo</dt><dd>${d.email}</dd></div>
        <div><dt>WhatsApp</dt><dd>${d.phone}</dd></div>
        <div><dt>Edad</dt><dd>${d.age} años</dd></div>
        <div><dt>Experiencia</dt><dd>${d.experience}</dd></div>`;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (state.step !== 3 || !state.course) return;
      const c = state.course;
      const d = state.data;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtn = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }

      let code = "DCN-" + String(Math.floor(1000 + Math.random() * 8999));
      let synced = false;
      try {
        const res = await fetch("/api/inscripciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: d.firstName,
            lastName: d.lastName,
            email: d.email,
            phone: d.phone,
            age: Number(d.age),
            source: d.source,
            experience: d.experience,
            notes: d.notes,
            course: c.title,
            courseCode: c.code,
            schedule: state.schedule,
            mode: state.mode
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(data.error || "No se pudo registrar");
          error.status = res.status;
          throw error;
        }
        if (data.code) code = data.code;
        synced = true;
      } catch (err) {
        if (err.status && err.status < 500 && err.status !== 404 && err.status !== 405) {
          toast(err.message || "Revisa los datos e intenta de nuevo.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; }
          return;
        }
        console.warn("[DCN] Inscripción guardada solo en el navegador:", err);
      }

      const record = {
        code,
        course: c.title,
        codeCourse: c.code,
        schedule: state.schedule,
        mode: state.mode,
        name: `${d.firstName} ${d.lastName}`,
        email: d.email,
        phone: d.phone,
        createdAt: new Date().toISOString()
      };
      try {
        const prev = JSON.parse(localStorage.getItem("dcn:inscripciones") || "[]");
        prev.push(record);
        localStorage.setItem("dcn:inscripciones", JSON.stringify(prev));
      } catch {}

      form.querySelectorAll(".enroll-step").forEach((s) => (s.style.display = "none"));
      $$(".steps").forEach((s) => (s.style.display = "none"));
      const success = $("#enrollSuccess");
      success.hidden = false;
      $("#successSummary").innerHTML = `
        <div><dt>Código</dt><dd>${code}</dd></div>
        <div><dt>Módulo</dt><dd>${c.title}</dd></div>
        <div><dt>Horario</dt><dd>${state.schedule}</dd></div>
        <div><dt>Modalidad</dt><dd>${state.mode}</dd></div>
        <div><dt>Estudiante</dt><dd>${d.firstName} ${d.lastName}</dd></div>`;
      success.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      toast(synced ? "Inscripción registrada · " + code : "Inscripción guardada localmente · " + code);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; }
    });

    $("#newEnroll")?.addEventListener("click", () => {
      form.reset();
      state.course = null;
      state.schedule = null;
      state.mode = null;
      const success = $("#enrollSuccess");
      if (success) success.hidden = true;
      $$(".steps").forEach((s) => (s.style.display = ""));
      $$(".course-option, .pick").forEach((b) => b.classList.remove("is-active"));
      updateSummary();
      showStep(1);
    });

    /* clase preseleccionada por URL (?clase=...) */
    const params = new URLSearchParams(location.search);
    const pre = params.get("clase");
    updateSummary();
    if (pre && COURSES.some((c) => c.id === pre)) selectCourse(pre);
  }

  /* ── REDES SOCIALES — sintonizar ──────────────────────────────────────── */
  function initSocials() {
    const dock = $("#socialsDock");
    if (!dock) return;
    const reduce = reduceMotion.matches;

    $$(".social", dock).forEach((btn) => {
      const handle = $(".social__handle", btn);
      if (!handle) return;
      const finalText = handle.dataset.text || handle.textContent.trim();
      handle.dataset.text = finalText;
      let timer = 0;

      const tune = () => {
        btn.classList.add("is-live");
        if (reduce) return;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._";
        let frame = 0;
        clearInterval(timer);
        timer = setInterval(() => {
          frame++;
          const reveal = Math.floor((frame / 16) * finalText.length);
          handle.textContent = finalText.split("").map((ch, i) => {
            if (i < reveal || ch === " ") return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("");
          if (frame >= 16) {
            clearInterval(timer);
            handle.textContent = finalText;
          }
        }, 32);
      };

      const reset = () => {
        btn.classList.remove("is-live");
        clearInterval(timer);
        handle.textContent = finalText;
      };

      btn.addEventListener("pointerenter", tune);
      btn.addEventListener("focus", tune);
      btn.addEventListener("pointerleave", reset);
      btn.addEventListener("blur", reset);
    });
  }

  /* ── INIT ─────────────────────────────────────────────────────────────── */
  function init() {
    initCompass();
    initNav();
    initReveals();
    initMinistries();
    initClassPreview();
    initLeaders();
    initTeams();
    initGallery();
    initGiving();
    initContact();
    initSocials();
    if (isEnrollPage) initEnrollment();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
