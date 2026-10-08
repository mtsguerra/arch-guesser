// Fixtures shaped like the API response (trimmed to what game logic reads).
export const villaSavoye = {
  id: 'villa-savoye',
  name: 'Villa Savoye',
  aliases: ['Savoye House', 'Les Heures Claires'],
  architects: [
    { name: 'Le Corbusier', aliases: ['Corbusier', 'Charles-Édouard Jeanneret'] },
    { name: 'Pierre Jeanneret', aliases: [] },
  ],
  location: { city: 'Poissy', country: 'France', countryCode: 'FR' },
  era: 'MODERNISM',
  drawings: [],
  hints: [{ order: 1 }, { order: 2 }, { order: 3 }],
}

export const santIvo = {
  id: 'sant-ivo-alla-sapienza',
  name: "Sant'Ivo alla Sapienza",
  aliases: ['Sant Ivo', 'Saint Ivo'],
  architects: [{ name: 'Francesco Borromini', aliases: ['Borromini', 'Francesco Castelli'] }],
  location: { city: 'Rome', country: 'Italy', countryCode: 'IT' },
  era: 'BAROQUE',
  drawings: [],
  hints: [{ order: 1 }, { order: 2 }],
}

export const salk = {
  id: 'salk-institute',
  name: 'Salk Institute for Biological Studies',
  aliases: ['Salk Institute', 'The Salk'],
  architects: [{ name: 'Louis Kahn', aliases: ['Louis I. Kahn', 'Kahn'] }],
  location: { city: 'La Jolla', country: 'United States', countryCode: 'US' },
  era: 'BRUTALISM',
  drawings: [],
  hints: [{ order: 1 }, { order: 2 }],
}
