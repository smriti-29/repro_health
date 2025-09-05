// ENHANCED PERSONAL CONTEXT ENGINE
// Processes onboarding data and generates comprehensive health context

export class PersonalContextEngine {
  constructor() {
    this.healthContexts = new Map();
    this.conditionPatterns = new Map();
    this.lifestyleCorrelations = new Map();
  }

  // ===== MAIN CONTEXT GENERATION =====

  generatePersonalContext(onboardingData) {
    if (!onboardingData) {
      return this.getDefaultContext();
    }

    const context = {
      basicProfile: this.generateBasicProfile(onboardingData),
      reproductiveContext: this.generateReproductiveContext(onboardingData),
      medicalContext: this.generateMedicalContext(onboardingData),
      lifestyleContext: this.generateLifestyleContext(onboardingData),
      riskContext: this.generateRiskContext(onboardingData),
      screeningContext: this.generateScreeningContext(onboardingData),
      medicationContext: this.generateMedicationContext(onboardingData),
      pregnancyContext: this.generatePregnancyContext(onboardingData),
      transHealthContext: this.generateTransHealthContext(onboardingData),
      emergencyContext: this.generateEmergencyContext(onboardingData)
    };

    // Cache the context for future use
    this.healthContexts.set(onboardingData.userId || 'default', context);
    
    return context;
  }

  // ===== BASIC PROFILE GENERATION =====

  generateBasicProfile(onboardingData) {
    const age = this.calculateAge(onboardingData.dateOfBirth);
    const bmi = this.calculateBMI(onboardingData.height, onboardingData.weight);
    
    return {
      age: age,
      ageGroup: this.getAgeGroup(age),
      bmi: bmi,
      bmiCategory: this.getBMICategory(bmi),
      height: onboardingData.height,
      weight: onboardingData.weight,
      dateOfBirth: onboardingData.dateOfBirth,
      genderIdentity: onboardingData.genderIdentity,
      pronouns: onboardingData.pronouns,
      reproductiveAnatomy: onboardingData.reproductiveAnatomy || [],
      healthGoals: onboardingData.healthGoals || []
    };
  }

  // ===== REPRODUCTIVE CONTEXT GENERATION =====

  generateReproductiveContext(onboardingData) {
    const anatomy = onboardingData.reproductiveAnatomy || [];
    const isAFAB = anatomy.includes('uterus') || anatomy.includes('ovaries');
    const isAMAB = anatomy.includes('testes') || anatomy.includes('prostate');
    
    return {
      anatomy: anatomy,
      isAFAB: isAFAB,
      isAMAB: isAMAB,
      isTrans: onboardingData.genderIdentity !== onboardingData.sexAssignedAtBirth,
      isNonBinary: onboardingData.genderIdentity === 'non-binary',
      reproductiveCapabilities: this.assessReproductiveCapabilities(onboardingData),
      fertilityStatus: this.assessFertilityStatus(onboardingData),
      cycleContext: this.generateCycleContext(onboardingData),
      sexualHealth: this.generateSexualHealthContext(onboardingData)
    };
  }

  // ===== MEDICAL CONTEXT GENERATION =====

  generateMedicalContext(onboardingData) {
    return {
      conditions: onboardingData.chronicConditions || [],
      allergies: onboardingData.allergies || [],
      surgeries: onboardingData.surgeries || [],
      familyHistory: onboardingData.familyHistory || {},
      currentSymptoms: onboardingData.currentSymptoms || [],
      painLevels: onboardingData.painLevels || {},
      conditionSeverity: this.assessConditionSeverity(onboardingData),
      conditionInteractions: this.assessConditionInteractions(onboardingData),
      geneticRiskFactors: this.assessGeneticRiskFactors(onboardingData)
    };
  }

  // ===== LIFESTYLE CONTEXT GENERATION =====

  generateLifestyleContext(onboardingData) {
    return {
      exercise: onboardingData.exerciseFrequency || 'Unknown',
      diet: onboardingData.diet || 'Unknown',
      sleep: onboardingData.sleepQuality || 'Unknown',
      stress: onboardingData.stressLevel || 'Unknown',
      smoking: onboardingData.tobaccoUse || 'Unknown',
      alcohol: onboardingData.alcoholUse || 'Unknown',
      caffeine: onboardingData.caffeineIntake || 'Unknown',
      hydration: onboardingData.hydrationLevel || 'Unknown',
      environmentalFactors: onboardingData.environmentalFactors || [],
      lifestyleScore: this.calculateLifestyleScore(onboardingData),
      improvementAreas: this.identifyImprovementAreas(onboardingData)
    };
  }

  // ===== RISK CONTEXT GENERATION =====

  generateRiskContext(onboardingData) {
    const age = this.calculateAge(onboardingData.dateOfBirth);
    const conditions = onboardingData.chronicConditions || [];
    const lifestyle = onboardingData.lifestyle || {};
    
    return {
      overallRisk: this.calculateOverallRisk(onboardingData),
      ageBasedRisks: this.assessAgeBasedRisks(age),
      conditionBasedRisks: this.assessConditionBasedRisks(conditions),
      lifestyleBasedRisks: this.assessLifestyleBasedRisks(lifestyle),
      familyHistoryRisks: this.assessFamilyHistoryRisks(onboardingData.familyHistory),
      medicationRisks: this.assessMedicationRisks(onboardingData.medications),
      pregnancyRisks: this.assessPregnancyRisks(onboardingData),
      emergencyRisks: this.assessEmergencyRisks(onboardingData)
    };
  }

  // ===== SCREENING CONTEXT GENERATION =====

  generateScreeningContext(onboardingData) {
    const age = this.calculateAge(onboardingData.dateOfBirth);
    const anatomy = onboardingData.reproductiveAnatomy || [];
    const conditions = onboardingData.chronicConditions || [];
    
    return {
      ageBasedScreenings: this.getAgeBasedScreenings(age, anatomy),
      conditionBasedScreenings: this.getConditionBasedScreenings(conditions),
      anatomyBasedScreenings: this.getAnatomyBasedScreenings(anatomy),
      riskBasedScreenings: this.getRiskBasedScreenings(onboardingData),
      nextScreenings: this.calculateNextScreenings(onboardingData),
      screeningPriorities: this.prioritizeScreenings(onboardingData)
    };
  }

  // ===== MEDICATION CONTEXT GENERATION =====

  generateMedicationContext(onboardingData) {
    const medications = onboardingData.medications || [];
    const conditions = onboardingData.chronicConditions || [];
    
    return {
      currentMedications: medications,
      medicationCategories: this.categorizeMedications(medications),
      medicationInteractions: this.assessMedicationInteractions(medications),
      medicationSideEffects: this.assessMedicationSideEffects(medications),
      medicationCompliance: this.assessMedicationCompliance(onboardingData),
      medicationOptimization: this.suggestMedicationOptimization(medications, conditions),
      alternativeTherapies: this.suggestAlternativeTherapies(conditions)
    };
  }

  // ===== PREGNANCY CONTEXT GENERATION =====

  generatePregnancyContext(onboardingData) {
    if (!onboardingData.isPregnant) {
      return { isPregnant: false };
    }
    
    return {
      isPregnant: true,
      trimester: this.calculateTrimester(onboardingData.pregnancyStartDate),
      pregnancyWeek: this.calculatePregnancyWeek(onboardingData.pregnancyStartDate),
      pregnancyRisks: this.assessPregnancyRisks(onboardingData),
      prenatalCare: this.generatePrenatalCarePlan(onboardingData),
      fetalDevelopment: this.getFetalDevelopmentInfo(onboardingData),
      maternalHealth: this.assessMaternalHealth(onboardingData),
      deliveryPlanning: this.generateDeliveryPlanning(onboardingData)
    };
  }

  // ===== TRANS HEALTH CONTEXT GENERATION =====

  generateTransHealthContext(onboardingData) {
    const isTrans = onboardingData.genderIdentity !== onboardingData.sexAssignedAtBirth;
    
    if (!isTrans) {
      return { isTrans: false };
    }
    
    return {
      isTrans: true,
      transitionStage: this.assessTransitionStage(onboardingData),
      hormoneTherapy: this.assessHormoneTherapy(onboardingData),
      surgeries: this.assessTransSurgeries(onboardingData),
      recoveryStatus: this.assessRecoveryStatus(onboardingData),
      ongoingCare: this.generateOngoingCarePlan(onboardingData),
      mentalHealth: this.assessTransMentalHealth(onboardingData),
      supportResources: this.getTransSupportResources(onboardingData)
    };
  }

  // ===== EMERGENCY CONTEXT GENERATION =====

  generateEmergencyContext(onboardingData) {
    return {
      emergencyContacts: onboardingData.emergencyContacts || [],
      emergencyConditions: this.identifyEmergencyConditions(onboardingData),
      emergencySymptoms: this.identifyEmergencySymptoms(onboardingData),
      emergencyMedications: this.identifyEmergencyMedications(onboardingData),
      emergencyProcedures: this.identifyEmergencyProcedures(onboardingData),
      emergencyPlan: this.generateEmergencyPlan(onboardingData)
    };
  }

  // ===== HELPER METHODS =====

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const ageDiff = new Date() - birthDate;
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  calculateBMI(height, weight) {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  getAgeGroup(age) {
    if (!age) return 'Unknown';
    if (age < 13) return 'Child';
    if (age < 18) return 'Adolescent';
    if (age < 35) return 'Young Adult';
    if (age < 50) return 'Adult';
    if (age < 65) return 'Middle Age';
    return 'Senior';
  }

  getBMICategory(bmi) {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  assessReproductiveCapabilities(onboardingData) {
    const anatomy = onboardingData.reproductiveAnatomy || [];
    const conditions = onboardingData.chronicConditions || [];
    const surgeries = onboardingData.surgeries || [];
    
    let capabilities = {
      canMenstruate: anatomy.includes('uterus') && !surgeries.some(s => s.includes('hysterectomy')),
      canOvulate: anatomy.includes('ovaries') && !surgeries.some(s => s.includes('oophorectomy')),
      canProduceSperm: anatomy.includes('testes') && !surgeries.some(s => s.includes('orchiectomy')),
      fertilityStatus: 'Unknown'
    };
    
    // Assess fertility based on conditions
    if (conditions.includes('PCOS') || conditions.includes('Endometriosis')) {
      capabilities.fertilityStatus = 'May be affected';
    }
    
    return capabilities;
  }

  assessFertilityStatus(onboardingData) {
    const age = this.calculateAge(onboardingData.dateOfBirth);
    const conditions = onboardingData.chronicConditions || [];
    const lifestyle = onboardingData.lifestyle || {};
    
    let fertilityScore = 100;
    let factors = [];
    
    // Age factors
    if (age >= 35) {
      fertilityScore -= 20;
      factors.push('Advanced age');
    }
    
    // Condition factors
    if (conditions.includes('PCOS')) {
      fertilityScore -= 15;
      factors.push('PCOS');
    }
    
    if (conditions.includes('Endometriosis')) {
      fertilityScore -= 20;
      factors.push('Endometriosis');
    }
    
    // Lifestyle factors
    if (lifestyle.smoking === 'Yes') {
      fertilityScore -= 25;
      factors.push('Smoking');
    }
    
    if (lifestyle.stress === 'High') {
      fertilityScore -= 10;
      factors.push('High stress');
    }
    
    return {
      score: Math.max(0, fertilityScore),
      level: fertilityScore >= 80 ? 'High' : fertilityScore >= 60 ? 'Moderate' : 'Low',
      factors: factors
    };
  }

  generateCycleContext(onboardingData) {
    const anatomy = onboardingData.reproductiveAnatomy || [];
    
    if (!anatomy.includes('uterus')) {
      return { hasCycles: false };
    }
    
    return {
      hasCycles: true,
      cycleLength: onboardingData.cycleLength || 'Unknown',
      cycleRegularity: onboardingData.cycleRegularity || 'Unknown',
      periodLength: onboardingData.periodLength || 'Unknown',
      periodFlow: onboardingData.periodFlow || 'Unknown',
      pmsSymptoms: onboardingData.pmsSymptoms || [],
      cycleTracking: onboardingData.cycleTracking || false
    };
  }

  generateSexualHealthContext(onboardingData) {
    return {
      sexualActivity: onboardingData.sexualActivity || 'Unknown',
      contraception: onboardingData.contraception || 'None',
      stiHistory: onboardingData.stiHistory || [],
      stiTesting: onboardingData.stiTesting || 'Unknown',
      sexualHealthGoals: onboardingData.sexualHealthGoals || []
    };
  }

  assessConditionSeverity(onboardingData) {
    const conditions = onboardingData.chronicConditions || [];
    const severity = {};
    
    conditions.forEach(condition => {
      switch (condition) {
        case 'PCOS':
          severity[condition] = 'Moderate';
          break;
        case 'Endometriosis':
          severity[condition] = 'Moderate to Severe';
          break;
        case 'Diabetes':
          severity[condition] = 'Moderate';
          break;
        default:
          severity[condition] = 'Unknown';
      }
    });
    
    return severity;
  }

  assessConditionInteractions(onboardingData) {
    const conditions = onboardingData.chronicConditions || [];
    const interactions = [];
    
    // Check for known condition interactions
    if (conditions.includes('PCOS') && conditions.includes('Diabetes')) {
      interactions.push({
        conditions: ['PCOS', 'Diabetes'],
        interaction: 'PCOS increases diabetes risk, diabetes worsens PCOS symptoms',
        severity: 'High',
        management: 'Coordinated care with endocrinologist required'
      });
    }
    
    return interactions;
  }

  assessGeneticRiskFactors(onboardingData) {
    const familyHistory = onboardingData.familyHistory || {};
    const risks = [];
    
    if (familyHistory.breastCancer) {
      risks.push({
        condition: 'Breast Cancer',
        risk: 'Elevated',
        recommendation: 'Early screening recommended'
      });
    }
    
    if (familyHistory.ovarianCancer) {
      risks.push({
        condition: 'Ovarian Cancer',
        risk: 'Elevated',
        recommendation: 'Consider genetic testing'
      });
    }
    
    return risks;
  }

  calculateLifestyleScore(onboardingData) {
    const lifestyle = onboardingData.lifestyle || {};
    let score = 100;
    let factors = [];
    
    if (lifestyle.exercise === 'Low') {
      score -= 20;
      factors.push('Low exercise: -20');
    } else if (lifestyle.exercise === 'High') {
      score += 15;
      factors.push('High exercise: +15');
    }
    
    if (lifestyle.diet === 'Unhealthy') {
      score -= 25;
      factors.push('Unhealthy diet: -25');
    } else if (lifestyle.diet === 'Healthy') {
      score += 20;
      factors.push('Healthy diet: +20');
    }
    
    if (lifestyle.sleep === 'Poor') {
      score -= 15;
      factors.push('Poor sleep: -15');
    }
    
    if (lifestyle.stress === 'High') {
      score -= 20;
      factors.push('High stress: -20');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      factors: factors,
      level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
    };
  }

  identifyImprovementAreas(onboardingData) {
    const lifestyle = onboardingData.lifestyle || {};
    const areas = [];
    
    if (lifestyle.exercise === 'Low') {
      areas.push('Increase physical activity');
    }
    
    if (lifestyle.diet === 'Unhealthy') {
      areas.push('Improve nutrition');
    }
    
    if (lifestyle.sleep === 'Poor') {
      areas.push('Optimize sleep habits');
    }
    
    if (lifestyle.stress === 'High') {
      areas.push('Implement stress management');
    }
    
    return areas;
  }

  calculateOverallRisk(onboardingData) {
    const age = this.calculateAge(onboardingData.dateOfBirth);
    const conditions = onboardingData.chronicConditions || [];
    const lifestyle = onboardingData.lifestyle || {};
    
    let riskScore = 0;
    let riskFactors = [];
    
    // Age risks
    if (age >= 35) {
      riskScore += 15;
      riskFactors.push('Advanced age');
    }
    
    // Condition risks
    if (conditions.includes('PCOS')) {
      riskScore += 20;
      riskFactors.push('PCOS');
    }
    
    if (conditions.includes('Endometriosis')) {
      riskScore += 25;
      riskFactors.push('Endometriosis');
    }
    
    // Lifestyle risks
    if (lifestyle.smoking === 'Yes') {
      riskScore += 30;
      riskFactors.push('Smoking');
    }
    
    if (lifestyle.stress === 'High') {
      riskScore += 15;
      riskFactors.push('High stress');
    }
    
    return {
      score: Math.min(100, riskScore),
      level: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High',
      factors: riskFactors
    };
  }

  getDefaultContext() {
    return {
      basicProfile: {
        age: null,
        ageGroup: 'Unknown',
        bmi: null,
        bmiCategory: 'Unknown'
      },
      reproductiveContext: {
        anatomy: [],
        isAFAB: false,
        isAMAB: false,
        isTrans: false
      },
      medicalContext: {
        conditions: [],
        allergies: [],
        surgeries: []
      },
      lifestyleContext: {
        exercise: 'Unknown',
        diet: 'Unknown',
        sleep: 'Unknown',
        stress: 'Unknown'
      },
      riskContext: {
        overallRisk: 'Unknown',
        ageBasedRisks: [],
        conditionBasedRisks: []
      },
      screeningContext: {
        ageBasedScreenings: [],
        conditionBasedScreenings: []
      },
      medicationContext: {
        currentMedications: [],
        medicationCategories: []
      },
      pregnancyContext: { isPregnant: false },
      transHealthContext: { isTrans: false },
      emergencyContext: {
        emergencyContacts: [],
        emergencyConditions: []
      }
    };
  }
}

export default PersonalContextEngine;
