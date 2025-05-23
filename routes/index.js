const express = require('express');
const router = express.Router();
const db = require('../data/database');

// Home page
router.get('/', (req, res) => {
    const featuredSkills = db.getSkills().slice(0, 6);
    const categories = db.getCategories();
    
    res.render('index', {
        title: 'SkillSpot - Share Your Skills',
        featuredSkills,
        categories
    });
});

// Search functionality
router.get('/search', (req, res) => {
    const { q, category } = req.query;
    let skills = db.getSkills();
    
    if (q) {
        skills = skills.filter(skill => 
            skill.title.toLowerCase().includes(q.toLowerCase()) ||
            skill.description.toLowerCase().includes(q.toLowerCase())
        );
    }
    
    if (category && category !== 'all') {
        skills = skills.filter(skill => skill.category === category);
    }
    
    res.render('skills', {
        title: 'Search Results',
        skills,
        categories: db.getCategories(),
        searchQuery: q || '',
        selectedCategory: category || 'all'
    });
});

module.exports = router;
