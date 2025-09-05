import React, { useState, useEffect } from 'react';
import aiReasoningEngine from '../ai/aiReasoning';
import MedicalRulesEngine from '../utils/medicalRulesEngine';
import './SmartInsights.css';

const SmartInsights = ({ userProfile, onboardingData, localHealthData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const medicalRulesEngine = new MedicalRulesEngine();

  useEffect(() => {
    if (userProfile) {
      generateInsights();
    }
  }, [userProfile, onboardingData]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate medical rules-based recommendations
      const personalContext = {
        age: calculateAge(onboardingData?.dateOfBirth),
        reproductiveAnatomy: onboardingData?.reproductiveAnatomy || [],
        chronicConditions: onboardingData?.chronicConditions || [],
        lifestyle: {
          stress: onboardingData?.stressLevel || 'Moderate',
          sleep: onboardingData?.sleepQuality || 'Good',
          smoking: onboardingData?.tobaccoUse || 'No',
          exercise: onboardingData?.exerciseFrequency || 'Moderate'
        },
        screenings: onboardingData?.screenings || {}
      };

      const preventiveCare = medicalRulesEngine.generatePreventiveCare(personalContext);
      const healthAlerts = medicalRulesEngine.generateHealthAlerts(personalContext);
      const medicationReminders = medicalRulesEngine.generateMedicationReminders(personalContext);

      // Generate AI insights
      const aiInsights = await aiReasoningEngine.generateDashboardInsights({
        ...userProfile,
        ...onboardingData,
        healthLogs: localHealthData
      });

      setInsights({
        aiInsights,
        preventiveCare,
        healthAlerts,
        medicationReminders
      });

    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Unable to generate insights at this time');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const ageDiff = new Date() - birthDate;
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="smart-insights loading">
        <div className="loading-spinner"></div>
        <p>Generating your personalized insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-insights error">
        <p>{error}</p>
        <button onClick={generateInsights} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="smart-insights">
      {/* AI Health Score */}
      <div className="insights-section">
        <h2>🤖 AI Health Intelligence</h2>
        <div className="ai-health-score-card">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{insights.aiInsights.healthScore}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-info">
              <h3>AI Health Score</h3>
              <p>Based on your profile and health patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {insights.healthAlerts.length > 0 && (
        <div className="insights-section">
          <h2>🚨 Health Alerts</h2>
          <div className="alerts-grid">
            {insights.healthAlerts.map((alert, index) => (
              <div key={index} className={`alert-card ${alert.type}`}>
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <h3>{alert.title}</h3>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-action">
                  <strong>Action:</strong> {alert.action}
                </div>
                <div className="alert-reason">
                  <strong>Why:</strong> {alert.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive Care */}
      {insights.preventiveCare.length > 0 && (
        <div className="insights-section">
          <h2>🏥 Preventive Care</h2>
          <div className="care-grid">
            {insights.preventiveCare.map((care, index) => (
              <div key={index} className="care-card">
                <div className="care-header">
                  <span className="care-icon">🩺</span>
                  <h3>{care.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(care.priority) }}
                  >
                    {care.priority}
                  </span>
                </div>
                <p className="care-description">{care.description}</p>
                <div className="care-details">
                  <div className="care-frequency">
                    <strong>Frequency:</strong> {care.frequency}
                  </div>
                  <div className="care-due">
                    <strong>Next Due:</strong> {care.dueDate === 'asap' ? 'ASAP' : care.dueDate}
                  </div>
                </div>
                <div className="care-reason">
                  <strong>Why:</strong> {care.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Reminders */}
      {insights.medicationReminders.length > 0 && (
        <div className="insights-section">
          <h2>💊 Medication Reminders</h2>
          <div className="medication-grid">
            {insights.medicationReminders.map((med, index) => (
              <div key={index} className="medication-card">
                <div className="medication-header">
                  <span className="medication-icon">💊</span>
                  <h3>{med.title}</h3>
                </div>
                <p className="medication-description">{med.description}</p>
                <div className="medication-details">
                  <div className="medication-frequency">
                    <strong>Frequency:</strong> {med.frequency}
                  </div>
                  <div className="medication-action">
                    <strong>Action:</strong> {med.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Pattern Insights */}
      {insights.aiInsights.insights && insights.aiInsights.insights.length > 0 && (
        <div className="insights-section">
          <h2>🔍 AI Pattern Insights</h2>
          <div className="pattern-grid">
            {insights.aiInsights.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="pattern-card">
                <div className="pattern-header">
                  <span className="pattern-icon">💡</span>
                  <h3>{insight.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(insight.priority) }}
                  >
                    {insight.priority}
                  </span>
                </div>
                <p className="pattern-description">{insight.description}</p>
                {insight.clinicalReasoning && (
                  <div className="pattern-reasoning">
                    <strong>AI Reasoning:</strong> {insight.clinicalReasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="insights-footer">
        <button onClick={generateInsights} className="refresh-insights-btn">
          🔄 Refresh Insights
        </button>
        <p className="insights-note">
          Insights update based on your latest health data and AI analysis
        </p>
      </div>
    </div>
  );
};

export default SmartInsights;
