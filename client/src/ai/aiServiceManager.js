// AI SERVICE MANAGER
// Manages Gemini Pro as primary with Ollama as fallback

import GeminiService from './geminiService';
import OllamaService from './ollamaService';

class AIServiceManager {
  constructor() {
    // Initialize Gemini as primary service
    this.primaryService = new GeminiService();
    this.fallbackService = new OllamaService();
    
    // Determine which service to use
    this.service = this.primaryService.isConfigured() ? this.primaryService : this.fallbackService;
    this.quotaExceeded = false;
    
    console.log('🤖 AI Service Manager initialized');
    console.log('🔧 Primary provider: Gemini Pro (Google)');
    console.log('🔧 Fallback provider: Ollama (Local, Free)');
    console.log('🔧 Active service:', this.service.constructor.name);
    console.log('🔧 Service configured:', this.service.isConfigured());
  }

  // ===== HELPER METHOD FOR FALLBACK LOGIC =====
  
  async executeWithFallback(methodName, prompt) {
    try {
      return await this.service[methodName](prompt);
    } catch (error) {
      console.warn(`⚠️ Primary service failed for ${methodName}, trying fallback:`, error.message);
      
      // Check if it's a quota/rate limit error - switch to fallback permanently for this session
      if (error.message.includes('QUOTA_EXCEEDED') || 
          error.message.includes('429') || 
          error.message.includes('quota') || 
          error.message.includes('exceeded') ||
          error.message.includes('rate limit') ||
          error.message.includes('RESOURCE_EXHAUSTED')) {
        
        console.warn('🚫 Quota/rate limit exceeded, switching to Ollama fallback for this session');
        this.service = this.fallbackService;
        this.quotaExceeded = true;
        
        try {
          return await this.fallbackService[methodName](prompt);
        } catch (fallbackError) {
          console.error('❌ Both services failed:', fallbackError.message);
          throw new Error(`AI services unavailable. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
        }
      }
      
      // For other errors, try fallback if we're using primary service
      if (this.service === this.primaryService) {
        console.warn('🔄 Trying fallback service due to primary service error');
        try {
          return await this.fallbackService[methodName](prompt);
        } catch (fallbackError) {
          console.error('❌ Both services failed:', fallbackError.message);
          throw new Error(`AI services unavailable. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
        }
      }
      
      throw error;
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
      quotaExceeded: this.quotaExceeded
    };
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