import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'
import Login from './Components/Login'
import StyleGuide from './Components/StyleGuide'
import Register from "./components/Register"
import Map from './Components/Map/Map'
import About from './Components/About'

function History() {
  return <div>Personal History Page</div>
}

// Pages that need the full viewport (no flex centering applied by the shell)
const FULL_BLEED_ROUTES = ['/map'];

function App() {
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className={isFullBleed ? 'flex-1 flex flex-col' : 'flex-1 flex items-center justify-center'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/login' element={<Login />} />
          <Route path='/map' element={<Map />} />
          <Route path='/styleGuide' element={<StyleGuide />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/history"
            element={
              localStorage.getItem("token")
                ? <History />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
