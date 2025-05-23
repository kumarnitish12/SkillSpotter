const express = require('express');
const router = express.Router();
const db = require('../data/database');
const authMiddleware = require('../middleware/auth');

// Browse all skills
router.get('/', (req, res) => {
    const skills = db.getSkills();
    const categories = db.getCategories();
    
    res.render('skills', {
        title: 'Browse Skills - SkillSpot',
        skills,
        categories,
        searchQuery: '',
        selectedCategory: 'all'
    });
});

// Skill detail page
router.get('/:id', (req, res) => {
    const skill = db.getSkillById(req.params.id);
    
    if (!skill) {
        return res.status(404).render('layout', {
            title: 'Skill Not Found',
            body: '<div class="container mt-5"><div class="text-center"><h1>Skill Not Found</h1><p>The skill you are looking for does not exist.</p><a href="/skills" class="btn btn-primary">Browse Skills</a></div></div>'
        });
    }
    
    const skillOwner = db.getUserById(skill.userId);
    const reviews = db.getReviewsBySkillId(skill.id);
    
    res.render('skill-detail', {
        title: `${skill.title} - SkillSpot`,
        skill,
        skillOwner,
        reviews
    });
});

// Post new skill (GET)
router.get('/post/new', authMiddleware, (req, res) => {
    const categories = db.getCategories();
    res.render('post-skill', {
        title: 'Post a Skill - SkillSpot',
        categories,
        error: null
    });
});

// Post new skill (POST)
router.post('/post/new', authMiddleware, (req, res) => {
    const { title, description, category, level, price, type } = req.body;
    
    if (!title || !description || !category || !level || !type) {
        return res.render('post-skill', {
            title: 'Post a Skill - SkillSpot',
            categories: db.getCategories(),
            error: 'All fields except price are required'
        });
    }
    
    const skill = db.createSkill({
        title,
        description,
        category,
        level,
        price: price ? parseFloat(price) : 0,
        type,
        userId: req.session.user.id
    });
    
    res.redirect(`/skills/${skill.id}`);
});

// Add review
router.post('/:id/review', authMiddleware, (req, res) => {
    const { rating, comment } = req.body;
    const skillId = req.params.id;
    
    if (!rating || !comment) {
        return res.redirect(`/skills/${skillId}?error=rating-comment-required`);
    }
    
    const skill = db.getSkillById(skillId);
    if (!skill) {
        return res.status(404).redirect('/skills');
    }
    
    // Check if user already reviewed this skill
    const existingReview = db.getReviewsBySkillId(skillId)
        .find(review => review.userId === req.session.user.id);
    
    if (existingReview) {
        return res.redirect(`/skills/${skillId}?error=already-reviewed`);
    }
    
    db.createReview({
        skillId,
        userId: req.session.user.id,
        rating: parseInt(rating),
        comment
    });
    
    res.redirect(`/skills/${skillId}`);
});

module.exports = router;
