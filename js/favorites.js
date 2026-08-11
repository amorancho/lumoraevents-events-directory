(function () {
  var STORAGE_KEY = "lumoraevents-favorite-event-ids";
  var favoriteEventIds = readFavoriteEventIds();
  var listeners = [];
  var noticeTimeout = null;

  function normalizeEventId(eventId) {
    return String(eventId == null ? "" : eventId).trim();
  }

  function normalizeFavoriteEventIds(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.reduce(function (eventIds, eventId) {
      var normalizedEventId = normalizeEventId(eventId);

      if (normalizedEventId && eventIds.indexOf(normalizedEventId) === -1) {
        eventIds.push(normalizedEventId);
      }

      return eventIds;
    }, []);
  }

  function parseFavoriteEventIds(value) {
    if (!value) {
      return [];
    }

    try {
      return normalizeFavoriteEventIds(JSON.parse(value));
    } catch (error) {
      return [];
    }
  }

  function readFavoriteEventIds() {
    try {
      return parseFavoriteEventIds(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return [];
    }
  }

  function persistFavoriteEventIds(eventIds) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(eventIds));
      return true;
    } catch (error) {
      return false;
    }
  }

  function isFavorite(eventId) {
    var normalizedEventId = normalizeEventId(eventId);
    return normalizedEventId && favoriteEventIds.indexOf(normalizedEventId) !== -1;
  }

  function toggle(eventId) {
    var normalizedEventId = normalizeEventId(eventId);

    if (!normalizedEventId) {
      return {
        isFavorite: false,
        isFirstFavorite: false,
        isPersisted: false
      };
    }

    var wasFavorite = isFavorite(normalizedEventId);
    var wasEmpty = favoriteEventIds.length === 0;

    favoriteEventIds = wasFavorite
      ? favoriteEventIds.filter(function (favoriteEventId) {
        return favoriteEventId !== normalizedEventId;
      })
      : favoriteEventIds.concat(normalizedEventId);

    var isPersisted = persistFavoriteEventIds(favoriteEventIds);
    emitChange();

    return {
      isFavorite: !wasFavorite,
      isFirstFavorite: !wasFavorite && wasEmpty && isPersisted,
      isPersisted: isPersisted
    };
  }

  function buildButton(eventId, labels) {
    var normalizedEventId = normalizeEventId(eventId);
    var selected = isFavorite(normalizedEventId);
    var label = selected ? labels.remove : labels.add;

    return [
      '<button type="button" class="favorite-button' + (selected ? " is-favorite" : "") + '" data-favorite-event-id="' + escapeHtml(normalizedEventId) + '" aria-pressed="' + (selected ? "true" : "false") + '" aria-label="' + escapeHtml(label) + '" title="' + escapeHtml(label) + '">',
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="' + (selected ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8" class="h-3.5 w-3.5">',
      '<path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />',
      "</svg>",
      "</button>"
    ].join("");
  }

  function syncButtons(root, labels) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }

    root.querySelectorAll("[data-favorite-event-id]").forEach(function (button) {
      var selected = isFavorite(button.getAttribute("data-favorite-event-id"));
      var label = selected ? labels.remove : labels.add;
      var icon = button.querySelector("svg");

      button.classList.toggle("is-favorite", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);

      if (icon) {
        icon.setAttribute("fill", selected ? "currentColor" : "none");
      }
    });
  }

  function showStorageNotice() {
    var notice = document.querySelector("[data-favorite-notice]");

    if (!notice) {
      return;
    }

    window.clearTimeout(noticeTimeout);
    notice.classList.remove("hidden");
    noticeTimeout = window.setTimeout(function () {
      notice.classList.add("hidden");
    }, 6000);
  }

  function onChange(listener) {
    listeners.push(listener);
  }

  function emitChange() {
    listeners.forEach(function (listener) {
      listener(favoriteEventIds.slice());
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

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    favoriteEventIds = parseFavoriteEventIds(event.newValue);
    emitChange();
  });

  window.LumoraEventsFavorites = {
    isFavorite: isFavorite,
    toggle: toggle,
    buildButton: buildButton,
    syncButtons: syncButtons,
    showStorageNotice: showStorageNotice,
    onChange: onChange
  };
})();
