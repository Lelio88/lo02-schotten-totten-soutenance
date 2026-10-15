# Comprendre les diagrammes UML du projet

Deux diagrammes sont demandés pour la soutenance 1 : le **diagramme de classes** (la structure) et le **diagramme de séquence** (le comportement dans le temps). Exemples tirés de Schotten Totten.

## 1. Diagramme de classes : « de quoi est fait le logiciel ? »

C'est le **plan d'architecte** : il décrit les briques du programme et leurs liens, **sans** dire dans quel ordre les choses se passent. Il est statique : une photo, pas un film.

### Une classe = un rectangle à 3 étages

```
┌─────────────────────────┐
│          Borne          │  ← nom
├─────────────────────────┤
│ - numero : int          │  ← attributs (les données)
│ - revendiqueePar: Joueur│
├─────────────────────────┤
│ + ajouterCarte(...)     │  ← méthodes (ce qu'elle sait faire)
│ + evaluerGagnant()      │
└─────────────────────────┘
```

**Visibilité** : `+` public (visible de tous), `-` privé (visible de la classe seule), `#` protégé (classe et ses sous-classes). On met les attributs en privé pour protéger les données (**encapsulation**).

*Nom en italique = classe abstraite* (non instanciable, ex. `Joueur`). *Nom souligné (ou `static`)* = membre de classe (ex. `getInstance()`).

### Les relations (le plus important, et le plus piégeux)

| Relation | Symbole | Se lit | Exemple du projet |
|---|---|---|---|
| **Association** | trait simple (+ flèche = sens de navigation) | « connaît / utilise » | `Joueur` → `Carte` (sa main) |
| **Agrégation** | losange **vide** côté « tout » | « possède, mais les parties vivent seules » | `Pioche` ◇— `Carte` |
| **Composition** | losange **plein** côté « tout » | « est fait de ; si le tout meurt, les parties aussi » | `Partie` ◆— `Borne` (pas de partie = plus de bornes) |
| **Héritage** (généralisation) | flèche à **triangle vide**, trait plein | « est un » | `JoueurVirtuel` est un `Joueur` |
| **Réalisation** | triangle vide, trait **pointillé** | « implémente l'interface » | `StratégieOffensive` réalise `Strategie` |
| **Dépendance** | flèche pointillée simple | « utilise ponctuellement » | `CarteTactique` utilise `Partie` en paramètre |

**Astuce pour agrégation vs composition** : « si je détruis le tout, les parties ont-elles encore un sens ? » Non → composition. Oui → agrégation.

### Les multiplicités (les petits chiffres aux bouts des traits)

`1` exactement un · `0..1` zéro ou un · `*` ou `0..*` plusieurs · `2` exactement deux · `1..2`…
Elles se lisent **depuis la classe d'en face** : « une Borne a 0..1 `revendiqueePar` Joueur » = une borne est revendiquée par au plus un joueur.
Le **nom de rôle** (`+ bornes`, `+ main`) est le nom de l'attribut que la relation crée dans la classe.

### Interface et énumération
- **Interface** (`«interface»`) : un contrat de méthodes sans code. C'est ce qui permet de changer de comportement sans toucher au reste (`Strategie`).
- **Énumération** (`«enumeration»`) : un ensemble fini de valeurs (`Couleur`).

### Ce que le jury regarde
Syntaxe correcte, bonnes relations, **pourquoi** ces choix (modularité, extensibilité), patrons de conception justifiés.

---

## 2. Diagramme de séquence : « qui parle à qui, dans quel ordre ? »

Il montre **un scénario précis** (ici : un tour de jeu) comme une conversation entre objets. Il est dynamique : le film d'une scène.

### Les éléments

- **Ligne de vie** : rectangle en haut + trait vertical pointillé qui descend = un objet qui existe pendant le scénario. Le temps s'écoule **de haut en bas**.
- **Acteur** : un personnage externe (le joueur humain devant l'écran).
- **Message synchrone** : flèche pleine `→` = appel de méthode, l'appelant attend la réponse.
- **Message de retour** : flèche pointillée `⇠` = valeur renvoyée.
- **Message asynchrone** : flèche ouverte (rare ici).
- **Activation** : fin rectangle sur la ligne de vie = l'objet est en train d'exécuter.
- **Création / destruction** : un message vers le *rectangle* de l'objet (création), un `X` en bas (destruction).
- **Auto-appel** : flèche qui revient sur la même ligne de vie.

### Les fragments combinés (les « if » et « for » du diagramme)

| Fragment | Sens | Dans notre tour |
|---|---|---|
| `alt` | si / sinon | joueur physique **ou** virtuel ; borne revendiquable **ou** non |
| `opt` | si (sans sinon) | piocher *seulement si* la pioche n'est pas vide |
| `loop` | boucle | tenter de revendiquer chacune des 9 bornes |
| `ref` | renvoie vers un autre diagramme | détail de l'évaluation d'une borne |

### Règle d'or
**Chaque message du diagramme de séquence doit correspondre à une méthode qui existe dans le diagramme de classes**, sur la bonne classe. C'est la cohérence entre les deux diagrammes qui fait la qualité du dossier, et c'est ce qu'on vérifie pendant l'audit.

---

## 3. Comment les deux se complètent

| | Classes | Séquence |
|---|---|---|
| Question | De quoi est fait le système ? | Comment se déroule ce scénario ? |
| Nature | Statique | Dynamique |
| Contenu | Classes, attributs, relations | Objets, messages, ordre |
| Analogie | Le plan de la maison | La visite guidée d'une pièce |

On en tire une vérification utile : un message `a → b : m()` suppose une relation entre `a` et `b` dans le diagramme de classes, et une méthode `m()` dans `b`.
