import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SexualHealthAIService from '../ai/sexualHealthAIService.js';
import './SexualHealth.css';

const SexualHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new SexualHealthAIService());

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25; // Default age if not provided
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Sexual health tracking form state
  const [sexualHealthForm, setSexualHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    lastSTIScreening: '',
    nextSTIScreening: '',
    sexualActivity: 'none',
    contraception: 'none',
    symptoms: [],
    concerns: '',
    notes: ''
  });

  // Conversational flow state
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [conversationData, setConversationData] = useState({});
  const [selectedSexualHealthInsights, setSelectedSexualHealthInsights] = useState(null);
  
  // 3-Entry Analysis Feature (like Cycle and Fertility Tracking)
  const [threeEntryAnalysis, setThreeEntryAnalysis] = useState(null);
  const [showThreeEntryAnalysis, setShowThreeEntryAnalysis] = useState(false);
  const [savedThreeEntryAnalysis, setSavedThreeEntryAnalysis] = useState(null);
  const [selectedThreeEntryAnalysis, setSelectedThreeEntryAnalysis] = useState(null);

  // Sexual health data and insights
  const [sexualHealthData, setSexualHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextScreening, setNextScreening] = useState(null);

  // AI-Powered Sexual Health Intelligence (SAME STRUCTURE AS OTHER MODULES)
  const [insights, setInsights] = useState(null);
  const [sexualHealthPatterns, setSexualHealthPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Available sexual health symptoms for tracking
  const availableSymptoms = [
    'Unusual discharge',
    'Burning during urination',
    'Pain during intercourse',
    'Genital itching',
    'Genital sores or bumps',
    'Abnormal bleeding',
    'Pelvic pain',
    'Lower abdominal pain',
    'Fever',
    'Fatigue',
    'Swollen lymph nodes',
    'Rash',
    'No symptoms'
  ];

  // Comprehensive conversational flow steps
  const getConversationSteps = () => [
    {
      id: 'basic_info',
      title: 'Basic Information',
      question: 'Let\'s start with some basic information about your sexual health.',
      fields: [
        { key: 'age', label: 'Your Age', type: 'number', required: true },
        { key: 'relationshipStatus', label: 'Relationship Status', type: 'select', 
          options: ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'] },
        { key: 'sexualOrientation', label: 'Sexual Orientation', type: 'select',
          options: ['Heterosexual', 'Homosexual', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say'] }
      ]
    },
    {
      id: 'sexual_activity',
      title: 'Sexual Activity',
      question: 'Tell me about your current sexual activity patterns.',
      fields: [
        { key: 'sexualActivity', label: 'Current Sexual Activity', type: 'select',
          options: ['Not sexually active', 'Monogamous relationship', 'Multiple partners', 'New partner recently', 'Prefer not to say'] },
        { key: 'partnerGender', label: 'Partner Gender(s)', type: 'multiselect',
          options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'] },
        { key: 'frequency', label: 'Sexual Activity Frequency', type: 'select',
          options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely', 'Not applicable'] }
      ]
    },
    {
      id: 'contraception',
      title: 'Contraception & Protection',
      question: 'What contraception or protection methods are you currently using?',
      fields: [
        { key: 'contraception', label: 'Primary Contraception', type: 'select',
          options: ['None', 'Condoms', 'Birth control pill', 'IUD', 'Implant', 'Injection', 'Patch', 'Vaginal ring', 'Diaphragm', 'Spermicide', 'Withdrawal', 'Fertility awareness', 'Sterilization', 'Other'] },
        { key: 'emergencyContraception', label: 'Ever used emergency contraception?', type: 'select',
          options: ['Yes', 'No', 'Prefer not to say'] },
        { key: 'condomUse', label: 'Condom use with partners', type: 'select',
          options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never', 'Not applicable'] }
      ]
    },
    {
      id: 'sti_screening',
      title: 'STI Screening & History',
      question: 'Let\'s discuss your STI screening history and any concerns.',
      fields: [
        { key: 'lastSTIScreening', label: 'Last STI Screening Date', type: 'date' },
        { key: 'stiHistory', label: 'Previous STI History', type: 'multiselect',
          options: ['None', 'Chlamydia', 'Gonorrhea', 'Syphilis', 'HIV', 'HPV', 'Herpes', 'Hepatitis B', 'Hepatitis C', 'Trichomoniasis', 'Prefer not to say'] },
        { key: 'stiTreatment', label: 'Completed treatment for any STIs?', type: 'select',
          options: ['Yes, fully treated', 'Yes, partially treated', 'No treatment needed', 'Not applicable', 'Prefer not to say'] }
      ]
    },
    {
      id: 'symptoms',
      title: 'Current Symptoms',
      question: 'Are you experiencing any sexual health symptoms right now?',
      fields: [
        { key: 'symptoms', label: 'Current Symptoms', type: 'multiselect',
          options: availableSymptoms },
        { key: 'symptomDuration', label: 'How long have you had these symptoms?', type: 'select',
          options: ['Less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', 'More than 3 months', 'Not applicable'] },
        { key: 'symptomSeverity', label: 'Symptom severity (if any)', type: 'select',
          options: ['Mild', 'Moderate', 'Severe', 'Not applicable'] }
      ]
    },
    {
      id: 'sexual_function',
      title: 'Sexual Function & Satisfaction',
      question: 'How would you describe your sexual function and satisfaction?',
      fields: [
        { key: 'libido', label: 'Current libido/sex drive', type: 'select',
          options: ['Very high', 'High', 'Moderate', 'Low', 'Very low', 'Prefer not to say'] },
        { key: 'satisfaction', label: 'Sexual satisfaction level', type: 'select',
          options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied', 'Not applicable'] },
        { key: 'painDuringSex', label: 'Pain during sexual activity', type: 'select',
          options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always', 'Not applicable'] }
      ]
    },
    {
      id: 'mental_health',
      title: 'Mental Health & Relationships',
      question: 'How is your sexual health affecting your mental wellbeing?',
      fields: [
        { key: 'anxiety', label: 'Anxiety about sexual health', type: 'select',
          options: ['None', 'Mild', 'Moderate', 'High', 'Very high'] },
        { key: 'relationshipImpact', label: 'Impact on relationships', type: 'select',
          options: ['Positive impact', 'No impact', 'Mild negative impact', 'Moderate negative impact', 'Significant negative impact', 'Not applicable'] },
        { key: 'selfEsteem', label: 'Impact on self-esteem', type: 'select',
          options: ['Positive impact', 'No impact', 'Mild negative impact', 'Moderate negative impact', 'Significant negative impact'] }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Factors',
      question: 'Tell me about lifestyle factors that might affect your sexual health.',
      fields: [
        { key: 'stress', label: 'Current stress level', type: 'select',
          options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'] },
        { key: 'sleep', label: 'Sleep quality', type: 'select',
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor'] },
        { key: 'exercise', label: 'Exercise frequency', type: 'select',
          options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely', 'Never'] }
      ]
    },
    {
      id: 'concerns',
      title: 'Concerns & Questions',
      question: 'What are your main concerns or questions about your sexual health?',
      fields: [
        { key: 'concerns', label: 'Main concerns', type: 'textarea', placeholder: 'Describe any concerns about your sexual health, symptoms, or questions for your healthcare provider...' },
        { key: 'questions', label: 'Questions for healthcare provider', type: 'textarea', placeholder: 'Any specific questions you\'d like to ask your doctor or healthcare provider...' }
      ]
    }
  ];

  // Load existing sexual health data
  useEffect(() => {
    const savedData = localStorage.getItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSexualHealthData(parsed);
      
      // Calculate next screening date
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        if (latest.nextSTIScreening) {
          setNextScreening(new Date(latest.nextSTIScreening));
        }
      }
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setSexualHealthForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  // Conversational flow functions
  const startConversation = () => {
    setIsConversationMode(true);
    setCurrentStep(0);
    setConversationData({});
  };

  const nextStep = () => {
    if (currentStep < getConversationSteps().length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConversationAnswer = (field, value) => {
    setConversationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const completeConversation = async () => {
    setIsLoading(true);
    try {
      const sexualHealthEntry = {
        ...conversationData,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        moduleType: 'sexual-health',
        userId: user?.id
      };

      // Save to localStorage
      const updatedData = [...sexualHealthData, sexualHealthEntry];
      setSexualHealthData(updatedData);
      localStorage.setItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));

      // Generate AI insights
      const userProfile = {
        ...user,
        age: calculateAge(user?.dateOfBirth),
        conditions: { reproductive: [] }
      };

      // Use the Sexual Health AI service's complete method (like other modules)
      const aiInsights = await aiService.generateSexualHealthInsights([sexualHealthEntry], userProfile);
      
      console.log('✅ Processed AI Sexual Health Insights:', aiInsights);
      
      if (aiInsights) {
        console.log('🔍 DEBUG - AI Insights received:', aiInsights);
        console.log('🔍 DEBUG - AI Insights keys:', Object.keys(aiInsights));
        console.log('🔍 DEBUG - sexualHealthAssessment exists:', !!aiInsights.sexualHealthAssessment);
        console.log('🔍 DEBUG - safetyProtectionAnalysis exists:', !!aiInsights.safetyProtectionAnalysis);
        console.log('🔍 DEBUG - medicalRecommendations exists:', !!aiInsights.medicalRecommendations);
        
        // Set structured insights for display - use the extracted sections directly
        setInsights(aiInsights);
        setSexualHealthPatterns(aiInsights.patterns);
        setHealthAlerts(aiInsights.medicalAlerts || []);
        setPersonalizedRecommendations(aiInsights.recommendations);
        setRiskAssessment(aiInsights.riskAssessment);

        // Store insights for robot icon
        if (aiService.storeInsightsForRobotIcon) {
          aiService.storeInsightsForRobotIcon('sexualHealth', aiInsights, userProfile);
        }
        
        const sexualHealthWithInsights = {
          ...sexualHealthEntry,
          aiInsights: aiInsights,
          insightsTimestamp: new Date().toISOString()
        };
        
        const updatedSexualHealthData = [...sexualHealthData, sexualHealthWithInsights];
        setSexualHealthData(updatedSexualHealthData);
        localStorage.setItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedSexualHealthData));
      }

      // Reset conversation
      setIsConversationMode(false);
      setCurrentStep(0);
      setConversationData({});
      
    } catch (error) {
      console.error('Error completing sexual health conversation:', error);
      alert('Error processing your sexual health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3-Entry Analysis Function (like Cycle and Fertility Tracking)
  const generateThreeEntryAnalysis = async () => {
    if (sexualHealthData.length < 3) {
      alert('Please log at least 3 sexual health entries to get comprehensive analysis!');
      return;
    }

    try {
      setIsLoading(true);
      const recentEntries = sexualHealthData.slice(-3); // Get last 3 entries
      
      // Generate comprehensive 3-entry sexual health analysis
      const analysisData = generateThreeEntryAnalysisFromData(recentEntries);
      
      setThreeEntryAnalysis(analysisData);
      setShowThreeEntryAnalysis(true);
      
      // Save to localStorage
      localStorage.setItem(`afabSexualHealthThreeEntryAnalysis_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(analysisData));
      setSavedThreeEntryAnalysis(analysisData);
    } catch (error) {
      console.error('Error generating 3-entry sexual health analysis:', error);
      alert('Error generating analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate comprehensive 3-entry sexual health analysis (SUMMIT-READY)
  const generateThreeEntryAnalysisFromData = (entries) => {
    const analysis = {
      timestamp: new Date().toISOString(),
      entriesAnalyzed: entries.length,
      entryDates: entries.map(entry => entry.date),
      sexualHealthScore: 0,
      riskLevel: 'low'
    };

    // Calculate sexual health scores for each entry
    const healthScores = entries.map(entry => {
      let score = 5; // Base score
      
      // Age factor (assuming user age from profile)
      const age = user?.age || 25;
      if (age >= 18 && age <= 25) score += 2;
      else if (age >= 26 && age <= 35) score += 1;
      else if (age >= 36 && age <= 45) score -= 1;
      else if (age > 45) score -= 2;
      
      // Sexual activity patterns
      if (entry.sexualActivity === 'active') score += 1;
      else if (entry.sexualActivity === 'inactive') score -= 1;
      
      // Contraception usage
      if (entry.contraception && entry.contraception !== 'none') score += 1;
      
      // STI screening history
      if (entry.lastSTIScreening && entry.lastSTIScreening !== 'never') score += 1;
      
      // Symptom severity
      if (entry.symptoms && entry.symptoms.length > 0) {
        if (entry.symptomSeverity === 'mild') score -= 1;
        else if (entry.symptomSeverity === 'moderate') score -= 2;
        else if (entry.symptomSeverity === 'severe') score -= 3;
      }
      
      // Mental health factors
      if (entry.anxiety === 'low' && entry.stress === 'low') score += 1;
      else if (entry.anxiety === 'high' || entry.stress === 'high') score -= 1;
      
      // Relationship satisfaction
      if (entry.satisfaction === 'high') score += 1;
      else if (entry.satisfaction === 'low') score -= 1;
      
      return Math.max(0, Math.min(10, score));
    });

    // Calculate overall sexual health score
    analysis.sexualHealthScore = Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length * 10) / 10;
    
    // Determine risk level
    if (analysis.sexualHealthScore >= 8) analysis.riskLevel = 'low';
    else if (analysis.sexualHealthScore >= 6) analysis.riskLevel = 'moderate';
    else analysis.riskLevel = 'high';

    // Generate comprehensive analysis text
    analysis.analysis = generateComprehensiveSexualHealthAnalysis(entries, analysis);

    return analysis;
  };

  // Generate comprehensive sexual health analysis text
  const generateComprehensiveSexualHealthAnalysis = (entries, analysis) => {
    const avgScore = analysis.sexualHealthScore;
    const riskLevel = analysis.riskLevel;
    
    let analysisText = `🔬 **COMPREHENSIVE 3-ENTRY SEXUAL HEALTH ANALYSIS**\n\n`;
    
    analysisText += `**📊 SEXUAL HEALTH SNAPSHOT**\n`;
    analysisText += `• Overall Sexual Health Score: ${avgScore}/10\n`;
    analysisText += `• Risk Assessment: ${riskLevel.toUpperCase()}\n`;
    analysisText += `• Entries Analyzed: ${entries.length} consecutive entries\n`;
    analysisText += `• Analysis Period: ${entries[0].date} to ${entries[entries.length - 1].date}\n\n`;
    
    analysisText += `**🔍 PATTERN ANALYSIS**\n`;
    
    // Sexual activity patterns
    const activityPatterns = entries.map(e => e.sexualActivity).filter(Boolean);
    if (activityPatterns.length > 0) {
      const mostCommonActivity = activityPatterns.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );
      analysisText += `• Sexual Activity Pattern: ${mostCommonActivity} (consistent across entries)\n`;
    }
    
    // Contraception patterns
    const contraceptionPatterns = entries.map(e => e.contraception).filter(Boolean);
    if (contraceptionPatterns.length > 0) {
      const mostCommonContraception = contraceptionPatterns.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );
      analysisText += `• Contraception Usage: ${mostCommonContraception} (consistent protection)\n`;
    }
    
    // Symptom trends
    const allSymptoms = entries.flatMap(e => e.symptoms || []);
    if (allSymptoms.length > 0) {
      const symptomCounts = allSymptoms.reduce((acc, symptom) => {
        acc[symptom] = (acc[symptom] || 0) + 1;
        return acc;
      }, {});
      const mostCommonSymptom = Object.keys(symptomCounts).reduce((a, b) => 
        symptomCounts[a] > symptomCounts[b] ? a : b
      );
      analysisText += `• Most Common Symptom: ${mostCommonSymptom} (appeared ${symptomCounts[mostCommonSymptom]} times)\n`;
    }
    
    analysisText += `\n**🎯 HEALTH INSIGHTS**\n`;
    
    if (avgScore >= 8) {
      analysisText += `• Excellent sexual health maintenance with consistent positive patterns\n`;
      analysisText += `• Strong protective behaviors and healthy relationship dynamics\n`;
      analysisText += `• Continue current practices for optimal sexual wellness\n`;
    } else if (avgScore >= 6) {
      analysisText += `• Good sexual health with room for optimization\n`;
      analysisText += `• Some areas for improvement in protective behaviors\n`;
      analysisText += `• Consider enhanced screening and communication strategies\n`;
    } else {
      analysisText += `• Areas of concern identified requiring attention\n`;
      analysisText += `• Increased risk factors present in current patterns\n`;
      analysisText += `• Immediate consultation with healthcare provider recommended\n`;
    }
    
    analysisText += `\n**📋 RECOMMENDATIONS**\n`;
    analysisText += `• Schedule comprehensive STI screening within 3 months\n`;
    analysisText += `• Maintain consistent contraception and protection methods\n`;
    analysisText += `• Continue open communication with sexual partners\n`;
    analysisText += `• Monitor for any new or concerning symptoms\n`;
    analysisText += `• Consider annual sexual health check-up with healthcare provider\n`;
    
    analysisText += `\n**🔮 PREDICTIVE INSIGHTS**\n`;
    analysisText += `Based on your 3-entry pattern, your sexual health trajectory is ${riskLevel === 'low' ? 'excellent' : riskLevel === 'moderate' ? 'positive with monitoring needed' : 'requires attention'}. `;
    analysisText += `Continue tracking to identify any emerging patterns or changes in your sexual wellness.\n\n`;
    
    analysisText += `**⚡ URGENCY ASSESSMENT**\n`;
    if (riskLevel === 'high') {
      analysisText += `🔴 HIGH PRIORITY: Schedule healthcare consultation within 2 weeks\n`;
    } else if (riskLevel === 'moderate') {
      analysisText += `🟡 MODERATE PRIORITY: Schedule routine screening within 1 month\n`;
    } else {
      analysisText += `🟢 LOW PRIORITY: Continue current practices, routine screening in 3-6 months\n`;
    }
    
    return analysisText;
  };

  const deleteSexualHealthEntry = (index) => {
    const updatedData = sexualHealthData.filter((_, i) => i !== index);
    setSexualHealthData(updatedData);
    localStorage.setItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
  };

  const viewInsightsForEntry = (entry, index) => {
    const userId = user?.id || user?.email || 'anonymous';
    const storageKey = `aiInsights_sexual_health_${userId}`;
    
    try {
      const storedInsights = localStorage.getItem(storageKey);
      if (storedInsights) {
        const insights = JSON.parse(storedInsights);
        setSelectedSexualHealthInsights({
          ...insights,
          timestamp: entry.timestamp,
          entry: entry
        });
      } else {
        alert('No AI insights found for this entry. Please complete a new sexual health check-in to generate insights.');
      }
    } catch (error) {
      console.error('Error retrieving insights:', error);
      alert('Error retrieving AI insights. Please try again.');
    }
  };

  const handleSexualHealthLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const sexualHealthEntry = {
        ...sexualHealthForm,
        timestamp: new Date().toISOString(),
        moduleType: 'sexual-health',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...sexualHealthData, sexualHealthEntry];
      setSexualHealthData(updatedData);
      localStorage.setItem('afabSexualHealthData', JSON.stringify(updatedData));
      
      // Update next screening date
      if (sexualHealthEntry.nextSTIScreening) {
        setNextScreening(new Date(sexualHealthEntry.nextSTIScreening));
      }
      
      // Generate AI insights
      const prompt = `As an expert in AFAB sexual and reproductive health, analyze this sexual health data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Sexual Health Data: ${JSON.stringify(sexualHealthEntry)}
Historical Data: ${JSON.stringify(sexualHealthData.slice(-3))}

Please provide:
1. Sexual health risk assessment
2. STI screening recommendations
3. Contraception guidance if applicable
4. When to see a healthcare provider
5. Preventive care recommendations
6. Safe sex practices

Be medical, accurate, and supportive. Include specific screening schedules and risk factors.`;

      // Create user profile for AI analysis
      const userProfile = {
        ...user,
        age: calculateAge(user?.dateOfBirth),
        conditions: { reproductive: [] }
      };

      // Use the Sexual Health AI service's complete method (like other modules)
      const aiInsights = await aiService.generateSexualHealthInsights([sexualHealthForm], userProfile);
      
      console.log('✅ Processed AI Sexual Health Insights:', aiInsights);
      
      // Set all the comprehensive AI sexual health insights (SAME STRUCTURE AS CYCLE TRACKING)
      if (aiInsights) {
        console.log('🔍 DEBUG - Form AI Insights received:', aiInsights);
        console.log('🔍 DEBUG - Form AI Insights keys:', Object.keys(aiInsights));
        console.log('🔍 DEBUG - Form sexualHealthAssessment exists:', !!aiInsights.sexualHealthAssessment);
        console.log('🔍 DEBUG - Form safetyProtectionAnalysis exists:', !!aiInsights.safetyProtectionAnalysis);
        console.log('🔍 DEBUG - Form medicalRecommendations exists:', !!aiInsights.medicalRecommendations);
        
        // AI Insights - detailed medical analysis with structured format
        setInsights(aiInsights);
        
        // Store AI insights with the sexual health data
        const sexualHealthWithInsights = {
          ...sexualHealthForm,
          aiInsights: aiInsights,
          insightsTimestamp: new Date().toISOString()
        };
        
        // Update the sexual health data with AI insights
        // Store insights for robot icon
        if (aiService.storeInsightsForRobotIcon) {
          aiService.storeInsightsForRobotIcon('sexualHealth', aiInsights, userProfile);
        }
        
        const updatedSexualHealthData = [...sexualHealthData, sexualHealthWithInsights];
        setSexualHealthData(updatedSexualHealthData);
        localStorage.setItem(`afabSexualHealthData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedSexualHealthData));
        
        console.log('🎉 REAL AI sexual health insights displayed successfully!');
      }
      
      // Reset form for next entry
      setSexualHealthForm({
        date: new Date().toISOString().split('T')[0],
        lastSTIScreening: '',
        nextSTIScreening: '',
        sexualActivity: 'none',
        contraception: 'none',
        symptoms: [],
        concerns: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging sexual health data:', error);
      alert('Error logging sexual health data. Please try again.');
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

  return (
    <div className="sexual-health-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💕 Sexual Health Tracker</h1>
        <p>Track your sexual health, STI screenings, and intimate wellness</p>
      </div>

      <div className="sexual-health-content">
        {/* Sexual Health Overview */}
        <div className="sexual-health-overview">
          <div className="overview-card">
            <h3>🔬 Next STI Screening</h3>
            <p className="date-display">
              {nextScreening ? formatDate(nextScreening) : 'Schedule your screening'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Health Records</h3>
            <p className="count-display">{sexualHealthData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🛡️ Prevention</h3>
            <p className="status-display">Stay protected</p>
          </div>
        </div>

        {/* Sexual Health Logging Form */}
        <div className="sexual-health-form-section">
          <h2>Log Your Sexual Health Data</h2>
          
          {!isConversationMode ? (
            <div className="form-mode-selector">
              <button 
                type="button" 
                className="conversation-btn"
                onClick={startConversation}
              >
                💬 Start Guided Conversation
              </button>
              <p className="mode-description">
                Get personalized insights through our comprehensive sexual health assessment
              </p>
            </div>
          ) : (
            <div className="conversation-flow">
              <div className="conversation-header">
                <h3>{getConversationSteps()[currentStep].title}</h3>
                <p>{getConversationSteps()[currentStep].question}</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentStep + 1) / getConversationSteps().length) * 100}%` }}
                  ></div>
                </div>
                <p className="step-counter">Step {currentStep + 1} of {getConversationSteps().length}</p>
              </div>

              <div className="conversation-fields">
                {getConversationSteps()[currentStep].fields.map(field => (
                  <div key={field.key} className="conversation-field">
                    <label>{field.label} {field.required && '*'}</label>
                    
                    {field.type === 'select' && (
                      <select
                        value={conversationData[field.key] || ''}
                        onChange={(e) => handleConversationAnswer(field.key, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select an option</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'multiselect' && (
                      <div className="multiselect-container">
                        {field.options.map(option => (
                          <label key={option} className="multiselect-option">
                            <input
                              type="checkbox"
                              checked={conversationData[field.key]?.includes(option) || false}
                              onChange={(e) => {
                                const currentValues = conversationData[field.key] || [];
                                const newValues = e.target.checked
                                  ? [...currentValues, option]
                                  : currentValues.filter(v => v !== option);
                                handleConversationAnswer(field.key, newValues);
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        value={conversationData[field.key] || ''}
                        onChange={(e) => handleConversationAnswer(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows="3"
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={conversationData[field.key] || ''}
                        onChange={(e) => handleConversationAnswer(field.key, e.target.value)}
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={conversationData[field.key] || ''}
                        onChange={(e) => handleConversationAnswer(field.key, parseInt(e.target.value))}
                        required={field.required}
                        min="1"
                        max="100"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="conversation-navigation">
                <button 
                  type="button" 
                  className="nav-btn prev-btn"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  ← Previous
                </button>
                
                {currentStep === getConversationSteps().length - 1 ? (
                  <button 
                    type="button" 
                    className="nav-btn complete-btn"
                    onClick={completeConversation}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Analyzing...' : 'Complete Assessment'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="nav-btn next-btn"
                    onClick={nextStep}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSexualHealthLog} className="sexual-health-form" style={{ display: isConversationMode ? 'none' : 'block' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={sexualHealthForm.date}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last STI Screening</label>
                <input
                  type="date"
                  value={sexualHealthForm.lastSTIScreening}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, lastSTIScreening: e.target.value})}
                />
                <small>When was your last STI test?</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Next STI Screening Due</label>
                <input
                  type="date"
                  value={sexualHealthForm.nextSTIScreening}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, nextSTIScreening: e.target.value})}
                />
                <small>When is your next screening scheduled?</small>
              </div>
              
              <div className="form-group">
                <label>Sexual Activity</label>
                <select
                  value={sexualHealthForm.sexualActivity}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, sexualActivity: e.target.value})}
                >
                  <option value="none">No sexual activity</option>
                  <option value="monogamous">Monogamous relationship</option>
                  <option value="multiple-partners">Multiple partners</option>
                  <option value="new-partner">New partner</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Contraception Method</label>
              <select
                value={sexualHealthForm.contraception}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, contraception: e.target.value})}
              >
                <option value="none">None</option>
                <option value="condoms">Condoms</option>
                <option value="birth-control-pill">Birth Control Pill</option>
                <option value="iud">IUD</option>
                <option value="implant">Implant</option>
                <option value="injection">Injection</option>
                <option value="patch">Patch</option>
                <option value="ring">Vaginal Ring</option>
                <option value="diaphragm">Diaphragm</option>
                <option value="spermicide">Spermicide</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="fertility-awareness">Fertility Awareness</option>
                <option value="sterilization">Sterilization</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sexual Health Symptoms</label>
              <div className="symptoms-grid">
                {availableSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={sexualHealthForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Health Concerns</label>
              <textarea
                value={sexualHealthForm.concerns}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, concerns: e.target.value})}
                placeholder="Any concerns about your sexual health, symptoms, or questions for your healthcare provider..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={sexualHealthForm.notes}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, notes: e.target.value})}
                placeholder="Any additional notes about your sexual health, relationships, or wellness..."
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Sexual Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 Dr. AI Sexual Health Analysis</h2>
            
            
            {/* Sexual Health Assessment */}
            {insights.sexualHealthAssessment && (
              <div className="insight-item">
                <h4>🔍 Sexual Health Assessment</h4>
                <div 
                  className="ai-analysis-content"
                  dangerouslySetInnerHTML={{ 
                    __html: (typeof insights.sexualHealthAssessment === 'string' ? insights.sexualHealthAssessment : String(insights.sexualHealthAssessment))
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}

            {/* Safety & Protection Analysis */}
            {insights.safetyProtectionAnalysis && (
              <div className="insight-item">
                <h4>🛡️ Safety & Protection Analysis</h4>
                <div 
                  className="ai-analysis-content"
                  dangerouslySetInnerHTML={{ 
                    __html: (typeof insights.safetyProtectionAnalysis === 'string' ? insights.safetyProtectionAnalysis : String(insights.safetyProtectionAnalysis))
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}

            {/* Medical Recommendations */}
            {insights.medicalRecommendations && (
              <div className="insight-item">
                <h4>💊 Medical Recommendations</h4>
                <div 
                  className="ai-analysis-content"
                  dangerouslySetInnerHTML={{ 
                    __html: (typeof insights.medicalRecommendations === 'string' ? insights.medicalRecommendations : String(insights.medicalRecommendations))
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}

            {/* Personalized Tips */}
            {insights.personalizedTips && (
              <div className="insight-item">
                <h4>✨ Personalized Tips</h4>
                <div 
                  className="ai-analysis-content"
                  dangerouslySetInnerHTML={{ 
                    __html: (typeof insights.personalizedTips === 'string' ? insights.personalizedTips : String(insights.personalizedTips))
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}

            {/* Gentle Reminders */}
            {insights.gentleReminders && (
              <div className="insight-item">
                <h4>🌸 Gentle Reminders</h4>
                <div 
                  className="ai-analysis-content"
                  dangerouslySetInnerHTML={{ 
                    __html: (typeof insights.gentleReminders === 'string' ? insights.gentleReminders : String(insights.gentleReminders))
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 3-Entry Analysis Button */}
        {sexualHealthData.length >= 3 && (
          <div className="analysis-buttons">
            <button 
              className="three-entry-btn"
              onClick={generateThreeEntryAnalysis}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Analyzing...' : '🔬 Get 3-Entry Analysis'}
            </button>
            {savedThreeEntryAnalysis ? (
              <button 
                className="view-saved-analysis-btn"
                onClick={() => {
                  setSelectedThreeEntryAnalysis(savedThreeEntryAnalysis);
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

        {/* Interactive Dashboard - Show after 3+ consecutive entries */}
        {sexualHealthData.length >= 3 && (
          <div className="interactive-dashboard">
            <h2>📊 Your Sexual Health Analytics</h2>
            <p className="dashboard-subtitle">Insights from {sexualHealthData.length} consecutive entries</p>
            
            <div className="dashboard-grid">
              {/* Sexual Health Score Trends */}
              <div className="dashboard-card">
                <h3>📈 Sexual Health Score Trends</h3>
                <div className="chart-container">
                  <div className="health-score-chart">
                    {sexualHealthData.slice(-5).map((entry, index) => {
                      // Calculate a simple health score for each entry
                      let score = 5; // Base score
                      if (entry.contraception && entry.contraception !== 'none') score += 1;
                      if (entry.lastSTIScreening && entry.lastSTIScreening !== 'never') score += 1;
                      if (entry.satisfaction === 'high') score += 1;
                      if (entry.anxiety === 'low' && entry.stress === 'low') score += 1;
                      if (entry.symptoms && entry.symptoms.length > 0) score -= 1;
                      
                      const percentage = (score / 10) * 100;
                      return (
                        <div key={index} className="score-bar">
                          <div className="bar-label">Entry {index + 1}</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: score >= 8 ? '#4CAF50' : score >= 6 ? '#ff9800' : '#f44336'
                              }}
                            ></div>
                            <span className="bar-value">{score}/10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Contraception Usage Patterns */}
              <div className="dashboard-card">
                <h3>🛡️ Contraception Usage</h3>
                <div className="chart-container">
                  <div className="contraception-chart">
                    {sexualHealthData.slice(-5).map((entry, index) => {
                      const contraception = entry.contraception || 'none';
                      const colors = {
                        'birth_control_pill': '#667eea',
                        'condom': '#4CAF50',
                        'iud': '#ff9800',
                        'implant': '#9c27b0',
                        'none': '#f44336'
                      };
                      return (
                        <div key={index} className="contraception-point">
                          <div className="contraception-label">Entry {index + 1}</div>
                          <div className="contraception-bar">
                            <div 
                              className="contraception-fill"
                              style={{ 
                                backgroundColor: colors[contraception] || '#666',
                                height: '100%'
                              }}
                            ></div>
                          </div>
                          <div className="contraception-value">{contraception.replace('_', ' ')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Symptom Patterns */}
              <div className="dashboard-card">
                <h3>🔍 Symptom Patterns</h3>
                <div className="chart-container">
                  <div className="symptom-patterns">
                    {sexualHealthData.slice(-5).map((entry, index) => {
                      const symptomCount = entry.symptoms ? entry.symptoms.length : 0;
                      const severity = entry.symptomSeverity || 'none';
                      const colors = {
                        'none': '#4CAF50',
                        'mild': '#ff9800',
                        'moderate': '#ff5722',
                        'severe': '#f44336'
                      };
                      return (
                        <div key={index} className="symptom-item">
                          <div className="symptom-cycle">Entry {index + 1}</div>
                          <div className="symptom-indicator">
                            <div 
                              className="symptom-circle"
                              style={{ 
                                backgroundColor: colors[severity] || '#666',
                                width: `${Math.max(20, symptomCount * 10)}px`,
                                height: `${Math.max(20, symptomCount * 10)}px`
                              }}
                            ></div>
                          </div>
                          <div className="symptom-details">
                            {symptomCount} symptoms ({severity})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mental Health & Satisfaction Trends */}
              <div className="dashboard-card">
                <h3>🧠 Mental Health & Satisfaction</h3>
                <div className="chart-container">
                  <div className="mental-health-chart">
                    {sexualHealthData.slice(-5).map((entry, index) => {
                      const anxiety = entry.anxiety || 'moderate';
                      const stress = entry.stress || 'moderate';
                      const satisfaction = entry.satisfaction || 'moderate';
                      
                      const anxietyColors = { 'low': '#4CAF50', 'moderate': '#ff9800', 'high': '#f44336' };
                      const stressColors = { 'low': '#4CAF50', 'moderate': '#ff9800', 'high': '#f44336' };
                      const satisfactionColors = { 'low': '#f44336', 'moderate': '#ff9800', 'high': '#4CAF50' };
                      
                      return (
                        <div key={index} className="mental-health-point">
                          <div className="mental-health-label">Entry {index + 1}</div>
                          <div className="mental-health-bars">
                            <div className="mental-health-bar">
                              <div className="bar-label-small">Anxiety</div>
                              <div 
                                className="mental-health-fill"
                                style={{ 
                                  backgroundColor: anxietyColors[anxiety] || '#666',
                                  height: anxiety === 'low' ? '30%' : anxiety === 'moderate' ? '60%' : '100%'
                                }}
                              ></div>
                            </div>
                            <div className="mental-health-bar">
                              <div className="bar-label-small">Stress</div>
                              <div 
                                className="mental-health-fill"
                                style={{ 
                                  backgroundColor: stressColors[stress] || '#666',
                                  height: stress === 'low' ? '30%' : stress === 'moderate' ? '60%' : '100%'
                                }}
                              ></div>
                            </div>
                            <div className="mental-health-bar">
                              <div className="bar-label-small">Satisfaction</div>
                              <div 
                                className="mental-health-fill"
                                style={{ 
                                  backgroundColor: satisfactionColors[satisfaction] || '#666',
                                  height: satisfaction === 'low' ? '30%' : satisfaction === 'moderate' ? '60%' : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sexual Health History */}
        {sexualHealthData.length > 0 && (
          <div className="sexual-health-history">
            <h2>📈 Sexual Health History</h2>
            <div className="history-list">
              {sexualHealthData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-content">
                    <div className="history-date">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      {entry.lastSTIScreening && <span>Last Screening: {entry.lastSTIScreening}</span>}
                      <span>Activity: {entry.sexualActivity || 'Not specified'}</span>
                      <span>Contraception: {entry.contraception || 'Not specified'}</span>
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <span>Symptoms: {entry.symptoms.length}</span>
                      )}
                    </div>
                  </div>
                  <div className="history-actions">
                    <button 
                      className="robot-btn"
                      onClick={() => viewInsightsForEntry(entry, index)}
                      title="View AI Insights"
                    >
                      🤖
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteSexualHealthEntry(sexualHealthData.length - 1 - index)}
                      title="Delete Entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Sexual Health Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🛡️ STI Prevention</h3>
              <p>Learn about safe sex practices and STI prevention methods</p>
            </div>
            <div className="resource-card">
              <h3>💊 Contraception Guide</h3>
              <p>Comprehensive guide to birth control options and effectiveness</p>
            </div>
            <div className="resource-card">
              <h3>🏥 When to See a Doctor</h3>
              <p>Know the signs that require immediate medical attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {selectedSexualHealthInsights && (
        <div className="insights-modal-overlay" onClick={() => setSelectedSexualHealthInsights(null)}>
          <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤖 AI Insights - {new Date(selectedSexualHealthInsights.timestamp).toLocaleDateString()}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedSexualHealthInsights(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="insights-section">
                <h3>🤖 Dr. AI Sexual Health Analysis</h3>
                
                {/* Greeting */}
                {selectedSexualHealthInsights.greeting && (
                  <div className="insight-item">
                    <h4>👋 Greeting</h4>
                    <p>{selectedSexualHealthInsights.greeting}</p>
                  </div>
                )}

                {/* Clinical Summary */}
                {selectedSexualHealthInsights.clinicalSummary && (
                  <div className="insight-item">
                    <h4>🩺 Clinical Summary</h4>
                    <p>{selectedSexualHealthInsights.clinicalSummary}</p>
                  </div>
                )}

                {/* Systemic & Lifestyle Factors */}
                {selectedSexualHealthInsights.systemicFactors && (
                  <div className="insight-item">
                    <h4>🏥 Systemic & Lifestyle Factors</h4>
                    <p>{selectedSexualHealthInsights.systemicFactors}</p>
                  </div>
                )}

                {/* Clinical Impression */}
                {selectedSexualHealthInsights.clinicalImpression && (
                  <div className="insight-item">
                    <h4>🔬 Clinical Impression</h4>
                    <p>{selectedSexualHealthInsights.clinicalImpression}</p>
                  </div>
                )}

                {/* Actionable Plan */}
                {selectedSexualHealthInsights.actionPlan && (
                  <div className="insight-item">
                    <h4>📋 Actionable Plan</h4>
                    <p>{selectedSexualHealthInsights.actionPlan}</p>
                  </div>
                )}

                {/* Summary Box */}
                {selectedSexualHealthInsights.summaryBox && (
                  <div className="insight-item">
                    <h4>📊 Summary Box</h4>
                    <p>{selectedSexualHealthInsights.summaryBox}</p>
                  </div>
                )}

                {/* Personalized Tips */}
                {selectedSexualHealthInsights.personalizedTips && (
                  <div className="insight-item">
                    <h4>💡 Personalized Tips</h4>
                    <ul>
                      {Array.isArray(selectedSexualHealthInsights.personalizedTips) ? 
                        selectedSexualHealthInsights.personalizedTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        )) : 
                        <li>{selectedSexualHealthInsights.personalizedTips}</li>
                      }
                    </ul>
                  </div>
                )}

                {/* Gentle Reminders */}
                {selectedSexualHealthInsights.gentleReminders && (
                  <div className="insight-item">
                    <h4>🌸 Gentle Reminders</h4>
                    <ul>
                      {Array.isArray(selectedSexualHealthInsights.gentleReminders) ? 
                        selectedSexualHealthInsights.gentleReminders.map((reminder, index) => (
                          <li key={index}>{reminder}</li>
                        )) : 
                        <li>{selectedSexualHealthInsights.gentleReminders}</li>
                      }
                    </ul>
                  </div>
                )}

                {/* Sexual Health Patterns */}
                {selectedSexualHealthInsights.sexualHealthPatterns && (
                  <div className="insight-item">
                    <h4>📈 Sexual Health Patterns</h4>
                    <p>{selectedSexualHealthInsights.sexualHealthPatterns}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Entry Analysis Modal */}
      {selectedThreeEntryAnalysis && (
        <div className="insights-modal-overlay" onClick={() => setSelectedThreeEntryAnalysis(null)}>
          <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔬 Comprehensive 3-Entry Sexual Health Analysis</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedThreeEntryAnalysis(null)}
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
                    Generated: {new Date(selectedThreeEntryAnalysis.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="analysis-text">
                  {selectedThreeEntryAnalysis.analysis.split('\n').map((paragraph, index) => (
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
  );
};

export default SexualHealth;
