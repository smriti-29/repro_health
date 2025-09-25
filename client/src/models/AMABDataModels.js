// COMPREHENSIVE AMAB DATA MODELS
// Complete data structures for all AMAB lifecycle stages and tracking needs

export const AMABLifeStages = {
  PUBERTY: 'puberty',           // Ages 9-17
  YOUNG_ADULT: 'young_adult',   // Ages 18-30
  REPRODUCTIVE: 'reproductive', // Ages 30-50
  MATURE_ADULT: 'mature_adult', // Ages 50-65
  SENIOR: 'senior'              // Ages 65+
};

export const AMABTrackingModules = {
  GENERAL_HEALTH: 'general_health',
  HORMONAL_HEALTH: 'hormonal_health',
  REPRODUCTIVE_HEALTH: 'reproductive_health',
  PERFORMANCE: 'performance',
  NUTRITION: 'nutrition',
  MENTAL_HEALTH: 'mental_health',
  UROLOGY: 'urology',
  FERTILITY: 'fertility',
  PREVENTIVE_CARE: 'preventive_care',
  MEDICATIONS: 'medications'
};

// ===== CORE AMAB USER PROFILE =====
export const createAMABUserProfile = (baseUserData) => {
  return {
    // Basic Demographics
    ...baseUserData,
    sexAssignedAtBirth: 'AMAB',
    
    // Reproductive Anatomy
    reproductiveAnatomy: {
      testes: true,
      penis: true,
      prostate: true,
      seminalVesicles: true,
      epididymis: true,
      vasDeferens: true,
      // Trans-inclusive options
      hasTransitioned: false,
      surgicalHistory: [],
      hormoneTherapy: null,
      anatomyNotes: ''
    },
    
    // Life Stage Detection
    lifeStage: {
      current: AMABLifeStages.YOUNG_ADULT,
      transitions: [],
      ageAtPuberty: null,
      ageAtMaturity: null,
      notes: ''
    },
    
    // Hormonal Profile
    hormonalProfile: {
      testosteroneLevel: null,
      lastTestosteroneTest: null,
      freeTestosterone: null,
      totalTestosterone: null,
      estradiol: null,
      cortisol: null,
      thyroidTSH: null,
      thyroidT3: null,
      thyroidT4: null,
      lastHormonePanel: null,
      hormoneTherapy: false,
      hormoneTherapyType: null,
      hormoneTherapyStartDate: null
    },
    
    // Reproductive Health
    reproductiveHealth: {
      fertilityStatus: 'unknown',
      fertilityGoals: 'not_specified',
      sexualFunction: 'normal',
      erectileFunction: 'normal',
      ejaculatoryFunction: 'normal',
      libido: 'normal',
      lastFertilityTest: null,
      fertilityConcerns: [],
      sexualHealthConcerns: []
    },
    
    // Performance & Fitness
    performanceProfile: {
      fitnessLevel: 'moderate',
      exerciseFrequency: 'moderate',
      strengthLevel: 'moderate',
      enduranceLevel: 'moderate',
      flexibilityLevel: 'moderate',
      recoveryTime: 'normal',
      injuryHistory: [],
      performanceGoals: [],
      trainingPreferences: []
    },
    
    // Health Conditions
    healthConditions: {
      chronic: [],
      acute: [],
      genetic: [],
      lifestyle: [],
      mentalHealth: [],
      sexualHealth: [],
      urological: [],
      cardiovascular: [],
      metabolic: [],
      musculoskeletal: []
    },
    
    // Family History
    familyHistory: {
      paternal: {
        age: null,
        healthConditions: [],
        causeOfDeath: null,
        ageAtDeath: null
      },
      maternal: {
        age: null,
        healthConditions: [],
        causeOfDeath: null,
        ageAtDeath: null
      },
      siblings: [],
      grandparents: [],
      auntsUncles: [],
      cousins: [],
      geneticConditions: [],
      hereditaryRisks: []
    },
    
    // Lifestyle Factors
    lifestyle: {
      diet: {
        type: 'mixed',
        restrictions: [],
        supplements: [],
        hydration: 'moderate',
        mealTiming: 'regular'
      },
      exercise: {
        frequency: 'moderate',
        type: 'mixed',
        intensity: 'moderate',
        duration: 'moderate',
        consistency: 'good'
      },
      sleep: {
        duration: 7.5,
        quality: 'good',
        schedule: 'regular',
        disturbances: [],
        sleepHygiene: 'good'
      },
      stress: {
        level: 'moderate',
        sources: [],
        management: [],
        copingStrategies: []
      },
      substanceUse: {
        alcohol: 'moderate',
        smoking: 'never',
        drugs: 'never',
        caffeine: 'moderate'
      },
      work: {
        type: 'office',
        stress: 'moderate',
        hours: 'standard',
        physical: 'low'
      }
    },
    
    // Tracking Preferences
    trackingPreferences: {
      modules: Object.values(AMABTrackingModules),
      frequency: 'daily',
      reminders: true,
      privacy: 'private',
      dataSharing: false,
      notifications: true
    },
    
    // Medical History
    medicalHistory: {
      surgeries: [],
      hospitalizations: [],
      medications: [],
      allergies: [],
      immunizations: [],
      lastPhysical: null,
      lastBloodWork: null,
      lastUrologicalExam: null,
      lastCardiovascularExam: null
    }
  };
};

// ===== GENERAL HEALTH TRACKING MODELS =====
export const GeneralHealthEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Vital Signs
  vitals: {
    bloodPressure: {
      systolic: null,
      diastolic: null,
      measured: false
    },
    heartRate: {
      resting: null,
      measured: false
    },
    temperature: null,
    weight: null,
    height: null,
    bmi: null
  },
  
  // Energy & Mood
  energy: {
    level: 5, // 1-10 scale
    morning: 5,
    afternoon: 5,
    evening: 5,
    overall: 5
  },
  
  mood: {
    overall: 5, // 1-10 scale
    stress: 5,
    anxiety: 5,
    depression: 5,
    irritability: 5,
    motivation: 5
  },
  
  // Physical Health
  physical: {
    pain: {
      level: 0, // 0-10 scale
      location: [],
      type: 'none',
      duration: 'none'
    },
    mobility: 5, // 1-10 scale
    strength: 5,
    flexibility: 5,
    coordination: 5
  },
  
  // Sleep Quality
  sleep: {
    duration: 7.5,
    quality: 5, // 1-10 scale
    efficiency: 5,
    disturbances: [],
    dreams: 'normal',
    restfulness: 5
  },
  
  // Nutrition & Hydration
  nutrition: {
    meals: 3,
    water: 8, // glasses
    fruits: 2,
    vegetables: 3,
    protein: 'adequate',
    carbs: 'moderate',
    fats: 'moderate',
    processed: 'minimal',
    supplements: []
  },
  
  // Exercise & Activity
  exercise: {
    type: 'none',
    duration: 0,
    intensity: 0, // 1-10 scale
    perceivedExertion: 0,
    steps: 0,
    calories: 0,
    recovery: 5
  },
  
  // Lifestyle Factors
  lifestyle: {
    alcohol: 0, // drinks
    caffeine: 2, // cups
    screenTime: 8, // hours
    socialActivity: 5, // 1-10 scale
    workStress: 5,
    relaxation: 5
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    recommendations: [],
    riskFactors: [],
    patterns: '',
    predictions: ''
  }
};

// ===== HORMONAL HEALTH TRACKING MODELS =====
export const HormonalHealthEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Hormone Levels (if tested)
  hormoneLevels: {
    testosterone: {
      total: null,
      free: null,
      bioavailable: null,
      testDate: null,
      lab: null,
      referenceRange: null
    },
    estradiol: {
      level: null,
      testDate: null,
      lab: null
    },
    cortisol: {
      morning: null,
      evening: null,
      testDate: null,
      lab: null
    },
    thyroid: {
      tsh: null,
      t3: null,
      t4: null,
      testDate: null,
      lab: null
    },
    other: []
  },
  
  // Physical Indicators
  physicalIndicators: {
    energy: 5, // 1-10 scale
    mood: 5,
    libido: 5,
    muscleMass: 5,
    bodyFat: null,
    weight: null,
    hairLoss: 'none', // none, mild, moderate, severe
    hairGrowth: 'normal', // normal, increased, decreased
    skinChanges: 'none', // none, acne, dryness, oiliness
    voiceChanges: 'none', // none, deepening, hoarseness
    breastChanges: 'none' // none, tenderness, enlargement
  },
  
  // Sleep & Recovery
  sleepRecovery: {
    quality: 5, // 1-10 scale
    duration: 7.5,
    efficiency: 5,
    recoveryTime: 5,
    morningEnergy: 5,
    deepSleep: 5,
    remSleep: 5
  },
  
  // Cognitive & Emotional
  cognitive: {
    concentration: 5, // 1-10 scale
    memory: 5,
    motivation: 5,
    focus: 5,
    decisionMaking: 5,
    creativity: 5
  },
  
  emotional: {
    irritability: 5, // 1-10 scale (lower is better)
    anxiety: 5,
    depression: 5,
    moodSwings: 5,
    emotionalStability: 5,
    stressResponse: 5
  },
  
  // Physical Performance
  performance: {
    strength: 5, // 1-10 scale
    endurance: 5,
    flexibility: 5,
    coordination: 5,
    reactionTime: 5,
    power: 5
  },
  
  // Lifestyle Factors
  lifestyle: {
    exerciseFrequency: 'moderate',
    exerciseIntensity: 'moderate',
    nutrition: 'good',
    stress: 'moderate',
    sleep: 'good',
    alcohol: 'minimal',
    smoking: 'never'
  },
  
  // Symptoms
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    patterns: '',
    recommendations: [],
    riskAssessment: null,
    reminders: []
  }
};

// ===== REPRODUCTIVE HEALTH TRACKING MODELS =====
export const ReproductiveHealthEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Sexual Health
  sexualHealth: {
    libido: 5, // 1-10 scale
    erectileFunction: 5,
    ejaculatoryFunction: 5,
    sexualSatisfaction: 5,
    partnerSatisfaction: 5,
    frequency: 'moderate',
    concerns: []
  },
  
  // Fertility Indicators
  fertility: {
    spermHealth: 'unknown', // unknown, good, fair, poor
    lastSpermTest: null,
    fertilityGoals: 'not_specified',
    conceptionAttempts: 0,
    partnerFertility: 'unknown',
    fertilityConcerns: []
  },
  
  // Hormonal Factors
  hormonal: {
    testosterone: 5, // 1-10 scale
    energy: 5,
    mood: 5,
    muscleMass: 5,
    bodyFat: null,
    hairGrowth: 'normal',
    voice: 'normal'
  },
  
  // Lifestyle for Reproductive Health
  lifestyle: {
    nutrition: 'good',
    exercise: 'moderate',
    sleep: 'good',
    stress: 'moderate',
    alcohol: 'minimal',
    smoking: 'never',
    drugs: 'never',
    supplements: []
  },
  
  // Physical Health
  physical: {
    weight: null,
    bmi: null,
    bloodPressure: null,
    heartRate: null,
    temperature: null,
    generalHealth: 5
  },
  
  // Mental Health
  mental: {
    stress: 5, // 1-10 scale
    anxiety: 5,
    depression: 5,
    confidence: 5,
    selfEsteem: 5,
    relationshipSatisfaction: 5
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    analysis: '',
    testosteroneOptimization: '',
    fertilityEnhancement: '',
    sexualHealth: '',
    lifestyleRecommendations: '',
    nutritionAdvice: '',
    exerciseTips: '',
    stressManagement: '',
    sleepOptimization: '',
    supplementSuggestions: '',
    personalizedPlan: ''
  }
};

// ===== PERFORMANCE TRACKING MODELS =====
export const PerformanceEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Physical Performance
  physicalPerformance: {
    strength: 5, // 1-10 scale
    endurance: 5,
    flexibility: 5,
    coordination: 5,
    reactionTime: 5,
    power: 5,
    speed: 5,
    agility: 5
  },
  
  // Recovery Indicators
  recovery: {
    sleepQuality: 5, // 1-10 scale
    muscleSoreness: 5,
    fatigue: 5,
    stress: 5,
    hydration: 5,
    energy: 5,
    motivation: 5
  },
  
  // Training Data
  training: {
    workoutType: '',
    duration: 0, // minutes
    intensity: 5, // 1-10 scale
    heartRateMax: null,
    heartRateAvg: null,
    caloriesBurned: null,
    perceivedExertion: 5,
    exercises: [],
    sets: 0,
    reps: 0,
    weight: 0
  },
  
  // Recovery Methods
  recoveryMethods: {
    stretching: false,
    massage: false,
    iceBath: false,
    sauna: false,
    meditation: false,
    nutrition: false,
    sleep: false,
    activeRecovery: false
  },
  
  // Performance Factors
  performanceFactors: {
    nutrition: 5, // 1-10 scale
    hydration: 5,
    motivation: 5,
    focus: 5,
    energy: 5,
    stress: 5,
    sleep: 5,
    recovery: 5
  },
  
  // Lifestyle Factors
  lifestyle: {
    alcohol: 0, // drinks
    caffeine: 2, // cups
    screenTime: 8, // hours
    socialActivity: 5, // 1-10 scale
    workStress: 5,
    relaxation: 5
  },
  
  // Goals & Progress
  goals: {
    current: [],
    progress: 5, // 1-10 scale
    achievements: [],
    challenges: []
  },
  
  // Symptoms & Notes
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    patterns: '',
    recommendations: [],
    recoveryOptimization: '',
    predictions: ''
  }
};

// ===== NUTRITION TRACKING MODELS =====
export const NutritionEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Meal Tracking
  meals: {
    breakfast: {
      time: null,
      foods: [],
      calories: null,
      macros: { protein: 0, carbs: 0, fats: 0 },
      quality: 5 // 1-10 scale
    },
    lunch: {
      time: null,
      foods: [],
      calories: null,
      macros: { protein: 0, carbs: 0, fats: 0 },
      quality: 5
    },
    dinner: {
      time: null,
      foods: [],
      calories: null,
      macros: { protein: 0, carbs: 0, fats: 0 },
      quality: 5
    },
    snacks: []
  },
  
  // Macronutrients
  macros: {
    protein: 0, // grams
    carbohydrates: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    calories: 0,
    targetCalories: 2000
  },
  
  // Micronutrients
  micronutrients: {
    vitamins: {},
    minerals: {},
    antioxidants: 0,
    omega3: 0,
    zinc: 0,
    magnesium: 0,
    vitaminD: 0
  },
  
  // Hydration
  hydration: {
    water: 0, // glasses
    otherFluids: 0,
    totalFluids: 0,
    targetFluids: 8,
    quality: 5 // 1-10 scale
  },
  
  // Food Quality
  foodQuality: {
    processed: 0, // servings
    wholeFoods: 0,
    organic: 0,
    local: 0,
    seasonal: 0,
    diversity: 5 // 1-10 scale
  },
  
  // Reproductive Health Focus
  reproductiveHealth: {
    fertilityFoods: [],
    testosteroneBoosting: [],
    antiInflammatory: [],
    antioxidant: [],
    hormoneBalancing: []
  },
  
  // Supplements
  supplements: [],
  
  // Symptoms & Energy
  symptoms: [],
  energy: 5, // 1-10 scale
  digestion: 5,
  mood: 5,
  cravings: [],
  
  // Notes
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    analysis: '',
    recommendations: [],
    mealPlans: '',
    supplementAdvice: '',
    reproductiveHealthTips: '',
    personalizedPlan: ''
  }
};

// ===== MENTAL HEALTH TRACKING MODELS =====
export const MentalHealthEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Mood Assessment
  mood: {
    overall: 5, // 1-10 scale
    happiness: 5,
    sadness: 5,
    anger: 5,
    anxiety: 5,
    fear: 5,
    joy: 5,
    contentment: 5
  },
  
  // Stress Levels
  stress: {
    level: 5, // 1-10 scale
    sources: [],
    work: 5,
    relationships: 5,
    health: 5,
    finances: 5,
    future: 5,
    coping: 5
  },
  
  // Anxiety & Depression
  mentalHealth: {
    anxiety: 5, // 1-10 scale
    depression: 5,
    panic: 5,
    worry: 5,
    rumination: 5,
    hopelessness: 5,
    worthlessness: 5,
    guilt: 5
  },
  
  // Cognitive Function
  cognitive: {
    concentration: 5, // 1-10 scale
    memory: 5,
    decisionMaking: 5,
    problemSolving: 5,
    creativity: 5,
    focus: 5,
    clarity: 5
  },
  
  // Social & Relationships
  social: {
    relationships: 5, // 1-10 scale
    socialActivity: 5,
    loneliness: 5,
    support: 5,
    communication: 5,
    intimacy: 5,
    connection: 5
  },
  
  // Sleep & Energy
  sleep: {
    quality: 5, // 1-10 scale
    duration: 7.5,
    efficiency: 5,
    disturbances: [],
    restfulness: 5,
    morningMood: 5
  },
  
  energy: {
    level: 5, // 1-10 scale
    morning: 5,
    afternoon: 5,
    evening: 5,
    motivation: 5,
    enthusiasm: 5
  },
  
  // Coping Strategies
  coping: {
    strategies: [],
    effectiveness: 5, // 1-10 scale
    meditation: false,
    exercise: false,
    social: false,
    hobbies: false,
    professional: false
  },
  
  // Lifestyle Factors
  lifestyle: {
    exercise: 5, // 1-10 scale
    nutrition: 5,
    alcohol: 0, // drinks
    caffeine: 2, // cups
    screenTime: 8, // hours
    workLifeBalance: 5
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    patterns: '',
    recommendations: [],
    riskAssessment: null,
    copingStrategies: [],
    resources: []
  }
};

// ===== UROLOGY & PROSTATE TRACKING MODELS =====
export const UrologyEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Urinary Function
  urinary: {
    frequency: 'normal', // normal, increased, decreased
    urgency: 'normal',
    flow: 'normal',
    control: 'normal',
    nocturia: 0, // times per night
    hesitancy: false,
    incomplete: false,
    pain: false,
    blood: false
  },
  
  // Prostate Health
  prostate: {
    size: 'normal', // normal, enlarged, unknown
    lastExam: null,
    psa: null,
    lastPsaTest: null,
    symptoms: [],
    concerns: []
  },
  
  // Sexual Function
  sexual: {
    erectileFunction: 5, // 1-10 scale
    ejaculatoryFunction: 5,
    libido: 5,
    satisfaction: 5,
    pain: false,
    concerns: []
  },
  
  // Physical Symptoms
  physical: {
    pain: {
      level: 0, // 0-10 scale
      location: [],
      type: 'none',
      duration: 'none'
    },
    swelling: false,
    lumps: false,
    discharge: false,
    itching: false,
    burning: false
  },
  
  // Lifestyle Factors
  lifestyle: {
    exercise: 'moderate',
    nutrition: 'good',
    hydration: 'adequate',
    alcohol: 'minimal',
    smoking: 'never',
    stress: 'moderate'
  },
  
  // Medical History
  medical: {
    infections: [],
    surgeries: [],
    medications: [],
    allergies: [],
    familyHistory: []
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    recommendations: [],
    riskAssessment: null,
    whenToSeeDoctor: '',
    prevention: []
  }
};

// ===== FERTILITY TRACKING MODELS =====
export const FertilityEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Fertility Goals
  goals: {
    status: 'not_specified', // not_specified, trying_to_conceive, not_trying, achieved
    timeline: null,
    partner: null,
    method: 'natural', // natural, assisted, unknown
    attempts: 0,
    duration: 0 // months
  },
  
  // Sperm Health
  sperm: {
    count: null,
    motility: null,
    morphology: null,
    volume: null,
    lastTest: null,
    lab: null,
    quality: 'unknown' // unknown, excellent, good, fair, poor
  },
  
  // Hormonal Factors
  hormonal: {
    testosterone: 5, // 1-10 scale
    fsh: null,
    lh: null,
    prolactin: null,
    estradiol: null,
    lastTest: null
  },
  
  // Lifestyle for Fertility
  lifestyle: {
    nutrition: 'good',
    exercise: 'moderate',
    sleep: 'good',
    stress: 'moderate',
    alcohol: 'minimal',
    smoking: 'never',
    drugs: 'never',
    heatExposure: 'minimal',
    supplements: []
  },
  
  // Physical Health
  physical: {
    weight: null,
    bmi: null,
    temperature: null,
    generalHealth: 5,
    infections: [],
    medications: []
  },
  
  // Partner Information
  partner: {
    age: null,
    health: 'good',
    fertility: 'unknown',
    trying: false,
    support: 5
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    analysis: '',
    recommendations: [],
    lifestyleTips: '',
    supplementAdvice: '',
    whenToTest: '',
    partnerAdvice: ''
  }
};

// ===== PREVENTIVE CARE TRACKING MODELS =====
export const PreventiveCareEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Screenings
  screenings: {
    physical: {
      last: null,
      next: null,
      provider: null,
      results: 'normal'
    },
    bloodWork: {
      last: null,
      next: null,
      results: 'normal',
      tests: []
    },
    cardiovascular: {
      last: null,
      next: null,
      results: 'normal'
    },
    cancer: {
      last: null,
      next: null,
      results: 'normal',
      types: []
    },
    urological: {
      last: null,
      next: null,
      results: 'normal'
    }
  },
  
  // Immunizations
  immunizations: {
    flu: {
      last: null,
      next: null,
      status: 'current'
    },
    covid: {
      last: null,
      next: null,
      status: 'current'
    },
    other: []
  },
  
  // Health Metrics
  metrics: {
    bloodPressure: null,
    heartRate: null,
    temperature: null,
    weight: null,
    bmi: null,
    waistCircumference: null,
    bodyFat: null
  },
  
  // Risk Factors
  riskFactors: {
    family: [],
    lifestyle: [],
    medical: [],
    environmental: [],
    genetic: []
  },
  
  // Lifestyle Assessment
  lifestyle: {
    diet: 'good',
    exercise: 'moderate',
    sleep: 'good',
    stress: 'moderate',
    alcohol: 'minimal',
    smoking: 'never',
    drugs: 'never'
  },
  
  // Symptoms & Concerns
  symptoms: [],
  concerns: '',
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    recommendations: [],
    riskAssessment: null,
    nextSteps: [],
    reminders: []
  }
};

// ===== MEDICATION & SUPPLEMENT TRACKING MODELS =====
export const MedicationEntry = {
  id: '',
  userId: '',
  timestamp: '',
  date: '',
  
  // Medications
  medications: {
    prescription: [],
    overTheCounter: [],
    herbal: [],
    discontinued: []
  },
  
  // Supplements
  supplements: {
    vitamins: [],
    minerals: [],
    herbs: [],
    probiotics: [],
    other: []
  },
  
  // Adherence
  adherence: {
    medications: 5, // 1-10 scale
    supplements: 5,
    missed: 0,
    reasons: [],
    strategies: []
  },
  
  // Side Effects
  sideEffects: {
    medications: [],
    supplements: [],
    severity: 'none', // none, mild, moderate, severe
    management: []
  },
  
  // Interactions
  interactions: {
    drugDrug: [],
    drugSupplement: [],
    drugFood: [],
    supplementSupplement: []
  },
  
  // Effectiveness
  effectiveness: {
    medications: 5, // 1-10 scale
    supplements: 5,
    improvements: [],
    concerns: []
  },
  
  // Provider Information
  providers: {
    prescribing: null,
    monitoring: null,
    lastReview: null,
    nextReview: null
  },
  
  // Notes
  notes: '',
  
  // AI Analysis
  aiInsights: {
    generated: false,
    insights: '',
    recommendations: [],
    interactions: [],
    optimization: '',
    safety: []
  }
};

// ===== UTILITY FUNCTIONS =====
export const AMABDataUtils = {
  // Calculate age from date of birth
  calculateAge: (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },
  
  // Determine life stage based on age
  determineLifeStage: (age) => {
    if (age < 18) return AMABLifeStages.PUBERTY;
    if (age < 30) return AMABLifeStages.YOUNG_ADULT;
    if (age < 50) return AMABLifeStages.REPRODUCTIVE;
    if (age < 65) return AMABLifeStages.MATURE_ADULT;
    return AMABLifeStages.SENIOR;
  },
  
  // Calculate BMI
  calculateBMI: (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  },
  
  // Generate health score
  generateHealthScore: (entry) => {
    let score = 0;
    let factors = 0;
    
    // Energy and mood factors
    if (entry.energy?.overall) {
      score += entry.energy.overall;
      factors++;
    }
    if (entry.mood?.overall) {
      score += entry.mood.overall;
      factors++;
    }
    
    // Physical factors
    if (entry.physical?.mobility) {
      score += entry.physical.mobility;
      factors++;
    }
    if (entry.sleep?.quality) {
      score += entry.sleep.quality;
      factors++;
    }
    
    // Lifestyle factors
    if (entry.exercise?.intensity) {
      score += entry.exercise.intensity;
      factors++;
    }
    if (entry.nutrition?.quality) {
      score += entry.nutrition.quality;
      factors++;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  },
  
  // Validate entry data
  validateEntry: (entry, type) => {
    const errors = [];
    
    if (!entry.date) errors.push('Date is required');
    if (!entry.timestamp) errors.push('Timestamp is required');
    
    // Type-specific validation
    switch (type) {
      case 'general':
        if (!entry.energy?.overall) errors.push('Energy level is required');
        break;
      case 'hormonal':
        if (!entry.physicalIndicators?.energy) errors.push('Physical energy is required');
        break;
      case 'reproductive':
        if (!entry.sexualHealth?.libido) errors.push('Libido level is required');
        break;
      case 'performance':
        if (!entry.physicalPerformance?.strength) errors.push('Strength level is required');
        break;
      case 'nutrition':
        if (!entry.macros?.calories) errors.push('Calorie intake is required');
        break;
      case 'mental':
        if (!entry.mood?.overall) errors.push('Mood level is required');
        break;
      case 'urology':
        if (!entry.urinary?.frequency) errors.push('Urinary frequency is required');
        break;
      case 'fertility':
        if (!entry.goals?.status) errors.push('Fertility goals are required');
        break;
      case 'preventive':
        if (!entry.screenings?.physical?.last) errors.push('Last physical exam is required');
        break;
      case 'medications':
        if (!entry.medications?.prescription) errors.push('Medication list is required');
        break;
    }
    
    return errors;
  }
};

// ===== EXPORT ALL MODELS =====
export default {
  AMABLifeStages,
  AMABTrackingModules,
  createAMABUserProfile,
  GeneralHealthEntry,
  HormonalHealthEntry,
  ReproductiveHealthEntry,
  PerformanceEntry,
  NutritionEntry,
  MentalHealthEntry,
  UrologyEntry,
  FertilityEntry,
  PreventiveCareEntry,
  MedicationEntry,
  AMABDataUtils
};

