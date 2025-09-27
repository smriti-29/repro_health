// FERTILITY TRACKING COMPONENT
// Comprehensive fertility and ovulation tracking with AI-powered insights

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import FertilityAIService from '../ai/fertilityAIService.js';
import './FertilityTracking.css';

const FertilityTracking = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData, addHealthLog } = useHealthData();
  
  // State management
  const [fertilityData, setFertilityData] = useState({
    isTryingToConceive: false,
    contraceptionMethod: 'none',
    ovulationTracking: {
      bbt: null,
      cervicalMucus: 'none',
      lhStrips: 'negative',
      ovulationPain: false,
      libido: 'medium'
    },
    fertilityWindow: {
      predictedOvulation: null,
      fertileDays: [],
      conceptionProbability: null
    },
    pregnancyHistory: [],
    fertilityConcerns: [],
    fertilityGoals: []
  });
  
  const [cycleData, setCycleData] = useState({
    averageLength: 28,
    isRegular: true,
    lastPeriod: null,
    nextPredictedPeriod: null
  });
  
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Service
  const [aiService] = useState(() => new FertilityAIService());
  
  // Initialize fertility data from user profile
  useEffect(() => {
    if (profileData?.fertility) {
      setFertilityData(prev => ({
        ...prev,
        ...profileData.fertility
      }));
    }
    
    if (profileData?.menstrualCycle) {
      setCycleData(prev => ({
        ...prev,
        ...profileData.menstrualCycle
      }));
    }
  }, [profileData]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFertilityData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle ovulation tracking changes
  const handleOvulationTrackingChange = (field, value) => {
    setFertilityData(prev => ({
      ...prev,
      ovulationTracking: {
        ...prev.ovulationTracking,
        [field]: value
      }
    }));
  };
  
  // Calculate fertility window
  const calculateFertilityWindow = () => {
    if (!cycleData.averageLength || !cycleData.lastPeriod) {
      return null;
    }
    
    const ovulationDay = cycleData.averageLength - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;
    
    const fertileDays = [];
    for (let i = fertileStart; i <= fertileEnd; i++) {
      fertileDays.push(i);
    }
    
    return {
      predictedOvulation: ovulationDay,
      fertileDays,
      conceptionProbability: 'High during fertile window'
    };
  };
  
  // Save fertility data
  const saveFertilityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate fertility window
      const fertilityWindow = calculateFertilityWindow();
      
      // Update fertility data with calculated window
      const updatedFertilityData = {
        ...fertilityData,
        fertilityWindow
      };
      
      // Create health log entry
      const healthLog = {
        type: 'fertility_tracking',
        date: new Date().toISOString(),
        data: updatedFertilityData,
        userId: user._id
      };
      
      // Add to health data context
      await addHealthLog(healthLog);
      
      // Generate AI insights
      await generateFertilityInsights(updatedFertilityData);
      
      // Show success message
      setShowInsights(true);
      
    } catch (err) {
      console.error('Error saving fertility data:', err);
      setError('Failed to save fertility data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI insights
  const generateFertilityInsights = async (data = fertilityData) => {
    try {
      const userProfile = {
        ...user,
        ...profileData,
        age: user.age || 25,
        conditions: profileData?.conditions || {},
        familyHistory: profileData?.familyHistory || {},
        lifestyle: profileData?.lifestyle || {},
        tobaccoUse: profileData?.tobaccoUse || 'No',
        menstrualCycle: cycleData
      };
      
      const insights = await aiService.generateFertilityInsights(data, userProfile);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating fertility insights:', err);
      setAiInsights({
        fertilityAssessment: {
          ageFactor: 'Unable to assess - continue tracking',
          healthFactors: ['Continue monitoring health factors'],
          cycleFactors: 'Continue tracking cycle patterns',
          recommendations: ['Maintain healthy lifestyle', 'Continue tracking', 'Consider fertility evaluation if needed']
        },
        aiInsights: 'AI insights temporarily unavailable',
        ovulationPrediction: 'Unable to predict - continue tracking',
        conceptionTimeline: 'Continue trying and tracking',
        medicalAlerts: []
      });
    }
  };
  
  // Calculate conception probability
  const calculateConceptionProbability = () => {
    const age = user.age || 25;
    const isTTC = fertilityData.isTryingToConceive;
    
    if (!isTTC) return 'Not trying to conceive';
    
    if (age < 25) return 'Very High (90%+)';
    if (age < 30) return 'High (85%+)';
    if (age < 35) return 'Good (75%+)';
    if (age < 40) return 'Moderate (50%+)';
    return 'Lower (25%+)';
  };
  
  return (
    <div className="fertility-tracking">
      <div className="fertility-header">
        <h1>Fertility Tracking</h1>
        <p>Track your fertility and get AI-powered insights for conception</p>
      </div>
      
      <div className="fertility-content">
        {/* TTC Status */}
        <div className="ttc-section">
          <h2>Trying to Conceive</h2>
          <div className="ttc-options">
            <button
              className={`ttc-option ${fertilityData.isTryingToConceive ? 'selected' : ''}`}
              onClick={() => handleInputChange('isTryingToConceive', true)}
            >
              Yes, I'm trying to conceive
            </button>
            <button
              className={`ttc-option ${!fertilityData.isTryingToConceive ? 'selected' : ''}`}
              onClick={() => handleInputChange('isTryingToConceive', false)}
            >
              No, not trying to conceive
            </button>
          </div>
        </div>
        
        {/* Contraception Method */}
        <div className="contraception-section">
          <h2>Contraception Method</h2>
          <div className="contraception-options">
            {[
              'none', 'pill', 'patch', 'ring', 'shot', 'implant', 
              'IUD', 'condom', 'diaphragm', 'spermicide', 'withdrawal'
            ].map(method => (
              <button
                key={method}
                className={`contraception-option ${fertilityData.contraceptionMethod === method ? 'selected' : ''}`}
                onClick={() => handleInputChange('contraceptionMethod', method)}
              >
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Ovulation Tracking */}
        <div className="ovulation-tracking-section">
          <h2>Ovulation Tracking</h2>
          
          {/* BBT */}
          <div className="bbt-section">
            <h3>Basal Body Temperature (BBT)</h3>
            <div className="bbt-input">
              <input
                type="number"
                step="0.1"
                min="95"
                max="105"
                value={fertilityData.ovulationTracking.bbt || ''}
                onChange={(e) => handleOvulationTrackingChange('bbt', parseFloat(e.target.value))}
                placeholder="98.6"
                className="bbt-input-field"
              />
              <span className="bbt-unit">°F</span>
            </div>
          </div>
          
          {/* Cervical Mucus */}
          <div className="cervical-mucus-section">
            <h3>Cervical Mucus</h3>
            <div className="cervical-mucus-options">
              {['none', 'dry', 'sticky', 'creamy', 'watery', 'egg_white'].map(type => (
                <button
                  key={type}
                  className={`cervical-mucus-option ${fertilityData.ovulationTracking.cervicalMucus === type ? 'selected' : ''}`}
                  onClick={() => handleOvulationTrackingChange('cervicalMucus', type)}
                >
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          
          {/* LH Strips */}
          <div className="lh-strips-section">
            <h3>LH Test Strips</h3>
            <div className="lh-strips-options">
              {['negative', 'positive', 'peak'].map(result => (
                <button
                  key={result}
                  className={`lh-strips-option ${fertilityData.ovulationTracking.lhStrips === result ? 'selected' : ''}`}
                  onClick={() => handleOvulationTrackingChange('lhStrips', result)}
                >
                  {result.charAt(0).toUpperCase() + result.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ovulation Pain */}
          <div className="ovulation-pain-section">
            <h3>Ovulation Pain (Mittelschmerz)</h3>
            <div className="ovulation-pain-options">
              <button
                className={`ovulation-pain-option ${fertilityData.ovulationTracking.ovulationPain ? 'selected' : ''}`}
                onClick={() => handleOvulationTrackingChange('ovulationPain', true)}
              >
                Yes, I feel ovulation pain
              </button>
              <button
                className={`ovulation-pain-option ${!fertilityData.ovulationTracking.ovulationPain ? 'selected' : ''}`}
                onClick={() => handleOvulationTrackingChange('ovulationPain', false)}
              >
                No ovulation pain
              </button>
            </div>
          </div>
          
          {/* Libido */}
          <div className="libido-section">
            <h3>Libido Level</h3>
            <div className="libido-options">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  className={`libido-option ${fertilityData.ovulationTracking.libido === level ? 'selected' : ''}`}
                  onClick={() => handleOvulationTrackingChange('libido', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Fertility Window Display */}
        {fertilityData.isTryingToConceive && (
          <div className="fertility-window-section">
            <h2>Fertility Window</h2>
            <div className="fertility-window-display">
              <div className="window-item">
                <h3>Predicted Ovulation</h3>
                <p>Day {cycleData.averageLength - 14} of cycle</p>
              </div>
              <div className="window-item">
                <h3>Fertile Days</h3>
                <p>Days {cycleData.averageLength - 19} to {cycleData.averageLength - 13}</p>
              </div>
              <div className="window-item">
                <h3>Conception Probability</h3>
                <p>{calculateConceptionProbability()}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Fertility Goals */}
        <div className="fertility-goals-section">
          <h2>Fertility Goals</h2>
          <div className="fertility-goals-options">
            {[
              'conceive_naturally', 'optimize_fertility', 'track_ovulation',
              'understand_cycle', 'prepare_for_pregnancy', 'fertility_preservation'
            ].map(goal => (
              <button
                key={goal}
                className={`fertility-goal-option ${fertilityData.fertilityGoals.includes(goal) ? 'selected' : ''}`}
                onClick={() => {
                  const goals = fertilityData.fertilityGoals.includes(goal)
                    ? fertilityData.fertilityGoals.filter(g => g !== goal)
                    : [...fertilityData.fertilityGoals, goal];
                  handleInputChange('fertilityGoals', goals);
                }}
              >
                {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={saveFertilityData}
            disabled={isLoading}
            className="save-fertility-btn"
          >
            {isLoading ? 'Saving...' : 'Save Fertility Data'}
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
            <h2>AI-Powered Fertility Insights</h2>
            <div className="insights-content">
              {aiInsights.fertilityAssessment && (
                <div className="fertility-assessment">
                  <h3>Fertility Assessment</h3>
                  <p><strong>Age Factor:</strong> {aiInsights.fertilityAssessment.ageFactor}</p>
                  <p><strong>Health Factors:</strong> {aiInsights.fertilityAssessment.healthFactors.join(', ')}</p>
                  <p><strong>Cycle Factors:</strong> {aiInsights.fertilityAssessment.cycleFactors}</p>
                </div>
              )}
              
              {aiInsights.ovulationPrediction && (
                <div className="ovulation-prediction">
                  <h3>Ovulation Prediction</h3>
                  <p><strong>Predicted Day:</strong> Day {aiInsights.ovulationPrediction.predictedDay}</p>
                  <p><strong>Fertile Window:</strong> Days {aiInsights.ovulationPrediction.fertileWindow.start} to {aiInsights.ovulationPrediction.fertileWindow.end}</p>
                  <p><strong>Confidence:</strong> {aiInsights.ovulationPrediction.confidence}</p>
                </div>
              )}
              
              {aiInsights.conceptionTimeline && (
                <div className="conception-timeline">
                  <h3>Conception Timeline</h3>
                  <p>{aiInsights.conceptionTimeline}</p>
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
              
              {aiInsights.fertilityAssessment?.recommendations && (
                <div className="recommendations">
                  <h3>Fertility Recommendations</h3>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilityTracking;

