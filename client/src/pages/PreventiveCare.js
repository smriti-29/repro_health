import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './PreventiveCare.css';

const PreventiveCare = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for preventive care tracking
  const [preventiveForm, setPreventiveForm] = useState({
    notes: '',
    vaccinations: {
      flu: '',
      covid19: '',
      hpv: '',
      hepatitisB: '',
      tetanus: '',
      pneumonia: ''
    },
    screenings: {
      bloodPressure: '',
      cholesterol: '',
      diabetes: '',
      colonoscopy: '',
      eyeExam: '',
      dentalExam: ''
    },
    lifestyle: {
      smoking: false,
      alcohol: 0,
      exercise: 0,
      sleep: 7,
      stress: 5
    },
    familyHistory: {
      heartDisease: false,
      diabetes: false,
      cancer: false,
      highBloodPressure: false,
      stroke: false
    },
    riskFactors: {
      age: user?.age || '',
      weight: '',
      height: '',
      bloodPressure: '',
      cholesterol: ''
    }
  });

  const [preventiveLogs, setPreventiveLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing preventive care logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabPreventiveLogs') || '[]');
    setPreventiveLogs(logs);
  }, []);

  // Calculate preventive care score
  const calculatePreventiveScore = (formData) => {
    let score = 100;
    
    // Vaccination factors
    const currentYear = new Date().getFullYear();
    const vaccinations = formData.vaccinations;
    
    if (!vaccinations.flu || new Date(vaccinations.flu).getFullYear() < currentYear) score -= 10;
    if (!vaccinations.covid19 || new Date(vaccinations.covid19).getFullYear() < currentYear) score -= 10;
    if (!vaccinations.hpv) score -= 5;
    if (!vaccinations.hepatitisB) score -= 5;
    if (!vaccinations.tetanus || new Date(vaccinations.tetanus).getFullYear() < currentYear - 10) score -= 5;
    
    // Screening factors
    const screenings = formData.screenings;
    if (!screenings.bloodPressure || new Date(screenings.bloodPressure).getFullYear() < currentYear) score -= 10;
    if (!screenings.cholesterol || new Date(screenings.cholesterol).getFullYear() < currentYear - 2) score -= 10;
    if (!screenings.diabetes || new Date(screenings.diabetes).getFullYear() < currentYear - 2) score -= 10;
    if (!screenings.eyeExam || new Date(screenings.eyeExam).getFullYear() < currentYear - 2) score -= 5;
    if (!screenings.dentalExam || new Date(screenings.dentalExam).getFullYear() < currentYear) score -= 5;
    
    // Lifestyle factors
    if (formData.lifestyle.smoking) score -= 20;
    if (formData.lifestyle.alcohol > 14) score -= 10; // More than 14 drinks per week
    if (formData.lifestyle.exercise < 150) score -= 15; // Less than 150 minutes per week
    if (formData.lifestyle.sleep < 6 || formData.lifestyle.sleep > 9) score -= 10;
    if (formData.lifestyle.stress > 7) score -= 10;
    
    // Family history factors (increases risk but doesn't directly reduce score)
    const familyHistoryCount = Object.values(formData.familyHistory).filter(Boolean).length;
    if (familyHistoryCount > 2) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great preventive care!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good preventive health' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Focus on preventive care' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculatePreventiveScore(preventiveForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...preventiveForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...preventiveLogs];
      setPreventiveLogs(updatedLogs);
      localStorage.setItem('amabPreventiveLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generatePreventiveInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setPreventiveForm({
        notes: '',
        vaccinations: {
          flu: '',
          covid19: '',
          hpv: '',
          hepatitisB: '',
          tetanus: '',
          pneumonia: ''
        },
        screenings: {
          bloodPressure: '',
          cholesterol: '',
          diabetes: '',
          colonoscopy: '',
          eyeExam: '',
          dentalExam: ''
        },
        lifestyle: {
          smoking: false,
          alcohol: 0,
          exercise: 0,
          sleep: 7,
          stress: 5
        },
        familyHistory: {
          heartDisease: false,
          diabetes: false,
          cancer: false,
          highBloodPressure: false,
          stroke: false
        },
        riskFactors: {
          age: user?.age || '',
          weight: '',
          height: '',
          bloodPressure: '',
          cholesterol: ''
        }
      });

      alert('Preventive care assessment saved successfully! 🛡️');
    } catch (error) {
      console.error('Error logging preventive care data:', error);
      alert('Error logging preventive care data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preventive care insights
  const generatePreventiveInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Preventive Care',
        message: 'Your preventive care is excellent! You\'re doing a great job staying on top of your health.'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Preventive Health',
        message: 'Your preventive care is good. Continue with your current routine and address any gaps.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Preventive Care Needs Attention',
        message: 'Your preventive care could be improved. Focus on vaccinations, screenings, and lifestyle factors.'
      });
    }

    // Specific recommendations
    const currentYear = new Date().getFullYear();
    
    if (!log.vaccinations.flu || new Date(log.vaccinations.flu).getFullYear() < currentYear) {
      insights.push({
        type: 'warning',
        icon: '💉',
        title: 'Flu Vaccine Due',
        message: 'Get your annual flu vaccine to protect against seasonal influenza.'
      });
    }

    if (!log.vaccinations.covid19 || new Date(log.vaccinations.covid19).getFullYear() < currentYear) {
      insights.push({
        type: 'warning',
        icon: '🦠',
        title: 'COVID-19 Vaccine',
        message: 'Stay up to date with your COVID-19 vaccinations and boosters.'
      });
    }

    if (!log.screenings.bloodPressure || new Date(log.screenings.bloodPressure).getFullYear() < currentYear) {
      insights.push({
        type: 'warning',
        icon: '🩺',
        title: 'Blood Pressure Check',
        message: 'Get your blood pressure checked annually to monitor cardiovascular health.'
      });
    }

    if (!log.screenings.cholesterol || new Date(log.screenings.cholesterol).getFullYear() < currentYear - 2) {
      insights.push({
        type: 'warning',
        icon: '🩸',
        title: 'Cholesterol Screening',
        message: 'Get your cholesterol checked every 2-3 years to assess cardiovascular risk.'
      });
    }

    if (log.lifestyle.smoking) {
      insights.push({
        type: 'warning',
        icon: '🚭',
        title: 'Quit Smoking',
        message: 'Smoking is a major risk factor for many diseases. Consider quitting to improve your health.'
      });
    }

    if (log.lifestyle.exercise < 150) {
      insights.push({
        type: 'warning',
        icon: '🏃‍♂️',
        title: 'Increase Physical Activity',
        message: 'Aim for at least 150 minutes of moderate exercise per week for optimal health.'
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
    <div className="preventive-care">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🛡️ Preventive Care</h1>
        <p>Track your preventive health measures and screenings</p>
      </div>

      <div className="preventive-care-content">
        {/* Preventive Care Overview */}
        <div className="preventive-overview">
          <div className="overview-card">
            <h3>📊 Total Assessments</h3>
            <p className="count-display">{preventiveLogs.length} assessments completed</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: preventiveLogs.length > 0 ? preventiveLogs[0].category?.color || 'white' : 'white' }}>
              {preventiveLogs.length > 0 ? `${preventiveLogs[0].score}/100` : 'No assessments yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>💉 Vaccination Status</h3>
            <p className="status-display">
              {preventiveLogs.length > 0 ? 
                (preventiveLogs[0].vaccinations.flu ? 'Up to date' : 'Needs attention') : 
                'Start tracking'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🩺 Screening Status</h3>
            <p className="status-display">
              {preventiveLogs.length > 0 ? 
                (preventiveLogs[0].screenings.bloodPressure ? 'Current' : 'Due') : 
                'Start tracking'
              }
            </p>
          </div>
        </div>

        {/* Preventive Care Assessment Form */}
        <div className="preventive-form-section">
          <h2>Preventive Care Assessment</h2>
          <form onSubmit={handleSubmit} className="preventive-form">
            <div className="form-group">
              <label>How are you feeling about your preventive health?</label>
              <input
                type="text"
                value={preventiveForm.notes}
                onChange={(e) => setPreventiveForm({...preventiveForm, notes: e.target.value})}
                placeholder="Describe how you're feeling about your preventive health..."
              />
            </div>

            <div className="form-section">
              <h4>Vaccinations</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Flu Vaccine</label>
                  <input
                    type="date"
                    value={preventiveForm.vaccinations.flu}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      vaccinations: {...preventiveForm.vaccinations, flu: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>COVID-19 Vaccine</label>
                  <input
                    type="date"
                    value={preventiveForm.vaccinations.covid19}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      vaccinations: {...preventiveForm.vaccinations, covid19: e.target.value}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>HPV Vaccine</label>
                  <input
                    type="date"
                    value={preventiveForm.vaccinations.hpv}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      vaccinations: {...preventiveForm.vaccinations, hpv: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Hepatitis B Vaccine</label>
                  <input
                    type="date"
                    value={preventiveForm.vaccinations.hepatitisB}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      vaccinations: {...preventiveForm.vaccinations, hepatitisB: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Health Screenings</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Pressure Check</label>
                  <input
                    type="date"
                    value={preventiveForm.screenings.bloodPressure}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      screenings: {...preventiveForm.screenings, bloodPressure: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Cholesterol Screening</label>
                  <input
                    type="date"
                    value={preventiveForm.screenings.cholesterol}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      screenings: {...preventiveForm.screenings, cholesterol: e.target.value}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Diabetes Screening</label>
                  <input
                    type="date"
                    value={preventiveForm.screenings.diabetes}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      screenings: {...preventiveForm.screenings, diabetes: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Eye Exam</label>
                  <input
                    type="date"
                    value={preventiveForm.screenings.eyeExam}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      screenings: {...preventiveForm.screenings, eyeExam: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Lifestyle Factors</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={preventiveForm.lifestyle.smoking}
                      onChange={(e) => setPreventiveForm({
                        ...preventiveForm,
                        lifestyle: {...preventiveForm.lifestyle, smoking: e.target.checked}
                      })}
                    />
                    Currently smoking
                  </label>
                </div>
                <div className="form-group">
                  <label>Alcohol (drinks/week)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={preventiveForm.lifestyle.alcohol}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      lifestyle: {...preventiveForm.lifestyle, alcohol: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Exercise (minutes/week)</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={preventiveForm.lifestyle.exercise}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      lifestyle: {...preventiveForm.lifestyle, exercise: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Sleep (hours/night)</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={preventiveForm.lifestyle.sleep}
                    onChange={(e) => setPreventiveForm({
                      ...preventiveForm,
                      lifestyle: {...preventiveForm.lifestyle, sleep: parseFloat(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Family History</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={preventiveForm.familyHistory.heartDisease}
                      onChange={(e) => setPreventiveForm({
                        ...preventiveForm,
                        familyHistory: {...preventiveForm.familyHistory, heartDisease: e.target.checked}
                      })}
                    />
                    Heart disease
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={preventiveForm.familyHistory.diabetes}
                      onChange={(e) => setPreventiveForm({
                        ...preventiveForm,
                        familyHistory: {...preventiveForm.familyHistory, diabetes: e.target.checked}
                      })}
                    />
                    Diabetes
                  </label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={preventiveForm.familyHistory.cancer}
                      onChange={(e) => setPreventiveForm({
                        ...preventiveForm,
                        familyHistory: {...preventiveForm.familyHistory, cancer: e.target.checked}
                      })}
                    />
                    Cancer
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={preventiveForm.familyHistory.highBloodPressure}
                      onChange={(e) => setPreventiveForm({
                        ...preventiveForm,
                        familyHistory: {...preventiveForm.familyHistory, highBloodPressure: e.target.checked}
                      })}
                    />
                    High blood pressure
                  </label>
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
            <h2>🤖 AI Preventive Care Insights</h2>
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

        {/* Preventive Care History */}
        {preventiveLogs.length > 0 && (
          <div className="preventive-history">
            <h2>📈 Preventive Care History</h2>
            <div className="history-list">
              {preventiveLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Exercise: {log.lifestyle.exercise} min/week</span>
                    <span>Sleep: {log.lifestyle.sleep} hours</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Preventive Care Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>💉 Vaccination Schedule</h3>
              <p>Learn about recommended vaccinations for adults and when to get them</p>
            </div>
            <div className="resource-card">
              <h3>🩺 Screening Guidelines</h3>
              <p>Understand when and how often to get various health screenings</p>
            </div>
            <div className="resource-card">
              <h3>🏃‍♂️ Lifestyle Prevention</h3>
              <p>How diet, exercise, and lifestyle choices prevent chronic diseases</p>
            </div>
            <div className="resource-card">
              <h3>🧬 Genetic Risk Factors</h3>
              <p>Understanding family history and genetic predisposition to diseases</p>
            </div>
            <div className="resource-card">
              <h3>🩸 Health Monitoring</h3>
              <p>How to monitor your health at home and when to see a doctor</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Healthcare Navigation</h3>
              <p>How to effectively communicate with healthcare providers and navigate the system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveCare;