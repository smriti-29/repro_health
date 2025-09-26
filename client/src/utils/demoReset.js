// DEMO RESET UTILITY
// Ensures clean state for demo presentations

import AIServiceManager from '../ai/aiServiceManager.js';

class DemoReset {
  constructor() {
    this.aiService = new AIServiceManager();
  }

  // Reset everything for a clean demo
  async resetForDemo() {
    console.log('🚀 DEMO RESET: Preparing clean state for presentation...');
    
    try {
      // Reset AI service quota and cache
      this.aiService.resetQuota();
      
      // Clear any localStorage cache
      localStorage.removeItem('ai_insights_cache');
      localStorage.removeItem('health_analysis_cache');
      localStorage.removeItem('sexual_health_cache');
      localStorage.removeItem('fertility_cache');
      localStorage.removeItem('pregnancy_cache');
      localStorage.removeItem('mental_health_cache');
      
      // Clear session storage
      sessionStorage.clear();
      
      console.log('✅ DEMO RESET: Clean state ready');
      console.log('📊 Demo Status:', this.aiService.getDemoStatus());
      
      return {
        success: true,
        message: 'Demo reset complete - clean state ready',
        status: this.aiService.getDemoStatus()
      };
    } catch (error) {
      console.error('❌ Demo reset failed:', error);
      return {
        success: false,
        message: 'Demo reset failed: ' + error.message,
        error: error
      };
    }
  }

  // Get current demo status
  getDemoStatus() {
    return this.aiService.getDemoStatus();
  }

  // Clear cache only (keep quota tracking)
  clearCache() {
    this.aiService.clearCache();
    console.log('🧹 Cache cleared for fresh AI responses');
  }

  // Force reset quota (for testing)
  resetQuota() {
    this.aiService.resetQuota();
    console.log('🔄 Quota reset - ready for new requests');
  }
}

export default DemoReset;
