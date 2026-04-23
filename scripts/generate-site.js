const fs = require("fs");
const path = require("path");
const { DIRECTORY_SECTIONS, REGIONAL_STATUS, getDisplayName } = require("./directory-config");

const ROOT = process.cwd();
const COMMUNITIES_PATH = path.join(ROOT, "data", "communities.json");
const EVENTS_PATH = path.join(ROOT, "data", "events.json");
const DIST_DIR = path.join(ROOT, "dist");
const COUNTRIES_DIR = path.join(DIST_DIR, "countries");
const STYLES_PATH = path.join(DIST_DIR, "styles.css");
const SITE_URL = "https://natvrey.github.io/caribbean-tech-communities";
const CALENDAR_PATH = "calendar.html";
const CALENDAR_FEED_PATH = "calendar.ics";
const CALENDAR_OUTLOOK_FEED_PATH = "calendar-outlook.ics";
const MONTH_INDEX = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};
const WEEKDAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};
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

function toUtcDate(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function addUtcDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatUtcDate(date, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(date);
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldIcsLine(line) {
  const limit = 75;
  if (line.length <= limit) {
    return line;
  }

  const parts = [];
  let remaining = line;
  while (remaining.length > limit) {
    parts.push(remaining.slice(0, limit));
    remaining = ` ${remaining.slice(limit)}`;
  }
  parts.push(remaining);
  return parts.join("\r\n");
}

function parseMonthName(value) {
  return MONTH_INDEX[String(value || "").toLowerCase()] ?? null;
}

function parseExactSchedule(schedule) {
  if (!schedule) {
    return null;
  }

  const singleDateMatch = schedule.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (singleDateMatch) {
    const monthIndex = parseMonthName(singleDateMatch[1]);
    if (monthIndex === null) {
      return null;
    }

    const start = toUtcDate(Number(singleDateMatch[3]), monthIndex, Number(singleDateMatch[2]));
    return {
      startDate: toIsoDate(start),
      endDate: toIsoDate(start),
      displayDate: formatUtcDate(start)
    };
  }

  const sameMonthRangeMatch = schedule.match(/^([A-Za-z]+) (\d{1,2}) - (\d{1,2}), (\d{4})$/);
  if (sameMonthRangeMatch) {
    const monthIndex = parseMonthName(sameMonthRangeMatch[1]);
    if (monthIndex === null) {
      return null;
    }

    const year = Number(sameMonthRangeMatch[4]);
    const start = toUtcDate(year, monthIndex, Number(sameMonthRangeMatch[2]));
    const end = toUtcDate(year, monthIndex, Number(sameMonthRangeMatch[3]));
    return {
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      displayDate: `${sameMonthRangeMatch[1]} ${Number(sameMonthRangeMatch[2])} - ${Number(sameMonthRangeMatch[3])}, ${year}`
    };
  }

  const crossMonthRangeMatch = schedule.match(/^([A-Za-z]+) (\d{1,2}) - ([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (crossMonthRangeMatch) {
    const startMonthIndex = parseMonthName(crossMonthRangeMatch[1]);
    const endMonthIndex = parseMonthName(crossMonthRangeMatch[3]);
    if (startMonthIndex === null || endMonthIndex === null) {
      return null;
    }

    const year = Number(crossMonthRangeMatch[5]);
    const start = toUtcDate(year, startMonthIndex, Number(crossMonthRangeMatch[2]));
    const end = toUtcDate(year, endMonthIndex, Number(crossMonthRangeMatch[4]));
    return {
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      displayDate: `${crossMonthRangeMatch[1]} ${Number(crossMonthRangeMatch[2])} - ${crossMonthRangeMatch[3]} ${Number(crossMonthRangeMatch[4])}, ${year}`
    };
  }

  return null;
}

function nextWeekdayOnOrAfter(date, weekday) {
  const currentWeekday = date.getUTCDay();
  const offset = (weekday - currentWeekday + 7) % 7;
  return addUtcDays(date, offset);
}

function lastWeekdayOfMonth(year, monthIndex, weekday) {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const offset = (lastDay.getUTCDay() - weekday + 7) % 7;
  return addUtcDays(lastDay, -offset);
}

function buildCalendarLinkSet(relativeIcsPath, label) {
  const absoluteUrl = `${SITE_URL}/${relativeIcsPath}`;
  const subscriptionUrl = absoluteUrl.replace(/^https/i, "webcal");
  const encodedSubscriptionUrl = encodeURIComponent(subscriptionUrl);
  return [
    { label: "Apple Calendar / iCalendar", url: subscriptionUrl },
    { label: "Google Calendar (desktop web)", url: `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodedSubscriptionUrl}` },
    { label: "Download .ics file", url: absoluteUrl, download: true },
    {
      label: "Download Outlook .ics file",
      url: `${SITE_URL}/${relativeIcsPath.replace(/\.ics$/, "-outlook.ics")}`,
      download: true
    }
  ];
}

function normalizeCalendarDescription(parts) {
  return parts.filter(Boolean).join("\n\n");
}

function buildCalendarCollections(events) {
  const buildDate = new Date();
  const buildDateUtc = toUtcDate(buildDate.getUTCFullYear(), buildDate.getUTCMonth(), buildDate.getUTCDate());
  const mainItems = [];
  const optionalFeeds = [];
  const omittedEvents = [];

  for (const event of events) {
    const eventId = slugify(`${event.country}-${event.name}`);

    if (Array.isArray(event.calendar_dates) && event.calendar_dates.length > 0) {
      for (const [index, date] of event.calendar_dates.entries()) {
        const occurrenceDate = new Date(`${date}T00:00:00Z`);
        mainItems.push({
          id: `${eventId}-${index + 1}`,
          sourceType: "exact",
          name: event.name,
          country: event.country,
          city: event.city || "",
          hostCommunity: event.host_community || "",
          description: event.description,
          scheduleLabel: `${event.schedule} (known date)`,
          startDate: date,
          endDate: date,
          displayDate: formatUtcDate(occurrenceDate),
          url: event.links?.[0]?.url || "",
          links: event.links || []
        });
      }
      continue;
    }

    const exactSchedule = parseExactSchedule(event.schedule);

    if (exactSchedule) {
      mainItems.push({
        id: eventId,
        sourceType: "exact",
        name: event.name,
        country: event.country,
        city: event.city || "",
        hostCommunity: event.host_community || "",
        description: event.description,
        scheduleLabel: event.schedule,
        startDate: exactSchedule.startDate,
        endDate: exactSchedule.endDate,
        displayDate: exactSchedule.displayDate,
        url: event.links?.[0]?.url || "",
        links: event.links || []
      });
      continue;
    }

    if (/^Every other Sunday$/i.test(event.schedule || "")) {
      const anchor = toUtcDate(2026, 3, 19);
      mainItems.push({
        id: eventId,
        sourceType: "recurring",
        recurrenceType: "biweekly_weekday",
        weekday: WEEKDAY_INDEX.sunday,
        interval: 2,
        anchorDate: toIsoDate(anchor),
        inferenceNote:
          "This meetup is scheduled for April 19, 2026 and continues every other Sunday based on the current Discord event listing.",
        name: event.name,
        country: event.country,
        city: event.city || "",
        hostCommunity: event.host_community || "",
        description: event.description,
        scheduleLabel: event.schedule,
        displayDate: `Every other Sunday, starting ${formatUtcDate(anchor)}`,
        url: event.links?.[0]?.url || "",
        links: event.links || []
      });
      continue;
    }

    const monthlyLastWeekendMatch = (event.schedule || "").match(/^Last (Saturday|Sunday) or (Saturday|Sunday) of each month$/i);
    if (monthlyLastWeekendMatch) {
      const weekdays = [...new Set([monthlyLastWeekendMatch[1], monthlyLastWeekendMatch[2]].map((value) => value.toLowerCase()))];
      for (const weekdayName of weekdays) {
        const weekday = WEEKDAY_INDEX[weekdayName];
        const labelSuffix = weekdayName === "saturday" ? "last Saturday" : "last Sunday";
        mainItems.push({
          id: `${eventId}-${slugify(labelSuffix)}`,
          sourceType: "recurring",
          recurrenceType: "monthly_last_weekday",
          weekday,
          anchorDate: toIsoDate(lastWeekdayOfMonth(buildDateUtc.getUTCFullYear(), buildDateUtc.getUTCMonth(), weekday)),
          inferenceNote:
            "This meetup can land on either the last Saturday or the last Sunday of the month depending on speaker availability, so both dates are included in the calendar as placeholders until the exact monthly date is announced.",
          name: event.name,
          country: event.country,
          city: event.city || "",
          hostCommunity: event.host_community || "",
          description: event.description,
          scheduleLabel: `${event.schedule} (${labelSuffix} placeholder)`,
          displayDate: `Last ${weekdayName.charAt(0).toUpperCase()}${weekdayName.slice(1)} of each month`,
          url: event.links?.[0]?.url || "",
          links: event.links || []
        });
      }
      continue;
    }

    omittedEvents.push({
      name: event.name,
      url: event.links?.[0]?.url || ""
    });
  }

  const mainFeed = {
    title: "Caribbean Tech Events Calendar",
    path: CALENDAR_FEED_PATH,
    outlookPath: CALENDAR_OUTLOOK_FEED_PATH,
    links: buildCalendarLinkSet(CALENDAR_FEED_PATH, "Caribbean Tech Events Calendar"),
    items: mainItems
  };

  return {
    buildDate: toIsoDate(buildDateUtc),
    mainFeed,
    optionalFeeds,
    omittedEvents
  };
}

function buildCalendarOccurrences(items, startDate, endDate, limit = 500) {
  const occurrences = [];
  const rangeStart = new Date(`${startDate}T00:00:00Z`);
  const rangeEnd = new Date(`${endDate}T00:00:00Z`);

  for (const item of items) {
    if (item.sourceType === "exact") {
      const itemStart = new Date(`${item.startDate}T00:00:00Z`);
      const itemEnd = new Date(`${item.endDate}T00:00:00Z`);
      if (itemEnd < rangeStart || itemStart > rangeEnd) {
        continue;
      }

      occurrences.push({
        ...item,
        occurrenceStart: item.startDate,
        occurrenceEnd: item.endDate
      });
      continue;
    }

    if (item.recurrenceType === "biweekly_weekday") {
      let cursor = new Date(`${item.anchorDate}T00:00:00Z`);
      while (cursor < rangeStart) {
        cursor = addUtcDays(cursor, item.interval * 7);
      }

      while (cursor <= rangeEnd && occurrences.length < limit) {
        occurrences.push({
          ...item,
          occurrenceStart: toIsoDate(cursor),
          occurrenceEnd: toIsoDate(cursor)
        });
        cursor = addUtcDays(cursor, item.interval * 7);
      }
      continue;
    }

    if (item.recurrenceType === "monthly_last_weekday") {
      let year = rangeStart.getUTCFullYear();
      let month = rangeStart.getUTCMonth();
      while (year < rangeEnd.getUTCFullYear() || (year === rangeEnd.getUTCFullYear() && month <= rangeEnd.getUTCMonth())) {
        const date = lastWeekdayOfMonth(year, month, item.weekday);
        if (date >= rangeStart && date <= rangeEnd) {
          occurrences.push({
            ...item,
            occurrenceStart: toIsoDate(date),
            occurrenceEnd: toIsoDate(date)
          });
        }
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }
    }
  }

  return occurrences.sort((a, b) => {
    const startCompare = a.occurrenceStart.localeCompare(b.occurrenceStart);
    if (startCompare !== 0) {
      return startCompare;
    }
    return a.name.localeCompare(b.name);
  });
}

function renderIcsFeed({ title, description, items }) {
  const nowStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const feedStart = toIsoDate(toUtcDate(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const feedEnd = toIsoDate(addUtcDays(toUtcDate(new Date().getUTCFullYear() + 2, 11, 31), 0));
  const occurrences = buildCalendarOccurrences(items, feedStart, feedEnd, 2000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Caribbean Tech Communities//Events Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(title)}`,
    `X-WR-CALDESC:${escapeIcsText(description)}`
  ];

  for (const occurrence of occurrences) {
    const start = new Date(`${occurrence.occurrenceStart}T00:00:00Z`);
    const endExclusive = addUtcDays(new Date(`${occurrence.occurrenceEnd}T00:00:00Z`), 1);
    const location = [occurrence.city, getDisplayName(occurrence.country)].filter(Boolean).join(", ");
    const details = normalizeCalendarDescription([
      occurrence.description,
      occurrence.hostCommunity ? `Host community: ${occurrence.hostCommunity}` : "",
      occurrence.scheduleLabel ? `Schedule listed in directory: ${occurrence.scheduleLabel}` : "",
      occurrence.inferenceNote || "",
      occurrence.url || ""
    ]);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeIcsText(`${occurrence.id}-${occurrence.occurrenceStart}@caribbean-tech-communities`)}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`SUMMARY:${escapeIcsText(occurrence.name)}`);
    lines.push(`DTSTART;VALUE=DATE:${start.toISOString().slice(0, 10).replace(/-/g, "")}`);
    lines.push(`DTEND;VALUE=DATE:${endExclusive.toISOString().slice(0, 10).replace(/-/g, "")}`);
    if (location) {
      lines.push(`LOCATION:${escapeIcsText(location)}`);
    }
    if (occurrence.url) {
      lines.push(`URL:${escapeIcsText(occurrence.url)}`);
    }
    lines.push(`DESCRIPTION:${escapeIcsText(details)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

function renderSubscribeMenu(links, label = "Subscribe to calendar") {
  const items = links
    .map((link) => {
      const downloadAttr = link.download ? " download" : "";
      return `<a href="${escapeHtml(link.url)}"${downloadAttr} target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`;
    })
    .join("");

  return [
    '<details class="subscribe-menu">',
    `  <summary class="subscribe-button">${escapeHtml(label)}<span aria-hidden="true">&#9662;</span></summary>`,
    `  <div class="subscribe-menu-list">${items}</div>`,
    "</details>"
  ].join("\n");
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
          : "https://github.com/natvrey/caribbean-tech-communities/issues/new?template=directory-submission.yml";
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
      // const tooltip = `${trackerLabel}: ${renderListingCount(communityCount, eventCount)} (${renderCommunityCount(communityCount)}, ${renderEventCount(eventCount)})`;
      const tooltip = `${trackerLabel}: ${renderListingCount(communityCount, eventCount)}`;

      return [
        '<li class="top-country-item">',
        `  <button class="top-country-link button-reset" type="button" aria-label="${escapeHtml(tooltip)}" data-tooltip="${escapeHtml(tooltip)}">`,
        `    <span class="top-country-rank">#${index + 1}</span>`,
        `    <span class="top-country-flag-wrap">${renderCountryFlag(country, "country-flag top-country-flag")}</span>`,
        "  </button>",
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
    '    <a class="button" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=directory-submission.yml" target="_blank" rel="noreferrer">Add listing</a>',
    showUpdate
      ? '    <a class="button button-update" href="https://github.com/natvrey/caribbean-tech-communities/issues/new?template=directory-submission.yml" target="_blank" rel="noreferrer">Update listing</a>'
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

function renderLeaderboardTooltipScript() {
  return [
    "(() => {",
    "  const buttons = Array.from(document.querySelectorAll('.top-country-link'));",
    "  if (!buttons.length) return;",
    "  const edgePadding = 16;",
    "  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');",
    "  const getTooltipWidth = (button) => {",
    "    const tooltip = window.getComputedStyle(button, '::after');",
    "    const rawWidth = parseFloat(tooltip.width);",
    "    return Number.isFinite(rawWidth) ? rawWidth : 220;",
    "  };",
    "  const updatePosition = (button) => {",
    "    button.classList.remove('tooltip-left', 'tooltip-right', 'tooltip-center');",
    "    const rect = button.getBoundingClientRect();",
    "    const tooltipWidth = getTooltipWidth(button);",
    "    const viewportWidth = window.innerWidth;",
    "    const projectedLeft = rect.left + rect.width / 2 - tooltipWidth / 2;",
    "    const projectedRight = rect.left + rect.width / 2 + tooltipWidth / 2;",
    "    if (projectedLeft < edgePadding) {",
    "      button.classList.add('tooltip-left');",
    "      return;",
    "    }",
    "    if (projectedRight > viewportWidth - edgePadding) {",
    "      button.classList.add('tooltip-right');",
    "      return;",
    "    }",
    "    button.classList.add('tooltip-center');",
    "  };",
    "  const closeAll = (exceptButton = null) => {",
    "    buttons.forEach((button) => {",
    "      if (button === exceptButton) return;",
    "      button.classList.remove('tooltip-open');",
    "    });",
    "  };",
    "  buttons.forEach((button) => {",
    "    ['pointerenter', 'focus'].forEach((eventName) => button.addEventListener(eventName, () => updatePosition(button), { passive: true }));",
    "    button.addEventListener('click', (event) => {",
    "      updatePosition(button);",
    "      if (!coarsePointer.matches) return;",
    "      event.preventDefault();",
    "      const isOpen = button.classList.contains('tooltip-open');",
    "      closeAll(isOpen ? null : button);",
    "      button.classList.toggle('tooltip-open', !isOpen);",
    "    });",
    "  });",
    "  document.addEventListener('click', (event) => {",
    "    if (event.target.closest('.top-country-link')) return;",
    "    closeAll();",
    "  });",
    "  document.addEventListener('keydown', (event) => {",
    "    if (event.key === 'Escape') closeAll();",
    "  });",
    "  window.addEventListener('resize', () => buttons.forEach(updatePosition), { passive: true });",
    "  buttons.forEach(updatePosition);",
    "})();"
  ].join("");
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
    '          <a class="site-nav-link" href="' + rootHref + '/calendar.html">Calendar</a>',
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
    '    <button class="back-to-top button-reset" type="button" aria-label="Back to top" hidden>Back to top</button>',
    "  </div>",
    bodyEnd,
    script ? `  <script>${script}</script>` : "",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

function renderBackToTopScript() {
  return [
    "(() => {",
    "  const button = document.querySelector('.back-to-top');",
    "  if (!button) return;",
    "  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');",
    "  const toggleVisibility = () => {",
    "    const isVisible = window.scrollY > 240;",
    "    button.hidden = !isVisible;",
    "    button.classList.toggle('is-visible', isVisible);",
    "  };",
    "  button.addEventListener('click', () => {",
    "    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });",
    "  });",
    "  window.addEventListener('scroll', toggleVisibility, { passive: true });",
    "  toggleVisibility();",
    "})();"
  ].join("");
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
    '      <a class="button button-update" href="./calendar.html">Open events calendar</a>',
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
    script: [countrySearch.script, renderLeaderboardTooltipScript(), renderBackToTopScript()].join(""),
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
    relativeRoot: "..",
    script: renderBackToTopScript()
  });
}

function renderCalendarPage(calendarCollections) {
  const { buildDate, mainFeed, optionalFeeds, omittedEvents } = calendarCollections;
  const exactCount = mainFeed.items.filter((item) => item.sourceType === "exact").length;
  const recurringCount = mainFeed.items.filter((item) => item.sourceType === "recurring").length;
  const calendarData = {
    buildDate,
    mainFeedTitle: mainFeed.title,
    items: mainFeed.items
  };

  const omittedMarkup = omittedEvents.length
    ? [
        '<section class="listing-section">',
        '  <details class="calendar-omitted-details">',
        '    <summary class="calendar-omitted-summary">',
        '      <span class="calendar-omitted-title"><span class="calendar-omitted-chevron" aria-hidden="true">&#9662;</span><span>Events coming soon</span></span>',
        `      <strong>${omittedEvents.length} more</strong>`,
        "    </summary>",
        '    <div class="section-heading calendar-omitted-copy">',
        "      <p>Dates for the following events have not been provided as yet. We will add them to the calendar once dates are provided.</p>",
        "    </div>",
        '    <div class="calendar-note-list">',
        omittedEvents
          .map(
            (item) => [
              '<article class="calendar-note-card">',
              item.url
                ? `  <h3><a class="text-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a></h3>`
                : `  <h3>${escapeHtml(item.name)}</h3>`,
              "</article>"
            ].join("\n")
          )
          .join("\n"),
        "    </div>",
        "  </details>",
        "</section>"
      ].join("\n")
    : "";

  const body = [
    '<main class="main-content">',
    '  <section class="hero calendar-hero">',
    "    <p class=\"eyebrow\">Events Calendar</p>",
    "    <h1>Caribbean tech events calendar.</h1>",
    "    <p class=\"hero-copy\">Find Caribbean tech events in one place, including confirmed dates and recurring meetups we can share with confidence. If an event's timing is still unclear, we leave it off the main calendar until more details are available.</p>",
    '    <div class="hero-stats">',
    `      <div class="stat"><strong>${mainFeed.items.length}</strong><span>events on the calendar</span></div>`,
    `      <div class="stat"><strong>${exactCount}</strong><span>events with confirmed dates</span></div>`,
    `      <div class="stat"><strong>${recurringCount}</strong><span>recurring meetups included</span></div>`,
    "    </div>",
    '    <div class="calendar-hero-actions">',
    renderSubscribeMenu(mainFeed.links),
    "    </div>",
    `    <p class="status-note">Last updated: ${escapeHtml(formatUtcDate(new Date(`${buildDate}T00:00:00Z`)))} (UTC).</p>`,
    "  </section>",
    '  <section class="calendar-shell">',
    '    <div class="calendar-board">',
    '      <div class="calendar-searchbar">',
    '        <label class="sr-only" for="calendar-search-input">Search for events</label>',
    '        <div class="calendar-search-wrap">',
    '          <span class="calendar-search-icon" aria-hidden="true">&#9906;</span>',
    '          <input id="calendar-search-input" class="calendar-search-input" type="search" placeholder="Search for events" data-calendar-search autocomplete="off">',
    '          <button class="button-reset calendar-search-button" type="button" data-calendar-search-button>Search</button>',
    "        </div>",
    '        <div class="calendar-view-switch" role="tablist" aria-label="Calendar view options">',
    '          <button class="calendar-view-button is-active" type="button" role="tab" aria-selected="true" data-calendar-view="month">Month</button>',
    '          <button class="calendar-view-button" type="button" role="tab" aria-selected="false" data-calendar-view="day">Day</button>',
    "        </div>",
    "      </div>",
    '      <div class="calendar-toolbar">',
    '        <div class="calendar-toolbar-actions">',
    '          <button class="calendar-icon-button" type="button" aria-label="Previous period" data-calendar-nav="prev">&#8249;</button>',
    '          <button class="calendar-icon-button" type="button" aria-label="Next period" data-calendar-nav="next">&#8250;</button>',
    '          <button class="calendar-today-button" type="button" data-calendar-today>This Month</button>',
    "        </div>",
    '        <div class="calendar-toolbar-copy">',
    '          <p class="eyebrow" data-calendar-view-label>Month view</p>',
    '          <h2 id="calendar-month-label">Calendar</h2>',
    "        </div>",
    "      </div>",
    '      <div class="calendar-weekdays" aria-hidden="true">',
    "        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>",
    "      </div>",
    '      <div class="calendar-grid" data-calendar-grid></div>',
    '      <section class="calendar-day-panel" data-calendar-day-panel>',
    '        <div class="calendar-day-panel-head">',
    '          <h3 data-calendar-day-title>Selected day</h3>',
    '          <p class="hero-copy" data-calendar-day-caption>Events for this day.</p>',
    "        </div>",
    '        <div class="calendar-day-panel-list" data-calendar-day-list></div>',
    "      </section>",
    "    </div>",
    '    <aside class="map-sidepanel calendar-agenda">',
    "      <h2>Upcoming</h2>",
    '      <p class="hero-copy">The next twelve events coming up on the main calendar.</p>',
    '      <div class="calendar-agenda-list" data-calendar-agenda></div>',
    "    </aside>",
    "  </section>",
    omittedMarkup,
    "</main>"
  ].filter(Boolean).join("\n");

  const script = [
    `const calendarPageData = ${JSON.stringify(calendarData)};`,
    "(() => {",
    "  const monthLabel = document.querySelector('#calendar-month-label');",
    "  const grid = document.querySelector('[data-calendar-grid]');",
    "  const agenda = document.querySelector('[data-calendar-agenda]');",
    "  const prevButton = document.querySelector('[data-calendar-nav=\"prev\"]');",
    "  const nextButton = document.querySelector('[data-calendar-nav=\"next\"]');",
    "  const todayButton = document.querySelector('[data-calendar-today]');",
    "  const searchInput = document.querySelector('[data-calendar-search]');",
    "  const searchButton = document.querySelector('[data-calendar-search-button]');",
    "  const viewButtons = Array.from(document.querySelectorAll('[data-calendar-view]'));",
    "  const viewLabel = document.querySelector('[data-calendar-view-label]');",
    "  const weekdays = document.querySelector('.calendar-weekdays');",
    "  const dayPanel = document.querySelector('[data-calendar-day-panel]');",
    "  const dayTitle = document.querySelector('[data-calendar-day-title]');",
    "  const dayCaption = document.querySelector('[data-calendar-day-caption]');",
    "  const dayList = document.querySelector('[data-calendar-day-list]');",
    "  if (!monthLabel || !grid || !agenda || !prevButton || !nextButton || !todayButton || !searchInput || !searchButton || !viewLabel || !weekdays || !dayPanel || !dayTitle || !dayCaption || !dayList) return;",
    "  const today = new Date();",
    "  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));",
    "  let currentMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));",
    "  let currentView = 'month';",
    "  let searchQuery = '';",
    "  let selectedDateIso = todayUtc.toISOString().slice(0, 10);",
    "  const toDate = (value) => new Date(`${value}T00:00:00Z`);",
    "  const toIso = (date) => date.toISOString().slice(0, 10);",
    "  const addDays = (date, days) => { const next = new Date(date.getTime()); next.setUTCDate(next.getUTCDate() + days); return next; };",
    "  const lastWeekdayOfMonth = (year, monthIndex, weekday) => { const last = new Date(Date.UTC(year, monthIndex + 1, 0)); const offset = (last.getUTCDay() - weekday + 7) % 7; return addDays(last, -offset); };",
    "  const normalize = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();",
    "  const escapeAttribute = (value) => String(value || '').replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');",
    "  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;",
    "  const updateSearchPlaceholder = () => { searchInput.placeholder = isMobile() ? 'Search events' : 'Search for events'; };",
    "  const buildOccurrences = (items, rangeStart, rangeEnd) => {",
    "    const occurrences = [];",
    "    for (const item of items) {",
    "      if (item.sourceType === 'exact') {",
    "        const start = toDate(item.startDate);",
    "        const end = toDate(item.endDate);",
    "        if (end < rangeStart || start > rangeEnd) continue;",
    "        occurrences.push({ ...item, occurrenceStart: item.startDate, occurrenceEnd: item.endDate });",
    "        continue;",
    "      }",
    "      if (item.recurrenceType === 'biweekly_weekday') {",
    "        let cursor = toDate(item.anchorDate);",
    "        while (cursor < rangeStart) cursor = addDays(cursor, item.interval * 7);",
    "        while (cursor <= rangeEnd) {",
    "          occurrences.push({ ...item, occurrenceStart: toIso(cursor), occurrenceEnd: toIso(cursor) });",
    "          cursor = addDays(cursor, item.interval * 7);",
    "        }",
    "        continue;",
    "      }",
    "      if (item.recurrenceType === 'monthly_last_weekday') {",
    "        let year = rangeStart.getUTCFullYear();",
    "        let month = rangeStart.getUTCMonth();",
    "        while (year < rangeEnd.getUTCFullYear() || (year === rangeEnd.getUTCFullYear() && month <= rangeEnd.getUTCMonth())) {",
    "          const occurrence = lastWeekdayOfMonth(year, month, item.weekday);",
    "          if (occurrence >= rangeStart && occurrence <= rangeEnd) {",
    "            occurrences.push({ ...item, occurrenceStart: toIso(occurrence), occurrenceEnd: toIso(occurrence) });",
    "          }",
    "          month += 1;",
    "          if (month > 11) { month = 0; year += 1; }",
    "        }",
    "      }",
    "    }",
    "    return occurrences.sort((a, b) => a.occurrenceStart.localeCompare(b.occurrenceStart) || a.name.localeCompare(b.name));",
    "  };",
    "  const monthFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });",
    "  const mobileMonthFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'numeric', year: 'numeric' });",
    "  const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });",
    "  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' });",
    "  const matchesSearch = (occurrence) => {",
    "    if (!searchQuery) return true;",
    "    const haystack = normalize([occurrence.name, occurrence.country, occurrence.city, occurrence.hostCommunity, occurrence.description].filter(Boolean).join(' '));",
    "    return haystack.includes(searchQuery);",
    "  };",
    "  const getFilteredOccurrences = (rangeStart, rangeEnd) => buildOccurrences(calendarPageData.items, rangeStart, rangeEnd).filter(matchesSearch);",
    "  const getOccurrenceDateLabel = (occurrence) => {",
    "    const start = toDate(occurrence.occurrenceStart);",
    "    const end = toDate(occurrence.occurrenceEnd);",
    "    return occurrence.occurrenceStart === occurrence.occurrenceEnd ? dayFormatter.format(start) : `${dayFormatter.format(start)} - ${dayFormatter.format(end)}`;",
    "  };",
    "  const getAgendaSummary = (occurrence) => {",
    "    const summary = String(occurrence.description || '').trim();",
    "    if (!summary) return '';",
    "    return summary.length > 140 ? `${summary.slice(0, 137).trimEnd()}...` : summary;",
    "  };",
    "  const formatGoogleDate = (iso) => iso.replace(/-/g, '');",
    "  const buildGoogleCalendarUrl = (occurrence) => {",
    "    const params = new URLSearchParams();",
    "    const start = formatGoogleDate(occurrence.occurrenceStart);",
    "    const end = formatGoogleDate(toIso(addDays(toDate(occurrence.occurrenceEnd), 1)));",
    "    const location = [occurrence.city, occurrence.country].filter(Boolean).join(', ');",
    "    const details = [",
    "      occurrence.description || '',",
    "      occurrence.hostCommunity ? `Host community: ${occurrence.hostCommunity}` : '',",
    "      occurrence.scheduleLabel ? `Schedule listed in directory: ${occurrence.scheduleLabel}` : '',",
    "      occurrence.inferenceNote || '',",
    "      occurrence.url || ''",
    "    ].filter(Boolean).join('\\n\\n');",
    "    params.set('action', 'TEMPLATE');",
    "    params.set('text', occurrence.name);",
    "    params.set('dates', `${start}/${end}`);",
    "    if (details) params.set('details', details);",
    "    if (location) params.set('location', location);",
    "    return `https://calendar.google.com/calendar/render?${params.toString()}`;",
    "  };",
    "  const renderOccurrenceLinks = (occurrence) => {",
    "    const links = [`<a class=\"text-link\" href=\"${buildGoogleCalendarUrl(occurrence)}\" target=\"_blank\" rel=\"noreferrer\">Add to Google Calendar</a>`];",
    "    if (occurrence.url) links.push(`<a class=\"text-link\" href=\"${occurrence.url}\" target=\"_blank\" rel=\"noreferrer\">Event link</a>`);",
    "    return `<div class=\"calendar-entry-links\">${links.join('')}</div>`;",
    "  };",
    "  const renderAgenda = () => {",
    "    const rangeEnd = addDays(new Date(Date.UTC(todayUtc.getUTCFullYear() + 1, todayUtc.getUTCMonth(), todayUtc.getUTCDate())), 31);",
    "    const upcoming = getFilteredOccurrences(todayUtc, rangeEnd).slice(0, 12);",
    "    if (!upcoming.length) { agenda.innerHTML = '<p class=\"hero-copy\">No matching upcoming events right now.</p>'; return; }",
    "    agenda.innerHTML = upcoming.map((occurrence) => {",
    "      const summary = getAgendaSummary(occurrence);",
    "      const note = occurrence.inferenceNote ? `<p class=\"calendar-agenda-note\">${occurrence.inferenceNote}</p>` : '';",
    "      const links = renderOccurrenceLinks(occurrence);",
    "      const summaryMarkup = summary ? `<p class=\"calendar-agenda-summary\">${summary}</p>` : '';",
    "      return `<article class=\"calendar-agenda-item\"><p class=\"calendar-agenda-date\">${getOccurrenceDateLabel(occurrence)}</p><h3>${occurrence.name}</h3><p class=\"community-description\">${occurrence.country}${occurrence.city ? `, ${occurrence.city}` : ''}</p>${summaryMarkup}${note}${links}</article>`;",
    "    }).join('');",
    "  };",
    "  const renderSelectedDay = () => {",
    "    const selectedDate = toDate(selectedDateIso);",
    "    const dayOccurrences = getFilteredOccurrences(selectedDate, selectedDate);",
    "    dayTitle.textContent = dayFormatter.format(selectedDate);",
    "    dayCaption.textContent = `${weekdayFormatter.format(selectedDate)}${dayOccurrences.length ? ` • ${dayOccurrences.length} event${dayOccurrences.length === 1 ? '' : 's'}` : ''}`;",
    "    if (!dayOccurrences.length) { dayList.innerHTML = '<p class=\"hero-copy\">No events on this day.</p>'; return; }",
    "    dayList.innerHTML = dayOccurrences.map((occurrence) => {",
    "      const note = occurrence.inferenceNote ? `<p class=\"calendar-agenda-note\">${occurrence.inferenceNote}</p>` : '';",
    "      const links = renderOccurrenceLinks(occurrence);",
    "      return `<article class=\"calendar-day-entry\"><p class=\"calendar-agenda-date\">${getOccurrenceDateLabel(occurrence)}</p><h4>${occurrence.name}</h4><p class=\"community-description\">${occurrence.country}${occurrence.city ? `, ${occurrence.city}` : ''}</p>${note}${links}</article>`;",
    "    }).join('');",
    "  };",
    "  let todayButtonPulseTimer = null;",
    "  const updateViewState = () => {",
    "    viewButtons.forEach((button) => {",
    "      const isActive = button.dataset.calendarView === currentView;",
    "      button.classList.toggle('is-active', isActive);",
    "      button.setAttribute('aria-selected', String(isActive));",
    "    });",
    "    viewLabel.textContent = currentView === 'month' ? 'Month view' : 'Day view';",
    "    weekdays.classList.toggle('is-hidden', currentView === 'day');",
    "    grid.classList.toggle('is-day-view-hidden', currentView === 'day');",
    "    dayPanel.classList.toggle('is-open', currentView === 'day' || isMobile());",
    "    todayButton.textContent = currentView === 'month' ? 'This Month' : 'Today';",
    "    const isCurrentMonth = currentView === 'month' && currentMonth.getUTCFullYear() === todayUtc.getUTCFullYear() && currentMonth.getUTCMonth() === todayUtc.getUTCMonth();",
    "    const isToday = currentView === 'day' && selectedDateIso === toIso(todayUtc);",
    "    const isCurrentPeriod = isCurrentMonth || isToday;",
    "    todayButton.classList.toggle('is-current', isCurrentPeriod);",
    "    todayButton.setAttribute('aria-pressed', String(isCurrentPeriod));",
    "  };",
    "  const renderMonth = () => {",
    "    const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));",
    "    const monthEnd = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0));",
    "    const gridStart = addDays(monthStart, -(monthStart.getUTCDay() + 6) % 7);",
    "    const gridEnd = addDays(monthEnd, (7 - monthEnd.getUTCDay()) % 7);",
    "    const occurrences = getFilteredOccurrences(gridStart, gridEnd);",
    "    const byDate = occurrences.reduce((map, occurrence) => {",
    "      let cursor = toDate(occurrence.occurrenceStart);",
    "      const last = toDate(occurrence.occurrenceEnd);",
    "      while (cursor <= last) {",
    "        const key = toIso(cursor);",
    "        const bucket = map.get(key) || [];",
    "        bucket.push(occurrence);",
    "        map.set(key, bucket);",
    "        cursor = addDays(cursor, 1);",
    "      }",
    "      return map;",
    "    }, new Map());",
    "    monthLabel.textContent = isMobile() ? mobileMonthFormatter.format(monthStart) : monthFormatter.format(monthStart);",
    "    const cells = [];",
    "    let cursor = new Date(gridStart.getTime());",
    "    while (cursor <= gridEnd) {",
    "      const iso = toIso(cursor);",
    "      const dayItems = byDate.get(iso) || [];",
    "      const isCurrentMonth = cursor.getUTCMonth() === currentMonth.getUTCMonth();",
    "      const isToday = iso === toIso(todayUtc);",
    "      const isSelected = iso === selectedDateIso;",
    "      const desktopEvents = dayItems.map((occurrence) => { const fullName = escapeAttribute(occurrence.name); return `<button class=\"calendar-event-pill\" type=\"button\" data-calendar-date=\"${iso}\" data-full-name=\"${fullName}\" title=\"${fullName}\" aria-label=\"${fullName}\"><span class=\"calendar-event-pill-label\">${occurrence.name}</span></button>`; }).join('') || '<span class=\"calendar-empty-slot\">No events</span>';",
    "      const mobileDots = dayItems.length ? '<div class=\"calendar-day-dots\"><span class=\"calendar-day-dot\"></span></div>' : '';",
    "      const mobileButton = `<button class=\"calendar-day-button\" type=\"button\" data-calendar-date=\"${iso}\" aria-pressed=\"${isSelected}\"><span>${cursor.getUTCDate()}</span></button>`;",
    "      const desktopEventClass = dayItems.length > 3 ? 'calendar-day-events is-scrollable' : 'calendar-day-events';",
    "      cells.push(`<article class=\"calendar-day${isCurrentMonth ? '' : ' is-muted'}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}\">${isMobile() ? mobileButton : `<div class=\"calendar-day-head\"><span>${cursor.getUTCDate()}</span></div>`}${isMobile() ? mobileDots : `<div class=\"${desktopEventClass}\">${desktopEvents}</div>`}</article>`);",
    "      cursor = addDays(cursor, 1);",
    "    }",
    "    grid.innerHTML = cells.join('');",
    "    renderSelectedDay();",
    "  };",
    "  const renderDay = () => { monthLabel.textContent = dayFormatter.format(toDate(selectedDateIso)); renderSelectedDay(); };",
    "  const render = () => { updateSearchPlaceholder(); updateViewState(); renderAgenda(); if (currentView === 'month') renderMonth(); else renderDay(); };",
    "  prevButton.addEventListener('click', () => { if (currentView === 'month') currentMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)); else selectedDateIso = toIso(addDays(toDate(selectedDateIso), -1)); render(); });",
    "  nextButton.addEventListener('click', () => { if (currentView === 'month') currentMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)); else selectedDateIso = toIso(addDays(toDate(selectedDateIso), 1)); render(); });",
    "  todayButton.addEventListener('click', () => { currentMonth = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1)); selectedDateIso = toIso(todayUtc); todayButton.classList.remove('is-pulsing'); void todayButton.offsetWidth; todayButton.classList.add('is-pulsing'); if (todayButtonPulseTimer) window.clearTimeout(todayButtonPulseTimer); todayButtonPulseTimer = window.setTimeout(() => todayButton.classList.remove('is-pulsing'), 260); render(); });",
    "  searchInput.addEventListener('input', () => { searchQuery = normalize(searchInput.value); render(); });",
    "  searchButton.addEventListener('click', () => { searchQuery = normalize(searchInput.value); render(); });",
    "  viewButtons.forEach((button) => button.addEventListener('click', () => { currentView = button.dataset.calendarView; render(); }));",
    "  grid.addEventListener('click', (event) => { const trigger = event.target.closest('[data-calendar-date]'); if (!trigger) return; selectedDateIso = trigger.dataset.calendarDate; currentMonth = new Date(Date.UTC(toDate(selectedDateIso).getUTCFullYear(), toDate(selectedDateIso).getUTCMonth(), 1)); render(); });",
    "  window.addEventListener('resize', render, { passive: true });",
    "  render();",
    "})();",
    renderBackToTopScript()
  ].join("\n");

  return renderLayout({
    title: "Caribbean Tech Events Calendar",
    description: "Calendar view and subscription feeds for Caribbean tech events with dependable dates or recurrence rules.",
    body,
    relativeRoot: ".",
    script
  });
}

function renderPrintPage({ kind, items, sections }) {
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const communities = sortCommunities(readJson(COMMUNITIES_PATH));
  const events = sortCommunities(readJson(EVENTS_PATH));
  const pageTitle = kind === "communities" ? "Communities" : "Events";
  const singular = kind === "communities" ? "community" : "event";
  const totalLabel = `${items.length} ${items.length === 1 ? singular : kind}`;
  const printSummary = `A grouped list of all ${totalLabel} in the Caribbean tech directory as at ${printDate}. This list is organized by regional category and country. This list is updated as new listings are added.`;

  const body = [
    '<main class="main-content">',
    '  <section class="hero print-hero">',
    `    <h1>Printable Caribbean Tech ${pageTitle} Directory.</h1>`,
    `    <p class="hero-copy">This page lists all ${kind} currently in the directory and is formatted for printing or saving as a PDF.</p>`,
    '    <div class="hero-stats">',
    kind === "communities"
      ? `      <div class="stat"><strong>${communities.length}</strong><span>communities listed</span></div>`
      : `      <div class="stat"><strong>${events.length}</strong><span>events listed</span></div>`,
    "    </div>",
    '    <div class="hero-actions print-actions">',
    '      <button class="button button-reset" type="button" onclick="window.print()">Print / Save as PDF</button>',
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
    "}",
    renderBackToTopScript()
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
    "    : '<a href=\"https://github.com/natvrey/caribbean-tech-communities/issues/new?template=directory-submission.yml\" target=\"_blank\" rel=\"noreferrer\">Add listing</a>';",
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
    "}",
    renderBackToTopScript()
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
    "html { scroll-behavior: smooth; overflow-x: clip; }",
    "body {",
    "  margin: 0;",
    "  font-family: Georgia, 'Times New Roman', serif;",
    "  background: var(--bg);",
    "  color: var(--text);",
    "  overflow-x: clip;",
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
    ".back-to-top { position: fixed; right: 24px; bottom: 24px; z-index: 20; padding: 12px 18px; border-radius: 999px; background: var(--accent-strong); color: #ffffff; font-weight: 700; box-shadow: 0 18px 36px rgba(1, 64, 64, 0.24); opacity: 0; pointer-events: none; transform: translateY(12px); transition: opacity 160ms ease, transform 160ms ease, background-color 140ms ease, box-shadow 140ms ease; }",
    ".back-to-top.is-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }",
    ".back-to-top:hover, .back-to-top:focus-visible { background: var(--accent-warm); box-shadow: 0 20px 40px rgba(115, 23, 2, 0.26); transform: translateY(-2px); }",
    ".back-to-top:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.4); outline-offset: 3px; }",
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
    ".status-note { color: var(--muted); font-size: 0.95rem; margin-top: 32px; margin-bottom: -14px; }",
    ".status-note a { color: var(--accent-warm); }",
    ".listing-count { display: block; margin-top: 10px; margin-bottom: 0; color: var(--accent-warm); font-weight: 700; font-size: 1.15rem; letter-spacing: 0.01em; }",
    ".hero-stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }",
    ".stat { min-width: 140px; padding: 14px 16px; border-radius: 16px; background: #ddf3ee; border: 1px solid #8ecabf; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease; }",
    ".stat:hover { transform: translateY(-2px); background: #ffffff; border-color: var(--accent-bright); box-shadow: 0 14px 28px rgba(1, 64, 64, 0.14); }",
    ".stat strong { display: block; font-size: 1.7rem; color: var(--accent-strong); }",
    ".hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }",
    ".top-countries-panel { background: linear-gradient(135deg, #d65e00, #f27405 58%, #ea7b1e); border: 1px solid rgba(115, 23, 2, 0.24); border-radius: 24px; padding: 16px 20px; box-shadow: 0 20px 40px rgba(115, 23, 2, 0.18); display: grid; gap: 12px; overflow-x: clip; }",
    ".top-countries-heading { max-width: 70ch; text-align: center; justify-self: center; }",
    ".top-countries-heading h2 { margin-bottom: 4px; font-size: 1.25rem; }",
    ".top-countries-panel .eyebrow { color: #fff6ea; }",
    ".top-countries-heading h2, .top-countries-heading p { color: #ffffff; }",
    ".top-countries-heading p:last-child { margin-bottom: 0; color: rgba(255, 246, 234, 0.92); }",
    ".top-country-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; }",
    ".top-country-item { min-width: 0; position: relative; }",
    ".top-country-link { position: relative; width: 72px; aspect-ratio: 1; display: grid; place-items: center; gap: 5px; padding: 8px; border-radius: 999px; background: radial-gradient(circle at 30% 30%, #fbf1e8, #f4e5d7 72%); border: 1px solid rgba(115, 23, 2, 0.12); box-shadow: 0 10px 20px rgba(115, 23, 2, 0.12); transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease; }",
    ".top-country-link:hover { transform: translateY(-3px) scale(1.02); border-color: rgba(255, 255, 255, 0.72); background: radial-gradient(circle at 30% 30%, #fff6ee, #f7eadf 72%); box-shadow: 0 18px 30px rgba(115, 23, 2, 0.18); }",
    ".top-country-link:focus-visible { outline: 3px solid rgba(255, 246, 234, 0.8); outline-offset: 3px; }",
    ".top-country-link::after { content: attr(data-tooltip); position: absolute; left: 50%; bottom: calc(100% + 12px); transform: translateX(-50%) translateY(6px); width: clamp(120px, 42vw, 220px); max-width: calc(100vw - 32px); padding: 8px 10px; border-radius: 12px; background: rgba(26, 24, 20, 0.92); color: #ffffff; font-size: 0.86rem; line-height: 1.35; text-align: center; white-space: normal; overflow-wrap: anywhere; word-break: break-word; box-shadow: 0 12px 24px rgba(26, 24, 20, 0.2); opacity: 0; pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 2; }",
    ".top-country-link.tooltip-left::after { left: 0; transform: translateY(6px); }",
    ".top-country-link.tooltip-right::after { left: auto; right: 0; transform: translateY(6px); }",
    ".top-country-link.tooltip-center::after { left: 50%; right: auto; transform: translateX(-50%) translateY(6px); }",
    ".top-country-rank { display: inline-flex; align-items: center; justify-content: center; min-width: 0; padding: 2px 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.92); color: var(--accent-strong); font-weight: 700; font-size: 0.78rem; line-height: 1; box-shadow: 0 6px 14px rgba(115, 23, 2, 0.1); }",
    ".top-country-flag-wrap { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; }",
    ".top-country-flag { width: 32px !important; height: 24px !important; border-radius: 4px; }",
    ".button-reset { border: 0; cursor: pointer; font: inherit; }",
    ".button, .country-card-cta { display: inline-flex; align-items: center; justify-content: center; width: fit-content; padding: 12px 18px; border-radius: 999px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease; }",
    ".button:hover, .button:focus-visible, .country-card-cta:hover, .country-card-cta:focus-visible { background: var(--accent-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(1, 64, 64, 0.22); transform: translateY(-1px); }",
    ".button:focus-visible, .country-card-cta:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.45); outline-offset: 3px; }",
    ".button-update { background: var(--accent-warm); }",
    ".button-update:hover, .button-update:focus-visible { background: var(--accent-warm-strong); color: #fff; text-decoration: none; box-shadow: 0 14px 28px rgba(115, 23, 2, 0.24); }",
    ".subscribe-menu { position: relative; width: fit-content; flex: 0 0 auto; }",
    ".subscribe-menu[open] { z-index: 5; }",
    ".subscribe-button { list-style: none; display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 330px; padding: 18px 24px; border-radius: 18px; background: #ffffff; border: 2px solid rgba(3, 166, 120, 0.38); color: #0a8cdf; font-weight: 700; box-shadow: 0 18px 32px rgba(1, 64, 64, 0.08); cursor: pointer; }",
    ".subscribe-button::-webkit-details-marker { display: none; }",
    ".subscribe-button:hover, .subscribe-menu[open] .subscribe-button { border-color: #0a8cdf; box-shadow: 0 20px 36px rgba(1, 64, 64, 0.12); }",
    ".subscribe-menu-list { position: absolute; top: calc(100% + 12px); left: 0; min-width: min(100vw - 32px, 330px); padding: 12px 0; background: #ffffff; border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 20px 36px rgba(1, 64, 64, 0.14); display: grid; }",
    ".subscribe-menu-list a { padding: 14px 20px; text-decoration: none; color: var(--text); }",
    ".subscribe-menu-list a:hover, .subscribe-menu-list a:focus-visible { background: #f6fbfa; color: var(--accent-strong); outline: none; }",
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
    ".calendar-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; margin-bottom: 14px; }",
    ".calendar-shell { display: grid; gap: 20px; grid-template-columns: 1fr; align-items: start; }",
    ".calendar-board { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 24px; box-shadow: var(--shadow); display: flex; flex-direction: column; align-self: stretch; }",
    ".calendar-searchbar { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr) auto; align-items: center; padding: 8px 0 10px; }",
    ".calendar-search-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 6px; min-height: 56px; background: rgba(255, 255, 255, 0.82); border: 1px solid rgba(1, 64, 64, 0.12); border-radius: 999px; box-shadow: 0 10px 24px rgba(1, 64, 64, 0.08); }",
    ".calendar-search-icon { color: var(--muted); font-size: 1.2rem; padding-left: 12px; }",
    ".calendar-search-input { width: 100%; min-width: 0; border: 0; background: transparent; padding: 8px 12px; color: var(--text); font: inherit; }",
    ".calendar-search-input::placeholder { color: var(--muted); }",
    ".calendar-search-input:focus { outline: none; }",
    ".calendar-search-wrap:focus-within { border-color: var(--accent-bright); box-shadow: 0 12px 28px rgba(1, 64, 64, 0.12); }",
    ".calendar-search-button { flex: 0 0 auto; padding: 10px 14px; border-radius: 999px; background: var(--accent-strong); color: #ffffff; font-weight: 700; transition: background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease; }",
    ".calendar-search-button:hover, .calendar-search-button:focus-visible { background: var(--accent-warm); transform: translateY(-1px); box-shadow: 0 10px 18px rgba(115, 23, 2, 0.18); }",
    ".calendar-search-button:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.35); outline-offset: 2px; }",
    ".calendar-view-switch { display: inline-flex; gap: 6px; align-items: center; }",
    ".calendar-view-button { border: 0; background: transparent; padding: 10px 12px; border-bottom: 2px solid transparent; color: var(--muted); font: inherit; font-weight: 700; cursor: pointer; }",
    ".calendar-view-button.is-active { color: var(--text); border-bottom-color: var(--accent-strong); }",
    ".calendar-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 12px; }",
    ".calendar-toolbar-actions { display: flex; align-items: center; gap: 10px; }",
    ".calendar-toolbar-copy h2 { margin-bottom: 10px; }",
    ".calendar-icon-button { width: 42px; height: 42px; border-radius: 999px; background: #ffffff; border: 1px solid rgba(1, 64, 64, 0.16); color: var(--accent-strong); font-size: 1.5rem; line-height: 1; }",
    ".calendar-today-button { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(1, 64, 64, 0.14); background: #ffffff; color: var(--muted); font: inherit; transition: transform 140ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, color 160ms ease; }",
    ".calendar-today-button:hover, .calendar-today-button:focus-visible { border-color: rgba(1, 64, 64, 0.28); color: var(--accent-strong); box-shadow: 0 10px 20px rgba(1, 64, 64, 0.08); }",
    ".calendar-today-button:focus-visible { outline: 3px solid rgba(10, 157, 219, 0.2); outline-offset: 2px; }",
    ".calendar-today-button.is-current { background: #ddf3ee; border-color: #8ecabf; color: var(--accent-strong); box-shadow: inset 0 0 0 1px rgba(1, 64, 64, 0.08); }",
    ".calendar-today-button.is-pulsing { transform: scale(0.97); box-shadow: 0 0 0 6px rgba(10, 157, 219, 0.12); }",
    ".calendar-weekdays { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; color: var(--muted); font-weight: 700; letter-spacing: 0.08em; font-size: 0.72rem; text-transform: uppercase; }",
    ".calendar-weekdays.is-hidden { display: none; }",
    ".calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }",
    ".calendar-grid.is-day-view-hidden { display: none; }",
    ".calendar-day { min-height: 150px; padding: 12px; border-radius: 18px; background: #fffdfa; border: 1px solid rgba(1, 64, 64, 0.1); display: grid; gap: 10px; align-content: start; min-width: 0; overflow: visible; }",
    ".calendar-day.is-muted { opacity: 0.58; }",
    ".calendar-day.is-today { border-color: var(--accent-bright); box-shadow: inset 0 0 0 1px rgba(3, 166, 120, 0.22); }",
    ".calendar-day.is-selected { border-color: var(--accent-strong); box-shadow: inset 0 0 0 1px rgba(1, 64, 64, 0.24); }",
    ".calendar-day-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; min-height: 28px; }",
    ".calendar-day-head span { font-weight: 700; font-size: 1.05rem; }",
    ".calendar-day-head strong { font-size: 0.5rem; color: var(--accent-warm); text-align: right; white-space: nowrap; flex: 0 0 auto; }",
    ".calendar-day-events { display: grid; gap: 8px; margin-top: 4px; align-content: start; min-width: 0; }",
    ".calendar-day-events.is-scrollable { max-height: 104px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: var(--accent-bright) rgba(1, 64, 64, 0.08); }",
    ".calendar-day-events.is-scrollable::-webkit-scrollbar { width: 8px; }",
    ".calendar-day-events.is-scrollable::-webkit-scrollbar-track { background: rgba(1, 64, 64, 0.08); border-radius: 999px; }",
    ".calendar-day-events.is-scrollable::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--accent-bright), var(--accent)); border-radius: 999px; }",
    ".calendar-event-pill { position: relative; display: flex; align-items: center; width: 100%; max-width: 100%; min-width: 0; padding: 8px 10px; border-radius: 12px; background: #ddf3ee; border: 1px solid #8ecabf; text-decoration: none; color: var(--accent-strong); font-size: 11px; line-height: 1.25; text-align: left; }",
    ".calendar-event-pill-label { display: block; min-width: 0; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".calendar-event-pill:hover, .calendar-event-pill:focus-visible { background: #ffffff; border-color: var(--accent-bright); outline: none; }",
    ".calendar-event-pill::after { content: attr(data-full-name); position: absolute; left: 50%; bottom: calc(100% + 10px); transform: translate(-50%, 6px); width: max-content; max-width: min(240px, calc(100vw - 48px)); padding: 8px 10px; border-radius: 10px; background: rgba(1, 64, 64, 0.96); color: #ffffff; font-size: 0.84rem; line-height: 1.35; box-shadow: 0 14px 28px rgba(1, 64, 64, 0.2); opacity: 0; pointer-events: none; white-space: normal; z-index: 3; transition: opacity 140ms ease, transform 140ms ease; }",
    ".calendar-event-pill:hover::after, .calendar-event-pill:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }",
    ".calendar-empty-slot { color: var(--muted); font-size: 0.84rem; }",
    ".calendar-day-panel { display: none; border-top: 1px solid rgba(1, 64, 64, 0.12); padding-top: 14px; }",
    ".calendar-day-panel.is-open { display: flex; flex-direction: column; gap: 8px; }",
    ".calendar-day-panel-head h3 { margin-bottom: 2px; }",
    ".calendar-day-panel-list { display: grid; gap: 14px; }",
    ".calendar-day-entry { padding-bottom: 14px; border-bottom: 1px solid rgba(1, 64, 64, 0.12); }",
    ".calendar-day-entry:last-child { padding-bottom: 0; border-bottom: 0; }",
    ".calendar-day-entry h4 { margin: 0 0 6px; font-size: 1.1rem; }",
    ".calendar-entry-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }",
    ".calendar-day-button { width: 100%; aspect-ratio: 1; display: grid; place-items: center; padding: 0; border: 0; border-radius: 14px; background: transparent; color: inherit; font: inherit; font-weight: 700; }",
    ".calendar-day-button[aria-pressed='true'] { background: #0a9ddb; color: #ffffff; }",
    ".calendar-day-dots { display: flex; justify-content: center; gap: 6px; min-height: 10px; }",
    ".calendar-day-dot { width: 8px; height: 8px; border-radius: 999px; background: #0a9ddb; }",
    ".calendar-agenda { align-self: stretch; max-height: 100%; min-height: 0; overflow: hidden; display: grid; gap: 0; grid-template-rows: auto auto minmax(0, 1fr); }",
    ".calendar-agenda-list { display: grid; gap: 14px; }",
    ".calendar-shell > * { min-height: 0; }",
    ".calendar-shell .calendar-agenda-list { overflow-y: auto; padding-right: 8px; max-height: 420px; scrollbar-width: thin; scrollbar-color: var(--accent-bright) rgba(1, 64, 64, 0.08); -webkit-overflow-scrolling: touch; }",
    ".calendar-shell .calendar-agenda-list::-webkit-scrollbar { width: 12px; }",
    ".calendar-shell .calendar-agenda-list::-webkit-scrollbar-track { background: rgba(1, 64, 64, 0.08); border-radius: 999px; }",
    ".calendar-shell .calendar-agenda-list::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--accent-bright), var(--accent)); border-radius: 999px; border: 2px solid rgba(255, 253, 248, 0.95); }",
    ".calendar-shell .calendar-agenda-list::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, var(--accent), var(--accent-strong)); }",
    ".calendar-agenda-item { padding-bottom: 14px; border-bottom: 1px solid rgba(1, 64, 64, 0.12); }",
    ".calendar-agenda-item:last-child { padding-bottom: 0; border-bottom: 0; }",
    ".calendar-agenda-item h3 { margin-bottom: 6px; }",
    ".calendar-agenda-date { margin-bottom: 8px; color: var(--accent-warm); font-weight: 700; }",
    ".calendar-agenda-summary { margin: 10px 0; color: var(--muted); font-size: 0.98rem; line-height: 1.5; }",
    ".calendar-agenda-note { margin-bottom: 8px; color: var(--muted); font-size: 0.92rem; }",
    ".calendar-note-list { display: grid; gap: 14px; }",
    ".calendar-omitted-details { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; }",
    ".calendar-omitted-summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 24px; cursor: pointer; font-size: clamp(1.1rem, 2vw, 1.4rem); font-weight: 700; color: var(--accent-strong); background:#ddf3ee; }",
    ".calendar-omitted-summary::-webkit-details-marker { display: none; }",
    ".calendar-omitted-title { display: inline-flex; align-items: center; gap: 12px; }",
    ".calendar-omitted-chevron { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; font-size: 1.9rem; color: var(--accent-warm); transition: transform 160ms ease; }",
    ".calendar-omitted-details[open] .calendar-omitted-chevron { transform: rotate(180deg); }",
    ".calendar-omitted-summary strong { font-size: 0.9rem; color: var(--accent-warm); }",
    ".calendar-omitted-summary:hover, .calendar-omitted-summary:focus-visible, .calendar-omitted-details[open] .calendar-omitted-summary { background: #f8f5ed; outline: none; }",
    ".calendar-omitted-copy { padding: 14px 24px; }",
    ".calendar-omitted-details .calendar-note-list { padding: 0 24px 24px; }",
    ".calendar-note-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 18px 20px; box-shadow: var(--shadow); }",
    ".calendar-note-card h3 { margin-bottom: 8px; }",
    ".calendar-note-card p { margin-bottom: 0; color: var(--muted); }",
    ".calendar-option-card .subscribe-menu { margin-top: 10px; }",
    ".country-card .country-count, .country-card .country-status { padding-bottom: 20px; }",
    ".country-breakdown { color: var(--muted); margin-top: -12px; padding-bottom: 16px; }",
    ".country-grid, .community-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }",
    ".country-grid > *, .community-grid > * { min-width: 0; }",
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
    ".country-card-link { display: grid; gap: 0px; color: inherit; text-decoration: none; min-height: 100%; min-width: 0; }",
    ".country-card h3 { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 0; min-width: 0; }",
    ".country-card h3 span:last-child { min-width: 0; overflow-wrap: anywhere; }",
    ".country-card-cta { margin-top: 8px; }",
    ".country-card:hover, .country-card:focus-within { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(1, 64, 64, 0.14); }",
    ".country-card-active:hover, .country-card-active:focus-within { background: #d3eee7; border-color: var(--accent); }",
    ".country-card-empty:hover, .country-card-empty:focus-within { background: #efddd7; border-color: var(--accent-warm); }",
    ".country-card-link:focus-visible { outline: 3px solid rgba(242, 116, 5, 0.45); outline-offset: 6px; border-radius: 14px; }",
    ".country-hero { display: grid; gap: 14px; align-content: start; }",
    ".country-hero h1 { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 0; }",
    ".country-hero .country-status, .country-hero .listing-count, .country-hero .status-note, .country-hero .back-link { margin: 0; padding-bottom: 0; }",
    ".country-hero .status-note { max-width: 72ch; }",
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
    "@media (min-width: 992px) {",
    "  .calendar-shell { grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.66fr); }",
    "  .calendar-shell .calendar-agenda-list { overflow-y: auto; padding-right: 8px; max-height: 888px; }",
    "}",
    "@media (max-width: 720px) {",
    "  .page-shell { padding: 16px; }",
    "  .site-header { align-items: flex-start; flex-direction: column; }",
    "  .site-header-actions { width: 100%; justify-content: flex-start; }",
    "  nav { flex-wrap: wrap; }",
    "  .country-search { width: 100%; }",
    "  .country-search-field { width: 100%; }",
    "  .country-search input { width: 100%; min-width: 0; }",
    "  .hero, .summary-panel, .country-hero { padding: 20px; }",
    "  .status-note { margin-bottom: 3px; }",
    "  .calendar-searchbar { grid-template-columns: 1fr; }",
    "  .calendar-view-switch { grid-column: 1 / -1; justify-content: flex-end; }",
    "  .calendar-search-wrap { min-height: 52px; }",
    "  .calendar-toolbar { align-items: center; }",
    "  .calendar-toolbar-copy { flex: 1 1 auto; }",
    "  .calendar-toolbar-actions { gap: 8px; }",
    "  .calendar-today-button { display: none; }",
    "  .calendar-nav-button, .subscribe-button { width: 100%; min-width: 0; }",
    "  .calendar-weekdays { gap: 6px; justify-items: center; padding-top: 12px; border-top: 1px solid rgba(1, 64, 64, 0.14); }",
    "  .calendar-grid { gap: 6px; }",
    "  .calendar-day { min-height: 0; padding: 6px; gap: 6px; background: transparent; border-color: transparent; }",
    "  .calendar-day.is-selected { background: #ffffff; border-color: transparent; box-shadow: none; }",
    "  .calendar-day-head, .calendar-day-events { display: none; }",
    "  .calendar-day-button { font-size: 1.15rem; }",
    "  .calendar-day-panel { display: grid; gap: 12px; }",
    "  .calendar-day-panel.is-open { border-top: 1px solid rgba(1, 64, 64, 0.14); padding-top: 16px; }",
    "  .back-to-top { right: 16px; bottom: 16px; }",
    "  .map-section { grid-template-columns: 1fr; }",
    "  .directory-map { min-height: 460px; }",
    "}",
    "@media (hover: hover) and (pointer: fine) {",
    "  .top-country-link:hover { transform: translateY(-3px) scale(1.02); border-color: rgba(255, 255, 255, 0.72); background: radial-gradient(circle at 30% 30%, #fff6ee, #f7eadf 72%); box-shadow: 0 18px 30px rgba(115, 23, 2, 0.18); }",
    "  .top-country-link.tooltip-left:hover::after, .top-country-link.tooltip-right:hover::after { opacity: 1; transform: translateY(0); }",
    "  .top-country-link.tooltip-center:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }",
    "}",
    "@media (hover: none), (pointer: coarse) {",
    "  .top-country-link:focus, .top-country-link:focus-visible { transform: translateY(-3px) scale(1.02); border-color: rgba(255, 255, 255, 0.72); background: radial-gradient(circle at 30% 30%, #fff6ee, #f7eadf 72%); box-shadow: 0 18px 30px rgba(115, 23, 2, 0.18); }",
    "  .top-country-link.tooltip-left:focus::after, .top-country-link.tooltip-left:focus-visible::after, .top-country-link.tooltip-right:focus::after, .top-country-link.tooltip-right:focus-visible::after { opacity: 1; transform: translateY(0); }",
    "  .top-country-link.tooltip-center:focus::after, .top-country-link.tooltip-center:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); }",
    "  .top-country-link.tooltip-left.tooltip-open::after, .top-country-link.tooltip-right.tooltip-open::after { opacity: 1; transform: translateY(0); }",
    "  .top-country-link.tooltip-center.tooltip-open::after { opacity: 1; transform: translateX(-50%) translateY(0); }",
    "}",
    "@media print {",
    "  @page { margin: 0.5in; }",
    "  body { background: #ffffff; }",
    "  .page-shell { max-width: none; padding: 0; }",
    "  .site-header, .site-footer, .print-actions, .back-link, .print-hero, .back-to-top { display: none !important; }",
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
  const calendarCollections = buildCalendarCollections(events);

  resetOutputDir();
  fs.writeFileSync(STYLES_PATH, renderStyles(), "utf8");
  writeFile("index.html", renderHomePage(communities, events, communitiesByCountry, eventsByCountry));
  writeFile(CALENDAR_PATH, renderCalendarPage(calendarCollections));
  writeFile("map.html", renderMapPage(communitiesByCountry, eventsByCountry));
  writeFile(CALENDAR_FEED_PATH, renderIcsFeed({
    title: calendarCollections.mainFeed.title,
    description: "Calendar feed of Caribbean tech events with dependable exact dates or recurrence rules.",
    items: calendarCollections.mainFeed.items
  }));
  writeFile(CALENDAR_OUTLOOK_FEED_PATH, renderIcsFeed({
    title: calendarCollections.mainFeed.title,
    description: "Calendar feed of Caribbean tech events with dependable exact dates or recurrence rules.",
    items: calendarCollections.mainFeed.items
  }));
  for (const feed of calendarCollections.optionalFeeds) {
    writeFile(feed.icsPath, renderIcsFeed({
      title: feed.label,
      description: `${feed.label} calendar option from the Caribbean tech directory.`,
      items: [feed.item]
    }));
    writeFile(feed.icsPath.replace(/\.ics$/, "-outlook.ics"), renderIcsFeed({
      title: feed.label,
      description: `${feed.label} calendar option from the Caribbean tech directory.`,
      items: [feed.item]
    }));
  }
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
