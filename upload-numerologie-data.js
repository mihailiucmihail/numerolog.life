const fs = require('fs');
const path = require('path');

async function uploadToBlobStorage() {
  try {
    console.log('[v0] Starting blob upload...');
    
    // Read the extracted data file
    const dataPath = path.join(__dirname, 'numerologie-extracted-data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('[v0] File not found:', dataPath);
      process.exit(1);
    }

    const fileData = fs.readFileSync(dataPath);
    console.log('[v0] File size:', (fileData.length / 1024).toFixed(2), 'KB');

    // Use Vercel Blob SDK
    const { put } = await import('@vercel/blob');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[v0] BLOB_READ_WRITE_TOKEN not set');
      process.exit(1);
    }

    // Upload to Blob
    const response = await put('numerologie-data/numerologie-22.json', fileData, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('[v0] Upload successful!');
    console.log('[v0] URL:', response.url);
    console.log('[v0] Pathname:', response.pathname);
    
  } catch (error) {
    console.error('[v0] Upload error:', error);
    process.exit(1);
  }
}

uploadToBlobStorage();
