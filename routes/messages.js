const express = require('express');
const router = express.Router();
const db = require('../data/database');
const authMiddleware = require('../middleware/auth');

// Messages inbox
router.get('/', authMiddleware, (req, res) => {
    const messages = db.getMessagesByUserId(req.session.user.id);
    const conversations = {};
    
    // Group messages by conversation
    messages.forEach(message => {
        const otherUserId = message.senderId === req.session.user.id ? message.receiverId : message.senderId;
        if (!conversations[otherUserId]) {
            conversations[otherUserId] = {
                otherUser: db.getUserById(otherUserId),
                messages: [],
                lastMessage: null
            };
        }
        conversations[otherUserId].messages.push(message);
        
        // Update last message
        if (!conversations[otherUserId].lastMessage || 
            new Date(message.createdAt) > new Date(conversations[otherUserId].lastMessage.createdAt)) {
            conversations[otherUserId].lastMessage = message;
        }
    });
    
    res.render('messages', {
        title: 'Messages - SkillSpot',
        conversations: Object.values(conversations)
    });
});

// Start new conversation
router.get('/new/:userId', authMiddleware, (req, res) => {
    const otherUser = db.getUserById(req.params.userId);
    
    if (!otherUser) {
        return res.status(404).redirect('/messages');
    }
    
    if (otherUser.id === req.session.user.id) {
        return res.redirect('/messages');
    }
    
    const messages = db.getConversation(req.session.user.id, otherUser.id);
    
    res.render('conversation', {
        title: `Chat with ${otherUser.name} - SkillSpot`,
        otherUser,
        messages
    });
});

// Send message
router.post('/send', authMiddleware, (req, res) => {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
        return res.status(400).json({ error: 'Receiver and content are required' });
    }
    
    const receiver = db.getUserById(receiverId);
    if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
    }
    
    const message = db.createMessage({
        senderId: req.session.user.id,
        receiverId,
        content
    });
    
    res.json({ success: true, message });
});

// Get conversation messages (AJAX)
router.get('/conversation/:userId', authMiddleware, (req, res) => {
    const messages = db.getConversation(req.session.user.id, req.params.userId);
    res.json(messages);
});

module.exports = router;
