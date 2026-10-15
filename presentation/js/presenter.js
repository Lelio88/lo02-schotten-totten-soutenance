/**
 * Console présentateur : affiche les notes de la slide courante, les étapes, la slide suivante,
 * les questions probables et un chronomètre. Se synchronise avec index.html par le
 * BroadcastChannel « lo02-deck » et peut piloter la présentation (boutons et flèches).
 *
 * Sans nouvelles de l'écran public, la console reste utilisable en lecture : elle affiche
 * simplement la première slide en attendant.
 */
(() => {
  const CHANNEL = "lo02-deck";
  const SLIDES = window.SLIDES;
  const $ = (id) => document.getElementById(id);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL) : null;

  const MIN_FONT = 12;

  /** Réduit la police (variable CSS) jusqu'à ce que tout le contenu tienne sans défilement. */
  function fit(box, varName, max) {
    for (let size = max; size >= MIN_FONT; size -= 1) {
      box.style.setProperty(varName, `${size}px`);
      if (box.scrollHeight <= box.clientHeight + 1) return;
    }
  }

  function fitAll() {
    fit($("notes"), "--fs-notes", 30);
    fit($("side"), "--fs-side", 20);
  }
  addEventListener("resize", fitAll);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render({ index, step, steps, total }) {
    const slide = SLIDES[index];
    $("num").textContent = `${index + 1} / ${total}`;
    $("title").textContent = slide.title;

    // Notes : la ligne k correspond à l'étape k ; la ligne courante est mise en avant.
    const inner = $("notes-inner");
    inner.replaceChildren();
    slide.notes.forEach((text, k) => {
      const line = el("p", `line${k === step ? " now" : k < step ? " past" : ""}`, text);
      inner.appendChild(line);
    });

    // Pastilles d'étapes.
    const stepsBox = $("steps");
    stepsBox.replaceChildren();
    if (steps === 0) stepsBox.appendChild(el("span", "", "Aucune étape sur cette slide"));
    for (let k = 1; k <= steps; k += 1) stepsBox.appendChild(el("span", `pip${k <= step ? " on" : ""}${k === step ? " cur" : ""}`));

    $("next").textContent = index + 1 < total ? SLIDES[index + 1].title : "Fin de la présentation";

    const qa = $("qa");
    qa.replaceChildren();
    (slide.qa || []).forEach(({ q, a }) => {
      qa.appendChild(el("p", "qa-q", q));
      qa.appendChild(el("p", "qa-a", a));
    });
    $("qa-card").hidden = !(slide.qa && slide.qa.length);
    fitAll();
  }

  const send = (msg) => { if (channel) channel.postMessage(msg); };
  const prev = () => send({ type: "cmd", cmd: "prev" });
  const next = () => send({ type: "cmd", cmd: "next" });

  $("prev").addEventListener("click", prev);
  $("nextBtn").addEventListener("click", next);
  addEventListener("keydown", (e) => {
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
    if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
  });

  // Chronomètre.
  let started = Date.now();
  const pad = (n) => String(n).padStart(2, "0");
  setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    $("clock").textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }, 500);
  $("reset").addEventListener("click", () => { started = Date.now(); });

  // Liaison avec l'écran public.
  let lastSeen = 0;
  if (channel) {
    channel.onmessage = ({ data }) => {
      if (!data || data.type !== "state") return;
      lastSeen = Date.now();
      $("dot").classList.add("ok");
      $("link").textContent = "Connecté à l'écran public";
      render(data);
    };
    send({ type: "hello" });
    setInterval(() => {
      if (Date.now() - lastSeen > 4000) { $("dot").classList.remove("ok"); $("link").textContent = "En attente de l'écran public…"; send({ type: "hello" }); }
    }, 2000);
  }
  render({ index: 0, step: 0, steps: 0, total: SLIDES.length });
})();
