// English copy. Every other language mirrors this shape (see pt-BR.js).
export default {
  appName: 'Arch Guesser',
  nextBuilding: 'Another building',

  language: {
    label: 'Language',
    switchTo: 'Português (Brasil)',
    short: 'PT',
  },

  years: { bce: 'BCE', now: 'now' },

  eras: {
    CLASSICAL: 'Classical Antiquity',
    BYZANTINE: 'Byzantine',
    ISLAMIC: 'Islamic & Moorish',
    MEDIEVAL: 'Romanesque & Gothic',
    OTTOMAN: 'Ottoman',
    MANUELINE: 'Manueline',
    RENAISSANCE: 'Renaissance',
    MANNERISM: 'Mannerism',
    BAROQUE: 'Baroque',
    NEOCLASSICAL: 'Neoclassical',
    HISTORICISM: 'Historicism & Gothic Revival',
    ART_NOUVEAU: 'Art Nouveau',
    ART_DECO: 'Art Deco',
    MODERNISM: 'Modernism',
    BRUTALISM: 'Brutalism',
    POSTMODERNISM: 'Postmodernism',
    CONTEMPORARY: 'Contemporary',
  },

  credits: {
    images: 'Images from',
    commons: 'Wikimedia Commons',
    facts: ', credited on each reveal. Facts adapted from',
    wikipedia: 'Wikipedia',
    licence: 'CC BY-SA 4.0',
  },

  board: {
    label: 'Drawings',
    tabsLabel: 'Drawing sheets',
    loading: 'Pulling drawings from the archive…',
    errorTitle: 'The drawing archive didn’t answer',
    errorBody: 'The drawings are out of reach for a moment. Try again shortly.',
    retry: 'Try again',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomHint: 'Move to explore · Esc to exit',
    views: { EXTERIOR: 'Exterior', INTERIOR: 'Interior' },
    photoTitles: { EXTERIOR: 'Photograph · Exterior', INTERIOR: 'Photograph · Interior' },
    imagesUnavailable: 'The images for this building are out of reach right now.',
  },

  hints: {
    heading: 'Hints',
    empty: 'Each hint gives a little more away. Take them whenever you like.',
    show: (n, total) => `Show hint ${n} of ${total}`,
    allShown: 'All hints shown',
    label: (n) => `Hint ${n}`,
  },

  guess: {
    heading: 'Your guess',
    fields: {
      name: 'Building',
      architect: 'Architect',
      country: 'Country',
      era: 'Era',
    },
    placeholders: {
      name: 'e.g. Villa Rotonda',
      architect: 'Any one architect',
      country: 'Start typing a country',
      era: 'Choose an era',
    },
    erasUnavailable: 'Eras couldn’t be loaded',
    wrong: 'Not this one. Edit it, or take a hint.',
    correct: 'Correct',
    revealedValue: 'Answer',
    submit: 'Check guess',
    giveUp: 'Reveal answer',
    next: 'Next building',
    nothingToCheck: 'Fill in at least one field to check it.',
    solved: 'All four right. Nicely read.',
    gaveUp: 'Here’s the answer. The fields you got are ticked.',
    result: (correct, wrong) =>
      [correct && `${correct} correct`, wrong && `${wrong} not quite`].filter(Boolean).join(', ') + '.',
    countrySuggestions: 'Country suggestions',
  },

  summary: {
    label: 'About this building',
    showDrawings: 'Back to drawings',
    showSummary: 'Read about it',
    facts: {
      location: 'Location',
      completed: 'Completed',
      era: 'Era',
      style: 'Style',
      underConstruction: 'Still under construction',
    },
    recap: 'Your guess',
    recapGot: 'got it',
    recapMissed: 'revealed',
    keyFeatures: 'Key features',
    funFacts: 'Worth knowing',
    photos: 'Photographs',
    architects: (n) => (n === 1 ? 'The architect' : 'The architects'),
  },

  titleBlock: {
    project: 'Project',
    architect: 'Architect',
    drawing: 'Drawing',
    sheet: 'Sheet',
    unidentified: 'Unidentified',
    unknown: '—',
    sheetOf: (n, total) => `${n} of ${total}`,
  },
}
