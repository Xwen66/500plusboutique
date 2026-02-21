const fs = require('fs');
const files = ['index.html', 'inventory.html', 'vehicle.html', 'inquire.html', 'admin.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Change <a href="inquire.html" class="btn btn-small" ...>Inquire</a> to <a href="inquire.html">Inquire</a>
  const regex = /<a href="inquire\.html" class="btn btn-small"[^>]*>Inquire<\/a>/g;
  
  if (content.match(regex)) {
    content = content.replace(regex, `<a href="inquire.html"${file === 'inquire.html' ? ' class="active"' : ''}>Inquire</a>`);
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Nav links updated inside HTML files.');
