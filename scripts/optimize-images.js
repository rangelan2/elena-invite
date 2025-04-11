const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages() {
  const imagesDir = path.join(process.cwd(), 'public/images');
  
  try {
    const files = await fs.readdir(imagesDir);
    
    for (const file of files) {
      if (!['.jpg', '.png'].some(ext => file.toLowerCase().endsWith(ext))) continue;
      
      const inputPath = path.join(imagesDir, file);
      const webpOutput = path.join(imagesDir, `${path.parse(file).name}.webp`);
      
      // Create WebP version
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(webpOutput);
      
      // If it's a PNG, also create an optimized JPG version
      if (file.toLowerCase().endsWith('.png')) {
        const jpgOutput = path.join(imagesDir, `${path.parse(file).name}.jpg`);
        await sharp(inputPath)
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(jpgOutput);
      }
      
      console.log(`✓ Optimized: ${file}`);
    }
    
    console.log('All images optimized successfully!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages(); 