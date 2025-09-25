import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AMABAIService from '../ai/amabAIService';
import './SexualHealth.css';

const SexualHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AMABAIService());
  
  // Sexual health tracking form state
  const [sexualHealthForm, setSexualHealthForm] = useState({
    date: new Date().toISOString().split('T')[0],
    // Basic Sexual Health
    sexualActivity: 'none', // none, active, inactive
    sexualSatisfaction: 5, // 1-10 scale
    libido: 5, // 1-10 scale
    erectionQuality: 5, // 1-10 scale
    ejaculationFrequency: 'normal', // normal, frequent, infrequent, none
    // STI & Screening
    lastSTIScreening: '',
    nextSTIScreening: '',
    stiSymptoms: [],
    // Lifestyle Factors
    stressLevel: 5, // 1-10 scale
    sleepQuality: 5, // 1-10 scale
    exerciseFrequency: 'moderate', // low, moderate, high
    alcoholConsumption: 0, // drinks per week
    smokingStatus: 'never', // never, former, current
    // Urology & Prostate Health (Enhanced)
    urinaryFrequency: 'normal', // normal, frequent, infrequent
    urinaryUrgency: 5, // 1-10 scale
    urinaryFlow: 'normal', // normal, weak, strong
    nocturia: 0, // times per night
    urinaryIncontinence: 'none', // none, mild, moderate, severe
    prostateHealth: 'normal', // normal, enlarged, concerns
    lastProstateExam: '',
    nextProstateExam: '',
    psaLevel: '', // if known
    urinarySymptoms: [],
    
    // Medical History
    medications: [],
    chronicConditions: [],
    // Concerns & Notes
    concerns: '',
    notes: ''
  });

  // Sexual health data and insights
  const [sexualHealthData, setSexualHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextScreening, setNextScreening] = useState(null);
  const [insights, setInsights] = useState(null);
  const [savedInsights, setSavedInsights] = useState([]);
  const [showSavedInsights, setShowSavedInsights] = useState(false);

  // Available STI symptoms for AMAB individuals
  const availableSTISymptoms = [
    'Burning during urination',
    'Unusual discharge from penis',
    'Genital itching or irritation',
    'Genital sores, bumps, or ulcers',
    'Pain or swelling in testicles',
    'Pain during ejaculation',
    'Rectal pain or discharge',
    'Sore throat',
    'Fever',
    'Fatigue',
    'Swollen lymph nodes',
    'Rash on genitals or body',
    'No symptoms'
  ];

  // Available urinary symptoms for urology tracking
  const availableUrinarySymptoms = [
    'Frequent urination',
    'Urgent need to urinate',
    'Weak urine stream',
    'Difficulty starting urination',
    'Dribbling after urination',
    'Pain during urination',
    'Blood in urine',
    'Cloudy urine',
    'Strong-smelling urine',
    'Incomplete bladder emptying',
    'Nocturia (nighttime urination)',
    'Urinary incontinence',
    'No urinary symptoms'
  ];

  // Common medications that can affect sexual health
  const commonMedications = [
    'Antidepressants (SSRIs)',
    'Blood pressure medications',
    'Diabetes medications',
    'Prostate medications',
    'Hormone therapy',
    'Pain medications',
    'Other medications',
    'No medications'
  ];

  // Common chronic conditions that can affect sexual health
  const commonConditions = [
    'Diabetes',
    'High blood pressure',
    'Heart disease',
    'Depression/Anxiety',
    'Prostate conditions',
    'Thyroid disorders',
    'Obesity',
    'No chronic conditions'
  ];

  // Load existing sexual health data and saved insights
  useEffect(() => {
    const savedData = localStorage.getItem('amabSexualHealthData');
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
    
    const savedInsightsData = localStorage.getItem('amabSexualHealthInsights');
    if (savedInsightsData) {
      const parsedInsights = JSON.parse(savedInsightsData);
      setSavedInsights(parsedInsights);
    }
  }, []);

  // Helper functions for form handling
  const handleSTISymptomToggle = (symptom) => {
    setSexualHealthForm(prev => ({
      ...prev,
      stiSymptoms: prev.stiSymptoms.includes(symptom)
        ? prev.stiSymptoms.filter(s => s !== symptom)
        : [...prev.stiSymptoms, symptom]
    }));
  };

  const handleUrinarySymptomToggle = (symptom) => {
    setSexualHealthForm(prev => ({
      ...prev,
      urinarySymptoms: prev.urinarySymptoms.includes(symptom)
        ? prev.urinarySymptoms.filter(s => s !== symptom)
        : [...prev.urinarySymptoms, symptom]
    }));
  };

  const handleMedicationToggle = (medication) => {
    setSexualHealthForm(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const handleConditionToggle = (condition) => {
    setSexualHealthForm(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  // Save insights functionality
  const saveInsights = (insights) => {
    const newInsight = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      insights: insights,
      healthData: sexualHealthData[sexualHealthData.length - 1] // Save the latest health data for context
    };
    const updatedInsights = [newInsight, ...savedInsights];
    setSavedInsights(updatedInsights);
    localStorage.setItem('amabSexualHealthInsights', JSON.stringify(updatedInsights));
    console.log('💾 Sexual health insights saved:', newInsight);
  };

  // Delete insights functionality
  const deleteInsights = (insightId) => {
    const updatedInsights = savedInsights.filter(insight => insight.id !== insightId);
    setSavedInsights(updatedInsights);
    localStorage.setItem('amabSexualHealthInsights', JSON.stringify(updatedInsights));
    console.log('🗑️ Sexual health insights deleted:', insightId);
  };

  // Calculate Sexual Health Readiness Index
  const calculateSexualHealthReadinessIndex = (data) => {
    if (data.length === 0) return 0;
    
    const latest = data[data.length - 1];
    
    // Sexual health factors with weights
    const factors = {
      libido: {
        weight: 0.20,
        score: (latest.libido || 5) / 10,
        impact: 'Libido directly affects sexual desire and satisfaction'
      },
      erectionQuality: {
        weight: 0.20,
        score: (latest.erectionQuality || 5) / 10,
        impact: 'Erection quality is a key indicator of sexual function'
      },
      sexualSatisfaction: {
        weight: 0.15,
        score: (latest.sexualSatisfaction || 5) / 10,
        impact: 'Sexual satisfaction reflects overall sexual health'
      },
      stress: {
        weight: 0.15,
        score: Math.max(0, (10 - (latest.stressLevel || 5)) / 10), // Invert stress
        impact: 'Stress significantly impacts sexual function and desire'
      },
      sleep: {
        weight: 0.10,
        score: (latest.sleepQuality || 5) / 10,
        impact: 'Sleep quality affects hormone production and sexual function'
      },
      exercise: {
        weight: 0.10,
        score: latest.exerciseFrequency === 'high' ? 1 : latest.exerciseFrequency === 'moderate' ? 0.7 : 0.3,
        impact: 'Regular exercise supports cardiovascular health and sexual function'
      },
      lifestyle: {
        weight: 0.10,
        score: Math.max(0, (10 - (latest.alcoholConsumption || 0) - (latest.smokingStatus === 'current' ? 3 : 0)) / 10),
        impact: 'Alcohol and smoking negatively impact sexual function'
      }
    };
    
    const totalScore = Object.keys(factors).reduce((total, key) => {
      return total + (factors[key].score * factors[key].weight);
    }, 0);
    
    return Math.round(totalScore * 100);
  };

  // Analyze patterns for doctor referral triggers
  const analyzeSexualHealthPatterns = () => {
    if (sexualHealthData.length < 3) return null;
    
    const recentData = sexualHealthData.slice(0, 7); // Last 7 entries
    const triggers = [];
    
    // Persistent ejaculatory pain
    const painEntries = recentData.filter(entry => entry.ejaculationPain === true);
    if (painEntries.length >= 3) {
      triggers.push({
        type: 'ejaculation-pain',
        severity: 'high',
        message: 'Persistent ejaculatory pain for multiple days',
        recommendation: 'Consult a urologist immediately to rule out infections, inflammation, or other underlying conditions'
      });
    }
    
    // Libido consistently low
    const libidoValues = recentData.map(entry => parseInt(entry.libido) || 5);
    const avgLibido = libidoValues.reduce((sum, val) => sum + val, 0) / libidoValues.length;
    if (avgLibido <= 3 && libidoValues.filter(val => val <= 3).length >= 3) {
      triggers.push({
        type: 'libido',
        severity: 'high',
        message: 'Libido consistently ≤3/10 for multiple days',
        recommendation: 'Consider consulting an endocrinologist or urologist to check testosterone levels and hormonal balance'
      });
    }
    
    // No morning erections for extended period
    const morningErectionValues = recentData.map(entry => parseInt(entry.morningErections) || 0);
    const totalMorningErections = morningErectionValues.reduce((sum, val) => sum + val, 0);
    if (totalMorningErections === 0 && recentData.length >= 5) {
      triggers.push({
        type: 'morning-erections',
        severity: 'high',
        message: 'No morning erections for >3 months',
        recommendation: 'Consult a urologist to evaluate erectile function and potential underlying causes'
      });
    }
    
    // Unexplained infertility (if trying to conceive)
    const erectionQualityValues = recentData.map(entry => parseInt(entry.erectionQuality) || 5);
    const avgErectionQuality = erectionQualityValues.reduce((sum, val) => sum + val, 0) / erectionQualityValues.length;
    if (avgErectionQuality <= 4 && recentData.length >= 12) {
      triggers.push({
        type: 'fertility',
        severity: 'medium',
        message: 'Unexplained fertility concerns despite >12 months trying',
        recommendation: 'Consider fertility consultation with a reproductive endocrinologist or urologist'
      });
    }
    
    return triggers.length > 0 ? triggers : null;
  };

  // Generate AI Sexual Health Analysis with Enhanced Structure
  const generateSexualHealthAnalysis = async (data) => {
    try {
      console.log('🤖 Generating enhanced sexual health analysis...');
      
      const latestData = data[data.length - 1];
      const sexualHealthIndex = calculateSexualHealthReadinessIndex(data);
      
      const prompt = `As an expert in AMAB sexual, reproductive, and urological health, provide comprehensive analysis of this complete health data:

SEXUAL HEALTH DATA:
- Libido: ${latestData.libido}/10, Erection Quality: ${latestData.erectionQuality}/10, Sexual Satisfaction: ${latestData.sexualSatisfaction}/10
- Sexual Activity: ${latestData.sexualActivity}, Ejaculation Frequency: ${latestData.ejaculationFrequency}
- Last STI Screening: ${latestData.lastSTIScreening || 'Not recorded'}, Next STI Screening: ${latestData.nextSTIScreening || 'Not scheduled'}

UROLOGY & PROSTATE HEALTH DATA:
- Urinary Frequency: ${latestData.urinaryFrequency}, Urinary Urgency: ${latestData.urinaryUrgency}/10
- Urinary Flow: ${latestData.urinaryFlow}, Nocturia: ${latestData.nocturia} times/night
- Urinary Incontinence: ${latestData.urinaryIncontinence}, Prostate Health: ${latestData.prostateHealth}
- Last Prostate Exam: ${latestData.lastProstateExam || 'Not recorded'}, PSA Level: ${latestData.psaLevel || 'Not known'}
- Urinary Symptoms: ${latestData.urinarySymptoms.length > 0 ? latestData.urinarySymptoms.join(', ') : 'None reported'}

LIFESTYLE & MEDICAL FACTORS:
- Stress Level: ${latestData.stressLevel}/10, Sleep Quality: ${latestData.sleepQuality}/10
- Exercise Frequency: ${latestData.exerciseFrequency}, Alcohol: ${latestData.alcoholConsumption} drinks/week
- Smoking Status: ${latestData.smokingStatus}, Medications: ${latestData.medications.length > 0 ? latestData.medications.join(', ') : 'None'}
- Chronic Conditions: ${latestData.chronicConditions.length > 0 ? latestData.chronicConditions.join(', ') : 'None'}

CALCULATED SEXUAL HEALTH READINESS INDEX: ${sexualHealthIndex}%

Provide detailed, medically accurate analysis in this EXACT format:

**SEXUAL HEALTH STATUS** (Comprehensive current state analysis)
- Libido Score: ${latestData.libido}/10 - ${latestData.libido >= 7 ? 'Healthy sexual desire levels' : latestData.libido >= 4 ? 'Moderate libido with room for improvement' : 'Low libido requiring attention'}
- Erection Quality: ${latestData.erectionQuality}/10 - ${latestData.erectionQuality >= 7 ? 'Good erectile function' : latestData.erectionQuality >= 4 ? 'Moderate function, monitor for changes' : 'Poor erectile function, consider medical evaluation'}
- Sexual Satisfaction: ${latestData.sexualSatisfaction}/10 - ${latestData.sexualSatisfaction >= 7 ? 'High satisfaction with sexual experiences' : latestData.sexualSatisfaction >= 4 ? 'Moderate satisfaction, potential for improvement' : 'Low satisfaction, address underlying factors'}
- Sexual Health Readiness Index: ${sexualHealthIndex}% - ${sexualHealthIndex >= 70 ? 'Excellent sexual health status' : sexualHealthIndex >= 50 ? 'Good sexual health with some areas for improvement' : 'Sexual health needs attention and optimization'}

**UROLOGY & PROSTATE STATUS** (Detailed urological health assessment)
- Urinary Function: ${latestData.urinaryFrequency === 'normal' ? 'Normal urinary frequency (4-8 times/day)' : latestData.urinaryFrequency === 'frequent' ? 'Frequent urination (>8 times/day) - may indicate prostate enlargement or other conditions' : 'Infrequent urination (<4 times/day) - ensure adequate hydration'}
- Urinary Urgency: ${latestData.urinaryUrgency}/10 - ${latestData.urinaryUrgency >= 7 ? 'High urgency may indicate overactive bladder or prostate issues' : latestData.urinaryUrgency >= 4 ? 'Moderate urgency, monitor for changes' : 'Low urgency, good bladder control'}
- Nocturia: ${latestData.nocturia} times/night - ${latestData.nocturia === 0 ? 'Excellent - no nighttime urination' : latestData.nocturia <= 1 ? 'Normal - occasional nighttime urination' : latestData.nocturia >= 2 ? 'Frequent nocturia may indicate prostate enlargement, diabetes, or sleep apnea' : 'Monitor nocturia patterns'}
- Prostate Health: ${latestData.prostateHealth === 'normal' ? 'Normal prostate health status' : latestData.prostateHealth === 'enlarged' ? 'Prostate enlargement detected - monitor symptoms and consider medical follow-up' : 'Prostate concerns reported - seek urological evaluation'}
- PSA Level: ${latestData.psaLevel || 'Not available'} - ${latestData.psaLevel ? 'PSA level should be interpreted by healthcare provider in context of age and other factors' : 'Consider PSA testing if over 50 or with family history of prostate cancer'}

**PREDICTIONS** (7-day outlook with comprehensive health focus)
- Sexual Function: ${latestData.exerciseFrequency === 'low' ? 'Low exercise may continue to impact sexual performance and erectile function' : 'Good exercise routine supports cardiovascular health and sexual function'}
- Urinary Health: ${latestData.nocturia >= 2 ? 'Frequent nocturia may continue to disrupt sleep and indicate underlying prostate or bladder issues' : 'Urinary patterns appear stable'}
- Hormonal Balance: ${latestData.stressLevel > 6 ? 'High stress levels may continue to impact testosterone production and sexual desire' : 'Stress levels support healthy hormone balance'}
- Overall Wellness: ${latestData.sleepQuality < 6 ? 'Poor sleep quality may continue to affect energy, mood, and sexual function' : 'Good sleep quality supports overall health and sexual wellness'}

**ACTIONS** (Priority-based comprehensive recommendations)
🔴 High Priority: ${latestData.erectionQuality < 4 ? 'Seek medical evaluation for erectile dysfunction - may indicate cardiovascular or hormonal issues' : latestData.nocturia >= 3 ? 'Consult urologist for frequent nocturia - may indicate prostate enlargement or other conditions' : latestData.exerciseFrequency === 'low' ? 'Start regular cardiovascular exercise (30 min, 3x/week) to improve sexual function and overall health' : 'Maintain current healthy lifestyle practices'}
🟡 Medium Priority: ${latestData.stressLevel > 6 ? 'Implement stress management techniques (meditation, deep breathing) to improve sexual function and overall wellness' : latestData.lastProstateExam === '' ? 'Schedule annual prostate exam if over 50, or if experiencing urinary symptoms' : 'Continue regular health monitoring and screening'}
🟢 Low Priority: ${latestData.alcoholConsumption > 3 ? 'Reduce alcohol consumption to 1-2 drinks per day to improve sexual performance and sleep quality' : latestData.lastSTIScreening === '' ? 'Schedule regular STI screening if sexually active with multiple partners' : 'Maintain current healthy lifestyle choices'}

**INSIGHTS** (Comprehensive health correlations and connections)
- Sexual-Urological Connection: ${latestData.erectionQuality < 6 && latestData.urinaryFlow === 'weak' ? 'Both erectile dysfunction and weak urinary flow may indicate shared vascular or neurological issues' : 'Sexual and urinary functions appear independent'}
- Lifestyle Impact: ${latestData.exerciseFrequency === 'high' && latestData.stressLevel < 5 ? 'Excellent lifestyle factors supporting both sexual and urological health' : 'Lifestyle factors show mixed impact on health outcomes'}
- Age-Related Considerations: ${latestData.prostateHealth === 'enlarged' ? 'Prostate enlargement is common with aging and may affect both urinary and sexual function' : 'Prostate health appears stable for current age group'}
- Medication Effects: ${latestData.medications.length > 0 ? 'Current medications may impact sexual function - review with healthcare provider' : 'No medications currently affecting sexual or urological health'}

**HEALTH NUGGET** (Evidence-based health insight)
💡 ${latestData.exerciseFrequency === 'low' ? 'Regular exercise increases testosterone by up to 15% and improves both sexual function and urinary flow in men' : latestData.nocturia >= 2 ? 'Frequent nighttime urination may be the first sign of prostate enlargement - early detection improves treatment outcomes' : 'Maintaining a healthy weight reduces risk of both erectile dysfunction and prostate enlargement by up to 40%'}

Focus on comprehensive sexual, urological, and reproductive health. Provide medically accurate, detailed insights. Keep under 500 words.`;

      const response = await aiService.generateInsights(prompt);
      setInsights(response);
      
      console.log('✅ Enhanced sexual health analysis completed');
    } catch (error) {
      console.error('❌ Error generating sexual health analysis:', error);
      generateFallbackSexualHealthAnalysis(data);
    }
  };

  // Generate fallback analysis when AI services are unavailable
  const generateFallbackSexualHealthAnalysis = (data) => {
    if (data.length === 0) return;
    
    const latestData = data[data.length - 1];
    const sexualHealthIndex = calculateSexualHealthReadinessIndex(data);
    
    const fallbackInsights = `**SEXUAL HEALTH STATUS** (Comprehensive current state analysis)
- Libido Score: ${latestData.libido}/10 - ${latestData.libido >= 7 ? 'Healthy sexual desire levels supporting overall sexual wellness' : latestData.libido >= 4 ? 'Moderate libido with potential for improvement through lifestyle optimization' : 'Low libido requiring attention and potential medical evaluation'}
- Erection Quality: ${latestData.erectionQuality}/10 - ${latestData.erectionQuality >= 7 ? 'Good erectile function indicating healthy cardiovascular and neurological systems' : latestData.erectionQuality >= 4 ? 'Moderate function, monitor for changes and consider lifestyle improvements' : 'Poor erectile function, consider medical evaluation for underlying causes'}
- Sexual Satisfaction: ${latestData.sexualSatisfaction}/10 - ${latestData.sexualSatisfaction >= 7 ? 'High satisfaction with sexual experiences and overall sexual wellness' : latestData.sexualSatisfaction >= 4 ? 'Moderate satisfaction with potential for improvement' : 'Low satisfaction, address underlying physical and psychological factors'}
- Sexual Health Readiness Index: ${sexualHealthIndex}% - ${sexualHealthIndex >= 70 ? 'Excellent sexual health status with optimal function across all parameters' : sexualHealthIndex >= 50 ? 'Good sexual health with some areas for improvement and optimization' : 'Sexual health needs attention and comprehensive optimization'}

**UROLOGY & PROSTATE STATUS** (Detailed urological health assessment)
- Urinary Function: ${latestData.urinaryFrequency === 'normal' ? 'Normal urinary frequency (4-8 times/day) indicating healthy bladder function' : latestData.urinaryFrequency === 'frequent' ? 'Frequent urination (>8 times/day) may indicate prostate enlargement, diabetes, or overactive bladder' : 'Infrequent urination (<4 times/day) - ensure adequate hydration and monitor for dehydration'}
- Urinary Urgency: ${latestData.urinaryUrgency}/10 - ${latestData.urinaryUrgency >= 7 ? 'High urgency may indicate overactive bladder, prostate issues, or urinary tract problems' : latestData.urinaryUrgency >= 4 ? 'Moderate urgency, monitor for changes and consider lifestyle modifications' : 'Low urgency, excellent bladder control and function'}
- Nocturia: ${latestData.nocturia} times/night - ${latestData.nocturia === 0 ? 'Excellent - no nighttime urination indicating healthy bladder and prostate function' : latestData.nocturia <= 1 ? 'Normal - occasional nighttime urination is common with aging' : latestData.nocturia >= 2 ? 'Frequent nocturia may indicate prostate enlargement, diabetes, sleep apnea, or heart failure' : 'Monitor nocturia patterns'}
- Prostate Health: ${latestData.prostateHealth === 'normal' ? 'Normal prostate health status with no current concerns' : latestData.prostateHealth === 'enlarged' ? 'Prostate enlargement detected - monitor symptoms, consider medical follow-up, and track changes' : 'Prostate concerns reported - seek urological evaluation for proper assessment'}
- PSA Level: ${latestData.psaLevel || 'Not available'} - ${latestData.psaLevel ? 'PSA level should be interpreted by healthcare provider in context of age, family history, and other factors' : 'Consider PSA testing if over 50, have family history of prostate cancer, or experience urinary symptoms'}

**PREDICTIONS** (7-day outlook with comprehensive health focus)
- Sexual Function: ${latestData.exerciseFrequency === 'low' ? 'Low exercise may continue to impact sexual performance, erectile function, and overall cardiovascular health' : 'Good exercise routine supports cardiovascular health, testosterone production, and sexual function'}
- Urinary Health: ${latestData.nocturia >= 2 ? 'Frequent nocturia may continue to disrupt sleep quality and indicate underlying prostate or bladder issues requiring attention' : 'Urinary patterns appear stable with good bladder function'}
- Hormonal Balance: ${latestData.stressLevel > 6 ? 'High stress levels may continue to impact testosterone production, sexual desire, and overall hormonal balance' : 'Stress levels support healthy hormone balance and sexual function'}
- Overall Wellness: ${latestData.sleepQuality < 6 ? 'Poor sleep quality may continue to affect energy, mood, sexual function, and immune system' : 'Good sleep quality supports overall health, sexual wellness, and recovery'}

**ACTIONS** (Priority-based comprehensive recommendations)
🔴 High Priority: ${latestData.erectionQuality < 4 ? 'Seek medical evaluation for erectile dysfunction - may indicate cardiovascular disease, diabetes, or hormonal issues' : latestData.nocturia >= 3 ? 'Consult urologist for frequent nocturia - may indicate prostate enlargement, diabetes, or other serious conditions' : latestData.exerciseFrequency === 'low' ? 'Start regular cardiovascular exercise (30 min, 3x/week) to improve sexual function, testosterone levels, and overall health' : 'Maintain current healthy lifestyle practices and continue monitoring'}
🟡 Medium Priority: ${latestData.stressLevel > 6 ? 'Implement stress management techniques (meditation, deep breathing, therapy) to improve sexual function and overall wellness' : latestData.lastProstateExam === '' ? 'Schedule annual prostate exam if over 50, or if experiencing urinary symptoms or family history' : 'Continue regular health monitoring, screening, and preventive care'}
🟢 Low Priority: ${latestData.alcoholConsumption > 3 ? 'Reduce alcohol consumption to 1-2 drinks per day to improve sexual performance, sleep quality, and liver function' : latestData.lastSTIScreening === '' ? 'Schedule regular STI screening if sexually active with multiple partners' : 'Maintain current healthy lifestyle choices and preventive health measures'}

**INSIGHTS** (Comprehensive health correlations and connections)
- Sexual-Urological Connection: ${latestData.erectionQuality < 6 && latestData.urinaryFlow === 'weak' ? 'Both erectile dysfunction and weak urinary flow may indicate shared vascular, neurological, or hormonal issues requiring comprehensive evaluation' : 'Sexual and urinary functions appear independent with good overall health'}
- Lifestyle Impact: ${latestData.exerciseFrequency === 'high' && latestData.stressLevel < 5 ? 'Excellent lifestyle factors supporting both sexual and urological health with optimal function' : 'Lifestyle factors show mixed impact on health outcomes with room for optimization'}
- Age-Related Considerations: ${latestData.prostateHealth === 'enlarged' ? 'Prostate enlargement is common with aging and may affect both urinary and sexual function - regular monitoring recommended' : 'Prostate health appears stable for current age group with good function'}
- Medication Effects: ${latestData.medications.length > 0 ? 'Current medications may impact sexual function, urinary flow, or prostate health - review with healthcare provider' : 'No medications currently affecting sexual or urological health'}

**HEALTH NUGGET** (Evidence-based health insight)
💡 ${latestData.exerciseFrequency === 'low' ? 'Regular exercise increases testosterone by up to 15%, improves both sexual function and urinary flow, and reduces prostate cancer risk by 30% in men' : latestData.nocturia >= 2 ? 'Frequent nighttime urination may be the first sign of prostate enlargement - early detection and treatment improves outcomes by 40%' : 'Maintaining a healthy weight reduces risk of both erectile dysfunction and prostate enlargement by up to 40%, while regular exercise provides additional 25% protection'}`;
    
    setInsights(fallbackInsights);
  };

  // Parse insights into advanced sexual health boxes with proper presentation
  const parseInsightsIntoBoxes = (insights) => {
    const lines = insights.split('\n').filter(line => line.trim());
    const boxes = [];
    
    let currentBox = null;
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check for section headers
      if (trimmedLine.includes('**SEXUAL HEALTH STATUS**') || trimmedLine.includes('SEXUAL HEALTH STATUS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'sexual-health-status',
          title: '📊 Sexual Health Status',
          content: '',
          icon: '📊',
          hasScoring: true
        };
      } else if (trimmedLine.includes('**UROLOGY & PROSTATE STATUS**') || trimmedLine.includes('UROLOGY & PROSTATE STATUS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'urology-prostate-status',
          title: '🔬 Urology & Prostate Status',
          content: '',
          icon: '🔬',
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
                if (line.includes('Score:') || line.includes('Quality:') || line.includes('Satisfaction:') || line.includes('Index:')) {
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
      localStorage.setItem('amabSexualHealthData', JSON.stringify(updatedData));
      
      // Update next screening date
      if (sexualHealthEntry.nextSTIScreening) {
        setNextScreening(new Date(sexualHealthEntry.nextSTIScreening));
      }
      
      // Generate AI insights
      await generateSexualHealthAnalysis(updatedData);
      
      // Reset form for next entry
      setSexualHealthForm({
        date: new Date().toISOString().split('T')[0],
        sexualActivity: 'none',
        sexualSatisfaction: 5,
        libido: 5,
        erectionQuality: 5,
        ejaculationFrequency: 'normal',
        lastSTIScreening: '',
        nextSTIScreening: '',
        stiSymptoms: [],
        stressLevel: 5,
        sleepQuality: 5,
        exerciseFrequency: 'moderate',
        alcoholConsumption: 0,
        smokingStatus: 'never',
        // Urology & Prostate Health
        urinaryFrequency: 'normal',
        urinaryUrgency: 5,
        urinaryFlow: 'normal',
        nocturia: 0,
        urinaryIncontinence: 'none',
        prostateHealth: 'normal',
        lastProstateExam: '',
        nextProstateExam: '',
        psaLevel: '',
        urinarySymptoms: [],
        medications: [],
        chronicConditions: [],
        concerns: '',
        notes: ''
      });
      
      alert('Sexual health data logged successfully! 🏥');
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

  // Compact Sexual Health Overview Component
  const SexualHealthOverview = () => (
    <div className="compact-overview">
      <div className="overview-item">
        <div className="overview-icon">📊</div>
        <div className="overview-label">Entries Logged</div>
        <div className="overview-value">{sexualHealthData.length}</div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">💪</div>
        <div className="overview-label">Avg Satisfaction</div>
        <div className="overview-value">
          {sexualHealthData.length > 0 ? 
            Math.round(sexualHealthData.reduce((sum, entry) => sum + (entry.sexualSatisfaction || 0), 0) / sexualHealthData.length) : 0}/10
        </div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">🔥</div>
        <div className="overview-label">Avg Libido</div>
        <div className="overview-value">
          {sexualHealthData.length > 0 ? 
            Math.round(sexualHealthData.reduce((sum, entry) => sum + (entry.libido || 0), 0) / sexualHealthData.length) : 0}/10
        </div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">🏥</div>
        <div className="overview-label">Last Screening</div>
        <div className="overview-value">
          {nextScreening ? formatDate(nextScreening) : 'Not set'}
        </div>
      </div>
    </div>
  );

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
        <SexualHealthOverview />

        {/* Sexual Health Logging Form */}
        <div className="sexual-health-form-section">
          <h2>🏥 Log Your Sexual Health Data</h2>
          <form onSubmit={handleSexualHealthLog} className="sexual-health-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3>📅 Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                  <label htmlFor="date">Date *</label>
                <input
                    id="date"
                    name="date"
                  type="date"
                  value={sexualHealthForm.date}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, date: e.target.value})}
                  required
                    title="Select the date for this entry"
                  />
          </div>
          
                <div className="form-group">
                  <label htmlFor="sexual-activity">Sexual Activity</label>
                  <select
                    id="sexual-activity"
                    name="sexual-activity"
                    value={sexualHealthForm.sexualActivity}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, sexualActivity: e.target.value})}
                    title="Your current sexual activity status"
                  >
                    <option value="none">Not sexually active</option>
                    <option value="active">Sexually active</option>
                    <option value="inactive">Temporarily inactive</option>
                  </select>
                </div>
              </div>
          </div>
          
            {/* Sexual Function Assessment */}
            <div className="form-section">
              <h3>💪 Sexual Function Assessment</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sexual-satisfaction">Sexual Satisfaction (1-10)</label>
                  <input
                    id="sexual-satisfaction"
                    name="sexual-satisfaction"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.sexualSatisfaction}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, sexualSatisfaction: parseInt(e.target.value) || 5})}
                    title="Rate your overall sexual satisfaction on a scale of 1-10"
                />
              </div>
              
              <div className="form-group">
                  <label htmlFor="libido">Libido/Sex Drive (1-10)</label>
                <input
                    id="libido"
                    name="libido"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.libido}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, libido: parseInt(e.target.value) || 5})}
                    title="Rate your current libido/sex drive on a scale of 1-10"
                  />
          </div>
        </div>

            <div className="form-row">
              <div className="form-group">
                  <label htmlFor="erection-quality">Erection Quality (1-10)</label>
                  <input
                    id="erection-quality"
                    name="erection-quality"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.erectionQuality}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, erectionQuality: parseInt(e.target.value) || 5})}
                    title="Rate your erection quality on a scale of 1-10"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="ejaculation-frequency">Ejaculation Frequency</label>
                  <select
                    id="ejaculation-frequency"
                    name="ejaculation-frequency"
                    value={sexualHealthForm.ejaculationFrequency}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, ejaculationFrequency: e.target.value})}
                    title="Your current ejaculation frequency"
                  >
                    <option value="normal">Normal</option>
                    <option value="frequent">Frequent</option>
                    <option value="infrequent">Infrequent</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STI Screening & Symptoms */}
            <div className="form-section">
              <h3>🔬 STI Screening & Symptoms</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="last-sti-screening">Last STI Screening</label>
                  <input
                    id="last-sti-screening"
                    name="last-sti-screening"
                    type="date"
                    value={sexualHealthForm.lastSTIScreening}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, lastSTIScreening: e.target.value})}
                    title="Date of your last STI screening"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="next-sti-screening">Next STI Screening</label>
                <input
                    id="next-sti-screening"
                    name="next-sti-screening"
                  type="date"
                  value={sexualHealthForm.nextSTIScreening}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, nextSTIScreening: e.target.value})}
                    title="Date of your next scheduled STI screening"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>STI Symptoms (select all that apply)</label>
                <div className="symptoms-grid">
                  {availableSTISymptoms.map((symptom, index) => (
                    <label key={index} className="symptom-checkbox">
                      <input
                        type="checkbox"
                        checked={sexualHealthForm.stiSymptoms.includes(symptom)}
                        onChange={() => handleSTISymptomToggle(symptom)}
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle Factors */}
            <div className="form-section">
              <h3>🏃 Lifestyle Factors</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stress-level">Stress Level (1-10)</label>
                  <input
                    id="stress-level"
                    name="stress-level"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.stressLevel}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, stressLevel: parseInt(e.target.value) || 5})}
                    title="Rate your current stress level on a scale of 1-10"
                  />
              </div>
              
              <div className="form-group">
                  <label htmlFor="sleep-quality">Sleep Quality (1-10)</label>
                  <input
                    id="sleep-quality"
                    name="sleep-quality"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.sleepQuality}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, sleepQuality: parseInt(e.target.value) || 5})}
                    title="Rate your sleep quality on a scale of 1-10"
                  />
              </div>
            </div>

              <div className="form-row">
            <div className="form-group">
                  <label htmlFor="exercise-frequency">Exercise Frequency</label>
              <select
                    id="exercise-frequency"
                    name="exercise-frequency"
                    value={sexualHealthForm.exerciseFrequency}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, exerciseFrequency: e.target.value})}
                    title="Your current exercise frequency"
                  >
                    <option value="low">Low (0-1 times/week)</option>
                    <option value="moderate">Moderate (2-3 times/week)</option>
                    <option value="high">High (4+ times/week)</option>
              </select>
            </div>

            <div className="form-group">
                  <label htmlFor="alcohol-consumption">Alcohol (drinks/week)</label>
                  <input
                    id="alcohol-consumption"
                    name="alcohol-consumption"
                    type="number"
                    min="0"
                    max="50"
                    value={sexualHealthForm.alcoholConsumption}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, alcoholConsumption: parseInt(e.target.value) || 0})}
                    title="Number of alcoholic drinks consumed per week"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="smoking-status">Smoking Status</label>
                <select
                  id="smoking-status"
                  name="smoking-status"
                  value={sexualHealthForm.smokingStatus}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, smokingStatus: e.target.value})}
                  title="Your current smoking status"
                >
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
            </div>

            {/* Medical History */}
            <div className="form-section">
              <h3>💊 Medical History</h3>
              <div className="form-group">
                <label>Current Medications (select all that apply)</label>
                <div className="medications-grid">
                  {commonMedications.map((medication, index) => (
                    <label key={index} className="medication-checkbox">
                    <input
                      type="checkbox"
                        checked={sexualHealthForm.medications.includes(medication)}
                        onChange={() => handleMedicationToggle(medication)}
                    />
                      <span>{medication}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
                <label>Chronic Conditions (select all that apply)</label>
                <div className="conditions-grid">
                  {commonConditions.map((condition, index) => (
                    <label key={index} className="condition-checkbox">
                      <input
                        type="checkbox"
                        checked={sexualHealthForm.chronicConditions.includes(condition)}
                        onChange={() => handleConditionToggle(condition)}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Urology & Prostate Health */}
            <div className="form-section">
              <h3>🔬 Urology & Prostate Health</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="urinary-frequency">Urinary Frequency</label>
                  <select
                    id="urinary-frequency"
                    name="urinary-frequency"
                    value={sexualHealthForm.urinaryFrequency}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, urinaryFrequency: e.target.value})}
                    title="How often do you urinate"
                  >
                    <option value="normal">Normal (4-8 times/day)</option>
                    <option value="frequent">Frequent (more than 8 times/day)</option>
                    <option value="infrequent">Infrequent (less than 4 times/day)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="urinary-urgency">Urinary Urgency (1-10)</label>
                  <input
                    id="urinary-urgency"
                    name="urinary-urgency"
                    type="number"
                    min="1"
                    max="10"
                    value={sexualHealthForm.urinaryUrgency}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, urinaryUrgency: parseInt(e.target.value) || 5})}
                    title="Rate your urinary urgency on a scale of 1-10"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="urinary-flow">Urinary Flow</label>
                  <select
                    id="urinary-flow"
                    name="urinary-flow"
                    value={sexualHealthForm.urinaryFlow}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, urinaryFlow: e.target.value})}
                    title="Quality of your urinary flow"
                  >
                    <option value="normal">Normal</option>
                    <option value="weak">Weak</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="nocturia">Nocturia (times/night)</label>
                  <input
                    id="nocturia"
                    name="nocturia"
                    type="number"
                    min="0"
                    max="10"
                    value={sexualHealthForm.nocturia}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, nocturia: parseInt(e.target.value) || 0})}
                    title="Number of times you wake up to urinate at night"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="urinary-incontinence">Urinary Incontinence</label>
                  <select
                    id="urinary-incontinence"
                    name="urinary-incontinence"
                    value={sexualHealthForm.urinaryIncontinence}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, urinaryIncontinence: e.target.value})}
                    title="Level of urinary incontinence"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild (occasional)</option>
                    <option value="moderate">Moderate (frequent)</option>
                    <option value="severe">Severe (constant)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="prostate-health">Prostate Health</label>
                  <select
                    id="prostate-health"
                    name="prostate-health"
                    value={sexualHealthForm.prostateHealth}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, prostateHealth: e.target.value})}
                    title="Current prostate health status"
                  >
                    <option value="normal">Normal</option>
                    <option value="enlarged">Enlarged</option>
                    <option value="concerns">Have concerns</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="last-prostate-exam">Last Prostate Exam</label>
                  <input
                    id="last-prostate-exam"
                    name="last-prostate-exam"
                    type="date"
                    value={sexualHealthForm.lastProstateExam}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, lastProstateExam: e.target.value})}
                    title="Date of your last prostate exam"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="next-prostate-exam">Next Prostate Exam</label>
                  <input
                    id="next-prostate-exam"
                    name="next-prostate-exam"
                    type="date"
                    value={sexualHealthForm.nextProstateExam}
                    onChange={(e) => setSexualHealthForm({...sexualHealthForm, nextProstateExam: e.target.value})}
                    title="Date of your next scheduled prostate exam"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="psa-level">PSA Level (if known)</label>
                <input
                  id="psa-level"
                  name="psa-level"
                  type="text"
                  placeholder="e.g., 2.5 ng/mL"
                  value={sexualHealthForm.psaLevel}
                  onChange={(e) => setSexualHealthForm({...sexualHealthForm, psaLevel: e.target.value})}
                  title="Your most recent PSA (Prostate-Specific Antigen) level if known"
                />
              </div>
              
              <div className="form-group">
                <label>Urinary Symptoms (select all that apply)</label>
                <div className="symptoms-grid">
                  {availableUrinarySymptoms.map((symptom, index) => (
                    <label key={index} className="symptom-checkbox">
                      <input
                        type="checkbox"
                        checked={sexualHealthForm.urinarySymptoms.includes(symptom)}
                        onChange={() => handleUrinarySymptomToggle(symptom)}
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Concerns & Notes */}
            <div className="form-section">
              <h3>📝 Additional Information</h3>
              <div className="form-group">
                <label htmlFor="concerns">Current Concerns</label>
              <textarea
                  id="concerns"
                  name="concerns"
                value={sexualHealthForm.concerns}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, concerns: e.target.value})}
                  placeholder="Any specific concerns or questions about your sexual health..."
                  rows={3}
                  title="Describe any concerns about your sexual health"
              />
            </div>

            <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
              <textarea
                  id="notes"
                  name="notes"
                value={sexualHealthForm.notes}
                onChange={(e) => setSexualHealthForm({...sexualHealthForm, notes: e.target.value})}
                  placeholder="Any additional information you'd like to track..."
                  rows={2}
                  title="Any additional notes about your sexual health"
              />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? '🔄 Logging...' : '🏥 Log Sexual Health Data'}
            </button>
          </form>

          {/* AI Sexual Health Insights */}
        {insights && (
          <div className="insights-section">
              <div className="insights-header">
            <h2>🤖 AI Sexual Health Insights</h2>
                <div className="insights-actions">
                  <button
                    className="save-insights-btn"
                    onClick={() => saveInsights(insights)}
                    title="Save these insights for later review"
                  >
                    💾 Save Insights
                  </button>
                  <button
                    className="analyze-btn"
                    onClick={() => generateSexualHealthAnalysis(sexualHealthData)}
                    disabled={isLoading}
                    title="Generate AI analysis of your sexual health data"
                  >
                    {isLoading ? '🔄 Analyzing...' : '🧠 Analyze Sexual Health'}
                  </button>
                </div>
              </div>
              <div className="organized-insights">
                {parseInsightsIntoBoxes(insights)}
            </div>
          </div>
        )}

        {/* Doctor Referral Triggers */}
        {sexualHealthData.length >= 3 && analyzeSexualHealthPatterns() && (
          <div className="doctor-referral-section">
            <div className="referral-header">
              <h2>🚨 When to See a Doctor</h2>
              <p className="referral-subtitle">Based on your recent sexual health patterns, consider consulting a healthcare provider for these concerns:</p>
            </div>
            
            <div className="referral-triggers">
              {analyzeSexualHealthPatterns().map((trigger, index) => (
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
                  <span className="saved-insights-title">Saved Sexual Health Insights</span>
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
        </div>
      </div>
    </div>
  );
};

export default SexualHealth;
