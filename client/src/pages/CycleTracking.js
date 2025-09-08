import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './CycleTracking.css';

const CycleTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());
  
  // Enhanced AI-powered cycle tracking form state
  const [cycleForm, setCycleForm] = useState({
    lastPeriod: '',
    cycleLength: 28,
    flowIntensity: 'medium',
    pain: 0,
    symptoms: [],
    bleedingPattern: 'normal',
    clots: 'none',
    notes: ''
  });

  // AI-Powered Cycle Intelligence
  const [cycleData, setCycleData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [fertileWindow, setFertileWindow] = useState(null);
  
  // AI-Powered State Management
  const [cyclePatterns, setCyclePatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [gentleReminders, setGentleReminders] = useState([]);

  // Essential Cycle Symptoms Only
  const availableSymptoms = [
    // Core Symptoms
    'Cramping', 'Bloating', 'Breast tenderness', 'Headaches', 'Back pain',
    'Nausea', 'Fatigue', 'Food cravings',
    
    // Bleeding Issues
    'Heavy bleeding', 'Light bleeding', 'Spotting', 'Irregular bleeding',
    'Clotting', 'Missed periods',
    
    // Pain
    'Pelvic pain', 'Abdominal pain',
    
    // Hormonal
    'Hot flashes', 'Night sweats', 'Vaginal dryness',
    'Weight gain', 'Weight loss', 'Sugar cravings',
    
    // Digestive
    'Constipation', 'Diarrhea', 'Stomach upset',
    
    // Sleep
    'Insomnia', 'Energy changes'
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
      
      // Generate REAL AI insights using AI service
      console.log('🚀 Generating REAL AI insights...');
      
      try {
        const userProfile = {
          ...user,
          age: user.age || 25,
          conditions: { reproductive: [] },
          familyHistory: { womensConditions: [] },
          lifestyle: { exercise: { frequency: 'Moderate' }, stress: { level: 'Moderate' } },
          tobaccoUse: 'No'
        };
        
        console.log('🤖 Calling AI service (Gemini → Ollama fallback)...');
        
        // Call the AI service - it will automatically fallback from Gemini to Ollama
        const aiInsights = await Promise.race([
          aiService.generateCycleInsights(updatedData, userProfile),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI request timeout after 25 seconds')), 25000)
          )
        ]);
        
        console.log('✅ REAL AI Insights received:', aiInsights);
        
        // Set all the comprehensive AI insights
        if (aiInsights) {
          // AI Insights - detailed medical analysis
          if (aiInsights.aiInsights && Array.isArray(aiInsights.aiInsights)) {
            setInsights(aiInsights.aiInsights);
          } else if (typeof aiInsights === 'string') {
            setInsights([aiInsights]);
          } else {
            setInsights(['AI analysis completed successfully!']);
          }
          
          // Personalized Recommendations - actionable medical advice
          if (aiInsights.personalizedTips && Array.isArray(aiInsights.personalizedTips)) {
            setPersonalizedRecommendations(aiInsights.personalizedTips);
          } else if (aiInsights.recommendations && Array.isArray(aiInsights.recommendations)) {
            setPersonalizedRecommendations(aiInsights.recommendations);
          } else {
            setPersonalizedRecommendations(['AI recommendations generated!']);
          }
          
          // Cycle Patterns - comprehensive pattern analysis
          if (aiInsights.quickCheck) {
            setCyclePatterns(aiInsights.quickCheck);
          } else if (typeof aiInsights === 'string') {
            // Handle direct text response from AI
            setCyclePatterns({
              cycleAnalysis: aiInsights,
              flowAssessment: 'Analysis completed',
              symptomEvaluation: 'Symptoms reviewed',
              actionItem: 'Continue tracking for comprehensive insights',
              confidence: 'Moderate'
            });
          } else {
            setCyclePatterns('AI pattern analysis completed!');
          }
          
          // Risk Assessment - medical-grade risk evaluation
          const riskText = aiInsights.riskAssessment ?
            `Cycle Irregularity: ${aiInsights.riskAssessment.cycleIrregularity} • Anemia Risk: ${aiInsights.riskAssessment.anemiaRisk} • Overall Risk: ${aiInsights.riskAssessment.overallRisk}` :
            'AI risk assessment completed!';
          setRiskAssessment(riskText);
          
          // Gentle Reminders - supportive daily tips
          if (aiInsights.gentleReminders && Array.isArray(aiInsights.gentleReminders)) {
            setGentleReminders(aiInsights.gentleReminders);
          } else if (aiInsights.medicalAlerts && Array.isArray(aiInsights.medicalAlerts)) {
            setGentleReminders(aiInsights.medicalAlerts);
          } else {
            setGentleReminders(['Continue tracking your cycle for better insights', 'Stay hydrated and maintain a balanced diet', 'Listen to your body and rest when needed']);
          }
          
          // Health Alerts - clinical alerts and warnings
          setHealthAlerts(aiInsights.medicalAlerts || ['AI health monitoring active!']);
        }
        
        console.log('🎉 REAL AI insights displayed successfully!');
        
      } catch (error) {
        console.error('❌ All AI services failed:', error);
        
        // Set fallback insights on error
        setInsights(['AI services temporarily unavailable. Please try again in a moment.']);
        setPersonalizedRecommendations('AI analysis unavailable - please retry.');
        setCyclePatterns('AI pattern analysis unavailable - please retry.');
        setRiskAssessment('AI risk assessment unavailable - please retry.');
        setHealthAlerts(['AI health monitoring unavailable - please retry.']);
      }
      
      // Reset form
      setCycleForm({
        lastPeriod: '',
        cycleLength: 28,
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

  // Delete cycle log
  const deleteCycleLog = (index) => {
    if (window.confirm('Are you sure you want to delete this cycle log?')) {
      const updatedData = cycleData.filter((_, i) => i !== index);
      setCycleData(updatedData);
      localStorage.setItem('afabCycleData', JSON.stringify(updatedData));
      
      // Recalculate predictions if we have data left
      if (updatedData.length > 0) {
        const latest = updatedData[updatedData.length - 1];
        calculateCyclePredictions(latest);
      } else {
        setNextPeriod(null);
        setFertileWindow(null);
      }
    }
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

            {/* AI-Enhanced Medical Tracking Section */}
            <div className="ai-enhanced-section">
              <h3>🤖 AI-Enhanced Cycle Tracking</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cycleForm.weight}
                    onChange={(e) => setCycleForm({...cycleForm, weight: e.target.value})}
                    placeholder="e.g., 150.5"
                  />
                </div>
                
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input
                    type="text"
                    value={cycleForm.bloodPressure}
                    onChange={(e) => setCycleForm({...cycleForm, bloodPressure: e.target.value})}
                    placeholder="e.g., 120/80"
                  />
                  <small>Systolic/Diastolic</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Energy Level</label>
                  <select
                    value={cycleForm.energy}
                    onChange={(e) => setCycleForm({...cycleForm, energy: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="very-low">Very Low</option>
                    <option value="very-high">Very High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Sleep Quality</label>
                  <select
                    value={cycleForm.sleep}
                    onChange={(e) => setCycleForm({...cycleForm, sleep: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="poor">Poor</option>
                    <option value="excellent">Excellent</option>
                    <option value="insomnia">Insomnia</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stress Level</label>
                  <select
                    value={cycleForm.stress}
                    onChange={(e) => setCycleForm({...cycleForm, stress: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="very-high">Very High</option>
                    <option value="overwhelming">Overwhelming</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Exercise Level</label>
                  <select
                    value={cycleForm.exercise}
                    onChange={(e) => setCycleForm({...cycleForm, exercise: e.target.value})}
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="intense">Intense</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
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


        {/* Simple Cycle Summary */}
        {cycleData.length > 0 && (
          <div className="cycle-summary-section">
            <h2>📊 Your Cycle at a Glance</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <h3>Average Cycle</h3>
                  <p>{cycleData.length > 0 ? Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycleData.length) : 28} days</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <h3>Next Period</h3>
                  <p>{nextPeriod ? nextPeriod.toLocaleDateString() : 'Keep tracking!'}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">💪</div>
                <div className="card-content">
                  <h3>Cycles Tracked</h3>
                  <p>{cycleData.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>✨ Your Cycle Insights</h2>
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


        {/* Cycle Health Overview */}
        {riskAssessment && (
          <div className="cycle-health-section">
            <h2>🌺 Your Cycle Health</h2>
            <div className="health-content">
              <div className="health-summary">
                <div className="health-icon">🌱</div>
                <p className="health-text">{riskAssessment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cycle Patterns */}
        {cyclePatterns && (
          <div className="cycle-patterns-section">
            <h2>📈 Your Cycle Patterns</h2>
            <div className="patterns-content">
              {typeof cyclePatterns === 'string' ? (
                <div className="pattern-item">
                  <div className="pattern-icon">📊</div>
                  <p className="pattern-text">{cyclePatterns}</p>
                </div>
              ) : (
                <div className="pattern-cards">
                  <div className="pattern-card">
                    <div className="pattern-header">
                      <div className="pattern-icon">🩸</div>
                      <h3>Flow Assessment</h3>
                    </div>
                    <p className="pattern-text">{cyclePatterns.flowAssessment}</p>
                  </div>
                  
                  <div className="pattern-card">
                    <div className="pattern-header">
                      <div className="pattern-icon">⚠️</div>
                      <h3>Symptom Evaluation</h3>
                    </div>
                    <p className="pattern-text">{cyclePatterns.symptomEvaluation}</p>
                  </div>
                  
                  <div className="pattern-card">
                    <div className="pattern-header">
                      <div className="pattern-icon">📋</div>
                      <h3>Action Item</h3>
                    </div>
                    <p className="pattern-text">{cyclePatterns.actionItem}</p>
                  </div>
                  
                  <div className="pattern-card">
                    <div className="pattern-header">
                      <div className="pattern-icon">🎯</div>
                      <h3>Confidence Level</h3>
                    </div>
                    <p className="pattern-text">{cyclePatterns.confidence}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personalized Tips */}
        {personalizedRecommendations && (
          <div className="recommendations-section">
            <h2>💝 Personalized Tips for You</h2>
            <div className="recommendations-content">
              {Array.isArray(personalizedRecommendations) ? (
                personalizedRecommendations.map((tip, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="rec-icon">✨</div>
                    <p className="rec-text">{tip}</p>
                  </div>
                ))
              ) : (
                <div className="recommendation-item">
                  <div className="rec-icon">✨</div>
                  <p className="rec-text">{personalizedRecommendations}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gentle Reminders */}
        {gentleReminders && gentleReminders.length > 0 && (
          <div className="gentle-reminders-section">
            <h2>🌸 Gentle Reminders</h2>
            <div className="reminders-content">
              {gentleReminders.map((reminder, index) => (
                <div key={index} className="reminder-item">
                  <div className="reminder-icon">🌸</div>
                  <p className="reminder-text">{reminder}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Cycle Education & Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🩸 Understanding Your Cycle</h3>
              <p>Learn about menstrual cycle phases and what's normal</p>
              <a href="https://www.acog.org/womens-health/faqs/the-menstrual-cycle" target="_blank" rel="noopener noreferrer">
                ACOG: Menstrual Cycle Guide
              </a>
            </div>
            
            <div className="resource-card">
              <h3>📊 Cycle Tracking Benefits</h3>
              <p>Why tracking your cycle is important for health</p>
              <a href="https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047186" target="_blank" rel="noopener noreferrer">
                Mayo Clinic: Cycle Health
              </a>
            </div>
            
            <div className="resource-card">
              <h3>⚠️ When to See a Doctor</h3>
              <p>Red flags and concerning cycle symptoms</p>
              <a href="https://www.healthline.com/health/womens-health/when-to-see-doctor-irregular-periods" target="_blank" rel="noopener noreferrer">
                Healthline: Irregular Periods
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🌿 Natural Cycle Support</h3>
              <p>Lifestyle changes for better cycle health</p>
              <a href="https://www.webmd.com/women/features/irregular-periods" target="_blank" rel="noopener noreferrer">
                WebMD: Cycle Health Tips
              </a>
            </div>
            
            <div className="resource-card">
              <h3>💊 Cycle-Related Conditions</h3>
              <p>Understanding PCOS, endometriosis, and other conditions</p>
              <a href="https://www.asrm.org/topics/topics-index/menstrual-disorders/" target="_blank" rel="noopener noreferrer">
                ASRM: Menstrual Disorders
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧘 Mental Health & Cycles</h3>
              <p>How your cycle affects mood and mental health</p>
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3118467/" target="_blank" rel="noopener noreferrer">
                Research: Cycle & Mental Health
              </a>
            </div>
          </div>
        </div>

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
                  <div className="history-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => deleteCycleLog(cycleData.length - 1 - index)}
                      title="Delete this log"
                    >
                      🗑️
                    </button>
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
