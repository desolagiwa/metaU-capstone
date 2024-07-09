import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useState } from "react";
import { auth } from '../../firebase'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response = await fetch('http://localhost:5000/auth/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (error) {
            console.error('Error:', error.message);
        }
    }


    return (
        <>
            <h1>LOGIN</h1>
            <form onSubmit={handleSubmit} className="signup-form">
                <input type="email" placeholder="Enter email address..." value={email} onChange={(e) => {setEmail(e.target.value)}} required/>
                <input type="password" placeholder="Enter password..." value={password} onChange={(e) => {setPassword(e.target.value)}} required/>
                <button type="submit">Login</button>
            </form>
            <div>
                <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
            </div>
        </>
    )
}

export default Login
