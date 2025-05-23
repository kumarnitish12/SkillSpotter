// Main JavaScript file for SkillSpot
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Search functionality
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                searchInput.focus();
                showAlert('Please enter a search term', 'warning');
            }
        });
    }

    // Real-time search suggestions
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                hideSuggestions();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                fetchSearchSuggestions(query);
            }, 300);
        });
    }

    // Message functionality
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    // Star rating system
    const starRatings = document.querySelectorAll('.star-rating');
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const input = rating.querySelector('input[type="hidden"]');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const value = index + 1;
                input.value = value;
                updateStarDisplay(stars, value);
            });
            
            star.addEventListener('mouseover', function() {
                updateStarDisplay(stars, index + 1);
            });
        });
        
        rating.addEventListener('mouseleave', function() {
            updateStarDisplay(stars, input.value || 0);
        });
    });

    // Auto-hide alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (alert.classList.contains('alert-success') || alert.classList.contains('alert-info')) {
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }, 5000);
        }
    });

    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Character counter for textareas
    const textareas = document.querySelectorAll('textarea[data-max-length]');
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('data-max-length'));
        const counter = document.createElement('div');
        counter.className = 'character-counter text-muted mt-1';
        textarea.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 20) {
                counter.className = 'character-counter text-warning mt-1';
            } else if (remaining < 0) {
                counter.className = 'character-counter text-danger mt-1';
            } else {
                counter.className = 'character-counter text-muted mt-1';
            }
        }
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
});

// Search suggestions functionality
function fetchSearchSuggestions(query) {
    // This would typically make an AJAX call to the server
    // For now, we'll just hide suggestions since we don't have a suggestions endpoint
    hideSuggestions();
}

function hideSuggestions() {
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

// Message functionality
function sendMessage() {
    const form = document.getElementById('messageForm');
    const formData = new FormData(form);
    const messageContent = formData.get('content');
    
    if (!messageContent.trim()) {
        showAlert('Please enter a message', 'warning');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    
    fetch('/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            receiverId: formData.get('receiverId'),
            content: messageContent
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            form.reset();
            addMessageToChat(data.message);
            showAlert('Message sent successfully!', 'success');
        } else {
            showAlert(data.error || 'Failed to send message', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Failed to send message', 'danger');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

function addMessageToChat(message) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message-bubble message-sent d-flex';
    messageElement.innerHTML = `
        <div class="flex-grow-1">
            <p class="mb-1">${escapeHtml(message.content)}</p>
            <small class="text-muted">${formatTime(message.createdAt)}</small>
        </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Star rating functionality
function updateStarDisplay(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.innerHTML = '★';
        } else {
            star.classList.remove('active');
            star.innerHTML = '☆';
        }
    });
}

// Alert system
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-hide success and info alerts
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    }
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
        return `${Math.floor(diff / 3600000)}h ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Filter functionality for skills page
function filterSkills() {
    const category = document.getElementById('categoryFilter').value;
    const level = document.getElementById('levelFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        let show = true;
        
        if (category !== 'all' && card.dataset.category !== category) {
            show = false;
        }
        
        if (level !== 'all' && card.dataset.level !== level) {
            show = false;
        }
        
        if (type !== 'all' && card.dataset.type !== type) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    // Update results count
    const visibleCards = document.querySelectorAll('.skill-card[style="display: block"], .skill-card:not([style*="display: none"])');
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${visibleCards.length} skills found`;
    }
}

// Load more functionality for infinite scroll
let loading = false;
let currentPage = 1;

function loadMoreSkills() {
    if (loading) return;
    
    loading = true;
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<span class="loading"></span> Loading...';
        
        // Simulate loading delay (replace with actual API call)
        setTimeout(() => {
            currentPage++;
            loading = false;
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
            
            if (currentPage >= 5) { // Arbitrary limit
                loadMoreBtn.style.display = 'none';
            }
        }, 1000);
    }
}

// Intersection Observer for lazy loading
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        }
    });
}, observerOptions);

// Observe all lazy-loaded images
document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
});
