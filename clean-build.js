import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeDS_Store(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (file === '.DS_Store') {
      fs.unlinkSync(filePath);
      console.log(`✓ Removed: ${filePath}`);
    } else if (stat.isDirectory() && !file.startsWith('.')) {
      removeDS_Store(filePath);
    }
  }
}

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  removeDS_Store(distDir);
  console.log('✓ Build cleanup complete');
}
