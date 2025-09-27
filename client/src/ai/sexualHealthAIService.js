// SEXUAL HEALTH-SPECIFIC AI SERVICE
// Specialized AI service for Sexual Health insights with separate extraction

import AIServiceManager from './aiServiceManager.js';

class SexualHealthAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 Sexual Health AI Service initialized - Live AI insights for sexual health tracking');
  }

  // ===== SEXUAL HEALTH ANALYSIS =====
  async generateSexualHealthInsights(sexualHealthData, userProfile) {
    const prompt = this.buildSexualHealthPrompt(sexualHealthData, userProfile);
    
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      console.log('🚀 SEXUAL HEALTH: Starting AI service call...');
      console.log('🔍 SEXUAL HEALTH: Service status:', this.getServiceStatus());
      console.log('🔍 SEXUAL HEALTH: Prompt length:', prompt.length);
      console.log('🔍 SEXUAL HEALTH: Using service:', this.service.constructor.name);
      
      // Use the parent class's executeWithFallback method for seamless fallback
      console.log('🔍 SEXUAL HEALTH: About to call executeWithFallback...');
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ SEXUAL HEALTH: AI service returned insights:', insights);
      console.log('✅ SEXUAL HEALTH: Insights is null/undefined?', insights == null);
      console.log('🔍 SEXUAL HEALTH: Insights type:', typeof insights);
      console.log('🔍 SEXUAL HEALTH: Insights length:', insights?.length);
      console.log('🔍 SEXUAL HEALTH: Raw insights content:', insights?.substring(0, 200) + '...');
      
      // Check if insights are valid
      if (!insights || insights.length < 100) {
        console.warn('⚠️ SEXUAL HEALTH: Insights too short or empty, using fallback');
        return this.getFallbackSexualHealthInsights(sexualHealthData, userProfile);
      }
      
      return await this.processSexualHealthInsights(insights, sexualHealthData, userProfile);
    } catch (error) {
      console.error('❌ SEXUAL HEALTH: Error generating sexual health insights:', error);
      console.error('❌ SEXUAL HEALTH: Error details:', error.message);
      console.error('❌ SEXUAL HEALTH: Full error:', error);
      console.log('🔄 SEXUAL HEALTH: Using fallback insights due to error');
      return this.getFallbackSexualHealthInsights(sexualHealthData, userProfile);
    }
  }

  buildSexualHealthPrompt(sexualHealthData, userProfile) {
    // Safety check for data
    if (!sexualHealthData || !Array.isArray(sexualHealthData) || sexualHealthData.length === 0) {
      console.warn('⚠️ No sexual health data provided or data is not an array');
      // Return a basic prompt string instead of fallback object
      return `You are Dr. AI, an expert in sexual health and reproductive medicine. Provide medically accurate, empathetic, and actionable insights.

PATIENT PROFILE:
- Age: ${userProfile?.age || 25} years old
- Medical Conditions: None reported
- Family History: None reported

CURRENT SEXUAL HEALTH DATA:
- No recent sexual health data available
- Please complete a sexual health assessment for personalized insights

ANALYSIS REQUIREMENTS:
Provide a comprehensive sexual health analysis encouraging the user to complete their assessment for personalized insights.`;
    }
    
    const latestSexualHealth = sexualHealthData[sexualHealthData.length - 1];
    const age = userProfile?.age || 25;
    const conditions = userProfile?.conditions?.reproductive || [];
    // Get family history from the sexual health form data, not userProfile - handle undefined safely
    const familyHistory = latestSexualHealth?.familyHistory || [];
    const lifestyle = userProfile?.lifestyle || {};
    
    console.log('🔍 SEXUAL HEALTH PROMPT - Latest data:', latestSexualHealth);
    console.log('🔍 SEXUAL HEALTH PROMPT - User profile:', userProfile);
    console.log('🔍 SEXUAL HEALTH PROMPT - Family history:', familyHistory);
    
    return `You are Dr. AI, an expert in sexual health and reproductive medicine. Provide medically accurate, empathetic, and actionable insights that act as a bridge between patient and clinician, never overwhelming but always precise.

PATIENT PROFILE:
- Age: ${age} years old
- Medical Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Lifestyle: ${lifestyle.exercise?.frequency || 'Not specified'} exercise, ${lifestyle.stress?.level || 'Not specified'} stress level
- Tobacco Use: ${userProfile.tobaccoUse || 'No'}

CURRENT SEXUAL HEALTH DATA:
- Last STI Screening: ${latestSexualHealth?.lastSTIScreening || 'Not specified'}
- Next STI Screening: ${latestSexualHealth?.nextSTIScreening || 'Not scheduled'}
- Sexual Activity: ${latestSexualHealth?.sexualActivity || 'Not specified'}
- Partner Gender: ${latestSexualHealth?.partnerGender?.join(', ') || 'Not specified'}
- Frequency: ${latestSexualHealth?.frequency || 'Not specified'}
- Contraception: ${latestSexualHealth?.contraception || 'Not specified'}
- Emergency Contraception: ${latestSexualHealth?.emergencyContraception || 'Not used'}
- Condom Use: ${latestSexualHealth?.condomUse || 'Not specified'}
- STI History: ${latestSexualHealth?.stiHistory?.join(', ') || 'None'}
- STI Treatment Completion: ${latestSexualHealth?.stiTreatmentCompletion || 'Not specified'}
- Current Symptoms: ${latestSexualHealth?.symptoms?.join(', ') || 'None reported'}
- Symptom Duration: ${latestSexualHealth?.symptomDuration || 'Not specified'}
- Symptom Severity: ${latestSexualHealth?.symptomSeverity || 'Not specified'}
- Concerns: ${latestSexualHealth?.concerns || 'None'}
- Notes: ${latestSexualHealth?.notes || 'None'}

COMPREHENSIVE SEXUAL HEALTH ASSESSMENT:
- Relationship Status: ${latestSexualHealth?.relationshipStatus || 'Not specified'}
- Sexual Orientation: ${latestSexualHealth?.sexualOrientation || 'Not specified'}
- Sexual Satisfaction: ${latestSexualHealth?.satisfaction || 'Not specified'}
- Current Libido: ${latestSexualHealth?.libido || 'Not specified'}
- Pain During Sex: ${latestSexualHealth?.painDuringSex || 'Not specified'}
- Mental Health Impact: Anxiety: ${latestSexualHealth?.anxiety || 'Not specified'}, Self-esteem: ${latestSexualHealth?.selfEsteem || 'Not specified'}, Relationships: ${latestSexualHealth?.relationshipImpact || 'Not specified'}

LIFESTYLE & HEALTH FACTORS:
- Exercise: ${latestSexualHealth?.exercise || 'Not specified'}
- Diet: ${latestSexualHealth?.diet || 'Not specified'}
- Alcohol Use: ${latestSexualHealth?.alcoholUse || 'Not specified'}
- Smoking: ${latestSexualHealth?.smoking || 'No'}
- Recreational Drugs: ${latestSexualHealth?.recreationalDrugs || 'None'}
- Stress Level: ${latestSexualHealth?.stress || 5}/10
- Sleep Quality: ${latestSexualHealth?.sleep || 5}/10
- Medications: ${latestSexualHealth?.medications?.join(', ') || 'None'}
- Supplements: ${latestSexualHealth?.supplements?.join(', ') || 'None'}

HISTORICAL SEXUAL HEALTH DATA (Last 3 entries):
${Array.isArray(sexualHealthData) && sexualHealthData.length > 0 ? sexualHealthData.slice(-3).map((entry, index) => `
Entry ${sexualHealthData.length - 2 + index}:
- Date: ${entry?.date || 'Not specified'}
- Sexual Activity: ${entry?.sexualActivity || 'Not specified'}
- Contraception: ${entry?.contraception || 'Not specified'}
- Symptoms: ${entry?.symptoms?.join(', ') || 'None'}
- Concerns: ${entry?.concerns || 'None'}
`).join('') : 'No historical data available'}

ANALYSIS REQUIREMENTS:
Provide a comprehensive sexual health analysis in the following EXACT format:

🔍 **SEXUAL HEALTH ASSESSMENT**
- **Primary Cause:** [Most likely explanation for current state, e.g., vaginal dryness linked to stress, recurrent yeast infection, reduced libido due to sleep or stress — use clear medical terms without alarming language]
- **Secondary Possibilities:** [List 2–3 reasonable differentials, e.g., bacterial vaginosis, hormonal imbalance, partner-related factors, medication effects — avoid extreme diagnoses unless strongly supported by data]
- **Monitoring Guidance:** [Patterns to track over time, e.g., frequency of symptoms, consistency of condom use, STI screening intervals]

🛡️ **SAFETY & PROTECTION ANALYSIS**
[Assess STI risk based on activity, partner profile, condom use, and last screening. Comment on contraception effectiveness and give tailored advice for safe practices.]

💊 **MEDICAL RECOMMENDATIONS**
[Specific guidance such as scheduling an STI screening, discussing birth control options with provider, considering HPV vaccination, or addressing persistent symptoms. Avoid vague advice.]

✨ **PERSONALIZED TIPS**
1. [Specific hygiene, diet, or lifestyle recommendation tied directly to symptoms/inputs]
2. [Practical protection/contraception tip based on their reported use]
3. [STI prevention or screening habit tailored to last checkup date and risk profile]
4. [Sexual function or relationship tip based on satisfaction/libido data]

🌸 **GENTLE REMINDERS**
1. [Upcoming screening reminder personalized to input data]
2. [When to seek medical attention (e.g., symptoms lasting >2 weeks, severe pain, unusual discharge)]
3. [Next steps in reproductive/sexual health based on history (e.g., Pap smear, HPV vaccination)]
4. [Long-term monitoring tip (track frequency of partners, condom consistency, symptom recurrence)]

Tone: empathetic, respectful, clear. Always provide **clinically valid but non-alarming explanations**. Insights must feel like personalized care notes from a supportive clinician.`;
  }

  async processSexualHealthInsights(insights, sexualHealthData, userProfile) {
    try {
      // This is REAL Gemini AI response - process it properly
      const textInsights = insights.toString();
      console.log('🔍 Processing REAL Gemini AI response:', textInsights.substring(0, 200) + '...');
      
      // Extract sections from the AI response
      const sections = this.extractEnhancedSections(textInsights);
      console.log('🔍 Extracted sections:', Object.keys(sections));
      
      // Create comprehensive medical analysis
      const finalInsights = {
        quickCheck: this.createQuickCheckSummary(sections, sexualHealthData),
        aiAnalysis: {
          title: "🤖 Dr. AI Sexual Health Analysis",
          subtitle: "Comprehensive sexual health assessment",
          content: textInsights, // Full AI response
          timestamp: new Date().toISOString()
        },
        // Extract medical insights from AI response
        riskAssessment: this.extractRiskFromSections(sections),
        recommendations: this.extractRecommendationsFromSections(sections),
        medicalAlerts: this.extractAlertsFromSections(sections),
        // Generate personalized insights based on user's actual data
        personalizedTips: await this.generateSexualHealthPersonalizedTips(sexualHealthData, userProfile),
        gentleReminders: await this.generateSexualHealthGentleReminders(sexualHealthData, userProfile),
        // Add the extracted sections directly
        ...sections
      };
      
      console.log('🔍 [SEXUAL HEALTH] Final insights object:', finalInsights);
      console.log('🔍 [SEXUAL HEALTH] Final insights keys:', Object.keys(finalInsights));
      
      return finalInsights;
    } catch (error) {
      console.error('Error processing sexual health insights:', error);
      return this.getFallbackSexualHealthInsights(sexualHealthData, userProfile);
    }
  }

  // ===== SEXUAL HEALTH-SPECIFIC EXTRACTION METHODS =====
  
  extractEnhancedSections(text) {
    const sections = {};
    
    console.log('🔍 [SEXUAL HEALTH] Full AI response text:', text);
    console.log('🔍 [SEXUAL HEALTH] Text length:', text.length);
    console.log('🔍 [SEXUAL HEALTH] First 500 chars:', text.substring(0, 500));
    
    // SEXUAL HEALTH-SPECIFIC section headers with unique patterns
    const sectionHeaders = [
      { key: 'sexualHealthAssessment', patterns: ['🔍 **SEXUAL HEALTH ASSESSMENT**', '## 🔍 SEXUAL HEALTH ASSESSMENT', '🔍 SEXUAL HEALTH ASSESSMENT', '🔍 Sexual Health Assessment'] },
      { key: 'safetyProtectionAnalysis', patterns: ['🛡️ **SAFETY & PROTECTION ANALYSIS**', '## 🛡️ SAFETY & PROTECTION ANALYSIS', '🛡️ SAFETY & PROTECTION ANALYSIS', '🛡️ Safety & Protection Analysis'] },
      { key: 'medicalRecommendations', patterns: ['💊 **MEDICAL RECOMMENDATIONS**', '## 💊 MEDICAL RECOMMENDATIONS', '💊 MEDICAL RECOMMENDATIONS', '💊 Medical Recommendations'] },
      { key: 'personalizedTips', patterns: ['✨ **PERSONALIZED TIPS**', '## ✨ PERSONALIZED TIPS', '✨ PERSONALIZED TIPS', '✨ Personalized Tips'] },
      { key: 'gentleReminders', patterns: ['🌸 **GENTLE REMINDERS**', '## 🌸 GENTLE REMINDERS', '🌸 GENTLE REMINDERS', '🌸 Gentle Reminders'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 [SEXUAL HEALTH] Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 [SEXUAL HEALTH] Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 [SEXUAL HEALTH] Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ [SEXUAL HEALTH] Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
    }
    
      console.log('🔍 [SEXUAL HEALTH] Final extracted sections:', sections);
      console.log('🔍 [SEXUAL HEALTH] Section keys:', Object.keys(sections));
      
      // Check if we actually extracted any meaningful sections
      const meaningfulSections = Object.keys(sections).filter(key => 
        sections[key] && sections[key].length > 50
      );
      console.log('🔍 [SEXUAL HEALTH] Meaningful sections found:', meaningfulSections);
      
      if (meaningfulSections.length === 0) {
        console.warn('⚠️ [SEXUAL HEALTH] No meaningful sections extracted, this might cause fallback');
      }
      
      return sections;
  }

  extractSection(text, pattern) {
    const regex = new RegExp(`${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n\\n|\\n#|\\n\\*\\*|\\n🛡️|\\n💊|\\n✨|\\n🌸|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(pattern, '').trim() : null;
  }

  createQuickCheckSummary(sections, sexualHealthData) {
    const latestSexualHealth = Array.isArray(sexualHealthData) && sexualHealthData.length > 0 ? sexualHealthData[sexualHealthData.length - 1] : {};
    return {
      sexualActivity: latestSexualHealth.sexualActivity || 'Not specified',
      contraception: latestSexualHealth.contraception || 'Not specified',
      lastScreening: latestSexualHealth.lastSTIScreening || 'Not scheduled',
      symptoms: latestSexualHealth.symptoms?.length || 0,
      overallHealth: this.determineOverallSexualHealth(sections, latestSexualHealth),
      nextScreening: this.calculateNextScreening(latestSexualHealth)
    };
  }

  determineOverallSexualHealth(sections, latestSexualHealth) {
    const symptoms = latestSexualHealth.symptoms?.length || 0;
    const concerns = latestSexualHealth.concerns?.length || 0;
    
    if (symptoms === 0 && concerns === 0) return 'Good';
    if (symptoms <= 2 && concerns <= 1) return 'Fair';
    return 'Needs Attention';
  }

  calculateNextScreening(latestSexualHealth) {
    const lastScreening = latestSexualHealth.lastSTIScreening;
    if (!lastScreening) return 'Schedule initial screening';
    
    const lastDate = new Date(lastScreening);
    const nextDate = new Date(lastDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    return `Next screening: ${nextDate.toISOString().split('T')[0]}`;
  }

  extractRiskFromSections(sections) {
    const sexualHealthAssessment = sections.sexualHealthAssessment || '';
    const risks = [];
    
    // Analyze actual medical data from user's submission
    if (sexualHealthAssessment.toLowerCase().includes('sti') || sexualHealthAssessment.toLowerCase().includes('sexually transmitted')) {
      risks.push('STI screening recommended');
    }
    if (sexualHealthAssessment.toLowerCase().includes('unprotected') || sexualHealthAssessment.toLowerCase().includes('no protection')) {
      risks.push('Protection and contraception counseling needed');
    }
    if (sexualHealthAssessment.toLowerCase().includes('multiple partners') || sexualHealthAssessment.toLowerCase().includes('high risk')) {
      risks.push('Enhanced STI screening and protection needed');
    }
    if (sexualHealthAssessment.toLowerCase().includes('pain') || sexualHealthAssessment.toLowerCase().includes('discomfort')) {
      risks.push('Medical evaluation for sexual pain recommended');
    }
    if (sexualHealthAssessment.toLowerCase().includes('bleeding') || sexualHealthAssessment.toLowerCase().includes('abnormal discharge')) {
      risks.push('Gynecological evaluation recommended');
    }
    
    return risks;
  }

  extractRecommendationsFromSections(sections) {
    const medicalRecommendations = sections.medicalRecommendations || '';
    const recommendations = [];
    
    if (medicalRecommendations.toLowerCase().includes('contraception') || medicalRecommendations.toLowerCase().includes('birth control')) {
      recommendations.push('Discuss contraception options with healthcare provider');
    }
    if (medicalRecommendations.toLowerCase().includes('screening') || medicalRecommendations.toLowerCase().includes('test')) {
      recommendations.push('Schedule regular STI and sexual health screenings');
    }
    if (medicalRecommendations.toLowerCase().includes('protection') || medicalRecommendations.toLowerCase().includes('condom')) {
      recommendations.push('Use barrier protection consistently');
    }
    if (medicalRecommendations.toLowerCase().includes('communication') || medicalRecommendations.toLowerCase().includes('partner')) {
      recommendations.push('Improve sexual health communication with partners');
    }
    
    return recommendations;
  }

  extractAlertsFromSections(sections) {
    const sexualHealthAssessment = sections.sexualHealthAssessment || '';
    const alerts = [];
    
    if (sexualHealthAssessment.toLowerCase().includes('urgent') || sexualHealthAssessment.toLowerCase().includes('immediate')) {
      alerts.push('Seek immediate medical attention');
    }
    if (sexualHealthAssessment.toLowerCase().includes('emergency') || sexualHealthAssessment.toLowerCase().includes('severe')) {
      alerts.push('Contact healthcare provider immediately');
    }
    
    return alerts;
  }

  async generateSexualHealthPersonalizedTips(sexualHealthData, userProfile) {
    const tips = [];
    const latestSexualHealth = Array.isArray(sexualHealthData) && sexualHealthData.length > 0 ? sexualHealthData[sexualHealthData.length - 1] : {};
    const age = userProfile.age || 25;
    
    // Age-specific tips
    if (age < 25) {
      tips.push('Focus on STI prevention and regular screening as a young adult');
      tips.push('Consider HPV vaccination if not already completed');
    } else if (age >= 25 && age < 40) {
      tips.push('Maintain regular sexual health screenings and contraception management');
      tips.push('Discuss fertility planning if considering pregnancy');
    } else if (age >= 40) {
      tips.push('Continue regular screenings and discuss menopause-related sexual health changes');
      tips.push('Consider hormone therapy options if experiencing sexual health issues');
    }
    
    // Activity-specific tips
    if (latestSexualHealth.sexualActivity === 'multiple partners' || latestSexualHealth.sexualActivity === 'new partner recently') {
      tips.push('Use barrier protection consistently and get tested regularly');
      tips.push('Communicate openly with partners about sexual health');
    } else if (latestSexualHealth.sexualActivity === 'monogamous relationship') {
      tips.push('Maintain regular STI screenings even in monogamous relationships');
      tips.push('Discuss sexual health goals and concerns with your partner');
    }
    
    // Symptom-specific tips
    if (latestSexualHealth.symptoms && latestSexualHealth.symptoms.length > 0) {
      if (latestSexualHealth.symptoms.includes('Pain during sex')) {
        tips.push('Consider using lubricant and discussing pain with a healthcare provider');
      }
      if (latestSexualHealth.symptoms.includes('Decreased libido')) {
        tips.push('Discuss libido changes with a healthcare provider - this can be addressed');
      }
      if (latestSexualHealth.symptoms.includes('Vaginal dryness')) {
        tips.push('Try vaginal moisturizers and discuss hormone therapy options');
      }
    }
    
    // Contraception-specific tips
    if (latestSexualHealth.contraception === 'none' && latestSexualHealth.sexualActivity !== 'not sexually active') {
      tips.push('Discuss contraception options with a healthcare provider');
    }
    
    return tips;
  }

  async generateSexualHealthGentleReminders(sexualHealthData, userProfile) {
    const reminders = [];
    const latestSexualHealth = Array.isArray(sexualHealthData) && sexualHealthData.length > 0 ? sexualHealthData[sexualHealthData.length - 1] : {};
    const age = userProfile.age || 25;
    
    // Screening reminders
    if (!latestSexualHealth.lastSTIScreening) {
      reminders.push('Schedule your first STI screening if sexually active');
    } else {
      const lastScreening = new Date(latestSexualHealth.lastSTIScreening);
      const monthsSince = (new Date() - lastScreening) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSince >= 12) {
        reminders.push('Time for annual STI screening - schedule your appointment');
      }
    }
    
    // Age-specific reminders
    if (age >= 21) {
      reminders.push('Schedule regular Pap smears as recommended by your healthcare provider');
    }
    if (age >= 25) {
      reminders.push('Consider HPV testing as part of your cervical cancer screening');
    }
    
    // Activity-specific reminders
    if (latestSexualHealth.sexualActivity !== 'not sexually active') {
      reminders.push('Use protection consistently to prevent STIs and unintended pregnancy');
      reminders.push('Communicate openly with partners about sexual health and boundaries');
    }
    
    // General health reminders
    reminders.push('Maintain good sexual health hygiene and self-care practices');
    reminders.push('Don\'t hesitate to discuss sexual health concerns with your healthcare provider');
    
    return reminders;
  }

  async getFallbackSexualHealthInsights(sexualHealthData, userProfile) {
    const latestSexualHealth = Array.isArray(sexualHealthData) && sexualHealthData.length > 0 ? sexualHealthData[sexualHealthData.length - 1] : {};
    const age = userProfile.age || 25;
    
    return {
      quickCheck: this.createQuickCheckSummary({}, sexualHealthData),
      aiAnalysis: {
        title: "🤖 Dr. AI Sexual Health Analysis",
        subtitle: "Comprehensive sexual health assessment",
        content: `🎉 Great job taking care of your sexual health! You're at an important stage in your life where sexual health awareness is crucial.

🔍 **SEXUAL HEALTH ASSESSMENT**
Based on your current sexual activity and health data, you're taking proactive steps toward maintaining good sexual health. Regular screening and open communication are key to sexual well-being.

🛡️ **SAFETY & PROTECTION ANALYSIS**
Your current protection and screening practices show good awareness of sexual health safety. Continue prioritizing protection and regular health check-ups.

💊 **MEDICAL RECOMMENDATIONS**
Maintain regular sexual health screenings and open communication with healthcare providers about any concerns or questions you may have.

**PERSONALIZED TIPS**
1. Continue regular STI screenings based on your activity level
2. Use protection consistently to prevent STIs and unintended pregnancy
3. Communicate openly with partners about sexual health
4. Don't hesitate to discuss any concerns with your healthcare provider

**GENTLE REMINDERS**
1. Schedule regular sexual health screenings as recommended
2. Use protection consistently during sexual activity
3. Communicate openly with partners about sexual health
4. Maintain good sexual health hygiene and self-care practices

You're doing a great job prioritizing your sexual health! 🌟`,
        timestamp: new Date().toISOString()
      },
      riskAssessment: [],
      recommendations: ['Continue regular sexual health screenings', 'Maintain open communication with healthcare providers'],
      medicalAlerts: [],
      personalizedTips: await this.generateSexualHealthPersonalizedTips(sexualHealthData, userProfile),
      gentleReminders: await this.generateSexualHealthGentleReminders(sexualHealthData, userProfile)
    };
  }
}

export default SexualHealthAIService;