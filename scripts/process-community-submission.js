const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data", "communities.json");
const ISSUE_BODY = process.env.ISSUE_BODY || "";
const ISSUE_NUMBER = process.env.ISSUE_NUMBER || "";
const ISSUE_URL = process.env.ISSUE_URL || "";

const FIELD_LABELS = {
  community_name: "Community name",
  scope: "Country or scope",
  city: "City (optional)",
  language: "Primary language",
  links: "Public links",
  focus: "Focus or audience",
  member_count: "Approximate member count (optional)",
  description: "Description",
  evidence: "Verification notes"
};

function fail(message) {
  throw new Error(message);
}

function normalizeFormValue(value) {
  const normalized = String(value || "").trim();
  return normalized === "_No response_" ? "" : normalized;
}

function parseIssueForm(body) {
  const normalizedBody = String(body || "").replace(/\r\n/g, "\n");
  const sections = normalizedBody.split(/^###\s+/m).slice(1);
  const values = {};

  for (const section of sections) {
    const firstNewline = section.indexOf("\n");
    if (firstNewline === -1) {
      continue;
    }

    const heading = section.slice(0, firstNewline).trim();
    const content = normalizeFormValue(section.slice(firstNewline + 1));
    values[heading] = content;
  }

  return values;
}

function requireField(values, label) {
  const value = normalizeFormValue(values[label]);
  if (!value) {
    fail(`Missing required issue form field: '${label}'.`);
  }
  return value;
}

function inferLinkLabel(rawUrl) {
  const host = new URL(rawUrl).hostname.toLowerCase();

  if (host === "discord.gg" || host.endsWith(".discord.gg") || host === "discord.com" || host.endsWith(".discord.com")) {
    return "Discord";
  }

  if (host === "chat.whatsapp.com" || host.endsWith(".chat.whatsapp.com")) {
    return "WhatsApp";
  }

  if (host === "slack.com" || host.endsWith(".slack.com") || host === "join.slack.com" || host.endsWith(".join.slack.com")) {
    return "Slack";
  }

  if (host === "t.me" || host.endsWith(".t.me") || host === "telegram.me" || host.endsWith(".telegram.me")) {
    return "Telegram";
  }

  if (host === "facebook.com" || host.endsWith(".facebook.com")) {
    return "Facebook";
  }

  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    return "Instagram";
  }

  if (host === "meetup.com" || host.endsWith(".meetup.com")) {
    return "Meetup";
  }

  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) {
    return "LinkedIn";
  }

  if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
    return "X";
  }

  return "Website";
}

function parseLinks(rawValue) {
  const entries = normalizeFormValue(rawValue)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (entries.length === 0) {
    fail("Submission must include at least one public link.");
  }

  const seen = new Set();
  return entries.map((url) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      fail(`Invalid URL in submission: '${url}'.`);
    }

    if (parsed.protocol !== "https:") {
      fail(`Submission links must use https: '${url}'.`);
    }

    if (seen.has(parsed.href)) {
      fail(`Submission contains the same URL more than once: '${parsed.href}'.`);
    }
    seen.add(parsed.href);

    return {
      label: inferLinkLabel(parsed.href),
      url: parsed.href
    };
  });
}

function parseFocus(rawValue) {
  const focus = normalizeFormValue(rawValue)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (focus.length === 0) {
    fail("Submission must include at least one focus area.");
  }

  return [...new Set(focus)];
}

function parseOptionalInteger(rawValue) {
  const value = normalizeFormValue(rawValue);
  if (!value) {
    return undefined;
  }

  if (!/^\d+$/.test(value)) {
    fail(`Member count must be a whole number when provided. Received '${value}'.`);
  }

  return Number.parseInt(value, 10);
}

function buildRecord(values) {
  const name = requireField(values, FIELD_LABELS.community_name);
  const country = requireField(values, FIELD_LABELS.scope);
  const language = requireField(values, FIELD_LABELS.language);
  const description = requireField(values, FIELD_LABELS.description);
  const focus = parseFocus(requireField(values, FIELD_LABELS.focus));
  const links = parseLinks(requireField(values, FIELD_LABELS.links));
  const city = normalizeFormValue(values[FIELD_LABELS.city]);
  const memberCount = parseOptionalInteger(values[FIELD_LABELS.member_count]);

  const record = {
    name,
    country,
    language,
    focus,
    links,
    description
  };

  if (city) {
    record.city = city;
  }

  if (memberCount !== undefined) {
    record.member_count = memberCount;
  }

  return record;
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

function checkForDuplicates(existingRecords, record) {
  const normalizedName = record.name.trim().toLowerCase();

  for (const existing of existingRecords) {
    if (existing.country === record.country && String(existing.name || "").trim().toLowerCase() === normalizedName) {
      fail(`A community named '${record.name}' already exists for '${record.country}'.`);
    }

    for (const link of existing.links || []) {
      if (record.links.some((candidate) => candidate.url === link.url)) {
        fail(`At least one submitted URL already exists in the dataset: '${link.url}'.`);
      }
    }
  }
}

function writeOutputs(record) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const branchName = `automation/community-submission-${ISSUE_NUMBER || "manual"}`;
  const prTitle = `Add community submission: ${record.name}`;
  const lines = [
    `branch_name<<__EOF__\n${branchName}\n__EOF__`,
    `community_name<<__EOF__\n${record.name}\n__EOF__`,
    `country<<__EOF__\n${record.country}\n__EOF__`,
    `pr_title<<__EOF__\n${prTitle}\n__EOF__`,
    `issue_url<<__EOF__\n${ISSUE_URL}\n__EOF__`
  ];

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
}

function main() {
  if (!ISSUE_BODY.trim()) {
    fail("ISSUE_BODY is required.");
  }

  const parsedIssue = parseIssueForm(ISSUE_BODY);
  requireField(parsedIssue, FIELD_LABELS.evidence);

  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    fail("communities.json must contain a JSON array.");
  }

  const record = buildRecord(parsedIssue);
  checkForDuplicates(data, record);

  const nextData = sortCommunities([...data, record]);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  writeOutputs(record);

  process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
}

main();
