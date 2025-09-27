// PREGNANCY TRACKING COMPONENT
// Comprehensive pregnancy tracking and support system

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import PregnancyAIService from '../ai/pregnancyAIService.js';
import './PregnancyTracking.css';

const PregnancyTracking = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData, addHealthLog } = useHealthData();
  
  // State management
  const [pregnancyData, setPregnancyData] = useState({
    isPregnant: true,
    dueDate: null,
    trimester: 1,
    pregnancyType: 'singleton',
    complications: [],
    prenatalCare: {
      appointments: [],
      ultrasounds: [],
      bloodTests: [],
      weightGain: [],
      bloodPressure: [],
      bloodSugar: []
    },
    symptoms: {
      nausea: 'none',
      fatigue: 'medium',
      mood: 'neutral',
      sleep: 'good',
      appetite: 'normal',
      fetalMovement: 'none',
      contractions: 'none'
    },
    deliveryPlan: null,
    birthPlan: null
  });
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [daysRemaining, setDaysRemaining] = useState(280);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Service
  const [aiService] = useState(() => new PregnancyAIService());
  
  // Initialize pregnancy data from user profile
  useEffect(() => {
    if (profileData?.pregnancy) {
      setPregnancyData(prev => ({
        ...prev,
        ...profileData.pregnancy
      }));
    }
  }, [profileData]);
  
  // Calculate pregnancy progress
  useEffect(() => {
    if (pregnancyData.dueDate) {
      const dueDate = new Date(pregnancyData.dueDate);
      const today = new Date();
      const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      const weeksPregnant = Math.floor((280 - daysDiff) / 7);
      
      setCurrentWeek(Math.max(1, weeksPregnant));
      setDaysRemaining(Math.max(0, daysDiff));
    }
  }, [pregnancyData.dueDate]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setPregnancyData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle symptom changes
  const handleSymptomChange = (symptom, value) => {
    setPregnancyData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: value
      }
    }));
  };
  
  // Handle prenatal care changes
  const handlePrenatalCareChange = (field, value) => {
    setPregnancyData(prev => ({
      ...prev,
      prenatalCare: {
        ...prev.prenatalCare,
        [field]: value
      }
    }));
  };
  
  // Calculate trimester
  const calculateTrimester = (weeks) => {
    if (weeks <= 12) return 1;
    if (weeks <= 26) return 2;
    return 3;
  };
  
  // Get pregnancy milestones
  const getPregnancyMilestones = (weeks) => {
    const milestones = {
      4: 'Positive pregnancy test',
      6: 'Heartbeat detectable',
      8: 'Major organs begin forming',
      12: 'End of first trimester',
      16: 'Gender can be determined',
      20: 'Halfway point - anatomy scan',
      24: 'Viability milestone',
      28: 'Third trimester begins',
      32: 'Baby gains weight rapidly',
      36: 'Baby drops into position',
      40: 'Due date arrives'
    };
    
    return milestones[weeks] || null;
  };
  
  // Save pregnancy data
  const savePregnancyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update trimester based on current week
      const updatedPregnancyData = {
        ...pregnancyData,
        trimester: calculateTrimester(currentWeek)
      };
      
      // Create health log entry
      const healthLog = {
        type: 'pregnancy_tracking',
        date: new Date().toISOString(),
        data: updatedPregnancyData,
        userId: user._id
      };
      
      // Add to health data context
      await addHealthLog(healthLog);
      
      // Generate AI insights
      await generatePregnancyInsights(updatedPregnancyData);
      
      // Show success message
      setShowInsights(true);
      
    } catch (err) {
      console.error('Error saving pregnancy data:', err);
      setError('Failed to save pregnancy data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI insights
  const generatePregnancyInsights = async (data = pregnancyData) => {
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
      
      const insights = await aiService.generatePregnancyInsights(data, userProfile);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating pregnancy insights:', err);
      setAiInsights({
        pregnancyAssessment: {
          trimester: 'Continue prenatal care',
          riskLevel: 'Continue monitoring',
          symptoms: ['Continue tracking symptoms'],
          recommendations: ['Continue prenatal care', 'Maintain healthy lifestyle', 'Attend all appointments']
        },
        aiInsights: 'AI insights temporarily unavailable',
        weeklyProgress: 'Unable to calculate - continue tracking',
        medicalAlerts: [],
        preparationTips: ['Continue prenatal care', 'Maintain healthy lifestyle', 'Prepare for delivery']
      });
    }
  };
  
  return (
    <div className="pregnancy-tracking">
      <div className="pregnancy-header">
        <h1>Pregnancy Tracking</h1>
        <p>Track your pregnancy journey and get AI-powered insights</p>
      </div>
      
      <div className="pregnancy-content">
        {/* Pregnancy Progress */}
        <div className="pregnancy-progress-section">
          <h2>Pregnancy Progress</h2>
          <div className="progress-display">
            <div className="progress-item">
              <h3>Current Week</h3>
              <p className="week-number">{currentWeek}</p>
            </div>
            <div className="progress-item">
              <h3>Trimester</h3>
              <p className="trimester-number">{calculateTrimester(currentWeek)}</p>
            </div>
            <div className="progress-item">
              <h3>Days Remaining</h3>
              <p className="days-remaining">{daysRemaining}</p>
            </div>
          </div>
          
          {getPregnancyMilestones(currentWeek) && (
            <div className="milestone-display">
              <h3>This Week's Milestone</h3>
              <p>{getPregnancyMilestones(currentWeek)}</p>
            </div>
          )}
        </div>
        
        {/* Due Date */}
        <div className="due-date-section">
          <h2>Due Date</h2>
          <div className="due-date-input">
            <label>Expected Due Date:</label>
            <input
              type="date"
              value={pregnancyData.dueDate || ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="due-date-field"
            />
          </div>
        </div>
        
        {/* Pregnancy Type */}
        <div className="pregnancy-type-section">
          <h2>Pregnancy Type</h2>
          <div className="pregnancy-type-options">
            {['singleton', 'twins', 'triplets', 'high_risk'].map(type => (
              <button
                key={type}
                className={`pregnancy-type-option ${pregnancyData.pregnancyType === type ? 'selected' : ''}`}
                onClick={() => handleInputChange('pregnancyType', type)}
              >
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptoms Tracking */}
        <div className="symptoms-section">
          <h2>Pregnancy Symptoms</h2>
          
          {/* Nausea */}
          <div className="symptom-item">
            <h3>Nausea</h3>
            <div className="symptom-options">
              {['none', 'mild', 'moderate', 'severe'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${pregnancyData.symptoms.nausea === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('nausea', level)}
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
              {['low', 'medium', 'high', 'extreme'].map(level => (
                <button
                  key={level}
                  className={`symptom-option ${pregnancyData.symptoms.fatigue === level ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('fatigue', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mood */}
          <div className="symptom-item">
            <h3>Mood</h3>
            <div className="symptom-options">
              {['happy', 'neutral', 'sad', 'anxious', 'irritable', 'calm'].map(mood => (
                <button
                  key={mood}
                  className={`symptom-option ${pregnancyData.symptoms.mood === mood ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('mood', mood)}
                >
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sleep */}
          <div className="symptom-item">
            <h3>Sleep Quality</h3>
            <div className="symptom-options">
              {['poor', 'fair', 'good', 'excellent'].map(quality => (
                <button
                  key={quality}
                  className={`symptom-option ${pregnancyData.symptoms.sleep === quality ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('sleep', quality)}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Appetite */}
          <div className="symptom-item">
            <h3>Appetite</h3>
            <div className="symptom-options">
              {['poor', 'normal', 'increased', 'decreased'].map(appetite => (
                <button
                  key={appetite}
                  className={`symptom-option ${pregnancyData.symptoms.appetite === appetite ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('appetite', appetite)}
                >
                  {appetite.charAt(0).toUpperCase() + appetite.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fetal Movement */}
          <div className="symptom-item">
            <h3>Fetal Movement</h3>
            <div className="symptom-options">
              {['none', 'minimal', 'normal', 'increased'].map(movement => (
                <button
                  key={movement}
                  className={`symptom-option ${pregnancyData.symptoms.fetalMovement === movement ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('fetalMovement', movement)}
                >
                  {movement.charAt(0).toUpperCase() + movement.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Contractions */}
          <div className="symptom-item">
            <h3>Contractions</h3>
            <div className="symptom-options">
              {['none', 'braxton_hicks', 'mild', 'moderate', 'strong'].map(contractions => (
                <button
                  key={contractions}
                  className={`symptom-option ${pregnancyData.symptoms.contractions === contractions ? 'selected' : ''}`}
                  onClick={() => handleSymptomChange('contractions', contractions)}
                >
                  {contractions.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Prenatal Care */}
        <div className="prenatal-care-section">
          <h2>Prenatal Care</h2>
          
          {/* Weight Tracking */}
          <div className="care-item">
            <h3>Weight Gain</h3>
            <div className="weight-input">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                placeholder="0.0"
                className="weight-input-field"
              />
              <span className="weight-unit">lbs</span>
            </div>
          </div>
          
          {/* Blood Pressure */}
          <div className="care-item">
            <h3>Blood Pressure</h3>
            <div className="bp-input">
              <input
                type="number"
                placeholder="120"
                className="bp-systolic"
              />
              <span className="bp-separator">/</span>
              <input
                type="number"
                placeholder="80"
                className="bp-diastolic"
              />
              <span className="bp-unit">mmHg</span>
            </div>
          </div>
          
          {/* Blood Sugar */}
          <div className="care-item">
            <h3>Blood Sugar</h3>
            <div className="bs-input">
              <input
                type="number"
                step="0.1"
                min="50"
                max="300"
                placeholder="100"
                className="bs-input-field"
              />
              <span className="bs-unit">mg/dL</span>
            </div>
          </div>
        </div>
        
        {/* Complications */}
        <div className="complications-section">
          <h2>Complications</h2>
          <div className="complications-options">
            {[
              'gestational_diabetes', 'preeclampsia', 'anemia', 'high_blood_pressure',
              'preterm_labor', 'placenta_previa', 'gestational_hypertension', 'none'
            ].map(complication => (
              <button
                key={complication}
                className={`complication-option ${pregnancyData.complications.includes(complication) ? 'selected' : ''}`}
                onClick={() => {
                  const complications = pregnancyData.complications.includes(complication)
                    ? pregnancyData.complications.filter(c => c !== complication)
                    : [...pregnancyData.complications, complication];
                  handleInputChange('complications', complications);
                }}
              >
                {complication.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={savePregnancyData}
            disabled={isLoading}
            className="save-pregnancy-btn"
          >
            {isLoading ? 'Saving...' : 'Save Pregnancy Data'}
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
            <h2>AI-Powered Pregnancy Insights</h2>
            <div className="insights-content">
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
              
              {aiInsights.weeklyProgress && (
                <div className="weekly-progress">
                  <h3>Weekly Progress</h3>
                  <p><strong>Weeks Pregnant:</strong> {aiInsights.weeklyProgress.weeksPregnant}</p>
                  <p><strong>Days Remaining:</strong> {aiInsights.weeklyProgress.daysRemaining}</p>
                  <p><strong>Trimester:</strong> {aiInsights.weeklyProgress.trimester}</p>
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
              
              {aiInsights.pregnancyAssessment?.recommendations && (
                <div className="recommendations">
                  <h3>Pregnancy Recommendations</h3>
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
              
              {aiInsights.preparationTips && (
                <div className="preparation-tips">
                  <h3>Preparation Tips</h3>
                  <div className="tips-list">
                    {aiInsights.preparationTips.map((tip, index) => (
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

export default PregnancyTracking;

