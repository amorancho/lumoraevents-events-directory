(function () {
  var dataApi = window.LumoraEventsData;
  var i18nApi = window.LumoraEventsI18n;

  if (!dataApi || !i18nApi) {
    return;
  }

  var elements = {};
  var currentEvent = null;

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
    resolveEvent();
    renderEventPage();

    i18nApi.onLanguageChange(function () {
      renderEventPage();
    });
  }

  function resolveEvent() {
    var searchParams = new URLSearchParams(window.location.search);
    var eventId = searchParams.get("id");
    currentEvent = eventId ? dataApi.getEventById(eventId) : null;
  }

  function renderEventPage() {
    if (!currentEvent) {
      renderNotFoundState();
      return;
    }

    renderEventState();
  }

  function renderEventState() {
    var language = i18nApi.getCurrentLanguage();
    var eventName = dataApi.getLocalizedText(currentEvent.name, language);
    var eventDescription = dataApi.getLocalizedText(currentEvent.description, language);
    var eventType = dataApi.getLocalizedText(currentEvent.type, language);
    var countryName = dataApi.getLocalizedText(currentEvent.country, language);
    var dateLabel = i18nApi.formatDateRange(currentEvent.startDate, currentEvent.endDate, language);
    var posterUrl = currentEvent.posterUrl || buildPosterPlaceholder(eventName, countryName);
    var posterCaption = i18nApi.t(currentEvent.posterUrl ? "event.posterLabel" : "event.posterFallbackLabel");
    var contactHref = buildContactHref(eventName);
    var summaryDescription = eventDescription.length > 150
      ? eventDescription.slice(0, 147) + "..."
      : eventDescription;

    elements.eventEmpty.classList.add("hidden");
    elements.eventView.innerHTML = [
      '<article class="detail-card overflow-hidden">',
      '<div class="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">',
      '<div class="p-6 sm:p-8 lg:p-10">',
      '<p class="text-xs font-semibold uppercase tracking-[0.28em] text-clove/80">' + escapeHtml(i18nApi.t("event.detailsLabel")) + "</p>",
      '<h1 class="mt-4 font-display text-4xl leading-none text-ink sm:text-5xl">' + escapeHtml(eventName) + "</h1>",
      '<div class="mt-5 flex flex-wrap items-center gap-2">',
      '<span class="detail-pill">' + escapeHtml(eventType) + "</span>",
      '<span class="detail-pill">' + escapeHtml(currentEvent.city + ", " + countryName) + "</span>",
      "</div>",
      '<dl class="mt-8 grid gap-5 sm:grid-cols-3">',
      buildDetailItem(i18nApi.t("common.city"), currentEvent.city),
      buildDetailItem(i18nApi.t("common.country"), countryName),
      buildDetailItem(i18nApi.t("common.dates"), dateLabel),
      "</dl>",
      '<section class="mt-10" aria-labelledby="event-description-title">',
      '<h2 id="event-description-title" class="font-display text-3xl leading-none text-ink">' + escapeHtml(i18nApi.t("event.descriptionTitle")) + "</h2>",
      '<p class="mt-4 text-sm leading-8 text-stone-700">' + escapeHtml(eventDescription) + "</p>",
      "</section>",
      buildLinksSection(),
      '<section class="mt-10 rounded-[1.8rem] border border-clove/10 bg-gradient-to-br from-[#fff7ef] to-[#f7efe6] p-6">',
      '<h2 class="font-display text-3xl leading-none text-ink">' + escapeHtml(i18nApi.t("event.contactTitle")) + "</h2>",
      '<p class="mt-4 max-w-2xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("event.contactText")) + "</p>",
      '<a href="' + contactHref + '" class="mt-6 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">' + escapeHtml(i18nApi.t("event.contactAction")) + "</a>",
      "</section>",
      '<a href="./index.html" class="mt-8 inline-flex text-sm font-semibold text-clove transition hover:text-ink">' + escapeHtml(i18nApi.t("common.backToList")) + "</a>",
      "</div>",
      '<aside class="border-t border-clove/10 bg-[#f7efe4] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">',
      '<div class="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white shadow-soft">',
      '<img src="' + escapeAttribute(posterUrl) + '" alt="' + escapeAttribute(eventName) + '" class="h-full min-h-[320px] w-full object-cover">',
      "</div>",
      '<p class="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">' + escapeHtml(posterCaption) + "</p>",
      '<p class="mt-2 text-sm leading-6 text-stone-700">' + escapeHtml(summaryDescription) + "</p>",
      "</aside>",
      "</div>",
      "</article>"
    ].join("");

    elements.eventView.classList.remove("hidden");

    document.title = eventName + " | LumoraEvents";
    elements.metaDescription.setAttribute("content", summaryDescription);
    elements.ogTitle.setAttribute("content", eventName + " | LumoraEvents");
    elements.ogDescription.setAttribute("content", summaryDescription);
    elements.ogLocale.setAttribute("content", language === "es" ? "es_ES" : "en_GB");
    elements.ogImage.setAttribute("content", posterUrl);
    updateCanonical(currentEvent.id);
  }

  function renderNotFoundState() {
    elements.eventView.innerHTML = "";
    elements.eventView.classList.add("hidden");
    elements.eventEmpty.classList.remove("hidden");

    document.title = i18nApi.t("event.notFoundTitle") + " | LumoraEvents";
    elements.metaDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogTitle.setAttribute("content", i18nApi.t("event.notFoundTitle") + " | LumoraEvents");
    elements.ogDescription.setAttribute("content", i18nApi.t("event.fallbackDescription"));
    elements.ogLocale.setAttribute("content", i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB");
    elements.ogImage.setAttribute("content", "https://placehold.co/1200x630/f4ebe1/5f3d2e?text=LumoraEvents");
    updateCanonical(null);
  }

  function buildDetailItem(label, value) {
    return [
      '<div class="rounded-[1.4rem] border border-clove/10 bg-clove/5 px-4 py-4">',
      '<dt class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(label) + "</dt>",
      '<dd class="mt-2 text-sm leading-7 text-stone-700">' + escapeHtml(value) + "</dd>",
      "</div>"
    ].join("");
  }

  function buildLinksSection() {
    var links = [];

    if (currentEvent.website) {
      links.push(
        '<a href="' + escapeAttribute(currentEvent.website) + '" target="_blank" rel="noreferrer noopener" class="inline-flex rounded-full border border-clove/20 bg-white px-4 py-2 text-sm font-semibold text-clove transition hover:border-clove hover:text-ink">' +
          escapeHtml(i18nApi.t("common.website")) +
        "</a>"
      );
    }

    if (currentEvent.instagram) {
      links.push(
        '<a href="' + escapeAttribute(currentEvent.instagram) + '" target="_blank" rel="noreferrer noopener" class="inline-flex rounded-full border border-clove/20 bg-white px-4 py-2 text-sm font-semibold text-clove transition hover:border-clove hover:text-ink">' +
          escapeHtml(i18nApi.t("common.instagram")) +
        "</a>"
      );
    }

    if (!links.length) {
      return "";
    }

    return [
      '<section class="mt-10" aria-labelledby="event-links-title">',
      '<h2 id="event-links-title" class="font-display text-3xl leading-none text-ink">' + escapeHtml(i18nApi.t("event.linksTitle")) + "</h2>",
      '<div class="mt-4 flex flex-wrap gap-3">',
      links.join(""),
      "</div>",
      "</section>"
    ].join("");
  }

  function buildPosterPlaceholder(eventName, countryName) {
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1400" viewBox="0 0 1000 1400">',
      "<defs>",
      '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#f6e6cf" />',
      '<stop offset="55%" stop-color="#ead4c8" />',
      '<stop offset="100%" stop-color="#8f6486" />',
      "</linearGradient>",
      "</defs>",
      '<rect width="1000" height="1400" fill="url(#bg)" />',
      '<circle cx="180" cy="220" r="120" fill="rgba(200,155,60,0.35)" />',
      '<circle cx="830" cy="270" r="150" fill="rgba(255,255,255,0.18)" />',
      '<circle cx="720" cy="1080" r="220" fill="rgba(93,58,42,0.12)" />',
      '<text x="90" y="170" fill="#5d3a2a" font-size="44" font-family="Georgia, serif">LumoraEvents</text>',
      '<text x="90" y="700" fill="#261912" font-size="82" font-family="Georgia, serif">' + escapeXml(eventName) + "</text>",
      '<text x="90" y="790" fill="#4b372f" font-size="36" font-family="Arial, sans-serif">' + escapeXml(countryName) + "</text>",
      '<text x="90" y="1250" fill="#ffffff" font-size="30" font-family="Arial, sans-serif">' + escapeXml(i18nApi.t("event.posterFallbackLabel")) + "</text>",
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function buildContactHref(eventName) {
    var subject = encodeURIComponent("LumoraEvents - " + eventName);
    var body = encodeURIComponent(i18nApi.t("event.contactEmailBody"));
    return "mailto:" + dataApi.site.contactEmail + "?subject=" + subject + "&body=" + body;
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
