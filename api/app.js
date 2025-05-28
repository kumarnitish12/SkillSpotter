require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

// MongoDB URI from env
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // adjust for serverless path
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
const mongoStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  ttl: 24 * 60 * 60,
});

mongoStore.on('error', (err) => {
  console.error('Session store error:', err);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    secure: true, // Required for HTTPS on Vercel
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// User session available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('../routes/index'));
app.use('/auth', require('../routes/auth'));
app.use('/skills', require('../routes/skills'));
app.use('/profile', require('../routes/profile'));
app.use('/messages', require('../routes/messages'));

// 404
app.use((req, res, next) => {
  res.status(404).render('layout', {
    title: 'Page Not Found',
    body: `<div class="container mt-5">
      <div class="text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
      </div>
    </div>`
  });
});

// 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('layout', {
    title: 'Server Error',
    body: `<div class="container mt-5">
      <div class="text-center">
        <h1>500 - Server Error</h1>
        <p>Something went wrong on our end.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
      </div>
    </div>`
  });
});

// ✅ Export for Vercel serverless
module.exports = app;
module.exports.handler = serverless(app);
