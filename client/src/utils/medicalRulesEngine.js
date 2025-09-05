// ENHANCED MEDICAL RULES ENGINE
// Applies clinical rules for preventive care, health alerts, and medication reminders

export class MedicalRulesEngine {
  constructor() {
    this.clinicalRules = new Map();
    this.alertThresholds = new Map();
    this.reminderSchedules = new Map();
    this.initializeRules();
  }

  // ===== RULE INITIALIZATION =====

  initializeRules() {
    this.initializeClinicalRules();
    this.initializeAlertThresholds();
    this.initializeReminderSchedules();
  }

  initializeClinicalRules() {
    // AFAB Clinical Rules
    this.clinicalRules.set('AFAB', {
      cervicalScreening: {
        startAge: 21,
        frequency: '3_years',
        conditions: ['pap_smear', 'hpv_testing'],
        exceptions: ['hysterectomy', 'cervical_cancer_history']
      },
      breastScreening: {
        startAge: 40,
        frequency: '1_2_years',
        conditions: ['mammogram', 'clinical_breast_exam'],
        exceptions: ['mastectomy', 'breast_cancer_history']
      },
      boneDensity: {
        startAge: 65,
        frequency: '2_years',
        conditions: ['dexa_scan'],
        exceptions: ['osteoporosis', 'fracture_history']
      },
      pregnancyCare: {
        frequency: 'monthly_then_weekly',
        conditions: ['prenatal_visits', 'ultrasounds', 'blood_tests'],
        exceptions: ['high_risk_pregnancy']
      }
    });

    // AMAB Clinical Rules
    this.clinicalRules.set('AMAB', {
      prostateScreening: {
        startAge: 50,
        frequency: '2_years',
        conditions: ['psa_test', 'digital_rectal_exam'],
        exceptions: ['prostate_cancer_history', 'prostatectomy']
      },
      testicularExam: {
        startAge: 18,
        frequency: 'annual',
        conditions: ['self_exam', 'clinical_exam'],
        exceptions: ['orchiectomy']
      },
      cardiovascularScreening: {
        startAge: 35,
        frequency: 'annual',
        conditions: ['blood_pressure', 'cholesterol', 'diabetes_screening'],
        exceptions: ['existing_cardiovascular_disease']
      }
    });

    // Trans Health Clinical Rules
    this.clinicalRules.set('Trans', {
      hormoneMonitoring: {
        frequency: '3_months',
        conditions: ['hormone_levels', 'liver_function', 'lipid_panel'],
        exceptions: ['stable_hormone_therapy']
      },
      surgeryRecovery: {
        frequency: 'weekly_then_monthly',
        conditions: ['wound_healing', 'complications', 'recovery_progress'],
        exceptions: ['fully_recovered']
      },
      mentalHealth: {
        frequency: 'monthly',
        conditions: ['depression_screening', 'anxiety_assessment', 'suicide_risk'],
        exceptions: ['stable_mental_health']
      }
    });

    // Universal Clinical Rules
    this.clinicalRules.set('Universal', {
      annualCheckup: {
        frequency: 'annual',
        conditions: ['physical_exam', 'blood_pressure', 'weight', 'general_health']
      },
      vaccination: {
        frequency: 'as_scheduled',
        conditions: ['flu_shot', 'tdap', 'covid_19', 'other_vaccines']
      },
      dentalCare: {
        frequency: '6_months',
        conditions: ['dental_cleaning', 'oral_exam', 'x_rays']
      }
    });
  }

  initializeAlertThresholds() {
    // Blood Pressure Alerts
    this.alertThresholds.set('bloodPressure', {
      systolic: { normal: 120, elevated: 130, high: 140, crisis: 180 },
      diastolic: { normal: 80, elevated: 85, high: 90, crisis: 110 }
    });

    // Blood Sugar Alerts
    this.alertThresholds.set('bloodSugar', {
      fasting: { normal: 100, prediabetes: 126, diabetes: 126 },
      postprandial: { normal: 140, prediabetes: 200, diabetes: 200 }
    });

    // Weight Change Alerts
    this.alertThresholds.set('weightChange', {
      weekly: { normal: 2, concerning: 5, alarming: 10 },
      monthly: { normal: 5, concerning: 10, alarming: 20 }
    });

    // Pain Level Alerts
    this.alertThresholds.set('painLevel', {
      mild: 3,
      moderate: 6,
      severe: 8,
      emergency: 10
    });
  }

  initializeReminderSchedules() {
    // Medication Reminders
    this.reminderSchedules.set('medications', {
      daily: ['morning', 'evening'],
      twice_daily: ['morning', 'evening'],
      three_times: ['morning', 'afternoon', 'evening'],
      as_needed: ['symptom_based'],
      weekly: ['weekly_injection', 'weekly_patch']
    });

    // Screening Reminders
    this.reminderSchedules.set('screenings', {
      pap_smear: { frequency: '3_years', reminder: '2_months_before' },
      mammogram: { frequency: '1_2_years', reminder: '1_month_before' },
      prostate: { frequency: '2_years', reminder: '1_month_before' },
      colonoscopy: { frequency: '10_years', reminder: '3_months_before' }
    });

    // Lifestyle Reminders
    this.reminderSchedules.set('lifestyle', {
      exercise: { frequency: 'daily', reminder: 'morning' },
      medication: { frequency: 'daily', reminder: 'evening' },
      water: { frequency: 'hourly', reminder: 'every_hour' },
      stress_check: { frequency: 'daily', reminder: 'evening' }
    });
  }

  // ===== CLINICAL RULE APPLICATION =====

  applyClinicalRules(userData, userContext) {
    const rules = this.getApplicableRules(userData, userContext);
    const recommendations = [];
    const alerts = [];
    const reminders = [];

    // Apply anatomy-specific rules
    if (userContext.reproductiveContext.isAFAB) {
      const afabRules = this.clinicalRules.get('AFAB');
      recommendations.push(...this.applyAFABRules(userData, afabRules));
    }

    if (userContext.reproductiveContext.isAMAB) {
      const amabRules = this.clinicalRules.get('AMAB');
      recommendations.push(...this.applyAMABRules(userData, amabRules));
    }

    if (userContext.reproductiveContext.isTrans) {
      const transRules = this.clinicalRules.get('Trans');
      recommendations.push(...this.applyTransRules(userData, transRules));
    }

    // Apply universal rules
    const universalRules = this.clinicalRules.get('Universal');
    recommendations.push(...this.applyUniversalRules(userData, universalRules));

    // Generate alerts and reminders
    alerts.push(...this.generateHealthAlerts(userData, userContext));
    reminders.push(...this.generateHealthReminders(userData, userContext));

    return {
      recommendations,
      alerts,
      reminders,
      applicableRules: Object.keys(rules)
    };
  }

  // ===== AFAB RULE APPLICATION =====

  applyAFABRules(userData, rules) {
    const recommendations = [];
    const age = userData.basicProfile?.age;

    // Cervical screening
    if (age >= 21 && !this.hasException(userData, 'cervicalScreening')) {
      recommendations.push({
        type: 'screening',
        priority: 'high',
        title: 'Cervical Cancer Screening',
        description: 'Schedule Pap smear and HPV testing',
        frequency: 'Every 3 years',
        nextDue: this.calculateNextDue('pap_smear', userData.lastPapSmear),
        reasoning: 'Cervical cancer screening is recommended starting at age 21',
        action: 'Schedule gynecologist appointment'
      });
    }

    // Breast screening
    if (age >= 40 && !this.hasException(userData, 'breastScreening')) {
      recommendations.push({
        type: 'screening',
        priority: 'medium',
        title: 'Breast Cancer Screening',
        description: 'Schedule mammogram',
        frequency: 'Every 1-2 years',
        nextDue: this.calculateNextDue('mammogram', userData.lastMammogram),
        reasoning: 'Breast cancer screening recommended starting at age 40',
        action: 'Schedule mammogram appointment'
      });
    }

    // Bone density
    if (age >= 65 && !this.hasException(userData, 'boneDensity')) {
      recommendations.push({
        type: 'screening',
        priority: 'medium',
        title: 'Bone Density Screening',
        description: 'Schedule DEXA scan',
        frequency: 'Every 2 years',
        nextDue: this.calculateNextDue('dexa_scan', userData.lastDexaScan),
        reasoning: 'Bone density screening recommended for osteoporosis prevention',
        action: 'Schedule DEXA scan appointment'
      });
    }

    return recommendations;
  }

  // ===== AMAB RULE APPLICATION =====

  applyAMABRules(userData, rules) {
    const recommendations = [];
    const age = userData.basicProfile?.age;

    // Prostate screening
    if (age >= 50 && !this.hasException(userData, 'prostateScreening')) {
      recommendations.push({
        type: 'screening',
        priority: 'medium',
        title: 'Prostate Cancer Screening',
        description: 'Schedule PSA test and digital rectal exam',
        frequency: 'Every 2 years',
        nextDue: this.calculateNextDue('prostate_screening', userData.lastProstateScreening),
        reasoning: 'Prostate cancer screening recommended starting at age 50',
        action: 'Schedule urologist appointment'
      });
    }

    // Testicular exam
    if (age >= 18 && !this.hasException(userData, 'testicularExam')) {
      recommendations.push({
        type: 'screening',
        priority: 'low',
        title: 'Testicular Self-Exam',
        description: 'Perform monthly testicular self-examination',
        frequency: 'Monthly',
        nextDue: 'This month',
        reasoning: 'Regular self-exams help detect testicular cancer early',
        action: 'Learn proper technique and perform monthly'
      });
    }

    // Cardiovascular screening
    if (age >= 35 && !this.hasException(userData, 'cardiovascularScreening')) {
      recommendations.push({
        type: 'screening',
        priority: 'medium',
        title: 'Cardiovascular Screening',
        description: 'Schedule blood pressure, cholesterol, and diabetes screening',
        frequency: 'Annual',
        nextDue: this.calculateNextDue('cardiovascular_screening', userData.lastCardiovascularScreening),
        reasoning: 'Cardiovascular disease risk increases with age',
        action: 'Schedule annual physical examination'
      });
    }

    return recommendations;
  }

  // ===== TRANS HEALTH RULE APPLICATION =====

  applyTransRules(userData, rules) {
    const recommendations = [];

    // Hormone monitoring
    if (userData.medicationContext?.currentMedications?.some(med => 
      ['estrogen', 'testosterone', 'anti_androgens'].includes(med))) {
      recommendations.push({
        type: 'monitoring',
        priority: 'high',
        title: 'Hormone Therapy Monitoring',
        description: 'Schedule hormone level and liver function testing',
        frequency: 'Every 3 months',
        nextDue: this.calculateNextDue('hormone_monitoring', userData.lastHormoneMonitoring),
        reasoning: 'Regular monitoring ensures safe and effective hormone therapy',
        action: 'Schedule endocrinologist appointment'
      });
    }

    // Surgery recovery monitoring
    if (userData.medicalContext?.surgeries?.some(surgery => 
      ['top_surgery', 'bottom_surgery', 'facial_feminization'].includes(surgery))) {
      recommendations.push({
        type: 'monitoring',
        priority: 'high',
        title: 'Surgery Recovery Monitoring',
        description: 'Monitor recovery progress and complications',
        frequency: 'Weekly then monthly',
        nextDue: 'This week',
        reasoning: 'Post-surgical monitoring prevents complications and ensures proper healing',
        action: 'Schedule follow-up appointment'
      });
    }

    // Mental health monitoring
    recommendations.push({
      type: 'monitoring',
      priority: 'medium',
      title: 'Mental Health Assessment',
      description: 'Regular mental health screening and support',
      frequency: 'Monthly',
      nextDue: 'This month',
      reasoning: 'Trans individuals face unique mental health challenges requiring regular support',
      action: 'Schedule mental health consultation'
    });

    return recommendations;
  }

  // ===== UNIVERSAL RULE APPLICATION =====

  applyUniversalRules(userData, rules) {
    const recommendations = [];

    // Annual checkup
    recommendations.push({
      type: 'screening',
      priority: 'medium',
      title: 'Annual Health Checkup',
      description: 'Schedule comprehensive physical examination',
      frequency: 'Annual',
      nextDue: this.calculateNextDue('annual_checkup', userData.lastAnnualCheckup),
      reasoning: 'Annual checkups help detect health issues early',
      action: 'Schedule primary care appointment'
    });

    // Vaccination
    recommendations.push({
      type: 'prevention',
      priority: 'medium',
      title: 'Vaccination Review',
      description: 'Review and update vaccinations',
      frequency: 'As scheduled',
      nextDue: 'Check vaccination records',
      reasoning: 'Vaccinations prevent serious infectious diseases',
      action: 'Consult healthcare provider for vaccination schedule'
    });

    // Dental care
    recommendations.push({
      type: 'screening',
      priority: 'low',
      title: 'Dental Care',
      description: 'Schedule dental cleaning and examination',
      frequency: 'Every 6 months',
      nextDue: this.calculateNextDue('dental_care', userData.lastDentalCare),
      reasoning: 'Regular dental care prevents oral health problems',
      action: 'Schedule dental appointment'
    });

    return recommendations;
  }

  // ===== HEALTH ALERT GENERATION =====

  generateHealthAlerts(userData, userContext) {
    const alerts = [];

    // Check blood pressure
    if (userData.vitalSigns?.bloodPressure) {
      const bp = userData.vitalSigns.bloodPressure;
      const thresholds = this.alertThresholds.get('bloodPressure');
      
      if (bp.systolic >= thresholds.systolic.crisis || bp.diastolic >= thresholds.diastolic.crisis) {
        alerts.push({
          type: 'emergency',
          priority: 'critical',
          title: 'Blood Pressure Crisis',
          description: 'Blood pressure is dangerously high',
          action: 'Seek immediate medical attention',
          reasoning: 'Blood pressure crisis requires emergency medical care'
        });
      } else if (bp.systolic >= thresholds.systolic.high || bp.diastolic >= thresholds.diastolic.high) {
        alerts.push({
          type: 'warning',
          priority: 'high',
          title: 'High Blood Pressure',
          description: 'Blood pressure is elevated',
          action: 'Schedule medical consultation',
          reasoning: 'High blood pressure increases cardiovascular risk'
        });
      }
    }

    // Check blood sugar
    if (userData.vitalSigns?.bloodSugar) {
      const bs = userData.vitalSigns.bloodSugar;
      const thresholds = this.alertThresholds.get('bloodSugar');
      
      if (bs.fasting >= thresholds.fasting.diabetes) {
        alerts.push({
          type: 'warning',
          priority: 'high',
          title: 'High Blood Sugar',
          description: 'Fasting blood sugar indicates diabetes',
          action: 'Schedule endocrinologist consultation',
          reasoning: 'High blood sugar requires immediate medical attention'
        });
      }
    }

    // Check weight changes
    if (userData.vitalSigns?.weight) {
      const weightChange = this.calculateWeightChange(userData.vitalSigns.weight);
      const thresholds = this.alertThresholds.get('weightChange');
      
      if (Math.abs(weightChange.weekly) >= thresholds.weekly.alarming) {
        alerts.push({
          type: 'warning',
          priority: 'high',
          title: 'Significant Weight Change',
          description: 'Rapid weight change detected',
          action: 'Schedule medical consultation',
          reasoning: 'Rapid weight changes may indicate underlying health issues'
        });
      }
    }

    // Check pain levels
    if (userData.symptoms?.painLevel >= this.alertThresholds.get('painLevel').emergency) {
      alerts.push({
        type: 'emergency',
        priority: 'critical',
        title: 'Severe Pain Alert',
        description: 'Pain level is extremely high',
        action: 'Seek immediate medical attention',
        reasoning: 'Severe pain may indicate serious medical emergency'
      });
    }

    return alerts;
  }

  // ===== HEALTH REMINDER GENERATION =====

  generateHealthReminders(userData, userContext) {
    const reminders = [];

    // Medication reminders
    if (userData.medicationContext?.currentMedications?.length > 0) {
      userData.medicationContext.currentMedications.forEach(medication => {
        const schedule = this.getMedicationSchedule(medication);
        if (schedule) {
          reminders.push({
            type: 'medication',
            priority: 'high',
            title: `${medication} Reminder`,
            description: `Take ${medication} as prescribed`,
            frequency: schedule.frequency,
            times: schedule.times,
            reasoning: 'Medication adherence is crucial for treatment effectiveness',
            action: 'Set medication reminders and maintain schedule'
          });
        }
      });
    }

    // Screening reminders
    const screenings = this.getDueScreenings(userData, userContext);
    screenings.forEach(screening => {
      reminders.push({
        type: 'screening',
        priority: screening.priority,
        title: `${screening.title} Due`,
        description: screening.description,
        frequency: screening.frequency,
        nextDue: screening.nextDue,
        reasoning: screening.reasoning,
        action: screening.action
      });
    });

    // Lifestyle reminders
    const lifestyleReminders = this.getLifestyleReminders(userData, userContext);
    reminders.push(...lifestyleReminders);

    return reminders;
  }

  // ===== HELPER METHODS =====

  getApplicableRules(userData, userContext) {
    const rules = {};
    
    if (userContext.reproductiveContext.isAFAB) {
      rules.AFAB = this.clinicalRules.get('AFAB');
    }
    
    if (userContext.reproductiveContext.isAMAB) {
      rules.AMAB = this.clinicalRules.get('AMAB');
    }
    
    if (userContext.reproductiveContext.isTrans) {
      rules.Trans = this.clinicalRules.get('Trans');
    }
    
    rules.Universal = this.clinicalRules.get('Universal');
    
    return rules;
  }

  hasException(userData, ruleType) {
    // Check if user has exceptions for specific rules
    const exceptions = {
      cervicalScreening: ['hysterectomy', 'cervical_cancer_history'],
      breastScreening: ['mastectomy', 'breast_cancer_history'],
      boneDensity: ['osteoporosis', 'fracture_history'],
      prostateScreening: ['prostate_cancer_history', 'prostatectomy'],
      testicularExam: ['orchiectomy'],
      cardiovascularScreening: ['existing_cardiovascular_disease']
    };

    const ruleExceptions = exceptions[ruleType] || [];
    return ruleExceptions.some(exception => 
      userData.medicalContext?.surgeries?.includes(exception) ||
      userData.medicalContext?.conditions?.includes(exception)
    );
  }

  calculateNextDue(screeningType, lastScreening) {
    if (!lastScreening) return 'Overdue';
    
    const lastDate = new Date(lastScreening);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + 
                      (now.getMonth() - lastDate.getMonth());
    
    const frequencies = {
      pap_smear: 36,
      mammogram: 24,
      prostate_screening: 24,
      dexa_scan: 24,
      cardiovascular_screening: 12,
      annual_checkup: 12,
      dental_care: 6
    };
    
    const frequency = frequencies[screeningType];
    if (monthsDiff >= frequency) return 'Overdue';
    if (monthsDiff >= frequency - 2) return 'Due soon';
    
    return 'Not due yet';
  }

  getMedicationSchedule(medication) {
    const schedules = {
      'metformin': { frequency: 'twice_daily', times: ['morning', 'evening'] },
      'birth_control': { frequency: 'daily', times: ['morning'] },
      'testosterone': { frequency: 'weekly', times: ['weekly_injection'] },
      'estrogen': { frequency: 'daily', times: ['morning'] }
    };
    
    return schedules[medication] || null;
  }

  getDueScreenings(userData, userContext) {
    const screenings = [];
    
    // This would be populated based on user's screening history
    // For now, return empty array
    return screenings;
  }

  getLifestyleReminders(userData, userContext) {
    const reminders = [];
    
    // Exercise reminder
    if (userContext.lifestyleContext.exercise === 'Low') {
      reminders.push({
        type: 'lifestyle',
        priority: 'medium',
        title: 'Exercise Reminder',
        description: 'Time for daily physical activity',
        frequency: 'Daily',
        times: ['morning'],
        reasoning: 'Regular exercise improves overall health and reduces disease risk',
        action: 'Engage in 30 minutes of moderate exercise'
      });
    }
    
    // Water reminder
    reminders.push({
      type: 'lifestyle',
      priority: 'low',
      title: 'Hydration Reminder',
      description: 'Stay hydrated throughout the day',
      frequency: 'Hourly',
      times: ['every_hour'],
      reasoning: 'Proper hydration supports all bodily functions',
      action: 'Drink 8-10 glasses of water daily'
    });
    
    return reminders;
  }

  calculateWeightChange(weightHistory) {
    if (!weightHistory || weightHistory.length < 2) return { weekly: 0, monthly: 0 };
    
    const recent = weightHistory[weightHistory.length - 1];
    const previous = weightHistory[weightHistory.length - 2];
    
    const weeklyChange = recent.weight - previous.weight;
    const monthlyChange = weeklyChange * 4; // Approximate
    
    return { weekly: weeklyChange, monthly: monthlyChange };
  }
}

export default MedicalRulesEngine;
