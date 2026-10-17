# Audit du diagramme de classes (v1 du binôme) et étude des patrons

Sources : PNG `lo02_uml Class diagram.png` + modèle Modelio (`LO02_UML`, lu sans le modifier).
Notre version corrigée : `doc/uml/classes-v2.puml` (rendu `classes-v2.png`).

## 0. Comment lire `classes-v2.png`

Le schéma se lit **de haut en bas**, en trois blocs. Les couleurs indiquent les patrons (légende en bas à droite).

1. **Haut : `Partie` (rouge, Singleton)** : le chef d'orchestre. Elle *possède* 9 `Borne`, la `Pioche` et la `Defausse` (losange plein = composition) et *regroupe* 2 `Joueur` (losange vide).
2. **Gauche : les joueurs.** `Joueur` est abstrait ; `JoueurPhysique` et `JoueurVirtuel` en héritent (flèche à triangle). Le virtuel *a une* `Strategie` (bleu), interface réalisée par `StrategieDefensive` et `StrategieOffensive`.
3. **Droite et bas : les cartes.** `Carte` est la racine ; `CarteClan`, `CarteExtension` et `CarteTactique` en héritent, et `CarteTactique` se découpe en `TroupeElite`, `ModeCombat`, `Ruse`.

Les deux énumérations (`Combinaison`, `Couleur`) sont de simples listes de valeurs. `Combinaison.determiner(cartes)` reconnaît la formation d'une liste de cartes.

**Bilan de complexité** : v1 = 16 éléments, v2 = 19. Ajouts : `Combinaison`, `Couleur` (indispensable, déjà utilisée par v1), `TroupeElite`, `ModeCombat`, `Ruse`.
Si on devait simplifier encore : on peut regrouper `TroupeElite`/`ModeCombat`/`Ruse` en une seule `CarteTactique` ; c'est le premier candidat, mais on perd en qualité de conception.

## 1. Ce qui est solide (à valoriser en soutenance)

| Choix | Pourquoi il se défend |
|---|---|
| `Joueur` abstraite + `JoueurPhysique` / `JoueurVirtuel` | Le sujet impose joueurs physiques ou virtuels, combinables : un seul type `Joueur` côté `Partie`. |
| **Stratégie** : interface `Strategie` + 2 réalisations, injectée dans `JoueurVirtuel` via `definirStrategie` | Comportement interchangeable à l'exécution ; ajouter une stratégie = ajouter une classe, sans toucher au reste (ouvert/fermé). |
| **Singleton** sur `Partie` | Une seule partie en cours, accessible partout. |
| Hiérarchie `Carte` → `CarteClan` / `CarteTactique` / `CarteExtension` | Les extensions (nouvelles cartes) s'ajoutent par sous-classe. |
| Composition `Partie` ◆ `Borne`/`Pioche`/`Defausse` ; agrégation `Joueur` ◇ `Carte` | Cycle de vie cohérent : les bornes n'existent pas sans partie ; les cartes survivent à une main. |
| `Pioche` 1..2 | Correct : pioche Clan + pioche Tactique en variante tactique. |
| `Borne` → `Carte` 0..8 | Correct : 3 cartes par camp, **4** avec Combat de Boue. |
| `Joueur` → `Carte` main 0..7 | Correct : 6 cartes de base, 7 en variante tactique. |

## 2. Corrections (vérifiées dans le modèle Modelio)

Triées par impact sur la note (conception = 35 %, UML = 8 %).

**Haute priorité (conception)**
1. **Pas de polymorphisme sur le tour de jeu.** `JoueurVirtuel` a `jouerTourJoueurVirtuel()`, `JoueurPhysique` n'a rien. `Partie` devrait faire des `instanceof`. → méthode abstraite `Joueur.jouerTour(Partie)` redéfinie dans les deux sous-classes (v2).
2. **Cartes Tactique : une seule classe pour 9 cartes de 3 catégories** aux comportements très différents (troupes d'élite jouées comme une Clan, modes de combat qui changent les règles d'une Borne, ruses qui agissent sur Partie/Défausse). → `TroupeElite`, `ModeCombat`, `Ruse` (v2).
3. **Les combinaisons n'existent pas dans le modèle.** Les 5 combinaisons (suite couleur > brelan > couleur > suite > somme) sont enfouies dans `Borne.evaluerGagnant()`. → énumération `Combinaison` avec `determiner(cartes)` (v2).
4. **Fabrique et Visiteur** : une première version de la v2 les ajoutait. La version finale du sujet les barre (seuls Singleton et Stratégie sont à étudier) : ils sont retirés du modèle et évoqués en « Pour aller plus loin » (§3).

**Moyenne (cohérence)**
5. `Carte` n'est pas abstraite dans le modèle (`IsAbstract=false`) alors qu'on n'instancie jamais une `Carte` brute. → abstraite.
6. `Couleur` est utilisée par `CarteClan` mais **n'existe pas** comme classe. → énumération.
7. `Partie` : `changerTour()` apparaît deux fois, et `partie()` devrait être le **constructeur privé** `- Partie()` du Singleton. `varianteTactique()` porte le nom d'un attribut : c'est un booléen.
8. `Borne.estPleine` : la capacité dépend du mode de combat (3 ou 4) → `Borne` doit connaître son `ModeCombat` (0..1) (v2).

**Basse (convention)**
9. Accents dans les noms de classes (`StratégieDéfensive`) mélangés à `Strategie` : conventions Oracle et portabilité → sans accents partout.
10. `Strategie` renvoie la carte et la borne en deux appels séparés : risque d'incohérence (carte non jouable sur la borne choisie). À garder en tête au développement (conclusion de la soutenance).

## 3. Étude des patrons (Singleton et Stratégie, version finale du sujet)

### Singleton : « une seule instance, accessible partout »
- **Où** : `Partie`. Constructeur privé, attribut statique `instance`, `getInstance()`.
- **Pourquoi** : une application = une partie à la fois ; évite de passer la partie partout.
- **Limites à annoncer (le jury les attend)** :
  - **Tests** : état global partagé entre tests → prévoir une méthode de réinitialisation.
  - **Sauvegarde** : charger une partie désérialisée crée une 2e instance et casse le Singleton. Deux issues : `readResolve()` ou, mieux, `charger()` restaure l'état *dans* l'instance existante.
  - **Concurrence** : non nécessaire (jeu mono-fil) ; sinon initialisation paresseuse synchronisée.

### Stratégie : « algorithme interchangeable »
- **Où** : `Strategie` ← `StrategieDefensive` / `StrategieOffensive`, utilisée par `JoueurVirtuel`.
- **Pourquoi** : le sujet exige une stratégie simple mais cohérente pour le joueur virtuel ; on change de stratégie à l'exécution (`definirStrategie`) et on ajoute une stratégie sans modifier `JoueurVirtuel`.
- **Défensive** : renforce les bornes déjà engagées, revendique prudemment. **Offensive** : vise les bornes de l'adversaire et les combinaisons fortes.

### Pour aller plus loin : Fabrique et Visiteur (hors sujet, non modélisés)
Étudiés puis retirés, car la version finale du sujet les barre et pour garder un diagramme simple.
- **Fabrique** : une classe `FabriqueCartes` (fabrique simple) créerait les 54 cartes Clan, les cartes Tactique et les cartes d'extension selon les options. Sans elle, `Partie.initialiserPartie()` construit les cartes elle-même. À extraire si les extensions se multiplient.
- **Visiteur** : `Carte.accepter(VisiteurCarte)` et un `EvaluateurCombinaison` éviteraient les tests de type pour évaluer une formation (Clan : sa force ; Joker : valeur choisie). Sans lui, `Combinaison.determiner` s'appuie sur les méthodes des cartes. Pertinent s'il y a plusieurs opérations sur la hiérarchie (sauvegarde, affichage) ; inconvénient : toute nouvelle classe de carte oblige à modifier les visiteurs.

## 4. Pour la conclusion de soutenance

- **Sûr** : hiérarchie Joueur, Strategie, structure Partie/Borne/Pioche/Défausse, énumérations.
- **Susceptible de changer au développement** : signature de `Strategie` (carte + borne en un coup), détail des effets de ruses, mécanisme de sauvegarde (Singleton vs désérialisation), répartition exacte des méthodes entre `Partie` et `Joueur`.
