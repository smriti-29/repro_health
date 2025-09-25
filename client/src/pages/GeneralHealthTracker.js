import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AMABAIService from '../ai/amabAIService';
import {
  AdvancedLineChart,
  AdvancedBarChart,
  AdvancedDoughnutChart,
  HealthScoreGauge,
  TrendIndicator
} from '../components/visualizations/AdvancedHealthCharts';
import './GeneralHealthTracker.css';

const GeneralHealthTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize AMAB AI Service
  const [aiService] = useState(() => new AMABAIService());
  
  // Helper function to safely parse numbers
  const safeParseNumber = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  
  const safeParseInt = (value, defaultValue = 0) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Save insights functionality
  const saveInsights = (insights) => {
    const newInsight = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      insights: insights,
      healthData: healthData[0] // Save the latest health data for context
    };
    
    const updatedInsights = [newInsight, ...savedInsights];
    setSavedInsights(updatedInsights);
    localStorage.setItem('amabHealthInsights', JSON.stringify(updatedInsights));
    console.log('💾 Insights saved:', newInsight);
  };

  // Delete insights functionality
  const deleteInsights = (insightId) => {
    const updatedInsights = savedInsights.filter(insight => insight.id !== insightId);
    setSavedInsights(updatedInsights);
    localStorage.setItem('amabHealthInsights', JSON.stringify(updatedInsights));
    console.log('🗑️ Insights deleted:', insightId);
  };

  // Parse insights into advanced reproductive health boxes with proper presentation
  const parseInsightsIntoBoxes = (insights) => {
    const lines = insights.split('\n').filter(line => line.trim());
    const boxes = [];
    
    let currentBox = null;
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check for section headers
      if (trimmedLine.includes('**HEALTH STATUS**') || trimmedLine.includes('HEALTH STATUS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'health-status',
          title: '📊 Health Status',
          content: '',
          icon: '📊',
          hasScoring: true
        };
      } else if (trimmedLine.includes('**PREDICTIONS**') || trimmedLine.includes('PREDICTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'predictions',
          title: '🔮 Predictions',
          content: '',
          icon: '🔮'
        };
      } else if (trimmedLine.includes('**ACTIONS**') || trimmedLine.includes('ACTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'actions',
          title: '💡 Actions',
          content: '',
          icon: '💡',
          hasPriorities: true
        };
      } else if (trimmedLine.includes('**INSIGHTS**') || trimmedLine.includes('INSIGHTS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'insights',
          title: '🧠 Insights',
          content: '',
          icon: '🧠'
        };
      } else if (trimmedLine.includes('**HEALTH NUGGET**') || trimmedLine.includes('HEALTH NUGGET:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'health-nugget',
          title: '✨ Health Nugget',
          content: '',
          icon: '✨',
          isNugget: true
        };
      } else if (currentBox && trimmedLine && !trimmedLine.startsWith('**')) {
        // Add content to current box
        if (currentBox.content) {
          currentBox.content += '\n' + trimmedLine;
        } else {
          currentBox.content = trimmedLine;
        }
      }
    });
    
    // Add the last box
    if (currentBox) boxes.push(currentBox);
    
    return boxes.map((box, index) => (
      <div key={index} className={`insight-box ${box.type}`}>
        <div className="insight-box-header">
          <span className="insight-icon">{box.icon}</span>
          <h3>{box.title}</h3>
        </div>
        <div className="insight-box-content">
          {box.isNugget ? (
            <div className="health-nugget">
              <p>{box.content}</p>
            </div>
          ) : box.hasScoring ? (
            <div className="enhanced-content">
              {box.content.split('\n').map((line, lineIndex) => {
                if (line.includes('Score:') || line.includes('Risk:') || line.includes('Index:')) {
                  return (
                    <div key={lineIndex} className="enhanced-line">
                      <span className="enhanced-label">{line.split(':')[0]}:</span>
                      <span className="enhanced-value">{line.split(':')[1]}</span>
                    </div>
                  );
                }
                return <div key={lineIndex} className="enhanced-text">{line}</div>;
              })}
            </div>
          ) : box.hasPriorities ? (
            <div className="prioritized-actions">
              {box.content.split('\n').map((line, lineIndex) => {
                if (line.includes('🔴') || line.includes('🟡') || line.includes('🟢')) {
                  const priority = line.includes('🔴') ? 'high' : line.includes('🟡') ? 'medium' : 'low';
                  return (
                    <div key={lineIndex} className={`action-item priority-${priority}`}>
                      <span className="priority-icon">
                        {line.includes('🔴') ? '🔴' : line.includes('🟡') ? '🟡' : '🟢'}
                      </span>
                      <span className="action-text">{line.replace(/[🔴🟡🟢]\s*/, '')}</span>
                    </div>
                  );
                }
                return <div key={lineIndex} className="enhanced-text">{line}</div>;
              })}
            </div>
          ) : (
            <div className="enhanced-content">
              {box.content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="enhanced-text">{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    ));
  };
  
  // MEDICAL-GRADE General Health tracking form state
  const [healthForm, setHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    
    // Vital Signs
    bloodPressure: '',
    heartRate: '',
    weight: '',
    height: user?.height || '',
    bodyFat: '',
    muscleMass: '',
    
    // Wellness Indicators
    energyLevel: 5, // 1-10 scale
    mood: 5, // 1-10 scale
    stressLevel: 5, // 1-10 scale
    sleepQuality: 5, // 1-10 scale
    sleepHours: 7.5,
    sleepEfficiency: 5, // 1-10 scale
    mentalClarity: 5,
    productivity: 5,
    motivation: 5,
    daySatisfaction: 5,
    mainFocus: '',
    dayChallenge: '',
    weather: '',
    
    // Physical Activity
    exerciseType: 'none', // none, cardio, strength, mixed, sports
    exerciseDuration: 0, // minutes
    exerciseIntensity: 'moderate', // light, moderate, intense
    steps: '',
    caloriesBurned: '',
    
    // Nutrition & Hydration
    dietQuality: 5, // 1-10 scale
    waterIntake: 8, // glasses per day
    alcoholConsumption: 'none', // none, light, moderate, heavy
    caffeineIntake: 0, // cups per day
    
    // Lifestyle Factors
    workStress: 5, // 1-10 scale
    socialConnections: 5, // 1-10 scale
    screenTime: 8, // hours per day
    outdoorTime: 1, // hours per day
    
    // Additional Fields
    mentalClarity: 5, // 1-10 scale
    productivity: 5, // 1-10 scale
    motivation: 5, // 1-10 scale
    daySatisfaction: 5, // 1-10 scale
    mainFocus: '',
    dayChallenge: '',
    weather: 'sunny',
    
    // Mental Health & Wellness (Enhanced)
    anxietyLevel: 5, // 1-10 scale
    depressionLevel: 5, // 1-10 scale
    moodStability: 5, // 1-10 scale
    socialAnxiety: 5, // 1-10 scale
    panicAttacks: 0, // count per week
    mentalHealthNotes: '',
    
    // Preventive Care & Screenings
    lastPhysicalExam: '',
    nextPhysicalExam: '',
    lastBloodWork: '',
    nextBloodWork: '',
    lastDentalExam: '',
    nextDentalExam: '',
    lastEyeExam: '',
    nextEyeExam: '',
    vaccinations: [],
    screeningReminders: [],
    
    // Medications & Supplements (Enhanced)
    currentMedications: [],
    medicationSideEffects: [],
    supplementRegimen: [],
    medicationAdherence: 5, // 1-10 scale
    medicationNotes: '',
    
    // Symptoms & Observations
    symptoms: [],
    notes: ''
  });

  // AI-Powered Health Intelligence
  const [healthData, setHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthInsights, setHealthInsights] = useState(null);
  const [lastAICall, setLastAICall] = useState(0);
  const [lastDataHash, setLastDataHash] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [savedInsights, setSavedInsights] = useState([]);
  const [showSavedInsights, setShowSavedInsights] = useState(false);

  // AI Analysis & Visualizations
  // Removed aiAnalysis state - no longer needed
  const [healthScore, setHealthScore] = useState(0);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);



  // Load existing health data
  useEffect(() => {
    const savedData = localStorage.getItem('amabGeneralHealthData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setHealthData(parsed);
      
      // Don't generate AI insights on page load - only when user submits form
    }

    // Load saved insights
    const savedInsightsData = localStorage.getItem('amabHealthInsights');
    if (savedInsightsData) {
      const parsedInsights = JSON.parse(savedInsightsData);
      setSavedInsights(parsedInsights);
    }
  }, []);

  // Generate fallback analysis when AI services are unavailable
  const generateFallbackAnalysis = (data) => {
    if (data.length === 0) return;
    
    const latestEntry = data[0];
    const reproductiveIndex = calculateReproductiveReadinessIndex(data);
    
    const fallbackInsights = `**HEALTH STATUS** (Current state with reproductive health context)
- Energy Score: ${latestEntry.energyLevel}/10 (reproductive health impact)
- Stress Risk: ${latestEntry.stressLevel <= 3 ? 'Low' : latestEntry.stressLevel <= 6 ? 'Moderate' : 'High'} (⚠️) (hormone impact)
- Reproductive Readiness Index: ${reproductiveIndex}% (based on sleep, stress, exercise, nutrition)
- Key concerns: ${latestEntry.stressLevel > 6 ? 'High stress may impact hormone balance' : 'Stress levels are manageable'}

**PREDICTIONS** (7-day outlook with hormone/fertility focus)
- ${latestEntry.exerciseDuration < 30 ? 'Low exercise may continue to impact energy and testosterone levels' : 'Good exercise routine supports reproductive health'}
- ${latestEntry.sleepQuality < 6 ? 'Poor sleep quality may affect hormone production and recovery' : 'Sleep quality supports optimal hormone function'}
- ${latestEntry.screenTime > 8 ? 'High screen time may disrupt circadian rhythms and melatonin production' : 'Screen time is within healthy limits'}

**ACTIONS** (Priority-based recommendations)
🔴 High Priority: ${latestEntry.exerciseDuration < 30 ? 'Add 30 minutes of moderate exercise daily to boost testosterone and energy' : 'Maintain current exercise routine for optimal reproductive health'}
🟡 Medium Priority: ${latestEntry.sleepQuality < 6 ? 'Improve sleep hygiene - aim for 7-9 hours of quality sleep' : 'Continue good sleep practices'}
🟢 Low Priority: ${latestEntry.waterIntake < 8 ? 'Increase water intake to 8+ glasses daily for optimal cellular function' : 'Maintain good hydration habits'}

**INSIGHTS** (Reproductive health correlations)
- Exercise duration of ${latestEntry.exerciseDuration} minutes ${latestEntry.exerciseDuration >= 30 ? 'supports' : 'may limit'} testosterone production and overall reproductive health
- Sleep quality of ${latestEntry.sleepQuality}/10 ${latestEntry.sleepQuality >= 6 ? 'supports' : 'may disrupt'} hormone regulation and recovery
- Stress level of ${latestEntry.stressLevel}/10 ${latestEntry.stressLevel <= 6 ? 'allows' : 'may interfere with'} optimal reproductive hormone balance

**HEALTH NUGGET** (One surprising science-backed fact)
💡 Regular exercise increases testosterone by up to 15% and improves sperm quality in men.`;

    setHealthInsights(fallbackInsights);
  };

  // AI-Powered Health Analysis - OPTIMIZED for single token usage
  const generateAIInsights = async (data = healthData) => {
    if (data.length < 1) {
      console.log('No data available for AI analysis.');
      return;
    }

    // Prevent multiple simultaneous AI calls
    if (isLoading) {
      console.log('🚫 AI analysis already in progress, skipping duplicate call');
      return;
    }

    // Create data hash to prevent duplicate analysis for same data
    const dataHash = JSON.stringify(data[0]); // Only check latest entry
    if (dataHash === lastDataHash) {
      console.log('🚫 Same data already analyzed, skipping duplicate call');
      return;
    }

    // Rate limiting: prevent multiple calls within 10 seconds
    const now = Date.now();
    if (now - lastAICall < 10000) {
      console.log('🚫 AI call rate limited - too soon after last call');
      return;
    }
    setLastAICall(now);
    setLastDataHash(dataHash);

    setIsLoading(true);
    try {
      console.log('🤖 Generating comprehensive AI health analysis...');
      
      const userProfile = {
        age: user?.age || 30,
        conditions: user?.conditions || {},
        familyHistory: user?.familyHistory || {},
        lifestyle: user?.lifestyle || {}
      };

      // Calculate comprehensive health score
      const score = calculateComprehensiveHealthScore(data);
      setHealthScore(score);

      // Generate comprehensive AI insights
      const latestEntry = data[0];
      console.log('🤖 Sending data to Gemini AI:', latestEntry);
      
      // ENHANCED: Reproductive health-focused AI prompt with scoring and structure
      const currentTime = new Date().toLocaleString();
      const reproductiveIndex = calculateReproductiveReadinessIndex(data);
      const professionalPrompt = `Analyze reproductive health data for 30-year-old male:

Energy: ${latestEntry.energyLevel}/10, Sleep: ${latestEntry.sleepQuality}/10 (${latestEntry.sleepHours}h), Stress: ${latestEntry.stressLevel}/10, Mood: ${latestEntry.mood}/10, Exercise: ${latestEntry.exerciseDuration}min, Diet: ${latestEntry.dietQuality}/10, Water: ${latestEntry.waterIntake} glasses, Screen: ${latestEntry.screenTime}h, Outdoor: ${latestEntry.outdoorTime}h

CALCULATED REPRODUCTIVE READINESS INDEX: ${reproductiveIndex}%

Provide comprehensive reproductive health analysis in this EXACT format:

**HEALTH STATUS** (Current state with reproductive health context)
- Energy Score: ${latestEntry.energyLevel}/10 (reproductive health impact)
- Stress Risk: ${latestEntry.stressLevel <= 3 ? 'Low' : latestEntry.stressLevel <= 6 ? 'Moderate' : 'High'} (⚠️) (hormone impact)
- Reproductive Readiness Index: ${reproductiveIndex}% (based on sleep, stress, exercise, nutrition)
- Key concerns with reproductive health connections

**PREDICTIONS** (7-day outlook with hormone/fertility focus)
- What will happen if current patterns continue
- Specific reproductive health impacts (testosterone, fertility, hormone balance)
- Risk factors for reproductive wellness

**ACTIONS** (Priority-based recommendations)
🔴 High Priority: [Most critical action for reproductive health]
🟡 Medium Priority: [Important but not urgent]
🟢 Low Priority: [Maintenance action]

**INSIGHTS** (Reproductive health correlations)
- Key connections between lifestyle and reproductive health
- Hormone balance factors
- Fertility optimization opportunities

**HEALTH NUGGET** (One surprising science-backed fact)
💡 [One short, memorable reproductive health tip]

Focus on reproductive health, hormone balance, and fertility optimization. Keep under 300 words.`;

      console.log('📤 Sending prompt to AI (SINGLE TOKEN REQUEST):', professionalPrompt);
      console.log('🔍 AI Service type:', aiService.constructor.name);
      console.log('🔍 AI Service configured:', aiService.primaryService?.isConfigured());
      console.log('🔍 Analysis timestamp:', currentTime);
      console.log('🔍 Data being analyzed:', latestEntry);
      console.log('🔍 Request ID:', Date.now()); // Unique request identifier
      
      // SINGLE AI CALL - No retries, no fallbacks within this function
      const insights = await aiService.generateInsights(professionalPrompt);
      console.log('📥 AI response received (SINGLE TOKEN USED):', insights);
      console.log('🔍 Analysis completed at:', new Date().toLocaleString());
      
      setHealthInsights(insights);
      
      // Set default values for the UI components
      // Removed unused state variables: healthPatterns, personalizedRecommendations, riskAssessment
      
      // Removed trend analysis - no longer needed
      
      // Removed advanced AI analysis - no longer needed
      
      // Removed advanced analysis functions - no longer needed
      
      console.log('✅ Comprehensive AI analysis completed successfully');
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error) {
      console.error('❌ Error generating AI insights:', error);
      
      // Use comprehensive fallback analysis for all error types
      console.log('⚠️ AI services unavailable, using comprehensive fallback analysis');
      generateFallbackAnalysis(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Comprehensive Health Score
  const calculateComprehensiveHealthScore = (data) => {
    if (data.length === 0) return 0;
    
    const recentData = data.slice(0, 7);
    const avgEnergy = recentData.reduce((sum, log) => sum + (log.energyLevel || 5), 0) / recentData.length;
    const avgSleep = recentData.reduce((sum, log) => sum + (log.sleepQuality || 5), 0) / recentData.length;
    const avgStress = recentData.reduce((sum, log) => sum + (log.stressLevel || 5), 0) / recentData.length;
    const avgExercise = recentData.reduce((sum, log) => sum + (log.exerciseFrequency || 0), 0) / recentData.length;
    
    const score = ((avgEnergy + avgSleep + (10 - avgStress) + avgExercise) / 4) * 10;
    return Math.round(score);
  };

  // Calculate Reproductive Readiness Index
  const calculateReproductiveReadinessIndex = (data) => {
    if (data.length === 0) return 0;
    
    const latest = data[0];
    
    // Reproductive health factors with weights
    const factors = {
      sleep: {
        weight: 0.25,
        score: (latest.sleepQuality || 5) / 10,
        impact: 'Sleep quality directly affects hormone production and regulation'
      },
      stress: {
        weight: 0.25,
        score: Math.max(0, (10 - (latest.stressLevel || 5)) / 10), // Invert stress
        impact: 'Chronic stress disrupts reproductive hormone balance'
      },
      exercise: {
        weight: 0.20,
        score: Math.min(1, (latest.exerciseDuration || 0) / 45), // Normalize to 45 min max
        impact: 'Regular exercise supports testosterone and overall reproductive health'
      },
      nutrition: {
        weight: 0.15,
        score: (latest.dietQuality || 5) / 10,
        impact: 'Proper nutrition provides essential nutrients for reproductive function'
      },
      hydration: {
        weight: 0.10,
        score: Math.min(1, (latest.waterIntake || 5) / 10), // Normalize to 10 glasses max
        impact: 'Adequate hydration supports cellular function and hormone transport'
      },
      screenTime: {
        weight: 0.05,
        score: Math.max(0, (12 - (latest.screenTime || 6)) / 12), // Invert screen time
        impact: 'Excessive screen time can disrupt circadian rhythms and hormone production'
      }
    };
    
    const totalScore = Object.keys(factors).reduce((total, key) => {
      return total + (factors[key].score * factors[key].weight);
    }, 0);
    
    return Math.round(totalScore * 100);
  };


  // Advanced AI Analysis
  // Removed performAdvancedAIAnalysis function - no longer needed

  // Advanced Trend Analysis
  // Removed analyzeAdvancedTrends function - no longer needed

  // Removed findAdvancedCorrelations function - no longer needed

  // Removed generatePredictiveInsights function - no longer needed

  // Removed identifyAdvancedPatterns function - no longer needed

  // Removed unused helper functions - no longer needed

  // Enhanced form submission with AI analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clean and normalize the form data
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: healthForm.date,
      
      // Vital Signs
      bloodPressure: healthForm.bloodPressure,
      heartRate: healthForm.heartRate,
      weight: parseFloat(healthForm.weight) || 0,
      height: parseFloat(healthForm.height) || 0,
      bodyFat: healthForm.bodyFat,
      muscleMass: healthForm.muscleMass,
      
      // Wellness Indicators (convert to numbers)
      energyLevel: parseInt(healthForm.energyLevel) || 5,
      mood: parseInt(healthForm.mood) || 5,
      stressLevel: parseInt(healthForm.stressLevel) || 5,
      sleepQuality: parseInt(healthForm.sleepQuality) || 5,
      sleepHours: parseFloat(healthForm.sleepHours) || 7.5,
      sleepEfficiency: parseInt(healthForm.sleepEfficiency) || 5,
      
      // Physical Activity
      exerciseType: healthForm.exerciseType,
      exerciseDuration: parseInt(healthForm.exerciseDuration) || 0,
      exerciseIntensity: healthForm.exerciseIntensity,
      steps: healthForm.steps,
      caloriesBurned: healthForm.caloriesBurned,
      
      // Lifestyle
      dietQuality: parseInt(healthForm.dietQuality) || 5,
      waterIntake: parseInt(healthForm.waterIntake) || 8,
      alcoholConsumption: healthForm.alcoholConsumption,
      caffeineIntake: parseInt(healthForm.caffeineIntake) || 0,
      workStress: parseInt(healthForm.workStress) || 5,
      socialConnections: parseInt(healthForm.socialConnections) || 5,
      screenTime: parseInt(healthForm.screenTime) || 8,
      outdoorTime: parseInt(healthForm.outdoorTime) || 1,
      
      // Health Tracking
      symptoms: healthForm.symptoms,
      medications: healthForm.medications,
      supplements: healthForm.supplements,
      notes: healthForm.notes,
      
      
      // Calculated fields
      bmi: calculateBMI(healthForm.weight, healthForm.height)
    };

    const updatedData = [newEntry, ...healthData];
    setHealthData(updatedData);
    localStorage.setItem('amabGeneralHealthData', JSON.stringify(updatedData));
    
    // Force refresh of visualizations with timestamp
    setDataRefreshKey(Date.now());
    

    // Reset form
    setHealthForm({
      date: new Date().toISOString().split('T')[0],
      bloodPressure: '',
      heartRate: '',
      weight: '',
      height: user?.height || '',
      bodyFat: '',
      muscleMass: '',
      energyLevel: 5,
      mood: 5,
      stressLevel: 5,
      sleepQuality: 5,
      sleepHours: 7.5,
      sleepEfficiency: 5,
      exerciseType: 'none',
      exerciseDuration: 0,
      exerciseIntensity: 'moderate',
      steps: '',
      caloriesBurned: '',
      dietQuality: 5,
      waterIntake: 8,
      mentalClarity: 5,
      productivity: 5,
      motivation: 5,
      daySatisfaction: 5,
      mainFocus: '',
      dayChallenge: '',
      weather: '',
      alcoholConsumption: 'none',
      caffeineIntake: 0,
      workStress: 5,
      socialConnections: 5,
      screenTime: 8,
      outdoorTime: 1,
      mentalClarity: 5,
      productivity: 5,
      motivation: 5,
      daySatisfaction: 5,
      mainFocus: '',
      dayChallenge: '',
      weather: 'sunny',
      symptoms: [],
      medications: [],
      supplements: [],
      notes: ''
    });

    // Generate AI insights immediately after logging (even with 1 entry)
    console.log('🚀 Starting AI analysis with data:', newEntry);
    await generateAIInsights(updatedData);

    setShowModal(false);
  };

  // BMI calculation function
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100; // Convert cm to meters
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  // Removed generateTrendAnalysis and helper functions - no longer needed

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#ff6b6b' };
    if (bmi < 25) return { category: 'Normal', color: '#4ecdc4' };
    if (bmi < 30) return { category: 'Overweight', color: '#ffa726' };
    return { category: 'Obese', color: '#ef5350' };
  };

  // Generate health insights
  const generateHealthInsights = () => {
    if (healthData.length < 3) return [];

    const insights = [];
    const recentLogs = healthData.slice(0, 7); // Last 7 days

    // Energy trend
    const avgEnergy = recentLogs.reduce((sum, log) => sum + log.energy, 0) / recentLogs.length;
    if (avgEnergy < 5) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Low Energy Levels',
        message: `Your average energy is ${avgEnergy.toFixed(1)}/10. Consider improving sleep quality and nutrition.`
      });
    } else if (avgEnergy > 7) {
      insights.push({
        type: 'positive',
        icon: '🚀',
        title: 'Great Energy Levels',
        message: `Your average energy is ${avgEnergy.toFixed(1)}/10. Keep up the good work!`
      });
    }

    // Sleep analysis
    const avgSleep = recentLogs.reduce((sum, log) => sum + log.sleep, 0) / recentLogs.length;
    const avgSleepHours = recentLogs.reduce((sum, log) => sum + log.sleepHours, 0) / recentLogs.length;
    
    if (avgSleepHours < 7) {
      insights.push({
        type: 'warning',
        icon: '😴',
        title: 'Insufficient Sleep',
        message: `You're averaging ${avgSleepHours.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal health.`
      });
    }

    // Exercise frequency
    const exerciseDays = recentLogs.filter(log => log.exercise && log.exercise !== 'none').length;
    const exerciseRate = (exerciseDays / recentLogs.length) * 100;
    
    if (exerciseRate < 30) {
      insights.push({
        type: 'warning',
        icon: '🏃‍♂️',
        title: 'Low Exercise Frequency',
        message: `You're exercising ${exerciseRate.toFixed(0)}% of the time. Try to increase your activity level.`
      });
    }

    return insights;
  };


  const getMoodIcon = (mood) => {
    const icons = {
      'excellent': '😄',
      'good': '🙂',
      'okay': '😐',
      'bad': '😔',
      'terrible': '😢'
    };
    return icons[mood] || '😐';
  };

  const getExerciseIcon = (exercise) => {
    const icons = {
      'cardio': '🏃‍♂️',
      'strength': '💪',
      'yoga': '🧘‍♂️',
      'swimming': '🏊‍♂️',
      'cycling': '🚴‍♂️',
      'walking': '🚶‍♂️',
      'none': '😴'
    };
    return icons[exercise] || '🏃‍♂️';
  };

  // Calculate overall health score
  const calculateHealthScore = () => {
    if (healthData.length === 0) return 0;
    
    const latestEntry = healthData[healthData.length - 1];
    let score = 0;
    let factors = 0;
    
    // Energy level (0-10 scale, convert to 0-100)
    if (latestEntry.energy?.overall) {
      score += (latestEntry.energy.overall / 10) * 100;
      factors++;
    }
    
    // Mood level (0-10 scale, convert to 0-100)
    if (latestEntry.mood?.overall) {
      score += (latestEntry.mood.overall / 10) * 100;
      factors++;
    }
    
    // Sleep quality (0-10 scale, convert to 0-100)
    if (latestEntry.sleep?.quality) {
      score += (latestEntry.sleep.quality / 10) * 100;
      factors++;
    }
    
    // Physical health average (0-10 scale, convert to 0-100)
    if (latestEntry.physical) {
      const physicalAvg = Object.values(latestEntry.physical).reduce((sum, val) => {
        return sum + (typeof val === 'number' ? val : 0);
      }, 0) / Object.keys(latestEntry.physical).length;
      score += (physicalAvg / 10) * 100;
      factors++;
    }
    
    // Exercise intensity (0-10 scale, convert to 0-100)
    if (latestEntry.exercise?.intensity) {
      score += (latestEntry.exercise.intensity / 10) * 100;
      factors++;
    }
    
    // Nutrition quality (0-10 scale, convert to 0-100)
    if (latestEntry.nutrition?.quality) {
      score += (latestEntry.nutrition.quality / 10) * 100;
      factors++;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  };

  // Analyze patterns for doctor referral triggers
  const analyzeHealthPatterns = () => {
    if (healthData.length < 3) return null;
    
    const recentData = healthData.slice(-7); // Last 7 entries
    const triggers = [];
    
    // Energy level consistently low
    const energyValues = recentData.map(entry => entry.energy?.overall || 5);
    const avgEnergy = energyValues.reduce((sum, val) => sum + val, 0) / energyValues.length;
    if (avgEnergy <= 3 && energyValues.filter(val => val <= 3).length >= 3) {
      triggers.push({
        type: 'energy',
        severity: 'high',
        message: 'Persistently low energy levels (≤3/10) for multiple days',
        recommendation: 'Consider consulting a healthcare provider to rule out underlying conditions like thyroid issues, anemia, or chronic fatigue'
      });
    }
    
    // Sleep quality consistently poor
    const sleepValues = recentData.map(entry => entry.sleep?.quality || 5);
    const avgSleep = sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length;
    if (avgSleep <= 3 && sleepValues.filter(val => val <= 3).length >= 3) {
      triggers.push({
        type: 'sleep',
        severity: 'medium',
        message: 'Consistently poor sleep quality (≤3/10) for multiple days',
        recommendation: 'Consider sleep study or consultation with a sleep specialist to address potential sleep disorders'
      });
    }
    
    // Mood consistently low
    const moodValues = recentData.map(entry => entry.mood?.overall || 5);
    const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
    if (avgMood <= 3 && moodValues.filter(val => val <= 3).length >= 3) {
      triggers.push({
        type: 'mood',
        severity: 'high',
        message: 'Persistently low mood (≤3/10) for multiple days',
        recommendation: 'Consider mental health consultation to address potential depression or anxiety'
      });
    }
    
    return triggers.length > 0 ? triggers : null;
  };

  return (
    <div className="general-health-tracker">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🏃‍♂️ General Health Tracker</h1>
        <p>Track your daily wellness metrics and lifestyle factors</p>
      </div>

      <div className="general-health-content">
        {/* Compact Health Overview */}
        <div className="compact-overview">
          <div className="overview-item">
            <span className="overview-icon">📊</span>
            <span className="overview-label">Logs</span>
            <span className="overview-value">{healthData.length}</span>
          </div>
          <div className="overview-item">
            <span className="overview-icon">⚡</span>
            <span className="overview-label">Energy</span>
            <span className="overview-value">
              {healthData.length > 0 ? Math.round(healthData.reduce((sum, log) => sum + log.energyLevel, 0) / healthData.length) : '--'}
            </span>
          </div>
          <div className="overview-item">
            <span className="overview-icon">😴</span>
            <span className="overview-label">Sleep</span>
            <span className="overview-value">
              {healthData.length > 0 ? Math.round(healthData.reduce((sum, log) => sum + log.sleepQuality, 0) / healthData.length) : '--'}
            </span>
          </div>
          {healthData.length > 0 && healthData[0].bmi && (
            <div className="overview-item">
              <span className="overview-icon">⚖️</span>
              <span className="overview-label">BMI</span>
              <span className="overview-value">{healthData[0].bmi}</span>
            </div>
          )}
        </div>

        {/* Health Logging Form */}
        <div className="health-form-section">
          <h2>Log Your Health Data</h2>
          <form onSubmit={handleSubmit} className="health-form">
            
            {/* Date */}
            <div className="form-row">
            <div className="form-group">
                <label htmlFor="health-date">Date *</label>
              <input
                  id="health-date"
                  name="date"
                  type="date"
                  value={healthForm.date}
                  onChange={(e) => setHealthForm({...healthForm, date: e.target.value})}
                  required
                  title="Select the date for this health entry"
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="form-section-header">
              <h3>📊 Vital Signs</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight (lbs)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={healthForm.weight}
                  onChange={(e) => setHealthForm({...healthForm, weight: e.target.value})}
                  placeholder="Enter your weight"
                  title="Enter your weight in pounds"
                />
              </div>
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={healthForm.height}
                  onChange={(e) => setHealthForm({...healthForm, height: e.target.value})}
                  placeholder={user?.height ? `${user.height} cm` : 'Enter height'}
                  title="Enter your height in centimeters"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="blood-pressure">Blood Pressure (mmHg)</label>
                <input
                  id="blood-pressure"
                  name="bloodPressure"
                type="text"
                  value={healthForm.bloodPressure}
                  onChange={(e) => setHealthForm({...healthForm, bloodPressure: e.target.value})}
                  placeholder="120/80"
                  title="Enter your blood pressure in mmHg format (e.g., 120/80)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="heart-rate">Heart Rate (bpm)</label>
                <input
                  id="heart-rate"
                  name="heartRate"
                  type="number"
                  min="0"
                  max="200"
                  value={healthForm.heartRate}
                  onChange={(e) => setHealthForm({...healthForm, heartRate: e.target.value})}
                  placeholder="70"
                  title="Enter your heart rate in beats per minute"
                />
              </div>
            </div>

            {/* Wellness Indicators */}
            <div className="form-section-header">
              <h3>💚 Wellness Indicators</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="energy-level">Energy Level: {healthForm.energyLevel}/10</label>
                <input
                  id="energy-level"
                  name="energyLevel"
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.energyLevel}
                  onChange={(e) => setHealthForm({...healthForm, energyLevel: safeParseInt(e.target.value, 5)})}
                  className="slider"
                  title="Rate your energy level from 1 (very low) to 10 (very high)"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="mood">Mood: {healthForm.mood}/10</label>
                <input
                  id="mood"
                  name="mood"
                  type="range"
                  min="1"
                  max="10"
                value={healthForm.mood}
                  onChange={(e) => setHealthForm({...healthForm, mood: safeParseInt(e.target.value, 5)})}
                  className="slider"
                  title="Rate your mood from 1 (very low) to 10 (very high)"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stress Level: {healthForm.stressLevel}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.stressLevel}
                  onChange={(e) => setHealthForm({...healthForm, stressLevel: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              <div className="form-group">
                <label>Mental Clarity: {healthForm.mentalClarity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.mentalClarity}
                  onChange={(e) => setHealthForm({...healthForm, mentalClarity: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="form-section-header">
              <h3>😴 Sleep Quality</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sleep Quality: {healthForm.sleepQuality}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.sleepQuality}
                  onChange={(e) => setHealthForm({...healthForm, sleepQuality: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="form-group">
                <label>Sleep Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={healthForm.sleepHours}
                  onChange={(e) => setHealthForm({...healthForm, sleepHours: safeParseNumber(e.target.value, 7.5)})}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sleep Efficiency: {healthForm.sleepEfficiency}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.sleepEfficiency}
                  onChange={(e) => setHealthForm({...healthForm, sleepEfficiency: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Physical Activity */}
            <div className="form-section-header">
              <h3>🏃 Physical Activity</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exercise-type">Exercise Type</label>
                <select
                  id="exercise-type"
                  name="exerciseType"
                  value={healthForm.exerciseType}
                  onChange={(e) => setHealthForm({...healthForm, exerciseType: e.target.value})}
                  title="Select the type of exercise you did today"
                >
                  <option value="none">No Exercise</option>
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength Training</option>
                  <option value="mixed">Mixed Workout</option>
                  <option value="sports">Sports</option>
                  <option value="yoga">Yoga/Pilates</option>
                  <option value="walking">Walking</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exercise Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={healthForm.exerciseDuration}
                  onChange={(e) => setHealthForm({...healthForm, exerciseDuration: safeParseInt(e.target.value, 0)})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exercise-intensity">Exercise Intensity</label>
                <select
                  id="exercise-intensity"
                  name="exerciseIntensity"
                  value={healthForm.exerciseIntensity}
                  onChange={(e) => setHealthForm({...healthForm, exerciseIntensity: e.target.value})}
                  title="Select the intensity level of your exercise"
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="intense">Intense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Steps Today</label>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={healthForm.steps}
                  onChange={(e) => setHealthForm({...healthForm, steps: e.target.value})}
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Nutrition & Hydration */}
            <div className="form-section-header">
              <h3>🥗 Nutrition & Hydration</h3>
            </div>

            <div className="form-row">
            <div className="form-group">
                <label>Diet Quality: {healthForm.dietQuality}/10</label>
              <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.dietQuality}
                  onChange={(e) => setHealthForm({...healthForm, dietQuality: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="form-group">
                <label>Water Intake (glasses)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={healthForm.waterIntake}
                  onChange={(e) => setHealthForm({...healthForm, waterIntake: safeParseInt(e.target.value, 8)})}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Caffeine Intake (mg)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={healthForm.caffeineIntake}
                  onChange={(e) => setHealthForm({...healthForm, caffeineIntake: safeParseInt(e.target.value, 0)})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Alcohol Consumption</label>
                <select
                  value={healthForm.alcoholConsumption}
                  onChange={(e) => setHealthForm({...healthForm, alcoholConsumption: e.target.value})}
                >
                  <option value="none">None</option>
                  <option value="light">Light (1-2 drinks)</option>
                  <option value="moderate">Moderate (3-4 drinks)</option>
                  <option value="heavy">Heavy (5+ drinks)</option>
                </select>
              </div>
            </div>

            {/* Lifestyle Factors */}
            <div className="form-section-header">
              <h3>🏠 Lifestyle Factors</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Work Stress: {healthForm.workStress}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.workStress}
                  onChange={(e) => setHealthForm({...healthForm, workStress: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              <div className="form-group">
                <label>Social Connections: {healthForm.socialConnections}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.socialConnections}
                  onChange={(e) => setHealthForm({...healthForm, socialConnections: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Screen Time (hours)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={healthForm.screenTime}
                  onChange={(e) => setHealthForm({...healthForm, screenTime: safeParseNumber(e.target.value, 8)})}
                  placeholder="8"
                />
              </div>
              <div className="form-group">
                <label>Outdoor Time (hours)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={healthForm.outdoorTime}
                  onChange={(e) => setHealthForm({...healthForm, outdoorTime: safeParseNumber(e.target.value, 1)})}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Productivity: {healthForm.productivity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.productivity}
                  onChange={(e) => setHealthForm({...healthForm, productivity: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              <div className="form-group">
                <label>Motivation: {healthForm.motivation}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.motivation}
                  onChange={(e) => setHealthForm({...healthForm, motivation: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            {/* Additional Questions */}
            <div className="form-section-header">
              <h3>📝 Additional Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Day Satisfaction: {healthForm.daySatisfaction}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.daySatisfaction}
                  onChange={(e) => setHealthForm({...healthForm, daySatisfaction: safeParseInt(e.target.value, 5)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
              <div className="form-group">
                <label>Weather</label>
                <select
                  value={healthForm.weather}
                  onChange={(e) => setHealthForm({...healthForm, weather: e.target.value})}
                >
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="snowy">Snowy</option>
                  <option value="windy">Windy</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Main Focus Today</label>
              <input
                type="text"
                value={healthForm.mainFocus}
                onChange={(e) => setHealthForm({...healthForm, mainFocus: e.target.value})}
                placeholder="What was your main focus today?"
              />
            </div>

            <div className="form-group">
              <label>Biggest Challenge Today</label>
              <input
                type="text"
                value={healthForm.dayChallenge}
                onChange={(e) => setHealthForm({...healthForm, dayChallenge: e.target.value})}
                placeholder="What was your biggest challenge today?"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={healthForm.notes}
                onChange={(e) => setHealthForm({...healthForm, notes: e.target.value})}
                placeholder="Any additional observations about your health, mood, or energy? What went well? What could be improved?"
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>AI Analyzing Your Health Data...</span>
                </div>
              ) : (
                'Log Health Data & Get AI Insights'
              )}
            </button>
          </form>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-message">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <div className="success-text">
                <h3>AI Analysis Complete!</h3>
                <p>Your health data has been analyzed and insights are ready below.</p>
                    </div>
                  </div>
              </div>
        )}


        {/* AI Health Score & Visualizations */}
        {healthScore > 0 && (
          <div className="health-visualizations-section" key={`visualizations-${dataRefreshKey}-${healthData.length}-${Date.now()}`}>
            <h2>📊 AI Health Analytics & Visualizations</h2>
            
            {/* Health Score Gauge */}
            <div className="visualization-grid">
              <div className="gauge-container">
                <HealthScoreGauge 
                  score={healthScore} 
                  title="Overall Health Score"
                  height={250}
                />
            </div>
              
              {/* Health Trends Line Chart */}
              {healthData.length > 1 && (
                <div className="trends-container">
                  <AdvancedLineChart
                    data={healthData.slice(0, 7).map((entry, index) => {
                      console.log(`🔍 Entry ${index}:`, entry);
                      return {
                        value: parseInt(entry.energyLevel) || 5
                      };
                    })}
                    title="Energy Level Trends"
                    xLabel="Days"
                    yLabel="Energy Level (1-10)"
                    color="#4ecdc4"
                    height={250}
                  />
          </div>
        )}
            </div>

            {/* Multi-Metric Bar Chart */}
            {healthData.length > 0 && (
              <div className="metrics-container">
                
                <AdvancedBarChart
                  data={[
                    { label: 'Energy', value: (() => {
                        console.log('🔍 Latest energy level:', healthData[0]?.energyLevel);
                        return parseInt(healthData[0]?.energyLevel) || 5;
                      })() },
                    { label: 'Sleep Quality', value: (() => {
                        console.log('🔍 Latest sleep quality:', healthData[0]?.sleepQuality);
                        return parseInt(healthData[0]?.sleepQuality) || 5;
                      })() },
                    { label: 'Stress Level', value: (() => {
                        console.log('🔍 Latest stress level:', healthData[0]?.stressLevel);
                        return parseInt(healthData[0]?.stressLevel) || 5;
                      })() },
                    { label: 'Mood', value: (() => {
                        console.log('🔍 Latest mood:', healthData[0]?.mood);
                        return parseInt(healthData[0]?.mood) || 5;
                      })() },
                    { label: 'Exercise', value: (() => {
                        console.log('🔍 Latest exercise duration:', healthData[0]?.exerciseDuration);
                        return parseInt(healthData[0]?.exerciseDuration) || 0;
                      })() }
                  ]}
                  title="Current Health Metrics"
                  xLabel="Health Metrics"
                  yLabel="Score (1-10) / Minutes"
                  colors={['#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff6b6b']}
                  height={300}
                />
                  </div>
            )}

            {/* Health Distribution Doughnut Chart */}
            {healthData.length > 0 && (
              <div className="distribution-container">
                <AdvancedDoughnutChart
                  data={[
                    { label: 'Excellent (8-10)', value: healthData.filter(d => (parseInt(d.energyLevel) || 5) >= 8).length },
                    { label: 'Good (6-7)', value: healthData.filter(d => (parseInt(d.energyLevel) || 5) >= 6 && (parseInt(d.energyLevel) || 5) < 8).length },
                    { label: 'Fair (4-5)', value: healthData.filter(d => (parseInt(d.energyLevel) || 5) >= 4 && (parseInt(d.energyLevel) || 5) < 6).length },
                    { label: 'Poor (1-3)', value: healthData.filter(d => (parseInt(d.energyLevel) || 5) < 4).length }
                  ]}
                  title="Energy Level Distribution"
                  colors={['#4ecdc4', '#45b7d1', '#feca57', '#ff6b6b']}
                  height={300}
                />
              </div>
            )}

          </div>
        )}


        {/* AI Health Insights Section */}
        {healthInsights && (
          <div className="insights-section">
            <div className="insights-header">
              <h2>🤖 AI Health Insights</h2>
              <button 
                className="save-insights-btn"
                onClick={() => saveInsights(healthInsights)}
                title="Save these insights for later review"
              >
                💾 Save Insights
              </button>
            </div>
            
            <div className="insights-content">
              {parseInsightsIntoBoxes(healthInsights)}
            </div>
          </div>
        )}

        {/* Doctor Referral Triggers */}
        {healthData.length >= 3 && analyzeHealthPatterns() && (
          <div className="doctor-referral-section">
            <div className="referral-header">
              <h2>🚨 When to See a Doctor</h2>
              <p className="referral-subtitle">Based on your recent health patterns, consider consulting a healthcare provider for these concerns:</p>
            </div>
            
            <div className="referral-triggers">
              {analyzeHealthPatterns().map((trigger, index) => (
                <div key={index} className={`referral-trigger ${trigger.severity}`}>
                  <div className="trigger-header">
                    <span className="trigger-icon">
                      {trigger.severity === 'high' ? '🔴' : '🟡'}
                    </span>
                    <h3 className="trigger-title">{trigger.message}</h3>
                  </div>
                  <div className="trigger-recommendation">
                    <p>{trigger.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Insights - Compact Bar */}
        {savedInsights.length > 0 && (
          <div className="saved-insights-bar">
            <div className="saved-insights-header">
              <div className="saved-insights-info">
                <span className="saved-insights-icon">💾</span>
                <span className="saved-insights-title">Saved Health Insights</span>
                <span className="saved-insights-count">({savedInsights.length} saved)</span>
              </div>
              <button 
                className="view-insights-btn"
                onClick={() => setShowSavedInsights(!showSavedInsights)}
              >
                {showSavedInsights ? 'Hide' : 'View'} Insights
              </button>
            </div>
            
            {showSavedInsights && (
              <div className="saved-insights-content">
                <div className="saved-insights-grid">
                  {savedInsights.map((insight) => (
                    <div key={insight.id} className="saved-insight-card">
                      <div className="saved-insight-header">
                        <div className="saved-insight-date">
                          <span className="date">{insight.date}</span>
                          <span className="time">{insight.timestamp}</span>
                        </div>
                        <button 
                          className="delete-insight-btn"
                          onClick={() => deleteInsights(insight.id)}
                          title="Delete this insight"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="saved-insight-content">
                        <div className="organized-insights">
                          {parseInsightsIntoBoxes(insight.insights)}
                        </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
            )}
          </div>
        )}


        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Health Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>💪 Physical Activity</h3>
              <p>Learn about the benefits of regular exercise and how to create a sustainable fitness routine</p>
            </div>
            <div className="resource-card">
              <h3>😴 Sleep Health</h3>
              <p>Understand the importance of quality sleep and how to improve your sleep patterns</p>
            </div>
            <div className="resource-card">
              <h3>🧠 Mental Wellness</h3>
              <p>Discover strategies for managing stress and maintaining good mental health</p>
            </div>
            <div className="resource-card">
              <h3>🥗 Nutrition</h3>
              <p>Learn about balanced nutrition and how it affects your overall health and energy</p>
            </div>
            <div className="resource-card">
              <h3>⚖️ Weight Management</h3>
              <p>Understand BMI, healthy weight ranges, and sustainable weight management strategies</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Health Monitoring</h3>
              <p>Know when to see a healthcare provider and how to track your health effectively</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralHealthTracker;