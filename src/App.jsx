import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'
import Login from './Components/Login'
import StyleGuide from './Components/StyleGuide'

function History() {
  return <div>Personal History Page</div>
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/styleGuide' element={<StyleGuide />} />
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
