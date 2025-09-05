import React from 'react';
import { isFeatureEnabled, isCoreFeature } from '../config/features';
import componentRegistry from './ComponentRegistry';

const ProtectionTest = () => {
  React.useEffect(() => {
    console.log('🔒 Feature Protection Test Results:');
    console.log('Core Profile Protected:', isCoreFeature('CORE_PROFILE'));
    console.log('Core Onboarding Protected:', isCoreFeature('CORE_ONBOARDING'));
    console.log('Core Dashboard Protected:', isCoreFeature('CORE_DASHBOARD'));
    console.log('AI Insights Enabled:', isFeatureEnabled('AI_INSIGHTS'));
    console.log('Complex Models Enabled:', isFeatureEnabled('COMPLEX_MODELS'));
    
    console.log('📋 Component Registry Test Results:');
    console.log('Core Components:', componentRegistry.getCoreComponents());
    console.log('Profile Protected:', componentRegistry.isProtected('Profile'));
    console.log('Profile Enabled:', componentRegistry.isEnabled('Profile'));
    console.log('Component Registry Valid:', componentRegistry.validate());
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      borderRadius: '10px',
      margin: '20px'
    }}>
      <h3>🛡️ Protection System Test</h3>
      <p>Check the browser console for test results.</p>
      
      <div style={{ marginTop: '15px' }}>
        <h4>✅ What's Protected:</h4>
        <ul>
          <li>Profile.js - {isCoreFeature('CORE_PROFILE') ? '✅ Protected' : '❌ Not Protected'}</li>
          <li>Onboarding.js - {isCoreFeature('CORE_ONBOARDING') ? '✅ Protected' : '❌ Not Protected'}</li>
          <li>Dashboard.js - {isCoreFeature('CORE_DASHBOARD') ? '✅ Protected' : '❌ Not Protected'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>🔧 Feature Status:</h4>
        <ul>
          <li>AI Insights - {isFeatureEnabled('AI_INSIGHTS') ? '🟢 Enabled' : '🔴 Disabled'}</li>
          <li>Complex Models - {isFeatureEnabled('COMPLEX_MODELS') ? '🟢 Enabled' : '🔴 Disabled'}</li>
          <li>Advanced Profile - {isFeatureEnabled('ADVANCED_PROFILE') ? '🟢 Enabled' : '🔴 Disabled'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>📋 Registry Status:</h4>
        <p>Core Components: {componentRegistry.getCoreComponents().join(', ')}</p>
        <p>Registry Valid: {componentRegistry.validate() ? '✅ Yes' : '❌ No'}</p>
      </div>
    </div>
  );
};

export default ProtectionTest;
