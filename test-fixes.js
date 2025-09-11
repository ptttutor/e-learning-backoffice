// Simple test script to verify the fixes
const fetch = require('node-fetch');

async function testEbookCategoriesAPI() {
  try {
    console.log('🧪 Testing Ebook Categories API...');
    const response = await fetch('http://localhost:3001/api/admin/ebook-categories');
    
    if (!response.ok) {
      console.error('❌ API returned error status:', response.status);
      return false;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('❌ API did not return an array:', typeof data);
      return false;
    }
    
    console.log('✅ API returned valid array with', data.length, 'categories');
    console.log('✅ Sample category:', data[0]);
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

async function testEbooksAPI() {
  try {
    console.log('🧪 Testing Ebooks API...');
    const response = await fetch('http://localhost:3001/api/admin/ebooks');
    
    if (!response.ok) {
      console.error('❌ Ebooks API returned error status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Ebooks API response structure:', Object.keys(data));
    return true;
    
  } catch (error) {
    console.error('❌ Ebooks API test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const categoriesTest = await testEbookCategoriesAPI();
  console.log('');
  const ebooksTest = await testEbooksAPI();
  
  console.log('\n📊 Test Results:');
  console.log('Categories API:', categoriesTest ? '✅ PASS' : '❌ FAIL');
  console.log('Ebooks API:', ebooksTest ? '✅ PASS' : '❌ FAIL');
  
  if (categoriesTest && ebooksTest) {
    console.log('\n🎉 All tests passed! The fixes should resolve the reported errors.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the server logs for more details.');
  }
}

// Wait a moment for the server to be ready, then run tests
setTimeout(runTests, 2000);
