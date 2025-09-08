// AI Service Test Utility
// Test the Gemini + Ollama fallback system

import AIServiceManager from '../ai/aiServiceManager.js';

export const testAIServices = async () => {
  console.log('🧪 Testing AI Services...');
  
  const aiService = new AIServiceManager();
  
  try {
    // Test health check
    console.log('🔍 Checking AI service health...');
    const healthCheck = await aiService.healthCheck();
    console.log('Health Check Result:', healthCheck);
    
    // Test basic insight generation
    console.log('🤖 Testing insight generation...');
    const testPrompt = 'Test prompt: User has irregular periods and fatigue. Provide basic health insights.';
    
    const insights = await aiService.generateHealthInsights(testPrompt);
    console.log('Generated Insights:', insights);
    
    // Check service status
    const status = aiService.getServiceStatus();
    console.log('Service Status:', status);
    
    return {
      success: true,
      healthCheck,
      insights,
      status
    };
    
  } catch (error) {
    console.error('❌ AI Service Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auto-test when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testAIServices();
  }, 2000);
}

