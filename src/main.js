import './style.css'
import { Nav, Footer } from './components.js'

document.addEventListener('DOMContentLoaded', () => {
    // Inject Nav - DISABLED (Using static HTML in files now)
    // document.body.insertAdjacentHTML('afterbegin', Nav);

    // Inject Footer - DISABLED (Using static HTML)
    // if (!document.querySelector('.snap-container')) {
    //    document.body.insertAdjacentHTML('beforeend', Footer);
    // }

    // Add scroll effect for nav
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // Add WhatsApp floating button
    const whatsappButton = `
        <a href="https://wa.me/917558150570?text=Hi%2C%20I%20have%20an%20inquiry" 
           class="whatsapp-float" 
           target="_blank"
           aria-label="Contact us on WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
        </a>
    `;
    document.body.insertAdjacentHTML('beforeend', whatsappButton);

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
