const DIRECTORY_SECTIONS = [
  {
    title: "Regional",
    description: "Communities that operate across multiple Caribbean countries or the wider Caribbean diaspora.",
    countries: ["Regional"]
  },
  {
    title: "Sovereign Caribbean States",
    description: "Independent island states in the Caribbean basin.",
    countries: [
      "Antigua and Barbuda",
      "Bahamas",
      "Barbados",
      "Cuba",
      "Dominica",
      "Dominican Republic",
      "Grenada",
      "Haiti",
      "Jamaica",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Trinidad and Tobago"
    ]
  },
  {
    title: "Mainland Caribbean States",
    description: "Mainland countries commonly included in the Caribbean regional sphere.",
    countries: ["Belize", "Guyana", "Suriname"]
  },
  {
    title: "United Kingdom Overseas Territories",
    description: "Non-sovereign Caribbean territories under United Kingdom sovereignty.",
    countries: [
      "Anguilla",
      "British Virgin Islands",
      "Cayman Islands",
      "Montserrat",
      "Turks and Caicos Islands"
    ]
  },
  {
    title: "United States Territories",
    description: "Non-sovereign Caribbean territories under United States sovereignty.",
    countries: ["Puerto Rico", "U.S. Virgin Islands"]
  },
  {
    title: "French Overseas Departments",
    description: "French overseas departments that are fully part of the French Republic and the European Union.",
    countries: ["Guadeloupe", "Martinique"]
  },
  {
    title: "French Overseas Collectivities",
    description: "French Caribbean collectivities with a different constitutional status from the overseas departments.",
    countries: ["Saint Barthélemy", "Saint Martin"]
  },
  {
    title: "Autonomous Countries Within the Kingdom of the Netherlands",
    description: "Self-governing Caribbean countries within the Kingdom of the Netherlands.",
    countries: ["Aruba", "Curaçao", "Sint Maarten"]
  },
  {
    title: "Caribbean Municipalities of the Netherlands",
    description: "Caribbean special municipalities that are directly administered as part of the Netherlands.",
    countries: ["Bonaire", "Saba", "Saint Eustatius"]
  }
];

const REGIONAL_STATUS = {
  Regional: {
    caricom: "N/A",
    csme: "N/A"
  },
  "Antigua and Barbuda": {
    caricom: "Member State",
    csme: "Participant"
  },
  Anguilla: {
    caricom: "Associate Member",
    csme: "No"
  },
  Aruba: {
    caricom: "No",
    csme: "No"
  },
  Bahamas: {
    caricom: "Member State",
    csme: "No"
  },
  Barbados: {
    caricom: "Member State",
    csme: "Participant"
  },
  Belize: {
    caricom: "Member State",
    csme: "Participant"
  },
  Bonaire: {
    caricom: "No",
    csme: "No"
  },
  "British Virgin Islands": {
    caricom: "Associate Member",
    csme: "No"
  },
  "Cayman Islands": {
    caricom: "Associate Member",
    csme: "No"
  },
  Cuba: {
    caricom: "No",
    csme: "No"
  },
  "Curaçao": {
    caricom: "Associate Member",
    csme: "No"
  },
  Dominica: {
    caricom: "Member State",
    csme: "Participant"
  },
  "Dominican Republic": {
    caricom: "No",
    csme: "No"
  },
  Grenada: {
    caricom: "Member State",
    csme: "Participant"
  },
  Guadeloupe: {
    caricom: "No",
    csme: "No"
  },
  Guyana: {
    caricom: "Member State",
    csme: "Participant"
  },
  Haiti: {
    caricom: "Member State",
    csme: "Signed on, limited participation"
  },
  Jamaica: {
    caricom: "Member State",
    csme: "Participant"
  },
  Martinique: {
    caricom: "No",
    csme: "No"
  },
  Montserrat: {
    caricom: "Member State",
    csme: "Participates in elements"
  },
  "Puerto Rico": {
    caricom: "No",
    csme: "No"
  },
  Saba: {
    caricom: "No",
    csme: "No"
  },
  "Saint Barthélemy": {
    caricom: "No",
    csme: "No"
  },
  "Saint Eustatius": {
    caricom: "No",
    csme: "No"
  },
  "Saint Kitts and Nevis": {
    caricom: "Member State",
    csme: "Participant"
  },
  "Saint Lucia": {
    caricom: "Member State",
    csme: "Participant"
  },
  "Saint Martin": {
    caricom: "No",
    csme: "No"
  },
  "Saint Vincent and the Grenadines": {
    caricom: "Member State",
    csme: "Participant"
  },
  "Sint Maarten": {
    caricom: "No",
    csme: "No"
  },
  Suriname: {
    caricom: "Member State",
    csme: "Participant"
  },
  "Trinidad and Tobago": {
    caricom: "Member State",
    csme: "Participant"
  },
  "Turks and Caicos Islands": {
    caricom: "Associate Member",
    csme: "No"
  },
  "U.S. Virgin Islands": {
    caricom: "No",
    csme: "No"
  }
};

const COUNTRIES = DIRECTORY_SECTIONS.flatMap((section) => section.countries);

module.exports = {
  COUNTRIES,
  DIRECTORY_SECTIONS,
  REGIONAL_STATUS
};
