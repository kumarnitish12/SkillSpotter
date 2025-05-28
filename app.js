require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB URI from env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillspot';

// Connect to MongoDB with mongoose
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Set view engine & layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session with MongoStore
const mongoStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  ttl: 24 * 60 * 60, // 1 day
});

mongoStore.on('error', (err) => {
  console.error('Session store error:', err);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'skillspot-secret-key',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Make user session available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const skillsRoutes = require('./routes/skills');
const profileRoutes = require('./routes/profile');
const messagesRoutes = require('./routes/messages');

// Use routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/skills', skillsRoutes);
app.use('/profile', profileRoutes);
app.use('/messages', messagesRoutes);

// 404 handler
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

// 500 error handler
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkillSpot server running on http://0.0.0.0:${PORT}`);
});
