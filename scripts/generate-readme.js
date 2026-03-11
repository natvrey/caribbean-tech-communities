const fs = require("fs");
const path = require("path");

const COUNTRIES = [
  "Regional",
  "Antigua and Barbuda",
  "Bahamas",
  "Barbados",
  "Belize",
  "Cuba",
  "Dominica",
  "Dominican Republic",
  "Grenada",
  "Guyana",
  "Haiti",
  "Jamaica",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Suriname",
  "Trinidad and Tobago"
];

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "communities.json");
const COUNTRIES_DIR = path.join(ROOT, "countries");
const README_PATH = path.join(ROOT, "README.md");

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readCommunities() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function sortCommunities(communities) {
  return [...communities].sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    if (countryCompare !== 0) return countryCompare;
    return a.name.localeCompare(b.name);
  });
}

function renderCountryPage(country, communities) {
  const rows = communities.length
    ? communities
        .map(
          (community) =>
            `| ${community.name} | ${community.platform} | ${community.description} | [Join](${community.join_link}) |`
        )
        .join("\n")
    : "| No listings yet | - | Submit the first listing for this area. | - |";

  return [
    `# ${country} Tech Communities`,
    "",
    "| Community | Platform | Description | Join |",
    "| --- | --- | --- | --- |",
    rows,
    ""
  ].join("\n");
}

function renderReadme() {
  const rows = COUNTRIES.map((country) => {
    const slug = slugify(country);
    return `| ${country} | [countries/${slug}.md](countries/${slug}.md) |`;
  }).join("\n");

  return [
    "# Caribbean Tech Communities",
    "",
    "A curated directory of technology communities across the Caribbean.",
    "",
    "This repository is managed as a dataset first and a directory second:",
    "",
    "`data/communities.json` -> generated pages -> `README.md` and `countries/*.md`",
    "",
    "Platforms can include:",
    "",
    "- WhatsApp",
    "- Discord",
    "- Slack",
    "- Telegram",
    "- Facebook",
    "- Meetup",
    "- Forums",
    "- Mailing lists",
    "",
    "## Directory",
    "",
    "| Country | Communities |",
    "| --- | --- |",
    rows,
    "",
    "## Contributing",
    "",
    "To add a community:",
    "",
    "1. Edit `data/communities.json`",
    "2. Run `npm run generate`",
    "3. Submit a pull request",
    "",
    "You can also submit a community through GitHub Issues.",
    "",
    "See `CONTRIBUTING.md`.",
    "",
    "## Data Model",
    "",
    "Each community record should use these fields:",
    "",
    "- `name`",
    "- `country`",
    "- `city` (optional)",
    "- `platform`",
    "- `language`",
    "- `focus`",
    "- `member_count` (optional)",
    "- `join_link`",
    "- `description`",
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

  for (const country of COUNTRIES) {
    const countryCommunities = communities.filter(
      (community) => community.country === country || (community.country === "Regional" && country !== "Regional")
    );

    fs.writeFileSync(
      path.join(COUNTRIES_DIR, `${slugify(country)}.md`),
      renderCountryPage(country, countryCommunities),
      "utf8"
    );
  }

  fs.writeFileSync(README_PATH, renderReadme(), "utf8");
}

main();
