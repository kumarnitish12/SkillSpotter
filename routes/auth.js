const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login - SkillSpot', error: null });
});

// Login POST
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.render('login', { 
            title: 'Login - SkillSpot', 
            error: 'Please provide both email and password' 
        });
    }
    
    const user = db.getUserByEmail(email);
    
    if (!user || user.password !== password) {
        return res.render('login', { 
            title: 'Login - SkillSpot', 
            error: 'Invalid email or password' 
        });
    }
    
    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year
    };
    
    res.redirect('/dashboard');
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { title: 'Register - SkillSpot', error: null });
});

// Register POST
router.post('/register', (req, res) => {
    const { name, email, password, college, year } = req.body;
    
    if (!name || !email || !password || !college || !year) {
        return res.render('register', { 
            title: 'Register - SkillSpot', 
            error: 'All fields are required' 
        });
    }
    
    if (db.getUserByEmail(email)) {
        return res.render('register', { 
            title: 'Register - SkillSpot', 
            error: 'Email already registered' 
        });
    }
    
    const newUser = db.createUser({
        name,
        email,
        password,
        college,
        year: parseInt(year)
    });
    
    req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        college: newUser.college,
        year: newUser.year
    };
    
    res.redirect('/dashboard');
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
