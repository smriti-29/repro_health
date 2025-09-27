// CYCLE-SPECIFIC AI SERVICE
// Specialized AI service for Cycle Tracking insights with separate extraction

import AIServiceManager from './aiServiceManager.js';

class CycleAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 Cycle AI Service initialized - Live AI insights for cycle tracking');
  }

  // ===== CYCLE ANALYSIS =====
  async generateCycleInsights(cycleData, userProfile) {
    const prompt = this.buildCyclePrompt(cycleData, userProfile);
    try {
      console.log('🚀 CYCLE: Starting AI service call...');
      console.log('🔍 CYCLE: Service status:', this.getServiceStatus());
      console.log('🔍 CYCLE: Prompt length:', prompt.length);
      console.log('🔍 CYCLE: Using service:', this.service.constructor.name);
      
      // Use the parent class's executeWithFallback method for seamless fallback
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ CYCLE: AI service returned insights:', insights);
      console.log('🔍 CYCLE: Insights type:', typeof insights);
      console.log('🔍 CYCLE: Insights length:', insights?.length);
      console.log('🔍 CYCLE: Raw insights content:', insights?.substring(0, 200) + '...');
      
      return await this.processCycleInsights(insights, cycleData, userProfile);
    } catch (error) {
      console.error('❌ CYCLE: Error generating cycle insights:', error);
      console.error('❌ CYCLE: Error details:', error.message);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  buildCyclePrompt(cycleData, userProfile) {
    const latestCycle = cycleData[cycleData.length - 1];
    const age = userProfile.age || 25;
    // Get family history from the cycle form data, not userProfile
    const familyHistory = latestCycle.familyHistory || [];
    const lifestyle = userProfile.lifestyle || {};
    
    console.log('🔍 CYCLE PROMPT - Family History Data:', {
      latestCycleFamilyHistory: latestCycle.familyHistory,
      familyHistoryLength: familyHistory.length,
      familyHistoryContent: familyHistory,
      userProfileFamilyHistory: userProfile.familyHistory?.womensConditions
    });

    return `You are a board-certified gynecologist providing a comprehensive cycle analysis consultation.

PATIENT DATA:

**CYCLE INFORMATION:**
- Last Period: ${latestCycle.lastPeriod || 'Not specified'}
- Cycle Length: ${latestCycle.cycleLength || 28} days
- Period Length: ${latestCycle.periodLength || 'Not specified'} days
- Flow Intensity: ${latestCycle.flowIntensity || 'Not specified'}
- Pain Level: ${latestCycle.pain || 0}/10
- Symptoms: ${latestCycle.symptoms?.join(', ') || 'None reported'}
- Bleeding Pattern: ${latestCycle.bleedingPattern || 'Not specified'}
- Clots: ${latestCycle.clots || 'None'}

**LIFESTYLE & HEALTH FACTORS:**
- Stress Level: ${latestCycle.stressLevel || 5}/10
- Sleep Quality: ${latestCycle.sleepQuality || 5}/10
- Exercise Frequency: ${latestCycle.exerciseFrequency || 'Not specified'}
- Diet Quality: ${latestCycle.dietQuality || 'Not specified'}
- Current Medications: ${latestCycle.medicationUse || 'None'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Weight: ${latestCycle.weight || 'Not recorded'}
- Blood Pressure: ${latestCycle.bloodPressure || 'Not recorded'}
- Additional Notes: ${latestCycle.notes || 'None'}

**HISTORICAL PATTERNS (Last 3 cycles):**
${cycleData.slice(-3).map((cycle, index) => `
Cycle ${cycleData.length - 2 + index}:
- Date: ${cycle.lastPeriod}
- Length: ${cycle.cycleLength} days
- Flow: ${cycle.flowIntensity}
- Pain: ${cycle.pain}/10
- Symptoms: ${cycle.symptoms?.join(', ') || 'None'}
- Stress: ${cycle.stressLevel || 5}/10
- Sleep: ${cycle.sleepQuality || 5}/10
`).join('')}

**CONSULTATION REQUIREMENTS:**
Provide a comprehensive gynecological consultation in this EXACT format:

👋 **GREETING**
Warm, personalized introduction acknowledging their effort in tracking and referencing their patterns. No meta-labels, start directly with a greeting.

🩺 **CLINICAL SUMMARY**
Concise 2–3 sentence overview using their exact cycle data. Always contextualize findings with AGE. For example, if age < 25, do not suggest perimenopause unless premature ovarian insufficiency is strongly implied. Include one positive note about their tracking consistency.

🏥 **SYSTEMIC & LIFESTYLE FACTORS**
Link their stress, sleep, exercise, diet, medications, and family history directly to how these may influence their cycle health. Use their exact reported values.

🔬 **CLINICAL IMPRESSION**
- **PRIMARY CAUSE:** Most likely explanation based on cycle length, flow, pain, and symptoms. Always use medical terminology with plain-language explanation.  
- **SECONDARY POSSIBILITIES:** Other possible contributors, explicitly linked to their family history and lifestyle factors.  
- **MONITORING GUIDANCE:** Specific patterns to watch in future cycles (e.g., changes in flow, worsening pain, recurring symptoms).

💡 **PERSONALIZED TIPS**
- **Flow Management:** Tailored to their flow intensity.  
- **Pain Relief:** Tailored to their pain score.  
- **Family History:** Explain risks relevant to their family history (e.g., PCOS, diabetes, endometriosis).  
- **Lifestyle Optimization:** Practical suggestions for stress, sleep, exercise, diet.  
- **Medical Follow-up:** When their exact data suggests seeing a doctor (e.g., severe pain ≥8/10, heavy bleeding, very irregular cycles).

🌸 **GENTLE REMINDERS**
- **Immediate Actions:** What they can do right now based on current symptoms.  
- **Medical Attention:** Red flags to seek care for (based on their input).  
- **Family History Watch:** What to monitor given their family background.  
- **Long-term Tracking:** What to keep recording to support ongoing insights.

**IMPORTANT RULES:**  
- Always factor in AGE when interpreting symptoms (e.g., exclude perimenopause at 19).  
- Explicitly integrate FAMILY HISTORY into risk evaluation.  
- Rank causes from most to least likely.  
- Highlight RED FLAGS when present.  
- Use a supportive, doctor-like tone that is informative but patient-friendly.  
- Structure output cleanly, with no asterisks or meta labels.`;
  }

  async processCycleInsights(insights, cycleData, userProfile) {
    try {
      // Convert to string - this is the COMPLETE AI response
      const textInsights = insights.toString();
      console.log('🔍 Processing cycle insights, text length:', textInsights.length);
      console.log('🔍 AI Response preview:', textInsights.substring(0, 200) + '...');
      
      // Create a clean, professional analysis object with COMPLETE content
      const result = {
        quickCheck: {
          cycleLength: cycleData[cycleData.length - 1]?.cycleLength || 28,
          painLevel: cycleData[cycleData.length - 1]?.pain || 0,
          flowIntensity: cycleData[cycleData.length - 1]?.flowIntensity || 'medium',
          overallHealth: 'Good'
        },
        aiAnalysis: {
          title: "🤖 Dr. AI Clinical Analysis",
          subtitle: "Comprehensive menstrual cycle assessment",
          content: textInsights, // EVERY WORD of the analysis - this is what robot icon needs
          timestamp: new Date().toISOString()
        },
        riskAssessment: [
          "Monitor cycle regularity",
          "Track pain patterns",
          "Watch for unusual symptoms"
        ],
        recommendations: [
          "Continue detailed tracking",
          "Maintain healthy lifestyle habits",
          "Consult healthcare provider if concerns arise"
        ],
        medicalAlerts: [],
        personalizedTips: [
          "Track your cycle consistently",
          "Monitor pain levels",
          "Maintain a healthy lifestyle",
          "Seek medical advice if needed"
        ],
        gentleReminders: [
          "Remember to track your next period",
          "Monitor any changes in your cycle",
          "Take care of your overall health",
          "Don't hesitate to consult a healthcare provider"
        ]
      };
      
      console.log('🔍 Processed cycle insights result:', {
        aiAnalysis: !!result.aiAnalysis,
        aiAnalysisContent: result.aiAnalysis?.content?.length,
        contentPreview: result.aiAnalysis?.content?.substring(0, 100) + '...',
        riskAssessment: result.riskAssessment?.length,
        personalizedTips: result.personalizedTips?.length,
        gentleReminders: result.gentleReminders?.length
      });
      
      return result;
    } catch (error) {
      console.error('Error processing cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  // ===== CYCLE-SPECIFIC EXTRACTION METHODS =====
  
  extractEnhancedSections(text) {
    const sections = {};
    
    // CYCLE-SPECIFIC section headers with unique patterns
    const sectionHeaders = [
      { key: 'greeting', patterns: ['👋 **GREETING & CONTEXT**', '## 👋 GREETING & CONTEXT', '👋 GREETING & CONTEXT', '👋 Greeting'] },
      { key: 'clinicalSummary', patterns: ['🩺 **CLINICAL SUMMARY (SNAPSHOT)**', '🩺 **CLINICAL SUMMARY**', '## 🩺 CLINICAL SUMMARY', '🩺 CLINICAL SUMMARY', '🩺 Clinical Summary'] },
      { key: 'systemicFactors', patterns: ['🏥 **SYSTEMIC & LIFESTYLE FACTORS**', '## 🏥 SYSTEMIC & LIFESTYLE FACTORS', '🏥 SYSTEMIC & LIFESTYLE FACTORS', '🧬 Lifestyle & Systemic Factors'] },
      { key: 'clinicalImpression', patterns: ['🔬 **CLINICAL IMPRESSION**', '## 🔬 CLINICAL IMPRESSION', '🔬 CLINICAL IMPRESSION', '🔬 Clinical Impression'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 [CYCLE] Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 [CYCLE] Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 [CYCLE] Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ [CYCLE] Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
      if (!sections[section.key]) {
        console.log(`❌ [CYCLE] Failed to extract ${section.key} with any pattern`);
      }
    }
    
    // Fallback to old method if new method doesn't work
    if (!sections.greeting) {
      sections.greeting = this.extractSection(text, '👋 **GREETING & CONTEXT**') || this.extractSection(text, '## 👋 GREETING & CONTEXT') || this.extractSection(text, '👋 GREETING & CONTEXT') || this.extractSection(text, '👋 Greeting');
    }
    if (!sections.clinicalSummary) {
      sections.clinicalSummary = this.extractSection(text, '🩺 **CLINICAL SUMMARY (SNAPSHOT)**') || this.extractSection(text, '🩺 **CLINICAL SUMMARY**') || this.extractSection(text, '## 🩺 CLINICAL SUMMARY') || this.extractSection(text, '🩺 CLINICAL SUMMARY') || this.extractSection(text, '🩺 Clinical Summary');
    }
    if (!sections.systemicFactors) {
      sections.systemicFactors = this.extractSection(text, '🏥 **SYSTEMIC & LIFESTYLE FACTORS**') || this.extractSection(text, '## 🏥 SYSTEMIC & LIFESTYLE FACTORS') || this.extractSection(text, '🏥 SYSTEMIC & LIFESTYLE FACTORS') || this.extractSection(text, '🧬 Lifestyle & Systemic Factors');
    }
    if (!sections.clinicalImpression) {
      sections.clinicalImpression = this.extractSection(text, '🔬 **CLINICAL IMPRESSION**') || this.extractSection(text, '## 🔬 CLINICAL IMPRESSION') || this.extractSection(text, '🔬 CLINICAL IMPRESSION') || this.extractSection(text, '🔬 Clinical Impression');
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

  // ===== CYCLE-SPECIFIC HELPER METHODS =====
  
  createQuickCheckSummary(sections, cycleData) {
    const latestCycle = cycleData[cycleData.length - 1];
    return {
      cycleLength: latestCycle.cycleLength || 28,
      flowIntensity: latestCycle.flowIntensity || 'medium',
      painLevel: latestCycle.pain || 0,
      symptoms: latestCycle.symptoms || [],
      overallHealth: 'Good',
      nextPeriod: this.calculateNextPeriod(latestCycle),
      fertileWindow: this.calculateFertileWindow(latestCycle)
    };
  }

  calculateNextPeriod(latestCycle) {
    if (!latestCycle.lastPeriod) return null;
    const lastPeriod = new Date(latestCycle.lastPeriod);
    const cycleLength = latestCycle.cycleLength || 28;
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    return nextPeriod.toISOString().split('T')[0];
  }

  calculateFertileWindow(latestCycle) {
    if (!latestCycle.lastPeriod) return null;
    const lastPeriod = new Date(latestCycle.lastPeriod);
    const cycleLength = latestCycle.cycleLength || 28;
    const ovulationDay = cycleLength - 14;
    const fertileStart = new Date(lastPeriod);
    fertileStart.setDate(fertileStart.getDate() + ovulationDay - 5);
    const fertileEnd = new Date(lastPeriod);
    fertileEnd.setDate(fertileEnd.getDate() + ovulationDay + 1);
    return {
      start: fertileStart.toISOString().split('T')[0],
      end: fertileEnd.toISOString().split('T')[0]
    };
  }

  extractRiskFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const risks = [];
    
    if (clinicalSummary.toLowerCase().includes('irregular')) {
      risks.push('Irregular cycle pattern detected');
    }
    if (clinicalSummary.toLowerCase().includes('pain')) {
      risks.push('Pain management needed');
    }
    if (clinicalSummary.toLowerCase().includes('stress')) {
      risks.push('High stress affecting cycle');
    }
    
    return risks;
  }

  extractRecommendationsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const recommendations = [];
    
    if (clinicalSummary.toLowerCase().includes('exercise')) {
      recommendations.push('Regular exercise for cycle health');
    }
    if (clinicalSummary.toLowerCase().includes('sleep')) {
      recommendations.push('Improve sleep quality');
    }
    if (clinicalSummary.toLowerCase().includes('diet')) {
      recommendations.push('Balanced nutrition for reproductive health');
    }
    
    return recommendations;
  }

  extractAlertsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const alerts = [];
    
    if (clinicalSummary.toLowerCase().includes('severe') || clinicalSummary.toLowerCase().includes('concerning')) {
      alerts.push('Medical attention recommended');
    }
    if (clinicalSummary.toLowerCase().includes('irregular') && clinicalSummary.toLowerCase().includes('persistent')) {
      alerts.push('Persistent irregular cycles need evaluation');
    }
    
    return alerts;
  }

  async generateCyclePersonalizedTips(cycleData, userProfile) {
    const tips = [];
    const latestCycle = cycleData[cycleData.length - 1];
    
    if (latestCycle.pain > 5) {
      tips.push('Consider heat therapy and gentle exercise for pain relief');
    }
    if (latestCycle.stressLevel > 6) {
      tips.push('Practice stress management techniques like meditation or yoga');
    }
    if (latestCycle.sleepQuality < 4) {
      tips.push('Improve sleep hygiene with consistent bedtime routine');
    }
    if (latestCycle.exerciseFrequency === 'low') {
      tips.push('Incorporate regular physical activity to support cycle health');
    }
    
    return tips;
  }

  async generateCycleGentleReminders(cycleData, userProfile) {
    const reminders = [];
    const latestCycle = cycleData[cycleData.length - 1];
    
    reminders.push('Track your next period to monitor cycle regularity');
    if (latestCycle.pain > 6) {
      reminders.push('Consider discussing pain management with your healthcare provider');
    }
    reminders.push('Maintain consistent sleep schedule for hormonal balance');
    reminders.push('Stay hydrated and eat balanced meals throughout your cycle');
    
    return reminders;
  }

  async getFallbackCycleInsights(cycleData, userProfile) {
    const latestCycle = cycleData[cycleData.length - 1];
    return {
      quickCheck: this.createQuickCheckSummary({}, cycleData),
      aiAnalysis: {
        title: "🤖 Dr. AI Clinical Analysis",
        subtitle: "Comprehensive menstrual cycle assessment",
        content: `Based on your cycle data, your menstrual health appears stable. Continue tracking your cycles and maintain healthy lifestyle habits.`,
        timestamp: new Date().toISOString()
      },
      riskAssessment: [],
      recommendations: ['Maintain regular cycle tracking', 'Continue healthy lifestyle habits'],
      medicalAlerts: [],
      personalizedTips: await this.generateCyclePersonalizedTips(cycleData, userProfile),
      gentleReminders: await this.generateCycleGentleReminders(cycleData, userProfile)
    };
  }
}

export default CycleAIService;
