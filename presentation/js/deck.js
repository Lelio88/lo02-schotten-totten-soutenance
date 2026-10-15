/**
 * Moteur du diaporama : mise à l'échelle de la scène 1920×1080, navigation (étapes puis slides),
 * transitions (FX) et synchronisation avec la console présentateur.
 *
 * Modèle : une slide est composée d'« étapes » (éléments data-step) révélées une à une.
 * « Suivant » révèle l'étape suivante ; quand il n'y en a plus, on passe à la slide suivante.
 *
 * Synchronisation : BroadcastChannel « lo02-deck ». Cette page (vue public, slides seules)
 * publie son état {index, step, steps} ; la console présentateur (presenter.html) l'affiche
 * avec les notes et peut piloter via {type:"cmd"}.
 *
 * Raccourcis : flèches / espace / PageUp-PageDown, Début/Fin, F plein écran, P console.
 */
(() => {
  const STAGE_W = 1920;
  const STAGE_H = 1080;
  const CHANNEL = "lo02-deck";

  const stage = document.getElementById("stage");
  const slides = [...stage.querySelectorAll(".slide")];
  const total = slides.length;
  const stepsOf = (slide) => [...slide.querySelectorAll("[data-step]")];
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL) : null;
  const state = { index: -1, step: 0, busy: false };

  slides.forEach((slide, i) => {
    const pg = slide.querySelector(".pg");
    if (pg) pg.textContent = `${i + 1} / ${total}`;
  });
  const mounted = slides.map((slide) => window.Diagrams.mountAll(slide));

  function fit() {
    const scale = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  fit();
  addEventListener("resize", fit);

  function broadcast() {
    if (!channel) return;
    channel.postMessage({ type: "state", index: state.index, step: state.step, steps: stepsOf(slides[state.index]).length, total });
  }

  function setStep(n) {
    const slide = slides[state.index];
    const steps = stepsOf(slide);
    state.step = Math.max(0, Math.min(n, steps.length));
    steps.forEach((el, i) => {
      el.classList.toggle("on", i < state.step);
      el.classList.toggle("current", i === state.step - 1);
    });
    const current = state.step > 0 ? steps[state.step - 1] : null;
    mounted[state.index].forEach((diagram) => diagram.onStep(current));
    broadcast();
  }

  function activate(index, step) {
    if (state.index >= 0) slides[state.index].classList.remove("active");
    state.index = index;
    slides[index].classList.add("active");
    window.FX.setProgress(total > 1 ? index / (total - 1) : 0);
    history.replaceState(null, "", `#${index + 1}`);
    setStep(step === "all" ? stepsOf(slides[index]).length : step);
  }

  /** Va à une slide avec transition ; « step » vaut un nombre ou "all" (toutes les étapes révélées). */
  function go(index, step = 0) {
    const target = Math.max(0, Math.min(index, total - 1));
    if (state.busy || target === state.index) return;
    state.busy = true;
    const mode = slides[target].dataset.fx || "ink";
    window.FX.play(mode, () => activate(target, step)).then(() => { state.busy = false; });
  }

  function next() {
    if (state.busy) return;
    if (state.step < stepsOf(slides[state.index]).length) setStep(state.step + 1);
    else go(state.index + 1);
  }

  function prev() {
    if (state.busy) return;
    if (state.step > 0) setStep(state.step - 1);
    else go(state.index - 1, "all");
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  function openPresenter() {
    window.open("presenter.html", "lo02-presenter", "popup,width=1180,height=820");
  }

  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const actions = {
      ArrowRight: next, PageDown: next, " ": next, Enter: next,
      ArrowLeft: prev, PageUp: prev, Backspace: prev,
      Home: () => go(0), End: () => go(total - 1, "all"),
      f: toggleFullscreen, F: toggleFullscreen, p: openPresenter, P: openPresenter,
    };
    const action = actions[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  });

  stage.addEventListener("click", (e) => {
    if (e.target.closest("a, button, .dgm-scroll")) return;
    next();
  });

  let touchX = null;
  addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
  }, { passive: true });

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (!data) return;
      if (data.type === "hello") broadcast();
      else if (data.type === "cmd") {
        if (data.cmd === "next") next();
        else if (data.cmd === "prev") prev();
        else if (data.cmd === "goto") go(data.index, data.step || 0);
      }
    };
  }

  // ?all : toutes les étapes sont révélées dès l'ouverture (relecture, captures, export PDF) ;
  // ?step=N : seulement les N premières.
  const stepParam = location.search.match(/[?&]step=(\d+)/);
  const initialStep = /[?&]all\b/.test(location.search) ? "all" : stepParam ? Number(stepParam[1]) : 0;
  const fromHash = parseInt(location.hash.slice(1), 10);
  activate(Number.isFinite(fromHash) && fromHash >= 1 && fromHash <= total ? fromHash - 1 : 0, initialStep);

  const help = document.getElementById("help");
  help.classList.add("show");
  setTimeout(() => help.classList.remove("show"), 6000);
})();
