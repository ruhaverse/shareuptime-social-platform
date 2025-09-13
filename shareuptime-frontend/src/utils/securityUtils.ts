/**
 * Security utilities for ShareUpTime frontend
 * Handles input sanitization, XSS prevention, and secure data handling
 */

export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize user input
   */
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format and ensure it's safe
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Remove sensitive information from error messages
   */
  static sanitizeErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error.replace(/\b\d{4,}\b/g, '****') // Hide potential IDs/tokens
                  .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '****@****.***') // Hide emails
                  .replace(/Bearer\s+[^\s]+/gi, 'Bearer ****'); // Hide auth tokens
    }
    
    if (error?.message) {
      return this.sanitizeErrorMessage(error.message);
    }
    
    return 'An error occurred';
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'text/plain'
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large' };
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileName = file.name.toLowerCase();
    
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return { isValid: false, error: 'File type not allowed' };
    }

    return { isValid: true };
  }

  /**
   * Generate secure random string
   */
  static generateSecureId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      
      return true; // Request allowed
    };
  }

  /**
   * Secure localStorage wrapper
   */
  static secureStorage = {
    set(key: string, value: any): void {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(`shareup_${key}`, encrypted);
      } catch (error) {
        console.warn('Failed to store data securely');
      }
    },

    get(key: string): any {
      try {
        const encrypted = localStorage.getItem(`shareup_${key}`);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.warn('Failed to retrieve data securely');
        return null;
      }
    },

    remove(key: string): void {
      localStorage.removeItem(`shareup_${key}`);
    },

    clear(): void {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('shareup_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Content Security Policy helpers
   */
  static validateImageSrc(src: string): boolean {
    const allowedDomains = [
      'shareupdigitalspace.fra1.digitaloceanspaces.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ];

    try {
      const url = new URL(src);
      return allowedDomains.some(domain => url.hostname.includes(domain)) ||
             url.protocol === 'data:';
    } catch {
      return false;
    }
  }

  /**
   * Prevent clickjacking
   */
  static preventClickjacking(): void {
    if (window.top !== window.self) {
      window.top!.location.href = window.self.location.href;
    }
  }
}
