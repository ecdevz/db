// Test the new logger enable/disable functionality
import DB from './src/index';

console.log('🧪 Testing Logger Enable/Disable Functionality...\n');

// Test 1: Default behavior (no logging)
console.log('📝 Test 1: Default behavior (no logger, no enableLogging)');
try {
  const db1 = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    }
  });
  console.log('✅ DB created successfully with silent logging (no output should appear above)');
} catch (error) {
  console.log('❌ Error:', error);
}

// Test 2: Explicit disable logging with custom logger
console.log('\n📝 Test 2: Custom logger with enableLogging=false');
const customLogger = {
  info: (msg: string) => console.log(`[CUSTOM-INFO] ${msg}`),
  error: (msg: string) => console.log(`[CUSTOM-ERROR] ${msg}`),
  warn: (msg: string) => console.log(`[CUSTOM-WARN] ${msg}`),
  debug: (msg: string) => console.log(`[CUSTOM-DEBUG] ${msg}`)
};

try {
  const db2 = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    },
    logger: customLogger,
    enableLogging: false
  });
  console.log('✅ DB created successfully with disabled logging (no custom log output should appear above)');
} catch (error) {
  console.log('❌ Error:', error);
}

// Test 3: Enable logging with custom logger
console.log('\n📝 Test 3: Custom logger with enableLogging=true');
try {
  const db3 = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    },
    logger: customLogger,
    enableLogging: true
  });
  console.log('✅ DB created successfully with enabled logging (custom log output should appear above)');
} catch (error) {
  console.log('❌ Error:', error);
}

// Test 4: Try to enable logging without providing logger (should fail)
console.log('\n📝 Test 4: enableLogging=true without logger (should fail)');
try {
  const db4 = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test'
    },
    enableLogging: true
  });
  console.log('❌ This should not succeed');
} catch (error) {
  console.log('✅ Expected error:', (error as Error).message);
}

console.log('\n🎉 All logger tests completed!');