import { useRoute } from './route.js'
import Game from './Game.jsx'
import { Home } from './components/home/Home.jsx'

export default function App() {
  const route = useRoute()
  // Keyed so Normal and Daily never share round state.
  return route === 'home' ? <Home /> : <Game key={route} mode={route === 'daily' ? 'daily' : 'normal'} />
}
