import { createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useState } from "react";
import { auth } from '../../firebase'
import { Link, useNavigate } from 'react-router-dom'

const SignUp = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            localStorage.setItem('token', user.accessToken)
            localStorage.setItem('user', JSON.stringify(user))
            await createUserInDatabase(user);
            navigate('/')
        } catch{
            console.error(error.message)
        }
    }

    const createUserInDatabase = async (user) => {
        const userData = JSON.parse(localStorage.getItem('user'));
        try {
          const response = await fetch('http://localhost:5000/auth/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token'),
            },
            body: JSON.stringify({
              uid: userData.uid,
              email: email,
              password: password,
              username: username
            })
          });
          const data = await response.json();
        } catch (error) {
          console.error(error);
        }
      };

    return (
        <div>
            <h1>SIGN UP</h1>
            <form onSubmit={handleSubmit} className="signup-form">
                <input type="email" placeholder="Enter email address..." value={email} onChange={(e) => {setEmail(e.target.value)}} required/>
                <input type="text" placeholder="Enter a username..." value={username} onChange={(e) => {setUsername(e.target.value)}} required/>
                <input type="password" placeholder="Enter password..." value={password} onChange={(e) => {setPassword(e.target.value)}} required/>
                <button type="submit">Create Account</button>
            </form>
            <div>
                <p>Already have an account? <Link to='/login'>Login</Link></p>
            </div>
        </div>
    )
}

export default SignUp
