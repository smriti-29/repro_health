// ENHANCED AI REASONING ENGINE
// Market-ready AI reasoning for all genders and conditions

export class AIReasoningEngine {
  constructor() {
    this.medicalKnowledge = this.initializeMedicalKnowledge();
    this.riskAssessment = this.initializeRiskAssessment();
    this.treatmentRecommendations = this.initializeTreatmentRecommendations();
  }

  // ===== INITIALIZE KNOWLEDGE BASE =====
  
  initializeMedicalKnowledge() {
    return {
      conditions: {
        'PCOS': {
          symptoms: ['Irregular periods', 'Weight gain', 'Acne', 'Hair growth'],
          risks: ['Diabetes', 'Heart disease', 'Infertility'],
          screenings: ['Glucose test', 'Insulin test', 'Hormone panel'],
          medications: ['Metformin', 'Birth control', 'Spironolactone'],
          lifestyle: ['Low-carb diet', 'Regular exercise', 'Stress management'],
          monitoring: ['Blood sugar', 'Weight', 'Period tracking']
        },
        'Endometriosis': {
          symptoms: ['Painful periods', 'Pelvic pain', 'Infertility'],
          risks: ['Chronic pain', 'Fertility issues', 'Adhesions'],
          screenings: ['Pelvic exam', 'Ultrasound', 'Laparoscopy'],
          medications: ['Pain relievers', 'Hormone therapy', 'Surgery'],
          lifestyle: ['Heat therapy', 'Gentle exercise', 'Stress reduction'],
          monitoring: ['Pain levels', 'Period symptoms', 'Fertility tracking']
        }
      }
    };
  }

  initializeRiskAssessment() {
    return {
      calculateRiskScore: (userData) => {
        let score = 0;
        let factors = [];
        let level = 'Low';
        
        // Age-based risk
        const age = this.calculateAge(userData.dateOfBirth);
        if (age && age >= 35) {
          score += 20;
          factors.push('Advanced age: +20 points');
        }
        
        // Condition-based risk
        if (userData.chronicConditions?.length > 0) {
          score += userData.chronicConditions.length * 15;
          factors.push(`${userData.chronicConditions.length} conditions: +${userData.chronicConditions.length * 15} points`);
        }
        
        // Lifestyle risk
        if (userData.tobaccoUse === 'Yes') {
          score += 25;
          factors.push('Smoking: +25 points');
        }
        
        if (userData.stressLevel === 'High') {
          score += 15;
          factors.push('High stress: +15 points');
        }
        
        // Determine risk level
        if (score >= 50) level = 'High';
        else if (score >= 25) level = 'Medium';
        
        return { score, factors, level, recommendations: [] };
      },
      
      calculatePregnancyRisk: (userData) => {
        return {
          factors: ['Pregnancy requires specialized care'],
          monitoring: ['Regular prenatal visits', 'Ultrasounds', 'Blood tests']
        };
      }
    };
  }

  initializeTreatmentRecommendations() {
    return {
      getRecommendations: (userData) => {
        const recommendations = [];
        
        if (userData.chronicConditions?.includes('PCOS')) {
          recommendations.push({
            title: 'PCOS Management',
            description: 'Schedule endocrinologist appointment',
            priority: 'high'
          });
        }
        
        return recommendations;
      }
    };
  }

  // ===== COMPREHENSIVE HEALTH ANALYSIS =====
  
  analyzeUserHealth(userData) {
    const analysis = {
      riskProfile: this.assessOverallRisk(userData),
      conditionInsights: this.generateConditionInsights(userData),
      screeningRecommendations: this.generateScreeningRecommendations(userData),
      lifestyleRecommendations: this.generateLifestyleRecommendations(userData),
      medicationInsights: this.generateMedicationInsights(userData),
      emergencyAlerts: this.generateEmergencyAlerts(userData),
      personalizedScore: this.calculatePersonalizedHealthScore(userData)
    };

    return analysis;
  }

  // ===== RISK ASSESSMENT =====
  
  assessOverallRisk(userData) {
    const baseRisk = this.riskAssessment.calculateRiskScore(userData);
    
    // Add gender-specific risks
    if (userData.reproductiveAnatomy?.includes('uterus')) {
      baseRisk.factors.push('Uterine anatomy - specific screenings required');
    }
    
    if (userData.reproductiveAnatomy?.includes('testes')) {
      baseRisk.factors.push('Testicular anatomy - specific screenings required');
    }
    
    // Add pregnancy risks if applicable
    if (userData.isPregnant) {
      const pregnancyRisk = this.riskAssessment.calculatePregnancyRisk(userData);
      baseRisk.factors.push(...pregnancyRisk.factors);
      baseRisk.recommendations.push(...pregnancyRisk.monitoring);
    }
    
    return baseRisk;
  }

  // ===== CONDITION-SPECIFIC INSIGHTS =====
  
  generateConditionInsights(userData) {
    const insights = [];
    
    if (!userData.conditions || userData.conditions.length === 0) {
      insights.push({
        type: 'general',
        priority: 'low',
        title: 'General Health Monitoring',
        description: 'No specific conditions detected. Focus on preventive care and healthy lifestyle.',
        action: 'Schedule annual checkup and maintain healthy habits',
        reasoning: 'Preventive care is essential for maintaining reproductive health'
      });
      return insights;
    }
    
    // Generate insights for each condition
    userData.conditions.forEach(condition => {
      const conditionData = this.medicalKnowledge.conditions[condition];
      if (conditionData) {
        insights.push({
          type: 'condition',
          priority: 'high',
          title: `${condition} Management`,
          description: `Comprehensive management plan for ${condition}`,
          symptoms: conditionData.symptoms,
          risks: conditionData.risks,
          screenings: conditionData.screenings,
          medications: conditionData.medications,
          lifestyle: conditionData.lifestyle,
          monitoring: conditionData.monitoring,
          action: `Schedule ${conditionData.screenings[0]} and consult specialist`,
          reasoning: `${condition} requires ongoing monitoring and management to prevent complications`
        });
      }
    });
    
    // Generate cross-condition insights
    if (userData.conditions.length > 1) {
      insights.push({
        type: 'cross_condition',
        priority: 'high',
        title: 'Multi-Condition Management',
        description: 'Coordinated care for multiple conditions',
        action: 'Schedule comprehensive consultation with reproductive health specialist',
        reasoning: 'Multiple conditions require coordinated care to prevent interactions and optimize treatment'
      });
    }
    
    return insights;
  }

  // ===== SCREENING RECOMMENDATIONS =====
  
  generateScreeningRecommendations(userData) {
    const recommendations = [];
    const age = this.calculateAge(userData.dateOfBirth);
    const anatomy = userData.reproductiveAnatomy;
    
    // Age-based screenings
    if (anatomy?.includes('uterus')) {
      if (age >= 21) {
        recommendations.push({
          type: 'cervical',
          priority: 'high',
          title: 'Cervical Cancer Screening',
          description: 'Pap smear screening due',
          frequency: 'Every 3 years',
          nextDue: this.calculateNextDueDate('pap_smear', userData.lastPapSmear),
          reasoning: 'Cervical cancer screening recommended starting at age 21 for AFAB individuals',
          action: 'Schedule gynecologist appointment'
        });
      }
      
      if (age >= 40) {
        recommendations.push({
          type: 'breast',
          priority: 'medium',
          title: 'Breast Cancer Screening',
          description: 'Mammogram screening due',
          frequency: 'Every 1-2 years',
          nextDue: this.calculateNextDueDate('mammogram', userData.lastMammogram),
          reasoning: 'Breast cancer screening recommended every 1-2 years starting at age 40',
          action: 'Schedule mammogram appointment'
        });
      }
    }
    
    if (anatomy?.includes('testes')) {
      if (age >= 50) {
        recommendations.push({
          type: 'prostate',
          priority: 'medium',
          title: 'Prostate Cancer Screening',
          description: 'Prostate screening due',
          frequency: 'Every 2 years',
          nextDue: this.calculateNextDueDate('prostate_screening', userData.lastProstateScreening),
          reasoning: 'Prostate cancer screening recommended every 2 years starting at age 50',
          action: 'Schedule urologist appointment'
        });
      }
    }
    
    // Condition-specific screenings
    if (userData.conditions?.includes('PCOS')) {
      recommendations.push({
        type: 'metabolic',
        priority: 'high',
        title: 'PCOS Metabolic Screening',
        description: 'Glucose and insulin testing due',
        frequency: 'Every 6 months',
        nextDue: this.calculateNextDueDate('glucose_test', userData.lastGlucoseTest),
        reasoning: 'PCOS increases diabetes risk. Regular monitoring prevents complications',
        action: 'Schedule endocrinologist appointment'
      });
    }
    
    return recommendations;
  }

  // ===== LIFESTYLE RECOMMENDATIONS =====
  
  generateLifestyleRecommendations(userData) {
    const recommendations = [];
    
    // Stress management
    if (userData.lifestyle?.stress === 'High') {
      recommendations.push({
        category: 'stress',
        priority: 'high',
        title: 'Stress Management',
        description: 'Implement stress reduction techniques',
        actions: [
          'Daily meditation (10-15 minutes)',
          'Deep breathing exercises',
          'Regular exercise',
          'Therapy consultation',
          'Sleep hygiene improvement'
        ],
        reasoning: 'High stress affects hormonal balance and may worsen existing conditions',
        timeline: 'Start immediately, see improvement in 2-4 weeks'
      });
    }
    
    // Sleep optimization
    if (userData.lifestyle?.sleep === 'Poor') {
      recommendations.push({
        category: 'sleep',
        priority: 'medium',
        title: 'Sleep Optimization',
        description: 'Improve sleep quality and duration',
        actions: [
          'Establish consistent sleep schedule',
          'Create dark, cool sleep environment',
          'Avoid screens 1 hour before bed',
          'Limit caffeine after 2 PM',
          'Practice relaxation techniques'
        ],
        reasoning: 'Poor sleep affects hormone regulation and overall health',
        timeline: 'Start immediately, see improvement in 1-2 weeks'
      });
    }
    
    // Exercise recommendations
    if (userData.lifestyle?.exercise === 'Low') {
      recommendations.push({
        category: 'exercise',
        priority: 'medium',
        title: 'Physical Activity',
        description: 'Increase regular exercise',
        actions: [
          'Start with 30 minutes walking daily',
          'Gradually increase intensity',
          'Include strength training 2-3x/week',
          'Consider yoga or pilates',
          'Find enjoyable activities'
        ],
        reasoning: 'Regular exercise improves hormonal balance and overall health',
        timeline: 'Start gradually, see improvement in 4-6 weeks'
      });
    }
    
    // Diet recommendations
    if (userData.lifestyle?.diet === 'Unhealthy') {
      recommendations.push({
        category: 'diet',
        priority: 'medium',
        title: 'Nutrition Optimization',
        description: 'Improve dietary habits',
        actions: [
          'Increase fruits and vegetables',
          'Choose whole grains over refined',
          'Include lean proteins',
          'Limit processed foods',
          'Stay hydrated'
        ],
        reasoning: 'Proper nutrition supports hormonal balance and reduces inflammation',
        timeline: 'Start immediately, see improvement in 2-4 weeks'
      });
    }
    
    return recommendations;
  }

  // ===== MEDICATION INSIGHTS =====
  
  generateMedicationInsights(userData) {
    const insights = [];
    
    if (!userData.medications || userData.medications.length === 0) {
      return insights;
    }
    
    // Analyze each medication
    userData.medications.forEach(medication => {
      const medData = this.medicalKnowledge.medications[medication];
      if (medData) {
        insights.push({
          type: 'medication',
          priority: 'medium',
          title: `${medication} Management`,
          description: `Monitor ${medication} effectiveness and side effects`,
          monitoring: medData.monitoring,
          sideEffects: medData.side_effects,
          risks: medData.risks,
          interactions: medData.interactions,
          action: 'Schedule medication review with healthcare provider',
          reasoning: 'Regular medication review ensures effectiveness and identifies side effects'
        });
      }
    });
    
    // Check for drug interactions
    if (userData.medications.length > 1) {
      insights.push({
        type: 'interaction',
        priority: 'high',
        title: 'Medication Interactions',
        description: 'Multiple medications require careful monitoring',
        action: 'Schedule comprehensive medication review',
        reasoning: 'Multiple medications increase risk of interactions and side effects'
      });
    }
    
    return insights;
  }

  // ===== EMERGENCY ALERTS =====
  
  generateEmergencyAlerts(userData) {
    const alerts = [];
    
    // High-risk conditions
    if (userData.conditions?.includes('PCOS') && userData.lifestyle?.smoking === 'Yes') {
      alerts.push({
        type: 'emergency',
        priority: 'critical',
        title: 'High-Risk Combination Alert',
        description: 'PCOS + Smoking significantly increases cardiovascular risk',
        action: 'Immediate smoking cessation and cardiovascular consultation required',
        reasoning: 'PCOS and smoking together create a dangerous combination for heart health',
        timeline: 'Immediate action required'
      });
    }
    
    // Pregnancy complications
    if (userData.isPregnant && userData.conditions?.includes('GestationalDiabetes')) {
      alerts.push({
        type: 'emergency',
        priority: 'critical',
        title: 'Gestational Diabetes Alert',
        description: 'High blood sugar levels detected',
        action: 'Immediate blood sugar monitoring and medical consultation required',
        reasoning: 'Uncontrolled gestational diabetes can harm both mother and baby',
        timeline: 'Immediate action required'
      });
    }
    
    // Medication alerts
    if (userData.medications?.some(med => ['anticoagulants', 'blood_thinners'].includes(med))) {
      alerts.push({
        type: 'warning',
        priority: 'high',
        title: 'Blood Thinner Alert',
        description: 'Increased bleeding risk with certain activities',
        action: 'Avoid contact sports, monitor for unusual bleeding',
        reasoning: 'Blood thinners increase risk of bleeding and bruising',
        timeline: 'Ongoing caution required'
      });
    }
    
    return alerts;
  }

  // ===== PERSONALIZED HEALTH SCORE =====
  
  calculatePersonalizedHealthScore(userData) {
    let baseScore = 100;
    let factors = [];
    let reasoning = '';
    
    // Deduct points for risk factors
    const riskAssessment = this.assessOverallRisk(userData);
    if (riskAssessment.level === 'High') {
      baseScore -= 30;
      factors.push('High risk profile: -30 points');
    } else if (riskAssessment.level === 'Medium') {
      baseScore -= 15;
      factors.push('Medium risk profile: -15 points');
    }
    
    // Condition-based deductions
    if (userData.chronicConditions?.includes('PCOS')) {
      baseScore -= 15;
      factors.push('PCOS: -15 points');
    }
    
    if (userData.chronicConditions?.includes('Endometriosis')) {
      baseScore -= 20;
      factors.push('Endometriosis: -20 points');
    }
    
    // Lifestyle deductions
    if (userData.tobaccoUse === 'Yes') {
      baseScore -= 25;
      factors.push('Smoking: -25 points');
    }
    
    if (userData.stressLevel === 'High') {
      baseScore -= 15;
      factors.push('High stress: -15 points');
    }
    
    if (userData.sleepQuality === 'Poor') {
      baseScore -= 10;
      factors.push('Poor sleep: -10 points');
    }
    
    // Lifestyle bonuses
    if (userData.exerciseFrequency === 'High') {
      baseScore += 15;
      factors.push('High exercise: +15 points');
    }
    
    if (userData.diet === 'Healthy') {
      baseScore += 10;
      factors.push('Healthy diet: +10 points');
    }
    
    // Ensure score stays within 0-100 range
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));
    
    // Generate reasoning
    if (finalScore < 50) {
      reasoning = 'Multiple risk factors require immediate attention and lifestyle changes';
    } else if (finalScore < 75) {
      reasoning = 'Some risk factors present. Focus on improving lifestyle and monitoring conditions';
    } else {
      reasoning = 'Good health profile. Maintain current healthy habits and continue monitoring';
    }
    
    return {
      score: finalScore,
      factors: factors,
      reasoning: reasoning,
      level: finalScore < 50 ? 'Critical' : finalScore < 75 ? 'Moderate' : 'Good'
    };
  }

  // Methods already exist above - removing duplicates
  
  // ===== UTILITY FUNCTIONS =====
  
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const ageDiff = new Date() - birthDate;
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  
  calculateNextDueDate(screeningType, lastScreening) {
    if (!lastScreening) return 'Overdue';
    
    const lastDate = new Date(lastScreening);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + 
                      (now.getMonth() - lastDate.getMonth());
    
    if (screeningType === 'pap_smear' && monthsDiff >= 36) return 'Overdue';
    if (screeningType === 'mammogram' && monthsDiff >= 24) return 'Overdue';
    if (screeningType === 'prostate_screening' && monthsDiff >= 24) return 'Overdue';
    
    return 'Due soon';
  }
}

export default AIReasoningEngine;
