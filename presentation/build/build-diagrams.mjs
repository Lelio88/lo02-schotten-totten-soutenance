/**
 * Génère assets/diagrams.js à partir des SVG PlantUML de doc/uml.
 *
 * Pourquoi : les diagrammes sont inlinés dans une variable JS (pas de fetch) pour que le
 * diaporama marche aussi en ouvrant index.html directement (file://), et pour pouvoir
 * zoomer / griser des classes par CSS.
 * Pour le diagramme de classes, on calcule la boîte englobante de chaque entité afin de
 * cadrer automatiquement un zoom sur un groupe de classes (viewBox).
 *
 * Usage : node build/build-diagrams.mjs   (depuis le dossier presentation/)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const umlDir = join(here, "..", "..", "doc", "uml");
const out = join(here, "..", "assets", "diagrams.js");

const FILES = {
  classes: "classes-v2.svg",
  tour: "sequence-tour-joueur-virtuel.svg",
  evaluation: "sequence-evaluation-borne.svg",
  initialisation: "sequence-initialisation.svg",
};

/** Retire fond blanc et dimensions fixes pour que le SVG s'adapte à son conteneur. */
function clean(svg) {
  return svg
    .replace(/background:#FFFFFF;?/gi, "")
    .replace(/style="width:[\d.]+px;height:[\d.]+px;?\s*"/, "")
    .replace(/ width="[\d.]+px" height="[\d.]+px"/, "")
    .replace(/preserveAspectRatio="none"/, 'preserveAspectRatio="xMidYMid meet"')
    .replace(/<\?plantuml[^?]*\?>/, "");
}

/** Boîte englobante de chaque entité du diagramme de classes. */
function entityBoxes(svg) {
  const boxes = {};
  const re = /<g class="entity" data-qualified-name="([^"]+)"[^>]*><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g;
  for (const m of svg.matchAll(re)) {
    boxes[m[1]] = { x: +m[2], y: +m[3], w: +m[4], h: +m[5] };
  }
  return boxes;
}

const diagrams = {};
let boxes = {};
let size = {};
for (const [key, file] of Object.entries(FILES)) {
  const raw = readFileSync(join(umlDir, file), "utf8");
  const vb = raw.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  diagrams[key] = clean(raw);
  if (key === "classes") {
    boxes = entityBoxes(raw);
    size = { w: +vb[1], h: +vb[2] };
  }
}

const body =
  "/* Fichier généré par build/build-diagrams.mjs : ne pas éditer à la main. */\n" +
  `window.DIAGRAMS = ${JSON.stringify(diagrams)};\n` +
  `window.CLASS_BOXES = ${JSON.stringify(boxes)};\n` +
  `window.CLASS_SIZE = ${JSON.stringify(size)};\n`;
writeFileSync(out, body, "utf8");
console.log(`diagrams.js : ${Object.keys(diagrams).length} diagrammes, ${Object.keys(boxes).length} entités`);
console.log(Object.keys(boxes).join(", "));
