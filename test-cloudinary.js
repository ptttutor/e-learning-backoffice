// Simple test script to verify Cloudinary configuration
import cloudinary from './src/lib/cloudinary.js';

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Test configuration
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', result);
    
    console.log('✅ Cloudinary is configured correctly!');
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
  }
}

testCloudinary();