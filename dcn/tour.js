(() => {
  "use strict";

  const STEPS = [
    {
      selector: ".page-head",
      fallback: "#formulario",
      text: "Este es el formulario de inscripción a Formación. Es gratuito y se completa en tres pasos: eliges el módulo, completas tus datos y confirmas."
    },
    {
      selector: "#coursePick",
      fallback: "#formulario",
      text: "Puedes elegir Universidad de la Vida o Capacitación Destino uno, dos o tres. Cada módulo tiene su horario y su modalidad. Ninguno tiene costo."
    },
    {
      selector: ".steps",
      fallback: "#formulario",
      text: "El formulario te guía paso a paso. Primero el módulo, luego tus datos personales y al final un resumen para confirmar tu inscripción."
    },
    {
      selector: "#enrollForm",
      fallback: "#formulario",
      text: "Completa tu nombre, correo, WhatsApp y edad. Si es tu primera vez, no necesitas experiencia previa. Al enviar, recibes un código de inscripción."
    },
    {
      selector: "#faq",
      fallback: "#formulario",
      text: "En las preguntas frecuentes encuentras detalles sobre costos, horarios, modalidad y qué pasa después de inscribirte. Si necesitas ayuda, escríbenos por WhatsApp."
    },
    {
      selector: "",
      text: "Gracias por ver este video. El formulario te espera para dar el primer paso. Te acompañamos en todo el proceso."
    }
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    i: 0,
    started: false,
    playing: false,
    muted: false,
    voice: null,
    voices: [],
    latam: false,
    timer: 0,
    focusTimer: 0,
    token: 0,
    built: false
  };

  let els = {};
  let raf = 0;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function build() {
    if (state.built) return;
    const root = document.createElement("div");
    root.className = "tour tour--video";
    root.id = "tour";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Video de inscripción de DCN Internacional");

    root.innerHTML = `
      <div class="tour__spot" id="tourSpot" aria-hidden="true"></div>

      <div class="tour__bar">
        <span class="tour__brand mono">DCN · Inscripción</span>
        <span class="tour__count mono" id="tourCount">01 / ${pad(STEPS.length)}</span>
        <button class="tour__close" type="button" id="tourClose">Salir ✕</button>
      </div>

      <div class="tour__intro" id="tourIntro">
        <div class="tour__introCard">
          <img class="tour__introLogo" src="assets/logo-dcn-crop.jpg" alt="" width="62" height="62" />
          <span class="tour__kicker mono">Video de inscripción</span>
          <h2>Cómo <em>inscribirte.</em></h2>
          <p>Un recorrido corto por el formulario: módulos, datos y confirmación. La voz te explica mientras el foco resalta cada paso.</p>
          <p class="tour__voice" id="tourVoice">Cargando voz…</p>
          <div class="tour__actions">
            <button class="tour__start" type="button" id="tourStart">▶ Ver video</button>
          </div>
          <p class="tour__hint">Dura poco más de un minuto. Activa el sonido.</p>
        </div>
      </div>

      <div class="tour__caption" id="tourCaption" hidden>
        <div class="tour__progress"><i id="tourProgress"></i></div>
        <div class="tour__controls">
          <button class="tour__btn" type="button" id="tourPrev" aria-label="Anterior">← Anterior</button>
          <button class="tour__btn tour__btn--main" type="button" id="tourPlay">Pausa</button>
          <button class="tour__btn" type="button" id="tourNext">Siguiente →</button>
          <button class="tour__btn" type="button" id="tourMute">Voz</button>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    els = {
      root,
      spot: $("#tourSpot", root),
      intro: $("#tourIntro", root),
      voiceNote: $("#tourVoice", root),
      start: $("#tourStart", root),
      count: $("#tourCount", root),
      caption: $("#tourCaption", root),
      progress: $("#tourProgress", root),
      prev: $("#tourPrev", root),
      play: $("#tourPlay", root),
      next: $("#tourNext", root),
      mute: $("#tourMute", root),
      close: $("#tourClose", root)
    };

    els.start.addEventListener("click", start);
    els.close.addEventListener("click", close);
    els.prev.addEventListener("click", prev);
    els.play.addEventListener("click", toggle);
    els.next.addEventListener("click", next);
    els.mute.addEventListener("click", toggleMute);

    root.addEventListener("wheel", (e) => {
      if (!e.target.closest(".tour__caption, .tour__introCard")) e.preventDefault();
    }, { passive: false });

    root.addEventListener("touchmove", (e) => {
      if (!e.target.closest(".tour__caption, .tour__introCard")) e.preventDefault();
    }, { passive: false });

    state.built = true;
  }

  function loadVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") {
      state.voice = null;
      updateVoiceNote();
      return;
    }
    const all = window.speechSynthesis.getVoices();
    state.voices = all;
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
    if (!els.voiceNote) return;
    if (!window.speechSynthesis) {
      els.voiceNote.textContent = "Tu navegador no permite narración por voz. El video avanzará con los tiempos.";
    } else if (!state.voice) {
      els.voiceNote.textContent = "No se detectó una voz en español. Instala una voz en español latino o usa Edge/Chrome con voces en español.";
    } else if (!state.latam && /^es-ES/i.test(state.voice.lang || "")) {
      els.voiceNote.textContent = `Voz detectada: ${state.voice.name} (España). Para español latino, instala una voz de México o Latinoamérica.`;
    } else {
      els.voiceNote.textContent = `Voz latina: ${state.voice.name} (${state.voice.lang}).`;
    }
  }

  function open() {
    build();
    loadVoices();
    state.i = 0;
    state.started = false;
    state.playing = false;
    state.token++;
    clearTimeout(state.timer);
    clearTimeout(state.focusTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    els.root.hidden = false;
    els.intro.hidden = false;
    els.caption.hidden = true;
    els.spot.style.opacity = "0";
    els.count.textContent = `01 / ${pad(STEPS.length)}`;
    setTimeout(() => els.start.focus(), 60);
  }

  function close() {
    if (!state.built) return;
    state.token++;
    clearTimeout(state.timer);
    clearTimeout(state.focusTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.playing = false;
    state.started = false;
    els.root.hidden = true;
    els.intro.hidden = true;
    els.caption.hidden = true;
    els.spot.style.opacity = "0";
  }

  function start() {
    state.started = true;
    state.playing = true;
    els.intro.hidden = true;
    els.caption.hidden = false;
    go(0, { instant: true });
  }

  function go(index, opts = {}) {
    state.i = Math.max(0, Math.min(STEPS.length - 1, index));
    state.token++;
    clearTimeout(state.timer);
    clearTimeout(state.focusTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    render();

    const step = STEPS[state.i];
    const el = step.selector ? $(step.selector) || (step.fallback ? $(step.fallback) : null) : null;

    if (!el) {
      els.spot.style.opacity = "0";
      speak(step.text);
      return;
    }

    const offset = step.offset ?? 108;
    const y = Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset);
    window.scrollTo({ top: y, behavior: opts.instant || reduceMotion.matches ? "auto" : "smooth" });

    state.focusTimer = setTimeout(() => {
      position();
      speak(step.text);
    }, opts.instant || reduceMotion.matches ? 80 : 720);
  }

  function render() {
    els.count.textContent = `${pad(state.i + 1)} / ${pad(STEPS.length)}`;
    els.progress.style.width = `${((state.i + 1) / STEPS.length) * 100}%`;
    els.prev.disabled = state.i === 0;
    els.next.textContent = state.i === STEPS.length - 1 ? "Terminar ✓" : "Siguiente →";
    els.play.textContent = state.playing ? "Pausa" : "Reanudar";
    els.mute.textContent = state.muted ? "Silencio" : "Voz";
  }

  function speak(text) {
    if (!state.playing) return;
    const token = state.token;

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
      state.timer = setTimeout(next, 1200);
    };
    utterance.onerror = () => {
      if (token === state.token) scheduleFallback(text, token);
    };
    window.speechSynthesis.speak(utterance);
  }

  function scheduleFallback(text, token) {
    clearTimeout(state.timer);
    const words = String(text || "").split(/\s+/).filter(Boolean).length;
    const ms = Math.max(8000, words * 430 + 2200);
    state.timer = setTimeout(() => {
      if (token === state.token && state.playing) next();
    }, ms);
  }

  function next() {
    if (state.i >= STEPS.length - 1) {
      close();
      return;
    }
    state.playing = true;
    go(state.i + 1);
  }

  function prev() {
    if (state.i <= 0) return;
    state.playing = true;
    go(state.i - 1);
  }

  function toggle() {
    if (!state.started) return;
    state.playing = !state.playing;
    els.play.textContent = state.playing ? "Pausa" : "Reanudar";

    if (state.playing) {
      if (window.speechSynthesis && state.voice && !state.muted) {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        else if (!window.speechSynthesis.speaking) speak(STEPS[state.i].text);
      } else {
        speak(STEPS[state.i].text);
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
    if (state.playing) speak(STEPS[state.i].text);
  }

  function position() {
    if (!state.started) return;
    const step = STEPS[state.i];
    const el = step?.selector ? $(step.selector) || (step.fallback ? $(step.fallback) : null) : null;

    if (!el) {
      els.spot.style.opacity = "0";
      return;
    }

    const r = el.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = r.top - pad;
    let left = r.left - pad;
    let width = r.width + pad * 2;
    let height = r.height + pad * 2;

    if (height > vh * 0.66) {
      height = vh * 0.66;
      top = Math.max(76, r.top);
    }

    top = Math.max(8, top);
    left = Math.max(8, left);
    width = Math.min(width, vw - 16);
    height = Math.min(height, vh - 16);

    els.spot.style.top = `${top}px`;
    els.spot.style.left = `${left}px`;
    els.spot.style.width = `${width}px`;
    els.spot.style.height = `${height}px`;
    els.spot.style.opacity = "1";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-tour-open]");
    if (trigger) {
      e.preventDefault();
      open();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!els.root || els.root.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (!state.started) return;
    if (e.key === "ArrowRight") { e.preventDefault(); next(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); return; }
    if (e.key === " " && !e.target.closest("button, a, input, textarea, select")) {
      e.preventDefault();
      toggle();
    }
  });

  window.addEventListener("resize", () => {
    if (state.started && !els.root.hidden) position();
  });

  window.addEventListener("scroll", () => {
    if (!state.started || els.root.hidden) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(position);
  }, { passive: true });

  if (window.speechSynthesis) {
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  build();
  loadVoices();

  if (new URLSearchParams(location.search).get("tour") === "1") {
    open();
  }
})();
