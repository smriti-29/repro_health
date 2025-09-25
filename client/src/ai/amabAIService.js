// AMAB-SPECIFIC AI SERVICE
// Specialized AI service for AMAB male health insights

import AIServiceManager from './aiServiceManager';

class AMABAIService extends AIServiceManager {
  constructor() {
    super();
    this.amabKnowledgeBase = this.initializeAMABKnowledgeBase();
  }

  // ===== AMAB KNOWLEDGE BASE =====
  initializeAMABKnowledgeBase() {
    return {
      // General Health insights
      generalHealthInsights: {
        cardiovascularHealth: {
          description: "Regular cardiovascular monitoring is crucial for men's health",
          recommendations: ["Monitor blood pressure", "Track cholesterol levels", "Maintain healthy weight", "Regular exercise"]
        },
        metabolicHealth: {
          description: "Metabolic health affects energy, weight, and overall wellness",
          recommendations: ["Track blood sugar", "Monitor insulin sensitivity", "Maintain healthy diet", "Regular physical activity"]
        },
        fitnessTracking: {
          description: "Consistent fitness tracking helps optimize performance and health",
          recommendations: ["Track workout intensity", "Monitor recovery time", "Set realistic goals", "Progressive overload"]
        }
      },
      
      // Hormonal Health insights
      hormonalInsights: {
        testosteroneLevels: {
          description: "Testosterone levels naturally decline with age and affect multiple health aspects",
          recommendations: ["Monitor testosterone levels", "Track energy and mood", "Maintain healthy lifestyle", "Consider hormone testing"]
        },
        thyroidFunction: {
          description: "Thyroid function affects metabolism, energy, and overall health",
          recommendations: ["Monitor TSH levels", "Track energy patterns", "Watch for weight changes", "Regular thyroid screening"]
        },
        cortisolManagement: {
          description: "Chronic stress affects cortisol levels and overall health",
          recommendations: ["Manage stress levels", "Practice relaxation techniques", "Adequate sleep", "Regular exercise"]
        }
      },
      
      // Fertility & Reproductive Health
      fertilityInsights: {
        spermHealth: {
          description: "Sperm health affects fertility and overall reproductive wellness",
          recommendations: ["Avoid excessive heat", "Limit alcohol and smoking", "Maintain healthy weight", "Consider fertility testing"]
        },
        libidoTracking: {
          description: "Libido changes can indicate hormonal or health issues",
          recommendations: ["Track libido patterns", "Monitor relationship factors", "Consider stress levels", "Evaluate lifestyle factors"]
        },
        reproductiveHealth: {
          description: "Regular reproductive health monitoring is important for men",
          recommendations: ["Regular testicular self-exams", "Annual urological checkups", "Monitor for changes", "Early detection is key"]
        }
      },
      
      // Urology & Prostate Health
      urologyInsights: {
        prostateHealth: {
          description: "Prostate health becomes increasingly important with age",
          recommendations: ["Regular PSA testing", "Annual digital rectal exams", "Monitor urinary symptoms", "Maintain healthy lifestyle"]
        },
        urinaryHealth: {
          description: "Urinary health affects quality of life and overall wellness",
          recommendations: ["Monitor urinary patterns", "Stay hydrated", "Pelvic floor exercises", "Seek medical attention for changes"]
        },
        sexualHealth: {
          description: "Sexual health is an important indicator of overall wellness",
          recommendations: ["Open communication", "Regular checkups", "Address concerns early", "Maintain healthy lifestyle"]
        }
      },
      
      // Mental Health & Stress
      mentalHealthInsights: {
        stressManagement: {
          description: "Effective stress management is crucial for men's mental health",
          recommendations: ["Identify stress triggers", "Practice relaxation techniques", "Maintain work-life balance", "Seek support when needed"]
        },
        moodTracking: {
          description: "Mood patterns can indicate mental health status",
          recommendations: ["Track mood regularly", "Note environmental factors", "Consider therapy", "Maintain social connections"]
        },
        anxietyManagement: {
          description: "Anxiety management is important for overall well-being",
          recommendations: ["Practice mindfulness", "Regular exercise", "Limit caffeine", "Consider professional help"]
        }
      },
      
      // Bone & Muscle Health
      boneMuscleInsights: {
        boneDensity: {
          description: "Bone density monitoring is important for men's long-term health",
          recommendations: ["Weight-bearing exercise", "Adequate calcium intake", "Vitamin D supplementation", "Regular bone density testing"]
        },
        muscleHealth: {
          description: "Muscle health affects strength, metabolism, and overall wellness",
          recommendations: ["Resistance training", "Adequate protein intake", "Progressive overload", "Proper recovery"]
        },
        jointHealth: {
          description: "Joint health affects mobility and quality of life",
          recommendations: ["Low-impact exercise", "Maintain healthy weight", "Proper form", "Address pain early"]
        }
      },
      
      // Preventive Care
      preventiveInsights: {
        cancerScreening: {
          description: "Regular cancer screening is crucial for early detection",
          recommendations: ["Annual physical exams", "Age-appropriate screenings", "Know family history", "Report changes promptly"]
        },
        cardiovascularScreening: {
          description: "Cardiovascular screening helps prevent heart disease",
          recommendations: ["Regular blood pressure checks", "Cholesterol monitoring", "EKG as needed", "Lifestyle modifications"]
        },
        immunizations: {
          description: "Keeping immunizations current protects against preventable diseases",
          recommendations: ["Annual flu vaccine", "Age-appropriate vaccines", "Travel immunizations", "Stay current with boosters"]
        }
      },
      
      // Medication & Supplements
      medicationInsights: {
        medicationAdherence: {
          description: "Proper medication adherence is crucial for treatment effectiveness",
          recommendations: ["Use pill organizers", "Set reminders", "Track side effects", "Regular medication reviews"]
        },
        supplementOptimization: {
          description: "Supplements should complement a healthy diet and lifestyle",
          recommendations: ["Focus on whole foods first", "Consider deficiencies", "Avoid mega-doses", "Consult healthcare provider"]
        },
        drugInteractions: {
          description: "Understanding drug interactions prevents complications",
          recommendations: ["Keep medication list current", "Inform all providers", "Read labels carefully", "Ask about interactions"]
        }
      }
    };
  }

  // ===== CORE AI METHOD =====
  async generateInsights(prompt) {
    console.log('🔍 AMAB AI Service: generateInsights called');
    console.log('🔍 Prompt:', prompt);
    
    try {
      // Use the parent class method for real AI insights
      const result = await super.generateHealthInsights(prompt);
      console.log('🔍 AMAB AI Service: Result received:', result);
      return result;
    } catch (error) {
      console.error('🔍 AMAB AI Service: Error:', error);
      throw error;
    }
  }

  // ===== GENERAL HEALTH ANALYSIS =====
  async generateGeneralHealthInsights(healthData, userProfile) {
    const prompt = this.buildGeneralHealthPrompt(healthData, userProfile);
    try {
      console.log('🤖 Generating REAL AI insights for General Health...');
      const insights = await this.generateInsights(prompt);
      console.log('✅ Real AI insights received:', insights);
      return this.processGeneralHealthInsights(insights, healthData, userProfile);
    } catch (error) {
      console.error('❌ Error generating general health insights:', error);
      console.log('🔄 Falling back to hardcoded insights...');
      return this.getFallbackGeneralHealthInsights(healthData, userProfile);
    }
  }

  buildGeneralHealthPrompt(healthData, userProfile) {
    const latestEntry = healthData[healthData.length - 1];
    const entryCount = healthData.length;
    const age = userProfile.age || 30;
    
    return `You are a medical-grade men's health AI assistant. Provide comprehensive, clinically accurate analysis.

PATIENT PROFILE:
- Age: ${age} years old
- Medical History: ${userProfile.conditions?.general?.join(', ') || 'None reported'}
- Family History: ${userProfile.familyHistory?.mensConditions?.join(', ') || 'None reported'}
- Lifestyle: ${userProfile.lifestyle?.exercise?.frequency || 'Moderate'} exercise, ${userProfile.lifestyle?.stress?.level || 'Moderate'} stress

HEALTH DATA:
- Blood Pressure: ${latestEntry.bloodPressure || 'Not recorded'}
- Heart Rate: ${latestEntry.heartRate || 'Not recorded'}
- Weight: ${latestEntry.weight || 'Not recorded'}
- Energy Level: ${latestEntry.energyLevel || 'Not recorded'}/10
- Sleep Quality: ${latestEntry.sleepQuality || 'Not recorded'}/10
- Stress Level: ${latestEntry.stressLevel || 'Not recorded'}/10
- Exercise Frequency: ${latestEntry.exerciseFrequency || 'Not recorded'}
- Diet Quality: ${latestEntry.dietQuality || 'Not recorded'}/10
- Entries Tracked: ${entryCount}

Provide a comprehensive health analysis with these specific sections:

**HEALTH INSIGHTS** (Compassionate medical summary - ~120 words)
Write a caring, medical summary that tells the user's health story. Requirements:
- Medically accurate, evidence-based
- Respectful, empathetic, supportive
- Clear and concise (~120 words)
- Non-repetitive (do NOT restate details already shown in other cards)

Structure:
1. Opening line: acknowledge the health tracking and set a caring tone
2. Integrative summary: what this data reveals about overall health
3. Reflection on patterns and trends
4. Gentle guidance: what to focus on next (tracking, evaluation, self-care)
5. Closing line: reassurance or encouragement

Tone: calm, reassuring, professional. Avoid alarmist language, but don't minimize real risks.

**VITAL SIGNS ASSESSMENT** (For Health Patterns section)
Brief statement of key vital signs using medical terms + quick plain-English definition.
• E.g., "Blood pressure within normal range (120/80 mmHg) indicates healthy cardiovascular function."

**LIFESTYLE EVALUATION** (For Health Patterns section)
Concise review of lifestyle factors with recommendations:
• Energy levels at ${latestEntry.energyLevel || 'N/A'}/10 - ${latestEntry.energyLevel >= 7 ? 'excellent' : latestEntry.energyLevel >= 5 ? 'good' : 'needs attention'}
• Sleep quality ${latestEntry.sleepQuality || 'N/A'}/10 - ${latestEntry.sleepQuality >= 7 ? 'optimal' : latestEntry.sleepQuality >= 5 ? 'adequate' : 'requires improvement'}
• Stress management ${latestEntry.stressLevel || 'N/A'}/10 - ${latestEntry.stressLevel <= 3 ? 'well-managed' : latestEntry.stressLevel <= 6 ? 'moderate' : 'needs attention'}

**ACTION ITEM** (For Health Patterns section)
One specific, actionable recommendation based on the data:
• E.g., "Consider tracking blood pressure weekly to monitor cardiovascular trends."

**PERSONALIZED RECOMMENDATIONS** (3-4 specific, actionable items)
Based on the data patterns, provide personalized recommendations:
1. [Specific recommendation with reasoning]
2. [Specific recommendation with reasoning]
3. [Specific recommendation with reasoning]
4. [Specific recommendation with reasoning]

**RISK ASSESSMENT** (Brief, non-alarmist)
Identify any potential health risks based on the data:
• Low Risk: [Areas of good health]
• Moderate Risk: [Areas needing attention]
• High Risk: [Areas requiring medical consultation]

Output: Markdown-friendly text only, no JSON.`;
  }

  processGeneralHealthInsights(insights, healthData, userProfile) {
    return {
      insights: insights,
      patterns: this.analyzeGeneralHealthPatterns(healthData),
      recommendations: this.generateGeneralHealthRecommendations(healthData, userProfile),
      riskAssessment: this.assessGeneralHealthRisks(healthData, userProfile),
      reminders: this.generateGeneralHealthReminders(healthData, userProfile)
    };
  }

  analyzeGeneralHealthPatterns(healthData) {
    if (healthData.length < 2) return null;
    
    const patterns = {
      energyTrend: this.calculateTrend(healthData, 'energyLevel'),
      sleepTrend: this.calculateTrend(healthData, 'sleepQuality'),
      stressTrend: this.calculateTrend(healthData, 'stressLevel'),
      exerciseConsistency: this.calculateExerciseConsistency(healthData),
      weightTrend: this.calculateTrend(healthData, 'weight')
    };
    
    return patterns;
  }

  generateGeneralHealthRecommendations(healthData, userProfile) {
    const recommendations = [];
    const latest = healthData[healthData.length - 1];
    
    // Energy recommendations
    if (latest.energyLevel < 6) {
      recommendations.push({
        category: 'Energy',
        recommendation: 'Consider optimizing sleep schedule and nutrition to improve energy levels',
        priority: 'high'
      });
    }
    
    // Exercise recommendations
    if (latest.exerciseFrequency === 'none' || latest.exerciseFrequency === 'rarely') {
      recommendations.push({
        category: 'Exercise',
        recommendation: 'Start with 30 minutes of moderate exercise 3 times per week',
        priority: 'high'
      });
    }
    
    // Stress management
    if (latest.stressLevel > 6) {
      recommendations.push({
        category: 'Stress',
        recommendation: 'Implement stress management techniques like meditation or deep breathing',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  assessGeneralHealthRisks(healthData, userProfile) {
    const risks = {
      low: [],
      moderate: [],
      high: []
    };
    
    const latest = healthData[healthData.length - 1];
    
    // Low risk areas
    if (latest.energyLevel >= 7) risks.low.push('Good energy levels');
    if (latest.sleepQuality >= 7) risks.low.push('Optimal sleep quality');
    if (latest.stressLevel <= 3) risks.low.push('Well-managed stress');
    
    // Moderate risk areas
    if (latest.energyLevel >= 5 && latest.energyLevel < 7) risks.moderate.push('Energy levels could be improved');
    if (latest.sleepQuality >= 5 && latest.sleepQuality < 7) risks.moderate.push('Sleep quality needs attention');
    if (latest.stressLevel > 3 && latest.stressLevel <= 6) risks.moderate.push('Stress management could be enhanced');
    
    // High risk areas
    if (latest.energyLevel < 5) risks.high.push('Low energy levels - consider medical consultation');
    if (latest.sleepQuality < 5) risks.high.push('Poor sleep quality - may need medical evaluation');
    if (latest.stressLevel > 6) risks.high.push('High stress levels - consider professional support');
    
    return risks;
  }

  generateGeneralHealthReminders(healthData, userProfile) {
    const reminders = [];
    const latest = healthData[healthData.length - 1];
    
    // Blood pressure reminder
    if (!latest.bloodPressure) {
      reminders.push({
        type: 'measurement',
        message: 'Consider tracking blood pressure for cardiovascular monitoring',
        priority: 'medium'
      });
    }
    
    // Exercise reminder
    if (latest.exerciseFrequency === 'none' || latest.exerciseFrequency === 'rarely') {
      reminders.push({
        type: 'lifestyle',
        message: 'Regular exercise is important for overall health',
        priority: 'high'
      });
    }
    
    return reminders;
  }

  getFallbackGeneralHealthInsights(healthData, userProfile) {
    return {
      insights: "Your health tracking shows consistent monitoring of key wellness indicators. Continue tracking these important metrics to maintain optimal health and identify any patterns that may need attention.",
      patterns: null,
      recommendations: [
        {
          category: 'General',
          recommendation: 'Continue regular health monitoring',
          priority: 'medium'
        }
      ],
      riskAssessment: {
        low: ['Consistent health tracking'],
        moderate: [],
        high: []
      },
      reminders: []
    };
  }

  // ===== HORMONAL HEALTH ANALYSIS =====
  async generateHormonalInsights(hormoneData, userProfile) {
    const prompt = this.buildHormonalPrompt(hormoneData, userProfile);
    try {
      console.log('🤖 Generating REAL AI insights for Hormonal Health...');
      const insights = await this.generateInsights(prompt);
      console.log('✅ Real AI insights received:', insights);
      return this.processHormonalInsights(insights, hormoneData, userProfile);
    } catch (error) {
      console.error('❌ Error generating hormonal insights:', error);
      console.log('🔄 Falling back to hardcoded insights...');
      return this.getFallbackHormonalInsights(hormoneData, userProfile);
    }
  }

  buildHormonalPrompt(hormoneData, userProfile) {
    const latestEntry = hormoneData[hormoneData.length - 1];
    const entryCount = hormoneData.length;
    const age = userProfile.age || 30;
    
    return `You are a medical-grade men's hormonal health AI assistant. Provide comprehensive, clinically accurate analysis.

PATIENT PROFILE:
- Age: ${age} years old
- Medical History: ${userProfile.conditions?.hormonal?.join(', ') || 'None reported'}
- Family History: ${userProfile.familyHistory?.hormonalConditions?.join(', ') || 'None reported'}

HORMONAL DATA:
- Testosterone Level: ${latestEntry.testosteroneLevel || 'Not tested'}
- Energy Level: ${latestEntry.energyLevel || 'Not recorded'}/10
- Mood: ${latestEntry.mood || 'Not recorded'}/10
- Libido: ${latestEntry.libido || 'Not recorded'}/10
- Sleep Quality: ${latestEntry.sleepQuality || 'Not recorded'}/10
- Muscle Mass: ${latestEntry.muscleMass || 'Not recorded'}/10
- Body Fat: ${latestEntry.bodyFat || 'Not recorded'}%
- Stress Level: ${latestEntry.stressLevel || 'Not recorded'}/10
- Thyroid Function: ${latestEntry.thyroidFunction || 'Not tested'}
- Cortisol Level: ${latestEntry.cortisolLevel || 'Not tested'}
- Entries Tracked: ${entryCount}

Provide a comprehensive hormonal health analysis with these specific sections:

**HORMONAL INSIGHTS** (Compassionate medical summary - ~120 words)
Write a caring, medical summary focusing on hormonal health patterns. Requirements:
- Medically accurate, evidence-based
- Respectful, empathetic, supportive
- Clear and concise (~120 words)
- Focus on hormonal balance and optimization

**HORMONE ASSESSMENT** (For Hormonal Patterns section)
Brief statement of key hormonal indicators:
• Energy and mood patterns suggest ${latestEntry.energyLevel >= 7 && latestEntry.mood >= 7 ? 'optimal hormonal function' : 'potential hormonal imbalances'}
• Libido and vitality indicators show ${latestEntry.libido >= 7 ? 'healthy sexual function' : 'areas for improvement'}

**LIFESTYLE IMPACT** (For Hormonal Patterns section)
How lifestyle factors affect hormonal health:
• Sleep quality ${latestEntry.sleepQuality >= 7 ? 'supports' : 'may be impacting'} hormonal balance
• Stress levels ${latestEntry.stressLevel <= 3 ? 'are well-managed' : 'may be affecting'} cortisol and testosterone

**ACTION ITEM** (For Hormonal Patterns section)
One specific, actionable recommendation:
• E.g., "Consider comprehensive hormone panel testing to assess current levels."

**PERSONALIZED RECOMMENDATIONS** (3-4 specific, actionable items)
1. [Hormone-specific recommendation]
2. [Lifestyle optimization recommendation]
3. [Testing or monitoring recommendation]
4. [Long-term health recommendation]

**RISK ASSESSMENT** (Brief, non-alarmist)
• Low Risk: [Areas of good hormonal health]
• Moderate Risk: [Areas needing attention]
• High Risk: [Areas requiring medical consultation]

Output: Markdown-friendly text only, no JSON.`;
  }

  processHormonalInsights(insights, hormoneData, userProfile) {
    return {
      insights: insights,
      patterns: this.analyzeHormonalPatterns(hormoneData),
      recommendations: this.generateHormonalRecommendations(hormoneData, userProfile),
      riskAssessment: this.assessHormonalRisks(hormoneData, userProfile),
      reminders: this.generateHormonalReminders(hormoneData, userProfile)
    };
  }

  analyzeHormonalPatterns(hormoneData) {
    if (hormoneData.length < 2) return null;
    
    return {
      energyTrend: this.calculateTrend(hormoneData, 'energyLevel'),
      moodTrend: this.calculateTrend(hormoneData, 'mood'),
      libidoTrend: this.calculateTrend(hormoneData, 'libido'),
      sleepTrend: this.calculateTrend(hormoneData, 'sleepQuality'),
      stressTrend: this.calculateTrend(hormoneData, 'stressLevel')
    };
  }

  generateHormonalRecommendations(hormoneData, userProfile) {
    const recommendations = [];
    const latest = hormoneData[hormoneData.length - 1];
    
    // Testosterone optimization
    if (latest.energyLevel < 6 || latest.libido < 6) {
      recommendations.push({
        category: 'Testosterone',
        recommendation: 'Consider lifestyle factors that support healthy testosterone levels',
        priority: 'high'
      });
    }
    
    // Sleep optimization
    if (latest.sleepQuality < 7) {
      recommendations.push({
        category: 'Sleep',
        recommendation: 'Optimize sleep hygiene to support hormonal balance',
        priority: 'high'
      });
    }
    
    // Stress management
    if (latest.stressLevel > 6) {
      recommendations.push({
        category: 'Stress',
        recommendation: 'Implement stress reduction techniques to support hormonal health',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  assessHormonalRisks(hormoneData, userProfile) {
    const risks = {
      low: [],
      moderate: [],
      high: []
    };
    
    const latest = hormoneData[hormoneData.length - 1];
    
    // Low risk areas
    if (latest.energyLevel >= 7) risks.low.push('Good energy levels');
    if (latest.mood >= 7) risks.low.push('Stable mood');
    if (latest.libido >= 7) risks.low.push('Healthy libido');
    
    // Moderate risk areas
    if (latest.energyLevel >= 5 && latest.energyLevel < 7) risks.moderate.push('Energy levels could be optimized');
    if (latest.mood >= 5 && latest.mood < 7) risks.moderate.push('Mood stability could be improved');
    if (latest.libido >= 5 && latest.libido < 7) risks.moderate.push('Libido could be enhanced');
    
    // High risk areas
    if (latest.energyLevel < 5) risks.high.push('Low energy - consider hormone testing');
    if (latest.mood < 5) risks.high.push('Mood concerns - may need medical evaluation');
    if (latest.libido < 5) risks.high.push('Low libido - consider comprehensive evaluation');
    
    return risks;
  }

  generateHormonalReminders(hormoneData, userProfile) {
    const reminders = [];
    const latest = hormoneData[hormoneData.length - 1];
    
    // Hormone testing reminder
    if (!latest.testosteroneLevel) {
      reminders.push({
        type: 'testing',
        message: 'Consider comprehensive hormone panel testing',
        priority: 'medium'
      });
    }
    
    // Sleep optimization reminder
    if (latest.sleepQuality < 7) {
      reminders.push({
        type: 'lifestyle',
        message: 'Optimize sleep to support hormonal balance',
        priority: 'high'
      });
    }
    
    return reminders;
  }

  getFallbackHormonalInsights(hormoneData, userProfile) {
    return {
      insights: "Your hormonal health tracking provides valuable insights into energy, mood, and vitality patterns. Continue monitoring these important indicators to optimize your hormonal balance and overall wellness.",
      patterns: null,
      recommendations: [
        {
          category: 'General',
          recommendation: 'Continue tracking hormonal health indicators',
          priority: 'medium'
        }
      ],
      riskAssessment: {
        low: ['Consistent hormonal tracking'],
        moderate: [],
        high: []
      },
      reminders: []
    };
  }

  // ===== UTILITY METHODS =====
  calculateTrend(data, field) {
    if (data.length < 2) return 'insufficient_data';
    
    const values = data.map(entry => entry[field]).filter(val => val !== null && val !== undefined);
    if (values.length < 2) return 'insufficient_data';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    
    if (change > 0.5) return 'improving';
    if (change < -0.5) return 'declining';
    return 'stable';
  }

  calculateExerciseConsistency(data) {
    const exerciseEntries = data.filter(entry => entry.exerciseFrequency && entry.exerciseFrequency !== 'none');
    return (exerciseEntries.length / data.length) * 100;
  }

  async generatePerformanceInsights(performanceData, userProfile) {
    try {
      const prompt = `Analyze this AMAB performance and recovery data and provide comprehensive insights:
      
      Performance Data: ${JSON.stringify(performanceData)}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide insights on:
      - Physical performance trends and optimization
      - Recovery patterns and effectiveness
      - Training load and adaptation
      - Performance factors correlation
      - Recovery method effectiveness
      - Performance predictions and recommendations
      
      Format as JSON with: insights, patterns, recommendations, recoveryOptimization, predictions`;

      const response = await this.generateInsights(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error generating performance insights:', error);
      return this.getFallbackPerformanceInsights(performanceData);
    }
  }

  getFallbackPerformanceInsights(performanceData) {
    const avgPerformance = Object.values(performanceData.physicalPerformance).reduce((a, b) => a + b, 0) / 5;
    const avgRecovery = Object.values(performanceData.recovery).reduce((a, b) => a + b, 0) / 5;
    
    return {
      insights: `Your performance tracking shows ${avgPerformance > 7 ? 'excellent' : avgPerformance > 5 ? 'good' : 'room for improvement'} physical performance with ${avgRecovery > 7 ? 'strong' : 'moderate'} recovery indicators.`,
      patterns: `Performance patterns indicate ${avgPerformance > avgRecovery ? 'higher physical output than recovery capacity' : 'balanced performance and recovery'}.`,
      recommendations: `Focus on ${avgRecovery < 6 ? 'improving recovery methods' : 'maintaining current performance levels'} and ${avgPerformance < 6 ? 'gradually increasing training intensity' : 'optimizing training efficiency'}.`,
      recoveryOptimization: `Recovery optimization suggests ${performanceData.recoveryMethods.stretching ? 'continuing' : 'adding'} stretching, ${performanceData.recoveryMethods.massage ? 'maintaining' : 'considering'} massage therapy, and ${performanceData.recoveryMethods.iceBath ? 'keeping' : 'trying'} cold therapy.`,
      predictions: `Based on current trends, expect ${avgPerformance > 7 ? 'continued high performance' : 'gradual improvement'} with proper recovery management.`
    };
  }

  // REPRODUCTIVE HEALTH GROWTH ANALYSIS
  async generateReproductiveHealthAnalysis(healthData, userProfile) {
    try {
      const prompt = `Analyze this AMAB male health data for reproductive health optimization and growth:

      Health Data: ${JSON.stringify(healthData.slice(0, 10))}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide comprehensive reproductive health analysis including:
      - Testosterone optimization strategies
      - Fertility enhancement recommendations
      - Sexual health improvements
      - Hormonal balance optimization
      - Lifestyle factors affecting reproductive health
      - Nutrition for reproductive health
      - Exercise recommendations for hormonal health
      - Stress management for reproductive wellness
      - Sleep optimization for hormone production
      - Supplement recommendations (if appropriate)
      
      Format as JSON with: analysis, testosteroneOptimization, fertilityEnhancement, sexualHealth, lifestyleRecommendations, nutritionAdvice, exerciseTips, stressManagement, sleepOptimization, supplementSuggestions, personalizedPlan`;

      const response = await this.generateInsights(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error generating reproductive health analysis:', error);
      return this.getFallbackReproductiveHealthAnalysis(healthData, userProfile);
    }
  }

  getFallbackReproductiveHealthAnalysis(healthData, userProfile) {
    const avgEnergy = healthData.reduce((sum, log) => sum + (log.energyLevel || 5), 0) / healthData.length;
    const avgSleep = healthData.reduce((sum, log) => sum + (log.sleepQuality || 5), 0) / healthData.length;
    const avgStress = healthData.reduce((sum, log) => sum + (log.stressLevel || 5), 0) / healthData.length;
    
    return {
      analysis: `Your reproductive health analysis shows ${avgEnergy > 7 ? 'excellent' : avgEnergy > 5 ? 'good' : 'room for improvement'} energy levels, which directly impacts testosterone production and overall reproductive wellness.`,
      testosteroneOptimization: `Focus on ${avgSleep < 6 ? 'improving sleep quality' : 'maintaining good sleep'} and ${avgStress > 6 ? 'reducing stress levels' : 'managing stress effectively'} to optimize testosterone production.`,
      fertilityEnhancement: `For fertility enhancement, maintain a balanced diet rich in zinc, vitamin D, and antioxidants. Regular exercise and avoiding excessive heat exposure can improve sperm quality.`,
      sexualHealth: `Sexual health optimization includes regular cardiovascular exercise, stress management, and maintaining healthy relationships.`,
      lifestyleRecommendations: [
        'Get 7-9 hours of quality sleep nightly',
        'Engage in regular strength training',
        'Manage stress through meditation or yoga',
        'Maintain a healthy weight',
        'Limit alcohol consumption',
        'Avoid smoking and excessive caffeine'
      ],
      nutritionAdvice: [
        'Consume zinc-rich foods (oysters, lean meats, nuts)',
        'Include healthy fats (avocado, olive oil, fatty fish)',
        'Eat antioxidant-rich fruits and vegetables',
        'Stay hydrated with adequate water intake',
        'Consider vitamin D supplementation if needed'
      ],
      exerciseTips: [
        'Strength training 3-4 times per week',
        'High-intensity interval training for testosterone boost',
        'Compound movements (squats, deadlifts, bench press)',
        'Cardio for cardiovascular health',
        'Avoid overtraining which can lower testosterone'
      ],
      stressManagement: [
        'Practice daily meditation or mindfulness',
        'Engage in hobbies and activities you enjoy',
        'Maintain social connections',
        'Consider therapy or counseling if needed',
        'Practice deep breathing exercises'
      ],
      sleepOptimization: [
        'Maintain consistent sleep schedule',
        'Create a dark, cool sleeping environment',
        'Avoid screens 1 hour before bed',
        'Limit caffeine after 2 PM',
        'Consider magnesium supplementation for better sleep'
      ],
      supplementSuggestions: [
        'Vitamin D3 (if deficient)',
        'Zinc (for testosterone support)',
        'Magnesium (for sleep and muscle function)',
        'Omega-3 fatty acids (for overall health)',
        'Ashwagandha (for stress and testosterone)'
      ],
      personalizedPlan: `Based on your current health metrics, focus on ${avgSleep < 6 ? 'sleep optimization' : 'maintaining good sleep habits'} and ${avgStress > 6 ? 'stress reduction' : 'stress management'} to maximize your reproductive health potential.`
    };
  }

  // PERSONALIZED LIFESTYLE ANALYSIS
  async generatePersonalizedLifestyleAnalysis(healthData, userProfile) {
    try {
      const prompt = `Create a personalized lifestyle analysis for this AMAB male user:

      Health Data: ${JSON.stringify(healthData.slice(0, 15))}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide personalized analysis including:
      - Current lifestyle assessment
      - Strengths and areas for improvement
      - Personalized recommendations based on their data
      - Goal-specific strategies
      - Risk factors and how to address them
      - Success metrics and tracking suggestions
      - Weekly action plan
      - Monthly milestones
      
      Format as JSON with: currentAssessment, strengths, improvements, personalizedRecommendations, goalStrategies, riskFactors, successMetrics, weeklyPlan, monthlyMilestones, motivationalMessage`;

      const response = await this.generateInsights(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error generating personalized lifestyle analysis:', error);
      return this.getFallbackPersonalizedAnalysis(healthData, userProfile);
    }
  }

  getFallbackPersonalizedAnalysis(healthData, userProfile) {
    const avgEnergy = healthData.reduce((sum, log) => sum + (log.energyLevel || 5), 0) / healthData.length;
    const avgSleep = healthData.reduce((sum, log) => sum + (log.sleepQuality || 5), 0) / healthData.length;
    const avgStress = healthData.reduce((sum, log) => sum + (log.stressLevel || 5), 0) / healthData.length;
    
    return {
      currentAssessment: `Your current lifestyle shows ${avgEnergy > 7 ? 'excellent' : avgEnergy > 5 ? 'good' : 'moderate'} energy levels with ${avgSleep > 7 ? 'good' : 'room for improvement in'} sleep quality and ${avgStress < 4 ? 'well-managed' : 'elevated'} stress levels.`,
      strengths: [
        avgEnergy > 7 ? 'High energy levels' : 'Consistent energy tracking',
        avgSleep > 7 ? 'Good sleep habits' : 'Sleep monitoring awareness',
        avgStress < 4 ? 'Effective stress management' : 'Stress awareness'
      ],
      improvements: [
        avgSleep < 6 ? 'Sleep quality optimization' : 'Maintain sleep quality',
        avgStress > 6 ? 'Stress reduction strategies' : 'Continue stress management',
        'Consistent exercise routine',
        'Nutrition optimization'
      ],
      personalizedRecommendations: [
        'Track your energy patterns to identify peak performance times',
        'Optimize your sleep environment for better rest',
        'Implement stress management techniques daily',
        'Create a consistent exercise schedule',
        'Focus on nutrient-dense foods for sustained energy'
      ],
      goalStrategies: [
        'Set specific, measurable health goals',
        'Break down large goals into smaller milestones',
        'Track progress weekly and adjust as needed',
        'Celebrate small wins to maintain motivation'
      ],
      riskFactors: [
        avgSleep < 6 ? 'Sleep deprivation affecting overall health' : null,
        avgStress > 6 ? 'High stress levels impacting hormone production' : null,
        'Sedentary lifestyle if not addressed',
        'Poor nutrition choices'
      ].filter(Boolean),
      successMetrics: [
        'Energy level consistency (target: 7+ daily)',
        'Sleep quality improvement (target: 8+ hours)',
        'Stress level reduction (target: <4 daily)',
        'Exercise frequency (target: 4+ times/week)',
        'Overall health score improvement'
      ],
      weeklyPlan: [
        'Monday: Strength training + nutrition planning',
        'Tuesday: Cardio + stress management practice',
        'Wednesday: Active recovery + sleep optimization',
        'Thursday: Strength training + social connection',
        'Friday: Cardio + weekend planning',
        'Saturday: Outdoor activity + relaxation',
        'Sunday: Rest + next week preparation'
      ],
      monthlyMilestones: [
        'Week 1: Establish consistent sleep schedule',
        'Week 2: Implement daily stress management',
        'Week 3: Optimize nutrition and hydration',
        'Week 4: Evaluate progress and adjust goals'
      ],
      motivationalMessage: `You're making great progress in tracking your health! Focus on ${avgSleep < 6 ? 'improving your sleep quality' : 'maintaining your good sleep habits'} and ${avgStress > 6 ? 'managing stress more effectively' : 'continuing your stress management practices'} to reach your full potential.`
    };
  }
}

export default AMABAIService;
