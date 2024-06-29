import { useState } from 'react'
import SignUp from './pages/SignUp'

import './App.css'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
    <Outlet />
    </>
  )
}

export default App
