import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './FertilityTracking.css';

const FertilityTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Fertility tracking form state
  const [fertilityForm, setFertilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bbt: '',
    cervicalMucus: 'none',
    ovulationTest: 'not-tested',
    cervicalPosition: 'low',
    cervicalTexture: 'firm',
    libido: 5,
    symptoms: [],
    notes: ''
  });

  // Fertility data and insights
  const [fertilityData, setFertilityData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ovulationPrediction, setOvulationPrediction] = useState(null);
  const [fertileWindow, setFertileWindow] = useState(null);

  // Available fertility symptoms for tracking
  const availableSymptoms = [
    'Breast tenderness',
    'Bloating',
    'Cramping',
    'Spotting',
    'Increased energy',
    'Mood swings',
    'Headaches',
    'Back pain',
    'Nausea',
    'Food cravings',
    'Increased libido',
    'Cervical changes',
    'Abdominal pain',
    'Vaginal discharge changes',
    'Basal body temperature rise'
  ];

  // Load existing fertility data
  useEffect(() => {
    const savedData = localStorage.getItem('afabFertilityData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFertilityData(parsed);
      
      // Calculate ovulation prediction from latest data
      if (parsed.length > 0) {
        calculateFertilityPredictions(parsed);
      }
    }
  }, []);

  const calculateFertilityPredictions = (data) => {
    // Get cycle data for prediction
    const cycleData = localStorage.getItem('afabCycleData');
    if (!cycleData) return;
    
    const cycles = JSON.parse(cycleData);
    if (cycles.length === 0) return;
    
    const latestCycle = cycles[cycles.length - 1];
    const lastPeriod = new Date(latestCycle.lastPeriod);
    const cycleLength = latestCycle.cycleLength || 28;
    
    // Calculate ovulation (typically 14 days before next period)
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    setOvulationPrediction(ovulationDate);
    
    // Calculate fertile window (5 days before ovulation + 1 day after)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    setFertileWindow({
      start: fertileStart,
      end: fertileEnd,
      ovulation: ovulationDate
    });
  };

  const handleSymptomToggle = (symptom) => {
    setFertilityForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleFertilityLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const fertilityEntry = {
        ...fertilityForm,
        timestamp: new Date().toISOString(),
        moduleType: 'fertility',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...fertilityData, fertilityEntry];
      setFertilityData(updatedData);
      localStorage.setItem('afabFertilityData', JSON.stringify(updatedData));
      
      // Generate AI insights
      const prompt = `As an expert in AFAB fertility and reproductive health, analyze this fertility data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Fertility Data: ${JSON.stringify(fertilityEntry)}
Historical Data: ${JSON.stringify(fertilityData.slice(-5))}

Please provide:
1. Fertility pattern analysis
2. Ovulation prediction accuracy
3. Optimal conception timing
4. Health recommendations for fertility
5. When to see a fertility specialist
6. Lifestyle suggestions for reproductive health

Be medical, accurate, and supportive. Include specific timing recommendations.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setFertilityForm({
        date: new Date().toISOString().split('T')[0],
        bbt: '',
        cervicalMucus: 'none',
        ovulationTest: 'not-tested',
        cervicalPosition: 'low',
        cervicalTexture: 'firm',
        libido: 5,
        symptoms: [],
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging fertility data:', error);
      alert('Error logging fertility data. Please try again.');
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

  const getCervicalMucusDescription = (type) => {
    const descriptions = {
      'none': 'No mucus present',
      'dry': 'Dry, no mucus',
      'sticky': 'Sticky, thick, white/yellow',
      'creamy': 'Creamy, lotion-like',
      'watery': 'Watery, clear',
      'egg-white': 'Clear, stretchy, like egg white'
    };
    return descriptions[type] || type;
  };

  const getCervicalPositionDescription = (position) => {
    const descriptions = {
      'low': 'Low, firm, closed',
      'medium': 'Medium height, slightly soft',
      'high': 'High, soft, open'
    };
    return descriptions[position] || position;
  };

  return (
    <div className="fertility-tracking-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>👶 Fertility Tracker</h1>
        <p>Track your fertility signs and optimize your conception journey</p>
      </div>

      <div className="fertility-content">
        {/* Fertility Overview */}
        <div className="fertility-overview">
          <div className="overview-card">
            <h3>🥚 Predicted Ovulation</h3>
            <p className="date-display">
              {ovulationPrediction ? formatDate(ovulationPrediction) : 'Log cycle data to predict'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>💕 Fertile Window</h3>
            <p className="date-display">
              {fertileWindow ? 
                `${formatDate(fertileWindow.start)} - ${formatDate(fertileWindow.end)}` : 
                'Log cycle data to predict'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Tracking History</h3>
            <p className="count-display">{fertilityData.length} entries logged</p>
          </div>
        </div>

        {/* Fertility Logging Form */}
        <div className="fertility-form-section">
          <h2>Log Your Fertility Data</h2>
          <form onSubmit={handleFertilityLog} className="fertility-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={fertilityForm.date}
                  onChange={(e) => setFertilityForm({...fertilityForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Basal Body Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fertilityForm.bbt}
                  onChange={(e) => setFertilityForm({...fertilityForm, bbt: e.target.value})}
                  placeholder="e.g., 98.6"
                />
                <small>Take temperature first thing in the morning</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cervical Mucus</label>
                <select
                  value={fertilityForm.cervicalMucus}
                  onChange={(e) => setFertilityForm({...fertilityForm, cervicalMucus: e.target.value})}
                >
                  <option value="none">None</option>
                  <option value="dry">Dry</option>
                  <option value="sticky">Sticky</option>
                  <option value="creamy">Creamy</option>
                  <option value="watery">Watery</option>
                  <option value="egg-white">Egg White</option>
                </select>
                <small>{getCervicalMucusDescription(fertilityForm.cervicalMucus)}</small>
              </div>
              
              <div className="form-group">
                <label>Cervical Position</label>
                <select
                  value={fertilityForm.cervicalPosition}
                  onChange={(e) => setFertilityForm({...fertilityForm, cervicalPosition: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <small>{getCervicalPositionDescription(fertilityForm.cervicalPosition)}</small>
              </div>
              
              <div className="form-group">
                <label>Cervical Texture</label>
                <select
                  value={fertilityForm.cervicalTexture}
                  onChange={(e) => setFertilityForm({...fertilityForm, cervicalTexture: e.target.value})}
                >
                  <option value="firm">Firm</option>
                  <option value="medium">Medium</option>
                  <option value="soft">Soft</option>
                </select>
                <small>Firm = not fertile, Soft = fertile</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ovulation Test Result</label>
                <select
                  value={fertilityForm.ovulationTest}
                  onChange={(e) => setFertilityForm({...fertilityForm, ovulationTest: e.target.value})}
                >
                  <option value="not-tested">Not Tested</option>
                  <option value="negative">Negative</option>
                  <option value="positive">Positive</option>
                  <option value="peak">Peak (LH Surge)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Libido Level: {fertilityForm.libido}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={fertilityForm.libido}
                  onChange={(e) => setFertilityForm({...fertilityForm, libido: parseInt(e.target.value)})}
                  className="libido-slider"
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>


            <div className="form-group">
              <label>Fertility Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={fertilityForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={fertilityForm.notes}
                onChange={(e) => setFertilityForm({...fertilityForm, notes: e.target.value})}
                placeholder="Any additional observations about your fertility signs, symptoms, or concerns..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Fertility Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Fertility Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Fertility History */}
        {fertilityData.length > 0 && (
          <div className="fertility-history">
            <h2>📈 Fertility History</h2>
            <div className="history-list">
              {fertilityData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    {entry.bbt && <span>BBT: {entry.bbt}°F</span>}
                    <span>Mucus: {entry.cervicalMucus}</span>
                    <span>Position: {entry.cervicalPosition}</span>
                    <span>Test: {entry.ovulationTest}</span>
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilityTracking;
