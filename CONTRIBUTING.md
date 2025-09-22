# Contributing to @sky7/db

Thank you for your interest in contributing to @sky7/db! This document provides guidelines and information for contributors.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and **explain what behavior you expected**
- **Include any error messages or logs**
- **Specify your environment** (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how the enhancement would be used

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```
3. Make your changes following the coding standards
4. Add or update tests as needed
5. Run the test suite to ensure everything passes
6. Update documentation if necessary
7. Commit your changes with a clear commit message
8. Push to your fork and submit a pull request

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/db.git
   cd db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your development environment**
   ```bash
   # Install peer dependencies for development
   npm install mongodb firebase-admin
   ```

4. **Run the build**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Run linting**
   ```bash
   npm run lint
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use modern JavaScript features (async/await, destructuring, etc.)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects and arrays
- Follow the ESLint configuration

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(mongodb): add connection pooling configuration
fix(firebase): resolve transaction timeout issue
docs(readme): update installation instructions
```

## Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Use descriptive test names that explain what is being tested
- Group related tests using `describe` blocks
- Use `beforeEach` and `afterEach` for test setup and cleanup

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

- Update the README.md if you're adding new features
- Add JSDoc comments for new public APIs
- Update the CHANGELOG.md for significant changes
- Include code examples for new features

## Release Process

Releases are handled by maintainers. The process includes:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag
4. Publish to npm
5. Create a GitHub release

## Questions?

If you have questions about contributing, please:

1. Check the existing documentation
2. Search through existing issues
3. Create a new issue with the "question" label

## Recognition

Contributors will be recognized in the README.md file and release notes.

Thank you for contributing to @sky7/db!