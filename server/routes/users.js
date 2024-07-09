const express = require('express');
const session = require('express-session');
const firebase = require('firebase/app');
const dotenv = require('dotenv')
const getAuth  = require('firebase/auth')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client')
const Prisma = new PrismaClient()

const router = express.Router();
const jwt_secret = process.env.JWT_SECRET
const session_secret = process.env.SESSION_SECRET

function generateToken(userId, email) {
  const payload = { userId, email };
  const secret = jwt_secret;
  return jwt.sign(payload, secret);
}

router.post('/users', session({ secret: session_secret }), async (req, res) => {
  const { uid, username, password, email } = req.body;
  try {
    const existingUser = await Prisma.User.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Prisma.user.create({
      data: {uid, username, password: hashedPassword, email}
    });
  const token = generateToken(newUser.id, email);
  res.cookie('token', token, { httpOnly: true, secure: true, expires: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) });
  res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users/login', session({ secret: session_secret }), async (req, res) => {
  const { email, password } = req.body;
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decodedToken = jwt.verify(token, jwt_secret);
    const userId = decodedToken.userId;
    const user = await Prisma.User.findFirst({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    req.session.user = user;
    const newToken = generateToken(user.id, email);
    res.json({ token: newToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
