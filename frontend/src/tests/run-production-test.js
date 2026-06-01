/**
 * Production Test Runner
 * 
 * This script runs the TestSprite connection tests in production environment.
 */

// Set environment to production
process.env.NODE_ENV = 'production';

// Set production API URL for the specific deployment
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://83.101.49.191:8000/api/v1';
process.env.NEXT_PUBLIC_FRONTEND_URL = 'http://83.101.49.191:3000';

// Import the test runner
const { runAllTests } = require('./connection-test');

console.log('🚀 Running TestSprite in PRODUCTION mode');
console.log(`🌐 API URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);

// Run the tests
runAllTests()
  .then(result => {
    console.log('\n📝 PRODUCTION TEST REPORT');
    console.log('=======================');
    console.log(`Total Tests: ${result.passed + result.failed}`);
    console.log(`Passed: ${result.passed}`);
    console.log(`Failed: ${result.failed}`);
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Frontend can connect to backend in production!');
      process.exit(0);
    } else {
      console.error('\n❌ FAILURE: Frontend cannot connect to backend in production!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ ERROR: Test execution failed');
    console.error(error);
    process.exit(1);
  });