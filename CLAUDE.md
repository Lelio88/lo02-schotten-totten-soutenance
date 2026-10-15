# CLAUDE.md — Schotten Totten LO02 Project

## I. Finalité

Développer une implémentation complète du jeu de cartes **Schotten Totten** en Java, respectant les principes de conception orientée objet, avec modélisation UML, moteur de jeu fonctionnel et interface graphique Swing/JavaFX.

## II. Architecture

Le projet suit une architecture en couches :
1. **Domaine** (`domain/`) — Règles du jeu, modèle métier (Cartes, Bornes, Mains, Plateau)
2. **Application** (`application/`) — Moteur du jeu, orchestration des tours, stratégies joueurs
3. **Infrastructure** (`infrastructure/`) — Persistance (sauvegarde/chargement), interface CLI/GUI

Patterns clés : **Singleton** (`Partie`), **Stratégie** (`JoueurVirtuel` → `Strategie`), **Fabrique** (`FabriqueCartes`), **Visiteur** (`EvaluateurCombinaison` sur la hiérarchie `Carte`).
Modèle de référence : `doc/uml/classes-v2.puml` (v2 = base du binôme corrigée) + 3 diagrammes de séquence ; analyse dans `doc/audit-diagramme-classes.md`.

## III. Pile technologique

| Composant | Choix | Rationale |
|-----------|-------|-----------|
| **Langage** | Java 11+ | Requis par le projet ; supporte génériques et annotations |
| **Build** | Maven | Gestion dépendances, JUnit pour tests unitaires |
| **GUI** | JavaFX ou Swing | Recommandé pour portabilité ; Swing par défaut si léger |
| **UML** | Modelio / ArgoUML | Diagramme de classes initial + diagrammes de séquences |
| **VCS** | Git | Versioning de tout le code et des diagrammes |

## IV. Garde-fous non négociables

- ✅ **Javadoc obligatoire** : Chaque classe, méthode publique et attribut doit être commenté (respect conventions Oracle)
- ✅ **Code propre** : Pas de code mort ; conventions nommage Oracle (camelCase, PascalCase, UPPER_SNAKE_CASE)
- ✅ **Pas de hardcoding** : Règles du jeu et cartes définies via classes/énumérations, pas en chaînes littérales
- ✅ **Séparation des préoccupations** : Le moteur du jeu (domaine) ne doit pas connaître la GUI
- ✅ **Diagrammes à jour** : La version finale du diagramme UML doit refléter le code implémenté
- ✅ **État de l'app documenté** : Un fichier `doc/current-state.md` liste ce qui fonctionne / reste à faire

## V. Flux de travail (Explore → Plan → Code → Verify)

1. **Explore** : Analyser les consignes, comprendre les règles du jeu
2. **Plan** : Sketch UML initial, identifier les classes et relations, prévoir les extensions
3. **Code** : Développer par phase (Phase 1 = UML + CLI, Phase 2 = moteur, Phase 3 = GUI)
4. **Verify** : Tester chaque composant (tests unitaires), vérifier respect des conventions, mettre à jour diagrammes

## VI. Commandes de développement

```bash
# Compiler
javac -d classes src/**/*.java

# Tester (si JUnit installé)
mvn test

# Exécuter en ligne de commande
java -cp classes com.schottentotten.Main

# Générer documentation Javadoc
javadoc -d doc/javadoc -sourcepath src src/**/*.java

# Régénérer les diagrammes UML (jar PlantUML téléchargé hors du dépôt)
java -jar <chemin>/plantuml.jar -charset UTF-8 -tpng -tsvg doc/uml/*.puml

# Diaporama : régénérer les diagrammes intégrés, puis commit + push sur main
# (le workflow .github/workflows/pages.yml déploie presentation/ sur GitHub Pages)
node presentation/build/build-diagrams.mjs
```

## VII. Maintenance documentaire

**Règle d'or** : Chaque commit qui change l'architecture ou le domaine mettra **à jour l'UML et ce fichier** dans le même commit.

| Trigger | Action |
|---------|--------|
| Ajout d'une classe métier | Ajouter au diagramme UML et à `doc/current-state.md` |
| Nouvelle phase terminée | Mettre à jour le statut du tableau dans `README.md` |
| Pattern appliqué | Documenter dans un commentaire de classe (`// Singleton: instance unique du Plateau`) |
| Extension de règles | Ajouter une note à `doc/architecture.md` si créé |

## VIII. Contexte de session

**Dernier focus :** Phase 1 : diagramme de classes v2, 3 diagrammes de séquence, diaporama de soutenance publié  
**Focus immédiat :** Soutenance 1 (semaine du 19 octobre), puis Phase 2 : moteur de jeu en ligne de commande
