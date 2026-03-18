const fs = require("fs");
const path = require("path");
const { COUNTRIES, DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "communities.json");
const COUNTRIES_DIR = path.join(ROOT, "countries");
const README_PATH = path.join(ROOT, "README.md");

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

function renderCommunitiesJson(communities) {
  return `${JSON.stringify(communities, null, 2)}\n`;
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

function renderCountryPage(country, communities) {
  const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
  const displayCountry = getDisplayName(country);
  const rows = communities.length
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
    : "| No listings yet | - | Submit the first listing for this area. | - |";

  return [
    `# ${displayCountry} Tech Communities`,
    "",
    `Regional status: CARICOM ${status.caricom} | CSME ${status.csme}`,
    "",
    "| Community | Platform | Description | Join |",
    "| --- | --- | --- | --- |",
    rows,
    ""
  ].join("\n");
}

function renderReadme() {
  const sections = DIRECTORY_SECTIONS.map((section) => {
    const rows = section.countries
      .map((country) => {
        const slug = slugify(country);
        const status = REGIONAL_STATUS[country] || { caricom: "No", csme: "No" };
        return `| ${getDisplayName(country)} | [countries/${slug}.md](countries/${slug}.md) | ${status.caricom} | ${status.csme} |`;
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
    "# Caribbean Tech Communities",
    "",
    "A directory of tech communities across sovereign Caribbean states, mainland Caribbean countries, and non-sovereign Caribbean dependencies and territories, focused on strengthening visibility and communication across the region's tech ecosystem.",
    "",
    "This repository is managed as a dataset first and a directory second:",
    "",
    "`data/communities.json` -> generated pages -> `README.md` and `countries/*.md`",
    "",
    "Platforms can include websites, WhatsApp, Discord, Slack, Telegram, Meetup, forums, mailing lists, and social media.",
    "",
    "## Directory",
    "",
    "Browse communities by sovereignty status and constitutional relationship. Each location page lists the community name, the platforms it uses, a short description, and direct links to join or learn more.",
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
    "To add a community:",
    "",
    "1. Edit `data/communities.json`",
    "2. Run `npm run validate`",
    "3. Run `npm run generate`",
    "4. Submit a pull request",
    "",
    "Don't want to open a pull request? Use the [community submission form](https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml).",
    "",
    "See [CONTRIBUTING.md](CONTRIBUTING.md).",
    "",
    "## Website",
    "",
    "To build the static site locally:",
    "",
    "1. Run `npm run validate`",
    "2. Run `npm run build:site`",
    "3. Open `dist/index.html`",
    "",
    "The GitHub Pages deploy workflow is defined in `.github/workflows/deploy-pages.yml`.",
    "After GitHub Pages is configured to use GitHub Actions, every push to `main` that updates the dataset or site scripts will rebuild and redeploy the site automatically.",
    "",
    "## Automation",
    "",
    "GitHub Actions validate the dataset and ensure generated pages stay up to date. This keeps formatting consistent even as the directory grows.",
    ""
  ].join("\n");
}

function main() {
  const communities = sortCommunities(readCommunities());
  fs.mkdirSync(COUNTRIES_DIR, { recursive: true });

  writeIfChanged(DATA_PATH, renderCommunitiesJson(communities));

  for (const country of COUNTRIES) {
    const countryCommunities = communities.filter((community) => community.country === country);
    const outputPath = path.join(COUNTRIES_DIR, `${slugify(country)}.md`);
    const outputContent = renderCountryPage(country, countryCommunities);

    writeIfChanged(outputPath, outputContent);
  }

  writeIfChanged(README_PATH, renderReadme());
}

main();
