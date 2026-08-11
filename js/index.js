(function () {
  var api = window.LumoraEventsApi;
  var i18nApi = window.LumoraEventsI18n;
  var favoritesApi = window.LumoraEventsFavorites;

  if (!api || !i18nApi) {
    return;
  }

  var DEFAULT_PAGE_SIZE = 10;
  var PAGE_SIZE_OPTIONS = [10, 20, 30];
  var RETURN_URL_STORAGE_KEY = "lumoraevents-directory-return-url";
  var elements = {};
  var state = {
    events: [],
    filters: {
      name: "",
      country: "",
      month: "",
      pageSize: DEFAULT_PAGE_SIZE
    },
    pagination: {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0
    },
    isLoading: false,
    hasError: false
  };
  var activeRequest = null;

  document.addEventListener("DOMContentLoaded", initIndexPage);

  function initIndexPage() {
    elements.filtersForm = document.getElementById("filters-form");
    elements.nameInput = document.getElementById("name-input");
    elements.countrySelect = document.getElementById("country-select");
    elements.monthSelect = document.getElementById("month-select");
    elements.pageSizeSelect = document.getElementById("page-size-select");
    elements.clearFilters = document.getElementById("clear-filters");
    elements.resultsList = document.getElementById("results-list");
    elements.resultsCount = document.getElementById("results-count");
    elements.pagination = document.getElementById("pagination");
    elements.metaDescription = document.querySelector('meta[name="description"]');
    elements.ogTitle = document.querySelector('meta[property="og:title"]');
    elements.ogDescription = document.querySelector('meta[property="og:description"]');
    elements.ogLocale = document.querySelector('meta[property="og:locale"]');

    i18nApi.initPage();
    state.filters = getFiltersFromUrl();
    saveCurrentListUrl();
    bindEvents();
    if (favoritesApi) {
      favoritesApi.onChange(syncFavoriteButtons);
    }
    renderPageMeta();
    renderFilterOptions();
    loadEvents(getPageFromUrl());

    i18nApi.onLanguageChange(function () {
      renderPageMeta();
      renderFilterOptions();
      renderCurrentState();
    });
  }

  function bindEvents() {
    elements.filtersForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFiltersFromForm();
    });

    elements.clearFilters.addEventListener("click", function () {
      state.filters = {
        name: "",
        country: "",
        month: "",
        pageSize: state.filters.pageSize
      };
      renderFilterOptions();
      updateUrl(1, false);
      loadEvents(1);
    });

    elements.pageSizeSelect.addEventListener("change", function () {
      var pageSize = Number(elements.pageSizeSelect.value);

      if (PAGE_SIZE_OPTIONS.indexOf(pageSize) === -1) {
        pageSize = DEFAULT_PAGE_SIZE;
        elements.pageSizeSelect.value = String(pageSize);
      }

      if (pageSize === state.filters.pageSize) {
        return;
      }

      state.filters.pageSize = pageSize;
      updateUrl(1, false);
      loadEvents(1);
    });

    elements.resultsList.addEventListener("click", function (event) {
      var favoriteButton = event.target.closest("[data-favorite-event-id]");

      if (favoriteButton && favoritesApi) {
        var result = favoritesApi.toggle(favoriteButton.getAttribute("data-favorite-event-id"));

        if (result.isFirstFavorite) {
          favoritesApi.showStorageNotice();
        }

        return;
      }

      var retryButton = event.target.closest("[data-retry]");

      if (retryButton) {
        loadEvents(state.pagination.page);
      }
    });

    elements.resultsList.addEventListener("error", function (event) {
      var image = event.target;

      if (!image.matches || !image.matches("[data-event-poster-thumbnail]")) {
        return;
      }

      var posterFrame = image.closest("[data-event-poster-frame]");

      if (posterFrame) {
        posterFrame.innerHTML = buildPosterPlaceholder();
      }
    }, true);

    elements.pagination.addEventListener("click", function (event) {
      var pageButton = event.target.closest("[data-page]");

      if (!pageButton || pageButton.disabled) {
        return;
      }

      navigateToPage(Number(pageButton.getAttribute("data-page")));
    });

    window.addEventListener("popstate", function () {
      state.filters = getFiltersFromUrl();
      saveCurrentListUrl();
      renderFilterOptions();
      loadEvents(getPageFromUrl());
    });
  }

  function applyFiltersFromForm() {
    state.filters = normalizeFilters({
      name: elements.nameInput.value,
      country: elements.countrySelect.value,
      month: elements.monthSelect.value,
      pageSize: elements.pageSizeSelect.value
    });
    updateUrl(1, false);
    loadEvents(1);
  }

  function navigateToPage(page) {
    if (state.isLoading || page === state.pagination.page || page < 1) {
      return;
    }

    updateUrl(page, false);
    loadEvents(page, true);
  }

  function loadEvents(page, shouldScrollToResults) {
    var requestedPage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    var scrollAfterLoad = Boolean(shouldScrollToResults);

    if (activeRequest) {
      activeRequest.abort();
    }

    activeRequest = new AbortController();
    state.isLoading = true;
    state.hasError = false;
    state.pagination.page = requestedPage;
    renderLoadingState();

    api.getDirectoryEvents({
      page: requestedPage,
      pageSize: state.filters.pageSize,
      name: state.filters.name,
      country: state.filters.country,
      month: state.filters.month,
      signal: activeRequest.signal
    }).then(function (result) {
      if (result.pagination.totalPages > 0 && requestedPage > result.pagination.totalPages) {
        updateUrl(result.pagination.totalPages, true);
        loadEvents(result.pagination.totalPages, scrollAfterLoad);
        return;
      }

      state.events = result.events;
      state.pagination = result.pagination;
      state.isLoading = false;
      state.hasError = false;
      updateUrl(state.pagination.page, true);
      renderResults();
      renderPagination();
      scrollToResultsAfterRender(scrollAfterLoad);
    }).catch(function (error) {
      if (error.name === "AbortError") {
        return;
      }

      state.events = [];
      state.isLoading = false;
      state.hasError = true;
      renderErrorState();
      scrollToResultsAfterRender(scrollAfterLoad);
    });
  }

  function scrollToResultsAfterRender(shouldScroll) {
    if (!shouldScroll) {
      return;
    }

    window.requestAnimationFrame(function () {
      document.getElementById("results-heading").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  function renderCurrentState() {
    if (state.isLoading) {
      renderLoadingState();
      return;
    }

    if (state.hasError) {
      renderErrorState();
      return;
    }

    renderResults();
    renderPagination();
  }

  function renderPageMeta() {
    document.title = i18nApi.t("index.pageTitle");
    elements.metaDescription.setAttribute("content", i18nApi.t("index.metaDescription"));
    elements.ogTitle.setAttribute("content", i18nApi.t("index.pageTitle"));
    elements.ogDescription.setAttribute("content", i18nApi.t("index.metaDescription"));
    elements.ogLocale.setAttribute("content", i18nApi.getCurrentLanguage() === "es" ? "es_ES" : "en_GB");
  }

  function renderFilterOptions() {
    var language = i18nApi.getCurrentLanguage();
    var countryOptions = [{
      value: "",
      label: i18nApi.t("index.allCountries")
    }];

    i18nApi.getCountryCodes().map(function (countryCode) {
      return {
        value: countryCode,
        label: i18nApi.getCountryName(countryCode, language)
      };
    }).sort(function (left, right) {
      return left.label.localeCompare(right.label, language);
    }).forEach(function (country) {
      countryOptions.push(country);
    });

    elements.countrySelect.innerHTML = countryOptions.map(buildSelectOption).join("");

    var monthOptions = [{
      value: "",
      label: i18nApi.t("index.allMonths")
    }].concat(getUpcomingMonths().map(function (month) {
      return {
        value: month,
        label: i18nApi.formatMonthYear(month, language)
      };
    }));

    elements.monthSelect.innerHTML = monthOptions.map(buildSelectOption).join("");
    elements.nameInput.value = state.filters.name;
    elements.countrySelect.value = state.filters.country;
    elements.monthSelect.value = state.filters.month;
    elements.pageSizeSelect.value = String(state.filters.pageSize);
  }

  function buildSelectOption(option) {
    return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.label) + "</option>";
  }

  function getUpcomingMonths() {
    var today = new Date();
    var months = [];

    for (var offset = 0; offset < 12; offset += 1) {
      var date = new Date(today.getFullYear(), today.getMonth() + offset, 1, 12);
      months.push(date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"));
    }

    return months;
  }

  function renderLoadingState() {
    elements.resultsCount.textContent = i18nApi.t("index.loadingCount");
    elements.resultsList.setAttribute("aria-busy", "true");
    elements.resultsList.innerHTML = [
      '<article class="rounded-[1.6rem] border border-clove/10 bg-white/70 px-5 py-8 text-center shadow-sm">',
      '<h3 class="font-display text-3xl text-ink">' + escapeHtml(i18nApi.t("index.loadingTitle")) + "</h3>",
      '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("index.loadingText")) + "</p>",
      "</article>"
    ].join("");
    elements.pagination.classList.add("hidden");
    elements.pagination.innerHTML = "";
  }

  function renderErrorState() {
    elements.resultsCount.textContent = i18nApi.t("index.unavailableCount");
    elements.resultsList.setAttribute("aria-busy", "false");
    elements.resultsList.innerHTML = [
      '<article class="rounded-[1.6rem] border border-dashed border-clove/20 bg-white/70 px-5 py-8 text-center shadow-sm">',
      '<h3 class="font-display text-3xl text-ink">' + escapeHtml(i18nApi.t("index.errorTitle")) + "</h3>",
      '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t("index.errorText")) + "</p>",
      '<button type="button" data-retry class="mt-5 inline-flex rounded-full bg-clove px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">' + escapeHtml(i18nApi.t("index.retryAction")) + "</button>",
      "</article>"
    ].join("");
    elements.pagination.classList.add("hidden");
    elements.pagination.innerHTML = "";
  }

  function renderResults() {
    var activeLanguage = i18nApi.getCurrentLanguage();

    elements.resultsList.setAttribute("aria-busy", "false");
    elements.resultsCount.textContent = getResultCountLabel();

    if (!state.events.length) {
      var hasFilters = hasActiveSearchFilters();
      elements.resultsList.innerHTML = [
        '<article class="rounded-[1.6rem] border border-dashed border-clove/20 bg-white/70 px-5 py-8 text-center shadow-sm">',
        '<h3 class="font-display text-3xl text-ink">' + escapeHtml(i18nApi.t(hasFilters ? "index.emptyFilteredTitle" : "index.emptyTitle")) + "</h3>",
        '<p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-700">' + escapeHtml(i18nApi.t(hasFilters ? "index.emptyFilteredText" : "index.emptyText")) + "</p>",
        "</article>"
      ].join("");
      return;
    }

    elements.resultsList.innerHTML = state.events.map(function (eventItem) {
      return buildEventRow(eventItem, activeLanguage);
    }).join("");
  }

  function hasActiveSearchFilters() {
    return Boolean(state.filters.name || state.filters.country || state.filters.month);
  }

  function buildEventRow(eventItem, language) {
    var eventType = i18nApi.getEventTypeName(eventItem.type, language);
    var countryName = i18nApi.getCountryName(eventItem.countryCode, language);
    var dateLabel = i18nApi.formatDateRange(eventItem.startDate, eventItem.endDate, language);
    var monthLabel = capitalize(i18nApi.getMonthName(eventItem.month, language));
    var locationLabel = [eventItem.city, countryName].filter(Boolean).join(", ");
    var detailUrl = buildDetailUrl(eventItem.id);

    return [
      '<article class="premium-row" aria-labelledby="event-' + escapeHtml(eventItem.id) + '">',
      buildPosterLink(eventItem, detailUrl),
      '<div class="event-row-main">',
      '<div class="flex flex-wrap items-center gap-2">',
      '<span class="tag-chip">' + escapeHtml(eventType) + "</span>",
      '<span class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(monthLabel) + "</span>",
      buildManagedBadge(eventItem),
      "</div>",
      '<h3 id="event-' + escapeHtml(eventItem.id) + '" class="mt-3 break-words font-display text-xl font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-2xl">',
      '<a href="' + escapeHtml(detailUrl) + '" class="rounded-sm transition hover:text-clove focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/20">' + escapeHtml(eventItem.name) + "</a>",
      "</h3>",
      "</div>",
      '<div class="event-row-dates text-sm leading-6 text-stone-700">',
      '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(i18nApi.t("common.dates")) + "</p>",
      '<p class="mt-1">' + escapeHtml(dateLabel) + "</p>",
      "</div>",
      '<div class="event-row-location text-sm leading-6 text-stone-700">',
      '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">' + escapeHtml(i18nApi.t("common.locationLabel")) + "</p>",
      '<p class="mt-1">' + escapeHtml(locationLabel) + "</p>",
      "</div>",
      '<div class="event-row-actions flex flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:justify-center lg:justify-self-end">',
      favoritesApi ? favoritesApi.buildButton(eventItem.id, getFavoriteLabels()) : "",
      '<a href="' + escapeHtml(detailUrl) + '" class="inline-flex items-center justify-center rounded-full bg-clove px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/20">' + escapeHtml(i18nApi.t("index.viewDetails")) + "</a>",
      "</div>",
      "</article>"
    ].join("");
  }

  function buildPosterLink(eventItem, detailUrl) {
    var thumbnailUrl = api.getPosterThumbnailUrl(eventItem.posterUrl);
    var posterContent = thumbnailUrl
      ? [
        '<img src="' + escapeHtml(thumbnailUrl) + '" alt="' + escapeHtml(eventItem.name) + '"',
        ' loading="lazy" decoding="async" fetchpriority="low" width="160" height="220"',
        ' class="h-full w-full object-contain" data-event-poster-thumbnail>'
      ].join("")
      : buildPosterPlaceholder();

    return [
      '<a href="' + escapeHtml(detailUrl) + '" class="event-row-poster block rounded-xl transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/20"',
      ' aria-label="' + escapeHtml(i18nApi.t("index.posterLinkLabel", { name: eventItem.name })) + '">',
      '<span class="event-poster-frame" data-event-poster-frame>',
      posterContent,
      "</span>",
      "</a>"
    ].join("");
  }

  function buildPosterPlaceholder() {
    return [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 48 48" fill="none" class="h-8 w-8 text-clove/45">',
      '<rect x="9" y="11" width="30" height="28" rx="5" stroke="currentColor" stroke-width="2" />',
      '<path d="M16 8v7M32 8v7M10 20h28" stroke="currentColor" stroke-width="2" stroke-linecap="round" />',
      '<path d="m17 33 5-5 4 4 3-3 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
      "</svg>"
    ].join("");
  }

  function buildManagedBadge(eventItem) {
    if (!eventItem.isLumoraEvent) {
      return "";
    }

    return [
      '<span class="lumora-managed-chip">',
      '<svg aria-hidden="true" viewBox="0 0 20 20" class="h-3.5 w-3.5 shrink-0 fill-gold">',
      '<path d="M10 1.75c.55 3.74 2.52 5.71 6.25 6.25-3.73.55-5.7 2.52-6.25 6.25C9.45 10.52 7.48 8.55 3.75 8 7.48 7.46 9.45 5.49 10 1.75Z" />',
      '<path d="M15.6 12.1c.23 1.55 1.05 2.37 2.6 2.6-1.55.22-2.37 1.04-2.6 2.6-.22-1.56-1.04-2.38-2.6-2.6 1.56-.23 2.38-1.05 2.6-2.6Z" />',
      "</svg>",
      '<span>' + escapeHtml(i18nApi.t("index.managedByLumora")) + "</span>",
      "</span>"
    ].join("");
  }

  function getFavoriteLabels() {
    return {
      add: i18nApi.t("favorites.add"),
      remove: i18nApi.t("favorites.remove")
    };
  }

  function syncFavoriteButtons() {
    if (!favoritesApi) {
      return;
    }

    favoritesApi.syncButtons(elements.resultsList, getFavoriteLabels());
  }

  function buildDetailUrl(eventId) {
    var searchParams = new URLSearchParams();

    searchParams.set("id", eventId);

    return "./event.html?" + searchParams.toString();
  }

  function saveCurrentListUrl() {
    try {
      window.sessionStorage.setItem(
        RETURN_URL_STORAGE_KEY,
        "./index.html" + window.location.search + window.location.hash
      );
    } catch (error) {
      // sessionStorage can be unavailable in restrictive browser modes.
    }
  }

  function renderPagination() {
    var pagination = state.pagination;

    if (pagination.totalPages <= 1) {
      elements.pagination.classList.add("hidden");
      elements.pagination.innerHTML = "";
      return;
    }

    var buttons = [];
    var visiblePages = getVisiblePages(pagination.page, pagination.totalPages);

    buttons.push(buildPageButton(
      pagination.page - 1,
      i18nApi.t("index.previousPage"),
      pagination.page === 1,
      false
    ));

    visiblePages.forEach(function (page) {
      buttons.push(buildPageButton(page, String(page), false, page === pagination.page));
    });

    buttons.push(buildPageButton(
      pagination.page + 1,
      i18nApi.t("index.nextPage"),
      pagination.page === pagination.totalPages,
      false
    ));

    elements.pagination.innerHTML = buttons.join("");
    elements.pagination.classList.remove("hidden");
  }

  function buildPageButton(page, label, disabled, isCurrent) {
    var className = isCurrent
      ? "border-clove bg-clove text-white"
      : "border-clove/15 bg-white/80 text-clove hover:border-clove hover:text-ink";

    return [
      '<button type="button" data-page="' + page + '" class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ' + className + '"',
      disabled ? " disabled" : "",
      isCurrent ? ' aria-current="page"' : "",
      isCurrent ? ' aria-label="' + escapeHtml(i18nApi.t("index.currentPage", { page: page })) + '"' : "",
      ">" + escapeHtml(label) + "</button>"
    ].join("");
  }

  function getVisiblePages(currentPage, totalPages) {
    var firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    var lastPage = Math.min(totalPages, firstPage + 4);
    var pages = [];

    for (var page = firstPage; page <= lastPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  function getResultCountLabel() {
    var pagination = state.pagination;

    if (!pagination.totalItems) {
      return i18nApi.t("index.resultCountZero");
    }

    if (pagination.totalItems === 1) {
      return i18nApi.t("index.resultCountOne");
    }

    var start = (pagination.page - 1) * pagination.pageSize + 1;
    var end = Math.min(start + state.events.length - 1, pagination.totalItems);

    return i18nApi.t("index.resultCountRange", {
      start: start,
      end: end,
      total: pagination.totalItems
    });
  }

  function getPageFromUrl() {
    var page = Number(new URLSearchParams(window.location.search).get("page"));
    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  function getFiltersFromUrl() {
    var searchParams = new URLSearchParams(window.location.search);

    return normalizeFilters({
      name: searchParams.get("name"),
      country: searchParams.get("country"),
      month: searchParams.get("month"),
      pageSize: searchParams.get("page_size")
    });
  }

  function normalizeFilters(filters) {
    var name = String(filters.name || "").trim().slice(0, 150);
    var country = String(filters.country || "").toUpperCase();
    var month = String(filters.month || "");
    var pageSize = Number(filters.pageSize);

    if (i18nApi.getCountryCodes().indexOf(country) === -1) {
      country = "";
    }

    if (getUpcomingMonths().indexOf(month) === -1) {
      month = "";
    }

    if (PAGE_SIZE_OPTIONS.indexOf(pageSize) === -1) {
      pageSize = DEFAULT_PAGE_SIZE;
    }

    return {
      name: name,
      country: country,
      month: month,
      pageSize: pageSize
    };
  }

  function updateUrl(page, replace) {
    var url = new URL(window.location.href);

    if (page > 1) {
      url.searchParams.set("page", page);
    } else {
      url.searchParams.delete("page");
    }

    setOptionalSearchParam(url, "name", state.filters.name);
    setOptionalSearchParam(url, "country", state.filters.country);
    setOptionalSearchParam(url, "month", state.filters.month);
    setOptionalSearchParam(
      url,
      "page_size",
      state.filters.pageSize === DEFAULT_PAGE_SIZE ? "" : state.filters.pageSize
    );

    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
    saveCurrentListUrl();
  }

  function setOptionalSearchParam(url, name, value) {
    if (value) {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
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
