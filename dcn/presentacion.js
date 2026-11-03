(() => {
  "use strict";

  const STEPS = [
    {
      selector: "#inicio",
      title: "Bienvenida",
      kicker: "01 · Inicio",
      text: "Bienvenidos a Dios con Nosotros Internacional, en San Francisco, Zulia. Esta es una presentación de todo lo que la casa hace: la cruz es nuestro norte y tu familia puede ser restaurada."
    },
    {
      selector: ".topbar__times",
      offset: 0,
      title: "Horarios",
      kicker: "02 · Reuniones",
      text: "Nos reunimos los domingos de nueve a once de la mañana para el servicio familiar, y los miércoles de siete a nueve de la noche para la oración."
    },
    {
      selector: "#nosotros .sect__head",
      title: "Quiénes somos",
      kicker: "03 · Nosotros",
      text: "En Nosotros encontrarás la identidad, la misión y la visión de la iglesia. Todo gira alrededor de conocer a Cristo, formar discípulos y servir a la ciudad."
    },
    {
      selector: ".model",
      title: "La escalera del éxito",
      kicker: "04 · Discipulado",
      text: "Ganar, consolidar, discipular y enviar. Cuatro pasos con los que acompañamos a cada persona: la alcanzamos, la cuidamos, la formamos y la enviamos."
    },
    {
      selector: "#ministerios .sect__head",
      title: "Doce ministerios",
      kicker: "05 · Servicio",
      text: "Adoración, niños, adolescentes, jóvenes, medios, intercesión, consolidación, hombres, mujeres, matrimonios, sonido y protocolo. Un lugar para cada llamado."
    },
    {
      selector: "#pastorado .sect__head",
      title: "Pastorado",
      kicker: "06 · Cobertura",
      text: "Los pastores Edgar Soto y Yazmín González de Soto caminan junto a la iglesia con humildad, doctrina sana y corazón de servicio."
    },
    {
      selector: "#equipos .sect__head",
      title: "Equipos de 12",
      kicker: "07 · Comunidad",
      text: "Grupos de mujeres y de hombres que se acompañan, oran y crecen en la Palabra. Doce para caminar juntos, para que nadie camine solo."
    },
    {
      selector: "#instituto .sect__head",
      title: "Formación",
      kicker: "08 · Formación",
      text: "Cuatro módulos gratuitos: Universidad de la Vida y Capacitación Destino uno, dos y tres. Formación que transforma y te prepara para servir."
    },
    {
      selector: "#galeria .sect__head",
      title: "Galería",
      kicker: "09 · Memoria",
      text: "Conferencias, bautizos, vigilias, encuentros de jóvenes y salidas misioneras. Cada imagen es un testimonio de lo que Dios ha hecho."
    },
    {
      selector: "#ofrendas .sect__head",
      title: "Ofrendas",
      kicker: "10 · Generosidad",
      text: "Un espacio para registrar tu aporte. El formulario no procesa pagos: guarda los datos para que tesorería confirme la transferencia."
    },
    {
      selector: ".contact-form",
      title: "Contacto",
      kicker: "11 · Ven a casa",
      text: "Aquí puedes escribirnos, pedir oración o agendar una visita. Tu mensaje queda registrado para que el equipo pastoral te responda."
    },
    {
      selector: ".socials",
      social: true,
      title: "Redes sociales",
      kicker: "12 · Nuestra señal",
      text: "Síguenos en Instagram, TikTok y YouTube. Ahí también compartimos lo que Dios está haciendo en la casa: dcnisanfrancisco punto ve, dcn punto internacional y DCN Internacional San Francisco."
    },
    {
      page: "inscripcion.html",
      selector: ".page-head",
      title: "Inscripción",
      kicker: "13 · El siguiente paso",
      text: "El sitio también tiene un formulario de inscripción a Formación. Es gratuito, se completa en tres pasos y al final recibes un código."
    },
    {
      end: true,
      title: "Gracias",
      kicker: "14 · Fin",
      text: "Gracias por recorrer la casa. DCN Internacional, San Francisco, Zulia. Donde tu familia es restaurada."
    }
  ];

  const DEMOS = [
    { target: ".hero__title" },
    { target: ".topbar__times" },
    { target: "#nosotros .sect__title" },
    { sequence: ".model__steps li" },
    { target: ".ministry[data-ministry='0']", click: true, action: "ministry" },
    { target: "#pastorado .sect__title" },
    { target: "#equipos .sect__title" },
    { sequence: ".class-card" },
    { target: ".filter[data-filter='fotos']", click: true, action: "gallery" },
    { target: "#giveAmount", click: true, action: "type", value: "50" },
    { target: "#contactName", click: true, action: "type", value: "María" },
    { socialSequence: true },
    { target: ".course-option[data-course='universidad']", click: true, action: "course" },
    {}
  ];
  STEPS.forEach((step, index) => { step.demo = DEMOS[index] || {}; });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    i: 0,
    started: false,
    playing: false,
    muted: false,
    voice: null,
    latam: false,
    timer: 0,
    token: 0,
    recorder: null,
    stream: null,
    chunks: [],
    endTimer: 0,
    hoverEl: null,
    hoverInFrame: false
  };

  let els = {};
  let frameDoc = null;
  let frameWin = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fit() {
    if (!els.stage) return;
    const scale = Math.min(els.stage.clientWidth / 1440, els.stage.clientHeight / 810);
    els.stage.style.setProperty("--pres-scale", String(scale));
  }

  function bindFrame() {
    try {
      frameDoc = els.frame.contentDocument;
      frameWin = els.frame.contentWindow;
    } catch {
      frameDoc = null;
      frameWin = null;
    }
    injectDemoCSS();
  }

  function currentPage() {
    try {
      return new URL(els.frame.src).pathname.split("/").pop() || "index.html";
    } catch {
      return "index.html";
    }
  }

  function ensurePage(src) {
    if (currentPage() === src) {
      bindFrame();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const done = () => {
        els.frame.removeEventListener("load", done);
        bindFrame();
        resolve();
      };
      els.frame.addEventListener("load", done);
      els.frame.src = src;
    });
  }

  function focusStep(step) {
    if (!frameDoc || !frameWin || !step.selector) return;
    const el = frameDoc.querySelector(step.selector);
    if (!el) return;
    const top = Math.max(0, frameWin.scrollY + el.getBoundingClientRect().top - (step.offset ?? 96));
    frameWin.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function injectDemoCSS() {
    if (!frameDoc || !frameDoc.head || frameDoc.getElementById("dcn-demo-style")) return;
    const style = frameDoc.createElement("style");
    style.id = "dcn-demo-style";
    style.textContent = `
      .dcn-demo-hover { outline: 2px solid rgba(156, 218, 243, 0.85) !important; outline-offset: 5px !important; }
      .dcn-demo-click { transform: scale(0.97) !important; transition: transform 0.18s !important; }
      .social.dcn-demo-hover { width: 292px !important; gap: 10px !important; border-color: rgba(156,218,243,.55) !important; background: rgba(10,26,48,.94) !important; transform: translateY(-2px); }
      .social.dcn-demo-hover .social__beam { opacity: .5 !important; transform: scale(1) !important; }
      .social.dcn-demo-hover .social__icon { transform: rotateY(360deg) !important; background: rgba(156,218,243,.16) !important; }
      .social.dcn-demo-hover .social__meta { max-width: 198px !important; opacity: 1 !important; }
      .social.dcn-demo-hover .social__arrow { display: inline !important; opacity: 1 !important; transform: none !important; }
      .model__steps li.dcn-demo-hover { transform: translateY(-4px) !important; border-color: rgba(156,218,243,.3) !important; background: rgba(10,26,48,.92) !important; }
    `;
    frameDoc.head.appendChild(style);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clearHover() {
    if (!state.hoverEl) return;
    const el = state.hoverEl;
    const win = state.hoverInFrame ? frameWin : window;
    try {
      const Pointer = (win && (win.PointerEvent || win.MouseEvent)) || PointerEvent;
      el.dispatchEvent(new Pointer("pointerleave", { bubbles: false, pointerType: "mouse" }));
    } catch {}
    el.classList.remove("dcn-demo-hover");
    el.classList.remove("is-live");
    state.hoverEl = null;
  }

  function moveCursorTo(target, inFrame = true) {
    if (!target || !els.cursor) return;
    const r = target.getBoundingClientRect();
    const stageRect = els.stage.getBoundingClientRect();
    let x, y;
    if (inFrame) {
      const scale = els.stage.clientWidth / 1440;
      x = (r.left + Math.min(r.width * 0.5, 120)) * scale;
      y = (r.top + Math.min(r.height * 0.5, 34)) * scale;
    } else {
      x = r.left - stageRect.left + r.width * 0.5;
      y = r.top - stageRect.top + r.height * 0.5;
    }
    x += (Math.random() - 0.5) * 10;
    y += (Math.random() - 0.5) * 8;
    x = Math.max(12, Math.min(els.stage.clientWidth - 12, x));
    y = Math.max(12, Math.min(els.stage.clientHeight - 12, y));
    els.cursor.style.left = `${x}px`;
    els.cursor.style.top = `${y}px`;
  }

  function hoverTarget(target, inFrame = true) {
    if (!target) return;
    clearHover();
    state.hoverEl = target;
    state.hoverInFrame = inFrame;
    target.classList.add("dcn-demo-hover");
    try {
      const win = inFrame ? frameWin : window;
      const Pointer = win.PointerEvent || win.MouseEvent || PointerEvent;
      target.dispatchEvent(new Pointer("pointerenter", { bubbles: false, pointerType: "mouse" }));
    } catch {}
  }

  function pulseClick() {
    if (!els.cursor) return;
    els.cursor.classList.add("is-click");
    const x = parseFloat(els.cursor.style.left || "0");
    const y = parseFloat(els.cursor.style.top || "0");
    const ring = document.createElement("span");
    ring.className = "pres__click";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    els.stage.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
    setTimeout(() => els.cursor.classList.remove("is-click"), 220);
  }

  function clickTarget(target, inFrame = true) {
    if (!target) return;
    pulseClick();
    target.classList.add("dcn-demo-click");
    setTimeout(() => target.classList.remove("dcn-demo-click"), 240);
    try { target.click(); } catch {}
  }

  async function typeInto(target, value, token) {
    if (!target) return;
    try { target.focus(); } catch {}
    target.value = "";
    for (const char of String(value)) {
      if (token !== state.token) return;
      target.value += char;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(85);
    }
  }

  async function runDemo(step, token) {
    const demo = step.demo || {};

    if (demo.socialSequence) {
      const cards = [...els.social.querySelectorAll(".pres-social")];
      for (const card of cards) {
        if (token !== state.token) return;
        moveCursorTo(card, false);
        await wait(620);
        hoverTarget(card, false);
        await wait(520);
        pulseClick();
        card.classList.add("dcn-demo-click");
        setTimeout(() => card.classList.remove("dcn-demo-click"), 240);
        await wait(300);
      }
      clearHover();
      return;
    }

    if (demo.sequence) {
      const items = frameDoc ? [...frameDoc.querySelectorAll(demo.sequence)] : [];
      for (const item of items) {
        if (token !== state.token) return;
        try { item.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" }); } catch {}
        await wait(320);
        moveCursorTo(item, true);
        await wait(520);
        hoverTarget(item, true);
        await wait(620);
      }
      clearHover();
      return;
    }

    const target = frameDoc ? frameDoc.querySelector(demo.target || step.selector) : null;
    if (!target) return;
    try { target.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" }); } catch {}
    await wait(360);
    if (token !== state.token) return;
    moveCursorTo(target, true);
    await wait(580);
    hoverTarget(target, true);
    await wait(520);
    if (token !== state.token) return;

    if (demo.click) {
      clickTarget(target, true);
      await wait(520);
    }

    if (demo.action === "type") {
      await typeInto(target, demo.value || "", token);
    }

    if (demo.action === "gallery") {
      await wait(480);
      const item = frameDoc.querySelector(".gal-item");
      if (item) {
        try { item.scrollIntoView({ block: "center", behavior: reduceMotion.matches ? "auto" : "smooth" }); } catch {}
        await wait(320);
        moveCursorTo(item, true);
        await wait(360);
        hoverTarget(item, true);
        clickTarget(item, true);
        await wait(1200);
        const closeBtn = frameDoc.querySelector("#lightboxClose");
        if (closeBtn) closeBtn.click();
      }
    }

    if (demo.action === "course") {
      await wait(700);
    }
  }

  function build() {
    els.stage = $("#presStage");
    els.frame = $("#presSite");
    els.count = $("#presCount");
    els.kicker = $("#presKicker");
    els.title = $("#presTitle");
    els.lower = $("#presLower");
    els.progress = $("#presProgress");
    els.controls = $("#presControls");
    els.prev = $("#presPrev");
    els.pause = $("#presPause");
    els.next = $("#presNext");
    els.mute = $("#presMute");
    els.social = $("#presSocial");
    els.end = $("#presEnd");
    els.intro = $("#presIntro");
    els.voice = $("#presVoice");
    els.play = $("#presPlay");
    els.record = $("#presRecord");
    els.rec = $("#presRec");
    els.status = $("#presStatus");
    els.downloadLink = $("#presDownload");
    els.cursor = $("#presCursor");
    els.exit = $("#presExit");
    els.close = $("#presClose");

    els.prev.addEventListener("click", prev);
    els.pause.addEventListener("click", toggle);
    els.next.addEventListener("click", next);
    els.mute.addEventListener("click", toggleMute);
    els.exit.addEventListener("click", close);
    els.close.addEventListener("click", close);
    els.play.addEventListener("click", start);
    els.record.addEventListener("click", startRecording);

    els.frame.addEventListener("load", bindFrame);
    bindFrame();
    fit();
    window.addEventListener("resize", fit);
  }

  function loadVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") {
      state.voice = null;
      updateVoiceNote();
      return;
    }
    const all = window.speechSynthesis.getVoices();
    const spanish = all.filter((v) => /^es/i.test(v.lang || ""));
    const latam = spanish.filter((v) =>
      /^es-(419|MX|US|CO|VE|AR|CL|PE|EC|DO|GT|CR|PA|PR|UY|PY|BO|HN|SV|NI|CU)/i.test(v.lang || "")
    );
    const preferred = /(Sabina|Camila|Lupe|Jorge|Laura|Paulina|Google|Natural|Premium|Neural)/i;
    state.latam = latam.length > 0;
    state.voice =
      latam.find((v) => preferred.test(v.name)) ||
      latam[0] ||
      spanish.find((v) => /^es-ES/i.test(v.lang) && preferred.test(v.name)) ||
      spanish[0] ||
      null;
    updateVoiceNote();
  }

  function updateVoiceNote() {
    if (!els.voice) return;
    if (!window.speechSynthesis) {
      els.voice.textContent = "Tu navegador no permite narración por voz. La presentación avanzará con los tiempos.";
    } else if (!state.voice) {
      els.voice.textContent = "No se detectó una voz en español. Instala una voz en español latino o usa Edge/Chrome con voces en español.";
    } else if (!state.latam && /^es-ES/i.test(state.voice.lang || "")) {
      els.voice.textContent = `Voz detectada: ${state.voice.name} (España). Para español latino, instala una voz de México o Latinoamérica.`;
    } else {
      els.voice.textContent = `Voz latina: ${state.voice.name} (${state.voice.lang}).`;
    }
  }

  async function start() {
    els.intro.hidden = true;
    state.started = true;
    state.playing = true;
    state.i = 0;
    if (els.cursor) {
      els.cursor.classList.add("is-on");
      els.cursor.style.left = `${els.stage.clientWidth * 0.5}px`;
      els.cursor.style.top = `${els.stage.clientHeight * 0.55}px`;
    }
    els.stage.classList.add("is-demo");
    if (!frameDoc || currentPage() !== "index.html") {
      await ensurePage("index.html");
    }
    go(0);
  }

  async function go(index) {
    state.i = Math.max(0, Math.min(STEPS.length - 1, index));
    const token = ++state.token;
    clearTimeout(state.timer);
    clearTimeout(state.endTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const step = STEPS[state.i];
    clearHover();
    render(step);

    if (step.social) {
      showSocial();
    } else {
      hideSocial();
    }

    if (step.end) {
      showEnd();
      speak(step.text, token);
      return;
    }

    els.lower.hidden = !!step.social;
    els.end.hidden = true;

    const targetPage = step.page || "index.html";
    if (!step.end && currentPage() !== targetPage) {
      await ensurePage(targetPage);
      if (token !== state.token) return;
    }

    focusStep(step);
    runDemo(step, token);
    setTimeout(() => {
      if (token !== state.token) return;
      speak(step.text, token);
    }, step.page ? 700 : 520);
  }

  function render(step) {
    els.count.textContent = `${pad(state.i + 1)} / ${pad(STEPS.length)}`;
    els.kicker.textContent = step.kicker || "";
    els.title.textContent = step.title || "";
    els.progress.style.width = `${((state.i + 1) / STEPS.length) * 100}%`;
    els.prev.disabled = state.i === 0;
    els.pause.textContent = state.playing ? "Pausa" : "Reanudar";
    els.mute.textContent = state.muted ? "Silencio" : "Voz";
  }

  function showSocial() {
    els.lower.hidden = true;
    els.social.hidden = false;
    els.social.classList.remove("is-on");
    requestAnimationFrame(() => els.social.classList.add("is-on"));
  }

  function hideSocial() {
    els.social.hidden = true;
    els.social.classList.remove("is-on");
  }

  function showEnd() {
    clearHover();
    if (els.cursor) els.cursor.classList.remove("is-on");
    els.stage.classList.remove("is-demo");
    els.lower.hidden = true;
    els.social.hidden = true;
    els.end.hidden = false;
  }

  function speak(text, token) {
    if (!state.playing) return;

    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== "function" || state.muted || !state.voice) {
      scheduleFallback(text, token);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = state.voice;
    utterance.lang = state.voice.lang || "es-ES";
    utterance.rate = 0.93;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    utterance.onend = () => {
      if (token !== state.token || !state.playing) return;
      if (STEPS[state.i].end) {
        if (state.recorder) state.endTimer = setTimeout(stopRecording, 2600);
        return;
      }
      state.timer = setTimeout(next, 1500);
    };
    utterance.onerror = () => {
      if (token === state.token) scheduleFallback(text, token);
    };
    window.speechSynthesis.speak(utterance);
  }

  function scheduleFallback(text, token) {
    clearTimeout(state.timer);
    const words = String(text || "").split(/\s+/).filter(Boolean).length;
    const ms = Math.max(8000, words * 430 + 2400);
    state.timer = setTimeout(() => {
      if (token !== state.token || !state.playing) return;
      if (STEPS[state.i].end) {
        if (state.recorder) state.endTimer = setTimeout(stopRecording, 2000);
        return;
      }
      next();
    }, ms);
  }

  function next() {
    if (state.i >= STEPS.length - 1) return;
    state.playing = true;
    go(state.i + 1);
  }

  function prev() {
    if (state.i <= 0) return;
    state.playing = true;
    els.end.hidden = true;
    go(state.i - 1);
  }

  function toggle() {
    if (!state.started) return;
    state.playing = !state.playing;
    els.pause.textContent = state.playing ? "Pausa" : "Reanudar";

    if (state.playing) {
      if (window.speechSynthesis && state.voice && !state.muted) {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        else if (!window.speechSynthesis.speaking) speak(STEPS[state.i].text, state.token);
      } else {
        speak(STEPS[state.i].text, state.token);
      }
    } else {
      clearTimeout(state.timer);
      if (window.speechSynthesis) window.speechSynthesis.pause();
    }
  }

  function toggleMute() {
    state.muted = !state.muted;
    els.mute.textContent = state.muted ? "Silencio" : "Voz";
    state.token++;
    clearTimeout(state.timer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (state.playing) speak(STEPS[state.i].text, state.token);
  }

  function showStatus(message) {
    if (!els.status) return;
    els.status.textContent = message;
    els.status.hidden = false;
  }

  async function startRecording() {
    if (els.status) els.status.hidden = true;
    if (els.downloadLink) els.downloadLink.hidden = true;

    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      showStatus("Tu navegador no permite grabar la pantalla. Usa Chrome o Edge actualizado en computadora.");
      return;
    }
    if (state.recorder && state.recorder.state !== "inactive") return;

    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
    } catch (error) {
      const reason = error && error.name === "NotAllowedError"
        ? "permiso cancelado o no permitido"
        : (error && error.message) || (error && error.name) || "error desconocido";
      showStatus(`No se pudo iniciar la captura: ${reason}. Selecciona "Esta pestaña" y activa "Compartir audio".`);
      return;
    }

    if (!stream.getAudioTracks().length) {
      const proceed = window.confirm("No se compartió el audio. El video quedará sin voz. ¿Continuar de todos modos?");
      if (!proceed) {
        stream.getTracks().forEach((t) => t.stop());
        showStatus("Se canceló la grabación porque no se compartió el audio.");
        return;
      }
    }

    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    const mime = candidates.find((type) => {
      try { return MediaRecorder.isTypeSupported(type); } catch { return false; }
    }) || "";

    let recorder;
    try {
      recorder = new MediaRecorder(stream, mime
        ? { mimeType: mime, videoBitsPerSecond: 8000000, audioBitsPerSecond: 160000 }
        : { videoBitsPerSecond: 8000000 });
    } catch (error) {
      stream.getTracks().forEach((t) => t.stop());
      showStatus(`No se pudo iniciar la grabación: ${(error && error.message) || "formato no compatible"}.`);
      return;
    }

    state.chunks = [];
    state.recorder = recorder;
    state.stream = stream;
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) state.chunks.push(e.data); };
    recorder.onstop = finishRecording;
    recorder.onerror = (event) => {
      showStatus(`Error durante la grabación: ${(event && event.error && event.error.message) || "desconocido"}.`);
      if (recorder.state !== "inactive") recorder.stop();
    };

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener("ended", () => {
        if (recorder.state !== "inactive") recorder.stop();
      });
    }

    recorder.start(1000);
    els.rec.hidden = false;
    start().catch((error) => {
      showStatus(`No se pudo iniciar la presentación: ${(error && error.message) || "error desconocido"}.`);
    });
  }

  function stopRecording() {
    if (state.recorder && state.recorder.state !== "inactive") {
      state.recorder.stop();
    }
  }

  function finishRecording() {
    const recorder = state.recorder;
    const chunks = state.chunks.slice();
    const stream = state.stream;
    state.recorder = null;
    state.stream = null;
    state.chunks = [];
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (els.rec) els.rec.hidden = true;

    if (!chunks.length) {
      showStatus("No se generó ningún video. Intenta grabar de nuevo y deja que la presentación avance.");
      return;
    }

    try {
      const type = (recorder && recorder.mimeType) ? recorder.mimeType : "video/webm";
      const blob = new Blob(chunks, { type });
      const extension = type.includes("mp4") ? "mp4" : "webm";
      const url = URL.createObjectURL(blob);
      const name = `dcn-presentacion.${extension}`;

      if (els.downloadLink) {
        els.downloadLink.href = url;
        els.downloadLink.download = name;
        els.downloadLink.hidden = false;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showStatus(`Video listo (${(blob.size / 1048576).toFixed(1)} MB). Si no se descargó, usa el botón "Descargar video".`);
      setTimeout(() => URL.revokeObjectURL(url), 600000);
    } catch (error) {
      showStatus(`No se pudo crear el archivo: ${(error && error.message) || "error desconocido"}.`);
    }
  }

  function close() {
    state.token++;
    clearTimeout(state.timer);
    clearTimeout(state.endTimer);
    clearHover();
    if (els.cursor) els.cursor.classList.remove("is-on");
    els.stage.classList.remove("is-demo");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopRecording();
    state.playing = false;
    state.started = false;
    els.lower.hidden = true;
    els.social.hidden = true;
    els.end.hidden = true;
    els.intro.hidden = false;
    els.rec.hidden = true;
    els.count.textContent = `01 / ${pad(STEPS.length)}`;
    state.i = 0;
    if (currentPage() !== "index.html") {
      els.frame.src = "index.html";
    }
    loadVoices();
  }

  document.addEventListener("keydown", (e) => {
    if (els.intro && !els.intro.hidden) {
      if (e.key === "Escape") close();
      return;
    }
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); return; }
    if (e.key === " " && !e.target.closest("button, a, input, textarea, select")) {
      e.preventDefault();
      toggle();
    }
  });

  if (window.speechSynthesis) {
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  build();
  loadVoices();
  els.count.textContent = `01 / ${pad(STEPS.length)}`;
})();
