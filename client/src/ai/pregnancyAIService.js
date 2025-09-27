// PREGNANCY-SPECIFIC AI SERVICE
// Specialized AI service for Pregnancy Tracking insights with separate extraction

import AIServiceManager from './aiServiceManager.js';

class PregnancyAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 Pregnancy AI Service initialized - Live AI insights for pregnancy tracking');
  }

  // ===== PREGNANCY ANALYSIS =====
  async generatePregnancyInsights(pregnancyData, userProfile) {
    const prompt = this.buildPregnancyPrompt(pregnancyData, userProfile);
    try {
      console.log('🚀 PREGNANCY: Starting AI service call...');
      console.log('🔍 PREGNANCY: Service status:', this.getServiceStatus());
      console.log('🔍 PREGNANCY: Prompt length:', prompt.length);
      console.log('🔍 PREGNANCY: Using service:', this.service.constructor.name);
      
      // Use the parent class's executeWithFallback method for seamless fallback
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ PREGNANCY: AI service returned insights:', insights);
      console.log('🔍 PREGNANCY: Insights type:', typeof insights);
      console.log('🔍 PREGNANCY: Insights length:', insights?.length);
      console.log('🔍 PREGNANCY: Raw insights content:', insights?.substring(0, 200) + '...');
      
      return await this.processPregnancyInsights(insights, pregnancyData, userProfile);
    } catch (error) {
      console.error('❌ PREGNANCY: Error generating pregnancy insights:', error);
      console.error('❌ PREGNANCY: Error details:', error.message);
      return this.getFallbackPregnancyInsights(pregnancyData, userProfile);
    }
  }

  buildPregnancyPrompt(pregnancyData, userProfile) {
    const latestPregnancy = pregnancyData[pregnancyData.length - 1];
    const age = userProfile.age || 25;
    const conditions = userProfile.conditions?.reproductive || [];
    // Get family history from the pregnancy form data, not userProfile
    const familyHistory = latestPregnancy.familyHistory || [];
    const lifestyle = userProfile.lifestyle || {};
    const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    
    return `You are a board-certified obstetrician providing comprehensive prenatal care consultation.

PATIENT DATA:

**PREGNANCY TIMELINE:**
- Date: ${latestPregnancy.date || 'Not specified'}
- Due Date: ${latestPregnancy.dueDate || 'Not specified'}
- Last Menstrual Period: ${latestPregnancy.lastMenstrualPeriod || 'Not specified'}
- Gestational Age: ${latestPregnancy.gestationalAge || 'Not calculated'} weeks
- Trimester: ${latestPregnancy.trimester || 1}

**PREGNANCY SYMPTOMS:**
- Morning Sickness: ${latestPregnancy.morningSickness || 'Not reported'}
- Food Aversions: ${latestPregnancy.foodAversions?.join(', ') || 'None'}
- Breast Tenderness: ${latestPregnancy.breastTenderness || 'Not reported'}
- Spotting/Bleeding: ${latestPregnancy.spotting || 'None'}
- Fetal Movement: ${latestPregnancy.fetalMovement || 'Not reported'}
- Back Pain: ${latestPregnancy.backPain || 'Not reported'}
- Heartburn: ${latestPregnancy.heartburn || 'Not reported'}
- Braxton Hicks: ${latestPregnancy.braxtonHicks || 'Not reported'}
- Swelling: ${latestPregnancy.swelling || 'Not reported'}
- Sleep & Comfort: ${latestPregnancy.sleepComfort || 'Not reported'}

**MOOD & WELLBEING:**
- Mood: ${latestPregnancy.mood || 5}/10
- Energy: ${latestPregnancy.energy || 5}/10
- Sleep Quality: ${latestPregnancy.sleep || 5}/10
- Stress Level: ${latestPregnancy.stress || 5}/10

**MEDICAL HISTORY & RISK FACTORS:**
- First Pregnancy: ${latestPregnancy.isFirstPregnancy || 'Not specified'}
- Previous Complications: ${latestPregnancy.previousComplications?.join(', ') || 'None'}
- Chronic Conditions: ${latestPregnancy.chronicConditions?.join(', ') || 'None'}
- Medications: ${latestPregnancy.medications?.join(', ') || 'None'}

**LIFESTYLE & HEALTH:**
- Diet: ${latestPregnancy.diet || 'Not specified'}
- Exercise: ${latestPregnancy.exercise || 'Not specified'}
- Stress Level: ${latestPregnancy.stress || 5}/10

**HISTORICAL PREGNANCY DATA (Last 3 entries):**
${pregnancyData.slice(-3).map((entry, index) => `
Entry ${pregnancyData.length - 2 + index}:
- Gestational Age: ${entry.gestationalAge || 'Not calculated'} weeks
- Weight: ${entry.weight || 'Not recorded'} lbs
- Symptoms: ${entry.symptoms?.join(', ') || 'None'}
- Mood: ${entry.mood || 5}/10
- Sleep: ${entry.sleep || 5}/10
- Blood Pressure: ${entry.bloodPressure || 'Not recorded'}
`).join('')}

**CONSULTATION REQUIREMENTS:**
Provide a comprehensive pregnancy consultation in this EXACT format:

👋 **GREETING**
Warm, trimester-specific greeting. Congratulate their pregnancy milestone (e.g., "Reaching week 20 is a wonderful halfway point!"). Acknowledge tracking effort.

🩺 **CLINICAL SUMMARY (SNAPSHOT)**
2–3 sentence overview of gestational age, trimester, and key findings. Use medical terms with lay explanation. Example: "At 18 weeks (mid-second trimester), you are likely experiencing *quickening*—the first fetal movements. Your blood pressure is within normal range, which is important in preventing preeclampsia (high blood pressure in pregnancy)."

🏥 **SYSTEMIC & LIFESTYLE FACTORS**
Integrate stress, sleep, diet, exercise, and medications with pregnancy health:
- Explain how each specific factor (e.g., stress 8/10, poor sleep, fair diet) affects maternal-fetal outcomes.
- If diet is poor: highlight risks like anemia, gestational diabetes.
- If sleep is poor: mention links with hypertension and mood disorders.
- If stress is high: explain impact on cortisol and pregnancy well-being.
- If exercise is low: emphasize benefits of light-moderate activity like walking, unless contraindicated.

🔬 **CLINICAL IMPRESSION**
**PRIMARY FOCUS:** Based on trimester, symptoms, and risk factors (e.g., "Moderate heartburn suggests gastroesophageal reflux, common in 2nd trimester due to uterine expansion and hormonal changes.").  
**SECONDARY POSSIBILITIES:** Other conditions linked to their history (e.g., swelling could be normal or an early sign of preeclampsia if BP elevated).  
**MONITORING GUIDANCE:** Clear markers to watch (e.g., "Track fetal kicks daily from 28 weeks—decreased movement requires urgent evaluation.").

💡 **PERSONALIZED TIPS**
- **Trimester-Specific:** Practical trimester care advice (e.g., 1st trimester = folic acid focus, 2nd = anatomy scan, 3rd = birth prep and kick counts).  
- **Nutritional Guidance:** Tie directly to their diet input (e.g., "Fair diet—prioritize iron-rich foods like spinach, lentils, lean meats to reduce anemia risk.").  
- **Exercise:** Safe movement based on exercise level.  
- **Symptom Management:** e.g., morning sickness → small frequent meals; back pain → pelvic tilts, support belts.  
- **Prenatal Care:** Which tests/appointments they should expect at their gestational stage.

🌸 **GENTLE REMINDERS**
- **Immediate Actions:** e.g., "If spotting increases or is accompanied by cramps, contact your provider immediately."  
- **When to Seek Care:** Red flags: heavy bleeding, severe headaches, sudden swelling, reduced fetal movement.  
- **Family History Considerations:** If family history of diabetes or hypertension → advise extra vigilance.  
- **Long-Term Tracking:** Encourage continuous logging of weight, BP, mood, fetal movements, sleep.

**IMPORTANT:** Start directly with the greeting. Do not add meta-commentary. Do not invent doctor names. Deliver insights as if in a real prenatal visit.`;
  }

  async processPregnancyInsights(insights, pregnancyData, userProfile) {
    try {
      // Convert to string - this is the COMPLETE AI response
      const textInsights = insights.toString();
      console.log('🔍 Processing pregnancy insights, text length:', textInsights.length);
      console.log('🔍 AI Response preview:', textInsights.substring(0, 200) + '...');
      
      // Create a clean, professional analysis object with COMPLETE content
      const result = {
        quickCheck: {
          gestationalAge: pregnancyData[pregnancyData.length - 1]?.gestationalAge || 'Not calculated',
          trimester: pregnancyData[pregnancyData.length - 1]?.trimester || 1,
          overallHealth: 'Good'
        },
        aiAnalysis: {
          title: "🤖 Dr. AI Pregnancy Analysis",
          subtitle: "Comprehensive prenatal health assessment",
          content: textInsights || "🤖 AI analysis is being generated... Please wait a moment for your personalized pregnancy insights. This will include trimester-specific guidance, symptom analysis, and personalized recommendations based on your pregnancy data.", // ALWAYS ensure content exists
          timestamp: new Date().toISOString()
        },
        riskAssessment: [
          "Monitor pregnancy progress",
          "Track symptoms and changes",
          "Watch for concerning symptoms"
        ],
        recommendations: [
          "Continue prenatal care",
          "Maintain healthy lifestyle habits",
          "Attend regular appointments"
        ],
        medicalAlerts: [],
        personalizedTips: [
          "Follow trimester-specific guidelines",
          "Maintain balanced nutrition",
          "Stay active with safe exercises",
          "Get adequate rest and sleep"
        ],
        gentleReminders: [
          "Remember to take prenatal vitamins",
          "Schedule regular check-ups",
          "Monitor your symptoms",
          "Stay hydrated and eat well"
        ]
      };
      
      console.log('🔍 Processed pregnancy insights result:', {
        aiAnalysis: !!result.aiAnalysis,
        aiAnalysisContent: result.aiAnalysis?.content?.length,
        contentPreview: result.aiAnalysis?.content?.substring(0, 100) + '...',
        riskAssessment: result.riskAssessment?.length,
        personalizedTips: result.personalizedTips?.length,
        gentleReminders: result.gentleReminders?.length
      });
      
      return result;
    } catch (error) {
      console.error('Error processing pregnancy insights:', error);
      return this.getFallbackPregnancyInsights(pregnancyData, userProfile);
    }
  }

  // ===== PREGNANCY-SPECIFIC EXTRACTION METHODS =====
  
  extractEnhancedSections(text) {
    const sections = {};
    
    // PREGNANCY-SPECIFIC section headers with unique patterns
    const sectionHeaders = [
      { key: 'pregnancyAssessment', patterns: ['🤰 **PREGNANCY ASSESSMENT**', '## 🤰 PREGNANCY ASSESSMENT', '🤰 PREGNANCY ASSESSMENT', '🤰 Pregnancy Assessment'] },
      { key: 'developmentalTracking', patterns: ['📈 **DEVELOPMENTAL TRACKING**', '## 📈 DEVELOPMENTAL TRACKING', '📈 DEVELOPMENTAL TRACKING', '📈 Developmental Tracking'] },
      { key: 'prenatalCare', patterns: ['💊 **PRENATAL CARE**', '## 💊 PRENATAL CARE', '💊 PRENATAL CARE', '💊 Prenatal Care'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 [PREGNANCY] Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 [PREGNANCY] Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 [PREGNANCY] Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ [PREGNANCY] Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
      if (!sections[section.key]) {
        console.log(`❌ [PREGNANCY] Failed to extract ${section.key} with any pattern`);
      }
    }
    
    return sections;
  }

  extractSection(text, header) {
    const lines = text.split('\n');
    let inSection = false;
    let sectionContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes(header)) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        if (line.startsWith('**') && line.endsWith('**') && line !== header) {
          break;
        }
        if (line.startsWith('## ') || line.startsWith('# ')) {
          break;
        }
        sectionContent.push(line);
      }
    }
    
    return sectionContent.join('\n').trim();
  }

  // ===== PREGNANCY-SPECIFIC HELPER METHODS =====
  
  createQuickCheckSummary(sections, pregnancyData) {
    const latestPregnancy = pregnancyData[pregnancyData.length - 1];
    return {
      gestationalAge: latestPregnancy.gestationalAge || 'Not calculated',
      trimester: latestPregnancy.trimester || 1,
      weight: latestPregnancy.weight || null,
      weightGain: latestPregnancy.weightGain || null,
      bloodPressure: latestPregnancy.bloodPressure || null,
      fetalHeartbeat: latestPregnancy.fetalHeartbeat || null,
      symptoms: latestPregnancy.symptoms || [],
      overallHealth: 'Good',
      nextMilestone: this.calculateNextMilestone(latestPregnancy)
    };
  }

  calculateNextMilestone(latestPregnancy) {
    const gestationalAge = parseInt(latestPregnancy.gestationalAge) || 0;
    
    if (gestationalAge < 12) {
      return 'First trimester screening (10-14 weeks)';
    } else if (gestationalAge < 20) {
      return 'Anatomy scan (18-22 weeks)';
    } else if (gestationalAge < 28) {
      return 'Glucose tolerance test (24-28 weeks)';
    } else if (gestationalAge < 36) {
      return 'Group B strep test (35-37 weeks)';
    } else {
      return 'Delivery preparation (37+ weeks)';
    }
  }

  extractRiskFromSections(sections) {
    const pregnancyAssessment = sections.pregnancyAssessment || '';
    const risks = [];
    
    // Analyze actual medical data from user's submission
    if (pregnancyAssessment.toLowerCase().includes('high blood pressure') || pregnancyAssessment.toLowerCase().includes('hypertension')) {
      risks.push('Blood pressure monitoring needed');
    }
    if (pregnancyAssessment.toLowerCase().includes('excessive weight gain') || pregnancyAssessment.toLowerCase().includes('rapid weight gain')) {
      risks.push('Weight gain monitoring recommended');
    }
    if (pregnancyAssessment.toLowerCase().includes('gestational diabetes') || pregnancyAssessment.toLowerCase().includes('diabetes')) {
      risks.push('Gestational diabetes screening needed');
    }
    if (pregnancyAssessment.toLowerCase().includes('preterm') || pregnancyAssessment.toLowerCase().includes('premature')) {
      risks.push('Preterm labor monitoring recommended');
    }
    if (pregnancyAssessment.toLowerCase().includes('preeclampsia') || pregnancyAssessment.toLowerCase().includes('eclampsia')) {
      risks.push('Preeclampsia screening needed');
    }
    
    return risks;
  }

  extractRecommendationsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const recommendations = [];
    
    if (clinicalSummary.toLowerCase().includes('prenatal vitamins')) {
      recommendations.push('Continue prenatal vitamin supplementation');
    }
    if (clinicalSummary.toLowerCase().includes('exercise')) {
      recommendations.push('Maintain appropriate exercise routine');
    }
    if (clinicalSummary.toLowerCase().includes('nutrition')) {
      recommendations.push('Focus on balanced pregnancy nutrition');
    }
    
    return recommendations;
  }

  extractAlertsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const alerts = [];
    
    if (clinicalSummary.toLowerCase().includes('immediate attention') || clinicalSummary.toLowerCase().includes('urgent')) {
      alerts.push('Immediate medical attention recommended');
    }
    if (clinicalSummary.toLowerCase().includes('high risk')) {
      alerts.push('High-risk pregnancy monitoring needed');
    }
    
    return alerts;
  }

  async generatePregnancyPersonalizedTips(pregnancyData, userProfile) {
    const tips = [];
    const latestPregnancy = pregnancyData[pregnancyData.length - 1];
    const trimester = latestPregnancy.trimester || 1;
    const gestationalAge = latestPregnancy.gestationalAge || '8';
    
    // Trimester-specific tips based on actual data
    if (trimester === 1) {
      tips.push(`Focus on folic acid supplementation - you're in the critical first trimester at ${gestationalAge} weeks`);
      tips.push('Avoid harmful substances like alcohol, smoking, and certain medications');
    } else if (trimester === 2) {
      tips.push('Enjoy increased energy and consider gentle exercise like prenatal yoga');
      tips.push('Focus on balanced nutrition for optimal fetal development');
    } else if (trimester === 3) {
      tips.push('Prepare for delivery and monitor for signs of labor');
      tips.push('Focus on comfort measures and birth preparation');
    }
    
    // Symptom-specific tips based on user's reported symptoms
    if (latestPregnancy.symptoms && latestPregnancy.symptoms.length > 0) {
      if (latestPregnancy.symptoms.includes('nausea') || latestPregnancy.symptoms.includes('morning sickness')) {
        tips.push('Eat small, frequent meals to manage nausea and morning sickness');
      }
      if (latestPregnancy.symptoms.includes('fatigue') || latestPregnancy.symptoms.includes('tiredness')) {
        tips.push('Prioritize rest and sleep for energy management');
      }
      if (latestPregnancy.symptoms.includes('back pain')) {
        tips.push('Use proper posture and consider prenatal massage for back pain relief');
      }
    }
    
    // Lifestyle-based tips
    if (latestPregnancy.stress > 6) {
      tips.push('Practice stress management techniques like meditation or gentle exercise');
    }
    if (latestPregnancy.exercise === 'none' || latestPregnancy.exercise === 'light') {
      tips.push('Consider adding gentle exercise like walking or prenatal yoga to your routine');
    }
    if (latestPregnancy.diet === 'poor' || latestPregnancy.diet === 'fair') {
      tips.push('Focus on nutrient-dense foods to support your baby\'s development');
    }
    
    return tips;
  }

  async generatePregnancyGentleReminders(pregnancyData, userProfile) {
    const reminders = [];
    const latestPregnancy = pregnancyData[pregnancyData.length - 1];
    const gestationalAge = parseInt(latestPregnancy.gestationalAge) || 8;
    const trimester = latestPregnancy.trimester || 1;
    
    // Gestational age-specific reminders based on actual data
    if (gestationalAge < 12) {
      reminders.push('Continue taking prenatal vitamins daily for optimal fetal development');
      reminders.push('Stay hydrated and maintain balanced nutrition to support early pregnancy');
      reminders.push('Schedule first prenatal appointment if not done already');
      reminders.push('Avoid harmful substances and focus on healthy lifestyle choices');
    } else if (gestationalAge < 20) {
      reminders.push('Prepare for anatomy scan appointment (18-22 weeks)');
      reminders.push('Continue regular prenatal care appointments');
      reminders.push('Monitor for increased energy as you enter second trimester');
    } else if (gestationalAge < 28) {
      reminders.push('Prepare for glucose tolerance test (24-28 weeks)');
      reminders.push('Continue monitoring fetal movement patterns');
      reminders.push('Focus on balanced nutrition for optimal fetal growth');
    } else {
      reminders.push('Monitor for signs of labor and prepare for delivery');
      reminders.push('Continue regular prenatal care appointments');
      reminders.push('Focus on comfort measures and birth preparation');
    }
    
    // Data-specific reminders based on user's actual submission
    if (latestPregnancy.medications && latestPregnancy.medications.length > 0) {
      reminders.push('Continue taking prescribed medications as directed by your healthcare provider');
    }
    if (latestPregnancy.supplements && latestPregnancy.supplements.length > 0) {
      reminders.push('Continue taking prenatal supplements as recommended');
    }
    if (latestPregnancy.exercise === 'none' || latestPregnancy.exercise === 'light') {
      reminders.push('Consider adding gentle exercise like walking to your daily routine');
    }
    if (latestPregnancy.stress > 6) {
      reminders.push('Practice stress management techniques for maternal and fetal well-being');
    }
    
    return reminders;
  }

  async getFallbackPregnancyInsights(pregnancyData, userProfile) {
    const latestPregnancy = pregnancyData[pregnancyData.length - 1];
    const gestationalAge = latestPregnancy.gestationalAge || '8';
    const trimester = latestPregnancy.trimester || 1;
    
    return {
      quickCheck: this.createQuickCheckSummary({}, pregnancyData),
      aiAnalysis: {
        title: "🤖 Dr. AI Pregnancy Analysis",
        subtitle: "Comprehensive prenatal health assessment",
        content: `🎉 Congratulations on your pregnancy! You're at an exciting ${gestationalAge} weeks in your first trimester - what an amazing journey you're on!

🤰 **PREGNANCY ASSESSMENT**
At ${gestationalAge} weeks pregnant, you're in the heart of your first trimester, a time of incredible development for your little one. Your body is doing amazing work creating new life!

📈 **DEVELOPMENTAL TRACKING**
Your baby is growing rapidly! At this stage, major organs are forming, and the heartbeat is strong. You're nurturing a tiny miracle every day.

💊 **PRENATAL CARE**
Keep up the excellent work with your prenatal vitamins! You're taking great care of yourself and your baby. Continue with regular check-ups and enjoy this special time.

**PERSONALIZED TIPS**
1. Celebrate this milestone - you're doing something incredible!
2. Focus on nutritious foods that support your baby's development
3. Gentle exercise like walking can boost your energy and mood
4. Rest when you need it - your body is working hard!

**GENTLE REMINDERS**
1. You're doing an amazing job taking care of yourself and your baby
2. Regular prenatal appointments help ensure everything is progressing beautifully
3. Look forward to your first ultrasound - it's such a magical moment!
4. Trust your body - it knows exactly what to do to nurture your growing baby

You're on an incredible journey, and you're doing wonderfully! 🌟`,
        timestamp: new Date().toISOString()
      },
      riskAssessment: [],
      recommendations: ['Continue regular prenatal care', 'Maintain healthy pregnancy lifestyle'],
      medicalAlerts: [],
      personalizedTips: await this.generatePregnancyPersonalizedTips(pregnancyData, userProfile),
      gentleReminders: await this.generatePregnancyGentleReminders(pregnancyData, userProfile)
    };
  }
}

export default PregnancyAIService;
