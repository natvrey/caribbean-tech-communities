# Contributing

## Workflow

This repository uses a structured dataset as the source of truth.

To contribute:

1. Edit `data/communities.json`
2. Add a new community record or update existing record(s) with current information
3. Run `npm run validate`
4. Run `npm run generate`
5. Commit the updated data and generated markdown files
6. Open a pull request

If you do not want to open a pull request, use the [directory submission form](https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml) to submit a new community, submit a new event, or update outdated information in an existing listing.

## Record Schema

Community objects in `data/communities.json` should follow this shape:

```json
{
  "name": "Kingston Tech Community",
  "country": "Jamaica",
  "city": "Kingston",
  "language": "English",
  "focus": ["software engineering", "startups"],
  "member_count": 250,
  "links": [
    {
      "label": "Slack",
      "url": "https://join.slack.com/example"
    },
    {
      "label": "X",
      "url": "https://x.com/examplecommunity"
    },
    {
      "label": "Website",
      "url": "https://example.com"
    }
  ],
  "description": "Community for Jamaican developers, founders, and students."
}
```

Event objects in `data/events.json` should follow this shape:

```json
{
  "name": "Caribbean Dev Summit 2026",
  "country": "Regional",
  "city": "Bridgetown",
  "schedule": "April 24-26, 2026",
  "frequency": "Annual conference",
  "host_community": "Caribbean Dev Network",
  "links": [
    {
      "label": "Website",
      "url": "https://example.com/event"
    }
  ],
  "description": "Regional event for Caribbean developers, founders, and ecosystem builders."
}
```

## Required Fields

Community records require:

- `name`
- `country`
- `language`
- `focus`
- `links`
- `description`

Event records require:

- `name`
- `country`
- `schedule`
- `links`
- `description`

Event records may also include:

- `frequency`
- `host_community`
- `city`

Each record must include at least one public URL in `links`.

## Validation Rules

Submissions may be rejected if they:

- Duplicate an existing URL inside `links` across communities or events
- Use shortened URLs
- Omit a useful description
- Are not relevant to tech in the Caribbean
- Don't include at least one public link

## Country Values

Use one of the supported directory scopes:

- Regional
- Antigua and Barbuda
- Anguilla
- Aruba
- Bahamas
- Barbados
- Belize
- Bonaire
- British Virgin Islands
- Cayman Islands
- Cuba
- Curacao
- Dominica
- Dominican Republic
- Grenada
- Guadeloupe
- Guyana
- Haiti
- Jamaica
- Martinique
- Montserrat
- Puerto Rico
- Saba
- Saint Barthelemy
- Saint Eustatius
- Saint Kitts and Nevis
- Saint Lucia
- Saint Martin
- Saint Vincent and the Grenadines
- Sint Maarten
- Suriname
- Trinidad and Tobago
- Turks and Caicos Islands
- U.S. Virgin Islands

## Quality Bar

- Prefer direct, public join URLs
- Add multiple links when they help, for example `Website`, `Discord`, `LinkedIn`, `Instagram`, `X`, `Meetup`, or `WhatsApp`
- Avoid private or permission-sensitive invite links unless they are intentionally public
- Keep descriptions short and factual
- Use `focus` as a short list of topics or audiences
- Include `member_count` only when reasonably current

## Maintainer Direction

Treat this repository as a dataset first, README second. Manual edits to generated markdown files are not the preferred contribution path.

If a contributor updates `data/communities.json` or `data/events.json`, they should also run `npm run validate` and `npm run generate` before opening a pull request.

If you are contributing from Windows, this repository uses `.gitattributes` to keep generated files and documentation on consistent line endings. If Git shows many files as modified after generation, run `git add --renormalize .` once and review the diff before committing.
