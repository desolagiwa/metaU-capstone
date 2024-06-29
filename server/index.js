const express = require('express');
const cors = require('cors')
const session = require('express-session')
const morgan = require('morgan')
const cookieParser = require('cookie-parser');

require('dotenv').config()
const app = express();

const userRoutes = require('./routes/users')

const port = process.env.port || 3000

const { PrismaClient } = require('@prisma/client')
const Prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json())

Prisma.$connect()
  .then(() => {
    console.log('Connected to database');
    app.use(session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      store: new (require('connect-pg-simple')(session))({
        pool: Prisma.$connect(),
        tableName: 'sessions',
      }),
    }));
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

app.use('/auth', userRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })

app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
        return res.status(400).json({ error: "A unique constraint violation occurred." })
    }
  }
  res.status(500).json({ error: "Internal Server Error" })
  })


module.exports = app
