import React from 'react';
import { isFeatureEnabled, isCoreFeature } from '../config/features';

// Import your existing working components
import Profile from '../pages/Profile';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';

// Component Registry - Central place to manage all components safely
class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.coreComponents = new Set();
    this.initializeCoreComponents();
  }

  // Initialize core components that are ALWAYS protected
  initializeCoreComponents() {
    // Register your working components as CORE (never affected by new features)
    this.registerCore('Profile', Profile);
    this.registerCore('Onboarding', Onboarding);
    this.registerCore('Dashboard', Dashboard);
  }

  // Register a core component (protected, never disabled)
  registerCore(name, component) {
    this.components.set(name, {
      component,
      type: 'CORE',
      protected: true,
      enabled: true
    });
    this.coreComponents.add(name);
  }

  // Register a new feature component (can be toggled)
  registerFeature(name, component, featureFlag) {
    if (this.coreComponents.has(name)) {
      console.error(`Cannot override core component: ${name}`);
      return false;
    }

    this.components.set(name, {
      component,
      type: 'FEATURE',
      protected: false,
      enabled: isFeatureEnabled(featureFlag)
    });
    return true;
  }

  // Get a component safely
  getComponent(name) {
    const componentInfo = this.components.get(name);
    
    if (!componentInfo) {
      console.error(`Component not found: ${name}`);
      return null;
    }

    // Core components are always returned
    if (componentInfo.type === 'CORE') {
      return componentInfo.component;
    }

    // Feature components only if enabled
    if (componentInfo.enabled) {
      return componentInfo.component;
    }

    // If feature is disabled, return the core component if it exists
    const coreName = this.getCoreName(name);
    if (coreName) {
      return this.getComponent(coreName);
    }

    return null;
  }

  // Get the core component name for a feature
  getCoreName(featureName) {
    const coreMapping = {
      'AdvancedProfile': 'Profile',
      'EnhancedOnboarding': 'Onboarding',
      'AdvancedDashboard': 'Dashboard'
    };
    return coreMapping[featureName];
  }

  // Check if a component is protected
  isProtected(name) {
    const componentInfo = this.components.get(name);
    return componentInfo?.protected || false;
  }

  // Check if a component is enabled
  isEnabled(name) {
    const componentInfo = this.components.get(name);
    return componentInfo?.enabled || false;
  }

  // Get all core components
  getCoreComponents() {
    return Array.from(this.coreComponents);
  }

  // Get all enabled feature components
  getEnabledFeatures() {
    return Array.from(this.components.entries())
      .filter(([_, info]) => info.type === 'FEATURE' && info.enabled)
      .map(([name, _]) => name);
  }

  // Validate the registry
  validate() {
    const coreComponents = this.getCoreComponents();
    const missing = coreComponents.filter(name => !this.components.has(name));
    
    if (missing.length > 0) {
      console.error('Missing core components:', missing);
      return false;
    }
    
    return true;
  }
}

// Create and export the registry instance
const componentRegistry = new ComponentRegistry();

// Export the registry and helper functions
export default componentRegistry;

// Helper function to safely get components
export const getSafeComponent = (name) => {
  return componentRegistry.getComponent(name);
};

// Helper function to check if component is protected
export const isComponentProtected = (name) => {
  return componentRegistry.isProtected(name);
};

// Helper function to check if component is enabled
export const isComponentEnabled = (name) => {
  return componentRegistry.isEnabled(name);
};
