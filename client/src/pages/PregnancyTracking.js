import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PregnancyAIService from '../ai/pregnancyAIService.js';
import './PregnancyTracking.css';

const PregnancyTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new PregnancyAIService());
  
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
  const [insights, setInsights] = useState({
    aiAnalysis: {
      title: "🤖 Dr. AI Pregnancy Analysis",
      subtitle: "Comprehensive prenatal health assessment",
      content: "🤖 AI analysis is being generated... Please complete a pregnancy check-in to generate your personalized pregnancy insights. This will include trimester-specific guidance, symptom analysis, and personalized recommendations based on your pregnancy data."
    },
    personalizedTips: [
      "Complete a pregnancy check-in to get personalized insights",
      "Track your symptoms and changes regularly",
      "Maintain a healthy lifestyle during pregnancy",
      "Stay in touch with your healthcare provider"
    ],
    gentleReminders: [
      "Remember to take prenatal vitamins",
      "Schedule regular check-ups",
      "Monitor your symptoms",
      "Stay hydrated and eat well"
    ]
  });
  const [pregnancyPatterns, setPregnancyPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [selectedPregnancyInsights, setSelectedPregnancyInsights] = useState(null);

  // CONVERSATIONAL FLOW STATE
  const [isConversationalMode, setIsConversationalMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [conversationData, setConversationData] = useState({});
  const [conversationSteps, setConversationSteps] = useState([]);

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

  // Delete a specific pregnancy entry
  const deletePregnancyEntry = (index) => {
    if (window.confirm('Are you sure you want to delete this pregnancy entry?')) {
      // Get the current data from localStorage (not the filtered state)
      const savedData = localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
      if (savedData) {
        const allData = JSON.parse(savedData);
        
        // Find the entry to delete by matching timestamp with the displayed entry
        const displayedData = pregnancyData.slice(-5).reverse();
        const entryToDelete = displayedData[index];
        
        if (entryToDelete) {
          // Remove the entry from the full dataset
          const updatedData = allData.filter(entry => entry.timestamp !== entryToDelete.timestamp);
          
          // Save the updated data
          localStorage.setItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));
          
          // Filter the updated data the same way as in useEffect
          const validData = updatedData.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return entryDate > sixMonthsAgo && entry.dueDate && entry.dueDate !== '';
          });
          
          // Update the state with the filtered data
          setPregnancyData(validData);
          
          console.log(`🗑️ Entry deleted. Remaining entries: ${validData.length}`);
          
          // Clear any existing insights since we deleted an entry
          setInsights(null);
          setPregnancyPatterns(null);
          setPersonalizedRecommendations(null);
          setHealthAlerts([]);
          setRiskAssessment(null);
          
          // Recalculate progress if we have data left
          if (validData.length > 0) {
            const latestEntry = validData[validData.length - 1];
            if (latestEntry.dueDate) {
              calculatePregnancyProgress(latestEntry.dueDate);
            }
          } else {
            setPregnancyProgress(null);
          }
        }
      }
    }
  };

  // View insights for a specific entry
  const viewInsightsForEntry = (entry, index) => {
    const userId = user?.id || user?.email || 'anonymous';
    const centralKey = `centralAIInsights_${userId}`;
    
    console.log('🔍 ROBOT ICON CLICKED - Entry:', entry);
    console.log('🔍 ROBOT ICON CLICKED - User ID:', userId);
    console.log('🔍 ROBOT ICON CLICKED - Central Key:', centralKey);
    
    try {
      // Get insights from central storage (where they are actually stored)
      const centralInsights = localStorage.getItem(centralKey);
      console.log('🔍 ROBOT ICON - Central insights raw:', centralInsights);
      
      if (centralInsights) {
        const allInsights = JSON.parse(centralInsights);
        console.log('🔍 ROBOT ICON - All insights parsed:', allInsights);
        console.log('🔍 ROBOT ICON - All insights keys:', Object.keys(allInsights));
        
        const pregnancyInsights = allInsights.pregnancy;
        console.log('🔍 ROBOT ICON - Pregnancy insights:', pregnancyInsights);
        
        if (pregnancyInsights) {
          console.log('🔍 ROBOT ICON - Found pregnancy insights in central storage:', pregnancyInsights);
          console.log('🔍 ROBOT ICON - AI Analysis:', pregnancyInsights.aiAnalysis);
          console.log('🔍 ROBOT ICON - AI Analysis content length:', pregnancyInsights.aiAnalysis?.content?.length);
          console.log('🔍 ROBOT ICON - AI Analysis content preview:', pregnancyInsights.aiAnalysis?.content?.substring(0, 200) + '...');
          
          // Set the insights for the modal display with COMPLETE AI analysis
          const modalData = {
            ...pregnancyInsights,
            timestamp: entry.timestamp,
            entry: entry
          };
          
          console.log('🔍 ROBOT ICON - Setting modal data:', modalData);
          console.log('🔍 ROBOT ICON - About to set selectedPregnancyInsights');
          setSelectedPregnancyInsights(modalData);
          console.log('🔍 ROBOT ICON - selectedPregnancyInsights should now be set');
        } else {
          console.log('❌ ROBOT ICON - No pregnancy insights found in central storage');
          alert('No AI insights found for this entry. Please complete a new pregnancy check-in to generate insights.');
        }
      } else {
        console.log('❌ ROBOT ICON - No central insights found in localStorage');
        alert('No AI insights found. Please complete a pregnancy check-in to generate insights.');
      }
    } catch (error) {
      console.error('❌ ROBOT ICON - Error retrieving insights:', error);
      alert('Error retrieving AI insights. Please try again.');
    }
  };

  // CONVERSATIONAL FLOW FUNCTIONS
  const getConversationSteps = (trimester) => {
    const baseSteps = [
      {
        id: 'basic-info',
        title: 'Basic Pregnancy Information',
        questions: [
          {
            id: 'dueDate',
            type: 'date',
            label: 'What is your due date?',
            required: true,
            placeholder: 'Select your due date'
          },
          {
            id: 'lastMenstrualPeriod',
            type: 'date',
            label: 'When was your last menstrual period?',
            required: true,
            placeholder: 'Select LMP date'
          },
          {
            id: 'isFirstPregnancy',
            type: 'select',
            label: 'Is this your first pregnancy?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, first pregnancy' },
              { value: 'no', label: 'No, I have been pregnant before' }
            ]
          }
        ]
      },
      {
        id: 'current-symptoms',
        title: 'How are you feeling today?',
        questions: [
          {
            id: 'mood',
            type: 'scale',
            label: 'How would you rate your overall mood today?',
            required: true,
            min: 1,
            max: 10,
            labels: { 1: 'Very low', 5: 'Neutral', 10: 'Excellent' }
          },
          {
            id: 'energy',
            type: 'scale',
            label: 'How is your energy level?',
            required: true,
            min: 1,
            max: 10,
            labels: { 1: 'Very tired', 5: 'Moderate', 10: 'Very energetic' }
          },
          {
            id: 'sleep',
            type: 'scale',
            label: 'How was your sleep quality last night?',
            required: true,
            min: 1,
            max: 10,
            labels: { 1: 'Very poor', 5: 'Fair', 10: 'Excellent' }
          }
        ]
      }
    ];

    // Add trimester-specific steps
    if (trimester === 1) {
      baseSteps.push({
        id: 'first-trimester',
        title: 'First Trimester (Weeks 1-12)',
        questions: [
          {
            id: 'morningSickness',
            type: 'select',
            label: 'How is your morning sickness?',
            required: true,
            options: [
              { value: 'none', label: 'No morning sickness' },
              { value: 'mild', label: 'Mild nausea' },
              { value: 'moderate', label: 'Moderate nausea' },
              { value: 'severe', label: 'Severe nausea/vomiting' }
            ]
          },
          {
            id: 'foodAversions',
            type: 'multiselect',
            label: 'Any food aversions?',
            required: false,
            options: [
              'Meat', 'Dairy', 'Vegetables', 'Spicy foods', 'Coffee', 'Alcohol', 'None'
            ]
          },
          {
            id: 'breastTenderness',
            type: 'select',
            label: 'Breast tenderness?',
            required: true,
            options: [
              { value: 'none', label: 'None' },
              { value: 'mild', label: 'Mild' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'severe', label: 'Severe' }
            ]
          },
          {
            id: 'spotting',
            type: 'select',
            label: 'Any spotting or bleeding?',
            required: true,
            options: [
              { value: 'none', label: 'No spotting' },
              { value: 'light', label: 'Light spotting' },
              { value: 'moderate', label: 'Moderate bleeding' },
              { value: 'heavy', label: 'Heavy bleeding' }
            ]
          }
        ]
      });
    } else if (trimester === 2) {
      baseSteps.push({
        id: 'second-trimester',
        title: 'Second Trimester (Weeks 13-26)',
        questions: [
          {
            id: 'fetalMovement',
            type: 'select',
            label: 'Have you felt the baby move yet?',
            required: true,
            options: [
              { value: 'yes', label: 'Yes, I feel movement' },
              { value: 'no', label: 'No, not yet' },
              { value: 'unsure', label: 'Not sure' }
            ]
          },
          {
            id: 'energyLevel',
            type: 'select',
            label: 'How is your energy compared to first trimester?',
            required: true,
            options: [
              { value: 'much-better', label: 'Much better' },
              { value: 'better', label: 'Better' },
              { value: 'same', label: 'About the same' },
              { value: 'worse', label: 'Worse' }
            ]
          },
          {
            id: 'backPain',
            type: 'select',
            label: 'Any back pain or discomfort?',
            required: true,
            options: [
              { value: 'none', label: 'No back pain' },
              { value: 'mild', label: 'Mild discomfort' },
              { value: 'moderate', label: 'Moderate pain' },
              { value: 'severe', label: 'Severe pain' }
            ]
          },
          {
            id: 'heartburn',
            type: 'select',
            label: 'Any heartburn or digestive issues?',
            required: true,
            options: [
              { value: 'none', label: 'None' },
              { value: 'mild', label: 'Mild heartburn' },
              { value: 'moderate', label: 'Moderate heartburn' },
              { value: 'severe', label: 'Severe heartburn' }
            ]
          }
        ]
      });
    } else if (trimester === 3) {
      baseSteps.push({
        id: 'third-trimester',
        title: 'Third Trimester (Weeks 27-40)',
        questions: [
          {
            id: 'fetalMovement',
            type: 'select',
            label: 'How often do you feel the baby move?',
            required: true,
            options: [
              { value: 'very-active', label: 'Very active, constant movement' },
              { value: 'active', label: 'Active, regular movement' },
              { value: 'moderate', label: 'Moderate movement' },
              { value: 'decreased', label: 'Decreased movement' }
            ]
          },
          {
            id: 'braxtonHicks',
            type: 'select',
            label: 'Any Braxton Hicks contractions?',
            required: true,
            options: [
              { value: 'none', label: 'None' },
              { value: 'mild', label: 'Mild, occasional' },
              { value: 'moderate', label: 'Moderate, regular' },
              { value: 'frequent', label: 'Frequent, strong' }
            ]
          },
          {
            id: 'swelling',
            type: 'select',
            label: 'Any swelling in hands or feet?',
            required: true,
            options: [
              { value: 'none', label: 'No swelling' },
              { value: 'mild', label: 'Mild swelling' },
              { value: 'moderate', label: 'Moderate swelling' },
              { value: 'severe', label: 'Severe swelling' }
            ]
          },
          {
            id: 'sleepComfort',
            type: 'select',
            label: 'How is your sleep and comfort?',
            required: true,
            options: [
              { value: 'good', label: 'Sleeping well' },
              { value: 'fair', label: 'Sleeping okay' },
              { value: 'poor', label: 'Sleeping poorly' },
              { value: 'very-poor', label: 'Very poor sleep' }
            ]
          }
        ]
      });
    }

    // Add medical history step
    baseSteps.push({
      id: 'medical-history',
      title: 'Medical History & Risk Factors',
      questions: [
        {
          id: 'previousComplications',
          type: 'multiselect',
          label: 'Any previous pregnancy complications?',
          required: false,
          options: [
            'Gestational diabetes', 'Preeclampsia', 'Preterm labor', 'Miscarriage', 'Stillbirth', 'None'
          ]
        },
        {
          id: 'chronicConditions',
          type: 'multiselect',
          label: 'Any chronic medical conditions?',
          required: false,
          options: [
            'Diabetes', 'High blood pressure', 'Thyroid issues', 'Heart conditions', 'Autoimmune disorders', 'None'
          ]
        },
        {
          id: 'medications',
          type: 'multiselect',
          label: 'Current medications or supplements?',
          required: false,
          options: [
            'Prenatal vitamins', 'Folic acid', 'Iron supplements', 'Prescription medications', 'None'
          ]
        }
      ]
    });

    // Add lifestyle step
    baseSteps.push({
      id: 'lifestyle',
      title: 'Lifestyle & Health',
      questions: [
        {
          id: 'diet',
          type: 'select',
          label: 'How would you rate your diet and nutrition?',
          required: true,
          options: [
            { value: 'excellent', label: 'Excellent - very healthy' },
            { value: 'good', label: 'Good - mostly healthy' },
            { value: 'fair', label: 'Fair - could be better' },
            { value: 'poor', label: 'Poor - needs improvement' }
          ]
        },
        {
          id: 'exercise',
          type: 'select',
          label: 'How much exercise do you get?',
          required: true,
          options: [
            { value: 'none', label: 'No exercise' },
            { value: 'light', label: 'Light exercise (walking, yoga)' },
            { value: 'moderate', label: 'Moderate exercise' },
            { value: 'active', label: 'Very active' }
          ]
        },
        {
          id: 'stress',
          type: 'scale',
          label: 'How would you rate your stress level?',
          required: true,
          min: 1,
          max: 10,
          labels: { 1: 'Very low', 5: 'Moderate', 10: 'Very high' }
        }
      ]
    });

    return baseSteps;
  };

  const startConversation = () => {
    const steps = getConversationSteps(pregnancyForm.trimester);
    setConversationSteps(steps);
    setIsConversationalMode(true);
    setCurrentStep(0);
    setConversationData({});
  };

  const nextStep = () => {
    if (currentStep < conversationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConversationAnswer = (questionId, answer) => {
    setConversationData(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const completeConversation = async () => {
    setIsLoading(true);
    
    try {
      // Merge conversation data with form data
      const mergedData = {
        ...pregnancyForm,
        ...conversationData,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        moduleType: 'pregnancy',
        userId: user?.id
      };

      // Save to localStorage
      const updatedData = [...pregnancyData, mergedData];
      setPregnancyData(updatedData);
      localStorage.setItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`, JSON.stringify(updatedData));

      // Calculate pregnancy progress
      if (mergedData.dueDate) {
        calculatePregnancyProgress(mergedData.dueDate);
      }

      // Generate AI insights
      const userProfile = {
        ...user,
        id: user?.id, // Ensure ID is preserved
        email: user?.email, // Ensure email is preserved
        age: calculateAge(user?.dateOfBirth),
        conditions: { reproductive: [] },
        familyHistory: { womensConditions: [] },
        lifestyle: { exercise: { frequency: 'Moderate' }, stress: { level: 'Moderate' } },
        tobaccoUse: 'No'
      };

      console.log('🤖 Calling AI service for pregnancy analysis...');
      
      // DEMO MODE: Reset AI service for smooth demo experience
      if (aiService.forceResetForDemo) {
        aiService.forceResetForDemo();
      }
      
      // Use emergency retry for demo - keep trying Gemini harder
      const rawAIResponse = await aiService.generateHealthInsightsWithEmergencyRetry(
        aiService.buildPregnancyPrompt(updatedData, userProfile), 
        userProfile
      );

      console.log('✅ REAL AI Raw Response received:', rawAIResponse);
      
      // Process the raw response into structured insights
      const aiInsights = await aiService.processPregnancyInsights(rawAIResponse, updatedData, userProfile);

      console.log('✅ Processed AI Pregnancy Insights:', aiInsights);

      // Set AI insights
      if (aiInsights) {
        // Set the main AI insights object
        setInsights(aiInsights);
        console.log('🔍 INSIGHTS SET - aiInsights:', aiInsights);
        console.log('🔍 INSIGHTS SET - aiAnalysis:', aiInsights.aiAnalysis);
        console.log('🔍 INSIGHTS SET - content length:', aiInsights.aiAnalysis?.content?.length);
        
        // Store insights for robot icon (central storage)
        if (aiService.storeInsightsForRobotIcon) {
          console.log('🔍 STORING PREGNANCY INSIGHTS - userProfile:', userProfile);
          console.log('🔍 STORING PREGNANCY INSIGHTS - user ID:', userProfile?.id);
          console.log('🔍 STORING PREGNANCY INSIGHTS - user email:', userProfile?.email);
          aiService.storeInsightsForRobotIcon('pregnancy', aiInsights, userProfile);
        }
        
        // Set personalized tips
        if (aiInsights.personalizedTips) {
          setPersonalizedRecommendations(Array.isArray(aiInsights.personalizedTips) ? 
            aiInsights.personalizedTips.join(' • ') : 
            aiInsights.personalizedTips);
        }
        
        // Set pregnancy patterns
        if (aiInsights.pregnancyPatterns) {
          setPregnancyPatterns(aiInsights.pregnancyPatterns);
        }
        
        // Set gentle reminders
        if (aiInsights.gentleReminders) {
          setHealthAlerts(Array.isArray(aiInsights.gentleReminders) ? 
            aiInsights.gentleReminders : 
            [aiInsights.gentleReminders]);
        }
        
        // Set risk assessment
        if (aiInsights.riskAssessment) {
          setRiskAssessment(aiInsights.riskAssessment);
        }
      }

      // Reset conversation
      setIsConversationalMode(false);
      setCurrentStep(0);
      setConversationData({});
      setConversationSteps([]);

    } catch (error) {
      console.error('❌ Error completing conversation:', error);
      setInsights(['AI services temporarily unavailable. Please try again in a moment.']);
    } finally {
      setIsLoading(false);
    }
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
    // Clear any existing pregnancy progress first
    setPregnancyProgress(null);
    
    const savedData = localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Only load data if it's recent (within last 6 months) and has valid due date
      const validData = parsed.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        return entryDate > sixMonthsAgo && entry.dueDate && entry.dueDate !== '';
      });
      
      if (validData.length > 0) {
        setPregnancyData(validData);
        
        // Calculate pregnancy progress only for valid data
        const latest = validData[validData.length - 1];
        if (latest.dueDate) {
          calculatePregnancyProgress(latest.dueDate);
        }
      } else {
        // Clear invalid/old data
        localStorage.removeItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
        setPregnancyData([]);
        setPregnancyProgress(null);
      }
    } else {
      // No saved data, ensure clean state
      setPregnancyData([]);
      setPregnancyProgress(null);
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
        id: user?.id, // Ensure ID is preserved
        email: user?.email, // Ensure email is preserved
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
          setTimeout(() => reject(new Error('AI request timeout after 60 seconds')), 60000)
        )
      ]);
      
      console.log('✅ REAL AI Pregnancy Insights received:', aiInsights);
      
      // Set all the comprehensive AI pregnancy insights (SAME STRUCTURE AS CYCLE TRACKING)
      if (aiInsights) {
        // AI Insights - detailed medical analysis (EXACT WORKING VERSION)
        setInsights(aiInsights);
        
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
        let riskText = 'AI pregnancy risk assessment completed!';
        if (pregnancyAssessment?.riskLevel) {
          riskText = `Pregnancy Risk: ${pregnancyAssessment.riskLevel} • Monitoring: Active`;
        } else if (aiInsights.riskAssessment) {
          if (Array.isArray(aiInsights.riskAssessment)) {
            riskText = `Pregnancy Risk: ${aiInsights.riskAssessment.join(' • ')} • Monitoring: Active`;
          } else if (typeof aiInsights.riskAssessment === 'object') {
            riskText = `Pregnancy Risk: ${JSON.stringify(aiInsights.riskAssessment)} • Monitoring: Active`;
          } else {
            riskText = `Pregnancy Risk: ${aiInsights.riskAssessment} • Monitoring: Active`;
          }
        }
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

  // FIELD RENDERERS FOR CONVERSATIONAL FLOW
  const renderField = (question) => {
    const value = conversationData[question.id] || '';
    
    switch (question.type) {
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleConversationAnswer(question.id, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            className="conversation-input"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleConversationAnswer(question.id, e.target.value)}
            required={question.required}
            className="conversation-select"
          >
            <option value="">Select an option...</option>
            {question.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="multiselect-container">
            {question.options.map(option => (
              <label key={option} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleConversationAnswer(question.id, newValues);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'scale':
        return (
          <div className="scale-container">
            <div className="scale-labels">
              <span>{question.labels[question.min]}</span>
              <span>{question.labels[question.max]}</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={value || question.min}
              onChange={(e) => handleConversationAnswer(question.id, parseInt(e.target.value))}
              className="conversation-scale"
            />
            <div className="scale-value">{value || question.min}</div>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConversationAnswer(question.id, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            className="conversation-input"
          />
        );
    }
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
        {/* Pregnancy Overview - ALWAYS SHOW */}
        <div className="pregnancy-overview">
          <div className="overview-card">
            <h3>📅 Due Date</h3>
            <p className="date-display">
              {pregnancyData.length > 0 && pregnancyData[pregnancyData.length - 1]?.dueDate ? 
                formatDate(new Date(pregnancyData[pregnancyData.length - 1].dueDate)) : 
                'Complete a pregnancy check-in to set your due date'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Pregnancy Progress</h3>
            <p className="progress-display">
              {pregnancyProgress ? 
                `${pregnancyProgress.weeksPregnant} weeks, ${pregnancyProgress.daysPregnant % 7} days` :
                'Complete a pregnancy check-in to track your progress'
              }
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Trimester</h3>
            <p className="trimester-display">
              {pregnancyProgress ? 
                `Trimester ${pregnancyProgress.trimester}` :
                'Complete a pregnancy check-in to determine your trimester'
              }
            </p>
          </div>
        </div>

        {/* Clear Data Button for Testing */}
        {pregnancyData.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button 
              onClick={() => {
                localStorage.removeItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`);
                setPregnancyData([]);
                setPregnancyProgress(null);
                setInsights({
                  aiAnalysis: {
                    title: "🤖 Dr. AI Pregnancy Analysis",
                    subtitle: "Comprehensive prenatal health assessment",
                    content: "🤖 AI analysis is being generated... Please complete a pregnancy check-in to generate your personalized pregnancy insights. This will include trimester-specific guidance, symptom analysis, and personalized recommendations based on your pregnancy data."
                  },
                  personalizedTips: [
                    "Complete a pregnancy check-in to get personalized insights",
                    "Track your symptoms and changes regularly",
                    "Maintain a healthy lifestyle during pregnancy",
                    "Stay in touch with your healthcare provider"
                  ],
                  gentleReminders: [
                    "Remember to take prenatal vitamins",
                    "Schedule regular check-ups",
                    "Monitor your symptoms",
                    "Stay hydrated and eat well"
                  ]
                });
                setPersonalizedRecommendations(null);
                setPregnancyPatterns(null);
                setHealthAlerts([]);
                setRiskAssessment(null);
                alert('Pregnancy data cleared!');
              }}
              style={{
                background: 'rgba(255, 107, 157, 0.2)',
                border: '1px solid #ff6b9d',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: '#ff6b9d',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🗑️ Clear All Pregnancy Data
            </button>
          </div>
        )}

        {/* Pregnancy Logging - Conversational Flow */}
        <div className="pregnancy-form-section">
          <h2>🤰 Track Your Pregnancy Journey</h2>
          
          {!isConversationalMode ? (
            <div className="conversation-start">
              <div className="welcome-message">
                <h3>Welcome to your personalized pregnancy companion! 👋</h3>
                <p>Let's start by understanding your current pregnancy stage to provide you with the most relevant and helpful insights.</p>
              </div>
              
              <div className="trimester-selector">
                <h3>Which trimester are you currently in?</h3>
                <div className="trimester-options">
                  {[1, 2, 3].map(trimester => (
                    <button
                      key={trimester}
                      className={`trimester-btn ${pregnancyForm.trimester === trimester ? 'selected' : ''}`}
                      onClick={() => setPregnancyForm({...pregnancyForm, trimester})}
                    >
                      <div className="trimester-icon">
                        {trimester === 1 ? '🌱' : trimester === 2 ? '🌿' : '🌳'}
                      </div>
                      <div className="trimester-number">Trimester {trimester}</div>
                      <div className="trimester-weeks">{getTrimesterInfo(trimester).weeks} weeks</div>
                      <div className="trimester-desc">{getTrimesterInfo(trimester).description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                className="start-conversation-btn"
                onClick={startConversation}
                disabled={!pregnancyForm.trimester}
              >
                {pregnancyForm.trimester ? `Start ${getTrimesterInfo(pregnancyForm.trimester).description} Check-in` : 'Select your trimester first'}
              </button>
            </div>
          ) : (
            <div className="conversation-flow">
              <div className="conversation-header">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentStep + 1) / conversationSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="step-counter">
                    Step {currentStep + 1} of {conversationSteps.length}
                  </div>
                </div>
              </div>

              {conversationSteps[currentStep] && (
                <div className="conversation-step">
                  <div className="step-header">
                    <h3>{conversationSteps[currentStep].title}</h3>
                    <p className="step-description">
                      {currentStep === 0 && "Let's start with some basic information about your pregnancy."}
                      {currentStep === 1 && "Tell us how you're feeling today."}
                      {currentStep === 2 && "Share details specific to your current trimester."}
                      {currentStep === 3 && "Help us understand your medical background."}
                      {currentStep === 4 && "Tell us about your lifestyle and daily habits."}
                    </p>
                  </div>
                  
                  <div className="questions-container">
                    {conversationSteps[currentStep].questions.map((question, index) => (
                      <div key={question.id} className="question-group">
                        <label className="question-label">
                          {question.label}
                          {question.required && <span className="required">*</span>}
                        </label>
                        {renderField(question)}
                      </div>
                    ))}
                  </div>

                  <div className="conversation-navigation">
                    <button 
                      className="nav-btn prev-btn"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      ← Previous
                    </button>
                    
                    {currentStep === conversationSteps.length - 1 ? (
                      <button 
                        className="nav-btn complete-btn"
                        onClick={completeConversation}
                        disabled={isLoading}
                      >
                        {isLoading ? '🤖 Analyzing Your Pregnancy...' : '✨ Complete Check-in'}
                      </button>
                    ) : (
                      <button 
                        className="nav-btn next-btn"
                        onClick={nextStep}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Insights - ALWAYS RENDER - NO CONDITIONALS */}
        <div className="ai-insights-section">
          <h2>{insights?.aiAnalysis?.title || "🤖 Dr. AI Pregnancy Analysis"}</h2>
          <p className="insights-subtitle">{insights?.aiAnalysis?.subtitle || "Comprehensive prenatal health assessment"}</p>
          
          {/* Main AI Analysis Content - ALWAYS show content */}
          <div className="insight-box main-analysis-box">
            <h3>📊 Comprehensive Pregnancy Analysis</h3>
            <div 
              className="insight-content"
              dangerouslySetInnerHTML={{ 
                __html: (() => {
                  const content = insights?.aiAnalysis?.content || insights?.content || "";
                  console.log('🔍 DISPLAY DEBUG - insights object:', insights);
                  console.log('🔍 DISPLAY DEBUG - aiAnalysis:', insights?.aiAnalysis);
                  console.log('🔍 DISPLAY DEBUG - content:', content?.substring(0, 100) + '...');
                  console.log('🔍 DISPLAY DEBUG - content length:', content?.length);
                  if (!content || content.trim() === "") {
                    return "🤖 Complete a pregnancy check-in to generate your personalized AI insights. This will include trimester-specific guidance, symptom analysis, and personalized recommendations based on your pregnancy data.";
                  }
                  return content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
                })()
              }}
            />
          </div>
            

          </div>



        {/* Pregnancy History - ALWAYS SHOW */}
        <div className="pregnancy-history">
          <h2>📈 Pregnancy History</h2>
          <div className="history-list">
            {pregnancyData.length > 0 ? (
              pregnancyData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-content">
                    <div className="history-date">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      <span>Trimester: {entry.trimester}</span>
                      {entry.weight && <span>Weight: {entry.weight} lbs</span>}
                      {entry.bloodPressure && <span>BP: {entry.bloodPressure}</span>}
                      {entry.fetalHeartbeat && <span>FHR: {entry.fetalHeartbeat} BPM</span>}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🗑️ Delete button clicked for display index: ${index}`);
                        deletePregnancyEntry(index);
                      }}
                      title="Delete Entry"
                      style={{ cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="history-item">
                <div className="history-content">
                  <div className="history-details">
                    <span>No pregnancy history yet. Complete a pregnancy check-in to start tracking your journey!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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

      {/* Historical AI Insights Modal */}
      {selectedPregnancyInsights && (
        <div className="insights-modal-overlay" onClick={() => setSelectedPregnancyInsights(null)}>
          <div className="insights-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤖 AI Insights - {new Date(selectedPregnancyInsights.timestamp).toLocaleDateString()}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedPregnancyInsights(null)}
              >
                ✕
              </button>
            </div>
            
            {/* SIMPLE TEST - ALWAYS SHOW THIS */}
            <div style={{padding: '20px', background: 'red', color: 'white'}}>
              <h3>🔍 MODAL IS OPEN - TEST MESSAGE</h3>
              <p>selectedPregnancyInsights exists: {selectedPregnancyInsights ? 'YES' : 'NO'}</p>
              <p>aiAnalysis exists: {selectedPregnancyInsights?.aiAnalysis ? 'YES' : 'NO'}</p>
              <p>content exists: {selectedPregnancyInsights?.aiAnalysis?.content ? 'YES' : 'NO'}</p>
              <p>content length: {selectedPregnancyInsights?.aiAnalysis?.content?.length || 0}</p>
            </div>
            
            <div className="modal-content">
              <div className="insights-section">
                <h3>🤖 Dr. AI Pregnancy Analysis</h3>
                
                {/* DEBUG INFO */}
                {console.log('🔍 MODAL - selectedPregnancyInsights:', selectedPregnancyInsights)}
                {console.log('🔍 MODAL - aiAnalysis:', selectedPregnancyInsights?.aiAnalysis)}
                {console.log('🔍 MODAL - aiAnalysis content:', selectedPregnancyInsights?.aiAnalysis?.content)}
                {console.log('🔍 MODAL - aiAnalysis content length:', selectedPregnancyInsights?.aiAnalysis?.content?.length)}
                
                {/* COMPLETE AI ANALYSIS - WORD FOR WORD */}
                {selectedPregnancyInsights.aiAnalysis?.content ? (
                  <div className="insight-item">
                    <h4>📋 Complete AI Analysis</h4>
                    <div 
                      className="ai-analysis-content"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedPregnancyInsights.aiAnalysis.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                ) : (
                  <div className="insight-item">
                    <h4>❌ No AI Analysis Content Found</h4>
                    <p>Debug info: {JSON.stringify(selectedPregnancyInsights, null, 2)}</p>
                  </div>
                )}

                {/* Personalized Tips */}
                {selectedPregnancyInsights.personalizedTips && (
                  <div className="insight-item">
                    <h4>💡 Personalized Tips</h4>
                    <ul>
                      {Array.isArray(selectedPregnancyInsights.personalizedTips) ? 
                        selectedPregnancyInsights.personalizedTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        )) : 
                        <li>{selectedPregnancyInsights.personalizedTips}</li>
                      }
                    </ul>
                  </div>
                )}

                {/* Gentle Reminders */}
                {selectedPregnancyInsights.gentleReminders && (
                  <div className="insight-item">
                    <h4>🌸 Gentle Reminders</h4>
                    <ul>
                      {Array.isArray(selectedPregnancyInsights.gentleReminders) ? 
                        selectedPregnancyInsights.gentleReminders.map((reminder, index) => (
                          <li key={index}>{reminder}</li>
                        )) : 
                        <li>{selectedPregnancyInsights.gentleReminders}</li>
                      }
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PregnancyTracking;
