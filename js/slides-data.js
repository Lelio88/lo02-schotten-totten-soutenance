/**
 * Notes du présentateur, affichées dans presenter.html (jamais sur l'écran public).
 *
 * Pour chaque slide : titre, `notes` (notes[0] = ouverture de la slide, notes[k] = ce qu'on dit
 * quand la k-ième étape apparaît) et `qa` (questions probables du jury, avec une réponse).
 * Invariant : l'ordre et le nombre de slides doivent suivre index.html.
 */
window.SLIDES = [
  {
    title: "Titre",
    notes: [
      "Bonjour. Nous présentons la phase 1 du projet LO02 : la modélisation UML de Schotten Totten. Nous suivons le plan demandé : introduction, diagramme de classes, diagramme de séquence, conclusion.",
    ],
  },
  {
    title: "Plan",
    notes: [
      "Quatre temps, dont deux grandes parties.",
      "D'abord une introduction : ce que nous avons compris du sujet.",
      "Partie I : le diagramme de classes, avec l'étude des quatre patrons demandés.",
      "Partie II : les diagrammes de séquence, centrés sur un tour de jeu.",
      "Enfin la conclusion : ce qui est sûr, et ce qui peut changer quand nous développerons.",
    ],
  },
  {
    title: "Le projet tel que compris",
    notes: [
      "Voici le projet tel que nous l'avons compris.",
      "Un jeu à deux joueurs. Chacun peut être physique ou virtuel : les combinaisons sont possibles.",
      "Le joueur virtuel doit suivre une stratégie simple mais cohérente.",
      "Le moteur sera d'abord testable en ligne de commande, puis une interface graphique en MVC avec deux vues concurrentes. Le modèle ne doit donc rien savoir de l'interface.",
      "Les extensions sont de nouvelles cartes, activées au début de la partie.",
      "Toutes les variantes sont à intégrer sauf « Experts » : nous modélisons donc la variante tactique.",
      "Sauvegarde et reprise, et une architecture modulaire et extensible : c'est ce qui guide nos choix de conception.",
      "Phase 1 : cette soutenance.",
      "Phase 2 : le cœur de l'application en ligne de commande, le 14 décembre.",
      "Phase 3 : l'interface graphique, le 4 janvier.",
      "Remise des fichiers le 15 janvier.",
    ],
  },
  {
    title: "Le jeu en une image",
    notes: [
      "Rappel des règles utiles à la modélisation.",
      "Neuf bornes forment la frontière. Chaque camp peut poser jusqu'à trois cartes devant une borne.",
      "À son tour : poser une carte, revendiquer les bornes dont on bat l'adversaire, puis piocher pour revenir à six cartes.",
      "Une borne se gagne avec la meilleure formation de trois cartes : suite couleur, brelan, couleur, suite, somme. C'est ce qui justifie une énumération Combinaison.",
      "On gagne avec cinq bornes, ou trois bornes adjacentes.",
    ],
  },
  {
    title: "Des besoins aux choix de conception",
    notes: [
      "Le lien entre le sujet et nos patrons : chacun répond à un besoin précis.",
      "Joueur physique ou virtuel : classe abstraite Joueur, et Stratégie pour le virtuel.",
      "Variantes et extensions : une hiérarchie de cartes, et une Fabrique pour les créer selon les options.",
      "Les formations et les effets évoluent : une énumération Combinaison et un Visiteur pour l'évaluation.",
      "Une seule partie sauvegardable : Singleton.",
      "Nous n'avons pas ajouté de patron pour le principe : chacun est justifié par un besoin du sujet.",
    ],
    qa: [{ q: "Pourquoi quatre patrons ?", a: "Le sujet demande de les étudier ; nous les utilisons là où un besoin le justifie, et nous disons où ils ne servent pas (par exemple le Visiteur n'est pas utilisé pour appliquerEffet)." }],
  },
  {
    title: "I · Diagramme de classes",
    notes: ["Première partie : le diagramme de classes. Il répond à la question « de quoi est fait le logiciel ? »."],
  },
  {
    title: "Vue d'ensemble du diagramme",
    notes: [
      "Vue d'ensemble : 22 éléments. Les couleurs indiquent les patrons : rouge Singleton, bleu Stratégie, vert Fabrique, jaune Visiteur. Nous allons zoomer sur chaque bloc.",
      "Le plateau : la Partie possède neuf Bornes, une Pioche et une Défausse.",
      "Les joueurs : physiques ou virtuels, le virtuel étant piloté par une Stratégie.",
      "Les cartes : Clan, Tactique en trois catégories, et Extension.",
      "Deux blocs annexes : la Fabrique crée les cartes, le Visiteur évalue les formations.",
    ],
    qa: [{ q: "Pourquoi 22 classes, n'est-ce pas trop ?", a: "Notre base en comptait 16. Nous avons ajouté 8 éléments, dont 2 énumérations. Le seul point où l'on pourrait simplifier est le découpage des cartes tactiques, mais il reflète les 3 catégories des règles." }],
  },
  {
    title: "Le plateau de jeu",
    notes: [
      "Le plateau de jeu.",
      "Partie est le chef d'orchestre : elle initialise, enchaîne les tours, vérifie la fin et gère la sauvegarde. C'est notre Singleton.",
      "Borne : une des neuf tuiles. Elle connaît les cartes de chaque camp, sait être revendiquée et évaluée. Jusqu'à 8 cartes au total : 3 par camp, 4 avec le Combat de Boue.",
      "Pioche : mélanger, tirer, savoir si elle est vide. Il y en a une ou deux, car la variante tactique ajoute une pioche de cartes Tactique.",
      "Défausse : les cartes écartées par les ruses, consultables à tout moment.",
      "Combinaison : l'énumération des cinq formations, de la plus forte à la plus faible.",
      "Composition pour ce qui n'existe pas sans la partie, agrégation pour les cartes qui survivent à une main ou une pioche.",
    ],
    qa: [{ q: "Pourquoi composition et pas agrégation pour la Pioche ?", a: "Sans partie, une pioche n'a plus de sens ; les cartes, elles, sont agrégées car elles existent indépendamment de leur conteneur." }],
  },
  {
    title: "Les joueurs",
    notes: [
      "Les joueurs.",
      "Joueur est abstraite. Sa méthode jouerTour est abstraite : chaque type de joueur décide comment il joue.",
      "Le joueur physique reçoit ses choix de l'utilisateur, via le contrôleur. Les interfaces ne sont pas modélisées, comme le demande le sujet.",
      "Le joueur virtuel délègue ses choix à une Stratégie, qu'on peut changer en cours de partie.",
      "La main contient 0 à 7 cartes : six de base, sept en variante tactique.",
      "Le polymorphisme : la Partie appelle jouerTour sans savoir quel type de joueur elle manipule. C'est une correction par rapport à notre première version.",
    ],
    qa: [{ q: "Pourquoi JoueurPhysique est presque vide ?", a: "Ses choix viennent de l'extérieur (la vue). Le modèle ne doit pas connaître l'interface : c'est la séparation modèle/vue demandée pour le MVC de la phase 3." }],
  },
  {
    title: "Les cartes",
    notes: [
      "Les cartes.",
      "Carte est abstraite : elle sait si elle est jouable sur une borne et accepte un visiteur.",
      "CarteClan : une couleur et une force de 1 à 9, soit 54 cartes. La couleur est une énumération.",
      "CarteTactique est abstraite : elle porte l'effet spécial.",
      "TroupeElite : Joker, Espion, Porte-Bouclier. Elles se jouent comme une carte Clan, mais leur valeur est choisie à la revendication.",
      "ModeCombat : Colin-Maillard et Combat de Boue modifient la règle d'une borne.",
      "Ruse : Chasseur de tête, Stratège, Banshee, Traître agissent sur la partie.",
      "CarteExtension : le point d'accroche des futures extensions, sans modifier le reste.",
    ],
    qa: [{ q: "Pourquoi trois sous-classes de CarteTactique ?", a: "Les règles distinguent trois catégories aux comportements très différents : troupes d'élite jouées comme une carte Clan, modes de combat qui changent une borne, ruses qui agissent sur la partie." }],
  },
  {
    title: "Patron : Singleton",
    notes: [
      "Premier patron : Singleton.",
      "Le problème : une seule partie à la fois, accessible depuis le moteur comme depuis les vues.",
      "La solution : constructeur privé, attribut statique instance, accès par getInstance.",
      "Première limite : les tests. L'état est global, donc il faut pouvoir réinitialiser entre deux tests.",
      "Deuxième limite, plus importante : la sauvegarde. Recharger une partie sérialisée créerait une deuxième instance et casserait le Singleton. Notre choix : charger() restaure l'état dans l'instance existante.",
    ],
    qa: [
      { q: "Pourquoi pas un Singleton thread-safe ?", a: "Le jeu est mono-fil et l'interface graphique ne lance pas plusieurs parties. Si besoin, on passerait à une initialisation synchronisée." },
      { q: "Quelle alternative au Singleton ?", a: "Passer la Partie en paramètre. C'est plus testable mais alourdit toutes les signatures ; le sujet ne prévoit qu'une partie en cours." },
    ],
  },
  {
    title: "Patron : Stratégie",
    notes: [
      "Deuxième patron : Stratégie.",
      "Le problème : le joueur virtuel doit choisir quoi jouer, avec une stratégie simple, cohérente et interchangeable.",
      "La solution : une interface Strategie avec deux méthodes, choisir la carte et choisir la borne cible. JoueurVirtuel la détient et lui délègue.",
      "La stratégie défensive renforce les bornes déjà engagées et ne revendique que quand elle est sûre.",
      "L'offensive joue ses cartes fortes sur les bornes adverses et revendique dès que possible. Ce sont nos intentions, qui seront affinées en phase 2.",
      "L'intérêt : ajouter une stratégie, c'est ajouter une classe.",
      "Point de vigilance : choisir la carte et la borne en deux appels peut donner un couple incohérent. Nous le regrouperons peut-être en un seul coup.",
    ],
    qa: [{ q: "Pourquoi une interface et pas une classe abstraite ?", a: "Les stratégies n'ont pas de code commun à factoriser ; une interface exprime juste le contrat et laisse la liberté d'héritage." }],
  },
  {
    title: "Patron : Fabrique",
    notes: [
      "Troisième patron : Fabrique.",
      "Le problème : créer 54 cartes Clan, 10 Tactique et des cartes d'extension selon les options, sans que Partie connaisse chaque classe.",
      "La solution : FabriqueCartes avec trois méthodes de création.",
      "Partie les appelle selon la variante tactique et les extensions activées.",
      "Un choix de simplicité : une fabrique simple, pas une hiérarchie de fabriques. Trois classes de plus pour peu de gain. Si les extensions se multiplient, on extraira une interface.",
    ],
    qa: [{ q: "Pourquoi pas une Fabrique abstraite ?", a: "Il n'y a pas de familles d'objets à produire de façon cohérente. Une fabrique simple suffit et reste évolutive." }],
  },
  {
    title: "Patron : Visiteur",
    notes: [
      "Quatrième patron : Visiteur.",
      "Le problème : ce qu'une carte vaut dans une formation dépend de son type. Sans patron, Borne contiendrait une cascade d'instanceof.",
      "La solution : accepter appelle visiter(this) ; le type réel de la carte choisit la méthode. C'est le double dispatch.",
      "EvaluateurCombinaison concentre la logique et produit une Combinaison.",
      "Une nouvelle opération, comme la sauvegarde ou l'affichage, devient un nouveau visiteur sans toucher aux cartes.",
      "La contrepartie, que nous assumons : ajouter une nouvelle classe de carte oblige à modifier les visiteurs. Acceptable car les types de cartes sont stables. Et nous n'utilisons pas le Visiteur pour appliquerEffet : une seule opération par type, le polymorphisme suffit.",
    ],
    qa: [
      { q: "Pourquoi un Visiteur ici ?", a: "Parce que plusieurs opérations portent sur la hiérarchie de cartes (évaluation, sauvegarde, affichage) et que les types de cartes sont stables." },
      { q: "Quel est son défaut ?", a: "Ajouter une classe de carte force à modifier tous les visiteurs." },
    ],
  },
  {
    title: "De la version 1 à la version 2",
    notes: [
      "Du diagramme initial au diagramme final : ce que nous avons conservé et changé.",
      "Nous gardons les bases : Joueur abstrait, Stratégie, Singleton, structure du plateau. Les multiplicités sont justifiées par les règles.",
      "Le tour de jeu devient polymorphe : jouerTour abstraite sur Joueur.",
      "Les cartes Tactique sont découpées selon les trois catégories des règles.",
      "Combinaison et Couleur deviennent des énumérations ; Carte devient abstraite.",
      "Nettoyage : constructeur privé, doublon supprimé, noms sans accents conformément aux conventions Oracle.",
      "Et nous ajoutons les patrons Fabrique et Visiteur.",
    ],
  },
  {
    title: "II · Diagrammes de séquence",
    notes: ["Deuxième partie : les diagrammes de séquence. Ils répondent à « comment se déroule un tour ? »."],
  },
  {
    title: "Le scénario choisi",
    notes: [
      "Nous avons choisi le tour d'un joueur virtuel.",
      "Il traverse le moteur de bout en bout.",
      "Il met en jeu la Stratégie.",
      "Deux diagrammes compagnons détaillent l'évaluation d'une borne et l'initialisation d'une partie, pour couvrir Visiteur, Singleton et Fabrique.",
      "Un mot sur la notation : une ligne de vie est un objet pendant le scénario.",
      "Une flèche pleine est un appel de méthode.",
      "Une flèche pointillée est une valeur retournée.",
      "alt, opt et loop expriment les conditions et les répétitions.",
      "ref renvoie vers un autre diagramme.",
    ],
  },
  {
    title: "Séquence : le tour d'un joueur virtuel",
    notes: [
      "Le diagramme principal : un tour d'un joueur virtuel.",
      "Un : la Partie demande à JoueurVirtuel de jouer ; il délègue le choix de la carte et de la borne à sa Stratégie.",
      "Deux : si la carte est jouable sur cette borne, elle est posée ; sinon le joueur passe.",
      "Trois : pour chaque borne non revendiquée, il tente la revendication. Le détail de l'évaluation est dans le diagramme suivant.",
      "Quatre : si la pioche n'est pas vide, il pioche.",
      "Cinq : la Partie vérifie la fin, sinon elle change de joueur.",
    ],
    qa: [{ q: "Et pour un joueur physique ?", a: "Même séquence, sauf que les choix ne viennent pas d'une Stratégie mais de l'utilisateur via le contrôleur. C'est un alt possible, absent ici par choix de lisibilité." }],
  },
  {
    title: "Séquence : évaluation d'une borne",
    notes: [
      "Le détail référencé par le ref : l'évaluation d'une borne.",
      "La Borne crée un évaluateur et lui confie les cartes de chaque joueur.",
      "Pour chaque carte, accepter puis visiter : le type réel de la carte choisit la méthode. C'est le double dispatch.",
      "On compare : la formation la plus forte gagne ; en cas d'égalité, la somme, puis le premier à avoir posé trois cartes.",
    ],
  },
  {
    title: "Séquence : initialisation",
    notes: [
      "Le troisième diagramme : le démarrage d'une partie.",
      "getInstance crée la partie au premier appel puis renvoie toujours la même instance : c'est le Singleton.",
      "La fabrique produit les cartes Clan, et Tactique et Extension selon les options.",
      "On mélange et chaque joueur pioche six cartes, sept en variante tactique.",
    ],
  },
  {
    title: "Cohérence entre les diagrammes",
    notes: [
      "Un point de contrôle : chaque message des séquences correspond à une méthode du diagramme de classes.",
      "choisirCarteAJouer est sur Strategie.",
      "ajouterCarte et revendiquer sur Borne.",
      "tirerCarte et estVide sur Pioche.",
      "accepter et visiter sur Carte et VisiteurCarte.",
      "creerCartesClan sur FabriqueCartes.",
      "La règle : un message a vers b suppose une relation entre a et b, et la méthode dans b.",
    ],
  },
  {
    title: "Conclusion",
    notes: [
      "Pour conclure : ce qui est sûr, et ce qui peut changer.",
      "Sûr : les hiérarchies Joueur et Carte.",
      "Sûr : la structure du plateau.",
      "Sûr : le principe de la stratégie du joueur virtuel.",
      "Sûr : les énumérations.",
      "Peut changer : la signature de Strategie, avec un seul coup carte plus borne.",
      "Peut changer : le détail des effets des ruses et des modes de combat.",
      "Peut changer : la sauvegarde face au Singleton.",
      "Peut changer : la répartition fine des méthodes entre Partie et Joueur.",
    ],
  },
  {
    title: "Questions",
    notes: ["Merci. Prochaine étape : le cœur de l'application en ligne de commande. Nous sommes prêts pour vos questions."],
  },
];
