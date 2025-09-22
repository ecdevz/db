// Test importing the compiled library
const DB = require('./lib/index').default;
const { MongoDB, Firebase, ConnectionStatus } = require('./lib/index');

console.log('🧪 Testing compiled library imports...');

// Test that the main classes can be imported
console.log('✅ DB class imported:', typeof DB);
console.log('✅ MongoDB class imported:', typeof MongoDB);
console.log('✅ Firebase class imported:', typeof Firebase);
console.log('✅ ConnectionStatus enum imported:', typeof ConnectionStatus);

// Test enum values
console.log('✅ ConnectionStatus.CONNECTED:', ConnectionStatus.CONNECTED);
console.log('✅ ConnectionStatus.DISCONNECTED:', ConnectionStatus.DISCONNECTED);

// Test creating DB instance
try {
  const dbInstance = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    }
  });
  console.log('✅ DB instance created successfully');
  console.log('✅ DB has mongo property:', !!dbInstance.mongo);
  console.log('✅ DB connection status:', dbInstance.getConnectionStatus());
} catch (error) {
  console.log('❌ Error creating DB instance:', error.message);
}

console.log('🎉 Compiled library test completed!');