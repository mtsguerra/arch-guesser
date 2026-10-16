/** The graphite look (a little wobble and paper grain), shared by everything the pencil draws. Render it once. */
export function PencilFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="pencil-grain" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="wobble" />
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="9" result="fine" />
        <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.28" result="grain" />
        <feComposite in="wobble" in2="grain" operator="in" />
      </filter>
    </svg>
  )
}
