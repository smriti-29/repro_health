// FERTILITY-SPECIFIC AI SERVICE
// Specialized AI service for Fertility Tracking insights with separate extraction

import AIServiceManager from './aiServiceManager.js';

class FertilityAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 Fertility AI Service initialized - Live AI insights for fertility tracking');
  }

  // ===== FERTILITY ANALYSIS =====
  async generateFertilityInsights(fertilityData, userProfile) {
    const prompt = this.buildFertilityPrompt(fertilityData, userProfile);
    try {
      console.log('🚀 FERTILITY: Starting AI service call...');
      console.log('🔍 FERTILITY: Service status:', this.getServiceStatus());
      console.log('🔍 FERTILITY: Prompt length:', prompt.length);
      console.log('🔍 FERTILITY: Using service:', this.service.constructor.name);
      
      // Use the parent class's executeWithFallback method for seamless fallback
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ FERTILITY: AI service returned insights:', insights);
      console.log('🔍 FERTILITY: Insights type:', typeof insights);
      console.log('🔍 FERTILITY: Insights length:', insights?.length);
      console.log('🔍 FERTILITY: Raw insights content:', insights?.substring(0, 200) + '...');
      
      return await this.processFertilityInsights(insights, fertilityData, userProfile);
    } catch (error) {
      console.error('❌ FERTILITY: Error generating fertility insights:', error);
      console.error('❌ FERTILITY: Error details:', error.message);
      return this.getFallbackFertilityInsights(fertilityData, userProfile);
    }
  }

  buildFertilityPrompt(fertilityData, userProfile) {
    const latestFertility = fertilityData[fertilityData.length - 1];
    const age = userProfile.age || 25;
    const conditions = userProfile.conditions?.reproductive || [];
    // Get family history from the fertility form data, not userProfile
    const familyHistory = latestFertility.familyHistory || [];
    const lifestyle = userProfile.lifestyle || {};
    
    // Get cycle data from cycle tracking
    const cycleData = JSON.parse(localStorage.getItem(`afabCycleData_${userProfile?.id || userProfile?.email || 'anonymous'}`) || '[]');
    const latestCycle = cycleData[cycleData.length - 1];
    
    // Calculate current cycle phase and ovulation timing
    const currentDate = new Date();
    const lastPeriod = latestCycle?.lastPeriod ? new Date(latestCycle.lastPeriod) : null;
    const cycleLength = latestCycle?.cycleLength || 28;
    const daysSincePeriod = lastPeriod ? Math.floor((currentDate - lastPeriod) / (1000 * 60 * 60 * 24)) : 0;
    const expectedOvulation = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000) : null;
    const expectedPeriod = lastPeriod ? new Date(lastPeriod.getTime() + cycleLength * 24 * 60 * 60 * 1000) : null;
    
    // Calculate fertile window (5 days before ovulation + ovulation day)
    const fertileWindowStart = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 19) * 24 * 60 * 60 * 1000) : null;
    const fertileWindowEnd = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 13) * 24 * 60 * 60 * 1000) : null;
    
    // Calculate safe periods for NFP
    const safePeriodStart = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 6) * 24 * 60 * 60 * 1000) : null;
    const safePeriodEnd = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 1) * 24 * 60 * 60 * 1000) : null;
    
    // Calculate optimal TTC timing (3 days before ovulation to ovulation day)
    const ttcOptimalStart = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 17) * 24 * 60 * 60 * 1000) : null;
    const ttcOptimalEnd = lastPeriod ? new Date(lastPeriod.getTime() + (cycleLength - 13) * 24 * 60 * 60 * 1000) : null;
    
    // Determine cycle phase
    let cyclePhase = 'Unknown';
    let fertilityStatus = 'Unknown';
    if (daysSincePeriod >= 0) {
      if (daysSincePeriod <= 5) cyclePhase = 'Menstrual Phase';
      else if (daysSincePeriod <= 13) cyclePhase = 'Follicular Phase';
      else if (daysSincePeriod <= 16) cyclePhase = 'Ovulatory Phase';
      else cyclePhase = 'Luteal Phase';
      
      if (daysSincePeriod >= 10 && daysSincePeriod <= 16) fertilityStatus = 'High Fertility';
      else if (daysSincePeriod >= 8 && daysSincePeriod <= 18) fertilityStatus = 'Moderate Fertility';
      else fertilityStatus = 'Low Fertility';
    }
    
    return `You are a board-certified gynecologist specializing in fertility and reproductive health.

PATIENT DATA:

**CURRENT CYCLE STATUS (from Cycle Tracking):**
- Last Period: ${lastPeriod ? lastPeriod.toLocaleDateString() : 'Not recorded'}
- Cycle Length: ${cycleLength} days
- Days Since Period: ${daysSincePeriod} days
- Current Cycle Phase: ${cyclePhase}
- Fertility Status: ${fertilityStatus}
- Expected Ovulation: ${expectedOvulation ? expectedOvulation.toLocaleDateString() : 'Not calculated'}
- Expected Next Period: ${expectedPeriod ? expectedPeriod.toLocaleDateString() : 'Not calculated'}

**CALCULATED FERTILITY TIMING:**
- Fertile Window: ${fertileWindowStart && fertileWindowEnd ? fertileWindowStart.toLocaleDateString() + " to " + fertileWindowEnd.toLocaleDateString() : 'Not calculated'}
- Peak Fertility Day: ${expectedOvulation ? expectedOvulation.toLocaleDateString() : 'Not calculated'}
- Safe Period (NFP): ${safePeriodStart && safePeriodEnd ? safePeriodStart.toLocaleDateString() + " to " + safePeriodEnd.toLocaleDateString() : 'Not calculated'}
- Optimal TTC Window: ${ttcOptimalStart && ttcOptimalEnd ? ttcOptimalStart.toLocaleDateString() + " to " + ttcOptimalEnd.toLocaleDateString() : 'Not calculated'}

**FERTILITY GOALS & HISTORY:**
- Fertility Goal: ${latestFertility.fertilityGoal || 'Not specified'} (${latestFertility.fertilityGoal === 'ttc' ? 'Trying to Conceive' : latestFertility.fertilityGoal === 'nfp' ? 'Natural Family Planning' : 'Health Monitoring'})
- Conception Timeline: ${latestFertility.conceptionTimeline || 'Not specified'}
- Tracking Mode: ${latestFertility.trackingMode || 'Not specified'}
- Previous Pregnancies: ${latestFertility.previousPregnancies || 0}
- Previous Miscarriages: ${latestFertility.previousMiscarriages || 0}
- Fertility Treatments: ${latestFertility.fertilityTreatments?.join(', ') || 'None'}
- Contraception Preference: ${latestFertility.contraceptionPreference || 'None'}

**BASAL BODY TEMPERATURE (BBT):**
- BBT: ${latestFertility.bbt || 'Not recorded'}°F at ${latestFertility.bbtTime || 'Not specified'}
- BBT Method: ${latestFertility.bbtMethod || 'oral'}

**CERVICAL MUCUS ANALYSIS:**
- Cervical Mucus: ${latestFertility.cervicalMucus || 'Not observed'}
- Mucus Amount: ${latestFertility.mucusAmount || 'Not specified'}
- Mucus Stretch: ${latestFertility.mucusStretch || 0} cm

**CERVICAL POSITION:**
- Cervical Position: ${latestFertility.cervicalPosition || 'Not checked'}

**OVULATION TESTING:**
- Ovulation Test: ${latestFertility.ovulationTest || 'Not tested'}
- LH Level: ${latestFertility.lhLevel || 'Not tested'}
- Test Time: ${latestFertility.testTime || 'Not specified'}
- Test Brand: ${latestFertility.testBrand || 'Not specified'}

**PROGESTERONE TESTING:**
- Progesterone Level: ${latestFertility.progesteroneLevel || 'Not tested'}
- Progesterone Test Date: ${latestFertility.progesteroneTestDate || 'Not tested'}

**INTERCOURSE & CONCEPTION:**
- Intercourse: ${latestFertility.intercourse ? 'Yes' : 'No'}
- Intercourse Time: ${latestFertility.intercourseTime || 'Not specified'}
- Contraception: ${latestFertility.contraception || 'none'}
- Pregnancy Test: ${latestFertility.pregnancyTest || 'Not tested'}
- Pregnancy Test Result: ${latestFertility.pregnancyTestResult || 'Not tested'}

ADVANCED FERTILITY INDICATORS:
- Libido: ${latestFertility.libido || 5}/10
- Energy: ${latestFertility.energy || 5}/10
- Mood: ${latestFertility.mood || 5}/10
- Sleep: ${latestFertility.sleep || 5}/10
- Stress: ${latestFertility.stress || 5}/10

MEDICAL & LIFESTYLE FACTORS:
- Medications: ${latestFertility.medications?.join(', ') || 'None'}
- Supplements: ${latestFertility.supplements?.join(', ') || 'None'}
- Exercise: ${latestFertility.exercise || 'Not specified'}
- Alcohol: ${latestFertility.alcohol || 'Not specified'}
- Smoking: ${latestFertility.smoking || 'Not specified'}
- Caffeine: ${latestFertility.caffeine || 0} cups/day

COMPREHENSIVE HEALTH ASSESSMENT:
- Weight: ${latestFertility.weight || 'Not recorded'} lbs
- Blood Pressure: ${latestFertility.bloodPressure || 'Not recorded'}
- Stress Level: ${latestFertility.stressLevel || 5}/10
- Sleep Quality: ${latestFertility.sleepQuality || 5}/10
- Exercise Frequency: ${latestFertility.exerciseFrequency || 'Not specified'}
- Diet Quality: ${latestFertility.dietQuality || 'Not specified'}
- Medication Use: ${latestFertility.medicationUse?.join(', ') || 'None'}
- Family History: ${latestFertility.familyHistory?.join(', ') || 'None'}

SYMPTOMS & OBSERVATIONS:
- Symptoms: ${latestFertility.symptoms?.join(', ') || 'None'}
- Cycle Day: ${latestFertility.cycleDay || 1}
- Days Since Period: ${latestFertility.daysSincePeriod || 0}
- Expected Ovulation: ${latestFertility.expectedOvulation || 'Not calculated'}
- Expected Period: ${latestFertility.expectedPeriod || 'Not calculated'}
- Notes: ${latestFertility.notes || 'None'}

HISTORICAL FERTILITY DATA (Last 3 entries):
${fertilityData.slice(-3).map((entry, index) => `
Entry ${fertilityData.length - 2 + index}:
- BBT: ${entry.bbt || 'Not recorded'}°F
- Mucus: ${entry.cervicalMucus || 'Not observed'}
- Position: ${entry.cervicalPosition || 'Not checked'}
- Test: ${entry.ovulationTest || 'Not tested'}
- Intercourse: ${entry.intercourse ? 'Yes' : 'No'}
`).join('')}

**CONSULTATION REQUIREMENTS:**
Provide a comprehensive fertility consultation in this EXACT format:

👋 **GREETING**
Warm, personalized introduction acknowledging their detailed fertility tracking efforts and current cycle phase.

🩺 **CLINICAL SUMMARY (SNAPSHOT)**
Concise 2-3 sentence summary using medical terms WITH clear explanations. Always include one positive note about their tracking consistency. Mention their current cycle phase and fertility status. Example: "Your BBT of 98.2°F (basal body temperature) suggests you're in the luteal phase, indicating..."

🏥 **SYSTEMIC & LIFESTYLE FACTORS**
Link their specific stress level, sleep quality, exercise, diet, medications, and family history to their fertility health. Use their exact inputs and explain how each factor affects their fertility.

🔬 **CLINICAL IMPRESSION**
**PRIMARY CAUSE:** [Based on their specific fertility data, cycle phase, and goal - what's the most likely explanation with medical term and explanation]
**SECONDARY POSSIBILITIES:** [Based on their family history, lifestyle factors, and other symptoms - what else could be affecting fertility]
**MONITORING GUIDANCE:** [What specific patterns to watch based on their fertility data and cycle phase]

💡 **PERSONALIZED TIPS** (directly mapped to their inputs and fertility goal)
${latestFertility.fertilityGoal === 'ttc' ? `
**TTC-SPECIFIC ADVICE:**
- Current cycle phase: ${cyclePhase} - ${daysSincePeriod} days since last period
- **OPTIMAL INTERCOURSE TIMING:** ${ttcOptimalStart && ttcOptimalEnd ? `Have intercourse from ${ttcOptimalStart.toLocaleDateString()} to ${ttcOptimalEnd.toLocaleDateString()} for maximum conception chances` : 'Calculate optimal timing based on cycle'}
- **PEAK FERTILITY DAY:** ${expectedOvulation ? `Target intercourse on ${expectedOvulation.toLocaleDateString()} (ovulation day)` : 'Calculate ovulation day'}
- **FERTILE WINDOW:** ${fertileWindowStart && fertileWindowEnd ? `Full fertile window: ${fertileWindowStart.toLocaleDateString()} to ${fertileWindowEnd.toLocaleDateString()}` : 'Calculate fertile window'}
- BBT tracking: ${latestFertility.bbt ? `Your BBT of ${latestFertility.bbt}°F suggests ${latestFertility.bbt > 98.0 ? 'post-ovulatory phase' : 'pre-ovulatory phase'}` : 'Start BBT tracking for better ovulation detection'}
- Cervical mucus: ${latestFertility.cervicalMucus ? `Your ${latestFertility.cervicalMucus} mucus indicates ${latestFertility.cervicalMucus === 'egg-white' ? 'high fertility - perfect timing!' : 'moderate fertility - continue tracking'}` : 'Monitor cervical mucus changes'}
- **INTERCOURSE FREQUENCY:** Aim for every other day during fertile window, daily during peak days
` : latestFertility.fertilityGoal === 'nfp' ? `
**NFP-SPECIFIC ADVICE:**
- Current cycle phase: ${cyclePhase} - ${daysSincePeriod} days since last period
- **AVOID INTERCOURSE DURING:** ${fertileWindowStart && fertileWindowEnd ? `High fertility period: ${fertileWindowStart.toLocaleDateString()} to ${fertileWindowEnd.toLocaleDateString()} - use contraception or abstain` : 'Calculate high fertility period'}
- **SAFE PERIOD FOR INTERCOURSE:** ${safePeriodStart && safePeriodEnd ? `Safer period: ${safePeriodStart.toLocaleDateString()} to ${safePeriodEnd.toLocaleDateString()}` : 'Calculate safe period'}
- **CURRENT STATUS:** ${fertilityStatus === 'High Fertility' ? 'HIGH FERTILITY - avoid intercourse or use contraception' : fertilityStatus === 'Moderate Fertility' ? 'MODERATE FERTILITY - use caution and contraception' : 'LOW FERTILITY - safer for natural family planning'}
- BBT tracking: ${latestFertility.bbt ? `Your BBT of ${latestFertility.bbt}°F suggests ${latestFertility.bbt > 98.0 ? 'post-ovulatory phase - safer period' : 'pre-ovulatory phase - monitor closely'}` : 'Continue BBT tracking for cycle awareness'}
- Cervical mucus: ${latestFertility.cervicalMucus ? `Your ${latestFertility.cervicalMucus} mucus indicates ${latestFertility.cervicalMucus === 'egg-white' ? 'HIGH FERTILITY - avoid intercourse' : 'moderate fertility - use caution'}` : 'Monitor cervical mucus for fertility awareness'}
- **CONTRACEPTION BACKUP:** Use barrier methods during uncertain periods
` : `
**HEALTH MONITORING ADVICE:**
- Current cycle phase: ${cyclePhase} - ${daysSincePeriod} days since last period
- **FERTILITY AWARENESS:** ${fertileWindowStart && fertileWindowEnd ? `Fertile window: ${fertileWindowStart.toLocaleDateString()} to ${fertileWindowEnd.toLocaleDateString()}` : 'Track cycle patterns'}
- **OVULATION PREDICTION:** ${expectedOvulation ? `Expected ovulation: ${expectedOvulation.toLocaleDateString()}` : 'Calculate ovulation timing'}
- Cycle awareness: Continue tracking for health monitoring and cycle understanding
- BBT tracking: ${latestFertility.bbt ? `Your BBT of ${latestFertility.bbt}°F suggests ${latestFertility.bbt > 98.0 ? 'post-ovulatory phase' : 'pre-ovulatory phase'}` : 'BBT tracking helps understand cycle patterns'}
- Cervical mucus: ${latestFertility.cervicalMucus ? `Your ${latestFertility.cervicalMucus} mucus indicates ${latestFertility.cervicalMucus === 'egg-white' ? 'high fertility phase' : 'moderate fertility phase'}` : 'Monitor cervical mucus for cycle awareness'}
- Health monitoring: Track patterns for overall reproductive health
`}

🌸 **GENTLE REMINDERS**
- Specific reminders based on their fertility symptoms, patterns, and current cycle phase
- When to seek fertility consultation based on their data and goals
- Family history considerations if applicable
- Long-term fertility monitoring based on their cycle patterns and goals

**IMPORTANT:** Start directly with the greeting. Do not include any meta-commentary about "putting on a white coat" or "being ready to provide consultation." Do not introduce yourself as "Dr. [Your Name]" or any specific name. Begin immediately with a warm, professional greeting without any name introduction.`;
  }

  async processFertilityInsights(insights, fertilityData, userProfile) {
    try {
      // SIMPLE SOLUTION: Return the full AI response as one comprehensive analysis
      const textInsights = insights.toString();
      
      // Create a clean, professional analysis object
      return {
        quickCheck: this.createQuickCheckSummary({}, fertilityData),
        aiAnalysis: {
          title: "🤖 Dr. AI Fertility Analysis",
          subtitle: "Comprehensive fertility health assessment",
          content: textInsights,
          timestamp: new Date().toISOString()
        },
        riskAssessment: this.extractRiskFromSections({ clinicalSummary: textInsights }),
        recommendations: this.extractRecommendationsFromSections({ clinicalSummary: textInsights }),
        medicalAlerts: this.extractAlertsFromSections({ clinicalSummary: textInsights }),
        personalizedTips: await this.generateFertilityPersonalizedTips(fertilityData, userProfile),
        gentleReminders: await this.generateFertilityGentleReminders(fertilityData, userProfile)
      };
    } catch (error) {
      console.error('Error processing fertility insights:', error);
      return this.getFallbackFertilityInsights(fertilityData, userProfile);
    }
  }

  // ===== FERTILITY-SPECIFIC EXTRACTION METHODS =====
  
  extractEnhancedSections(text) {
    const sections = {};
    
    // FERTILITY-SPECIFIC section headers with unique patterns
    const sectionHeaders = [
      { key: 'fertilityAssessment', patterns: ['🌱 **FERTILITY ASSESSMENT**', '## 🌱 FERTILITY ASSESSMENT', '🌱 FERTILITY ASSESSMENT', '🌱 Fertility Assessment'] },
      { key: 'ovulationAnalysis', patterns: ['📊 **OVULATION ANALYSIS**', '## 📊 OVULATION ANALYSIS', '📊 OVULATION ANALYSIS', '📊 Ovulation Analysis'] },
      { key: 'fertilityOptimization', patterns: ['🎯 **FERTILITY OPTIMIZATION**', '## 🎯 FERTILITY OPTIMIZATION', '🎯 FERTILITY OPTIMIZATION', '🎯 Fertility Optimization'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 [FERTILITY] Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 [FERTILITY] Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 [FERTILITY] Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ [FERTILITY] Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
      if (!sections[section.key]) {
        console.log(`❌ [FERTILITY] Failed to extract ${section.key} with any pattern`);
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

  // ===== FERTILITY-SPECIFIC HELPER METHODS =====
  
  createQuickCheckSummary(sections, fertilityData) {
    const latestFertility = fertilityData[fertilityData.length - 1];
    return {
      fertilityGoal: latestFertility.fertilityGoal || 'Not specified',
      bbt: latestFertility.bbt || null,
      cervicalMucus: latestFertility.cervicalMucus || 'Not observed',
      ovulationTest: latestFertility.ovulationTest || 'Not tested',
      intercourse: latestFertility.intercourse || false,
      overallFertility: 'Good',
      nextFertileWindow: this.calculateNextFertileWindow(fertilityData)
    };
  }

  calculateNextFertileWindow(fertilityData) {
    // Calculate based on cycle data if available
    const latestEntry = fertilityData[fertilityData.length - 1];
    if (!latestEntry.date) return null;
    
    const entryDate = new Date(latestEntry.date);
    const cycleLength = 28; // Default cycle length
    const ovulationDay = cycleLength - 14;
    const fertileStart = new Date(entryDate);
    fertileStart.setDate(fertileStart.getDate() + ovulationDay - 5);
    const fertileEnd = new Date(entryDate);
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
      risks.push('Irregular ovulation pattern detected');
    }
    if (clinicalSummary.toLowerCase().includes('low')) {
      risks.push('Low fertility indicators');
    }
    if (clinicalSummary.toLowerCase().includes('stress')) {
      risks.push('Stress affecting fertility');
    }
    
    return risks;
  }

  extractRecommendationsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const recommendations = [];
    
    if (clinicalSummary.toLowerCase().includes('timing')) {
      recommendations.push('Optimize intercourse timing for conception');
    }
    if (clinicalSummary.toLowerCase().includes('lifestyle')) {
      recommendations.push('Improve lifestyle factors for fertility');
    }
    if (clinicalSummary.toLowerCase().includes('tracking')) {
      recommendations.push('Continue detailed fertility tracking');
    }
    
    return recommendations;
  }

  extractAlertsFromSections(sections) {
    const clinicalSummary = sections.clinicalSummary || '';
    const alerts = [];
    
    if (clinicalSummary.toLowerCase().includes('consultation') || clinicalSummary.toLowerCase().includes('specialist')) {
      alerts.push('Fertility specialist consultation recommended');
    }
    if (clinicalSummary.toLowerCase().includes('persistent') && clinicalSummary.toLowerCase().includes('irregular')) {
      alerts.push('Persistent irregular patterns need evaluation');
    }
    
    return alerts;
  }

  async generateFertilityPersonalizedTips(fertilityData, userProfile) {
    const tips = [];
    const latestFertility = fertilityData[fertilityData.length - 1];
    
    if (latestFertility.bbt && latestFertility.bbt < 97.5) {
      tips.push('Your BBT suggests potential ovulation - continue tracking');
    }
    if (latestFertility.cervicalMucus === 'egg-white') {
      tips.push('Egg-white cervical mucus indicates high fertility - optimal timing for conception');
    }
    if (latestFertility.ovulationTest === 'positive') {
      tips.push('Positive ovulation test - fertile window is open');
    }
    if (latestFertility.fertilityGoal === 'ttc') {
      tips.push('Focus on timing intercourse during fertile window');
    }
    
    return tips;
  }

  async generateFertilityGentleReminders(fertilityData, userProfile) {
    const reminders = [];
    const latestFertility = fertilityData[fertilityData.length - 1];
    
    reminders.push('Continue tracking BBT daily for ovulation detection');
    reminders.push('Monitor cervical mucus changes throughout your cycle');
    if (latestFertility.fertilityGoal === 'ttc') {
      reminders.push('Time intercourse during fertile window for best conception chances');
    }
    reminders.push('Maintain healthy lifestyle habits to support fertility');
    
    return reminders;
  }

  async getFallbackFertilityInsights(fertilityData, userProfile) {
    const latestFertility = fertilityData[fertilityData.length - 1];
    return {
      quickCheck: this.createQuickCheckSummary({}, fertilityData),
      aiAnalysis: {
        title: "🤖 Dr. AI Fertility Analysis",
        subtitle: "Comprehensive fertility health assessment",
        content: `Based on your fertility tracking data, continue monitoring your cycle patterns and maintain healthy lifestyle habits for optimal reproductive health.`,
        timestamp: new Date().toISOString()
      },
      riskAssessment: [],
      recommendations: ['Continue detailed fertility tracking', 'Maintain healthy lifestyle habits'],
      medicalAlerts: [],
      personalizedTips: await this.generateFertilityPersonalizedTips(fertilityData, userProfile),
      gentleReminders: await this.generateFertilityGentleReminders(fertilityData, userProfile)
    };
  }
}

export default FertilityAIService;
