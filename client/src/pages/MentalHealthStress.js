import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './MentalHealthStress.css';

const MentalHealthStress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for mental health tracking
  const [mentalHealthForm, setMentalHealthForm] = useState({
    mood: '',
    stress: 5,
    anxiety: 5,
    depression: 5,
    sleep: 5,
    energy: 5,
    concentration: 5,
    socialConnection: 5,
    workLifeBalance: 5,
    copingStrategies: [],
    triggers: [],
    notes: ''
  });

  const [mentalHealthLogs, setMentalHealthLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available coping strategies
  const availableCopingStrategies = [
    'Exercise',
    'Meditation',
    'Deep breathing',
    'Talking to friends/family',
    'Professional therapy',
    'Journaling',
    'Music',
    'Nature walks',
    'Hobbies',
    'Sleep hygiene',
    'Healthy eating',
    'Other'
  ];

  // Available stress triggers
  const availableTriggers = [
    'Work pressure',
    'Financial stress',
    'Relationship issues',
    'Health concerns',
    'Family problems',
    'Social media',
    'News/current events',
    'Lack of sleep',
    'Poor diet',
    'Loneliness',
    'Overcommitment',
    'Other'
  ];

  // Load existing mental health logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabMentalHealthLogs') || '[]');
    setMentalHealthLogs(logs);
  }, []);

  // Calculate mental health score
  const calculateMentalHealthScore = (formData) => {
    let score = 100;
    
    // Mood and emotional factors
    if (formData.stress > 7) score -= 20;
    if (formData.anxiety > 7) score -= 20;
    if (formData.depression > 7) score -= 25;
    
    // Functionality factors
    if (formData.sleep < 4) score -= 15;
    if (formData.energy < 4) score -= 15;
    if (formData.concentration < 4) score -= 10;
    if (formData.socialConnection < 4) score -= 10;
    if (formData.workLifeBalance < 4) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great mental health!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good mental wellness' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Support', color: '#f44336', message: 'Consider professional support' };
  };

  const handleCopingStrategyToggle = (strategy) => {
    const currentStrategies = mentalHealthForm.copingStrategies;
    const updatedStrategies = currentStrategies.includes(strategy)
      ? currentStrategies.filter(s => s !== strategy)
      : [...currentStrategies, strategy];
    
    setMentalHealthForm({
      ...mentalHealthForm,
      copingStrategies: updatedStrategies
    });
  };

  const handleTriggerToggle = (trigger) => {
    const currentTriggers = mentalHealthForm.triggers;
    const updatedTriggers = currentTriggers.includes(trigger)
      ? currentTriggers.filter(t => t !== trigger)
      : [...currentTriggers, trigger];
    
    setMentalHealthForm({
      ...mentalHealthForm,
      triggers: updatedTriggers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateMentalHealthScore(mentalHealthForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...mentalHealthForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...mentalHealthLogs];
      setMentalHealthLogs(updatedLogs);
      localStorage.setItem('amabMentalHealthLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generateMentalHealthInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setMentalHealthForm({
        mood: '',
        stress: 5,
        anxiety: 5,
        depression: 5,
        sleep: 5,
        energy: 5,
        concentration: 5,
        socialConnection: 5,
        workLifeBalance: 5,
        copingStrategies: [],
        triggers: [],
        notes: ''
      });

      alert('Mental health log saved successfully! 🧠');
    } catch (error) {
      console.error('Error logging mental health data:', error);
      alert('Error logging mental health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mental health insights
  const generateMentalHealthInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Mental Health',
        message: 'Your mental wellness is excellent! Keep up the great work with your coping strategies.'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Mental Wellness',
        message: 'Your mental health is good. Continue monitoring and using your coping strategies.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Mental Health Support Recommended',
        message: 'Your scores suggest you might benefit from additional mental health support. Consider reaching out to a professional.'
      });
    }

    // Specific recommendations
    if (log.stress > 7) {
      insights.push({
        type: 'warning',
        icon: '😰',
        title: 'High Stress Levels',
        message: 'Your stress levels are high. Consider stress management techniques like meditation or exercise.'
      });
    }

    if (log.anxiety > 7) {
      insights.push({
        type: 'warning',
        icon: '😟',
        title: 'High Anxiety',
        message: 'High anxiety levels detected. Deep breathing exercises and professional support can help.'
      });
    }

    if (log.depression > 7) {
      insights.push({
        type: 'warning',
        icon: '😔',
        title: 'Depression Symptoms',
        message: 'You may be experiencing depression symptoms. Please consider reaching out to a mental health professional.'
      });
    }

    if (log.sleep < 4) {
      insights.push({
        type: 'warning',
        icon: '😴',
        title: 'Poor Sleep Quality',
        message: 'Poor sleep can significantly impact mental health. Focus on sleep hygiene and stress reduction.'
      });
    }

    if (log.socialConnection < 4) {
      insights.push({
        type: 'warning',
        icon: '👥',
        title: 'Low Social Connection',
        message: 'Social connection is important for mental health. Consider reaching out to friends or joining social activities.'
      });
    }

    return insights;
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div className="mental-health-stress">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🧠 Mental Health & Stress</h1>
        <p>Track your mental wellness and stress management</p>
      </div>

      <div className="mental-health-content">
        {/* Mental Health Overview */}
        <div className="mental-health-overview">
          <div className="overview-card">
            <h3>📊 Total Logs</h3>
            <p className="count-display">{mentalHealthLogs.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: mentalHealthLogs.length > 0 ? mentalHealthLogs[0].category?.color || 'white' : 'white' }}>
              {mentalHealthLogs.length > 0 ? `${mentalHealthLogs[0].score}/100` : 'No logs yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>😰 Stress Level</h3>
            <p className="score-display">
              {mentalHealthLogs.length > 0 ? `${mentalHealthLogs[0].stress}/10` : 'No data'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>😴 Sleep Quality</h3>
            <p className="score-display">
              {mentalHealthLogs.length > 0 ? `${mentalHealthLogs[0].sleep}/10` : 'No data'}
            </p>
          </div>
        </div>

        {/* Mental Health Logging Form */}
        <div className="mental-health-form-section">
          <h2>Mental Health Assessment</h2>
          <form onSubmit={handleSubmit} className="mental-health-form">
            <div className="form-group">
              <label>How are you feeling today?</label>
              <input
                type="text"
                value={mentalHealthForm.mood}
                onChange={(e) => setMentalHealthForm({...mentalHealthForm, mood: e.target.value})}
                placeholder="Describe how you're feeling today..."
                required
              />
            </div>

            <div className="form-section">
              <h4>Current State</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Stress Level: {mentalHealthForm.stress}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.stress}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, stress: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Anxiety: {mentalHealthForm.anxiety}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.anxiety}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, anxiety: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Depression: {mentalHealthForm.depression}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.depression}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, depression: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Sleep Quality: {mentalHealthForm.sleep}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.sleep}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, sleep: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Daily Functioning</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Energy Level: {mentalHealthForm.energy}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.energy}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, energy: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Concentration: {mentalHealthForm.concentration}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.concentration}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, concentration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Social Connection: {mentalHealthForm.socialConnection}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.socialConnection}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, socialConnection: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Work-Life Balance: {mentalHealthForm.workLifeBalance}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mentalHealthForm.workLifeBalance}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, workLifeBalance: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Coping Strategies Used</h4>
              <div className="strategies-grid">
                {availableCopingStrategies.map(strategy => (
                  <label key={strategy} className="strategy-option">
                    <input
                      type="checkbox"
                      checked={mentalHealthForm.copingStrategies.includes(strategy)}
                      onChange={() => handleCopingStrategyToggle(strategy)}
                    />
                    <span className="strategy-label">{strategy}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>Stress Triggers</h4>
              <div className="triggers-grid">
                {availableTriggers.map(trigger => (
                  <label key={trigger} className="trigger-option">
                    <input
                      type="checkbox"
                      checked={mentalHealthForm.triggers.includes(trigger)}
                      onChange={() => handleTriggerToggle(trigger)}
                    />
                    <span className="trigger-label">{trigger}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={mentalHealthForm.notes}
                onChange={(e) => setMentalHealthForm({...mentalHealthForm, notes: e.target.value})}
                placeholder="Any additional thoughts, feelings, or observations about your mental health today?"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Mental Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Mental Health Insights</h2>
            <div className="insights-content">
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-card ${insight.type}`}>
                    <div className="insight-icon">{insight.icon}</div>
                    <div className="insight-content">
                      <h3>{insight.title}</h3>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mental Health History */}
        {mentalHealthLogs.length > 0 && (
          <div className="mental-health-history">
            <h2>📈 Mental Health History</h2>
            <div className="history-list">
              {mentalHealthLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Stress: {log.stress}/10</span>
                    <span>Anxiety: {log.anxiety}/10</span>
                    <span>Sleep: {log.sleep}/10</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Mental Health Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🧘‍♂️ Stress Management</h3>
              <p>Learn effective techniques for managing stress and building resilience</p>
            </div>
            <div className="resource-card">
              <h3>😴 Sleep & Mental Health</h3>
              <p>Understand the connection between sleep quality and mental wellness</p>
            </div>
            <div className="resource-card">
              <h3>🏃‍♂️ Exercise & Mood</h3>
              <p>How physical activity can improve mental health and reduce symptoms</p>
            </div>
            <div className="resource-card">
              <h3>👥 Social Connection</h3>
              <p>The importance of relationships and social support for mental health</p>
            </div>
            <div className="resource-card">
              <h3>🧠 Mindfulness & Meditation</h3>
              <p>Learn mindfulness techniques to improve mental clarity and reduce anxiety</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Professional Support</h3>
              <p>When and how to seek professional mental health support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthStress;