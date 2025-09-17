import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SmartActions.css';

const SmartActions = ({ userProfile, onboardingData }) => {
  const navigate = useNavigate();
  const [quickLogData, setQuickLogData] = useState({
    mood: '',
    energy: '',
    sleep: '',
    stress: ''
  });

  const handleQuickLog = (type, value) => {
    setQuickLogData(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const submitQuickLog = () => {
    // Save quick log data
    const timestamp = new Date().toISOString();
    const logEntry = {
      ...quickLogData,
      timestamp,
      type: 'quick-log'
    };
    
    // Store in localStorage for now (can be moved to backend later)
    const existingLogs = JSON.parse(localStorage.getItem(`healthLogs_${user?.id || user?.email || 'anonymous'}`) || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem(`healthLogs_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(existingLogs));
    
    // Reset form
    setQuickLogData({
      mood: '',
      energy: '',
      sleep: '',
      stress: ''
    });
    
    alert('Quick log saved! 📝');
  };

  const getQuickLogIcon = (type, value) => {
    if (!value) return '⚪';
    
    const icons = {
      mood: {
        'Great': '😊',
        'Good': '🙂',
        'Okay': '😐',
        'Bad': '😔',
        'Terrible': '😢'
      },
      energy: {
        'High': '⚡',
        'Good': '💪',
        'Moderate': '😊',
        'Low': '😴',
        'Exhausted': '💤'
      },
      sleep: {
        'Excellent': '😴',
        'Good': '😊',
        'Fair': '😐',
        'Poor': '😔',
        'Terrible': '😫'
      },
      stress: {
        'None': '😌',
        'Low': '😊',
        'Moderate': '😐',
        'High': '😰',
        'Overwhelming': '😱'
      }
    };
    
    return icons[type]?.[value] || '⚪';
  };

  const getReproductiveHealthActions = () => {
    const actions = [];
    
    if (onboardingData?.reproductiveAnatomy?.includes('uterus')) {
      actions.push({
        title: 'Log Period',
        icon: '🩸',
        action: () => navigate('/log-symptoms'),
        description: 'Track your menstrual cycle'
      });
      
      actions.push({
        title: 'Cycle Insights',
        icon: '📊',
        action: () => navigate('/insights'),
        description: 'View cycle patterns'
      });
    }
    
    if (onboardingData?.reproductiveAnatomy?.includes('testes')) {
      actions.push({
        title: 'Prostate Health',
        icon: '🔍',
        action: () => navigate('/insights'),
        description: 'Track prostate health'
      });
    }
    
    if (onboardingData?.chronicConditions?.includes('PCOS')) {
      actions.push({
        title: 'PCOS Tracker',
        icon: '🎯',
        action: () => navigate('/insights'),
        description: 'Monitor PCOS symptoms'
      });
    }
    
    return actions;
  };

  const getLifestyleActions = () => {
    const actions = [];
    
    if (onboardingData?.stressLevel === 'High') {
      actions.push({
        title: 'Stress Relief',
        icon: '🧘',
        action: () => alert('Stress relief exercises - Coming Soon!'),
        description: 'Quick stress management'
      });
    }
    
    if (onboardingData?.sleepQuality === 'Poor') {
      actions.push({
        title: 'Sleep Tips',
        icon: '😴',
        action: () => alert('Sleep hygiene tips - Coming Soon!'),
        description: 'Improve sleep quality'
      });
    }
    
    if (onboardingData?.exerciseFrequency === 'Low') {
      actions.push({
        title: 'Quick Exercise',
        icon: '🏃',
        action: () => alert('Quick exercise routines - Coming Soon!'),
        description: '5-minute workouts'
      });
    }
    
    return actions;
  };

  const reproductiveActions = getReproductiveHealthActions();
  const lifestyleActions = getLifestyleActions();
  
  // If no onboarding data, show default actions
  const hasOnboardingData = onboardingData && Object.keys(onboardingData).length > 0;

  return (
    <div className="smart-actions">
      {/* Quick Health Log */}
      <div className="actions-section">
        <h2>📝 Quick Health Log</h2>
        <div className="quick-log-form">
          <div className="log-row">
            <div className="log-item">
              <label>Mood</label>
              <div className="log-options">
                {['Great', 'Good', 'Okay', 'Bad', 'Terrible'].map(mood => (
                  <button
                    key={mood}
                    className={`log-option ${quickLogData.mood === mood ? 'selected' : ''}`}
                    onClick={() => handleQuickLog('mood', mood)}
                  >
                    {getQuickLogIcon('mood', mood)} {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="log-row">
            <div className="log-item">
              <label>Energy</label>
              <div className="log-options">
                {['High', 'Good', 'Moderate', 'Low', 'Exhausted'].map(energy => (
                  <button
                    key={energy}
                    className={`log-option ${quickLogData.energy === energy ? 'selected' : ''}`}
                    onClick={() => handleQuickLog('energy', energy)}
                  >
                    {getQuickLogIcon('energy', energy)} {energy}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="log-row">
            <div className="log-item">
              <label>Sleep</label>
              <div className="log-options">
                {['Excellent', 'Good', 'Fair', 'Poor', 'Terrible'].map(sleep => (
                  <button
                    key={sleep}
                    className={`log-option ${quickLogData.sleep === sleep ? 'selected' : ''}`}
                    onClick={() => handleQuickLog('sleep', sleep)}
                  >
                    {getQuickLogIcon('sleep', sleep)} {sleep}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="log-row">
            <div className="log-item">
              <label>Stress</label>
              <div className="log-options">
                {['None', 'Low', 'Moderate', 'High', 'Overwhelming'].map(stress => (
                  <button
                    key={stress}
                    className={`log-option ${quickLogData.stress === stress ? 'selected' : ''}`}
                    onClick={() => handleQuickLog('stress', stress)}
                  >
                    {getQuickLogIcon('stress', stress)} {stress}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            className="submit-log-btn"
            onClick={submitQuickLog}
            disabled={!quickLogData.mood || !quickLogData.energy || !quickLogData.sleep || !quickLogData.stress}
          >
            💾 Save Quick Log
          </button>
        </div>
      </div>

      {/* Reproductive Health Actions */}
      {reproductiveActions.length > 0 && (
        <div className="actions-section">
          <h2>🩺 Reproductive Health</h2>
          <div className="actions-grid">
            {reproductiveActions.map((action, index) => (
              <div key={index} className="action-card" onClick={action.action}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Actions */}
      {lifestyleActions.length > 0 && (
        <div className="actions-section">
          <h2>💪 Lifestyle & Wellness</h2>
          <div className="actions-grid">
            {lifestyleActions.map((action, index) => (
              <div key={index} className="action-card" onClick={action.action}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Actions when no onboarding data */}
      {!hasOnboardingData && (
        <div className="actions-section">
          <h2>🩺 Reproductive Health</h2>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/log-symptoms')}>
              <div className="action-icon">🩸</div>
              <div className="action-content">
                <h3>Log Symptoms</h3>
                <p>Track your health symptoms</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            
            <div className="action-card" onClick={() => navigate('/insights')}>
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h3>Health Insights</h3>
                <p>View your health patterns</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          </div>
        </div>
      )}

      {/* General Actions */}
      <div className="actions-section">
        <h2>🔧 General Actions</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate('/log-symptoms')}>
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h3>Log Symptoms</h3>
              <p>Track detailed health symptoms</p>
            </div>
            <div className="action-arrow">→</div>
          </div>
          
          <div className="action-card" onClick={() => navigate('/medications')}>
            <div className="action-icon">💊</div>
            <div className="action-content">
              <h3>Medications</h3>
              <p>Manage your medications</p>
            </div>
            <div className="action-arrow">→</div>
          </div>
          
          <div className="action-card" onClick={() => navigate('/profile')}>
            <div className="action-icon">👤</div>
            <div className="action-content">
              <h3>Profile</h3>
              <p>Update your health profile</p>
            </div>
            <div className="action-arrow">→</div>
          </div>
          
          <div className="action-card" onClick={() => navigate('/insights')}>
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>Insights</h3>
              <p>View detailed health insights</p>
            </div>
            <div className="action-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartActions;
