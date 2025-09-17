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
    notes: '',
    // Comprehensive health assessment (no duplicates)
    stressLevel: 5,
    sleepQuality: 5,
    exerciseFrequency: 'moderate',
    dietQuality: 'good',
    medicationUse: '',
    familyHistory: [],
    weight: '',
    bloodPressure: ''
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
  const [selectedCycleInsights, setSelectedCycleInsights] = useState(null);
  
  // Real-time AI Guidance
  const [aiGuidance, setAiGuidance] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  
  // 3-Cycle Analysis Feature
  const [threeCycleAnalysis, setThreeCycleAnalysis] = useState(null);
  const [showThreeCycleAnalysis, setShowThreeCycleAnalysis] = useState(false);
  const [savedThreeCycleAnalysis, setSavedThreeCycleAnalysis] = useState(null);
  const [selectedThreeCycleAnalysis, setSelectedThreeCycleAnalysis] = useState(null);

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

  // Family History Options for Medical Assessment
  const familyHistoryOptions = [
    'PCOS', 'Endometriosis', 'Fibroids', 'Ovarian cysts',
    'Irregular periods', 'Heavy periods', 'Early menopause',
    'Breast cancer', 'Ovarian cancer', 'Diabetes', 'Thyroid disorders'
  ];

  // Load existing cycle data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCycleData(parsed);
      
      // Calculate next period and fertile window from latest data
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        calculateCyclePredictions(latest);
      }
    }
    
    // Load saved 3-cycle analysis
    const savedAnalysis = localStorage.getItem(`afabThreeCycleAnalysis_${user?.id || user?.email || 'anonymous'}`);
    console.log('🔍 Checking for saved 3-cycle analysis:', savedAnalysis);
    if (savedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(savedAnalysis);
        console.log('✅ Loaded saved 3-cycle analysis:', parsedAnalysis);
        setSavedThreeCycleAnalysis(parsedAnalysis);
      } catch (error) {
        console.error('Error loading 3-cycle analysis:', error);
      }
    } else {
      console.log('❌ No saved 3-cycle analysis found');
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

  const handleFamilyHistoryToggle = (condition) => {
    setCycleForm(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.includes(condition)
        ? prev.familyHistory.filter(c => c !== condition)
        : [...prev.familyHistory, condition]
    }));
  };

  // Real-time AI Guidance based on form data
  const generateRealTimeGuidance = async (formData) => {
    try {
      const guidancePrompt = `As an AI healthcare assistant, provide real-time medical guidance based on current form data:

CURRENT FORM DATA:
- Pain Level: ${formData.pain}/10
- Flow: ${formData.flowIntensity}
- Symptoms: ${formData.symptoms?.join(', ') || 'None'}
- Stress Level: ${formData.stressLevel}/10
- Sleep Quality: ${formData.sleepQuality}/10
- Family History: ${formData.familyHistory?.join(', ') || 'None'}

Provide a brief, supportive medical insight (2-3 sentences) that:
1. Acknowledges what the user has shared
2. Provides relevant medical context
3. Offers encouragement or gentle guidance
4. Feels like talking to a caring doctor

Keep it conversational and supportive.`;

      const guidance = await aiService.generateHealthInsights(guidancePrompt);
      setAiGuidance(guidance);
      setShowGuidance(true);
    } catch (error) {
      console.log('Real-time guidance unavailable');
    }
  };

  // 3-Cycle Analysis Function
  const generateThreeCycleAnalysis = async () => {
    if (cycleData.length < 3) {
      alert('Please log at least 3 cycles to get comprehensive analysis!');
      return;
    }

    try {
      setIsLoading(true);
      const recentCycles = cycleData.slice(-3); // Get last 3 cycles
      
      const analysisPrompt = `As an AI healthcare assistant, provide comprehensive 3-cycle analysis:

RECENT 3 CYCLES DATA:
${recentCycles.map((cycle, index) => `
Cycle ${index + 1}:
- Date: ${cycle.lastPeriod}
- Length: ${cycle.cycleLength} days
- Flow: ${cycle.flowIntensity}
- Pain: ${cycle.pain}/10
- Symptoms: ${cycle.symptoms?.join(', ') || 'None'}
- Stress: ${cycle.stressLevel || 5}/10
- Sleep: ${cycle.sleepQuality || 5}/10
- Family History: ${cycle.familyHistory?.join(', ') || 'None'}
`).join('')}

Provide comprehensive analysis including:
1. **INTELLIGENT PATTERN ANALYSIS**: 
   - Cycle length trends and variations
   - Symptom consistency and changes
   - Pain level progression
   - Flow intensity patterns
   - Lifestyle factor correlations

2. **PERSONALIZED HEALTH INSIGHTS**: 
   - What your specific patterns reveal about your reproductive health
   - How your family history affects your cycles
   - Lifestyle factors impacting your cycles

3. **CONTEXTUAL RISK ASSESSMENT**: 
   - Any concerning patterns based on your specific data
   - Improvements or worsening trends
   - Red flags to watch for

4. **INTELLIGENT RECOMMENDATIONS**: 
   - Specific actions based on your 3-cycle data
   - Lifestyle changes tailored to your patterns
   - Medical considerations based on your family history

5. **PREDICTIVE INSIGHTS**: 
   - What to expect in upcoming cycles based on your patterns
   - Seasonal or lifestyle factors to consider

6. **PERSONALIZED MEDICAL GUIDANCE**: 
   - When to consult healthcare provider based on your specific patterns
   - What to discuss with your doctor

Format as detailed medical analysis with clear sections and bullet points. Make it feel like a comprehensive medical consultation.`;

      const analysis = await aiService.generateHealthInsights(analysisPrompt);
      
      // Save 3-cycle analysis to localStorage
      const analysisData = {
        analysis: analysis,
        timestamp: new Date().toISOString(),
        cyclesAnalyzed: recentCycles.length,
        cycleDates: recentCycles.map(cycle => cycle.lastPeriod)
      };
      console.log('💾 Saving 3-cycle analysis:', analysisData);
      setSavedThreeCycleAnalysis(analysisData);
      const storageKey = `afabThreeCycleAnalysis_${user?.id || user?.email || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify(analysisData));
      console.log('✅ 3-cycle analysis saved to localStorage with key:', storageKey);
      
      // Show the analysis in modal
      setSelectedThreeCycleAnalysis(analysisData);
    } catch (error) {
      console.error('Error generating 3-cycle analysis:', error);
      alert('Error generating analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      localStorage.setItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
      
      // Calculate predictions
      calculateCyclePredictions(cycleEntry);
      
      // Generate REAL AI insights using AI service
      console.log('🚀 Generating REAL AI insights...');
      
      try {
        const userProfile = {
          ...user,
          age: calculateAge(user?.dateOfBirth),
          conditions: { reproductive: [] },
          familyHistory: { womensConditions: [] },
          lifestyle: { exercise: { frequency: 'Moderate' }, stress: { level: 'Moderate' } },
          tobaccoUse: 'No'
        };
        
        console.log('🤖 Calling AI service (Gemini Primary)...');
        
        // Call the AI service - Gemini first, Ollama only if Gemini fails
        const aiInsights = await aiService.generateCycleInsights(updatedData, userProfile);
        
        console.log('✅ REAL AI Insights received:', aiInsights);
        
        // Set all the comprehensive AI insights
        if (aiInsights) {
          // AI Insights - detailed medical analysis
          if (aiInsights.aiInsights && Array.isArray(aiInsights.aiInsights)) {
            setInsights([...aiInsights.aiInsights]); // Force re-render
          } else if (typeof aiInsights === 'string') {
            setInsights([aiInsights]);
          } else {
            setInsights(['AI analysis completed successfully!']);
          }

          // Store AI insights with the cycle data
          const cycleWithInsights = {
            ...updatedData[updatedData.length - 1],
            aiInsights: aiInsights,
            insightsTimestamp: new Date().toISOString()
          };
          
          // Update the cycle data with AI insights
          const updatedCycleData = [...updatedData];
          updatedCycleData[updatedCycleData.length - 1] = cycleWithInsights;
          setCycleData(updatedCycleData);
          localStorage.setItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedCycleData));
          
          // Personalized Recommendations - actionable medical advice
          if (aiInsights.personalizedTips && Array.isArray(aiInsights.personalizedTips)) {
            setPersonalizedRecommendations([...aiInsights.personalizedTips]); // Force re-render
          } else if (aiInsights.recommendations && Array.isArray(aiInsights.recommendations)) {
            setPersonalizedRecommendations([...aiInsights.recommendations]); // Force re-render
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
            setGentleReminders([...aiInsights.gentleReminders]); // Force re-render
          } else if (aiInsights.medicalAlerts && Array.isArray(aiInsights.medicalAlerts)) {
            setGentleReminders([...aiInsights.medicalAlerts]); // Force re-render
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
        notes: '',
        // Reset comprehensive health assessment
        stressLevel: 5,
        sleepQuality: 5,
        exerciseFrequency: 'moderate',
        dietQuality: 'good',
        medicationUse: '',
        familyHistory: [],
        weight: '',
        bloodPressure: ''
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
      localStorage.setItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
      
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

            {/* Comprehensive Health Assessment - All in One */}
            <div className="comprehensive-health-section">
              <h3>🏥 Complete Health Assessment</h3>
              
              {/* Real-time AI Guidance */}
              {showGuidance && aiGuidance && (
                <div className="ai-guidance-section">
                  <div className="guidance-header">
                    <h4>💬 AI Real-time Guidance</h4>
                    <button 
                      className="close-guidance-btn"
                      onClick={() => setShowGuidance(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="guidance-content">
                    <p className="guidance-text">{aiGuidance}</p>
                  </div>
                </div>
              )}

              <div className="guidance-trigger">
                <button 
                  type="button"
                  className="get-guidance-btn"
                  onClick={() => generateRealTimeGuidance(cycleForm)}
                >
                  💡 Get Real-time Medical Guidance
                </button>
              </div>

              {/* Physical Health Metrics */}
              <div className="health-metrics-section">
                <h4>📊 Physical Health Metrics</h4>
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
              </div>

              {/* Lifestyle & Wellness */}
              <div className="lifestyle-section">
                <h4>🌱 Lifestyle & Wellness</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stress Level: {cycleForm.stressLevel}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={cycleForm.stressLevel}
                      onChange={(e) => setCycleForm({...cycleForm, stressLevel: parseInt(e.target.value)})}
                      className="stress-slider"
                    />
                    <div className="slider-labels">
                      <span>Low Stress</span>
                      <span>High Stress</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Sleep Quality: {cycleForm.sleepQuality}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={cycleForm.sleepQuality}
                      onChange={(e) => setCycleForm({...cycleForm, sleepQuality: parseInt(e.target.value)})}
                      className="sleep-slider"
                    />
                    <div className="slider-labels">
                      <span>Poor Sleep</span>
                      <span>Excellent Sleep</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Exercise Frequency</label>
                    <select
                      value={cycleForm.exerciseFrequency}
                      onChange={(e) => setCycleForm({...cycleForm, exerciseFrequency: e.target.value})}
                    >
                      <option value="none">No Exercise</option>
                      <option value="light">Light (1-2x/week)</option>
                      <option value="moderate">Moderate (3-4x/week)</option>
                      <option value="intense">Intense (5-6x/week)</option>
                      <option value="daily">Daily Exercise</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Diet Quality</label>
                    <select
                      value={cycleForm.dietQuality}
                      onChange={(e) => setCycleForm({...cycleForm, dietQuality: e.target.value})}
                    >
                      <option value="poor">Poor (Fast food, processed)</option>
                      <option value="fair">Fair (Mixed diet)</option>
                      <option value="good">Good (Balanced, home-cooked)</option>
                      <option value="excellent">Excellent (Whole foods, organic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="medical-info-section">
                <h4>💊 Medical Information</h4>
                <div className="form-group">
                  <label>Current Medications</label>
                  <input
                    type="text"
                    value={cycleForm.medicationUse}
                    onChange={(e) => setCycleForm({...cycleForm, medicationUse: e.target.value})}
                    placeholder="e.g., Birth control, Metformin, Ibuprofen"
                  />
                </div>

                <div className="form-group">
                  <label>Family History (Select all that apply)</label>
                  <div className="family-history-grid">
                    {familyHistoryOptions.map(condition => (
                      <label key={condition} className="family-history-option">
                        <input
                          type="checkbox"
                          checked={cycleForm.familyHistory.includes(condition)}
                          onChange={() => handleFamilyHistoryToggle(condition)}
                        />
                        <span className="condition-label">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cycle Symptoms */}
              <div className="symptoms-section">
                <h4>🩺 Cycle Symptoms</h4>
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
            <div className="summary-header">
              <h2>📊 Your Cycle at a Glance</h2>
              {cycleData.length >= 3 && (
                <div className="analysis-buttons">
                  <button 
                    className="three-cycle-btn"
                    onClick={generateThreeCycleAnalysis}
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳ Analyzing...' : '🔬 Get 3-Cycle Analysis'}
                  </button>
                  {savedThreeCycleAnalysis ? (
                    <button 
                      className="view-saved-analysis-btn"
                      onClick={() => {
                        console.log('🔍 View Saved Analysis clicked!');
                        console.log('📋 Saved analysis data:', savedThreeCycleAnalysis);
                        setSelectedThreeCycleAnalysis(savedThreeCycleAnalysis);
                        console.log('✅ Analysis modal should now be visible');
                      }}
                    >
                      📋 View Saved Analysis
                    </button>
                  ) : (
                    <div className="no-saved-analysis">
                      <small>No saved analysis yet</small>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              {cycleData.length >= 3 && (
                <div className="summary-card analysis-ready">
                  <div className="card-icon">🔬</div>
                  <div className="card-content">
                    <h3>Analysis Ready</h3>
                    <p>3+ cycles logged</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* AI Insights - Structured */}
        {insights && (
          <div className="insights-section">
            <div className="insights-header">
              <h2>✨ AI-Powered Cycle Analysis</h2>
            </div>
            <div className="insights-content">
              {Array.isArray(insights) ? insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-header">
                    <div className="insight-icon">💡</div>
                    <h4>Insight #{index + 1}</h4>
                  </div>
                  <div className="insight-body">
                    <p className="insight-text">{insight}</p>
                  </div>
                </div>
              )) : (
                <div className="insight-card">
                  <div className="insight-header">
                    <div className="insight-icon">💡</div>
                    <h4>AI Analysis</h4>
                  </div>
                  <div className="insight-body">
                    <p className="insight-text">{insights}</p>
                  </div>
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

        {/* Interactive Dashboard - Show after 3+ consecutive cycles */}
        {cycleData.length >= 3 && (
          <div className="interactive-dashboard">
            <h2>📊 Your Cycle Analytics</h2>
            <p className="dashboard-subtitle">Insights from {cycleData.length} consecutive cycles</p>
            
            <div className="dashboard-grid">
              {/* Cycle Length Distribution */}
              <div className="dashboard-card">
                <h3>📈 Cycle Length Trends</h3>
                <div className="chart-container">
                  <div className="cycle-length-chart">
                    {cycleData.map((cycle, index) => {
                      const avgLength = cycleData.reduce((sum, c) => sum + (c.cycleLength || 28), 0) / cycleData.length;
                      const percentage = ((cycle.cycleLength || 28) / avgLength) * 100;
                      return (
                        <div key={index} className="cycle-bar">
                          <div className="bar-label">Cycle {index + 1}</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${Math.min(percentage, 150)}%`,
                                backgroundColor: cycle.cycleLength > 35 ? '#ff6b9d' : cycle.cycleLength < 21 ? '#ff9800' : '#4CAF50'
                              }}
                            ></div>
                            <span className="bar-value">{cycle.cycleLength || 28} days</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pain Level Trends */}
              <div className="dashboard-card">
                <h3>⚠️ Pain Level Trends</h3>
                <div className="chart-container">
                  <div className="pain-chart">
                    {cycleData.map((cycle, index) => {
                      const painLevel = cycle.pain || 0;
                      const intensity = (painLevel / 10) * 100;
                      return (
                        <div key={index} className="pain-point">
                          <div className="pain-label">Cycle {index + 1}</div>
                          <div className="pain-bar">
                            <div 
                              className="pain-fill"
                              style={{ 
                                height: `${intensity}%`,
                                backgroundColor: painLevel >= 7 ? '#ff4444' : painLevel >= 4 ? '#ff9800' : '#4CAF50'
                              }}
                            ></div>
                            <span className="pain-value">{painLevel}/10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Flow Intensity Patterns */}
              <div className="dashboard-card">
                <h3>🩸 Flow Intensity Patterns</h3>
                <div className="flow-patterns">
                  {cycleData.map((cycle, index) => {
                    const flowColors = {
                      'light': '#4CAF50',
                      'medium': '#ff9800', 
                      'heavy': '#ff4444'
                    };
                    return (
                      <div key={index} className="flow-item">
                        <div className="flow-cycle">Cycle {index + 1}</div>
                        <div 
                          className="flow-indicator"
                          style={{ backgroundColor: flowColors[cycle.flowIntensity] || '#4CAF50' }}
                        ></div>
                        <div className="flow-label">{cycle.flowIntensity || 'medium'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Symptom Frequency */}
              <div className="dashboard-card">
                <h3>🔍 Most Common Symptoms</h3>
                <div className="symptom-frequency">
                  {(() => {
                    const symptomCount = {};
                    cycleData.forEach(cycle => {
                      if (cycle.symptoms) {
                        cycle.symptoms.forEach(symptom => {
                          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
                        });
                      }
                    });
                    
                    const sortedSymptoms = Object.entries(symptomCount)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5);
                    
                    return sortedSymptoms.map(([symptom, count]) => (
                      <div key={symptom} className="symptom-item">
                        <span className="symptom-name">{symptom}</span>
                        <div className="symptom-bar">
                          <div 
                            className="symptom-fill"
                            style={{ width: `${(count / cycleData.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="symptom-count">{count}/{cycleData.length}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Health Score */}
              <div className="dashboard-card">
                <h3>🌟 Overall Health Score</h3>
                <div className="health-score">
                  {(() => {
                    const avgPain = cycleData.reduce((sum, c) => sum + (c.pain || 0), 0) / cycleData.length;
                    const avgLength = cycleData.reduce((sum, c) => sum + (c.cycleLength || 28), 0) / cycleData.length;
                    const lengthScore = avgLength >= 21 && avgLength <= 35 ? 100 : Math.max(0, 100 - Math.abs(avgLength - 28) * 2);
                    const painScore = Math.max(0, 100 - avgPain * 10);
                    const overallScore = Math.round((lengthScore + painScore) / 2);
                    
                    return (
                      <div className="score-display">
                        <div 
                          className="score-circle"
                          style={{ '--score-angle': `${(overallScore / 100) * 360}deg` }}
                        >
                          <div className="score-value">{overallScore}</div>
                          <div className="score-label">/100</div>
                        </div>
                        <div className="score-description">
                          {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Needs Attention'}
                        </div>
                        <div className="score-breakdown">
                          <div className="breakdown-item">
                            <span>Cycle Length Score:</span>
                            <span>{Math.round(lengthScore)}/100</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Pain Level Score:</span>
                            <span>{Math.round(painScore)}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Next Cycle Prediction */}
              <div className="dashboard-card">
                <h3>🔮 Next Cycle Prediction</h3>
                <div className="prediction-content">
                  {(() => {
                    const avgLength = cycleData.reduce((sum, c) => sum + (c.cycleLength || 28), 0) / cycleData.length;
                    const lastCycle = cycleData[cycleData.length - 1];
                    const lastPeriodDate = new Date(lastCycle.timestamp);
                    const nextPeriodDate = new Date(lastPeriodDate);
                    nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(avgLength));
                    
                    return (
                      <div className="prediction-details">
                        <div className="prediction-item">
                          <span className="prediction-label">Expected Next Period:</span>
                          <span className="prediction-value">{nextPeriodDate.toLocaleDateString()}</span>
                        </div>
                        <div className="prediction-item">
                          <span className="prediction-label">Average Cycle Length:</span>
                          <span className="prediction-value">{Math.round(avgLength)} days</span>
                        </div>
                        <div className="prediction-item">
                          <span className="prediction-label">Confidence Level:</span>
                          <span className="prediction-value">
                            {cycleData.length >= 6 ? 'High' : cycleData.length >= 3 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
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
                  <div className="history-actions">
                    {cycle.aiInsights && (
                      <button 
                        className="view-insights-btn"
                        onClick={() => setSelectedCycleInsights(cycle)}
                        title="View AI Insights for this cycle"
                      >
                        🤖
                      </button>
                    )}
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

        {/* Historical AI Insights Modal */}
        {selectedCycleInsights && (
          <div className="insights-modal-overlay" onClick={() => setSelectedCycleInsights(null)}>
            <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🤖 AI Insights - {new Date(selectedCycleInsights.timestamp).toLocaleDateString()}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedCycleInsights(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                {/* Cycle Insights */}
                {selectedCycleInsights.aiInsights?.aiInsights && (
                  <div className="modal-section">
                    <h3>📊 Cycle Insights</h3>
                    <div className="insights-content">
                      {Array.isArray(selectedCycleInsights.aiInsights.aiInsights) ? (
                        selectedCycleInsights.aiInsights.aiInsights.map((insight, index) => (
                          <p key={index} className="insight-text">{insight}</p>
                        ))
                      ) : (
                        <p className="insight-text">{selectedCycleInsights.aiInsights.aiInsights}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cycle Patterns */}
                {selectedCycleInsights.aiInsights?.quickCheck && (
                  <div className="modal-section">
                    <h3>📈 Cycle Patterns</h3>
                    <div className="patterns-grid">
                      <div className="pattern-item">
                        <h4>🩸 Flow Assessment</h4>
                        <p>{selectedCycleInsights.aiInsights.quickCheck.flowAssessment}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>⚠️ Symptom Evaluation</h4>
                        <p>{selectedCycleInsights.aiInsights.quickCheck.symptomEvaluation}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>📋 Action Item</h4>
                        <p>{selectedCycleInsights.aiInsights.quickCheck.actionItem}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>🎯 Confidence Level</h4>
                        <p>{selectedCycleInsights.aiInsights.quickCheck.confidence}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personalized Tips */}
                {selectedCycleInsights.aiInsights?.personalizedTips && (
                  <div className="modal-section">
                    <h3>💝 Personalized Tips</h3>
                    <div className="tips-list">
                      {selectedCycleInsights.aiInsights.personalizedTips.map((tip, index) => (
                        <div key={index} className="tip-item">
                          <span className="tip-icon">✨</span>
                          <span className="tip-text">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gentle Reminders */}
                {selectedCycleInsights.aiInsights?.gentleReminders && (
                  <div className="modal-section">
                    <h3>🌸 Gentle Reminders</h3>
                    <div className="reminders-list">
                      {selectedCycleInsights.aiInsights.gentleReminders.map((reminder, index) => (
                        <div key={index} className="reminder-item">
                          <span className="reminder-icon">🌸</span>
                          <span className="reminder-text">{reminder}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3-Cycle Analysis Modal */}
        {selectedThreeCycleAnalysis && (
          <div className="insights-modal-overlay" onClick={() => setSelectedThreeCycleAnalysis(null)}>
            <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔬 Comprehensive 3-Cycle Analysis</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedThreeCycleAnalysis(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <div className="modal-section">
                  <div className="analysis-badge">
                    <span className="analysis-icon">🤖</span>
                    <span>AI In-Depth Analysis</span>
                    <span className="analysis-date">
                      Generated: {new Date(selectedThreeCycleAnalysis.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="analysis-text">
                    {selectedThreeCycleAnalysis.analysis.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="analysis-paragraph">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleTracking;
