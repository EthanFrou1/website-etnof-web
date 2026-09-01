(function () {
  const STEPS = [
    {
      id: "type",
      title: "Quel type de site souhaitez-vous ?",
      subtitle: "Choisissez la formule qui se rapproche le plus de votre projet.",
      type: "single",
      choices: [
        {
          id: "essentiel",
          label: "Landing page / Site vitrine",
          desc: "Jusqu'à 5 pages — présence professionnelle simple",
          price: 690,
        },
        {
          id: "business",
          label: "Site Business",
          desc: "Jusqu'à 10 pages — visibilité et génération de contacts",
          price: 1090,
        },
        {
          id: "sur-mesure",
          label: "Application / Sur mesure",
          desc: "Fonctionnalités avancées, automatisations, API",
          price: 1990,
        },
      ],
    },
    {
      id: "options",
      title: "Souhaitez-vous ajouter des options ?",
      subtitle: "Sélectionnez tout ce dont vous avez besoin (facultatif).",
      type: "multi",
      choices: [
        { id: "page", label: "Page supplémentaire", price: 80 },
        { id: "blog", label: "Blog", price: 250 },
        { id: "multilingue", label: "Multilingue", price: 250 },
        { id: "rdv", label: "Prise de rendez-vous", price: 290 },
        { id: "stripe", label: "Paiement par carte (Stripe)", price: 350 },
        { id: "newsletter", label: "Newsletter", price: 190 },
        { id: "avis", label: "Avis Google", price: 100 },
        { id: "whatsapp", label: "WhatsApp", price: 90 },
        { id: "catalogue", label: "Catalogue produits (boutique en ligne)", price: 690 },
        { id: "compteclient", label: "Compte client", price: 250 },
        { id: "fidelite", label: "Programme de fidélité", price: 190 },
        { id: "galerie", label: "Galerie photo", price: 100 },
        {
          id: "pagesperso",
          label: "Pages personnalisées supplémentaires",
          desc: "Déjà incluses dans la formule Sur mesure",
          price: 150,
        },
        { id: "stats", label: "Statistiques (Google Analytics)", price: 120 },
        {
          id: "espacegestion",
          label: "Accès à votre espace de gestion",
          desc: "Identifiants et formation pour gérer vous-même votre contenu (Essentiel uniquement)",
          price: 190,
        },
        {
          id: "seo",
          label: "SEO avancé",
          desc: "Recherche de mots-clés, rédaction optimisée, stratégie de référencement",
          price: 390,
        },
        { id: "logo", label: "Logo", price: 190 },
        { id: "charte", label: "Charte graphique", price: 390 },
      ],
    },
    {
      id: "maintenance",
      title: "Un forfait de maintenance mensuelle ?",
      subtitle: "Pour garder un site à jour, sauvegardé et surveillé après la mise en ligne.",
      type: "single",
      choices: [
        { id: "aucune", label: "Aucune pour le moment", price: 0 },
        {
          id: "essentielle",
          label: "Essentielle",
          desc: "Sauvegardes, mises à jour, surveillance",
          price: 19,
        },
        {
          id: "business",
          label: "Business",
          desc: "+ 30 min de modifications, support prioritaire",
          price: 39,
        },
        {
          id: "premium",
          label: "Premium",
          desc: "+ 2h de modifications, SEO léger, conseils mensuels",
          price: 69,
        },
      ],
    },
  ];

  const overlay = document.getElementById("estimator-overlay");
  const openBtn = document.getElementById("estimator-open");
  const closeBtn = document.getElementById("estimator-close");
  const modalBox = document.getElementById("estimator-modal");
  const contentEl = document.getElementById("estimator-content");
  const progressEl = document.getElementById("estimator-progress");
  const backBtn = document.getElementById("estimator-back");
  const nextBtn = document.getElementById("estimator-next");

  if (!overlay || !openBtn || !modalBox || !contentEl) {
    return;
  }

  const TOTAL_STEPS = STEPS.length + 1;
  let stepIndex = 0;
  let lastFocused = null;
  const answers = { type: null, options: [], maintenance: "aucune" };

  function formatPrice(value) {
    return value.toLocaleString("fr-FR");
  }

  function findChoice(step, id) {
    return step.choices.find((choice) => choice.id === id);
  }

  function computeTotal() {
    const typeChoice = findChoice(STEPS[0], answers.type);
    const base = typeChoice ? typeChoice.price : 0;
    const optionChoices = answers.options
      .map((id) => findChoice(STEPS[1], id))
      .filter(Boolean);
    const optionsTotal = optionChoices.reduce((sum, choice) => sum + choice.price, 0);
    const maintenanceChoice = findChoice(STEPS[2], answers.maintenance);
    const monthly = maintenanceChoice ? maintenanceChoice.price : 0;

    return {
      typeChoice,
      optionChoices,
      maintenanceChoice,
      base,
      optionsTotal,
      total: base + optionsTotal,
      monthly,
    };
  }

  function renderProgress() {
    const dots = [];
    for (let i = 0; i < TOTAL_STEPS; i += 1) {
      let state = "";
      if (i === stepIndex) state = "is-active";
      else if (i < stepIndex) state = "is-done";
      dots.push('<span class="modal-progress-dot ' + state + '"></span>');
    }
    progressEl.innerHTML = dots.join("");
  }

  function renderChoiceStep(step) {
    const isMulti = step.type === "multi";
    const cardsHtml = step.choices
      .map((choice) => {
        const selected = isMulti
          ? answers.options.indexOf(choice.id) > -1
          : answers[step.id] === choice.id;
        const desc = choice.desc
          ? '<span class="estimator-choice-desc">' + choice.desc + "</span>"
          : "";
        let priceLabel;
        if (choice.price > 0) {
          priceLabel = "+" + formatPrice(choice.price) + " €" + (step.id === "maintenance" ? "/mois" : "");
        } else {
          priceLabel = step.id === "maintenance" ? "—" : "Inclus";
        }

        return (
          '<button type="button" class="estimator-choice' +
          (selected ? " is-selected" : "") +
          '" data-choice="' +
          choice.id +
          '" aria-pressed="' +
          selected +
          '">' +
          '<span class="estimator-choice-main">' +
          '<span class="estimator-choice-label">' +
          choice.label +
          "</span>" +
          desc +
          "</span>" +
          '<span class="estimator-choice-price">' +
          priceLabel +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    contentEl.innerHTML =
      '<p class="eyebrow">Étape ' +
      (stepIndex + 1) +
      " / " +
      TOTAL_STEPS +
      "</p>" +
      "<h2>" +
      step.title +
      "</h2>" +
      (step.subtitle ? '<p class="estimator-subtitle">' + step.subtitle + "</p>" : "") +
      '<div class="estimator-choices">' +
      cardsHtml +
      "</div>";

    const choiceButtons = contentEl.querySelectorAll(".estimator-choice");
    choiceButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-choice");
        if (isMulti) {
          const pos = answers.options.indexOf(id);
          const nowSelected = pos === -1;
          if (nowSelected) {
            answers.options.push(id);
          } else {
            answers.options.splice(pos, 1);
          }
          btn.classList.toggle("is-selected", nowSelected);
          btn.setAttribute("aria-pressed", String(nowSelected));
        } else {
          answers[step.id] = id;
          choiceButtons.forEach((otherBtn) => {
            const isSelected = otherBtn === btn;
            otherBtn.classList.toggle("is-selected", isSelected);
            otherBtn.setAttribute("aria-pressed", String(isSelected));
          });
        }
        updateNextButtonState();
      });
    });
  }

  function updateNextButtonState() {
    if (stepIndex >= STEPS.length) return;
    const step = STEPS[stepIndex];
    const canProceed = step.type === "multi" || Boolean(answers[step.id]);
    nextBtn.disabled = !canProceed;
  }

  function renderResultStep() {
    const { typeChoice, optionChoices, maintenanceChoice, base, optionsTotal, total, monthly } =
      computeTotal();

    const optionsListHtml = optionChoices.length
      ? '<ul class="estimator-result-list">' +
        optionChoices
          .map((choice) => "<li>" + choice.label + " <span>+" + formatPrice(choice.price) + " €</span></li>")
          .join("") +
        "</ul>"
      : '<p class="estimator-subtitle">Aucune option sélectionnée.</p>';

    const maintenanceLineHtml =
      maintenanceChoice && maintenanceChoice.price > 0
        ? '<p class="estimator-result-monthly">+ ' +
          formatPrice(monthly) +
          " €/mois de maintenance (" +
          maintenanceChoice.label +
          ")</p>"
        : "";

    const subject = encodeURIComponent(
      "Estimation - " + (typeChoice ? typeChoice.label : "Projet web")
    );
    const bodyLines = [
      "Bonjour,",
      "",
      "Voici ma configuration testée sur le simulateur de tarifs :",
      "- Formule : " + (typeChoice ? typeChoice.label : "-"),
      optionChoices.length
        ? "- Options : " + optionChoices.map((choice) => choice.label).join(", ")
        : "- Options : aucune",
      maintenanceChoice && maintenanceChoice.price > 0
        ? "- Maintenance : " + maintenanceChoice.label
        : "- Maintenance : aucune",
      "- Estimation totale : environ " +
        formatPrice(total) +
        " € HT" +
        (monthly > 0 ? " + " + formatPrice(monthly) + " €/mois" : ""),
      "",
      "Je souhaite en discuter et obtenir un devis précis.",
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    const mailtoHref = "mailto:etnofweb@gmail.com?subject=" + subject + "&body=" + body;

    contentEl.innerHTML =
      '<p class="eyebrow">Votre estimation</p>' +
      "<h2>Environ " +
      formatPrice(total) +
      " € HT</h2>" +
      '<p class="estimator-subtitle">Formule ' +
      (typeChoice ? typeChoice.label : "") +
      " — base " +
      formatPrice(base) +
      " €" +
      (optionsTotal > 0 ? " + " + formatPrice(optionsTotal) + " € d'options" : "") +
      "</p>" +
      optionsListHtml +
      maintenanceLineHtml +
      '<p class="estimator-disclaimer">Cette estimation est indicative et peut varier selon la ' +
      "complexité réelle du projet. Un devis précis et gratuit est établi après un premier " +
      "échange.</p>" +
      '<div class="estimator-result-actions">' +
      '<a class="button button-primary" href="' +
      mailtoHref +
      '">Demander un devis gratuit</a>' +
      '<button type="button" class="button button-secondary" id="estimator-restart">Recommencer</button>' +
      "</div>";

    const restartBtn = document.getElementById("estimator-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", resetEstimator);
    }
  }

  function renderStep() {
    renderProgress();

    const isResult = stepIndex === STEPS.length;

    if (isResult) {
      renderResultStep();
    } else {
      renderChoiceStep(STEPS[stepIndex]);
    }

    backBtn.hidden = stepIndex === 0;
    nextBtn.hidden = isResult;

    if (!isResult) {
      updateNextButtonState();
      nextBtn.textContent = stepIndex === STEPS.length - 1 ? "Voir mon estimation" : "Suivant";
    }

    modalBox.scrollTop = 0;
    contentEl.focus({ preventScroll: true });
  }

  function resetEstimator() {
    stepIndex = 0;
    answers.type = null;
    answers.options = [];
    answers.maintenance = "aucune";
    renderStep();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key === "Tab") {
      trapFocus(event);
    }
  }

  function trapFocus(event) {
    const focusable = modalBox.querySelectorAll(
      "button:not([hidden]):not([disabled]), a[href]"
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    resetEstimator();
    modalBox.focus({ preventScroll: true });
    document.addEventListener("keydown", handleKeydown);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  backBtn.addEventListener("click", () => {
    if (stepIndex > 0) {
      stepIndex -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (stepIndex < TOTAL_STEPS - 1) {
      stepIndex += 1;
      renderStep();
    }
  });
})();
