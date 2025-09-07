import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './ConditionSpecific.css';

const ConditionSpecific = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Condition tracking form state
  const [conditionForm, setConditionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    condition: 'PCOS',
    symptoms: [],
    severity: 'mild',
    medications: [],
    lifestyle: [],
    weight: '',
    bloodPressure: '',
    bloodSugar: '',
    notes: ''
  });

  // Condition data and insights
  const [conditionData, setConditionData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('PCOS');

  // PCOS-specific symptoms
  const pcosSymptoms = [
    'Irregular periods',
    'Heavy bleeding',
    'No periods',
    'Excess hair growth (hirsutism)',
    'Acne',
    'Weight gain',
    'Difficulty losing weight',
    'Dark skin patches',
    'Hair thinning',
    'Mood swings',
    'Anxiety',
    'Depression',
    'Sleep problems',
    'Fatigue',
    'Pelvic pain',
    'No symptoms'
  ];

  // Endometriosis-specific symptoms
  const endometriosisSymptoms = [
    'Severe menstrual cramps',
    'Chronic pelvic pain',
    'Pain during intercourse',
    'Painful bowel movements',
    'Painful urination',
    'Heavy menstrual bleeding',
    'Irregular periods',
    'Fatigue',
    'Nausea',
    'Bloating',
    'Constipation',
    'Diarrhea',
    'Lower back pain',
    'Infertility',
    'No symptoms'
  ];

  // Available treatments for both conditions
  const availableTreatments = [
    'Birth control pills',
    'Progestin therapy',
    'Metformin',
    'Spironolactone',
    'Pain medication',
    'Hormone therapy',
    'Laparoscopic surgery',
    'Hysterectomy',
    'Regular exercise',
    'Healthy diet',
    'Weight management',
    'Stress management',
    'Physical therapy',
    'Acupuncture',
    'Supplements',
    'No treatment'
  ];

  // Lifestyle modifications
  const lifestyleOptions = [
    'Regular exercise',
    'Balanced diet',
    'Weight management',
    'Stress reduction',
    'Adequate sleep',
    'Limit processed foods',
    'Increase fiber intake',
    'Reduce sugar intake',
    'Stay hydrated',
    'Mindfulness/Meditation',
    'Support groups',
    'Regular check-ups'
  ];

  // Load existing condition data
  useEffect(() => {
    const savedData = localStorage.getItem('afabConditionData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setConditionData(parsed);
      
      // Determine most recent condition
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        setSelectedCondition(latest.condition);
      }
    }
  }, []);

  const getCurrentSymptoms = () => {
    return selectedCondition === 'PCOS' ? pcosSymptoms : endometriosisSymptoms;
  };

  const handleSymptomToggle = (symptom) => {
    setConditionForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleTreatmentToggle = (treatment) => {
    setConditionForm(prev => ({
      ...prev,
      medications: prev.medications.includes(treatment)
        ? prev.medications.filter(m => m !== treatment)
        : [...prev.medications, treatment]
    }));
  };

  const handleLifestyleToggle = (lifestyle) => {
    setConditionForm(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleConditionLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const conditionEntry = {
        ...conditionForm,
        timestamp: new Date().toISOString(),
        moduleType: 'condition-specific',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...conditionData, conditionEntry];
      setConditionData(updatedData);
      localStorage.setItem('afabConditionData', JSON.stringify(updatedData));
      
      // Update selected condition
      setSelectedCondition(conditionEntry.condition);
      
      // Generate AI insights
      const prompt = `As an expert in women's health and reproductive conditions, analyze this ${conditionEntry.condition} data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Condition Data: ${JSON.stringify(conditionEntry)}
Selected Condition: ${selectedCondition}
Historical Data: ${JSON.stringify(conditionData.slice(-3))}

Please provide:
1. Condition-specific symptom assessment
2. Treatment effectiveness evaluation
3. Lifestyle modification recommendations
4. When to contact healthcare provider
5. Long-term health management strategies
6. Fertility considerations (if applicable)

Be medical, accurate, and supportive. Include specific guidance for ${conditionEntry.condition} management and symptom severity.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setConditionForm({
        date: new Date().toISOString().split('T')[0],
        condition: conditionForm.condition, // Keep condition
        symptoms: [],
        severity: 'mild',
        medications: [],
        lifestyle: [],
        weight: '',
        bloodPressure: '',
        bloodSugar: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging condition data:', error);
      alert('Error logging condition data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionInfo = (condition) => {
    const info = {
      'PCOS': {
        name: 'Polycystic Ovary Syndrome',
        description: 'Hormonal disorder affecting reproductive health',
        color: '#ff6b9d',
        icon: '🔄'
      },
      'Endometriosis': {
        name: 'Endometriosis',
        description: 'Tissue similar to uterine lining grows outside uterus',
        color: '#4ecdc4',
        icon: '🌺'
      }
    };
    return info[condition] || { name: 'Unknown', description: 'Unknown condition', color: '#666', icon: '❓' };
  };

  return (
    <div className="condition-specific-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🏥 Condition-Specific Care</h1>
        <p>Track PCOS, Endometriosis, and other reproductive health conditions</p>
      </div>

      <div className="condition-content">
        {/* Condition Overview */}
        <div className="condition-overview">
          <div className="overview-card">
            <h3>📊 Current Condition</h3>
            <p className="condition-display" style={{ color: getConditionInfo(selectedCondition).color }}>
              {getConditionInfo(selectedCondition).icon} {getConditionInfo(selectedCondition).name}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📈 Tracking History</h3>
            <p className="count-display">{conditionData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>💪 Management</h3>
            <p className="status-display">Comprehensive care</p>
          </div>
        </div>

        {/* Condition Logging Form */}
        <div className="condition-form-section">
          <h2>Log Your Condition Data</h2>
          <form onSubmit={handleConditionLog} className="condition-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={conditionForm.date}
                  onChange={(e) => setConditionForm({...conditionForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Condition</label>
                <select
                  value={conditionForm.condition}
                  onChange={(e) => {
                    setConditionForm({...conditionForm, condition: e.target.value});
                    setSelectedCondition(e.target.value);
                  }}
                >
                  <option value="PCOS">PCOS (Polycystic Ovary Syndrome)</option>
                  <option value="Endometriosis">Endometriosis</option>
                </select>
                <small>{getConditionInfo(conditionForm.condition).description}</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Symptom Severity</label>
                <select
                  value={conditionForm.severity}
                  onChange={(e) => setConditionForm({...conditionForm, severity: e.target.value})}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="none">No symptoms</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={conditionForm.weight}
                  onChange={(e) => setConditionForm({...conditionForm, weight: e.target.value})}
                  placeholder="e.g., 150.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Pressure</label>
                <input
                  type="text"
                  value={conditionForm.bloodPressure}
                  onChange={(e) => setConditionForm({...conditionForm, bloodPressure: e.target.value})}
                  placeholder="e.g., 120/80"
                />
                <small>Systolic/Diastolic</small>
              </div>
              
              <div className="form-group">
                <label>Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={conditionForm.bloodSugar}
                  onChange={(e) => setConditionForm({...conditionForm, bloodSugar: e.target.value})}
                  placeholder="e.g., 95"
                />
                <small>Fasting glucose level</small>
              </div>
            </div>

            <div className="form-group">
              <label>{selectedCondition} Symptoms</label>
              <div className="symptoms-grid">
                {getCurrentSymptoms().map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={conditionForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Treatments & Medications</label>
              <div className="treatments-grid">
                {availableTreatments.map(treatment => (
                  <label key={treatment} className="treatment-option">
                    <input
                      type="checkbox"
                      checked={conditionForm.medications.includes(treatment)}
                      onChange={() => handleTreatmentToggle(treatment)}
                    />
                    <span className="treatment-label">{treatment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Lifestyle Modifications</label>
              <div className="lifestyle-grid">
                {lifestyleOptions.map(lifestyle => (
                  <label key={lifestyle} className="lifestyle-option">
                    <input
                      type="checkbox"
                      checked={conditionForm.lifestyle.includes(lifestyle)}
                      onChange={() => handleLifestyleToggle(lifestyle)}
                    />
                    <span className="lifestyle-label">{lifestyle}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={conditionForm.notes}
                onChange={(e) => setConditionForm({...conditionForm, notes: e.target.value})}
                placeholder="Any additional notes about your condition, treatment response, concerns, or questions for your healthcare provider..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Condition Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Condition Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Condition History */}
        {conditionData.length > 0 && (
          <div className="condition-history">
            <h2>📈 Condition History</h2>
            <div className="history-list">
              {conditionData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Condition: {entry.condition}</span>
                    <span>Severity: {entry.severity}</span>
                    {entry.weight && <span>Weight: {entry.weight} lbs</span>}
                    {entry.bloodPressure && <span>BP: {entry.bloodPressure}</span>}
                    {entry.bloodSugar && <span>Glucose: {entry.bloodSugar} mg/dL</span>}
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condition Information */}
        <div className="condition-info">
          <h2>📚 Condition Information</h2>
          <div className="condition-cards">
            {['PCOS', 'Endometriosis'].map(condition => (
              <div key={condition} className={`condition-card ${selectedCondition === condition ? 'active' : ''}`}>
                <h3 style={{ color: getConditionInfo(condition).color }}>
                  {getConditionInfo(condition).icon} {getConditionInfo(condition).name}
                </h3>
                <p className="condition-description">{getConditionInfo(condition).description}</p>
                <div className="condition-details">
                  {condition === 'PCOS' && (
                    <ul>
                      <li>Affects 1 in 10 women of childbearing age</li>
                      <li>Common symptoms: irregular periods, excess hair growth, weight gain</li>
                      <li>Can impact fertility and long-term health</li>
                      <li>Management includes lifestyle changes and medications</li>
                    </ul>
                  )}
                  {condition === 'Endometriosis' && (
                    <ul>
                      <li>Affects 1 in 10 women of childbearing age</li>
                      <li>Common symptoms: severe pain, heavy bleeding, infertility</li>
                      <li>Can cause chronic pelvic pain</li>
                      <li>Treatment options include medications and surgery</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionSpecific;
