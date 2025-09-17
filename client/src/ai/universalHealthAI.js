// UNIVERSAL HEALTH AI SERVICE
// AI-powered insights for all health modules - PCOS, Endometriosis, Pregnancy, Menopause, etc.

import AIServiceManager from './aiServiceManager.js';

class UniversalHealthAI extends AIServiceManager {
  constructor() {
    super();
    console.log('🏥 Universal Health AI initialized - Live AI for all conditions');
  }

  // ===== PCOS ANALYSIS =====
  async generatePCOSInsights(pcosData, userProfile) {
    const prompt = this.buildPCOSPrompt(pcosData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'PCOS', pcosData);
    } catch (error) {
      console.error('Error generating PCOS insights:', error);
      return this.getFallbackHealthInsights('PCOS', pcosData, userProfile);
    }
  }

  buildPCOSPrompt(pcosData, userProfile) {
    const symptoms = pcosData.symptoms || [];
    const severity = pcosData.severity || 'mild';
    const treatments = pcosData.treatments || [];
    const lifestyle = pcosData.lifestyle || [];

    return `You are an expert PCOS specialist providing personalized analysis. Generate compassionate, evidence-based insights.

PATIENT CONTEXT:
- Age: ${userProfile.age || 25} years
- PCOS Severity: ${severity}
- Current Treatments: ${treatments.join(', ') || 'None'}
- Lifestyle Modifications: ${lifestyle.join(', ') || 'None'}

CURRENT SYMPTOMS:
- Irregular cycles: ${symptoms.includes('irregular_cycles') ? 'Yes' : 'No'}
- Weight gain/difficulty losing: ${symptoms.includes('weight_gain') ? 'Yes' : 'No'}
- Acne: ${symptoms.includes('acne') ? 'Yes' : 'No'}
- Hair growth (hirsutism): ${symptoms.includes('hirsutism') ? 'Yes' : 'No'}
- Hair loss: ${symptoms.includes('hair_loss') ? 'Yes' : 'No'}
- Insulin resistance signs: ${symptoms.includes('insulin_resistance') ? 'Yes' : 'No'}
- Mood changes: ${symptoms.includes('mood_changes') ? 'Yes' : 'No'}

Provide comprehensive PCOS analysis in these EXACT sections:

**CONDITION INSIGHTS**
Write a warm, supportive narrative (100-120 words) that:
- Acknowledges the PCOS journey with empathy
- Integrates current symptoms and management approaches
- Provides medical context about PCOS progression
- Offers hope and practical guidance for management
- Ends with encouragement and empowerment

**SYMPTOM ASSESSMENT**
Clear evaluation of current PCOS symptoms and their impact on daily life.

**MANAGEMENT EVALUATION**
Assessment of current treatments and lifestyle modifications effectiveness.

**ACTION ITEM**
Specific, actionable next step for PCOS management based on current symptoms.

**CONFIDENCE LEVEL**
Assessment reliability based on symptom data and treatment history.

**PERSONALIZED TIPS**
4 specific recommendations for PCOS management tailored to current symptoms.

**GENTLE REMINDERS**
3 supportive, encouraging reminders for PCOS management journey.

Be medically accurate, supportive, and empowering. Focus on what the user CAN control.`;
  }

  // ===== ENDOMETRIOSIS ANALYSIS =====
  async generateEndometriosisInsights(endoData, userProfile) {
    const prompt = this.buildEndometriosisPrompt(endoData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'Endometriosis', endoData);
    } catch (error) {
      console.error('Error generating Endometriosis insights:', error);
      return this.getFallbackHealthInsights('Endometriosis', endoData, userProfile);
    }
  }

  buildEndometriosisPrompt(endoData, userProfile) {
    const painLevel = endoData.painLevel || 0;
    const symptoms = endoData.symptoms || [];
    const treatments = endoData.treatments || [];
    const stage = endoData.stage || 'unknown';

    return `You are an expert endometriosis specialist providing personalized pain management and treatment analysis.

PATIENT CONTEXT:
- Age: ${userProfile.age || 25} years
- Endometriosis Stage: ${stage}
- Current Pain Level: ${painLevel}/10
- Current Treatments: ${treatments.join(', ') || 'None'}

CURRENT SYMPTOMS:
- Pelvic pain: ${symptoms.includes('pelvic_pain') ? 'Yes' : 'No'}
- Heavy bleeding: ${symptoms.includes('heavy_bleeding') ? 'Yes' : 'No'}
- Painful periods: ${symptoms.includes('painful_periods') ? 'Yes' : 'No'}
- Painful intercourse: ${symptoms.includes('painful_sex') ? 'Yes' : 'No'}
- Infertility concerns: ${symptoms.includes('infertility') ? 'Yes' : 'No'}
- Fatigue: ${symptoms.includes('fatigue') ? 'Yes' : 'No'}
- Digestive issues: ${symptoms.includes('digestive_issues') ? 'Yes' : 'No'}

Provide comprehensive endometriosis analysis in the same format as PCOS, focusing on pain management, quality of life, and treatment optimization.`;
  }

  // ===== PREGNANCY ANALYSIS =====
  async generatePregnancyInsights(pregnancyData, userProfile) {
    const prompt = this.buildPregnancyPrompt(pregnancyData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'Pregnancy', pregnancyData);
    } catch (error) {
      console.error('Error generating Pregnancy insights:', error);
      return this.getFallbackHealthInsights('Pregnancy', pregnancyData, userProfile);
    }
  }

  buildPregnancyPrompt(pregnancyData, userProfile) {
    const trimester = pregnancyData.trimester || 1;
    const dueDate = pregnancyData.dueDate;
    const symptoms = pregnancyData.symptoms || [];
    const complications = pregnancyData.complications || [];

    return `You are an expert maternal health specialist providing personalized pregnancy care analysis.

PATIENT CONTEXT:
- Age: ${userProfile.age || 25} years
- Trimester: ${trimester}
- Due Date: ${dueDate || 'Not specified'}
- Risk Factors: ${userProfile.age >= 35 ? 'Advanced maternal age' : 'Standard risk'}

CURRENT SYMPTOMS:
- Morning sickness: ${symptoms.includes('nausea') ? 'Yes' : 'No'}
- Fatigue: ${symptoms.includes('fatigue') ? 'Yes' : 'No'}
- Back pain: ${symptoms.includes('back_pain') ? 'Yes' : 'No'}
- Swelling: ${symptoms.includes('swelling') ? 'Yes' : 'No'}
- Sleep issues: ${symptoms.includes('sleep_issues') ? 'Yes' : 'No'}

COMPLICATIONS:
${complications.length > 0 ? complications.join(', ') : 'None reported'}

Provide comprehensive pregnancy analysis focusing on trimester-specific care, symptom management, and preparation for delivery.`;
  }

  // ===== MENOPAUSE ANALYSIS =====
  async generateMenopauseInsights(menopauseData, userProfile) {
    const prompt = this.buildMenopausePrompt(menopauseData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'Menopause', menopauseData);
    } catch (error) {
      console.error('Error generating Menopause insights:', error);
      return this.getFallbackHealthInsights('Menopause', menopauseData, userProfile);
    }
  }

  buildMenopausePrompt(menopauseData, userProfile) {
    const stage = menopauseData.stage || 'perimenopause';
    const symptoms = menopauseData.symptoms || [];
    const hrt = menopauseData.hrt || false;

    return `You are an expert menopause specialist providing personalized transition care analysis.

PATIENT CONTEXT:
- Age: ${userProfile.age || 50} years
- Menopause Stage: ${stage}
- Hormone Replacement Therapy: ${hrt ? 'Yes' : 'No'}

CURRENT SYMPTOMS:
- Hot flashes: ${symptoms.includes('hot_flashes') ? 'Yes' : 'No'}
- Night sweats: ${symptoms.includes('night_sweats') ? 'Yes' : 'No'}
- Mood changes: ${symptoms.includes('mood_changes') ? 'Yes' : 'No'}
- Sleep disruption: ${symptoms.includes('sleep_issues') ? 'Yes' : 'No'}
- Vaginal dryness: ${symptoms.includes('vaginal_dryness') ? 'Yes' : 'No'}
- Weight gain: ${symptoms.includes('weight_gain') ? 'Yes' : 'No'}

Provide comprehensive menopause analysis focusing on symptom management, long-term health, and quality of life optimization.`;
  }

  // ===== MENTAL HEALTH ANALYSIS =====
  async generateMentalHealthInsights(mentalData, userProfile) {
    const prompt = this.buildMentalHealthPrompt(mentalData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'Mental Health', mentalData);
    } catch (error) {
      console.error('Error generating Mental Health insights:', error);
      return this.getFallbackHealthInsights('Mental Health', mentalData, userProfile);
    }
  }

  buildMentalHealthPrompt(mentalData, userProfile) {
    const moodLevel = mentalData.moodLevel || 5;
    const stressLevel = mentalData.stressLevel || 5;
    const symptoms = mentalData.symptoms || [];
    const support = mentalData.support || [];

    return `You are an expert mental health specialist providing personalized reproductive mental health analysis.

PATIENT CONTEXT:
- Age: ${userProfile.age || 25} years
- Current Mood Level: ${moodLevel}/10
- Current Stress Level: ${stressLevel}/10
- Support Systems: ${support.join(', ') || 'None specified'}

CURRENT SYMPTOMS:
- Anxiety: ${symptoms.includes('anxiety') ? 'Yes' : 'No'}
- Depression: ${symptoms.includes('depression') ? 'Yes' : 'No'}
- Mood swings: ${symptoms.includes('mood_swings') ? 'Yes' : 'No'}
- Sleep issues: ${symptoms.includes('sleep_issues') ? 'Yes' : 'No'}
- Concentration problems: ${symptoms.includes('concentration') ? 'Yes' : 'No'}
- Irritability: ${symptoms.includes('irritability') ? 'Yes' : 'No'}

Provide comprehensive mental health analysis focusing on reproductive health connections, coping strategies, and wellness optimization.`;
  }

  // ===== SEXUAL HEALTH ANALYSIS =====
  async generateSexualHealthInsights(sexualData, userProfile) {
    const prompt = this.buildSexualHealthPrompt(sexualData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processHealthInsights(insights, 'Sexual Health', sexualData);
    } catch (error) {
      console.error('Error generating Sexual Health insights:', error);
      return this.getFallbackHealthInsights('Sexual Health', sexualData, userProfile);
    }
  }

  buildSexualHealthPrompt(sexualData, userProfile) {
    const satisfaction = sexualData.satisfaction || 5;
    const concerns = sexualData.concerns || [];
    const symptoms = sexualData.symptoms || [];

    return `You are an expert sexual health specialist providing personalized reproductive sexual health analysis.

PATIENT CONTEXT:
- Age: ${userProfile.age || 25} years
- Sexual Satisfaction: ${satisfaction}/10
- Relationship Status: ${sexualData.relationshipStatus || 'Not specified'}

CURRENT CONCERNS:
- Pain during intercourse: ${concerns.includes('painful_sex') ? 'Yes' : 'No'}
- Low libido: ${concerns.includes('low_libido') ? 'Yes' : 'No'}
- Vaginal dryness: ${concerns.includes('vaginal_dryness') ? 'Yes' : 'No'}
- Difficulty reaching orgasm: ${concerns.includes('difficulty_orgasm') ? 'Yes' : 'No'}
- Communication issues: ${concerns.includes('communication') ? 'Yes' : 'No'}

Provide comprehensive sexual health analysis focusing on reproductive health connections, intimacy optimization, and overall wellbeing.`;
  }

  // ===== UNIVERSAL PROCESSING =====
  processHealthInsights(insights, conditionType, data) {
    try {
      // Try to parse structured response
      const sections = this.parseAISections(insights);
      
      return {
        quickCheck: {
          conditionAssessment: sections.symptomAssessment || `${conditionType} symptoms evaluated`,
          managementEvaluation: sections.managementEvaluation || `${conditionType} management reviewed`,
          actionItem: sections.actionItem || `Continue ${conditionType} monitoring`,
          confidence: sections.confidenceLevel || 'Moderate confidence'
        },
        aiInsights: [sections.conditionInsights || insights],
        personalizedTips: sections.personalizedTips || [
          `Continue tracking ${conditionType} symptoms`,
          'Maintain healthy lifestyle habits',
          'Consult healthcare provider for persistent concerns',
          'Focus on self-care and stress management'
        ],
        gentleReminders: sections.gentleReminders || [
          `Your ${conditionType} journey is unique and valid`,
          'Small daily actions contribute to better health',
          'Be patient and compassionate with yourself'
        ]
      };
    } catch (error) {
      // Fallback to simple structure
      return {
        quickCheck: {
          conditionAssessment: `${conditionType} analysis completed`,
          managementEvaluation: 'Continue current management approach',
          actionItem: `Monitor ${conditionType} symptoms regularly`,
          confidence: 'Moderate confidence based on available data'
        },
        aiInsights: [insights],
        personalizedTips: [
          `Continue tracking ${conditionType} patterns`,
          'Focus on healthy lifestyle choices',
          'Maintain regular healthcare appointments',
          'Practice stress management techniques'
        ],
        gentleReminders: [
          'Every day of health tracking builds valuable insights',
          'Your health journey deserves attention and care',
          'Progress happens gradually with consistent effort'
        ]
      };
    }
  }

  parseAISections(text) {
    const sections = {};
    
    // Extract each section using regex patterns
    const sectionPatterns = {
      conditionInsights: /\*\*(?:CONDITION INSIGHTS|FERTILITY INSIGHTS|PREGNANCY INSIGHTS|MENOPAUSE INSIGHTS|MENTAL HEALTH INSIGHTS|SEXUAL HEALTH INSIGHTS)\*\*\s*([^*]+?)(?=\*\*|$)/i,
      symptomAssessment: /\*\*(?:SYMPTOM ASSESSMENT|OVULATION ASSESSMENT|CONDITION ASSESSMENT)\*\*\s*([^*]+?)(?=\*\*|$)/i,
      managementEvaluation: /\*\*(?:MANAGEMENT EVALUATION|FERTILITY EVALUATION|TREATMENT EVALUATION)\*\*\s*([^*]+?)(?=\*\*|$)/i,
      actionItem: /\*\*ACTION ITEM\*\*\s*([^*]+?)(?=\*\*|$)/i,
      confidenceLevel: /\*\*CONFIDENCE LEVEL\*\*\s*([^*]+?)(?=\*\*|$)/i,
      personalizedTips: /\*\*PERSONALIZED TIPS\*\*\s*([^*]+?)(?=\*\*|$)/i,
      gentleReminders: /\*\*GENTLE REMINDERS\*\*\s*([^*]+?)(?=\*\*|$)/i
    };

    for (const [key, pattern] of Object.entries(sectionPatterns)) {
      const match = text.match(pattern);
      if (match) {
        let content = match[1].trim();
        
        // For tips and reminders, parse into arrays
        if (key === 'personalizedTips' || key === 'gentleReminders') {
          sections[key] = content.split(/\n/).filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && (trimmed.match(/^\d+\./) || trimmed.match(/^[-•]/));
          }).map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim()).slice(0, 4);
        } else {
          sections[key] = content;
        }
      }
    }

    return sections;
  }

  // ===== UNIVERSAL FALLBACK =====
  getFallbackHealthInsights(conditionType, data, userProfile) {
    const age = userProfile.age || 25;
    
    return {
      quickCheck: {
        conditionAssessment: `${conditionType} symptoms documented and analyzed`,
        managementEvaluation: `Current ${conditionType} management approach reviewed`,
        actionItem: `Continue monitoring ${conditionType} patterns and symptoms`,
        confidence: `Moderate - based on current ${conditionType} data`
      },
      aiInsights: [`Your ${conditionType} data has been carefully documented. Continue tracking your symptoms and management approaches to build a comprehensive health profile that will enable more personalized insights and treatment optimization.`],
      personalizedTips: [
        `Track ${conditionType} symptoms consistently for pattern recognition`,
        'Maintain healthy lifestyle with balanced nutrition and regular exercise',
        'Practice stress management techniques suited to your preferences',
        'Consult healthcare provider for persistent or worsening symptoms'
      ],
      gentleReminders: [
        `Your ${conditionType} journey is unique and deserves compassionate care`,
        'Every symptom you track contributes to better understanding your health',
        'Small daily health choices accumulate into significant improvements'
      ]
    };
  }
}

export default UniversalHealthAI;
