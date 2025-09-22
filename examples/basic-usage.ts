import DB from '../src/index';

// Example usage of the @sky7/db library
async function example() {
  // Initialize the database with both MongoDB and Firebase
  const db = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'test-app',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      }
    },
    firebase: {
      serviceAccount: {
        projectId: 'your-project-id',
        privateKey: 'your-private-key',
        clientEmail: 'your-client-email'
      }
    },
    enableLogging: true
  });

  try {
    // Connect to both databases
    console.log('Connecting to databases...');
    const connectionResult = await db.connect();
    
    if (connectionResult.success) {
      console.log('✅ Connected to databases:', connectionResult.data);
    } else {
      console.error('❌ Connection failed:', connectionResult.error?.message);
      return;
    }

    // Check health status
    const health = await db.getHealthStatus();
    console.log('Health status:', health.data);

    // MongoDB operations
    if (db.mongo) {
      console.log('\n🍃 MongoDB Operations:');
      
      // Insert a document
      const insertResult = await db.mongo.insertOne('users', {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date()
      });
      
      if (insertResult.success) {
        console.log('✅ User inserted:', insertResult.data);
      }

      // Find documents
      const users = await db.mongo.find('users', { age: { $gte: 18 } });
      if (users.success) {
        console.log('✅ Found users:', users.data?.length);
      }

      // Update a document
      const updateResult = await db.mongo.updateOne(
        'users',
        { email: 'john@example.com' },
        { $set: { age: 31 } }
      );
      
      if (updateResult.success) {
        console.log('✅ User updated:', updateResult.data);
      }
    }

    // Firebase operations
    if (db.firebase) {
      console.log('\n🔥 Firebase Operations:');
      
      // Set a document
      const setResult = await db.firebase.setDocument('users/john', {
        name: 'John Doe',
        email: 'john@example.com',
        age: 31,
        updatedAt: new Date()
      });
      
      if (setResult.success) {
        console.log('✅ Document set in Firebase');
      }

      // Get a document
      const docResult = await db.firebase.getDocument('users/john');
      if (docResult.success && docResult.data) {
        console.log('✅ Retrieved document:', docResult.data);
      }

      // Listen to document changes (real-time)
      console.log('👂 Setting up real-time listener...');
      const unsubscribe = db.firebase.listenDocument('users/john', (data) => {
        console.log('📡 Document changed:', data);
      });

      // Clean up listener after 5 seconds
      setTimeout(() => {
        unsubscribe();
        console.log('🛑 Listener unsubscribed');
      }, 5000);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Disconnect from databases
    console.log('\n🔌 Disconnecting...');
    const disconnectResult = await db.disconnect();
    
    if (disconnectResult.success) {
      console.log('✅ Disconnected successfully');
    } else {
      console.error('❌ Disconnect failed:', disconnectResult.error?.message);
    }
  }
}

// Type-safe operations example
interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt?: Date;
}

async function typeSafeExample() {
  const db = new DB({
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'typed-app'
    }
  });

  if (db.mongo) {
    // Type-safe MongoDB operations
    const user: Omit<User, '_id'> = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 28,
      createdAt: new Date()
    };

    const result = await db.mongo.insertOne<User>('users', user);
    if (result.success) {
      console.log('User ID:', result.data?.insertedId);
    }

    const users = await db.mongo.find<User>('users', { age: { $gte: 25 } });
    if (users.success) {
      users.data?.forEach(user => {
        console.log(`User: ${user.name} (${user.age})`);
      });
    }
  }
}

// Run examples
if (require.main === module) {
  console.log('🚀 Starting @sky7/db example...\n');
  
  example()
    .then(() => {
      console.log('\n✅ Basic example completed');
      return typeSafeExample();
    })
    .then(() => {
      console.log('✅ Type-safe example completed');
    })
    .catch(error => {
      console.error('❌ Example failed:', error);
    });
}

export { example, typeSafeExample };