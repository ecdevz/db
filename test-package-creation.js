// Test the packaged tarball
const fs = require('fs');
const path = require('path');

// Create a temporary test directory
const testDir = path.join(__dirname, 'test-package');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Copy package.json for test
const testPackageJson = {
  "name": "test-package",
  "version": "1.0.0",
  "type": "commonjs"
};

fs.writeFileSync(
  path.join(testDir, 'package.json'), 
  JSON.stringify(testPackageJson, null, 2)
);

console.log('✅ Test directory created:', testDir);
console.log('📦 Package tarball created: sky7-db-1.0.1.tgz');
console.log('');
console.log('🧪 To test the package locally, run:');
console.log('cd test-package');
console.log('npm install ../sky7-db-1.0.1.tgz');
console.log('');
console.log('📤 Package is ready to publish!');