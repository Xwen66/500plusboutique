const fs = require('fs');
const files = ['index.html', 'inventory.html', 'vehicle.html', 'inquire.html', 'admin.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add the inquire button to the nav
  if (!content.includes('href="inquire.html" class="btn btn-small"')) {
    content = content.replace(/(<a href="inventory\.html"[^>]*>Collection<\/a>)/, `$1\n        <a href="inquire.html" class="btn btn-small" style="margin-left: 0.5rem; padding: 0.5rem 1.25rem;">Inquire</a>`);
  }

  // Increase logo size (header was 48px, footer was 60px)
  content = content.replace(/height: 48px/g, 'height: 80px');
  content = content.replace(/height: 60px/g, 'height: 80px');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Headers updated successfully.');
