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
        pageSizeLabel: "Eventos por página",
        applyFilters: "Buscar",
        clearFilters: "Limpiar",
        managedByLumora: "Gestionado por LumoraEvents",
        resultsTitle: "Próximos eventos",
        resultsIntro: "Explora los próximos festivales, competiciones, congresos y encuentros publicados en LumoraEvents.",
        viewDetails: "Ver detalles",
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
      legalNotice: {
        pageTitle: "Aviso legal | Bellydance Directory | LumoraEvents",
        metaDescription: "Consulta el aviso legal de Bellydance Directory, el directorio de eventos de LumoraEvents.",
        title: "Aviso legal",
        generalTitle: "Información general",
        generalParagraph1: "Este sitio web forma parte de LumoraEvents y tiene como objetivo facilitar información sobre eventos, competiciones, festivales y actividades relacionadas con la danza.",
        generalParagraph2: "Puedes contactar con LumoraEvents a través de los medios de contacto publicados en este sitio web.",
        directoryTitle: "Contenido del directorio",
        directoryParagraph1: "La información publicada en este directorio se obtiene principalmente de fuentes públicas, incluyendo páginas web oficiales, redes sociales y otros canales públicos utilizados por los propios eventos u organizaciones.",
        directoryParagraph2: "LumoraEvents intenta mantener la información actualizada y correcta, pero no garantiza que todos los datos publicados sean completos, exactos o estén permanentemente actualizados.",
        directoryParagraph3: "Las fechas, ubicaciones, enlaces, precios y demás información relativa a los eventos deben confirmarse siempre en los canales oficiales del propio evento.",
        updatesTitle: "Actualización o retirada de información",
        updatesParagraph: "Los responsables de un evento pueden solicitar la corrección, actualización o retirada de información publicada en el directorio contactando con LumoraEvents.",
        externalLinksTitle: "Enlaces externos",
        externalLinksParagraph1: "Este sitio contiene enlaces a páginas web y perfiles de terceros.",
        externalLinksParagraph2: "LumoraEvents no es responsable del contenido, disponibilidad, seguridad o políticas de privacidad de dichos sitios externos.",
        intellectualPropertyTitle: "Propiedad intelectual",
        intellectualPropertyParagraph1: "El diseño, estructura y desarrollo de este sitio web pertenecen a LumoraEvents.",
        intellectualPropertyParagraph2: "Las marcas, logotipos, carteles, fotografías y demás contenidos pertenecientes a eventos u organizaciones mantienen la titularidad de sus respectivos propietarios y se utilizan únicamente con finalidad informativa.",
        liabilityTitle: "Responsabilidad",
        liabilityParagraph: "LumoraEvents no organiza necesariamente los eventos incluidos en este directorio y no se responsabiliza de cambios, cancelaciones, incidencias, pagos, inscripciones o cualquier otra circunstancia relacionada con ellos.",
        updatedAt: "Última actualización: agosto de 2026."
      },
      privacyPolicy: {
        pageTitle: "Política de privacidad | Bellydance Directory | LumoraEvents",
        metaDescription: "Consulta cómo trata LumoraEvents los datos y la información pública en Bellydance Directory.",
        title: "Política de privacidad",
        controllerTitle: "Responsable",
        controllerParagraph: "LumoraEvents es responsable de la gestión de los datos tratados a través de este sitio web.",
        dataTitle: "Datos tratados",
        dataParagraph1: "La navegación por el directorio no requiere crear una cuenta ni proporcionar datos personales.",
        dataParagraph2: "En caso de que un usuario, organizador o representante de un evento contacte voluntariamente con LumoraEvents, podremos tratar los datos facilitados en dicha comunicación, como nombre, correo electrónico y contenido del mensaje.",
        dataParagraph3: "También podemos almacenar información pública relacionada con eventos y organizaciones cuando sea necesaria para mantener actualizado el directorio.",
        analyticsTitle: "Analítica del sitio web",
        analyticsParagraph1: "Utilizamos Counter.dev para obtener estadísticas básicas y agregadas sobre el uso del sitio web, como visitas y páginas consultadas.",
        analyticsParagraph2: "Counter.dev se utiliza con una finalidad exclusivamente estadística y de mejora del servicio.",
        analyticsParagraph3: "No utilizamos Google Analytics, Meta Pixel ni sistemas de publicidad comportamental en esta web.",
        purposeTitle: "Finalidad",
        purposeIntro: "Los datos recibidos se utilizarán exclusivamente para:",
        purposeItem1: "responder consultas;",
        purposeItem2: "gestionar solicitudes de actualización o retirada de eventos;",
        purposeItem3: "mantener y mejorar la información del directorio;",
        purposeItem4: "obtener estadísticas básicas de uso del sitio;",
        purposeItem5: "gestionar comunicaciones relacionadas con LumoraEvents y sus servicios.",
        retentionTitle: "Conservación",
        retentionParagraph: "Los datos se conservarán únicamente durante el tiempo necesario para atender la finalidad para la que fueron facilitados o mientras exista una relación legítima con la persona u organización correspondiente.",
        sharingTitle: "Cesión de datos",
        sharingParagraph1: "LumoraEvents no vende datos personales a terceros.",
        sharingParagraph2: "Los datos únicamente podrán ser tratados por proveedores técnicos necesarios para el funcionamiento del servicio o cuando exista una obligación legal.",
        rightsTitle: "Derechos",
        rightsParagraph1: "Las personas interesadas pueden solicitar el acceso, rectificación o eliminación de sus datos, así como ejercer los demás derechos reconocidos por la normativa aplicable en materia de protección de datos.",
        rightsParagraph2: "Para ello pueden contactar con LumoraEvents utilizando los medios de contacto publicados en este sitio web.",
        publicInfoTitle: "Información pública de eventos",
        publicInfoParagraph1: "El directorio puede mostrar información obtenida de fuentes públicas, como nombre del evento, web oficial, perfiles públicos de redes sociales, ubicación, fechas, carteles u otra información destinada públicamente a promocionar el evento.",
        publicInfoParagraph2: "Si eres responsable de un evento y deseas modificar o retirar información, puedes contactar con LumoraEvents.",
        updatedAt: "Última actualización: agosto de 2026."
      },
      cookiePolicy: {
        pageTitle: "Política de cookies | Bellydance Directory | LumoraEvents",
        metaDescription: "Consulta la política de cookies y el uso de Counter.dev en Bellydance Directory.",
        title: "Política de cookies",
        useTitle: "Uso de cookies",
        useParagraph1: "Bellydance Directory no utiliza actualmente cookies publicitarias ni cookies destinadas a realizar seguimiento personalizado de los visitantes.",
        useParagraph2: "Para obtener estadísticas básicas y agregadas sobre el uso del sitio utilizamos Counter.dev.",
        useParagraph3: "Counter.dev se utiliza como herramienta de analítica sencilla y respetuosa con la privacidad, sin utilizarla para crear perfiles publicitarios de los visitantes.",
        useParagraph4: "Por este motivo, actualmente no mostramos un banner de aceptación de cookies no esenciales.",
        analyticsTitle: "Analítica",
        analyticsParagraph1: "Las estadísticas obtenidas mediante Counter.dev se utilizan para conocer de forma general el uso del directorio y mejorar su funcionamiento y contenido.",
        analyticsParagraph2: "No utilizamos Google Analytics, Meta Pixel ni herramientas de publicidad comportamental.",
        thirdPartyTitle: "Servicios de terceros",
        thirdPartyParagraph1: "Algunos enlaces pueden dirigir al usuario a servicios externos, como Instagram o las páginas oficiales de los eventos.",
        thirdPartyParagraph2: "Estos sitios tienen sus propias políticas de privacidad y cookies y LumoraEvents no controla las tecnologías utilizadas por ellos una vez que el usuario abandona este sitio web.",
        changesTitle: "Cambios en esta política",
        changesParagraph: "Si en el futuro incorporamos herramientas de analítica, publicidad u otras tecnologías que requieran consentimiento, esta política y el sistema de consentimiento del sitio serán actualizados cuando corresponda.",
        updatedAt: "Última actualización: agosto de 2026."
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
        pageSizeLabel: "Events per page",
        applyFilters: "Search",
        clearFilters: "Clear",
        managedByLumora: "Managed by LumoraEvents",
        resultsTitle: "Upcoming events",
        resultsIntro: "Browse upcoming festivals, competitions, congresses, and gatherings published on LumoraEvents.",
        viewDetails: "View details",
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
      legalNotice: {
        pageTitle: "Legal Notice | Bellydance Directory | LumoraEvents",
        metaDescription: "Read the legal notice for Bellydance Directory, the LumoraEvents event directory.",
        title: "Legal Notice",
        generalTitle: "General information",
        generalParagraph1: "This website is part of LumoraEvents and its purpose is to provide information about dance events, competitions, festivals and related activities.",
        generalParagraph2: "You can contact LumoraEvents through the contact methods published on this website.",
        directoryTitle: "Directory content",
        directoryParagraph1: "The information published in this directory is mainly obtained from public sources, including official websites, social media profiles and other public channels used by the events or organisations themselves.",
        directoryParagraph2: "LumoraEvents makes reasonable efforts to keep the information accurate and updated but does not guarantee that all published information is complete, accurate or permanently up to date.",
        directoryParagraph3: "Dates, locations, links, prices and any other event information should always be confirmed through the official channels of the relevant event.",
        updatesTitle: "Updating or removing information",
        updatesParagraph: "Event organisers may request the correction, update or removal of information published in the directory by contacting LumoraEvents.",
        externalLinksTitle: "External links",
        externalLinksParagraph1: "This website contains links to third-party websites and profiles.",
        externalLinksParagraph2: "LumoraEvents is not responsible for the content, availability, security or privacy policies of external websites.",
        intellectualPropertyTitle: "Intellectual property",
        intellectualPropertyParagraph1: "The design, structure and development of this website belong to LumoraEvents.",
        intellectualPropertyParagraph2: "Trademarks, logos, posters, photographs and other material belonging to events or organisations remain the property of their respective owners and are used for informational purposes only.",
        liabilityTitle: "Liability",
        liabilityParagraph: "LumoraEvents does not necessarily organise the events included in this directory and is not responsible for changes, cancellations, incidents, payments, registrations or any other circumstances related to them.",
        updatedAt: "Last updated: August 2026."
      },
      privacyPolicy: {
        pageTitle: "Privacy Policy | Bellydance Directory | LumoraEvents",
        metaDescription: "Learn how LumoraEvents processes data and public information on Bellydance Directory.",
        title: "Privacy Policy",
        controllerTitle: "Data controller",
        controllerParagraph: "LumoraEvents is responsible for managing the data processed through this website.",
        dataTitle: "Data processed",
        dataParagraph1: "Browsing the directory does not require users to create an account or provide personal information.",
        dataParagraph2: "If a user, organiser or event representative voluntarily contacts LumoraEvents, we may process the information provided in that communication, such as name, email address and message content.",
        dataParagraph3: "We may also store publicly available information relating to events and organisations when necessary to keep the directory updated.",
        analyticsTitle: "Website analytics",
        analyticsParagraph1: "We use Counter.dev to obtain basic and aggregated statistics about website usage, such as visits and pages viewed.",
        analyticsParagraph2: "Counter.dev is used exclusively for statistical purposes and to improve the service.",
        analyticsParagraph3: "We do not use Google Analytics, Meta Pixel or behavioural advertising systems on this website.",
        purposeTitle: "Purpose",
        purposeIntro: "Information received will only be used to:",
        purposeItem1: "respond to enquiries;",
        purposeItem2: "manage requests to update or remove events;",
        purposeItem3: "maintain and improve the directory;",
        purposeItem4: "obtain basic website usage statistics;",
        purposeItem5: "manage communications relating to LumoraEvents and its services.",
        retentionTitle: "Data retention",
        retentionParagraph: "Data will only be retained for as long as necessary for the purpose for which it was provided or while a legitimate relationship exists with the relevant person or organisation.",
        sharingTitle: "Data sharing",
        sharingParagraph1: "LumoraEvents does not sell personal information to third parties.",
        sharingParagraph2: "Information may only be processed by technical service providers required to operate the service or where disclosure is required by law.",
        rightsTitle: "Rights",
        rightsParagraph1: "Individuals may request access, correction or deletion of their personal information and exercise any other rights recognised under applicable data protection legislation.",
        rightsParagraph2: "Requests can be made by contacting LumoraEvents using the contact methods published on this website.",
        publicInfoTitle: "Public event information",
        publicInfoParagraph1: "The directory may display information obtained from public sources, including event names, official websites, public social media profiles, locations, dates, posters or other information publicly provided to promote an event.",
        publicInfoParagraph2: "If you represent an event and wish to update or remove information, please contact LumoraEvents.",
        updatedAt: "Last updated: August 2026."
      },
      cookiePolicy: {
        pageTitle: "Cookie Policy | Bellydance Directory | LumoraEvents",
        metaDescription: "Read the cookie policy and learn about the use of Counter.dev on Bellydance Directory.",
        title: "Cookie Policy",
        useTitle: "Use of cookies",
        useParagraph1: "Bellydance Directory does not currently use advertising cookies or cookies intended to perform personalised tracking of visitors.",
        useParagraph2: "We use Counter.dev to obtain basic and aggregated website usage statistics.",
        useParagraph3: "Counter.dev is used as a simple, privacy-friendly analytics tool and is not used to create advertising profiles of visitors.",
        useParagraph4: "For this reason, we do not currently display a consent banner for non-essential cookies.",
        analyticsTitle: "Analytics",
        analyticsParagraph1: "Statistics obtained through Counter.dev are used to understand general usage of the directory and improve its operation and content.",
        analyticsParagraph2: "We do not use Google Analytics, Meta Pixel or behavioural advertising tools.",
        thirdPartyTitle: "Third-party services",
        thirdPartyParagraph1: "Some links may direct users to external services such as Instagram or official event websites.",
        thirdPartyParagraph2: "These websites have their own privacy and cookie policies, and LumoraEvents does not control the technologies used by them once the user leaves this website.",
        changesTitle: "Changes to this policy",
        changesParagraph: "If analytics, advertising or other technologies requiring consent are introduced in the future, this policy and the website's consent mechanisms will be updated where necessary.",
        updatedAt: "Last updated: August 2026."
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
