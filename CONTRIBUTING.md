# Travailler à deux sur le projet

## Mise en route

Prérequis : un JDK 11 ou plus (le projet est compilé en Java 11). Maven n'est pas à installer : le
dépôt embarque le Maven Wrapper.

```bash
git clone https://github.com/Lelio88/lo02-schotten-totten-soutenance.git
cd lo02-schotten-totten-soutenance
./mvnw verify          # compile dans classes/ et lance les tests (Windows : mvnw.cmd verify)
```

| Commande | Effet |
|----------|-------|
| `./mvnw compile` | Compile les sources de `src/` vers `classes/` |
| `./mvnw test` | Lance les tests JUnit 5 de `test/` |
| `./mvnw javadoc:javadoc` | Génère `doc/javadoc/` ; échoue si un élément public n'est pas documenté |
| `./mvnw checkstyle:check` | Signale les écarts aux conventions Oracle (non bloquant) |

## Organisation du code

```
src/schottentotten/      sources, un package par responsabilité (voir les package-info.java)
test/schottentotten/     tests, même arborescence que src/
classes/                 classes compilées (générées, non versionnées)
doc/                     diagrammes UML, état actuel de l'application, Javadoc générée
```

Le modèle (`modele`) ne dépend jamais des vues (`vue`) : c'est ce qui permet de jouer en ligne de
commande et en interface graphique dans la même partie.

## Flux Git

- `main` reste toujours compilable. On n'y pousse pas directement : une branche par tâche, une
  pull request, relue par l'autre membre du binôme avant fusion.
- Branches : `feature/<sujet>`, `fix/<sujet>`, `docs/<sujet>`.
- Commits en français au format `type: description` (types : feat, fix, refactor, docs, test, chore).
- Avant d'ouvrir une PR : `git pull --rebase origin main` puis `./mvnw verify`.
- Un seul propriétaire par classe à un instant donné pour éviter les conflits ; on se prévient avant
  de toucher au code de l'autre.

## Règles de code

- Javadoc sur chaque classe, méthode et attribut publics, et un `package-info.java` par package.
- Conventions Oracle : nommage (camelCase, PascalCase, UPPER_SNAKE_CASE), indentation de 4 espaces.
- Aucun code mort ni code commenté dans les sources.
- Aucune règle du jeu ni donnée de carte en dur sous forme de chaîne : classes ou énumérations.
- Tout changement du modèle met à jour `doc/uml/` et `doc/current-state.md` dans le même commit.
