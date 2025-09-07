import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './CycleTracking.css';

const CycleTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Cycle tracking form state
  const [cycleForm, setCycleForm] = useState({
    lastPeriod: '',
    cycleLength: 28,
    periodLength: 5,
    flowIntensity: 'medium',
    pain: 0,
    symptoms: [],
    bleedingPattern: 'normal',
    clots: 'none',
    notes: ''
  });

  // Cycle data and insights
  const [cycleData, setCycleData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [fertileWindow, setFertileWindow] = useState(null);

  // Available cycle symptoms for tracking
  const availableSymptoms = [
    'Cramping',
    'Bloating',
    'Breast tenderness',
    'Headaches',
    'Back pain',
    'Nausea',
    'Fatigue',
    'Mood swings',
    'Food cravings',
    'Acne',
    'Constipation',
    'Diarrhea',
    'Hot flashes',
    'Night sweats',
    'Insomnia'
  ];

  // Load existing cycle data
  useEffect(() => {
    const savedData = localStorage.getItem('afabCycleData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCycleData(parsed);
      
      // Calculate next period and fertile window from latest data
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        calculateCyclePredictions(latest);
      }
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setCycleForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const calculateCyclePredictions = (latestCycle) => {
    if (!latestCycle.lastPeriod) return;
    
    const lastPeriodDate = new Date(latestCycle.lastPeriod);
    const cycleLength = latestCycle.cycleLength || 28;
    const periodLength = latestCycle.periodLength || 5;
    
    // Calculate next period
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    setNextPeriod(nextPeriodDate);
    
    // Calculate fertile window (ovulation typically 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
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

  const handleCycleLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const cycleEntry = {
        ...cycleForm,
        timestamp: new Date().toISOString(),
        moduleType: 'cycle',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...cycleData, cycleEntry];
      setCycleData(updatedData);
      localStorage.setItem('afabCycleData', JSON.stringify(updatedData));
      
      // Calculate predictions
      calculateCyclePredictions(cycleEntry);
      
      // Generate AI insights
      const prompt = `As an expert in AFAB reproductive health, analyze this cycle data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Cycle Data: ${JSON.stringify(cycleEntry)}
Historical Data: ${JSON.stringify(cycleData.slice(-3))}

Please provide:
1. Cycle pattern analysis
2. Health recommendations
3. When to see a doctor
4. Lifestyle suggestions
5. Fertility insights if applicable

Be medical, accurate, and supportive.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form
      setCycleForm({
        lastPeriod: '',
        cycleLength: 28,
        periodLength: 5,
        flowIntensity: 'medium',
        pain: 0,
        symptoms: [],
        bleedingPattern: 'normal',
        clots: 'none',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging cycle data:', error);
      alert('Error logging cycle data. Please try again.');
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
    <div className="cycle-tracking-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🩸 Cycle Tracker</h1>
        <p>Track your menstrual cycle with medical-grade precision</p>
      </div>

      <div className="cycle-content">
        {/* Cycle Overview */}
        <div className="cycle-overview">
          <div className="overview-card">
            <h3>📅 Next Period</h3>
            <p className="date-display">
              {nextPeriod ? formatDate(nextPeriod) : 'Log your cycle to predict'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>👶 Fertile Window</h3>
            <p className="date-display">
              {fertileWindow ? 
                `${formatDate(fertileWindow.start)} - ${formatDate(fertileWindow.end)}` : 
                'Log your cycle to predict'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Cycle History</h3>
            <p className="count-display">{cycleData.length} cycles logged</p>
          </div>
        </div>

        {/* Cycle Logging Form */}
        <div className="cycle-form-section">
          <h2>Log Your Cycle Data</h2>
          <form onSubmit={handleCycleLog} className="cycle-form">
            <div className="form-row">
              <div className="form-group">
                <label>Last Period Date *</label>
                <input
                  type="date"
                  value={cycleForm.lastPeriod}
                  onChange={(e) => setCycleForm({...cycleForm, lastPeriod: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Cycle Length (days)</label>
                <select
                  value={cycleForm.cycleLength}
                  onChange={(e) => setCycleForm({...cycleForm, cycleLength: parseInt(e.target.value)})}
                >
                  {Array.from({length: 20}, (_, i) => i + 21).map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Period Length (days)</label>
                <select
                  value={cycleForm.periodLength}
                  onChange={(e) => setCycleForm({...cycleForm, periodLength: parseInt(e.target.value)})}
                >
                  {Array.from({length: 10}, (_, i) => i + 1).map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Flow Intensity</label>
                <select
                  value={cycleForm.flowIntensity}
                  onChange={(e) => setCycleForm({...cycleForm, flowIntensity: e.target.value})}
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                  <option value="very-heavy">Very Heavy</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pain Level: {cycleForm.pain}/10</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={cycleForm.pain}
                  onChange={(e) => setCycleForm({...cycleForm, pain: parseInt(e.target.value)})}
                  className="pain-slider"
                />
                <div className="pain-labels">
                  <span>No Pain</span>
                  <span>Severe Pain</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Bleeding Pattern</label>
                <select
                  value={cycleForm.bleedingPattern}
                  onChange={(e) => setCycleForm({...cycleForm, bleedingPattern: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="spotting">Spotting</option>
                  <option value="irregular">Irregular</option>
                  <option value="heavy">Heavy</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Clots</label>
                <select
                  value={cycleForm.clots}
                  onChange={(e) => setCycleForm({...cycleForm, clots: e.target.value})}
                >
                  <option value="none">None</option>
                  <option value="small">Small clots</option>
                  <option value="medium">Medium clots</option>
                  <option value="large">Large clots</option>
                  <option value="many">Many clots</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Cycle Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={cycleForm.symptoms.includes(symptom)}
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
                value={cycleForm.notes}
                onChange={(e) => setCycleForm({...cycleForm, notes: e.target.value})}
                placeholder="Any additional notes about your cycle, symptoms, or observations..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Cycle Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Health Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Cycle History */}
        {cycleData.length > 0 && (
          <div className="cycle-history">
            <h2>📈 Cycle History</h2>
            <div className="history-list">
              {cycleData.slice(-5).reverse().map((cycle, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(cycle.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Period: {cycle.lastPeriod}</span>
                    <span>Length: {cycle.cycleLength} days</span>
                    <span>Flow: {cycle.flowIntensity}</span>
                    <span>Pain: {cycle.pain}/10</span>
                    {cycle.symptoms && cycle.symptoms.length > 0 && (
                      <span>Symptoms: {cycle.symptoms.length}</span>
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

export default CycleTracking;
