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

function renderPlatformLabels(community) {
  const labels = [];

  if (community.links) {
    for (const link of community.links) {
      if (!labels.includes(link.label)) {
        labels.push(link.label);
      }
    }
  }

  if (community.socials) {
    for (const social of community.socials) {
      if (!labels.includes(social.platform)) {
        labels.push(social.platform);
      }
    }
  }

  return labels.join(", ");
}

function renderSocials(community) {
  if (!community.socials || community.socials.length === 0) {
    return "";
  }

  return community.socials.map((social) => `${social.platform}: ${social.handle}`).join("<br>");
}

function renderCountryPage(country, communities) {
  const rows = communities.length
    ? communities
        .map(
          (community) => {
            const joinLinks = community.links
              ? community.links.map((link) => `[${link.label}](${link.url})`).join("<br>")
              : "";
            const socials = renderSocials(community);
            const joinParts = [joinLinks, socials].filter(Boolean);
            const joinCell = joinParts.length > 0 ? joinParts.join("<br>") : "-";

            return `| ${community.name} | ${renderPlatformLabels(community)} | ${community.description} | ${joinCell} |`;
          }
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
    "A directory of tech communities across the 13 sovereign Caribbean states, plus Belize, Guyana, and Suriname, focused on strengthening visibility & communication among the tech industry in these countries.",
    "",
    "This repository is managed as a dataset first and a directory second:",
    "",
    "`data/communities.json` -> generated pages -> `README.md` and `countries/*.md`",
    "",
    "Platforms can include:",
    "",
    "- Websites",
    "- WhatsApp",
    "- Discord",
    "- Slack",
    "- Telegram",
    "- Meetup",
    "- Forums",
    "- Mailing lists",
    "- Social media sites such as Instagram, LinkedIn, X, and Facebook",
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
    "- `language`",
    "- `focus`",
    "- `member_count` (optional)",
    "- `links`",
    "- `socials` (optional)",
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
    const countryCommunities = communities.filter((community) => community.country === country);
    const outputPath = path.join(COUNTRIES_DIR, `${slugify(country)}.md`);
    const outputContent = renderCountryPage(country, countryCommunities);

    writeIfChanged(outputPath, outputContent);
  }

  writeIfChanged(README_PATH, renderReadme());
}

main();
