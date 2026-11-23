/**
 * Génère le schéma de progression du projet (doc/progression/progression.svg).
 *
 * Deux couloirs (Lelio en haut, Pierre en bas) sur un axe de temps qui ne compte que les jours
 * ouvrés. Chaque barre est une tâche de doc/repartition-taches.md (mêmes identifiants) ; sa largeur
 * est proportionnelle à la durée prévue ; les flèches sont les dépendances réelles entre les deux
 * couloirs ; la partie sombre d'une barre est l'avancement réel.
 *
 * Mise à jour de l'avancement : modifier AVANCEMENT ci-dessous (0 à 100 par tâche), puis lancer
 *   node doc/progression/progression.mjs
 * et committer le SVG régénéré avec le changement qui l'a provoqué.
 *
 * Invariants : les durées sont en jours ouvrés consécutifs à partir de la date de début ; chaque
 * identifiant de DEPENDANCES existe dans TACHES.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------- données

/** Avancement réel de chaque tâche, en pourcentage. */
const AVANCEMENT = {
  L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0, L8: 0, L9: 0, L10: 0, L11: 0,
  P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0, P10: 0, P11: 0, P12: 0, P13: 0,
};

const DEBUT = "2026-11-23";
const FIN = "2027-01-15";
const JOURS_FERIES = new Set(["2026-12-25", "2027-01-01"]);

/** qui : "L" (Lelio) ou "P" (Pierre) ; debut : premier jour ouvré ; jours : durée en jours ouvrés. */
const TACHES = [
  { id: "L1", qui: "L", nom: "Plateau", pts: 4, debut: "2026-11-23", jours: 2 },
  { id: "L2", qui: "L", nom: "Combinaisons", pts: 5, debut: "2026-11-25", jours: 3 },
  { id: "L4", qui: "L", nom: "Partie", pts: 5, debut: "2026-11-30", jours: 3 },
  { id: "L5", qui: "L", nom: "Cartes tactiques", pts: 6, debut: "2026-12-03", jours: 3 },
  { id: "L3", qui: "L", nom: "Revendication", pts: 6, debut: "2026-12-08", jours: 3 },
  { id: "L6", qui: "L", nom: "Main de bout en bout", pts: 2, debut: "2026-12-11", jours: 1 },
  { id: "L7", qui: "L", nom: "Contrôleur et Observer", pts: 5, debut: "2026-12-15", jours: 3 },
  { id: "L8", qui: "L", nom: "Fenêtre plateau", pts: 6, debut: "2026-12-18", jours: 3 },
  { id: "L9", qui: "L", nom: "CLI et GUI ensemble", pts: 3, debut: "2026-12-24", jours: 2 },
  { id: "L10", qui: "L", nom: "UML final", pts: 3, debut: "2027-01-05", jours: 2 },
  { id: "L11", qui: "L", nom: "Relecture croisée", pts: 2, debut: "2027-01-07", jours: 1 },

  { id: "P1", qui: "P", nom: "Cartes", pts: 3, debut: "2026-11-23", jours: 2 },
  { id: "P2", qui: "P", nom: "Joueurs", pts: 4, debut: "2026-11-25", jours: 2 },
  { id: "P3", qui: "P", nom: "Stratégies", pts: 5, debut: "2026-11-27", jours: 3 },
  { id: "P4", qui: "P", nom: "Vue CLI", pts: 6, debut: "2026-12-03", jours: 3 },
  { id: "P6", qui: "P", nom: "Extensions", pts: 5, debut: "2026-12-08", jours: 2 },
  { id: "P5", qui: "P", nom: "Sauvegarde", pts: 4, debut: "2026-12-10", jours: 2 },
  { id: "P7", qui: "P", nom: "État et UML phase 2", pts: 1, debut: "2026-12-14", jours: 1 },
  { id: "P8", qui: "P", nom: "Écran de configuration", pts: 4, debut: "2026-12-15", jours: 2 },
  { id: "P9", qui: "P", nom: "Zone joueur", pts: 6, debut: "2026-12-18", jours: 3 },
  { id: "P11", qui: "P", nom: "CLI branchée", pts: 2, debut: "2026-12-23", jours: 1 },
  { id: "P10", qui: "P", nom: "Sauvegarde dans la GUI", pts: 3, debut: "2026-12-24", jours: 2 },
  { id: "P12", qui: "P", nom: "Javadoc et conventions", pts: 3, debut: "2027-01-05", jours: 2 },
  { id: "P13", qui: "P", nom: "État final et ZIP", pts: 2, debut: "2027-01-07", jours: 1 },
];

/** [tâche amont, tâche aval] : l'aval ne peut pas se terminer avant l'amont ; couloirs différents. */
const DEPENDANCES = [
  ["P1", "L2"], ["L1", "P3"], ["P2", "L4"], ["L4", "P4"], ["L5", "P5"], ["P4", "L6"],
  ["L7", "P9"], ["P11", "L9"],
];

const JALONS = [
  { date: "2026-11-23", texte: "Séance de 1 h : figer les signatures" },
  { date: "2026-12-14", texte: "Soutenance 2" },
  { date: "2027-01-04", texte: "Soutenance 3" },
  { date: "2027-01-15", texte: "Remise sur Moodle" },
];

const PHASES = [
  { nom: "Phase 2 : moteur en ligne de commande", de: "2026-11-23", avant: "2026-12-15" },
  { nom: "Phase 3 : interface graphique", de: "2026-12-15", avant: "2027-01-05" },
  { nom: "Remise des fichiers", de: "2027-01-05", avant: "2027-01-16" },
];

const MARGE = { nom: "Marge et tests de bout en bout", de: "2026-12-29", jours: 3 };

// ---------------------------------------------------------------------------- mise en page

const PX = 40; // largeur d'un jour ouvré
const X0 = 120; // début de l'axe de temps
const COULOIRS = {
  L: { nom: "Lelio", role: "règles du jeu", haut: 226, fond: "#E8EFF7", barre: "#3F6A9A", avance: "#24456B", texte: "#FFFFFF" },
  P: { nom: "Pierre", role: "acteurs et interface", haut: 392, fond: "#FBEFD9", barre: "#E8A33D", avance: "#B97A12", texte: "#2B1B0E" },
};
const HAUTEUR_COULOIR = 104;
const HAUTEUR_BARRE = 66;
const MARGE_BARRE = 14;
const ENCRE = "#2B1B0E";
const BRUN = "#5A3A1B";
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// ---------------------------------------------------------------------------- calendrier

const iso = (d) => d.toISOString().slice(0, 10);
const jours = [];
for (let d = new Date(`${DEBUT}T00:00:00Z`); iso(d) <= FIN; d = new Date(d.getTime() + 864e5)) {
  const jourSemaine = d.getUTCDay();
  if (jourSemaine !== 0 && jourSemaine !== 6 && !JOURS_FERIES.has(iso(d))) jours.push(iso(d));
}
/** Position du premier jour ouvré égal ou postérieur à la date. */
const indexDe = (date) => {
  const i = jours.findIndex((j) => j >= date);
  return i === -1 ? jours.length : i;
};
const xDe = (date) => X0 + indexDe(date) * PX;
const LARGEUR = X0 + jours.length * PX + 50;
const HAUTEUR = 564;

// ---------------------------------------------------------------------------- utilitaires SVG

const echapper = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Coupe un texte en lignes d'au plus `max` caractères, sur les espaces. */
function couper(texte, max) {
  const lignes = [];
  let courante = "";
  for (const mot of texte.split(" ")) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (essai.length > max && courante) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

const geometrie = (t) => {
  const c = COULOIRS[t.qui];
  return { x: xDe(t.debut), w: t.jours * PX - 4, y: c.haut + MARGE_BARRE, h: HAUTEUR_BARRE };
};
const parId = new Map(TACHES.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------- éléments

function bande(phase, i) {
  const x = xDe(phase.de);
  const w = xDe(phase.avant) - x;
  const fonds = ["#EADFC0", "#E2D4AA", "#EADFC0"];
  return `<rect x="${x}" y="116" width="${w - 3}" height="28" rx="6" fill="${fonds[i]}" stroke="${BRUN}" stroke-width="1"/>
<text x="${x + w / 2 - 1.5}" y="135" text-anchor="middle" font-size="13" font-weight="700" fill="${ENCRE}">${echapper(phase.nom)}</text>`;
}

function semaines() {
  let sortie = "";
  jours.forEach((j, i) => {
    const d = new Date(`${j}T00:00:00Z`);
    if (i !== 0 && d.getUTCDay() !== 1) return;
    const x = X0 + i * PX;
    sortie += `<line x1="${x}" y1="150" x2="${x}" y2="${HAUTEUR - 56}" stroke="${BRUN}" stroke-opacity="0.18"/>
<text x="${x + 4}" y="164" font-size="11" fill="${BRUN}">${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}</text>`;
  });
  return sortie;
}

function jalon(j) {
  const x = xDe(j.date) + PX / 2;
  const largeur = j.texte.length * 6.4 + 18;
  const gauche = Math.max(8, Math.min(x - largeur / 2, LARGEUR - largeur - 8));
  return `<line x1="${x}" y1="198" x2="${x}" y2="${HAUTEUR - 56}" stroke="#B03A2E" stroke-width="1.5" stroke-dasharray="5 4"/>
<rect x="${gauche}" y="174" width="${largeur}" height="24" rx="12" fill="#B03A2E"/>
<text x="${gauche + largeur / 2}" y="190" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF">${echapper(j.texte)}</text>`;
}

function couloir(cle) {
  const c = COULOIRS[cle];
  const milieu = c.haut + HAUTEUR_COULOIR / 2;
  return `<rect x="8" y="${c.haut}" width="${LARGEUR - 16}" height="${HAUTEUR_COULOIR}" rx="10" fill="${c.fond}" stroke="${c.barre}" stroke-opacity="0.45"/>
<rect x="14" y="${c.haut + 10}" width="92" height="${HAUTEUR_COULOIR - 20}" rx="8" fill="${c.barre}"/>
<text x="60" y="${milieu - 3}" text-anchor="middle" font-size="16" font-weight="700" fill="${c.texte}">${c.nom}</text>
<text x="60" y="${milieu + 15}" text-anchor="middle" font-size="10" fill="${c.texte}">${c.role}</text>`;
}

function marge() {
  const x = xDe(MARGE.de);
  const w = MARGE.jours * PX - 4;
  const haut = COULOIRS.L.haut + 6;
  const bas = COULOIRS.P.haut + HAUTEUR_COULOIR - 6;
  const texte = couper(MARGE.nom, 14).map((l, i, tout) =>
    `<text x="${x + w / 2}" y="${(haut + bas) / 2 + (i - (tout.length - 1) / 2) * 15 + 4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2F4B25">${echapper(l)}</text>`).join("\n");
  return `<rect x="${x}" y="${haut}" width="${w}" height="${bas - haut}" rx="8" fill="#BFD1B0" stroke="#566B47" stroke-width="1.2"/>\n${texte}`;
}

function fleche([deId, versId]) {
  const a = geometrie(parId.get(deId));
  const b = geometrie(parId.get(versId));
  const descend = parId.get(deId).qui === "L";
  const y1 = descend ? a.y + a.h : a.y;
  const y2 = descend ? b.y : b.y + b.h;
  const x1 = a.x + a.w - 10;
  const x2 = b.x + 10;
  const dy = descend ? 48 : -48;
  return `<path d="M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}" fill="none" stroke="${BRUN}" stroke-width="1.8" marker-end="url(#pointe)"/>`;
}

function barre(t) {
  const c = COULOIRS[t.qui];
  const g = geometrie(t);
  const pct = AVANCEMENT[t.id] ?? 0;
  const etroite = g.w < 70;
  let sortie = `<clipPath id="c-${t.id}"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="9"/></clipPath>
<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="9" fill="${c.barre}" stroke="${ENCRE}" stroke-opacity="0.55"/>`;
  if (pct > 0) {
    sortie += `<rect x="${g.x}" y="${g.y}" width="${(g.w * pct) / 100}" height="${g.h}" fill="${c.avance}" clip-path="url(#c-${t.id})"/>`;
  }
  const cx = g.x + g.w / 2;
  if (etroite) {
    const yLegende = t.qui === "L" ? g.y - 4 : g.y + g.h + 14;
    sortie += `<text x="${cx}" y="${g.y + 28}" text-anchor="middle" font-size="13" font-weight="700" fill="${c.texte}">${t.id}</text>
<text x="${cx}" y="${g.y + 46}" text-anchor="middle" font-size="10.5" fill="${c.texte}">${t.pts} pts</text>
<text x="${cx}" y="${yLegende}" text-anchor="middle" font-size="11" fill="${ENCRE}" stroke="${c.fond}" stroke-width="3" paint-order="stroke">${echapper(t.nom)}</text>`;
  } else {
    const lignes = couper(t.nom, Math.floor((g.w - 12) / 6.2)).slice(0, 2);
    sortie += `<text x="${cx}" y="${g.y + 21}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${c.texte}">${t.id} · ${t.pts} pts</text>`;
    lignes.forEach((l, i) => {
      sortie += `<text x="${cx}" y="${g.y + 39 + i * 14}" text-anchor="middle" font-size="11.5" fill="${c.texte}">${echapper(l)}</text>`;
    });
  }
  if (pct > 0) {
    sortie += `<text x="${g.x + g.w - 6}" y="${g.y + g.h - 6}" text-anchor="end" font-size="10" font-weight="700" fill="${c.texte}">${pct} %</text>`;
  }
  return sortie;
}

function aujourdhui() {
  const jour = iso(new Date());
  if (jour < DEBUT || jour > FIN) return "";
  const x = xDe(jour) + PX / 2;
  return `<line x1="${x}" y1="208" x2="${x}" y2="${HAUTEUR - 56}" stroke="#1E8449" stroke-width="2.5"/>
<rect x="${x - 38}" y="${HAUTEUR - 56}" width="76" height="20" rx="10" fill="#1E8449"/>
<text x="${x}" y="${HAUTEUR - 42}" text-anchor="middle" font-size="11" font-weight="700" fill="#FFFFFF">Aujourd'hui</text>`;
}

function points(qui) {
  const mesTaches = TACHES.filter((t) => t.qui === qui);
  const total = mesTaches.reduce((s, t) => s + t.pts, 0);
  const faits = mesTaches.reduce((s, t) => s + (t.pts * (AVANCEMENT[t.id] ?? 0)) / 100, 0);
  return { total, faits: Math.round(faits * 10) / 10 };
}

// ---------------------------------------------------------------------------- assemblage

const lelio = points("L");
const pierre = points("P");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" font-family="'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="Planning et progression du projet Schotten Totten">
<title>Schotten Totten : planning et progression</title>
<defs>
<marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${BRUN}"/></marker>
</defs>
<rect width="${LARGEUR}" height="${HAUTEUR}" fill="#FBF6E9"/>
<text x="20" y="40" font-size="26" font-weight="700" fill="${ENCRE}">Schotten Totten : qui fait quoi, et dans quel ordre</text>
<text x="20" y="66" font-size="14" fill="${BRUN}">Avancement : Lelio ${lelio.faits} / ${lelio.total} points · Pierre ${pierre.faits} / ${pierre.total} points</text>
<g font-size="12" fill="${ENCRE}">
<rect x="20" y="82" width="16" height="16" rx="4" fill="${COULOIRS.L.barre}"/><text x="42" y="95">Tâche de Lelio</text>
<rect x="150" y="82" width="16" height="16" rx="4" fill="${COULOIRS.P.barre}"/><text x="172" y="95">Tâche de Pierre</text>
<rect x="290" y="82" width="16" height="16" rx="4" fill="#BFD1B0" stroke="#566B47"/><text x="312" y="95">Marge</text>
<rect x="372" y="82" width="16" height="16" rx="4" fill="${COULOIRS.L.avance}"/><text x="394" y="95">Part déjà faite</text>
<path d="M512 90 H540" stroke="${BRUN}" stroke-width="1.8" marker-end="url(#pointe)"/><text x="548" y="95">« ne peut pas se terminer avant »</text>
<line x1="776" y1="90" x2="804" y2="90" stroke="#B03A2E" stroke-width="1.5" stroke-dasharray="5 4"/><text x="812" y="95">Échéance</text>
</g>
${PHASES.map(bande).join("\n")}
${semaines()}
${couloir("L")}
${couloir("P")}
${marge()}
${JALONS.map(jalon).join("\n")}
${aujourdhui()}
${DEPENDANCES.map(fleche).join("\n")}
${TACHES.map(barre).join("\n")}
<text x="20" y="${HAUTEUR - 14}" font-size="11.5" fill="${BRUN}">Une barre = une tâche de doc/repartition-taches.md (mêmes identifiants). Largeur proportionnelle à la durée prévue, hors week-ends et jours fériés. 1 point ≈ une demi-journée de travail.</text>
</svg>
`;

writeFileSync(fileURLToPath(new URL("./progression.svg", import.meta.url)), svg, "utf8");
