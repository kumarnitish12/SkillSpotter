// In-memory database for the skill-sharing platform
class Database {
    constructor() {
        this.users = [];
        this.skills = [];
        this.reviews = [];
        this.messages = [];
        this.categories = [
            'Academic', 'Technical', 'Creative', 'Sports', 'Languages', 'Music', 'Cooking', 'Other'
        ];
        this.currentId = 1;
        
        // Initialize with some default data if needed (empty for production)
    }
    
    // Helper method to generate unique IDs
    generateId() {
        return (this.currentId++).toString();
    }
    
    // User methods
    createUser(userData) {
        const user = {
            id: this.generateId(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            college: userData.college,
            year: userData.year,
            bio: userData.bio || '',
            createdAt: new Date().toISOString()
        };
        
        this.users.push(user);
        return user;
    }
    
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }
    
    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }
    
    updateUser(id, updates) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            return this.users[userIndex];
        }
        return null;
    }
    
    // Skill methods
    createSkill(skillData) {
        const skill = {
            id: this.generateId(),
            title: skillData.title,
            description: skillData.description,
            category: skillData.category,
            level: skillData.level, // Beginner, Intermediate, Advanced
            price: skillData.price || 0,
            type: skillData.type, // 'teach' or 'learn'
            userId: skillData.userId,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString()
        };
        
        this.skills.push(skill);
        return skill;
    }
    
    getSkills() {
        return this.skills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    getSkillById(id) {
        return this.skills.find(skill => skill.id === id);
    }
    
    getSkillsByUserId(userId) {
        return this.skills.filter(skill => skill.userId === userId);
    }
    
    getSkillsByCategory(category) {
        return this.skills.filter(skill => skill.category === category);
    }
    
    // Review methods
    createReview(reviewData) {
        const review = {
            id: this.generateId(),
            skillId: reviewData.skillId,
            userId: reviewData.userId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            createdAt: new Date().toISOString()
        };
        
        this.reviews.push(review);
        this.updateSkillRating(reviewData.skillId);
        return review;
    }
    
    getReviewsBySkillId(skillId) {
        return this.reviews.filter(review => review.skillId === skillId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    updateSkillRating(skillId) {
        const skillReviews = this.getReviewsBySkillId(skillId);
        const skill = this.getSkillById(skillId);
        
        if (skill && skillReviews.length > 0) {
            const totalRating = skillReviews.reduce((sum, review) => sum + review.rating, 0);
            skill.rating = (totalRating / skillReviews.length).toFixed(1);
            skill.reviewCount = skillReviews.length;
        }
    }
    
    // Message methods
    createMessage(messageData) {
        const message = {
            id: this.generateId(),
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            content: messageData.content,
            read: false,
            createdAt: new Date().toISOString()
        };
        
        this.messages.push(message);
        return message;
    }
    
    getMessagesByUserId(userId) {
        return this.messages.filter(message => 
            message.senderId === userId || message.receiverId === userId
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    getConversation(user1Id, user2Id) {
        return this.messages.filter(message =>
            (message.senderId === user1Id && message.receiverId === user2Id) ||
            (message.senderId === user2Id && message.receiverId === user1Id)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    markMessageAsRead(messageId) {
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
            message.read = true;
        }
    }
    
    // Category methods
    getCategories() {
        return this.categories;
    }
}

// Export singleton instance
module.exports = new Database();
