/** Image attribution; links to the source page (e.g. Wikimedia Commons) when there is one. */
export function Credit({ text, source }) {
  if (!source) return text
  return (
    <a href={source} target="_blank" rel="noreferrer">
      {text}
    </a>
  )
}
