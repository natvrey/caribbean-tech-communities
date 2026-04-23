const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const GENERATOR_PATH = path.join(ROOT, "scripts", "generate-site.js");
const { COUNTRIES } = require(path.join(ROOT, "scripts", "directory-config"));
const realCommunities = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "communities.json"), "utf8"));
const realEvents = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "events.json"), "utf8"));
const coveredCountryCount = COUNTRIES.filter((country) => country !== "Regional").length;
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

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

function buildSite({ communities = realCommunities, events = realEvents } = {}) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "caribbean-tech-site-"));
  const dataDir = path.join(tempRoot, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "communities.json"), `${JSON.stringify(communities, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(dataDir, "events.json"), `${JSON.stringify(events, null, 2)}\n`, "utf8");

  const previousCwd = process.cwd();
  try {
    process.chdir(tempRoot);
    delete require.cache[require.resolve(GENERATOR_PATH)];
    require(GENERATOR_PATH);
  } finally {
    process.chdir(previousCwd);
  }

  return {
    tempRoot,
    distDir: path.join(tempRoot, "dist")
  };
}

function cleanup(tempRoot) {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

test("static site build generates the expected pages and feeds", () => {
  const { tempRoot, distDir } = buildSite();
  try {
    const expectedFiles = [
      "index.html",
      "calendar.html",
      "calendar.ics",
      "calendar-outlook.ics",
      "map.html",
      "print-communities.html",
      "print-events.html",
      "styles.css"
    ];

    for (const relativePath of expectedFiles) {
      assert.ok(fs.existsSync(path.join(distDir, relativePath)), `Expected ${relativePath} to be generated.`);
    }

    for (const country of COUNTRIES) {
      const countryPath = path.join(distDir, "countries", `${slugify(country)}.html`);
      assert.ok(fs.existsSync(countryPath), `Expected country page for ${country}.`);
    }

    const indexHtml = readFile(path.join(distDir, "index.html"));
    assert.match(indexHtml, /Caribbean Tech Communities and Events/);
    assert.match(indexHtml, new RegExp(`<strong>${coveredCountryCount}</strong><span>countries covered</span>`));
    assert.match(indexHtml, new RegExp(`<strong>${realCommunities.length}</strong><span>communities listed</span>`));
    assert.match(indexHtml, new RegExp(`<strong>${realEvents.length}</strong><span>events listed</span>`));

    const jamaicaHtml = readFile(path.join(distDir, "countries", "jamaica.html"));
    assert.match(jamaicaHtml, /JGDS Virtual Meetup/);
    assert.match(jamaicaHtml, /CARICOM: Member State \| CSME: Participant/);

    const calendarHtml = readFile(path.join(distDir, "calendar.html"));
    assert.match(calendarHtml, /Subscribe to calendar/);
    assert.match(calendarHtml, /Events coming soon/);
    assert.match(calendarHtml, /Kingston BETA/);

    const mapHtml = readFile(path.join(distDir, "map.html"));
    assert.match(mapHtml, /Countries In The Directory/);
    assert.match(mapHtml, /leaflet@1\.9\.4\/dist\/leaflet\.js/);

    const calendarIcs = readFile(path.join(distDir, "calendar.ics"));
    assert.match(calendarIcs, /BEGIN:VCALENDAR/);
    assert.match(calendarIcs, /SUMMARY:JGDS Virtual Meetup/);
    assert.match(calendarIcs, /SUMMARY:WiTC Monthly Meetup/);
  } finally {
    cleanup(tempRoot);
  }
});

test("generated site escapes untrusted content in pages, links, and embedded calendar data", () => {
  const communities = realCommunities.concat({
    name: 'Malicious </script><script>alert("boom")</script> Community',
    country: "Bahamas",
    city: '<b>Nassau</b>',
    language: "English",
    focus: ["security"],
    links: [
      {
        label: "Website",
        url: 'https://example.com/?q="><script>alert("boom")</script>'
      }
    ],
    description: 'Community with <img src=x onerror="alert(\'boom\')"> markup.'
  });

  const events = realEvents.concat({
    name: 'Injected </script><script>alert("boom")</script> Event',
    country: "Bahamas",
    city: '<svg onload="alert(\'boom\')"></svg>',
    schedule: "April 30, 2026",
    frequency: "One-time event",
    host_community: 'Host </script><script>alert("boom")</script>',
    links: [
      {
        label: "Website",
        url: 'https://example.com/event?q="><script>alert("boom")</script>'
      }
    ],
    description: 'Event payload <img src=x onerror="alert(\'boom\')"> to verify escaping.'
  });

  const { tempRoot, distDir } = buildSite({ communities, events });
  try {
    const bahamasHtml = readFile(path.join(distDir, "countries", "bahamas.html"));
    assert.match(
      bahamasHtml,
      /Malicious &lt;\/script&gt;&lt;script&gt;alert\(&quot;boom&quot;\)&lt;\/script&gt; Community/
    );
    assert.match(
      bahamasHtml,
      /Community with &lt;img src=x onerror=&quot;alert\(&#39;boom&#39;\)&quot;&gt; markup\./
    );
    assert.doesNotMatch(bahamasHtml, /<img src=x onerror=/);

    const calendarHtml = readFile(path.join(distDir, "calendar.html"));
    assert.ok(calendarHtml.includes('Injected <\\/script><script>alert(\\"boom\\")<\\/script> Event'));
    assert.ok(!calendarHtml.includes('Injected </script><script>alert("boom")</script> Event'));
    assert.ok(!calendarHtml.includes('event?q="><script>alert("boom")</script>'));
  } finally {
    cleanup(tempRoot);
  }
});

(async () => {
  let failures = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${name}`);
      console.error(error && error.stack ? error.stack : error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`Passed ${tests.length} static site regression tests.`);
})();
