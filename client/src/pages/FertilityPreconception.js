import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './FertilityPreconception.css';

const FertilityPreconception = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for fertility tracking
  const [fertilityForm, setFertilityForm] = useState({
    age: user?.age || '',
    bmi: '',
    lifestyleFactors: {
      smoking: false,
      alcohol: false,
      stress: 5,
      exercise: 5,
      sleep: 5
    },
    healthFactors: {
      diabetes: false,
      hypertension: false,
      medications: '',
      supplements: ''
    },
    environmentalFactors: {
      heatExposure: false,
      chemicalExposure: false,
      radiationExposure: false
    },
    fertilityGoals: {
      timeline: '',
      concerns: '',
      questions: ''
    },
    notes: ''
  });

  const [fertilityLogs, setFertilityLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [fertilityScore, setFertilityScore] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing fertility logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabFertilityLogs') || '[]');
    setFertilityLogs(logs);
  }, []);

  // Calculate fertility readiness score
  const calculateFertilityScore = (formData) => {
    let score = 100;
    
    // Age factor
    const age = parseInt(formData.age);
    if (age > 40) score -= 20;
    else if (age > 35) score -= 10;
    
    // BMI factor
    const bmi = parseFloat(formData.bmi);
    if (bmi && (bmi < 18.5 || bmi > 30)) score -= 15;
    
    // Lifestyle factors
    if (formData.lifestyleFactors.smoking) score -= 25;
    if (formData.lifestyleFactors.alcohol) score -= 10;
    if (formData.lifestyleFactors.stress > 7) score -= 10;
    if (formData.lifestyleFactors.exercise < 3) score -= 10;
    if (formData.lifestyleFactors.sleep < 4) score -= 10;
    
    // Health factors
    if (formData.healthFactors.diabetes) score -= 15;
    if (formData.healthFactors.hypertension) score -= 10;
    
    // Environmental factors
    if (formData.environmentalFactors.heatExposure) score -= 10;
    if (formData.environmentalFactors.chemicalExposure) score -= 15;
    if (formData.environmentalFactors.radiationExposure) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great fertility readiness!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good fertility potential' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Consider lifestyle changes' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateFertilityScore(fertilityForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...fertilityForm,
        score: score,
        category: category
      };

      // Save to HealthDataContext (which handles persistence)
      saveHealthData(newLog);
      
      // Update local state
      const updatedLogs = [newLog, ...fertilityLogs];
      setFertilityLogs(updatedLogs);

      // Generate AI insights
      try {
        const aiInsights = await aiService.generateModuleInsights(newLog, 'fertility');
        setInsights(aiInsights);
      } catch (error) {
        console.error('Error generating AI insights:', error);
        // Fallback to basic insights
        const fallbackInsights = generateFertilityInsights(newLog);
        setInsights(fallbackInsights);
      }

      // Reset form
      setFertilityForm({
        age: user?.age || '',
        bmi: '',
        lifestyleFactors: {
          smoking: false,
          alcohol: false,
          stress: 5,
          exercise: 5,
          sleep: 5
        },
        healthFactors: {
          diabetes: false,
          hypertension: false,
          medications: '',
          supplements: ''
        },
        environmentalFactors: {
          heatExposure: false,
          chemicalExposure: false,
          radiationExposure: false
        },
        fertilityGoals: {
          timeline: '',
          concerns: '',
          questions: ''
        },
        notes: ''
      });

      alert('Fertility assessment saved successfully! 👶');
    } catch (error) {
      console.error('Error logging fertility data:', error);
      alert('Error logging fertility data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate fertility insights
  const generateFertilityInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Fertility Readiness',
        message: 'Your fertility score is excellent! You\'re well-prepared for conception.'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Fertility Potential',
        message: 'Your fertility score is good. Consider minor lifestyle optimizations.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Areas for Improvement',
        message: 'Your fertility score suggests some lifestyle changes could help optimize fertility.'
      });
    }

    // Specific recommendations
    if (log.lifestyleFactors.smoking) {
      insights.push({
        type: 'warning',
        icon: '🚭',
        title: 'Quit Smoking',
        message: 'Smoking significantly impacts male fertility. Consider quitting to improve sperm quality.'
      });
    }

    if (log.lifestyleFactors.stress > 7) {
      insights.push({
        type: 'warning',
        icon: '🧘‍♂️',
        title: 'Manage Stress',
        message: 'High stress levels can affect hormone production. Try stress-reduction techniques.'
      });
    }

    if (log.environmentalFactors.heatExposure) {
      insights.push({
        type: 'warning',
        icon: '🌡️',
        title: 'Avoid Heat Exposure',
        message: 'Excessive heat can affect sperm production. Avoid hot tubs and tight clothing.'
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
    <div className="fertility-preconception">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>👶 Fertility & Pre-Conception</h1>
        <p>Assess your fertility readiness and optimize for conception</p>
      </div>

      <div className="fertility-content">
        {/* Fertility Overview */}
        <div className="fertility-overview">
          <div className="overview-card">
            <h3>📊 Total Assessments</h3>
            <p className="count-display">{fertilityLogs.length} assessments completed</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: fertilityLogs.length > 0 ? fertilityLogs[0].category?.color || 'white' : 'white' }}>
              {fertilityLogs.length > 0 ? `${fertilityLogs[0].score}/100` : 'No assessments yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📈 Fertility Status</h3>
            <p className="status-display">
              {fertilityLogs.length > 0 ? fertilityLogs[0].category?.category || 'Unknown' : 'Start assessment'}
            </p>
          </div>
        </div>

        {/* Fertility Assessment Form */}
        <div className="fertility-form-section">
          <h2>Fertility Readiness Assessment</h2>
          <form onSubmit={handleSubmit} className="fertility-form">
            <div className="form-group">
              <label>How are you feeling about your fertility journey?</label>
              <input
                type="text"
                value={fertilityForm.notes}
                onChange={(e) => setFertilityForm({...fertilityForm, notes: e.target.value})}
                placeholder="Describe your current thoughts and feelings about fertility..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={fertilityForm.age}
                  onChange={(e) => setFertilityForm({...fertilityForm, age: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>BMI (Optional)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  step="0.1"
                  value={fertilityForm.bmi}
                  onChange={(e) => setFertilityForm({...fertilityForm, bmi: e.target.value})}
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Lifestyle Factors</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.lifestyleFactors.smoking}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        lifestyleFactors: {...fertilityForm.lifestyleFactors, smoking: e.target.checked}
                      })}
                    />
                    Currently smoking
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.lifestyleFactors.alcohol}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        lifestyleFactors: {...fertilityForm.lifestyleFactors, alcohol: e.target.checked}
                      })}
                    />
                    Regular alcohol consumption
                  </label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Stress Level: {fertilityForm.lifestyleFactors.stress}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fertilityForm.lifestyleFactors.stress}
                    onChange={(e) => setFertilityForm({
                      ...fertilityForm, 
                      lifestyleFactors: {...fertilityForm.lifestyleFactors, stress: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Exercise Level: {fertilityForm.lifestyleFactors.exercise}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fertilityForm.lifestyleFactors.exercise}
                    onChange={(e) => setFertilityForm({
                      ...fertilityForm, 
                      lifestyleFactors: {...fertilityForm.lifestyleFactors, exercise: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Health Factors</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.healthFactors.diabetes}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        healthFactors: {...fertilityForm.healthFactors, diabetes: e.target.checked}
                      })}
                    />
                    Diabetes
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.healthFactors.hypertension}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        healthFactors: {...fertilityForm.healthFactors, hypertension: e.target.checked}
                      })}
                    />
                    Hypertension
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Environmental Factors</h4>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.environmentalFactors.heatExposure}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        environmentalFactors: {...fertilityForm.environmentalFactors, heatExposure: e.target.checked}
                      })}
                    />
                    Regular heat exposure (hot tubs, saunas)
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={fertilityForm.environmentalFactors.chemicalExposure}
                      onChange={(e) => setFertilityForm({
                        ...fertilityForm, 
                        environmentalFactors: {...fertilityForm.environmentalFactors, chemicalExposure: e.target.checked}
                      })}
                    />
                    Chemical exposure (work/environment)
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Fertility Goals & Timeline</label>
              <textarea
                value={fertilityForm.fertilityGoals.timeline}
                onChange={(e) => setFertilityForm({
                  ...fertilityForm, 
                  fertilityGoals: {...fertilityForm.fertilityGoals, timeline: e.target.value}
                })}
                placeholder="When are you planning to start trying to conceive? Any specific timeline?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Concerns & Questions</label>
              <textarea
                value={fertilityForm.fertilityGoals.concerns}
                onChange={(e) => setFertilityForm({
                  ...fertilityForm, 
                  fertilityGoals: {...fertilityForm.fertilityGoals, concerns: e.target.value}
                })}
                placeholder="Any concerns about fertility or questions for your healthcare provider?"
                rows="3"
              />
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
            <h2>🤖 AI Fertility Insights</h2>
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

        {/* Fertility History */}
        {fertilityLogs.length > 0 && (
          <div className="fertility-history">
            <h2>📈 Fertility Assessment History</h2>
            <div className="history-list">
              {fertilityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Age: {log.age}</span>
                    <span>BMI: {log.bmi || 'N/A'}</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Fertility Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🧬 Male Fertility Basics</h3>
              <p>Understand how male fertility works, sperm production, and factors that affect conception</p>
            </div>
            <div className="resource-card">
              <h3>⏰ Optimal Timing</h3>
              <p>Learn about the fertile window and how to maximize conception chances through proper timing</p>
            </div>
            <div className="resource-card">
              <h3>🥗 Nutrition for Fertility</h3>
              <p>Key nutrients like zinc, folate, and antioxidants that support male reproductive health</p>
            </div>
            <div className="resource-card">
              <h3>🌡️ Temperature Impact</h3>
              <p>How heat exposure from hot tubs, laptops, and tight clothing can affect sperm production</p>
            </div>
            <div className="resource-card">
              <h3>💊 Supplements Guide</h3>
              <p>Evidence-based supplements like CoQ10, L-carnitine, and vitamin D for male fertility</p>
            </div>
            <div className="resource-card">
              <h3>🧘‍♂️ Stress Management</h3>
              <p>How chronic stress affects hormone levels and fertility, plus stress reduction techniques</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilityPreconception;