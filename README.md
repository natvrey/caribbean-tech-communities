# Caribbean Tech Communities

A directory of tech communities across the sovereign Caribbean states, plus Belize, Guyana, and Suriname, focused on strengthening visibility and support for the tech industry in these countries.

This repository is managed as a dataset first and a directory second:

`data/communities.json` -> generated pages -> `README.md` and `countries/*.md`

Platforms can include:

- WhatsApp
- Discord
- Slack
- Telegram
- Facebook
- Meetup
- Forums
- Mailing lists

## Directory

| Country | Communities |
| --- | --- |
| Regional | [countries/regional.md](countries/regional.md) |
| Antigua and Barbuda | [countries/antigua-and-barbuda.md](countries/antigua-and-barbuda.md) |
| Bahamas | [countries/bahamas.md](countries/bahamas.md) |
| Barbados | [countries/barbados.md](countries/barbados.md) |
| Belize | [countries/belize.md](countries/belize.md) |
| Cuba | [countries/cuba.md](countries/cuba.md) |
| Dominica | [countries/dominica.md](countries/dominica.md) |
| Dominican Republic | [countries/dominican-republic.md](countries/dominican-republic.md) |
| Grenada | [countries/grenada.md](countries/grenada.md) |
| Guyana | [countries/guyana.md](countries/guyana.md) |
| Haiti | [countries/haiti.md](countries/haiti.md) |
| Jamaica | [countries/jamaica.md](countries/jamaica.md) |
| Saint Kitts and Nevis | [countries/saint-kitts-and-nevis.md](countries/saint-kitts-and-nevis.md) |
| Saint Lucia | [countries/saint-lucia.md](countries/saint-lucia.md) |
| Saint Vincent and the Grenadines | [countries/saint-vincent-and-the-grenadines.md](countries/saint-vincent-and-the-grenadines.md) |
| Suriname | [countries/suriname.md](countries/suriname.md) |
| Trinidad and Tobago | [countries/trinidad-and-tobago.md](countries/trinidad-and-tobago.md) |

## Contributing

To add a community:

1. Edit `data/communities.json`
2. Run `npm run generate`
3. Submit a pull request

You can also submit a community through GitHub Issues.

See `CONTRIBUTING.md`.

## Data Model

Each community record should use these fields:

- `name`
- `country`
- `city` (optional)
- `language`
- `focus`
- `member_count` (optional)
- `links`
- `socials` (optional)
- `description`

## Automation

GitHub Actions validate the dataset and ensure generated pages stay up to date. This keeps formatting consistent even as the directory grows.
