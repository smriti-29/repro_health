// AFAB INTEGRATION TEST
// Test the integration of AFAB components with existing system

import { 
  AFABLifeStages, 
  detectAFABLifeStage, 
  getAFABWelcomeMessage, 
  getTrackingOptions,
  createAFABUserProfile 
} from '../models/AFABDataModels.js';
import AFABAIService from '../ai/afabAIService.js';

// Test data
const testUserProfile = {
  age: 28,
  sexAssignedAtBirth: 'AFAB',
  genderIdentity: 'Woman',
  pronouns: ['she', 'her'],
  conditions: {
    reproductive: ['PCOS'],
    general: []
  },
  familyHistory: {
    womensConditions: ['Endometriosis'],
    mensConditions: [],
    generalConditions: []
  },
  lifestyle: {
    exercise: { frequency: 'regular' },
    stress: { level: 'medium' }
  },
  tobaccoUse: 'No',
  menstrualCycle: {
    isRegular: false,
    averageLength: 35,
    lastPeriod: new Date().toISOString()
  }
};

// Test functions
export const testAFABDataModels = () => {
  console.log('🧪 Testing AFAB Data Models...');
  
  try {
    // Test profile creation
    const afabProfile = createAFABUserProfile(testUserProfile);
    console.log('✅ AFAB profile created successfully');
    
    // Test life stage detection
    const lifeStage = detectAFABLifeStage(afabProfile);
    console.log('✅ Life stage detected:', lifeStage);
    
    // Test welcome message
    const welcomeMessage = getAFABWelcomeMessage(lifeStage, afabProfile);
    console.log('✅ Welcome message generated:', welcomeMessage.title);
    
    // Test tracking options
    const trackingOptions = getTrackingOptions(lifeStage, afabProfile);
    console.log('✅ Tracking options generated:', trackingOptions.length, 'options');
    
    return true;
  } catch (error) {
    console.error('❌ AFAB Data Models test failed:', error);
    return false;
  }
};

export const testAFABAIService = async () => {
  console.log('🧪 Testing AFAB AI Service...');
  
  try {
    const aiService = new AFABAIService();
    
    // Test cycle insights
    const cycleData = {
      currentDay: 15,
      flow: 'medium',
      symptoms: ['cramps', 'mood_swings'],
      mood: 'irritable',
      energy: 'low'
    };
    
    const cycleInsights = await aiService.generateCycleInsights(cycleData, testUserProfile);
    console.log('✅ Cycle insights generated');
    
    // Test fertility insights
    const fertilityData = {
      isTryingToConceive: true,
      contraceptionMethod: 'none',
      ovulationTracking: {
        bbt: 98.6,
        cervicalMucus: 'egg_white',
        lhStrips: 'positive'
      }
    };
    
    const fertilityInsights = await aiService.generateFertilityInsights(fertilityData, testUserProfile);
    console.log('✅ Fertility insights generated');
    
    return true;
  } catch (error) {
    console.error('❌ AFAB AI Service test failed:', error);
    return false;
  }
};

export const testAFABIntegration = async () => {
  console.log('🚀 Starting AFAB Integration Tests...');
  
  const results = {
    dataModels: false,
    aiService: false
  };
  
  // Test data models
  results.dataModels = testAFABDataModels();
  
  // Test AI service
  results.aiService = await testAFABAIService();
  
  // Summary
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n📊 Test Results Summary:');
  console.log('Data Models:', results.dataModels ? '✅ PASS' : '❌ FAIL');
  console.log('AI Service:', results.aiService ? '✅ PASS' : '❌ FAIL');
  console.log('Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
};

// Run tests if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testAFABIntegration = testAFABIntegration;
} else {
  // Node environment
  testAFABIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default {
  testAFABDataModels,
  testAFABAIService,
  testAFABIntegration
};
