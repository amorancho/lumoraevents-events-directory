(function () {
  var STORAGE_KEY = "lumoraevents-language";
  var DEFAULT_LANGUAGE = "es";
  var listeners = [];
  var supportedLanguages = ["es", "en"];
  var localeMap = {
    es: "es-ES",
    en: "en-GB"
  };
  var countryCodes = (
    "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ " +
    "BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
    "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ " +
    "DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
    "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY " +
    "HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT " +
    "JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ " +
    "LA LB LC LI LK LR LS LT LU LV LY " +
    "MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
    "NA NC NE NF NG NI NL NO NP NR NU NZ OM " +
    "PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
    "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ " +
    "TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ " +
    "UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
  ).split(" ");
  var eventTypeNames = {
    es: {
      FESTIVAL: "Festival",
      GALA: "Gala",
      WORKSHOPS: "Talleres",
      MASTERCLASSES: "Clases magistrales",
      WORKSHOP: "Taller",
      CONGRESS: "Congreso",
      SUMMIT: "Cumbre",
      COMPETITION: "Competición",
      RETREAT: "Retiro",
      GATHERING: "Encuentro",
      SHOWCASE: "Exhibición"
    },
    en: {
      FESTIVAL: "Festival",
      GALA: "Gala",
      WORKSHOPS: "Workshops",
      MASTERCLASSES: "Masterclasses",
      WORKSHOP: "Workshop",
      CONGRESS: "Congress",
      SUMMIT: "Summit",
      COMPETITION: "Competition",
      RETREAT: "Retreat",
      GATHERING: "Gathering",
      SHOWCASE: "Showcase"
    }
  };
  var countryDisplayNames = {};

  var translations = {
    es: {
      index: {
        pageTitle: "Directorio de eventos de Bellydance | LumoraEvents",
        metaDescription: "Encuentra festivales, competiciones y encuentros de Bellydance en todo el mundo con el directorio de LumoraEvents.",
        heroTitle: "Directorio de eventos de Bellydance",
        heroSubtitle: "Encuentra festivales, competiciones y encuentros de Bellydance en todo el mundo.",
        filtersTitle: "Buscar eventos",
        nameLabel: "Nombre",
        namePlaceholder: "Nombre del evento",
        countryLabel: "País",
        allCountries: "Todos los países",
        monthLabel: "Mes",
        allMonths: "Todos los meses",
        pageSizeShortLabel: "Por página",
        applyFilters: "Buscar",
        clearFilters: "Limpiar",
        organizerTitle: "¿No encuentras tu evento?",
        organizerTextBefore: "¿Quieres formar parte de Lumora Bellydance Directory?",
        organizerContact: "Contáctanos",
        organizerTextAfter: "y estaremos encantados de añadir tu evento.",
        managedByLumora: "Gestionado por LumoraEvents",
        resultsTitle: "Próximos eventos",
        resultsIntro: "Explora los próximos festivales, competiciones, congresos y encuentros publicados en LumoraEvents.",
        viewDetails: "Ver detalles",
        posterLinkLabel: "Abrir la ficha de {name}",
        emptyTitle: "No hay próximos eventos",
        emptyText: "Vuelve pronto para descubrir nuevas fechas y encuentros.",
        emptyFilteredTitle: "No hay eventos para esta búsqueda",
        emptyFilteredText: "Prueba con otro nombre, país o mes.",
        loadingTitle: "Cargando eventos",
        loadingText: "Estamos consultando los próximos eventos de LumoraEvents.",
        loadingCount: "Cargando…",
        unavailableCount: "No disponible",
        errorTitle: "No hemos podido cargar los eventos",
        errorText: "La conexión con LumoraEvents no está disponible en este momento. Inténtalo de nuevo.",
        retryAction: "Reintentar",
        paginationLabel: "Paginación de eventos",
        previousPage: "Anterior",
        nextPage: "Siguiente",
        currentPage: "Página {page}, actual",
        resultCountZero: "Mostrando 0 eventos",
        resultCountOne: "Mostrando 1 evento",
        resultCountRange: "Mostrando {start}–{end} de {total} eventos"
      },
      event: {
        fallbackTitle: "Evento de Bellydance | LumoraEvents",
        fallbackDescription: "Consulta la ficha detallada de un evento de Bellydance publicado en LumoraEvents.",
        notFoundTitle: "Evento no encontrado",
        notFoundText: "El evento solicitado no existe o ya no está disponible.",
        backHome: "Volver al directorio",
        loadingTitle: "Cargando evento",
        loadingText: "Estamos consultando la información del evento.",
        errorTitle: "No hemos podido cargar el evento",
        errorText: "La conexión con LumoraEvents no está disponible en este momento.",
        retryAction: "Reintentar",
        descriptionTitle: "Sobre este evento",
        linksTitle: "Enlaces del evento",
        contactTitle: "¿Eres el organizador de este evento?",
        contactText: "Contáctanos para actualizar la información, completar la ficha o conocer LumoraEvents.",
        contactAction: "Contactar",
        contactEmailBody: "Hola,\n\nQuiero actualizar la información de este evento o conocer mejor LumoraEvents.\n",
        posterFallbackLabel: "Cartel no disponible",
        managedByLumora: "Gestionado por LumoraEvents",
        updatedAt: "Actualizado el {date}"
      },
      common: {
        city: "Ciudad",
        country: "País",
        venue: "Lugar",
        organizer: "Organizador",
        dates: "Fechas",
        eventType: "Tipo de evento",
        masters: "Artistas / maestros",
        danceStyles: "Estilos de danza",
        website: "Web oficial",
        registration: "Inscripción",
        instagram: "Instagram",
        facebook: "Facebook",
        tiktok: "TikTok",
        youtube: "YouTube",
        contactEmail: "Correo de contacto",
        backToList: "Volver al listado",
        locationLabel: "Ubicación"
      },
      favorites: {
        add: "Añadir a favoritos",
        remove: "Quitar de favoritos",
        storageNotice: "Tus favoritos se guardan en este dispositivo y navegador."
      },
      legalPage: {
        loadingTitle: "Cargando información legal",
        loadingText: "Estamos preparando el contenido de esta página.",
        errorTitle: "No hemos podido cargar esta página",
        errorText: "El contenido legal no está disponible en este momento.",
        retryAction: "Reintentar"
      },
      footer: {
        tagline: "Conectando artistas, organizadores y amantes de la danza oriental en todo el mundo.",
        contactTitle: "Contacto",
        legalTitle: "Información legal",
        privacy: "Política de privacidad",
        cookies: "Política de cookies",
        legalNotice: "Aviso legal",
        rights: "© 2026 LumoraEvents. Todos los derechos reservados."
      }
    },
    en: {
      index: {
        pageTitle: "Bellydance Event Directory | LumoraEvents",
        metaDescription: "Find Bellydance festivals, competitions, and gatherings around the world in the LumoraEvents directory.",
        heroTitle: "Bellydance Event Directory",
        heroSubtitle: "Find Bellydance festivals, competitions, and gatherings around the world.",
        filtersTitle: "Search events",
        nameLabel: "Name",
        namePlaceholder: "Event name",
        countryLabel: "Country",
        allCountries: "All countries",
        monthLabel: "Month",
        allMonths: "All months",
        pageSizeShortLabel: "Per page",
        applyFilters: "Search",
        clearFilters: "Clear",
        organizerTitle: "Don't see your event?",
        organizerTextBefore: "Want to be part of the Lumora Bellydance Directory?",
        organizerContact: "Contact us",
        organizerTextAfter: "and we'll be happy to add your event.",
        managedByLumora: "Managed by LumoraEvents",
        resultsTitle: "Upcoming events",
        resultsIntro: "Browse upcoming festivals, competitions, congresses, and gatherings published on LumoraEvents.",
        viewDetails: "View details",
        posterLinkLabel: "Open details for {name}",
        emptyTitle: "There are no upcoming events",
        emptyText: "Check back soon to discover new dates and gatherings.",
        emptyFilteredTitle: "No events match this search",
        emptyFilteredText: "Try another name, country, or month.",
        loadingTitle: "Loading events",
        loadingText: "We are fetching the next events from LumoraEvents.",
        loadingCount: "Loading…",
        unavailableCount: "Unavailable",
        errorTitle: "We could not load the events",
        errorText: "LumoraEvents is currently unavailable. Please try again.",
        retryAction: "Try again",
        paginationLabel: "Event pagination",
        previousPage: "Previous",
        nextPage: "Next",
        currentPage: "Page {page}, current",
        resultCountZero: "Showing 0 events",
        resultCountOne: "Showing 1 event",
        resultCountRange: "Showing {start}–{end} of {total} events"
      },
      event: {
        fallbackTitle: "Bellydance Event | LumoraEvents",
        fallbackDescription: "Read the detailed page for a Bellydance event published on LumoraEvents.",
        notFoundTitle: "Event not found",
        notFoundText: "The requested event does not exist or is no longer available.",
        backHome: "Back to directory",
        loadingTitle: "Loading event",
        loadingText: "We are fetching the event information.",
        errorTitle: "We could not load the event",
        errorText: "LumoraEvents is currently unavailable.",
        retryAction: "Try again",
        descriptionTitle: "About this event",
        linksTitle: "Event links",
        contactTitle: "Are you the organizer of this event?",
        contactText: "Contact us to update the information, complete the profile, or learn more about LumoraEvents.",
        contactAction: "Get in touch",
        contactEmailBody: "Hello,\n\nI would like to update this event information or learn more about LumoraEvents.\n",
        posterFallbackLabel: "Poster unavailable",
        managedByLumora: "Managed by LumoraEvents",
        updatedAt: "Updated on {date}"
      },
      common: {
        city: "City",
        country: "Country",
        venue: "Venue",
        organizer: "Organizer",
        dates: "Dates",
        eventType: "Event type",
        masters: "Artists / masters",
        danceStyles: "Dance styles",
        website: "Official website",
        registration: "Registration",
        instagram: "Instagram",
        facebook: "Facebook",
        tiktok: "TikTok",
        youtube: "YouTube",
        contactEmail: "Contact email",
        backToList: "Back to listing",
        locationLabel: "Location"
      },
      favorites: {
        add: "Add to favorites",
        remove: "Remove from favorites",
        storageNotice: "Your favorites are stored on this device and browser."
      },
      legalPage: {
        loadingTitle: "Loading legal information",
        loadingText: "We are preparing the content of this page.",
        errorTitle: "We could not load this page",
        errorText: "The legal content is currently unavailable.",
        retryAction: "Try again"
      },
      footer: {
        tagline: "Connecting artists, organizers, and oriental dance lovers around the world.",
        contactTitle: "Contact",
        legalTitle: "Legal information",
        privacy: "Privacy policy",
        cookies: "Cookie policy",
        legalNotice: "Legal notice",
        rights: "© 2026 LumoraEvents. All rights reserved."
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
    if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
      return "";
    }

    var date = new Date(Date.UTC(2026, monthNumber - 1, 1));
    return new Intl.DateTimeFormat(localeMap[language || currentLanguage], {
      month: "long"
    }).format(date);
  }

  function getCountryName(countryCode, language) {
    var normalizedCode = String(countryCode || "").toUpperCase();
    var activeLanguage = language || currentLanguage;

    if (!normalizedCode) {
      return "";
    }

    try {
      if (!countryDisplayNames[activeLanguage]) {
        countryDisplayNames[activeLanguage] = new Intl.DisplayNames(
          [localeMap[activeLanguage]],
          { type: "region" }
        );
      }

      return countryDisplayNames[activeLanguage].of(normalizedCode) || normalizedCode;
    } catch (error) {
      return normalizedCode;
    }
  }

  function getCountryCodes() {
    return countryCodes.slice();
  }

  function formatMonthYear(value, language) {
    var match = String(value || "").match(/^(\d{4})-(\d{2})$/);

    if (!match) {
      return "";
    }

    var activeLanguage = language || currentLanguage;
    var date = new Date(Number(match[1]), Number(match[2]) - 1, 1, 12);

    var monthName = new Intl.DateTimeFormat(localeMap[activeLanguage], {
      month: "long"
    }).format(date);

    return monthName + " " + match[1];
  }

  function getEventTypeName(eventType, language) {
    var normalizedType = String(eventType || "").toUpperCase();
    var activeLanguage = language || currentLanguage;

    if (!normalizedType) {
      return "";
    }

    if (eventTypeNames[activeLanguage] && eventTypeNames[activeLanguage][normalizedType]) {
      return eventTypeNames[activeLanguage][normalizedType];
    }

    return normalizedType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/^./, function (firstLetter) {
        return firstLetter.toUpperCase();
      });
  }

  function formatDateRange(startDate, endDate, language) {
    var activeLanguage = language || currentLanguage;
    var locale = localeMap[activeLanguage];
    var start = parseApiDate(startDate);
    var end = parseApiDate(endDate || startDate);

    if (!start || !end) {
      return "";
    }

    if (isSameDay(start, end)) {
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

  function parseApiDate(value) {
    var match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
      return null;
    }

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  }

  function isSameDay(left, right) {
    return left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate();
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
    getCountryName: getCountryName,
    getCountryCodes: getCountryCodes,
    formatMonthYear: formatMonthYear,
    getEventTypeName: getEventTypeName,
    formatDateRange: formatDateRange
  };
})();
