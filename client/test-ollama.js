// Test Ollama Integration
import AIServiceManager from './src/ai/aiServiceManager.js';

async function testOllama() {
  console.log('🧪 Testing Ollama Integration...');
  
  try {
    const aiService = new AIServiceManager();
    console.log('✅ AIServiceManager created');
    
    const health = await aiService.healthCheck();
    console.log('🏥 Health check:', health);
    
    const modelInfo = aiService.getModelInfo();
    console.log('🤖 Model info:', modelInfo);
    
    // Test a simple health insight
    const prompt = "Generate 2 simple health tips for general wellness";
    console.log('🔍 Testing with prompt:', prompt);
    
    const insights = await aiService.generateHealthInsights(prompt);
    console.log('✅ Insights received:', insights);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOllama();





