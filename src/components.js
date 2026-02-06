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
      <!-- <a href="/hanzof.html">Hanzof</a> -->
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
    <div class="footer-content container" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; padding-bottom: 2rem;">
      <!-- Column 1: Brand -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
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
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="font-weight: 600; font-size: 1rem;">Platform</div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; opacity: 0.7;">
            <!-- <a href="/hanzof.html" style="text-decoration: none;">Hanzof</a> -->
            <!-- <a href="/makura.html" style="text-decoration: none;">Makura World</a> -->
            <a href="/lynx-320.html" style="text-decoration: none;">Lynx-320</a>
            <a href="/procure.html" style="text-decoration: none;">Procurement</a>
        </div>
      </div>

      <!-- Column 3: Support/Resources -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="font-weight: 600; font-size: 1rem;">Support</div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; opacity: 0.7;">
            <a href="/contact.html" style="text-decoration: none;">Contact us</a>
            <a href="#" style="text-decoration: none;">Documentation</a>
            <a href="#" style="text-decoration: none;">System Status</a>
        </div>
      </div>

      <!-- Column 4: Company -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="font-weight: 600; font-size: 1rem;">Company</div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; opacity: 0.7;">
            <a href="/story.html" style="text-decoration: none;">Our Story</a>
            <a href="/careers.html" style="text-decoration: none;">Careers</a>
            <a href="#" style="text-decoration: none;">Press</a>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="container" style="margin-top: 1rem; border-top: 1px solid rgba(128,128,128,0.1); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; opacity: 0.6;">
      <div>&copy; ${new Date().getFullYear()} Unbound3D. All rights reserved.</div>
      <div style="display: flex; gap: 2rem;">
        <a href="#" style="text-decoration: none;">Privacy Policy</a>
        <a href="#" style="text-decoration: none;">Terms & Conditions</a>
        <a href="#" style="text-decoration: none;">Refund Policy</a>
      </div>
    </div>
  </footer>
`;
