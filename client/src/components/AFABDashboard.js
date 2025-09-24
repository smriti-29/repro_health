// AFAB DASHBOARD COMPONENT
// Comprehensive dashboard for AFAB users with lifecycle detection and personalized tracking

import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AFABAIService from '../ai/afabAIService.js';
import { 
  AFABLifeStages, 
  detectAFABLifeStage, 
  getAFABWelcomeMessage, 
  getTrackingOptions,
  createAFABUserProfile 
} from '../models/AFABDataModels.js';
import './AFABDashboard.css';

const AFABDashboard = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData } = useHealthData();
  
  // State management
  const [afabProfile, setAfabProfile] = useState(null);
  const [currentLifeStage, setCurrentLifeStage] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState(null);
  const [trackingOptions, setTrackingOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Service
  const [aiService] = useState(() => new AFABAIService());
  
  // Generate initial AI insights based on life stage
  const generateInitialInsights = useCallback(async (profile, lifeStage) => {
    try {
      let insights = null;
      
      switch (lifeStage) {
        case AFABLifeStages.REPRODUCTIVE:
          if (profile.menstrualCycle) {
            insights = await aiService.generateCycleInsights(profile.menstrualCycle, profile);
          }
          break;
          
        case AFABLifeStages.PREGNANCY:
          if (profile.pregnancy) {
            insights = await aiService.generatePregnancyInsights(profile.pregnancy, profile);
          }
          break;
          
        case AFABLifeStages.PERIMENOPAUSE:
        case AFABLifeStages.MENOPAUSE:
        case AFABLifeStages.POSTMENOPAUSE:
          if (profile.menopause) {
            insights = await aiService.generateMenopauseInsights(profile.menopause, profile);
          }
          break;
          
        default:
          // Generate general health insights
          insights = {
            generalInsights: 'Welcome to your reproductive health journey! Continue tracking your health data for personalized insights.',
            recommendations: ['Start tracking your cycle', 'Maintain healthy lifestyle', 'Schedule regular check-ups']
          };
      }
      
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating initial insights:', err);
      setAiInsights({
        generalInsights: 'AI insights temporarily unavailable. Continue tracking your health data.',
        recommendations: ['Continue tracking your health', 'Maintain healthy lifestyle', 'Consult healthcare provider if needed']
      });
    }
  }, [aiService]);
  
  // EMERGENCY FIX: COMPLETELY REMOVED useEffect to prevent infinite loop
  
  // Handle module selection - NO API CALLS TO SAVE QUOTA
  const handleModuleSelect = async (moduleId) => {
    setSelectedModule(moduleId);
    
    // Set generic insights without API calls to save quota
    const insights = {
      generalInsights: `Selected module: ${moduleId}. Navigate to the specific module to get AI-powered insights.`,
      recommendations: ['Continue tracking your health', 'Maintain healthy lifestyle', 'Consult healthcare provider if needed']
    };
    
    setAiInsights(insights);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="afab-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Initializing your AFAB dashboard...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="afab-dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Render main dashboard
  return (
    <div className="afab-dashboard">
      {/* Header Section */}
      <div className="afab-header">
        <div className="afab-welcome">
          <h1 className="afab-title">{welcomeMessage?.title}</h1>
          <p className="afab-subtitle">{welcomeMessage?.subtitle}</p>
          <p className="afab-description">{welcomeMessage?.description}</p>
        </div>
        
        <div className="afab-life-stage">
          <div className="life-stage-badge">
            <span className="life-stage-icon">
              {currentLifeStage === AFABLifeStages.PUBERTY && '🌱'}
              {currentLifeStage === AFABLifeStages.REPRODUCTIVE && '🌸'}
              {currentLifeStage === AFABLifeStages.PREGNANCY && '🤰'}
              {currentLifeStage === AFABLifeStages.POSTPARTUM && '👶'}
              {currentLifeStage === AFABLifeStages.PERIMENOPAUSE && '🍂'}
              {currentLifeStage === AFABLifeStages.MENOPAUSE && '🍁'}
              {currentLifeStage === AFABLifeStages.POSTMENOPAUSE && '🌿'}
            </span>
            <span className="life-stage-text">
              {currentLifeStage?.charAt(0).toUpperCase() + currentLifeStage?.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* AI Insights Section */}
      {aiInsights && (
        <div className="afab-insights">
          <h2>AI-Powered Insights</h2>
          <div className="insights-content">
            {aiInsights.cycleAnalysis && (
              <div className="cycle-analysis">
                <h3>Cycle Analysis</h3>
                <p><strong>Pattern:</strong> {aiInsights.cycleAnalysis.pattern}</p>
                <p><strong>Regularity:</strong> {aiInsights.cycleAnalysis.regularity}</p>
                {aiInsights.cycleAnalysis.symptoms && (
                  <div className="symptoms-analysis">
                    <h4>Symptoms Analysis:</h4>
                    <ul>
                      {aiInsights.cycleAnalysis.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {aiInsights.fertilityAssessment && (
              <div className="fertility-assessment">
                <h3>Fertility Assessment</h3>
                <p><strong>Age Factor:</strong> {aiInsights.fertilityAssessment.ageFactor}</p>
                <p><strong>Health Factors:</strong> {aiInsights.fertilityAssessment.healthFactors.join(', ')}</p>
                <p><strong>Cycle Factors:</strong> {aiInsights.fertilityAssessment.cycleFactors}</p>
              </div>
            )}
            
            {aiInsights.pregnancyAssessment && (
              <div className="pregnancy-assessment">
                <h3>Pregnancy Assessment</h3>
                <p><strong>Trimester:</strong> {aiInsights.pregnancyAssessment.trimester}</p>
                <p><strong>Risk Level:</strong> {aiInsights.pregnancyAssessment.riskLevel?.level || 'Unknown'}</p>
                {aiInsights.pregnancyAssessment.riskLevel?.factors && (
                  <p><strong>Risk Factors:</strong> {aiInsights.pregnancyAssessment.riskLevel.factors.join(', ')}</p>
                )}
              </div>
            )}
            
            {aiInsights.menopauseAssessment && (
              <div className="menopause-assessment">
                <h3>Menopause Assessment</h3>
                <p><strong>Stage:</strong> {aiInsights.menopauseAssessment.stage}</p>
                <p><strong>Hormone Therapy:</strong> {aiInsights.menopauseAssessment.hormoneTherapy}</p>
              </div>
            )}
            
            {aiInsights.generalInsights && (
              <div className="general-insights">
                <p>{aiInsights.generalInsights}</p>
              </div>
            )}
            
            {aiInsights.aiInsights && (
              <div className="ai-insights">
                <h3>AI Insights</h3>
                <p>{aiInsights.aiInsights}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Tracking Options Section */}
      <div className="afab-tracking-options">
        <h2>What would you like to track?</h2>
        <div className="tracking-grid">
          {trackingOptions.map((option) => (
            <div 
              key={option.id}
              className={`tracking-option ${selectedModule === option.id ? 'selected' : ''}`}
              onClick={() => handleModuleSelect(option.id)}
            >
              <div className="option-icon">{option.icon}</div>
              <h3 className="option-title">{option.label}</h3>
              <p className="option-description">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Medical Alerts Section */}
      {aiInsights?.medicalAlerts && aiInsights.medicalAlerts.length > 0 && (
        <div className="afab-medical-alerts">
          <h2>Medical Alerts</h2>
          <div className="alerts-list">
            {aiInsights.medicalAlerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'warning' && '⚠️'}
                  {alert.type === 'info' && 'ℹ️'}
                  {alert.type === 'error' && '🚨'}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-priority">Priority: {alert.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendations Section */}
      {aiInsights?.cycleAnalysis?.recommendations && (
        <div className="afab-recommendations">
          <h2>Personalized Recommendations</h2>
          <div className="recommendations-list">
            {aiInsights.cycleAnalysis.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {aiInsights?.fertilityAssessment?.recommendations && (
        <div className="afab-recommendations">
          <h2>Fertility Recommendations</h2>
          <div className="recommendations-list">
            {aiInsights.fertilityAssessment.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {aiInsights?.pregnancyAssessment?.recommendations && (
        <div className="afab-recommendations">
          <h2>Pregnancy Recommendations</h2>
          <div className="recommendations-list">
            {aiInsights.pregnancyAssessment.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {aiInsights?.menopauseAssessment?.recommendations && (
        <div className="afab-recommendations">
          <h2>Menopause Recommendations</h2>
          <div className="recommendations-list">
            {aiInsights.menopauseAssessment.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tips Section */}
      {aiInsights?.cycleAnalysis?.personalizedTips && (
        <div className="afab-tips">
          <h2>Personalized Tips</h2>
          <div className="tips-list">
            {aiInsights.cycleAnalysis.personalizedTips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-icon">✨</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {aiInsights?.pregnancyAssessment?.preparationTips && (
        <div className="afab-tips">
          <h2>Pregnancy Tips</h2>
          <div className="tips-list">
            {aiInsights.pregnancyAssessment.preparationTips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-icon">✨</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {aiInsights?.menopauseAssessment?.managementTips && (
        <div className="afab-tips">
          <h2>Menopause Management Tips</h2>
          <div className="tips-list">
            {aiInsights.menopauseAssessment.managementTips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-icon">✨</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AFABDashboard;
