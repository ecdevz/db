# @sky7/db

A unified, TypeScript-first database library that provides a consistent interface for both MongoDB and Firebase Firestore operations.

## Features

- 🚀 **Unified Interface**: Single API for both MongoDB and Firebase Firestore
- 📘 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🔒 **Type Safe**: Generic types for document operations
- 🔄 **Connection Management**: Automatic connection handling and health monitoring
- 📊 **Logging**: Integrated logging with customizable loggers
- ⚡ **Real-time**: Firebase real-time listeners support
- 🔥 **Modern**: Built with latest Node.js and modern JavaScript features
- 🛡️ **Error Handling**: Comprehensive error handling with detailed results

## Installation

```bash
npm install @sky7/db
```

### Peer Dependencies

```bash
npm install mongodb firebase-admin
```

## Quick Start

### Basic Setup

```typescript
import DB from '@sky7/db';

const db = new DB({
  mongodb: {
    uri: 'mongodb://localhost:27017',
    dbName: 'myapp'
  },
  firebase: {
    serviceAccount: {
      projectId: 'your-project-id',
      privateKey: 'your-private-key',
      clientEmail: 'your-client-email'
    }
  }
});

// Connect to databases
await db.connect();
```

### MongoDB Operations

```typescript
// Insert a document
const result = await db.mongo!.insertOne('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Find documents
const users = await db.mongo!.find('users', { age: { $gte: 18 } });

// Update a document
await db.mongo!.updateOne('users', 
  { email: 'john@example.com' }, 
  { $set: { age: 31 } }
);

// Delete a document
await db.mongo!.deleteOne('users', { email: 'john@example.com' });
```

### Firebase Operations

```typescript
// Set a document
await db.firebase!.setDocument('users/john', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Get a document
const user = await db.firebase!.getDocument('users/john');

// Get a collection with query
const adults = await db.firebase!.getCollection('users', {
  where: [{ field: 'age', operator: '>=', value: 18 }],
  orderBy: { field: 'name', direction: 'asc' },
  limit: 10
});

// Listen to real-time changes
const unsubscribe = db.firebase!.listenDocument('users/john', (data) => {
  console.log('User updated:', data);
});

// Clean up listener
unsubscribe();
```

## Configuration

### MongoDB Configuration

```typescript
interface MongoDBOptions {
  uri: string;
  dbName: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    retryWrites?: boolean;
    retryReads?: boolean;
  };
}
```

### Firebase Configuration

```typescript
interface FirebaseOptions {
  serviceAccount: ServiceAccount;
  databaseURL?: string;
  storageBucket?: string;
}
```

### Logger Configuration

```typescript
interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const db = new DB({
  mongodb: { /* config */ },
  firebase: { /* config */ },
  logger: {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args),
  }
});
```

## Advanced Usage

### Type-Safe Operations

```typescript
interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// MongoDB with types
const result = await db.mongo!.insertOne<User>('users', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 25,
  createdAt: new Date()
});

const users = await db.mongo!.find<User>('users', { age: { $gte: 18 } });

// Firebase with types
const user = await db.firebase!.getDocument<User>('users/jane');
const userList = await db.firebase!.getCollection<User>('users');
```

### Error Handling

All operations return `OperationResult<T>` which includes success status and error details:

```typescript
const result = await db.mongo!.insertOne('users', userData);

if (result.success) {
  console.log('User created:', result.data);
} else {
  console.error('Failed to create user:', result.error?.message);
}
```

### Connection Management

```typescript
// Check connection status
const status = db.getConnectionStatus();
console.log('MongoDB:', status.mongodb);
console.log('Firebase:', status.firebase);

// Check if all databases are connected
const isConnected = db.isConnected();

// Get detailed health status
const health = await db.getHealthStatus();
console.log('Health:', health.data);

// Disconnect from all databases
await db.disconnect();
```

### Batch Operations (Firebase)

```typescript
await db.firebase!.batchWrite([
  { type: 'set', path: 'users/user1', data: { name: 'User 1' } },
  { type: 'update', path: 'users/user2', data: { age: 30 } },
  { type: 'delete', path: 'users/user3' }
]);
```

### Transactions (Firebase)

```typescript
const result = await db.firebase!.runTransaction(async (transaction) => {
  const userRef = db.firebase!.firestore.doc('users/john');
  const userDoc = await transaction.get(userRef);
  
  if (userDoc.exists) {
    const currentAge = userDoc.data()?.age || 0;
    transaction.update(userRef, { age: currentAge + 1 });
    return { success: true, newAge: currentAge + 1 };
  }
  
  throw new Error('User not found');
});
```

## API Reference

### DB Class

#### Methods

- `constructor(options: DBOptions)` - Initialize the database instance
- `connect(): Promise<OperationResult>` - Connect to all configured databases
- `disconnect(): Promise<OperationResult>` - Disconnect from all databases
- `getConnectionStatus()` - Get connection status of all databases
- `isConnected(): boolean` - Check if all databases are connected
- `getHealthStatus(): Promise<OperationResult>` - Get detailed health status

### MongoDB Class

#### Methods

- `connect(): Promise<OperationResult<void>>`
- `disconnect(): Promise<OperationResult<void>>`
- `insertOne<T>(collection, document): Promise<OperationResult<InsertResult>>`
- `insertMany<T>(collection, documents): Promise<OperationResult>`
- `find<T>(collection, query?, options?): Promise<OperationResult<T[]>>`
- `findOne<T>(collection, query): Promise<OperationResult<T | null>>`
- `updateOne<T>(collection, query, update): Promise<OperationResult<UpdateResult>>`
- `updateMany<T>(collection, query, update): Promise<OperationResult<UpdateResult>>`
- `deleteOne<T>(collection, query): Promise<OperationResult<DeleteResult>>`
- `deleteMany<T>(collection, query): Promise<OperationResult<DeleteResult>>`
- `countDocuments<T>(collection, query?): Promise<OperationResult<number>>`
- `createIndex(collection, indexSpec, options?): Promise<OperationResult<string>>`

### Firebase Class

#### Methods

- `getDocument<T>(path): Promise<OperationResult<T | null>>`
- `setDocument<T>(path, data, options?): Promise<OperationResult<void>>`
- `updateDocument<T>(path, data): Promise<OperationResult<void>>`
- `deleteDocument(path): Promise<OperationResult<void>>`
- `addDocument<T>(collection, data): Promise<OperationResult<{id: string}>>`
- `getCollection<T>(path, options?): Promise<OperationResult<T[]>>`
- `listenDocument<T>(path, callback): UnsubscribeFunction`
- `listenCollection<T>(path, callback, options?): UnsubscribeFunction`
- `batchWrite(operations): Promise<OperationResult<void>>`
- `runTransaction<T>(updateFunction): Promise<OperationResult<T>>`

## Examples

Check out the [examples](./examples) directory for more detailed usage examples:

- [Basic Usage](./examples/basic-usage.ts)
- [Advanced MongoDB](./examples/mongodb-advanced.ts)
- [Firebase Real-time](./examples/firebase-realtime.ts)
- [Error Handling](./examples/error-handling.ts)
- [Type Safety](./examples/type-safety.ts)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/ecdevz/db/issues) on GitHub.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.