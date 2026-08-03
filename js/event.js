(function () {
  var api = window.LumoraEventsApi;
  var i18nApi = window.LumoraEventsI18n;

  if (!api || !i18nApi) {
    return;
  }

  var FALLBACK_CONTACT_EMAIL = "info@lumoraevents.net";
  var RETURN_URL_STORAGE_KEY = "lumoraevents-directory-return-url";
  var elements = {};
  var state = {
    eventId: "",
    returnUrl: "./index.html",
    currentEvent: null,
    isLoading: false,
    errorStatus: 0
  };
  var activeRequest = null;

  document.addEventListener("DOMContentLoaded", initEventPage);

  function initEventPage() {
    elements.eventView = document.getElementById("event-view");
    elements.eventEmpty = document.getElementById("event-empty");
    elements.metaDescription = document.querySelector('meta[name="description"]');
    elements.canonical = document.querySelector('link[rel="canonical"]');
    elements.ogTitle = document.querySelector('meta[property="og:title"]');
    elements.ogDescription = document.querySelector('meta[property="og:description"]');
    elements.ogLocale = document.querySelector('meta[property="og:locale"]');
    elements.ogImage = document.querySelector('meta[property="og:image"]');

    i18nApi.initPage();
    bindEvents();
    state.eventId = getEventIdFromUrl();
    state.returnUrl = getReturnUrlFromSession();
    applyBackToListUrls();

    if (state.eventId) {
      loadEvent();
    } else {
      state.errorStatus = 404;
      renderCurrentState();
    }

    i18nApi.onLanguageChange(renderCurrentState);
  }

  function bindEvents() {
    elements.eventView.addEventListener("click", function (event) {
      if (event.target.closest("[data-retry-event]")) {
        loadEvent();
      }
    });
  }

  function getEventIdFromUrl() {
    return String(new URLSearchParams(window.location.search).get("id") || "").trim();
  }

  function getReturnUrlFromSession() {
    var source = "";

    try {
      source = String(window.sessionStorage.getItem(RETURN_URL_STORAGE_KEY) || "").trim();
    } catch (error) {
      return "./index.html";
    }

    if (!source) {
      return "./index.html";
    }

    try {
      var expectedIndexUrl = new URL("./index.html", window.location.href);
      var candidateUrl = new URL(source, window.location.href);

      if (candidateUrl.origin !== expectedIndexUrl.origin || candidateUrl.pathname !== expectedIndexUrl.pathname) {
        return "./index.html";
      }

      return "./index.html" + candidateUrl.search + candidateUrl.hash;
    } catch (error) {
      return "./index.html";
    }
  }

  function applyBackToListUrls() {
    document.querySelectorAll("[data-back-to-list]").forEach(function (link) {
      link.setAttribute("href", state.returnUrl);
    });
  }

  function loadEvent() {
    if (activeRequest) {
      activeRequest.abort();
    }

    activeRequest = new AbortController();
    state.currentEvent = null;
    state.isLoading = true;
    state.errorStatus = 0;
    renderLoadingState();

    api.getDirectoryEvent(state.eventId, {
      signal: activeRequest.signal
    }).then(function (eventItem) {
      state.currentEvent = eventItem;
      state.isLoading = false;
      state.errorStatus = 0;
      renderEventState();
    }).catch(function (error) {
      if (error.name === "AbortError") {
        return;
      }

      state.currentEvent = null;
      state.isLoading = false;
      state.errorStatus = error.status || 500;
      renderCurrentState();
    });
  }

  function renderCurrentState() {
    if (state.isLoading) {
      renderLoadingState();
      return;
    }

    if (state.currentEvent) {
      renderEventState();
      return;
    }

    if (state.errorStatus === 404) {
      renderNotFoundState();
      return;
    }

    renderErrorState();
  }

  function renderLoadingState() {
    elements.eventEmpty.classList.add("hidden");
    elements.eventView.classList.remove("hidden");
    elements.eventView.setAttribute("aria-busy", "true");
    elements.eventView.innerHTML = [
      '<section class="detail-card p-8 text-center">',
      '<h1 class="font-display text-3xl font-bold text-ink">' + escapeHtml(i18nApi.t("event.loadingTitle")) + "</h1>",
      '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("event.loadingText")) + "</p>",
      "</section>"
    ].join("");
    renderFallbackMeta();
    updateCanonical(state.eventId);
  }

  function renderErrorState() {
    elements.eventEmpty.classList.add("hidden");
    elements.eventView.classList.remove("hidden");
    elements.eventView.setAttribute("aria-busy", "false");
    elements.eventView.innerHTML = [
      '<section class="detail-card p-8 text-center">',
      '<h1 class="font-display text-3xl font-bold text-ink">' + escapeHtml(i18nApi.t("event.errorTitle")) + "</h1>",
      '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("event.errorText")) + "</p>",
      '<button type="button" data-retry-event class="mt-6 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">' + escapeHtml(i18nApi.t("event.retryAction")) + "</button>",
      "</section>"
    ].join("");
    renderFallbackMeta();
    updateCanonical(state.eventId);
  }

  function renderEventState() {
    var eventItem = state.currentEvent;
    var language = i18nApi.getCurrentLanguage();
    var eventType = i18nApi.getEventTypeName(eventItem.type, language);
    var countryName = i18nApi.getCountryName(eventItem.countryCode, language);
    var dateLabel = i18nApi.formatDateRange(eventItem.startDate, eventItem.endDate, language);
    var visualPosterUrl = eventItem.posterUrl || buildPosterPlaceholder(eventItem.name, countryName);
    var summaryDescription = buildSummaryDescription(eventItem.description);
    var contactEmail = eventItem.contactEmail || FALLBACK_CONTACT_EMAIL;

    elements.eventEmpty.classList.add("hidden");
    elements.eventView.classList.remove("hidden");
    elements.eventView.setAttribute("aria-busy", "false");
    elements.eventView.innerHTML = [
      '<article class="detail-card overflow-hidden">',
      '<div class="p-6 sm:p-8 lg:p-10">',
      '<div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(250px,320px)] lg:gap-10">',
      '<div class="min-w-0">',
      '<p class="text-xs font-semibold uppercase tracking-[0.28em] text-clove/80">' + escapeHtml(i18nApi.t("event.detailsLabel")) + "</p>",
      '<h1 class="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">' + escapeHtml(eventItem.name) + "</h1>",
      '<div class="mt-5 flex flex-wrap items-center gap-2">',
      '<span class="detail-pill">' + escapeHtml(eventType) + "</span>",
      buildManagedPill(eventItem),
      "</div>",
      '<div class="mt-8 grid gap-x-5 gap-y-5 sm:grid-cols-3">',
      buildDetailItem(i18nApi.t("common.venue"), eventItem.venue, "venue"),
      buildDetailItem(i18nApi.t("common.locationLabel"), [eventItem.city, countryName].filter(Boolean).join(", "), "location"),
      buildDetailItem(i18nApi.t("common.dates"), dateLabel, "dates"),
      "</div>",
      buildStylesSection(eventItem.danceStyles),
      buildArtistsSection(eventItem, language),
      "</div>",
      '<figure class="mx-auto w-full max-w-[320px] lg:mx-0 lg:justify-self-end">',
      '<div class="overflow-hidden rounded-[1.5rem] border border-clove/10 bg-[#eef4ef] shadow-soft">',
      '<img data-event-poster src="' + escapeAttribute(visualPosterUrl) + '" alt="' + escapeAttribute(eventItem.name) + '" class="aspect-[5/7] max-h-[470px] w-full object-contain">',
      "</div>",
      "</figure>",
      "</div>",
      '<div class="mt-10 border-t border-clove/10">',
      buildDescriptionSection(eventItem.description),
      buildLinksSection(eventItem),
      '<section class="mt-10 rounded-[1.5rem] border border-clove/10 bg-gradient-to-br from-[#f4faef] to-[#eef5f0] p-6">',
      '<h2 class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.contactTitle")) + "</h2>",
      '<p class="mt-4 max-w-2xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("event.contactText")) + "</p>",
      '<a href="mailto:' + escapeAttribute(contactEmail) + '" class="mt-3 inline-flex text-sm font-semibold text-clove transition hover:text-ink">' + escapeHtml(contactEmail) + "</a>",
      '<div><a href="' + escapeAttribute(buildContactHref(eventItem.name, contactEmail)) + '" class="mt-5 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">' + escapeHtml(i18nApi.t("event.contactAction")) + "</a></div>",
      "</section>",
      buildUpdatedAt(eventItem.updatedAt, language),
      '<a href="' + escapeAttribute(state.returnUrl) + '" class="mt-8 inline-flex text-sm font-semibold text-clove transition hover:text-ink">' + escapeHtml(i18nApi.t("common.backToList")) + "</a>",
      "</div>",
      "</div>",
      "</article>"
    ].join("");

    bindPosterFallback(eventItem.name, countryName);
    renderEventMeta(eventItem, summaryDescription, language);
  }

  function renderNotFoundState() {
    elements.eventView.innerHTML = "";
    elements.eventView.classList.add("hidden");
    elements.eventView.setAttribute("aria-busy", "false");
    elements.eventEmpty.classList.remove("hidden");

    document.title = i18nApi.t("event.notFoundTitle") + " | LumoraEvents";
    elements.metaDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogTitle.setAttribute("content", i18nApi.t("event.notFoundTitle") + " | LumoraEvents");
    elements.ogDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogLocale.setAttribute("content", i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB");
    elements.ogImage.setAttribute("content", "https://placehold.co/1200x630/eef4ef/245f47?text=LumoraEvents");
    updateCanonical(null);
  }

  function renderFallbackMeta() {
    document.title = i18nApi.t("event.fallbackTitle");
    elements.metaDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogTitle.setAttribute("content", i18nApi.t("event.fallbackTitle"));
    elements.ogDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogLocale.setAttribute("content", i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB");
  }

  function renderEventMeta(eventItem, summaryDescription, language) {
    document.title = eventItem.name + " | LumoraEvents";
    elements.metaDescription.setAttribute("content", summaryDescription);
    elements.ogTitle.setAttribute("content", eventItem.name + " | LumoraEvents");
    elements.ogDescription.setAttribute("content", summaryDescription);
    elements.ogLocale.setAttribute("content", language === "es" ? "es_ES" : "en_GB");
    elements.ogImage.setAttribute(
      "content",
      eventItem.posterUrl || "https://placehold.co/1200x630/eef4ef/245f47?text=LumoraEvents"
    );
    updateCanonical(eventItem.id);
  }

  function buildDetailItem(label, value, iconName) {
    if (!value) {
      return "";
    }

    return [
      '<div class="flex min-w-0 items-center gap-3">',
      '<span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clove/8 text-clove" title="' + escapeAttribute(label) + '" aria-hidden="true">',
      buildDetailIcon(iconName),
      "</span>",
      '<p class="min-w-0 text-sm font-semibold leading-6 text-stone-700"><span class="sr-only">' + escapeHtml(label) + ": </span>" + escapeHtml(value) + "</p>",
      "</div>"
    ].join("");
  }

  function buildStylesSection(styles) {
    if (!styles.length) {
      return "";
    }

    return [
      '<div class="event-meta-panel mt-8" role="group" aria-labelledby="event-styles-title">',
      '<h2 id="event-styles-title" class="event-meta-panel-title">' + escapeHtml(i18nApi.t("common.danceStyles")) + "</h2>",
      '<ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2.5" role="list">',
      styles.map(function (style) {
        return [
          '<li class="inline-flex items-center gap-2 text-sm font-semibold text-ink">',
          '<span class="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true"></span>',
          escapeHtml(formatEnumLabel(style)),
          "</li>"
        ].join("");
      }).join(""),
      "</ul>",
      "</div>"
    ].join("");
  }

  function buildDetailIcon(iconName) {
    var paths = {
      venue: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M5.25 21V5.25A2.25 2.25 0 0 1 7.5 3h9a2.25 2.25 0 0 1 2.25 2.25V21M9 7.5h.008v.008H9V7.5Zm0 3.75h.008v.008H9v-.008Zm0 3.75h.008v.008H9V15Zm3-7.5h.008v.008H12V7.5Zm0 3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm3-7.5h.008v.008H15V7.5Zm0 3.75h.008v.008H15v-.008ZM15 15h.008v.008H15V15Z" />',
      location: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21s6-5.12 6-11a6 6 0 1 0-12 0c0 5.88 6 11 6 11Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 10a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />',
      dates: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v13.5h-16.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />'
    };

    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-5 w-5">' + (paths[iconName] || paths.location) + "</svg>";
  }

  function buildManagedPill(eventItem) {
    if (!eventItem.isLumoraEvent) {
      return "";
    }

    return [
      '<span class="lumora-managed-chip">',
      '<svg aria-hidden="true" viewBox="0 0 20 20" class="h-3.5 w-3.5 shrink-0 fill-gold">',
      '<path d="M10 1.75c.55 3.74 2.52 5.71 6.25 6.25-3.73.55-5.7 2.52-6.25 6.25C9.45 10.52 7.48 8.55 3.75 8 7.48 7.46 9.45 5.49 10 1.75Z" />',
      '<path d="M15.6 12.1c.23 1.55 1.05 2.37 2.6 2.6-1.55.22-2.37 1.04-2.6 2.6-.22-1.56-1.04-2.38-2.6-2.6 1.56-.23 2.38-1.05 2.6-2.6Z" />',
      "</svg>",
      '<span>' + escapeHtml(i18nApi.t("event.managedByLumora")) + "</span>",
      "</span>"
    ].join("");
  }

  function buildDescriptionSection(description) {
    var normalizedDescription = String(description || "").trim();

    if (!normalizedDescription) {
      return "";
    }

    return [
      '<section class="mt-10" aria-labelledby="event-description-title">',
      '<h2 id="event-description-title" class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.descriptionTitle")) + "</h2>",
      '<p class="mt-4 text-sm leading-8 text-stone-700">' + escapeHtml(normalizedDescription) + "</p>",
      "</section>"
    ].join("");
  }

  function buildArtistsSection(eventItem, language) {
    if (!eventItem.masters.length) {
      return "";
    }

    return [
      '<div class="event-meta-panel mt-4" role="group" aria-labelledby="event-artists-title">',
      '<h2 id="event-artists-title" class="event-meta-panel-title">' + escapeHtml(i18nApi.t("common.masters")) + "</h2>",
      '<ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2.5" role="list">',
      eventItem.masters.map(function (master) {
        return buildMasterItem(master, language);
      }).join(""),
      "</ul>",
      "</div>"
    ].join("");
  }

  function buildMasterItem(value, language) {
    var master = parseMaster(value, language);
    var flag = master.countryCode
      ? '<img src="' + escapeAttribute(buildFlagUrl(master.countryCode)) + '" alt="' + escapeAttribute(master.countryName) + '" title="' + escapeAttribute(master.countryName) + '" width="24" height="18" loading="lazy" decoding="async" class="h-[18px] w-6 rounded-[0.2rem] object-cover shadow-sm">'
      : "";

    return [
      '<li class="inline-flex items-center gap-2 text-sm font-semibold text-ink">',
      '<p class="text-sm font-semibold leading-6 text-ink">' + escapeHtml(master.name) + "</p>",
      flag,
      "</li>"
    ].join("");
  }

  function parseMaster(value, language) {
    var rawValue = String(value || "").trim();
    var match = rawValue.match(/^(.*?)\s*\(([A-Za-z]{2})\)\s*$/);

    if (!match || !match[1].trim()) {
      return { name: rawValue, countryCode: "", countryName: "" };
    }

    var countryCode = match[2].toUpperCase();

    if (i18nApi.getCountryCodes().indexOf(countryCode) === -1) {
      return { name: rawValue, countryCode: "", countryName: "" };
    }

    return {
      name: match[1].trim(),
      countryCode: countryCode,
      countryName: i18nApi.getCountryName(countryCode, language)
    };
  }

  function buildFlagUrl(countryCode) {
    return "https://flagcdn.com/" + String(countryCode || "").toLowerCase() + ".svg";
  }

  function buildLinksSection(eventItem) {
    var linkDefinitions = [
      { url: eventItem.websiteUrl, label: i18nApi.t("common.website") },
      { url: eventItem.registrationUrl, label: i18nApi.t("common.registration") },
      { url: eventItem.instagramUrl, label: i18nApi.t("common.instagram") },
      { url: eventItem.facebookUrl, label: i18nApi.t("common.facebook") },
      { url: eventItem.tiktokUrl, label: i18nApi.t("common.tiktok") },
      { url: eventItem.youtubeUrl, label: i18nApi.t("common.youtube") }
    ];
    var links = linkDefinitions.filter(function (link) {
      return link.url;
    }).map(function (link) {
      return '<a href="' + escapeAttribute(link.url) + '" target="_blank" rel="noreferrer noopener" class="inline-flex rounded-full border border-clove/20 bg-white px-4 py-2 text-sm font-semibold text-clove transition hover:border-clove hover:text-ink">' + escapeHtml(link.label) + "</a>";
    });

    if (!links.length) {
      return "";
    }

    return [
      '<section class="mt-10" aria-labelledby="event-links-title">',
      '<h2 id="event-links-title" class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.linksTitle")) + "</h2>",
      '<div class="mt-4 flex flex-wrap gap-3">',
      links.join(""),
      "</div>",
      "</section>"
    ].join("");
  }

  function buildUpdatedAt(updatedAt, language) {
    if (!updatedAt) {
      return "";
    }

    var dateLabel = i18nApi.formatDateRange(updatedAt, updatedAt, language);
    return '<p class="mt-8 text-xs text-stone-500">' + escapeHtml(i18nApi.t("event.updatedAt", { date: dateLabel })) + "</p>";
  }

  function buildSummaryDescription(description) {
    var fallback = i18nApi.t("event.fallbackDescription");
    var text = String(description || "").trim() || fallback;
    return text.length > 150 ? text.slice(0, 147) + "..." : text;
  }

  function bindPosterFallback(eventName, countryName) {
    if (!state.currentEvent.posterUrl) {
      return;
    }

    var image = elements.eventView.querySelector("[data-event-poster]");

    image.addEventListener("error", function handlePosterError() {
      image.removeEventListener("error", handlePosterError);
      image.src = buildPosterPlaceholder(eventName, countryName);
    });
  }

  function buildPosterPlaceholder(eventName, countryName) {
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1400" viewBox="0 0 1000 1400">',
      "<defs>",
      '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#edf7e8" />',
      '<stop offset="55%" stop-color="#dbeadd" />',
      '<stop offset="100%" stop-color="#76658d" />',
      "</linearGradient>",
      "</defs>",
      '<rect width="1000" height="1400" fill="url(#bg)" />',
      '<circle cx="180" cy="220" r="120" fill="rgba(130,201,90,0.35)" />',
      '<circle cx="830" cy="270" r="150" fill="rgba(255,255,255,0.18)" />',
      '<circle cx="720" cy="1080" r="220" fill="rgba(36,95,71,0.14)" />',
      '<text x="90" y="170" fill="#245f47" font-size="44" font-family="Arial, sans-serif">LumoraEvents</text>',
      '<text x="90" y="700" fill="#122019" font-size="72" font-family="Arial, sans-serif">' + escapeXml(eventName) + "</text>",
      '<text x="90" y="790" fill="#31483c" font-size="36" font-family="Arial, sans-serif">' + escapeXml(countryName) + "</text>",
      '<text x="90" y="1250" fill="#ffffff" font-size="30" font-family="Arial, sans-serif">' + escapeXml(i18nApi.t("event.posterFallbackLabel")) + "</text>",
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function buildContactHref(eventName, contactEmail) {
    var subject = encodeURIComponent("LumoraEvents - " + eventName);
    var body = encodeURIComponent(i18nApi.t("event.contactEmailBody"));
    return "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body;
  }

  function updateCanonical(eventId) {
    if (!elements.canonical) {
      return;
    }

    var baseUrl = window.location.protocol === "file:"
      ? "./event.html"
      : window.location.origin + window.location.pathname;

    elements.canonical.setAttribute(
      "href",
      eventId ? baseUrl + "?id=" + encodeURIComponent(eventId) : baseUrl
    );
  }

  function formatEnumLabel(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/^./, function (firstLetter) {
        return firstLetter.toUpperCase();
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
})();
