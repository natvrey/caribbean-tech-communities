const fs = require("fs");
const path = require("path");
const { DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "communities.json");
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

function readCommunities() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
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

function renderCountryCards(countries, communitiesByCountry) {
  return countries
    .map((country) => {
      const slug = slugify(country);
      const count = communitiesByCountry.get(country)?.length || 0;
      const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
      const cardClass = count > 0 ? "country-card country-card-active" : "country-card country-card-empty";
      const displayCountry = getDisplayName(country);
      const flag = renderCountryFlag(country);
      const cardHref =
        count > 0
          ? `./countries/${slug}.html`
          : "https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml";
      const cardLabel = count > 0 ? "View communities" : "Add listing";
      const cardLabelClass = count > 0 ? "text-link" : "text-link country-card-cta";
      const cardRel = count > 0 ? "" : ' target="_blank" rel="noreferrer"';

      return [
        `<article class="${cardClass}">`,
        `<a class="country-card-link" href="${cardHref}"${cardRel}>`,
        `<h3>${flag}<span>${escapeHtml(displayCountry)}</span></h3>`,
        `<p class="country-count">${renderCommunityCount(count)}</p>`,
        `<p class="country-status">CARICOM: ${escapeHtml(status.caricom)}<br>CSME: ${escapeHtml(status.csme)}</p>`,
        `<span class="${cardLabelClass}">${cardLabel}</span>`,
        "</a>",
        "</article>"
      ].join("");
    })
    .join("");
}

function renderSection(section, communitiesByCountry) {
  return [
    '<section class="directory-section">',
    `<div class="section-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>`,
    `<div class="country-grid">${renderCountryCards(section.countries, communitiesByCountry)}</div>`,
    "</section>"
  ].join("");
}

function renderPrintSection(section, communitiesByCountry) {
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

function renderContributionPanel({ showUpdate = false } = {}) {
  return [
    '<section class="contribution-panel">',
    "  <h2>Add or Update a listing</h2>",
    "  <p>Know a Caribbean tech community that should be here, or one that needs to be updated? Send it in for review, and we'll add it once the details are confirmed.</p>",
    '  <div class="contribution-actions">',
    '    <a class="button" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Add listing</a>',
    showUpdate
      ? '    <a class="button button-update" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Update listing</a>'
      : '    <a class="button button-update" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Update listing</a>',
    "  </div>",
    "</section>"
  ].filter(Boolean).join("\n");
}

function renderLayout({ title, description, body, relativeRoot, script }) {
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
    "</head>",
    "<body>",
    '  <div class="page-shell">',
    '    <header class="site-header">',
    '      <a class="site-brand" href="' + rootHref + '/index.html">Caribbean Tech Communities</a>',
    "      <nav>",
    '        <a class="site-nav-link" href="' + rootHref + '/print.html">Print communities</a>',
    '        <a class="site-nav-link" href="' + rootHref + '/print.html?download=pdf">Download PDF</a>',
    // '        <a class="site-nav-link" href="' + rootHref + '/index.html#directory">Directory</a>',
    '        <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities" target="_blank" rel="noreferrer">GitHub</a>',
    // '        <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributor docs</a>',
    "      </nav>",
    "    </header>",
    body,
    `    <footer class="site-footer">Copyright &copy; ${currentYear} NV Creations</footer>`,
    "  </div>",
    script ? `  <script>${script}</script>` : "",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

function renderHomePage(communities, communitiesByCountry) {
  const totalCommunities = communities.length;
  const totalCountries = DIRECTORY_SECTIONS.flatMap((section) => section.countries).filter((country) => country !== "Regional").length;
  const sections = DIRECTORY_SECTIONS.map((section) => renderSection(section, communitiesByCountry)).join("\n");

  const body = [
    '<main class="main-content">',
    '  <section class="hero">',
    "    <h1>A directory of all Caribbean tech communities.</h1>",
    "    <p class=\"hero-copy\">Browse tech communities across sovereign Caribbean states, mainland Caribbean countries, and territories.</p>",
    '    <div class="hero-stats">',
    `      <div class="stat"><strong>${totalCountries}</strong><span>countries covered</span></div>`,
    `      <div class="stat"><strong>${totalCommunities}</strong><span>communities and counting</span></div>`,
    "    </div>",
    '    <div class="hero-actions">',
      '      <a class="button" href="#directory">Browse directory</a>',
    "    </div>",
    "  </section>",
    renderContributionPanel(),
    '  <div id="directory" class="section-stack">',
    sections,
    "  </div>",
    "</main>"
  ].join("\n");

  return renderLayout({
    title: "Caribbean Tech Communities",
    description: "A directory of tech communities across the Caribbean.",
    body,
    relativeRoot: "."
  });
}

function renderCountryPage(country, communities) {
  const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
  const displayCountry = getDisplayName(country);
  const flag = renderCountryFlag(country, "country-flag country-flag-hero");
  const cards = communities.length
    ? communities.map((community) => renderCommunityCard(community)).join("\n")
    : [
        '<section class="empty-state">',
        "  <h2>No listings yet</h2>",
        `  <p>No communities are listed for ${escapeHtml(displayCountry)} yet. Add one to help make the directory more useful.</p>`,
        "</section>"
      ].join("\n");
  const contributionPanel = renderContributionPanel({ showUpdate: communities.length > 0 });
  const contentSections = communities.length
    ? [contributionPanel, `<section class="community-grid">${cards}</section>`]
    : [`<section class="community-grid">${cards}</section>`, contributionPanel];

  const body = [
    '<main class="main-content">',
    '  <section class="country-hero">',
    `    <h1>${flag}<span>${escapeHtml(displayCountry)}</span></h1>`,
    `    <p class="country-status">CARICOM: ${escapeHtml(status.caricom)} | CSME: ${escapeHtml(status.csme)}</p>`,
    '    <p class="status-note"><a href="https://caricom.org/our-community/who-we-are/" target="_blank" rel="noreferrer">CARICOM</a> stands for the Caribbean Community, and <a href="https://csme.me/" target="_blank" rel="noreferrer">CSME</a> stands for the CARICOM Single Market and Economy.</p>',
    `    <p class="listing-count">${renderCommunityCount(communities.length)} listed</p>`,
    '    <a class="back-link" href="../index.html">Back to directory</a>',
    "  </section>",
    ...contentSections,
    "</main>"
  ].join("\n");

  return renderLayout({
    title: `${displayCountry} Tech Communities`,
    description: `Tech communities in ${displayCountry}.`,
    body,
    relativeRoot: ".."
  });
}

function renderPrintPage(communities, communitiesByCountry) {
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const sections = DIRECTORY_SECTIONS.map((section) => renderPrintSection(section, communitiesByCountry))
    .filter(Boolean)
    .join("\n");
  const printSummary = `A grouped list of all ${communities.length} Caribbean tech communities as at ${printDate}. This list is organized by regional category and country. This list is updated as new communities are added.`;

  const body = [
    '<main class="main-content">',
    '  <section class="hero print-hero">',
    "    <h1>Printable Caribbean tech communities list.</h1>",
    `    <p class="hero-copy">${printSummary}</p>`,
    '    <div class="hero-actions print-actions">',
    '      <button class="button button-reset" type="button" onclick="window.print()">Print / Save as PDF</button>',
    '      <a class="button" href="./index.html">Back to directory</a>',
    "    </div>",
    "  </section>",
    `  <div class="print-intro">${printSummary}</div>`,
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
    title: "Print Caribbean Tech Communities",
    description: "Printable list of Caribbean tech communities grouped by region and country.",
    body,
    relativeRoot: ".",
    script
  });
}

function renderStyles() {
  return [
    ":root {",
    // "  --bg: #8ecae6;",
    // "  --bg: #04C4D9;",
    // "  --bg: #A0D3F2;",
    "  --bg: #03A678;",
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
    ".site-brand { font-size: 1.15rem; font-weight: 700; text-decoration: none; }",
    "nav { display: flex; gap: 16px; }",
    ".site-nav-link, .text-link, .back-link { color: var(--accent-strong); text-decoration: none; }",
    ".site-nav-link:hover, .text-link:hover, .back-link:hover, .community-link:hover { color: var(--accent-warm); text-decoration: none; }",
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
    ".button-reset { border: 0; cursor: pointer; font: inherit; }",
    ".button, .country-card-cta { display: inline-flex; align-items: center; justify-content: center; width: fit-content; padding: 12px 18px; border-radius: 999px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease; }",
    ".button:hover, .button:focus-visible, .country-card-cta:hover, .country-card-cta:focus-visible { background: var(--accent-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(1, 64, 64, 0.22); transform: translateY(-1px); }",
    ".button:focus-visible, .country-card-cta:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.45); outline-offset: 3px; }",
    ".button-update { background: var(--accent-warm); }",
    ".button-update:hover, .button-update:focus-visible { background: var(--accent-warm-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(115, 23, 2, 0.24); }",
    ".contribution-panel { border-color: var(--accent-warm); }",
    ".contribution-panel p { color: var(--muted); max-width: 96ch; }",
    ".contribution-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".section-stack { display: grid; gap: 20px; }",
    ".directory-section { display: grid; gap: 16px; }",
    ".section-heading { max-width: 96ch; }",
    ".country-count, .country-status { padding-bottom: 20px; }",
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
    ".print-shell { display: grid; gap: 28px; }",
    ".print-intro { margin: -4px 0 8px; color: var(--muted); font-size: 1rem; }",
    ".print-section { display: grid; gap: 18px; }",
    ".print-country-group { display: grid; gap: 12px; padding: 0 0 18px; border-bottom: 1px solid var(--border); }",
    ".print-country-group h3 { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 0; }",
    ".print-community-list { display: grid; gap: 18px; }",
    ".print-community-card { display: grid; gap: 8px; padding-left: 0; }",
    ".print-community-card h4 { margin: 0; font-size: 1.1rem; }",
    ".print-community-card .community-description { margin-bottom: 0; }",
    ".print-community-card .community-meta { margin: 0; }",
    ".print-link-list { margin: 0; padding-left: 18px; }",
    ".print-link-list li { margin-bottom: 6px; overflow-wrap: anywhere; }",
    ".print-link-label { font-weight: 700; }",
    "@media (max-width: 720px) {",
    "  .page-shell { padding: 16px; }",
    "  .site-header { align-items: flex-start; flex-direction: column; }",
    "  nav { flex-wrap: wrap; }",
    "  .hero, .summary-panel, .country-hero { padding: 20px; }",
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

function main() {
  const communities = sortCommunities(readCommunities());
  const communitiesByCountry = buildCommunitiesByCountry(communities);

  resetOutputDir();
  fs.writeFileSync(STYLES_PATH, renderStyles(), "utf8");
  writeFile("index.html", renderHomePage(communities, communitiesByCountry));
  writeFile("print.html", renderPrintPage(communities, communitiesByCountry));

  for (const section of DIRECTORY_SECTIONS) {
    for (const country of section.countries) {
      const slug = slugify(country);
      const countryCommunities = communitiesByCountry.get(country) || [];
      writeFile(path.join("countries", `${slug}.html`), renderCountryPage(country, countryCommunities));
    }
  }
}

main();
