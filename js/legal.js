(function () {
  var i18nApi = window.LumoraEventsI18n;

  if (!i18nApi) {
    return;
  }

  var pageKey = document.body.getAttribute("data-legal-page");
  var elements = {};

  document.addEventListener("DOMContentLoaded", initLegalPage);

  function initLegalPage() {
    elements.metaDescription = document.querySelector('meta[name="description"]');
    elements.ogTitle = document.querySelector('meta[property="og:title"]');
    elements.ogDescription = document.querySelector('meta[property="og:description"]');
    elements.ogLocale = document.querySelector('meta[property="og:locale"]');

    i18nApi.initPage();
    renderPageMeta();
    i18nApi.onLanguageChange(renderPageMeta);
  }

  function renderPageMeta() {
    if (!pageKey) {
      return;
    }

    var pageTitle = i18nApi.t(pageKey + ".pageTitle");
    var metaDescription = i18nApi.t(pageKey + ".metaDescription");

    document.title = pageTitle;
    elements.metaDescription.setAttribute("content", metaDescription);
    elements.ogTitle.setAttribute("content", pageTitle);
    elements.ogDescription.setAttribute("content", metaDescription);
    elements.ogLocale.setAttribute(
      "content",
      i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB"
    );
  }
})();
