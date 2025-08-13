#!/usr/bin/env node

console.log('=== Heroku Configuration Test ===\n');

// Check Node.js version
console.log(`Node.js version: ${process.version}`);

// Check environment variables
console.log('\nEnvironment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  console.log('\n✅ Running in production mode');
} else {
  console.log('\n⚠️  Not running in production mode');
}

// Check if PORT is set (Heroku requirement)
if (process.env.PORT) {
  console.log('✅ PORT environment variable is set');
} else {
  console.log('⚠️  PORT environment variable is not set');
}

// Check if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL environment variable is set');
} else {
  console.log('⚠️  DATABASE_URL environment variable is not set');
}

console.log('\n=== Test Complete ==='); 