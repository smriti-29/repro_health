import React from 'react';
import { isFeatureEnabled, isCoreFeature } from '../config/features';

/**
 * ProtectedComponent - Wraps existing components to ensure they're never affected by new features
 * This is your safety net - your working Profile, Onboarding, and Dashboard will always work
 */

const ProtectedComponent = ({ 
  component: Component, 
  featureName, 
  fallback = null,
  children,
  ...props 
}) => {
  // Core features are ALWAYS enabled and protected
  if (isCoreFeature(featureName)) {
    return <Component {...props}>{children}</Component>;
  }
  
  // For new features, check if they're enabled
  if (isFeatureEnabled(featureName)) {
    return <Component {...props}>{children}</Component>;
  }
  
  // If feature is disabled, show fallback or nothing
  return fallback;
};

// Higher-order component for protecting existing components
export const withProtection = (Component, featureName, fallback = null) => {
  return (props) => (
    <ProtectedComponent 
      component={Component} 
      featureName={featureName} 
      fallback={fallback}
      {...props}
    />
  );
};

// Safe component renderer
export const SafeRender = ({ 
  when, 
  children, 
  fallback = null 
}) => {
  if (when) {
    return children;
  }
  return fallback;
};

// Feature-based conditional rendering
export const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  return (
    <SafeRender when={isFeatureEnabled(feature)} fallback={fallback}>
      {children}
    </SafeRender>
  );
};

export default ProtectedComponent;
