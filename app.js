const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const skillsRoutes = require('./routes/skills');
const profileRoutes = require('./routes/profile');
const messagesRoutes = require('./routes/messages');

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'skillspot-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Make user available in all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/skills', skillsRoutes);
app.use('/profile', profileRoutes);
app.use('/messages', messagesRoutes);

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).render('layout', {
        title: 'Page Not Found',
        body: '<div class="container mt-5"><div class="text-center"><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/" class="btn btn-primary">Go Home</a></div></div>'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('layout', {
        title: 'Server Error',
        body: '<div class="container mt-5"><div class="text-center"><h1>500 - Server Error</h1><p>Something went wrong on our end.</p><a href="/" class="btn btn-primary">Go Home</a></div></div>'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillSpot server running on http://0.0.0.0:${PORT}`);
});
