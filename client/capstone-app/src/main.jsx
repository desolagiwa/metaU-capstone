import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Protected from './components/Protected.jsx'
import GetStarted from './pages/GetStarted.jsx'
import MapPage from './pages/MapPage.jsx'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'


const router = createBrowserRouter(
                createRoutesFromElements(
                  <Route path='/' element={<App />}>
                    <Route path='signup' element={<SignUp />}/>
                    <Route path='login' element={<Login />}/>
                    <Route path='get-started' element={<GetStarted />}/>
                    <Route path='map/:currentCoordinates/:destinationCoordinates' element={<MapPage />}/>
                    <Route path='/' element={<Protected />}>
                      <Route path='/' index element={<Home />}/>
                    </Route>
                  </Route>
                )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
