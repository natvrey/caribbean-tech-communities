const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data", "communities.json");

const ALLOWED_COUNTRIES = new Set([
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
]);

const ALLOWED_DOMAINS = [
  "discord.gg",
  "discord.com",
  "chat.whatsapp.com",
  "slack.com",
  "join.slack.com",
  "t.me",
  "telegram.me",
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "meetup.com",
  "linkedin.com",
  "www.linkedin.com",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com"
];

const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "shorturl.at",
  "goo.gl",
  "tiny.cc",
  "ow.ly",
  "buff.ly",
  "cutt.ly",
  "rb.gy"
]);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRecord(record, index, seenLinks) {
  const label = `Record ${index + 1}`;
  const requiredFields = ["name", "country", "language", "focus", "description"];

  for (const field of requiredFields) {
    if (!(field in record)) {
      fail(`${label}: missing required field '${field}'.`);
    }
  }

  if (!isNonEmptyString(record.name)) {
    fail(`${label}: 'name' must be a non-empty string.`);
  }

  if (!ALLOWED_COUNTRIES.has(record.country)) {
    fail(`${label}: unsupported country '${record.country}'.`);
  }

  if (!Array.isArray(record.focus) || record.focus.length === 0 || record.focus.some((item) => !isNonEmptyString(item))) {
    fail(`${label}: 'focus' must be a non-empty array of strings.`);
  }

  if (!isNonEmptyString(record.language)) {
    fail(`${label}: 'language' must be a non-empty string.`);
  }

  if (!isNonEmptyString(record.description) || record.description.trim().length < 15) {
    fail(`${label}: 'description' must be a useful sentence of at least 15 characters.`);
  }

  if (record.member_count !== undefined && (!Number.isInteger(record.member_count) || record.member_count < 0)) {
    fail(`${label}: 'member_count' must be a non-negative integer when provided.`);
  }

  if (record.city !== undefined && !isNonEmptyString(record.city)) {
    fail(`${label}: 'city' must be a non-empty string when provided.`);
  }

  if (record.links !== undefined && (!Array.isArray(record.links) || record.links.length === 0)) {
    fail(`${label}: 'links' must be a non-empty array when provided.`);
  }

  if (
    record.links !== undefined &&
    record.links.some(
      (link) =>
        typeof link !== "object" ||
        link === null ||
        !isNonEmptyString(link.label) ||
        !isNonEmptyString(link.url)
    )
  ) {
    fail(`${label}: 'links' must contain only { label, url } objects.`);
    return;
  }

  if (record.links) {
    for (const link of record.links) {
    let url;
    try {
      url = new URL(link.url);
    } catch {
      fail(`${label}: link '${link.label}' must contain a valid URL.`);
      continue;
    }

    if (url.protocol !== "https:") {
      fail(`${label}: link '${link.label}' must use https.`);
    }

    const host = url.hostname.toLowerCase();
    if (SHORTENER_DOMAINS.has(host)) {
      fail(`${label}: shortened URLs are not allowed (${host}).`);
    }

    const isApprovedDomain = ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
    const isKnownGenericLabel = ["Website", "Community Page", "Other", "Forum"].includes(link.label);
    if (!isApprovedDomain && !isKnownGenericLabel) {
      fail(`${label}: domain '${host}' does not match the expected domain for link label '${link.label}'.`);
    }

    if (seenLinks.has(link.url)) {
      fail(`${label}: duplicate URL '${link.url}'.`);
    }
    seenLinks.add(link.url);
    }
  }

  const hasLinks = Array.isArray(record.links) && record.links.length > 0;
  if (!hasLinks) {
    fail(`${label}: provide at least one public link.`);
  }
}

function main() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    fail(`communities.json is not valid JSON: ${error.message}`);
    return;
  }

  if (!Array.isArray(data)) {
    fail("communities.json must contain a JSON array.");
    return;
  }

  const seenLinks = new Set();
  data.forEach((record, index) => validateRecord(record, index, seenLinks));

  if (process.exitCode) {
    return;
  }

  console.log(`Validated ${data.length} community record(s).`);
}

main();
