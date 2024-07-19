import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Protected from './components/Protected.jsx'
import GetStarted from './pages/GetStarted.jsx'
import MapPage from './pages/MapPage.jsx'
import Routes from './pages/Routes.jsx'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/system'


const router = createBrowserRouter(
                createRoutesFromElements(
                  <Route path='/' element={<App />}>
                    <Route path='signup' element={<SignUp />}/>
                    <Route path='login' element={<Login />}/>
                    <Route path='get-started' element={<GetStarted />}/>
                    <Route path='change-trip' element={<GetStarted />}/>
                    <Route path='map/:currentCoordinates/:destinationCoordinates' element={<MapPage />}/>
                    <Route path='route-options/:currentCoordinates/:destinationCoordinates' element={<Routes />}/>
                    <Route path='/' element={<Protected />}>
                    <Route path='/' index element={<Home />}/>
                    </Route>
                  </Route>
                )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <NextUIProvider>
    <main className="dark text-foreground bg-background"></main>
    <RouterProvider router={router} />
  </NextUIProvider>
)
