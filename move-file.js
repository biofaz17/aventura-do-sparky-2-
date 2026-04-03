const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'copilot-instructions.md');
const destDir = path.join(__dirname, '.github');
const dest = path.join(destDir, 'copilot-instructions.md');

// Create directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Read and write
const content = fs.readFileSync(source, 'utf8');
fs.writeFileSync(dest, content);

// Delete original
fs.unlinkSync(source);

console.log('✓ File created at .github/copilot-instructions.md');
