// CYCLE TRACKING COMPONENT
// Comprehensive menstrual cycle tracking with AI-powered insights

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AFABAIService from '../ai/afabAIService.js';
import './CycleTracking.css';

const CycleTracking = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData, addHealthLog } = useHealthData();
  
  // State management
  const [cycleData, setCycleData] = useState({
    currentDay: 1,
    flow: 'light',
    symptoms: [],
    mood: 'neutral',
    energy: 'medium',
    sleep: 'good',
    cramps: 'none',
    bloating: 'none',
    headaches: 'none',
    breastTenderness: 'none',
    acne: 'none',
    notes: ''
  });
  
  const [cycleHistory, setCycleHistory] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Service
  const [aiService] = useState(() => new AFABAIService());
  
  // Initialize cycle data from user profile
  useEffect(() => {
    if (profileData?.menstrualCycle) {
      setCycleData(prev => ({
        ...prev,
        ...profileData.menstrualCycle
      }));
      setCycleHistory(profileData.menstrualCycle.cycleHistory || []);
    }
  }, [profileData]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setCycleData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle symptom toggle
  const handleSymptomToggle = (symptom) => {
    setCycleData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };
  
  // Save cycle data
  const saveCycleData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create health log entry
      const healthLog = {
        type: 'cycle_tracking',
        date: new Date().toISOString(),
        data: cycleData,
        userId: user._id
      };
      
      // Add to health data context
      await addHealthLog(healthLog);
      
      // Update cycle history
      const newCycleHistory = [...cycleHistory, {
        ...cycleData,
        date: new Date().toISOString(),
        id: Date.now()
      }];
      
      setCycleHistory(newCycleHistory);
      
      // Generate AI insights
      await generateCycleInsights();
      
      // Show success message
      setShowInsights(true);
      
    } catch (err) {
      console.error('Error saving cycle data:', err);
      setError('Failed to save cycle data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI insights
  const generateCycleInsights = async () => {
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
      
      const insights = await aiService.generateCycleInsights(cycleData, userProfile);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating cycle insights:', err);
      setAiInsights({
        cycleAnalysis: {
          pattern: 'Unable to analyze - continue tracking',
          regularity: 'Continue monitoring cycle patterns',
          symptoms: ['Continue tracking symptoms for pattern recognition'],
          recommendations: ['Maintain healthy lifestyle', 'Continue tracking', 'Consult healthcare provider if concerned']
        },
        aiInsights: 'AI insights temporarily unavailable',
        medicalAlerts: [],
        personalizedTips: ['Continue tracking your cycle', 'Maintain healthy lifestyle', 'Consult healthcare provider if needed']
      });
    }
  };
  
  // Calculate cycle statistics
  const calculateCycleStats = () => {
    if (cycleHistory.length < 2) {
      return {
        averageLength: 'Not enough data',
        regularity: 'Unknown',
        commonSymptoms: [],
        pattern: 'Continue tracking'
      };
    }
    
    const lengths = cycleHistory.map(cycle => {
      // Calculate cycle length (simplified)
      return 28; // Default for now
    });
    
    const averageLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const isRegular = lengths.every(length => Math.abs(length - averageLength) <= 7);
    
    // Count common symptoms
    const symptomCounts = {};
    cycleHistory.forEach(cycle => {
      cycle.symptoms?.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    
    const commonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);
    
    return {
      averageLength: Math.round(averageLength),
      regularity: isRegular ? 'Regular' : 'Irregular',
      commonSymptoms,
      pattern: isRegular ? 'Consistent pattern' : 'Variable pattern'
    };
  };
  
  const cycleStats = calculateCycleStats();
  
  return (
    <div className="cycle-tracking">
      <div className="cycle-header">
        <h1>Cycle Tracking</h1>
        <p>Track your menstrual cycle and get AI-powered insights</p>
      </div>
      
      <div className="cycle-content">
        {/* Current Cycle Day */}
        <div className="cycle-day-section">
          <h2>Current Cycle Day</h2>
          <div className="cycle-day-input">
            <label>Day of Cycle:</label>
            <input
              type="number"
              min="1"
              max="35"
              value={cycleData.currentDay}
              onChange={(e) => handleInputChange('currentDay', parseInt(e.target.value))}
              className="cycle-day-number"
            />
          </div>
        </div>
        
        {/* Flow Intensity */}
        <div className="flow-section">
          <h2>Flow Intensity</h2>
          <div className="flow-options">
            {['light', 'medium', 'heavy', 'spotting', 'none'].map(flow => (
              <button
                key={flow}
                className={`flow-option ${cycleData.flow === flow ? 'selected' : ''}`}
                onClick={() => handleInputChange('flow', flow)}
              >
                {flow.charAt(0).toUpperCase() + flow.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptoms */}
        <div className="symptoms-section">
          <h2>Symptoms</h2>
          <div className="symptoms-grid">
            {[
              'cramps', 'bloating', 'headaches', 'breast_tenderness', 
              'acne', 'mood_swings', 'fatigue', 'nausea', 'back_pain',
              'food_cravings', 'insomnia', 'anxiety'
            ].map(symptom => (
              <button
                key={symptom}
                className={`symptom-option ${cycleData.symptoms.includes(symptom) ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle(symptom)}
              >
                {symptom.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mood and Energy */}
        <div className="mood-energy-section">
          <div className="mood-section">
            <h3>Mood</h3>
            <div className="mood-options">
              {['happy', 'neutral', 'sad', 'anxious', 'irritable', 'calm'].map(mood => (
                <button
                  key={mood}
                  className={`mood-option ${cycleData.mood === mood ? 'selected' : ''}`}
                  onClick={() => handleInputChange('mood', mood)}
                >
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="energy-section">
            <h3>Energy Level</h3>
            <div className="energy-options">
              {['low', 'medium', 'high'].map(energy => (
                <button
                  key={energy}
                  className={`energy-option ${cycleData.energy === energy ? 'selected' : ''}`}
                  onClick={() => handleInputChange('energy', energy)}
                >
                  {energy.charAt(0).toUpperCase() + energy.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sleep Quality */}
        <div className="sleep-section">
          <h2>Sleep Quality</h2>
          <div className="sleep-options">
            {['poor', 'fair', 'good', 'excellent'].map(sleep => (
              <button
                key={sleep}
                className={`sleep-option ${cycleData.sleep === sleep ? 'selected' : ''}`}
                onClick={() => handleInputChange('sleep', sleep)}
              >
                {sleep.charAt(0).toUpperCase() + sleep.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        <div className="notes-section">
          <h2>Notes</h2>
          <textarea
            value={cycleData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes about your cycle..."
            className="cycle-notes"
            rows="4"
          />
        </div>
        
        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={saveCycleData}
            disabled={isLoading}
            className="save-cycle-btn"
          >
            {isLoading ? 'Saving...' : 'Save Cycle Data'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {/* Cycle Statistics */}
        {cycleHistory.length > 0 && (
          <div className="cycle-stats">
            <h2>Cycle Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Average Length</h3>
                <p>{cycleStats.averageLength} days</p>
              </div>
              <div className="stat-item">
                <h3>Regularity</h3>
                <p>{cycleStats.regularity}</p>
              </div>
              <div className="stat-item">
                <h3>Common Symptoms</h3>
                <p>{cycleStats.commonSymptoms.join(', ') || 'None'}</p>
              </div>
              <div className="stat-item">
                <h3>Pattern</h3>
                <p>{cycleStats.pattern}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Insights */}
        {showInsights && aiInsights && (
          <div className="ai-insights-section">
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
              
              {aiInsights.cycleAnalysis?.recommendations && (
                <div className="recommendations">
                  <h3>Personalized Recommendations</h3>
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
              
              {aiInsights.personalizedTips && (
                <div className="personalized-tips">
                  <h3>Personalized Tips</h3>
                  <div className="tips-list">
                    {aiInsights.personalizedTips.map((tip, index) => (
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

export default CycleTracking;

