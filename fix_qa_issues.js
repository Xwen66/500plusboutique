const fs = require('fs');

// 1. Fix HTML nav links and footer opacity
const htmlFiles = ['inventory.html', 'vehicle.html', 'inquire.html', 'admin.html']; // index.html already fixed

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix nav links
  const regexNav = /<a href="inquire\.html" class="btn btn-small"[^>]*>Inquire<\/a>/g;
  content = content.replace(regexNav, `<a href="inquire.html"${file === 'inquire.html' ? ' class="active"' : ''}>Inquire</a>`);

  // Fix Footer logo opacity
  content = content.replace(/opacity: 0\.9/g, 'opacity: 1');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('HTML files fixed.');

// Fix index.html footer opacity specifically
let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/opacity: 0\.9/g, 'opacity: 1');
fs.writeFileSync('index.html', indexContent, 'utf8');

// 2. Hide Theme Dev Panel
let themeDev = fs.readFileSync('js/theme-dev.js', 'utf8');
themeDev = themeDev.replace(/document\.body\.appendChild\(panel\);/g, '// document.body.appendChild(panel); // Hidden for final production');
fs.writeFileSync('js/theme-dev.js', themeDev, 'utf8');
console.log('Theme panel hidden.');

