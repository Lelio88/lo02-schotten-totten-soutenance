/**
 * Composants de diagrammes du diaporama.
 *
 *  - Diagramme de classes : le SVG PlantUML est inliné (assets/diagrams.js). Pour une étape donnée,
 *    on anime le viewBox vers la boîte englobante d'un groupe de classes, on grise le reste et on
 *    entoure la classe mise en avant (data-focus / data-hl).
 *  - Diagrammes de séquence : SVG dans un conteneur scrollable piloté par Lenis (défilement doux) ;
 *    chaque étape fait défiler jusqu'à un texte du SVG (data-scroll).
 *
 * Invariant : un contrôleur n'agit que sur son propre conteneur ; deck.js l'appelle via onStep().
 *
 * API : Diagrams.mountAll(slide) -> contrôleurs ; contrôleur.onStep(elementEtape | null)
 */
(() => {
  const PAD = 40;
  const MIN_W = 560;
  const MIN_H = 400;
  const TWEEN_MS = 800;

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const words = (s) => (s || "").split(/\s+/).filter(Boolean);

  /** Diagramme de classes avec zoom animé sur un groupe d'entités. */
  class ClassDiagram {
    constructor(container, slide) {
      this.container = container;
      this.slide = slide;
      container.innerHTML = window.DIAGRAMS.classes;
      this.svg = container.querySelector("svg");
      this.full = { x: 0, y: 0, w: window.CLASS_SIZE.w, h: window.CLASS_SIZE.h };
      this.view = { ...this.full };
      this.entities = new Map();
      this.idToName = new Map();
      this.svg.querySelectorAll("g.entity").forEach((g) => {
        const name = g.dataset.qualifiedName;
        this.entities.set(name, g);
        this.idToName.set(g.id, name);
      });
      this.links = [...this.svg.querySelectorAll("g.link")].map((g) => ({
        g,
        a: this.idToName.get(g.dataset.entity1),
        b: this.idToName.get(g.dataset.entity2),
      }));
      this.extras = [...this.svg.querySelectorAll("g.title, g.legend")];
      this.applyView(this.full);
      this.defaultFocus = words(slide.dataset.focus);
      this.update(this.defaultFocus, []);
    }

    /** Boîte englobante d'un groupe d'entités, agrandie au minimum lisible et au ratio du conteneur. */
    boxFor(names) {
      if (!names.length) return this.full;
      const boxes = names.map((n) => window.CLASS_BOXES[n]).filter(Boolean);
      if (!boxes.length) return this.full;
      const x1 = Math.min(...boxes.map((b) => b.x)) - PAD;
      const y1 = Math.min(...boxes.map((b) => b.y)) - PAD;
      const x2 = Math.max(...boxes.map((b) => b.x + b.w)) + PAD;
      const y2 = Math.max(...boxes.map((b) => b.y + b.h)) + PAD;
      let w = Math.max(x2 - x1, MIN_W);
      let h = Math.max(y2 - y1, MIN_H);
      const aspect = this.container.clientWidth / Math.max(this.container.clientHeight, 1);
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      return { x: (x1 + x2) / 2 - w / 2, y: (y1 + y2) / 2 - h / 2, w, h };
    }

    applyView(v) {
      this.view = v;
      this.svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    }

    animateTo(target) {
      const from = { ...this.view };
      const start = performance.now();
      const token = (this.token = Symbol());
      const frame = (now) => {
        if (token !== this.token) return;
        const t = Math.min((now - start) / TWEEN_MS, 1);
        const k = ease(t);
        this.applyView({
          x: from.x + (target.x - from.x) * k,
          y: from.y + (target.y - from.y) * k,
          w: from.w + (target.w - from.w) * k,
          h: from.h + (target.h - from.h) * k,
        });
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }

    /** Grise ce qui est hors du groupe et entoure les classes mises en avant. */
    update(focus, hl) {
      const inFocus = new Set(focus);
      const dim = focus.length > 0;
      this.entities.forEach((g, name) => {
        g.classList.toggle("dim", dim && !inFocus.has(name));
        g.classList.toggle("hl", hl.includes(name));
      });
      this.links.forEach(({ g, a, b }) => g.classList.toggle("dim", dim && !(inFocus.has(a) && inFocus.has(b))));
      this.extras.forEach((g) => g.classList.toggle("dim", dim));
      this.animateTo(this.boxFor(focus));
    }

    onStep(stepEl) {
      const hl = stepEl ? words(stepEl.dataset.hl) : [];
      // Cadrage : data-focus explicite, sinon les classes mises en avant, sinon le groupe de la slide.
      let focus = this.defaultFocus;
      if (stepEl && stepEl.hasAttribute("data-focus")) focus = words(stepEl.dataset.focus);
      else if (hl.length) focus = hl;
      if (this.lastFocus && sameList(this.lastFocus, focus) && sameList(this.lastHl || [], hl)) return;
      this.lastFocus = focus;
      this.lastHl = hl;
      this.update(focus, hl);
    }
  }

  const lenisInstances = [];

  /** Diagramme de séquence scrollable : chaque étape défile jusqu'à un repère textuel. */
  class SequenceDiagram {
    constructor(container, key) {
      this.container = container;
      this.inner = container.querySelector(".dgm-inner");
      this.inner.innerHTML = window.DIAGRAMS[key];
      this.svg = this.inner.querySelector("svg");
      this.lenis = new window.Lenis({ wrapper: container, content: this.inner, duration: 1.15, smoothWheel: true });
      lenisInstances.push({ lenis: this.lenis, container });
    }

    scrollToText(needle) {
      if (!needle) { this.lenis.scrollTo(0, { duration: 0.9 }); return; }
      const target = [...this.svg.querySelectorAll("text")].find((t) => t.textContent.includes(needle));
      if (!target) return;
      const scale = this.svg.clientWidth / this.svg.viewBox.baseVal.width;
      this.lenis.scrollTo(Math.max(0, target.getBBox().y * scale - 140), { duration: 1.2 });
    }

    onStep(stepEl) {
      this.scrollToText(stepEl ? stepEl.dataset.scroll : "");
    }
  }

  /** Une seule boucle d'animation pour tous les Lenis ; seuls ceux de la slide active tournent. */
  function loop(time) {
    lenisInstances.forEach(({ lenis, container }) => {
      const slide = container.closest(".slide");
      if (slide && slide.classList.contains("active")) lenis.raf(time);
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.Diagrams = {
    mountAll(slide) {
      return [...slide.querySelectorAll("[data-diagram]")].map((el) => {
        const key = el.dataset.diagram;
        return key === "classes" ? new ClassDiagram(el, slide) : new SequenceDiagram(el, key);
      });
    },
  };
})();
