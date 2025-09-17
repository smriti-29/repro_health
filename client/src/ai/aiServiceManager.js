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
          this.quotaExceeded = false;
          this.requestCount = 0;
          this.maxRequestsPerHour = 1500; // Gemini daily limit
          this.requestTimeout = 30000; // 30 second timeout for reliable Gemini responses
    this.lastRequestTime = 0;
    this.requestHistory = [];
    
    console.log('🤖 AI Service Manager initialized - Gemini 1.5 Flash Primary');
    console.log('🔧 Primary provider: Gemini 1.5 Flash (Google)');
    console.log('🔧 Fallback provider: Ollama + LLaVA (Local)');
    console.log('🔧 Active service:', this.service.constructor.name);
    console.log('🔧 Service configured:', this.service.isConfigured());
          console.log('⏱️ Rate limit: 1500 requests per day (Gemini daily limit)');
  }

  // ===== HELPER METHOD FOR FALLBACK LOGIC =====
  
  // Reset quota (for testing/demo purposes)
  resetQuota() {
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.requestHistory = [];
    console.log('🔄 AI quota reset - Gemini ready for new requests');
  }
  
  // Check if we can make a request based on rate limiting
  canMakeRequest() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Clean old requests from history
    this.requestHistory = this.requestHistory.filter(time => time > oneHourAgo);
    
    // Check if we're under the rate limit
    if (this.requestHistory.length >= this.maxRequestsPerHour) {
      console.warn(`🚫 Rate limit reached: ${this.requestHistory.length}/${this.maxRequestsPerHour} requests in the last hour`);
      return false;
    }
    
    return true;
  }

  async executeWithFallback(methodName, prompt) {
    console.log(`🚀 Gemini 1.5 Flash AI request: ${methodName}`);
    console.log(`🔍 Service configured: ${this.service.isConfigured()}`);
    console.log(`🔍 Can make request: ${this.canMakeRequest()}`);
    
    // Check rate limiting
    if (!this.canMakeRequest()) {
      console.warn('🚫 Rate limit exceeded, trying fallback');
      return await this.tryFallback(methodName, prompt, 'Rate limit exceeded');
    }
    
    // Record this request
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
        return await this.tryFallback(methodName, prompt, error.message);
      }
      
      // For other errors, throw immediately
      throw error;
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
      maxRequests: this.maxRequests
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