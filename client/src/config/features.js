// Feature Configuration - Control which features are enabled
// This allows you to build complex models without affecting existing working code

export const FEATURES = {
  // Core Working Features - NEVER DISABLE THESE
  CORE_PROFILE: true,           // Your working Profile component
  CORE_ONBOARDING: true,        // Your working Onboarding component
  CORE_DASHBOARD: true,         // Your working Dashboard component
  
  // New Advanced Features - Can be toggled on/off
  ADVANCED_PROFILE: process.env.REACT_APP_ENABLE_ADVANCED_PROFILE === 'true',
  AI_INSIGHTS: process.env.REACT_APP_ENABLE_AI_INSIGHTS === 'true',
  COMPLEX_MODELS: process.env.REACT_APP_ENABLE_COMPLEX_MODELS === 'true',
  ENHANCED_ONBOARDING: process.env.REACT_APP_ENABLE_ENHANCED_ONBOARDING === 'true',
  
  // Experimental Features - Use with caution
  EXPERIMENTAL_FEATURES: process.env.REACT_APP_ENABLE_EXPERIMENTAL === 'true',
};

// Feature Toggle Helper Functions
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};

export const getFeatureConfig = () => {
  return { ...FEATURES };
};

// Safe Feature Check - Always returns true for core features
export const isCoreFeature = (featureName) => {
  const coreFeatures = ['CORE_PROFILE', 'CORE_ONBOARDING', 'CORE_DASHBOARD'];
  return coreFeatures.includes(featureName);
};

// Environment-based feature detection
export const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

// Feature validation
export const validateFeatures = () => {
  const coreFeatures = ['CORE_PROFILE', 'CORE_ONBOARDING', 'CORE_DASHBOARD'];
  const missingCore = coreFeatures.filter(feature => !FEATURES[feature]);
  
  if (missingCore.length > 0) {
    console.error('Critical Error: Core features disabled:', missingCore);
    return false;
  }
  
  return true;
};
