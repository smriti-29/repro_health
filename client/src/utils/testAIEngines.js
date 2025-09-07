// Test file to verify AI engines are working
import AIReasoningEngine from '../ai/aiReasoning';
import PersonalContextEngine from './personalContextEngine';
import MedicalRulesEngine from './medicalRulesEngine';

export const testAIEngines = () => {
  console.log('🧪 Testing AI Engines...');
  
  try {
    // Test 1: Initialize engines
    const aiReasoning = new AIReasoningEngine();
    const personalContext = new PersonalContextEngine();
    const medicalRules = new MedicalRulesEngine();
    
    console.log('✅ All AI engines initialized successfully');
    
    // Test 2: Test with sample data
    const testData = {
      userId: 'test123',
      fullName: 'Test User',
      dateOfBirth: '1995-01-01',
      genderIdentity: 'Female',
      reproductiveAnatomy: ['uterus', 'ovaries'],
      chronicConditions: ['PCOS'],
      lifestyle: {
        exercise: 'Regular',
        diet: 'Balanced',
        stress: 'Low',
        tobacco: 'No'
      },
      medications: ['Metformin'],
      isPregnant: false
    };
    
    // Test 3: Generate personal context
    const context = personalContext.generatePersonalContext(testData);
    console.log('✅ Personal context generated:', context);
    
    // Test 4: Apply medical rules
    const rules = medicalRules.applyClinicalRules(testData, context);
    console.log('✅ Medical rules applied:', rules);
    
    // Test 5: AI reasoning
    const reasoning = aiReasoning.analyzeUserHealth(testData);
    console.log('✅ AI reasoning completed:', reasoning);
    
    console.log('🎉 All AI engines are working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ AI engine test failed:', error);
    return false;
  }
};

export const testWithRealData = (userData) => {
  if (!userData) {
    console.log('No user data provided for testing');
    return false;
  }
  
  try {
    const aiReasoning = new AIReasoningEngine();
    const personalContext = new PersonalContextEngine();
    const medicalRules = new MedicalRulesEngine();
    
    console.log('🧪 Testing with real user data:', userData);
    
    const context = personalContext.generatePersonalContext(userData);
    const rules = medicalRules.applyClinicalRules(userData, context);
    const reasoning = aiReasoning.analyzeUserHealth(userData);
    
    console.log('✅ Real data test successful');
    console.log('Context:', context);
    console.log('Rules:', rules);
    console.log('Reasoning:', reasoning);
    
    return { context, rules, reasoning };
    
  } catch (error) {
    console.error('❌ Real data test failed:', error);
    return false;
  }
};
