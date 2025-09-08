import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './HormonalHealth.css';

const HormonalHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for hormonal health tracking
  const [hormoneForm, setHormoneForm] = useState({
    mood: '',
    energy: 5,
    libido: 5,
    testosterone: '',
    thyroid: '',
    muscleMass: 5,
    sleepQuality: 5,
    concentration: 5,
    hairLoss: '',
    weight: '',
    notes: ''
  });

  const [hormoneLogs, setHormoneLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing hormone logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabHormoneLogs') || '[]');
    setHormoneLogs(logs);
  }, []);

  // Calculate hormonal health score
  const calculateHormoneScore = (formData) => {
    let score = 100;
    
    // Energy factor
    if (formData.energy < 4) score -= 20;
    else if (formData.energy < 6) score -= 10;
    
    // Libido factor
    if (formData.libido < 4) score -= 15;
    else if (formData.libido < 6) score -= 8;
    
    // Sleep quality
    if (formData.sleepQuality < 4) score -= 15;
    else if (formData.sleepQuality < 6) score -= 8;
    
    // Concentration
    if (formData.concentration < 4) score -= 10;
    else if (formData.concentration < 6) score -= 5;
    
    // Muscle mass
    if (formData.muscleMass < 4) score -= 10;
    else if (formData.muscleMass < 6) score -= 5;
    
    // Testosterone level (if provided)
    const testosterone = parseFloat(formData.testosterone);
    if (testosterone && testosterone < 300) score -= 25;
    else if (testosterone && testosterone < 400) score -= 15;
    
    // Hair loss
    if (formData.hairLoss === 'severe') score -= 10;
    else if (formData.hairLoss === 'moderate') score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great hormonal health!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good hormonal balance' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Consider hormone evaluation' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateHormoneScore(hormoneForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...hormoneForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...hormoneLogs];
      setHormoneLogs(updatedLogs);
      localStorage.setItem('amabHormoneLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generateHormoneInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setHormoneForm({
        mood: '',
        energy: 5,
        libido: 5,
        testosterone: '',
        thyroid: '',
        muscleMass: 5,
        sleepQuality: 5,
        concentration: 5,
        hairLoss: '',
        weight: '',
        notes: ''
      });

      alert('Hormone log saved successfully! ⚡');
    } catch (error) {
      console.error('Error logging hormone data:', error);
      alert('Error logging hormone data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate hormone insights
  const generateHormoneInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Hormonal Health',
        message: 'Your hormone levels appear to be well-balanced. Keep up the good work!'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Hormonal Balance',
        message: 'Your hormone health is good. Consider minor optimizations for even better results.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Hormone Evaluation Recommended',
        message: 'Your symptoms suggest it may be time to discuss hormone levels with your healthcare provider.'
      });
    }

    // Specific recommendations
    if (log.energy < 4) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Low Energy Levels',
        message: 'Low energy could indicate low testosterone. Consider lifestyle changes and hormone testing.'
      });
    }

    if (log.libido < 4) {
      insights.push({
        type: 'warning',
        icon: '💕',
        title: 'Low Libido',
        message: 'Decreased libido can be related to hormone levels. Discuss with your healthcare provider.'
      });
    }

    if (log.testosterone && parseFloat(log.testosterone) < 300) {
      insights.push({
        type: 'warning',
        icon: '🧬',
        title: 'Low Testosterone',
        message: 'Your testosterone level is below normal range. Consider discussing treatment options.'
      });
    }

    if (log.sleepQuality < 4) {
      insights.push({
        type: 'warning',
        icon: '😴',
        title: 'Poor Sleep Quality',
        message: 'Poor sleep can affect hormone production. Focus on sleep hygiene and stress management.'
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
    <div className="hormonal-health">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>⚡ Hormonal Health</h1>
        <p>Track your hormone levels and optimize your endocrine health</p>
      </div>

      <div className="hormonal-health-content">
        {/* Hormone Overview */}
        <div className="hormone-overview">
          <div className="overview-card">
            <h3>📊 Total Logs</h3>
            <p className="count-display">{hormoneLogs.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: hormoneLogs.length > 0 ? hormoneLogs[0].category?.color || 'white' : 'white' }}>
              {hormoneLogs.length > 0 ? `${hormoneLogs[0].score}/100` : 'No logs yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>⚡ Energy Level</h3>
            <p className="score-display">
              {hormoneLogs.length > 0 ? `${hormoneLogs[0].energy}/10` : 'No data'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>💕 Libido</h3>
            <p className="score-display">
              {hormoneLogs.length > 0 ? `${hormoneLogs[0].libido}/10` : 'No data'}
            </p>
          </div>
        </div>

        {/* Hormone Logging Form */}
        <div className="hormone-form-section">
          <h2>Log Your Hormone Data</h2>
          <form onSubmit={handleSubmit} className="hormone-form">
            <div className="form-group">
              <label>How are you feeling today?</label>
              <input
                type="text"
                value={hormoneForm.mood}
                onChange={(e) => setHormoneForm({...hormoneForm, mood: e.target.value})}
                placeholder="Describe how you're feeling today..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Energy Level: {hormoneForm.energy}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hormoneForm.energy}
                  onChange={(e) => setHormoneForm({...hormoneForm, energy: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Libido: {hormoneForm.libido}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hormoneForm.libido}
                  onChange={(e) => setHormoneForm({...hormoneForm, libido: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Testosterone (ng/dL) - Optional</label>
                <input
                  type="number"
                  min="0"
                  value={hormoneForm.testosterone}
                  onChange={(e) => setHormoneForm({...hormoneForm, testosterone: e.target.value})}
                  placeholder="e.g., 650"
                />
              </div>
              <div className="form-group">
                <label>Thyroid Status</label>
                <select
                  value={hormoneForm.thyroid}
                  onChange={(e) => setHormoneForm({...hormoneForm, thyroid: e.target.value})}
                >
                  <option value="">Select status</option>
                  <option value="normal">Normal</option>
                  <option value="hypothyroid">Hypothyroid</option>
                  <option value="hyperthyroid">Hyperthyroid</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Muscle Mass: {hormoneForm.muscleMass}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hormoneForm.muscleMass}
                  onChange={(e) => setHormoneForm({...hormoneForm, muscleMass: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Sleep Quality: {hormoneForm.sleepQuality}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hormoneForm.sleepQuality}
                  onChange={(e) => setHormoneForm({...hormoneForm, sleepQuality: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Concentration: {hormoneForm.concentration}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hormoneForm.concentration}
                  onChange={(e) => setHormoneForm({...hormoneForm, concentration: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Hair Loss</label>
                <select
                  value={hormoneForm.hairLoss}
                  onChange={(e) => setHormoneForm({...hormoneForm, hairLoss: e.target.value})}
                >
                  <option value="">Select level</option>
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Weight (lbs) - Optional</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={hormoneForm.weight}
                onChange={(e) => setHormoneForm({...hormoneForm, weight: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={hormoneForm.notes}
                onChange={(e) => setHormoneForm({...hormoneForm, notes: e.target.value})}
                placeholder="Any other observations about your hormonal health?"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Hormone Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Hormone Insights</h2>
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

        {/* Hormone History */}
        {hormoneLogs.length > 0 && (
          <div className="hormone-history">
            <h2>📈 Hormone History</h2>
            <div className="history-list">
              {hormoneLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Energy: {log.energy}/10</span>
                    <span>Libido: {log.libido}/10</span>
                    {log.testosterone && <span>Testosterone: {log.testosterone}</span>}
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Hormone Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🧬 Testosterone</h3>
              <p>Learn about testosterone's role in male health, normal ranges, and factors that affect levels</p>
            </div>
            <div className="resource-card">
              <h3>🦋 Thyroid Function</h3>
              <p>Understand how thyroid hormones affect metabolism, energy, and overall health</p>
            </div>
            <div className="resource-card">
              <h3>💪 Muscle & Strength</h3>
              <p>How hormones influence muscle mass, strength gains, and recovery from exercise</p>
            </div>
            <div className="resource-card">
              <h3>🧠 Mental Health</h3>
              <p>The connection between hormones and mood, concentration, and mental clarity</p>
            </div>
            <div className="resource-card">
              <h3>😴 Sleep & Hormones</h3>
              <p>How sleep quality affects hormone production and vice versa</p>
            </div>
            <div className="resource-card">
              <h3>🏥 When to Test</h3>
              <p>Understanding when to get hormone testing and what the results mean</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HormonalHealth;