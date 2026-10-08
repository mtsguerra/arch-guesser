// All user-facing copy lives here so the UI can be translated later.
export const strings = {
  appName: 'Arch Guesser',
  nextBuilding: 'Another building',

  board: {
    label: 'Drawings',
    tabsLabel: 'Drawing sheets',
    loading: 'Pulling drawings from the archive…',
    errorTitle: 'The drawing archive didn’t answer',
    errorBody: 'Check that the backend is running on port 8080, then try again.',
    retry: 'Try again',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomHint: 'Move to explore · Esc to exit',
    missingDrawing: 'Drawing not in the archive yet',
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
