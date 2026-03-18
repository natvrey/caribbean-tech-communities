const fs = require("fs");
const path = require("path");
const { DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "communities.json");
const DIST_DIR = path.join(ROOT, "dist");
const COUNTRIES_DIR = path.join(DIST_DIR, "countries");
const STYLES_PATH = path.join(DIST_DIR, "styles.css");

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

function renderLinkList(links) {
  return links
    .map((link) => {
      const label = escapeHtml(link.label);
      const url = escapeHtml(link.url);
      return `<a class="community-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
    })
    .join("");
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

function renderCountryCards(countries, communitiesByCountry) {
  return countries
    .map((country) => {
      const slug = slugify(country);
      const count = communitiesByCountry.get(country)?.length || 0;
      const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
      const cardClass = count > 0 ? "country-card country-card-active" : "country-card country-card-empty";
      const displayCountry = getDisplayName(country);

      return [
        `<article class="${cardClass}">`,
        `<h3><a href="./countries/${slug}.html">${escapeHtml(displayCountry)}</a></h3>`,
        `<p>${renderCommunityCount(count)}</p>`,
        `<p class="country-status">CARICOM: ${escapeHtml(status.caricom)}<br>CSME: ${escapeHtml(status.csme)}</p>`,
        `<a class="text-link" href="./countries/${slug}.html">View communities</a>`,
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

function renderContributionPanel() {
  return [
    '<section class="contribution-panel">',
    "  <h2>Add a listing</h2>",
    "  <p>Know a Caribbean tech community that should be here? Send it in for review, and we'll add it once the details are confirmed.</p>",
    '  <div class="contribution-actions">',
    '    <a class="button" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml" target="_blank" rel="noreferrer">Add a listing</a>',
    "  </div>",
    "</section>"
  ].join("\n");
}

function renderLayout({ title, description, body, relativeRoot }) {
  const rootHref = relativeRoot || ".";

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
    '        <a class="site-nav-link" href="' + rootHref + '/index.html#directory">Directory</a>',
    '        <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities" target="_blank" rel="noreferrer">GitHub</a>',
    '        <a class="site-nav-link" href="https://github.com/natvrey/caribbean-tech-communities/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributor docs</a>',
    "      </nav>",
    "    </header>",
    body,
    "  </div>",
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
    "    <p class=\"eyebrow\">Directory</p>",
    "    <h1>Caribbean tech communities in one place.</h1>",
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
  const cards = communities.length
    ? communities.map((community) => renderCommunityCard(community)).join("\n")
    : [
        '<section class="empty-state">',
        "  <h2>No listings yet</h2>",
        `  <p>No communities are listed for ${escapeHtml(displayCountry)} yet. Add one to help make the directory more useful.</p>`,
        "</section>"
      ].join("\n");
  const contributionPanel = renderContributionPanel();
  const contentSections = communities.length
    ? [contributionPanel, `<section class="community-grid">${cards}</section>`]
    : [`<section class="community-grid">${cards}</section>`, contributionPanel];

  const body = [
    '<main class="main-content">',
    '  <section class="country-hero">',
    '    <a class="back-link" href="../index.html">Back to directory</a>',
    `    <h1>${escapeHtml(displayCountry)}</h1>`,
    `    <p class="country-status">CARICOM: ${escapeHtml(status.caricom)} | CSME: ${escapeHtml(status.csme)}</p>`,
    '    <p class="status-note"><a href="https://caricom.org/our-community/who-we-are/" target="_blank" rel="noreferrer">CARICOM</a> stands for the Caribbean Community, and <a href="https://csme.me/" target="_blank" rel="noreferrer">CSME</a> stands for the CARICOM Single Market and Economy.</p>',
    `    <p class="listing-count">${renderCommunityCount(communities.length)} listed</p>`,
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

function renderStyles() {
  return [
    ":root {",
    "  --bg: #8ecae6;",
    "  --surface: #fffdf8;",
    "  --surface-strong: #f8f2e2;",
    "  --text: #1a1814;",
    "  --muted: #5e5649;",
    "  --border: #d7ccb7;",
    "  --accent: #0d6b5d;",
    "  --accent-strong: #094b41;",
    "  --shadow: 0 18px 50px rgba(31, 28, 21, 0.08);",
    "}",
    "* { box-sizing: border-box; }",
    "html { scroll-behavior: smooth; }",
    "body {",
    "  margin: 0;",
    "  font-family: Georgia, 'Times New Roman', serif;",
    "  background: radial-gradient(circle at top, #dff4ff 0%, var(--bg) 52%, #5db8d4 100%);",
    "  color: var(--text);",
    "}",
    "a { color: inherit; }",
    ".page-shell { max-width: 1180px; margin: 0 auto; padding: 24px; }",
    ".site-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 32px; }",
    ".site-brand { font-size: 1.15rem; font-weight: 700; text-decoration: none; }",
    "nav { display: flex; gap: 16px; }",
    ".site-nav-link, .text-link, .back-link { color: var(--accent-strong); text-decoration: none; }",
    ".site-nav-link:hover, .text-link:hover, .back-link:hover, .community-link:hover { text-decoration: underline; }",
    ".main-content { display: grid; gap: 28px; }",
    ".hero, .country-hero, .contribution-panel {",
    "  background: var(--surface);",
    "  border: 1px solid var(--border);",
    "  border-radius: 24px;",
    "  padding: 28px;",
    "  box-shadow: var(--shadow);",
    "}",
    ".hero { padding: 40px 28px; }",
    ".eyebrow { margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-size: 0.8rem; }",
    "h1, h2, h3, p { margin-top: 0; }",
    "h1 { font-size: clamp(2.1rem, 5vw, 4.6rem); line-height: 0.95; max-width: 12ch; margin-bottom: 16px; }",
    "h2 { font-size: 1.7rem; margin-bottom: 10px; }",
    "h3 { font-size: 1.2rem; margin-bottom: 10px; }",
    ".hero-copy, .section-heading p, .summary-panel p, .country-status, .community-description, .community-meta { color: var(--muted); }",
    ".status-note { color: var(--muted); font-size: 0.95rem; margin-top: -6px; margin-bottom: 0; }",
    ".listing-count { display: block; margin-top: 10px; margin-bottom: 0; color: var(--accent-strong); font-weight: 700; font-size: 1.15rem; letter-spacing: 0.01em; }",
    ".hero-stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }",
    ".stat { min-width: 140px; padding: 14px 16px; border-radius: 16px; background: var(--surface-strong); border: 1px solid var(--border); }",
    ".stat strong { display: block; font-size: 1.7rem; color: var(--accent-strong); }",
    ".hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".button { display: inline-block; padding: 12px 18px; border-radius: 999px; background: var(--accent); color: #fff; text-decoration: none; }",
    ".contribution-panel p { color: var(--muted); max-width: 96ch; }",
    ".contribution-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".section-stack { display: grid; gap: 20px; }",
    ".directory-section { display: grid; gap: 16px; }",
    ".section-heading { max-width: 96ch; }",
    ".country-grid, .community-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }",
    ".country-card, .community-card {",
    "  background: var(--surface);",
    "  border: 1px solid var(--border);",
    "  border-radius: 20px;",
    "  padding: 20px;",
    "  box-shadow: var(--shadow);",
    "}",
    ".country-card-active { background: #eef8f1; border-color: #9ec8ad; }",
    ".country-card-empty { background: #fbf7ee; border-color: #d7ccb7; }",
    ".country-card h3 a { text-decoration: none; }",
    ".community-meta { padding-left: 18px; margin-bottom: 16px; }",
    ".community-links { display: flex; flex-wrap: wrap; gap: 10px; }",
    ".community-link {",
    "  text-decoration: none;",
    "  padding: 8px 12px;",
    "  border-radius: 999px;",
    "  background: var(--surface-strong);",
    "  border: 1px solid var(--border);",
    "}",
    ".empty-state { padding: 24px; border-radius: 18px; background: var(--surface); border: 1px dashed var(--border); box-shadow: var(--shadow); }",
    ".empty-state h2 { margin-bottom: 10px; }",
    ".empty-state p { margin-bottom: 18px; color: var(--muted); max-width: 88ch; }",
    "@media (max-width: 720px) {",
    "  .page-shell { padding: 16px; }",
    "  .site-header { align-items: flex-start; flex-direction: column; }",
    "  nav { flex-wrap: wrap; }",
    "  .hero, .summary-panel, .country-hero { padding: 20px; }",
    "}",
    ""
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

  for (const section of DIRECTORY_SECTIONS) {
    for (const country of section.countries) {
      const slug = slugify(country);
      const countryCommunities = communitiesByCountry.get(country) || [];
      writeFile(path.join("countries", `${slug}.html`), renderCountryPage(country, countryCommunities));
    }
  }
}

main();
