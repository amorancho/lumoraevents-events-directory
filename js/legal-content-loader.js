(function () {
  var registry = {};
  var pendingLoads = {};
  var loaderScript = document.currentScript;
  var loaderBaseUrl = loaderScript && loaderScript.src
    ? new URL(".", loaderScript.src)
    : new URL("./js/", window.location.href);
  var contentPaths = {
    legalNotice: {
      es: "content/legal/legal.es.js",
      en: "content/legal/legal.en.js"
    },
    privacyPolicy: {
      es: "content/legal/privacy.es.js",
      en: "content/legal/privacy.en.js"
    },
    cookiePolicy: {
      es: "content/legal/cookies.es.js",
      en: "content/legal/cookies.en.js"
    }
  };

  function buildKey(page, language) {
    return page + "." + language;
  }

  function register(page, language, content) {
    var key = buildKey(page, language);

    if (!contentPaths[page] || !contentPaths[page][language]) {
      return;
    }

    registry[key] = content;
  }

  function load(page, language) {
    var key = buildKey(page, language);
    var relativePath = contentPaths[page] && contentPaths[page][language];

    if (!relativePath) {
      return Promise.reject(new Error("Unknown legal content: " + key));
    }

    if (registry[key]) {
      return Promise.resolve(registry[key]);
    }

    if (pendingLoads[key]) {
      return pendingLoads[key];
    }

    var contentUrl = new URL(relativePath, loaderBaseUrl).href;
    var loadPromise = window.location.protocol === "file:"
      ? loadClassicScript(contentUrl, key)
      : import(contentUrl).then(function () {
        return getRegisteredContent(key);
      });

    pendingLoads[key] = loadPromise.then(function (content) {
      delete pendingLoads[key];
      return content;
    }).catch(function (error) {
      delete pendingLoads[key];
      throw error;
    });

    return pendingLoads[key];
  }

  function loadClassicScript(contentUrl, key) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");

      script.src = contentUrl;
      script.async = true;
      script.onload = function () {
        script.remove();

        try {
          resolve(getRegisteredContent(key));
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = function () {
        script.remove();
        reject(new Error("Could not load legal content: " + key));
      };

      document.head.appendChild(script);
    });
  }

  function getRegisteredContent(key) {
    if (!registry[key]) {
      throw new Error("Legal content did not register: " + key);
    }

    return registry[key];
  }

  window.LumoraEventsLegalContent = {
    load: load,
    register: register
  };
})();
