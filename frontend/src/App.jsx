import { useEffect } from 'react'
import { useRoute } from './route.js'
import { readSession } from './game/custom.js'
import Game from './Game.jsx'
import { CustomSetup } from './components/custom/CustomSetup.jsx'
import { Home } from './components/home/Home.jsx'
import { ToastHost } from './components/ui/ToastHost.jsx'

// A custom game needs the session the setup screen starts; without one, go back to the setup.
function CustomPlay() {
  const hasSession = readSession() !== null
  useEffect(() => {
    if (!hasSession) window.location.hash = '#/custom'
  }, [hasSession])
  return hasSession ? <Game mode="custom" /> : null
}

function Screen({ route }) {
  if (route === 'home') return <Home />
  if (route === 'custom') return <CustomSetup />
  if (route === 'customPlay') return <CustomPlay />
  // Keyed so Normal and Daily never share round state.
  return <Game key={route} mode={route === 'daily' ? 'daily' : 'normal'} />
}

export default function App() {
  return (
    <>
      <Screen route={useRoute()} />
      <ToastHost />
    </>
  )
}
