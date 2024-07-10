import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate =  useNavigate()

    const handleLogout = async () => {
        await signOut(auth)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }
    const handleClick = () => {
        navigate('/get-started')
    }

    return (
        <>
            <h1>HOME</h1>
            <p>Welcome to the home page</p>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleClick}>Get Started!</button>
        </>
    )
}

export default Home
