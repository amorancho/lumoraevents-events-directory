# Contexto del proyecto: LumoraEvents Events Directory

Este archivo es la referencia funcional y técnica viva del repositorio. Actualízalo cuando cambien el alcance, el contrato de la API, la arquitectura o una decisión relevante.

## Objetivo

Directorio web público de eventos de Bellydance de LumoraEvents. La experiencia prevista incluye el directorio, la ficha de evento y las páginas legales básicas:

- `index.html`: listado paginado de próximos eventos.
- `event.html?id=<id>`: ficha completa de un evento.
- `legal-notice.html`: aviso legal.
- `privacy-policy.html`: política de privacidad.
- `cookie-policy.html`: política de cookies.

El repositorio se publica en GitHub y se vinculará a un dominio propio. Es una aplicación estática sin build: HTML, Tailwind CSS cargado desde CDN y JavaScript del navegador.

## Arquitectura actual

- `index.html` + `js/index.js`: vista de listado y estados de carga, error, vacío y paginación.
- `js/api.js`: selección de entorno, llamadas HTTP y adaptación del contrato externo al modelo de UI.
- `event.html` + `js/event.js`: vista detalle conectada a la API, con estados de carga, error y 404.
- `legal-notice.html`, `privacy-policy.html` y `cookie-policy.html` + `js/legal.js`: shells estáticos de las páginas legales y renderizado compartido del documento activo.
- `js/legal-content-loader.js`: carga bajo demanda únicamente el documento legal y el idioma activos; usa `import()` en HTTP/HTTPS y carga de script dinámica como fallback en `file:`.
- `js/content/legal/*.js`: seis recursos independientes, uno por documento (`legal`, `privacy`, `cookies`) e idioma (`es`, `en`).
- `js/i18n.js`: textos cortos de UI ES/EN, formato de fechas, países ISO y tipos de evento; no contiene el cuerpo de los documentos legales.
- `js/favorites.js`: persistencia compartida de favoritos, estado accesible de los corazones y sincronización entre pestañas.

No introducir herramientas de build sin una razón explícita. Mantener JavaScript compatible con navegadores modernos y sin dependencias de runtime.

## API y entornos

- Local: `http://127.0.0.1:3000`
- Producción: `https://api.lumoraevents.net`
- Listado actual: `GET /public/directory-events`
- Detalle actual: `GET /public/directory-events/<id>`

`js/api.js` selecciona local si la web se abre desde `file:`, `localhost` o `127.0.0.1`; en cualquier otro host utiliza producción. Para pruebas puntuales se puede definir `window.LUMORA_EVENTS_API_BASE_URL` antes de cargar `api.js`.

Respuesta confirmada del listado:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 17,
    "total_pages": 2
  }
}
```

El índice solo consume estos campos de cada evento:

- `id`: se conserva en el enlace `event.html?id=<id>` y se utiliza para solicitar la ficha real.
- `name`
- `start_date`
- `end_date`
- `city`
- `country_code`: ISO 3166-1 alfa-2; se presenta en ES/EN con `Intl.DisplayNames` y el código como fallback.
- `event_type`: uno o varios valores separados por comas; el índice los normaliza, elimina duplicados y presenta cada tipo en una insignia independiente. Los valores previstos son `FESTIVAL`, `GALA`, `WORKSHOPS` y `MASTERCLASSES`.
- `is_lumora_event`: booleano; si es `true`, la fila muestra una insignia dorada localizada que indica que LumoraEvents gestiona el evento.
- `poster_url`: URL HTTP/HTTPS opcional del cartel. El listado solicita una variante fija de 200 × 275 píxeles cuando procede de Cloudinary y muestra un placeholder local si falta o falla.

No acoplar el índice al resto de propiedades devueltas por la API.

La ficha detalle consume además `description`, `venue`, `website_url`, `registration_url`, todas las redes sociales disponibles, `contact_email`, `poster_url`, `dance_styles`, `masters` y `updated_at`. Las URLs externas se validan como HTTP/HTTPS y el correo se valida antes de renderizarse.

Parámetros opcionales confirmados:

| Parámetro | Formato | Comportamiento |
| --- | --- | --- |
| `name` | String, máximo 150 caracteres | Coincidencia parcial y sin distinguir mayúsculas/minúsculas. |
| `country` | ISO de 2 letras | Coincidencia exacta; la API normaliza a mayúsculas. |
| `month` | `YYYY-MM` | Incluye eventos que se solapen con el mes indicado. |
| `page` | Entero positivo | Valor por defecto de API: 1. |
| `page_size` | Entero entre 1 y 100 | Valor por defecto de API: 12; la interfaz siempre envía 10, 20 o 30. |

## Comportamiento del índice

- Paginación solicitada al servidor con 10, 20 o 30 elementos por página; la opción inicial es 10. El selector se sitúa junto al contador de resultados, fuera del formulario de filtros, y aplica el cambio inmediatamente volviendo a la página 1.
- Nombre, país, mes, página y tamaño no predeterminado se reflejan en la query string de la URL. La página 1 y el tamaño 10 se mantienen implícitos para conservar una URL limpia.
- Se muestran rango y total usando los metadatos del backend.
- Al cambiar de página, el scroll vuelve suavemente al inicio del bloque de resultados después de renderizar la nueva respuesta; en escritorio deja espacio para el buscador sticky.
- El listado muestra una tarjeta por fila hasta `lg` y dos tarjetas de igual altura por fila desde 1024 px. Cada tarjeta presenta tipos, favorito, nombre, fecha, ubicación y un pie de acciones; no repite el mes fuera de la fecha completa.
- Cada tarjeta muestra a la izquierda una miniatura completa del cartel. Las URLs de Cloudinary usan la transformación `c_limit,w_200,h_275,q_auto:eco,f_auto`; las URLs externas válidas no se modifican y los valores ausentes, inválidos o fallidos muestran un placeholder SVG local.
- Tanto la miniatura como el nombre enlazan a la ficha del evento, sin convertir la tarjeta completa en un enlace para preservar sus controles internos.
- Los eventos con `is_lumora_event: true` muestran en el pie la insignia `Gestionado por LumoraEvents` / `Managed by LumoraEvents`.
- Fecha y ubicación aparecen apiladas junto a iconos, sin labels visuales redundantes.
- Los filtros no muestran labels visuales redundantes; conservan etiquetas ocultas para tecnologías de asistencia y el campo de nombre incluye una lupa.
- Editar nombre, país o mes no lanza peticiones. Los valores se aplican únicamente al enviar el formulario con `Buscar`.
- El selector de país contiene los 249 códigos ISO 3166-1 alfa-2, ordenados por su nombre localizado, pero envía el código mediante `country`.
- El selector de mes se construye en el navegador desde el mes actual e incluye 12 meses consecutivos. Muestra `mes YYYY` y envía `YYYY-MM`.
- Pulsar `Buscar` aplica nombre, país y mes y vuelve a la página 1. Pulsar `Limpiar` restaura esos tres filtros y consulta de nuevo la página 1 sin modificar el tamaño de página seleccionado.
- Inmediatamente bajo el buscador aparece una invitación secundaria para organizadores con un enlace `mailto:` a `info@lumoraevents.net`, localizada en ES/EN.
- Los filtros se aplican en el servidor, nunca únicamente a la página descargada.
- Hay estados visibles de carga, error con reintento y listado vacío.
- Cada fila permite marcar o desmarcar el evento como favorito mediante un corazón accesible.

## Comportamiento del detalle

- El índice enlaza a `event.html?id=<id>` y la ficha consulta `GET /public/directory-events/<id>`. La URL del listado se guarda en `sessionStorage` bajo `lumoraevents-directory-return-url`: así conserva filtros, paginación y tamaño al volver sin exponer el origen en la URL del detalle. La ficha valida que el valor corresponda a `index.html` en el mismo origen y usa el listado limpio como fallback.
- Un 404 o la ausencia de `id` muestran el estado de evento no encontrado; otros errores muestran reintento.
- El resumen superior alinea los datos principales con un póster contenido y sin texto de pie. Bajo el nombre solo aparecen el tipo y, cuando corresponde, la marca Lumora; la ciudad y el país no se repiten ahí.
- Lugar, ubicación combinada (`city`, país localizado) y fechas se presentan en una sola fila de tres datos: el icono y el valor son visibles, mientras el label se mantiene oculto para lectores de pantalla y como tooltip del icono.
- Estilos y artistas pertenecen al mismo resumen superior y aparecen, en ese orden, dentro de dos paneles visuales equivalentes. Los estilos usan texto marcado con puntos verdes y los artistas muestran nombre más bandera; ninguno se repite en la zona inferior.
- Se presentan nombre, tipo, ubicación, venue, fechas, descripción, maestros, estilos, enlaces disponibles, correo de contacto y fecha de actualización. Si `description` está vacío o contiene solo espacios, no se renderizan ni el contenido ni el título de su sección.
- Cada artista o maestro se presenta como un elemento visual independiente dentro del panel de artistas, nunca como una cadena separada por comas. El contrato esperado para cada elemento es `Nombre (ISO-2)`; la UI elimina el código y muestra junto al nombre una bandera SVG de `https://flagcdn.com/<iso-en-minúsculas>.svg`. El nombre localizado del país se conserva como texto alternativo y `title`. Los valores que no cumplan el patrón se muestran completos como fallback.
- Si `is_lumora_event` es `true`, junto al tipo se reutiliza exactamente la insignia verde con destellos del listado.
- Si `poster_url` está vacío o la imagen falla al cargar, se genera un cartel SVG local como fallback.
- `contact_email` es el destinatario preferente; si falta se usa `info@lumoraevents.net`.
- La ficha permite marcar o desmarcar el mismo favorito que el listado.

## Favoritos

- Los favoritos se identifican únicamente mediante el `id` estable del evento y se guardan en `localStorage` bajo la clave `lumoraevents-favorite-event-ids`.
- El estado se comparte entre el listado y la ficha, y se sincroniza entre pestañas del mismo navegador mediante el evento `storage`.
- Al añadir un favorito cuando todavía no había ninguno se muestra durante unos segundos un aviso sutil y localizado indicando que los favoritos pertenecen a ese dispositivo y navegador.
- Los botones de corazón exponen una etiqueta localizada y su estado mediante `aria-pressed`.

## Sistema visual actual

- Dirección contemporánea basada en el verde del logo: canvas mineral `#f3f6f2`, tinta verde oscuro `#122019`, verde principal `#245f47`, verde lima `#82c95a` y lavanda `#76658d` como acento secundario.
- Los favoritos activos utilizan frambuesa `#d13f68` como acento semántico puntual para que el corazón seleccionado sea inequívoco.
- Toda la interfaz utiliza Manrope. Los títulos son sans serif, compactos y con peso alto; no usar tipografía editorial serif.
- El hero es luminoso, compacto y funcional, con una transición verde/lavanda muy suave. No añadir retículas, rayas, círculos, cuadrados, rombos, ilustraciones geométricas ni otros adornos visuales.
- Logo oficial: `https://res.cloudinary.com/ddgxtuwdo/image/upload/v1781521973/copy_of_new_logo_lumoraevents_small_kwnjrc.png` (289 × 47 px).
- No mostrar bloques ni textos `Powered by LumoraEvents`.
- El buscador está separado del hero, lo solapa visualmente y se mantiene flotante en la parte superior al hacer scroll desde `lg` para evitar ocupar demasiado espacio en pantallas pequeñas.
- Controles compactos con fondos minerales, foco verde y radios moderados; botones primarios verde oscuro.
- Las filas de evento son tarjetas blancas limpias, con bordes verdes muy suaves, separación vertical amplia y padding generoso.
- Índice, detalle y páginas legales comparten el mismo sistema cromático y un footer verde oscuro con logo, `info@lumoraevents.net` y enlaces a privacidad, cookies y aviso legal.

## Internacionalización y fechas

- Idiomas de interfaz: español (`es-ES`) e inglés (`en-GB`).
- La preferencia se guarda en `localStorage` con la clave `lumoraevents-language`.
- Las páginas legales reaccionan al mismo cambio de idioma y cargan el recurso específico del documento activo; los recursos legales no se importan desde `index.html`, `event.html` ni `js/i18n.js`.
- Las fechas de la API son ISO con hora UTC. La UI extrae el componente `YYYY-MM-DD` para evitar cambios de día por zona horaria.

## Analítica y cookies

- Todas las páginas cargan Counter.dev desde `https://cdn.counter.dev/script.js` con el identificador público del sitio para obtener estadísticas básicas y agregadas.
- No se utilizan Google Analytics, Meta Pixel ni otros sistemas adicionales de tracking o publicidad comportamental.
- No se muestra un banner de cookies mientras el uso técnico del sitio no requiera consentimiento para cookies no esenciales.

## Estado y decisiones pendientes

- El listado está conectado al endpoint real.
- La ficha detalle está conectada al endpoint público por ID.
- El listado permite filtrar por nombre, país y mes, y escoger 10, 20 o 30 resultados por página.
- Verificación del 2026-08-12: local y producción respondieron correctamente desde el entorno de desarrollo, pero el listado todavía no devuelve `poster_url`. El backend debe incluir únicamente ese campo en la respuesta pública para activar los carteles reales; mientras tanto la interfaz muestra el placeholder.
- Confirmar el dominio web definitivo y actualizar canonical/SEO cuando se conozca.

## Criterios para cambios futuros

- Mantener el contrato externo encapsulado en `js/api.js`.
- Escapar cualquier dato de API antes de insertarlo mediante `innerHTML`.
- Añadir textos de interfaz en ambos idiomas.
- Probar como mínimo carga, error, vacío, cambio de idioma, cada filtro, filtros combinados, tamaños 10/20/30, navegación de páginas y restauración desde la query string.
- Actualizar este archivo en el mismo cambio cuando una decisión deje de ser válida.
