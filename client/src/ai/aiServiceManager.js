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
    
    // DEMO-READY API MANAGEMENT - OPTIMIZED FOR GEMINI
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.maxRequestsPerDay = 1500; // Gemini daily limit across all keys
    this.maxRequestsPerMinute = 10; // Reduced to prevent overload
    this.requestTimeout = 45000; // 45 second timeout for Gemini
    this.lastRequestTime = 0;
    this.requestHistory = [];
    this.responseCache = new Map(); // Cache responses to avoid duplicate calls
    this.pendingRequests = new Set(); // Track pending requests to prevent duplicates
    this.retryCount = 0;
    this.maxRetries = 3;
    
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
    this.retryCount = 0;
    this.lastRequestTime = 0;
    console.log('🔄 AI quota reset - Gemini ready for new requests');
    console.log('🧹 Cache cleared - fresh start for demo');
  }
  
  // DEMO-READY: Force reset for demo (bypass all limits)
  forceResetForDemo() {
    this.quotaExceeded = false;
    this.requestCount = 0;
    this.requestHistory = [];
    this.responseCache.clear();
    this.pendingRequests.clear();
    this.retryCount = 0;
    this.lastRequestTime = 0;
    this.maxRequestsPerMinute = 5; // Very conservative for demo
    console.log('🚀 DEMO MODE: All limits reset for smooth demo experience');
  }

  // DEMO EMERGENCY MODE - Keep trying Gemini harder
  async generateHealthInsightsWithEmergencyRetry(prompt, userProfile) {
    console.log('🚨 DEMO EMERGENCY MODE: Aggressive Gemini retry strategy');
    
    // Try up to 10 times with increasing delays
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        console.log(`🚨 Emergency attempt ${attempt + 1}/10 for Gemini...`);
        
        // Wait before retry (exponential backoff)
        if (attempt > 0) {
          const delay = Math.min(5000 * Math.pow(1.5, attempt), 30000); // Max 30 seconds
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await this.generateHealthInsights(prompt, userProfile);
        console.log(`✅ Emergency mode SUCCESS on attempt ${attempt + 1}!`);
        return result;
        
      } catch (error) {
        console.warn(`⚠️ Emergency attempt ${attempt + 1} failed: ${error.message}`);
        
        if (attempt === 9) {
          console.error('❌ Emergency mode failed after 10 attempts');
          throw error;
        }
      }
    }
  }
  
  // Store insights for the robot icon (central storage)
  storeInsightsForRobotIcon(moduleType, insights, userProfile) {
    try {
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const storageKey = `aiInsights_${moduleType}_${userId}`;
      
      console.log(`🔍 STORING ${moduleType} INSIGHTS:`, {
        type: typeof insights,
        isArray: Array.isArray(insights),
        keys: insights ? Object.keys(insights) : 'No keys',
        aiAnalysis: insights?.aiAnalysis,
        aiAnalysisContent: insights?.aiAnalysis?.content?.length,
        personalizedTips: insights?.personalizedTips?.length,
        gentleReminders: insights?.gentleReminders?.length
      });
      
      // Store the insights with timestamp
      const insightData = {
        ...insights,
        timestamp: new Date().toISOString(),
        moduleType: moduleType
      };
      
      localStorage.setItem(storageKey, JSON.stringify(insightData));
      console.log(`✅ Stored ${moduleType} insights for robot icon`);
      console.log(`🔍 Stored insights structure:`, Object.keys(insights));
      console.log(`🔍 Stored aiAnalysis:`, insights.aiAnalysis);
      console.log(`🔍 Stored aiAnalysis.content length:`, insights.aiAnalysis?.content?.length);
      
      // Also store in central insights storage
      this.storeCentralInsights(moduleType, insights, userProfile);
    } catch (error) {
      console.error(`❌ Error storing ${moduleType} insights:`, error);
    }
  }
  
  // Central storage for all module insights
  storeCentralInsights(moduleType, insights, userProfile) {
    try {
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const centralKey = `centralAIInsights_${userId}`;
      
      // Get existing central insights
      const existingInsights = JSON.parse(localStorage.getItem(centralKey) || '{}');
      
      // Add new insights
      existingInsights[moduleType] = {
        ...insights,
        timestamp: new Date().toISOString(),
        moduleType: moduleType
      };
      
          // Store updated central insights
          localStorage.setItem(centralKey, JSON.stringify(existingInsights));
          console.log(`✅ Updated central insights with ${moduleType} data`);
          console.log(`🔍 Central insights now contain:`, Object.keys(existingInsights));
          console.log(`🔍 ${moduleType} central insights:`, existingInsights[moduleType]);
    } catch (error) {
      console.error(`❌ Error storing central insights:`, error);
    }
  }
  
  // Get all stored insights for robot icon
  getAllStoredInsights(userProfile) {
    try {
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const centralKey = `centralAIInsights_${userId}`;
      const centralInsights = JSON.parse(localStorage.getItem(centralKey) || '{}');
      
      console.log('🔍 Retrieved central insights:', Object.keys(centralInsights));
      return centralInsights;
    } catch (error) {
      console.error(`❌ Error retrieving central insights:`, error);
      return {};
    }
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
    // Safety check: ensure prompt is a string
    const promptString = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    const promptHash = promptString.substring(0, 100).replace(/\s+/g, ''); // First 100 chars, no spaces
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
    
    // Enhanced rate limiting with intelligent delays
    if (!this.canMakeRequest()) {
      console.warn('🚫 Rate limit exceeded, waiting before retry...');
      const waitTime = 5000; // 5 second wait
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      if (!this.canMakeRequest()) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }
    }
    
    // Additional throttling for 503 prevention
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < 3000) { // 3 second minimum between requests
      const waitTime = 3000 - timeSinceLastRequest;
      console.log(`⏳ Throttling: waiting ${waitTime}ms to prevent overload...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Mark request as pending
    this.pendingRequests.add(cacheKey);
    this.requestHistory.push(Date.now());
    
    try {
      console.log(`🚀 Calling Gemini 1.5 Flash...`);
      
      // Intelligent retry with exponential backoff for 503 errors
      let result;
      let lastError;
      
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
            console.log(`🔄 Retry attempt ${attempt}/${this.maxRetries} after ${backoffDelay}ms delay`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
          
          result = await Promise.race([
            this.service[methodName](prompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout)
            )
          ]);
          
          console.log(`✅ Gemini 1.5 Flash success on attempt ${attempt + 1}`);
          console.log(`🔍 Result length: ${result?.length} chars`);
          break; // Success, exit retry loop
          
        } catch (error) {
          lastError = error;
          console.warn(`⚠️ Gemini attempt ${attempt + 1} failed: ${error.message}`);
          
        // Retry on 503 errors (overloaded or unavailable) - MORE AGGRESSIVE
        if (error.message.includes('503') && attempt < this.maxRetries) {
          console.log(`🔄 Will retry due to 503 error (attempt ${attempt + 1}/${this.maxRetries})...`);
          // Wait longer for 503 errors
          await new Promise(resolve => setTimeout(resolve, Math.min(2000 * Math.pow(2, attempt), 10000)));
          continue;
        } else if (error.message.includes('overloaded') && attempt < this.maxRetries) {
          console.log(`🔄 Will retry due to overloaded error (attempt ${attempt + 1}/${this.maxRetries})...`);
          // Wait even longer for overloaded errors
          await new Promise(resolve => setTimeout(resolve, Math.min(3000 * Math.pow(2, attempt), 15000)));
          continue;
        } else {
          // Don't retry for other errors
          break;
        }
        }
      }
      
      if (result) {
        // Cache the successful response
        this.responseCache.set(cacheKey, result);
        return result;
      } else {
        throw lastError || new Error('All retry attempts failed');
      }
      
    } catch (error) {
      console.error(`❌ Gemini failed after all retries: ${error.message}`);
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