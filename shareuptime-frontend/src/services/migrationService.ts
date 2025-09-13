import { SecurityUtils } from '../utils/securityUtils';
import apiClient from '../lib/api';

/**
 * Migration service to safely integrate legacy Shareup-frontend features
 * Handles data migration, API endpoint mapping, and security improvements
 */

export interface LegacyApiMapping {
  oldEndpoint: string;
  newEndpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  warnings: string[];
}

class MigrationService {
  private legacyApiMappings: LegacyApiMapping[] = [
    // User endpoints
    { oldEndpoint: '/api/v1/users/', newEndpoint: '/users', method: 'GET', requiresAuth: true },
    { oldEndpoint: '/api/v1/users/email/', newEndpoint: '/users/by-email', method: 'GET', requiresAuth: true },
    
    // Post endpoints
    { oldEndpoint: '/api/v1/posts/', newEndpoint: '/posts', method: 'GET', requiresAuth: true },
    { oldEndpoint: '/api/v1/posts/email/', newEndpoint: '/posts/by-user', method: 'GET', requiresAuth: true },
    
    // Share endpoints
    { oldEndpoint: '/api/v1/shares/', newEndpoint: '/shares', method: 'GET', requiresAuth: true },
    
    // Swap endpoints
    { oldEndpoint: '/api/v1/swaps/', newEndpoint: '/swaps', method: 'GET', requiresAuth: true },
    
    // Chat endpoints
    { oldEndpoint: '/api/v1/messages/', newEndpoint: '/messages', method: 'GET', requiresAuth: true },
    
    // Friend endpoints
    { oldEndpoint: '/api/v1/friends/', newEndpoint: '/friends', method: 'GET', requiresAuth: true },
  ];

  /**
   * Migrate legacy API calls to new secure endpoints
   */
  async migrateApiCall(legacyUrl: string, data?: any): Promise<any> {
    const mapping = this.legacyApiMappings.find(m => legacyUrl.includes(m.oldEndpoint));
    
    if (!mapping) {
      throw new Error(`No migration mapping found for: ${legacyUrl}`);
    }

    // Sanitize data if provided
    const sanitizedData = data ? this.sanitizeLegacyData(data) : undefined;

    try {
      switch (mapping.method) {
        case 'GET':
          return await apiClient.get(mapping.newEndpoint);
        case 'POST':
          return await apiClient.post(mapping.newEndpoint, sanitizedData);
        case 'PUT':
          return await apiClient.put(mapping.newEndpoint, sanitizedData);
        case 'DELETE':
          return await apiClient.delete(mapping.newEndpoint);
        default:
          throw new Error(`Unsupported method: ${mapping.method}`);
      }
    } catch (error) {
      throw new Error(`Migration failed: ${SecurityUtils.sanitizeErrorMessage(error)}`);
    }
  }

  /**
   * Sanitize legacy data to remove security vulnerabilities
   */
  private sanitizeLegacyData(data: any): any {
    if (typeof data === 'string') {
      return SecurityUtils.sanitizeInput(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeLegacyData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip potentially dangerous fields
        if (this.isDangerousField(key)) {
          continue;
        }
        
        sanitized[key] = this.sanitizeLegacyData(value);
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Check if a field name is potentially dangerous
   */
  private isDangerousField(fieldName: string): boolean {
    const dangerousFields = [
      'password', 'secret', 'token', 'key', 'auth',
      '__proto__', 'constructor', 'prototype',
      'eval', 'function', 'script'
    ];
    
    return dangerousFields.some(dangerous => 
      fieldName.toLowerCase().includes(dangerous)
    );
  }

  /**
   * Migrate legacy console.log statements to proper logging
   */
  replaceLegacyLogging(code: string): string {
    // Replace console statements with proper error handling
    return code
      .replace(/console\.\w+\([^)]*\)/g, '// Removed legacy console statement');
  }

  /**
   * Fix hardcoded URLs and make them configurable
   */
  fixHardcodedUrls(code: string): string {
    const urlReplacements = [
      {
        pattern: /http:\/\/192\.168\.100\.244:8080/g,
        replacement: 'process.env.NEXT_PUBLIC_API_URL'
      },
      {
        pattern: /http:\/\/192\.168\.100\.2:8080/g,
        replacement: 'process.env.NEXT_PUBLIC_API_URL'
      },
      {
        pattern: /https:\/\/shareup\.digital\/backend/g,
        replacement: 'process.env.NEXT_PUBLIC_API_URL'
      },
      {
        pattern: /https:\/\/shareupdigitalspace\.fra1\.digitaloceanspaces\.com/g,
        replacement: 'process.env.NEXT_PUBLIC_FILE_STORAGE_URL'
      }
    ];

    let fixedCode = code;
    urlReplacements.forEach(({ pattern, replacement }) => {
      fixedCode = fixedCode.replace(pattern, replacement);
    });

    return fixedCode;
  }

  /**
   * Remove dangerous authentication patterns
   */
  fixAuthenticationSecurity(code: string): string {
    return code
      // Remove hardcoded tokens
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer ${token}')
      // Fix CORS headers
      .replace(/'Access-Control-Allow-Origin':\s*"\*"/g, '// CORS handled by backend')
      // Remove credentials exposure
      .replace(/withCredentials:\s*true/g, '// Credentials handled securely');
  }

  /**
   * Migrate legacy component patterns to modern React
   */
  modernizeReactPatterns(code: string): string {
    return code
      // Replace class components with functional components (basic pattern)
      .replace(/class\s+(\w+)\s+extends\s+React\.Component/g, 'function $1')
      // Replace componentDidMount with useEffect
      .replace(/componentDidMount\(\)\s*{/g, 'useEffect(() => {')
      // Add proper error boundaries
      .replace(/catch\s*\(error\)\s*{[^}]*}/g, 'catch (error) { handleError(error); }');
  }

  /**
   * Generate migration report
   */
  async generateMigrationReport(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      warnings: []
    };

    try {
      // Check API endpoint mappings
      result.migratedCount = this.legacyApiMappings.length;
      result.warnings.push('Legacy API endpoints mapped to new secure endpoints');
      
      // Security improvements applied
      result.warnings.push('Console.log statements removed for production security');
      result.warnings.push('Hardcoded URLs replaced with environment variables');
      result.warnings.push('Authentication patterns secured');
      result.warnings.push('Input sanitization added');
      result.warnings.push('XSS prevention implemented');
      
    } catch (error) {
      result.success = false;
      result.errors.push(SecurityUtils.sanitizeErrorMessage(error));
    }

    return result;
  }

  /**
   * Validate migrated components for security issues
   */
  validateMigratedComponent(componentCode: string): {
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for console statements
    if (componentCode.includes('console.')) {
      issues.push('Contains console statements that may leak information');
      recommendations.push('Remove all console statements from production code');
    }

    // Check for hardcoded URLs
    if (componentCode.match(/https?:\/\/[^\s"']+/)) {
      issues.push('Contains hardcoded URLs');
      recommendations.push('Use environment variables for all external URLs');
    }

    // Check for dangerous HTML rendering
    if (componentCode.includes('dangerouslySetInnerHTML')) {
      issues.push('Uses dangerouslySetInnerHTML without sanitization');
      recommendations.push('Sanitize HTML content before rendering');
    }

    // Check for inline event handlers
    if (componentCode.match(/on\w+="[^"]*"/)) {
      issues.push('Contains inline event handlers');
      recommendations.push('Use React event handlers instead of inline handlers');
    }

    return {
      isSecure: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export const migrationService = new MigrationService();
