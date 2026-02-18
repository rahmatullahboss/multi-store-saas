import sharp from 'sharp';
import path from 'path';

const inputPath = path.resolve('public/assets/category-health-beauty.png');
const outputPath = path.resolve('public/assets/categories/health-beauty.webp');

sharp(inputPath)
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then((info) => {
    console.log('Conversion complete:', info);
  })
  .catch((err) => {
    console.error('Error during conversion:', err);
    process.exit(1);
  });
