// All user-facing copy lives here so the UI can be translated later.
export const strings = {
  appName: 'Arch Guesser',
  nextBuilding: 'Another building',

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
    missingDrawing: 'Drawing not in the archive yet',
  },

  hints: {
    heading: 'Hints',
    empty: 'Each hint gives a little more away. Take them whenever you like.',
    show: (n, total) => `Show hint ${n} of ${total}`,
    allShown: 'All hints shown',
    label: (n) => `Hint ${n}`,
    photo: 'Photo',
    fact: 'Fact',
    missingPhoto: 'Photo not in the archive yet',
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
