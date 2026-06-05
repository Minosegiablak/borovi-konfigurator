const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'admin.html');
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(content);
  } catch {
    res.statusCode = 500;
    res.end('Hiba az admin oldal betöltésekor.');
  }
};
