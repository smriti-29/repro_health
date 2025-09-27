// MENOPAUSE-SPECIFIC AI SERVICE
// Specialized AI service for Menopause Support insights with separate extraction

import AIServiceManager from './aiServiceManager.js';

class MenopauseAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 Menopause AI Service initialized - Live AI insights for menopause support');
  }

  // ===== MENOPAUSE ANALYSIS =====
  async generateMenopauseInsights(menopauseData, userProfile) {
    const prompt = this.buildMenopausePrompt(menopauseData, userProfile);
    try {
      console.log('🚀 MENOPAUSE: Starting AI service call...');
      console.log('🔍 MENOPAUSE: Service status:', this.getServiceStatus());
      console.log('🔍 MENOPAUSE: Prompt length:', prompt.length);
      console.log('🔍 MENOPAUSE: Using service:', this.service.constructor.name);
      
      // Use the parent class's executeWithFallback method for seamless fallback
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ MENOPAUSE: AI service returned insights:', insights);
      console.log('🔍 MENOPAUSE: Insights type:', typeof insights);
      console.log('🔍 MENOPAUSE: Insights length:', insights?.length);
      console.log('🔍 MENOPAUSE: Raw insights content:', insights?.substring(0, 200) + '...');
      
      return await this.processMenopauseInsights(insights, menopauseData, userProfile);
    } catch (error) {
      console.error('❌ MENOPAUSE: Error generating menopause insights:', error);
      console.error('❌ MENOPAUSE: Error details:', error.message);
      return this.getFallbackMenopauseInsights(menopauseData, userProfile);
    }
  }

  buildMenopausePrompt(menopauseData, userProfile) {
    const latestMenopause = menopauseData[menopauseData.length - 1];
    const age = userProfile.age || 25;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    const lifestyle = userProfile.lifestyle || {};
    
    return `You are Dr. AI, an expert in menopause and women's health during the transition years.

PATIENT PROFILE:
- Age: ${age} years old
- Medical Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Lifestyle: ${lifestyle.exercise?.frequency || 'Not specified'} exercise, ${lifestyle.stress?.level || 'Not specified'} stress level
- Tobacco Use: ${userProfile.tobaccoUse || 'No'}

CURRENT MENOPAUSE DATA:
- Last Period: ${latestMenopause.lastPeriod || 'Not specified'}
- Menopause Stage: ${latestMenopause.menopauseStage || 'pre-menopause'}
- Symptoms: ${latestMenopause.symptoms?.join(', ') || 'None reported'}
- Severity: ${latestMenopause.severity || 'mild'}
- Treatments: ${latestMenopause.treatments?.join(', ') || 'None'}
- Mood: ${latestMenopause.mood || 'neutral'}
- Sleep: ${latestMenopause.sleep || 5}/10
- Energy: ${latestMenopause.energy || 5}/10
- Notes: ${latestMenopause.notes || 'None'}

COMPREHENSIVE MENOPAUSE ASSESSMENT:
- Age at First Period: ${latestMenopause.ageAtFirstPeriod || 'Not specified'}
- Age at Last Period: ${latestMenopause.ageAtLastPeriod || 'Not specified'}
- Years Since Last Period: ${latestMenopause.yearsSinceLastPeriod || 'Not calculated'}
- Hormone Levels: ${latestMenopause.hormoneLevels || 'Not tested'}
- Bone Density: ${latestMenopause.boneDensity || 'Not tested'}
- Weight: ${latestMenopause.weight || 'Not recorded'} lbs
- Blood Pressure: ${latestMenopause.bloodPressure || 'Not recorded'}
- Heart Rate: ${latestMenopause.heartRate || 'Not recorded'}

SYMPTOM DETAILS:
- Hot Flashes: ${latestMenopause.hotFlashes || 'None'} (${latestMenopause.hotFlashFrequency || 'Not specified'} frequency)
- Night Sweats: ${latestMenopause.nightSweats || 'None'} (${latestMenopause.nightSweatFrequency || 'Not specified'} frequency)
- Sleep Disturbances: ${latestMenopause.sleepDisturbances || 'None'}
- Mood Changes: ${latestMenopause.moodChanges || 'None'}
- Vaginal Dryness: ${latestMenopause.vaginalDryness || 'None'}
- Decreased Libido: ${latestMenopause.decreasedLibido || 'None'}
- Weight Gain: ${latestMenopause.weightGain || 'None'}
- Memory Problems: ${latestMenopause.memoryProblems || 'None'}
- Anxiety: ${latestMenopause.anxiety || 'None'}
- Depression: ${latestMenopause.depression || 'None'}
- Irritability: ${latestMenopause.irritability || 'None'}
- Fatigue: ${latestMenopause.fatigue || 'None'}
- Headaches: ${latestMenopause.headaches || 'None'}
- Joint Pain: ${latestMenopause.jointPain || 'None'}
- Hair Thinning: ${latestMenopause.hairThinning || 'None'}
- Dry Skin: ${latestMenopause.drySkin || 'None'}
- Breast Tenderness: ${latestMenopause.breastTenderness || 'None'}
- Bloating: ${latestMenopause.bloating || 'None'}

LIFESTYLE & HEALTH FACTORS:
- Exercise: ${latestMenopause.exercise || 'Not specified'}
- Diet: ${latestMenopause.diet || 'Not specified'}
- Alcohol Use: ${latestMenopause.alcoholUse || 'Not specified'}
- Smoking: ${latestMenopause.smoking || 'No'}
- Stress Level: ${latestMenopause.stressLevel || 5}/10
- Sleep Quality: ${latestMenopause.sleepQuality || 5}/10
- Mental Health: ${latestMenopause.mentalHealth || 'Good'}
- Medications: ${latestMenopause.medications?.join(', ') || 'None'}
- Supplements: ${latestMenopause.supplements?.join(', ') || 'None'}
- Hormone Therapy: ${latestMenopause.hormoneTherapy || 'Not using'}

TREATMENT & MANAGEMENT:
- Current Treatments: ${latestMenopause.currentTreatments?.join(', ') || 'None'}
- Treatment Effectiveness: ${latestMenopause.treatmentEffectiveness || 'Not specified'}
- Side Effects: ${latestMenopause.sideEffects?.join(', ') || 'None'}
- Alternative Therapies: ${latestMenopause.alternativeTherapies?.join(', ') || 'None'}
- Lifestyle Modifications: ${latestMenopause.lifestyleModifications?.join(', ') || 'None'}

HISTORICAL MENOPAUSE DATA (Last 3 entries):
${menopauseData.slice(-3).map((entry, index) => `
Entry ${menopauseData.length - 2 + index}:
- Date: ${entry.date}
- Stage: ${entry.menopauseStage}
- Symptoms: ${entry.symptoms?.join(', ') || 'None'}
- Severity: ${entry.severity}
- Treatments: ${entry.treatments?.join(', ') || 'None'}
- Mood: ${entry.mood}
- Sleep: ${entry.sleep}/10
- Energy: ${entry.energy}/10
`).join('')}

ANALYSIS REQUIREMENTS:
Provide a comprehensive menopause analysis in the following EXACT format:

🌡️ **MENOPAUSE STAGE ASSESSMENT**
[Current menopause stage, progression, and transition status evaluation]

🩺 **SYMPTOM MANAGEMENT ANALYSIS**
[Detailed analysis of current symptoms, severity, and management strategies]

💊 **TREATMENT RECOMMENDATIONS**
[Specific treatment options, hormone therapy considerations, and alternative therapies]

**PERSONALIZED TIPS**
1. [Specific menopause management tip based on current stage and symptoms]
2. [Lifestyle modifications for symptom relief]
3. [Hormone therapy and treatment guidance]
4. [Long-term health considerations for menopause]

**GENTLE REMINDERS**
1. [Important menopause health screening reminder]
2. [When to contact healthcare provider]
3. [Upcoming menopause milestones and changes]
4. [Long-term health monitoring for post-menopause]

Be medically accurate, supportive, and provide specific, actionable menopause guidance. Focus on symptom management, treatment options, and overall health during this transition.`;
  }

  async processMenopauseInsights(insights, menopauseData, userProfile) {
    try {
      // This is REAL Gemini AI response - process it properly
      const textInsights = insights.toString();
      console.log('🔍 Processing REAL Gemini AI response:', textInsights.substring(0, 200) + '...');
      
      // Extract sections from the AI response
      const sections = this.extractEnhancedSections(textInsights);
      console.log('🔍 Extracted sections:', Object.keys(sections));
      
      // Create comprehensive medical analysis
      return {
        quickCheck: this.createQuickCheckSummary(sections, menopauseData),
        aiAnalysis: {
          title: "🤖 Dr. AI Menopause Analysis",
          subtitle: "Comprehensive menopause support assessment",
          content: textInsights, // Full AI response
          timestamp: new Date().toISOString()
        },
        // Extract medical insights from AI response
        riskAssessment: this.extractRiskFromSections(sections),
        recommendations: this.extractRecommendationsFromSections(sections),
        medicalAlerts: this.extractAlertsFromSections(sections),
        // Generate personalized insights based on user's actual data
        personalizedTips: await this.generateMenopausePersonalizedTips(menopauseData, userProfile),
        gentleReminders: await this.generateMenopauseGentleReminders(menopauseData, userProfile)
      };
    } catch (error) {
      console.error('Error processing menopause insights:', error);
      return this.getFallbackMenopauseInsights(menopauseData, userProfile);
    }
  }

  // ===== MENOPAUSE-SPECIFIC EXTRACTION METHODS =====
  
  extractEnhancedSections(text) {
    const sections = {};
    
    // MENOPAUSE-SPECIFIC section headers with unique patterns
    const sectionHeaders = [
      { key: 'menopauseStageAssessment', patterns: ['🌡️ **MENOPAUSE STAGE ASSESSMENT**', '## 🌡️ MENOPAUSE STAGE ASSESSMENT', '🌡️ MENOPAUSE STAGE ASSESSMENT', '🌡️ Menopause Stage Assessment'] },
      { key: 'symptomManagementAnalysis', patterns: ['🩺 **SYMPTOM MANAGEMENT ANALYSIS**', '## 🩺 SYMPTOM MANAGEMENT ANALYSIS', '🩺 SYMPTOM MANAGEMENT ANALYSIS', '🩺 Symptom Management Analysis'] },
      { key: 'treatmentRecommendations', patterns: ['💊 **TREATMENT RECOMMENDATIONS**', '## 💊 TREATMENT RECOMMENDATIONS', '💊 TREATMENT RECOMMENDATIONS', '💊 Treatment Recommendations'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 [MENOPAUSE] Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 [MENOPAUSE] Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 [MENOPAUSE] Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ [MENOPAUSE] Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
    }
    
    return sections;
  }

  extractSection(text, pattern) {
    const regex = new RegExp(`${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n\\n|\\n#|\\n\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(pattern, '').trim() : null;
  }

  createQuickCheckSummary(sections, menopauseData) {
    const latestMenopause = menopauseData[menopauseData.length - 1];
    return {
      menopauseStage: latestMenopause.menopauseStage || 'pre-menopause',
      symptoms: latestMenopause.symptoms?.length || 0,
      severity: latestMenopause.severity || 'mild',
      treatments: latestMenopause.treatments?.length || 0,
      overallHealth: this.determineOverallMenopauseHealth(sections, latestMenopause),
      nextMilestone: this.calculateNextMilestone(latestMenopause)
    };
  }

  determineOverallMenopauseHealth(sections, latestMenopause) {
    const symptoms = latestMenopause.symptoms?.length || 0;
    const severity = latestMenopause.severity || 'mild';
    
    if (symptoms === 0) return 'Good';
    if (severity === 'mild' && symptoms <= 3) return 'Fair';
    if (severity === 'moderate' || symptoms > 3) return 'Needs Attention';
    return 'Severe';
  }

  calculateNextMilestone(latestMenopause) {
    const stage = latestMenopause.menopauseStage;
    switch (stage) {
      case 'pre-menopause':
        return 'Monitor for perimenopause symptoms';
      case 'perimenopause':
        return 'Track transition to menopause';
      case 'menopause':
        return 'Focus on post-menopause health';
      case 'post-menopause':
        return 'Maintain long-term health monitoring';
      default:
        return 'Continue regular health check-ups';
    }
  }

  extractRiskFromSections(sections) {
    const menopauseStageAssessment = sections.menopauseStageAssessment || '';
    const risks = [];
    
    // Analyze actual medical data from user's submission
    if (menopauseStageAssessment.toLowerCase().includes('osteoporosis') || menopauseStageAssessment.toLowerCase().includes('bone density')) {
      risks.push('Bone density monitoring recommended');
    }
    if (menopauseStageAssessment.toLowerCase().includes('heart disease') || menopauseStageAssessment.toLowerCase().includes('cardiovascular')) {
      risks.push('Cardiovascular health monitoring needed');
    }
    if (menopauseStageAssessment.toLowerCase().includes('severe symptoms') || menopauseStageAssessment.toLowerCase().includes('debilitating')) {
      risks.push('Hormone therapy evaluation recommended');
    }
    if (menopauseStageAssessment.toLowerCase().includes('mood') || menopauseStageAssessment.toLowerCase().includes('depression')) {
      risks.push('Mental health support recommended');
    }
    if (menopauseStageAssessment.toLowerCase().includes('sleep') || menopauseStageAssessment.toLowerCase().includes('insomnia')) {
      risks.push('Sleep disorder evaluation recommended');
    }
    
    return risks;
  }

  extractRecommendationsFromSections(sections) {
    const treatmentRecommendations = sections.treatmentRecommendations || '';
    const recommendations = [];
    
    if (treatmentRecommendations.toLowerCase().includes('hormone therapy') || treatmentRecommendations.toLowerCase().includes('hrt')) {
      recommendations.push('Discuss hormone therapy options with healthcare provider');
    }
    if (treatmentRecommendations.toLowerCase().includes('lifestyle') || treatmentRecommendations.toLowerCase().includes('exercise')) {
      recommendations.push('Implement lifestyle modifications for symptom management');
    }
    if (treatmentRecommendations.toLowerCase().includes('supplements') || treatmentRecommendations.toLowerCase().includes('vitamins')) {
      recommendations.push('Consider supplements for menopause support');
    }
    if (treatmentRecommendations.toLowerCase().includes('alternative') || treatmentRecommendations.toLowerCase().includes('natural')) {
      recommendations.push('Explore alternative therapies for symptom relief');
    }
    
    return recommendations;
  }

  extractAlertsFromSections(sections) {
    const menopauseStageAssessment = sections.menopauseStageAssessment || '';
    const alerts = [];
    
    if (menopauseStageAssessment.toLowerCase().includes('urgent') || menopauseStageAssessment.toLowerCase().includes('immediate')) {
      alerts.push('Seek immediate medical attention');
    }
    if (menopauseStageAssessment.toLowerCase().includes('emergency') || menopauseStageAssessment.toLowerCase().includes('severe')) {
      alerts.push('Contact healthcare provider immediately');
    }
    
    return alerts;
  }

  async generateMenopausePersonalizedTips(menopauseData, userProfile) {
    const tips = [];
    const latestMenopause = menopauseData[menopauseData.length - 1];
    const stage = latestMenopause.menopauseStage || 'pre-menopause';
    const age = userProfile.age || 25;
    
    // Stage-specific tips
    if (stage === 'pre-menopause') {
      tips.push('Monitor for early menopause symptoms and maintain regular health check-ups');
      tips.push('Focus on bone health and cardiovascular fitness to prepare for transition');
    } else if (stage === 'perimenopause') {
      tips.push('Track symptoms and consider hormone therapy options if symptoms are severe');
      tips.push('Maintain regular exercise and stress management during this transition');
    } else if (stage === 'menopause') {
      tips.push('Focus on symptom management and long-term health maintenance');
      tips.push('Consider hormone therapy if symptoms are affecting quality of life');
    } else if (stage === 'post-menopause') {
      tips.push('Prioritize bone health, cardiovascular health, and regular screenings');
      tips.push('Maintain active lifestyle and healthy diet for long-term wellness');
    }
    
    // Symptom-specific tips
    if (latestMenopause.symptoms && latestMenopause.symptoms.length > 0) {
      if (latestMenopause.symptoms.includes('Hot flashes') || latestMenopause.symptoms.includes('Night sweats')) {
        tips.push('Dress in layers, keep bedroom cool, and avoid triggers like spicy foods and caffeine');
      }
      if (latestMenopause.symptoms.includes('Sleep disturbances')) {
        tips.push('Maintain consistent sleep schedule and create a cool, dark bedroom environment');
      }
      if (latestMenopause.symptoms.includes('Mood swings') || latestMenopause.symptoms.includes('Anxiety')) {
        tips.push('Practice stress management techniques like meditation, yoga, or deep breathing');
      }
      if (latestMenopause.symptoms.includes('Vaginal dryness')) {
        tips.push('Use vaginal moisturizers and lubricants, and discuss hormone therapy options');
      }
      if (latestMenopause.symptoms.includes('Weight gain')) {
        tips.push('Focus on regular exercise and a balanced diet to manage weight during menopause');
      }
    }
    
    // Age-specific tips
    if (age >= 50) {
      tips.push('Prioritize bone density testing and cardiovascular health monitoring');
      tips.push('Consider calcium and vitamin D supplements for bone health');
    }
    
    return tips;
  }

  async generateMenopauseGentleReminders(menopauseData, userProfile) {
    const reminders = [];
    const latestMenopause = menopauseData[menopauseData.length - 1];
    const stage = latestMenopause.menopauseStage || 'pre-menopause';
    const age = userProfile.age || 25;
    
    // Stage-specific reminders
    if (stage === 'pre-menopause') {
      reminders.push('Continue regular health check-ups and monitor for early menopause signs');
      reminders.push('Maintain bone health with calcium, vitamin D, and weight-bearing exercise');
    } else if (stage === 'perimenopause') {
      reminders.push('Track symptoms regularly and discuss treatment options with healthcare provider');
      reminders.push('Focus on stress management and sleep hygiene during this transition');
    } else if (stage === 'menopause') {
      reminders.push('Continue symptom management and consider hormone therapy if needed');
      reminders.push('Maintain regular health screenings and focus on long-term health');
    } else if (stage === 'post-menopause') {
      reminders.push('Prioritize bone density testing and cardiovascular health monitoring');
      reminders.push('Continue regular health check-ups and maintain healthy lifestyle');
    }
    
    // Age-specific reminders
    if (age >= 50) {
      reminders.push('Schedule bone density testing (DEXA scan) as recommended');
      reminders.push('Monitor cardiovascular health with regular check-ups');
    }
    if (age >= 65) {
      reminders.push('Continue regular health screenings and maintain active lifestyle');
      reminders.push('Focus on fall prevention and bone health maintenance');
    }
    
    // General health reminders
    reminders.push('Maintain regular exercise and healthy diet for overall wellness');
    reminders.push('Don\'t hesitate to discuss menopause concerns with your healthcare provider');
    
    return reminders;
  }

  async getFallbackMenopauseInsights(menopauseData, userProfile) {
    const latestMenopause = menopauseData[menopauseData.length - 1];
    const stage = latestMenopause.menopauseStage || 'pre-menopause';
    const age = userProfile.age || 25;
    
    return {
      quickCheck: this.createQuickCheckSummary({}, menopauseData),
      aiAnalysis: {
        title: "🤖 Dr. AI Menopause Analysis",
        subtitle: "Comprehensive menopause support assessment",
        content: `🎉 You're taking excellent care of your health during this important life transition! Menopause is a natural process, and you're being proactive about managing it.

🌡️ **MENOPAUSE STAGE ASSESSMENT**
You're currently in the ${stage} stage of menopause. This is a normal part of a woman's life cycle, and you're doing great by tracking your symptoms and staying informed.

🩺 **SYMPTOM MANAGEMENT ANALYSIS**
Your current symptom tracking shows good awareness of your body's changes. Continue monitoring symptoms and discuss any concerns with your healthcare provider.

💊 **TREATMENT RECOMMENDATIONS**
Based on your current stage and symptoms, focus on lifestyle modifications, regular exercise, and stress management. Consider discussing treatment options with your healthcare provider if symptoms are affecting your quality of life.

**PERSONALIZED TIPS**
1. Continue tracking symptoms and discussing them with your healthcare provider
2. Maintain regular exercise and a healthy diet for overall wellness
3. Practice stress management techniques like meditation or yoga
4. Stay informed about menopause and treatment options

**GENTLE REMINDERS**
1. Schedule regular health check-ups and screenings
2. Monitor bone health and cardiovascular health
3. Maintain open communication with your healthcare provider
4. Focus on long-term health and wellness

You're navigating this transition beautifully! 🌟`,
        timestamp: new Date().toISOString()
      },
      riskAssessment: [],
      recommendations: ['Continue regular health check-ups', 'Maintain healthy lifestyle during menopause transition'],
      medicalAlerts: [],
      personalizedTips: await this.generateMenopausePersonalizedTips(menopauseData, userProfile),
      gentleReminders: await this.generateMenopauseGentleReminders(menopauseData, userProfile)
    };
  }
}

export default MenopauseAIService;

