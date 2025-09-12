import { pgStorage } from "./pgStorage";
import fs from 'fs';
import path from 'path';

async function migrateImages() {
  console.log('🚀 Starting image migration to PostgreSQL...');
  
  try {
    const attachedAssetsPath = path.join(process.cwd(), 'attached_assets');
    
    // Check if directory exists
    if (!fs.existsSync(attachedAssetsPath)) {
      console.log('❌ attached_assets directory not found');
      return;
    }
    
    const imageFiles = [
      'image_1756823095543.png',
      '핫딜쇼핑핑-001_1756828021740.jpg',
      '화면 캡처 2025-09-02 230916_1756822168978.png'
    ];
    
    console.log(`📁 Found ${imageFiles.length} image files to migrate`);
    
    let migratedCount = 0;
    
    for (const filename of imageFiles) {
      try {
        const filePath = path.join(attachedAssetsPath, filename);
        
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          console.log(`📄 Processing: ${filename} (${buffer.length} bytes)`);
          
          // Save to PostgreSQL
          const imageUrl = await pgStorage.saveImage(buffer, filename);
          console.log(`✅ Saved: ${filename} -> ${imageUrl}`);
          migratedCount++;
        } else {
          console.log(`⚠️  File not found: ${filename}`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate ${filename}:`, error);
      }
    }
    
    console.log(`🎉 Migration complete! ${migratedCount}/${imageFiles.length} images migrated`);
    
    // Verify images are saved
    console.log('\n🔍 Verifying saved images...');
    for (const filename of imageFiles) {
      try {
        const buffer = await pgStorage.getImage(filename);
        if (buffer) {
          console.log(`✅ Verified: ${filename} (${buffer.length} bytes)`);
        } else {
          console.log(`❌ Not found: ${filename}`);
        }
      } catch (error) {
        console.log(`❌ Error verifying ${filename}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateImages().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

export { migrateImages };