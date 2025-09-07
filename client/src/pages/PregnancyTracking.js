import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './PregnancyTracking.css';

const PregnancyTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Pregnancy tracking form state
  const [pregnancyForm, setPregnancyForm] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    trimester: 1,
    weight: '',
    bloodPressure: '',
    fetalHeartbeat: '',
    symptoms: [],
    medications: [],
    appointments: [],
    notes: ''
  });

  // Pregnancy data and insights
  const [pregnancyData, setPregnancyData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pregnancyProgress, setPregnancyProgress] = useState(null);

  // Available pregnancy symptoms for tracking
  const availableSymptoms = [
    'Nausea',
    'Vomiting',
    'Fatigue',
    'Breast tenderness',
    'Frequent urination',
    'Food aversions',
    'Food cravings',
    'Mood swings',
    'Constipation',
    'Heartburn',
    'Back pain',
    'Round ligament pain',
    'Swelling',
    'Headaches',
    'Dizziness',
    'Shortness of breath',
    'Braxton Hicks contractions',
    'Vaginal discharge',
    'Bleeding',
    'No symptoms'
  ];

  // Available pregnancy medications
  const availableMedications = [
    'Prenatal vitamins',
    'Folic acid',
    'Iron supplements',
    'Calcium supplements',
    'Vitamin D',
    'DHA/Omega-3',
    'Anti-nausea medication',
    'Antacids',
    'Pain relief (acetaminophen)',
    'Prescription medications',
    'Herbal supplements',
    'Other'
  ];

  // Load existing pregnancy data
  useEffect(() => {
    const savedData = localStorage.getItem('afabPregnancyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setPregnancyData(parsed);
      
      // Calculate pregnancy progress
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        if (latest.dueDate) {
          calculatePregnancyProgress(latest.dueDate);
        }
      }
    }
  }, []);

  const calculatePregnancyProgress = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const startDate = new Date(due);
    startDate.setDate(startDate.getDate() - 280); // 40 weeks = 280 days
    
    const daysPregnant = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const trimester = weeksPregnant < 13 ? 1 : weeksPregnant < 27 ? 2 : 3;
    
    setPregnancyProgress({
      weeksPregnant,
      daysPregnant,
      trimester,
      daysRemaining: Math.floor((due - today) / (1000 * 60 * 60 * 24))
    });
  };

  const handleSymptomToggle = (symptom) => {
    setPregnancyForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleMedicationToggle = (medication) => {
    setPregnancyForm(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const handlePregnancyLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const pregnancyEntry = {
        ...pregnancyForm,
        timestamp: new Date().toISOString(),
        moduleType: 'pregnancy',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...pregnancyData, pregnancyEntry];
      setPregnancyData(updatedData);
      localStorage.setItem('afabPregnancyData', JSON.stringify(updatedData));
      
      // Calculate pregnancy progress
      if (pregnancyEntry.dueDate) {
        calculatePregnancyProgress(pregnancyEntry.dueDate);
      }
      
      // Generate AI insights
      const prompt = `As an expert in prenatal care and pregnancy health, analyze this pregnancy data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Pregnancy Data: ${JSON.stringify(pregnancyEntry)}
Pregnancy Progress: ${JSON.stringify(pregnancyProgress)}
Historical Data: ${JSON.stringify(pregnancyData.slice(-3))}

Please provide:
1. Trimester-specific health recommendations
2. Symptom management strategies
3. Medication safety assessment
4. When to contact healthcare provider
5. Prenatal care milestones
6. Lifestyle recommendations for pregnancy

Be medical, accurate, and supportive. Include specific trimester guidance and safety considerations.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setPregnancyForm({
        date: new Date().toISOString().split('T')[0],
        dueDate: pregnancyForm.dueDate, // Keep due date
        trimester: pregnancyForm.trimester, // Keep trimester
        weight: '',
        bloodPressure: '',
        fetalHeartbeat: '',
        symptoms: [],
        medications: [],
        appointments: [],
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging pregnancy data:', error);
      alert('Error logging pregnancy data. Please try again.');
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

  const getTrimesterInfo = (trimester) => {
    const info = {
      1: { weeks: '1-12', description: 'First Trimester - Early Development' },
      2: { weeks: '13-26', description: 'Second Trimester - Growth Phase' },
      3: { weeks: '27-40', description: 'Third Trimester - Final Preparation' }
    };
    return info[trimester] || { weeks: 'Unknown', description: 'Unknown Trimester' };
  };

  return (
    <div className="pregnancy-tracking-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🤰 Pregnancy Tracker</h1>
        <p>Track your pregnancy journey and prenatal care</p>
      </div>

      <div className="pregnancy-content">
        {/* Pregnancy Overview */}
        <div className="pregnancy-overview">
          <div className="overview-card">
            <h3>📅 Due Date</h3>
            <p className="date-display">
              {pregnancyForm.dueDate ? formatDate(new Date(pregnancyForm.dueDate)) : 'Set your due date'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Pregnancy Progress</h3>
            <p className="progress-display">
              {pregnancyProgress ? 
                `${pregnancyProgress.weeksPregnant} weeks, ${pregnancyProgress.daysPregnant % 7} days` : 
                'Calculate progress'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Trimester</h3>
            <p className="trimester-display">
              {pregnancyProgress ? 
                `Trimester ${pregnancyProgress.trimester}` : 
                'Set trimester'
              }
            </p>
          </div>
        </div>

        {/* Pregnancy Logging Form */}
        <div className="pregnancy-form-section">
          <h2>Log Your Pregnancy Data</h2>
          <form onSubmit={handlePregnancyLog} className="pregnancy-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={pregnancyForm.date}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={pregnancyForm.dueDate}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, dueDate: e.target.value})}
                />
                <small>Your estimated due date</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Trimester</label>
                <select
                  value={pregnancyForm.trimester}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, trimester: parseInt(e.target.value)})}
                >
                  <option value={1}>First Trimester (1-12 weeks)</option>
                  <option value={2}>Second Trimester (13-26 weeks)</option>
                  <option value={3}>Third Trimester (27-40 weeks)</option>
                </select>
                <small>{getTrimesterInfo(pregnancyForm.trimester).description}</small>
              </div>
              
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pregnancyForm.weight}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, weight: e.target.value})}
                  placeholder="e.g., 150.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Pressure</label>
                <input
                  type="text"
                  value={pregnancyForm.bloodPressure}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, bloodPressure: e.target.value})}
                  placeholder="e.g., 120/80"
                />
                <small>Systolic/Diastolic</small>
              </div>
              
              <div className="form-group">
                <label>Fetal Heartbeat (BPM)</label>
                <input
                  type="number"
                  value={pregnancyForm.fetalHeartbeat}
                  onChange={(e) => setPregnancyForm({...pregnancyForm, fetalHeartbeat: e.target.value})}
                  placeholder="e.g., 140"
                />
                <small>Beats per minute</small>
              </div>
            </div>

            <div className="form-group">
              <label>Pregnancy Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={pregnancyForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Medications & Supplements</label>
              <div className="medications-grid">
                {availableMedications.map(medication => (
                  <label key={medication} className="medication-option">
                    <input
                      type="checkbox"
                      checked={pregnancyForm.medications.includes(medication)}
                      onChange={() => handleMedicationToggle(medication)}
                    />
                    <span className="medication-label">{medication}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Upcoming Appointments</label>
              <textarea
                value={pregnancyForm.appointments}
                onChange={(e) => setPregnancyForm({...pregnancyForm, appointments: e.target.value})}
                placeholder="List any upcoming prenatal appointments, tests, or screenings..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={pregnancyForm.notes}
                onChange={(e) => setPregnancyForm({...pregnancyForm, notes: e.target.value})}
                placeholder="Any additional notes about your pregnancy, concerns, or questions for your healthcare provider..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Pregnancy Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Pregnancy Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Pregnancy History */}
        {pregnancyData.length > 0 && (
          <div className="pregnancy-history">
            <h2>📈 Pregnancy History</h2>
            <div className="history-list">
              {pregnancyData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Trimester: {entry.trimester}</span>
                    {entry.weight && <span>Weight: {entry.weight} lbs</span>}
                    {entry.bloodPressure && <span>BP: {entry.bloodPressure}</span>}
                    {entry.fetalHeartbeat && <span>FHR: {entry.fetalHeartbeat} BPM</span>}
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trimester Information */}
        <div className="trimester-info">
          <h2>📚 Trimester Information</h2>
          <div className="trimester-cards">
            {[1, 2, 3].map(trimester => (
              <div key={trimester} className={`trimester-card ${pregnancyForm.trimester === trimester ? 'active' : ''}`}>
                <h3>Trimester {trimester}</h3>
                <p className="trimester-weeks">{getTrimesterInfo(trimester).weeks} weeks</p>
                <p className="trimester-description">{getTrimesterInfo(trimester).description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PregnancyTracking;
