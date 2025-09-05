import React from 'react';
import PersonalContextEngine from '../utils/personalContextEngine';
import './SmartWelcome.css';

const SmartWelcome = ({ userProfile, onboardingData }) => {
  const personalContextEngine = new PersonalContextEngine();
  
  // Provide fallback data if onboardingData is null
  const safeOnboardingData = onboardingData || {
    fullName: userProfile?.fullName || 'User',
    dateOfBirth: userProfile?.dateOfBirth || null,
    genderIdentity: userProfile?.genderIdentity || '',
    pronouns: userProfile?.pronouns || '',
    sexAssignedAtBirth: userProfile?.sexAssignedAtBirth || '',
    reproductiveAnatomy: userProfile?.reproductiveAnatomy || [],
    chronicConditions: userProfile?.chronicConditions || [],
    height: userProfile?.height || null,
    weight: userProfile?.weight || null,
    tobaccoUse: 'No',
    diet: '',
    exerciseFrequency: '',
    sleepQuality: '',
    stressLevel: ''
  };
  
  const personalContext = personalContextEngine.generatePersonalContext(safeOnboardingData);
  const welcomeMessage = personalContextEngine.generateWelcomeMessage(personalContext);
  const healthSummary = personalContextEngine.generateHealthSummary(personalContext);
  const healthMetrics = personalContextEngine.generateHealthMetrics(safeOnboardingData);

  return (
    <div className="smart-welcome">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-greeting">
          <h1>{welcomeMessage}</h1>
          <p className="welcome-subtitle">Your personalized reproductive health dashboard</p>
        </div>
        <div className="welcome-actions">
          <button className="notification-btn" onClick={() => alert('Notifications - Coming Soon!')}>
            🔔
          </button>
          <button className="logout-btn" onClick={() => window.location.href = '/logout'}>
            Logout
          </button>
        </div>
      </div>

      {/* Health Summary Section */}
      <div className="health-summary-section">
        <div className="health-tags">
          {personalContext.healthTags.map((tag, index) => (
            <span key={index} className={`health-tag ${getTagCategory(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
        
        <div className="health-summary-cards">
          {healthSummary.map((summary, index) => (
            <div key={index} className="summary-card">
              <span className="summary-icon">🎯</span>
              <span className="summary-text">{summary}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      {healthMetrics.bmi && (
        <div className="health-metrics">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>BMI</h3>
              <p className="metric-value">{healthMetrics.bmi}</p>
              <p className="metric-category">{healthMetrics.bmiCategory}</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📏</div>
            <div className="metric-content">
              <h3>Height</h3>
              <p className="metric-value">{healthMetrics.height} cm</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⚖️</div>
            <div className="metric-content">
              <h3>Weight</h3>
              <p className="metric-value">{healthMetrics.weight} kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to categorize health tags
const getTagCategory = (tag) => {
  if (['AFAB', 'AMAB'].includes(tag)) return 'anatomy';
  if (['PCOS', 'Endometriosis', 'Diabetes', 'Thyroid'].includes(tag)) return 'condition';
  if (['Non-smoker', 'Smoker'].includes(tag)) return 'lifestyle';
  if (['Vegetarian', 'Vegan'].includes(tag)) return 'diet';
  if (['Active', 'Low activity'].includes(tag)) return 'activity';
  return 'general';
};

export default SmartWelcome;
