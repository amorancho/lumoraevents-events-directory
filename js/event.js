(function () {
  var api = window.LumoraEventsApi;
  var i18nApi = window.LumoraEventsI18n;

  if (!api || !i18nApi) {
    return;
  }

  var FALLBACK_CONTACT_EMAIL = "info@lumoraevents.net";
  var elements = {};
  var state = {
    eventId: "",
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
    var posterCaptionKey = eventItem.posterUrl ? "event.posterLabel" : "event.posterFallbackLabel";
    var summaryDescription = buildSummaryDescription(eventItem.description);
    var contactEmail = eventItem.contactEmail || FALLBACK_CONTACT_EMAIL;

    elements.eventEmpty.classList.add("hidden");
    elements.eventView.classList.remove("hidden");
    elements.eventView.setAttribute("aria-busy", "false");
    elements.eventView.innerHTML = [
      '<article class="detail-card overflow-hidden">',
      '<div class="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">',
      '<div class="p-6 sm:p-8 lg:p-10">',
      '<p class="text-xs font-semibold uppercase tracking-[0.28em] text-clove/80">' + escapeHtml(i18nApi.t("event.detailsLabel")) + "</p>",
      '<h1 class="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">' + escapeHtml(eventItem.name) + "</h1>",
      '<div class="mt-5 flex flex-wrap items-center gap-2">',
      '<span class="detail-pill">' + escapeHtml(eventType) + "</span>",
      '<span class="detail-pill">' + escapeHtml([eventItem.city, countryName].filter(Boolean).join(", ")) + "</span>",
      buildManagedPill(eventItem),
      "</div>",
      '<dl class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">',
      buildDetailItem(i18nApi.t("common.venue"), eventItem.venue),
      buildDetailItem(i18nApi.t("common.city"), eventItem.city),
      buildDetailItem(i18nApi.t("common.country"), countryName),
      buildDetailItem(i18nApi.t("common.dates"), dateLabel),
      "</dl>",
      buildDescriptionSection(eventItem.description),
      buildProgramSection(eventItem),
      buildLinksSection(eventItem),
      '<section class="mt-10 rounded-[1.5rem] border border-clove/10 bg-gradient-to-br from-[#f4faef] to-[#eef5f0] p-6">',
      '<h2 class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.contactTitle")) + "</h2>",
      '<p class="mt-4 max-w-2xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("event.contactText")) + "</p>",
      '<a href="mailto:' + escapeAttribute(contactEmail) + '" class="mt-3 inline-flex text-sm font-semibold text-clove transition hover:text-ink">' + escapeHtml(contactEmail) + "</a>",
      '<div><a href="' + escapeAttribute(buildContactHref(eventItem.name, contactEmail)) + '" class="mt-5 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">' + escapeHtml(i18nApi.t("event.contactAction")) + "</a></div>",
      "</section>",
      buildUpdatedAt(eventItem.updatedAt, language),
      '<a href="./index.html" class="mt-8 inline-flex text-sm font-semibold text-clove transition hover:text-ink">' + escapeHtml(i18nApi.t("common.backToList")) + "</a>",
      "</div>",
      '<aside class="border-t border-clove/10 bg-[#eef4ef] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">',
      '<div class="overflow-hidden rounded-[1.5rem] border border-clove/10 bg-white shadow-soft">',
      '<img data-event-poster src="' + escapeAttribute(visualPosterUrl) + '" alt="' + escapeAttribute(eventItem.name) + '" class="h-full min-h-[320px] w-full object-cover">',
      "</div>",
      '<p data-poster-caption class="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">' + escapeHtml(i18nApi.t(posterCaptionKey)) + "</p>",
      '<p class="mt-2 text-sm leading-6 text-stone-700">' + escapeHtml(summaryDescription) + "</p>",
      "</aside>",
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

  function buildDetailItem(label, value) {
    if (!value) {
      return "";
    }

    return [
      '<div class="rounded-[1.2rem] border border-clove/10 bg-clove/5 px-4 py-4">',
      '<dt class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">' + escapeHtml(label) + "</dt>",
      '<dd class="mt-2 text-sm leading-7 text-stone-700">' + escapeHtml(value) + "</dd>",
      "</div>"
    ].join("");
  }

  function buildManagedPill(eventItem) {
    return eventItem.isLumoraEvent
      ? '<span class="detail-pill border-gold/50 bg-gold/15">' + escapeHtml(i18nApi.t("event.managedByLumora")) + "</span>"
      : "";
  }

  function buildDescriptionSection(description) {
    if (!description) {
      return "";
    }

    return [
      '<section class="mt-10" aria-labelledby="event-description-title">',
      '<h2 id="event-description-title" class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.descriptionTitle")) + "</h2>",
      '<p class="mt-4 text-sm leading-8 text-stone-700">' + escapeHtml(description) + "</p>",
      "</section>"
    ].join("");
  }

  function buildProgramSection(eventItem) {
    if (!eventItem.masters.length && !eventItem.danceStyles.length) {
      return "";
    }

    var content = [];

    if (eventItem.masters.length) {
      content.push([
        '<div class="rounded-[1.2rem] border border-clove/10 bg-white p-5">',
        '<p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">' + escapeHtml(i18nApi.t("common.masters")) + "</p>",
        '<p class="mt-3 text-sm leading-7 text-stone-700">' + escapeHtml(eventItem.masters.join(", ")) + "</p>",
        "</div>"
      ].join(""));
    }

    if (eventItem.danceStyles.length) {
      content.push([
        '<div class="rounded-[1.2rem] border border-clove/10 bg-white p-5">',
        '<p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">' + escapeHtml(i18nApi.t("common.danceStyles")) + "</p>",
        '<div class="mt-3 flex flex-wrap gap-2">',
        eventItem.danceStyles.map(function (style) {
          return '<span class="detail-pill">' + escapeHtml(formatEnumLabel(style)) + "</span>";
        }).join(""),
        "</div>",
        "</div>"
      ].join(""));
    }

    return [
      '<section class="mt-10" aria-labelledby="event-program-title">',
      '<h2 id="event-program-title" class="font-display text-2xl font-bold tracking-[-0.025em] text-ink">' + escapeHtml(i18nApi.t("event.programTitle")) + "</h2>",
      '<div class="mt-4 grid gap-4 sm:grid-cols-2">',
      content.join(""),
      "</div>",
      "</section>"
    ].join("");
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
    var text = description || fallback;
    return text.length > 150 ? text.slice(0, 147) + "..." : text;
  }

  function bindPosterFallback(eventName, countryName) {
    if (!state.currentEvent.posterUrl) {
      return;
    }

    var image = elements.eventView.querySelector("[data-event-poster]");
    var caption = elements.eventView.querySelector("[data-poster-caption]");

    image.addEventListener("error", function handlePosterError() {
      image.removeEventListener("error", handlePosterError);
      image.src = buildPosterPlaceholder(eventName, countryName);
      caption.textContent = i18nApi.t("event.posterFallbackLabel");
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
