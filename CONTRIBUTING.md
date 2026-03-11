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

If you do not want to open a pull request, submit a community through the issue template.

## Record Schema

Each object in `data/communities.json` should follow this shape:

```json
{
  "name": "Kingston Tech Community",
  "country": "Jamaica",
  "city": "Kingston",
  "platform": "Slack",
  "language": "English",
  "focus": ["software engineering", "startups"],
  "member_count": 250,
  "join_link": "https://join.slack.com/example",
  "description": "Community for Jamaican developers, founders, and students."
}
```

## Required Fields

- `name`
- `country`
- `platform`
- `language`
- `focus`
- `join_link`
- `description`

## Validation Rules

Submissions may be rejected if they:

- Duplicate an existing `join_link`
- Use an unsupported or unknown platform
- Use shortened URLs
- Omit a useful description
- Are not relevant to tech in the Caribbean

## Approved Platforms

- WhatsApp
- Discord
- Slack
- Telegram
- Facebook
- Meetup
- Forum
- Mailing List
- LinkedIn
- Other

## Country Values

Use one of the supported directory scopes:

- Regional
- Antigua and Barbuda
- Bahamas
- Barbados
- Belize
- Cuba
- Dominica
- Dominican Republic
- Grenada
- Guyana
- Haiti
- Jamaica
- Saint Kitts and Nevis
- Saint Lucia
- Saint Vincent and the Grenadines
- Suriname
- Trinidad and Tobago

## Quality Bar

- Prefer direct, public join URLs
- Avoid private or permission-sensitive invite links unless they are intentionally public
- Keep descriptions short and factual
- Use `focus` as a short list of topics or audiences
- Include `member_count` only when reasonably current

## Maintainer Direction

Treat this repository as a dataset first, README second. Manual edits to generated markdown files are not the preferred contribution path.
