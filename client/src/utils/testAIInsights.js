// Test AI Insights Integration
// This file tests the AI insights functionality

import AIServiceManager from '../ai/aiServiceManager.js';
import { AIReasoningEngine } from '../ai/aiReasoning.js';

export const testAIInsights = async () => {
  console.log('🧪 Testing AI Insights Integration...');
  
  try {
    // Test AI Service Manager
    const aiServiceManager = new AIServiceManager();
    console.log('✅ AI Service Manager initialized');
    
    // Test health check
    const healthCheck = await aiServiceManager.healthCheck();
    console.log('🏥 AI Service Health:', healthCheck);
    
    // Test AI Reasoning Engine
    const aiReasoningEngine = new AIReasoningEngine();
    console.log('✅ AI Reasoning Engine initialized');
    
    // Test with sample data
    const sampleData = {
      dateOfBirth: '1990-01-01',
      genderIdentity: 'AFAB',
      chronicConditions: ['PCOS'],
      lifestyle: {
        exerciseFrequency: 'moderate',
        diet: 'healthy',
        tobaccoUse: 'No',
        alcoholUse: 'occasional',
        sleepQuality: 'good',
        stressLevel: 'moderate'
      },
      healthLogs: [
        { mood: 'good', energy: 7, sleep: 8, timestamp: new Date().toISOString() }
      ]
    };
    
    console.log('🔍 Testing with sample data:', sampleData);
    
    // Test generateDashboardInsights
    const insights = await aiReasoningEngine.generateDashboardInsights(sampleData);
    console.log('✅ Dashboard insights generated:', insights);
    
    // Test LLM-based insights
    const prompt = `Generate 3 health insights for a 34-year-old AFAB person with PCOS who exercises moderately and has good sleep quality.`;
    
    try {
      const llmInsights = await aiServiceManager.generateHealthInsights(prompt);
      console.log('✅ LLM insights generated:', llmInsights);
    } catch (error) {
      console.warn('⚠️ LLM insights failed (expected if no API key):', error.message);
    }
    
    console.log('🎉 AI Insights test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ AI Insights test failed:', error);
    return false;
  }
};

export default testAIInsights;

