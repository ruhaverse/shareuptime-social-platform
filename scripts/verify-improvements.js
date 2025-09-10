#!/usr/bin/env node

/**
 * ShareUpTime Platform Verification Script
 * This script validates that all improvements have been successfully implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ShareUpTime Platform Improvements Verification\n');

const checks = [
  {
    name: 'Swagger/OpenAPI Documentation',
    files: [
      'services/api-gateway/swagger.config.js',
      'services/auth-service/swagger.config.js'
    ],
    validate: () => {
      try {
        const apiGatewayConfig = require('./services/api-gateway/swagger.config.js');
        const authConfig = require('./services/auth-service/swagger.config.js');
        return apiGatewayConfig && authConfig;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Jest Test Coverage Configuration',
    files: [
      'jest.config.js',
      'jest.setup.js',
      '__tests__/api-gateway.test.js',
      '__tests__/auth-validation.test.js'
    ],
    validate: () => {
      try {
        const jestConfig = require('./jest.config.js');
        return jestConfig.collectCoverage === true;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'GitHub Actions CI Pipeline',
    files: ['.github/workflows/ci.yml'],
    validate: () => true
  },
  {
    name: 'Postman Collection',
    files: [
      'postman/ShareUpTime-API-Collection.json',
      'postman/ShareUpTime-Environment.json'
    ],
    validate: () => {
      try {
        const collection = require('./postman/ShareUpTime-API-Collection.json');
        const environment = require('./postman/ShareUpTime-Environment.json');
        return collection.info.name.includes('ShareUpTime') && 
               environment.name.includes('ShareUpTime');
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Enhanced README.md',
    files: ['README.md'],
    validate: () => {
      try {
        const readme = fs.readFileSync('README.md', 'utf8');
        return readme.includes('🚀 Quick Start') && 
               readme.includes('📚 API Documentation') &&
               readme.includes('🧪 Testing') &&
               readme.includes('📊 Monitoring & Logging');
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Rate Limiting Middleware',
    files: ['services/api-gateway/middleware/rateLimiting.js'],
    validate: () => {
      try {
        const rateLimiting = require('./services/api-gateway/middleware/rateLimiting.js');
        return rateLimiting.rateLimiters && 
               rateLimiting.dynamicRateLimit && 
               rateLimiting.applyRateLimit;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Input Validation Middleware',
    files: ['services/api-gateway/middleware/validation.js'],
    validate: () => {
      try {
        const validation = require('./services/api-gateway/middleware/validation.js');
        return validation.schemas && 
               validation.validateWithJoi && 
               validation.validateWithExpressValidator;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Updated Package.json Scripts',
    files: ['package.json'],
    validate: () => {
      try {
        const pkg = require('./package.json');
        return pkg.scripts['test:coverage'] && 
               pkg.scripts['test:ci'] && 
               pkg.scripts['test:watch'];
      } catch (e) {
        return false;
      }
    }
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

for (const check of checks) {
  process.stdout.write(`${check.name.padEnd(40)} `);
  
  // Check if all files exist
  const filesExist = check.files.every(file => {
    try {
      return fs.existsSync(path.resolve(file));
    } catch (e) {
      return false;
    }
  });
  
  // Run validation if provided
  const validationPassed = check.validate ? check.validate() : true;
  
  if (filesExist && validationPassed) {
    console.log('✅ PASS');
    passedChecks++;
  } else {
    console.log('❌ FAIL');
    if (!filesExist) {
      const missingFiles = check.files.filter(file => !fs.existsSync(path.resolve(file)));
      console.log(`   Missing files: ${missingFiles.join(', ')}`);
    }
    if (!validationPassed) {
      console.log('   Validation failed');
    }
  }
}

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 All improvements have been successfully implemented!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start the development environment: npm run dev');
  console.log('2. Access API documentation: http://localhost:3000/docs');
  console.log('3. Run tests with coverage: npm run test:coverage');
  console.log('4. Import Postman collection for API testing');
  process.exit(0);
} else {
  console.log('⚠️  Some improvements need attention. Please review the failed checks above.');
  process.exit(1);
}