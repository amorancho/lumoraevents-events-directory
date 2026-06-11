(function () {
  var STORAGE_KEY = "lumoraevents-language";
  var DEFAULT_LANGUAGE = "es";
  var listeners = [];
  var supportedLanguages = ["es", "en"];
  var localeMap = {
    es: "es-ES",
    en: "en-GB"
  };

  var translations = {
    es: {
      index: {
        pageTitle: "Directorio de eventos de Bellydance | LumoraEvents",
        metaDescription: "Encuentra festivales, competiciones y encuentros de Bellydance en todo el mundo con este directorio estático de ejemplo impulsado por LumoraEvents.",
        heroTitle: "Directorio de eventos de Bellydance",
        heroSubtitle: "Encuentra festivales, competiciones y encuentros de Bellydance en todo el mundo.",
        poweredByLabel: "Powered by LumoraEvents",
        poweredByText: "Un escaparate internacional preparado para conectar más adelante con la API de LumoraEvents.",
        filtersTitle: "Filtrar eventos",
        compactListLabel: "Vista compacta",
        searchLabel: "Buscar",
        searchPlaceholder: "Nombre, ciudad, país o tipo",
        countryLabel: "País",
        monthLabel: "Mes",
        allCountries: "Todos los países",
        allMonths: "Todos los meses",
        resultsTitle: "Próximos eventos",
        resultsIntro: "Explora un listado de ejemplo con festivales, competiciones y retiros internacionales pensados para una futura integración con LumoraEvents.",
        viewDetails: "Ver detalles",
        emptyTitle: "No hay resultados para esos filtros",
        emptyText: "Prueba con otro país, otro mes o una búsqueda más amplia para descubrir más eventos.",
        footerText: "Esta primera versión estática está preparada para evolucionar hacia un directorio conectado a la API de LumoraEvents.",
        resultCountOne: "Mostrando 1 evento",
        resultCountOther: "Mostrando {count} eventos"
      },
      event: {
        fallbackTitle: "Evento de Bellydance | LumoraEvents",
        fallbackDescription: "Consulta la ficha detallada de un evento de Bellydance en este directorio estático de ejemplo de LumoraEvents.",
        notFoundTitle: "Evento no encontrado",
        notFoundText: "El evento solicitado no existe o ya no está disponible en esta demostración estática.",
        backHome: "Volver al directorio",
        detailsLabel: "Ficha del evento",
        descriptionTitle: "Sobre este evento",
        linksTitle: "Enlaces del evento",
        contactTitle: "¿Eres el organizador de este evento?",
        contactText: "Contáctanos para actualizar la información, completar la ficha o conocer LumoraEvents.",
        contactAction: "Contactar",
        contactEmailBody: "Hola,\n\nQuiero actualizar la información de este evento o conocer mejor LumoraEvents.\n",
        posterLabel: "Cartel del evento",
        posterFallbackLabel: "Cartel no disponible"
      },
      common: {
        city: "Ciudad",
        country: "País",
        dates: "Fechas",
        eventType: "Tipo de evento",
        website: "Web oficial",
        instagram: "Instagram",
        backToList: "Volver al listado",
        locationLabel: "Ubicación"
      }
    },
    en: {
      index: {
        pageTitle: "Bellydance Event Directory | LumoraEvents",
        metaDescription: "Find Bellydance festivals, competitions, and gatherings around the world through this static sample directory powered by LumoraEvents.",
        heroTitle: "Bellydance Event Directory",
        heroSubtitle: "Find Bellydance festivals, competitions, and gatherings around the world.",
        poweredByLabel: "Powered by LumoraEvents",
        poweredByText: "An international showcase prepared for a future connection to the LumoraEvents API.",
        filtersTitle: "Filter events",
        compactListLabel: "Compact view",
        searchLabel: "Search",
        searchPlaceholder: "Name, city, country, or type",
        countryLabel: "Country",
        monthLabel: "Month",
        allCountries: "All countries",
        allMonths: "All months",
        resultsTitle: "Upcoming events",
        resultsIntro: "Browse a sample listing of festivals, competitions, and retreats designed for a future LumoraEvents API integration.",
        viewDetails: "View details",
        emptyTitle: "No results match these filters",
        emptyText: "Try another country, month, or a broader search to discover more events.",
        footerText: "This first static version is prepared to evolve into a directory connected to the LumoraEvents API.",
        resultCountOne: "Showing 1 event",
        resultCountOther: "Showing {count} events"
      },
      event: {
        fallbackTitle: "Bellydance Event | LumoraEvents",
        fallbackDescription: "Read the detailed page for a Bellydance event in this static sample directory by LumoraEvents.",
        notFoundTitle: "Event not found",
        notFoundText: "The requested event does not exist or is no longer available in this static demo.",
        backHome: "Back to directory",
        detailsLabel: "Event details",
        descriptionTitle: "About this event",
        linksTitle: "Event links",
        contactTitle: "Are you the organizer of this event?",
        contactText: "Contact us to update the information, complete the profile, or learn more about LumoraEvents.",
        contactAction: "Get in touch",
        contactEmailBody: "Hello,\n\nI would like to update this event information or learn more about LumoraEvents.\n",
        posterLabel: "Event poster",
        posterFallbackLabel: "Poster unavailable"
      },
      common: {
        city: "City",
        country: "Country",
        dates: "Dates",
        eventType: "Event type",
        website: "Official website",
        instagram: "Instagram",
        backToList: "Back to listing",
        locationLabel: "Location"
      }
    }
  };

  var currentLanguage = getInitialLanguage();

  function getInitialLanguage() {
    var savedLanguage = "";

    try {
      savedLanguage = window.localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      savedLanguage = "";
    }

    return supportedLanguages.indexOf(savedLanguage) >= 0 ? savedLanguage : DEFAULT_LANGUAGE;
  }

  function getCurrentLanguage() {
    return currentLanguage;
  }

  function setLanguage(language) {
    if (supportedLanguages.indexOf(language) === -1 || language === currentLanguage) {
      return;
    }

    currentLanguage = language;

    try {
      window.localStorage.setItem(STORAGE_KEY, currentLanguage);
    } catch (error) {
      // Ignore storage limitations and keep the session language in memory.
    }

    applyDocumentLanguage();
    applyTranslations(document);
    updateLanguageButtons();
    emitLanguageChange();
  }

  function applyDocumentLanguage() {
    document.documentElement.lang = currentLanguage;
  }

  function resolveTranslation(key, language) {
    return key.split(".").reduce(function (segment, token) {
      return segment && Object.prototype.hasOwnProperty.call(segment, token) ? segment[token] : null;
    }, translations[language]);
  }

  function interpolate(template, values) {
    if (typeof template !== "string" || !values) {
      return template;
    }

    return template.replace(/\{(\w+)\}/g, function (_, token) {
      return Object.prototype.hasOwnProperty.call(values, token) ? values[token] : "";
    });
  }

  function t(key, values) {
    var translated = resolveTranslation(key, currentLanguage) || resolveTranslation(key, DEFAULT_LANGUAGE) || key;
    return interpolate(translated, values);
  }

  function applyTranslations(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }

    root.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      element.setAttribute("placeholder", t(element.getAttribute("data-i18n-placeholder")));
    });

    root.querySelectorAll("[data-i18n-aria-label]").forEach(function (element) {
      element.setAttribute("aria-label", t(element.getAttribute("data-i18n-aria-label")));
    });
  }

  function initLanguageSwitcher() {
    document.querySelectorAll("[data-language-switcher]").forEach(function (switcher) {
      if (switcher.dataset.bound === "true") {
        return;
      }

      switcher.addEventListener("click", function (event) {
        var target = event.target.closest("[data-lang]");
        if (!target) {
          return;
        }

        setLanguage(target.getAttribute("data-lang"));
      });

      switcher.dataset.bound = "true";
    });

    updateLanguageButtons();
  }

  function updateLanguageButtons() {
    document.querySelectorAll("[data-lang]").forEach(function (button) {
      var isActive = button.getAttribute("data-lang") === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function onLanguageChange(listener) {
    listeners.push(listener);
  }

  function emitLanguageChange() {
    listeners.forEach(function (listener) {
      listener(currentLanguage);
    });
  }

  function getMonthName(monthNumber, language) {
    var date = new Date(Date.UTC(2026, monthNumber - 1, 1));
    return new Intl.DateTimeFormat(localeMap[language || currentLanguage], {
      month: "long"
    }).format(date);
  }

  function formatDateRange(startDate, endDate, language) {
    var activeLanguage = language || currentLanguage;
    var locale = localeMap[activeLanguage];
    var start = new Date(startDate + "T00:00:00");
    var end = new Date(endDate + "T00:00:00");

    if (startDate === endDate) {
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(start);
    }

    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()
    ) {
      var monthYear = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric"
      }).format(start);

      return activeLanguage === "es"
        ? start.getDate() + " - " + end.getDate() + " de " + monthYear
        : start.getDate() + " - " + end.getDate() + " " + monthYear;
    }

    var formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    return formatter.format(start) + " - " + formatter.format(end);
  }

  function initPage() {
    applyDocumentLanguage();
    applyTranslations(document);
    initLanguageSwitcher();
  }

  window.LumoraEventsI18n = {
    translations: translations,
    getCurrentLanguage: getCurrentLanguage,
    setLanguage: setLanguage,
    t: t,
    initPage: initPage,
    onLanguageChange: onLanguageChange,
    getMonthName: getMonthName,
    formatDateRange: formatDateRange
  };
})();
