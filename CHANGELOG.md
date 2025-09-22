# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-22

### Added

#### Core Features
- Unified database interface for MongoDB and Firebase Firestore
- Full TypeScript support with comprehensive type definitions
- Professional npm package structure and configuration

#### MongoDB Support
- Connection management with automatic reconnection
- CRUD operations: `insertOne`, `insertMany`, `find`, `findOne`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`
- Advanced features: indexing, document counting, collection management
- Connection pooling and timeout configuration
- Proper error handling with detailed operation results

#### Firebase Support
- Firestore integration with real-time listeners
- Document operations: `getDocument`, `setDocument`, `updateDocument`, `deleteDocument`, `addDocument`
- Collection queries with filtering, ordering, and pagination
- Real-time listeners for documents and collections
- Batch operations and transactions support
- Advanced querying capabilities

#### Developer Experience
- Comprehensive logging system with customizable loggers
- Connection status monitoring and health checks
- Type-safe operations with generics
- Detailed error handling and operation results
- Modern async/await API throughout

#### Build & Development
- TypeScript compilation with declaration files
- ESLint configuration for code quality
- Jest testing framework setup
- Automated build pipeline
- NPM publishing configuration

### Technical Details
- **Node.js**: >=16.0.0 required
- **TypeScript**: Full type safety and IntelliSense support
- **Dependencies**: MongoDB driver v6.x, Firebase Admin SDK v12.x
- **Module System**: CommonJS with proper module resolution
- **License**: MIT

### Documentation
- Comprehensive README with usage examples
- Full API documentation
- TypeScript type definitions included
- Installation and configuration guides