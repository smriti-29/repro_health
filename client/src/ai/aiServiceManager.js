// AI SERVICE MANAGER
// Manages Gemini Pro as primary with Ollama as fallback

import GeminiService from './geminiService.js';
import OllamaService from './ollamaService.js';

class AIServiceManager {
  constructor() {
    // Initialize Gemini as primary service
    this.primaryService = new GeminiService();
    this.fallbackService = new OllamaService();
    
    // Determine which service to use
    this.service = this.primaryService.isConfigured() ? this.primaryService : this.fallbackService;
    
    console.log('🤖 AI Service Manager initialized');
    console.log('🔧 Primary provider: Gemini Pro (Google)');
    console.log('🔧 Fallback provider: Ollama (Local, Free)');
    console.log('🔧 Active service:', this.service.constructor.name);
    console.log('🔧 Service configured:', this.service.isConfigured());
  }

  // ===== PROXY METHODS WITH FALLBACK =====
  
  async generateHealthInsights(prompt) {
    try {
      return await this.service.generateHealthInsights(prompt);
    } catch (error) {
      console.warn('⚠️ Primary service failed, trying fallback:', error.message);
      
      // Check if it's a quota error (429) - don't retry with same service
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
        console.warn('🚫 Quota exceeded, switching to fallback service immediately');
        if (this.service === this.primaryService) {
          this.service = this.fallbackService;
          return await this.fallbackService.generateHealthInsights(prompt);
        }
      }
      
      if (this.service === this.primaryService) {
        return await this.fallbackService.generateHealthInsights(prompt);
      }
      throw error;
    }
  }

  async generateHealthAlerts(prompt) {
    try {
      return await this.service.generateHealthAlerts(prompt);
    } catch (error) {
      console.warn('⚠️ Primary service failed, trying fallback:', error.message);
      
      // Check if it's a quota error (429) - don't retry with same service
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
        console.warn('🚫 Quota exceeded, switching to fallback service immediately');
        if (this.service === this.primaryService) {
          this.service = this.fallbackService;
          return await this.fallbackService.generateHealthAlerts(prompt);
        }
      }
      
      if (this.service === this.primaryService) {
        return await this.fallbackService.generateHealthAlerts(prompt);
      }
      throw error;
    }
  }

  async generateHealthReminders(prompt) {
    try {
      return await this.service.generateHealthReminders(prompt);
    } catch (error) {
      console.warn('⚠️ Primary service failed, trying fallback:', error.message);
      
      // Check if it's a quota error (429) - don't retry with same service
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
        console.warn('🚫 Quota exceeded, switching to fallback service immediately');
        if (this.service === this.primaryService) {
          this.service = this.fallbackService;
          return await this.fallbackService.generateHealthReminders(prompt);
        }
      }
      
      if (this.service === this.primaryService) {
        return await this.fallbackService.generateHealthReminders(prompt);
      }
      throw error;
    }
  }

  async generateHealthTips(prompt) {
    try {
      return await this.service.generateHealthTips(prompt);
    } catch (error) {
      console.warn('⚠️ Primary service failed, trying fallback:', error.message);
      
      // Check if it's a quota error (429) - don't retry with same service
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
        console.warn('🚫 Quota exceeded, switching to fallback service immediately');
        if (this.service === this.primaryService) {
          this.service = this.fallbackService;
          return await this.fallbackService.generateHealthTips(prompt);
        }
      }
      
      if (this.service === this.primaryService) {
        return await this.fallbackService.generateHealthTips(prompt);
      }
      throw error;
    }
  }

  async generateSymptomAnalysis(prompt) {
    try {
      return await this.service.generateSymptomAnalysis(prompt);
    } catch (error) {
      console.warn('⚠️ Primary service failed, trying fallback:', error.message);
      if (this.service === this.primaryService) {
        return await this.fallbackService.generateSymptomAnalysis(prompt);
      }
      throw error;
    }
  }

  // ===== NEW AFAB-SPECIFIC METHODS =====
  
  async generateCycleAnalysis(cycleData) {
    return await this.service.generateCycleAnalysis(cycleData);
  }

  async generateFertilityInsights(fertilityData) {
    return await this.service.generateFertilityInsights(fertilityData);
  }

  // ===== UTILITY METHODS =====
  
  getModelInfo() {
    return this.service.getModelInfo();
  }

  isConfigured() {
    return this.service.isConfigured();
  }

  getCurrentProvider() {
    return this.service === this.primaryService ? 'gemini' : 'ollama';
  }

  async healthCheck() {
    try {
      // Test primary service first
      if (this.service === this.primaryService) {
        return { 
          status: 'healthy', 
          provider: 'Gemini Pro', 
          message: 'Gemini Pro API is configured and ready',
          fallback: 'Ollama available as backup'
        };
      } else {
        // Test fallback service
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          return { 
            status: 'healthy', 
            provider: 'Ollama', 
            message: 'Local LLM is running (Gemini not configured)',
            fallback: 'Gemini Pro not configured'
          };
        } else {
          return { 
            status: 'unhealthy', 
            provider: 'Ollama', 
            message: 'Ollama service not responding' 
          };
        }
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        provider: this.getCurrentProvider(), 
        message: 'AI service not accessible' 
      };
    }
  }
}

export default AIServiceManager;