import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { useProfile } from '../context/ProfileContext';
import './Dashboard.css';

// Import AI Engines
import AIReasoningEngine from '../ai/aiReasoning.js';
import PersonalContextEngine from '../utils/personalContextEngine.js';
import MedicalRulesEngine from '../utils/medicalRulesEngine.js';
import AIServiceManager from '../ai/aiServiceManager.js';
import { testAIEngines, testWithRealData } from '../utils/testAIEngines.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { healthData: localHealthData, addHealthLog } = useHealthData();
  const { profileData: profileDataFromContext, updateProfile } = useProfile();
  
  // Initialize AI Service Manager
  const [aiService] = useState(() => new AIServiceManager());
  
  // AI Service health check
  const checkAIService = useCallback(async () => {
    try {
      const health = await aiService.healthCheck();
      console.log('🏥 AI Service Health:', health);
      return health;
    } catch (error) {
      console.error('❌ AI Service Health Check Failed:', error);
      return { configured: false, error: error.message };
    }
  }, [aiService]);

  // State for AI analysis results
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [aiReminders, setAiReminders] = useState([]);
  const [aiTips, setAiTips] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [showProfileSection, setShowProfileSection] = useState(false);
  
  // Daily log form state
  const [dailyLogForm, setDailyLogForm] = useState({
    mood: '',
    energy: 5,
    sleep: 5,
    sleepHours: 7.5,
    notes: ''
  });
  
  // Symptom log form state
  const [symptomLogForm, setSymptomLogForm] = useState({
    symptoms: [],
    duration: '',
    severity: 5,
    causes: '',
    additionalInfo: ''
  });
  
  // Symptom options
  const SYMPTOM_OPTIONS = [
    { value: 'none', label: 'No Symptoms', icon: '✅' },
    { value: 'headache', label: 'Headache', icon: '🤕' },
    { value: 'fatigue', label: 'Fatigue', icon: '😴' },
    { value: 'nausea', label: 'Nausea', icon: '🤢' },
    { value: 'dizziness', label: 'Dizziness', icon: '💫' },
    { value: 'chest-pain', label: 'Chest Pain', icon: '💔' },
    { value: 'abdominal-pain', label: 'Abdominal Pain', icon: '🤰' },
    { value: 'joint-pain', label: 'Joint Pain', icon: '🦴' },
    { value: 'muscle-pain', label: 'Muscle Pain', icon: '💪' },
    { value: 'fever', label: 'Fever', icon: '🤒' },
    { value: 'cough', label: 'Cough', icon: '😷' },
    { value: 'shortness-of-breath', label: 'Shortness of Breath', icon: '😮‍💨' },
    { value: 'insomnia', label: 'Insomnia', icon: '😵' },
    { value: 'anxiety', label: 'Anxiety', icon: '😰' },
    { value: 'depression', label: 'Depression', icon: '😞' },
    { value: 'irritability', label: 'Irritability', icon: '😤' },
    { value: 'mood-swings', label: 'Mood Swings', icon: '😵‍💫' }
  ];
  
  // Health goals state
  const [healthGoals, setHealthGoals] = useState([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    icon: '🎯',
    deadline: '',
    progress: 0
  });

  // UI State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthForm, setHealthForm] = useState({
    mood: '',
    energy: 5,
    sleep: 5,
    symptoms: [],
    medicationTaken: '',
    notes: ''
  });
  const [profileData, setProfileData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Initialize AI engines
  const aiReasoningEngine = new AIReasoningEngine();
  const personalContextEngine = new PersonalContextEngine();
  const medicalRulesEngine = new MedicalRulesEngine();

  // Get onboarding data from localStorage
  const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
  
  // Safe access to health data with fallbacks
  const safeLocalHealthData = localHealthData || { today: {} };
  
  // Get latest health log from localStorage
  const getLatestHealthLog = () => {
    const healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    return healthLogs.length > 0 ? healthLogs[healthLogs.length - 1] : null;
  };
  
  const latestHealthLog = getLatestHealthLog();

  // Helper functions
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };
  
  const getPersonalizedMessage = () => {
    if (!onboardingData) return 'Welcome to your health journey!';
    
    const age = calculateAge(onboardingData.dateOfBirth);
    const hasConditions = onboardingData.chronicConditions?.length > 0;
    const isActive = onboardingData.lifestyle?.exerciseFrequency !== 'sedentary';
    
    if (hasConditions && isActive) {
      return 'You\'re managing your health proactively. Keep up the great work!';
    } else if (hasConditions) {
      return 'Let\'s work together to optimize your health management.';
    } else if (isActive) {
      return 'Your active lifestyle is setting you up for long-term health success!';
    } else {
      return 'Ready to start your health optimization journey?';
    }
  };
  
  const getDaysActive = () => {
    const healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    const uniqueDays = new Set(healthLogs.map(log => log.timestamp.split('T')[0])).size;
    return uniqueDays || 0;
  };
  
  const getGoalsCount = () => {
    if (!onboardingData?.reproductiveHealth?.currentStatus) return 0;
    return onboardingData.reproductiveHealth.currentStatus.length;
  };
  
  const getNotificationCount = () => {
    // Count high-priority alerts and reminders
    if (!aiAlerts || !Array.isArray(aiAlerts) || !aiReminders || !Array.isArray(aiReminders)) {
      return 0;
    }
    return (aiAlerts.filter(alert => alert.includes('🚨')).length || 0) + 
           (aiReminders.filter(reminder => reminder.includes('Schedule')).length || 0);
  };
  
  const getRecentHealthLogs = () => {
    const healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    return healthLogs.slice(-5).reverse(); // Last 5 logs, newest first
  };
  
  const handleComingSoon = (featureName) => {
    setComingSoonFeature(featureName);
    setShowComingSoonModal(true);
  };
  
  const handleDailyLog = (e) => {
    e.preventDefault();
    const logEntry = {
      ...dailyLogForm,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      type: 'daily-log'
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem('healthLogs', JSON.stringify(existingLogs));
    
    // Reset form
    setDailyLogForm({
      mood: '',
      energy: 5,
      sleep: 5,
      sleepHours: 7.5,
      notes: ''
    });
    
    // Trigger AI analysis
    if (onboardingData && Object.keys(onboardingData).length > 0) {
      performAIAnalysis();
    }
    
    alert('Daily health log saved successfully! AI analysis updated.');
  };
  
  const handleSymptomLog = async (e) => {
    e.preventDefault();
    
    if (symptomLogForm.symptoms.length === 0) {
      alert('Please select at least one symptom.');
      return;
    }
    
    const symptomEntry = {
      ...symptomLogForm,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      type: 'symptom-log'
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    existingLogs.push(symptomEntry);
    localStorage.setItem('healthLogs', JSON.stringify(existingLogs));
    
    // AI symptom analysis
    try {
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        const prompt = `Analyze these symptoms and provide medical insights:
        
Symptoms: ${symptomLogForm.symptoms.join(', ')}
Duration: ${symptomLogForm.duration}
Severity: ${symptomLogForm.severity}/10
Causes: ${symptomLogForm.causes}
Additional Info: ${symptomLogForm.additionalInfo}

User Profile:
- Age: ${calculateAge(onboardingData?.dateOfBirth)} years
- Gender: ${onboardingData?.genderIdentity || 'Not specified'}
- Conditions: ${onboardingData?.chronicConditions?.join(', ') || 'None'}

Provide:
1. Possible causes (medical and lifestyle)
2. When to seek medical attention
3. Home management tips
4. Prevention strategies

Format as: "🔍 [Analysis]: [Specific recommendations]"`;

        const response = await aiService.generateSymptomAnalysis(prompt);
        if (response) {
          alert(`AI Symptom Analysis:\n\n${response}`);
        }
      }
    } catch (error) {
      console.log('LLM failed for symptom analysis');
    }
    
    // Reset form
    setSymptomLogForm({
      symptoms: [],
      duration: '',
      severity: 5,
      causes: '',
      additionalInfo: ''
    });
    
    alert('Symptom log saved and analyzed! Check your insights for AI recommendations.');
  };
  
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.deadline) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const goal = {
      ...newGoal,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    const updatedGoals = [...healthGoals, goal];
    setHealthGoals(updatedGoals);
    localStorage.setItem('healthGoals', JSON.stringify(updatedGoals));
      
      // Reset form
    setNewGoal({
      title: '',
      description: '',
      icon: '🎯',
      deadline: '',
      progress: 0
    });
    
    setShowAddGoalModal(false);
    alert('Health goal added successfully! 🎯');
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! How are you feeling today?';
    if (hour < 17) return 'Good afternoon! How are you feeling today?';
    return 'Good evening! How are you feeling today?';
  };

  const generateHealthTags = () => {
    const tags = [];
    if (onboardingData?.conditions?.length > 0) {
      tags.push(...onboardingData.conditions.slice(0, 3));
    }
    if (onboardingData?.lifestyle?.exercise) {
      tags.push('Active Lifestyle');
    }
    if (onboardingData?.lifestyle?.diet) {
      tags.push('Healthy Diet');
    }
    if (tags.length === 0) {
      tags.push('Getting Started', 'Health Focus', 'Wellness Journey');
    }
    return tags.slice(0, 5);
  };

  const getTagCategory = (tag) => {
    const categories = {
      'PCOS': 'condition',
      'Endometriosis': 'condition',
      'Fibroids': 'condition',
      'Diabetes': 'condition',
      'Hypertension': 'condition',
      'Active Lifestyle': 'lifestyle',
      'Healthy Diet': 'lifestyle',
      'AFAB': 'anatomy',
      'AMAB': 'anatomy',
      'Trans': 'anatomy',
      'Non-binary': 'anatomy',
      'Intersex': 'anatomy'
    };
    return categories[tag] || 'general';
  };

  // REAL AI Health Score calculation
  const getAIHealthScore = () => {
    if (!onboardingData || Object.keys(onboardingData).length === 0) {
      return {
        score: 75,
        level: 'Good',
        factors: ['Limited profile data available'],
        reasoning: 'Your health profile is incomplete. Complete your profile for personalized insights.'
      };
    }

    let baseScore = 80;
    const factors = [];

    // Age-based adjustments
    const age = calculateAge(onboardingData.dateOfBirth);
    if (age && age < 30) baseScore += 10;
    else if (age && age > 50) baseScore -= 5;

    // Chronic conditions analysis
    if (onboardingData.chronicConditions?.length > 0) {
      const conditionCount = onboardingData.chronicConditions.length;
      baseScore -= (conditionCount * 5);
      factors.push(`${conditionCount} chronic condition(s) identified`);
      
      // Specific condition adjustments
      if (onboardingData.chronicConditions.includes('PCOS')) {
        baseScore -= 8;
        factors.push('PCOS requires active management');
      }
      if (onboardingData.chronicConditions.includes('Endometriosis')) {
        baseScore -= 10;
        factors.push('Endometriosis needs specialized care');
      }
      if (onboardingData.chronicConditions.includes('Diabetes')) {
        baseScore -= 15;
        factors.push('Diabetes requires strict monitoring');
      }
    }

    // Lifestyle factors analysis
    if (onboardingData.lifestyle?.exerciseFrequency === 'sedentary') {
      baseScore -= 12;
      factors.push('Sedentary lifestyle - high risk');
    } else if (onboardingData.lifestyle?.exerciseFrequency === 'moderate') {
      baseScore += 8;
      factors.push('Moderate exercise routine');
    } else if (onboardingData.lifestyle?.exerciseFrequency === 'active') {
      baseScore += 15;
      factors.push('Active lifestyle - excellent');
    }

    if (onboardingData.lifestyle?.diet === 'unhealthy') {
      baseScore -= 10;
      factors.push('Unhealthy diet patterns');
    } else if (onboardingData.lifestyle?.diet === 'healthy') {
      baseScore += 10;
      factors.push('Healthy dietary habits');
    }

    if (onboardingData.lifestyle?.tobaccoUse === 'Yes') {
      baseScore -= 20;
      factors.push('Smoking - critical health risk');
    } else if (onboardingData.lifestyle?.tobaccoUse === 'Former') {
      baseScore += 5;
      factors.push('Former smoker - good progress');
    }

    if (onboardingData.lifestyle?.alcoholUse === 'frequent') {
      baseScore -= 8;
      factors.push('Frequent alcohol use');
    }

    if (onboardingData.lifestyle?.sleepQuality === 'poor') {
      baseScore -= 8;
      factors.push('Poor sleep quality');
    } else if (onboardingData.lifestyle?.sleepQuality === 'good') {
      baseScore += 5;
      factors.push('Good sleep habits');
    }

    if (onboardingData.lifestyle?.stressLevel === 'high') {
      baseScore -= 6;
      factors.push('High stress levels');
    }

    // Mental health analysis
    if (onboardingData.mentalHealthConditions?.length > 0) {
      const mentalHealthCount = onboardingData.mentalHealthConditions.length;
      baseScore -= (mentalHealthCount * 4);
      factors.push(`${mentalHealthCount} mental health condition(s)`);
    }

    // Reproductive health analysis
    if (onboardingData.reproductiveHealth?.cycleRegularity === 'irregular') {
      baseScore -= 5;
      factors.push('Irregular menstrual cycles');
    }

    if (onboardingData.reproductiveHealth?.painfulPeriods === 'yes') {
      baseScore -= 6;
      factors.push('Painful periods - needs attention');
    }

    // Medication and treatment analysis
    if (onboardingData.currentMedications?.length > 0) {
      baseScore += 3;
      factors.push('Medication management active');
    }

    if (onboardingData.hormoneTherapy === 'Yes') {
      baseScore += 2;
      factors.push('Hormone therapy monitoring');
    }

    // Emergency contact factor removed - not needed

    // Ensure score stays within bounds
    const finalScore = Math.max(0, Math.min(100, baseScore));
    
    // Determine level and reasoning
    let level, reasoning;
    
    if (finalScore >= 90) {
      level = 'EXCELLENT';
      reasoning = 'Your health profile shows exceptional indicators. Maintain your current healthy habits and continue regular check-ups for sustained wellness.';
    } else if (finalScore >= 80) {
      level = 'VERY GOOD';
      reasoning = 'Your health profile shows positive indicators with room for optimization. Focus on the areas identified below to reach excellent health.';
    } else if (finalScore >= 70) {
      level = 'GOOD';
      reasoning = 'Your health profile shows good foundation with several areas for improvement. Address the factors below to enhance your overall health score.';
    } else if (finalScore >= 60) {
      level = 'FAIR';
      reasoning = 'Your health profile shows moderate risk factors that need attention. Focus on the critical areas below to improve your health outcomes.';
    } else if (finalScore >= 40) {
      level = 'POOR';
      reasoning = 'Your health profile shows significant risk factors requiring immediate attention. Consult healthcare providers and address the critical issues below.';
    } else {
      level = 'CRITICAL';
      reasoning = 'Your health profile shows critical risk factors requiring immediate medical attention. Schedule comprehensive health evaluation immediately.';
    }

    return {
      score: finalScore,
      level: level,
      factors: factors.slice(0, 5), // Top 5 factors
      reasoning: reasoning
    };
  };

  const aiHealthScore = getAIHealthScore();
  const healthTags = generateHealthTags();

  // Gender identity checks
  const isFemale = onboardingData?.genderIdentity === 'AFAB' || onboardingData?.genderIdentity === 'Female';
  const isMale = onboardingData?.genderIdentity === 'AMAB' || onboardingData?.genderIdentity === 'Male';
  const isTrans = onboardingData?.genderIdentity === 'Trans' || onboardingData?.genderIdentity === 'Non-binary' || onboardingData?.genderIdentity === 'Intersex';



  const performAIAnalysis = useCallback(async () => {
    if (!onboardingData || Object.keys(onboardingData).length === 0) {
      console.log('❌ No onboarding data available for AI analysis');
      setAiError('No onboarding data available');
      return;
    }
    
    // Prevent multiple simultaneous AI analysis calls
    if (isAnalyzing) {
      console.log('⏳ AI analysis already in progress, skipping...');
      return;
    }
    
    console.log('🚀 Starting AI analysis with data:', onboardingData);
    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      // Simple analysis without external engines
      const combinedAnalysis = {
        timestamp: new Date().toISOString(),
        userData: onboardingData,
        healthLogs: getRecentHealthLogs()
      };
    
      setAiAnalysis(combinedAnalysis);
      setLastAnalysisTime(new Date().toISOString());
      
      // Extract specific insights (now async)
      console.log('🔍 Extracting AI insights...');
      const insights = await extractAIInsights(combinedAnalysis);
      console.log('✅ Insights extracted:', insights);
      
      console.log('🚨 Extracting AI alerts...');
      const alerts = extractAIAlerts(combinedAnalysis);
      console.log('✅ Alerts extracted:', alerts);
      
      console.log('⏰ Extracting AI reminders...');
      const reminders = await extractAIReminders(combinedAnalysis);
      console.log('✅ Reminders extracted:', reminders);
      
      console.log('💡 Extracting AI tips...');
      const tips = await extractAITips(combinedAnalysis);
      console.log('✅ Tips extracted:', tips);
      
      // Set all AI outputs with a small delay to prevent rapid state changes
      setTimeout(() => {
        setAiInsights(insights);
        setAiAlerts(alerts);
        setAiReminders(reminders);
        setAiTips(tips);
        
        console.log('🎉 AI analysis completed successfully!');
        setAiError(null);
      }, 100); // Small delay to prevent rapid re-renders
      
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      setAiError('AI analysis failed. Please try again or contact support.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onboardingData]);

  const extractAIInsights = async (analysis) => {
    console.log('🔍 extractAIInsights called with:', analysis);
    
    // REAL AI ANALYSIS - Using actual onboarding data
    if (!onboardingData || Object.keys(onboardingData).length === 0) {
      console.log('❌ No onboarding data available');
      return ['Complete your health profile to receive personalized AI insights tailored to your specific conditions and lifestyle factors.'];
    }
    
    // Get real user data
    const age = calculateAge(onboardingData?.dateOfBirth);
    const gender = onboardingData?.genderIdentity;
    const conditions = onboardingData?.chronicConditions || [];
    const lifestyle = onboardingData?.lifestyle || {};
    const mentalHealth = onboardingData?.mentalHealthConditions || [];
    const reproductive = onboardingData?.reproductiveHealth || {};
    const medications = onboardingData?.currentMedications || [];
    const recentLogs = getRecentHealthLogs().slice(0, 3);
    
    console.log('📊 User data for insights:', { age, gender, conditions, lifestyle, mentalHealth, reproductive, medications, recentLogs });
    
    // Using Gemini Pro for real AI insights
    try {
      console.log('🤖 Using Gemini Pro for real AI insights...');
      const prompt = `Generate 5 personalized health insights for this user profile. Be medically accurate, inclusive, and actionable.
        
User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Mental Health: ${mentalHealth.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}, Alcohol ${lifestyle.alcoholUse || 'Not specified'}
- Reproductive Health: ${reproductive.currentStatus?.join(', ') || 'Not specified'}
- Current Medications: ${medications.join(', ') || 'None'}
- Goals: ${onboardingData?.healthGoals?.join(', ') || 'General wellness'}

Recent Health Logs:
${recentLogs.map(log => `- ${log.type}: ${log.mood || 'N/A'}, Energy: ${log.energy || 'N/A'}/10, Sleep: ${log.sleep || 'N/A'}/10`).join('\n')}

Generate insights that:
1. Combine multiple factors (age + conditions + lifestyle + gender + recent logs)
2. Are medically relevant and evidence-based
3. Include specific actionable recommendations
4. Are inclusive for all gender identities
5. Address the user's specific health profile

Format each insight as: "🔴/🟡/🟢 [Title]: [Specific recommendation with actionable steps]"

Return exactly 5 insights, one per line:`;

      const response = await aiService.generateHealthInsights(prompt);
      if (response && response.length > 0) {
        console.log('✅ Gemini insights received:', response);
        return response.slice(0, 5);
      } else {
        throw new Error('Gemini returned empty response');
      }
    } catch (error) {
      console.error('❌ Gemini API failed:', error);
      // Return error message instead of hardcoded fallbacks
      return [`AI Analysis Error: Unable to generate insights. Please check your Gemini API key and try again. Error: ${error.message}`];
    }

  };

  const extractAIAlerts = async (analysis) => {
    console.log('🚨 extractAIAlerts called with:', analysis);
    
    // Using Gemini Pro for real AI alerts
    try {
      if (!onboardingData || Object.keys(onboardingData).length === 0) {
        return ['Complete your health profile to receive personalized AI alerts.'];
      }
      
      console.log('🤖 Using Gemini Pro for real AI alerts...');
      const age = calculateAge(onboardingData?.dateOfBirth);
      const gender = onboardingData?.genderIdentity;
      const conditions = onboardingData?.chronicConditions || [];
      const lifestyle = onboardingData?.lifestyle || {};
      const mentalHealth = onboardingData?.mentalHealthConditions || [];
      const medications = onboardingData?.currentMedications || [];
      const recentLogs = getRecentHealthLogs().slice(0, 3);
      
      const prompt = `Generate 3-5 urgent health alerts for this user profile. Focus on high-priority medical concerns.
        
User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Mental Health: ${mentalHealth.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}, Alcohol ${lifestyle.alcoholUse || 'Not specified'}
- Current Medications: ${medications.join(', ') || 'None'}

Recent Health Logs:
${recentLogs.map(log => `- ${log.type}: ${log.mood || 'N/A'}, Energy: ${log.energy || 'N/A'}/10, Sleep: ${log.sleep || 'N/A'}/10`).join('\n')}

Generate alerts that:
1. Identify urgent medical concerns requiring immediate attention
2. Are based on user's specific health profile and recent logs
3. Include specific actionable steps
4. Use appropriate urgency levels (🚨 HIGH PRIORITY, ⚠️ MEDIUM PRIORITY, 💊 CONDITION ALERT, 🔍 SCREENING ALERT)

Return 3-5 alerts, one per line:`;

      const response = await aiService.generateHealthAlerts(prompt);
      if (response && response.length > 0) {
        console.log('✅ Gemini alerts received:', response);
        return response.slice(0, 5);
      } else {
        throw new Error('Gemini returned empty response');
      }
    } catch (error) {
      console.error('❌ Gemini API failed for alerts:', error);
      return [`AI Analysis Error: Unable to generate alerts. Please check your Gemini API key and try again. Error: ${error.message}`];
    }
  };

  const extractAIReminders = async (analysis) => {
    console.log('⏰ extractAIReminders called with:', analysis);
    
    // Using Gemini Pro for real AI reminders
    try {
      if (!onboardingData || Object.keys(onboardingData).length === 0) {
        return ['Complete your health profile to receive personalized reminders and screening recommendations.'];
      }
      
      console.log('🤖 Using Gemini Pro for real AI reminders...');
      const age = calculateAge(onboardingData?.dateOfBirth);
      const gender = onboardingData?.genderIdentity;
      const conditions = onboardingData?.chronicConditions || [];
      const lifestyle = onboardingData?.lifestyle || {};
      const medications = onboardingData?.currentMedications || [];
      const reproductive = onboardingData?.reproductiveHealth || {};
      const recentLogs = getRecentHealthLogs().slice(0, 3);
      
      const prompt = `Generate 5 personalized health reminders for this user profile. Focus on screenings, appointments, and health monitoring.
        
User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Current Medications: ${medications.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}
- Reproductive Health: ${reproductive.currentStatus?.join(', ') || 'Not specified'}
- Goals: ${onboardingData?.healthGoals?.join(', ') || 'General wellness'}

Recent Health Logs:
${recentLogs.map(log => `- ${log.type}: ${log.mood || 'N/A'}, Energy: ${log.energy || 'N/A'}/10, Sleep: ${log.sleep || 'N/A'}/10`).join('\n')}

Generate reminders that:
1. Are age-appropriate and gender-inclusive
2. Include specific screening recommendations
3. Address chronic condition monitoring
4. Include lifestyle modification reminders
5. Are actionable with specific timeframes

Format each reminder as: "📅 [Specific reminder with timeframe]"

Return exactly 5 reminders, one per line:`;

      const response = await aiService.generateHealthReminders(prompt);
      if (response && response.length > 0) {
        console.log('✅ Gemini reminders received:', response);
        return response.slice(0, 5);
      } else {
        throw new Error('Gemini returned empty response');
      }
    } catch (error) {
      console.error('❌ Gemini API failed for reminders:', error);
      return [`AI Analysis Error: Unable to generate reminders. Please check your Gemini API key and try again. Error: ${error.message}`];
    }
  };

  const extractAITips = async (analysis) => {
    console.log('💡 extractAITips called with:', analysis);
    
    // Using Gemini Pro for real AI tips
    try {
      if (!onboardingData || Object.keys(onboardingData).length === 0) {
        return ['Complete your health profile to receive personalized health tips and recommendations.'];
      }
      
      console.log('🤖 Using Gemini Pro for real AI tips...');
      const age = calculateAge(onboardingData?.dateOfBirth);
      const gender = onboardingData?.genderIdentity;
      const conditions = onboardingData?.chronicConditions || [];
      const lifestyle = onboardingData?.lifestyle || {};
      const mentalHealth = onboardingData?.mentalHealthConditions || [];
      const reproductive = onboardingData?.reproductiveHealth || {};
      const recentLogs = getRecentHealthLogs().slice(0, 3);
      
      const prompt = `Generate 5 personalized health tips for this user profile. Focus on practical, evidence-based recommendations.
        
User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Mental Health: ${mentalHealth.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Sleep ${lifestyle.sleepQuality || 'Not specified'}, Stress ${lifestyle.stressLevel || 'Not specified'}
- Reproductive Health: ${reproductive.currentStatus?.join(', ') || 'Not specified'}
- Goals: ${onboardingData?.healthGoals?.join(', ') || 'General wellness'}

Recent Health Logs:
${recentLogs.map(log => `- ${log.type}: ${log.mood || 'N/A'}, Energy: ${log.energy || 'N/A'}/10, Sleep: ${log.sleep || 'N/A'}/10`).join('\n')}

Generate tips that:
1. Address the user's specific conditions and lifestyle
2. Include practical, actionable steps
3. Are evidence-based and medically sound
4. Are inclusive for all gender identities
5. Focus on prevention and management

Format each tip as: "💡 [Specific tip with actionable steps]"

Return exactly 5 tips, one per line:`;

      const response = await aiService.generateHealthTips(prompt);
      if (response && response.length > 0) {
        console.log('✅ Gemini tips received:', response);
        return response.slice(0, 5);
      } else {
        throw new Error('Gemini returned empty response');
      }
    } catch (error) {
      console.error('❌ Gemini API failed for tips:', error);
      return [`AI Analysis Error: Unable to generate tips. Please check your Gemini API key and try again. Error: ${error.message}`];
    }
  };

  // Quick Actions
  const getQuickActions = () => [
    {
      icon: '📝',
      label: 'Log Health',
      action: () => setShowHealthModal(true)
    },
    {
      icon: '🔍',
      label: 'View Insights',
      action: () => alert('AI Insights are displayed above!')
    },
    {
      icon: '📊',
      label: 'Health Score',
      action: () => alert(`Your current AI Health Score: ${aiHealthScore.score}/100`)
    },
    {
      icon: '⚡',
      label: 'Quick Check',
      action: () => performAIAnalysis()
    }
  ];

  // Event handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHealthLog = (e) => {
    e.preventDefault();
    
    // Create comprehensive health log
    const healthLog = {
      ...healthForm,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous'
    };
    
    // Save to localStorage for persistence
    const existingLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
    existingLogs.push(healthLog);
    localStorage.setItem('healthLogs', JSON.stringify(existingLogs));
    
    // Add to context if available
    if (addHealthLog) {
      addHealthLog(healthForm);
    }
    
    // Trigger AI analysis with new data
    if (onboardingData && Object.keys(onboardingData).length > 0) {
      performAIAnalysis();
    }
    
    setShowHealthModal(false);
    setHealthForm({ mood: '', energy: 5, sleep: 5, symptoms: [], medicationTaken: '', notes: '' });
    
    // Show success message
    alert('Health log saved successfully! AI analysis updated with new data.');
  };

  // Effects
  useEffect(() => {
    // Check AI service health on component mount
    checkAIService();
    
    if (user && onboardingData && Object.keys(onboardingData).length > 0) {
      // Only run AI analysis once when component mounts or data changes
      const timer = setTimeout(() => {
        performAIAnalysis();
      }, 1000); // Restored to 1000ms for stability
      
      return () => clearTimeout(timer);
    }
  }, [user, onboardingData, checkAIService]);

  // Render functions
  const renderAIInsights = () => {
    // Stable loading state to prevent layout shifts
    if (!aiInsights || !Array.isArray(aiInsights) || aiInsights.length === 0) {
      // Only trigger AI analysis once when needed
      if (onboardingData && Object.keys(onboardingData).length > 0 && !window.aiAnalysisTriggered) {
        window.aiAnalysisTriggered = true;
        // Restored delay for stability
        setTimeout(() => {
          performAIAnalysis();
        }, 1000); // Restored to 1000ms for stability
      }
      
      return (
        <div className="insight-card loading-state" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner">🔄</div>
          <p>AI is analyzing your health data...</p>
        </div>
      );
    }

    return aiInsights.map((insight, index) => (
      <div key={index} className="insight-card">
        <div className="insight-icon">💡</div>
        <p>{insight}</p>
      </div>
    ));
  };

  const renderAIAlerts = () => {
    if (!aiAlerts || !Array.isArray(aiAlerts) || aiAlerts.length === 0) {
      return (
        <div className="alert-card empty-state">
          <p>No urgent alerts at this time</p>
        </div>
      );
    }

    return aiAlerts.map((alert, index) => (
      <div key={index} className="alert-card">
        <div className="alert-icon">🚨</div>
        <p>{alert}</p>
      </div>
    ));
  };

  const renderAIReminders = () => {
    if (!aiReminders || !Array.isArray(aiReminders) || aiReminders.length === 0) {
      return (
        <div className="reminder-card empty-state">
          <p>No personalized reminders available</p>
        </div>
      );
    }

    return aiReminders.map((reminder, index) => (
      <div key={index} className="reminder-card">
        <div className="reminder-icon">⏰</div>
        <p>{reminder}</p>
      </div>
    ));
  };

  const renderAITips = () => {
    if (!aiTips || !Array.isArray(aiTips) || aiTips.length === 0) {
      return (
        <div className="tip-card empty-state">
          <p>No personalized tips available</p>
        </div>
      );
    }

    return aiTips.map((tip, index) => (
      <div key={index} className="tip-card">
        <div className="tip-icon">💡</div>
        <p>{tip}</p>
      </div>
    ));
  };

  const renderPersonalProfile = () => (
    <section className="personal-profile">
      <h2>Personal Profile</h2>
      <div className="profile-content">
        <div className="profile-picture-section">
          <div className="profile-picture" onClick={() => setIsEditingProfile(true)}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
          </div>
          <button className="upload-picture-btn" onClick={() => setIsEditingProfile(true)}>
            Upload Picture
          </button>
        </div>

        <div className="profile-details">
          <div className="profile-field">
            <label>Full Name</label>
            <input
              type="text"
              value={profileData.fullName || user?.fullName || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email || user?.email || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>

          <div className="profile-field">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profileData.dateOfBirth || onboardingData?.dateOfBirth || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              disabled={!isEditingProfile}
            />
          </div>

          <div className="profile-field">
            <label>Gender Identity</label>
            <select
              value={profileData.genderIdentity || onboardingData?.genderIdentity || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, genderIdentity: e.target.value }))}
              disabled={!isEditingProfile}
            >
              <option value="">Select gender identity</option>
              <option value="AFAB">AFAB</option>
              <option value="AMAB">AMAB</option>
              <option value="Trans">Trans</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Intersex">Intersex</option>
            </select>
          </div>

          {/* Emergency contact section removed - not needed */}

          <div className="profile-actions">
            {isEditingProfile ? (
              <>
                <button
                  className="save-btn"
                  onClick={() => {
                    updateProfile(profileData);
                    setIsEditingProfile(false);
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="edit-btn"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // Main dashboard content
  const renderDashboardContent = () => {
    return (
    <>
        {/* Professional Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
            <div className="welcome-left">
              <div className="greeting-container">
                <h1 className="welcome-greeting">
                  Good {getTimeOfDay()}, {user?.fullName?.split(' ')[0] || 'there'}
                </h1>
                <p className="welcome-subtitle">
                  {getPersonalizedMessage()}
                </p>
          </div>
              
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <span className="stat-value">{aiHealthScore?.score || '--'}</span>
                    <span className="stat-label">Health Score</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <span className="stat-value">{getDaysActive()}</span>
                    <span className="stat-label">Days Active</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <span className="stat-value">{getGoalsCount()}</span>
                    <span className="stat-label">Goals Set</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="welcome-right">
              <div className="notification-center">
                <button className="notification-btn" onClick={() => setShowNotifications(true)}>
                  <span className="bell-icon">🔔</span>
                  {getNotificationCount() > 0 && (
                    <span className="notification-badge">{getNotificationCount()}</span>
                  )}
            </button>
              </div>
              
              <div className="user-profile">
                <div className="profile-avatar" onClick={() => setShowProfile(true)}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

              </div>
          </div>
        </div>
      </section>

        {/* AI Health Score Section */}
        <section className="health-score-section">
          <div className="score-container">
            <div className="score-main">
              <div className="score-circle">
                <span className="score-number">{aiHealthScore.score}</span>
                <span className="score-label">AI Health Score</span>
                <div className="score-level">{aiHealthScore.level}</div>
              </div>
            </div>
            
            <div className="score-details">
              <div className="score-breakdown">
                <h3>Score Breakdown</h3>
                <div className="score-factors">
                  {aiHealthScore.factors.map((factor, index) => (
                    <div key={index} className="score-factor">
                      <span className="factor-text">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="ai-reasoning">
                <h4>AI Reasoning</h4>
                <p>{aiHealthScore.reasoning}</p>
              </div>
            </div>
          </div>
        </section>



        

      {/* Today's Overview */}
      <section className="overview-section">
        <h2>Today's Overview</h2>
        <div className="overview-grid">
                     <div className="overview-card">
             <div className="overview-icon">😊</div>
             <div className="overview-content">
               <h3>Mood</h3>
                 <p>{latestHealthLog?.mood ? latestHealthLog.mood.charAt(0).toUpperCase() + latestHealthLog.mood.slice(1) : 'Not logged'}</p>
             </div>
           </div>
           <div className="overview-card">
             <div className="overview-icon">⚡</div>
             <div className="overview-content">
               <h3>Energy</h3>
                 <p>{latestHealthLog?.energy ? `${latestHealthLog.energy}/10` : 'Not logged'}</p>
             </div>
           </div>
           <div className="overview-card">
             <div className="overview-icon">😴</div>
             <div className="overview-content">
               <h3>Sleep</h3>
                 <p>{latestHealthLog?.sleep ? `${latestHealthLog.sleep}/10` : 'Not logged'}</p>
             </div>
           </div>
           <div className="overview-card">
             <div className="overview-icon">🏃</div>
             <div className="overview-content">
               <h3>Activity</h3>
               <p>Coming Soon</p>
             </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

        {/* Activity Timeline */}
        <section className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-timeline">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <h3>Health Logged</h3>
                <p>Mood: Good, Energy: 8/10, Sleep: 7/10</p>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🤖</div>
              <div className="activity-content">
                <h3>AI Analysis Complete</h3>
                <p>Generated 5 insights, 3 reminders, 2 tips</p>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-content">
                <h3>Profile Updated</h3>
                <p>Profile information updated</p>
                <div className="activity-time">3 days ago</div>
              </div>
            </div>
          </div>
        </section>

        {/* Health Goals Section */}
        <section className="goals-section">
          <h2>🎯 Health Goals</h2>
          <div className="goals-container">
            {healthGoals.length > 0 ? (
              <div className="goals-grid">
                {healthGoals.map((goal, index) => (
                  <div key={index} className="goal-card">
                    <div className="goal-header">
                      <span className="goal-icon">{goal.icon}</span>
                      <h3>{goal.title}</h3>
                    </div>
                    <p className="goal-description">{goal.description}</p>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${goal.progress}%`}}
                        ></div>
                      </div>
                      <span className="progress-text">{goal.progress}%</span>
                    </div>
                    <div className="goal-deadline">
                      <span className="deadline-label">Target:</span>
                      <span className="deadline-date">{goal.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-goals">
                <div className="no-goals-icon">🎯</div>
                <h3>No health goals set yet</h3>
                <p>Set personalized health goals to track your progress</p>
                <button 
                  className="add-goal-btn"
                  onClick={() => setShowAddGoalModal(true)}
                >
                  + Add Your First Goal
                </button>
              </div>
            )}
            
            {healthGoals.length > 0 && (
              <button 
                className="add-goal-btn secondary"
                onClick={() => setShowAddGoalModal(true)}
              >
                + Add Another Goal
              </button>
            )}
        </div>
      </section>

      {/* Health Modules */}
      <section className="health-modules-section">
        <h2>Health Modules</h2>
        <div className="modules-grid">
          {isFemale && (
            <>
              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">🩸</span>
                  <h3>Cycle Tracker</h3>
                </div>
                <div className="module-content">
                  <p>Track your menstrual cycle and fertility</p>
                  <div className="module-status">
                    <span className="status-dot active"></span>
                    <span>Last logged: 2 days ago</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Cycle Tracker')}>
                   Coming Soon
                 </button>
              </div>

              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">👶</span>
                  <h3>Fertility Insights</h3>
                </div>
                <div className="module-content">
                  <p>Monitor your fertility window and ovulation</p>
                  <div className="module-status">
                    <span className="status-dot warning"></span>
                    <span>Fertile window: Days 12-16</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Fertility Tracker')}>
                   Coming Soon
                 </button>
              </div>
            </>
          )}

          {isMale && (
            <>
              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">🔬</span>
                  <h3>Prostate Health</h3>
                </div>
                <div className="module-content">
                  <p>Monitor your prostate health and screenings</p>
                  <div className="module-status">
                    <span className="status-dot inactive"></span>
                    <span>Next check: Due</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Prostate Health')}>
                   Coming Soon
                 </button>
              </div>

              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">💪</span>
                  <h3>Testosterone Tracking</h3>
                </div>
                <div className="module-content">
                  <p>Monitor your testosterone levels and symptoms</p>
                  <div className="module-status">
                    <span className="status-dot active"></span>
                    <span>Last check: 1 month ago</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Testosterone Tracker')}>
                   Coming Soon
                 </button>
              </div>
            </>
          )}

          {isTrans && (
            <>
              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">💉</span>
                  <h3>Hormone Therapy</h3>
                </div>
                <div className="module-content">
                  <p>Track your hormone therapy and side effects</p>
                  <div className="module-status">
                    <span className="status-dot active"></span>
                    <span>Next dose: Tomorrow</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Hormone Tracker')}>
                   Coming Soon
                 </button>
              </div>

              <div className="module-card">
                <div className="module-header">
                  <span className="module-icon">🌈</span>
                  <h3>Gender-Affirming Care</h3>
                </div>
                <div className="module-content">
                  <p>Access gender-affirming health resources</p>
                  <div className="module-status">
                    <span className="status-dot active"></span>
                    <span>Care plan: Active</span>
                  </div>
                </div>
                                  <button className="module-action" onClick={() => handleComingSoon('Gender-Affirming Care')}>
                   Coming Soon
                 </button>
              </div>
            </>
          )}

          {/* Universal Modules */}
          <div className="module-card">
            <div className="module-header">
              <span className="module-icon">😴</span>
              <h3>Sleep Tracking</h3>
            </div>
            <div className="module-content">
              <p>Monitor your sleep quality and patterns</p>
              <div className="module-status">
                <span className="status-dot active"></span>
                <span>Last night: 7.5 hours</span>
              </div>
            </div>
                              <button className="module-action" onClick={() => handleComingSoon('Sleep Tracker')}>
                   Coming Soon
                 </button>
          </div>

          <div className="module-card">
            <div className="module-header">
              <span className="module-icon">🧠</span>
              <h3>Mental Health</h3>
            </div>
            <div className="module-content">
              <p>Track your mood and mental well-being</p>
              <div className="module-status">
                <span className="status-dot active"></span>
                <span>Last check: Today</span>
              </div>
            </div>
                              <button className="module-action" onClick={() => handleComingSoon('Mental Health Tracker')}>
                   Coming Soon
                 </button>
          </div>
        </div>
      </section>
      </>
    );
  };

  // Render profile content
  const renderProfileContent = () => (
    <>
      <section className="profile-header-section">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and preferences</p>
      </section>
      {renderPersonalProfile()}
    </>
  );
  
  // Render log content
    const renderLogContent = () => (
    <div className="log-content">
      <section className="log-header">
        <h1>Health Logging</h1>
        <p>Track your daily health metrics and symptoms</p>
      </section>
      
      <section className="daily-log-section">
        <h2>Daily Health Log</h2>
        <div className="log-form-container">
          <form onSubmit={handleDailyLog} className="daily-log-form">
            <div className="form-row">
              <div className="form-group">
                <label>How are you feeling today? 😊</label>
                <select 
                  value={dailyLogForm.mood} 
                  onChange={(e) => setDailyLogForm({...dailyLogForm, mood: e.target.value})}
                  required
                >
                  <option value="">Select mood</option>
                  <option value="excellent">Excellent 😄</option>
                  <option value="good">Good 🙂</option>
                  <option value="okay">Okay 😐</option>
                  <option value="bad">Bad 😔</option>
                  <option value="terrible">Terrible 😢</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Energy Level ⚡</label>
                <div className="energy-slider-container">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={dailyLogForm.energy} 
                    onChange={(e) => setDailyLogForm({...dailyLogForm, energy: parseInt(e.target.value)})}
                    className="energy-slider"
                  />
                  <span className="energy-value">{dailyLogForm.energy}/10</span>
              </div>
            </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Sleep Quality 😴</label>
                <div className="sleep-slider-container">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={dailyLogForm.sleep} 
                    onChange={(e) => setDailyLogForm({...dailyLogForm, sleep: parseInt(e.target.value)})}
                    className="sleep-slider"
                  />
                  <span className="sleep-value">{dailyLogForm.sleep}/10</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Sleep Duration (hours)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="24" 
                  step="0.5"
                  value={dailyLogForm.sleepHours} 
                  onChange={(e) => setDailyLogForm({...dailyLogForm, sleepHours: parseFloat(e.target.value)})}
                  placeholder="7.5"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea 
                value={dailyLogForm.notes} 
                onChange={(e) => setDailyLogForm({...dailyLogForm, notes: e.target.value})}
                placeholder="How was your day? Any specific health observations?"
                rows="3"
              />
            </div>
            
            <button type="submit" className="submit-log-btn">
              📝 Save Daily Log
            </button>
          </form>
        </div>
      </section>

      <section className="symptoms-section">
        <h2>Symptom Tracker 🤒</h2>
        <div className="symptoms-form-container">
          <form onSubmit={handleSymptomLog} className="symptoms-form">
            <div className="form-row">
              <div className="form-group">
                <label>Select Symptoms</label>
                <div className="symptoms-checklist">
                  {SYMPTOM_OPTIONS.map(symptom => (
                    <label key={symptom.value} className="symptom-checkbox">
                      <input 
                        type="checkbox" 
                        value={symptom.value}
                        checked={symptomLogForm.symptoms.includes(symptom.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSymptomLogForm({
                              ...symptomLogForm, 
                              symptoms: [...symptomLogForm.symptoms, symptom.value]
                            });
                          } else {
                            setSymptomLogForm({
                              ...symptomLogForm, 
                              symptoms: symptomLogForm.symptoms.filter(s => s !== symptom.value)
                            });
                          }
                        }}
                      />
                      <span className="symptom-icon">{symptom.icon}</span>
                      {symptom.label}
                    </label>
                  ))}
            </div>
              </div>
          </div>
          
            <div className="form-row">
              <div className="form-group">
                <label>How long have you been experiencing this?</label>
                <select 
                  value={symptomLogForm.duration} 
                  onChange={(e) => setSymptomLogForm({...symptomLogForm, duration: e.target.value})}
                  required
                >
                  <option value="">Select duration</option>
                  <option value="less-than-1-hour">Less than 1 hour</option>
                  <option value="1-6-hours">1-6 hours</option>
                  <option value="6-24-hours">6-24 hours</option>
                  <option value="1-3-days">1-3 days</option>
                  <option value="3-7-days">3-7 days</option>
                  <option value="more-than-1-week">More than 1 week</option>
                </select>
            </div>
              
              <div className="form-group">
                <label>Severity Level</label>
                <div className="severity-slider-container">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={symptomLogForm.severity} 
                    onChange={(e) => setSymptomLogForm({...symptomLogForm, severity: parseInt(e.target.value)})}
                    className="severity-slider"
                  />
                  <span className="severity-value">{symptomLogForm.severity}/10</span>
          </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>What do you think caused this?</label>
              <textarea 
                value={symptomLogForm.causes} 
                onChange={(e) => setSymptomLogForm({...symptomLogForm, causes: e.target.value})}
                placeholder="Stress, food, exercise, medication, etc."
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label>Additional Information</label>
              <textarea 
                value={symptomLogForm.additionalInfo} 
                onChange={(e) => setSymptomLogForm({...symptomLogForm, additionalInfo: e.target.value})}
                placeholder="Any other details that might help understand your symptoms?"
                rows="3"
              />
            </div>
            
            <button type="submit" className="submit-symptom-btn">
              🔍 Analyze Symptoms with AI
            </button>
          </form>
        </div>
      </section>

      <section className="recent-logs">
        <h2>Recent Health Logs</h2>
        <div className="logs-list">
          {getRecentHealthLogs().map((log, index) => (
            <div key={index} className="log-item">
              <div className="log-header-info">
                <span className="log-date">{new Date(log.timestamp).toLocaleDateString()}</span>
                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="log-details">
                <span className="log-mood">Mood: {log.mood}</span>
                <span className="log-energy">Energy: {log.energy}/10</span>
                <span className="log-sleep">Sleep: {log.sleep}/10</span>
            </div>
              {log.symptoms?.length > 0 && (
                <div className="log-symptoms">
                  Symptoms: {log.symptoms.join(', ')}
            </div>
          )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
  
  // Render insights content
  const renderInsightsContent = () => (
    <div className="insights-content">
      <section className="insights-header">
        <h1>AI Health Insights</h1>
        <p>Personalized analysis of your health data</p>
      </section>
      
      <section className="ai-insights-section">
        <h2>🤖 AI-Powered Health Insights</h2>
        <div className="insights-grid">
          {renderAIInsights()}
        </div>
        
        {/* Force AI Analysis Button */}
        <div className="force-ai-section">
          <button 
            className="force-ai-btn"
            onClick={() => {
              console.log('🚀 Force triggering AI analysis...');
              performAIAnalysis();
            }}
          >
            🔄 Force AI Analysis
          </button>
          <p className="force-ai-info">Click to manually trigger AI analysis</p>
        </div>
      </section>
      
      <section className="ai-alerts-section">
        <h2>🚨 AI Health Alerts</h2>
        <div className="alerts-grid">
          {renderAIAlerts()}
        </div>
      </section>

      <section className="ai-tips-section">
        <h2>💡 AI Health Tips</h2>
        <div className="tips-grid">
          {renderAITips()}
        </div>
      </section>
      
      <section className="ai-reminders-section">
        <h2>⏰ AI Health Reminders</h2>
        <div className="reminders-grid">
          {renderAIReminders()}
        </div>
      </section>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'dashboard' && renderDashboardContent()}
        {activeTab === 'log' && renderLogContent()}
        {activeTab === 'insights' && renderInsightsContent()}
        {activeTab === 'profile' && renderProfileContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-label">Log</span>
        </button>
        
                 <button 
          className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('insights');
            // Auto-trigger AI analysis when Insights tab is opened
            if (onboardingData && Object.keys(onboardingData).length > 0 && aiInsights.length === 0) {
              console.log('🚀 Auto-triggering AI analysis for Insights tab');
              // Increased delay to prevent rapid re-renders and shaking
              setTimeout(() => performAIAnalysis(), 1000); // Increased from 100ms to 1000ms for stability
            }
          }}
         >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Insights</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>

              {/* Floating Action Button */}
        <button className="fab" onClick={() => setShowHealthModal(true)}>
          +
        </button>
        
        {/* Professional Coming Soon Modal */}
        {showComingSoonModal && (
          <div className="modal-overlay" onClick={() => setShowComingSoonModal(false)}>
            <div className="modal coming-soon-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🚀 {comingSoonFeature}</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowComingSoonModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="coming-soon-icon">🔮</div>
                <h4>This feature is coming soon!</h4>
                <p>We're working hard to bring you {comingSoonFeature.toLowerCase()}. This will be a powerful tool that integrates with your health data to provide personalized insights and tracking.</p>
                
                <div className="feature-preview">
                  <h5>What to expect:</h5>
                  <ul>
                    <li>Advanced AI-powered analysis</li>
                    <li>Real-time health monitoring</li>
                    <li>Personalized recommendations</li>
                    <li>Professional-grade insights</li>
                  </ul>
                </div>
                
                <div className="coming-soon-actions">
                  <button 
                    className="notify-btn"
                    onClick={() => {
                      alert('You\'ll be notified when this feature launches!');
                      setShowComingSoonModal(false);
                    }}
                  >
                    🔔 Notify Me
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => setShowComingSoonModal(false)}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddGoalModal && (
          <div className="modal-overlay" onClick={() => setShowAddGoalModal(false)}>
            <div className="modal add-goal-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🎯 Add Health Goal</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowAddGoalModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="goal-form">
                  <div className="form-group">
                    <label>Goal Title</label>
                    <input 
                      type="text" 
                      value={newGoal.title} 
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="e.g., Exercise 30 minutes daily"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={newGoal.description} 
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      placeholder="Describe your goal and why it's important to you"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Goal Icon</label>
                      <select 
                        value={newGoal.icon} 
                        onChange={(e) => setNewGoal({...newGoal, icon: e.target.value})}
                      >
                        <option value="🎯">🎯 General</option>
                        <option value="🏃">🏃 Exercise</option>
                        <option value="🥗">🥗 Diet</option>
                        <option value="😴">😴 Sleep</option>
                        <option value="🧘">🧘 Mental Health</option>
                        <option value="💊">💊 Medication</option>
                        <option value="📊">📊 Monitoring</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Target Date</label>
                      <input 
                        type="date" 
                        value={newGoal.deadline} 
                        onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="goal-actions">
                    <button 
                      type="button"
                      className="save-goal-btn"
                      onClick={handleAddGoal}
                    >
                      🎯 Set Goal
                    </button>
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddGoalModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Comprehensive Health & Symptom Logging Modal */}
      {showHealthModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Log Your Health & Symptoms</h3>
              <button 
                className="close-button"
                onClick={() => setShowHealthModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleHealthLog} className="health-form">
              <div className="form-group">
                <label>How are you feeling today?</label>
                <select
                  value={healthForm.mood}
                  onChange={(e) => setHealthForm(prev => ({ ...prev, mood: e.target.value }))}
                  required
                >
                  <option value="">Select your mood</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="bad">Bad</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>

              <div className="form-group">
                <label>Energy Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.energy}
                  onChange={(e) => setHealthForm(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                />
                <span className="range-value">{healthForm.energy}/10</span>
              </div>

              <div className="form-group">
                <label>Sleep Quality (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.sleep}
                  onChange={(e) => setHealthForm(prev => ({ ...prev, sleep: parseInt(e.target.value) }))}
                />
                <span className="range-value">{healthForm.sleep}/10</span>
              </div>

              <div className="form-group">
                <label>Any Symptoms Today?</label>
                <div className="symptoms-grid">
                  {['Headache', 'Fatigue', 'Nausea', 'Pain', 'Dizziness', 'Anxiety', 'Depression', 'Irritability'].map(symptom => (
                    <label key={symptom} className="symptom-checkbox">
                      <input
                        type="checkbox"
                        checked={healthForm.symptoms?.includes(symptom) || false}
                        onChange={(e) => {
                          const currentSymptoms = healthForm.symptoms || [];
                          if (e.target.checked) {
                            setHealthForm(prev => ({ ...prev, symptoms: [...currentSymptoms, symptom] }));
                          } else {
                            setHealthForm(prev => ({ ...prev, symptoms: currentSymptoms.filter(s => s !== symptom) }));
                          }
                        }}
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Medication Taken Today?</label>
                <select
                  value={healthForm.medicationTaken || ''}
                  onChange={(e) => setHealthForm(prev => ({ ...prev, medicationTaken: e.target.value }))}
                >
                  <option value="">Select medication status</option>
                  <option value="all">All medications taken as prescribed</option>
                  <option value="partial">Some medications taken</option>
                  <option value="none">No medications taken</option>
                  <option value="skipped">Skipped medications</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={healthForm.notes}
                  onChange={(e) => setHealthForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How are you feeling? Any symptoms or changes you've noticed? Any side effects from medications?"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowHealthModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  Log Health & Symptoms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
