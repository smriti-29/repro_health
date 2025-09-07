// COMPREHENSIVE AFAB DATA MODELS
// Complete data structures for all AFAB lifecycle stages and tracking needs

export const AFABLifeStages = {
  PUBERTY: 'puberty',           // Ages 8-16
  REPRODUCTIVE: 'reproductive', // Ages 16-45
  PREGNANCY: 'pregnancy',       // During pregnancy
  POSTPARTUM: 'postpartum',     // 0-24 months after birth
  PERIMENOPAUSE: 'perimenopause', // Ages 40-55
  MENOPAUSE: 'menopause',       // Ages 45-60
  POSTMENOPAUSE: 'postmenopause' // Ages 60+
};

export const AFABTrackingModules = {
  CYCLE: 'cycle',
  FERTILITY: 'fertility',
  CONTRACEPTION: 'contraception',
  SEXUAL_HEALTH: 'sexual_health',
  PREGNANCY: 'pregnancy',
  POSTPARTUM: 'postpartum',
  MENOPAUSE: 'menopause',
  MEDICAL_CONDITIONS: 'medical_conditions',
  SCREENINGS: 'screenings',
  MENTAL_HEALTH: 'mental_health'
};

// ===== CORE AFAB USER PROFILE =====
export const createAFABUserProfile = (baseUserData) => {
  return {
    // Basic Demographics
    ...baseUserData,
    sexAssignedAtBirth: 'AFAB',
    
    // Reproductive Anatomy
    reproductiveAnatomy: {
      uterus: true,
      ovaries: true,
      fallopianTubes: true,
      cervix: true,
      vagina: true,
      breasts: true,
      // Trans-inclusive options
      hasTransitioned: false,
      surgicalHistory: [],
      hormoneTherapy: null,
      anatomyNotes: ''
    },
    
    // Life Stage Detection
    lifeStage: {
      current: null, // Will be auto-detected
      menarcheAge: null,
      menopauseAge: null,
      pregnancyHistory: [],
      breastfeedingHistory: [],
      lastUpdated: new Date()
    },
    
    // Cycle Data
    menstrualCycle: {
      isRegular: null,
      averageLength: null,
      averageFlow: null,
      lastPeriod: null,
      nextPredictedPeriod: null,
      ovulationPrediction: null,
      cycleHistory: [],
      symptoms: {
        cramps: [],
        mood: [],
        energy: [],
        sleep: [],
        appetite: [],
        bloating: [],
        headaches: [],
        breastTenderness: [],
        acne: []
      },
      flowPatterns: [],
      cycleNotes: ''
    },
    
    // Fertility Data
    fertility: {
      isTryingToConceive: false,
      contraceptionMethod: null,
      ovulationTracking: {
        bbt: [],
        cervicalMucus: [],
        lhStrips: [],
        ovulationPain: [],
        libido: []
      },
      fertilityWindow: {
        predictedOvulation: null,
        fertileDays: [],
        conceptionProbability: null
      },
      pregnancyHistory: [],
      fertilityConcerns: [],
      fertilityGoals: []
    },
    
    // Pregnancy Data (if applicable)
    pregnancy: {
      isPregnant: false,
      dueDate: null,
      trimester: null,
      pregnancyType: 'singleton',
      complications: [],
      prenatalCare: {
        appointments: [],
        ultrasounds: [],
        bloodTests: [],
        weightGain: [],
        bloodPressure: [],
        bloodSugar: []
      },
      symptoms: {
        nausea: [],
        fatigue: [],
        mood: [],
        sleep: [],
        appetite: [],
        fetalMovement: [],
        contractions: []
      },
      deliveryPlan: null,
      birthPlan: null
    },
    
    // Postpartum Data
    postpartum: {
      isPostpartum: false,
      deliveryDate: null,
      deliveryType: null,
      recovery: {
        bleeding: [],
        pain: [],
        energy: [],
        mood: [],
        sleep: []
      },
      breastfeeding: {
        isBreastfeeding: false,
        latchIssues: [],
        supplyConcerns: [],
        pumpingSchedule: [],
        feedingSchedule: []
      },
      newborn: {
        weight: [],
        feeding: [],
        sleep: [],
        milestones: []
      }
    },
    
    // Menopause Data
    menopause: {
      isInMenopause: false,
      menopauseType: null, // natural, surgical, medical
      symptoms: {
        hotFlashes: [],
        nightSweats: [],
        moodChanges: [],
        sleepDisruption: [],
        vaginalDryness: [],
        weightChanges: [],
        memoryIssues: []
      },
      hormoneTherapy: {
        isOnHRT: false,
        type: null,
        dosage: null,
        sideEffects: [],
        effectiveness: []
      },
      boneHealth: {
        boneDensity: null,
        fractureRisk: null,
        calciumIntake: [],
        vitaminD: []
      }
    },
    
    // Medical Conditions (AFAB-specific)
    conditions: {
      reproductive: [], // PCOS, Endometriosis, Fibroids, etc.
      pregnancy: [], // Gestational Diabetes, Preeclampsia, etc.
      general: [],
      familyHistory: {
        womensConditions: [],
        cancerTypes: [],
        geneticConditions: []
      }
    },
    
    // Medications & Treatments
    medications: {
      birthControl: {
        method: null,
        startDate: null,
        sideEffects: [],
        effectiveness: null
      },
      hormoneTherapy: {
        type: null,
        dosage: null,
        sideEffects: [],
        effectiveness: null
      },
      fertilityDrugs: [],
      painManagement: [],
      supplements: []
    },
    
    // Lifestyle Factors
    lifestyle: {
      diet: {
        type: null,
        restrictions: [],
        supplements: [],
        hydration: []
      },
      exercise: {
        frequency: null,
        type: [],
        intensity: null,
        impactOnCycle: []
      },
      stress: {
        level: null,
        sources: [],
        management: [],
        impactOnHealth: []
      },
      sleep: {
        duration: null,
        quality: [],
        disruptions: [],
        impactOnCycle: []
      },
      weight: {
        current: null,
        history: [],
        bmi: null,
        goals: null
      }
    },
    
    // Mental Health
    mentalHealth: {
      mood: [],
      anxiety: [],
      depression: [],
      bodyImage: [],
      sexualSatisfaction: [],
      relationshipHealth: [],
      selfCare: []
    },
    
    // Screening & Prevention
    screenings: {
      papSmear: {
        lastDate: null,
        nextDue: null,
        results: null,
        history: []
      },
      mammogram: {
        lastDate: null,
        nextDue: null,
        results: null,
        history: []
      },
      boneDensity: {
        lastDate: null,
        nextDue: null,
        results: null,
        history: []
      },
      bloodTests: {
        lastDate: null,
        nextDue: null,
        results: {},
        history: []
      },
      vaccinations: {
        hpv: null,
        rubella: null,
        hepatitisB: null,
        history: []
      }
    },
    
    // Goals & Preferences
    goals: {
      cycleRegularity: false,
      fertilityOptimization: false,
      symptomManagement: false,
      pregnancyPreparation: false,
      menopauseSupport: false,
      weightManagement: false,
      mentalHealth: false
    },
    
    // Privacy & Data Sharing
    privacy: {
      dataSharing: false,
      researchParticipation: false,
      partnerAccess: false,
      healthcareProviderAccess: false
    }
  };
};

// ===== LIFECYCLE DETECTION ALGORITHM =====
export const detectAFABLifeStage = (userProfile) => {
  const age = userProfile.age;
  const pregnancy = userProfile.pregnancy;
  const menopause = userProfile.menopause;
  
  // Pregnancy takes priority
  if (pregnancy?.isPregnant) {
    return AFABLifeStages.PREGNANCY;
  }
  
  // Postpartum (within 24 months of delivery)
  if (pregnancy?.deliveryDate) {
    const monthsSinceDelivery = (new Date() - new Date(pregnancy.deliveryDate)) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceDelivery <= 24) {
      return AFABLifeStages.POSTPARTUM;
    }
  }
  
  // Menopause detection
  if (menopause?.isInMenopause) {
    return AFABLifeStages.MENOPAUSE;
  }
  
  // Perimenopause (ages 40-55, irregular cycles, menopause symptoms)
  if (age >= 40 && age <= 55) {
    const hasMenopauseSymptoms = menopause?.symptoms && 
      Object.values(menopause.symptoms).some(symptomArray => 
        symptomArray && symptomArray.length > 0
      );
    const hasIrregularCycles = userProfile.menstrualCycle?.isRegular === false;
    
    if (hasMenopauseSymptoms || hasIrregularCycles) {
      return AFABLifeStages.PERIMENOPAUSE;
    }
  }
  
  // Post-menopause (age 60+ or confirmed menopause)
  if (age >= 60 || (menopause?.menopauseAge && age > menopause.menopauseAge)) {
    return AFABLifeStages.POSTMENOPAUSE;
  }
  
  // Puberty (ages 8-16, no menarche or recent menarche)
  if (age >= 8 && age <= 16) {
    const menarcheAge = userProfile.lifeStage?.menarcheAge;
    if (!menarcheAge || (menarcheAge && age - menarcheAge <= 2)) {
      return AFABLifeStages.PUBERTY;
    }
  }
  
  // Reproductive years (default for ages 16-45)
  if (age >= 16 && age <= 45) {
    return AFABLifeStages.REPRODUCTIVE;
  }
  
  // Default fallback
  return AFABLifeStages.REPRODUCTIVE;
};

// ===== TRACKING MODULE DETECTION =====
export const getRecommendedTrackingModules = (lifeStage, userProfile) => {
  const modules = [];
  
  switch (lifeStage) {
    case AFABLifeStages.PUBERTY:
      modules.push(
        AFABTrackingModules.CYCLE,
        AFABTrackingModules.MENTAL_HEALTH,
        AFABTrackingModules.MEDICAL_CONDITIONS
      );
      break;
      
    case AFABLifeStages.REPRODUCTIVE:
      modules.push(
        AFABTrackingModules.CYCLE,
        AFABTrackingModules.FERTILITY,
        AFABTrackingModules.CONTRACEPTION,
        AFABTrackingModules.SEXUAL_HEALTH,
        AFABTrackingModules.MEDICAL_CONDITIONS,
        AFABTrackingModules.SCREENINGS,
        AFABTrackingModules.MENTAL_HEALTH
      );
      break;
      
    case AFABLifeStages.PREGNANCY:
      modules.push(
        AFABTrackingModules.PREGNANCY,
        AFABTrackingModules.MEDICAL_CONDITIONS,
        AFABTrackingModules.MENTAL_HEALTH
      );
      break;
      
    case AFABLifeStages.POSTPARTUM:
      modules.push(
        AFABTrackingModules.POSTPARTUM,
        AFABTrackingModules.MENTAL_HEALTH,
        AFABTrackingModules.MEDICAL_CONDITIONS
      );
      break;
      
    case AFABLifeStages.PERIMENOPAUSE:
      modules.push(
        AFABTrackingModules.MENOPAUSE,
        AFABTrackingModules.CYCLE,
        AFABTrackingModules.MEDICAL_CONDITIONS,
        AFABTrackingModules.SCREENINGS,
        AFABTrackingModules.MENTAL_HEALTH
      );
      break;
      
    case AFABLifeStages.MENOPAUSE:
    case AFABLifeStages.POSTMENOPAUSE:
      modules.push(
        AFABTrackingModules.MENOPAUSE,
        AFABTrackingModules.MEDICAL_CONDITIONS,
        AFABTrackingModules.SCREENINGS,
        AFABTrackingModules.MENTAL_HEALTH
      );
      break;
    default:
      modules.push(AFABTrackingModules.CYCLE);
      break;
  }
  
  return modules;
};

// ===== WELCOME MESSAGES BY LIFE STAGE =====
export const getAFABWelcomeMessage = (lifeStage, userProfile) => {
  const firstName = userProfile.fullName?.split(' ')[0] || 'there';
  
  switch (lifeStage) {
    case AFABLifeStages.PUBERTY:
      return {
        title: `Welcome to your reproductive health journey, ${firstName}!`,
        subtitle: "Let's track your cycle and support you through puberty.",
        description: "We'll help you understand your changing body and track your menstrual cycle as it develops."
      };
      
    case AFABLifeStages.REPRODUCTIVE:
      return {
        title: `What would you like to track today, ${firstName}?`,
        subtitle: "Cycle, fertility, contraception, or sexual health?",
        description: "Choose what matters most to you right now, and we'll provide personalized insights."
      };
      
    case AFABLifeStages.PREGNANCY:
      return {
        title: `Pregnancy Mode: Welcome, ${firstName}!`,
        subtitle: "Track your journey and your baby's development.",
        description: "We'll help you monitor your health and your baby's growth throughout your pregnancy."
      };
      
    case AFABLifeStages.POSTPARTUM:
      return {
        title: `Postpartum Support: You've got this, ${firstName}!`,
        subtitle: "Recovery, breastfeeding, and newborn care.",
        description: "We'll support you through recovery and help you track your baby's development."
      };
      
    case AFABLifeStages.PERIMENOPAUSE:
      return {
        title: `Menopause Transition: We're here for you, ${firstName}`,
        subtitle: "Managing symptoms and maintaining health.",
        description: "We'll help you navigate this transition with personalized support and insights."
      };
      
    case AFABLifeStages.MENOPAUSE:
    case AFABLifeStages.POSTMENOPAUSE:
      return {
        title: `Post-Menopause: Long-term health focus, ${firstName}`,
        subtitle: "Maintaining wellness and preventing health issues.",
        description: "We'll help you stay healthy and active in this new phase of life."
      };
      
    default:
      return {
        title: `Welcome to your reproductive health journey, ${firstName}!`,
        subtitle: "Let's get started with personalized tracking.",
        description: "We'll help you understand and optimize your reproductive health."
      };
  }
};

// ===== TRACKING OPTIONS BY LIFE STAGE =====
export const getTrackingOptions = (lifeStage, userProfile) => {
  const options = [];
  
  switch (lifeStage) {
    case AFABLifeStages.PUBERTY:
      options.push(
        { id: 'cycle', label: 'Cycle Tracking', icon: '📅', description: 'Track your period and cycle patterns' },
        { id: 'symptoms', label: 'Symptoms', icon: '🤒', description: 'Log cramps, mood, and body changes' },
        { id: 'growth', label: 'Growth & Development', icon: '📏', description: 'Track height, weight, and puberty milestones' },
        { id: 'education', label: 'Health Education', icon: '📚', description: 'Learn about your changing body' }
      );
      break;
      
    case AFABLifeStages.REPRODUCTIVE:
      options.push(
        { id: 'cycle', label: 'Cycle Tracking', icon: '📅', description: 'Track periods, ovulation, and symptoms' },
        { id: 'fertility', label: 'Fertility', icon: '👶', description: 'TTC support and ovulation prediction' },
        { id: 'contraception', label: 'Contraception', icon: '💊', description: 'Birth control tracking and management' },
        { id: 'sexual_health', label: 'Sexual Health', icon: '❤️', description: 'STI testing, sexual function, relationships' },
        { id: 'medical', label: 'Medical Conditions', icon: '🏥', description: 'PCOS, Endometriosis, and other conditions' },
        { id: 'screenings', label: 'Health Screenings', icon: '🔍', description: 'Pap smears, mammograms, blood tests' }
      );
      break;
      
    case AFABLifeStages.PREGNANCY:
      options.push(
        { id: 'pregnancy', label: 'Pregnancy Tracking', icon: '🤰', description: 'Week-by-week progress and milestones' },
        { id: 'health', label: 'Health Monitoring', icon: '📊', description: 'Weight, blood pressure, blood sugar' },
        { id: 'appointments', label: 'Appointments', icon: '🏥', description: 'OB visits, ultrasounds, tests' },
        { id: 'symptoms', label: 'Pregnancy Symptoms', icon: '🤒', description: 'Nausea, fatigue, movement, contractions' },
        { id: 'preparation', label: 'Birth Preparation', icon: '📚', description: 'Birth plan, classes, preparation' }
      );
      break;
      
    case AFABLifeStages.POSTPARTUM:
      options.push(
        { id: 'recovery', label: 'Recovery Tracking', icon: '🩹', description: 'Physical recovery and healing' },
        { id: 'breastfeeding', label: 'Breastfeeding', icon: '🍼', description: 'Feeding schedule, supply, latch' },
        { id: 'newborn', label: 'Newborn Care', icon: '👶', description: 'Baby development and milestones' },
        { id: 'mental_health', label: 'Mental Health', icon: '🧠', description: 'Postpartum depression, mood, support' },
        { id: 'sleep', label: 'Sleep Tracking', icon: '😴', description: 'Sleep patterns and quality' }
      );
      break;
      
    case AFABLifeStages.PERIMENOPAUSE:
    case AFABLifeStages.MENOPAUSE:
    case AFABLifeStages.POSTMENOPAUSE:
      options.push(
        { id: 'menopause', label: 'Menopause Symptoms', icon: '🔥', description: 'Hot flashes, mood, sleep, energy' },
        { id: 'hormone_therapy', label: 'Hormone Therapy', icon: '💊', description: 'HRT tracking and management' },
        { id: 'bone_health', label: 'Bone Health', icon: '🦴', description: 'Osteoporosis prevention and monitoring' },
        { id: 'heart_health', label: 'Heart Health', icon: '❤️', description: 'Cardiovascular health and prevention' },
        { id: 'screenings', label: 'Health Screenings', icon: '🔍', description: 'Mammograms, bone density, blood tests' }
      );
      break;
    default:
      options.push(
        { id: 'general', label: 'General Health', icon: '🏥', description: 'Track your overall health and wellness' }
      );
      break;
  }
  
  return options;
};

const AFABDataModels = {
  AFABLifeStages,
  AFABTrackingModules,
  createAFABUserProfile,
  detectAFABLifeStage,
  getRecommendedTrackingModules,
  getAFABWelcomeMessage,
  getTrackingOptions
};

export default AFABDataModels;
