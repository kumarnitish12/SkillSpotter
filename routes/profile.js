const express = require('express');
const router = express.Router();
const db = require('../data/database');
const authMiddleware = require('../middleware/auth');

// Dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
    const userSkills = db.getSkillsByUserId(req.session.user.id);
    const recentMessages = db.getMessagesByUserId(req.session.user.id).slice(0, 5);
    
    res.render('dashboard', {
        title: 'Dashboard - SkillSpot',
        userSkills,
        recentMessages
    });
});

// View profile
router.get('/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    
    if (!user) {
        return res.status(404).render('layout', {
            title: 'Profile Not Found',
            body: '<div class="container mt-5"><div class="text-center"><h1>Profile Not Found</h1><p>The profile you are looking for does not exist.</p><a href="/" class="btn btn-primary">Go Home</a></div></div>'
        });
    }
    
    const userSkills = db.getSkillsByUserId(user.id);
    const isOwnProfile = req.session.user && req.session.user.id === user.id;
    
    res.render('profile', {
        title: `${user.name} - SkillSpot`,
        profileUser: user,
        userSkills,
        isOwnProfile
    });
});

// Edit profile (GET)
router.get('/edit/:id', authMiddleware, (req, res) => {
    if (req.session.user.id !== req.params.id) {
        return res.status(403).redirect('/profile/' + req.session.user.id);
    }
    
    const user = db.getUserById(req.params.id);
    res.render('edit-profile', {
        title: 'Edit Profile - SkillSpot',
        profileUser: user,
        error: null
    });
});

// Edit profile (POST)
router.post('/edit/:id', authMiddleware, (req, res) => {
    if (req.session.user.id !== req.params.id) {
        return res.status(403).redirect('/profile/' + req.session.user.id);
    }
    
    const { name, college, year, bio } = req.body;
    
    if (!name || !college || !year) {
        const user = db.getUserById(req.params.id);
        return res.render('edit-profile', {
            title: 'Edit Profile - SkillSpot',
            profileUser: user,
            error: 'Name, college, and year are required'
        });
    }
    
    const updatedUser = db.updateUser(req.params.id, {
        name,
        college,
        year: parseInt(year),
        bio: bio || ''
    });
    
    // Update session
    req.session.user.name = updatedUser.name;
    req.session.user.college = updatedUser.college;
    req.session.user.year = updatedUser.year;
    
    res.redirect('/profile/' + req.params.id);
});

module.exports = router;
