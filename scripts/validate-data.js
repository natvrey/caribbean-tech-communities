const fs = require("fs");
const path = require("path");
const { COUNTRIES } = require("./directory-config");

const COMMUNITIES_PATH = path.join(process.cwd(), "data", "communities.json");
const EVENTS_PATH = path.join(process.cwd(), "data", "events.json");
const ALLOWED_COUNTRIES = new Set(COUNTRIES);

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

function validateLinks(record, label, seenLinks) {
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

function validateCommunityRecord(record, index, seenLinks) {
  const label = `Community record ${index + 1}`;
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

  validateLinks(record, label, seenLinks);
}

function validateEventRecord(record, index, seenLinks) {
  const label = `Event record ${index + 1}`;
  const requiredFields = ["name", "country", "schedule", "description"];

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

  if (!isNonEmptyString(record.schedule)) {
    fail(`${label}: 'schedule' must be a non-empty string.`);
  }

  if (record.frequency !== undefined && !isNonEmptyString(record.frequency)) {
    fail(`${label}: 'frequency' must be a non-empty string when provided.`);
  }

  if (record.host_community !== undefined && !isNonEmptyString(record.host_community)) {
    fail(`${label}: 'host_community' must be a non-empty string when provided.`);
  }

  if (!isNonEmptyString(record.description) || record.description.trim().length < 15) {
    fail(`${label}: 'description' must be a useful sentence of at least 15 characters.`);
  }

  if (record.city !== undefined && !isNonEmptyString(record.city)) {
    fail(`${label}: 'city' must be a non-empty string when provided.`);
  }

  if (
    record.calendar_dates !== undefined &&
    (!Array.isArray(record.calendar_dates) ||
      record.calendar_dates.length === 0 ||
      record.calendar_dates.some((item) => !isNonEmptyString(item) || !/^\d{4}-\d{2}-\d{2}$/.test(item)))
  ) {
    fail(`${label}: 'calendar_dates' must be a non-empty array of YYYY-MM-DD strings when provided.`);
  }

  validateLinks(record, label, seenLinks);
}

function main() {
  const communityRaw = fs.readFileSync(COMMUNITIES_PATH, "utf8");
  const eventsRaw = fs.readFileSync(EVENTS_PATH, "utf8");
  let communities;
  let events;

  try {
    communities = JSON.parse(communityRaw);
  } catch (error) {
    fail(`communities.json is not valid JSON: ${error.message}`);
    return;
  }

  try {
    events = JSON.parse(eventsRaw);
  } catch (error) {
    fail(`events.json is not valid JSON: ${error.message}`);
    return;
  }

  if (!Array.isArray(communities)) {
    fail("communities.json must contain a JSON array.");
    return;
  }

  if (!Array.isArray(events)) {
    fail("events.json must contain a JSON array.");
    return;
  }

  const seenLinks = new Set();
  communities.forEach((record, index) => validateCommunityRecord(record, index, seenLinks));
  events.forEach((record, index) => validateEventRecord(record, index, seenLinks));

  if (process.exitCode) {
    return;
  }

  console.log(`Validated ${communities.length} community record(s) and ${events.length} event record(s).`);
}

main();
