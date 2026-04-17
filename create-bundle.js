import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const output = fs.createWriteStream('bundle.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✓ Bundle created: bundle.zip (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add dist folder contents with forward slashes
// Exclude system files like .DS_Store
const distDir = path.join(__dirname, 'dist');
archive.directory(distDir + '/', false, (entry) => {
  // Exclude system and temporary files
  if (entry.name === '.DS_Store' || entry.name.startsWith('.')) {
    return false;
  }
  return entry;
});

archive.finalize();
