import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './UrologyProstate.css';

const UrologyProstate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for urology tracking
  const [urologyForm, setUrologyForm] = useState({
    notes: '',
    urinarySymptoms: {
      frequency: 5,
      urgency: 5,
      streamStrength: 5,
      nocturia: 0,
      pain: 5
    },
    prostateHealth: {
      psaLevel: '',
      lastDRE: '',
      familyHistory: false,
      symptoms: []
    },
    testicularHealth: {
      selfExam: false,
      lumps: false,
      pain: false,
      swelling: false
    },
    sexualHealth: {
      erectileFunction: 5,
      ejaculation: 5,
      pain: 5
    }
  });

  const [urologyLogs, setUrologyLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available prostate symptoms
  const prostateSymptoms = [
    'Frequent urination',
    'Urgency to urinate',
    'Weak urine stream',
    'Difficulty starting urination',
    'Dribbling after urination',
    'Pain during urination',
    'Blood in urine',
    'Pain in lower back/hips',
    'No symptoms'
  ];

  // Load existing urology logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabUrologyLogs') || '[]');
    setUrologyLogs(logs);
  }, []);

  // Calculate urology health score
  const calculateUrologyScore = (formData) => {
    let score = 100;
    
    // Urinary symptoms
    if (formData.urinarySymptoms.frequency > 7) score -= 15;
    if (formData.urinarySymptoms.urgency > 7) score -= 15;
    if (formData.urinarySymptoms.streamStrength < 4) score -= 15;
    if (formData.urinarySymptoms.nocturia > 2) score -= 10;
    if (formData.urinarySymptoms.pain > 6) score -= 20;
    
    // Sexual health
    if (formData.sexualHealth.erectileFunction < 4) score -= 15;
    if (formData.sexualHealth.ejaculation < 4) score -= 10;
    if (formData.sexualHealth.pain > 6) score -= 15;
    
    // Testicular health
    if (formData.testicularHealth.lumps) score -= 25;
    if (formData.testicularHealth.pain) score -= 15;
    if (formData.testicularHealth.swelling) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great urological health!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good urological function' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some symptoms present' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Consider urological evaluation' };
  };

  const handleSymptomToggle = (symptom) => {
    const currentSymptoms = urologyForm.prostateHealth.symptoms;
    const updatedSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    
    setUrologyForm({
      ...urologyForm,
      prostateHealth: {
        ...urologyForm.prostateHealth,
        symptoms: updatedSymptoms
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateUrologyScore(urologyForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...urologyForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...urologyLogs];
      setUrologyLogs(updatedLogs);
      localStorage.setItem('amabUrologyLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generateUrologyInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setUrologyForm({
        notes: '',
        urinarySymptoms: {
          frequency: 5,
          urgency: 5,
          streamStrength: 5,
          nocturia: 0,
          pain: 5
        },
        prostateHealth: {
          psaLevel: '',
          lastDRE: '',
          familyHistory: false,
          symptoms: []
        },
        testicularHealth: {
          selfExam: false,
          lumps: false,
          pain: false,
          swelling: false
        },
        sexualHealth: {
          erectileFunction: 5,
          ejaculation: 5,
          pain: 5
        }
      });

      alert('Urology assessment saved successfully! 🩺');
    } catch (error) {
      console.error('Error logging urology data:', error);
      alert('Error logging urology data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate urology insights
  const generateUrologyInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Urological Health',
        message: 'Your urological function appears to be excellent. Keep up the good work!'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Urological Function',
        message: 'Your urological health is good. Monitor any symptoms and maintain regular checkups.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Urological Evaluation Recommended',
        message: 'Your symptoms suggest it may be time to discuss urological health with your healthcare provider.'
      });
    }

    // Specific recommendations
    if (log.urinarySymptoms.frequency > 7) {
      insights.push({
        type: 'warning',
        icon: '🚽',
        title: 'Frequent Urination',
        message: 'Frequent urination could indicate prostate issues or other conditions. Consider evaluation.'
      });
    }

    if (log.urinarySymptoms.streamStrength < 4) {
      insights.push({
        type: 'warning',
        icon: '💧',
        title: 'Weak Urine Stream',
        message: 'Weak urine stream may indicate prostate enlargement. Discuss with your healthcare provider.'
      });
    }

    if (log.testicularHealth.lumps) {
      insights.push({
        type: 'warning',
        icon: '🔍',
        title: 'Testicular Lumps',
        message: 'Any testicular lumps should be evaluated immediately by a healthcare provider.'
      });
    }

    if (log.sexualHealth.erectileFunction < 4) {
      insights.push({
        type: 'warning',
        icon: '💕',
        title: 'Erectile Function',
        message: 'Erectile dysfunction can have various causes. Consider discussing with your healthcare provider.'
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
    <div className="urology-prostate">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🩺 Urology & Prostate Wellness</h1>
        <p>Track your urological health and prostate wellness</p>
      </div>

      <div className="urology-content">
        {/* Urology Overview */}
        <div className="urology-overview">
          <div className="overview-card">
            <h3>📊 Total Assessments</h3>
            <p className="count-display">{urologyLogs.length} assessments completed</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: urologyLogs.length > 0 ? urologyLogs[0].category?.color || 'white' : 'white' }}>
              {urologyLogs.length > 0 ? `${urologyLogs[0].score}/100` : 'No assessments yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🚽 Urinary Health</h3>
            <p className="status-display">
              {urologyLogs.length > 0 ? 
                (urologyLogs[0].urinarySymptoms.frequency > 7 ? 'Monitor symptoms' : 'Good function') : 
                'Start assessment'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🔍 Self-Exam</h3>
            <p className="status-display">
              {urologyLogs.length > 0 ? 
                (urologyLogs[0].testicularHealth.selfExam ? 'Regular checks' : 'Consider starting') : 
                'Learn about it'
              }
            </p>
          </div>
        </div>

        {/* Urology Assessment Form */}
        <div className="urology-form-section">
          <h2>Urological Health Assessment</h2>
          <form onSubmit={handleSubmit} className="urology-form">
            <div className="form-group">
              <label>How are you feeling about your urological health?</label>
              <input
                type="text"
                value={urologyForm.notes}
                onChange={(e) => setUrologyForm({...urologyForm, notes: e.target.value})}
                placeholder="Describe how you're feeling about your urological health..."
              />
            </div>

            <div className="form-section">
              <h4>Urinary Symptoms</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Urination Frequency: {urologyForm.urinarySymptoms.frequency}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urologyForm.urinarySymptoms.frequency}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      urinarySymptoms: {...urologyForm.urinarySymptoms, frequency: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Urgency: {urologyForm.urinarySymptoms.urgency}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urologyForm.urinarySymptoms.urgency}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      urinarySymptoms: {...urologyForm.urinarySymptoms, urgency: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Stream Strength: {urologyForm.urinarySymptoms.streamStrength}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urologyForm.urinarySymptoms.streamStrength}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      urinarySymptoms: {...urologyForm.urinarySymptoms, streamStrength: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Nighttime Urination (times)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={urologyForm.urinarySymptoms.nocturia}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      urinarySymptoms: {...urologyForm.urinarySymptoms, nocturia: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Prostate Health</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>PSA Level (ng/mL) - Optional</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={urologyForm.prostateHealth.psaLevel}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      prostateHealth: {...urologyForm.prostateHealth, psaLevel: e.target.value}
                    })}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="form-group">
                  <label>Last DRE Date</label>
                  <input
                    type="date"
                    value={urologyForm.prostateHealth.lastDRE}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      prostateHealth: {...urologyForm.prostateHealth, lastDRE: e.target.value}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Prostate Symptoms</label>
                <div className="symptoms-grid">
                  {prostateSymptoms.map(symptom => (
                    <label key={symptom} className="symptom-option">
                      <input
                        type="checkbox"
                        checked={urologyForm.prostateHealth.symptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                      />
                      <span className="symptom-label">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Testicular Health</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={urologyForm.testicularHealth.selfExam}
                      onChange={(e) => setUrologyForm({
                        ...urologyForm,
                        testicularHealth: {...urologyForm.testicularHealth, selfExam: e.target.checked}
                      })}
                    />
                    Regular self-exams
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={urologyForm.testicularHealth.lumps}
                      onChange={(e) => setUrologyForm({
                        ...urologyForm,
                        testicularHealth: {...urologyForm.testicularHealth, lumps: e.target.checked}
                      })}
                    />
                    Lumps detected
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Sexual Health</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Erectile Function: {urologyForm.sexualHealth.erectileFunction}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urologyForm.sexualHealth.erectileFunction}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      sexualHealth: {...urologyForm.sexualHealth, erectileFunction: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Ejaculation: {urologyForm.sexualHealth.ejaculation}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urologyForm.sexualHealth.ejaculation}
                    onChange={(e) => setUrologyForm({
                      ...urologyForm,
                      sexualHealth: {...urologyForm.sexualHealth, ejaculation: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Complete Assessment'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Urology Insights</h2>
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

        {/* Urology History */}
        {urologyLogs.length > 0 && (
          <div className="urology-history">
            <h2>📈 Urology Assessment History</h2>
            <div className="history-list">
              {urologyLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Frequency: {log.urinarySymptoms.frequency}/10</span>
                    <span>Stream: {log.urinarySymptoms.streamStrength}/10</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Urology Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🩺 Prostate Health</h3>
              <p>Learn about prostate function, common conditions, and screening recommendations</p>
            </div>
            <div className="resource-card">
              <h3>🔍 Testicular Self-Exam</h3>
              <p>Step-by-step guide to performing monthly testicular self-examinations</p>
            </div>
            <div className="resource-card">
              <h3>🚽 Urinary Health</h3>
              <p>Understanding normal urinary function and when to seek medical attention</p>
            </div>
            <div className="resource-card">
              <h3>💕 Sexual Health</h3>
              <p>How urological health affects sexual function and what to expect</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Screening Guidelines</h3>
              <p>When and how often to get prostate and testicular cancer screenings</p>
            </div>
            <div className="resource-card">
              <h3>⚠️ Warning Signs</h3>
              <p>Know the symptoms that require immediate medical attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrologyProstate;