import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'
import StyleGuide from './Components/StyleGuide'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/styleGuide' element={<StyleGuide />} />
      </Routes>
    </>
  )
}

export default App
