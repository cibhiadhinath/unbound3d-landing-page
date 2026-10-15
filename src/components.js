export function getNav(currentPath = '') {
  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');
  const isManufacturing = path.includes('manufacturing');
  const isLynx = path.includes('lynx-350') || path.includes('lynx350');
  const isHowWeWork = path.includes('how-we-work');
  const isTeam = path.includes('team');
  const isContact = path.includes('contact');

  return `
  <nav class="site-nav">
    <a href="/" class="nav-logo" aria-label="Unbound3D Homepage">
      <img src="/logo.png" alt="Unbound3D Logo" class="logo-img" width="32" height="32" />
      <div class="nav-brand-text">
        <span class="brand-name">Unbound3D</span>
      </div>
    </a>
    
    <!-- Hamburger Button (Mobile) -->
    <button class="hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span>
        <span></span>
    </button>

    <div class="nav-links">
      <a href="/manufacturing.html"${isManufacturing ? ' class="active"' : ''}>Manufacturing</a>
      <a href="/lynx-350.html"${isLynx ? ' class="active"' : ''}>Lynx-350</a>
      <a href="/how-we-work.html"${isHowWeWork ? ' class="active"' : ''}>How we work</a>
      <a href="/team.html"${isTeam ? ' class="active"' : ''}>Team</a>
      <a href="/contact.html"${isContact ? ' class="active"' : ''}>Contact</a>
      <a href="/contact.html#quote" class="cta-button">Get a quote</a>
    </div>
  </nav>
  `.trim();
}

export function getFooter() {
  return `
  <footer class="site-footer">
    <div class="footer-grid container">
      <!-- Column 1: Brand & Contact Info -->
      <div class="footer-column">
        <a href="/" class="nav-logo" style="margin-bottom: 0.5rem;" aria-label="Unbound3D Homepage">
          <img src="/logo.png" alt="Unbound3D Logo" class="logo-img" width="28" height="28">
          <div class="nav-brand-text">
            <span class="brand-name">Unbound3D</span>
          </div>
        </a>
        <p style="opacity: 0.85; font-size: 0.9rem; line-height: 1.6; max-width: 320px; margin-bottom: 1rem;">
          From process selection and production to quality inspection and delivery, Unbound3D manages manufacturing through one accountable partner.
        </p>
        <div style="opacity: 0.7; font-size: 0.85rem; line-height: 1.6; max-width: 300px;">
          <strong>Unbound3D Industries Pvt Ltd</strong><br>
          Indiranagar, Bengaluru, Karnataka, India<br>
          Phone / WhatsApp: <a href="https://wa.me/917558150570" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">+91 75581 50570</a><br>
          Email: <a href="mailto:info@unbound3d.com" style="color: inherit; text-decoration: underline;">info@unbound3d.com</a><br>
          GST: 29AAECU0620P1Z1<br>
          <span style="display: inline-block; margin-top: 0.4rem; padding: 0.2rem 0.5rem; background: rgba(255,255,255,0.08); border-radius: 4px; font-weight: 500;">ISO 9001:2015 certified</span>
        </div>
        <div style="display: flex; gap: 1rem; opacity: 0.7; margin-top: 1rem;">
          <!-- LinkedIn -->
          <a href="https://linkedin.com/company/unbound3d/" target="_blank" rel="noopener noreferrer" aria-label="Unbound3D on LinkedIn" style="color: inherit; display: flex; align-items: center;">
            <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
      </div>

      <!-- Column 2: Offerings -->
      <div class="footer-column">
        <h4>Offerings</h4>
        <div class="footer-links">
          <a href="/manufacturing.html">Manufacturing</a>
          <a href="/lynx-350.html">Lynx-350</a>
          <a href="/how-we-work.html">How we work</a>
        </div>
      </div>

      <!-- Column 3: Company -->
      <div class="footer-column">
        <h4>Company</h4>
        <div class="footer-links">
          <a href="/team.html">Team</a>
          <a href="/careers.html">Careers</a>
          <a href="/contact.html">Contact</a>
        </div>
      </div>

      <!-- Column 4: Quick Actions -->
      <div class="footer-column">
        <h4>Get Started</h4>
        <div class="footer-links">
          <a href="/contact.html#quote" style="font-weight: 600; color: #fff;">Get a quote &rarr;</a>
          <a href="https://wa.me/917558150570" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          <a href="mailto:info@unbound3d.com">Email Drawings</a>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="container footer-bottom">
      <div>&copy; 2026 Unbound3D Industries Pvt Ltd. All rights reserved.</div>
      <div class="footer-legal-links">
        <span>ISO 9001:2015 certified</span>
        <a href="/contact.html">Terms &amp; Enquiries</a>
      </div>
    </div>
  </footer>
  `.trim();
}

export const Nav = getNav();
export const Footer = getFooter();
