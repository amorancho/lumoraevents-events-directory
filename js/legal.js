(function () {
  var i18nApi = window.LumoraEventsI18n;
  var contentApi = window.LumoraEventsLegalContent;

  if (!i18nApi || !contentApi) {
    return;
  }

  var pageKey = document.body.getAttribute("data-legal-page");
  var elements = {};
  var activeRequest = 0;

  document.addEventListener("DOMContentLoaded", initLegalPage);

  function initLegalPage() {
    elements.content = document.getElementById("legal-content");
    elements.metaDescription = document.querySelector('meta[name="description"]');
    elements.ogTitle = document.querySelector('meta[property="og:title"]');
    elements.ogDescription = document.querySelector('meta[property="og:description"]');
    elements.ogLocale = document.querySelector('meta[property="og:locale"]');

    i18nApi.initPage();
    bindEvents();
    loadCurrentContent();
    i18nApi.onLanguageChange(loadCurrentContent);
  }

  function bindEvents() {
    elements.content.addEventListener("click", function (event) {
      if (event.target.closest("[data-retry-legal]")) {
        loadCurrentContent();
      }
    });
  }

  function loadCurrentContent() {
    var requestId = ++activeRequest;
    var language = i18nApi.getCurrentLanguage();

    renderLoadingState();

    contentApi.load(pageKey, language).then(function (content) {
      if (requestId !== activeRequest) {
        return;
      }

      renderLegalContent(content);
      renderPageMeta(content, language);
    }).catch(function () {
      if (requestId !== activeRequest) {
        return;
      }

      renderErrorState();
    });
  }

  function renderLoadingState() {
    elements.content.setAttribute("aria-busy", "true");
    elements.content.innerHTML = [
      '<h1 id="legal-title" class="font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">',
      escapeHtml(i18nApi.t("legalPage.loadingTitle")),
      "</h1>",
      '<p class="mt-4 text-sm leading-7 text-stone-700">',
      escapeHtml(i18nApi.t("legalPage.loadingText")),
      "</p>"
    ].join("");
  }

  function renderErrorState() {
    elements.content.setAttribute("aria-busy", "false");
    elements.content.innerHTML = [
      '<div class="text-center">',
      '<h1 id="legal-title" class="font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">',
      escapeHtml(i18nApi.t("legalPage.errorTitle")),
      "</h1>",
      '<p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-700">',
      escapeHtml(i18nApi.t("legalPage.errorText")),
      "</p>",
      '<button type="button" data-retry-legal class="mt-6 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">',
      escapeHtml(i18nApi.t("legalPage.retryAction")),
      "</button>",
      "</div>"
    ].join("");
  }

  function renderLegalContent(content) {
    var sections = Array.isArray(content.sections) ? content.sections : [];
    var sectionMarkup = sections.map(function (section, index) {
      var headingId = "legal-section-title-" + index;
      var paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
      var items = Array.isArray(section.items) ? section.items : [];

      return [
        '<section class="legal-section" aria-labelledby="' + headingId + '">',
        '<h2 id="' + headingId + '">' + escapeHtml(section.title) + "</h2>",
        paragraphs.map(function (paragraph) {
          return "<p>" + escapeHtml(paragraph) + "</p>";
        }).join(""),
        items.length ? [
          '<ul class="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-stone-700 sm:text-base">',
          items.map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          }).join(""),
          "</ul>"
        ].join("") : "",
        "</section>"
      ].join("");
    }).join("");

    elements.content.setAttribute("aria-busy", "false");
    elements.content.innerHTML = [
      '<h1 id="legal-title" class="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">',
      escapeHtml(content.title),
      "</h1>",
      '<div class="mt-8 border-t border-clove/10">',
      sectionMarkup,
      '<p class="mt-10 border-t border-clove/10 pt-6 text-xs font-semibold text-stone-500">',
      escapeHtml(content.updatedAt),
      "</p>",
      "</div>"
    ].join("");
  }

  function renderPageMeta(content, language) {
    document.title = content.pageTitle;
    elements.metaDescription.setAttribute("content", content.metaDescription);
    elements.ogTitle.setAttribute("content", content.pageTitle);
    elements.ogDescription.setAttribute("content", content.metaDescription);
    elements.ogLocale.setAttribute("content", language === "es" ? "es_ES" : "en_GB");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
