import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import List from './pages/list-item.jsx'  // FIXED

import './css/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/list-item/:id" element={<List />} />  {/* Matches file */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
