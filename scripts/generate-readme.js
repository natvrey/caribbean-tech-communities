const fs = require("fs");
const path = require("path");
const { COUNTRIES, DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const COMMUNITIES_PATH = path.join(ROOT, "data", "communities.json");
const EVENTS_PATH = path.join(ROOT, "data", "events.json");
const COUNTRIES_DIR = path.join(ROOT, "countries");
const README_PATH = path.join(ROOT, "README.md");
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    if (existing === content) {
      return;
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
}

function sortCommunities(communities) {
  return [...communities].sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    if (countryCompare !== 0) return countryCompare;
    return a.name.localeCompare(b.name);
  });
}

function renderJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function renderPlatformLabels(community) {
  const labels = [];

  if (community.links) {
    for (const link of community.links) {
      if (!labels.includes(link.label)) {
        labels.push(link.label);
      }
    }
  }

  return labels.join(", ");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderReadmeCountryCell(country) {
  const flag = COUNTRY_FLAGS[country];
  const displayCountry = getDisplayName(country);

  if (!flag || flag.kind === "globe") {
    return displayCountry;
  }

  const src = flag.src || `https://flagcdn.com/w40/${flag.code}.png`;
  const image = `<img src="${src}" alt="${escapeHtml(displayCountry)} flag" width="26" height="18">`;
  return `${image} ${displayCountry}`;
}

function renderCommunityRows(communities) {
  return communities.length
    ? communities
        .map(
          (community) => {
            const joinLinks = community.links
              ? community.links.map((link) => `[${link.label}](${link.url})`).join("<br>")
              : "";
            const joinCell = joinLinks || "-";

            return `| ${community.name} | ${renderPlatformLabels(community)} | ${community.description} | ${joinCell} |`;
          }
        )
        .join("\n")
    : "| No community listings yet | - | Submit the first community listing for this area. | - |";
}

function renderEventRows(events) {
  return events.length
    ? events
        .map((event) => {
          const links = event.links ? event.links.map((link) => `[${link.label}](${link.url})`).join("<br>") : "";
          const eventCity = event.city || "-";
          const eventFrequency = event.frequency || "-";
          const hostCommunity = event.host_community || "-";
          const eventLinks = links || "-";
          return `| ${event.name} | ${eventCity} | ${event.schedule} | ${eventFrequency} | ${hostCommunity} | ${event.description} | ${eventLinks} |`;
        })
        .join("\n")
    : "| No event listings yet | - | - | - | - | Submit the first event listing for this area. | - |";
}

function renderCountryPage(country, communities, events) {
  const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
  const displayCountry = getDisplayName(country);

  return [
    `# ${displayCountry} Tech Communities and Events`,
    "",
    `Regional status: CARICOM ${status.caricom} | CSME ${status.csme}`,
    "",
    "## Communities",
    "",
    "| Community | Platform | Description | Join |",
    "| --- | --- | --- | --- |",
    renderCommunityRows(communities),
    "",
    "## Tech Events",
    "",
    "| Event | City | Date | Frequency | Host Community | Description | Attend |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    renderEventRows(events),
    ""
  ].join("\n");
}

function renderReadme() {
  const sections = DIRECTORY_SECTIONS.map((section) => {
    const rows = section.countries
      .map((country) => {
        const slug = slugify(country);
        const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
        return `| ${renderReadmeCountryCell(country)} | [countries/${slug}.md](countries/${slug}.md) | ${status.caricom} | ${status.csme} |`;
      })
      .join("\n");

    return [
      `### ${section.title}`,
      "",
      section.description,
      "",
      "| Country | Communities | CARICOM | CSME |",
      "| --- | --- | --- | --- |",
      rows,
      ""
    ].join("\n");
  }).join("\n");

  return [
    "# Caribbean Tech Communities and Events",
    "",
    "A directory of tech communities and events across sovereign Caribbean states, mainland Caribbean countries, and non-sovereign Caribbean dependencies and territories, focused on strengthening visibility and communication across the region's tech ecosystem. Platforms can include websites, WhatsApp, Discord, Slack, Telegram, Meetup, forums, mailing lists, and social media.",
    "",
    "Browse the directory:",
    "",
    "- Public website: [natvrey.github.io/caribbean-tech-communities](https://natvrey.github.io/caribbean-tech-communities/)",
    "- In this repository: start below in the `Directory` section or open `countries/*.md`",
    "",
    "This repository is managed as a dataset first and a directory second.",
    "",
    "`data/communities.json` + `data/events.json` -> generated pages -> `README.md` and `countries/*.md`",
    "",
    "The dataset forms the basis of the public website. Each push to `main` autodeploys to the site.",
    "",
    "## Directory",
    "",
    "Browse communities and events by sovereignty status and constitutional relationship. Each location page lists both sections for that country or regional scope.",
    "CARICOM and CSME status labels below are based on official CARICOM and CSME sources.",
    "",
    sections,
    "## References",
    "",
    "- Country sovereignty and constitutional-status grouping: [Caribbean Atlas, The Caribbean Islands](http://www.caribbean-atlas.com/en/the-caribbean-in-brief/the-caribbean-islands/).",
    "- CARICOM member state and associate member status: [CARICOM Member States and Associate Members](https://caricom.org/member-states-and-associate-members/).",
    "- CSME participation status: [CARICOM Single Market and Economy](https://caricom.org/projects/caricom-single-market-and-economy/) and [CSME About Us](https://csme.me/about-us/).",
    "",
    "## Contributing",
    "",
    "To add a new community or event, or update outdated information for an existing listing:",
    "",
    "1. Edit `data/communities.json` and/or `data/events.json`",
    "2. Run `npm run validate`",
    "3. Run `npm run generate`",
    "4. Submit a pull request",
    "",
    "Don't want to open a pull request? Use the [directory submission form](https://github.com/natvrey/caribbean-tech-communities/issues/new?template=directory-submission.yml) and choose whether you're adding a community, adding an event, or updating outdated information.",
    "",
    "See [CONTRIBUTING.md](CONTRIBUTING.md).",
    "",
    "## Automation",
    "",
    "GitHub Actions validate the dataset and ensure generated pages stay up to date. This keeps formatting consistent even as the directory grows.",
    ""
  ].join("\n");
}

function main() {
  const communities = sortCommunities(readJson(COMMUNITIES_PATH));
  const events = sortCommunities(readJson(EVENTS_PATH));
  fs.mkdirSync(COUNTRIES_DIR, { recursive: true });

  writeIfChanged(COMMUNITIES_PATH, renderJson(communities));
  writeIfChanged(EVENTS_PATH, renderJson(events));

  for (const country of COUNTRIES) {
    const countryCommunities = communities.filter((community) => community.country === country);
    const countryEvents = events.filter((event) => event.country === country);
    const outputPath = path.join(COUNTRIES_DIR, `${slugify(country)}.md`);
    const outputContent = renderCountryPage(country, countryCommunities, countryEvents);

    writeIfChanged(outputPath, outputContent);
  }

  writeIfChanged(README_PATH, renderReadme());
}

main();
