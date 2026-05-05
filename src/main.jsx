import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// GitHub Pages project sites live under /<repo>/ — Vite `--base` sets import.meta.env.BASE_URL.
// Without basename, the URL path is `/wamp-frontend/…` while routes match `/`, so everything hits NotFound.
const base = import.meta.env.BASE_URL ?? '/'
const routerBasename =
  base === '/' ? undefined : base.replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
