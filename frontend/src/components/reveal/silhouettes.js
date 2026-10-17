// Front elevations for the reveal, one per family of styles. Each is drawn the way the
// building would be built; `delay` and `duration` are seconds from the start, and every
// stroke must finish before the name is lettered in (about 2.3 s). Viewbox is 400x244.
const GROUND = { d: 'M24 214H376', delay: 0.15, duration: 0.7, tone: 'ground' }
const dimension = (from, to) => ({
  d: `M${from} 230H${to}M${from} 224V236M${to} 224V236`,
  delay: 0.3,
  duration: 1.2,
  tone: 'dimension',
})

// A civic front: steps, columns going up, entablature, pediment.
const COLUMNS = Array.from({ length: 6 }, (_, i) => 92 + i * 43.2)
const temple = {
  mass: 'M70 98H330V190H70Z',
  strokes: [
    GROUND,
    { d: 'M48 214V202H352V214', delay: 0.4, duration: 0.6 },
    { d: 'M62 202V190H338V202', delay: 0.6, duration: 0.6 },
    ...COLUMNS.map((x, i) => ({
      d: `M${x - 6} 190V112H${x + 6}V190`,
      delay: 0.9 + i * 0.13,
      duration: 0.55,
      tone: 'column',
    })),
    { d: 'M70 112H330V98H70Z', delay: 1.65, duration: 0.6 },
    { d: 'M70 98L200 42L330 98', delay: 1.9, duration: 0.7 },
    { d: 'M178 84H222L200 62Z', delay: 2.3, duration: 0.5, tone: 'accent' },
    dimension(24, 376),
  ],
}

// A smooth-sided pyramid, laid course by course from the base up.
const COURSES = [176, 138, 100, 70]
const pyramid = {
  mass: 'M60 214L200 40L340 214Z',
  strokes: [
    GROUND,
    { d: 'M60 214L200 40L340 214', delay: 0.4, duration: 1.1 },
    { d: 'M200 40L248 214', delay: 1.2, duration: 0.7, tone: 'column' },
    ...COURSES.map((y, i) => {
      const inset = ((214 - y) / 174) * 140
      return { d: `M${60 + inset} ${y}H${340 - inset}`, delay: 0.9 + i * 0.25, duration: 0.5 }
    }),
    { d: 'M196 44H204', delay: 2.0, duration: 0.3, tone: 'accent' },
    dimension(60, 340),
  ],
}

// A Gothic west front: twin towers and spires, pointed portal, rose window.
const gothic = {
  mass: 'M110 214V80L130 24L150 80V120L200 70L250 120V80L270 24L290 80V214Z',
  strokes: [
    GROUND,
    { d: 'M110 214V80H150V214', delay: 0.4, duration: 0.7 },
    { d: 'M250 214V80H290V214', delay: 0.5, duration: 0.7 },
    { d: 'M150 120L200 70L250 120', delay: 1.0, duration: 0.6 },
    { d: 'M184 214V170Q184 150 200 138Q216 150 216 170V214', delay: 1.2, duration: 0.7, tone: 'column' },
    { d: 'M190 106a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', delay: 1.5, duration: 0.5, tone: 'column' },
    { d: 'M124 160V130Q130 118 136 130V160', delay: 1.4, duration: 0.4 },
    { d: 'M264 160V130Q270 118 276 130V160', delay: 1.5, duration: 0.4 },
    { d: 'M110 80L130 24L150 80', delay: 1.7, duration: 0.6 },
    { d: 'M250 80L270 24L290 80', delay: 1.8, duration: 0.6 },
    { d: 'M130 24V12M126 17H134', delay: 2.2, duration: 0.3, tone: 'accent' },
    { d: 'M270 24V12M266 17H274', delay: 2.25, duration: 0.3, tone: 'accent' },
    dimension(110, 290),
  ],
}

// Modernism: shell vaults like sails on a broad podium (the Sydney Opera House).
const sail = (x0, x1, tipX, tipY, base) => {
  const h = base - tipY
  return `M${x0} ${base}C${x0} ${base - h * 0.55} ${tipX - 6} ${tipY + h * 0.2} ${tipX} ${tipY}C${tipX + (x1 - tipX) * 0.25} ${tipY + h * 0.45} ${x1 - 8} ${base - h * 0.2} ${x1} ${base}Z`
}
const SHELLS = [
  [60, 150, 72, 118],
  [100, 200, 110, 84],
  [140, 250, 150, 50],
  [220, 300, 240, 108],
  [255, 330, 270, 86],
  [290, 355, 305, 134],
].map(([x0, x1, tx, ty]) => ({ x0, x1, tx, ty, d: sail(x0, x1, tx, ty, 190) }))
const sails = {
  mass: `M30 214V190H370V214Z ${SHELLS.map((shell) => shell.d).join(' ')}`,
  strokes: [
    GROUND,
    { d: 'M30 214V190H370V214', delay: 0.3, duration: 0.6 },
    { d: 'M30 202H370', delay: 0.5, duration: 0.6 },
    ...SHELLS.map((shell, i) => ({ d: shell.d, delay: 0.8 + i * 0.22, duration: 0.6 })),
    ...SHELLS.map((shell, i) => ({
      d: `M${shell.tx} ${shell.ty}L${(shell.x0 + shell.x1) / 2} 190`,
      delay: 1.1 + i * 0.22,
      duration: 0.4,
      tone: 'column',
    })),
    dimension(30, 370),
  ],
}

// Contemporary: a twisting tower, each floor plate turned a little from the one below.
const PLATES = Array.from({ length: 9 }, (_, i) => {
  const cx = 200 + 22 * Math.sin(i * 0.75)
  const w = 52 - i * 2.5
  return { y: 192 - i * 16, l: +(cx - w).toFixed(1), r: +(cx + w).toFixed(1) }
})
const top = PLATES.at(-1)
const edge = (side) => `M${PLATES.map((plate) => `${plate[side]} ${plate.y}`).join('L')}`
const twist = {
  mass: `${edge('l')}L${[...PLATES].reverse().map((plate) => `${plate.r} ${plate.y}`).join('L')}Z`,
  strokes: [
    GROUND,
    { d: 'M110 214V192H290V214', delay: 0.4, duration: 0.5 },
    ...PLATES.map((plate, i) => ({ d: `M${plate.l} ${plate.y}H${plate.r}`, delay: 0.7 + i * 0.12, duration: 0.3 })),
    { d: edge('l'), delay: 1.0, duration: 1.1, tone: 'column' },
    { d: edge('r'), delay: 1.1, duration: 1.1, tone: 'column' },
    { d: `M${top.l} ${top.y}L${(top.l + top.r) / 2} 30L${top.r} ${top.y}`, delay: 2.0, duration: 0.5, tone: 'accent' },
    dimension(110, 290),
  ],
}

// Pointed or round-headed opening, `w` wide, from `bottom` up to the springing at `top`.
const arch = (c, w, bottom, top, rise = w) =>
  `M${c - w / 2} ${bottom}V${top}Q${c - w / 2} ${top - rise} ${c} ${top - rise}Q${c + w / 2} ${top - rise} ${c + w / 2} ${top}V${bottom}`
const spread = (xs, make, start, step, duration, tone) =>
  xs.map((x, i) => ({ d: make(x), delay: start + i * step, duration, tone }))

// Neo-Gothic: a steep-roofed hall with lancets and one asymmetric tower.
const neoGothic = {
  mass: 'M80 214V130L190 76L300 130V60L325 8L350 60V214Z',
  strokes: [
    GROUND,
    { d: 'M80 214V130H300V214', delay: 0.4, duration: 0.7 },
    { d: 'M300 214V60H350V214', delay: 0.6, duration: 0.8 },
    { d: 'M80 130L190 76L300 130', delay: 1.1, duration: 0.7 },
    ...spread([120, 260], (c) => arch(c, 16, 186, 162, 18), 1.2, 0.15, 0.4, 'column'),
    { d: 'M178 214V192Q190 174 202 192V214', delay: 1.4, duration: 0.5, tone: 'column' },
    { d: 'M318 150V124Q325 108 332 124V150', delay: 1.6, duration: 0.4 },
    { d: 'M296 60L325 8L354 60', delay: 1.8, duration: 0.7 },
    { d: 'M325 8V0', delay: 2.4, duration: 0.2, tone: 'accent' },
    dimension(80, 350),
  ],
}

// Baroque: twin domed bell towers and a swelling façade with scrolls and a curved pediment.
const baroque = {
  mass: 'M96 214V70Q118 30 140 70V100Q200 56 260 100V70Q282 30 304 70V214Z',
  strokes: [
    GROUND,
    { d: 'M96 214V70H140V214', delay: 0.4, duration: 0.7 },
    { d: 'M260 214V70H304V214', delay: 0.5, duration: 0.7 },
    { d: 'M140 214V100H260V214', delay: 0.8, duration: 0.7 },
    { d: arch(200, 40, 214, 178, 20), delay: 1.2, duration: 0.6, tone: 'column' },
    { d: 'M190 134Q200 108 210 134Q200 146 190 134Z', delay: 1.5, duration: 0.5, tone: 'column' },
    { d: arch(118, 12, 120, 100, 10), delay: 1.4, duration: 0.4 },
    { d: arch(282, 12, 120, 100, 10), delay: 1.5, duration: 0.4 },
    { d: 'M140 120Q128 116 128 128Q128 138 138 136', delay: 1.7, duration: 0.4 },
    { d: 'M260 120Q272 116 272 128Q272 138 262 136', delay: 1.8, duration: 0.4 },
    { d: 'M140 100Q200 56 260 100', delay: 1.9, duration: 0.6 },
    { d: 'M96 70Q118 30 140 70', delay: 2.1, duration: 0.5 },
    { d: 'M260 70Q282 30 304 70', delay: 2.2, duration: 0.5 },
    { d: 'M118 44V32M282 44V32', delay: 2.5, duration: 0.2, tone: 'accent' },
    dimension(96, 304),
  ],
}

// Neoclassical: a columned portico under a drum and dome.
const domedPortico = {
  mass: 'M100 108L165 74V46C165 14 235 14 235 46V74L300 108V190H100Z',
  strokes: [
    GROUND,
    { d: 'M80 214V202H320V214', delay: 0.4, duration: 0.5 },
    { d: 'M92 202V190H308V202', delay: 0.55, duration: 0.5 },
    ...spread([120, 173, 227, 280], (x) => `M${x - 6} 190V120H${x + 6}V190`, 0.8, 0.14, 0.5, 'column'),
    { d: 'M100 120H300V108H100Z', delay: 1.4, duration: 0.5 },
    { d: 'M100 108L200 70L300 108', delay: 1.6, duration: 0.6 },
    { d: 'M165 74V46H235V74', delay: 1.9, duration: 0.4 },
    { d: 'M165 46C165 14 235 14 235 46', delay: 2.1, duration: 0.6 },
    { d: 'M196 25V14H204V25', delay: 2.6, duration: 0.2, tone: 'accent' },
    dimension(80, 320),
  ],
}

// Art Nouveau: a flat front with rounded corners, whiplash tendrils and organic arches.
const nouveau = {
  mass: 'M90 214V92Q90 70 112 70H150C160 40 190 36 200 52C210 36 240 40 250 70H288Q310 70 310 92V214Z',
  strokes: [
    GROUND,
    { d: 'M90 214V92Q90 70 112 70H288Q310 70 310 92V214', delay: 0.4, duration: 1.0 },
    { d: 'M170 214V150C170 110 230 110 230 150V214', delay: 1.0, duration: 0.8, tone: 'column' },
    { d: arch(130, 30, 190, 150, 20), delay: 1.4, duration: 0.5 },
    { d: arch(270, 30, 190, 150, 20), delay: 1.5, duration: 0.5 },
    { d: 'M96 120C130 120 140 150 170 150', delay: 1.7, duration: 0.5, tone: 'column' },
    { d: 'M304 120C270 120 260 150 230 150', delay: 1.8, duration: 0.5, tone: 'column' },
    { d: 'M150 70C160 40 190 36 200 52C210 36 240 40 250 70', delay: 2.0, duration: 0.6, tone: 'accent' },
    dimension(90, 310),
  ],
}

// Postmodern: a plain block dressed in oversized classical parts: a giant keystone, fat
// square columns, punched windows and a round-headed door.
const postmodern = {
  mass: 'M84 214V72H316V214Z',
  strokes: [
    GROUND,
    { d: 'M90 214V80H310V214', delay: 0.4, duration: 0.8 },
    { d: 'M84 80H316V72H84Z', delay: 0.9, duration: 0.5 },
    { d: 'M104 214V120H136V214', delay: 1.0, duration: 0.6, tone: 'column' },
    { d: 'M264 214V120H296V214', delay: 1.1, duration: 0.6, tone: 'column' },
    { d: 'M100 120V108H140V120M260 120V108H300V120', delay: 1.4, duration: 0.4 },
    { d: 'M150 150H174V174H150Z', delay: 1.5, duration: 0.3 },
    { d: 'M226 150H250V174H226Z', delay: 1.6, duration: 0.3 },
    { d: 'M176 214V176Q176 158 200 158Q224 158 224 176V214', delay: 1.7, duration: 0.5, tone: 'column' },
    { d: 'M180 80L220 80L212 128H188Z', delay: 2.0, duration: 0.5, tone: 'accent' },
    dimension(84, 316),
  ],
}

// Brutalist, in Niemeyer's vocabulary: a deep concrete slab raised on two flared piers, a
// ramp climbing to it, a dome and a bowl on its roof, and fins along its length.
const FINS = Array.from({ length: 15 }, (_, i) => 86 + i * 16)
const brutalist = {
  mass: 'M70 160V110H100C100 76 160 76 160 110H200V88C214 112 296 112 310 88V110H330V160H280Q280 190 294 214H246Q260 190 260 160H140Q140 190 154 214H106Q120 190 120 160Z',
  strokes: [
    GROUND,
    { d: 'M106 214Q120 190 120 160H140Q140 190 154 214', delay: 0.4, duration: 0.6 },
    { d: 'M246 214Q260 190 260 160H280Q280 190 294 214', delay: 0.5, duration: 0.6 },
    { d: 'M70 160V110H330V160Z', delay: 0.9, duration: 0.8 },
    { d: 'M160 214C190 214 210 200 250 166', delay: 1.3, duration: 0.6, tone: 'accent' },
    ...spread(FINS, (x) => `M${x} 154V116`, 1.1, 0.04, 0.35, 'column'),
    { d: 'M100 110C100 76 160 76 160 110', delay: 1.9, duration: 0.5 },
    { d: 'M200 88C214 112 296 112 310 88H200', delay: 2.1, duration: 0.5 },
    dimension(70, 330),
  ],
}

// Renaissance: a symmetric palazzo of arched windows in tiers, a dome rising behind.
const palazzo = {
  mass: 'M70 214V108H170V84C170 40 230 40 230 84V108H330V214Z',
  strokes: [
    GROUND,
    { d: 'M70 214V108H330V214', delay: 0.4, duration: 0.8 },
    { d: 'M62 108H338', delay: 0.9, duration: 0.5 },
    { d: 'M70 160H330', delay: 1.0, duration: 0.5 },
    ...spread([100, 150, 250, 300], (c) => arch(c, 18, 200, 176, 10), 1.1, 0.1, 0.4, 'column'),
    { d: 'M188 214V184Q188 170 200 170Q212 170 212 184V214', delay: 1.3, duration: 0.5, tone: 'column' },
    ...spread([100, 150, 200, 250, 300], (c) => arch(c, 16, 150, 128, 9), 1.5, 0.08, 0.35),
    { d: 'M170 108V84H230V108', delay: 1.9, duration: 0.4 },
    { d: 'M170 84C170 40 230 40 230 84', delay: 2.1, duration: 0.6 },
    { d: 'M196 54V40H204V54M200 40V30', delay: 2.6, duration: 0.2, tone: 'accent' },
    dimension(62, 338),
  ],
}

// Art Deco: a streamlined front with a curved corner, horizontal bands and a vertical sign tower.
const deco = {
  mass: 'M70 214V130Q70 110 90 110H260V30H300V214Z',
  strokes: [
    GROUND,
    { d: 'M70 214V130Q70 110 90 110H260V214', delay: 0.4, duration: 0.8 },
    ...spread([150, 175, 195], (y) => `M70 ${y}H260`, 0.8, 0.15, 0.5),
    { d: 'M110 214V190H200V214', delay: 1.3, duration: 0.5, tone: 'column' },
    { d: 'M260 214V30H300V214', delay: 1.0, duration: 0.9 },
    ...spread([270, 280, 290], (x) => `M${x} 214V40`, 1.5, 0.1, 0.6, 'column'),
    { d: 'M260 70H300M260 100H300', delay: 1.9, duration: 0.4 },
    { d: 'M105 186H205', delay: 2.0, duration: 0.3, tone: 'accent' },
    { d: 'M280 30V8', delay: 2.3, duration: 0.2, tone: 'accent' },
    dimension(70, 300),
  ],
}

// Manueline: a deep portal under a pointed arch, rope-twisted columns, an armillary sphere
// and the cross of the Order of Christ, between pinnacles.
const rope = (x, from, to) => {
  const steps = Array.from({ length: Math.round((from - to) / 18) }, (_, i) => `T${x} ${from - 18 * (i + 1)}`)
  return `M${x} ${from}Q${x + 10} ${from - 9} ${x} ${from - 18}${steps.slice(1).join('')}`
}
const belem = {
  mass: 'M80 214V60H96V30L104 14L112 30V60H288V30L296 14L304 30V60H320V214Z',
  strokes: [
    GROUND,
    { d: 'M80 214V60H320V214', delay: 0.4, duration: 0.7 },
    { d: 'M96 60V30L104 14L112 30V60', delay: 0.8, duration: 0.5 },
    { d: 'M288 60V30L296 14L304 30V60', delay: 0.9, duration: 0.5 },
    { d: 'M150 214V130Q150 70 200 40Q250 70 250 130V214', delay: 1.0, duration: 0.8 },
    { d: 'M164 214V134Q164 88 200 62Q236 88 236 134V214', delay: 1.2, duration: 0.7 },
    { d: rope(140, 214, 106), delay: 1.0, duration: 0.8, tone: 'accent' },
    { d: rope(260, 214, 106), delay: 1.1, duration: 0.8, tone: 'accent' },
    { d: arch(110, 16, 170, 150, 8), delay: 1.6, duration: 0.4 },
    { d: arch(290, 16, 170, 150, 8), delay: 1.7, duration: 0.4 },
    { d: 'M190 46a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M190 46Q200 30 210 46Q200 62 190 46', delay: 1.9, duration: 0.5, tone: 'column' },
    { d: 'M200 28V12M194 18H206', delay: 2.4, duration: 0.3, tone: 'accent' },
    dimension(80, 320),
  ],
}

// Islamic and Byzantine: a domed hall with a horseshoe portal beside a tall minaret.
const domedMinaret = {
  mass: 'M90 214V140H120C120 60 220 60 220 140H250V214ZM272 214V50L280 20L288 50V214Z',
  strokes: [
    GROUND,
    { d: 'M90 214V140H250V214', delay: 0.4, duration: 0.7 },
    { d: 'M152 214V184C132 172 142 150 170 150C198 150 208 172 188 184V214', delay: 0.9, duration: 0.7, tone: 'column' },
    { d: arch(112, 14, 190, 172, 8), delay: 1.2, duration: 0.4 },
    { d: arch(228, 14, 190, 172, 8), delay: 1.3, duration: 0.4 },
    { d: 'M120 140C120 60 220 60 220 140', delay: 1.5, duration: 0.8 },
    { d: 'M170 80V64', delay: 2.3, duration: 0.2, tone: 'accent' },
    { d: 'M272 214V50H288V214', delay: 0.8, duration: 0.9 },
    { d: 'M264 100H296M266 70H294', delay: 1.6, duration: 0.4, tone: 'column' },
    { d: 'M272 50L280 20L288 50', delay: 1.9, duration: 0.4 },
    dimension(90, 288),
  ],
}

// East Asian: a three-tier pagoda with upswept eaves and a finial of rings.
const roof = (y, half, rise) =>
  `M${200 - half} ${y - 8}Q${200 - half * 0.62} ${y - 4} ${200 - half * 0.4} ${y - rise}H${200 + half * 0.4}Q${200 + half * 0.62} ${y - 4} ${200 + half} ${y - 8}`
const pagoda = {
  mass: 'M90 214V172H110L115 128H155L168 88H232L245 128H285L290 172H310V214Z',
  strokes: [
    GROUND,
    { d: 'M90 214V204H310V214', delay: 0.4, duration: 0.4 },
    { d: 'M140 204V172H260V204', delay: 0.7, duration: 0.5 },
    { d: 'M188 204V186H212V204', delay: 0.9, duration: 0.3, tone: 'column' },
    { d: roof(172, 105, 22), delay: 1.0, duration: 0.5 },
    { d: 'M155 150V128H245V150', delay: 1.3, duration: 0.4 },
    { d: roof(128, 85, 20), delay: 1.5, duration: 0.5 },
    { d: 'M168 108V88H232V108', delay: 1.8, duration: 0.4 },
    { d: roof(88, 65, 18), delay: 2.0, duration: 0.5 },
    { d: 'M200 70V30M194 56H206M195 46H205M197 38H203', delay: 2.4, duration: 0.3, tone: 'accent' },
    dimension(90, 310),
  ],
}

// Mannerism: the classical rules bent: giant pilasters, a pediment inside a pediment and a
// keystone that has slipped out of its arch.
const mannerist = {
  mass: 'M80 214V110L200 66L320 110V214Z',
  strokes: [
    GROUND,
    { d: 'M80 214V110H320V214', delay: 0.4, duration: 0.7 },
    ...spread([100, 160, 240, 300], (x) => `M${x - 6} 214V110H${x + 6}V214`, 0.7, 0.12, 0.5, 'column'),
    { d: 'M80 190H320M80 170H320', delay: 1.2, duration: 0.5 },
    { d: 'M170 214V160Q170 130 200 130Q230 130 230 160V214', delay: 1.3, duration: 0.6, tone: 'column' },
    { d: 'M80 110L200 66L320 110', delay: 1.7, duration: 0.6 },
    { d: 'M170 100L200 82L230 100', delay: 2.0, duration: 0.4 },
    { d: 'M193 140H207L204 158H196Z', delay: 2.3, duration: 0.3, tone: 'accent' },
    dimension(80, 320),
  ],
}

// Industrial: an iron-and-glass vault with its glazing bars, and a tall brick chimney.
const VAULT_BARS = Array.from({ length: 7 }, (_, i) => 88 + i * 32)
const vaultY = (x) => 150 - 272 * ((x - 60) / 280) * (1 - (x - 60) / 280)
const industrial = {
  mass: 'M60 214V150Q200 14 340 150V214H352V40H368V214Z',
  strokes: [
    GROUND,
    { d: 'M60 214V150H340V214', delay: 0.4, duration: 0.6 },
    { d: 'M60 150Q200 14 340 150', delay: 0.9, duration: 0.9 },
    ...spread(VAULT_BARS, (x) => `M${x} 150V${vaultY(x).toFixed(1)}`, 1.2, 0.1, 0.4, 'column'),
    { d: 'M190 214V180H210V214', delay: 1.9, duration: 0.3 },
    { d: 'M352 214V40H368V214', delay: 0.7, duration: 1.0 },
    { d: 'M349 40H371', delay: 1.8, duration: 0.3, tone: 'accent' },
    dimension(60, 368),
  ],
}

// Indic: a curving shikhara tower in tiers over a plinth, with a stepped porch.
const half = (y) => 60 * (1 - ((198 - y) / 150) ** 1.7)
const RIDGES = [170, 146, 122, 98, 74]
const shikhara = {
  mass: 'M70 214V168L105 138L140 168V198C140 120 170 70 200 48C230 70 260 120 260 198V214Z',
  strokes: [
    GROUND,
    { d: 'M70 214V198H330V214', delay: 0.4, duration: 0.5 },
    { d: 'M70 198V168H140V198', delay: 0.7, duration: 0.5 },
    { d: 'M76 168L105 138L134 168', delay: 0.9, duration: 0.5 },
    { d: 'M140 198C140 120 170 70 200 48C230 70 260 120 260 198', delay: 1.0, duration: 1.0 },
    ...RIDGES.map((y, i) => ({
      d: `M${(200 - half(y)).toFixed(1)} ${y}H${(200 + half(y)).toFixed(1)}`,
      delay: 1.2 + i * 0.12,
      duration: 0.35,
    })),
    { d: 'M186 198V170H214V198', delay: 1.6, duration: 0.4, tone: 'column' },
    { d: 'M184 56H216', delay: 2.0, duration: 0.3 },
    { d: 'M200 48V26M196 32H204', delay: 2.3, duration: 0.3, tone: 'accent' },
    dimension(70, 330),
  ],
}

// Russian: a block crowned with onion domes on drums, a taller one at the centre.
const onion = (cx, base, w, h) =>
  `M${cx - w / 2} ${base}C${cx - w * 0.9} ${base - h * 0.35} ${cx - w * 0.2} ${base - h * 0.55} ${cx} ${base - h}C${cx + w * 0.2} ${base - h * 0.55} ${cx + w * 0.9} ${base - h * 0.35} ${cx + w / 2} ${base}`
const russian = {
  mass: 'M100 214V150H170V100H230V150H300V214Z',
  strokes: [
    GROUND,
    { d: 'M100 214V150H300V214', delay: 0.4, duration: 0.7 },
    { d: arch(200, 24, 214, 192, 12), delay: 0.8, duration: 0.4, tone: 'column' },
    ...spread([130, 270], (c) => arch(c, 14, 196, 176, 8), 0.9, 0.1, 0.4),
    { d: 'M175 150V100H225V150', delay: 1.1, duration: 0.5 },
    { d: 'M113 150V124H137V150', delay: 1.2, duration: 0.4 },
    { d: 'M263 150V124H287V150', delay: 1.3, duration: 0.4 },
    { d: onion(200, 100, 56, 56), delay: 1.5, duration: 0.6 },
    { d: onion(125, 124, 40, 38), delay: 1.7, duration: 0.5 },
    { d: onion(275, 124, 40, 38), delay: 1.8, duration: 0.5 },
    { d: 'M200 44V24M193 32H207M125 86V70M275 86V70', delay: 2.4, duration: 0.3, tone: 'accent' },
    dimension(100, 300),
  ],
}

// Ottoman: domes cascading down from a great dome to half-domes, and two pencil minarets.
const ottoman = {
  mass: 'M100 214V170C100 140 150 140 150 140C150 62 250 62 250 140C250 140 300 140 300 170V214ZM70 214V50L74 24L78 50V214ZM322 214V50L326 24L330 50V214Z',
  strokes: [
    GROUND,
    { d: 'M100 214V170H300V214', delay: 0.4, duration: 0.6 },
    ...spread([125, 200, 275], (c) => arch(c, 14, 208, 190, 8), 0.8, 0.1, 0.4, 'column'),
    { d: 'M150 170V140H250V170', delay: 1.0, duration: 0.5 },
    { d: 'M100 170C100 140 150 140 150 170', delay: 1.4, duration: 0.5 },
    { d: 'M250 170C250 140 300 140 300 170', delay: 1.5, duration: 0.5 },
    { d: 'M150 140C150 62 250 62 250 140', delay: 1.6, duration: 0.8 },
    { d: 'M70 214V50H78V214', delay: 0.6, duration: 0.9 },
    { d: 'M322 214V50H330V214', delay: 0.7, duration: 0.9 },
    { d: 'M66 100H82M318 100H334', delay: 1.6, duration: 0.3, tone: 'column' },
    { d: 'M70 50L74 24L78 50', delay: 1.9, duration: 0.3 },
    { d: 'M322 50L326 24L330 50', delay: 2.0, duration: 0.3 },
    { d: 'M200 66V44', delay: 2.4, duration: 0.2, tone: 'accent' },
    dimension(66, 334),
  ],
}

// CLASSICAL keeps the civic front; any era not listed falls back to it too.
export const BY_ERA = {
  ANCIENT_EGYPTIAN: pyramid,
  PRE_COLUMBIAN: pyramid,
  MEDIEVAL: gothic,
  HISTORICISM: neoGothic,
  BAROQUE: baroque,
  NEOCLASSICAL: domedPortico,
  ART_NOUVEAU: nouveau,
  POSTMODERNISM: postmodern,
  BRUTALISM: brutalist,
  RENAISSANCE: palazzo,
  ART_DECO: deco,
  MANNERISM: mannerist,
  INDUSTRIAL: industrial,
  INDIC: shikhara,
  RUSSIAN: russian,
  OTTOMAN: ottoman,
  MANUELINE: belem,
  ISLAMIC: domedMinaret,
  BYZANTINE: domedMinaret,
  EAST_ASIAN: pagoda,
  MODERNISM: sails,
  CONTEMPORARY: twist,
}

export const silhouetteFor = (era) => BY_ERA[era] ?? temple
export const silhouettes = {
  temple,
  pyramid,
  gothic,
  sails,
  twist,
  neoGothic,
  baroque,
  domedPortico,
  nouveau,
  postmodern,
  brutalist,
  palazzo,
  deco,
  belem,
  domedMinaret,
  pagoda,
  mannerist,
  industrial,
  shikhara,
  russian,
  ottoman,
}
