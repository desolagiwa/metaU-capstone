const express = require('express');
const cors = require('cors')
const session = require('express-session')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser');

require('dotenv').config()
const app = express();

const userRoutes = require('./routes/users')
const tripRoutes = require('./routes/routes')
const session_secret = process.env.SESSION_SECRET

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
      secret: session_secret,
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
app.use('/get-routes', tripRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })


app.get('/stops', async (req, res) => {
  try {
    const stops = await Prisma.Stop.findMany()
    res.json(stops)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
})
app.get('/stop-times', async (req, res) => {
  try {
    const stopTimes = await Prisma.StopTime.findMany()
    res.json(stopTimes)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
})
app.get('/routes', async (req, res) => {
  try {
    const routes = await Prisma.Route.findMany()
    res.json(routes)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
})
app.get('/trips', async (req, res) => {
  try {
    const trips = await Prisma.Trip.findMany()
    res.json(trips)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
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
