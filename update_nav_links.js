const fs = require('fs');
const files = ['index.html', 'inventory.html', 'vehicle.html', 'inquire.html', 'admin.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace button Inquire with standard link Inquire
  const regex = /<a href="inquire\.html" class="btn btn-small" style="margin-left: 0\.5rem; padding: 0\.5rem 1\.25rem;">Inquire<\/a>/;
  const replacement = `<a href="inquire.html"${file === 'inquire.html' ? ' class="active"' : ''}>Inquire</a>`;
  
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Nav button replaced with plain link.');
