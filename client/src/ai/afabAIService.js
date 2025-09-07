// AFAB-SPECIFIC AI SERVICE
// Specialized AI service for AFAB reproductive health insights

import AIServiceManager from './aiServiceManager';

class AFABAIService extends AIServiceManager {
  constructor() {
    super();
    this.afabKnowledgeBase = this.initializeAFABKnowledgeBase();
  }

  // ===== AFAB KNOWLEDGE BASE =====
  initializeAFABKnowledgeBase() {
    return {
      // Cycle-related insights
      cycleInsights: {
        regularCycles: {
          description: "Regular cycles (21-35 days) indicate healthy reproductive function",
          recommendations: ["Continue tracking", "Maintain healthy lifestyle", "Regular screenings"]
        },
        irregularCycles: {
          description: "Irregular cycles may indicate hormonal imbalances or conditions like PCOS",
          recommendations: ["Consult healthcare provider", "Track symptoms", "Consider hormone testing"]
        },
        heavyBleeding: {
          description: "Heavy bleeding (soaking through pad/tampon every 2 hours) may indicate fibroids or other conditions",
          recommendations: ["Track bleeding patterns", "Monitor iron levels", "Consult healthcare provider"]
        },
        severeCramps: {
          description: "Severe cramps may indicate endometriosis or other conditions",
          recommendations: ["Track pain levels", "Consider pain management", "Consult healthcare provider"]
        }
      },
      
      // Fertility insights
      fertilityInsights: {
        ovulationPrediction: {
          description: "Ovulation typically occurs 14 days before next period",
          recommendations: ["Track BBT", "Monitor cervical mucus", "Use ovulation tests"]
        },
        fertileWindow: {
          description: "Fertile window is 5-6 days before and including ovulation day",
          recommendations: ["Track cycle length", "Monitor symptoms", "Time intercourse appropriately"]
        },
        ttcOptimization: {
          description: "Optimizing fertility involves lifestyle, timing, and health factors",
          recommendations: ["Maintain healthy weight", "Avoid smoking/alcohol", "Manage stress", "Take prenatal vitamins"]
        }
      },
      
      // Pregnancy insights
      pregnancyInsights: {
        trimester1: {
          description: "First trimester focuses on fetal development and maternal adaptation",
          recommendations: ["Take prenatal vitamins", "Avoid harmful substances", "Manage nausea", "Get adequate rest"]
        },
        trimester2: {
          description: "Second trimester is often the most comfortable with fetal movement",
          recommendations: ["Monitor fetal movement", "Continue prenatal care", "Prepare for baby", "Maintain healthy diet"]
        },
        trimester3: {
          description: "Third trimester prepares for delivery and monitors for complications",
          recommendations: ["Track contractions", "Monitor blood pressure", "Prepare for delivery", "Watch for warning signs"]
        }
      },
      
      // Menopause insights
      menopauseInsights: {
        perimenopause: {
          description: "Perimenopause is the transition period before menopause",
          recommendations: ["Track symptoms", "Consider hormone therapy", "Maintain bone health", "Manage stress"]
        },
        menopause: {
          description: "Menopause is confirmed after 12 months without periods",
          recommendations: ["Focus on long-term health", "Prevent osteoporosis", "Maintain heart health", "Consider hormone therapy"]
        }
      }
    };
  }

  // ===== CYCLE ANALYSIS =====
  async generateCycleInsights(cycleData, userProfile) {
    const prompt = this.buildCyclePrompt(cycleData, userProfile);
    try {
      const insights = await this.generateHealthInsights(prompt);
      return this.processCycleInsights(insights, cycleData, userProfile);
    } catch (error) {
      console.error('Error generating cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  buildCyclePrompt(cycleData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    const lifestyle = userProfile.lifestyle;
    
    return `
    AFAB Cycle Analysis Request:
    
    User Profile:
    - Age: ${age} years old
    - Medical Conditions: ${conditions.join(', ') || 'None reported'}
    - Family History: ${familyHistory.join(', ') || 'None reported'}
    - Lifestyle: ${lifestyle?.exercise?.frequency || 'Not specified'} exercise, ${lifestyle?.stress?.level || 'Not specified'} stress
    - Former smoker: ${userProfile.tobaccoUse || 'No'}
    
    Current Cycle Data:
    - Cycle Day: ${cycleData.currentDay || 'Unknown'}
    - Flow Intensity: ${cycleData.flow || 'Not specified'}
    - Symptoms: ${cycleData.symptoms?.join(', ') || 'None reported'}
    - Mood: ${cycleData.mood || 'Not specified'}
    - Energy Level: ${cycleData.energy || 'Not specified'}
    - Sleep Quality: ${cycleData.sleep || 'Not specified'}
    
    Cycle History:
    - Average Cycle Length: ${cycleData.averageLength || 'Unknown'} days
    - Is Regular: ${cycleData.isRegular ? 'Yes' : 'No'}
    - Last Period: ${cycleData.lastPeriod || 'Unknown'}
    
    Please provide:
    1. Cycle pattern analysis and insights
    2. Symptom correlation analysis
    3. Personalized recommendations based on medical history
    4. Any concerning patterns that need medical attention
    5. Lifestyle optimization suggestions
    
    Focus on evidence-based medical insights and personalized recommendations.
    `;
  }

  processCycleInsights(insights, cycleData, userProfile) {
    return {
      cycleAnalysis: {
        pattern: this.analyzeCyclePattern(cycleData),
        regularity: this.assessCycleRegularity(cycleData),
        symptoms: this.analyzeCycleSymptoms(cycleData),
        recommendations: this.generateCycleRecommendations(cycleData, userProfile)
      },
      aiInsights: insights,
      medicalAlerts: this.generateCycleAlerts(cycleData, userProfile),
      personalizedTips: this.generateCycleTips(cycleData, userProfile)
    };
  }

  analyzeCyclePattern(cycleData) {
    if (!cycleData.averageLength) return 'Unknown pattern';
    
    if (cycleData.averageLength < 21) return 'Short cycles (may indicate hormonal imbalance)';
    if (cycleData.averageLength > 35) return 'Long cycles (may indicate PCOS or other conditions)';
    if (cycleData.averageLength >= 21 && cycleData.averageLength <= 35) return 'Normal cycle length';
    
    return 'Irregular pattern detected';
  }

  assessCycleRegularity(cycleData) {
    if (cycleData.isRegular === true) return 'Regular cycles - good reproductive health indicator';
    if (cycleData.isRegular === false) return 'Irregular cycles - may need medical evaluation';
    return 'Cycle regularity unknown - continue tracking';
  }

  analyzeCycleSymptoms(cycleData) {
    const symptoms = cycleData.symptoms || [];
    const analysis = [];
    
    if (symptoms.includes('severe_cramps')) {
      analysis.push('Severe cramps may indicate endometriosis or other conditions');
    }
    if (symptoms.includes('heavy_bleeding')) {
      analysis.push('Heavy bleeding may indicate fibroids or hormonal imbalance');
    }
    if (symptoms.includes('mood_swings')) {
      analysis.push('Mood changes are common but severe changes may need attention');
    }
    
    return analysis.length > 0 ? analysis : ['No concerning symptoms detected'];
  }

  generateCycleRecommendations(cycleData, userProfile) {
    const recommendations = [];
    
    // Age-based recommendations
    if (userProfile.age < 18) {
      recommendations.push('Continue tracking to establish pattern');
      recommendations.push('Irregular cycles are normal in teens');
    } else if (userProfile.age > 35) {
      recommendations.push('Consider fertility assessment if trying to conceive');
      recommendations.push('Monitor for perimenopause symptoms');
    }
    
    // Condition-based recommendations
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      recommendations.push('Monitor insulin resistance');
      recommendations.push('Consider metformin if prescribed');
      recommendations.push('Maintain healthy weight');
    }
    
    if (userProfile.conditions?.reproductive?.includes('Endometriosis')) {
      recommendations.push('Track pain patterns');
      recommendations.push('Consider pain management strategies');
      recommendations.push('Monitor for fertility impact');
    }
    
    // Lifestyle recommendations
    if (userProfile.lifestyle?.stress?.level === 'High') {
      recommendations.push('Stress management may improve cycle regularity');
      recommendations.push('Consider meditation or therapy');
    }
    
    if (userProfile.tobaccoUse === 'Yes') {
      recommendations.push('Smoking cessation may improve cycle health');
      recommendations.push('Consider smoking cessation support');
    }
    
    return recommendations;
  }

  generateCycleAlerts(cycleData, userProfile) {
    const alerts = [];
    
    // Heavy bleeding alert
    if (cycleData.flow === 'heavy') {
      alerts.push({
        type: 'warning',
        message: 'Heavy bleeding detected - consider consulting healthcare provider',
        priority: 'medium'
      });
    }
    
    // Severe cramps alert
    if (cycleData.symptoms?.includes('severe_cramps')) {
      alerts.push({
        type: 'warning',
        message: 'Severe cramps may indicate endometriosis - consider medical evaluation',
        priority: 'high'
      });
    }
    
    // Irregular cycles alert
    if (cycleData.isRegular === false && userProfile.age > 18) {
      alerts.push({
        type: 'info',
        message: 'Irregular cycles may indicate hormonal imbalance - consider hormone testing',
        priority: 'medium'
      });
    }
    
    return alerts;
  }

  generateCycleTips(cycleData, userProfile) {
    const tips = [];
    
    // General cycle tips
    tips.push('Track symptoms daily for better pattern recognition');
    tips.push('Maintain consistent sleep schedule for hormone regulation');
    tips.push('Stay hydrated and eat balanced meals');
    
    // Condition-specific tips
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      tips.push('Low-glycemic diet may help with PCOS symptoms');
      tips.push('Regular exercise can improve insulin sensitivity');
    }
    
    if (userProfile.conditions?.reproductive?.includes('Endometriosis')) {
      tips.push('Heat therapy may help with pain management');
      tips.push('Anti-inflammatory diet may reduce symptoms');
    }
    
    return tips;
  }

  getFallbackCycleInsights(cycleData, userProfile) {
    return {
      cycleAnalysis: {
        pattern: 'Unable to analyze - continue tracking',
        regularity: 'Continue monitoring cycle patterns',
        symptoms: ['Continue tracking symptoms for pattern recognition'],
        recommendations: ['Maintain healthy lifestyle', 'Continue tracking', 'Consult healthcare provider if concerned']
      },
      aiInsights: 'AI service temporarily unavailable - using fallback insights',
      medicalAlerts: [],
      personalizedTips: ['Continue tracking your cycle', 'Maintain healthy lifestyle', 'Consult healthcare provider if needed']
    };
  }

  // ===== FERTILITY ANALYSIS =====
  async generateFertilityInsights(fertilityData, userProfile) {
    const prompt = this.buildFertilityPrompt(fertilityData, userProfile);
    try {
      const insights = await this.generateHealthInsights(prompt);
      return this.processFertilityInsights(insights, fertilityData, userProfile);
    } catch (error) {
      console.error('Error generating fertility insights:', error);
      return this.getFallbackFertilityInsights(fertilityData, userProfile);
    }
  }

  buildFertilityPrompt(fertilityData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    
    return `
    AFAB Fertility Analysis Request:
    
    User Profile:
    - Age: ${age} years old
    - Medical Conditions: ${conditions.join(', ') || 'None reported'}
    - Family History: ${familyHistory.join(', ') || 'None reported'}
    - Former smoker: ${userProfile.tobaccoUse || 'No'}
    
    Fertility Data:
    - Trying to Conceive: ${fertilityData.isTryingToConceive ? 'Yes' : 'No'}
    - Contraception Method: ${fertilityData.contraceptionMethod || 'None'}
    - Ovulation Tracking: ${fertilityData.ovulationTracking ? 'Yes' : 'No'}
    - Fertility Window: ${fertilityData.fertilityWindow || 'Unknown'}
    
    Cycle Data:
    - Average Cycle Length: ${fertilityData.averageLength || 'Unknown'} days
    - Is Regular: ${fertilityData.isRegular ? 'Yes' : 'No'}
    - Last Period: ${fertilityData.lastPeriod || 'Unknown'}
    
    Please provide:
    1. Fertility assessment based on age and health factors
    2. Ovulation prediction and timing recommendations
    3. Lifestyle optimization for fertility
    4. Medical considerations and screening recommendations
    5. Timeline expectations for conception
    
    Focus on evidence-based fertility insights and personalized recommendations.
    `;
  }

  processFertilityInsights(insights, fertilityData, userProfile) {
    return {
      fertilityAssessment: {
        ageFactor: this.assessAgeFertility(userProfile.age),
        healthFactors: this.assessHealthFertility(userProfile),
        cycleFactors: this.assessCycleFertility(fertilityData),
        recommendations: this.generateFertilityRecommendations(fertilityData, userProfile)
      },
      aiInsights: insights,
      ovulationPrediction: this.predictOvulation(fertilityData),
      conceptionTimeline: this.estimateConceptionTimeline(userProfile),
      medicalAlerts: this.generateFertilityAlerts(fertilityData, userProfile)
    };
  }

  assessAgeFertility(age) {
    if (age < 25) return 'Peak fertility - excellent chances of conception';
    if (age < 30) return 'High fertility - good chances of conception';
    if (age < 35) return 'Good fertility - conception likely within 6-12 months';
    if (age < 40) return 'Declining fertility - may take longer to conceive';
    if (age < 45) return 'Low fertility - consider fertility evaluation';
    return 'Very low fertility - fertility treatment may be needed';
  }

  assessHealthFertility(userProfile) {
    const factors = [];
    
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      factors.push('PCOS may affect ovulation and fertility');
    }
    
    if (userProfile.conditions?.reproductive?.includes('Endometriosis')) {
      factors.push('Endometriosis may affect fertility');
    }
    
    if (userProfile.tobaccoUse === 'Yes') {
      factors.push('Smoking significantly reduces fertility');
    }
    
    if (userProfile.lifestyle?.stress?.level === 'High') {
      factors.push('High stress may affect fertility');
    }
    
    return factors.length > 0 ? factors : ['No major health factors affecting fertility'];
  }

  assessCycleFertility(fertilityData) {
    if (fertilityData.isRegular) {
      return 'Regular cycles support good fertility';
    } else {
      return 'Irregular cycles may affect fertility - consider evaluation';
    }
  }

  generateFertilityRecommendations(fertilityData, userProfile) {
    const recommendations = [];
    
    // General fertility recommendations
    recommendations.push('Take prenatal vitamins with folic acid');
    recommendations.push('Maintain healthy weight');
    recommendations.push('Avoid smoking and excessive alcohol');
    recommendations.push('Manage stress levels');
    
    // Age-specific recommendations
    if (userProfile.age > 35) {
      recommendations.push('Consider fertility evaluation after 6 months of trying');
      recommendations.push('Monitor AMH levels for ovarian reserve');
    }
    
    // Condition-specific recommendations
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      recommendations.push('Consider metformin for insulin resistance');
      recommendations.push('Weight management may improve fertility');
    }
    
    return recommendations;
  }

  predictOvulation(fertilityData) {
    if (!fertilityData.averageLength) {
      return 'Unable to predict - need cycle length data';
    }
    
    const ovulationDay = fertilityData.averageLength - 14;
    return {
      predictedDay: ovulationDay,
      fertileWindow: {
        start: ovulationDay - 5,
        end: ovulationDay + 1
      },
      confidence: fertilityData.isRegular ? 'High' : 'Medium'
    };
  }

  estimateConceptionTimeline(userProfile) {
    const age = userProfile.age;
    
    if (age < 25) return '1-3 months for healthy couples';
    if (age < 30) return '3-6 months for healthy couples';
    if (age < 35) return '6-12 months for healthy couples';
    if (age < 40) return '12-24 months for healthy couples';
    return 'May require fertility treatment - consider evaluation';
  }

  generateFertilityAlerts(fertilityData, userProfile) {
    const alerts = [];
    
    // Age-related alerts
    if (userProfile.age > 35) {
      alerts.push({
        type: 'info',
        message: 'Age 35+ - consider fertility evaluation after 6 months of trying',
        priority: 'medium'
      });
    }
    
    if (userProfile.age > 40) {
      alerts.push({
        type: 'warning',
        message: 'Age 40+ - consider immediate fertility evaluation',
        priority: 'high'
      });
    }
    
    // Health-related alerts
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      alerts.push({
        type: 'info',
        message: 'PCOS may affect fertility - consider fertility evaluation',
        priority: 'medium'
      });
    }
    
    if (userProfile.tobaccoUse === 'Yes') {
      alerts.push({
        type: 'warning',
        message: 'Smoking significantly reduces fertility - consider cessation',
        priority: 'high'
      });
    }
    
    return alerts;
  }

  getFallbackFertilityInsights(fertilityData, userProfile) {
    return {
      fertilityAssessment: {
        ageFactor: 'Continue tracking for better assessment',
        healthFactors: ['Continue monitoring health factors'],
        cycleFactors: 'Continue tracking cycle patterns',
        recommendations: ['Maintain healthy lifestyle', 'Continue tracking', 'Consider fertility evaluation if needed']
      },
      aiInsights: 'AI service temporarily unavailable - using fallback insights',
      ovulationPrediction: 'Unable to predict - continue tracking',
      conceptionTimeline: 'Continue trying and tracking',
      medicalAlerts: []
    };
  }

  // ===== PREGNANCY ANALYSIS =====
  async generatePregnancyInsights(pregnancyData, userProfile) {
    const prompt = this.buildPregnancyPrompt(pregnancyData, userProfile);
    try {
      const insights = await this.generateHealthInsights(prompt);
      return this.processPregnancyInsights(insights, pregnancyData, userProfile);
    } catch (error) {
      console.error('Error generating pregnancy insights:', error);
      return this.getFallbackPregnancyInsights(pregnancyData, userProfile);
    }
  }

  buildPregnancyPrompt(pregnancyData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    
    return `
    AFAB Pregnancy Analysis Request:
    
    User Profile:
    - Age: ${age} years old
    - Medical Conditions: ${conditions.join(', ') || 'None reported'}
    - Family History: ${familyHistory.join(', ') || 'None reported'}
    - Former smoker: ${userProfile.tobaccoUse || 'No'}
    
    Pregnancy Data:
    - Due Date: ${pregnancyData.dueDate || 'Unknown'}
    - Trimester: ${pregnancyData.trimester || 'Unknown'}
    - Pregnancy Type: ${pregnancyData.pregnancyType || 'Unknown'}
    - Complications: ${pregnancyData.complications?.join(', ') || 'None reported'}
    
    Current Symptoms:
    - Nausea: ${pregnancyData.symptoms?.nausea || 'Not reported'}
    - Fatigue: ${pregnancyData.symptoms?.fatigue || 'Not reported'}
    - Mood: ${pregnancyData.symptoms?.mood || 'Not reported'}
    - Sleep: ${pregnancyData.symptoms?.sleep || 'Not reported'}
    
    Please provide:
    1. Trimester-specific insights and recommendations
    2. Symptom management strategies
    3. Risk assessment based on age and health factors
    4. Prenatal care recommendations
    5. Warning signs to watch for
    
    Focus on evidence-based pregnancy insights and personalized recommendations.
    `;
  }

  processPregnancyInsights(insights, pregnancyData, userProfile) {
    return {
      pregnancyAssessment: {
        trimester: this.assessTrimester(pregnancyData.trimester),
        riskLevel: this.assessPregnancyRisk(userProfile, pregnancyData),
        symptoms: this.assessPregnancySymptoms(pregnancyData.symptoms),
        recommendations: this.generatePregnancyRecommendations(pregnancyData, userProfile)
      },
      aiInsights: insights,
      weeklyProgress: this.getWeeklyProgress(pregnancyData),
      medicalAlerts: this.generatePregnancyAlerts(pregnancyData, userProfile),
      preparationTips: this.generatePregnancyTips(pregnancyData, userProfile)
    };
  }

  assessTrimester(trimester) {
    switch (trimester) {
      case 1: return 'First trimester - focus on fetal development and maternal adaptation';
      case 2: return 'Second trimester - often the most comfortable period';
      case 3: return 'Third trimester - preparation for delivery';
      default: return 'Trimester unknown - continue prenatal care';
    }
  }

  assessPregnancyRisk(userProfile, pregnancyData) {
    let riskLevel = 'Low';
    const riskFactors = [];
    
    // Age-related risks
    if (userProfile.age >= 35) {
      riskLevel = 'Medium';
      riskFactors.push('Advanced maternal age');
    }
    
    if (userProfile.age >= 40) {
      riskLevel = 'High';
      riskFactors.push('Very advanced maternal age');
    }
    
    // Medical condition risks
    if (userProfile.conditions?.reproductive?.includes('PCOS')) {
      riskLevel = 'Medium';
      riskFactors.push('PCOS');
    }
    
    if (userProfile.conditions?.reproductive?.includes('Endometriosis')) {
      riskLevel = 'Medium';
      riskFactors.push('Endometriosis');
    }
    
    // Lifestyle risks
    if (userProfile.tobaccoUse === 'Yes') {
      riskLevel = 'High';
      riskFactors.push('Smoking history');
    }
    
    return {
      level: riskLevel,
      factors: riskFactors
    };
  }

  assessPregnancySymptoms(symptoms) {
    const assessment = [];
    
    if (symptoms?.nausea === 'severe') {
      assessment.push('Severe nausea may require medical attention');
    }
    
    if (symptoms?.fatigue === 'extreme') {
      assessment.push('Extreme fatigue may indicate anemia or other conditions');
    }
    
    if (symptoms?.mood === 'depressed') {
      assessment.push('Depressed mood may indicate prenatal depression');
    }
    
    return assessment.length > 0 ? assessment : ['Symptoms within normal range'];
  }

  generatePregnancyRecommendations(pregnancyData, userProfile) {
    const recommendations = [];
    
    // General pregnancy recommendations
    recommendations.push('Take prenatal vitamins daily');
    recommendations.push('Attend all prenatal appointments');
    recommendations.push('Maintain healthy diet and exercise');
    recommendations.push('Get adequate rest and sleep');
    
    // Trimester-specific recommendations
    if (pregnancyData.trimester === 1) {
      recommendations.push('Focus on fetal development and maternal adaptation');
      recommendations.push('Manage nausea and fatigue');
      recommendations.push('Avoid harmful substances');
    } else if (pregnancyData.trimester === 2) {
      recommendations.push('Enjoy increased energy and comfort');
      recommendations.push('Monitor fetal movement');
      recommendations.push('Prepare for baby');
    } else if (pregnancyData.trimester === 3) {
      recommendations.push('Prepare for delivery');
      recommendations.push('Monitor for preterm labor signs');
      recommendations.push('Finalize birth plan');
    }
    
    // Risk-based recommendations
    if (userProfile.age >= 35) {
      recommendations.push('Consider genetic counseling');
      recommendations.push('Enhanced monitoring may be recommended');
    }
    
    return recommendations;
  }

  getWeeklyProgress(pregnancyData) {
    if (!pregnancyData.dueDate) return 'Unable to calculate - need due date';
    
    const dueDate = new Date(pregnancyData.dueDate);
    const today = new Date();
    const weeksPregnant = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24 * 7)) + 40;
    
    return {
      weeksPregnant: weeksPregnant,
      daysRemaining: Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)),
      trimester: Math.ceil(weeksPregnant / 13.3)
    };
  }

  generatePregnancyAlerts(pregnancyData, userProfile) {
    const alerts = [];
    
    // High-risk pregnancy alerts
    if (userProfile.age >= 40) {
      alerts.push({
        type: 'warning',
        message: 'High-risk pregnancy due to age - enhanced monitoring recommended',
        priority: 'high'
      });
    }
    
    // Symptom-based alerts
    if (pregnancyData.symptoms?.nausea === 'severe') {
      alerts.push({
        type: 'warning',
        message: 'Severe nausea may require medical attention',
        priority: 'medium'
      });
    }
    
    if (pregnancyData.symptoms?.mood === 'depressed') {
      alerts.push({
        type: 'warning',
        message: 'Depressed mood may indicate prenatal depression - consider support',
        priority: 'high'
      });
    }
    
    return alerts;
  }

  generatePregnancyTips(pregnancyData, userProfile) {
    const tips = [];
    
    // General pregnancy tips
    tips.push('Stay hydrated and eat small, frequent meals');
    tips.push('Get adequate rest and sleep');
    tips.push('Maintain gentle exercise routine');
    tips.push('Practice stress management techniques');
    
    // Trimester-specific tips
    if (pregnancyData.trimester === 1) {
      tips.push('Manage nausea with ginger and small meals');
      tips.push('Take prenatal vitamins with food');
      tips.push('Avoid strong smells and triggers');
    } else if (pregnancyData.trimester === 2) {
      tips.push('Enjoy increased energy and comfort');
      tips.push('Start preparing for baby');
      tips.push('Monitor fetal movement');
    } else if (pregnancyData.trimester === 3) {
      tips.push('Prepare for delivery and newborn care');
      tips.push('Monitor for preterm labor signs');
      tips.push('Finalize birth plan and hospital bag');
    }
    
    return tips;
  }

  getFallbackPregnancyInsights(pregnancyData, userProfile) {
    return {
      pregnancyAssessment: {
        trimester: 'Continue prenatal care',
        riskLevel: 'Continue monitoring',
        symptoms: ['Continue tracking symptoms'],
        recommendations: ['Continue prenatal care', 'Maintain healthy lifestyle', 'Attend all appointments']
      },
      aiInsights: 'AI service temporarily unavailable - using fallback insights',
      weeklyProgress: 'Unable to calculate - continue tracking',
      medicalAlerts: [],
      preparationTips: ['Continue prenatal care', 'Maintain healthy lifestyle', 'Prepare for delivery']
    };
  }

  // ===== MENOPAUSE ANALYSIS =====
  async generateMenopauseInsights(menopauseData, userProfile) {
    const prompt = this.buildMenopausePrompt(menopauseData, userProfile);
    try {
      const insights = await this.generateHealthInsights(prompt);
      return this.processMenopauseInsights(insights, menopauseData, userProfile);
    } catch (error) {
      console.error('Error generating menopause insights:', error);
      return this.getFallbackMenopauseInsights(menopauseData, userProfile);
    }
  }

  buildMenopausePrompt(menopauseData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    
    return `
    AFAB Menopause Analysis Request:
    
    User Profile:
    - Age: ${age} years old
    - Medical Conditions: ${conditions.join(', ') || 'None reported'}
    - Family History: ${familyHistory.join(', ') || 'None reported'}
    - Former smoker: ${userProfile.tobaccoUse || 'No'}
    
    Menopause Data:
    - Menopause Type: ${menopauseData.menopauseType || 'Unknown'}
    - Is In Menopause: ${menopauseData.isInMenopause ? 'Yes' : 'No'}
    - Hormone Therapy: ${menopauseData.hormoneTherapy?.isOnHRT ? 'Yes' : 'No'}
    
    Current Symptoms:
    - Hot Flashes: ${menopauseData.symptoms?.hotFlashes || 'Not reported'}
    - Night Sweats: ${menopauseData.symptoms?.nightSweats || 'Not reported'}
    - Mood Changes: ${menopauseData.symptoms?.moodChanges || 'Not reported'}
    - Sleep Disruption: ${menopauseData.symptoms?.sleepDisruption || 'Not reported'}
    
    Please provide:
    1. Menopause stage assessment and insights
    2. Symptom management strategies
    3. Hormone therapy considerations
    4. Long-term health recommendations
    5. Bone and heart health focus
    
    Focus on evidence-based menopause insights and personalized recommendations.
    `;
  }

  processMenopauseInsights(insights, menopauseData, userProfile) {
    return {
      menopauseAssessment: {
        stage: this.assessMenopauseStage(menopauseData, userProfile),
        symptoms: this.assessMenopauseSymptoms(menopauseData.symptoms),
        hormoneTherapy: this.assessHormoneTherapy(menopauseData.hormoneTherapy),
        recommendations: this.generateMenopauseRecommendations(menopauseData, userProfile)
      },
      aiInsights: insights,
      longTermHealth: this.assessLongTermHealth(userProfile),
      medicalAlerts: this.generateMenopauseAlerts(menopauseData, userProfile),
      managementTips: this.generateMenopauseTips(menopauseData, userProfile)
    };
  }

  assessMenopauseStage(menopauseData, userProfile) {
    if (menopauseData.isInMenopause) {
      return 'Confirmed menopause - focus on long-term health';
    } else if (userProfile.age >= 40 && userProfile.age <= 55) {
      return 'Perimenopause - transition period with symptom management';
    } else if (userProfile.age > 55) {
      return 'Post-menopause - long-term health and wellness focus';
    } else {
      return 'Pre-menopause - maintain reproductive health';
    }
  }

  assessMenopauseSymptoms(symptoms) {
    const assessment = [];
    
    if (symptoms?.hotFlashes === 'severe') {
      assessment.push('Severe hot flashes may benefit from hormone therapy');
    }
    
    if (symptoms?.nightSweats === 'severe') {
      assessment.push('Severe night sweats may affect sleep quality');
    }
    
    if (symptoms?.moodChanges === 'severe') {
      assessment.push('Severe mood changes may indicate need for support');
    }
    
    return assessment.length > 0 ? assessment : ['Symptoms within normal range'];
  }

  assessHormoneTherapy(hormoneTherapy) {
    if (hormoneTherapy?.isOnHRT) {
      return 'Currently on hormone therapy - monitor effectiveness and side effects';
    } else {
      return 'Not on hormone therapy - consider if symptoms are severe';
    }
  }

  generateMenopauseRecommendations(menopauseData, userProfile) {
    const recommendations = [];
    
    // General menopause recommendations
    recommendations.push('Maintain healthy diet and exercise');
    recommendations.push('Focus on bone health and calcium intake');
    recommendations.push('Monitor heart health and blood pressure');
    recommendations.push('Practice stress management techniques');
    
    // Symptom-specific recommendations
    if (menopauseData.symptoms?.hotFlashes === 'severe') {
      recommendations.push('Consider hormone therapy for severe hot flashes');
      recommendations.push('Dress in layers and keep cool');
    }
    
    if (menopauseData.symptoms?.sleepDisruption === 'severe') {
      recommendations.push('Practice good sleep hygiene');
      recommendations.push('Consider sleep aids if needed');
    }
    
    // Long-term health recommendations
    recommendations.push('Regular bone density testing');
    recommendations.push('Annual mammograms and health screenings');
    recommendations.push('Maintain social connections and mental health');
    
    return recommendations;
  }

  assessLongTermHealth(userProfile) {
    return {
      boneHealth: 'Focus on calcium, vitamin D, and weight-bearing exercise',
      heartHealth: 'Monitor blood pressure, cholesterol, and cardiovascular risk',
      cognitiveHealth: 'Maintain mental stimulation and social connections',
      cancerScreening: 'Regular mammograms, pap smears, and colonoscopies'
    };
  }

  generateMenopauseAlerts(menopauseData, userProfile) {
    const alerts = [];
    
    // Symptom-based alerts
    if (menopauseData.symptoms?.hotFlashes === 'severe') {
      alerts.push({
        type: 'info',
        message: 'Severe hot flashes may benefit from hormone therapy',
        priority: 'medium'
      });
    }
    
    if (menopauseData.symptoms?.moodChanges === 'severe') {
      alerts.push({
        type: 'warning',
        message: 'Severe mood changes may indicate need for mental health support',
        priority: 'high'
      });
    }
    
    // Long-term health alerts
    if (userProfile.age >= 50) {
      alerts.push({
        type: 'info',
        message: 'Age 50+ - ensure regular bone density and heart health screenings',
        priority: 'medium'
      });
    }
    
    return alerts;
  }

  generateMenopauseTips(menopauseData, userProfile) {
    const tips = [];
    
    // General menopause tips
    tips.push('Stay cool and dress in layers for hot flashes');
    tips.push('Practice relaxation techniques for stress management');
    tips.push('Maintain regular exercise routine');
    tips.push('Get adequate sleep and rest');
    
    // Symptom-specific tips
    if (menopauseData.symptoms?.hotFlashes) {
      tips.push('Keep cool with fans and cold drinks');
      tips.push('Avoid triggers like spicy foods and alcohol');
    }
    
    if (menopauseData.symptoms?.sleepDisruption) {
      tips.push('Maintain consistent sleep schedule');
      tips.push('Create cool, dark sleeping environment');
    }
    
    // Long-term health tips
    tips.push('Focus on bone health with calcium and vitamin D');
    tips.push('Maintain heart health with regular exercise');
    tips.push('Stay socially connected and mentally active');
    
    return tips;
  }

  getFallbackMenopauseInsights(menopauseData, userProfile) {
    return {
      menopauseAssessment: {
        stage: 'Continue monitoring symptoms',
        symptoms: ['Continue tracking symptoms'],
        hormoneTherapy: 'Consider if symptoms are severe',
        recommendations: ['Maintain healthy lifestyle', 'Focus on long-term health', 'Consider hormone therapy if needed']
      },
      aiInsights: 'AI service temporarily unavailable - using fallback insights',
      longTermHealth: 'Focus on bone, heart, and cognitive health',
      medicalAlerts: [],
      managementTips: ['Maintain healthy lifestyle', 'Manage symptoms', 'Focus on long-term health']
    };
  }
}

export default AFABAIService;
