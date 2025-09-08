// MENOPAUSE SUPPORT COMPONENT
// Comprehensive menopause and perimenopause support system

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AFABAIService from '../ai/afabAIService.js';
import './MenopauseSupport.css';

const MenopauseSupport = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData, addHealthLog } = useHealthData();
  
  // State management
  const [menopauseData, setMenopauseData] = useState({
    isInMenopause: false,
    menopauseType: 'natural', // natural, surgical, medical
    symptoms: {
      hotFlashes: 'none',
      nightSweats: 'none',
      moodChanges: 'none',
      sleepDisruption: 'none',
      vaginalDryness: 'none',
      weightChanges: 'none',
      memoryIssues: 'none',
      fatigue: 'none',
      anxiety: 'none',
      depression: 'none'
    },
    hormoneTherapy: {
      isOnHRT: false,
      type: null,
      dosage: null,
      sideEffects: [],
      effectiveness: null
    },
    boneHealth: {
      boneDensity: null,
      fractureRisk: null,
      calciumIntake: [],
      vitaminD: []
    },
    heartHealth: {
      bloodPressure: [],
      cholesterol: [],
      heartRate: []
    }
  });
  
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Service
  const [aiService] = useState(() => new AFABAIService());
  
  // Initialize menopause data from user profile
  useEffect(() => {
    if (profileData?.menopause) {
      setMenopauseData(prev => ({
        ...prev,
        ...profileData.menopause
      }));
    }
  }, [profileData]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setMenopauseData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle symptom changes
  const handleSymptomChange = (symptom, value) => {
    setMenopauseData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: value
      }
    }));
  };
  
  // Handle hormone therapy changes
  const handleHormoneTherapyChange = (field, value) => {
    setMenopauseData(prev => ({
      ...prev,
      hormoneTherapy: {
        ...prev.hormoneTherapy,
        [field]: value
      }
    }));
  };
  
  // Handle bone health changes
  const handleBoneHealthChange = (field, value) => {
    setMenopauseData(prev => ({
      ...prev,
      boneHealth: {
        ...prev.boneHealth,
        [field]: value
      }
    }));
  };
  
  // Save menopause data
  const saveMenopauseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create health log entry
      const healthLog = {
        type: 'menopause_tracking',
        date: new Date().toISOString(),
        data: menopauseData,
        userId: user._id
      };
      
      // Add to health data context
      await addHealthLog(healthLog);
      
      // Generate AI insights
      await generateMenopauseInsights();
      
      // Show success message
      setShowInsights(true);
      
    } catch (err) {
      console.error('Error saving menopause data:', err);
      setError('Failed to save menopause data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI insights
  const generateMenopauseInsights = async () => {
    try {
      const userProfile = {
        ...user,
        ...profileData,
        age: user.age || 25,
        conditions: profileData?.conditions || {},
        familyHistory: profileData?.familyHistory || {},
        lifestyle: profileData?.lifestyle || {},
        tobaccoUse: profileData?.tobaccoUse || 'No'
      };
      
      const insights = await aiService.generateMenopauseInsights(menopauseData, userProfile);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating menopause insights:', err);
      setAiInsights({
        menopauseAssessment: {
          stage: 'Continue monitoring symptoms',
          symptoms: ['Continue tracking symptoms'],
          hormoneTherapy: 'Consider if symptoms are severe',
          recommendations: ['Maintain healthy lifestyle', 'Focus on long-term health', 'Consider hormone therapy if needed']
        },
        aiInsights: 'AI insights temporarily unavailable',
        longTermHealth: 'Focus on bone, heart, and cognitive health',
        medicalAlerts: [],
        managementTips: ['Maintain healthy lifestyle', 'Manage symptoms', 'Focus on long-term health']
      });
    }
  };
  
  // Calculate menopause stage
  const calculateMenopauseStage = () => {
    const age = user.age || 25;
    
    if (menopauseData.isInMenopause) {
      return 'Confirmed menopause - focus on long-term health';
    } else if (age >= 40 && age <= 55) {
      return 'Perimenopause - transition period with symptom management';
    } else if (age > 55) {
      return 'Post-menopause - long-term health and wellness focus';
    } else {
      return 'Pre-menopause - maintain reproductive health';
    }
  };
  
  return (
    <div className="menopause-support">
      <div className="menopause-header">
        <h1>Menopause Support</h1>
        <p>Track your menopause journey and get AI-powered insights for symptom management</p>
      </div>
      
      <div className="menopause-content">
        {/* Menopause Status */}
        <div className="menopause-status-section">
          <h2>Menopause Status</h2>
          <div className="status-options">
            <button
              className={`status-option ${menopauseData.isInMenopause ? 'selected' : ''}`}
              onClick={() => handleInputChange('isInMenopause', true)}
            >
              Yes, I'm in menopause
            </button>
            <button
              className={`status-option ${!menopauseData.isInMenopause ? 'selected' : ''}`}
              onClick={() => handleInputChange('isInMenopause', false)}
            >
              No, not in menopause yet
            </button>
          </div>
          
          <div className="menopause-stage">
            <h3>Current Stage</h3>
            <p>{calculateMenopauseStage()}</p>
          </div>
        </div>
        
        {/* Menopause Type */}
        <div className="menopause-type-section">
          <h2>Menopause Type</h2>
          <div className="menopause-type-options">
            {['natural', 'surgical', 'medical'].map(type => (
              <button
                key={type}
                className={`menopause-type-option ${menopauseData.menopauseType === type ? 'selected' : ''}`}
                onClick={() => handleInputChange('menopauseType', type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptoms Tracking */}
        <div className="symptoms-section">
          <h2>Menopause Symptoms</h2>
          
          {/* Hot Flashes */}
          <div className="symptom-item">
            <h3>Hot Flashes</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.hotFlashes === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('hotFlashes', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Night Sweats */}
          <div className="symptom-item">
            <h3>Night Sweats</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.nightSweats === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('nightSweats', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mood Changes */}
          <div className="symptom-item">
            <h3>Mood Changes</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.moodChanges === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('moodChanges', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sleep Disruption */}
          <div className="symptom-item">
            <h3>Sleep Disruption</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.sleepDisruption === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('sleepDisruption', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Vaginal Dryness */}
          <div className="symptom-item">
            <h3>Vaginal Dryness</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.vaginalDryness === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('vaginalDryness', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Weight Changes */}
          <div className="symptom-item">
            <h3>Weight Changes</h3>
            <div className="symptom-options">
              {['none', 'weight_gain', 'weight_loss', 'fluctuating'].map(change => (
                <button
                  key={change}
                  className={`symptom-option ${menopauseData.symptoms.weightChanges === change ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('weightChanges', change)}
                >
                  {change.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          
          {/* Memory Issues */}
          <div className="symptom-item">
            <h3>Memory Issues</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.memoryIssues === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('memoryIssues', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fatigue */}
          <div className="symptom-item">
            <h3>Fatigue</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.fatigue === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('fatigue', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Anxiety */}
          <div className="symptom-item">
            <h3>Anxiety</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.anxiety === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('anxiety', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Depression */}
          <div className="symptom-item">
            <h3>Depression</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${menopauseData.symptoms.depression === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('depression', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Hormone Therapy */}
        <div className="hormone-therapy-section">
          <h2>Hormone Therapy</h2>
          
          <div className="hrt-status">
            <h3>Are you on Hormone Therapy?</h3>
            <div className="hrt-options">
              <button
                className={`hrt-option ${menopauseData.hormoneTherapy.isOnHRT ? 'selected' : ''}`}
                onClick={() => handleHormoneTherapyChange('isOnHRT', true)}
              >
                Yes, I'm on HRT
              </button>
              <button
                className={`hrt-option ${!menopauseData.hormoneTherapy.isOnHRT ? 'selected' : ''}`}
                onClick={() => handleHormoneTherapyChange('isOnHRT', false)}
              >
                No, not on HRT
              </button>
            </div>
          </div>
          
          {menopauseData.hormoneTherapy.isOnHRT && (
            <div className="hrt-details">
              <div className="hrt-type">
                <h3>HRT Type</h3>
                <div className="hrt-type-options">
                  {['estrogen_only', 'estrogen_progesterone', 'testosterone', 'other'].map(type => (
                    <button
                      key={type}
                      className={`hrt-type-option ${menopauseData.hormoneTherapy.type === type ? 'selected' : ''}`}
                      onClick={() => handleHormoneTherapyChange('type', type)}
                    >
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hrt-effectiveness">
                <h3>Effectiveness</h3>
                <div className="effectiveness-options">
                  {['not_effective', 'somewhat_effective', 'effective', 'very_effective'].map(effectiveness => (
                    <button
                      key={effectiveness}
                      className={`effectiveness-option ${menopauseData.hormoneTherapy.effectiveness === effectiveness ? 'selected' : ''}`}
                      onClick={() => handleHormoneTherapyChange('effectiveness', effectiveness)}
                    >
                      {effectiveness.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bone Health */}
        <div className="bone-health-section">
          <h2>Bone Health</h2>
          
          <div className="bone-density">
            <h3>Bone Density</h3>
            <div className="bone-density-options">
              {['normal', 'osteopenia', 'osteoporosis', 'unknown'].map(density => (
                <button
                  key={density}
                  className={`bone-density-option ${menopauseData.boneHealth.boneDensity === density ? 'selected' : ''}`}
                  onClick={() => handleBoneHealthChange('boneDensity', density)}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="fracture-risk">
            <h3>Fracture Risk</h3>
            <div className="fracture-risk-options">
              {['low', 'medium', 'high', 'unknown'].map(risk => (
                <button
                  key={risk}
                  className={`fracture-risk-option ${menopauseData.boneHealth.fractureRisk === risk ? 'selected' : ''}`}
                  onClick={() => handleBoneHealthChange('fractureRisk', risk)}
                >
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={saveMenopauseData}
            disabled={isLoading}
            className="save-menopause-btn"
          >
            {isLoading ? 'Saving...' : 'Save Menopause Data'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {/* AI Insights */}
        {showInsights && aiInsights && (
          <div className="ai-insights-section">
            <h2>AI-Powered Menopause Insights</h2>
            <div className="insights-content">
              {aiInsights.menopauseAssessment && (
                <div className="menopause-assessment">
                  <h3>Menopause Assessment</h3>
                  <p><strong>Stage:</strong> {aiInsights.menopauseAssessment.stage}</p>
                  <p><strong>Hormone Therapy:</strong> {aiInsights.menopauseAssessment.hormoneTherapy}</p>
                </div>
              )}
              
              {aiInsights.longTermHealth && (
                <div className="long-term-health">
                  <h3>Long-term Health Focus</h3>
                  <p><strong>Bone Health:</strong> {aiInsights.longTermHealth.boneHealth}</p>
                  <p><strong>Heart Health:</strong> {aiInsights.longTermHealth.heartHealth}</p>
                  <p><strong>Cognitive Health:</strong> {aiInsights.longTermHealth.cognitiveHealth}</p>
                  <p><strong>Cancer Screening:</strong> {aiInsights.longTermHealth.cancerScreening}</p>
                </div>
              )}
              
              {aiInsights.aiInsights && (
                <div className="ai-insights">
                  <h3>AI Insights</h3>
                  <p>{aiInsights.aiInsights}</p>
                </div>
              )}
              
              {aiInsights.medicalAlerts && aiInsights.medicalAlerts.length > 0 && (
                <div className="medical-alerts">
                  <h3>Medical Alerts</h3>
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
              
              {aiInsights.menopauseAssessment?.recommendations && (
                <div className="recommendations">
                  <h3>Menopause Recommendations</h3>
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
              
              {aiInsights.managementTips && (
                <div className="management-tips">
                  <h3>Management Tips</h3>
                  <div className="tips-list">
                    {aiInsights.managementTips.map((tip, index) => (
                      <div key={index} className="tip-item">
                        <span className="tip-icon">✨</span>
                        <span className="tip-text">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenopauseSupport;

