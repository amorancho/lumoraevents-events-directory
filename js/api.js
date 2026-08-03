(function () {
  var LOCAL_API_BASE_URL = "http://127.0.0.1:3000";
  var PRODUCTION_API_BASE_URL = "https://api.lumoraevents.net";

  function getApiBaseUrl() {
    if (window.LUMORA_EVENTS_API_BASE_URL) {
      return String(window.LUMORA_EVENTS_API_BASE_URL).replace(/\/$/, "");
    }

    var isLocal = window.location.protocol === "file:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    return isLocal ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
  }

  function getDirectoryEvents(options) {
    var settings = options || {};
    var page = toPositiveInteger(settings.page, 1);
    var pageSize = toIntegerInRange(settings.pageSize, 12, 1, 100);
    var name = String(settings.name || "").trim().slice(0, 150);
    var country = String(settings.country || "").toUpperCase();
    var month = String(settings.month || "");
    var url = new URL("/public/directory-events", getApiBaseUrl());

    url.searchParams.set("page", page);
    url.searchParams.set("page_size", pageSize);

    if (name) {
      url.searchParams.set("name", name);
    }

    if (/^[A-Z]{2}$/.test(country)) {
      url.searchParams.set("country", country);
    }

    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      url.searchParams.set("month", month);
    }

    return window.fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      },
      signal: settings.signal
    }).then(function (response) {
      if (!response.ok) {
        throw createRequestError("Directory events request failed", response.status);
      }

      return response.json();
    }).then(function (payload) {
      if (!payload || !Array.isArray(payload.data)) {
        throw new Error("Directory events response has an invalid shape");
      }

      var events = payload.data.map(normalizeDirectoryEvent).filter(Boolean);

      return {
        events: events,
        pagination: normalizePagination(payload.pagination, page, pageSize, events.length)
      };
    });
  }

  function getDirectoryEvent(id, options) {
    var eventId = String(id || "").trim();
    var settings = options || {};

    if (!eventId) {
      return Promise.reject(createRequestError("Directory event id is required", 400));
    }

    var url = new URL(
      "/public/directory-events/" + encodeURIComponent(eventId),
      getApiBaseUrl()
    );

    return window.fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      },
      signal: settings.signal
    }).then(function (response) {
      if (!response.ok) {
        throw createRequestError("Directory event request failed", response.status);
      }

      return response.json();
    }).then(function (payload) {
      var eventItem = payload && payload.data && !Array.isArray(payload.data)
        ? payload.data
        : payload;
      var normalizedEvent = normalizeDirectoryEventDetail(eventItem);

      if (!normalizedEvent) {
        throw createRequestError("Directory event response has an invalid shape", 502);
      }

      return normalizedEvent;
    });
  }

  function normalizeDirectoryEvent(eventItem) {
    if (!eventItem || eventItem.id === undefined || eventItem.id === null || !eventItem.name) {
      return null;
    }

    var startDate = String(eventItem.start_date || "");

    return {
      id: eventItem.id,
      name: String(eventItem.name),
      startDate: startDate,
      endDate: String(eventItem.end_date || eventItem.start_date || ""),
      city: String(eventItem.city || ""),
      countryCode: String(eventItem.country_code || "").toUpperCase(),
      type: String(eventItem.event_type || ""),
      isLumoraEvent: eventItem.is_lumora_event === true,
      month: getMonthNumber(startDate)
    };
  }

  function normalizeDirectoryEventDetail(eventItem) {
    var summary = normalizeDirectoryEvent(eventItem);

    if (!summary) {
      return null;
    }

    return Object.assign({}, summary, {
      description: String(eventItem.description || ""),
      venue: String(eventItem.venue || ""),
      websiteUrl: normalizeHttpUrl(eventItem.website_url),
      registrationUrl: normalizeHttpUrl(eventItem.registration_url),
      instagramUrl: normalizeHttpUrl(eventItem.instagram_url),
      facebookUrl: normalizeHttpUrl(eventItem.facebook_url),
      tiktokUrl: normalizeHttpUrl(eventItem.tiktok_url),
      youtubeUrl: normalizeHttpUrl(eventItem.youtube_url),
      contactEmail: normalizeEmail(eventItem.contact_email),
      posterUrl: normalizeHttpUrl(eventItem.poster_url),
      danceStyles: splitCommaSeparatedValue(eventItem.dance_styles),
      masters: splitCommaSeparatedValue(eventItem.masters),
      updatedAt: String(eventItem.updated_at || "")
    });
  }

  function normalizePagination(pagination, requestedPage, requestedPageSize, eventCount) {
    var source = pagination || {};
    var page = toPositiveInteger(source.page, requestedPage);
    var pageSize = toPositiveInteger(source.page_size, requestedPageSize);
    var totalItems = toNonNegativeInteger(source.total_items, eventCount);
    var fallbackTotalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;
    var totalPages = toNonNegativeInteger(source.total_pages, fallbackTotalPages);

    if (totalPages === 0) {
      page = 1;
    }

    return {
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      totalPages: totalPages
    };
  }

  function getMonthNumber(value) {
    var match = String(value).match(/^\d{4}-(\d{2})-\d{2}/);
    return match ? Number(match[1]) : 0;
  }

  function normalizeHttpUrl(value) {
    if (!value) {
      return "";
    }

    try {
      var url = new URL(String(value));
      return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
    } catch (error) {
      return "";
    }
  }

  function normalizeEmail(value) {
    var email = String(value || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  }

  function splitCommaSeparatedValue(value) {
    return String(value || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function createRequestError(message, status) {
    var error = new Error(message + " with status " + status);
    error.status = status;
    return error;
  }

  function toPositiveInteger(value, fallback) {
    var number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  function toNonNegativeInteger(value, fallback) {
    var number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : fallback;
  }

  function toIntegerInRange(value, fallback, minimum, maximum) {
    var number = Number(value);
    return Number.isInteger(number) && number >= minimum && number <= maximum ? number : fallback;
  }

  window.LumoraEventsApi = {
    getApiBaseUrl: getApiBaseUrl,
    getDirectoryEvents: getDirectoryEvents,
    getDirectoryEvent: getDirectoryEvent
  };
})();
