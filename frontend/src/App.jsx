import React from 'react'
import './components/style.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import CustomAlert from './components/CustomAlert'
import Homepage from './components/Homepage'

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
      <CustomAlert/>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='homepage' element={<Homepage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
