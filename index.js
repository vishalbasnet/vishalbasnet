document.addEventListener('DOMContentLoaded', function() {
    // Animation observer
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special case for analytics section container
                if (entry.target.classList.contains('analytics-container')) {
                    const content = entry.target.querySelector('.analytics-content');
                    const animation = entry.target.querySelector('.analytics-animation');
                    if (content) content.classList.add('visible');
                    if (animation) animation.classList.add('visible');
                }
                
                animationObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all animatable elements
    document.querySelectorAll('.feature-card, .analytics-section .container').forEach(el => {
        animationObserver.observe(el);
    });

    // Real-time clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        document.getElementById('live-clock').textContent = `${dateString} ${timeString}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Animated counter
    const animateCounters = () => {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(animateCounters, 1);
            } else {
                counter.innerText = target.toLocaleString();
            }
        });
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.stat-card').forEach(card => {
        counterObserver.observe(card);
    });
});