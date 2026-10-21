// The icon shows the state you are in: a pulse line while motion is full, a flat paused line while it is reduced.
const Svg = ({ children, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

export const MotionOnIcon = (props) => (
  <Svg {...props}>
    <path d="M2 12h4l3-7 4 14 3-7h6" />
  </Svg>
)

export const MotionOffIcon = (props) => (
  <Svg {...props}>
    <path d="M2 12h6M16 12h6M10.5 8v8M13.5 8v8" />
  </Svg>
)
