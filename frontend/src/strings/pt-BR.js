// Português (Brasil). Mirrors the shape of en.js.
export default {
  appName: 'Arch Guesser',
  nextBuilding: 'Outra obra',

  language: {
    label: 'Idioma',
    switchTo: 'English',
    short: 'EN',
  },

  years: { bce: 'a.C.', now: 'hoje' },

  eras: {
    CLASSICAL: 'Antiguidade Clássica',
    BYZANTINE: 'Bizantino',
    MEDIEVAL: 'Românico e Gótico',
    OTTOMAN: 'Otomano',
    MANUELINE: 'Manuelino',
    RENAISSANCE: 'Renascimento',
    BAROQUE: 'Barroco',
    NEOCLASSICAL: 'Neoclássico',
    HISTORICISM: 'Historicismo e Neogótico',
    ART_NOUVEAU: 'Art Nouveau',
    ART_DECO: 'Art Déco',
    MODERNISM: 'Modernismo',
    BRUTALISM: 'Brutalismo',
    POSTMODERNISM: 'Pós-modernismo',
    CONTEMPORARY: 'Contemporâneo',
  },

  credits: {
    images: 'Imagens da',
    commons: 'Wikimedia Commons',
    facts: ', com crédito em cada revelação. Informações adaptadas da',
    wikipedia: 'Wikipédia',
    licence: 'CC BY-SA 4.0',
  },

  board: {
    label: 'Desenhos',
    tabsLabel: 'Pranchas de desenho',
    loading: 'Buscando desenhos no arquivo…',
    errorTitle: 'O arquivo de desenhos não respondeu',
    errorBody: 'Os desenhos estão fora de alcance por um momento. Tente de novo em instantes.',
    retry: 'Tentar de novo',
    zoomIn: 'Aproximar',
    zoomOut: 'Afastar',
    zoomHint: 'Mova para explorar · Esc para sair',
    views: { EXTERIOR: 'Exterior', INTERIOR: 'Interior' },
    photoTitles: { EXTERIOR: 'Fotografia · Exterior', INTERIOR: 'Fotografia · Interior' },
    imagesUnavailable: 'As imagens desta obra estão indisponíveis no momento.',
  },

  hints: {
    heading: 'Dicas',
    empty: 'Cada dica revela um pouco mais. Use quando quiser.',
    show: (n, total) => `Mostrar dica ${n} de ${total}`,
    allShown: 'Todas as dicas reveladas',
    label: (n) => `Dica ${n}`,
  },

  guess: {
    heading: 'Seu palpite',
    fields: {
      name: 'Obra',
      architect: 'Arquiteto',
      country: 'País',
      era: 'Época',
    },
    placeholders: {
      name: 'ex.: Villa Rotonda',
      architect: 'Qualquer um dos arquitetos',
      country: 'Comece a digitar um país',
      era: 'Escolha uma época',
    },
    erasUnavailable: 'Não foi possível carregar as épocas',
    wrong: 'Não é esta. Edite ou peça uma dica.',
    correct: 'Correto',
    revealedValue: 'Resposta',
    submit: 'Conferir palpite',
    giveUp: 'Revelar resposta',
    next: 'Próxima obra',
    nothingToCheck: 'Preencha pelo menos um campo para conferir.',
    solved: 'Os quatro certos. Bela leitura.',
    gaveUp: 'Aqui está a resposta. Os campos que você acertou estão marcados.',
    result: (correct, wrong) =>
      [
        correct && `${correct} ${correct === 1 ? 'certo' : 'certos'}`,
        wrong && `${wrong} ${wrong === 1 ? 'errado' : 'errados'}`,
      ]
        .filter(Boolean)
        .join(', ') + '.',
    countrySuggestions: 'Sugestões de país',
  },

  summary: {
    label: 'Sobre esta obra',
    showDrawings: 'Voltar aos desenhos',
    showSummary: 'Ler sobre a obra',
    facts: {
      location: 'Local',
      completed: 'Concluída',
      era: 'Época',
      style: 'Estilo',
      underConstruction: 'Ainda em construção',
    },
    recap: 'Seu palpite',
    recapGot: 'acertou',
    recapMissed: 'revelado',
    keyFeatures: 'Características principais',
    funFacts: 'Vale saber',
    photos: 'Fotografias',
    architects: (n) => (n === 1 ? 'O arquiteto' : 'Os arquitetos'),
  },

  titleBlock: {
    project: 'Projeto',
    architect: 'Arquiteto',
    drawing: 'Desenho',
    sheet: 'Prancha',
    unidentified: 'Não identificado',
    unknown: '—',
    sheetOf: (n, total) => `${n} de ${total}`,
  },
}
