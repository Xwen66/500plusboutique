const fs = require('fs');

const files = ['index.html', 'inventory.html', 'vehicle.html', 'inquire.html', 'admin.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace Nav
  content = content.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>
        <a href="index.html"${file === 'index.html' ? ' class="active"' : ''}>Home</a>
        <a href="inventory.html"${file === 'inventory.html' ? ' class="active"' : ''}>Collection</a>
      </nav>`);

  // Replace Brand Logo in Header
  content = content.replace(/<a class="brand" href="index\.html">[\s\S]*?<\/a>/, `<a class="brand" href="index.html" style="display: flex; align-items: center;">
        <img src="assets/images/logo.png" alt="500plus Boutique" style="height: 48px; width: auto;" />
      </a>`);

  // Replace Footer
  const footerRegex = /<footer class="site-footer">[\s\S]*?<\/footer>/;
  const newFooter = `<footer class="site-footer">
    <div class="container" style="display: flex; flex-direction: column; align-items: center; gap: 2.5rem; text-align: center;">
      <a href="index.html" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">
        <img src="assets/images/logo.png" alt="500plus Boutique" style="height: 60px; width: auto; opacity: 0.9;" />
      </a>
      
      <p style="max-width: 450px; font-size: 1rem; color: var(--text-muted); line-height: 1.8;">
        An exclusive collection of premium, highly-curated vehicles. <br />
        Available by private appointment only.
      </p>

      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; font-size: 0.95rem;">
        <a class="footer-link" href="https://500plus.ca/directions" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; transition: color 0.2s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Directions
        </a>
        <a class="footer-link" href="https://500plus.ca/" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; transition: color 0.2s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          Official Website
        </a>
      </div>

      <div style="display: flex; gap: 1.5rem; justify-content: center;">
        <a href="https://www.facebook.com/funfhundertplus" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="color: var(--text-primary); transition: color 0.2s;" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://www.instagram.com/funfhundertplus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color: var(--text-primary); transition: color 0.2s;" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        </a>
      </div>

      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; letter-spacing: 0.1em; text-transform: uppercase;">
        &copy; 2026 Boutique.500plus. All rights reserved.
      </div>
    </div>
  </footer>`;

  content = content.replace(footerRegex, newFooter);
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done replacing nav, brand, and footer in 5 files.');
