# Static Site Regression Tests

This folder contains the automated regression checks for the generated static site.

## What The Suite Covers

The main test file is `static-site.test.js`.

It checks two things:

1. The site generator produces the expected core output:
   - main pages such as `index.html`, `calendar.html`, `map.html`, and print pages
   - country detail pages in `dist/countries/`
   - calendar feeds such as `calendar.ics`
   - key content and counts that should stay stable unless the dataset or generator logic changes

2. The site generator safely escapes untrusted content:
   - generated country pages should not render injected HTML from dataset fields
   - calendar output should not allow injected markup or broken inline script content

## How The Tests Work

The suite is intentionally lightweight and dependency-free.

- It uses plain Node.js with `assert`
- It creates a temporary working directory
- It writes fixture `data/communities.json` and `data/events.json` files there
- It runs `scripts/generate-site.js` against that temporary dataset
- It inspects the generated files in the temporary `dist/` output

This means the tests validate the real generator behavior without modifying the repository's checked-in `dist/` files.

## Running Locally

Run the regression suite with:

```bash
npm test
```

A typical local verification flow is:

```bash
npm run validate
npm run generate
npm run build:site
npm test
```

## PR Validation

The PR workflow in `.github/workflows/check-generated-files.yml` runs this suite with `npm test`.

That workflow currently runs:

1. `npm run validate`
2. `npm run generate`
3. `npm run build:site`
4. `npm test`
5. `git diff --exit-code`

So if a pull request breaks generated site output or the escaping guarantees covered here, the workflow should fail.

## When To Update These Tests

Update the regression suite when:

- the generated site adds or removes important output files
- page structure changes in a way that affects the current assertions
- new escaping or serialization risks are introduced
- calendar or feed behavior changes intentionally

Try to keep the assertions focused on meaningful behavior, not incidental formatting.
