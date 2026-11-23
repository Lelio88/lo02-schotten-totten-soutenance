# Répartition des tâches

Voici la répartition que je propose pour Pierre et moi. L'unité est le point : 1 point correspond
à peu près à une demi-journée de travail. Ce sont des estimations, à revoir ensemble à chaque
jalon. Chaque tâche inclut ses tests unitaires et sa Javadoc.

## Phase 2 : moteur en ligne de commande (soutenance du 14 décembre)

| Lelio : règles du jeu | Pts | Pierre : acteurs et interface | Pts |
|---|---|---|---|
| Borne, Pioche, Défausse | 4 | Hiérarchie `Carte`, `CarteClan`, `Couleur`, `TroupeElite` | 3 |
| Combinaisons et départage | 5 | `Joueur`, `JoueurPhysique`, `JoueurVirtuel` | 4 |
| Revendication, y compris la preuve d'imbattabilité | 6 | Stratégies défensive et offensive | 5 |
| `Partie` (Singleton), tours, fin de partie | 5 | Vue CLI : menu, affichage, saisie | 6 |
| Cartes `ModeCombat` et `Ruse`, variante tactique | 6 | Sauvegarde et chargement | 4 |
| `Main` et partie complète de bout en bout | 2 | Extensions : conception, implémentation, choix au démarrage | 5 |
| | | `doc/current-state.md` et UML de la phase 2 | 1 |
| **Total** | **28** | **Total** | **28** |

## Phase 3 : interface graphique Swing (soutenance du 4 janvier)

| Lelio | Pts | Pierre | Pts |
|---|---|---|---|
| Contrôleur et Observer (modèle vers vues) | 5 | Écran de configuration : joueurs, stratégies, extensions, variantes | 4 |
| Fenêtre principale : bornes, cartes posées, revendication | 6 | Zone joueur : main, sélection carte/borne, pioche, défausse, tactiques | 6 |
| CLI et GUI dans la même partie (synchronisation, thread Swing) | 3 | Sauvegarde et chargement depuis la GUI, erreurs, fin de partie | 3 |
| | | Branchement de la CLI sur le contrôleur et l'Observer | 2 |
| **Total** | **14** | **Total** | **15** |

## Remise (vendredi 15 janvier)

| Lelio | Pts | Pierre | Pts |
|---|---|---|---|
| Diagramme de classes final et justification des changements entre la version initiale et la version finale | 3 | Relecture de la Javadoc et des conventions (Checkstyle) | 3 |
| Relecture croisée du code de Pierre | 2 | État final de l'application et archive ZIP | 2 |

**Total sur le projet : Lelio 47 points, Pierre 48 points.**

## Avant de coder

- On passe une heure ensemble pour figer les signatures publiques de `Carte`, `Borne`, `Joueur`,
  `Strategie`, `Partie` et de l'Observer. Tout le reste en dépend.
- Dans la première semaine, on fusionne en priorité le plateau (Lelio) et les cartes et joueurs
  (Pierre) : les stratégies et la CLI ne peuvent pas avancer sans eux.
- Le flux Git et les règles de code sont dans [CONTRIBUTING.md](../CONTRIBUTING.md).

## Logique de construction

J'ai découpé par **blocs de packages**, pas par type de tâche. Chacun garde un bloc cohérent de
bout en bout : le code, ses tests et sa Javadoc. Ce choix évite que l'un écrive tout le code
pendant que l'autre ne fait que de la documentation, et il limite les conflits Git, puisqu'un
package n'a qu'un seul propriétaire.

Les deux blocs sont regroupés par thème :

- **Moi : les règles du jeu.** Plateau, combinaisons, revendication, déroulement de la partie,
  puis en phase 3 le contrôleur et la fenêtre du plateau. C'est la partie algorithmique, celle qui
  porte les choix de conception.
- **Pierre : les acteurs et ce qui touche l'utilisateur.** Cartes, joueurs, stratégies, CLI,
  sauvegarde, extensions, puis en phase 3 l'écran de configuration et la zone du joueur. C'est la
  partie la plus large.

L'équilibre n'est pas une égalité forcée sur le total. J'ai estimé chaque tâche, vérifié
l'équilibre phase par phase, puis déplacé quelques tâches vers le côté le plus léger : les
extensions, la sauvegarde, le branchement de la CLI et les documents de phase sont chez Pierre
pour compenser le côté « règles ». Le résultat est 28 contre 28 en phase 2, 14 contre 15 en
phase 3 et 5 contre 5 pour la remise.

Ces points restent des estimations, pas des mesures. Le côté « règles » est le plus difficile à
estimer, notamment la preuve d'imbattabilité de la revendication. Si l'écart se creuse, on
rééquilibre à chaque jalon en échangeant des tâches plutôt qu'en laissant l'un dépasser l'autre.
