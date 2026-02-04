import './style.css'
import { Nav, Footer } from './components.js'

document.addEventListener('DOMContentLoaded', () => {
    // Inject Nav
    document.body.insertAdjacentHTML('afterbegin', Nav);

    // Inject Footer (only if not a snap-container page which has its own snapped footer)
    if (!document.querySelector('.snap-container')) {
        document.body.insertAdjacentHTML('beforeend', Footer);
    }

    // Mobile Nav Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll Reveal (Reveal Once)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Dust Assembly Animation
    const logoContainer = document.querySelector('.hero-logo-container');
    if (logoContainer) {
        const particleCount = 60;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('dust-particle');

            // Random properties for scattering effect
            const tx = (Math.random() - 0.5) * 300;
            const ty = (Math.random() - 0.5) * 300 + 50;
            const delay = Math.random() * 0.6;
            const size = Math.random() * 3 + 1;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.setProperty('--d', `${delay}s`);
            particle.style.setProperty('--s', `${size}px`);

            logoContainer.appendChild(particle);
        }
    }

    // Specific Hanzof Snap Observer (Toggle Visibility)
    const snapObserverOptions = {
        threshold: 0.3 // Trigger when 30% visible
    };

    const snapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Also trigger children if any
                entry.target.querySelectorAll('.reveal-child').forEach(child => child.classList.add('visible'));
            } else {
                entry.target.classList.remove('visible');
                // Reset children for re-animation
                entry.target.querySelectorAll('.reveal-child').forEach(child => child.classList.remove('visible'));
            }
        });
    }, snapObserverOptions);

    // Apply Observers
    // 1. Standard reveal elements (exclude snap sections to avoid conflict)
    document.querySelectorAll('.reveal:not(.snap-section), .text-clip-reveal').forEach(el => observer.observe(el));

    // 2. Snap sections (Hanzof)
    document.querySelectorAll('.snap-section').forEach(el => snapObserver.observe(el));

    // 3. Stagger parents (could be in either, but usually associated with snap in current design)
    document.querySelectorAll('.stagger-parent').forEach(el => snapObserver.observe(el));
});
