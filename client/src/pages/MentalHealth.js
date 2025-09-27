import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './MentalHealth.css';

const MentalHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Mental health tracking form state
  const [mentalHealthForm, setMentalHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 'neutral',
    anxiety: 5,
    depression: 5,
    stress: 5,
    sleep: 5,
    energy: 5,
    symptoms: [],
    triggers: [],
    copingStrategies: [],
    medications: [],
    therapy: false,
    notes: ''
  });

  // Mental health data and insights
  const [mentalHealthData, setMentalHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moodTrend, setMoodTrend] = useState(null);

  // AI-Powered Mental Health Intelligence (SAME STRUCTURE AS OTHER MODULES)
  const [insights, setInsights] = useState(null);
  const [mentalHealthPatterns, setMentalHealthPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Mental health symptoms
  const mentalHealthSymptoms = [
    'Sadness',
    'Anxiety',
    'Irritability',
    'Mood swings',
    'Fatigue',
    'Sleep problems',
    'Appetite changes',
    'Concentration difficulties',
    'Loss of interest',
    'Feelings of worthlessness',
    'Excessive worry',
    'Panic attacks',
    'Social withdrawal',
    'Restlessness',
    'Physical symptoms',
    'No symptoms'
  ];

  // Common triggers
  const commonTriggers = [
    'Work stress',
    'Relationship issues',
    'Financial concerns',
    'Health problems',
    'Family conflicts',
    'Social situations',
    'Hormonal changes',
    'Seasonal changes',
    'Lack of sleep',
    'Poor nutrition',
    'Substance use',
    'Traumatic events',
    'Life transitions',
    'Social media',
    'No specific triggers'
  ];

  // Coping strategies
  const copingStrategies = [
    'Deep breathing',
    'Meditation',
    'Exercise',
    'Journaling',
    'Talking to friends',
    'Professional therapy',
    'Music therapy',
    'Art therapy',
    'Nature walks',
    'Yoga',
    'Reading',
    'Hobbies',
    'Sleep hygiene',
    'Healthy eating',
    'Limiting social media',
    'Mindfulness',
    'Progressive muscle relaxation',
    'No coping strategies used'
  ];

  // Mental health medications
  const mentalHealthMedications = [
    'Antidepressants',
    'Anti-anxiety medications',
    'Mood stabilizers',
    'Sleep aids',
    'Herbal supplements',
    'Omega-3 supplements',
    'Vitamin D',
    'Magnesium',
    'Melatonin',
    'No medications'
  ];

  // Load existing mental health data
  useEffect(() => {
    const savedData = localStorage.getItem('afabMentalHealthData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setMentalHealthData(parsed);
      
      // Calculate mood trend
      if (parsed.length >= 3) {
        const recentMoods = parsed.slice(-7).map(entry => {
          const moodMap = { 'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1 };
          return moodMap[entry.mood] || 3;
        });
        const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
        setMoodTrend(avgMood > 3 ? 'improving' : avgMood < 3 ? 'declining' : 'stable');
      }
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setMentalHealthForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleTriggerToggle = (trigger) => {
    setMentalHealthForm(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const handleCopingToggle = (strategy) => {
    setMentalHealthForm(prev => ({
      ...prev,
      copingStrategies: prev.copingStrategies.includes(strategy)
        ? prev.copingStrategies.filter(c => c !== strategy)
        : [...prev.copingStrategies, strategy]
    }));
  };

  const handleMedicationToggle = (medication) => {
    setMentalHealthForm(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const handleMentalHealthLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const mentalHealthEntry = {
        ...mentalHealthForm,
        timestamp: new Date().toISOString(),
        moduleType: 'mental-health',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...mentalHealthData, mentalHealthEntry];
      setMentalHealthData(updatedData);
      localStorage.setItem('afabMentalHealthData', JSON.stringify(updatedData));
      
      // Update mood trend
      if (updatedData.length >= 3) {
        const recentMoods = updatedData.slice(-7).map(entry => {
          const moodMap = { 'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1 };
          return moodMap[entry.mood] || 3;
        });
        const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
        setMoodTrend(avgMood > 3 ? 'improving' : avgMood < 3 ? 'declining' : 'stable');
      }
      
      // Generate AI insights
      const prompt = `As an expert in mental health and wellness, analyze this mental health data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Mental Health Data: ${JSON.stringify(mentalHealthEntry)}
Mood Trend: ${moodTrend}
Historical Data: ${JSON.stringify(mentalHealthData.slice(-3))}

Please provide:
1. Mental health assessment and patterns
2. Coping strategy effectiveness
3. Trigger identification and management
4. When to seek professional help
5. Lifestyle modifications for mental wellness
6. Medication considerations (if applicable)

Be supportive, non-judgmental, and encouraging. Include specific guidance for mental health maintenance and crisis prevention.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setMentalHealthForm({
        date: new Date().toISOString().split('T')[0],
        mood: 'neutral',
        anxiety: 5,
        depression: 5,
        stress: 5,
        sleep: 5,
        energy: 5,
        symptoms: [],
        triggers: [],
        copingStrategies: [],
        medications: [],
        therapy: false,
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging mental health data:', error);
      alert('Error logging mental health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'very-happy': '😄',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😢',
      'very-sad': '😭'
    };
    return moodEmojis[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const moodColors = {
      'very-happy': '#4ecdc4',
      'happy': '#4ecdc4',
      'neutral': '#ff9f43',
      'sad': '#ff6b9d',
      'very-sad': '#ff6b9d'
    };
    return moodColors[mood] || '#ff9f43';
  };

  const getTrendColor = (trend) => {
    const trendColors = {
      'improving': '#4ecdc4',
      'stable': '#ff9f43',
      'declining': '#ff6b9d'
    };
    return trendColors[trend] || '#ff9f43';
  };

  return (
    <div className="mental-health-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🧠 Mental Health Tracker</h1>
        <p>Monitor your mental wellness, track mood patterns, and build resilience</p>
      </div>

      <div className="mental-health-content">
        {/* Mental Health Overview */}
        <div className="mental-health-overview">
          <div className="overview-card">
            <h3>📊 Mood Trend</h3>
            <p className="trend-display" style={{ color: getTrendColor(moodTrend) }}>
              {moodTrend ? moodTrend.charAt(0).toUpperCase() + moodTrend.slice(1) : 'Track mood'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📈 Tracking History</h3>
            <p className="count-display">{mentalHealthData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>💪 Wellness</h3>
            <p className="status-display">You're doing great</p>
          </div>
        </div>

        {/* Mental Health Logging Form */}
        <div className="mental-health-form-section">
          <h2>Log Your Mental Health Data</h2>
          <form onSubmit={handleMentalHealthLog} className="mental-health-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={mentalHealthForm.date}
                  onChange={(e) => setMentalHealthForm({...mentalHealthForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Overall Mood</label>
                <div className="mood-options">
                  {[
                    { value: 'very-happy', emoji: '😄', label: 'Very Happy' },
                    { value: 'happy', emoji: '😊', label: 'Happy' },
                    { value: 'neutral', emoji: '😐', label: 'Neutral' },
                    { value: 'sad', emoji: '😢', label: 'Sad' },
                    { value: 'very-sad', emoji: '😭', label: 'Very Sad' }
                  ].map(mood => (
                    <label key={mood.value} className="mood-option">
                      <input
                        type="radio"
                        name="mood"
                        value={mood.value}
                        checked={mentalHealthForm.mood === mood.value}
                        onChange={(e) => setMentalHealthForm({...mentalHealthForm, mood: e.target.value})}
                      />
                      <span className="mood-emoji">{mood.emoji}</span>
                      <span className="mood-label">{mood.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Anxiety Level: {mentalHealthForm.anxiety}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalHealthForm.anxiety}
                  onChange={(e) => setMentalHealthForm({...mentalHealthForm, anxiety: parseInt(e.target.value)})}
                  className="anxiety-slider"
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Depression Level: {mentalHealthForm.depression}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalHealthForm.depression}
                  onChange={(e) => setMentalHealthForm({...mentalHealthForm, depression: parseInt(e.target.value)})}
                  className="depression-slider"
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stress Level: {mentalHealthForm.stress}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalHealthForm.stress}
                  onChange={(e) => setMentalHealthForm({...mentalHealthForm, stress: parseInt(e.target.value)})}
                  className="stress-slider"
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Sleep Quality: {mentalHealthForm.sleep}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalHealthForm.sleep}
                  onChange={(e) => setMentalHealthForm({...mentalHealthForm, sleep: parseInt(e.target.value)})}
                  className="sleep-slider"
                />
                <div className="slider-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Energy Level: {mentalHealthForm.energy}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={mentalHealthForm.energy}
                onChange={(e) => setMentalHealthForm({...mentalHealthForm, energy: parseInt(e.target.value)})}
                className="energy-slider"
              />
              <div className="slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="form-group">
              <label>Mental Health Symptoms</label>
              <div className="symptoms-grid">
                {mentalHealthSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={mentalHealthForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Triggers</label>
              <div className="triggers-grid">
                {commonTriggers.map(trigger => (
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
              <label>Coping Strategies Used</label>
              <div className="coping-grid">
                {copingStrategies.map(strategy => (
                  <label key={strategy} className="coping-option">
                    <input
                      type="checkbox"
                      checked={mentalHealthForm.copingStrategies.includes(strategy)}
                      onChange={() => handleCopingToggle(strategy)}
                    />
                    <span className="coping-label">{strategy}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Medications & Supplements</label>
              <div className="medications-grid">
                {mentalHealthMedications.map(medication => (
                  <label key={medication} className="medication-option">
                    <input
                      type="checkbox"
                      checked={mentalHealthForm.medications.includes(medication)}
                      onChange={() => handleMedicationToggle(medication)}
                    />
                    <span className="medication-label">{medication}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Therapy Session</label>
              <div className="checkbox-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={mentalHealthForm.therapy}
                    onChange={(e) => setMentalHealthForm({...mentalHealthForm, therapy: e.target.checked})}
                  />
                  <span>Attended therapy session today</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={mentalHealthForm.notes}
                onChange={(e) => setMentalHealthForm({...mentalHealthForm, notes: e.target.value})}
                placeholder="Any additional notes about your mental health, thoughts, feelings, or experiences today..."
                rows="4"
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
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Mental Health Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Mental Health History */}
        {mentalHealthData.length > 0 && (
          <div className="mental-health-history">
            <h2>📈 Mental Health History</h2>
            <div className="history-list">
              {mentalHealthData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span style={{ color: getMoodColor(entry.mood) }}>
                      {getMoodEmoji(entry.mood)} {entry.mood}
                    </span>
                    <span>Anxiety: {entry.anxiety}/10</span>
                    <span>Depression: {entry.depression}/10</span>
                    <span>Stress: {entry.stress}/10</span>
                    <span>Sleep: {entry.sleep}/10</span>
                    <span>Energy: {entry.energy}/10</span>
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                    {entry.therapy && <span>Therapy: ✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mental Health Resources */}
        <div className="mental-health-resources">
          <h2>📚 Mental Health Resources</h2>
          <div className="resources-content">
            <div className="resource-card">
              <h3>🆘 Crisis Support</h3>
              <ul>
                <li>National Suicide Prevention Lifeline: 988</li>
                <li>Crisis Text Line: Text HOME to 741741</li>
                <li>Emergency: 911</li>
                <li>Local crisis center: Check your area</li>
              </ul>
            </div>
            
            <div className="resource-card">
              <h3>💡 Self-Care Tips</h3>
              <ul>
                <li>Maintain a regular sleep schedule</li>
                <li>Practice daily mindfulness or meditation</li>
                <li>Stay connected with supportive people</li>
                <li>Engage in regular physical activity</li>
                <li>Limit alcohol and substance use</li>
              </ul>
            </div>
            
            <div className="resource-card">
              <h3>🏥 When to Seek Help</h3>
              <ul>
                <li>Persistent feelings of sadness or hopelessness</li>
                <li>Thoughts of self-harm or suicide</li>
                <li>Severe anxiety or panic attacks</li>
                <li>Substance abuse or addiction</li>
                <li>Significant changes in sleep or appetite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
