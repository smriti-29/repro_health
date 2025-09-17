import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AFABAIService from '../ai/afabAIService.js';
import './FertilityTracking.css';

const FertilityTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AFABAIService());
  
  // MEDICAL-GRADE Fertility tracking form state
  const [fertilityForm, setFertilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    
    // FERTILITY GOAL DETECTION (CRITICAL)
    fertilityGoal: '', // 'ttc', 'nfp', 'health_monitoring', 'cycle_awareness'
    conceptionTimeline: '', // 'immediately', 'within_6_months', 'within_1_year', 'future', 'not_applicable'
    previousPregnancies: 0, // number of previous pregnancies
    previousMiscarriages: 0, // number of previous miscarriages
    fertilityTreatments: [], // array of fertility treatments tried
    contraceptionPreference: 'none', // 'none', 'condom', 'withdrawal', 'other'
    
    // Basal Body Temperature (BBT) - Critical for ovulation detection
    bbt: '',
    bbtTime: '',
    bbtMethod: 'oral', // oral, vaginal, rectal
    
    // Cervical Mucus - Primary fertility indicator
    cervicalMucus: 'none',
    mucusAmount: 'none', // none, scant, moderate, abundant
    mucusStretch: 0, // 0-10 cm stretchability
    mucusColor: 'clear', // clear, white, yellow, brown, pink
    
    // Cervical Position & Texture - Secondary fertility indicator
    cervicalPosition: 'low', // low, medium, high
    cervicalTexture: 'firm', // firm, medium, soft
    cervicalOpenness: 'closed', // closed, slightly-open, open
    
    // Ovulation Predictor Kit (OPK) Results
    ovulationTest: 'not-tested',
    lhLevel: '', // LH level if testing
    testTime: '',
    testBrand: '',
    
    // Progesterone Testing (if available)
    progesteroneLevel: '',
    progesteroneTestDate: '',
    
    // Intercourse & Conception Tracking
    intercourse: false,
    intercourseTime: '',
    contraception: 'none', // none, condom, pill, iud, etc.
    pregnancyTest: 'not-tested',
    pregnancyTestResult: '',
    
    // Advanced Fertility Indicators
    libido: 5, // 1-10 scale
    energy: 5, // 1-10 scale
    mood: 5, // 1-10 scale
    sleep: 5, // 1-10 scale
    stress: 5, // 1-10 scale
    
    // Medical & Lifestyle Factors
    medications: [],
    supplements: [],
    exercise: 'none', // none, light, moderate, intense
    alcohol: 'none', // none, light, moderate, heavy
    smoking: 'none', // none, light, moderate, heavy
    caffeine: 0, // cups per day
    
    // Comprehensive Health Assessment (New)
    weight: '',
    bloodPressure: '',
    stressLevel: 5, // 1-10 scale
    sleepQuality: 5, // 1-10 scale
    exerciseFrequency: 'moderate', // none, light, moderate, intense
    dietQuality: 'good', // poor, fair, good, excellent
    medicationUse: [],
    familyHistory: [],
    
    // Symptoms & Observations
    symptoms: [],
    notes: '',
    
    // Cycle Day Tracking
    cycleDay: 1,
    daysSincePeriod: 0,
    expectedOvulation: '',
    expectedPeriod: ''
  });

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

  // MEDICAL-GRADE Fertility data and insights
  const [fertilityData, setFertilityData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // AI-Powered Fertility Intelligence (using saved data like cycle tracking)
  const [selectedFertilityInsights, setSelectedFertilityInsights] = useState(null);
  
  // 3-Cycle Analysis Feature (like Cycle Tracking)
  const [threeCycleAnalysis, setThreeCycleAnalysis] = useState(null);
  const [showThreeCycleAnalysis, setShowThreeCycleAnalysis] = useState(false);
  const [savedThreeCycleAnalysis, setSavedThreeCycleAnalysis] = useState(null);
  const [selectedThreeCycleAnalysis, setSelectedThreeCycleAnalysis] = useState(null);
  
  // Dual-Mode Interface State
  const [trackingMode, setTrackingMode] = useState('beginner'); // 'beginner' or 'advanced'
  const [showAdvancedOnboarding, setShowAdvancedOnboarding] = useState(false);
  
  // Fertility Predictions State
  const [fertilityPredictions, setFertilityPredictions] = useState(null);
  
  // Advanced Fertility Analytics
  const [bbtChart, setBbtChart] = useState([]);
  const [mucusPattern, setMucusPattern] = useState(null);
  const [cervicalChanges, setCervicalChanges] = useState([]);
  const [ovulationHistory, setOvulationHistory] = useState([]);
  const [lutealPhaseLength, setLutealPhaseLength] = useState(null);
  const [cycleRegularity, setCycleRegularity] = useState(null);

  // MEDICAL-RELEVANT Fertility symptoms (what doctors actually ask)
  const availableSymptoms = [
    // Primary Fertility Indicators (Essential)
    'Basal body temperature rise',
    'Cervical mucus changes',
    'Cervical position changes',
    'LH surge detected',
    'Ovulation pain (mittelschmerz)',
    
    // Secondary Fertility Signs (Important)
    'Breast tenderness',
    'Increased libido',
    'Vaginal discharge changes',
    
    // Physical Symptoms (Relevant)
    'Bloating',
    'Cramping',
    'Abdominal pain',
    'Spotting',
    'Light bleeding',
    
    // Hormonal Symptoms (Medical)
    'Mood swings',
    'Increased energy',
    'Headaches',
    'Nausea'
  ];

  // Family History Options (Medical-Grade)
  const familyHistoryOptions = [
    'PCOS', 'Endometriosis', 'Fibroids', 'Ovarian cysts',
    'Irregular periods', 'Heavy periods', 'Early menopause',
    'Breast cancer', 'Ovarian cancer', 'Diabetes', 'Thyroid disorders',
    'Infertility', 'Miscarriage', 'Genetic conditions'
  ];

  // Fertility Goal Options (CRITICAL)
  const fertilityGoalOptions = [
    { value: 'ttc', label: 'Trying to Conceive', description: 'Actively trying to get pregnant' },
    { value: 'nfp', label: 'Natural Family Planning', description: 'Avoiding pregnancy naturally' },
    { value: 'health_monitoring', label: 'Health Monitoring', description: 'Tracking for health awareness' },
    { value: 'cycle_awareness', label: 'Cycle Awareness', description: 'Understanding your cycle patterns' }
  ];

  // Conception Timeline Options
  const conceptionTimelineOptions = [
    { value: 'immediately', label: 'Immediately', description: 'Trying to conceive right now' },
    { value: 'within_6_months', label: 'Within 6 months', description: 'Planning to conceive soon' },
    { value: 'within_1_year', label: 'Within 1 year', description: 'Planning to conceive this year' },
    { value: 'future', label: 'Future planning', description: 'Planning for future conception' },
    { value: 'not_applicable', label: 'Not applicable', description: 'Not trying to conceive' }
  ];

  // Fertility Treatment Options
  const fertilityTreatmentOptions = [
    'Clomid', 'Letrozole', 'IUI', 'IVF', 'ICSI', 'Donor eggs', 'Surrogacy',
    'Fertility acupuncture', 'Fertility massage', 'Other treatments'
  ];

  // Load existing fertility data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFertilityData(parsed);
      
      // Calculate fertility predictions
      const predictions = calculateFertilityPredictions(parsed);
      setFertilityPredictions(predictions);
    }
    
    // Load saved 3-cycle analysis
    const savedAnalysis = localStorage.getItem(`afabFertilityThreeCycleAnalysis_${user?.id || user?.email || 'anonymous'}`);
    if (savedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(savedAnalysis);
        setSavedThreeCycleAnalysis(parsedAnalysis);
      } catch (error) {
        console.error('Error loading 3-cycle fertility analysis:', error);
      }
    }
  }, []);

  const handleFamilyHistoryToggle = (condition) => {
    setFertilityForm(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.includes(condition)
        ? prev.familyHistory.filter(c => c !== condition)
        : [...prev.familyHistory, condition]
    }));
  };

  const handleFertilityTreatmentToggle = (treatment) => {
    setFertilityForm(prev => ({
      ...prev,
      fertilityTreatments: prev.fertilityTreatments.includes(treatment)
        ? prev.fertilityTreatments.filter(t => t !== treatment)
        : [...prev.fertilityTreatments, treatment]
    }));
  };

  const calculateFertilityPredictions = (data) => {
    // Get cycle data for prediction
    const cycleData = localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`);
    if (!cycleData) return null;
    
    const cycles = JSON.parse(cycleData);
    if (cycles.length === 0) return null;
    
    // Sort cycles by cycleStartDate (chronologically) to find the most recent cycle
    const sortedCycles = cycles.sort((a, b) => {
      const dateA = new Date(a.cycleStartDate || a.lastPeriod);
      const dateB = new Date(b.cycleStartDate || b.lastPeriod);
      return dateB - dateA; // Most recent first
    });
    
    // Use the chronologically latest cycle (first in sorted array)
    const latestCycle = sortedCycles[0];
    const lastPeriod = new Date(latestCycle.lastPeriod);
    const cycleLength = latestCycle.cycleLength || 28;
    
    console.log('🔄 Using chronologically latest cycle for predictions:', {
      cycleStartDate: latestCycle.cycleStartDate || latestCycle.lastPeriod,
      cycleLength: cycleLength,
      lastPeriod: lastPeriod.toISOString().split('T')[0]
    });
    
    // Calculate ovulation (typically 14 days before next period)
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    // Calculate fertile window (5 days before ovulation + 1 day after)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    return {
      predictedOvulation: ovulationDate,
      fertileWindow: {
        start: fertileStart,
        end: fertileEnd
      },
      nextPeriod: nextPeriod,
      cycleLength: cycleLength,
      sourceCycle: {
        startDate: latestCycle.cycleStartDate || latestCycle.lastPeriod,
        cycleLength: cycleLength,
        lastPeriod: lastPeriod.toISOString().split('T')[0]
      }
    };
  };

  const handleSymptomToggle = (symptom) => {
    setFertilityForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  // Mode switching functions
  const switchToAdvancedMode = () => {
    setTrackingMode('advanced');
    setShowAdvancedOnboarding(true);
  };

  const switchToBeginnerMode = () => {
    setTrackingMode('beginner');
  };

  const closeAdvancedOnboarding = () => {
    setShowAdvancedOnboarding(false);
  };

  // 3-Cycle Analysis Function (like Cycle Tracking)
  const generateThreeCycleAnalysis = async () => {
    if (fertilityData.length < 3) {
      alert('Please log at least 3 fertility entries to get comprehensive analysis!');
      return;
    }

    try {
      setIsLoading(true);
      const recentEntries = fertilityData.slice(-3); // Get last 3 entries
      
      const analysisPrompt = `As an AI healthcare assistant, provide comprehensive 3-cycle fertility analysis:

RECENT 3 FERTILITY ENTRIES:
${recentEntries.map((entry, index) => `
Entry ${index + 1}:
- Date: ${entry.date}
- Fertility Goal: ${entry.fertilityGoal || 'Not specified'}
- Conception Timeline: ${entry.conceptionTimeline || 'Not specified'}
- Previous Pregnancies: ${entry.previousPregnancies || 0}
- Previous Miscarriages: ${entry.previousMiscarriages || 0}
- Fertility Treatments: ${entry.fertilityTreatments?.join(', ') || 'None'}
- BBT: ${entry.bbt}°F
- Mucus: ${entry.cervicalMucus} (${entry.mucusAmount}, ${entry.mucusStretch}cm stretch)
- Cervical Position: ${entry.cervicalPosition} (${entry.cervicalTexture}, ${entry.cervicalOpenness})
- Ovulation Test: ${entry.ovulationTest}
- Libido: ${entry.libido}/10
- Symptoms: ${entry.symptoms?.join(', ') || 'None'}
- Stress: ${entry.stressLevel || 5}/10
- Sleep: ${entry.sleepQuality || 5}/10
- Family History: ${entry.familyHistory?.join(', ') || 'None'}
- Tracking Mode: ${entry.trackingMode || 'beginner'}
`).join('')}

Provide comprehensive fertility analysis including:
1. **INTELLIGENT FERTILITY PATTERN ANALYSIS**: 
   - BBT pattern trends and ovulation detection
   - Cervical mucus consistency and fertility indicators
   - Cervical position and texture changes
   - Ovulation test result patterns
   - Cycle regularity and timing

2. **PERSONALIZED FERTILITY INSIGHTS**: 
   - What your specific patterns reveal about your fertility
   - How your family history affects your fertility
   - Lifestyle factors impacting your fertility
   - Conception optimization strategies

3. **CONTEXTUAL FERTILITY ASSESSMENT**: 
   - Any concerning patterns based on your specific data
   - Fertility window accuracy and timing
   - Red flags to watch for
   - When to seek medical consultation

4. **INTELLIGENT FERTILITY RECOMMENDATIONS**: 
   - Specific actions based on your 3-entry data
   - Lifestyle changes tailored to your fertility patterns
   - Medical considerations based on your family history
   - Conception timing optimization

5. **PREDICTIVE FERTILITY INSIGHTS**: 
   - What to expect in upcoming cycles based on your patterns
   - Optimal timing for conception attempts
   - Fertility window predictions
   - Cycle awareness improvements

6. **PERSONALIZED MEDICAL GUIDANCE**: 
   - When to consult fertility specialist based on your specific patterns
   - What to discuss with your healthcare provider
   - Fertility optimization strategies

Format as detailed medical analysis with clear sections and bullet points. Make it feel like a comprehensive fertility consultation.`;

      const analysis = await aiService.generateHealthInsights(analysisPrompt);
      
      // Save 3-cycle analysis to localStorage
      const analysisData = {
        analysis: analysis,
        timestamp: new Date().toISOString(),
        entriesAnalyzed: recentEntries.length,
        entryDates: recentEntries.map(entry => entry.date)
      };
      setSavedThreeCycleAnalysis(analysisData);
      const storageKey = `afabFertilityThreeCycleAnalysis_${user?.id || user?.email || 'anonymous'}`;
      localStorage.setItem(storageKey, JSON.stringify(analysisData));
      
      // Show the analysis in modal
      setSelectedThreeCycleAnalysis(analysisData);
    } catch (error) {
      console.error('Error generating 3-cycle fertility analysis:', error);
      alert('Error generating analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete fertility entry
  const deleteFertilityEntry = (index) => {
    if (window.confirm('Are you sure you want to delete this fertility entry?')) {
      const updatedData = fertilityData.filter((_, i) => i !== index);
      setFertilityData(updatedData);
      localStorage.setItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
      
      // Recalculate predictions
      const predictions = calculateFertilityPredictions(updatedData);
      setFertilityPredictions(predictions);
    }
  };

  // Clear all fertility history
  const clearAllFertilityHistory = () => {
    if (window.confirm('Are you sure you want to delete ALL fertility history? This cannot be undone.')) {
      setFertilityData([]);
      localStorage.removeItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`);
      setFertilityPredictions(null);
      // AI insights are now stored with each entry
    }
  };

  const handleFertilityLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Calculate cycle day and fertility metrics
      const cycleData = localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`);
      let cycleDay = 1;
      let daysSincePeriod = 0;
      
      if (cycleData) {
        const cycles = JSON.parse(cycleData);
        if (cycles.length > 0) {
          const latestCycle = cycles[cycles.length - 1];
          const lastPeriod = new Date(latestCycle.lastPeriod);
          const today = new Date(fertilityForm.date);
          daysSincePeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
          cycleDay = daysSincePeriod + 1;
        }
      }
      
      const fertilityEntry = {
        ...fertilityForm,
        cycleDay,
        daysSincePeriod,
        timestamp: new Date().toISOString(),
        moduleType: 'fertility',
        userId: user?.id,
        trackingMode // Include the tracking mode used
      };
      
      // Save to localStorage
      const updatedData = [...fertilityData, fertilityEntry];
      setFertilityData(updatedData);
      localStorage.setItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
      
      // Recalculate fertility predictions
      const predictions = calculateFertilityPredictions(updatedData);
      setFertilityPredictions(predictions);
      
      // Generate MEDICAL-GRADE AI fertility insights
      console.log('🚀 Generating REAL AI fertility insights...');
      
      try {
        const userProfile = {
          ...user,
          age: calculateAge(user?.dateOfBirth),
          conditions: { reproductive: [] },
          familyHistory: { womensConditions: [] },
          lifestyle: { exercise: { frequency: 'Moderate' }, stress: { level: 'Moderate' } },
          tobaccoUse: 'No'
        };
        
        console.log('🤖 Calling AI service for fertility analysis (Gemini → Ollama fallback)...');
        console.log('🔍 AI Service status:', aiService.getServiceStatus ? aiService.getServiceStatus() : 'No status method');
        console.log('🔍 User profile:', userProfile);
        console.log('🔍 Fertility data length:', updatedData.length);
        console.log('🔍 Latest fertility entry:', updatedData[updatedData.length - 1]);
        
        const aiInsights = await Promise.race([
          aiService.generateFertilityInsights(updatedData, userProfile),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI request timeout after 25 seconds')), 25000)
          )
        ]);
        
        console.log('✅ REAL AI Fertility Insights received:', aiInsights);
        console.log('🔍 AI Insights type:', typeof aiInsights);
        console.log('🔍 AI Insights keys:', aiInsights ? Object.keys(aiInsights) : 'No keys');
        console.log('🔍 AI Insights content:', JSON.stringify(aiInsights, null, 2));
        
        // Set all the comprehensive AI fertility insights (same structure as cycle tracking)
        if (aiInsights) {
          // AI Insights - detailed medical analysis
          // AI insights are now saved directly to the fertility entry

          // Store AI insights with the fertility data (same as Cycle Tracking)
          const fertilityWithInsights = {
            ...updatedData[updatedData.length - 1],
            aiInsights: aiInsights,
            fertilityInsights: aiInsights?.aiInsights || null,
            fertilityPatterns: aiInsights?.quickCheck || null,
            personalizedRecommendations: aiInsights?.recommendations || null,
            riskAssessment: aiInsights?.riskAssessment || null,
            gentleReminders: aiInsights?.gentleReminders || null,
            insightsTimestamp: new Date().toISOString()
          };
          
          // Update the fertility data with AI insights
          const updatedFertilityData = [...updatedData];
          updatedFertilityData[updatedFertilityData.length - 1] = fertilityWithInsights;
          setFertilityData(updatedFertilityData);
          localStorage.setItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedFertilityData));
          
          // All AI insights are now saved with the fertility entry
        }
        
      } catch (error) {
        console.error('❌ All AI services failed:', error);
        
        // AI insights are now stored with each entry, no fallback needed
      }
      
      // Calculate advanced fertility analytics
      calculateAdvancedFertilityAnalytics(updatedData);
      
      // Reset form for next entry (keep goal data, reset daily data)
      setFertilityForm({
        date: new Date().toISOString().split('T')[0],
        
        // Keep fertility goal data (don't reset)
        fertilityGoal: fertilityForm.fertilityGoal,
        conceptionTimeline: fertilityForm.conceptionTimeline,
        previousPregnancies: fertilityForm.previousPregnancies,
        previousMiscarriages: fertilityForm.previousMiscarriages,
        fertilityTreatments: fertilityForm.fertilityTreatments,
        contraceptionPreference: fertilityForm.contraceptionPreference,
        
        // Reset daily tracking data
        bbt: '',
        bbtTime: '',
        bbtMethod: 'oral',
        cervicalMucus: 'none',
        mucusAmount: 'none',
        mucusStretch: 0,
        mucusColor: 'clear',
        cervicalPosition: 'low',
        cervicalTexture: 'firm',
        cervicalOpenness: 'closed',
        ovulationTest: 'not-tested',
        lhLevel: '',
        testTime: '',
        testBrand: '',
        progesteroneLevel: '',
        progesteroneTestDate: '',
        intercourse: false,
        intercourseTime: '',
        contraception: 'none',
        pregnancyTest: 'not-tested',
        pregnancyTestResult: '',
        libido: 5,
        energy: 5,
        mood: 5,
        sleep: 5,
        stress: 5,
        medications: [],
        supplements: [],
        exercise: 'none',
        alcohol: 'none',
        smoking: 'none',
        caffeine: 0,
        weight: '',
        bloodPressure: '',
        stressLevel: 5,
        sleepQuality: 5,
        exerciseFrequency: 'moderate',
        dietQuality: 'good',
        medicationUse: [],
        familyHistory: [],
        symptoms: [],
        notes: '',
        cycleDay: 1,
        daysSincePeriod: 0,
        expectedOvulation: '',
        expectedPeriod: ''
      });
      
      console.log('🎉 REAL AI fertility insights displayed successfully!');
      
    } catch (error) {
      console.error('❌ All AI services failed:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // AI insights are now stored with each entry, no fallback needed
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced Fertility Analytics
  const calculateAdvancedFertilityAnalytics = (data) => {
    if (data.length < 3) return;
    
    // BBT Chart Analysis
    const bbtData = data.filter(entry => entry.bbt).map(entry => ({
      date: entry.date,
      temperature: parseFloat(entry.bbt),
      cycleDay: entry.cycleDay
    }));
    setBbtChart(bbtData);
    
    // Mucus Pattern Analysis
    const mucusData = data.map(entry => ({
      date: entry.date,
      type: entry.cervicalMucus,
      amount: entry.mucusAmount,
      stretch: entry.mucusStretch,
      color: entry.mucusColor
    }));
    setMucusPattern(mucusData);
    
    // Cervical Changes Analysis
    const cervicalData = data.map(entry => ({
      date: entry.date,
      position: entry.cervicalPosition,
      texture: entry.cervicalTexture,
      openness: entry.cervicalOpenness
    }));
    setCervicalChanges(cervicalData);
    
    // Ovulation History
    const ovulationData = data.filter(entry => 
      entry.ovulationTest === 'positive' || 
      entry.ovulationTest === 'peak' ||
      entry.symptoms.includes('LH surge detected')
    );
    setOvulationHistory(ovulationData);
    
    // Calculate Luteal Phase Length
    if (ovulationData.length > 0 && bbtData.length > 0) {
      const avgLutealPhase = 14; // Default, will be calculated from BBT
      setLutealPhaseLength(avgLutealPhase);
    }
    
    // Cycle Regularity Analysis
    const cycleLengths = [];
    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i-1].date);
      const currDate = new Date(data[i].date);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) cycleLengths.push(diffDays);
    }
    
    if (cycleLengths.length > 0) {
      const avgCycle = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
      const variance = cycleLengths.map(length => Math.pow(length - avgCycle, 2));
      const stdDev = Math.sqrt(variance.reduce((a, b) => a + b, 0) / variance.length);
      
      setCycleRegularity({
        average: avgCycle,
        standardDeviation: stdDev,
        isRegular: stdDev <= 7
      });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCervicalMucusDescription = (type) => {
    const descriptions = {
      'none': 'No mucus present',
      'dry': 'Dry, no mucus',
      'sticky': 'Sticky, thick, white/yellow',
      'creamy': 'Creamy, lotion-like',
      'watery': 'Watery, clear',
      'egg-white': 'Clear, stretchy, like egg white'
    };
    return descriptions[type] || type;
  };

  const getCervicalPositionDescription = (position) => {
    const descriptions = {
      'low': 'Low, firm, closed',
      'medium': 'Medium height, slightly soft',
      'high': 'High, soft, open'
    };
    return descriptions[position] || position;
  };

  return (
    <div className="fertility-tracking-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>👶 Fertility Tracker</h1>
        <p>Track your fertility signs and optimize your conception journey</p>
      </div>

      <div className="fertility-content">
        {/* Fertility Overview */}
        <div className="fertility-overview">
          <div className="overview-card">
            <h3>🥚 Predicted Ovulation</h3>
            <p className="date-display">
              {fertilityPredictions ? formatDate(fertilityPredictions.predictedOvulation) : 'Log cycle data to predict'}
            </p>
            {fertilityPredictions && (
              <small className="prediction-note">
                Based on {fertilityPredictions.cycleLength}-day cycle from {new Date(fertilityPredictions.sourceCycle.startDate).toLocaleDateString()}
              </small>
            )}
          </div>
          
          <div className="overview-card">
            <h3>💕 Fertile Window</h3>
            <p className="date-display">
              {fertilityPredictions ? 
                `${formatDate(fertilityPredictions.fertileWindow.start)} - ${formatDate(fertilityPredictions.fertileWindow.end)}` : 
                'Log cycle data to predict'
              }
            </p>
            {fertilityPredictions && (
              <small className="prediction-note">
                6-day window for conception
              </small>
            )}
          </div>
          
          <div className="overview-card">
            <h3>📊 Tracking History</h3>
            <p className="count-display">{fertilityData.length} entries logged</p>
            {fertilityData.length > 0 && (
              <small className="prediction-note">
                Last entry: {new Date(fertilityData[fertilityData.length - 1].timestamp).toLocaleDateString()}
              </small>
            )}
            {fertilityData.length >= 3 && (
              <div className="analysis-buttons">
                <button 
                  className="three-cycle-btn"
                  onClick={generateThreeCycleAnalysis}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Analyzing...' : '🔬 Get 3-Entry Analysis'}
                </button>
                {savedThreeCycleAnalysis ? (
                  <button 
                    className="view-saved-analysis-btn"
                    onClick={() => {
                      setSelectedThreeCycleAnalysis(savedThreeCycleAnalysis);
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
        </div>

        {/* Fertility Logging Form - Dual Mode Interface */}
        <div className="fertility-form-section">
          <div className="form-header">
            <h2>Log Your Fertility Data</h2>
            <div className="mode-switcher">
              <div className="mode-buttons">
                <button 
                  type="button"
                  className={`mode-btn ${trackingMode === 'beginner' ? 'active' : ''}`}
                  onClick={switchToBeginnerMode}
                >
                  🌱 Beginner
                </button>
                <button 
                  type="button"
                  className={`mode-btn ${trackingMode === 'advanced' ? 'active' : ''}`}
                  onClick={switchToAdvancedMode}
                >
                  🔬 Advanced
                </button>
              </div>
              {trackingMode === 'beginner' && (
                <button 
                  type="button"
                  className="learn-more-btn"
                  onClick={switchToAdvancedMode}
                >
                  Learn More About Advanced Tracking
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleFertilityLog} className="fertility-form">
            {/* FERTILITY GOAL DETECTION - CRITICAL SECTION */}
            <div className="fertility-goal-section">
              <h3>🎯 Your Fertility Goal</h3>
              <p className="section-description">This helps AI provide personalized, medically accurate guidance</p>
              
              <div className="form-group">
                <label>What is your primary fertility goal? *</label>
                <div className="goal-options">
                  {fertilityGoalOptions.map(goal => (
                    <label key={goal.value} className="goal-option">
                      <input
                        type="radio"
                        name="fertilityGoal"
                        value={goal.value}
                        checked={fertilityForm.fertilityGoal === goal.value}
                        onChange={(e) => setFertilityForm({...fertilityForm, fertilityGoal: e.target.value})}
                        required
                      />
                      <div className="goal-content">
                        <div className="goal-label">{goal.label}</div>
                        <div className="goal-description">{goal.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conception Timeline - Show only for TTC users */}
              {fertilityForm.fertilityGoal === 'ttc' && (
                <div className="form-group">
                  <label>When are you planning to conceive? *</label>
                  <div className="timeline-options">
                    {conceptionTimelineOptions.map(timeline => (
                      <label key={timeline.value} className="timeline-option">
                        <input
                          type="radio"
                          name="conceptionTimeline"
                          value={timeline.value}
                          checked={fertilityForm.conceptionTimeline === timeline.value}
                          onChange={(e) => setFertilityForm({...fertilityForm, conceptionTimeline: e.target.value})}
                          required
                        />
                        <div className="timeline-content">
                          <div className="timeline-label">{timeline.label}</div>
                          <div className="timeline-description">{timeline.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Pregnancy History */}
              <div className="form-row">
                <div className="form-group">
                  <label>Previous Pregnancies</label>
                  <input
                    type="number"
                    min="0"
                    value={fertilityForm.previousPregnancies}
                    onChange={(e) => setFertilityForm({...fertilityForm, previousPregnancies: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Previous Miscarriages</label>
                  <input
                    type="number"
                    min="0"
                    value={fertilityForm.previousMiscarriages}
                    onChange={(e) => setFertilityForm({...fertilityForm, previousMiscarriages: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Fertility Treatments */}
              <div className="form-group">
                <label>Fertility Treatments (Select all that apply)</label>
                <div className="treatment-grid">
                  {fertilityTreatmentOptions.map(treatment => (
                    <label key={treatment} className="treatment-option">
                      <input
                        type="checkbox"
                        checked={fertilityForm.fertilityTreatments.includes(treatment)}
                        onChange={() => handleFertilityTreatmentToggle(treatment)}
                      />
                      <span className="treatment-label">{treatment}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contraception Preference */}
              <div className="form-group">
                <label>Current Contraception Method</label>
                <select
                  value={fertilityForm.contraceptionPreference}
                  onChange={(e) => setFertilityForm({...fertilityForm, contraceptionPreference: e.target.value})}
                >
                  <option value="none">None</option>
                  <option value="condom">Condom</option>
                  <option value="withdrawal">Withdrawal method</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Common Fields - Always Visible */}
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={fertilityForm.date}
                  onChange={(e) => setFertilityForm({...fertilityForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  Basal Body Temperature (°F)
                  <span className="info-icon" title="Take your temperature first thing in the morning, before getting out of bed">ℹ️</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fertilityForm.bbt}
                  onChange={(e) => setFertilityForm({...fertilityForm, bbt: e.target.value})}
                  placeholder="e.g., 98.6"
                />
                <small>Take temperature first thing in the morning</small>
              </div>
            </div>

            {/* Beginner Mode Fields */}
            {trackingMode === 'beginner' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Ovulation Test Result
                      <span className="info-icon" title="Use an ovulation predictor kit (OPK) to detect LH surge">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.ovulationTest}
                      onChange={(e) => setFertilityForm({...fertilityForm, ovulationTest: e.target.value})}
                    >
                      <option value="not-tested">Not Tested</option>
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="peak">Peak (LH Surge)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Libido Level: {fertilityForm.libido}/10
                      <span className="info-icon" title="Rate your sexual desire and energy level">ℹ️</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fertilityForm.libido}
                      onChange={(e) => setFertilityForm({...fertilityForm, libido: parseInt(e.target.value)})}
                      className="libido-slider"
                    />
                    <div className="slider-labels">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Advanced Mode Fields */}
            {trackingMode === 'advanced' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Cervical Mucus (Advanced)
                      <span className="info-icon" title="Detailed cervical mucus observation including amount, stretch, and color">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.cervicalMucus}
                      onChange={(e) => setFertilityForm({...fertilityForm, cervicalMucus: e.target.value})}
                    >
                      <option value="none">None</option>
                      <option value="dry">Dry</option>
                      <option value="sticky">Sticky</option>
                      <option value="creamy">Creamy</option>
                      <option value="watery">Watery</option>
                      <option value="egg-white">Egg White</option>
                    </select>
                    <small>{getCervicalMucusDescription(fertilityForm.cervicalMucus)}</small>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Mucus Amount
                      <span className="info-icon" title="How much cervical mucus is present">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.mucusAmount}
                      onChange={(e) => setFertilityForm({...fertilityForm, mucusAmount: e.target.value})}
                    >
                      <option value="none">None</option>
                      <option value="scant">Scant</option>
                      <option value="moderate">Moderate</option>
                      <option value="abundant">Abundant</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Mucus Stretch (cm)
                      <span className="info-icon" title="How far the mucus stretches between your fingers (0-10cm)">ℹ️</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={fertilityForm.mucusStretch}
                      onChange={(e) => setFertilityForm({...fertilityForm, mucusStretch: parseInt(e.target.value)})}
                      className="stretch-slider"
                    />
                    <div className="slider-labels">
                      <span>0cm</span>
                      <span>10cm</span>
                    </div>
                    <small>Current: {fertilityForm.mucusStretch}cm</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Cervical Position
                      <span className="info-icon" title="The height of your cervix (low, medium, high) - requires internal check">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.cervicalPosition}
                      onChange={(e) => setFertilityForm({...fertilityForm, cervicalPosition: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <small>{getCervicalPositionDescription(fertilityForm.cervicalPosition)}</small>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Cervical Texture
                      <span className="info-icon" title="How the cervix feels to touch (firm like nose tip, soft like lips)">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.cervicalTexture}
                      onChange={(e) => setFertilityForm({...fertilityForm, cervicalTexture: e.target.value})}
                    >
                      <option value="firm">Firm (like nose tip)</option>
                      <option value="medium">Medium</option>
                      <option value="soft">Soft (like lips)</option>
                    </select>
                    <small>Firm = not fertile, Soft = fertile</small>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Cervical Openness
                      <span className="info-icon" title="Whether the cervical opening is closed, slightly open, or open">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.cervicalOpenness}
                      onChange={(e) => setFertilityForm({...fertilityForm, cervicalOpenness: e.target.value})}
                    >
                      <option value="closed">Closed</option>
                      <option value="slightly-open">Slightly Open</option>
                      <option value="open">Open</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Ovulation Test Result
                      <span className="info-icon" title="Use an ovulation predictor kit (OPK) to detect LH surge">ℹ️</span>
                    </label>
                    <select
                      value={fertilityForm.ovulationTest}
                      onChange={(e) => setFertilityForm({...fertilityForm, ovulationTest: e.target.value})}
                    >
                      <option value="not-tested">Not Tested</option>
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                      <option value="peak">Peak (LH Surge)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Libido Level: {fertilityForm.libido}/10
                      <span className="info-icon" title="Rate your sexual desire and energy level">ℹ️</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fertilityForm.libido}
                      onChange={(e) => setFertilityForm({...fertilityForm, libido: parseInt(e.target.value)})}
                      className="libido-slider"
                    />
                    <div className="slider-labels">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Comprehensive Health Assessment */}
            <div className="comprehensive-health-section">
              <h3>🏥 Comprehensive Health Assessment</h3>
              <p className="section-description">Help AI provide more personalized fertility insights</p>
              
              <div className="health-metrics-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Weight (lbs)</label>
                    <input
                      type="number"
                      value={fertilityForm.weight}
                      onChange={(e) => setFertilityForm({...fertilityForm, weight: e.target.value})}
                      placeholder="e.g., 140"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input
                      type="text"
                      value={fertilityForm.bloodPressure}
                      onChange={(e) => setFertilityForm({...fertilityForm, bloodPressure: e.target.value})}
                      placeholder="e.g., 120/80"
                    />
                  </div>
                </div>
              </div>

              <div className="lifestyle-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Stress Level: {fertilityForm.stressLevel}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fertilityForm.stressLevel}
                      onChange={(e) => setFertilityForm({...fertilityForm, stressLevel: parseInt(e.target.value)})}
                      className="stress-slider"
                    />
                    <div className="slider-labels">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Sleep Quality: {fertilityForm.sleepQuality}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fertilityForm.sleepQuality}
                      onChange={(e) => setFertilityForm({...fertilityForm, sleepQuality: parseInt(e.target.value)})}
                      className="sleep-slider"
                    />
                    <div className="slider-labels">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="medical-info-section">
                <div className="form-group">
                  <label>Family History (Select all that apply)</label>
                  <div className="family-history-grid">
                    {familyHistoryOptions.map(condition => (
                      <label key={condition} className="family-history-option">
                        <input
                          type="checkbox"
                          checked={fertilityForm.familyHistory.includes(condition)}
                          onChange={() => handleFamilyHistoryToggle(condition)}
                        />
                        <span className="condition-label">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Common Fields - Always Visible */}
            <div className="form-group">
              <label>
                Fertility Symptoms
                <span className="info-icon" title="Select any symptoms you're experiencing that may be related to your fertility cycle">ℹ️</span>
              </label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={fertilityForm.symptoms.includes(symptom)}
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
                value={fertilityForm.notes}
                onChange={(e) => setFertilityForm({...fertilityForm, notes: e.target.value})}
                placeholder="Any additional observations about your fertility signs, symptoms, or concerns..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Fertility Data'}
            </button>
          </form>
        </div>

        {/* AI Insights - Display from Latest Entry (Like Cycle Tracking) */}
        {fertilityData.length > 0 && fertilityData[fertilityData.length - 1].fertilityInsights && (
          <div className="insights-section">
            <div className="insights-header">
              <h2>✨ AI-Powered Fertility Analysis</h2>
            </div>
            <div className="insights-content">
              {Array.isArray(fertilityData[fertilityData.length - 1].fertilityInsights) ? 
                fertilityData[fertilityData.length - 1].fertilityInsights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <p className="insight-text">{insight}</p>
                  </div>
                )) : (
                  <div className="insight-card">
                    <p className="insight-text">{fertilityData[fertilityData.length - 1].fertilityInsights}</p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Fertility Health Assessment - Display from Latest Entry */}
        {fertilityData.length > 0 && fertilityData[fertilityData.length - 1].riskAssessment && (
          <div className="health-assessment-section">
            <h2>🌺 Your Fertility Health</h2>
            <div className="health-content">
              <div className="health-card">
                <div className="health-icon">🩺</div>
                <div className="health-text">{fertilityData[fertilityData.length - 1].riskAssessment}</div>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Tips - Display from Latest Entry */}
        {fertilityData.length > 0 && fertilityData[fertilityData.length - 1].personalizedRecommendations && (
          <div className="recommendations-section">
            <h2>💝 Personalized Tips</h2>
            <div className="recommendations-content">
              {Array.isArray(fertilityData[fertilityData.length - 1].personalizedRecommendations) ? 
                fertilityData[fertilityData.length - 1].personalizedRecommendations.map((tip, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="rec-icon">✨</span>
                    <span className="rec-text">{tip}</span>
                  </div>
                )) : (
                  <div className="recommendation-item">
                    <span className="rec-icon">✨</span>
                    <span className="rec-text">{fertilityData[fertilityData.length - 1].personalizedRecommendations}</span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Gentle Reminders - Display from Latest Entry */}
        {fertilityData.length > 0 && fertilityData[fertilityData.length - 1].gentleReminders && fertilityData[fertilityData.length - 1].gentleReminders.length > 0 && (
          <div className="gentle-reminders-section">
            <h2>🌸 Gentle Reminders</h2>
            <div className="reminders-content">
              {fertilityData[fertilityData.length - 1].gentleReminders.map((reminder, index) => (
                <div key={index} className="reminder-item">
                  <span className="reminder-icon">🌸</span>
                  <span className="reminder-text">{reminder}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Fertility Education & Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🔬 Understanding Fertility</h3>
              <p>Learn about ovulation, fertile windows, and conception timing</p>
              <a href="https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning" target="_blank" rel="noopener noreferrer">
                ACOG: Fertility Awareness Methods
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🌡️ Basal Body Temperature</h3>
              <p>Complete guide to BBT tracking and charting</p>
              <a href="https://www.mayoclinic.org/healthy-lifestyle/getting-pregnant/in-depth/ovulation/art-20045180" target="_blank" rel="noopener noreferrer">
                Mayo Clinic: Ovulation Tracking
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🥚 Cervical Mucus & Position</h3>
              <p>Understanding cervical changes throughout your cycle</p>
              <a href="https://www.healthline.com/health/womens-health/cervical-mucus" target="_blank" rel="noopener noreferrer">
                Healthline: Cervical Mucus Guide
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧪 Ovulation Predictor Kits</h3>
              <p>How to use OPKs effectively for conception</p>
              <a href="https://www.webmd.com/baby/ovulation-predictor-kits" target="_blank" rel="noopener noreferrer">
                WebMD: OPK Guide
              </a>
            </div>
            
            <div className="resource-card">
              <h3>👩‍⚕️ When to See a Fertility Specialist</h3>
              <p>Signs that indicate you should seek professional help</p>
              <a href="https://www.asrm.org/topics/topics-index/infertility/" target="_blank" rel="noopener noreferrer">
                ASRM: Infertility Information
              </a>
            </div>
            
            <div className="resource-card">
              <h3>💊 Fertility Supplements & Lifestyle</h3>
              <p>Evidence-based supplements and lifestyle changes</p>
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3717046/" target="_blank" rel="noopener noreferrer">
                Research: Fertility & Nutrition
              </a>
            </div>
          </div>
        </div>

        {/* Fertility History */}
        {fertilityData.length > 0 && (
          <div className="fertility-history">
            <div className="history-header">
              <h2>📈 Fertility History</h2>
              <button 
                className="clear-history-btn"
                onClick={clearAllFertilityHistory}
                title="Clear all fertility history"
              >
                🗑️ Clear All
              </button>
            </div>
            <div className="history-list">
              {fertilityData.slice(-5).reverse().map((entry, index) => {
                const actualIndex = fertilityData.length - 1 - index; // Calculate actual index for deletion
                return (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      {entry.bbt && <span>BBT: {entry.bbt}°F</span>}
                      <span>Mucus: {entry.cervicalMucus}</span>
                      <span>Position: {entry.cervicalPosition}</span>
                      <span>Test: {entry.ovulationTest}</span>
                      {entry.symptoms.length > 0 && (
                        <span>Symptoms: {entry.symptoms.length}</span>
                      )}
                    </div>
                    <div className="history-actions">
                      {entry.aiInsights && (
                        <button 
                          className="view-insights-btn"
                          onClick={() => setSelectedFertilityInsights(entry)}
                          title="View AI Insights for this entry"
                        >
                          🤖
                        </button>
                      )}
                      <button 
                        className="delete-entry-btn"
                        onClick={() => deleteFertilityEntry(actualIndex)}
                        title="Delete this entry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3-Cycle Analysis Modal */}
        {selectedThreeCycleAnalysis && (
          <div className="insights-modal-overlay" onClick={() => setSelectedThreeCycleAnalysis(null)}>
            <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔬 Comprehensive 3-Entry Fertility Analysis</h2>
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
                    <span>AI In-Depth Fertility Analysis</span>
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

        {/* Interactive Dashboard - Show after 3+ consecutive entries */}
        {fertilityData.length >= 3 && (
          <div className="interactive-dashboard">
            <h2>📊 Your Fertility Analytics</h2>
            <p className="dashboard-subtitle">Insights from {fertilityData.length} consecutive entries</p>
            
            <div className="dashboard-grid">
              {/* BBT Trends */}
              <div className="dashboard-card">
                <h3>🌡️ BBT Trends</h3>
                <div className="chart-container">
                  <div className="bbt-chart">
                    {fertilityData.map((entry, index) => {
                      const bbt = parseFloat(entry.bbt) || 0;
                      const intensity = bbt > 0 ? ((bbt - 96) / 2) * 100 : 0;
                      return (
                        <div key={index} className="bbt-point">
                          <div className="bbt-label">Entry {index + 1}</div>
                          <div className="bbt-bar">
                            <div 
                              className="bbt-fill"
                              style={{ 
                                height: `${Math.min(intensity, 100)}%`,
                                backgroundColor: bbt >= 98 ? '#ff6b9d' : bbt >= 97.5 ? '#ff9800' : '#4CAF50'
                              }}
                            ></div>
                            <span className="bbt-value">{bbt > 0 ? `${bbt}°F` : 'N/A'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cervical Mucus Patterns */}
              <div className="dashboard-card">
                <h3>💧 Cervical Mucus Patterns</h3>
                <div className="mucus-patterns">
                  {fertilityData.map((entry, index) => {
                    const mucusColors = {
                      'none': '#666',
                      'sticky': '#ff9800',
                      'creamy': '#ffc107',
                      'watery': '#4CAF50',
                      'egg-white': '#ff6b9d'
                    };
                    return (
                      <div key={index} className="mucus-item">
                        <div className="mucus-entry">Entry {index + 1}</div>
                        <div 
                          className="mucus-indicator"
                          style={{ backgroundColor: mucusColors[entry.cervicalMucus] || '#666' }}
                        ></div>
                        <div className="mucus-label">{entry.cervicalMucus || 'none'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ovulation Test Results */}
              <div className="dashboard-card">
                <h3>🧪 Ovulation Test Results</h3>
                <div className="test-results">
                  {fertilityData.map((entry, index) => {
                    const testColors = {
                      'not-tested': '#666',
                      'negative': '#ff4444',
                      'positive': '#4CAF50',
                      'peak': '#ff6b9d'
                    };
                    return (
                      <div key={index} className="test-item">
                        <div className="test-entry">Entry {index + 1}</div>
                        <div 
                          className="test-indicator"
                          style={{ backgroundColor: testColors[entry.ovulationTest] || '#666' }}
                        ></div>
                        <div className="test-label">{entry.ovulationTest || 'not-tested'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fertility Score */}
              <div className="dashboard-card">
                <h3>🌟 Overall Fertility Score</h3>
                <div className="fertility-score">
                  {(() => {
                    const avgBbt = fertilityData.reduce((sum, e) => sum + (parseFloat(e.bbt) || 0), 0) / fertilityData.length;
                    const eggWhiteMucus = fertilityData.filter(e => e.cervicalMucus === 'egg-white').length;
                    const positiveTests = fertilityData.filter(e => e.ovulationTest === 'positive' || e.ovulationTest === 'peak').length;
                    const bbtScore = avgBbt >= 98 ? 100 : avgBbt >= 97.5 ? 80 : avgBbt >= 97 ? 60 : 40;
                    const mucusScore = (eggWhiteMucus / fertilityData.length) * 100;
                    const testScore = (positiveTests / fertilityData.length) * 100;
                    const overallScore = Math.round((bbtScore + mucusScore + testScore) / 3);
                    
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
                            <span>BBT Score:</span>
                            <span>{Math.round(bbtScore)}/100</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Mucus Score:</span>
                            <span>{Math.round(mucusScore)}/100</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Test Score:</span>
                            <span>{Math.round(testScore)}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Next Ovulation Prediction */}
              <div className="dashboard-card">
                <h3>🔮 Next Ovulation Prediction</h3>
                <div className="prediction-content">
                  {(() => {
                    const avgCycleLength = 28; // Default, could be calculated from cycle data
                    const lastEntry = fertilityData[fertilityData.length - 1];
                    const lastEntryDate = new Date(lastEntry.timestamp);
                    const nextOvulationDate = new Date(lastEntryDate);
                    nextOvulationDate.setDate(nextOvulationDate.getDate() + (avgCycleLength - 14));
                    
                    return (
                      <div className="prediction-details">
                        <div className="prediction-item">
                          <span className="prediction-label">Expected Ovulation:</span>
                          <span className="prediction-value">{nextOvulationDate.toLocaleDateString()}</span>
                        </div>
                        <div className="prediction-item">
                          <span className="prediction-label">Fertile Window:</span>
                          <span className="prediction-value">5 days before ovulation</span>
                        </div>
                        <div className="prediction-item">
                          <span className="prediction-label">Confidence Level:</span>
                          <span className="prediction-value">
                            {fertilityData.length >= 6 ? 'High' : fertilityData.length >= 3 ? 'Moderate' : 'Low'}
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

        {/* Historical AI Insights Modal */}
        {selectedFertilityInsights && (
          <div className="insights-modal-overlay" onClick={() => setSelectedFertilityInsights(null)}>
            <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🤖 AI Insights - {new Date(selectedFertilityInsights.timestamp).toLocaleDateString()}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedFertilityInsights(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                {/* Fertility Insights */}
                {selectedFertilityInsights.aiInsights?.aiInsights && (
                  <div className="modal-section">
                    <h3>📊 Fertility Insights</h3>
                    <div className="insights-content">
                      {Array.isArray(selectedFertilityInsights.aiInsights.aiInsights) ? (
                        selectedFertilityInsights.aiInsights.aiInsights.map((insight, index) => (
                          <p key={index} className="insight-text">{insight}</p>
                        ))
                      ) : (
                        <p className="insight-text">{selectedFertilityInsights.aiInsights.aiInsights}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Fertility Patterns */}
                {selectedFertilityInsights.fertilityPatterns && (
                  <div className="modal-section">
                    <h3>📈 Fertility Patterns</h3>
                    <div className="patterns-grid">
                      <div className="pattern-item">
                        <h4>🥚 Ovulation Assessment</h4>
                        <p>{selectedFertilityInsights.fertilityPatterns.ovulationAssessment}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>🌱 Fertility Evaluation</h4>
                        <p>{selectedFertilityInsights.fertilityPatterns.fertilityEvaluation}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>📋 Action Item</h4>
                        <p>{selectedFertilityInsights.fertilityPatterns.actionItem}</p>
                      </div>
                      <div className="pattern-item">
                        <h4>🎯 Confidence Level</h4>
                        <p>{selectedFertilityInsights.fertilityPatterns.confidence}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personalized Tips */}
                {selectedFertilityInsights.personalizedRecommendations && (
                  <div className="modal-section">
                    <h3>💝 Personalized Tips</h3>
                    <div className="tips-list">
                      {Array.isArray(selectedFertilityInsights.personalizedRecommendations) ? 
                        selectedFertilityInsights.personalizedRecommendations.map((tip, index) => (
                          <div key={index} className="tip-item">
                            <span className="tip-icon">✨</span>
                            <span className="tip-text">{tip}</span>
                          </div>
                        )) : (
                          <div className="tip-item">
                            <span className="tip-icon">✨</span>
                            <span className="tip-text">{selectedFertilityInsights.personalizedRecommendations}</span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Gentle Reminders */}
                {selectedFertilityInsights.gentleReminders && selectedFertilityInsights.gentleReminders.length > 0 && (
                  <div className="modal-section">
                    <h3>🌸 Gentle Reminders</h3>
                    <div className="reminders-list">
                      {selectedFertilityInsights.gentleReminders.map((reminder, index) => (
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

        {/* Advanced Mode Onboarding Modal */}
        {showAdvancedOnboarding && (
          <div className="onboarding-modal-overlay" onClick={closeAdvancedOnboarding}>
            <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔬 Welcome to Advanced Fertility Tracking</h2>
                <button 
                  className="close-btn"
                  onClick={closeAdvancedOnboarding}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="onboarding-section">
                  <h3>📚 What You'll Learn to Track</h3>
                  <div className="feature-grid">
                    <div className="feature-item">
                      <div className="feature-icon">🌡️</div>
                      <h4>Basal Body Temperature</h4>
                      <p>Track your daily temperature to detect ovulation patterns</p>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">💧</div>
                      <h4>Cervical Mucus Tracking</h4>
                      <p>Detailed observation of amount, stretch, and color changes (Advanced only)</p>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">📍</div>
                      <h4>Cervical Position</h4>
                      <p>Monitor cervical height changes throughout your cycle</p>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">🤏</div>
                      <h4>Cervical Texture</h4>
                      <p>Feel for firmness changes (firm like nose tip vs soft like lips)</p>
                    </div>
                  </div>
                </div>

                <div className="onboarding-section">
                  <h3>🛡️ Safety Guidelines</h3>
                  <div className="safety-tips">
                    <div className="tip-item">
                      <span className="tip-icon">🧼</span>
                      <span className="tip-text">Always wash your hands thoroughly before checking</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">✂️</span>
                      <span className="tip-text">Keep fingernails short and smooth</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">🕐</span>
                      <span className="tip-text">Check at the same time each day for consistency</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">🚫</span>
                      <span className="tip-text">Stop if you experience any pain or discomfort</span>
                    </div>
                  </div>
                </div>

                <div className="onboarding-section">
                  <h3>📊 Why Advanced Tracking Matters</h3>
                  <div className="benefits-list">
                    <div className="benefit-item">
                      <span className="benefit-icon">🎯</span>
                      <span className="benefit-text">Higher accuracy in fertile window prediction</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">🔍</span>
                      <span className="benefit-text">Better understanding of your unique cycle patterns with cervical mucus tracking</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">📈</span>
                      <span className="benefit-text">More detailed AI insights and recommendations</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">⚡</span>
                      <span className="benefit-text">Faster detection of potential fertility issues</span>
                    </div>
                  </div>
                </div>

                <div className="onboarding-section">
                  <h3>🔄 Cervical Changes Throughout Your Cycle</h3>
                  <div className="cycle-chart">
                    <div className="cervical-infographic">
                      <img 
                        src="/image.png" 
                        alt="Cervix positions throughout your cycle" 
                        className="cervical-image"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="start-advanced-btn"
                    onClick={closeAdvancedOnboarding}
                  >
                    Start Advanced Tracking
                  </button>
                  <button 
                    className="back-to-beginner-btn"
                    onClick={() => {
                      setTrackingMode('beginner');
                      setShowAdvancedOnboarding(false);
                    }}
                  >
                    Stay with Beginner Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilityTracking;
