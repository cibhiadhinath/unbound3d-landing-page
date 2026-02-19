export const Nav = `
  <nav>
    <a href="/" class="nav-logo">
      <img src="/logo.png" alt="Unbound3D" class="logo-img" />
      <div class="nav-brand-text">
        <span class="brand-name">Unbound3D</span>
        <span class="brand-tagline">Power To Create</span>
      </div>
    </a>
    
    <!-- Hamburger Button (Visible on Mobile) -->
    <button class="hamburger" aria-label="Toggle Menu">
        <span></span>
        <span></span>
    </button>

    <div class="nav-links">
      <a href="/hanzof.html">Hanzof</a>
      <!-- <a href="/makura.html">Makura</a> -->
      <a href="/lynx-320.html">Lynx-320</a>
      <a href="/procure.html">Procurement</a>
      <!-- Mobile Extra Options -->
      <a href="/story.html" class="mobile-only">Our Story</a>
      <a href="/careers.html" class="mobile-only">Careers</a>
      <a href="/contact.html" class="mobile-only">Contact</a>
    </div>
  </nav>
`;

export const Footer = `
  <footer>
    <div class="footer-grid container">
      <!-- Column 1: Brand -->
      <div class="footer-column">
        <div style="display: flex;">
            <img src="/logo.png" alt="Unbound3D Logo" style="height: 28px; width: auto; object-fit: contain;">
        </div>
        <div style="opacity: 0.7; font-size: 0.9rem; line-height: 1.6; max-width: 300px;">
            Unbound3D Industries Pvt Ltd.<br>
            Indiranagar, Bangalore, India.<br>
            GST: 29AAECU0620P1Z1<br>
            Mobile: +91 7558150570
        </div>
        <!-- Social Icons -->
        <div style="display: flex; gap: 1rem; opacity: 0.6;">
            <!-- LinkedIn -->
            <a href="https://linkedin.com/company/unbound3d/" target="_blank" rel="noopener noreferrer" style="color: inherit; display: flex; align-items: center;">
                <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
        </div>
      </div>

      <!-- Column 2: Platform -->
      <div class="footer-column">
        <h4>Platform</h4>
        <div class="footer-links">
            <a href="/hanzof.html">Hanzof</a>
            <a href="/lynx-320.html">Lynx-320</a>
            <a href="/procure.html">Procurement</a>
        </div>
      </div>

      <!-- Column 3: Support/Resources -->
      <div class="footer-column">
        <h4>Support</h4>
        <div class="footer-links">
            <a href="/contact.html">Contact us</a>
            <a href="#">Documentation</a>
            <a href="#">System Status</a>
        </div>
      </div>

      <!-- Column 4: Company -->
      <div class="footer-column">
        <h4>Company</h4>
        <div class="footer-links">
            <a href="/story.html">Our Story</a>
            <a href="/careers.html">Careers</a>
            <a href="#">Press</a>
        </div>
      </div>
    </div>

    <!-- Platform Note -->
    <div class="container" style="text-align: center; opacity: 0.4; font-size: 0.8rem; padding-bottom: 2rem; max-width: 600px; margin: 0 auto;">
        Unbound3D runs on a cloud-hosted platform that stores production records, machine telemetry, and inspection reports.
    </div>

    <!-- Bottom Row -->
    <div class="container footer-bottom">
      <div>&copy; ${new Date().getFullYear()} Unbound3D. All rights reserved.</div>
      <div class="footer-legal-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms & Conditions</a>
        <a href="#">Refund Policy</a>
      </div>
    </div>
  </footer>
`;
