/*
  ART-CREAVISION® ACADEMY — Données du Module 1
  ================================================
  🔵 SOURCE  : contenu extrait tel quel de module-1-fondations.html (fichier verrouillé).
               Aucun paragraphe n'a été réécrit, résumé ou inventé. Seule la présentation
               (balises de mise en forme -> classes CSS de ce design system) a été adaptée.
  🟣 ADDENDUM: contenu ajouté par la gouvernance ACV Academy (Addendum Q5 validé),
               clairement séparé et jamais fusionné avec le fichier source.

  Statuts d'objectifs (rappel de gouvernance — NE PAS MODIFIER SANS AUTORISATION) :
    O3 « biais »  : 🟠 NON COUVERT — ne jamais afficher comme couvert, ne jamais compléter ici.
    O4            : 🟢 COUVERT (Projet source, Q3 notamment)
    O5            : 🟢 COUVERT UNIQUEMENT PAR Projet source + Addendum Q5 validé
                     (Projet source seul = 🟡 PARTIEL — ne jamais présenter Q1 seul comme suffisant)
*/
(function (global) {
  "use strict";

  var M1 = {
    id: "m1",
    source: "module-1-fondations.html",
    title: "Module 1 — Fondations de l'IA générative",
    subtitle:
      "Niveau 1 · COMPRENDRE — Premier module du parcours. Aucun outil n'est manipulé ici : ce module pose le socle conceptuel, le vocabulaire commun et le cadre de responsabilité sur lesquels reposent les modules suivants.",
    meta: {
      lessons: 3,
      duree: "3 à 4 h",
      prerequis: "Aucun",
      statut: "Version 1 — soumis à contrôle qualité"
    },

    objectifs: [
      { id: "O1", tag: null, text: "Comprendre ce qu'est l'IA générative et en quoi elle diffère d'une IA de reconnaissance ou de classement (l'IA « discriminative »)." },
      { id: "O2", tag: null, text: "Comprendre, sans jargon mathématique, comment un modèle génératif produit du texte, une image, une voix ou une musique — et pourquoi il se trompe parfois avec assurance." },
      { id: "O3", tag: "partial-gap", text: "Acquérir le vocabulaire commun utilisé dans les modules suivants : modèle, poids, token, prompt, génération, fine-tuning, hallucination, biais, fenêtre de contexte." },
      { id: "O4", tag: "covered", text: "Comprendre le cadre général des droits, licences et responsabilités liés à l'usage professionnel de l'IA générative." },
      { id: "O5", tag: "covered-addendum", text: "Être capable de justifier, dans un brief client, pourquoi et quand recourir à l'IA générative — et quand ne pas y recourir." }
    ],

    competences: [
      { competence: "Expliquer l'IA générative en langage clair à un client non technique", niveau: "Autonome", verifiable: "Exercice pratique + projet du module" },
      { competence: "Repérer une hallucination ou une affirmation non vérifiée dans une sortie IA", niveau: "Autonome", verifiable: "Travail pratique" },
      { competence: "Identifier un risque de conformité avant de livrer un contenu généré par IA", niveau: "Assisté", verifiable: "Projet du module" },
      { competence: "Utiliser le vocabulaire du module dans une conversation professionnelle", niveau: "Autonome", verifiable: "Quiz + échanges en session" }
    ],

    prerequisText:
      "Aucun prérequis technique. Ce module s'adresse à un débutant complet : savoir utiliser un navigateur web et créer un compte en ligne suffit. Aucune notion de code, de mathématiques ou de design n'est nécessaire.",

    intro: {
      paragraphs: [
        "« J'apprends à créer avec l'IA » — la promesse d'ART-CREAVISION® ACADEMY commence ici, volontairement loin de tout outil. Avant de générer une seule image, la première compétence professionnelle à acquérir est de comprendre ce que l'on manipule. Ce n'est pas une précaution académique : c'est une protection commerciale directe.",
        "Prenez un exemple réel, vérifié à la source le 31 août 2026 : selon le centre d'aide officiel d'OpenAI, les expériences web et application de Sora — son outil de génération vidéo — ont été discontinuées le 26 avril 2026, moins de six mois après leur lancement public, et son API sera arrêtée le 24 septembre 2026. Un créateur qui aurait appris « Sora » plutôt que « la génération vidéo par IA » se retrouverait aujourd'hui sans compétence transférable. Ce module vous enseigne l'inverse : des principes qui restent vrais quel que soit l'outil qui domine le marché dans six mois."
      ],
      callout: {
        label: "Ce que ce module n'est pas",
        html: "Ce n'est pas un cours d'histoire de l'intelligence artificielle, ni un cours de programmation. C'est un cours de <span class=\"hl\">littératie professionnelle</span> : la capacité à comprendre, expliquer et utiliser l'IA générative avec discernement, dans un contexte de production commerciale."
      }
    },

    lecons: [
      {
        id: "m1-l1",
        code: "Leçon 1.1",
        titre: "Qu'est-ce que l'IA générative ?",
        locked: true,
        explication: [
          "Une intelligence artificielle « classique » — dite <span class=\"hl\">discriminative</span> — répond à une question fermée : « Est-ce un chat ou un chien ? », « Ce mail est-il un spam ? », « Ce visage correspond-il à celui-ci ? ». Elle trie, classe, reconnaît. Une IA <span class=\"hl\">générative</span> répond à une question ouverte : « Écris-moi… », « Dessine-moi… », « Compose-moi… ». Elle ne choisit pas parmi des options existantes : elle produit une séquence entièrement nouvelle, token par token pour un texte, pixel par pixel (ou plus exactement, étape de débruitage par étape de débruitage) pour une image.",
          "Pensez à un chef cuisinier qui a goûté et décomposé des dizaines de milliers de plats au cours de sa carrière. Il n'a mémorisé aucune recette mot pour mot ; il a intégré des régularités : quelles saveurs s'accordent, quelles textures se complètent, quelle structure fait qu'un plat « fonctionne ». Face à une demande nouvelle — « un dessert ivoirien revisité, sans sucre raffiné » —, il ne récite pas une fiche, il <em>compose</em> à partir de ces régularités. Un modèle génératif fait la même chose avec du texte, des images, de la voix ou de la musique : il a été entraîné sur d'immenses quantités d'exemples, en a extrait des régularités statistiques, et « compose » une suite plausible en réponse à une consigne — le <span class=\"hl\">prompt</span>."
        ],
        glossaire: [
          ["Modèle", "Le programme entraîné qui a appris ces régularités — ce que l'on interroge derrière une interface comme ChatGPT, Claude ou Midjourney."],
          ["Paramètres / poids", "Les réglages internes du modèle, ajustés pendant l'entraînement. On ne les manipule jamais directement en tant qu'utilisateur."],
          ["Token", "La plus petite unité de texte qu'un modèle de langage manipule — approximativement un mot ou un fragment de mot."],
          ["Prompt", "L'instruction donnée au modèle pour orienter sa génération. C'est l'objet central du Module 3."],
          ["Génération / inférence", "Le moment où le modèle produit une sortie à partir d'un prompt."],
          ["Fine-tuning", "Un réentraînement ciblé d'un modèle déjà entraîné, pour le spécialiser sur un usage précis — une opération réalisée par les éditeurs de l'outil, rarement par l'utilisateur final."]
        ],
        exemple: "Demandez à deux assistants conversationnels différents (par exemple ChatGPT et Claude) d'expliquer un même concept avec la même consigne. Les deux réponses seront différentes dans la formulation, parfois dans l'angle choisi, alors qu'aucune des deux n'a « cherché » la réponse quelque part : chacune l'a composée selon les régularités apprises par son propre modèle.",
        demonstration: "En session, projeter la même consigne envoyée simultanément à deux outils conversationnels et comparer les sorties en direct avec le groupe : vocabulaire choisi, longueur, angle, ton.",
        prompt: {
          label: "Prompt professionnel — à tester dans deux outils",
          text: "« Tu es un directeur artistique senior. Explique en 150 mots maximum la différence entre une photo argentique et une photo numérique, pour un client qui n'a aucune notion technique, sur un ton élégant et rassurant. »"
        },
        erreurs: [
          "Croire que le modèle « cherche » une réponse quelque part sur internet en temps réel (sauf lorsqu'un outil de recherche est explicitement activé).",
          "Confondre « générative » et « intelligente au sens humain » — le modèle compose des régularités, il ne raisonne pas comme une personne."
        ],
        bonnesPratiques: [
          "Toujours garder à l'esprit qu'une sortie générative est une <b>proposition plausible</b>, jamais une certitude par défaut.",
          "Tester la même consigne sur deux outils différents dès que le résultat compte pour un client — c'est un réflexe professionnel, pas une perte de temps."
        ]
      },
      {
        id: "m1-l2",
        code: "Leçon 1.2",
        titre: "Comment « pense » un modèle génératif : mécanismes, limites et hallucinations",
        locked: true,
        explication: [
          "Un modèle de langage génère un texte en prédisant, un token à la fois, le mot ou fragment de mot le plus statistiquement plausible compte tenu de tout ce qui précède. Il n'existe aucune étape où le modèle « vérifie » que ce qu'il vient d'écrire est factuellement vrai : il optimise la plausibilité de l'enchaînement, pas l'exactitude. C'est exactement pour cette raison qu'un modèle peut produire, avec la même assurance stylistique, une information exacte et une information inventée. Ce phénomène a un nom : l'<span class=\"hl\">hallucination</span>.",
          "Pour l'image, le principe diffère techniquement (un modèle de diffusion part d'un bruit visuel aléatoire et le « débruite » par étapes successives pour faire émerger une image cohérente avec le prompt) mais la leçon pédagogique est la même : le modèle produit ce qui est statistiquement cohérent avec ce qu'il a appris, pas ce qui est correct dans l'absolu. C'est pour cela qu'un modèle d'image peut, encore aujourd'hui, mal gérer certains détails anatomiques complexes ou incohérents dans une scène très chargée.",
          "Deux autres limites structurelles à connaître : la <span class=\"hl\">fenêtre de contexte</span> (la quantité d'information que le modèle peut « garder à l'esprit » en une seule conversation — au-delà, il commence à oublier le début) et la <span class=\"hl\">date de coupure des connaissances</span> (le modèle n'a pas connaissance des événements postérieurs à son entraînement, sauf s'il dispose d'un outil de recherche web actif)."
        ],
        glossaire: [],
        exemple: "Un modèle interrogé sur un fait très récent ou très pointu répondra souvent de façon fluide et confiante — même quand il invente. C'est la caractéristique la plus trompeuse de l'hallucination : elle ne « sonne » pas comme une erreur.",
        demonstration: "Demander à chaque apprenant d'inventer un nom de personne ou de lieu clairement fictif, puis d'interroger un assistant conversationnel sur sa biographie ou son histoire. Observer collectivement que le modèle peut produire une réponse détaillée et convaincante… entièrement inventée.",
        prompt: {
          label: "Prompt professionnel — démonstration d'hallucination",
          text: "« Présente-moi la biographie et les trois principales réalisations de [insérez un nom que vous venez d'inventer, clairement fictif]. »"
        },
        erreurs: [
          "Copier-coller une affirmation factuelle générée par IA dans un livrable client sans vérification indépendante.",
          "Croire qu'un ton confiant est un indicateur de fiabilité — c'est précisément l'inverse qui doit alerter.",
          "Ignorer la fenêtre de contexte et s'étonner qu'un assistant « oublie » une instruction donnée trop tôt dans un long échange."
        ],
        bonnesPratiques: [
          "Vérifier systématiquement tout nom propre, chiffre, date ou citation généré avant livraison client.",
          "Rappeler en début de conversation longue les éléments de contexte essentiels plutôt que de supposer qu'ils sont encore « en mémoire ».",
          "Utiliser les fonctions de recherche web intégrées lorsque l'exactitude factuelle est critique."
        ]
      },
      {
        id: "m1-l3",
        code: "Leçon 1.3",
        titre: "Droits, licences et usage responsable de l'IA générative",
        locked: true,
        explication: [
          "C'est la leçon la plus directement liée à votre future activité professionnelle : un contenu magnifique produit avec un outil dont vous n'avez pas vérifié les conditions d'usage peut devenir invendable, voire litigieux. Trois questions doivent devenir un réflexe avant tout usage commercial d'un outil d'IA générative :"
        ],
        questionsReflexes: [
          "<span class=\"hl\">Le contenu généré peut-il être utilisé commercialement ?</span> — Beaucoup d'outils réservent l'usage commercial à un palier payant précis (c'est le cas, entre autres, de plateformes de génération musicale où seuls les abonnements payants incluent les droits commerciaux).",
          "<span class=\"hl\">Une transparence ou une mention est-elle exigée ?</span> — Certaines juridictions et certaines plateformes de diffusion imposent de signaler qu'un contenu est généré ou modifié par IA.",
          "<span class=\"hl\">Le contenu implique-t-il une personne réelle ?</span> — Cloner une voix, recréer un visage ou imiter le style d'un artiste vivant engage des questions de consentement et de droit à l'image qui dépassent la seule question technique."
        ],
        legalCallout: {
          label: "Avertissement pédagogique",
          html: "Le cadre légal de l'IA générative varie selon les pays et évolue rapidement. Ce module enseigne une <span class=\"hl\">méthode de vigilance</span>, pas un droit figé : vérifier les conditions d'utilisation de chaque outil avant un usage commercial, et consulter un professionnel du droit pour toute situation à enjeu réel (contrat client important, usage international, image d'une personne réelle). Ce contenu ne constitue pas un conseil juridique."
        },
        pointACV: {
          titre: "Un point d'attention spécifique à ART-CREAVISION®",
          html: "Votre positionnement inclut les <span class=\"hl\">franchises culturelles africaines</span>. C'est une force de différenciation forte — et cela impose une vigilance particulière : un modèle génératif entraîné majoritairement sur des données occidentales peut produire des représentations culturelles stéréotypées ou approximatives d'un univers africain. La compétence professionnelle attendue n'est pas seulement technique : c'est la capacité à repérer une représentation culturelle fautive et à la corriger, exactement comme on vérifierait un fait erroné."
        },
        exemple: "Un prompt générique du type « marché africain traditionnel » produit souvent une image générique, mêlant des éléments visuels de régions et d'époques différentes. Un prompt professionnel précise le pays, la région, l'époque et les références culturelles exactes — cette exigence de précision est directement liée à la méthode ACV-PROMPT™ enseignée au Module 3 (variable « Contexte »).",
        demonstration: "Demander à chaque apprenant de choisir un outil de génération d'image cité dans la Cartographie ACV AI CREATOR TOOL MAP™, puis de localiser en direct, sur le site officiel de cet outil, la clause qui précise si l'usage commercial est inclus. Mettre en commun au tableau : combien d'apprenants ont trouvé la clause en moins de deux minutes ?",
        prompt: {
          label: "Prompt professionnel — version précise vs version générique",
          text: "Générique (à éviter) : « Marché africain traditionnel, ambiance colorée. »<br><br>Professionnel (méthode ACV-PROMPT™) : « Marché de Treichville à Abidjan, fin d'après-midi en saison sèche, étals de tissus wax et d'ignames, lumière dorée rasante, style photojournalisme éditorial, cadrage à hauteur d'homme, sans visage reconnaissable au premier plan. »"
        },
        erreurs: [
          "Supposer qu'un outil gratuit ou peu coûteux inclut automatiquement les droits d'usage commercial.",
          "Envoyer un devis client avant d'avoir vérifié les conditions d'utilisation de l'outil prévu pour la production.",
          "Traiter la fidélité culturelle comme un détail esthétique secondaire plutôt que comme une exigence de fond, au même titre qu'un fait erroné."
        ],
        bonnesPratiques: [
          "Toujours consulter la page des conditions d'utilisation commerciale de l'outil avant de livrer un contenu à un client.",
          "Documenter, pour chaque livrable, l'outil et le modèle utilisés — cette traçabilité protège autant le client que vous-même.",
          "Ne jamais cloner une voix ou un visage sans consentement explicite et vérifiable de la personne concernée.",
          "Relire toute représentation culturelle générée avec un œil aussi critique qu'un fait chiffré."
        ]
      }
    ],

    exercice: {
      id: "m1-exercice",
      titre: "Exercice pratique",
      consigne:
        "Envoyez le prompt de démonstration de la Leçon 1.1 (comparaison argentique/numérique) à deux assistants conversationnels différents. Notez, pour chacun : la longueur de la réponse, le ton employé, et un élément de contenu présent dans une réponse mais absent de l'autre.",
      corrige: [
        "Il n'existe pas de « bonne réponse » unique puisque chaque modèle compose sa propre formulation : le corrigé porte sur la méthode d'observation, pas sur un résultat attendu figé. Une observation réussie identifie correctement :",
      ],
      corrigePoints: [
        "Une différence de <b>registre</b> (l'un plus technique, l'autre plus imagé) malgré une consigne identique.",
        "Une différence de <b>structure</b> (liste implicite vs paragraphe continu).",
        "La confirmation qu'aucune des deux réponses n'est « la » réponse officielle : les deux sont des compositions plausibles, à évaluer selon leur adéquation au ton de marque recherché — pas selon une notion de vérité absolue, puisqu'il s'agit ici d'un texte explicatif et non d'un fait vérifiable."
      ]
    },

    quiz: {
      id: "m1-quiz",
      titre: "Quiz — Module 1",
      seuil: 0.70,
      questions: [
        { q: "Qu'est-ce qui distingue une IA générative d'une IA discriminative ?",
          options: ["La générative est plus rapide", "La générative produit une sortie nouvelle, la discriminative classe ou reconnaît", "La discriminative est toujours gratuite", "Il n'y a pas de différence"],
          correct: 1,
          feedback: "La générative compose une sortie nouvelle ; la discriminative trie ou reconnaît parmi des catégories existantes." },
        { q: "Une hallucination, dans un modèle génératif, désigne :",
          options: ["Une panne technique du serveur", "Un contenu inventé produit avec la même assurance qu'un contenu exact", "Une fonctionnalité activable dans les réglages", "Un bug d'affichage d'image"],
          correct: 1,
          feedback: "L'assurance du ton n'est jamais une garantie d'exactitude." },
        { q: "Que signifie « fenêtre de contexte » ?",
          options: ["La taille de l'écran utilisé", "La quantité d'information qu'un modèle peut prendre en compte dans une conversation donnée", "Le délai de réponse du modèle", "Le nombre d'images générables par jour"],
          correct: 1,
          feedback: "Au-delà de cette fenêtre, le modèle perd progressivement le début de la conversation." },
        { q: "Avant d'utiliser commercialement un contenu généré par IA pour un client, la priorité est de :",
          options: ["Vérifier les conditions d'usage commercial de l'outil utilisé", "Augmenter la résolution de l'image", "Changer le nom de fichier", "Publier immédiatement pour gagner du temps"],
          correct: 0,
          feedback: "C'est le réflexe de conformité prioritaire enseigné en Leçon 1.3." },
        { q: "Vrai ou faux : un modèle génératif « sait » quand il ne connaît pas la réponse et le signale systématiquement.",
          options: ["Vrai", "Faux"],
          correct: 1,
          feedback: "C'est justement l'absence de mécanisme de vérification interne qui rend l'hallucination possible." },
        { q: "Le fine-tuning désigne :",
          options: ["Le réglage du volume audio", "Un réentraînement ciblé d'un modèle pour le spécialiser", "La compression d'une image", "Le choix d'une police de caractères"],
          correct: 1,
          feedback: "Une opération réalisée par l'éditeur de l'outil, pas par l'utilisateur final au quotidien." },
        { q: "Face à un prompt générique de type « marché africain traditionnel », le risque pédagogique principal est :",
          options: ["Un temps de génération plus long", "Une représentation culturelle approximative ou stéréotypée", "Un coût plus élevé", "Aucun risque particulier"],
          correct: 1,
          feedback: "D'où l'exigence de précision culturelle enseignée dans la méthode ACV-PROMPT™." },
        { q: "Que doit faire un professionnel avant de cloner une voix avec un outil d'IA ?",
          options: ["Rien, l'outil s'en charge", "Obtenir le consentement explicite et vérifiable de la personne concernée", "Attendre la sortie de la prochaine version du modèle", "Utiliser uniquement la version gratuite"],
          correct: 1,
          feedback: "Sans quoi la responsabilité éthique et légale repose entièrement sur le créateur du contenu." }
      ]
    },

    travailPratique: {
      id: "m1-travail",
      titre: "Travail pratique",
      consigne:
        "Reproduisez la démonstration d'hallucination de la Leçon 1.2 avec un sujet de votre choix, dans votre domaine créatif (mode, musique, cinéma, artisanat). Rédigez ensuite une fiche de 10 lignes maximum expliquant à un client non technique : ce qu'est une hallucination, pourquoi elle survient, et comment vous, professionnel, la détectez avant livraison.",
      rubric: [
        ["Démonstration réalisée", "Capture ou retranscription claire de l'échange avec l'IA", 4],
        ["Justesse du vocabulaire", "« Hallucination » et au moins deux termes du glossaire employés correctement", 4],
        ["Clarté pour un non-technicien", "Fiche compréhensible sans aucun jargon", 6],
        ["Posture professionnelle", "La fiche rassure sans minimiser le risque", 6],
        ["Total", "", 20]
      ]
    },

    projetSource: {
      id: "m1-projet",
      titre: "Projet du module",
      consigne:
        "Pour un client fictif de votre choix (marque, artiste, association), rédigez une Charte d'usage responsable de l'IA générative d'une page, destinée à accompagner toute future production. Elle doit répondre à quatre questions : dans quels cas l'IA générative sera utilisée pour ce client ; comment les sorties seront vérifiées avant livraison ; comment les droits d'usage commercial seront contrôlés outil par outil ; comment la fidélité culturelle des représentations sera garantie si le sujet le justifie.",
      questions: [
        { id: "Q1", label: "Cas d'usage", prompt: "Dans quels cas l'IA générative sera-t-elle utilisée pour ce client ?" },
        { id: "Q2", label: "Vérification", prompt: "Comment les sorties seront-elles vérifiées avant livraison ?" },
        { id: "Q3", label: "Droits", prompt: "Comment les droits d'usage commercial seront-ils contrôlés, outil par outil ?" },
        { id: "Q4", label: "Fidélité culturelle", prompt: "Comment la fidélité culturelle des représentations sera-t-elle garantie, si le sujet le justifie ?" }
      ],
      corrige: {
        titre: "Charte d'usage responsable de l'IA — Maison [Client fictif]",
        items: [
          "<b>1. Cas d'usage :</b> génération d'images de moodboard en phase d'exploration créative uniquement ; tout visuel final destiné à la publication est retravaillé et validé par un directeur artistique humain.",
          "<b>2. Vérification :</b> toute affirmation factuelle (dates, lieux, références culturelles) générée par IA est vérifiée par une source indépendante avant intégration à un livrable.",
          "<b>3. Droits :</b> seuls des outils dont le palier d'abonnement inclut explicitement l'usage commercial sont utilisés pour les livrables finaux ; la référence est documentée dans le dossier de production.",
          "<b>4. Fidélité culturelle :</b> toute représentation culturelle spécifique est relue par une personne connaissant le contexte concerné avant validation finale."
        ],
        note: "Ce corrigé est un exemple de structure, pas un texte à recopier : l'évaluateur doit vérifier que les quatre points sont couverts avec un contenu propre à chaque client fictif choisi."
      }
    },

    defi: {
      titre: "Défi supplémentaire",
      text:
        "Trouvez, en cherchant sur les sites officiels de deux outils d'IA générative de familles différentes (par exemple un outil de texte et un outil d'image), leurs conditions d'usage commercial respectives. Comparez-les et identifiez lequel des deux impose la condition la plus stricte. Ce défi prépare directement la posture de veille attendue au Module 2."
    },

    ressources: [
      "Glossaire du Module 1 (les 8 termes de la Leçon 1.1, format fiche détachable)",
      "Modèle vierge de Charte d'usage responsable de l'IA (à dupliquer pour chaque client)",
      "Grille des 3 questions de vigilance de la Leçon 1.3, au format aide-mémoire imprimable",
      "Lien vers la Cartographie ACV AI CREATOR TOOL MAP™ pour situer chaque outil cité dans ce module"
    ],

    ficheFormateur: {
      titre: "Module 1 — Notes d'animation",
      items: [
        "<b>Durée :</b> 3-4h en présentiel ou synchrone, 3 leçons de 45-60 min + exercices.",
        "<b>Point de vigilance n°1 :</b> la démonstration d'hallucination (Leçon 1.2) fonctionne mieux en direct qu'en asynchrone — l'effet de surprise du groupe renforce la mémorisation.",
        "<b>Point de vigilance n°2 :</b> certains apprenants connaissent déjà superficiellement ChatGPT — recentrer systématiquement sur le « pourquoi » (mécanisme) plutôt que le « comment » (interface), qui n'est pas l'objet de ce module.",
        "<b>Question fréquente à anticiper :</b> « L'IA va-t-elle remplacer le métier de créatif ? » — Rediriger vers le positionnement du programme : l'IA change l'outil, pas la nécessité d'un jugement de direction artistique (annonce du Module 5).",
        "<b>Erreur d'animation à éviter :</b> passer trop de temps sur les détails techniques du fonctionnement des modèles de diffusion — l'analogie suffit à ce niveau, la technicité n'est pas un objectif du module."
      ]
    },

    ficheEtudiant: {
      titre: "Module 1 — Ce qu'il faut retenir",
      items: [
        "L'IA générative <b>compose</b> une réponse plausible, elle ne « sait » pas au sens humain.",
        "Une hallucination peut être aussi confiante en apparence qu'une information exacte — la seule protection est la vérification systématique.",
        "Avant tout usage commercial : vérifier les droits, documenter l'outil utilisé, obtenir un consentement pour toute voix ou visage réel.",
        "Une représentation culturelle générée se relit avec autant de rigueur qu'un chiffre.",
        "Vocabulaire clé à retenir : modèle, token, prompt, génération, fine-tuning, hallucination, fenêtre de contexte."
      ]
    }
  };

  /* ───────────────────────────────────────────────
     🟣 ADDENDUM Q5 — VALIDÉ
     Document séparé, jamais fusionné avec le Projet source.
     Rattaché à l'objectif O5. Ne modifie pas module-1-fondations.html.
  ─────────────────────────────────────────────── */
  var ADDENDUM_Q5 = {
    id: "Q5",
    status: "ADDENDUM VALIDÉ",
    accent: "#534AB7",
    prompt:
      "Pour un brief donné de ce client, indiquez explicitement si vous recourez ou non à l'IA générative pour le réaliser, et justifiez ce choix en une à deux phrases.",
    governance:
      "Le Projet source seul reste 🟡 PARTIEL sur l'objectif O5. La couverture 🟢 d'O5 résulte du dispositif complet Projet + Addendum Q5 validé — jamais du Projet source pris isolément."
  };

  var MODULES_A_VENIR = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (n) {
    return { id: "m" + n, num: n, title: "Module " + n, status: "a-venir" };
  });

  global.ACV_M1_DATA = M1;
  global.ACV_ADDENDUM_Q5 = ADDENDUM_Q5;
  global.ACV_MODULES_A_VENIR = MODULES_A_VENIR;
})(window);
