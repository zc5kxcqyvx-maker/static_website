/**
 * STASIC Website - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initGlitchEffects();
});

/**
 * Custom Cursor
 */
function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    // Only on desktop
    if (window.innerWidth <= 768) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor movement
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.15;
        cursorY += dy * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .release-card, .track, .platform-link');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

/**
 * Mobile Navigation
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

/**
 * Smooth Scrolling
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Scroll Animations (Intersection Observer)
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger children animations
                const children = entry.target.querySelectorAll('.stagger');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Observe release cards
    document.querySelectorAll('.release-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe tracks
    document.querySelectorAll('.track').forEach((track, index) => {
        track.classList.add('fade-in');
        track.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(track);
    });
}

/**
 * Glitch Effects
 */
function initGlitchEffects() {
    // Random glitch overlay
    const overlay = document.querySelector('.glitch-overlay');
    if (overlay) {
        setInterval(() => {
            if (Math.random() > 0.95) {
                overlay.style.opacity = '1';
                setTimeout(() => {
                    overlay.style.opacity = '0';
                }, 100);
            }
        }, 2000);
    }

    // Glitch on hover for titles
    document.querySelectorAll('.glitch-hover').forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = 'glitch-skew 0.3s linear';
        });
    });

    // Random text glitch effect
    const glitchTexts = document.querySelectorAll('.glitch');
    glitchTexts.forEach(text => {
        setInterval(() => {
            if (Math.random() > 0.97) {
                text.style.textShadow = `
                    ${Math.random() * 10 - 5}px 0 var(--accent),
                    ${Math.random() * 10 - 5}px 0 var(--accent-alt)
                `;
                setTimeout(() => {
                    text.style.textShadow = '';
                }, 50);
            }
        }, 100);
    });
}

/**
 * Parallax Effect (optional - uncomment to enable)
 */
/*
function initParallax() {
    const hero = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}
*/

/**
 * Audio Visualizer Placeholder (for future implementation)
 */
/*
function initAudioVisualizer() {
    // This could be expanded to create audio-reactive visuals
    // using Web Audio API
}
*/

// Expose to global for debugging
window.STASIC = {
    version: '1.0.0',
    init: () => {
        console.log('STASIC Website initialized');
    }
};
