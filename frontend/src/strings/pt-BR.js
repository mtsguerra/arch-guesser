// Português (Brasil). Mirrors the shape of en.js.
export default {
  appName: 'Arch Guesser',
  nextBuilding: 'Outra obra',
  tagline: 'Descubra o prédio pelos desenhos',

  home: {
    heading: 'Escolha um modo',
    soon: 'Em breve',
    guesser: {
      title: 'Adivinhar',
      text: 'Jogue quantos edifícios quiser.',
      normal: { title: 'Normal', text: 'Um edifício aleatório de toda a coleção.' },
      custom: { title: 'Personalizado', text: 'Escolha arquitetos, épocas e países (mínimo de 10 edifícios).' },
    },
  },

  menu: 'Menu',

  daily: {
    title: (n) => `Diário #${n}`,
    play: 'Jogue o edifício de hoje',
    done: (time) => `Concluído · próximo em ${time}`,
    nextIn: (time) => `Próximo diário em ${time}`,
    share: 'Copiar resultado',
    copied: 'Copiado',
    shareTitle: 'Arch Guesser Diário',
    playGuesser: 'Jogar Adivinhar',
  },

  language: {
    label: 'Idioma',
    switchTo: 'English',
  },

  years: { bce: 'a.C.' },

  eras: {
    ANCIENT_EGYPTIAN: 'Egito Antigo',
    PRE_COLUMBIAN: 'Pré-Colombiano',
    CLASSICAL: 'Antiguidade Clássica',
    BYZANTINE: 'Bizantino',
    INDIC: 'Indiano e do Sudeste Asiático',
    EAST_ASIAN: 'Tradicional do Leste Asiático',
    ISLAMIC: 'Islâmico, Mourisco e Mogol',
    MEDIEVAL: 'Românico e Gótico',
    RUSSIAN: 'Ortodoxo Russo',
    OTTOMAN: 'Otomano',
    MANUELINE: 'Manuelino',
    RENAISSANCE: 'Renascimento',
    MANNERISM: 'Maneirismo',
    BAROQUE: 'Barroco',
    NEOCLASSICAL: 'Neoclássico',
    INDUSTRIAL: 'Industrial e do Ferro',
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
    hintBackground: 'Fundo das dicas: render Skywalk de Fons Heijnsbroek',
    hintBackgroundLicence: 'CC BY 4.0',
  },

  board: {
    label: 'Desenhos',
    tabsLabel: 'Pranchas de desenho',
    loading: 'Buscando desenhos no arquivo…',
    plotting: 'Traçando a folha…',
    carousel: 'carrossel',
    previous: 'Imagem anterior',
    next: 'Próxima imagem',
    describes: 'O que se vê',
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
    locked: 'Bloqueada',
    label: (n) => `Dica ${n}`,
  },

  reveal: {
    building: 'Erguendo a resposta…',
    skip: 'Pular',
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
    eraSuggestions: 'Sugestões de período',
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
    more: {
      title: 'Continue explorando',
      text: 'Leia o artigo completo na Wikipédia para ver mais história, plantas e fotografias desta obra.',
      link: 'Saiba mais na Wikipédia',
    },
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
