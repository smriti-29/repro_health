// AI SERVICE MANAGER
// Manages the local, free Ollama LLM service

import OllamaService from './ollamaService.js';

class AIServiceManager {
  constructor() {
    this.service = new OllamaService();
    
    console.log('🤖 AI Service Manager initialized');
    console.log('🔧 Using provider: Ollama (Local, Free)');
    console.log('🔧 Service type:', this.service.constructor.name);
  }

  // ===== PROXY METHODS - Maintains same interface =====
  
  async generateHealthInsights(prompt) {
    return await this.service.generateHealthInsights(prompt);
  }

  async generateHealthAlerts(prompt) {
    return await this.service.generateHealthAlerts(prompt);
  }

  async generateHealthReminders(prompt) {
    return await this.service.generateHealthReminders(prompt);
  }

  async generateHealthTips(prompt) {
    return await this.service.generateHealthTips(prompt);
  }

  async generateSymptomAnalysis(prompt) {
    return await this.service.generateSymptomAnalysis(prompt);
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
    return 'ollama';
  }

  async healthCheck() {
    try {
      // Test if Ollama is running
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        return { status: 'healthy', provider: 'Ollama', message: 'Local LLM is running' };
      } else {
        return { status: 'unhealthy', provider: 'Ollama', message: 'Ollama service not responding' };
      }
    } catch (error) {
      return { status: 'unhealthy', provider: 'Ollama', message: 'Ollama not accessible - make sure it\'s running' };
    }
  }
}

export default AIServiceManager;