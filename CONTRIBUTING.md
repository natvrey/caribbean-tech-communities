# Contributing

## Workflow

This repository uses a structured dataset as the source of truth.

To contribute:

1. Edit `data/communities.json`
2. Add or update one or more community records
3. Run `npm run validate`
4. Run `npm run generate`
5. Commit the updated data and generated markdown files
6. Open a pull request

If you do not want to open a pull request, use the [community submission form](https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml) to submit a community.

## Record Schema

Each object in `data/communities.json` should follow this shape:

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

## Required Fields

- `name`
- `country`
- `language`
- `focus`
- `links`
- `description`

Each record must include at least one public URL in `links`.

## Validation Rules

Submissions may be rejected if they:

- Duplicate an existing URL inside `links`
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
- Saint Barth
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

If a contributor updates `data/communities.json`, they should also run `npm run validate` and `npm run generate` before opening a pull request.

If you are contributing from Windows, this repository uses `.gitattributes` to keep generated files and documentation on consistent line endings. If Git shows many files as modified after generation, run `git add --renormalize .` once and review the diff before committing.
