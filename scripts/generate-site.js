const fs = require("fs");
const path = require("path");
const { DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const COMMUNITIES_PATH = path.join(ROOT, "data", "communities.json");
const EVENTS_PATH = path.join(ROOT, "data", "events.json");
const DIST_DIR = path.join(ROOT, "dist");
const COUNTRIES_DIR = path.join(DIST_DIR, "countries");
const STYLES_PATH = path.join(DIST_DIR, "styles.css");
const COUNTRY_FLAGS = {
  Regional: { kind: "globe", label: "Regional" },
  "Antigua and Barbuda": { kind: "flag", code: "ag" },
  Anguilla: { kind: "flag", code: "ai" },
  Aruba: { kind: "flag", code: "aw" },
  Bahamas: { kind: "flag", code: "bs" },
  Barbados: { kind: "flag", code: "bb" },
  Belize: { kind: "flag", code: "bz" },
  Bonaire: { kind: "flag", code: "bq" },
  "British Virgin Islands": { kind: "flag", code: "vg" },
  "Cayman Islands": { kind: "flag", code: "ky" },
  Cuba: { kind: "flag", code: "cu" },
  Curacao: { kind: "flag", code: "cw" },
  Dominica: { kind: "flag", code: "dm" },
  "Dominican Republic": { kind: "flag", code: "do" },
  Grenada: { kind: "flag", code: "gd" },
  Guadeloupe: { kind: "flag", code: "gp" },
  Guyana: { kind: "flag", code: "gy" },
  Haiti: { kind: "flag", code: "ht" },
  Jamaica: { kind: "flag", code: "jm" },
  Martinique: { kind: "flag", code: "mq" },
  Montserrat: { kind: "flag", code: "ms" },
  "Puerto Rico": { kind: "flag", code: "pr" },
  Saba: {
    kind: "flag",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Saba.svg"
  },
  "Saint Barthelemy": { kind: "flag", code: "bl" },
  "Saint Eustatius": {
    kind: "flag",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Sint_Eustatius.svg"
  },
  "Saint Kitts and Nevis": { kind: "flag", code: "kn" },
  "Saint Lucia": { kind: "flag", code: "lc" },
  "Saint Martin": { kind: "flag", code: "mf" },
  "Saint Vincent and the Grenadines": { kind: "flag", code: "vc" },
  "Sint Maarten": { kind: "flag", code: "sx" },
  Suriname: { kind: "flag", code: "sr" },
  "Trinidad and Tobago": { kind: "flag", code: "tt" },
  "Turks and Caicos Islands": { kind: "flag", code: "tc" },
  "U.S. Virgin Islands": { kind: "flag", code: "vi" }
};
const COUNTRY_COORDINATES = {
  "Antigua and Barbuda": [17.1175, -61.8468],
  Anguilla: [18.2206, -63.0517],
  Aruba: [12.5211, -69.9683],
  Bahamas: [25.0443, -77.3504],
  Barbados: [13.1132, -59.5988],
  Belize: [17.2514, -88.759],
  Bonaire: [12.1784, -68.2385],
  "British Virgin Islands": [18.4207, -64.6399],
  "Cayman Islands": [19.3133, -81.2546],
  Cuba: [23.1136, -82.3666],
  Curacao: [12.1696, -68.99],
  Dominica: [15.414, -61.3709],
  "Dominican Republic": [18.4861, -69.9312],
  Grenada: [12.0561, -61.7488],
  Guadeloupe: [16.2412, -61.535],
  Guyana: [6.8013, -58.1551],
  Haiti: [18.5392, -72.3364],
  Jamaica: [17.9712, -76.7936],
  Martinique: [14.6104, -61.0801],
  Montserrat: [16.7425, -62.1874],
  "Puerto Rico": [18.2208, -66.5901],
  Saba: [17.635, -63.2327],
  "Saint Barthelemy": [17.9001, -62.8336],
  "Saint Eustatius": [17.4904, -62.9736],
  "Saint Kitts and Nevis": [17.3578, -62.7829],
  "Saint Lucia": [13.9094, -60.9789],
  "Saint Martin": [18.0804, -63.0523],
  "Saint Vincent and the Grenadines": [13.154, -61.2248],
  "Sint Maarten": [18.0425, -63.0548],
  Suriname: [5.852, -55.2038],
  "Trinidad and Tobago": [10.6596, -61.5089],
  "Turks and Caicos Islands": [21.7736, -72.2659],
  "U.S. Virgin Islands": [18.3358, -64.8963]
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b([a-z])\./g, "$1")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sortCommunities(communities) {
  return [...communities].sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    if (countryCompare !== 0) {
      return countryCompare;
    }

    return a.name.localeCompare(b.name);
  });
}

function resetOutputDir() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(COUNTRIES_DIR, { recursive: true });
}

function writeFile(relativePath, content) {
  const outputPath = path.join(DIST_DIR, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCommunityCount(count) {
  return `${count} ${count === 1 ? "community" : "communities"}`;
}

function renderEventCount(count) {
  return `${count} ${count === 1 ? "event" : "events"}`;
}

function renderListingCount(communityCount, eventCount) {
  const total = communityCount + eventCount;
  return `${total} ${total === 1 ? "listing" : "listings"}`;
}

function renderCountryFlag(country, className = "country-flag") {
  const flag = COUNTRY_FLAGS[country];
  const displayCountry = getDisplayName(country);

  if (!flag || flag.kind === "globe") {
    return [
      `<span class="${className} country-flag-fallback" aria-hidden="true">`,
      '  <svg viewBox="0 0 24 24" role="presentation" focusable="false">',
      '    <circle cx="12" cy="12" r="9"></circle>',
      '    <path d="M3 12h18"></path>',
      '    <path d="M12 3a14 14 0 0 0 0 18"></path>',
      '    <path d="M12 3a14 14 0 0 1 0 18"></path>',
      '    <path d="M6 7.5c2 .8 4 .8 6 0s4-.8 6 0"></path>',
      '    <path d="M6 16.5c2-.8 4-.8 6 0s4 .8 6 0"></path>',
      " </svg>",
      "</span>"
    ].join("");
  }

  const src = flag.src || `https://flagcdn.com/w40/${flag.code}.png`;
  return `<img class="${className}" src="${src}" alt="${escapeHtml(displayCountry)} flag" loading="lazy" width="26" height="18">`;
}

function renderLinkList(links) {
  return links
    .map((link) => {
      const label = escapeHtml(link.label);
      const url = escapeHtml(link.url);
      return `<a class="community-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
    })
    .join("");
}

function renderPrintLinkList(links) {
  if (!Array.isArray(links) || links.length === 0) {
    return "";
  }

  return [
    '<ul class="print-link-list">',
    ...links.map((link) => {
      const label = escapeHtml(link.label);
      const url = escapeHtml(link.url);
      return `  <li><span class="print-link-label">${label}:</span> <a href="${url}" target="_blank" rel="noreferrer">${url}</a></li>`;
    }),
    "</ul>"
  ].join("\n");
}

function renderMetaList(community) {
  const items = [
    community.city ? `City: ${community.city}` : null,
    community.language ? `Language: ${community.language}` : null,
    Array.isArray(community.focus) && community.focus.length > 0
      ? `Focus: ${community.focus.join(", ")}`
      : null,
    Number.isInteger(community.member_count) ? `Members: ${community.member_count}` : null
  ].filter(Boolean);

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderEventMetaList(event) {
  const items = [
    event.city ? `City: ${event.city}` : null,
    event.schedule ? `Date: ${event.schedule}` : null,
    event.frequency ? `Frequency: ${event.frequency}` : null,
    event.host_community ? `Host community: ${event.host_community}` : null
  ].filter(Boolean);

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderCommunityCard(community) {
  return [
    '<article class="community-card">',
    `<h3>${escapeHtml(community.name)}</h3>`,
    `<p class="community-description">${escapeHtml(community.description)}</p>`,
    '<ul class="community-meta">',
    renderMetaList(community),
    "</ul>",
    `<div class="community-links">${renderLinkList(community.links || [])}</div>`,
    "</article>"
  ].join("");
}

function renderPrintCommunityCard(community) {
  return [
    '<article class="print-community-card">',
    `  <h4>${escapeHtml(community.name)}</h4>`,
    `  <p class="community-description">${escapeHtml(community.description)}</p>`,
    '  <ul class="community-meta">',
    renderMetaList(community),
    "  </ul>",
    renderPrintLinkList(community.links || []),
    "</article>"
  ].join("\n");
}

function renderEventCard(event) {
  return [
    '<article class="community-card event-card">',
    `<h3>${escapeHtml(event.name)}</h3>`,
    `<p class="community-description">${escapeHtml(event.description)}</p>`,
    '<ul class="community-meta">',
    renderEventMetaList(event),
    "</ul>",
    `<div class="community-links">${renderLinkList(event.links || [])}</div>`,
    "</article>"
  ].join("");
}

function renderPrintEventCard(event) {
  return [
    '<article class="print-community-card print-event-card">',
    `  <h4>${escapeHtml(event.name)}</h4>`,
    `  <p class="community-description">${escapeHtml(event.description)}</p>`,
    '  <ul class="community-meta">',
    renderEventMetaList(event),
    "  </ul>",
    renderPrintLinkList(event.links || []),
    "</article>"
  ].join("\n");
}

function renderCountryCards(countries, communitiesByCountry, eventsByCountry) {
  return countries
    .map((country) => {
      const slug = slugify(country);
      const communityCount = communitiesByCountry.get(country)?.length || 0;
      const eventCount = eventsByCountry.get(country)?.length || 0;
      const count = communityCount + eventCount;
      const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
      const cardClass = count > 0 ? "country-card country-card-active" : "country-card country-card-empty";
      const displayCountry = getDisplayName(country);
      const flag = renderCountryFlag(country);
      const cardHref =
        count > 0
          ? `./countries/${slug}.html`
          : "https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml";
      const cardLabel = count > 0 ? "View listings" : "Add listing";
      const cardLabelClass = count > 0 ? "text-link" : "text-link country-card-cta";
      const cardRel = count > 0 ? "" : ' target="_blank" rel="noreferrer"';

      return [
        `<article class="${cardClass}">`,
        `<a class="country-card-link" href="${cardHref}"${cardRel}>`,
        `<h3>${flag}<span>${escapeHtml(displayCountry)}</span></h3>`,
        `<p class="country-count">${renderListingCount(communityCount, eventCount)}</p>`,
        `<p class="country-breakdown">${escapeHtml(renderCommunityCount(communityCount))}<br>${escapeHtml(renderEventCount(eventCount))}</p>`,
        `<p class="country-status">CARICOM: ${escapeHtml(status.caricom)}<br>CSME: ${escapeHtml(status.csme)}</p>`,
        `<span class="${cardLabelClass}">${cardLabel}</span>`,
        "</a>",
        "</article>"
      ].join("");
    })
    .join("");
}

function renderSection(section, communitiesByCountry, eventsByCountry) {
  return [
    '<section class="directory-section">',
    `<div class="section-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>`,
    `<div class="country-grid">${renderCountryCards(section.countries, communitiesByCountry, eventsByCountry)}</div>`,
    "</section>"
  ].join("");
}

function renderTopCountriesTracker(communitiesByCountry, eventsByCountry) {
  const leaderboardSize = 10;
  const trackerLabels = {
    "Trinidad and Tobago": "T&T"
  };
  const countries = new Set([
    ...communitiesByCountry.keys(),
    ...eventsByCountry.keys()
  ]);
  const topCountries = [...countries]
    .filter((country) => country !== "Regional")
    .map((country) => {
      const communityCount = communitiesByCountry.get(country)?.length || 0;
      const eventCount = eventsByCountry.get(country)?.length || 0;
      return {
        country,
        communityCount,
        eventCount,
        totalCount: communityCount + eventCount
      };
    })
    .filter((entry) => entry.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount || a.country.localeCompare(b.country))
    .slice(0, leaderboardSize);

  if (topCountries.length === 0) {
    return "";
  }

  const items = topCountries
    .map((entry, index) => {
      const { country, communityCount, eventCount, totalCount } = entry;
      const displayCountry = getDisplayName(country);
      const trackerLabel = trackerLabels[country] || displayCountry;
      const tooltip = `${trackerLabel}: ${renderListingCount(communityCount, eventCount)} (${renderCommunityCount(communityCount)}, ${renderEventCount(eventCount)})`;

      return [
        '<li class="top-country-item">',
        `  <a class="top-country-link" href="./countries/${slugify(country)}.html" aria-label="${escapeHtml(tooltip)}" data-tooltip="${escapeHtml(tooltip)}">`,
        `    <span class="top-country-rank">#${index + 1}</span>`,
        `    <span class="top-country-flag-wrap">${renderCountryFlag(country, "country-flag top-country-flag")}</span>`,
        "  </a>",
        "</li>"
      ].join("\n");
    })
    .join("\n");

  return [
    '<section class="top-countries-panel" aria-labelledby="top-countries-title">',
    '  <div class="top-countries-heading">',
    '    <p class="eyebrow">Leaderboard</p>',
    `    <h2 id="top-countries-title">Countries with the most listings</h2>`,
    "  </div>",
    `  <ol class="top-country-list">${items}</ol>`,
    "</section>"
  ].join("\n");
}

function renderMapSectionList(communitiesByCountry, eventsByCountry) {
  return DIRECTORY_SECTIONS.filter((section) => section.title !== "Regional")
    .map((section) => {
      const items = section.countries
        .map((country) => {
          const communityCount = communitiesByCountry.get(country)?.length || 0;
          const eventCount = eventsByCountry.get(country)?.length || 0;
          return `<li><span>${escapeHtml(getDisplayName(country))}</span><strong>${renderListingCount(communityCount, eventCount)}</strong></li>`;
        })
        .join("");

      return [
        '<section class="map-list-section">',
        `  <h3>${escapeHtml(section.title)}</h3>`,
        `  <ul class="map-country-list">${items}</ul>`,
        "</section>"
      ].join("\n");
    })
    .join("\n");
}

function renderPrintSection(section, communitiesByCountry, eventsByCountry) {
  const countries = section.countries
    .map((country) => {
      const communities = communitiesByCountry.get(country) || [];
      const events = eventsByCountry.get(country) || [];
      if (communities.length === 0 && events.length === 0) {
        return "";
      }

      const communitySection = communities.length
        ? [
            '  <div class="print-subsection">',
            "    <h4>Communities</h4>",
            '    <div class="print-community-list">',
            communities.map((community) => renderPrintCommunityCard(community)).join("\n"),
            "    </div>",
            "  </div>"
          ].join("\n")
        : "";

      const eventSection = events.length
        ? [
            '  <div class="print-subsection">',
            "    <h4>Tech Events</h4>",
            '    <div class="print-community-list">',
            events.map((event) => renderPrintEventCard(event)).join("\n"),
            "    </div>",
            "  </div>"
          ].join("\n")
        : "";

      return [
        '<section class="print-country-group">',
        `  <h3>${renderCountryFlag(country)}<span>${escapeHtml(getDisplayName(country))}</span></h3>`,
        `  <p class="listing-count">${renderCommunityCount(communities.length)} | ${renderEventCount(events.length)}</p>`,
        communitySection,
        eventSection,
        "</section>"
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  if (!countries) {
    return "";
  }

  return [
    '<section class="print-section">',
    `  <div class="section-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>`,
    countries,
    "</section>"
  ].join("\n");
}

function renderPrintCommunitiesSection(section, communitiesByCountry) {
  const countries = section.countries
    .map((country) => {
      const communities = communitiesByCountry.get(country) || [];
      if (communities.length === 0) {
        return "";
      }

      return [
        '<section class="print-country-group">',
        `  <h3>${renderCountryFlag(country)}<span>${escapeHtml(getDisplayName(country))}</span></h3>`,
        `  <p class="listing-count">${renderCommunityCount(communities.length)}</p>`,
        '  <div class="print-community-list">',
        communities.map((community) => renderPrintCommunityCard(community)).join("\n"),
        "  </div>",
        "</section>"
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  if (!countries) {
    return "";
  }

  return [
    '<section class="print-section">',
    `  <div class="section-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>`,
    countries,
    "</section>"
  ].join("\n");
}

function renderPrintEventsSection(section, eventsByCountry) {
  const countries = section.countries
    .map((country) => {
      const events = eventsByCountry.get(country) || [];
      if (events.length === 0) {
        return "";
      }

      return [
        '<section class="print-country-group">',
        `  <h3>${renderCountryFlag(country)}<span>${escapeHtml(getDisplayName(country))}</span></h3>`,
        `  <p class="listing-count">${renderEventCount(events.length)}</p>`,
        '  <div class="print-community-list">',
        events.map((event) => renderPrintEventCard(event)).join("\n"),
        "  </div>",
        "</section>"
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  if (!countries) {
    return "";
  }

  return [
    '<section class="print-section">',
    `  <div class="section-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>`,
    countries,
    "</section>"
  ].join("\n");
}

function renderContributionPanel({ showUpdate = false } = {}) {
  return [
    '<section class="contribution-panel">',
    showUpdate ? "  <h2>Add or Update a listing</h2>" : "  <h2>Add a listing</h2>",
    showUpdate
      ? "  <p>Know a Caribbean tech community or event that should be here, or one that needs to be updated? Send it in for review, and we'll add it once the details are confirmed.</p>"
      : "  <p>Know a Caribbean tech community or event that should be here? Send it in for review, and we'll add it once the details are confirmed.</p>",
    '  <div class="contribution-actions">',
    '    <a class="button" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Add listing</a>',
    showUpdate
      ? '    <a class="button button-update" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Update listing</a>'
      : "",
    "  </div>",
    "</section>"
  ].filter(Boolean).join("\n");
}

function renderCountrySearch(rootHref = ".") {
  const countries = DIRECTORY_SECTIONS.flatMap((section) => section.countries)
    .filter((country) => country !== "Regional")
    .map((country) => ({
      name: getDisplayName(country),
      href: `${rootHref}/countries/${slugify(country)}.html`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const options = countries
    .map((country) => `      <option value="${escapeHtml(country.name)}"></option>`)
    .join("\n");

  const script = [
    "(() => {",
    "  const form = document.querySelector('[data-country-search]');",
    "  if (!form) return;",
    "  const input = form.querySelector('input');",
    `  const countries = ${JSON.stringify(countries)};`,
    "  const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();",
    "  form.addEventListener('submit', (event) => {",
    "    event.preventDefault();",
    "    const query = normalize(input.value);",
    "    if (!query) return;",
    "    const exactMatch = countries.find((country) => normalize(country.name) === query);",
    "    const prefixMatch = countries.find((country) => normalize(country.name).startsWith(query));",
    "    const partialMatches = countries.filter((country) => normalize(country.name).includes(query));",
    "    const match = exactMatch || prefixMatch || (partialMatches.length === 1 ? partialMatches[0] : null);",
    "    if (match) {",
    "      window.location.href = match.href;",
    "      return;",
    "    }",
    "    input.setCustomValidity('Choose a country from the directory list.');",
    "    input.reportValidity();",
    "  });",
    "  input.addEventListener('input', () => input.setCustomValidity(''));",
    "})();"
  ].join("");

  const markup = [
    '        <form class="country-search" data-country-search role="search" aria-label="Search for a country">',
    '          <label class="sr-only" for="country-search-input">Search for a country</label>',
    '          <div class="country-search-field">',
    '            <input id="country-search-input" name="country" type="search" placeholder="Search country" list="country-search-list" autocomplete="off">',
    '            <button class="button-reset country-search-button" type="submit">Search</button>',
    "          </div>",
    '          <datalist id="country-search-list">',
    options,
    "          </datalist>",
    "        </form>"
  ].join("\n");

  return { markup, script };
}

function renderLayout({ title, description, body, relativeRoot, script, headExtra = "", bodyEnd = "", headerControls = "" }) {
  const rootHref = relativeRoot || ".";
  const currentYear = new Date().getFullYear();

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(title)}</title>`,
    `  <meta name="description" content="${escapeHtml(description)}">`,
    `  <link rel="stylesheet" href="${rootHref}/styles.css">`,
    headExtra,
    "</head>",
    "<body>",
    '  <div class="page-shell">',
    '    <header class="site-header">',
    '      <a class="site-brand" href="' + rootHref + '/index.html">Caribbean Tech Communities and Events</a>',
    '      <div class="site-header-actions">',
    "        <nav>",
    '          <a class="site-nav-link" href="' + rootHref + '/map.html">Map</a>',
    '          <a class="site-nav-link" href="' + rootHref + '/print-communities.html">Print Communities</a>',
    '          <a class="site-nav-link" href="' + rootHref + '/print-events.html">Print Events</a>',
    // '          <a class="site-nav-link" href="' + rootHref + '/index.html#directory">Directory</a>',
    '          <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities" target="_blank" rel="noreferrer">GitHub</a>',
    // '          <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributor docs</a>',
    "        </nav>",
    headerControls,
    "      </div>",
    "    </header>",
    body,
    `    <footer class="site-footer">Copyright &copy; ${currentYear} Natalie Reynolds</footer>`,
    "  </div>",
    bodyEnd,
    script ? `  <script>${script}</script>` : "",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

function renderHomePage(communities, events, communitiesByCountry, eventsByCountry) {
  const totalCommunities = communities.length;
  const totalEvents = events.length;
  const totalCountries = DIRECTORY_SECTIONS.flatMap((section) => section.countries).filter((country) => country !== "Regional").length;
  const sections = DIRECTORY_SECTIONS.map((section) => renderSection(section, communitiesByCountry, eventsByCountry)).join("\n");
  const topCountriesTracker = renderTopCountriesTracker(communitiesByCountry, eventsByCountry);
  const countrySearch = renderCountrySearch(".");

  const body = [
    '<main class="main-content">',
    '  <section class="hero">',
    "    <h1>A directory of all Caribbean tech communities and events.</h1>",
    "    <p class=\"hero-copy\">Browse tech communities and events across sovereign Caribbean states, mainland Caribbean countries, and territories.</p>",
    '    <div class="hero-stats">',
    `      <div class="stat"><strong>${totalCountries}</strong><span>countries covered</span></div>`,
    `      <div class="stat"><strong>${totalCommunities}</strong><span>communities listed</span></div>`,
    `      <div class="stat"><strong>${totalEvents}</strong><span>events listed</span></div>`,
    "    </div>",
    '    <div class="hero-actions">',
      '      <a class="button" href="#directory">Browse directory</a>',
    "    </div>",
    "  </section>",
    topCountriesTracker,
    renderContributionPanel(),
    '  <div id="directory" class="section-stack">',
    sections,
    "  </div>",
    "</main>"
  ].join("\n");

  return renderLayout({
    title: "Caribbean Tech Communities and Events",
    description: "A directory of tech communities and events across the Caribbean.",
    body,
    headerControls: countrySearch.markup,
    script: countrySearch.script,
    relativeRoot: "."
  });
}

function renderListingSection({ title, emptyTitle, emptyDescription, cardsMarkup, hasItems }) {
  const content = hasItems
    ? `<section class="community-grid">${cardsMarkup}</section>`
    : [
        '<section class="empty-state">',
        `  <h2>${escapeHtml(emptyTitle)}</h2>`,
        `  <p>${escapeHtml(emptyDescription)}</p>`,
        "</section>"
      ].join("\n");

  return [
    '<section class="listing-section">',
    `  <div class="section-heading"><h2>${escapeHtml(title)}</h2></div>`,
    content,
    "</section>"
  ].join("\n");
}

function renderCountryPage(country, communities, events) {
  const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
  const displayCountry = getDisplayName(country);
  const flag = renderCountryFlag(country, "country-flag country-flag-hero");
  const contributionPanel = renderContributionPanel({ showUpdate: communities.length > 0 || events.length > 0 });
  const communitySection = renderListingSection({
    title: "Communities",
    emptyTitle: "No communities yet",
    emptyDescription: `No communities are listed for ${displayCountry} yet. Add one to help make the directory more useful.`,
    cardsMarkup: communities.map((community) => renderCommunityCard(community)).join("\n"),
    hasItems: communities.length > 0
  });
  const eventSection = renderListingSection({
    title: "Tech Events",
    emptyTitle: "No events yet",
    emptyDescription: `No tech events are listed for ${displayCountry} yet. Add one to help make the directory more useful.`,
    cardsMarkup: events.map((event) => renderEventCard(event)).join("\n"),
    hasItems: events.length > 0
  });

  const body = [
    '<main class="main-content">',
    '  <section class="country-hero">',
    `    <h1>${flag}<span>${escapeHtml(displayCountry)}</span></h1>`,
    `    <p class="country-status">CARICOM: ${escapeHtml(status.caricom)} | CSME: ${escapeHtml(status.csme)}</p>`,
    '    <p class="status-note"><a href="https://caricom.org/our-community/who-we-are/" target="_blank" rel="noreferrer">CARICOM</a> stands for the Caribbean Community, and <a href="https://csme.me/" target="_blank" rel="noreferrer">CSME</a> stands for the CARICOM Single Market and Economy.</p>',
    `    <p class="listing-count">${renderCommunityCount(communities.length)} | ${renderEventCount(events.length)}</p>`,
    '    <a class="back-link" href="../index.html">Back to directory</a>',
    "  </section>",
    contributionPanel,
    communitySection,
    eventSection,
    "</main>"
  ].join("\n");

  return renderLayout({
    title: `${displayCountry} Tech Communities and Events`,
    description: `Tech communities and events in ${displayCountry}.`,
    body,
    relativeRoot: ".."
  });
}

function renderPrintPage({ kind, items, sections }) {
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const pageTitle = kind === "communities" ? "Communities" : "Events";
  const singular = kind === "communities" ? "community" : "event";
  const totalLabel = `${items.length} ${items.length === 1 ? singular : kind}`;
  const printSummary = `A grouped list of all ${totalLabel} in the Caribbean tech directory as at ${printDate}. This list is organized by regional category and country. This list is updated as new listings are added.`;
  const otherPageHref = kind === "communities" ? "./print-events.html" : "./print-communities.html";
  const otherPageLabel = kind === "communities" ? "View Events Print Page" : "View Communities Print Page";

  const body = [
    '<main class="main-content">',
    '  <section class="hero print-hero">',
    `    <h1>Printable Caribbean Tech ${pageTitle} Directory.</h1>`,
    `    <p class="hero-copy">This page lists all ${kind} currently in the directory and is formatted for printing or saving as a PDF.</p>`,
    '    <div class="hero-actions print-actions">',
    '      <button class="button button-reset" type="button" onclick="window.print()">Print / Save as PDF</button>',
    `      <a class="button" href="${otherPageHref}">${otherPageLabel}</a>`,
    '      <a class="button" href="./index.html">Back to directory</a>',
    "    </div>",
    "  </section>",
    '  <section class="print-summary">',
    '    <div class="section-heading">',
    `      <h2>Caribbean Tech ${pageTitle} Directory</h2>`,
    `      <p class="print-intro">${printSummary}</p>`,
    "    </div>",
    "  </section>",
    `  <div class="print-shell">${sections}</div>`,
    "</main>"
  ].join("\n");

  const script = [
    "const params = new URLSearchParams(window.location.search);",
    "if (params.get('download') === 'pdf') {",
    "  window.addEventListener('load', () => window.print(), { once: true });",
    "}"
  ].join("\n");

  return renderLayout({
    title: `Print Caribbean Tech ${pageTitle} Directory`,
    description: `Printable list of Caribbean tech ${kind} grouped by region and country.`,
    body,
    relativeRoot: ".",
    script
  });
}

function renderMapPage(communitiesByCountry, eventsByCountry) {
  const mapCountries = DIRECTORY_SECTIONS.filter((section) => section.title !== "Regional")
    .flatMap((section) =>
      section.countries.map((country) => {
        const communityCount = communitiesByCountry.get(country)?.length || 0;
        const eventCount = eventsByCountry.get(country)?.length || 0;
        const count = communityCount + eventCount;
        return {
          country,
          displayName: getDisplayName(country),
          section: section.title,
          count,
          communityCount,
          eventCount,
          coordinates: COUNTRY_COORDINATES[country],
          href: `./countries/${slugify(country)}.html`
        };
      })
    )
    .filter((entry) => Array.isArray(entry.coordinates));

  const body = [
    '<main class="main-content">',
    '  <section class="hero map-hero">',
    "    <h1>Caribbean tech communities and events on the map.</h1>",
    '    <p class="hero-copy">Explore every country and territory currently listed in the directory on an interactive Caribbean map. Select a marker to jump to its directory page or see whether listings are still needed.</p>',
    '    <div class="map-legend" aria-label="Map legend">',
    '      <span class="map-legend-item"><span class="map-dot map-dot-active"></span>Has listings</span>',
    '      <span class="map-legend-item"><span class="map-dot map-dot-empty"></span>No listings yet</span>',
    "    </div>",
    "  </section>",
    '  <section class="map-section">',
    '    <div id="directory-map" class="directory-map" aria-label="Interactive map of Caribbean countries and territories"></div>',
    '    <div class="map-sidepanel">',
    '      <h2>Countries In The Directory</h2>',
    '      <p class="hero-copy">Every country and territory listed in the directory is shown on the map and summarized below by regional grouping.</p>',
    renderMapSectionList(communitiesByCountry, eventsByCountry),
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");

  const headExtra =
    '  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous">';
  const bodyEnd =
    '  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>';
  const script = [
    `const mapCountries = ${JSON.stringify(mapCountries)};`,
    "const map = L.map('directory-map', { scrollWheelZoom: false });",
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {",
    "  maxZoom: 18,",
    "  attribution: '&copy; OpenStreetMap contributors'",
    "}).addTo(map);",
    "const bounds = [];",
    "for (const entry of mapCountries) {",
    "  const hasListings = entry.count > 0;",
    "  const action = hasListings",
    "    ? `<a href=\"${entry.href}\">View listings</a>`",
    "    : '<a href=\"https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml\" target=\"_blank\" rel=\"noreferrer\">Add listing</a>';",
    "  const marker = L.circleMarker(entry.coordinates, {",
    "    radius: hasListings ? 8 : 7,",
    "    color: hasListings ? '#014040' : '#731702',",
    "    fillColor: hasListings ? '#03A678' : '#F27405',",
    "    fillOpacity: hasListings ? 0.82 : 0.72,",
    "    weight: hasListings ? 2.5 : 2",
    "  }).addTo(map);",
    "  marker.bindPopup(`",
    "    <strong>${entry.displayName}</strong><br>",
    "    ${entry.section}<br>",
    "    ${entry.count} ${entry.count === 1 ? 'listing' : 'listings'}<br>",
    "    ${entry.communityCount} ${entry.communityCount === 1 ? 'community' : 'communities'} | ${entry.eventCount} ${entry.eventCount === 1 ? 'event' : 'events'}<br>",
    "    ${action}",
    "  `);",
    "  marker.bindTooltip(entry.displayName, { direction: 'top', offset: [0, -8] });",
    "  bounds.push(entry.coordinates);",
    "}",
    "if (bounds.length) {",
    "  map.fitBounds(bounds, { padding: [24, 24] });",
    "}"
  ].join("\n");

  return renderLayout({
    title: "Caribbean Tech Communities and Events Map",
    description: "Interactive map of Caribbean countries and territories included in the tech communities and events directory.",
    body,
    relativeRoot: ".",
    script,
    headExtra,
    bodyEnd
  });
}

function renderStyles() {
  return [
    ":root {",
    // "  --bg: #8ecae6;",
    // "  --bg: #04C4D9;",
    // "  --bg: #A0D3F2;",
    // "  --bg: #03A678;",
    // "  --bg: #76ffca;",
    // "  --bg: #64f3bb;",
    "  --bg: #8bfba5;",
    "  --surface: #fffdf8;",
    "  --surface-strong: #f8f2e2;",
    "  --text: #1a1814;",
    // "  --muted: #5e5649;",
    "  --muted: #4d4b49;",
    "  --border: #d7ccb7;",
    "  --accent: #02735E;",
    "  --accent-strong: #014040;",
    "  --accent-bright: #03A678;",
    "  --accent-highlight: #F27405;",
    "  --accent-warm: #731702;",
    "  --accent-warm-strong: #5c1201;",
    "  --shadow: 0 18px 50px rgba(1, 64, 64, 0.14);",
    "}",
    "* { box-sizing: border-box; }",
    "html { scroll-behavior: smooth; }",
    "body {",
    "  margin: 0;",
    "  font-family: Georgia, 'Times New Roman', serif;",
    "  background: var(--bg);",
    "  color: var(--text);",
    "}",
    "a { color: inherit; }",
    ".page-shell { max-width: 1180px; margin: 0 auto; padding: 24px; }",
    ".site-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 32px; }",
    ".site-header-actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }",
    ".site-brand { font-size: 1.15rem; font-weight: 700; text-decoration: none; }",
    "nav { display: flex; gap: 16px; }",
    ".site-nav-link, .text-link, .back-link { color: var(--accent-strong); text-decoration: none; }",
    ".site-nav-link:hover, .text-link:hover, .back-link:hover, .community-link:hover { color: var(--accent-warm); text-decoration: none; }",
    ".sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }",
    ".country-search { min-width: min(100%, 320px); }",
    ".country-search-field { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.82); border: 1px solid rgba(1, 64, 64, 0.12); box-shadow: 0 10px 24px rgba(1, 64, 64, 0.08); }",
    ".country-search input { width: min(100%, 220px); border: 0; background: transparent; padding: 8px 12px; font: inherit; color: var(--text); }",
    ".country-search input::placeholder { color: var(--muted); }",
    ".country-search input:focus { outline: none; }",
    ".country-search-field:focus-within { border-color: var(--accent-bright); box-shadow: 0 12px 28px rgba(1, 64, 64, 0.12); }",
    ".country-search-button { padding: 10px 14px; border-radius: 999px; background: var(--accent-strong); color: #ffffff; font-weight: 700; transition: background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease; }",
    ".country-search-button:hover, .country-search-button:focus-visible { background: var(--accent-warm); transform: translateY(-1px); box-shadow: 0 10px 18px rgba(115, 23, 2, 0.18); }",
    ".country-search-button:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.35); outline-offset: 2px; }",
    ".main-content { display: grid; gap: 28px; }",
    ".site-footer { margin-top: 28px; padding: 18px 0 8px; color: var(--accent-strong); font-size: 0.95rem; text-align: center; }",
    ".hero, .country-hero, .contribution-panel {",
    "  background: var(--surface);",
    "  border: 1px solid var(--border);",
    "  border-radius: 24px;",
    "  padding: 28px;",
    "  box-shadow: var(--shadow);",
    "}",
    ".hero { padding: 40px 28px; }",
    ".eyebrow { margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent-strong); font-size: 0.8rem; }",
    "h1, h2, h3, p { margin-top: 0; }",
    "h1 { font-size: clamp(2.1rem, 5vw, 4.6rem); line-height: 0.95; max-width: 24ch; margin-bottom: 16px; }",
    "h2 { font-size: 1.7rem; margin-bottom: 10px; }",
    "h3 { font-size: 1.2rem; margin-bottom: 10px; }",
    ".hero-copy, .section-heading p, .summary-panel p, .country-status, .community-description, .community-meta { color: var(--muted); }",
    ".status-note { color: var(--muted); font-size: 0.95rem; margin-top: -6px; margin-bottom: 0; }",
    ".status-note a { color: var(--accent-warm); }",
    ".listing-count { display: block; margin-top: 10px; margin-bottom: 0; color: var(--accent-warm); font-weight: 700; font-size: 1.15rem; letter-spacing: 0.01em; }",
    ".hero-stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }",
    ".stat { min-width: 140px; padding: 14px 16px; border-radius: 16px; background: #ddf3ee; border: 1px solid #8ecabf; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease; }",
    ".stat:hover { transform: translateY(-2px); background: #ffffff; border-color: var(--accent-bright); box-shadow: 0 14px 28px rgba(1, 64, 64, 0.14); }",
    ".stat strong { display: block; font-size: 1.7rem; color: var(--accent-strong); }",
    ".hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".top-countries-panel { background: linear-gradient(135deg, #d65e00, #f27405 58%, #ea7b1e); border: 1px solid rgba(115, 23, 2, 0.24); border-radius: 24px; padding: 16px 20px; box-shadow: 0 20px 40px rgba(115, 23, 2, 0.18); display: grid; gap: 12px; }",
    ".top-countries-heading { max-width: 70ch; text-align: center; justify-self: center; }",
    ".top-countries-heading h2 { margin-bottom: 4px; font-size: 1.25rem; }",
    ".top-countries-panel .eyebrow { color: #fff6ea; }",
    ".top-countries-heading h2, .top-countries-heading p { color: #ffffff; }",
    ".top-countries-heading p:last-child { margin-bottom: 0; color: rgba(255, 246, 234, 0.92); }",
    ".top-country-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; }",
    ".top-country-item { min-width: 0; position: relative; }",
    ".top-country-link { position: relative; width: 72px; aspect-ratio: 1; display: grid; place-items: center; gap: 5px; padding: 8px; border-radius: 999px; text-decoration: none; background: radial-gradient(circle at 30% 30%, #fbf1e8, #f4e5d7 72%); border: 1px solid rgba(115, 23, 2, 0.12); box-shadow: 0 10px 20px rgba(115, 23, 2, 0.12); transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease; }",
    ".top-country-link:hover, .top-country-link:focus-visible { transform: translateY(-3px) scale(1.02); border-color: rgba(255, 255, 255, 0.72); background: radial-gradient(circle at 30% 30%, #fff6ee, #f7eadf 72%); box-shadow: 0 18px 30px rgba(115, 23, 2, 0.18); text-decoration: none; }",
    ".top-country-link:focus-visible { outline: 3px solid rgba(255, 246, 234, 0.8); outline-offset: 3px; }",
    ".top-country-link::after { content: attr(data-tooltip); position: absolute; left: 50%; bottom: calc(100% + 12px); transform: translateX(-50%) translateY(6px); min-width: max-content; max-width: 180px; padding: 8px 10px; border-radius: 12px; background: rgba(26, 24, 20, 0.92); color: #ffffff; font-size: 0.86rem; line-height: 1.35; text-align: center; box-shadow: 0 12px 24px rgba(26, 24, 20, 0.2); opacity: 0; pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 2; }",
    ".top-country-link:hover::after, .top-country-link:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); }",
    ".top-country-rank { display: inline-flex; align-items: center; justify-content: center; min-width: 0; padding: 2px 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.92); color: var(--accent-strong); font-weight: 700; font-size: 0.78rem; line-height: 1; box-shadow: 0 6px 14px rgba(115, 23, 2, 0.1); }",
    ".top-country-flag-wrap { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; }",
    ".top-country-flag { width: 32px !important; height: 24px !important; border-radius: 4px; }",
    ".button-reset { border: 0; cursor: pointer; font: inherit; }",
    ".button, .country-card-cta { display: inline-flex; align-items: center; justify-content: center; width: fit-content; padding: 12px 18px; border-radius: 999px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease; }",
    ".button:hover, .button:focus-visible, .country-card-cta:hover, .country-card-cta:focus-visible { background: var(--accent-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(1, 64, 64, 0.22); transform: translateY(-1px); }",
    ".button:focus-visible, .country-card-cta:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.45); outline-offset: 3px; }",
    ".button-update { background: var(--accent-warm); }",
    ".button-update:hover, .button-update:focus-visible { background: var(--accent-warm-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(115, 23, 2, 0.24); }",
    ".contribution-panel {",
    "  border-color: rgba(115, 23, 2, 0.42);",
    "  border-radius: 30px;",
    "  box-shadow: 0 10px 24px rgba(1, 64, 64, 0.08), 0 3px 10px rgba(115, 23, 2, 0.08);",
    "}",
    ".contribution-panel p { color: var(--muted); max-width: 96ch; }",
    ".contribution-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".section-stack { display: grid; gap: 20px; }",
    ".directory-section { display: grid; gap: 16px; }",
    ".section-heading { max-width: 96ch; }",
    ".country-count, .country-status { padding-bottom: 20px; }",
    ".country-breakdown { color: var(--muted); margin-top: -12px; padding-bottom: 16px; }",
    ".country-grid, .community-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }",
    ".country-card, .community-card {",
    "  background: var(--surface);",
    "  border: 1px solid var(--border);",
    "  border-radius: 20px;",
    "  padding: 20px;",
    "  box-shadow: var(--shadow);",
    "}",
    ".country-card-active { background: #ddf3ee; border-color: #8ecabf; }",
    ".country-card-empty { background: #f4e6e1; border-color: #c8a096; }",
    ".country-card { transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease; }",
    ".country-card-link { display: grid; gap: 0px; color: inherit; text-decoration: none; min-height: 100%; }",
    ".country-card h3 { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 0; }",
    ".country-card-cta { margin-top: 8px; }",
    ".country-card:hover, .country-card:focus-within { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(1, 64, 64, 0.14); }",
    ".country-card-active:hover, .country-card-active:focus-within { background: #d3eee7; border-color: var(--accent); }",
    ".country-card-empty:hover, .country-card-empty:focus-within { background: #efddd7; border-color: var(--accent-warm); }",
    ".country-card-link:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.45); outline-offset: 6px; border-radius: 14px; }",
    ".country-hero h1 { display: flex; align-items: flex-start; gap: 14px; }",
    ".country-flag { width: 26px; height: 18px; border-radius: 3px; object-fit: cover; box-shadow: 0 0 0 1px rgba(1, 64, 64, 0.16); flex: 0 0 auto; }",
    ".country-card-empty .country-flag, .country-card-empty .country-flag-fallback { filter: grayscale(1); opacity: 0.6; }",
    ".country-flag-hero { width: 34px; height: 24px; border-radius: 4px; margin-top: 0.18em; }",
    ".country-flag-fallback { display: inline-flex; align-items: center; justify-content: center; color: var(--accent-strong); background: rgba(255, 255, 255, 0.55); }",
    ".country-flag-fallback svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }",
    ".back-link { display: inline-block; margin-top: 10px; }",
    ".community-meta { padding-left: 18px; margin-bottom: 16px; }",
    ".community-links { display: flex; flex-wrap: wrap; gap: 10px; }",
    ".community-link {",
    "  text-decoration: none;",
    "  padding: 8px 12px;",
    "  border-radius: 999px;",
    "  background: var(--surface-strong);",
    "  border: 1px solid var(--border);",
    "  transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;",
    "}",
    ".community-link:hover, .community-link:focus-visible { background: #ffffff; border-color: var(--accent-bright); box-shadow: 0 10px 20px rgba(1, 64, 64, 0.1); transform: translateY(-1px); text-decoration: none; }",
    ".community-link:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.35); outline-offset: 2px; }",
    ".empty-state { padding: 24px; border-radius: 18px; background: var(--surface); border: 1px dashed var(--border); box-shadow: var(--shadow); }",
    ".empty-state h2 { margin-bottom: 10px; }",
    ".empty-state p { margin-bottom: 18px; color: var(--muted); max-width: 88ch; }",
    ".listing-section { display: grid; gap: 14px; }",
    ".print-shell { display: grid; gap: 28px; }",
    ".print-intro { margin: -4px 0 8px; color: var(--muted); font-size: 1rem; }",
    ".print-section { display: grid; gap: 18px; }",
    ".print-country-group { display: grid; gap: 12px; padding: 0 0 18px; border-bottom: 1px solid var(--border); }",
    ".print-subsection { display: grid; gap: 12px; }",
    ".print-subsection h4 { margin: 0; font-size: 1rem; color: var(--accent-strong); }",
    ".print-country-group h3 { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 0; }",
    ".print-community-list { display: grid; gap: 18px; }",
    ".print-community-card { display: grid; gap: 8px; padding-left: 0; }",
    ".print-community-card h4 { margin: 0; font-size: 1.1rem; }",
    ".print-community-card .community-description { margin-bottom: 0; }",
    ".print-community-card .community-meta { margin: 0; }",
    ".print-link-list { margin: 0; padding-left: 18px; }",
    ".print-link-list li { margin-bottom: 6px; overflow-wrap: anywhere; }",
    ".print-link-label { font-weight: 700; }",
    ".map-legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 22px; }",
    ".map-legend-item { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-weight: 600; }",
    ".map-dot { width: 14px; height: 14px; border-radius: 999px; border: 2px solid var(--accent-strong); display: inline-block; }",
    ".map-dot-active { background: var(--accent-bright); border-color: var(--accent-strong); }",
    ".map-dot-empty { background: var(--accent-highlight); border-color: var(--accent-warm); }",
    ".map-section { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.9fr); align-items: start; }",
    ".directory-map { min-height: 620px; border-radius: 24px; overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow); }",
    ".map-sidepanel { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 24px; box-shadow: var(--shadow); display: grid; gap: 18px; }",
    ".map-list-section { display: grid; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid rgba(1, 64, 64, 0.12); }",
    ".map-list-section:last-child { border-bottom: 0; padding-bottom: 0; }",
    ".map-country-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }",
    ".map-country-list li { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); }",
    ".map-country-list strong { color: var(--accent-strong); font-size: 0.95rem; }",
    ".leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: 0 12px 24px rgba(1, 64, 64, 0.18); }",
    ".leaflet-popup-content { margin: 14px 16px; color: var(--text); }",
    ".leaflet-popup-content a { color: var(--accent-strong); text-decoration: none; }",
    ".leaflet-popup-content a:hover { color: var(--accent-warm); text-decoration: none; }",
    "@media (max-width: 720px) {",
    "  .page-shell { padding: 16px; }",
    "  .site-header { align-items: flex-start; flex-direction: column; }",
    "  .site-header-actions { width: 100%; justify-content: flex-start; }",
    "  nav { flex-wrap: wrap; }",
    "  .country-search { width: 100%; }",
    "  .country-search-field { width: 100%; }",
    "  .country-search input { width: 100%; min-width: 0; }",
    "  .hero, .summary-panel, .country-hero { padding: 20px; }",
    "  .map-section { grid-template-columns: 1fr; }",
    "  .directory-map { min-height: 460px; }",
    "}",
    "@media print {",
    "  @page { margin: 0.5in; }",
    "  body { background: #ffffff; }",
    "  .page-shell { max-width: none; padding: 0; }",
    "  .site-header, .site-footer, .print-actions, .back-link, .print-hero { display: none !important; }",
    "  .print-intro { display: block; margin: 0 0 14px; color: #333333; font-size: 0.95rem; }",
    "  .hero, .country-hero, .contribution-panel, .community-card, .empty-state { box-shadow: none; }",
    "  .hero, .country-hero, .contribution-panel, .community-card, .empty-state { border-color: #999999; }",
    "  .main-content, .print-shell, .print-section, .print-community-list, .print-community-card { display: block; }",
    "  .main-content { gap: 0; }",
    "  .print-shell { margin: 0; }",
    "  .print-section { margin-bottom: 18px; }",
    "  .print-section .section-heading { margin-bottom: 10px; }",
    "  .print-section .section-heading h2 { font-size: 1.3rem; margin-bottom: 4px; }",
    "  .print-section .section-heading p { margin-bottom: 0; }",
    "  .print-country-group { display: block; padding: 0 0 12px; margin-bottom: 12px; break-inside: auto; page-break-inside: auto; }",
    "  .print-country-group h3 { display: flex; margin-bottom: 2px; }",
    "  .print-country-group .listing-count { margin: 0 0 8px; font-size: 1rem; }",
    "  .print-community-card { margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid; }",
    "  .print-community-card h4 { font-size: 1rem; }",
    "  .print-community-card .community-meta { padding-left: 16px; margin-bottom: 8px; }",
    "  .print-link-list { padding-left: 16px; }",
    "  .print-link-list li { margin-bottom: 4px; }",
    "  .print-link-list a { overflow-wrap: anywhere; word-break: break-word; }",
    "}",
    "",
  ].join("\n");
}

function buildCommunitiesByCountry(communities) {
  return communities.reduce((map, community) => {
    if (!map.has(community.country)) {
      map.set(community.country, []);
    }

    map.get(community.country).push(community);
    return map;
  }, new Map());
}

function buildEventsByCountry(events) {
  return events.reduce((map, event) => {
    if (!map.has(event.country)) {
      map.set(event.country, []);
    }

    map.get(event.country).push(event);
    return map;
  }, new Map());
}

function main() {
  const communities = sortCommunities(readJson(COMMUNITIES_PATH));
  const events = sortCommunities(readJson(EVENTS_PATH));
  const communitiesByCountry = buildCommunitiesByCountry(communities);
  const eventsByCountry = buildEventsByCountry(events);

  resetOutputDir();
  fs.writeFileSync(STYLES_PATH, renderStyles(), "utf8");
  writeFile("index.html", renderHomePage(communities, events, communitiesByCountry, eventsByCountry));
  writeFile("map.html", renderMapPage(communitiesByCountry, eventsByCountry));
  const printCommunitiesSections = DIRECTORY_SECTIONS.map((section) => renderPrintCommunitiesSection(section, communitiesByCountry))
    .filter(Boolean)
    .join("\n");
  const printEventsSections = DIRECTORY_SECTIONS.map((section) => renderPrintEventsSection(section, eventsByCountry))
    .filter(Boolean)
    .join("\n");
  writeFile("print-communities.html", renderPrintPage({ kind: "communities", items: communities, sections: printCommunitiesSections }));
  writeFile("print-events.html", renderPrintPage({ kind: "events", items: events, sections: printEventsSections }));

  for (const section of DIRECTORY_SECTIONS) {
    for (const country of section.countries) {
      const slug = slugify(country);
      const countryCommunities = communitiesByCountry.get(country) || [];
      const countryEvents = eventsByCountry.get(country) || [];
      writeFile(path.join("countries", `${slug}.html`), renderCountryPage(country, countryCommunities, countryEvents));
    }
  }
}

main();
