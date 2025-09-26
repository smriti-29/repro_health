// AI SERVICE MANAGER
// Manages Gemini Pro as primary with Ollama as fallback

import GeminiService from './geminiService.js';
import OllamaService from './ollamaService.js';

class AIServiceManager {
  constructor() {
    // Initialize Gemini as primary service
    this.primaryService = new GeminiService();
    this.fallbackService = new OllamaService();
    
    // Always use Gemini as primary - it's properly configured now
    this.service = this.primaryService;
    
    console.log('🔧 Primary service configured:', this.primaryService.isConfigured());
    console.log('🔧 Fallback service configured:', this.fallbackService.isConfigured());
    console.log('🔧 Active service:', this.service.constructor.name);
    
    // DEMO-READY API MANAGEMENT
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.maxRequestsPerDay = 1500; // Gemini daily limit across all keys
    this.maxRequestsPerMinute = 15; // Prevent rapid-fire requests
    this.requestTimeout = 30000; // 30 second timeout for faster fallback
    this.lastRequestTime = 0;
    this.requestHistory = [];
    this.responseCache = new Map(); // Cache responses to avoid duplicate calls
    this.pendingRequests = new Set(); // Track pending requests to prevent duplicates
    
    console.log('🤖 AI Service Manager initialized - DEMO-READY with caching');
    console.log('🔧 Primary provider: Gemini 1.5 Flash (Google)');
    console.log('🔧 Fallback provider: Ollama + LLaVA (Local)');
    console.log('🔧 Active service:', this.service.constructor.name);
    console.log('🔧 Service configured:', this.service.isConfigured());
    console.log('⏱️ Rate limit: 1500 requests per day (Gemini daily limit)');
    console.log('🚀 DEMO MODE: Caching enabled, throttling active');
  }

  // ===== HELPER METHOD FOR FALLBACK LOGIC =====
  
  // DEMO-READY: Reset quota and clear cache (for testing/demo purposes)
  resetQuota() {
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.requestHistory = [];
    this.responseCache.clear();
    this.pendingRequests.clear();
    console.log('🔄 AI quota reset - Gemini ready for new requests');
    console.log('🧹 Cache cleared - fresh start for demo');
  }

  // DEMO-READY: Clear cache only (keep quota tracking)
  clearCache() {
    this.responseCache.clear();
    this.pendingRequests.clear();
    console.log('🧹 Cache cleared - fresh AI responses');
  }
  
  // DEMO-READY: Enhanced rate limiting with caching
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Clean old requests from history
    this.requestHistory = this.requestHistory.filter(time => time > oneDayAgo);
    
    // Check daily limit
    if (this.requestHistory.length >= this.maxRequestsPerDay) {
      console.warn(`🚫 Daily rate limit reached: ${this.requestHistory.length}/${this.maxRequestsPerDay} requests today`);
      return false;
    }
    
    // Check per-minute limit (prevent rapid-fire requests)
    const recentRequests = this.requestHistory.filter(time => time > oneMinuteAgo);
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      console.warn(`🚫 Per-minute rate limit reached: ${recentRequests.length}/${this.maxRequestsPerMinute} requests in the last minute`);
      return false;
    }
    
    return true;
  }

  // DEMO-READY: Generate cache key for request deduplication
  generateCacheKey(methodName, prompt) {
    const promptHash = prompt.substring(0, 100).replace(/\s+/g, ''); // First 100 chars, no spaces
    return `${methodName}_${promptHash}`;
  }

  // DEMO-READY: Check if request is already pending (prevent duplicates)
  isRequestPending(methodName, prompt) {
    const cacheKey = this.generateCacheKey(methodName, prompt);
    return this.pendingRequests.has(cacheKey);
  }

  // DEMO-READY: Enhanced executeWithFallback with caching and deduplication
  async executeWithFallback(methodName, prompt) {
    const cacheKey = this.generateCacheKey(methodName, prompt);
    
    // Check if we have a cached response
    if (this.responseCache.has(cacheKey)) {
      console.log(`🚀 Using cached response for ${methodName}`);
      return this.responseCache.get(cacheKey);
    }
    
    // Check if request is already pending (prevent duplicates)
    if (this.isRequestPending(methodName, prompt)) {
      console.log(`⏳ Request already pending for ${methodName}, waiting...`);
      // Wait for the pending request to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (this.responseCache.has(cacheKey)) {
        return this.responseCache.get(cacheKey);
      }
    }
    
    console.log(`🚀 Gemini 1.5 Flash AI request: ${methodName}`);
    console.log(`🔍 Service configured: ${this.service.isConfigured()}`);
    console.log(`🔍 Can make request: ${this.canMakeRequest()}`);
    
    // Check rate limiting
    if (!this.canMakeRequest()) {
      console.warn('🚫 Rate limit exceeded, trying fallback');
      return await this.tryFallback(methodName, prompt, 'Rate limit exceeded');
    }
    
    // Mark request as pending
    this.pendingRequests.add(cacheKey);
    this.requestHistory.push(Date.now());
    
    try {
      console.log(`🚀 Calling Gemini 1.5 Flash...`);
      // Use Gemini with optimized timeout
      const result = await Promise.race([
        this.service[methodName](prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout)
        )
      ]);
      
      console.log(`✅ Gemini 1.5 Flash success`);
      console.log(`🔍 Result length: ${result?.length} chars`);
      
      // Cache the successful response
      this.responseCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.warn(`⚠️ Gemini failed: ${error.message}`);
      
      // Only fallback on total failure (500 errors, network issues)
      if (error.message.includes('QUOTA_EXCEEDED') || 
          error.message.includes('429') || 
          error.message.includes('500') ||
          error.message.includes('503') ||
          error.message.includes('network') ||
          error.message.includes('timeout')) {
        
        console.warn('🔄 Total failure detected, trying Ollama + LLaVA fallback');
        const fallbackResult = await this.tryFallback(methodName, prompt, error.message);
        
        // Cache fallback response too
        this.responseCache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      // For other errors, throw immediately
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
    }
  }

  async tryFallback(methodName, prompt, primaryError) {
    try {
      console.log(`🔄 Starting Ollama + LLaVA fallback...`);
      
      // Ensure Ollama is running
      await this.ensureOllamaRunning();
      
      const fallbackResult = await Promise.race([
        this.fallbackService[methodName](prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fallback timeout')), 10000) // 10s for Ollama
        )
      ]);
      
      console.log(`✅ Ollama + LLaVA fallback success`);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('❌ Both services failed');
      throw new Error(`AI services unavailable. Gemini: ${primaryError}, Ollama: ${fallbackError.message}`);
    }
  }

  async ensureOllamaRunning() {
    try {
      // Check if Ollama is running, if not, start LLaVA
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        console.log('🔧 Starting Ollama + LLaVA...');
        // This would ideally trigger: ollama run llava
        // For now, we'll just proceed and let it fail gracefully
      }
    } catch (error) {
      console.warn('⚠️ Ollama not accessible:', error.message);
    }
  }

  // ===== PROXY METHODS WITH FALLBACK =====
  
  async generateHealthInsights(prompt) {
    return this.executeWithFallback('generateHealthInsights', prompt);
  }

  async generateHealthAlerts(prompt) {
    return this.executeWithFallback('generateHealthAlerts', prompt);
  }

  async generateHealthReminders(prompt) {
    return this.executeWithFallback('generateHealthReminders', prompt);
  }

  async generateHealthTips(prompt) {
    return this.executeWithFallback('generateHealthTips', prompt);
  }

  // ===== HEALTH CHECK =====
  
  async healthCheck() {
    try {
      const primaryHealth = await this.primaryService.healthCheck();
      const fallbackHealth = await this.fallbackService.healthCheck();
      
      return {
        primary: primaryHealth,
        fallback: fallbackHealth,
        activeService: this.service.constructor.name,
        quotaExceeded: this.quotaExceeded,
        configured: primaryHealth.configured || fallbackHealth.configured
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        primary: { configured: false, error: error.message },
        fallback: { configured: false, error: error.message },
        activeService: 'Unknown',
        quotaExceeded: this.quotaExceeded,
        configured: false
      };
    }
  }

  // ===== SERVICE STATUS =====
  
  getServiceStatus() {
    return {
      activeService: this.service.constructor.name,
      primaryConfigured: this.primaryService.isConfigured(),
      fallbackConfigured: this.fallbackService.isConfigured(),
      quotaExceeded: this.quotaExceeded,
      requestCount: this.requestCount,
      maxRequests: this.maxRequestsPerDay,
      cacheSize: this.responseCache.size,
      pendingRequests: this.pendingRequests.size,
      recentRequests: this.requestHistory.length
    };
  }

  // DEMO-READY: Get detailed cache and rate limiting info
  getDemoStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const recentRequests = this.requestHistory.filter(time => time > oneMinuteAgo);
    
    return {
      status: 'DEMO-READY',
      cache: {
        size: this.responseCache.size,
        pending: this.pendingRequests.size
      },
      rateLimiting: {
        daily: `${this.requestHistory.length}/${this.maxRequestsPerDay}`,
        perMinute: `${recentRequests.length}/${this.maxRequestsPerMinute}`,
        canMakeRequest: this.canMakeRequest()
      },
      services: {
        primary: this.primaryService.isConfigured(),
        fallback: this.fallbackService.isConfigured(),
        active: this.service.constructor.name
      }
    };
  }

  getCurrentProvider() {
    return this.service.constructor.name.toLowerCase().replace('service', '');
  }

  // ===== RESET SERVICE (for testing) =====
  
  resetToPrimary() {
    if (this.primaryService.isConfigured()) {
      this.service = this.primaryService;
      this.quotaExceeded = false;
      console.log('🔄 Reset to primary service (Gemini Pro)');
    } else {
      console.warn('⚠️ Cannot reset to primary service - not configured');
    }
  }
}

export default AIServiceManager;