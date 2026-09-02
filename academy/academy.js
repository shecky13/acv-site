/*
  ART-CREAVISION® ACADEMY — Application (académy.js)
  =====================================================
  - Aucune dépendance externe, aucun build. Fonctionne en HTML/CSS/JS statique.
  - Stockage : LocalStorage, clé "acv_academy_progress_v2" (voir STORAGE_KEY).
    Cette clé est NOUVELLE et n'a aucun rapport avec une éventuelle clé
    "acv_academy_v1" préexistante ailleurs : ce script ne la lit ni ne la modifie.
  - Règles de gamification centralisées dans XP_RULES / LEVEL_STEP ci-dessous :
    modifiables sans toucher au reste de l'application.
  - Contenu du Module 1 : voir academy/data/module-1.js (🔵 SOURCE / 🟣 ADDENDUM).
*/
(function () {
  "use strict";

  /* ============================================================
     0. CONFIGURATION — XP / NIVEAUX / BADGES
     ============================================================ */
  var STORAGE_KEY = "acv_academy_progress_v2";
  var STORAGE_VERSION = 2;

  // Règles XP centralisées — modifiables sans réécrire l'application.
  var XP_RULES = {
    lecon: 40,          // par leçon marquée terminée (M1-L1 / L2 / L3)
    exercice: 30,        // exercice pratique
    travail: 30,        // travail pratique
    quizReussite: 100,   // quiz réussi (>= seuil)
    projetValide: 150    // projet validé (Q1-Q5 + checklist complète)
  };
  var LEVEL_STEP = 150; // XP nécessaires par palier de niveau

  var DEFAULT_NAME = "Soro Sékou";

  var BADGES = [
    { id: "premiere-lecon", icon: "🌱", name: "Premier Pas", desc: "1ʳᵉ leçon validée",
      test: function (s) { return countCompletedLecons(s) > 0; } },
    { id: "oeil-juste", icon: "🎯", name: "Œil Juste", desc: "Quiz du module réussi",
      test: function (s) { return !!(s.quiz.m1 && s.quiz.m1.passed); } },
    { id: "charte-validee", icon: "📜", name: "Charte Validée", desc: "Projet du module soumis",
      test: function (s) { return s.project.m1.status === "valide"; } },
    { id: "module-acheve", icon: "👑", name: "Module Achevé", desc: "Module 1 à 100%",
      test: function (s) { return moduleProgress(s, "m1") >= 1; } },
    { id: "constance", icon: "🔥", name: "Constance", desc: "3 jours de suite sur l'Academy",
      test: function (s) { return s.streak.count >= 3; } },
    { id: "mille-xp", icon: "💎", name: "Mille XP", desc: "1000 XP cumulés",
      test: function (s) { return s.user.xp >= 1000; } }
  ];

  /* ============================================================
     1. STOCKAGE
     ============================================================ */
  function defaultState() {
    var today = todayStr();
    return {
      version: STORAGE_VERSION,
      user: { name: DEFAULT_NAME, xp: 0 },
      streak: { count: 1, lastVisit: today },
      lecons: { "m1-l1": false, "m1-l2": false, "m1-l3": false },
      exercice: { "m1-exercice": false },
      travail: { "m1-travail": false },
      quiz: { m1: { attempts: 0, bestScore: 0, passed: false } },
      project: { m1: defaultProject() },
      badges: { unlocked: {} },
      certificate: { m1: null },
      ui: { view: "parcours" }
    };
  }

  function defaultProject() {
    return {
      status: "brouillon", // brouillon | valide
      client: { nom: "", type: "", description: "" },
      outil1: "", outil2: "",
      q1: "", q2: "", q3: "", q4: "",
      brief: "",
      q5: "",
      xpAwarded: false,
      updatedAt: null,
      submittedAt: null
    };
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_VERSION) {
        // Version inconnue ou future : ne pas tenter de migrer à l'aveugle,
        // repartir sur un état neuf plutôt que de corrompre une structure inconnue.
        return defaultState();
      }
      // Fusion défensive avec les valeurs par défaut (champs manquants tolérés)
      var d = defaultState();
      return deepMerge(d, parsed);
    } catch (e) {
      console.warn("[ACV Academy] Lecture localStorage impossible, état par défaut utilisé.", e);
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("[ACV Academy] Sauvegarde localStorage impossible.", e);
      toast("⚠️ Sauvegarde locale indisponible dans ce navigateur.");
    }
  }

  function deepMerge(base, patch) {
    if (typeof patch !== "object" || patch === null) return base;
    Object.keys(base).forEach(function (k) {
      if (patch.hasOwnProperty(k)) {
        if (typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k]) &&
            typeof patch[k] === "object" && patch[k] !== null && !Array.isArray(patch[k])) {
          base[k] = deepMerge(base[k], patch[k]);
        } else {
          base[k] = patch[k];
        }
      }
    });
    return base;
  }

  /* ============================================================
     2. GAMIFICATION — XP / NIVEAU / STREAK / BADGES
     ============================================================ */
  function levelInfo(xp) {
    var level = Math.floor(xp / LEVEL_STEP) + 1;
    var xpInLevel = xp % LEVEL_STEP;
    return { level: level, xpInLevel: xpInLevel, xpToNext: LEVEL_STEP, pct: xpInLevel / LEVEL_STEP };
  }

  function awardXP(amount, reason) {
    state.user.xp += amount;
    saveState();
    toast("+" + amount + " XP — " + reason);
    checkBadges();
  }

  function bumpStreak() {
    var today = todayStr();
    var last = state.streak.lastVisit;
    if (last === today) return;
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak.count = (last === yesterday) ? state.streak.count + 1 : 1;
    state.streak.lastVisit = today;
    saveState();
  }

  function countCompletedLecons(s) {
    var n = 0;
    Object.keys(s.lecons).forEach(function (k) { if (s.lecons[k]) n++; });
    if (s.exercice["m1-exercice"]) n++;
    if (s.travail["m1-travail"]) n++;
    return n;
  }

  // Progression du module (0..1) — 6 items pondérés également :
  // M1-L1, M1-L2, M1-L3, Exercice, Travail pratique, Quiz réussi, Projet validé (7 items réels)
  function moduleProgress(s, moduleId) {
    if (moduleId !== "m1") return 0;
    var items = [
      s.lecons["m1-l1"], s.lecons["m1-l2"], s.lecons["m1-l3"],
      s.exercice["m1-exercice"], s.travail["m1-travail"],
      !!(s.quiz.m1 && s.quiz.m1.passed),
      s.project.m1.status === "valide"
    ];
    var done = items.filter(Boolean).length;
    return done / items.length;
  }

  function checkBadges() {
    var changed = false;
    BADGES.forEach(function (b) {
      if (!state.badges.unlocked[b.id] && b.test(state)) {
        state.badges.unlocked[b.id] = new Date().toISOString();
        changed = true;
        toast("🏅 Badge débloqué — " + b.name);
      }
    });
    if (changed) saveState();
  }

  /* ============================================================
     3. UTILITAIRES DOM
     ============================================================ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined) return;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // File d'attente de toasts : deux notifications survenant dans le même tick
  // (ex. gain d'XP puis déblocage d'un badge) s'affichent l'une après l'autre
  // au lieu que la seconde écrase silencieusement la première.
  var toastQueue = [];
  var toastBusy = false;
  function toast(msg) {
    toastQueue.push(msg);
    if (!toastBusy) processToastQueue();
  }
  function processToastQueue() {
    var t = $("#acv-toast");
    if (!t || !toastQueue.length) { toastBusy = false; return; }
    toastBusy = true;
    var msg = toastQueue.shift();
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(processToastQueue, 220);
    }, 2000);
  }

  /* ============================================================
     4. ÉTAT & ROUTEUR
     ============================================================ */
  var state = loadState();
  bumpStreak();
  checkBadges();

  var VIEWS = ["parcours", "modules", "quiz", "badges", "classement", "certificat"];

  function setView(view, extra) {
    state.ui.view = view;
    state.ui.viewExtra = extra || null;
    saveState();
    render();
  }

  /* ============================================================
     5. RENDU — SHELL
     ============================================================ */
  function render() {
    renderHeader();
    renderNav();
    renderMain();
  }

  function renderHeader() {
    var li = levelInfo(state.user.xp);
    var header = $("#acv-header");
    header.innerHTML = "";
    header.appendChild(el("div", { class: "acv-brand" }, [
      "ART-CREAVISION® ACADEMY",
      el("small", {}, ["Maîtriser l'IA générative pour la création™"])
    ]));

    var initials = (state.user.name || "?").trim().charAt(0).toUpperCase() || "?";
    var profile = el("div", { class: "acv-profile" }, [
      el("div", { class: "acv-avatar" }, [initials]),
      el("div", {}, [
        el("div", { class: "acv-profile-meta" }, [
          "Bonjour, ", el("b", {}, [state.user.name]), " 👋 · Niveau " + li.level
        ]),
        el("div", { class: "acv-xp-pill" }, [
          el("span", {}, [li.xpInLevel + " / " + li.xpToNext + " XP"]),
          el("span", { class: "acv-xp-track" }, [
            el("span", { class: "acv-xp-fill", style: "width:" + Math.round(li.pct * 100) + "%" })
          ])
        ])
      ]),
      el("div", { class: "acv-streak" }, ["🔥 " + state.streak.count + " jour" + (state.streak.count > 1 ? "s" : "")]),
      el("button", { class: "acv-btn sm ghost", title: "Modifier votre nom", onclick: editName }, ["✎"])
    ]);
    header.appendChild(profile);
  }

  function editName() {
    var next = window.prompt("Votre nom (utilisé ici et sur le certificat) :", state.user.name);
    if (next && next.trim()) {
      state.user.name = next.trim().slice(0, 60);
      saveState();
      render();
    }
  }

  var NAV_LABELS = { parcours: "Parcours", modules: "Modules", quiz: "Quiz", badges: "Badges", classement: "Classement", certificat: "Certificat" };
  function renderNav() {
    var nav = $("#acv-nav");
    nav.innerHTML = "";
    VIEWS.forEach(function (v) {
      var active = state.ui.view === v || (v === "modules" && state.ui.view === "module-detail");
      nav.appendChild(el("button", {
        class: active ? "active" : "",
        onclick: function () { setView(v); }
      }, [NAV_LABELS[v]]));
    });
  }

  function renderMain() {
    var main = $("#acv-main");
    main.innerHTML = "";
    var view = state.ui.view;
    if (view === "parcours") return main.appendChild(viewParcours());
    if (view === "modules") return main.appendChild(viewModules());
    if (view === "module-detail") return main.appendChild(viewModuleDetail());
    if (view === "quiz") return main.appendChild(viewQuizList());
    if (view === "quiz-run") return main.appendChild(viewQuizRun());
    if (view === "projet") return main.appendChild(viewProjet());
    if (view === "badges") return main.appendChild(viewBadges());
    if (view === "classement") return main.appendChild(viewClassement());
    if (view === "certificat") return main.appendChild(viewCertificat());
    main.appendChild(viewParcours());
  }

  /* ============================================================
     6. VUE — PARCOURS
     ============================================================ */
  function viewParcours() {
    var m1 = window.ACV_M1_DATA;
    var pct = moduleProgress(state, "m1");
    var frag = document.createDocumentFragment();

    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["PARCOURS"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Bonjour, " + state.user.name + " 👋"]));
    frag.appendChild(el("p", { class: "acv-lead" }, [
      "Chaque leçon validée nourrit votre XP et vous rapproche du certificat du Module 1. Le parcours s'étendra progressivement aux Modules 2 à 12 du Blueprint Maître."
    ]));

    var card = el("div", { class: "acv-card accent" });
    card.appendChild(el("div", { class: "acv-card-row" }, [
      el("div", {}, [
        el("span", { class: "acv-tag gold" }, ["Débutant → Artiste Confirmé"]),
        el("h2", { class: "acv-h2", style: "margin-top:10px" }, [m1.title])
      ]),
      el("span", { class: "acv-tag " + (pct >= 1 ? "ok" : "gold") }, [Math.round(pct * 100) + "%"])
    ]));
    card.appendChild(el("p", {}, [m1.subtitle]));
    card.appendChild(el("div", { class: "acv-progress" }, [el("span", { style: "width:" + Math.round(pct * 100) + "%" })]));
    card.appendChild(el("div", { class: "acv-btn-row" }, [
      el("button", { class: "acv-btn primary", onclick: function () { setView("module-detail", "m1"); } }, ["Continuer le Module 1"])
    ]));
    frag.appendChild(card);

    frag.appendChild(el("h3", { class: "acv-h3", style: "margin:28px 0 12px" }, ["Prochaines actions pédagogiques"]));
    var next = nextActions();
    var list = el("div", {});
    next.forEach(function (n) {
      list.appendChild(el("div", { class: "acv-card", style: "display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer" ,
        onclick: n.go }, [
        el("div", {}, [
          el("div", { class: "acv-h3", style: "font-size:1rem" }, [n.label]),
          el("div", { class: "acv-lead", style: "margin-top:2px" }, [n.hint])
        ]),
        el("span", { class: "acv-tag gold" }, ["+" + n.xp + " XP"])
      ]));
    });
    if (!next.length) {
      list.appendChild(el("div", { class: "acv-card" }, ["Module 1 entièrement complété. Modules 2 à 12 à venir."]));
    }
    frag.appendChild(list);

    frag.appendChild(footnote());
    return frag;
  }

  function nextActions() {
    var actions = [];
    var lessons = window.ACV_M1_DATA.lecons;
    lessons.forEach(function (l) {
      if (!state.lecons[l.id]) {
        actions.push({ label: l.code + " — " + l.titre, hint: "Leçon à consulter", xp: XP_RULES.lecon,
          go: function () { openLecon(l.id); } });
      }
    });
    if (!actions.length && !state.exercice["m1-exercice"]) {
      actions.push({ label: "Exercice pratique", hint: "Comparer deux assistants IA", xp: XP_RULES.exercice,
        go: function () { setView("module-detail", "m1"); } });
    }
    if (!actions.length && !state.travail["m1-travail"]) {
      actions.push({ label: "Travail pratique", hint: "Reproduire une hallucination", xp: XP_RULES.travail,
        go: function () { setView("module-detail", "m1"); } });
    }
    if (!actions.length && !(state.quiz.m1 && state.quiz.m1.passed)) {
      actions.push({ label: "Quiz du Module 1", hint: "8 questions, seuil 70%", xp: XP_RULES.quizReussite,
        go: function () { setView("quiz"); } });
    }
    if (!actions.length && state.project.m1.status !== "valide") {
      actions.push({ label: "Projet du Module 1", hint: "Charte + Addendum Q5", xp: XP_RULES.projetValide,
        go: function () { setView("projet"); } });
    }
    return actions.slice(0, 3);
  }

  /* ============================================================
     7. VUE — MODULES (liste)
     ============================================================ */
  function viewModules() {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["MODULES"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Modules du parcours"]));
    frag.appendChild(el("p", { class: "acv-lead" }, ["Seul le Module 1 est aujourd'hui alimenté avec le contenu officiel validé. Les modules suivants apparaîtront au fur et à mesure de leur production."]));

    var pct = moduleProgress(state, "m1");
    var m1card = el("div", { class: "acv-module-card", onclick: function () { setView("module-detail", "m1"); } });
    m1card.appendChild(el("div", { class: "num" }, ["MODULE 1"]));
    m1card.appendChild(el("h3", { class: "acv-h3", style: "margin-top:6px" }, [window.ACV_M1_DATA.title]));
    m1card.appendChild(el("div", { class: "acv-progress" }, [el("span", { style: "width:" + Math.round(pct * 100) + "%" })]));
    m1card.appendChild(el("div", { class: "acv-lead", style: "margin-top:8px" }, [Math.round(pct * 100) + "% complété ▸"]));
    frag.appendChild(m1card);

    window.ACV_MODULES_A_VENIR.forEach(function (m) {
      var c = el("div", { class: "acv-module-card disabled" });
      c.appendChild(el("div", { class: "num" }, ["MODULE " + m.num]));
      c.appendChild(el("h3", { class: "acv-h3", style: "margin-top:6px" }, [m.title]));
      c.appendChild(el("span", { class: "acv-tag locked" }, ["À venir"]));
      frag.appendChild(c);
    });

    frag.appendChild(footnote());
    return frag;
  }

  /* ============================================================
     8. VUE — DÉTAIL MODULE 1 (leçons + livrables source)
     ============================================================ */
  function viewModuleDetail() {
    var m1 = window.ACV_M1_DATA;
    var frag = document.createDocumentFragment();
    frag.appendChild(el("button", { class: "acv-btn ghost sm", onclick: function () { setView("modules"); } }, ["← Modules"]));
    frag.appendChild(el("div", { class: "acv-eyebrow", style: "margin-top:16px" }, ["MODULE 1"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, [m1.title]));
    frag.appendChild(el("p", { class: "acv-lead" }, [m1.subtitle]));

    var meta = el("div", { class: "acv-card", style: "display:flex;gap:20px;flex-wrap:wrap;font-size:.85rem;color:var(--acv-muted)" }, [
      el("span", {}, ["Leçons : " + el2text(m1.meta.lessons)]),
      el("span", {}, ["Durée indicative : " + m1.meta.duree]),
      el("span", {}, ["Prérequis : " + m1.meta.prerequis])
    ]);
    frag.appendChild(meta);

    // Objectifs avec statuts de gouvernance
    var objCard = el("div", { class: "acv-card" });
    objCard.appendChild(el("h3", { class: "acv-h3" }, ["Objectifs pédagogiques"]));
    var objList = el("ul", { class: "acv-checklist" });
    m1.objectifs.forEach(function (o) {
      var tagEl = null;
      if (o.tag === "partial-gap") tagEl = el("span", { class: "acv-tag warn", style: "margin-left:8px" }, ["O3 · biais non couvert"]);
      if (o.tag === "covered") tagEl = el("span", { class: "acv-tag ok", style: "margin-left:8px" }, ["O4 · couvert"]);
      if (o.tag === "covered-addendum") tagEl = el("span", { class: "acv-tag addendum", style: "margin-left:8px" }, ["O5 · Projet + Addendum Q5"]);
      objList.appendChild(el("li", {}, [el("span", {}, [o.text]), tagEl]));
    });
    objCard.appendChild(objList);
    frag.appendChild(objCard);

    // Leçons
    m1.lecons.forEach(function (l) {
      frag.appendChild(leconCard(l));
    });

    // Exercice pratique
    frag.appendChild(sourceItemCard({
      id: m1.exercice.id, titre: m1.exercice.titre, done: state.exercice["m1-exercice"], xp: XP_RULES.exercice,
      body: function (box) {
        box.appendChild(el("p", {}, [m1.exercice.consigne]));
        box.appendChild(el("h4", {}, ["Corrigé"]));
        box.appendChild(el("p", {}, [m1.exercice.corrige[0]]));
        var ul = el("ul", { class: "acv-checklist" });
        m1.exercice.corrigePoints.forEach(function (p) { ul.appendChild(el("li", { html: p })); });
        box.appendChild(ul);
      },
      onComplete: function () { toggleDone(state.exercice, "m1-exercice", XP_RULES.exercice, "Exercice pratique"); }
    }));

    // Quiz (lien)
    var quizCard = el("div", { class: "acv-card" });
    quizCard.appendChild(el("div", { class: "acv-card-row" }, [
      el("h3", { class: "acv-h3" }, ["Quiz du module"]),
      state.quiz.m1.passed ? el("span", { class: "acv-tag ok" }, ["Réussi — " + Math.round(state.quiz.m1.bestScore * 100) + "%"]) : el("span", { class: "acv-tag gold" }, ["+" + XP_RULES.quizReussite + " XP"])
    ]));
    quizCard.appendChild(el("p", {}, ["8 questions officielles, seuil de réussite 70%."]));
    quizCard.appendChild(el("button", { class: "acv-btn primary sm", onclick: function () { setView("quiz"); } }, [state.quiz.m1.passed ? "Revoir le quiz" : "Commencer le quiz"]));
    frag.appendChild(quizCard);

    // Travail pratique
    frag.appendChild(sourceItemCard({
      id: m1.travailPratique.id, titre: m1.travailPratique.titre, done: state.travail["m1-travail"], xp: XP_RULES.travail,
      body: function (box) {
        box.appendChild(el("p", {}, [m1.travailPratique.consigne]));
        box.appendChild(el("h4", {}, ["Critères d'évaluation"]));
        box.appendChild(rubricTable(m1.travailPratique.rubric));
      },
      onComplete: function () { toggleDone(state.travail, "m1-travail", XP_RULES.travail, "Travail pratique"); }
    }));

    // Projet (lien)
    var projCard = el("div", { class: "acv-card accent" });
    projCard.appendChild(el("div", { class: "acv-card-row" }, [
      el("h3", { class: "acv-h3" }, ["Projet du module"]),
      state.project.m1.status === "valide" ? el("span", { class: "acv-tag ok" }, ["Validé"]) : el("span", { class: "acv-tag gold" }, ["+" + XP_RULES.projetValide + " XP"])
    ]));
    projCard.appendChild(el("p", {}, ["Charte d'usage responsable de l'IA générative — Projet source (Q1-Q4) ", el("span", { class: "acv-tag source" }, ["SOURCE"]), " + ", el("span", { class: "acv-tag addendum" }, ["Q5 · ADDENDUM VALIDÉ"])]));
    projCard.appendChild(el("button", { class: "acv-btn violet sm", onclick: function () { setView("projet"); } }, [state.project.m1.status === "valide" ? "Revoir mon projet" : "Ouvrir le projet"]));
    frag.appendChild(projCard);

    // Défi supplémentaire
    var defiCard = el("div", { class: "acv-card" }, [
      el("span", { class: "acv-tag source" }, ["SOURCE"]),
      el("h3", { class: "acv-h3", style: "margin-top:8px" }, [m1.defi.titre]),
      el("p", {}, [m1.defi.text])
    ]);
    frag.appendChild(defiCard);

    // Ressources
    var resCard = el("div", { class: "acv-card" });
    resCard.appendChild(el("span", { class: "acv-tag source" }, ["SOURCE"]));
    resCard.appendChild(el("h3", { class: "acv-h3", style: "margin-top:8px" }, ["Ressources à fournir à l'apprenant"]));
    var resUl = el("ul", { class: "acv-checklist" });
    m1.ressources.forEach(function (r) { resUl.appendChild(el("li", {}, [r])); });
    resCard.appendChild(resUl);
    frag.appendChild(resCard);

    // Fiches formateur / étudiant
    var fichesWrap = el("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:16px" });
    [m1.ficheFormateur, m1.ficheEtudiant].forEach(function (f, i) {
      var c = el("div", { class: "acv-card" });
      c.appendChild(el("span", { class: "acv-tag source" }, ["SOURCE"]));
      c.appendChild(el("h4", { class: "acv-h3", style: "font-size:1.05rem;margin-top:8px" }, [i === 0 ? "Fiche formateur" : "Fiche étudiant"]));
      c.appendChild(el("div", { class: "acv-h3", style: "font-size:.95rem;margin-bottom:8px" }, [f.titre]));
      var ul = el("ul", { class: "acv-checklist" });
      f.items.forEach(function (it) { ul.appendChild(el("li", { html: it })); });
      c.appendChild(ul);
      fichesWrap.appendChild(c);
    });
    frag.appendChild(fichesWrap);

    frag.appendChild(footnote());
    return frag;
  }

  function el2text(v) { return String(v); }

  function rubricTable(rows) {
    var wrap = el("div", { class: "acv-table-wrap" });
    var table = el("table", { class: "acv-table" });
    var thead = el("thead", {}, [el("tr", {}, [el("th", {}, ["Critère"]), el("th", {}, ["Attendu"]), el("th", {}, ["Points"])])]);
    var tbody = el("tbody");
    rows.forEach(function (r) {
      tbody.appendChild(el("tr", {}, [el("td", {}, [r[0]]), el("td", {}, [r[1]]), el("td", {}, [String(r[2])])]));
    });
    table.appendChild(thead); table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function sourceItemCard(opts) {
    var card = el("div", { class: "acv-card" });
    var head = el("div", { class: "acv-card-row" }, [
      el("div", {}, [
        el("span", { class: "acv-tag source" }, ["SOURCE"]),
        el("h3", { class: "acv-h3", style: "margin-top:8px" }, [opts.titre])
      ]),
      opts.done ? el("span", { class: "acv-tag ok" }, ["✓ Terminé"]) : el("span", { class: "acv-tag gold" }, ["+" + opts.xp + " XP"])
    ]);
    card.appendChild(head);
    var box = el("div", { class: "acv-lesson" });
    opts.body(box);
    card.appendChild(box);
    if (!opts.done) {
      card.appendChild(el("button", { class: "acv-btn sm primary", style: "margin-top:12px", onclick: function () { opts.onComplete(); render(); } }, ["Marquer comme terminé"]));
    }
    return card;
  }

  function toggleDone(bucket, id, xp, label) {
    if (bucket[id]) return;
    bucket[id] = true;
    saveState();
    awardXP(xp, label);
  }

  function leconCard(l) {
    var done = state.lecons[l.id];
    var card = el("div", { class: "acv-card", id: l.id });
    card.appendChild(el("div", { class: "acv-card-row" }, [
      el("div", {}, [
        el("span", { class: "acv-tag source" }, ["SOURCE"]),
        el("span", { class: "acv-tag locked", style: "margin-left:6px" }, ["🔒 " + l.code]),
        el("h3", { class: "acv-h3", style: "margin-top:8px" }, [l.titre])
      ]),
      done ? el("span", { class: "acv-tag ok" }, ["✓ Terminé"]) : el("span", { class: "acv-tag gold" }, ["+" + XP_RULES.lecon + " XP"])
    ]));

    var body = el("div", { class: "acv-lesson" });
    if (l.explication) l.explication.forEach(function (p) { body.appendChild(el("p", { html: p })); });

    if (l.glossaire && l.glossaire.length) {
      body.appendChild(el("h4", {}, ["Vocabulaire à maîtriser"]));
      var dl = el("dl", { class: "acv-glossary" });
      l.glossaire.forEach(function (pair) {
        dl.appendChild(el("dt", {}, [pair[0]]));
        dl.appendChild(el("dd", {}, [pair[1]]));
      });
      body.appendChild(dl);
    }

    if (l.questionsReflexes) {
      var ol = el("ol", { style: "padding-left:1.2rem" });
      l.questionsReflexes.forEach(function (q) { ol.appendChild(el("li", { html: q, style: "margin-bottom:.5rem" })); });
      body.appendChild(ol);
    }
    if (l.legalCallout) {
      body.appendChild(el("div", { class: "acv-callout legal" }, [
        el("div", { class: "lbl" }, [l.legalCallout.label]),
        el("p", { html: l.legalCallout.html })
      ]));
    }
    if (l.pointACV) {
      body.appendChild(el("h4", {}, [l.pointACV.titre]));
      body.appendChild(el("p", { html: l.pointACV.html }));
    }

    if (l.exemple) { body.appendChild(el("h4", {}, ["Exemple concret"])); body.appendChild(el("p", {}, [l.exemple])); }
    if (l.demonstration) { body.appendChild(el("h4", {}, ["Démonstration proposée"])); body.appendChild(el("p", {}, [l.demonstration])); }
    if (l.prompt) {
      body.appendChild(el("div", { class: "acv-prompt" }, [
        el("div", { class: "p-label" }, [l.prompt.label]),
        el("em", { html: l.prompt.text })
      ]));
    }
    if (l.erreurs && l.erreurs.length) {
      body.appendChild(el("h4", {}, ["Erreurs fréquentes"]));
      var ul1 = el("ul", { class: "acv-checklist" });
      l.erreurs.forEach(function (e) { ul1.appendChild(el("li", {}, [e])); });
      body.appendChild(ul1);
    }
    if (l.bonnesPratiques && l.bonnesPratiques.length) {
      body.appendChild(el("h4", {}, ["Bonnes pratiques"]));
      var ul2 = el("ul", { class: "acv-checklist" });
      l.bonnesPratiques.forEach(function (b) { ul2.appendChild(el("li", { html: b })); });
      body.appendChild(ul2);
    }
    card.appendChild(body);

    if (!done) {
      card.appendChild(el("button", { class: "acv-btn sm primary", style: "margin-top:12px", onclick: function () { toggleDone(state.lecons, l.id, XP_RULES.lecon, l.code); render(); scrollToId(l.id); } }, ["Marquer comme terminé"]));
    }
    return card;
  }

  function openLecon(id) { setView("module-detail", "m1"); setTimeout(function () { scrollToId(id); }, 0); }
  function scrollToId(id) { var n = document.getElementById(id); if (n) n.scrollIntoView({ behavior: "smooth", block: "start" }); }

  function footnote() {
    return el("div", { class: "acv-footnote" }, [
      "🔵 SOURCE : contenu extrait de module-1-fondations.html, fichier verrouillé — non modifié. 🟣 ADDENDUM : Addendum Q5 validé, document séparé du Projet source. Objectif O3 (« biais ») : non couvert dans ce module, écart documenté et maintenu."
    ]);
  }

  /* ============================================================
     9. VUE — QUIZ
     ============================================================ */
  function viewQuizList() {
    var q = window.ACV_M1_DATA.quiz;
    var st = state.quiz.m1;
    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["QUIZ"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Quiz"]));
    frag.appendChild(el("p", { class: "acv-lead" }, ["Validez vos connaissances. " + Math.round(q.seuil * 100) + "% de bonnes réponses débloque l'XP du quiz."]));

    var card = el("div", { class: "acv-card accent" });
    card.appendChild(el("span", { class: "acv-tag source" }, ["SOURCE — 8 questions officielles"]));
    card.appendChild(el("h3", { class: "acv-h3", style: "margin-top:8px" }, [q.titre]));
    if (st.attempts > 0) {
      card.appendChild(el("p", {}, ["Meilleur score : " + Math.round(st.bestScore * 100) + "% · Tentatives : " + st.attempts + (st.passed ? " · Réussi ✓" : "")]));
    }
    card.appendChild(el("button", { class: "acv-btn primary", onclick: startQuiz }, [st.attempts > 0 ? "Recommencer le quiz" : "Commencer le quiz"]));
    frag.appendChild(card);
    frag.appendChild(footnote());
    return frag;
  }

  var quizRuntime = null;
  function startQuiz() {
    quizRuntime = { index: 0, answers: [], selected: null, showFeedback: false };
    setView("quiz-run");
  }

  function viewQuizRun() {
    var data = window.ACV_M1_DATA.quiz;
    var frag = document.createDocumentFragment();
    if (!quizRuntime) { startQuiz(); return frag; }

    if (quizRuntime.index >= data.questions.length) {
      return quizResultView(data);
    }

    var q = data.questions[quizRuntime.index];
    var progress = el("div", { class: "acv-quiz-progress" });
    data.questions.forEach(function (_, i) {
      progress.appendChild(el("span", { class: i < quizRuntime.index ? "done" : (i === quizRuntime.index ? "current" : "") }));
    });
    frag.appendChild(progress);
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["QUESTION " + (quizRuntime.index + 1) + " / " + data.questions.length]));
    frag.appendChild(el("div", { class: "acv-quiz-q" }, [q.q]));

    var opts = el("div", { class: "acv-quiz-opts" });
    q.options.forEach(function (opt, i) {
      var cls = "acv-opt";
      if (quizRuntime.showFeedback) {
        if (i === q.correct) cls += " correct";
        else if (i === quizRuntime.selected) cls += " wrong";
      } else if (i === quizRuntime.selected) cls += " selected";
      var row = el("label", { class: cls }, [
        el("input", { type: "radio", name: "q", disabled: quizRuntime.showFeedback ? "disabled" : null,
          onchange: function () { quizRuntime.selected = i; render(); } }),
        el("span", {}, [opt])
      ]);
      if (quizRuntime.selected === i) row.querySelector("input").checked = true;
      opts.appendChild(row);
    });
    frag.appendChild(opts);

    if (quizRuntime.showFeedback) {
      frag.appendChild(el("div", { class: "acv-quiz-feedback" }, [q.feedback]));
      frag.appendChild(el("div", { class: "acv-btn-row" }, [
        el("button", { class: "acv-btn primary", onclick: nextQuestion }, [quizRuntime.index === data.questions.length - 1 ? "Voir le résultat" : "Question suivante"])
      ]));
    } else {
      frag.appendChild(el("div", { class: "acv-btn-row" }, [
        el("button", { class: "acv-btn primary", disabled: quizRuntime.selected === null ? "disabled" : null, onclick: validateAnswer }, ["Valider"]),
        el("button", { class: "acv-btn ghost", onclick: function () { quizRuntime = null; setView("quiz"); } }, ["Quitter"])
      ]));
    }
    return frag;
  }

  function validateAnswer() {
    if (quizRuntime.selected === null) return;
    quizRuntime.showFeedback = true;
    quizRuntime.answers[quizRuntime.index] = quizRuntime.selected;
    render();
  }
  function nextQuestion() {
    quizRuntime.index += 1;
    quizRuntime.selected = null;
    quizRuntime.showFeedback = false;
    render();
  }

  function quizResultView(data) {
    var correct = 0;
    quizRuntime.answers.forEach(function (a, i) { if (a === data.questions[i].correct) correct++; });
    var score = correct / data.questions.length;
    var passed = score >= data.seuil;

    state.quiz.m1.attempts += 1;
    if (score > state.quiz.m1.bestScore) state.quiz.m1.bestScore = score;
    var wasAlreadyPassed = state.quiz.m1.passed;
    if (passed) state.quiz.m1.passed = true;
    saveState();
    if (passed && !wasAlreadyPassed) {
      awardXP(XP_RULES.quizReussite, "Quiz du Module 1 réussi");
    } else {
      checkBadges();
    }

    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["RÉSULTAT"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, [passed ? "Quiz réussi 🎉" : "Quiz non validé"]));
    var card = el("div", { class: "acv-card accent", style: "text-align:center" });
    card.appendChild(el("div", { class: "acv-h1", style: "font-size:2.4rem;color:" + (passed ? "var(--acv-ok)" : "var(--acv-warn)") }, [Math.round(score * 100) + "%"]));
    card.appendChild(el("p", {}, [correct + " / " + data.questions.length + " bonnes réponses — seuil de réussite : " + Math.round(data.seuil * 100) + "%"]));
    card.appendChild(el("div", { class: "acv-btn-row", style: "justify-content:center" }, [
      el("button", { class: "acv-btn primary", onclick: function () { quizRuntime = null; setView("quiz"); } }, ["Retour"]),
      el("button", { class: "acv-btn ghost", onclick: startQuiz }, ["Recommencer"])
    ]));
    frag.appendChild(card);
    return frag;
  }

  /* ============================================================
     10. VUE — PROJET (Q1-Q5)
     ============================================================ */
  var PROJECT_STEPS = ["client", "outils", "q1", "q2", "q3", "q4", "brief", "q5", "exemple", "checklist"];
  var projectStepIndex = 0;

  function viewProjet() {
    var m1 = window.ACV_M1_DATA;
    var addendum = window.ACV_ADDENDUM_Q5;
    var p = state.project.m1;
    var frag = document.createDocumentFragment();

    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["PROJET DU MODULE 1"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Charte d'usage responsable de l'IA générative"]));
    frag.appendChild(el("p", { class: "acv-lead" }, [
      el("span", { class: "acv-tag source" }, ["SOURCE — Q1 à Q4"]), " ",
      el("span", { class: "acv-tag addendum" }, ["Q5 · ADDENDUM VALIDÉ"])
    ]));

    if (p.status === "valide") {
      frag.appendChild(projectValidatedCard(p));
      frag.appendChild(footnote());
      return frag;
    }

    var steps = el("div", { class: "acv-steps" });
    PROJECT_STEPS.forEach(function (s, i) {
      steps.appendChild(el("span", { class: "acv-step-dot " + (i < projectStepIndex ? "done" : (i === projectStepIndex ? "current" : "")) }));
    });
    frag.appendChild(steps);

    var card = el("div", { class: "acv-card accent" });
    var stepId = PROJECT_STEPS[projectStepIndex];
    renderProjectStep(card, stepId, m1, addendum, p);
    frag.appendChild(card);

    frag.appendChild(el("div", { class: "acv-footnote" }, ["Brouillon sauvegardé automatiquement dans ce navigateur — vous pouvez fermer et reprendre plus tard."]));
    return frag;
  }

  function renderProjectStep(card, stepId, m1, addendum, p) {
    var nav = function (extraValidator) {
      var row = el("div", { class: "acv-btn-row" });
      if (projectStepIndex > 0) row.appendChild(el("button", { class: "acv-btn ghost", onclick: function () { projectStepIndex--; render(); } }, ["← Précédent"]));
      var goingToChecklist = PROJECT_STEPS[projectStepIndex + 1] === "checklist";
      row.appendChild(el("button", {
        class: "acv-btn primary", onclick: function () {
          if (extraValidator && !extraValidator()) return;
          projectStepIndex++;
          saveProjectField();
          render();
        }
      }, [goingToChecklist ? "Vérifier ma checklist" : "Suivant →"]));
      return row;
    };

    if (stepId === "client") {
      card.appendChild(el("h3", { class: "acv-h3" }, ["1 · Choisir un client fictif"]));
      card.appendChild(field("Nom du client fictif", textInput("proj-client-nom", p.client.nom, function (v) { p.client.nom = v; })));
      card.appendChild(field("Type de client (marque, artiste, association…)", textInput("proj-client-type", p.client.type, function (v) { p.client.type = v; })));
      card.appendChild(field("Description en une phrase", textarea("proj-client-desc", p.client.description, function (v) { p.client.description = v; })));
      card.appendChild(nav(function () {
        if (!p.client.nom.trim()) { toast("⚠️ Indiquez un nom de client."); return false; }
        return true;
      }));
    } else if (stepId === "outils") {
      card.appendChild(el("h3", { class: "acv-h3" }, ["2 · Identifier 1 à 2 outils IA envisagés"]));
      card.appendChild(field("Outil IA n°1", textInput("proj-outil1", p.outil1, function (v) { p.outil1 = v; })));
      card.appendChild(field("Outil IA n°2 (optionnel)", textInput("proj-outil2", p.outil2, function (v) { p.outil2 = v; })));
      card.appendChild(nav(function () {
        if (!p.outil1.trim()) { toast("⚠️ Indiquez au moins un outil IA."); return false; }
        return true;
      }));
    } else if (stepId.match(/^q[1-4]$/)) {
      var qdef = m1.projetSource.questions[Number(stepId[1]) - 1];
      card.appendChild(el("span", { class: "acv-tag source" }, ["SOURCE — Projet du module"]));
      card.appendChild(el("h3", { class: "acv-h3", style: "margin-top:8px" }, [qdef.id + " · " + qdef.label]));
      card.appendChild(el("p", {}, [qdef.prompt]));
      card.appendChild(field(null, textarea("proj-" + stepId, p[stepId], function (v) { p[stepId] = v; }, 130)));
      card.appendChild(nav(function () {
        if (!p[stepId].trim()) { toast("⚠️ Répondez à " + qdef.id + " avant de continuer."); return false; }
        return true;
      }));
    } else if (stepId === "brief") {
      card.appendChild(el("h3", { class: "acv-h3" }, ["7 · Choisir un brief concret"]));
      card.appendChild(el("p", { class: "acv-lead" }, ["Décrivez un brief réel ou plausible que ce client pourrait vous confier — c'est sur ce brief précis que portera votre réponse Q5."]));
      card.appendChild(field(null, textarea("proj-brief", p.brief, function (v) { p.brief = v; }, 130)));
      card.appendChild(nav(function () {
        if (!p.brief.trim()) { toast("⚠️ Décrivez un brief avant de continuer."); return false; }
        return true;
      }));
    } else if (stepId === "q5") {
      card.appendChild(el("div", { class: "acv-callout addendum" }, [
        el("div", { class: "lbl" }, ["🟣 ADDENDUM Q5 — VALIDÉ"]),
        el("p", {}, [addendum.prompt]),
        el("p", { style: "font-size:.78rem;color:var(--acv-muted);margin-top:8px" }, [addendum.governance])
      ]));
      card.appendChild(field(null, textarea("proj-q5", p.q5, function (v) { p.q5 = v; }, 130)));
      card.appendChild(nav(function () {
        if (!p.q5.trim()) { toast("⚠️ Répondez à Q5 avant de continuer."); return false; }
        return true;
      }));
    } else if (stepId === "exemple") {
      card.appendChild(el("span", { class: "acv-tag source" }, ["SOURCE — Corrigé du Projet"]));
      card.appendChild(el("h3", { class: "acv-h3", style: "margin-top:8px" }, [m1.projetSource.corrige.titre]));
      var box = el("div", { class: "acv-example-box" });
      m1.projetSource.corrige.items.forEach(function (it) { box.appendChild(el("p", { html: it })); });
      card.appendChild(box);
      card.appendChild(el("p", { class: "acv-lead" }, [m1.projetSource.corrige.note]));
      card.appendChild(nav());
    } else if (stepId === "checklist") {
      card.appendChild(el("h3", { class: "acv-h3" }, ["Checklist avant validation"]));
      var items = checklistItems(p);
      var ul = el("ul", { class: "acv-checklist" });
      items.forEach(function (it) {
        var li = el("li", {}, [(it.done ? "✓ " : "○ ") + it.label]);
        li.style.opacity = it.done ? "1" : ".6";
        ul.appendChild(li);
      });
      card.appendChild(ul);
      var allDone = items.every(function (it) { return it.done; });
      var row = el("div", { class: "acv-btn-row" });
      row.appendChild(el("button", { class: "acv-btn ghost", onclick: function () { projectStepIndex--; render(); } }, ["← Précédent"]));
      row.appendChild(el("button", { class: "acv-btn violet", disabled: allDone ? null : "disabled", onclick: validateProject }, ["Valider ma charte"]));
      card.appendChild(row);
      if (!allDone) card.appendChild(el("p", { class: "acv-lead", style: "margin-top:8px" }, ["Complétez les éléments manquants ci-dessus pour valider."]));
    }
  }

  function checklistItems(p) {
    return [
      { label: "Client fictif renseigné", done: !!p.client.nom.trim() },
      { label: "Au moins un outil IA identifié", done: !!p.outil1.trim() },
      { label: "Q1 — Cas d'usage", done: !!p.q1.trim() },
      { label: "Q2 — Vérification", done: !!p.q2.trim() },
      { label: "Q3 — Droits", done: !!p.q3.trim() },
      { label: "Q4 — Fidélité culturelle", done: !!p.q4.trim() },
      { label: "Brief concret décrit", done: !!p.brief.trim() },
      { label: "Q5 — Addendum (recours IA justifié)", done: !!p.q5.trim() }
    ];
  }

  function field(label, inputNode) {
    var wrap = el("div", { class: "acv-field" });
    if (label) wrap.appendChild(el("label", {}, [label]));
    wrap.appendChild(inputNode);
    return wrap;
  }
  function textInput(id, value, onInput) {
    var i = el("input", { class: "acv-input", id: id, type: "text", value: value || "" });
    i.addEventListener("input", function () { onInput(i.value); autosave(); });
    return i;
  }
  function textarea(id, value, onInput, minH) {
    var t = el("textarea", { class: "acv-textarea", id: id, style: minH ? ("min-height:" + minH + "px") : null });
    t.value = value || "";
    t.addEventListener("input", function () { onInput(t.value); autosave(); });
    return t;
  }
  var autosaveTimer = null;
  function autosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () {
      state.project.m1.updatedAt = new Date().toISOString();
      saveState();
    }, 400);
  }
  function saveProjectField() {
    state.project.m1.updatedAt = new Date().toISOString();
    saveState();
  }

  function validateProject() {
    var p = state.project.m1;
    var items = checklistItems(p);
    if (!items.every(function (it) { return it.done; })) { toast("⚠️ Checklist incomplète."); return; }
    p.status = "valide";
    p.submittedAt = new Date().toISOString();
    saveState();
    if (!p.xpAwarded) {
      p.xpAwarded = true;
      saveState();
      awardXP(XP_RULES.projetValide, "Projet du Module 1 validé");
    } else {
      checkBadges();
    }
    projectStepIndex = 0;
    render();
  }

  function projectValidatedCard(p) {
    var card = el("div", { class: "acv-card accent" });
    card.appendChild(el("span", { class: "acv-tag ok" }, ["✓ Charte validée"]));
    card.appendChild(el("h3", { class: "acv-h3", style: "margin-top:10px" }, ["Charte — " + escapeHtml(p.client.nom)]));
    card.appendChild(el("p", { class: "acv-lead" }, ["Soumise le " + new Date(p.submittedAt).toLocaleString("fr-FR")]));

    var rows = [
      ["Client", p.client.nom + (p.client.type ? " (" + p.client.type + ")" : "")],
      ["Outils IA", [p.outil1, p.outil2].filter(Boolean).join(", ")],
      ["Q1 — Cas d'usage", p.q1],
      ["Q2 — Vérification", p.q2],
      ["Q3 — Droits", p.q3],
      ["Q4 — Fidélité culturelle", p.q4],
      ["Brief traité", p.brief]
    ];
    rows.forEach(function (r) {
      card.appendChild(el("div", { style: "margin-top:14px" }, [
        el("div", { class: "acv-eyebrow", style: "margin-bottom:4px" }, [r[0]]),
        el("p", {}, [escapeHtml(r[1])])
      ]));
    });

    card.appendChild(el("div", { class: "acv-callout addendum", style: "margin-top:16px" }, [
      el("div", { class: "lbl" }, ["🟣 Q5 · ADDENDUM VALIDÉ"]),
      el("p", {}, [escapeHtml(p.q5)])
    ]));

    card.appendChild(el("button", { class: "acv-btn ghost sm", style: "margin-top:16px", onclick: function () { p.status = "brouillon"; saveState(); projectStepIndex = PROJECT_STEPS.length - 1; render(); } }, ["Modifier"]));
    return card;
  }

  /* ============================================================
     11. VUE — BADGES
     ============================================================ */
  function viewBadges() {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["BADGES"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Vos accomplissements"]));
    frag.appendChild(el("p", { class: "acv-lead" }, ["Débloqués par des actions pédagogiques réelles sur le Module 1."]));
    var grid = el("div", { class: "acv-badges-grid" });
    BADGES.forEach(function (b) {
      var unlocked = !!state.badges.unlocked[b.id];
      grid.appendChild(el("div", { class: "acv-badge" + (unlocked ? " unlocked" : "") }, [
        el("div", { class: "icon" }, [b.icon]),
        el("div", { class: "name" }, [b.name]),
        el("div", { class: "desc" }, [b.desc])
      ]));
    });
    frag.appendChild(grid);
    frag.appendChild(footnote());
    return frag;
  }

  /* ============================================================
     12. VUE — CLASSEMENT (local, démonstration)
     ============================================================ */
  function viewClassement() {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["CLASSEMENT LOCAL — DÉMONSTRATION"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Classement"]));
    frag.appendChild(el("p", { class: "acv-lead" }, [
      "Ce classement est une démonstration locale, calculée uniquement dans ce navigateur. Aucune base de données ni compte multi-utilisateur n'existe à ce stade : vos points réels sont comparés à des repères fictifs de démonstration, jamais à d'autres apprenants réels."
    ]));
    var demoEntries = [
      { name: "Repère démonstration A", xp: 640 },
      { name: "Repère démonstration B", xp: 320 },
      { name: "Repère démonstration C", xp: 90 }
    ];
    var all = demoEntries.concat([{ name: state.user.name + " (vous)", xp: state.user.xp, me: true }]);
    all.sort(function (a, b) { return b.xp - a.xp; });
    var list = el("div", {});
    all.forEach(function (e, i) {
      list.appendChild(el("div", { class: "acv-lb-row" + (e.me ? " me" : "") }, [
        el("div", { class: "acv-lb-rank" }, [String(i + 1)]),
        el("div", { class: "acv-lb-name" }, [e.name]),
        el("div", { class: "acv-lb-xp" }, [e.xp + " XP"])
      ]));
    });
    frag.appendChild(list);
    frag.appendChild(footnote());
    return frag;
  }

  /* ============================================================
     13. VUE — CERTIFICAT
     ============================================================ */
  function viewCertificat() {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("div", { class: "acv-eyebrow" }, ["CERTIFICAT"]));
    frag.appendChild(el("h1", { class: "acv-h1" }, ["Certificat — Module 1"]));

    var pct = moduleProgress(state, "m1");
    if (pct < 1) {
      frag.appendChild(el("div", { class: "acv-card" }, [
        el("p", { class: "locked-msg" }, ["🔒 Terminez 100% du Module 1 (leçons, exercice, travail pratique, quiz réussi et projet validé) pour débloquer votre certificat."]),
        el("div", { class: "acv-progress", style: "margin-top:10px" }, [el("span", { style: "width:" + Math.round(pct * 100) + "%" })])
      ]));
      frag.appendChild(footnote());
      return frag;
    }

    var cert = el("div", { class: "acv-certificate" });
    cert.appendChild(el("div", { class: "mark" }, ["ART-CREAVISION® ACADEMY"]));
    cert.appendChild(el("p", { style: "margin-top:14px" }, ["Ce certificat atteste que"]));
    cert.appendChild(el("div", { class: "name" }, [state.user.name]));
    cert.appendChild(el("p", {}, ["a complété avec succès le"]));
    cert.appendChild(el("h3", { class: "acv-h3", style: "margin:8px 0" }, [window.ACV_M1_DATA.title]));
    cert.appendChild(el("p", { class: "locked-msg", style: "margin-top:16px" }, ["Démonstration locale — non signé, non vérifiable. Une version officielle vérifiable nécessiterait un backend dédié (hors périmètre de cette version)."]));
    frag.appendChild(cert);
    frag.appendChild(footnote());
    return frag;
  }

  /* ============================================================
     14. INIT
     ============================================================ */
  function init() {
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
