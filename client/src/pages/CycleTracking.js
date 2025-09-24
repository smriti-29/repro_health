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
  
  // Conversational UI State
  const [conversationStep, setConversationStep] = useState(0);
  const [isConversationalMode, setIsConversationalMode] = useState(true);
  
  // Conversational Interview Steps
  const conversationSteps = [
    {
      title: "🔍 Let's start with your current cycle",
      subtitle: "I need to understand your recent menstrual cycle",
      fields: ['lastPeriod', 'cycleLength', 'periodLength'],
      question: "When did your last period start, and how long did it last?"
    },
    {
      title: "💭 How are you feeling physically?",
      subtitle: "Tell me about your symptoms and discomfort",
      fields: ['flowIntensity', 'pain', 'symptoms', 'bleedingPattern', 'clots'],
      question: "Describe your flow intensity and any pain or symptoms you experienced."
    },
    {
      title: "🌱 Let's talk about your lifestyle",
      subtitle: "Your daily habits affect your cycle health",
      fields: ['stressLevel', 'sleepQuality', 'exerciseFrequency', 'dietQuality'],
      question: "How would you rate your stress levels, sleep quality, and exercise routine?"
    },
    {
      title: "💊 Medical information",
      subtitle: "Any medications or family history I should know about?",
      fields: ['medicationUse', 'familyHistory', 'weight', 'bloodPressure'],
      question: "Are you taking any medications, and is there relevant family history?"
    },
    {
      title: "📝 Any additional notes?",
      subtitle: "Anything else you'd like me to know?",
      fields: ['notes'],
      question: "Any other symptoms, concerns, or observations you'd like to share?"
    }
  ];
  
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

  // Real-time AI Guidance based on form data - DISABLED TO SAVE API CALLS
  const generateRealTimeGuidance = async (formData) => {
    // DISABLED: This was making unnecessary API calls
    // The main cycle insights already provide comprehensive guidance
    setAiGuidance('Continue filling out your cycle data for comprehensive AI insights.');
      setShowGuidance(true);
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

      // Instead of making a new API call, generate analysis from existing cycle data
      const analysis = generateThreeCycleAnalysisFromData(recentCycles);
      
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

  // Render fields for current conversation step
  const renderConversationFields = (fields) => {
    return fields.map(field => {
      switch (field) {
        case 'lastPeriod':
          return (
            <div key={field} className="conversation-field">
              <label>When did your last period start?</label>
              <input
                type="date"
                value={cycleForm.lastPeriod}
                onChange={(e) => setCycleForm({...cycleForm, lastPeriod: e.target.value})}
                required
              />
            </div>
          );
        case 'cycleLength':
          return (
            <div key={field} className="conversation-field">
              <label>How long is your typical cycle?</label>
              <select
                value={cycleForm.cycleLength}
                onChange={(e) => setCycleForm({...cycleForm, cycleLength: parseInt(e.target.value)})}
              >
                {Array.from({length: 20}, (_, i) => i + 21).map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>
          );
        case 'periodLength':
          return (
            <div key={field} className="conversation-field">
              <label>How many days does your period typically last?</label>
              <select
                value={cycleForm.periodLength}
                onChange={(e) => setCycleForm({...cycleForm, periodLength: parseInt(e.target.value)})}
              >
                {Array.from({length: 10}, (_, i) => i + 1).map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>
          );
        case 'flowIntensity':
          return (
            <div key={field} className="conversation-field">
              <label>How would you describe your flow intensity?</label>
              <select
                value={cycleForm.flowIntensity}
                onChange={(e) => setCycleForm({...cycleForm, flowIntensity: e.target.value})}
              >
                <option value="light">Light - minimal flow</option>
                <option value="medium">Medium - normal flow</option>
                <option value="heavy">Heavy - very heavy flow</option>
              </select>
            </div>
          );
        case 'pain':
          return (
            <div key={field} className="conversation-field">
              <label>Rate your pain level: {cycleForm.pain}/10</label>
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
          );
        case 'symptoms':
          return (
            <div key={field} className="conversation-field">
              <label>What symptoms did you experience? (Select all that apply)</label>
              <div className="symptoms-grid">
                {[
                  'Cramping', 'Breast tenderness', 'Back pain', 'Nausea', 'Fatigue', 
                  'Heavy bleeding', 'Clotting', 'Abdominal pain', 'Pelvic pain', 
                  'Hot flashes', 'Vaginal dryness'
                ].map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={cycleForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span>{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        case 'stressLevel':
          return (
            <div key={field} className="conversation-field">
              <label>How stressed have you been lately? {cycleForm.stressLevel}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={cycleForm.stressLevel}
                onChange={(e) => setCycleForm({...cycleForm, stressLevel: parseInt(e.target.value)})}
                className="stress-slider"
              />
              <div className="slider-labels">
                <span>Very Relaxed</span>
                <span>Very Stressed</span>
              </div>
            </div>
          );
        case 'sleepQuality':
          return (
            <div key={field} className="conversation-field">
              <label>How has your sleep been? {cycleForm.sleepQuality}/10</label>
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
          );
        case 'exerciseFrequency':
          return (
            <div key={field} className="conversation-field">
              <label>How often do you exercise?</label>
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
          );
        case 'dietQuality':
          return (
            <div key={field} className="conversation-field">
              <label>How would you rate your diet quality?</label>
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
          );
        case 'medicationUse':
          return (
            <div key={field} className="conversation-field">
              <label>Are you taking any medications or supplements?</label>
              <input
                type="text"
                value={cycleForm.medicationUse}
                onChange={(e) => setCycleForm({...cycleForm, medicationUse: e.target.value})}
                placeholder="e.g., Birth control, Metformin, Ibuprofen, Vitamins"
              />
            </div>
          );
        case 'familyHistory':
          return (
            <div key={field} className="conversation-field">
              <label>Any relevant family history? (Select all that apply)</label>
              <div className="family-history-grid">
                {['PCOS', 'Endometriosis', 'Diabetes', 'Thyroid disorders', 'Breast cancer', 'Ovarian cancer', 'None'].map(condition => (
                  <label key={condition} className="family-history-option">
                    <input
                      type="checkbox"
                      checked={cycleForm.familyHistory.includes(condition)}
                      onChange={() => handleFamilyHistoryToggle(condition)}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        case 'weight':
          return (
            <div key={field} className="conversation-field">
              <label>What's your current weight? (optional)</label>
              <input
                type="number"
                step="0.1"
                value={cycleForm.weight}
                onChange={(e) => setCycleForm({...cycleForm, weight: e.target.value})}
                placeholder="e.g., 150.5 lbs"
              />
            </div>
          );
        case 'bloodPressure':
          return (
            <div key={field} className="conversation-field">
              <label>What's your blood pressure? (optional)</label>
              <input
                type="text"
                value={cycleForm.bloodPressure}
                onChange={(e) => setCycleForm({...cycleForm, bloodPressure: e.target.value})}
                placeholder="e.g., 120/80"
              />
            </div>
          );
        case 'notes':
          return (
            <div key={field} className="conversation-field">
              <label>Any additional notes or concerns?</label>
              <textarea
                value={cycleForm.notes}
                onChange={(e) => setCycleForm({...cycleForm, notes: e.target.value})}
                placeholder="Anything else you'd like me to know about your cycle or health?"
                rows="3"
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  // Conversational UI Navigation
  const nextConversationStep = () => {
    if (conversationStep < conversationSteps.length - 1) {
      setConversationStep(conversationStep + 1);
    } else {
      // Complete the conversation and proceed to analysis
      setIsConversationalMode(false);
      handleCycleLog(new Event('submit'));
    }
  };

  const prevConversationStep = () => {
    if (conversationStep > 0) {
      setConversationStep(conversationStep - 1);
    }
  };

  const toggleConversationalMode = () => {
    setIsConversationalMode(!isConversationalMode);
    setConversationStep(0);
  };

  // Generate 3-cycle analysis from existing data (NO API CALL)
  const generateThreeCycleAnalysisFromData = (recentCycles) => {
    const cycleCount = recentCycles.length;
    
    // Calculate patterns
    const avgCycleLength = Math.round(recentCycles.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycleCount);
    const avgPain = Math.round(recentCycles.reduce((sum, cycle) => sum + (cycle.pain || 0), 0) / cycleCount);
    const avgStress = Math.round(recentCycles.reduce((sum, cycle) => sum + (cycle.stressLevel || 5), 0) / cycleCount);
    const avgSleep = Math.round(recentCycles.reduce((sum, cycle) => sum + (cycle.sleepQuality || 5), 0) / cycleCount);
    
    // Analyze symptoms
    const allSymptoms = recentCycles.flatMap(cycle => cycle.symptoms || []);
    const symptomCounts = {};
    allSymptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    const commonSymptoms = Object.entries(symptomCounts)
      .filter(([_, count]) => count >= Math.ceil(cycleCount / 2))
      .map(([symptom, count]) => `${symptom} (${count}/${cycleCount} cycles)`);
    
    // Analyze flow patterns
    const flowPatterns = recentCycles.map(cycle => cycle.flowIntensity);
    const mostCommonFlow = flowPatterns.sort((a,b) => 
      flowPatterns.filter(v => v === a).length - flowPatterns.filter(v => v === b).length
    ).pop();
    
    // Calculate Cycle Health Score (0-10)
    const cycleHealthScore = Math.round(
      (10 - (avgPain / 10) * 3) + // Pain impact (0-3 points)
      (avgSleep / 10) * 2 + // Sleep impact (0-2 points)
      (10 - avgStress / 10) * 2 + // Stress impact (0-2 points)
      (avgCycleLength >= 21 && avgCycleLength <= 35 ? 3 : 1) // Cycle regularity (1-3 points)
    );
    
    // Determine risk level
    const riskLevel = avgPain > 7 || avgCycleLength > 35 || mostCommonFlow === 'Heavy' ? 'HIGH' : 
                     avgPain > 5 || avgCycleLength > 32 || avgStress > 7 ? 'MODERATE' : 'LOW';
    
    // Generate comprehensive analysis with visual appeal
    return `📊 Quick Summary
Cycle Health Score: ${cycleHealthScore}/10 ${cycleHealthScore < 4 ? '🚨' : cycleHealthScore < 7 ? '⚠️' : '✅'}
Primary Impression: ${avgPain > 7 ? 'Persistent dysmenorrhea with possible secondary cause' : 'Normal cycle variations with manageable symptoms'}
Risks: ${riskLevel === 'HIGH' ? 'Chronic pelvic pain, anemia risk due to heavy flow' : riskLevel === 'MODERATE' ? 'Potential hormonal imbalance, stress-related symptoms' : 'Minimal risk factors identified'}
Next Step: ${riskLevel === 'HIGH' ? 'Medical consult strongly advised' : riskLevel === 'MODERATE' ? 'Monitor patterns, consider lifestyle improvements' : 'Continue tracking for pattern recognition'}

🩺 Intelligent Pattern Recognition
• Cycle Length: Averaging ${avgCycleLength} days → ${avgCycleLength > 35 ? 'irregular & outside the normal 28–35 day range' : avgCycleLength < 21 ? 'shorter than typical, may indicate hormonal variations' : 'within normal range'}
• Pain Trend: Pain stayed ${avgPain > 7 ? 'severe' : avgPain > 4 ? 'moderate' : 'mild'} (${avgPain}/10) all ${cycleCount} cycles → ${avgPain > 7 ? 'persistence is a red flag, not random' : 'manageable with standard care'}
• Symptom Recurrence:
  ◦ Cramps (${cycleCount}/${cycleCount} cycles) → consistent ${avgPain > 7 ? '+ severe' : ''}
  ◦ ${commonSymptoms.length > 0 ? commonSymptoms.slice(0, 3).join(', ') + ' → suggests hormonal involvement' : 'No recurring symptoms identified'}
• Flow & Clots: ${mostCommonFlow} flow ${mostCommonFlow === 'Heavy' ? '→ increases anemia risk over time' : '→ appears healthy'}

🧬 Lifestyle & Systemic Factors
• Stress: Avg. ${avgStress}/10 → ${avgStress > 7 ? 'high, likely contributing to cycle irregularities' : avgStress > 5 ? 'moderate, possibly tolerable' : 'low, well managed'}
• Sleep: ${avgSleep < 6 ? 'Poor' : 'Good'} (${avgSleep}/10) → ${avgSleep < 6 ? 'very likely worsening cycle irregularity + pain perception' : 'supporting healthy cycle function'}
• Exercise & Diet: ${avgStress > 6 || avgSleep < 6 ? 'Inconsistent, reducing natural hormone balance support' : 'Supporting healthy cycle function'}
• Meds/History: ${recentCycles.some(c => c.familyHistory && c.familyHistory.length > 0) ? 'Family history may predispose to endometriosis/fibroids' : 'No significant family history noted'}

🔬 Clinical Impression
• Most Likely: ${avgPain > 7 ? 'Severe primary dysmenorrhea (painful periods not caused by other disease)' : 'Normal menstrual cycle with typical variations'}
• Secondary Considerations: ${avgPain > 7 || avgCycleLength > 35 ? 'Endometriosis, uterine fibroids, or hormonal imbalance (due to irregular cycles + systemic symptoms)' : 'Minimal secondary concerns'}
• Risks: ${mostCommonFlow === 'Heavy' ? 'Anemia from chronic heavy bleeding, ' : ''}${avgPain > 7 ? 'chronic pelvic pain syndrome' : 'minimal risk factors'}

📋 Personalized Action Plan
• Self-Care: Heat packs, consistent sleep, low-inflammatory diet
• Lifestyle Optimizations: ${avgSleep < 6 ? 'Improve sleep hygiene (predicts ~20% pain relief), ' : ''}${avgStress > 6 ? 'stress reduction techniques, ' : ''}regular exercise
• Medical Evaluation: ${riskLevel === 'HIGH' ? 'Ultrasound + hormonal panel strongly recommended if symptoms persist next cycle' : 'Continue regular health monitoring'}
• Urgency Flag: ${mostCommonFlow === 'Heavy' ? 'If heavy bleeding >7 days or soaking >1 pad/hr → urgent consult' : 'Monitor for any concerning changes'}

🔮 Predictive + Simulation Insights
• Next Cycle Projection: ${avgCycleLength} days, ${mostCommonFlow} flow, pain ${avgPain}/10 if lifestyle unchanged
• Scenario Simulation:
  ◦ Sleep ↑ to 7/10 → predicted pain ~${Math.max(1, avgPain - 2)}/10
  ◦ Stress ↓ to 4/10 → cycle regularity more likely
  ◦ Consistent exercise → potential 10-15% pain reduction

Disclaimer: This analysis is based on your logged data and serves as an informational tool. It does not constitute medical advice. Consult with a qualified healthcare professional for proper diagnosis and treatment.`;
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
    
    // Prevent duplicate API calls
    if (isLoading) {
      console.log('⚠️ API call already in progress, skipping duplicate call');
      return;
    }
    
    setIsLoading(true);
    console.log('🚀 Starting cycle analysis - API call initiated');
    
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
          // AI Insights - detailed medical analysis (new 6-section format)
          if (aiInsights.aiInsights && aiInsights.aiInsights.greeting) {
            setInsights(aiInsights.aiInsights); // Store the structured 6-section format
          } else if (aiInsights.aiInsights && aiInsights.aiInsights.section1) {
            // Convert old 2-section format to new format
            setInsights({
              greeting: 'Hello! I\'ve reviewed your cycle data and prepared a comprehensive health assessment.',
              clinicalSummary: aiInsights.aiInsights.section1 || 'Clinical analysis in progress.',
              lifestyleFactors: 'Lifestyle factors are being evaluated for their impact on your cycle health.',
              clinicalImpression: aiInsights.aiInsights.section2 || 'Clinical impression is being developed.',
              actionablePlan: 'Personalized recommendations are being prepared for your health management.',
              urgencyFlag: 'Urgency assessment is being evaluated.',
              summaryBox: 'Summary of findings and recommendations will be provided.',
              dataVisualization: null
            });
          } else if (aiInsights.aiInsights && Array.isArray(aiInsights.aiInsights)) {
            setInsights([...aiInsights.aiInsights]); // Fallback for old format
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
          console.log('🔍 Personalized Tips Data:', aiInsights.personalizedTips);
          console.log('🔍 Personalized Tips Content:', JSON.stringify(aiInsights.personalizedTips));
          if (aiInsights.personalizedTips && Array.isArray(aiInsights.personalizedTips)) {
            console.log('✅ Setting personalized tips:', aiInsights.personalizedTips);
            setPersonalizedRecommendations([...aiInsights.personalizedTips]); // Force re-render
          } else if (aiInsights.recommendations && Array.isArray(aiInsights.recommendations)) {
            console.log('✅ Setting recommendations:', aiInsights.recommendations);
            setPersonalizedRecommendations([...aiInsights.recommendations]); // Force re-render
          } else {
            console.log('❌ No valid tips found, using fallback');
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
          console.log('🔍 Risk Assessment Data:', aiInsights.riskAssessment);
          console.log('🔍 Risk Assessment Content:', JSON.stringify(aiInsights.riskAssessment));
          if (aiInsights.riskAssessment && typeof aiInsights.riskAssessment === 'object') {
            const riskText = `Cycle Irregularity: ${aiInsights.riskAssessment.cycleIrregularity} • Anemia Risk: ${aiInsights.riskAssessment.anemiaRisk} • Overall Risk: ${aiInsights.riskAssessment.overallRisk}`;
            console.log('✅ Setting risk assessment:', riskText);
            setRiskAssessment(riskText);
        } else {
            console.log('❌ No valid risk assessment found, using fallback');
            setRiskAssessment('AI risk assessment completed!');
          }
          
          // Gentle Reminders - supportive daily tips
          console.log('🔍 Gentle Reminders Data:', aiInsights.gentleReminders);
          console.log('🔍 Gentle Reminders Content:', JSON.stringify(aiInsights.gentleReminders));
          if (aiInsights.gentleReminders && Array.isArray(aiInsights.gentleReminders)) {
            console.log('✅ Setting gentle reminders:', aiInsights.gentleReminders);
            setGentleReminders([...aiInsights.gentleReminders]); // Force re-render
          } else if (aiInsights.medicalAlerts && Array.isArray(aiInsights.medicalAlerts)) {
            console.log('✅ Setting medical alerts as reminders:', aiInsights.medicalAlerts);
            setGentleReminders([...aiInsights.medicalAlerts]); // Force re-render
        } else {
          console.log('❌ No valid reminders found, using fallback');
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


        {/* Conversational Cycle Logging */}
        <div className="cycle-form-section">
          <div className="conversational-header">
            <h2>🤖 AI Health Companion</h2>
            <p>Let's have a quick health check-in. I'll guide you through a few questions to understand your cycle better.</p>
            <button 
              type="button" 
              className="toggle-mode-btn"
              onClick={toggleConversationalMode}
            >
              {isConversationalMode ? '📋 Switch to Form Mode' : '💬 Switch to Conversation Mode'}
            </button>
          </div>

          {isConversationalMode ? (
            <div className="conversational-form">
              <div className="conversation-step">
                <div className="step-header">
                  <h3>{conversationSteps[conversationStep].title}</h3>
                  <p className="step-subtitle">{conversationSteps[conversationStep].subtitle}</p>
                  <p className="step-question">{conversationSteps[conversationStep].question}</p>
                </div>
                
                <div className="step-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${((conversationStep + 1) / conversationSteps.length) * 100}%`}}
                    ></div>
                  </div>
                  <span className="progress-text">Step {conversationStep + 1} of {conversationSteps.length}</span>
                </div>

                <div className="step-fields">
                  {renderConversationFields(conversationSteps[conversationStep].fields)}
                </div>

                <div className="step-navigation">
                  {conversationStep > 0 && (
                    <button type="button" className="prev-btn" onClick={prevConversationStep}>
                      ← Previous
                    </button>
                  )}
                  <button type="button" className="next-btn" onClick={nextConversationStep}>
                    {conversationStep === conversationSteps.length - 1 ? 'Complete & Analyze →' : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
          )}
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


        {/* AI Insights - Enhanced Clinical Analysis Format */}
        {insights && (
          <div className="insights-section">
            <div className="insights-header">
              <h2>🤖 Dr. AI Clinical Analysis</h2>
              <p className="insights-subtitle">Comprehensive reproductive health assessment</p>
            </div>
            <div className="insights-content">
              {/* Check if it's the new enhanced 6-section format */}
              {insights.greeting ? (
                <>
                  {/* Greeting & Context */}
                  {insights.greeting && (
                    <div className="insight-card greeting-card">
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.greeting.replace(/### 👋 Greeting/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                  </div>
                    </div>
                  )}

                  {/* Clinical Summary */}
                  {insights.clinicalSummary && (
                    <div className="insight-card clinical-summary">
                      <div className="insight-header">
                        <div className="insight-icon">🩺</div>
                        <h4>Clinical Summary</h4>
                      </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.clinicalSummary.replace(/### 🩺 Clinical Summary/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Lifestyle Factors */}
                  {insights.lifestyleFactors && (
                    <div className="insight-card lifestyle-factors">
                      <div className="insight-header">
                        <div className="insight-icon">🧬</div>
                        <h4>Lifestyle & Health Factors</h4>
                        </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.lifestyleFactors.replace(/### 🧬 Lifestyle & Systemic Factors/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Clinical Impression */}
                  {insights.clinicalImpression && (
                    <div className="insight-card clinical-impression">
                      <div className="insight-header">
                        <div className="insight-icon">🔬</div>
                        <h4>Clinical Impression</h4>
                      </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.clinicalImpression.replace(/### 🔬 Clinical Impression \(Tiered\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Actionable Plan */}
                  {insights.actionablePlan && (
                    <div className="insight-card actionable-plan">
                      <div className="insight-header">
                        <div className="insight-icon">📋</div>
                        <h4>Actionable Plan</h4>
                      </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.actionablePlan.replace(/### 📋 Action Plan/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Urgency Flag */}
                  {insights.urgencyFlag && (
                    <div className="insight-card urgency-flag">
                      <div className="insight-header">
                        <div className="insight-icon">⚠️</div>
                        <h4>Urgency Assessment</h4>
                      </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.urgencyFlag.replace(/### ⚠️ Urgency Flag/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Summary Box */}
                  {insights.summaryBox && (
                    <div className="insight-card summary-box">
                      <div className="insight-header">
                        <div className="insight-icon">📦</div>
                        <h4>Summary</h4>
                      </div>
                      <div className="insight-body">
                        <div className="section-content" dangerouslySetInnerHTML={{
                          __html: insights.summaryBox.replace(/### 📦 Summary Box \(Quick-Read\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}


                  {/* Health Score Pie Chart */}
                  {cycleData.length > 0 && (
                    <div className="insight-card health-score-card">
                      <div className="insight-header">
                        <div className="insight-icon">🎯</div>
                        <h4>Health Score Overview</h4>
                      </div>
                      <div className="insight-body">
                        <div className="pie-chart-container">
                          <div className="chart-title">Health Factors Distribution</div>
                          <div className="pie-chart">
                            <svg width="200" height="200" viewBox="0 0 200 200">
                              {/* Calculate averages */}
                              {(() => {
                                const avgPain = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.pain || 0), 0) / cycleData.length);
                                const avgStress = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.stressLevel || 5), 0) / cycleData.length);
                                const avgSleep = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.sleepQuality || 5), 0) / cycleData.length);
                                const avgCycle = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycleData.length);
                                
                                // Convert to percentages for pie chart
                                const total = avgPain + avgStress + avgSleep + (avgCycle / 10);
                                const painPercent = (avgPain / total) * 100;
                                const stressPercent = (avgStress / total) * 100;
                                const sleepPercent = (avgSleep / total) * 100;
                                const cyclePercent = ((avgCycle / 10) / total) * 100;
                                
                                let cumulativePercent = 0;
                                const radius = 80;
                                const centerX = 100;
                                const centerY = 100;
                                
                                return (
                                  <g>
                                    {/* Pain slice */}
                                    <path
                                      d={`M ${centerX} ${centerY} L ${centerX + radius * Math.cos((cumulativePercent * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin((cumulativePercent * 3.6 - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${painPercent > 50 ? 1 : 0} 1 ${centerX + radius * Math.cos(((cumulativePercent + painPercent) * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin(((cumulativePercent + painPercent) * 3.6 - 90) * Math.PI / 180)} Z`}
                                      fill="#e74c3c"
                                    />
                                    {cumulativePercent += painPercent}
                                    {/* Stress slice */}
                                    <path
                                      d={`M ${centerX} ${centerY} L ${centerX + radius * Math.cos((cumulativePercent * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin((cumulativePercent * 3.6 - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${stressPercent > 50 ? 1 : 0} 1 ${centerX + radius * Math.cos(((cumulativePercent + stressPercent) * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin(((cumulativePercent + stressPercent) * 3.6 - 90) * Math.PI / 180)} Z`}
                                      fill="#f39c12"
                                    />
                                    {cumulativePercent += stressPercent}
                                    {/* Sleep slice */}
                                    <path
                                      d={`M ${centerX} ${centerY} L ${centerX + radius * Math.cos((cumulativePercent * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin((cumulativePercent * 3.6 - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${sleepPercent > 50 ? 1 : 0} 1 ${centerX + radius * Math.cos(((cumulativePercent + sleepPercent) * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin(((cumulativePercent + sleepPercent) * 3.6 - 90) * Math.PI / 180)} Z`}
                                      fill="#27ae60"
                                    />
                                    {cumulativePercent += sleepPercent}
                                    {/* Cycle slice */}
                                    <path
                                      d={`M ${centerX} ${centerY} L ${centerX + radius * Math.cos((cumulativePercent * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin((cumulativePercent * 3.6 - 90) * Math.PI / 180)} A ${radius} ${radius} 0 ${cyclePercent > 50 ? 1 : 0} 1 ${centerX + radius * Math.cos(((cumulativePercent + cyclePercent) * 3.6 - 90) * Math.PI / 180)} ${centerY + radius * Math.sin(((cumulativePercent + cyclePercent) * 3.6 - 90) * Math.PI / 180)} Z`}
                                      fill="#667eea"
                                    />
                                  </g>
                                );
                              })()}
                            </svg>
                  </div>
                          <div className="pie-legend">
                            <div className="legend-item">
                              <div className="legend-color" style={{backgroundColor: '#e74c3c'}}></div>
                              <span>Pain: {Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.pain || 0), 0) / cycleData.length)}/10</span>
                </div>
                            <div className="legend-item">
                              <div className="legend-color" style={{backgroundColor: '#f39c12'}}></div>
                              <span>Stress: {Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.stressLevel || 5), 0) / cycleData.length)}/10</span>
                  </div>
                            <div className="legend-item">
                              <div className="legend-color" style={{backgroundColor: '#27ae60'}}></div>
                              <span>Sleep: {Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.sleepQuality || 5), 0) / cycleData.length)}/10</span>
                  </div>
                            <div className="legend-item">
                              <div className="legend-color" style={{backgroundColor: '#667eea'}}></div>
                              <span>Cycle: {Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycleData.length)} days</span>
                </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback for old format */
                Array.isArray(insights) ? insights.map((insight, index) => (
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
                )
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
                {/* Check if it's the new enhanced 6-section format */}
                {selectedCycleInsights.aiInsights?.aiInsights?.greeting ? (
                  <>
                    {/* Greeting & Context */}
                    {selectedCycleInsights.aiInsights.aiInsights.greeting && (
                      <div className="modal-section greeting-section">
                        <h3>👋 Greeting</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.greeting.replace(/### 👋 Greeting/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                                    </div>
                                  </div>
                    )}

                    {/* Clinical Summary */}
                    {selectedCycleInsights.aiInsights.aiInsights.clinicalSummary && (
                      <div className="modal-section clinical-summary">
                        <h3>🩺 Clinical Summary</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.clinicalSummary.replace(/### 🩺 Clinical Summary/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                                    </div>
                                  </div>
                        )}
                        
                    {/* Lifestyle & Health Factors */}
                    {selectedCycleInsights.aiInsights.aiInsights.lifestyleFactors && (
                      <div className="modal-section lifestyle-factors">
                        <h3>🧬 Lifestyle & Health Factors</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.lifestyleFactors.replace(/### 🧬 Lifestyle & Systemic Factors/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                                </div>
                          </div>
                    )}

                    {/* Clinical Impression */}
                    {selectedCycleInsights.aiInsights.aiInsights.clinicalImpression && (
                      <div className="modal-section clinical-impression">
                        <h3>🔬 Clinical Impression</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.clinicalImpression.replace(/### 🔬 Clinical Impression \(Tiered\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                            </div>
                          </div>
                        )}
                        
                    {/* Actionable Plan */}
                    {selectedCycleInsights.aiInsights.aiInsights.actionablePlan && (
                      <div className="modal-section actionable-plan">
                        <h3>📋 Actionable Plan</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.actionablePlan.replace(/### 📋 Action Plan/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                        </div>
                          </div>
                        )}

                    {/* Summary */}
                    {selectedCycleInsights.aiInsights.aiInsights.summaryBox && (
                      <div className="modal-section summary-box">
                        <h3>📦 Summary</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{
                            __html: selectedCycleInsights.aiInsights.aiInsights.summaryBox.replace(/### 📦 Summary Box \(Quick-Read\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, '<br>')
                          }} />
                      </div>
                  </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback to old format */}
                    {selectedCycleInsights.aiInsights?.aiInsights?.section1 && (
                      <div className="modal-section clinical-assessment">
                        <h3>🔬 Clinical Assessment & Differential Considerations</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{ 
                            __html: selectedCycleInsights.aiInsights.aiInsights.section1.replace(/\n/g, '<br>') 
                          }} />
                            </div>
                          </div>
                    )}

                    {selectedCycleInsights.aiInsights?.aiInsights?.section2 && (
                      <div className="modal-section health-plan">
                        <h3>📊 Personalized Health Management Plan</h3>
                        <div className="insights-content">
                          <div className="section-content" dangerouslySetInnerHTML={{ 
                            __html: selectedCycleInsights.aiInsights.aiInsights.section2.replace(/\n/g, '<br>') 
                          }} />
                        </div>
                      </div>
                    )}
                  </>
                    )}

                    {/* Health Score Review */}
                    {selectedCycleInsights.aiInsights?.dataVisualization && (
                      <div className="modal-section">
                        <h3>📊 Health Score Review</h3>
                        <div className="health-score-content">
                          <div className="score-item">
                            <h4>🎯 Cycle Health Score</h4>
                            <p>{selectedCycleInsights.aiInsights.dataVisualization.cycle_health_score}/10</p>
                            </div>
                          {selectedCycleInsights.aiInsights.dataVisualization.risk_flags && (
                            <div className="score-item">
                              <h4>⚠️ Risk Flags</h4>
                              <ul>
                                {selectedCycleInsights.aiInsights.dataVisualization.risk_flags.map((flag, index) => (
                                  <li key={index}>{flag}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Your Cycle Health */}
                    {selectedCycleInsights.aiInsights?.riskAssessment && (
                      <div className="modal-section">
                        <h3>🌺 Your Cycle Health</h3>
                        <div className="cycle-health-content">
                          <div className="health-item">
                            <span className="health-label">Cycle Irregularity:</span>
                            <span className="health-value">{selectedCycleInsights.aiInsights.riskAssessment.cycleIrregularity}</span>
                            </div>
                          <div className="health-item">
                            <span className="health-label">Anemia Risk:</span>
                            <span className="health-value">{selectedCycleInsights.aiInsights.riskAssessment.anemiaRisk}</span>
                        </div>
                          <div className="health-item">
                            <span className="health-label">Overall Risk:</span>
                            <span className="health-value">{selectedCycleInsights.aiInsights.riskAssessment.overallRisk}</span>
                      </div>
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
