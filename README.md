# Schotten Totten - LO02 Project A26

Implémentation électronique du jeu de cartes **Schotten Totten** en Java avec interface graphique.

## 🎮 Objectif

Concevoir et développer une application permettant de jouer à Schotten Totten à deux joueurs (physiques ou virtuels). Le projet couvre la modélisation UML, le développement du moteur de jeu et l'intégration d'une interface graphique.

## 📋 Structure du projet

```
src/                 # Code source Java
classes/             # Classes compilées
doc/                 # Documentation, audit du diagramme, état actuel
├── uml/                 # Diagrammes PlantUML : classes v2 et séquences (+ PNG/SVG)
└── current-state.md     # État actuel de l'implémentation
presentation/        # Diaporama HTML de la soutenance 1 (publié sur GitHub Pages)
```

## 🚀 Phases du projet

| Phase | Description | Soutenance | Statut |
|-------|-------------|-----------|--------|
| **1** | Modélisation UML | semaine du 19 octobre 2026 | ✅ prête ([diaporama](https://lelio88.github.io/lo02-schotten-totten-soutenance/)) |
| **2** | Moteur du jeu (CLI) | 14 décembre 2026 | ⏳ |
| **3** | Interface graphique | 4 janvier 2027 | ⏳ |

**Deadline remise fichiers :** Vendredi 15 janvier 2027

## 📐 Critères d'évaluation

- **Couverture des fonctionnalités** : 33%
- **Choix de conception** (classes, patterns, extensibilité) : 35%
- **Diagramme UML** : 8%
- **Javadoc et conventions de code** : 9%
- **Interface graphique** : 15%

## 🎯 Prérequis

- **Langage** : Java (JDK 11+)
- **Modeleur UML** : Libre (Modelio, ArgoUML, etc.)
- **IDE recommandé** : IntelliJ IDEA ou Eclipse

## 📝 Conventions

- **Documentation** : Javadoc obligatoire pour tous les éléments publics
- **Code** : Conventions Oracle (nommage, indentation, blocs, casse)
- **Aucun code obsolète** : Les fichiers sources ne doivent contenir que du code actif
- **Diagrammes** : Présentez les versions initiale et finale avec justifications des changements

## 📖 Ressources

- **Règles du jeu** : Voir `Consignes.pdf` (annexe)
- **Patterns recommandés** : Singleton, Stratégie (Fabrique et Visiteur écartés par la version finale du sujet)
- **Extension possibles** : Nouvelles cartes à concevoir et implémenter

## ⚙️ Architecture

L'architecture respecte les principes OO :
- **Modularité** : Composants indépendants liés par des relations explicites
- **Extensibilité** : Règles du jeu séparées de l'implémentation des cartes
- **Sauvegarde** : Possibilité de sauvegarder/charger une partie en cours

## 🔗 Contact

**Intervenant TP** : Votre interlocuteur exclusif pour toute question relative au projet
