import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useStrings } from '../../i18n.js'
import { skipsPencil } from './pencil.js'
import styles from './PencilTitle.module.css'

// Placement of the two lines: a pencil traces each letter's outline, one letter after another,
// then shades it in. The text is real (the SVG has a label), the drawing is only how it arrives.
const TITLE = { size: 104, stretch: 125, weight: 760, spacing: 7, trace: 1.5, delay: 0.15, per: 0.13, minWidth: 900, height: 130, baseline: 104 }
const SUBTITLE = { size: 25, stretch: 100, weight: 500, spacing: 1.2, trace: 0.9, delay: 1.9, per: 0.04, minWidth: 640, height: 40, baseline: 29 }
const TRACE_S = 0.9

/** Measures each letter with the real font, once it has loaded. Null until then. */
function useLetters(text, line) {
  const probe = useRef(null)
  const [layout, setLayout] = useState(null)

  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      const node = probe.current
      if (cancelled || !node) return
      const letters = []
      let x = 0
      for (const ch of text) {
        node.textContent = ch
        const w = ch === ' ' ? line.size * 0.35 : node.getComputedTextLength() + line.spacing
        letters.push({ ch, x, w })
        x += w
      }
      node.textContent = ''
      setLayout({ letters, total: x })
    }
    const font = `${line.weight} ${line.size}px 'Archivo Variable'`
    const ready = document.fonts?.load ? document.fonts.load(font, text) : Promise.resolve()
    ready.then(measure, measure)
    return () => {
      cancelled = true
    }
  }, [text, line])

  return { probe, layout }
}

function PencilLine({ text, line, instant, svgRef, onTips }) {
  const { probe, layout } = useLetters(text, line)
  const width = layout ? Math.max(line.minWidth, layout.total + 40) : line.minWidth
  const startX = layout ? (width - layout.total) / 2 : 0
  const fontStyle = { fontSize: line.size, fontStretch: `${line.stretch}%`, fontWeight: line.weight }

  // Tell the pencil where each letter is and when it is drawn.
  useEffect(() => {
    if (!layout || instant) return
    const tips = layout.letters
      .filter((l) => l.ch !== ' ')
      .map((l, i) => ({ x: startX + l.x + l.w / 2, start: line.delay + i * line.per, end: line.delay + i * line.per + TRACE_S }))
    onTips?.(tips)
  }, [layout, instant, startX, line, onTips])

  let drawn = 0
  return (
    <svg
      ref={svgRef}
      className={styles.svg}
      viewBox={`0 0 ${width} ${line.height}`}
      role="img"
      aria-label={text}
      data-line={line === TITLE ? 'title' : 'subtitle'}
    >
      <text ref={probe} className={styles.probe} style={{ ...fontStyle, letterSpacing: line.spacing }} />
      {layout?.letters.map(({ ch, x }, i) => {
        if (ch === ' ') return null
        const delay = line.delay + drawn++ * line.per
        return (
          <text
            key={i}
            className={`${styles.letter} ${instant ? styles.done : ''}`}
            x={startX + x}
            y={line.baseline}
            style={{ ...fontStyle, strokeWidth: line.trace, '--delay': `${delay}s` }}
          >
            {ch}
          </text>
        )
      })}
    </svg>
  )
}

function Pencil() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <g transform="rotate(-135 20 20)">
        <rect x="17" y="2" width="6" height="26" fill="#e0a85b" />
        <rect x="17" y="2" width="6" height="5" fill="#c97b7b" />
        <path d="M17 28h6l-3 8z" fill="#f1d9a8" />
        <path d="M18.9 33h2.2l-1.1 3z" fill="#432818" />
      </g>
    </svg>
  )
}

/**
 * The home page's heading: the name and the tagline drawn by a pencil, live. It plays on every visit;
 * on phones and with reduced motion the lines simply appear.
 */
export function PencilTitle({ className = '' }) {
  const strings = useStrings()
  const [instant] = useState(skipsPencil)
  const root = useRef(null)
  const pencil = useRef(null)
  const lines = useRef({ title: null, subtitle: null })
  const tips = useRef({ title: [], subtitle: [] })
  const titleSvg = useRef(null)
  const subtitleSvg = useRef(null)

  useEffect(() => {
    lines.current = { title: titleSvg.current, subtitle: subtitleSvg.current }
  })

  // The pencil icon follows the letter being drawn (a small wobble makes it a hand, not a cursor).
  useEffect(() => {
    if (instant) return
    let frame = 0
    const t0 = performance.now()
    const tick = (now) => {
      const t = (now - t0) / 1000
      const all = ['title', 'subtitle'].flatMap((name) => tips.current[name].map((tip) => ({ ...tip, svg: lines.current[name], line: name })))
      const active = all.filter((tip) => t >= tip.start && t <= tip.end + 0.05).pop()
      const last = Math.max(0, ...all.map((tip) => tip.end))
      const node = pencil.current
      if (node && root.current && active?.svg) {
        const box = root.current.getBoundingClientRect()
        const r = active.svg.getBoundingClientRect()
        const vb = active.svg.viewBox.baseVal
        const k = r.width / vb.width
        const base = (active.line === 'title' ? TITLE.baseline : SUBTITLE.baseline) * k
        node.style.opacity = '1'
        node.style.transform = `translate(${r.left - box.left + active.x * k - 6}px, ${r.top - box.top + base - 46 + Math.sin(t * 22) * 6}px)`
      }
      if (node && all.length && t > last + 0.3) node.style.opacity = '0'
      if (!all.length || t <= last + 0.4) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [instant])

  return (
    <div ref={root} className={`${styles.root} ${className}`}>
      <h1 className={styles.title}>
        <PencilLine
          text={strings.appName.toUpperCase()}
          line={TITLE}
          instant={instant}
          svgRef={titleSvg}
          onTips={(list) => (tips.current.title = list)}
        />
      </h1>
      <p className={styles.subtitle}>
        <PencilLine
          text={strings.tagline}
          line={SUBTITLE}
          instant={instant}
          svgRef={subtitleSvg}
          onTips={(list) => (tips.current.subtitle = list)}
        />
      </p>
      {!instant && (
        <span ref={pencil} className={styles.pencil}>
          <Pencil />
        </span>
      )}
    </div>
  )
}
