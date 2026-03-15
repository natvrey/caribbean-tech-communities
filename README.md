# Caribbean Tech Communities

A directory of tech communities across sovereign Caribbean states, mainland Caribbean countries, and non-sovereign Caribbean dependencies and territories, focused on strengthening visibility and communication across the region's tech ecosystem.

This repository is managed as a dataset first and a directory second:

`data/communities.json` -> generated pages -> `README.md` and `countries/*.md`

Platforms can include:

- Websites
- WhatsApp
- Discord
- Slack
- Telegram
- Meetup
- Forums
- Mailing lists
- Social media sites such as Instagram, LinkedIn, X, and Facebook

## Directory

Browse communities by sovereignty status and constitutional relationship. Each location page lists the community name, the platforms it uses, a short description, and direct links to join or learn more.
CARICOM and CSME status labels below are based on official CARICOM and CSME sources.

### Regional

Communities that operate across multiple Caribbean countries or the wider Caribbean diaspora.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Regional | [countries/regional.md](countries/regional.md) | N/A | N/A |

### Sovereign Caribbean States

Independent island states in the Caribbean basin.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Antigua and Barbuda | [countries/antigua-and-barbuda.md](countries/antigua-and-barbuda.md) | Member State | Participant |
| Bahamas | [countries/bahamas.md](countries/bahamas.md) | Member State | No |
| Barbados | [countries/barbados.md](countries/barbados.md) | Member State | Participant |
| Cuba | [countries/cuba.md](countries/cuba.md) | No | No |
| Dominica | [countries/dominica.md](countries/dominica.md) | Member State | Participant |
| Dominican Republic | [countries/dominican-republic.md](countries/dominican-republic.md) | No | No |
| Grenada | [countries/grenada.md](countries/grenada.md) | Member State | Participant |
| Haiti | [countries/haiti.md](countries/haiti.md) | Member State | Signed on, limited participation |
| Jamaica | [countries/jamaica.md](countries/jamaica.md) | Member State | Participant |
| Saint Kitts and Nevis | [countries/saint-kitts-and-nevis.md](countries/saint-kitts-and-nevis.md) | Member State | Participant |
| Saint Lucia | [countries/saint-lucia.md](countries/saint-lucia.md) | Member State | Participant |
| Saint Vincent and the Grenadines | [countries/saint-vincent-and-the-grenadines.md](countries/saint-vincent-and-the-grenadines.md) | Member State | Participant |
| Trinidad and Tobago | [countries/trinidad-and-tobago.md](countries/trinidad-and-tobago.md) | Member State | Participant |

### Mainland Caribbean States

Mainland countries commonly included in the Caribbean regional sphere.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Belize | [countries/belize.md](countries/belize.md) | Member State | Participant |
| Guyana | [countries/guyana.md](countries/guyana.md) | Member State | Participant |
| Suriname | [countries/suriname.md](countries/suriname.md) | Member State | Participant |

### United Kingdom Overseas Territories

Non-sovereign Caribbean territories under United Kingdom sovereignty.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Anguilla | [countries/anguilla.md](countries/anguilla.md) | Associate Member | No |
| British Virgin Islands | [countries/british-virgin-islands.md](countries/british-virgin-islands.md) | Associate Member | No |
| Cayman Islands | [countries/cayman-islands.md](countries/cayman-islands.md) | Associate Member | No |
| Montserrat | [countries/montserrat.md](countries/montserrat.md) | Member State | Participates in elements |
| Turks and Caicos Islands | [countries/turks-and-caicos-islands.md](countries/turks-and-caicos-islands.md) | Associate Member | No |

### United States Territories

Non-sovereign Caribbean territories under United States sovereignty.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Puerto Rico | [countries/puerto-rico.md](countries/puerto-rico.md) | No | No |
| U.S. Virgin Islands | [countries/us-virgin-islands.md](countries/us-virgin-islands.md) | No | No |

### French Overseas Departments

French overseas departments that are fully part of the French Republic and the European Union.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Guadeloupe | [countries/guadeloupe.md](countries/guadeloupe.md) | No | No |
| Martinique | [countries/martinique.md](countries/martinique.md) | No | No |

### French Overseas Collectivities

French Caribbean collectivities with a different constitutional status from the overseas departments.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Saint Barth | [countries/saint-barth.md](countries/saint-barth.md) | No | No |
| Saint Martin | [countries/saint-martin.md](countries/saint-martin.md) | No | No |

### Autonomous Countries Within the Kingdom of the Netherlands

Self-governing Caribbean countries within the Kingdom of the Netherlands.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Aruba | [countries/aruba.md](countries/aruba.md) | No | No |
| Curacao | [countries/curacao.md](countries/curacao.md) | Associate Member | No |
| Sint Maarten | [countries/sint-maarten.md](countries/sint-maarten.md) | No | No |

### Caribbean Municipalities of the Netherlands

Caribbean special municipalities that are directly administered as part of the Netherlands.

| Country | Communities | CARICOM | CSME |
| --- | --- | --- | --- |
| Bonaire | [countries/bonaire.md](countries/bonaire.md) | No | No |
| Saba | [countries/saba.md](countries/saba.md) | No | No |
| Saint Eustatius | [countries/saint-eustatius.md](countries/saint-eustatius.md) | No | No |

## References

- Country sovereignty and constitutional-status grouping: [Caribbean Atlas, The Caribbean Islands](http://www.caribbean-atlas.com/en/the-caribbean-in-brief/the-caribbean-islands/).
- CARICOM member state and associate member status: [CARICOM Member States and Associate Members](https://caricom.org/member-states-and-associate-members/).
- CSME participation status: [CARICOM Single Market and Economy](https://caricom.org/projects/caricom-single-market-and-economy/) and [CSME About Us](https://csme.me/about-us/).

## Contributing

To add a community:

1. Edit `data/communities.json`
2. Run `npm run validate`
3. Run `npm run generate`
4. Submit a pull request

Don't want to open a pull request? Use the [community submission form](https://github.com/natvrey/caribbean-tech-communities/issues/new?template=community-submission.yml).

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
- `description`

## Automation

GitHub Actions validate the dataset and ensure generated pages stay up to date. This keeps formatting consistent even as the directory grows.
