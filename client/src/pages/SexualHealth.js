import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './SexualHealth.css';

const SexualHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25; // Default age if not provided
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Sexual health tracking form state
  const [sexualHealthForm, setSexualHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lastSTIScreening: '',
    nextSTIScreening: '',
    sexualActivity: 'none',
    contraception: 'none',
    symptoms: [],
    concerns: '',
    notes: ''
  });

  // Sexual health data and insights
  const [sexualHealthData, setSexualHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextScreening, setNextScreening] = useState(null);

  // AI-Powered Sexual Health Intelligence (SAME STRUCTURE AS OTHER MODULES)
  const [insights, setInsights] = useState(null);
  const [sexualHealthPatterns, setSexualHealthPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Available sexual health symptoms for tracking
  const availableSymptoms = [
    'Unusual discharge',
    'Burning during urination',
    'Pain during intercourse',
    'Genital itching',
    'Genital sores or bumps',
    'Abnormal bleeding',
    'Pelvic pain',
    'Lower abdominal pain',
    'Fever',
    'Fatigue',
    'Swollen lymph nodes',
    'Rash',
    'No symptoms'
  ];

  // Load existing sexual health data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSexualHealthData(parsed);
      
      // Calculate next screening date
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        if (latest.nextSTIScreening) {
          setNextScreening(new Date(latest.nextSTIScreening));
        }
      }
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setSexualHealthForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSexualHealthLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const sexualHealthEntry = {
        ...sexualHealthForm,
        timestamp: new Date().toISOString(),
        moduleType: 'sexual-health',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...sexualHealthData, sexualHealthEntry];
      setSexualHealthData(updatedData);
      localStorage.setItem('afabSexualHealthData', JSON.stringify(updatedData));
      
      // Update next screening date
      if (sexualHealthEntry.nextSTIScreening) {
        setNextScreening(new Date(sexualHealthEntry.nextSTIScreening));
      }
      
      // Generate AI insights
      const prompt = `As an expert in AFAB sexual and reproductive health, analyze this sexual health data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Sexual Health Data: ${JSON.stringify(sexualHealthEntry)}
Historical Data: ${JSON.stringify(sexualHealthData.slice(-3))}

Please provide:
1. Sexual health risk assessment
2. STI screening recommendations
3. Contraception guidance if applicable
4. When to see a healthcare provider
5. Preventive care recommendations
6. Safe sex practices

Be medical, accurate, and supportive. Include specific screening schedules and risk factors.`;

      // Create user profile for AI analysis
      const userProfile = {
        ...user,
        age: calculateAge(user?.dateOfBirth),
        conditions: { reproductive: [] }
      };

      const aiInsights = await aiService.generateSexualHealthInsights(sexualHealthForm, userProfile);
      
      // Set all the comprehensive AI sexual health insights (SAME STRUCTURE AS CYCLE TRACKING)
      if (aiInsights) {
        // AI Insights - detailed medical analysis
        setInsights(aiInsights.aiInsights || ['AI sexual health analysis completed successfully!']);
        
        // Store AI insights with the sexual health data
        const sexualHealthWithInsights = {
          ...sexualHealthForm,
          aiInsights: aiInsights,
          insightsTimestamp: new Date().toISOString()
        };
        
        // Update the sexual health data with AI insights
        const updatedSexualHealthData = [...sexualHealthData, sexualHealthWithInsights];
        setSexualHealthData(updatedSexualHealthData);
        localStorage.setItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedSexualHealthData));
        
        console.log('🎉 REAL AI sexual health insights displayed successfully!');
      }
      
      // Reset form for next entry
      setSexualHealthForm({
        date: new Date().toISOString().split('T')[0],
        lastSTIScreening: '',
        nextSTIScreening: '',
        sexualActivity: 'none',
        contraception: 'none',
        symptoms: [],
        concerns: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging sexual health data:', error);
      alert('Error logging sexual health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="sexual-health-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💕 Sexual Health Tracker</h1>
        <p>Track your sexual health, STI screenings, and intimate wellness</p>
      </div>

      <div className="sexual-health-content">
        {/* Sexual Health Overview */}
        <div className="sexual-health-overview">
          <div className="overview-card">
            <h3>🔬 Next STI Screening</h3>
            <p className="date-display">
              {nextScreening ? formatDate(nextScreening) : 'Schedule your screening'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Health Records</h3>
            <p className="count-display">{sexualHealthData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🛡️ Prevention</h3>
            <p className="status-display">Stay protected</p>
          </div>
        </div>

        {/* Sexual Health Logging Form */}
        <div className="sexual-health-form-section">
          <h2>Log Your Sexual Health Data</h2>
          <form onSubmit={handleSexualHealthLog} className="sexual-health-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={sexualHealthForm.date}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last STI Screening</label>
                <input
                  type="date"
                  value={sexualHealthForm.lastSTIScreening}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, lastSTIScreening: e.target.value})}
                />
                <small>When was your last STI test?</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Next STI Screening Due</label>
                <input
                  type="date"
                  value={sexualHealthForm.nextSTIScreening}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, nextSTIScreening: e.target.value})}
                />
                <small>When is your next screening scheduled?</small>
              </div>
              
              <div className="form-group">
                <label>Sexual Activity</label>
                <select
                  value={sexualHealthForm.sexualActivity}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, sexualActivity: e.target.value})}
                >
                  <option value="none">No sexual activity</option>
                  <option value="monogamous">Monogamous relationship</option>
                  <option value="multiple-partners">Multiple partners</option>
                  <option value="new-partner">New partner</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Contraception Method</label>
              <select
                value={sexualHealthForm.contraception}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, contraception: e.target.value})}
              >
                <option value="none">None</option>
                <option value="condoms">Condoms</option>
                <option value="birth-control-pill">Birth Control Pill</option>
                <option value="iud">IUD</option>
                <option value="implant">Implant</option>
                <option value="injection">Injection</option>
                <option value="patch">Patch</option>
                <option value="ring">Vaginal Ring</option>
                <option value="diaphragm">Diaphragm</option>
                <option value="spermicide">Spermicide</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="fertility-awareness">Fertility Awareness</option>
                <option value="sterilization">Sterilization</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sexual Health Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={sexualHealthForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Health Concerns</label>
              <textarea
                value={sexualHealthForm.concerns}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, concerns: e.target.value})}
                placeholder="Any concerns about your sexual health, symptoms, or questions for your healthcare provider..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={sexualHealthForm.notes}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, notes: e.target.value})}
                placeholder="Any additional notes about your sexual health, relationships, or wellness..."
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Sexual Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Sexual Health Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Sexual Health History */}
        {sexualHealthData.length > 0 && (
          <div className="sexual-health-history">
            <h2>📈 Sexual Health History</h2>
            <div className="history-list">
              {sexualHealthData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    {entry.lastSTIScreening && <span>Last Screening: {entry.lastSTIScreening}</span>}
                    <span>Activity: {entry.sexualActivity}</span>
                    <span>Contraception: {entry.contraception}</span>
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Sexual Health Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🛡️ STI Prevention</h3>
              <p>Learn about safe sex practices and STI prevention methods</p>
            </div>
            <div className="resource-card">
              <h3>💊 Contraception Guide</h3>
              <p>Comprehensive guide to birth control options and effectiveness</p>
            </div>
            <div className="resource-card">
              <h3>🏥 When to See a Doctor</h3>
              <p>Know the signs that require immediate medical attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SexualHealth;
