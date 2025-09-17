import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './PregnancyTracking.css';

const PregnancyTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());
  
  // MEDICAL-GRADE Pregnancy tracking form state
  const [pregnancyForm, setPregnancyForm] = useState({
    date: new Date().toISOString().split('T')[0],
    
    // Pregnancy Timeline
    dueDate: '',
    lastMenstrualPeriod: '',
    conceptionDate: '',
    gestationalAge: '',
    trimester: 1,
    
    // Vital Signs & Measurements
    weight: '',
    weightGain: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    fetalHeartbeat: '',
    fundalHeight: '',
    
    // Pregnancy Symptoms (Medical-Grade)
    symptoms: [],
    symptomSeverity: 'mild',
    
    // Medications & Supplements
    medications: [],
    supplements: [],
    prescriptionDrugs: [],
    
    // Medical History & Risk Factors
    previousPregnancies: '',
    complications: [],
    chronicConditions: [],
    allergies: [],
    
    // Lifestyle & Health
    exercise: 'none',
    diet: 'normal',
    stress: 5,
    sleep: 5,
    mood: 5,
    
    // Appointments & Tests
    appointments: [],
    testResults: [],
    ultrasounds: [],
    
    // Additional Medical Data
    notes: '',
    concerns: '',
    questions: ''
  });

  // Pregnancy data and insights
  const [pregnancyData, setPregnancyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pregnancyProgress, setPregnancyProgress] = useState(null);
  
  // AI-Powered Pregnancy Intelligence (SAME STRUCTURE AS CYCLE TRACKING)
  const [insights, setInsights] = useState(null);
  const [pregnancyPatterns, setPregnancyPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // MEDICAL-GRADE Pregnancy symptoms (what doctors actually track)
  const availableSymptoms = [
    // First Trimester (Weeks 1-12)
    'Nausea',
    'Vomiting',
    'Fatigue',
    'Breast tenderness',
    'Frequent urination',
    'Food aversions',
    'Food cravings',
    'Mood swings',
    'Spotting',
    'Cramping',
    
    // Second Trimester (Weeks 13-26)
    'Round ligament pain',
    'Back pain',
    'Heartburn',
    'Constipation',
    'Nasal congestion',
    'Dizziness',
    'Headaches',
    'Increased appetite',
    'Weight gain',
    'Skin changes',
    
    // Third Trimester (Weeks 27-40)
    'Swelling (edema)',
    'Shortness of breath',
    'Braxton Hicks contractions',
    'Pelvic pressure',
    'Sleep disturbances',
    'Frequent urination (increased)',
    'Vaginal discharge',
    'Back pain (severe)',
    'Leg cramps',
    'Varicose veins',
    
    // Warning Signs (Medical Alerts)
    'Heavy bleeding',
    'Severe abdominal pain',
    'Severe headaches',
    'Vision changes',
    'Chest pain',
    'Difficulty breathing',
    'Fever',
    'Decreased fetal movement',
    'Water breaking',
    'No symptoms'
  ];

  // MEDICAL-GRADE Pregnancy medications & supplements
  const availableMedications = [
    // Essential Prenatal Supplements
    'Prenatal vitamins',
    'Folic acid (400-800mcg)',
    'Iron supplements',
    'Calcium supplements',
    'Vitamin D',
    'DHA/Omega-3',
    'B12 supplements',
    'Magnesium',
    
    // Safe Medications (Category A/B)
    'Acetaminophen (Tylenol)',
    'Antacids (Tums, Maalox)',
    'Anti-nausea (Doxylamine)',
    'Stool softeners',
    'Topical creams',
    'Nasal saline',
    
    // Prescription Medications
    'Prenatal prescriptions',
    'Anti-nausea prescriptions',
    'Blood pressure medications',
    'Diabetes medications',
    'Thyroid medications',
    'Antibiotics (if prescribed)',
    
    // Avoid During Pregnancy
    'NSAIDs (Ibuprofen, Aspirin)',
    'Herbal supplements',
    'High-dose vitamins',
    'Weight loss supplements',
    'Other medications'
  ];

  // Load existing pregnancy data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
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

  // COMMON SENSE LOGIC: Prevent impossible states
  const checkPregnancyCycleConsistency = () => {
    const cycleData = JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]');
    const pregnancyData = JSON.parse(localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`) || '[]');
    
    if (cycleData.length > 0 && pregnancyData.length > 0) {
      const latestCycle = cycleData[cycleData.length - 1];
      const latestPregnancy = pregnancyData[pregnancyData.length - 1];
      
      // If last cycle was recent (within 3 months) but pregnancy is in 3rd trimester, this is impossible
      if (latestCycle && latestPregnancy) {
        const cycleDate = new Date(latestCycle.date);
        const pregnancyDate = new Date(latestPregnancy.date);
        const monthsDiff = (pregnancyDate - cycleDate) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsDiff < 6 && latestPregnancy.trimester === 'Third') {
          console.warn('🚨 COMMON SENSE ALERT: Impossible state detected - recent cycle but 3rd trimester pregnancy');
          // Clear inconsistent pregnancy data
          localStorage.removeItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
          setPregnancyData([]);
          alert('Data inconsistency detected. Pregnancy data cleared to maintain accuracy.');
        }
      }
    }
  };

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
      // COMMON SENSE LOGIC: Check for existing pregnancy
      const existingPregnancies = pregnancyData.filter(p => {
        const pregnancyDate = new Date(p.timestamp);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return pregnancyDate > sixMonthsAgo;
      });
      
      if (existingPregnancies.length > 0) {
        const latestPregnancy = existingPregnancies[0];
        const pregnancyAge = latestPregnancy.trimester || 1;
        
        if (pregnancyAge >= 2) {
          alert(`You already have an active pregnancy logged (Trimester ${pregnancyAge}). Please complete your current pregnancy tracking before logging a new one.`);
          setIsLoading(false);
          return;
        }
      }
      
      // COMMON SENSE LOGIC: Check for recent cycle data that conflicts with pregnancy
      const cycleData = JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const recentCycles = cycleData.filter(c => {
        const cycleDate = new Date(c.cycleStartDate || c.lastPeriod);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return cycleDate > threeMonthsAgo;
      });
      
      if (recentCycles.length > 0 && pregnancyForm.trimester >= 2) {
        alert(`You have recent menstrual cycle data logged. A pregnancy in Trimester ${pregnancyForm.trimester} would not be consistent with recent cycles. Please verify your pregnancy details.`);
        setIsLoading(false);
        return;
      }
      
      const pregnancyEntry = {
        ...pregnancyForm,
        timestamp: new Date().toISOString(),
        moduleType: 'pregnancy',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...pregnancyData, pregnancyEntry];
      setPregnancyData(updatedData);
      localStorage.setItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
      
      // Calculate pregnancy progress
      if (pregnancyEntry.dueDate) {
        calculatePregnancyProgress(pregnancyEntry.dueDate);
      }
      
      // Use AI service naturally (Gemini primary, Ollama fallback)
      console.log('🚀 Using AI service for pregnancy insights...');
      
      // Generate MEDICAL-GRADE AI pregnancy insights
      const userProfile = {
        ...user,
        age: calculateAge(user?.dateOfBirth),
        conditions: { reproductive: [] },
        familyHistory: { womensConditions: [] },
        lifestyle: { exercise: { frequency: 'Moderate' }, stress: { level: 'Moderate' } },
        tobaccoUse: 'No'
      };
      
      console.log('🤖 Calling AI service for pregnancy analysis (Gemini → Ollama fallback)...');
      
      const aiInsights = await Promise.race([
        aiService.generatePregnancyInsights(updatedData, userProfile),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI request timeout after 25 seconds')), 25000)
        )
      ]);
      
      console.log('✅ REAL AI Pregnancy Insights received:', aiInsights);
      
      // Set all the comprehensive AI pregnancy insights (SAME STRUCTURE AS CYCLE TRACKING)
      if (aiInsights) {
        // AI Insights - detailed medical analysis
        setInsights(aiInsights.aiInsights || aiInsights.pregnancyInsights || ['AI pregnancy analysis completed successfully!']);
        
        // Personalized Recommendations - actionable medical advice
        const recommendations = aiInsights.pregnancyAssessment?.recommendations || aiInsights.recommendations;
        setPersonalizedRecommendations(recommendations ? (Array.isArray(recommendations) ? recommendations.join(' • ') : recommendations) : 'AI recommendations generated!');
        
        // Pregnancy Patterns - comprehensive pattern analysis
        const pregnancyAssessment = aiInsights.pregnancyAssessment;
        const patternText = pregnancyAssessment ? 
          `${pregnancyAssessment.trimester} • Risk Level: ${pregnancyAssessment.riskLevel} • Symptoms: ${pregnancyAssessment.symptoms}` :
          'AI pregnancy pattern analysis completed!';
        setPregnancyPatterns(patternText);
        
        // Risk Assessment - medical-grade risk evaluation
        const riskText = pregnancyAssessment?.riskLevel || aiInsights.riskAssessment ?
          `Pregnancy Risk: ${pregnancyAssessment?.riskLevel || aiInsights.riskAssessment?.overallRisk} • Monitoring: Active` :
          'AI pregnancy risk assessment completed!';
        setRiskAssessment(riskText);
        
        // Health Alerts - clinical alerts and warnings
        setHealthAlerts(aiInsights.medicalAlerts || ['AI pregnancy health monitoring active!']);
      }
      
      console.log('🎉 REAL AI pregnancy insights displayed successfully!');
      
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
      console.error('❌ All AI services failed:', error);
      
      // Only show error message - no fallback data
      setInsights(['AI services temporarily unavailable. Please try again in a moment.']);
      setPersonalizedRecommendations('AI analysis unavailable - please retry.');
      setPregnancyPatterns('AI pregnancy pattern analysis unavailable - please retry.');
      setRiskAssessment('AI pregnancy risk assessment unavailable - please retry.');
      setHealthAlerts(['AI pregnancy health monitoring unavailable - please retry.']);
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
            <h2>✨ Your Pregnancy Insights</h2>
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

        {/* Pregnancy Health Overview */}
        {riskAssessment && (
          <div className="pregnancy-health-section">
            <h2>🌺 Your Pregnancy Health</h2>
            <div className="health-content">
              <div className="health-summary">
                <div className="health-icon">🌱</div>
                <p className="health-text">{riskAssessment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pregnancy Patterns */}
        {pregnancyPatterns && (
          <div className="pregnancy-patterns-section">
            <h2>📈 Your Pregnancy Patterns</h2>
            <div className="patterns-content">
              <div className="pattern-item">
                <div className="pattern-icon">📊</div>
                <p className="pattern-text">{pregnancyPatterns}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Tips */}
        {personalizedRecommendations && (
          <div className="recommendations-section">
            <h2>💝 Personalized Tips for You</h2>
            <div className="recommendations-content">
              <div className="recommendation-item">
                <div className="rec-icon">✨</div>
                <p className="rec-text">{personalizedRecommendations}</p>
              </div>
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

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Pregnancy Education & Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🤰 Pregnancy Timeline</h3>
              <p>Complete guide to pregnancy stages and milestones</p>
              <a href="https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy" target="_blank" rel="noopener noreferrer">
                ACOG: Fetal Development
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🍎 Prenatal Nutrition</h3>
              <p>Essential nutrients and foods for healthy pregnancy</p>
              <a href="https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/pregnancy-nutrition/art-20045082" target="_blank" rel="noopener noreferrer">
                Mayo Clinic: Pregnancy Nutrition
              </a>
            </div>
            
            <div className="resource-card">
              <h3>⚠️ Warning Signs</h3>
              <p>When to call your healthcare provider immediately</p>
              <a href="https://www.healthline.com/health/pregnancy/warning-signs" target="_blank" rel="noopener noreferrer">
                Healthline: Pregnancy Warning Signs
              </a>
            </div>
            
            <div className="resource-card">
              <h3>💊 Safe Medications</h3>
              <p>Medications safe to take during pregnancy</p>
              <a href="https://www.webmd.com/baby/guide/medicines-safe-during-pregnancy" target="_blank" rel="noopener noreferrer">
                WebMD: Safe Pregnancy Medications
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🏃‍♀️ Exercise & Activity</h3>
              <p>Safe exercises and activities during pregnancy</p>
              <a href="https://www.asrm.org/topics/topics-index/pregnancy-and-exercise/" target="_blank" rel="noopener noreferrer">
                ASRM: Pregnancy & Exercise
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧘 Mental Health</h3>
              <p>Managing stress and mental health during pregnancy</p>
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4447118/" target="_blank" rel="noopener noreferrer">
                Research: Pregnancy Mental Health
              </a>
            </div>
          </div>
        </div>

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
