import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './ConditionSpecific.css';

const ConditionSpecific = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('PCOS');

  // AI-Powered Condition Intelligence (SAME STRUCTURE AS OTHER MODULES)
  const [insights, setInsights] = useState(null);
  const [conditionPatterns, setConditionPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

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

  // MEDICAL-GRADE Endometriosis symptoms (what doctors actually track)
  const endometriosisSymptoms = [
    // Primary Symptoms (Diagnostic)
    'Severe menstrual cramps',
    'Chronic pelvic pain',
    'Pain during intercourse (dyspareunia)',
    'Painful bowel movements',
    'Painful urination',
    
    // Menstrual Symptoms
    'Heavy menstrual bleeding',
    'Irregular periods',
    'Prolonged periods',
    'Spotting between periods',
    
    // Gastrointestinal Symptoms
    'Bloating',
    'Constipation',
    'Diarrhea',
    'Nausea',
    'Abdominal cramping',
    
    // Pain Patterns
    'Lower back pain',
    'Leg pain',
    'Shoulder pain (rare)',
    'Pain that worsens over time',
    
    // Reproductive Impact
    'Infertility',
    'Pain during ovulation',
    'Pain during pelvic exams',
    
    // Quality of Life
    'Fatigue',
    'Depression',
    'Anxiety',
    'Sleep disturbances',
    
    // Advanced Symptoms
    'Blood in urine',
    'Blood in stool',
    'Chest pain (rare)',
    'No symptoms'
  ];

  // MEDICAL-GRADE treatments for PCOS and Endometriosis
  const availableTreatments = [
    // Hormonal Treatments
    'Birth control pills (combined)',
    'Progestin-only pills',
    'Hormonal IUD (Mirena)',
    'Hormone therapy',
    'GnRH agonists',
    'Aromatase inhibitors',
    
    // PCOS-Specific Medications
    'Metformin',
    'Spironolactone',
    'Clomiphene (fertility)',
    'Letrozole (fertility)',
    
    // Pain Management
    'NSAIDs (Ibuprofen, Naproxen)',
    'Acetaminophen',
    'Prescription pain medication',
    'Muscle relaxants',
    
    // Surgical Options
    'Laparoscopic surgery',
    'Hysterectomy',
    'Ovarian cyst removal',
    'Endometriosis excision',
    
    // Lifestyle & Alternative
    'Regular exercise',
    'Healthy diet',
    'Weight management',
    'Stress management',
    'Physical therapy',
    'Acupuncture',
    'Pelvic floor therapy',
    
    // Supplements & Natural
    'Omega-3 supplements',
    'Turmeric/Curcumin',
    'Magnesium',
    'Vitamin D',
    'Probiotics',
    
    // Other
    'No treatment',
    'Other medications'
  ];

  // MEDICAL-GRADE Lifestyle modifications for PCOS and Endometriosis
  const lifestyleOptions = [
    // Exercise & Physical Activity
    'Regular exercise (150 min/week)',
    'Low-impact exercises',
    'Pelvic floor exercises',
    'Yoga/Pilates',
    'Walking/Swimming',
    
    // Diet & Nutrition
    'Anti-inflammatory diet',
    'Low-glycemic index foods',
    'Increase fiber intake',
    'Reduce sugar intake',
    'Limit processed foods',
    'Increase omega-3 foods',
    'Stay hydrated',
    'Small, frequent meals',
    
    // Weight & Metabolic Health
    'Weight management',
    'Portion control',
    'Regular meal timing',
    'Limit alcohol',
    'Quit smoking',
    
    // Stress & Mental Health
    'Stress reduction techniques',
    'Mindfulness/Meditation',
    'Deep breathing exercises',
    'Support groups',
    'Counseling/Therapy',
    
    // Sleep & Recovery
    'Adequate sleep (7-9 hours)',
    'Consistent sleep schedule',
    'Sleep hygiene',
    'Rest when needed',
    
    // Medical & Monitoring
    'Regular check-ups',
    'Track symptoms',
    'Medication compliance',
    'Follow treatment plan'
  ];

  // Load existing condition data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabConditionData_${user?.id || user?.email || 'anonymous'}`);
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
      
      // Generate comprehensive AI insights (SAME STRUCTURE AS OTHER MODULES)
      const userProfile = {
        age: user?.age || 'Not specified',
        medicalHistory: user?.medicalHistory || [],
        chronicConditions: user?.chronicConditions || [],
        medications: user?.medications || [],
        lifestyle: user?.lifestyle || {}
      };

      try {
        // Use specialized AI methods based on condition type
        let aiInsights;
        if (conditionEntry.condition === 'PCOS') {
          aiInsights = await aiService.generatePCOSInsights(conditionEntry, userProfile);
        } else if (conditionEntry.condition === 'Endometriosis') {
          aiInsights = await aiService.generateEndometriosisInsights(conditionEntry, userProfile);
        } else {
          // Fallback to generic method
          aiInsights = await aiService.generateConditionInsights(conditionEntry, userProfile);
        }
        
        // Parse comprehensive AI insights (same structure as other modules)
        if (aiInsights) {
          setInsights(aiInsights.aiInsights || aiInsights.insights || aiInsights);
          setConditionPatterns(aiInsights.patterns || 'Analyzing your condition patterns...');
          setHealthAlerts(aiInsights.alerts || []);
          setPersonalizedRecommendations(aiInsights.recommendations || []);
          setRiskAssessment(aiInsights.riskAssessment || 'Evaluating your condition risk factors...');
        }
      } catch (aiError) {
        console.error('AI insights generation failed:', aiError);
        // Fallback insights
        setInsights(`Based on your ${conditionEntry.condition} data, continue monitoring your symptoms and follow your treatment plan.`);
        setHealthAlerts([]);
        setPersonalizedRecommendations(['Continue current treatment', 'Monitor symptoms regularly', 'Maintain healthy lifestyle']);
      }
      
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
            <h2>✨ Your Condition Insights</h2>
            <div className="insights-content">
              {Array.isArray(insights) ? insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">💡</div>
                  <p className="insight-text">{insight}</p>
                </div>
              )) : (
                <div className="insight-item">
                  <div className="insight-icon">💡</div>
                  <p className="insight-text">{insights}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gentle Health Reminders */}
        {healthAlerts.length > 0 && (
          <div className="health-reminders-section">
            <h2>💝 Gentle Reminders</h2>
            <div className="reminders-list">
              {healthAlerts.map((alert, index) => (
                <div key={index} className="reminder-item">
                  <div className="reminder-icon">🌸</div>
                  <div className="reminder-content">
                    <p className="reminder-text">{alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condition Health Overview */}
        {riskAssessment && (
          <div className="condition-health-section">
            <h2>🌺 Your Condition Health</h2>
            <div className="health-content">
              <div className="health-summary">
                <div className="health-icon">🌱</div>
                <p className="health-text">{riskAssessment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Condition Patterns */}
        {conditionPatterns && (
          <div className="condition-patterns-section">
            <h2>📈 Your Condition Patterns</h2>
            <div className="patterns-content">
              <div className="pattern-item">
                <div className="pattern-icon">📊</div>
                <p className="pattern-text">{conditionPatterns}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Tips */}
        {personalizedRecommendations && personalizedRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>💝 Personalized Tips for You</h2>
            <div className="recommendations-content">
              <div className="recommendation-item">
                <div className="rec-icon">✨</div>
                <p className="rec-text">{Array.isArray(personalizedRecommendations) ? personalizedRecommendations.join(' • ') : personalizedRecommendations}</p>
              </div>
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

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Condition Education & Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🔄 Understanding PCOS</h3>
              <p>Complete guide to Polycystic Ovary Syndrome</p>
              <a href="https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos" target="_blank" rel="noopener noreferrer">
                ACOG: PCOS Information
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🌺 Understanding Endometriosis</h3>
              <p>Complete guide to endometriosis and treatment options</p>
              <a href="https://www.mayoclinic.org/diseases-conditions/endometriosis/symptoms-causes/syc-20354656" target="_blank" rel="noopener noreferrer">
                Mayo Clinic: Endometriosis Guide
              </a>
            </div>
            
            <div className="resource-card">
              <h3>💊 Treatment Options</h3>
              <p>Medical and lifestyle treatments for reproductive conditions</p>
              <a href="https://www.healthline.com/health/womens-health/reproductive-health-conditions" target="_blank" rel="noopener noreferrer">
                Healthline: Treatment Options
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🍎 Lifestyle Management</h3>
              <p>Diet, exercise, and lifestyle changes for condition management</p>
              <a href="https://www.webmd.com/women/guide/lifestyle-changes-reproductive-health" target="_blank" rel="noopener noreferrer">
                WebMD: Lifestyle Management
              </a>
            </div>
            
            <div className="resource-card">
              <h3>👩‍⚕️ When to See a Specialist</h3>
              <p>Signs that indicate you should seek specialized care</p>
              <a href="https://www.asrm.org/topics/topics-index/reproductive-health-conditions/" target="_blank" rel="noopener noreferrer">
                ASRM: Specialist Care
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧘 Mental Health & Conditions</h3>
              <p>Managing mental health with reproductive health conditions</p>
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4447118/" target="_blank" rel="noopener noreferrer">
                Research: Mental Health & Conditions
              </a>
            </div>
          </div>
        </div>

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
                      <li>Affects 1 in 10 women of childbearing age (190 million worldwide)</li>
                      <li>Primary symptoms: severe pelvic pain, painful periods, pain during intercourse</li>
                      <li>Can cause infertility in 30-50% of affected women</li>
                      <li>Often misdiagnosed - average diagnosis takes 7-10 years</li>
                      <li>Treatment: hormonal therapy, pain management, laparoscopic surgery</li>
                      <li>No cure, but symptoms can be managed effectively</li>
                      <li>May improve after menopause</li>
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
