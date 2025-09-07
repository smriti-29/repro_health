// COMPREHENSIVE MEDICAL KNOWLEDGE BASE
// Market-ready clinical rules for all genders and conditions

export const MEDICAL_KNOWLEDGE_BASE = {
  // ===== REPRODUCTIVE CONDITIONS =====
  conditions: {
    // AFAB Conditions
    PCOS: {
      symptoms: ['irregular_cycles', 'weight_gain', 'acne', 'hirsutism', 'insulin_resistance'],
      risks: ['diabetes', 'infertility', 'heart_disease', 'endometrial_cancer'],
      screenings: ['glucose_test', 'insulin_test', 'lipid_panel', 'ultrasound'],
      medications: ['metformin', 'birth_control', 'spironolactone', 'clomiphene'],
      lifestyle: ['low_carb_diet', 'regular_exercise', 'stress_management', 'weight_management'],
      monitoring: ['cycle_tracking', 'blood_sugar', 'weight', 'blood_pressure']
    },
    
    Endometriosis: {
      symptoms: ['pelvic_pain', 'heavy_bleeding', 'painful_sex', 'infertility', 'fatigue'],
      risks: ['adhesions', 'ovarian_cysts', 'infertility', 'bowel_bladder_issues'],
      screenings: ['ultrasound', 'MRI', 'laparoscopy', 'CA125_test'],
      medications: ['pain_meds', 'hormone_therapy', 'birth_control', 'GnRH_agonists'],
      lifestyle: ['anti_inflammatory_diet', 'stress_reduction', 'gentle_exercise', 'heat_therapy'],
      monitoring: ['pain_levels', 'cycle_symptoms', 'medication_side_effects']
    },
    
    Fibroids: {
      symptoms: ['heavy_bleeding', 'pelvic_pressure', 'frequent_urination', 'back_pain'],
      risks: ['anemia', 'pregnancy_complications', 'infertility'],
      screenings: ['ultrasound', 'MRI', 'hysteroscopy'],
      medications: ['birth_control', 'GnRH_agonists', 'tranexamic_acid'],
      lifestyle: ['iron_rich_diet', 'exercise', 'stress_management'],
      monitoring: ['bleeding_patterns', 'pain_levels', 'iron_levels']
    },
    
    Adenomyosis: {
      symptoms: ['heavy_bleeding', 'severe_cramps', 'pelvic_pain', 'enlarged_uterus'],
      risks: ['anemia', 'chronic_pain', 'infertility'],
      screenings: ['ultrasound', 'MRI', 'hysteroscopy'],
      medications: ['birth_control', 'pain_meds', 'hormone_therapy'],
      lifestyle: ['anti_inflammatory_diet', 'heat_therapy', 'stress_management'],
      monitoring: ['pain_levels', 'bleeding_patterns', 'quality_of_life']
    },
    
    POI: {
      symptoms: ['irregular_cycles', 'hot_flashes', 'night_sweats', 'vaginal_dryness'],
      risks: ['osteoporosis', 'heart_disease', 'infertility', 'cognitive_decline'],
      screenings: ['FSH_test', 'estradiol_test', 'bone_density', 'thyroid_function'],
      medications: ['hormone_replacement', 'calcium', 'vitamin_d', 'antidepressants'],
      lifestyle: ['bone_healthy_diet', 'weight_bearing_exercise', 'stress_management'],
      monitoring: ['hormone_levels', 'bone_density', 'cardiovascular_health']
    },
    
    RPL: {
      symptoms: ['recurrent_miscarriages', 'anxiety', 'depression', 'guilt'],
      risks: ['genetic_abnormalities', 'uterine_abnormalities', 'hormonal_imbalances'],
      screenings: ['genetic_testing', 'uterine_imaging', 'hormone_panels', 'autoimmune_tests'],
      medications: ['progesterone', 'blood_thinners', 'immune_modulators'],
      lifestyle: ['prenatal_vitamins', 'healthy_diet', 'stress_reduction', 'avoid_toxins'],
      monitoring: ['pregnancy_tests', 'ultrasounds', 'hormone_levels']
    },
    
    GestationalDiabetes: {
      symptoms: ['high_blood_sugar', 'frequent_urination', 'fatigue', 'blurred_vision'],
      risks: ['preeclampsia', 'cesarean_delivery', 'large_baby', 'type2_diabetes_later'],
      screenings: ['glucose_challenge', 'glucose_tolerance', 'regular_blood_sugar'],
      medications: ['insulin', 'metformin', 'diet_modification'],
      lifestyle: ['carbohydrate_counting', 'regular_exercise', 'blood_sugar_monitoring'],
      monitoring: ['blood_sugar_levels', 'fetal_growth', 'blood_pressure']
    },
    
    // AMAB Conditions
    Varicocele: {
      symptoms: ['testicular_pain', 'swelling', 'infertility', 'testicular_atrophy'],
      risks: ['infertility', 'testosterone_deficiency', 'testicular_pain'],
      screenings: ['physical_exam', 'ultrasound', 'semen_analysis', 'testosterone_test'],
      medications: ['pain_meds', 'testosterone_replacement'],
      lifestyle: ['supportive_underwear', 'avoid_heat_exposure', 'regular_exercise'],
      monitoring: ['pain_levels', 'fertility_parameters', 'testosterone_levels']
    },
    
    KlinefelterSyndrome: {
      symptoms: ['small_testes', 'infertility', 'gynecomastia', 'learning_difficulties'],
      risks: ['infertility', 'osteoporosis', 'diabetes', 'heart_disease'],
      screenings: ['karyotype_test', 'testosterone_test', 'semen_analysis', 'bone_density'],
      medications: ['testosterone_replacement', 'fertility_treatments'],
      lifestyle: ['regular_exercise', 'healthy_diet', 'cognitive_support'],
      monitoring: ['hormone_levels', 'bone_density', 'cardiovascular_health']
    },
    
    // Trans Health Conditions
    HormoneTherapy: {
      symptoms: ['mood_changes', 'fatigue', 'hot_flashes', 'body_changes'],
      risks: ['blood_clots', 'liver_damage', 'cardiovascular_issues', 'bone_loss'],
      screenings: ['hormone_levels', 'liver_function', 'lipid_panel', 'bone_density'],
      medications: ['estrogen', 'testosterone', 'anti_androgens', 'progesterone'],
      lifestyle: ['regular_exercise', 'healthy_diet', 'stress_management'],
      monitoring: ['hormone_levels', 'side_effects', 'organ_function']
    },
    
    SurgeryRecovery: {
      symptoms: ['pain', 'swelling', 'fatigue', 'emotional_changes'],
      risks: ['infection', 'bleeding', 'scarring', 'complications'],
      screenings: ['wound_inspection', 'pain_assessment', 'mobility_evaluation'],
      medications: ['pain_meds', 'antibiotics', 'anti_inflammatories'],
      lifestyle: ['rest', 'gentle_movement', 'wound_care', 'emotional_support'],
      monitoring: ['healing_progress', 'pain_levels', 'complications']
    }
  },
  
  // ===== LIFE STAGES =====
  lifeStages: {
    Puberty: {
      AFAB: {
        age_range: '8-15',
        changes: ['breast_development', 'pubic_hair', 'menstruation', 'growth_spurt'],
        screenings: ['growth_monitoring', 'puberty_assessment', 'nutrition_evaluation'],
        concerns: ['early_late_puberty', 'irregular_cycles', 'body_image', 'emotional_changes']
      },
      AMAB: {
        age_range: '9-16',
        changes: ['testicular_growth', 'pubic_hair', 'voice_deepening', 'growth_spurt'],
        screenings: ['growth_monitoring', 'puberty_assessment', 'nutrition_evaluation'],
        concerns: ['early_late_puberty', 'gynecomastia', 'body_image', 'emotional_changes']
      }
    },
    
    Reproductive: {
      AFAB: {
        age_range: '15-45',
        changes: ['regular_cycles', 'fertility_peak', 'hormonal_balance'],
        screenings: ['pap_smear', 'breast_exam', 'STI_testing', 'contraception_counseling'],
        concerns: ['cycle_regularity', 'fertility', 'contraception', 'sexual_health']
      },
      AMAB: {
        age_range: '16-50',
        changes: ['sperm_production', 'testosterone_peak', 'sexual_maturity'],
        screenings: ['testicular_exam', 'STI_testing', 'fertility_assessment'],
        concerns: ['fertility', 'sexual_health', 'contraception', 'reproductive_goals']
      }
    },
    
    Pregnancy: {
      trimesters: {
        1: {
          weeks: '1-12',
          changes: ['implantation', 'organ_development', 'hormonal_changes'],
          screenings: ['prenatal_vitamins', 'ultrasound', 'blood_tests', 'genetic_counseling'],
          concerns: ['nausea', 'fatigue', 'miscarriage_risk', 'nutrition']
        },
        2: {
          weeks: '13-26',
          changes: ['fetal_movement', 'organ_maturation', 'maternal_adaptation'],
          screenings: ['anatomy_scan', 'glucose_screening', 'blood_pressure', 'fetal_heartbeat'],
          concerns: ['gestational_diabetes', 'preeclampsia', 'fetal_growth', 'maternal_comfort']
        },
        3: {
          weeks: '27-40',
          changes: ['fetal_growth', 'lung_maturation', 'maternal_preparation'],
          screenings: ['group_b_strep', 'fetal_position', 'cervical_exam', 'contraction_monitoring'],
          concerns: ['preterm_labor', 'gestational_hypertension', 'fetal_distress', 'delivery_preparation']
        }
      }
    },
    
    Menopause: {
      AFAB: {
        age_range: '45-55',
        changes: ['irregular_cycles', 'hot_flashes', 'vaginal_dryness', 'bone_loss'],
        screenings: ['hormone_levels', 'bone_density', 'cardiovascular_health', 'breast_cancer'],
        concerns: ['symptom_management', 'bone_health', 'heart_health', 'quality_of_life']
      },
      AMAB: {
        age_range: '50-70',
        changes: ['testosterone_decline', 'muscle_loss', 'bone_loss', 'mood_changes'],
        screenings: ['testosterone_levels', 'bone_density', 'prostate_health', 'cardiovascular_health'],
        concerns: ['symptom_management', 'bone_health', 'prostate_health', 'quality_of_life']
      }
    }
  },
  
  // ===== MEDICATIONS =====
  medications: {
    BirthControl: {
      types: ['pill', 'patch', 'ring', 'shot', 'implant', 'IUD'],
      side_effects: ['nausea', 'headaches', 'mood_changes', 'weight_gain', 'irregular_bleeding'],
      risks: ['blood_clots', 'stroke', 'heart_attack', 'liver_damage'],
      monitoring: ['blood_pressure', 'liver_function', 'side_effects', 'efficacy'],
      interactions: ['antibiotics', 'antifungals', 'herbal_supplements', 'smoking']
    },
    
    HormoneTherapy: {
      types: ['estrogen', 'testosterone', 'progesterone', 'anti_androgens'],
      side_effects: ['mood_changes', 'weight_gain', 'acne', 'hair_changes', 'body_changes'],
      risks: ['blood_clots', 'liver_damage', 'cardiovascular_issues', 'bone_loss'],
      monitoring: ['hormone_levels', 'organ_function', 'side_effects', 'efficacy'],
      interactions: ['blood_thinners', 'diabetes_meds', 'cholesterol_meds']
    },
    
    FertilityDrugs: {
      types: ['clomiphene', 'letrozole', 'gonadotropins', 'metformin'],
      side_effects: ['hot_flashes', 'mood_swings', 'ovarian_enlargement', 'multiple_pregnancies'],
      risks: ['ovarian_hyperstimulation', 'multiple_pregnancies', 'emotional_stress'],
      monitoring: ['ovulation', 'hormone_levels', 'ovarian_size', 'pregnancy_tests'],
      interactions: ['other_fertility_meds', 'hormone_therapy']
    },
    
    PainManagement: {
      types: ['NSAIDs', 'opioids', 'muscle_relaxants', 'antidepressants'],
      side_effects: ['stomach_irritation', 'drowsiness', 'constipation', 'dependence'],
      risks: ['addiction', 'overdose', 'organ_damage', 'interactions'],
      monitoring: ['pain_levels', 'side_effects', 'dependence_signs', 'organ_function'],
      interactions: ['alcohol', 'other_pain_meds', 'antidepressants']
    }
  },
  
  // ===== LIFESTYLE FACTORS =====
  lifestyle: {
    Diet: {
      healthy: ['balanced_nutrition', 'adequate_protein', 'healthy_fats', 'complex_carbs'],
      problematic: ['processed_foods', 'excess_sugar', 'trans_fats', 'alcohol'],
      condition_specific: {
        PCOS: ['low_glycemic', 'anti_inflammatory', 'mediterranean'],
        Endometriosis: ['anti_inflammatory', 'low_fodmap', 'gluten_free'],
        Pregnancy: ['prenatal_nutrition', 'adequate_folate', 'iron_rich', 'calcium_rich']
      }
    },
    
    Exercise: {
      beneficial: ['cardio', 'strength_training', 'yoga', 'pilates', 'walking'],
      harmful: ['excessive_intensity', 'contact_sports', 'high_impact', 'overexertion'],
      condition_specific: {
        PCOS: ['moderate_intensity', 'regular_frequency', 'weight_management'],
        Pregnancy: ['low_impact', 'pelvic_floor', 'gentle_stretching', 'avoid_lying_back'],
        Post_surgery: ['gradual_progression', 'avoid_strain', 'gentle_movement']
      }
    },
    
    Stress: {
      management: ['meditation', 'deep_breathing', 'therapy', 'social_support', 'hobbies'],
      harmful: ['chronic_stress', 'poor_sleep', 'social_isolation', 'unhealthy_coping'],
      impact: ['hormonal_imbalance', 'immune_suppression', 'cardiovascular_stress', 'mental_health']
    },
    
    Sleep: {
      healthy: ['7-9_hours', 'consistent_schedule', 'dark_room', 'cool_temperature'],
      problematic: ['irregular_schedule', 'screen_time', 'caffeine_late', 'stress'],
      impact: ['hormone_regulation', 'immune_function', 'cognitive_function', 'mood_stability']
    }
  },
  
  // ===== SCREENING PROTOCOLS =====
  screenings: {
    AFAB: {
      '21-29': ['pap_smear_every_3_years'],
      '30-65': ['pap_smear_every_3_years', 'HPV_testing_every_5_years'],
      '40+': ['mammogram_every_1_2_years'],
      '50+': ['colonoscopy_every_10_years', 'bone_density_test'],
      '65+': ['annual_health_assessment', 'fall_risk_assessment']
    },
    AMAB: {
      '18+': ['annual_physical', 'testicular_self_exam'],
      '50+': ['prostate_screening', 'colonoscopy_every_10_years'],
      '65+': ['annual_health_assessment', 'fall_risk_assessment']
    },
    Trans: {
      'all_ages': ['hormone_levels', 'organ_function', 'mental_health'],
      'surgery_prep': ['preoperative_assessment', 'mental_health_evaluation'],
      'post_surgery': ['wound_healing', 'complications', 'long_term_health']
    }
  }
};

// ===== RISK ASSESSMENT ALGORITHMS =====
export const RISK_ASSESSMENT = {
  // Calculate risk score based on multiple factors
  calculateRiskScore: (userData) => {
    let riskScore = 0;
    let riskFactors = [];
    let recommendations = [];
    
    // Age-based risks
    if (userData.age >= 35) {
      riskScore += 20;
      riskFactors.push('Advanced maternal age (35+)');
      recommendations.push('Consider fertility consultation');
    }
    
    // Condition-based risks
    if (userData.conditions?.includes('PCOS')) {
      riskScore += 25;
      riskFactors.push('PCOS diagnosis');
      recommendations.push('Monitor insulin resistance, regular glucose testing');
    }
    
    if (userData.conditions?.includes('Endometriosis')) {
      riskScore += 30;
      riskFactors.push('Endometriosis diagnosis');
      recommendations.push('Regular pain monitoring, fertility assessment');
    }
    
    // Lifestyle risks
    if (userData.lifestyle?.smoking === 'Yes') {
      riskScore += 35;
      riskFactors.push('Smoking');
      recommendations.push('Smoking cessation program, fertility consultation');
    }
    
    if (userData.lifestyle?.stress === 'High') {
      riskScore += 15;
      riskFactors.push('High stress levels');
      recommendations.push('Stress management techniques, mental health support');
    }
    
    // Medication risks
    if (userData.medications?.some(med => ['anticoagulants', 'immunosuppressants'].includes(med))) {
      riskScore += 20;
      riskFactors.push('High-risk medications');
      recommendations.push('Regular monitoring, specialist consultation');
    }
    
    return {
      score: Math.min(riskScore, 100),
      level: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High',
      factors: riskFactors,
      recommendations: recommendations
    };
  },
  
  // Pregnancy-specific risk assessment
  calculatePregnancyRisk: (userData) => {
    let riskScore = 0;
    let riskFactors = [];
    let monitoring = [];
    
    // Age risks
    if (userData.age >= 35) {
      riskScore += 25;
      riskFactors.push('Advanced maternal age');
      monitoring.push('Enhanced ultrasound screening, genetic counseling');
    }
    
    if (userData.age >= 40) {
      riskScore += 35;
      riskFactors.push('Very advanced maternal age');
      monitoring.push('High-risk pregnancy care, frequent monitoring');
    }
    
    // Medical condition risks
    if (userData.conditions?.includes('PCOS')) {
      riskScore += 20;
      riskFactors.push('PCOS');
      monitoring.push('Gestational diabetes screening, blood pressure monitoring');
    }
    
    if (userData.conditions?.includes('Endometriosis')) {
      riskScore += 15;
      riskFactors.push('Endometriosis');
      monitoring.push('Placenta monitoring, preterm labor assessment');
    }
    
    // Previous pregnancy risks
    if (userData.pregnancyHistory?.previousLosses > 0) {
      riskScore += 30;
      riskFactors.push('Previous pregnancy loss');
      monitoring.push('Early pregnancy monitoring, specialist consultation');
    }
    
    return {
      score: Math.min(riskScore, 100),
      level: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High',
      factors: riskFactors,
      monitoring: monitoring
    };
  }
};

// ===== TREATMENT RECOMMENDATIONS =====
export const TREATMENT_RECOMMENDATIONS = {
  // Generate personalized treatment recommendations
  generateRecommendations: (userData) => {
    let recommendations = [];
    let priorities = [];
    
    // Condition-specific recommendations
    if (userData.conditions?.includes('PCOS')) {
      recommendations.push({
        condition: 'PCOS',
        priority: 'High',
        actions: [
          'Schedule glucose and insulin testing',
          'Implement low-glycemic diet',
          'Start regular exercise program',
          'Consider metformin if insulin resistant'
        ],
        monitoring: ['Blood sugar levels', 'Weight changes', 'Cycle regularity'],
        timeline: 'Immediate action required'
      });
      priorities.push('PCOS Management');
    }
    
    if (userData.conditions?.includes('Endometriosis')) {
      recommendations.push({
        condition: 'Endometriosis',
        priority: 'High',
        actions: [
          'Schedule pain assessment',
          'Consider hormone therapy',
          'Implement anti-inflammatory diet',
          'Pain management consultation'
        ],
        monitoring: ['Pain levels', 'Cycle symptoms', 'Quality of life'],
        timeline: 'Within 2 weeks'
      });
      priorities.push('Pain Management');
    }
    
    // Lifestyle recommendations
    if (userData.lifestyle?.stress === 'High') {
      recommendations.push({
        category: 'Stress Management',
        priority: 'Medium',
        actions: [
          'Start daily meditation practice',
          'Schedule therapy sessions',
          'Implement stress reduction techniques',
          'Prioritize sleep hygiene'
        ],
        monitoring: ['Stress levels', 'Sleep quality', 'Mood changes'],
        timeline: 'Within 1 month'
      });
    }
    
    return {
      recommendations: recommendations,
      priorities: priorities,
      nextSteps: recommendations.map(rec => rec.actions[0])
    };
  }
};

// ===== AFAB-SPECIFIC CLINICAL RULES =====
export const AFAB_CLINICAL_RULES = {
  // Cycle-related rules
  cycleRules: {
    irregularCycles: {
      condition: 'Irregular cycles',
      criteria: 'Cycle length varies by more than 7 days',
      riskFactors: ['PCOS', 'thyroid_disorders', 'stress', 'weight_changes'],
      recommendations: ['hormone_testing', 'thyroid_function', 'stress_management'],
      urgency: 'medium'
    },
    
    heavyBleeding: {
      condition: 'Heavy menstrual bleeding',
      criteria: 'Soaking through pad/tampon every 2 hours or less',
      riskFactors: ['fibroids', 'adenomyosis', 'hormonal_imbalance', 'bleeding_disorders'],
      recommendations: ['iron_levels', 'ultrasound', 'hormone_testing'],
      urgency: 'high'
    },
    
    severeCramps: {
      condition: 'Severe menstrual cramps',
      criteria: 'Pain that interferes with daily activities',
      riskFactors: ['endometriosis', 'adenomyosis', 'fibroids', 'pelvic_inflammatory_disease'],
      recommendations: ['pain_assessment', 'ultrasound', 'laparoscopy_consideration'],
      urgency: 'medium'
    },
    
    missedPeriods: {
      condition: 'Missed periods',
      criteria: 'No period for 3+ months (not pregnant)',
      riskFactors: ['PCOS', 'thyroid_disorders', 'stress', 'eating_disorders'],
      recommendations: ['pregnancy_test', 'hormone_testing', 'thyroid_function'],
      urgency: 'high'
    }
  },
  
  // Fertility-related rules
  fertilityRules: {
    ttcOver35: {
      condition: 'Trying to conceive over 35',
      criteria: 'Age 35+ and actively trying to conceive',
      riskFactors: ['advanced_maternal_age', 'decreased_fertility', 'chromosomal_abnormalities'],
      recommendations: ['fertility_evaluation', 'genetic_counseling', 'enhanced_monitoring'],
      urgency: 'medium'
    },
    
    ttcOver40: {
      condition: 'Trying to conceive over 40',
      criteria: 'Age 40+ and actively trying to conceive',
      riskFactors: ['very_advanced_maternal_age', 'significantly_decreased_fertility'],
      recommendations: ['immediate_fertility_evaluation', 'genetic_counseling', 'fertility_treatment_consideration'],
      urgency: 'high'
    },
    
    irregularOvulation: {
      condition: 'Irregular ovulation',
      criteria: 'Inconsistent ovulation patterns',
      riskFactors: ['PCOS', 'thyroid_disorders', 'stress', 'weight_issues'],
      recommendations: ['ovulation_tracking', 'hormone_testing', 'lifestyle_modifications'],
      urgency: 'medium'
    }
  },
  
  // Pregnancy-related rules
  pregnancyRules: {
    highRiskPregnancy: {
      condition: 'High-risk pregnancy',
      criteria: 'Age 35+, medical conditions, or pregnancy complications',
      riskFactors: ['advanced_maternal_age', 'PCOS', 'endometriosis', 'diabetes', 'hypertension'],
      recommendations: ['high_risk_obstetrician', 'enhanced_monitoring', 'genetic_counseling'],
      urgency: 'high'
    },
    
    gestationalDiabetes: {
      condition: 'Gestational diabetes risk',
      criteria: 'PCOS, family history, or previous gestational diabetes',
      riskFactors: ['PCOS', 'family_history_diabetes', 'previous_gestational_diabetes', 'obesity'],
      recommendations: ['early_glucose_screening', 'diet_counseling', 'blood_sugar_monitoring'],
      urgency: 'medium'
    },
    
    preeclampsia: {
      condition: 'Preeclampsia risk',
      criteria: 'Previous preeclampsia, chronic hypertension, or other risk factors',
      riskFactors: ['previous_preeclampsia', 'chronic_hypertension', 'diabetes', 'kidney_disease'],
      recommendations: ['blood_pressure_monitoring', 'protein_screening', 'enhanced_monitoring'],
      urgency: 'high'
    }
  },
  
  // Menopause-related rules
  menopauseRules: {
    earlyMenopause: {
      condition: 'Early menopause',
      criteria: 'Menopause before age 40',
      riskFactors: ['genetic_factors', 'autoimmune_conditions', 'surgical_menopause'],
      recommendations: ['hormone_replacement_therapy', 'bone_density_testing', 'cardiovascular_monitoring'],
      urgency: 'high'
    },
    
    severeMenopauseSymptoms: {
      condition: 'Severe menopause symptoms',
      criteria: 'Severe hot flashes, night sweats, or mood changes',
      riskFactors: ['rapid_hormone_decline', 'stress', 'lifestyle_factors'],
      recommendations: ['hormone_replacement_therapy', 'symptom_management', 'lifestyle_modifications'],
      urgency: 'medium'
    },
    
    osteoporosisRisk: {
      condition: 'Osteoporosis risk',
      criteria: 'Post-menopause, family history, or other risk factors',
      riskFactors: ['post_menopause', 'family_history', 'low_calcium_intake', 'sedentary_lifestyle'],
      recommendations: ['bone_density_testing', 'calcium_supplementation', 'weight_bearing_exercise'],
      urgency: 'medium'
    }
  },
  
  // Condition-specific rules
  conditionRules: {
    PCOS: {
      condition: 'PCOS management',
      criteria: 'Diagnosed PCOS or suspected based on symptoms',
      riskFactors: ['insulin_resistance', 'weight_gain', 'irregular_cycles', 'infertility'],
      recommendations: ['glucose_testing', 'insulin_testing', 'weight_management', 'metformin_consideration'],
      urgency: 'medium'
    },
    
    endometriosis: {
      condition: 'Endometriosis management',
      criteria: 'Diagnosed endometriosis or suspected based on symptoms',
      riskFactors: ['severe_pain', 'infertility', 'adhesions', 'ovarian_cysts'],
      recommendations: ['pain_management', 'hormone_therapy', 'surgical_consideration', 'fertility_preservation'],
      urgency: 'medium'
    },
    
    fibroids: {
      condition: 'Fibroid management',
      criteria: 'Diagnosed fibroids or suspected based on symptoms',
      riskFactors: ['heavy_bleeding', 'pelvic_pressure', 'infertility', 'pregnancy_complications'],
      recommendations: ['ultrasound_monitoring', 'symptom_management', 'surgical_consideration'],
      urgency: 'medium'
    }
  }
};

// ===== AFAB SCREENING PROTOCOLS =====
export const AFAB_SCREENING_PROTOCOLS = {
  // Age-based screening schedules
  ageBased: {
    '13-17': {
      screenings: ['annual_physical', 'puberty_assessment', 'nutrition_evaluation'],
      frequency: 'annual',
      notes: 'Focus on puberty development and cycle establishment'
    },
    
    '18-20': {
      screenings: ['annual_physical', 'STI_testing', 'contraception_counseling'],
      frequency: 'annual',
      notes: 'Focus on sexual health and contraception'
    },
    
    '21-29': {
      screenings: ['pap_smear_every_3_years', 'annual_physical', 'STI_testing'],
      frequency: 'pap_smear_every_3_years',
      notes: 'Begin cervical cancer screening'
    },
    
    '30-65': {
      screenings: ['pap_smear_every_3_years', 'HPV_testing_every_5_years', 'annual_physical'],
      frequency: 'pap_smear_every_3_years',
      notes: 'Continue cervical cancer screening with HPV testing'
    },
    
    '40+': {
      screenings: ['mammogram_every_1_2_years', 'annual_physical', 'blood_pressure'],
      frequency: 'mammogram_every_1_2_years',
      notes: 'Begin breast cancer screening'
    },
    
    '50+': {
      screenings: ['colonoscopy_every_10_years', 'bone_density_test', 'annual_physical'],
      frequency: 'colonoscopy_every_10_years',
      notes: 'Begin colorectal cancer screening and bone health monitoring'
    },
    
    '65+': {
      screenings: ['annual_health_assessment', 'fall_risk_assessment', 'cognitive_screening'],
      frequency: 'annual',
      notes: 'Comprehensive geriatric assessment'
    }
  },
  
  // Condition-specific screening
  conditionSpecific: {
    PCOS: {
      screenings: ['glucose_test', 'insulin_test', 'lipid_panel', 'ultrasound'],
      frequency: 'annual',
      notes: 'Monitor for diabetes and cardiovascular risk'
    },
    
    endometriosis: {
      screenings: ['ultrasound', 'MRI', 'CA125_test'],
      frequency: 'as_needed',
      notes: 'Monitor for progression and complications'
    },
    
    fibroids: {
      screenings: ['ultrasound', 'MRI'],
      frequency: 'annual',
      notes: 'Monitor size and symptoms'
    },
    
    pregnancy: {
      screenings: ['prenatal_vitamins', 'ultrasound', 'blood_tests', 'glucose_screening'],
      frequency: 'monthly',
      notes: 'Comprehensive prenatal care'
    }
  }
};

// ===== AFAB MEDICATION RULES =====
export const AFAB_MEDICATION_RULES = {
  // Birth control rules
  birthControl: {
    contraindications: {
      smoking_over_35: {
        condition: 'Smoking and age 35+',
        risk: 'Increased risk of blood clots and stroke',
        recommendation: 'Consider non-hormonal methods or smoking cessation'
      },
      
      hypertension: {
        condition: 'High blood pressure',
        risk: 'Increased cardiovascular risk',
        recommendation: 'Consider non-hormonal methods or blood pressure control'
      },
      
      migraines_with_aura: {
        condition: 'Migraines with aura',
        risk: 'Increased stroke risk',
        recommendation: 'Avoid estrogen-containing methods'
      }
    },
    
    sideEffects: {
      breakthrough_bleeding: {
        symptom: 'Breakthrough bleeding',
        duration: '3-6 months',
        action: 'Continue method, bleeding should improve',
        concern: 'If persistent beyond 6 months, consider method change'
      },
      
      mood_changes: {
        symptom: 'Mood changes or depression',
        duration: '1-3 months',
        action: 'Monitor mood, consider method change if severe',
        concern: 'If severe or persistent, discontinue method'
      }
    }
  },
  
  // Hormone therapy rules
  hormoneTherapy: {
    indications: {
      severe_hot_flashes: {
        condition: 'Severe hot flashes',
        recommendation: 'Consider hormone therapy if symptoms are severe',
        duration: 'Short-term use preferred'
      },
      
      early_menopause: {
        condition: 'Early menopause',
        recommendation: 'Hormone therapy until natural menopause age',
        duration: 'Until age 51-52'
      }
    },
    
    contraindications: {
      breast_cancer: {
        condition: 'History of breast cancer',
        risk: 'Increased recurrence risk',
        recommendation: 'Avoid hormone therapy'
      },
      
      blood_clots: {
        condition: 'History of blood clots',
        risk: 'Increased clotting risk',
        recommendation: 'Avoid oral hormone therapy'
      }
    }
  },
  
  // Fertility medication rules
  fertilityMedications: {
    clomiphene: {
      indication: 'Ovulation induction',
      monitoring: ['ovulation', 'ovarian_size', 'pregnancy_tests'],
      risks: ['multiple_pregnancies', 'ovarian_hyperstimulation'],
      duration: 'Maximum 6 cycles'
    },
    
    metformin: {
      indication: 'PCOS and insulin resistance',
      monitoring: ['blood_sugar', 'kidney_function', 'vitamin_b12'],
      risks: ['gastrointestinal_side_effects', 'lactic_acidosis'],
      duration: 'Long-term if effective'
    }
  }
};

export default MEDICAL_KNOWLEDGE_BASE;
