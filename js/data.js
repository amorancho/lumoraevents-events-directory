(function () {
  var events = [
    {
      id: "andalus-gala-2026",
      slug: "andalus-gala-seville",
      name: {
        es: "Andalus Moon Gala",
        en: "Andalus Moon Gala"
      },
      description: {
        es: "Festival boutique de tres días en Sevilla con galas nocturnas, talleres de técnica oriental y una jornada final dedicada a fusiones escénicas contemporáneas.",
        en: "Three-day boutique festival in Seville with evening galas, oriental technique workshops, and a final day focused on contemporary stage fusion."
      },
      countryCode: "ES",
      country: {
        es: "España",
        en: "Spain"
      },
      city: "Sevilla",
      startDate: "2026-09-18",
      endDate: "2026-09-20",
      month: 9,
      type: {
        es: "Festival",
        en: "Festival"
      },
      website: "https://example.com/andalus-moon-gala",
      instagram: "https://instagram.com/andalusmoongala",
      posterUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "nile-crown-cup-2026",
      slug: "nile-crown-cup-cairo",
      name: {
        es: "Nile Crown Cup",
        en: "Nile Crown Cup"
      },
      description: {
        es: "Competición internacional en El Cairo con rondas solistas, categorías profesionales y jurado invitado de maestros egipcios.",
        en: "International competition in Cairo with solo rounds, professional categories, and an invited jury of Egyptian masters."
      },
      countryCode: "EG",
      country: {
        es: "Egipto",
        en: "Egypt"
      },
      city: "El Cairo",
      startDate: "2026-11-05",
      endDate: "2026-11-07",
      month: 11,
      type: {
        es: "Competición",
        en: "Competition"
      },
      website: "https://example.com/nile-crown-cup",
      instagram: "https://instagram.com/nilecrowncup",
      posterUrl: "https://images.unsplash.com/photo-1508020963102-c6c723be5764?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "desert-rhythm-retreat-2026",
      slug: "desert-rhythm-retreat-marrakech",
      name: {
        es: "Desert Rhythm Retreat",
        en: "Desert Rhythm Retreat"
      },
      description: {
        es: "Retiro inmersivo cerca de Marrakech con sesiones matinales, laboratorios coreográficos y experiencias culturales para bailarinas de nivel intermedio y avanzado.",
        en: "Immersive retreat near Marrakech with morning sessions, choreography labs, and cultural experiences for intermediate and advanced dancers."
      },
      countryCode: "MA",
      country: {
        es: "Marruecos",
        en: "Morocco"
      },
      city: "Marrakech",
      startDate: "2026-10-12",
      endDate: "2026-10-16",
      month: 10,
      type: {
        es: "Retiro",
        en: "Retreat"
      },
      website: "https://example.com/desert-rhythm-retreat",
      instagram: "",
      posterUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "golden-veils-weekend-2026",
      slug: "golden-veils-weekend-london",
      name: {
        es: "Golden Veils Weekend",
        en: "Golden Veils Weekend"
      },
      description: {
        es: "Encuentro urbano en Londres con workshops intensivos, showcase de escuelas europeas y networking para organizadores y artistas.",
        en: "Urban gathering in London with intensive workshops, a showcase by European schools, and networking for organizers and artists."
      },
      countryCode: "GB",
      country: {
        es: "Reino Unido",
        en: "United Kingdom"
      },
      city: "Londres",
      startDate: "2026-07-10",
      endDate: "2026-07-12",
      month: 7,
      type: {
        es: "Encuentro",
        en: "Gathering"
      },
      website: "https://example.com/golden-veils-weekend",
      instagram: "https://instagram.com/goldenveilsweekend",
      posterUrl: ""
    },
    {
      id: "latina-shimmy-summit-2026",
      slug: "latina-shimmy-summit-buenos-aires",
      name: {
        es: "Latina Shimmy Summit",
        en: "Latina Shimmy Summit"
      },
      description: {
        es: "Cumbre sudamericana de Bellydance con clases magistrales, mesa redonda para productoras y gala con talento emergente de Latinoamérica.",
        en: "South American Bellydance summit featuring master classes, a producers' roundtable, and a gala with emerging Latin American talent."
      },
      countryCode: "AR",
      country: {
        es: "Argentina",
        en: "Argentina"
      },
      city: "Buenos Aires",
      startDate: "2026-08-21",
      endDate: "2026-08-23",
      month: 8,
      type: {
        es: "Festival",
        en: "Festival"
      },
      website: "",
      instagram: "https://instagram.com/latinashimmysummit",
      posterUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "oasis-stars-showcase-2026",
      slug: "oasis-stars-showcase-dubai",
      name: {
        es: "Oasis Stars Showcase",
        en: "Oasis Stars Showcase"
      },
      description: {
        es: "Showcase premium en Dubái con producción audiovisual de alto nivel, formato gala y sesiones privadas para artistas invitadas.",
        en: "Premium showcase in Dubai with high-end audiovisual production, gala format, and private sessions for invited artists."
      },
      countryCode: "AE",
      country: {
        es: "Emiratos Árabes Unidos",
        en: "United Arab Emirates"
      },
      city: "Dubái",
      startDate: "2026-12-03",
      endDate: "2026-12-04",
      month: 12,
      type: {
        es: "Showcase",
        en: "Showcase"
      },
      website: "https://example.com/oasis-stars-showcase",
      instagram: "",
      posterUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "silk-road-fusion-lab-2026",
      slug: "silk-road-fusion-lab-berlin",
      name: {
        es: "Silk Road Fusion Lab",
        en: "Silk Road Fusion Lab"
      },
      description: {
        es: "Laboratorio creativo en Berlín para fusiones contemporáneas, improvisación dirigida y desarrollo de piezas escénicas colaborativas.",
        en: "Creative lab in Berlin for contemporary fusion, guided improvisation, and collaborative stage piece development."
      },
      countryCode: "DE",
      country: {
        es: "Alemania",
        en: "Germany"
      },
      city: "Berlín",
      startDate: "2026-06-27",
      endDate: "2026-06-28",
      month: 6,
      type: {
        es: "Workshop intensivo",
        en: "Intensive workshop"
      },
      website: "https://example.com/silk-road-fusion-lab",
      instagram: "https://instagram.com/silkroadfusionlab",
      posterUrl: ""
    },
    {
      id: "moonlit-drum-journey-2027",
      slug: "moonlit-drum-journey-mexico-city",
      name: {
        es: "Moonlit Drum Journey",
        en: "Moonlit Drum Journey"
      },
      description: {
        es: "Encuentro de enero en Ciudad de México con foco en percusión para danza oriental, musicalidad y entrenamiento escénico.",
        en: "January gathering in Mexico City focused on oriental dance percussion, musicality, and stage training."
      },
      countryCode: "MX",
      country: {
        es: "México",
        en: "Mexico"
      },
      city: "Ciudad de México",
      startDate: "2027-01-15",
      endDate: "2027-01-17",
      month: 1,
      type: {
        es: "Encuentro",
        en: "Gathering"
      },
      website: "https://example.com/moonlit-drum-journey",
      instagram: "https://instagram.com/moonlitdrumjourney",
      posterUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  function getLocalizedText(value, language) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[language] || value.es || value.en || "";
    }

    return value || "";
  }

  function getEventById(id) {
    return events.find(function (event) {
      return String(event.id) === String(id);
    }) || null;
  }

  function sortEventsByStartDate(list) {
    return list.slice().sort(function (left, right) {
      return new Date(left.startDate).getTime() - new Date(right.startDate).getTime();
    });
  }

  window.LumoraEventsData = {
    site: {
      brandName: "LumoraEvents",
      contactEmail: "hello@lumoraevents.com"
    },
    events: sortEventsByStartDate(events),
    getEventById: getEventById,
    getLocalizedText: getLocalizedText
  };
})();
