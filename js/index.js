(function () {
  var dataApi = window.LumoraEventsData;
  var i18nApi = window.LumoraEventsI18n;

  if (!dataApi || !i18nApi) {
    return;
  }

  var elements = {};
  var filters = {
    search: "",
    countryCode: "",
    month: ""
  };

  document.addEventListener("DOMContentLoaded", initIndexPage);

  function initIndexPage() {
    elements.filtersForm = document.getElementById("filters-form");
    elements.searchInput = document.getElementById("search-input");
    elements.countrySelect = document.getElementById("country-select");
    elements.monthSelect = document.getElementById("month-select");
    elements.resultsList = document.getElementById("results-list");
    elements.resultsCount = document.getElementById("results-count");
    elements.metaDescription = document.querySelector('meta[name="description"]');
    elements.ogTitle = document.querySelector('meta[property="og:title"]');
    elements.ogDescription = document.querySelector('meta[property="og:description"]');
    elements.ogLocale = document.querySelector('meta[property="og:locale"]');

    i18nApi.initPage();
    bindEvents();
    renderPageMeta();
    renderFilterOptions();
    renderResults();

    i18nApi.onLanguageChange(function () {
      renderPageMeta();
      renderFilterOptions();
      renderResults();
    });
  }

  function bindEvents() {
    elements.filtersForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    elements.searchInput.addEventListener("input", function (event) {
      filters.search = event.target.value;
      renderResults();
    });

    elements.countrySelect.addEventListener("change", function (event) {
      filters.countryCode = event.target.value;
      renderResults();
    });

    elements.monthSelect.addEventListener("change", function (event) {
      filters.month = event.target.value;
      renderResults();
    });
  }

  function renderPageMeta() {
    document.title = i18nApi.t("index.pageTitle");
    elements.metaDescription.setAttribute("content", i18nApi.t("index.metaDescription"));
    elements.ogTitle.setAttribute("content", i18nApi.t("index.pageTitle"));
    elements.ogDescription.setAttribute("content", i18nApi.t("index.metaDescription"));
    elements.ogLocale.setAttribute("content", i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB");
  }

  function renderFilterOptions() {
    var activeLanguage = i18nApi.getCurrentLanguage();
    var countryOptions = buildCountryOptions(activeLanguage);
    var monthOptions = buildMonthOptions(activeLanguage);

    elements.countrySelect.innerHTML = countryOptions;
    elements.monthSelect.innerHTML = monthOptions;
    elements.countrySelect.value = filters.countryCode;
    elements.monthSelect.value = filters.month;
  }

  function buildCountryOptions(language) {
    var countries = [];
    var seen = {};

    dataApi.events.forEach(function (eventItem) {
      if (!seen[eventItem.countryCode]) {
        seen[eventItem.countryCode] = true;
        countries.push({
          code: eventItem.countryCode,
          label: dataApi.getLocalizedText(eventItem.country, language)
        });
      }
    });

    countries.sort(function (left, right) {
      return left.label.localeCompare(right.label, language);
    });

    var options = ['<option value="">' + escapeHtml(i18nApi.t("index.allCountries")) + "</option>"];

    countries.forEach(function (country) {
      options.push(
        '<option value="' + escapeHtml(country.code) + '">' + escapeHtml(country.label) + "</option>"
      );
    });

    return options.join("");
  }

  function buildMonthOptions(language) {
    var monthSet = {};

    dataApi.events.forEach(function (eventItem) {
      monthSet[eventItem.month] = true;
    });

    var monthValues = Object.keys(monthSet).sort(function (left, right) {
      return Number(left) - Number(right);
    });

    var options = ['<option value="">' + escapeHtml(i18nApi.t("index.allMonths")) + "</option>"];

    monthValues.forEach(function (month) {
      options.push(
        '<option value="' + month + '">' +
          escapeHtml(capitalize(i18nApi.getMonthName(Number(month), language))) +
        "</option>"
      );
    });

    return options.join("");
  }

  function getFilteredEvents() {
    var normalizedSearch = normalizeText(filters.search);

    return dataApi.events.filter(function (eventItem) {
      if (filters.countryCode && eventItem.countryCode !== filters.countryCode) {
        return false;
      }

      if (filters.month && String(eventItem.month) !== String(filters.month)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      var haystack = [
        dataApi.getLocalizedText(eventItem.name, "es"),
        dataApi.getLocalizedText(eventItem.name, "en"),
        dataApi.getLocalizedText(eventItem.description, "es"),
        dataApi.getLocalizedText(eventItem.description, "en"),
        dataApi.getLocalizedText(eventItem.country, "es"),
        dataApi.getLocalizedText(eventItem.country, "en"),
        dataApi.getLocalizedText(eventItem.type, "es"),
        dataApi.getLocalizedText(eventItem.type, "en"),
        eventItem.city
      ].join(" ");

      return normalizeText(haystack).indexOf(normalizedSearch) >= 0;
    });
  }

  function renderResults() {
    var activeLanguage = i18nApi.getCurrentLanguage();
    var filteredEvents = getFilteredEvents();

    elements.resultsCount.textContent = getResultCountLabel(filteredEvents.length);

    if (!filteredEvents.length) {
      elements.resultsList.innerHTML = [
        '<article class="rounded-[1.6rem] border border-dashed border-clove/20 bg-white/70 px-5 py-8 text-center shadow-sm">',
        '<h3 class="font-display text-3xl text-ink">' + escapeHtml(i18nApi.t("index.emptyTitle")) + "</h3>",
        '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("index.emptyText")) + "</p>",
        "</article>"
      ].join("");
      return;
    }

    elements.resultsList.innerHTML = filteredEvents.map(function (eventItem) {
      return buildEventRow(eventItem, activeLanguage);
    }).join("");
  }

  function buildEventRow(eventItem, language) {
    var eventName = dataApi.getLocalizedText(eventItem.name, language);
    var eventType = dataApi.getLocalizedText(eventItem.type, language);
    var countryName = dataApi.getLocalizedText(eventItem.country, language);
    var dateLabel = i18nApi.formatDateRange(eventItem.startDate, eventItem.endDate, language);
    var monthLabel = capitalize(i18nApi.getMonthName(eventItem.month, language));
    var locationLabel = eventItem.city + ", " + countryName;
    var detailUrl = "./event.html?id=" + encodeURIComponent(eventItem.id);

    return [
      '<article class="premium-row" aria-labelledby="event-' + escapeHtml(eventItem.id) + '">',
      '<div class="min-w-0">',
      '<div class="flex flex-wrap items-center gap-2">',
      '<span class="tag-chip">' + escapeHtml(eventType) + "</span>",
      '<span class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(monthLabel) + "</span>",
      "</div>",
      '<h3 id="event-' + escapeHtml(eventItem.id) + '" class="mt-3 truncate font-display text-3xl leading-none text-ink">' + escapeHtml(eventName) + "</h3>",
      '<p class="mt-2 truncate text-sm text-stone-600">' + escapeHtml(locationLabel) + "</p>",
      "</div>",
      '<div class="text-sm leading-6 text-stone-700">',
      '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(i18nApi.t("common.locationLabel")) + "</p>",
      '<p class="mt-1">' + escapeHtml(locationLabel) + "</p>",
      "</div>",
      '<div class="text-sm leading-6 text-stone-700">',
      '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(i18nApi.t("common.dates")) + "</p>",
      '<p class="mt-1">' + escapeHtml(dateLabel) + "</p>",
      "</div>",
      '<div class="md:justify-self-end">',
      '<a href="' + detailUrl + '" class="inline-flex w-full items-center justify-center rounded-full bg-clove px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink md:w-auto">' + escapeHtml(i18nApi.t("index.viewDetails")) + "</a>",
      "</div>",
      "</article>"
    ].join("");
  }

  function getResultCountLabel(count) {
    return count === 1
      ? i18nApi.t("index.resultCountOne")
      : i18nApi.t("index.resultCountOther", { count: count });
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
