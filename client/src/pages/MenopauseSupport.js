import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './MenopauseSupport.css';

const MenopauseSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());
  
  // Menopause tracking form state
  const [menopauseForm, setMenopauseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lastPeriod: '',
    menopauseStage: 'pre-menopause',
    symptoms: [],
    severity: 'mild',
    treatments: [],
    mood: 'neutral',
    sleep: 5,
    energy: 5,
    notes: ''
  });

  // Menopause data and insights
  const [menopauseData, setMenopauseData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menopauseStage, setMenopauseStage] = useState('pre-menopause');

  // Available menopause symptoms for tracking
  const availableSymptoms = [
    'Hot flashes',
    'Night sweats',
    'Irregular periods',
    'Mood swings',
    'Sleep disturbances',
    'Vaginal dryness',
    'Decreased libido',
    'Weight gain',
    'Memory problems',
    'Anxiety',
    'Depression',
    'Irritability',
    'Fatigue',
    'Headaches',
    'Joint pain',
    'Hair thinning',
    'Dry skin',
    'Breast tenderness',
    'Bloating',
    'No symptoms'
  ];

  // Available treatments and interventions
  const availableTreatments = [
    'Hormone replacement therapy (HRT)',
    'Low-dose birth control',
    'Antidepressants',
    'Gabapentin',
    'Clonidine',
    'Vaginal estrogen',
    'Lubricants',
    'Regular exercise',
    'Healthy diet',
    'Stress management',
    'Sleep hygiene',
    'Acupuncture',
    'Herbal supplements',
    'Black cohosh',
    'Soy products',
    'Yoga/Meditation',
    'Cognitive behavioral therapy',
    'No treatment'
  ];

  // Load existing menopause data
  useEffect(() => {
    const savedData = localStorage.getItem('afabMenopauseData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setMenopauseData(parsed);
      
      // Determine current menopause stage
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        setMenopauseStage(latest.menopauseStage);
      }
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setMenopauseForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleTreatmentToggle = (treatment) => {
    setMenopauseForm(prev => ({
      ...prev,
      treatments: prev.treatments.includes(treatment)
        ? prev.treatments.filter(t => t !== treatment)
        : [...prev.treatments, treatment]
    }));
  };

  const handleMenopauseLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const menopauseEntry = {
        ...menopauseForm,
        timestamp: new Date().toISOString(),
        moduleType: 'menopause',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...menopauseData, menopauseEntry];
      setMenopauseData(updatedData);
      localStorage.setItem('afabMenopauseData', JSON.stringify(updatedData));
      
      // Update menopause stage
      setMenopauseStage(menopauseEntry.menopauseStage);
      
      // Generate AI insights
      const prompt = `As an expert in menopause and women's health, analyze this menopause data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Menopause Data: ${JSON.stringify(menopauseEntry)}
Menopause Stage: ${menopauseStage}
Historical Data: ${JSON.stringify(menopauseData.slice(-3))}

Please provide:
1. Menopause stage assessment and progression
2. Symptom management strategies
3. Treatment recommendations
4. When to see a healthcare provider
5. Lifestyle modifications for menopause
6. Long-term health considerations

Be medical, accurate, and supportive. Include specific guidance for the current menopause stage and symptom severity.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setMenopauseForm({
        date: new Date().toISOString().split('T')[0],
        lastPeriod: '',
        menopauseStage: menopauseForm.menopauseStage, // Keep stage
        symptoms: [],
        severity: 'mild',
        treatments: [],
        mood: 'neutral',
        sleep: 5,
        energy: 5,
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging menopause data:', error);
      alert('Error logging menopause data. Please try again.');
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

  const getMenopauseStageInfo = (stage) => {
    const info = {
      'pre-menopause': { 
        description: 'Pre-Menopause - Regular cycles', 
        color: '#4ecdc4',
        details: 'Regular menstrual cycles, typically ages 20-40'
      },
      'perimenopause': { 
        description: 'Perimenopause - Transition phase', 
        color: '#ff6b9d',
        details: 'Irregular cycles, symptoms begin, typically ages 40-50'
      },
      'menopause': { 
        description: 'Menopause - No periods for 12 months', 
        color: '#ff9f43',
        details: 'No menstrual periods for 12 consecutive months'
      },
      'post-menopause': { 
        description: 'Post-Menopause - After menopause', 
        color: '#a55eea',
        details: 'Life after menopause, focus on long-term health'
      }
    };
    return info[stage] || { description: 'Unknown', color: '#666', details: 'Unknown stage' };
  };

  return (
    <div className="menopause-support-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🍂 Menopause Support</h1>
        <p>Manage perimenopause and menopause symptoms with expert guidance</p>
      </div>

      <div className="menopause-content">
        {/* Menopause Overview */}
        <div className="menopause-overview">
          <div className="overview-card">
            <h3>📊 Current Stage</h3>
            <p className="stage-display" style={{ color: getMenopauseStageInfo(menopauseStage).color }}>
              {getMenopauseStageInfo(menopauseStage).description}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📈 Tracking History</h3>
            <p className="count-display">{menopauseData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>💪 Support</h3>
            <p className="status-display">You're not alone</p>
          </div>
        </div>

        {/* Menopause Logging Form */}
        <div className="menopause-form-section">
          <h2>Log Your Menopause Data</h2>
          <form onSubmit={handleMenopauseLog} className="menopause-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={menopauseForm.date}
                  onChange={(e) => setMenopauseForm({...menopauseForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Period Date</label>
                <input
                  type="date"
                  value={menopauseForm.lastPeriod}
                  onChange={(e) => setMenopauseForm({...menopauseForm, lastPeriod: e.target.value})}
                />
                <small>When was your last menstrual period?</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Menopause Stage</label>
                <select
                  value={menopauseForm.menopauseStage}
                  onChange={(e) => setMenopauseForm({...menopauseForm, menopauseStage: e.target.value})}
                >
                  <option value="pre-menopause">Pre-Menopause (Regular cycles)</option>
                  <option value="perimenopause">Perimenopause (Irregular cycles)</option>
                  <option value="menopause">Menopause (No periods 12+ months)</option>
                  <option value="post-menopause">Post-Menopause (After menopause)</option>
                </select>
                <small>{getMenopauseStageInfo(menopauseForm.menopauseStage).details}</small>
              </div>
              
              <div className="form-group">
                <label>Symptom Severity</label>
                <select
                  value={menopauseForm.severity}
                  onChange={(e) => setMenopauseForm({...menopauseForm, severity: e.target.value})}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="none">No symptoms</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sleep Quality: {menopauseForm.sleep}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={menopauseForm.sleep}
                  onChange={(e) => setMenopauseForm({...menopauseForm, sleep: parseInt(e.target.value)})}
                  className="sleep-slider"
                />
                <div className="slider-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Energy Level: {menopauseForm.energy}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={menopauseForm.energy}
                  onChange={(e) => setMenopauseForm({...menopauseForm, energy: parseInt(e.target.value)})}
                  className="energy-slider"
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Menopause Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={menopauseForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Treatments & Interventions</label>
              <div className="treatments-grid">
                {availableTreatments.map(treatment => (
                  <label key={treatment} className="treatment-option">
                    <input
                      type="checkbox"
                      checked={menopauseForm.treatments.includes(treatment)}
                      onChange={() => handleTreatmentToggle(treatment)}
                    />
                    <span className="treatment-label">{treatment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Mood</label>
              <div className="mood-options">
                {[
                  { value: 'happy', emoji: '😊', label: 'Happy' },
                  { value: 'neutral', emoji: '😐', label: 'Neutral' },
                  { value: 'sad', emoji: '😢', label: 'Sad' },
                  { value: 'anxious', emoji: '😰', label: 'Anxious' },
                  { value: 'irritable', emoji: '😤', label: 'Irritable' },
                  { value: 'frustrated', emoji: '😠', label: 'Frustrated' }
                ].map(mood => (
                  <label key={mood.value} className="mood-option">
                    <input
                      type="radio"
                      name="mood"
                      value={mood.value}
                      checked={menopauseForm.mood === mood.value}
                      onChange={(e) => setMenopauseForm({...menopauseForm, mood: e.target.value})}
                    />
                    <span className="mood-emoji">{mood.emoji}</span>
                    <span className="mood-label">{mood.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={menopauseForm.notes}
                onChange={(e) => setMenopauseForm({...menopauseForm, notes: e.target.value})}
                placeholder="Any additional notes about your menopause experience, concerns, or questions for your healthcare provider..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Menopause Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Menopause Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Menopause History */}
        {menopauseData.length > 0 && (
          <div className="menopause-history">
            <h2>📈 Menopause History</h2>
            <div className="history-list">
              {menopauseData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Stage: {entry.menopauseStage}</span>
                    <span>Severity: {entry.severity}</span>
                    <span>Sleep: {entry.sleep}/10</span>
                    <span>Energy: {entry.energy}/10</span>
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menopause Stage Information */}
        <div className="menopause-stages">
          <h2>📚 Menopause Stages Guide</h2>
          <div className="stages-grid">
            {['pre-menopause', 'perimenopause', 'menopause', 'post-menopause'].map(stage => (
              <div key={stage} className={`stage-card ${menopauseStage === stage ? 'active' : ''}`}>
                <h3 style={{ color: getMenopauseStageInfo(stage).color }}>
                  {getMenopauseStageInfo(stage).description}
                </h3>
                <p className="stage-details">{getMenopauseStageInfo(stage).details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenopauseSupport;
