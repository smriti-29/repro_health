import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './BoneMuscleHealth.css';

const BoneMuscleHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for bone and muscle health tracking
  const [boneMuscleForm, setBoneMuscleForm] = useState({
    notes: '',
    strength: {
      upperBody: 5,
      lowerBody: 5,
      core: 5,
      grip: 5
    },
    flexibility: {
      hamstrings: 5,
      shoulders: 5,
      hips: 5,
      spine: 5
    },
    endurance: {
      cardiovascular: 5,
      muscular: 5,
      balance: 5
    },
    pain: {
      joints: 5,
      muscles: 5,
      back: 5,
      neck: 5
    },
    activity: {
      type: '',
      duration: 0,
      intensity: 5,
      frequency: 0
    },
    nutrition: {
      protein: 5,
      calcium: 5,
      vitaminD: 5,
      hydration: 5
    }
  });

  const [boneMuscleLogs, setBoneMuscleLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing bone and muscle health logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabBoneMuscleLogs') || '[]');
    setBoneMuscleLogs(logs);
  }, []);

  // Calculate bone and muscle health score
  const calculateBoneMuscleScore = (formData) => {
    let score = 100;
    
    // Strength factors
    const avgStrength = (formData.strength.upperBody + formData.strength.lowerBody + 
                        formData.strength.core + formData.strength.grip) / 4;
    if (avgStrength < 4) score -= 20;
    else if (avgStrength < 6) score -= 10;
    
    // Flexibility factors
    const avgFlexibility = (formData.flexibility.hamstrings + formData.flexibility.shoulders + 
                           formData.flexibility.hips + formData.flexibility.spine) / 4;
    if (avgFlexibility < 4) score -= 15;
    else if (avgFlexibility < 6) score -= 8;
    
    // Endurance factors
    const avgEndurance = (formData.endurance.cardiovascular + formData.endurance.muscular + 
                         formData.endurance.balance) / 3;
    if (avgEndurance < 4) score -= 15;
    else if (avgEndurance < 6) score -= 8;
    
    // Pain factors
    const avgPain = (formData.pain.joints + formData.pain.muscles + 
                    formData.pain.back + formData.pain.neck) / 4;
    if (avgPain > 6) score -= 20;
    else if (avgPain > 4) score -= 10;
    
    // Activity factors
    if (formData.activity.frequency < 3) score -= 15;
    if (formData.activity.intensity < 4) score -= 10;
    
    // Nutrition factors
    const avgNutrition = (formData.nutrition.protein + formData.nutrition.calcium + 
                         formData.nutrition.vitaminD + formData.nutrition.hydration) / 4;
    if (avgNutrition < 4) score -= 10;
    else if (avgNutrition < 6) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great bone and muscle health!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good musculoskeletal function' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Consider strength training and evaluation' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateBoneMuscleScore(boneMuscleForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...boneMuscleForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...boneMuscleLogs];
      setBoneMuscleLogs(updatedLogs);
      localStorage.setItem('amabBoneMuscleLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generateBoneMuscleInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setBoneMuscleForm({
        notes: '',
        strength: {
          upperBody: 5,
          lowerBody: 5,
          core: 5,
          grip: 5
        },
        flexibility: {
          hamstrings: 5,
          shoulders: 5,
          hips: 5,
          spine: 5
        },
        endurance: {
          cardiovascular: 5,
          muscular: 5,
          balance: 5
        },
        pain: {
          joints: 5,
          muscles: 5,
          back: 5,
          neck: 5
        },
        activity: {
          type: '',
          duration: 0,
          intensity: 5,
          frequency: 0
        },
        nutrition: {
          protein: 5,
          calcium: 5,
          vitaminD: 5,
          hydration: 5
        }
      });

      alert('Bone & muscle health log saved successfully! 💪');
    } catch (error) {
      console.error('Error logging bone & muscle health data:', error);
      alert('Error logging bone & muscle health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate bone and muscle health insights
  const generateBoneMuscleInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Bone & Muscle Health',
        message: 'Your musculoskeletal health is excellent! Keep up the great work with your exercise and nutrition.'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Musculoskeletal Function',
        message: 'Your bone and muscle health is good. Continue with your current routine and consider minor improvements.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Musculoskeletal Health Needs Attention',
        message: 'Your scores suggest areas for improvement. Consider increasing strength training and improving nutrition.'
      });
    }

    // Specific recommendations
    const avgStrength = (log.strength.upperBody + log.strength.lowerBody + 
                        log.strength.core + log.strength.grip) / 4;
    if (avgStrength < 4) {
      insights.push({
        type: 'warning',
        icon: '💪',
        title: 'Low Strength Levels',
        message: 'Your strength levels are low. Consider starting a progressive strength training program.'
      });
    }

    const avgPain = (log.pain.joints + log.pain.muscles + 
                    log.pain.back + log.pain.neck) / 4;
    if (avgPain > 6) {
      insights.push({
        type: 'warning',
        icon: '😣',
        title: 'High Pain Levels',
        message: 'You\'re experiencing significant pain. Consider consulting a healthcare provider or physical therapist.'
      });
    }

    if (log.activity.frequency < 3) {
      insights.push({
        type: 'warning',
        icon: '🏃‍♂️',
        title: 'Low Activity Frequency',
        message: 'You\'re not exercising enough. Aim for at least 3-4 days of physical activity per week.'
      });
    }

    const avgNutrition = (log.nutrition.protein + log.nutrition.calcium + 
                         log.nutrition.vitaminD + log.nutrition.hydration) / 4;
    if (avgNutrition < 4) {
      insights.push({
        type: 'warning',
        icon: '🥗',
        title: 'Nutrition Needs Improvement',
        message: 'Your nutrition scores are low. Focus on adequate protein, calcium, and vitamin D for bone health.'
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
    <div className="bone-muscle-health">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💪 Bone & Muscle Health</h1>
        <p>Track your musculoskeletal health and physical performance</p>
      </div>

      <div className="bone-muscle-content">
        {/* Bone & Muscle Overview */}
        <div className="bone-muscle-overview">
          <div className="overview-card">
            <h3>📊 Total Logs</h3>
            <p className="count-display">{boneMuscleLogs.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: boneMuscleLogs.length > 0 ? boneMuscleLogs[0].category?.color || 'white' : 'white' }}>
              {boneMuscleLogs.length > 0 ? `${boneMuscleLogs[0].score}/100` : 'No logs yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>💪 Strength Level</h3>
            <p className="score-display">
              {boneMuscleLogs.length > 0 ? 
                Math.round((boneMuscleLogs[0].strength.upperBody + boneMuscleLogs[0].strength.lowerBody + 
                           boneMuscleLogs[0].strength.core + boneMuscleLogs[0].strength.grip) / 4) : 'No data'}/10
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🏃‍♂️ Activity Frequency</h3>
            <p className="score-display">
              {boneMuscleLogs.length > 0 ? `${boneMuscleLogs[0].activity.frequency} days/week` : 'No data'}
            </p>
          </div>
        </div>

        {/* Bone & Muscle Health Form */}
        <div className="bone-muscle-form-section">
          <h2>Bone & Muscle Health Assessment</h2>
          <form onSubmit={handleSubmit} className="bone-muscle-form">
            <div className="form-group">
              <label>How are you feeling about your bone and muscle health?</label>
              <input
                type="text"
                value={boneMuscleForm.notes}
                onChange={(e) => setBoneMuscleForm({...boneMuscleForm, notes: e.target.value})}
                placeholder="Describe how you're feeling about your bone and muscle health..."
              />
            </div>

            <div className="form-section">
              <h4>Strength Assessment</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Upper Body Strength: {boneMuscleForm.strength.upperBody}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.strength.upperBody}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      strength: {...boneMuscleForm.strength, upperBody: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Lower Body Strength: {boneMuscleForm.strength.lowerBody}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.strength.lowerBody}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      strength: {...boneMuscleForm.strength, lowerBody: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Core Strength: {boneMuscleForm.strength.core}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.strength.core}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      strength: {...boneMuscleForm.strength, core: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Grip Strength: {boneMuscleForm.strength.grip}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.strength.grip}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      strength: {...boneMuscleForm.strength, grip: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Flexibility Assessment</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Hamstring Flexibility: {boneMuscleForm.flexibility.hamstrings}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.flexibility.hamstrings}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      flexibility: {...boneMuscleForm.flexibility, hamstrings: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Shoulder Flexibility: {boneMuscleForm.flexibility.shoulders}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.flexibility.shoulders}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      flexibility: {...boneMuscleForm.flexibility, shoulders: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Pain Assessment</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Joint Pain: {boneMuscleForm.pain.joints}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.pain.joints}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      pain: {...boneMuscleForm.pain, joints: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Muscle Pain: {boneMuscleForm.pain.muscles}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.pain.muscles}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      pain: {...boneMuscleForm.pain, muscles: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Physical Activity</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Activity Type</label>
                  <input
                    type="text"
                    value={boneMuscleForm.activity.type}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      activity: {...boneMuscleForm.activity, type: e.target.value}
                    })}
                    placeholder="What type of exercise did you do?"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={boneMuscleForm.activity.duration}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      activity: {...boneMuscleForm.activity, duration: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Intensity: {boneMuscleForm.activity.intensity}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.activity.intensity}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      activity: {...boneMuscleForm.activity, intensity: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Frequency (days/week)</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={boneMuscleForm.activity.frequency}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      activity: {...boneMuscleForm.activity, frequency: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Nutrition for Bone & Muscle Health</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Protein Intake: {boneMuscleForm.nutrition.protein}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.nutrition.protein}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      nutrition: {...boneMuscleForm.nutrition, protein: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Calcium Intake: {boneMuscleForm.nutrition.calcium}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={boneMuscleForm.nutrition.calcium}
                    onChange={(e) => setBoneMuscleForm({
                      ...boneMuscleForm,
                      nutrition: {...boneMuscleForm.nutrition, calcium: parseInt(e.target.value)}
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
              {isLoading ? 'Analyzing...' : 'Log Bone & Muscle Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Bone & Muscle Health Insights</h2>
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

        {/* Bone & Muscle Health History */}
        {boneMuscleLogs.length > 0 && (
          <div className="bone-muscle-history">
            <h2>📈 Bone & Muscle Health History</h2>
            <div className="history-list">
              {boneMuscleLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Strength: {Math.round((log.strength.upperBody + log.strength.lowerBody + log.strength.core + log.strength.grip) / 4)}/10</span>
                    <span>Activity: {log.activity.frequency} days/week</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Bone & Muscle Health Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>💪 Strength Training</h3>
              <p>Learn about progressive strength training, proper form, and building muscle mass</p>
            </div>
            <div className="resource-card">
              <h3>🦴 Bone Health</h3>
              <p>Understand bone density, osteoporosis prevention, and calcium requirements</p>
            </div>
            <div className="resource-card">
              <h3>🤸‍♂️ Flexibility & Mobility</h3>
              <p>Importance of flexibility, stretching routines, and maintaining joint mobility</p>
            </div>
            <div className="resource-card">
              <h3>🥗 Nutrition for Muscles</h3>
              <p>Protein requirements, timing, and nutrients essential for muscle health</p>
            </div>
            <div className="resource-card">
              <h3>🏃‍♂️ Exercise Programming</h3>
              <p>How to create balanced exercise routines for optimal musculoskeletal health</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Injury Prevention</h3>
              <p>Common injuries, warning signs, and how to prevent musculoskeletal problems</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoneMuscleHealth;