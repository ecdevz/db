// Test ES module imports
import DB, { MongoDB, Firebase, ConnectionStatus } from './lib/index.js';
import { DB as DBNamed } from './lib/index.js';

console.log('🧪 Testing ES module imports...');

// Test that the main classes can be imported
console.log('✅ DB class imported (default):', typeof DB);
console.log('✅ DB class imported (named):', typeof DBNamed);
console.log('✅ MongoDB class imported:', typeof MongoDB);
console.log('✅ Firebase class imported:', typeof Firebase);
console.log('✅ ConnectionStatus enum imported:', typeof ConnectionStatus);

// Test creating DB instance with default import
try {
  const dbInstance = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    }
  });
  console.log('✅ DB instance created successfully (default import)');
  console.log('✅ DB has mongo property:', !!dbInstance.mongo);
} catch (error) {
  console.log('❌ Error creating DB instance (default):', error.message);
}

// Test creating DB instance with named import
try {
  const dbInstance2 = new DBNamed({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    }
  });
  console.log('✅ DB instance created successfully (named import)');
  console.log('✅ DB has mongo property:', !!dbInstance2.mongo);
} catch (error) {
  console.log('❌ Error creating DB instance (named):', error.message);
}

console.log('🎉 ES module test completed!');