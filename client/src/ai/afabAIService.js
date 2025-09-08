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
      // Use the parent class's executeWithFallback method for seamless fallback
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processCycleInsights(insights, cycleData, userProfile);
    } catch (error) {
      console.error('Error generating cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  buildCyclePrompt(cycleData, userProfile) {
    const latestCycle = cycleData[cycleData.length - 1];
    const cycleCount = cycleData.length;
    const age = userProfile.age || 25;
    
    return `You are a medical-grade reproductive health AI assistant. Provide comprehensive, clinically accurate analysis.

PATIENT PROFILE:
- Age: ${age} years old
- Medical History: ${userProfile.conditions?.reproductive?.join(', ') || 'None reported'}
- Family History: ${userProfile.familyHistory?.womensConditions?.join(', ') || 'None reported'}
- Lifestyle: ${userProfile.lifestyle?.exercise?.frequency || 'Moderate'} exercise, ${userProfile.lifestyle?.stress?.level || 'Moderate'} stress

CYCLE DATA:
- Cycle Length: ${latestCycle.cycleLength} days
- Period Length: ${latestCycle.periodLength || 'Not specified'} days
- Flow Intensity: ${latestCycle.flowIntensity}
- Pain Level: ${latestCycle.pain}/10
- Symptoms: ${latestCycle.symptoms?.join(', ') || 'None reported'}
- Bleeding Pattern: ${latestCycle.bleedingPattern || 'Normal'}
- Clots: ${latestCycle.clots || 'None'}
- Cycles Tracked: ${cycleCount}

Provide a comprehensive health analysis with these specific sections:

**CYCLE INSIGHTS** (Compassionate medical summary - ~120 words)
Write a caring, medical summary that tells the user's story. Requirements:
- Medically accurate, evidence-based
- Respectful, empathetic, supportive
- Clear and concise (~120 words)
- Non-repetitive (do NOT restate details already shown in Flow, Symptom, or Tips cards)

Structure:
1. Opening line: acknowledge the cycle and set a caring tone
2. Integrative summary: what this cycle reveals (medical terms allowed, define briefly if needed)
3. Reflection on impact / importance
4. Gentle guidance: what to focus on next (tracking, evaluation, self-care)
5. Closing line: reassurance or encouragement

Tone: calm, reassuring, human. Avoid alarmist language, but don't minimize real risks.

Example format:
"This cycle reflects how much your body has navigated—[cycle length] days with [medical term] ([definition]) and episodes of [symptom description]. Together, these signs suggest [medical insight]. [Impact/importance]. The next step is simple but meaningful: [gentle guidance]. Your careful attention now can bring clarity, protect your long-term health, and help you feel more in tune with your body."

Output: Markdown-friendly text only, no JSON.

**FLOW ASSESSMENT** (For Cycle Patterns section)
Brief statement of bleeding pattern using medical term + quick plain-English definition.
• E.g., "Menorrhagia (heavy menstrual bleeding) lasting 7 days may increase anemia risk."

**SYMPTOM EVALUATION** (For Cycle Patterns section)
Concise review of key symptoms with severity. Use correct term if available:
• Dysmenorrhea (severe menstrual pain) rated ${latestCycle.pain}/10  
• Associated fatigue, nausea, intermittent hot flashes  
Add short comment if constellation warrants review.

**ACTION ITEM** (For Cycle Patterns section)
Clear, user-friendly next step(s):
• Track at least three cycles  
• Schedule gynecologic evaluation if pain/bleeding persists

**CONFIDENCE LEVEL** (For Cycle Patterns section)
Reflect model certainty in plain text:
• "Moderate confidence – only one cycle logged; trends may change with more data."

**PERSONALIZED TIPS** (For Personalized Tips section)
3–4 actionable, medically sound suggestions:
• Maintain an iron-rich diet (leafy greens, lentils, lean meat)  
• NSAIDs (e.g., ibuprofen) for dysmenorrhea if no contraindication  
• Heat therapy, rest, gentle movement (yoga)  
• Stress-reduction techniques

**GENTLE REMINDERS** (For Gentle Reminders section)
Supportive nudges, not alarms:
• "Keep logging your cycle details for accurate pattern detection."  
• "Consult a clinician promptly if bleeding soaks >1 pad/hour or you feel dizzy."

Formatting:
- Use clear sentences or bullets, no jargon without definition
- ≤40 words per tile unless a critical alert exists`;
  }

  processCycleInsights(insights, cycleData, userProfile) {
    try {
      // Try to parse JSON response from AI
      const parsedInsights = JSON.parse(insights);
      
      return {
        quickCheck: {
          // Remove cycleAnalysis - it duplicates aiInsights
          flowAssessment: parsedInsights.quickCheck?.flowAssessment || 'Flow patterns analyzed',
          symptomEvaluation: parsedInsights.quickCheck?.symptomEvaluation || 'Symptoms evaluated',
          actionItem: parsedInsights.quickCheck?.actionItem || 'Continue tracking for comprehensive insights',
          confidence: parsedInsights.quickCheck?.confidence || 'Moderate'
        },
        aiInsights: parsedInsights.aiInsights || [insights],
        riskAssessment: parsedInsights.riskAssessment || {
          cycleIrregularity: 'Continue tracking to assess',
          anemiaRisk: 'Monitor for symptoms',
          underlyingConditions: 'No immediate concerns',
          overallRisk: 'Low'
        },
        recommendations: parsedInsights.recommendations || ['Continue tracking your cycle'],
        medicalAlerts: parsedInsights.medicalAlerts || ['No immediate alerts'],
        personalizedTips: parsedInsights.personalizedTips || ['Keep tracking for personalized insights']
      };
    } catch (error) {
      // If JSON parsing fails, parse text response for specific sections
      const textInsights = insights.toString();
      
      // Extract Cycle Insights (unique insights - predictions, trends, user journey)
      const cycleInsights = this.extractCycleInsights(textInsights, insights);
      
      // Extract specific sections for Cycle Patterns
      const flowAssessment = this.extractSection(textInsights, 'FLOW ASSESSMENT', 'Flow patterns analyzed');
      const symptomEvaluation = this.extractSection(textInsights, 'SYMPTOM EVALUATION', 'Symptoms reviewed');
      const actionItem = this.extractSection(textInsights, 'ACTION ITEM', 'Continue tracking for comprehensive insights');
      const confidence = this.extractSection(textInsights, 'CONFIDENCE LEVEL', 'Moderate');
      const personalizedTips = this.extractTips(textInsights, 'PERSONALIZED TIPS');
      const gentleReminders = this.extractTips(textInsights, 'GENTLE REMINDERS');
      
      return {
        quickCheck: {
          // Remove cycleAnalysis - it duplicates aiInsights
          flowAssessment: flowAssessment,
          symptomEvaluation: symptomEvaluation,
          actionItem: actionItem,
          confidence: confidence
        },
        aiInsights: [cycleInsights], // Use extracted cycle insights, not full response
        riskAssessment: {
          cycleIrregularity: 'Continue tracking to assess',
          anemiaRisk: 'Monitor for symptoms',
          underlyingConditions: 'No immediate concerns',
          overallRisk: 'Low'
        },
        recommendations: ['Continue tracking your cycle'],
        medicalAlerts: ['No immediate alerts'],
        personalizedTips: personalizedTips,
        gentleReminders: gentleReminders
      };
    }
  }

  extractCycleInsights(text, fallback) {
    // Extract the full Cycle Insights section with multiple paragraphs
    const patterns = [
      new RegExp(`\\*\\*CYCLE INSIGHTS\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`CYCLE INSIGHTS[:\-]\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const insightsText = match[1].trim();
        // Clean up the text and return meaningful content
        if (insightsText.length > 50) {
          return insightsText;
        }
      }
    }
    return fallback;
  }

  extractSection(text, sectionName, fallback) {
    // Look for section with emoji + ** markers or regular headers
    const patterns = [
      new RegExp(`[📈🩸⚠️📋🎯]\\s*\\*\\*${sectionName}\\*\\*[\\s\\S]*?([^\\*\\n]+)`, 'i'),
      new RegExp(`\\*\\*${sectionName}\\*\\*\\s*\\n([^\\*\\n]+)`, 'i'),
      new RegExp(`${sectionName}[:\-]\\s*([^\\n]+)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return fallback;
  }

  extractTips(text, sectionName) {
    // Look for emoji + section headers or regular patterns
    const patterns = [
      new RegExp(`[💝🌸]\\s*\\*\\*${sectionName}\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n[📈🩸⚠️📋🎯💝🌸]|$)`, 'i'),
      new RegExp(`\\*\\*${sectionName}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`${sectionName}[:\-]\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const tipsText = match[1].trim();
        // Extract numbered items or bullet points
        const items = tipsText.split(/\n/).filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && (trimmed.match(/^\d+\./) || trimmed.match(/^[-•]/) || trimmed.match(/^>/));
        }).map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-•>]\s*/, '').trim());
        
        if (items.length > 0) {
          return items.slice(0, 4);
        }
      }
    }
    
    // Fallback based on section name with more specific content
    if (sectionName.toLowerCase().includes('personalized')) {
      return [
        'Maintain an iron-rich diet (leafy greens, lentils, lean meat)',
        'NSAIDs (e.g., ibuprofen) for dysmenorrhea if no contraindication',
        'Heat therapy, rest, gentle movement (yoga)',
        'Stress-reduction techniques'
      ];
    } else if (sectionName.toLowerCase().includes('gentle')) {
      return [
        'Keep logging your cycle details for accurate pattern detection',
        'Consult a clinician promptly if bleeding soaks >1 pad/hour or you feel dizzy',
        'Listen to your body and rest when needed'
      ];
    }
    
    return ['Keep tracking for personalized insights'];
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
    
    // Get the latest fertility entry to determine tracking mode and available data
    const latestEntry = fertilityData[fertilityData.length - 1];
    const trackingMode = latestEntry?.trackingMode || 'beginner';
    
    // Get cycle data to understand the current cycle context
    const cycleData = localStorage.getItem('afabCycleData');
    let currentCycleInfo = '';
    if (cycleData) {
      const cycles = JSON.parse(cycleData);
      if (cycles.length > 0) {
        // Sort cycles by cycleStartDate (chronologically) to find the most recent cycle
        const sortedCycles = cycles.sort((a, b) => {
          const dateA = new Date(a.cycleStartDate || a.lastPeriod);
          const dateB = new Date(b.cycleStartDate || b.lastPeriod);
          return dateB - dateA; // Most recent first
        });
        const latestCycle = sortedCycles[0];
        currentCycleInfo = `Current cycle: ${latestCycle.cycleLength || 28}-day cycle starting ${new Date(latestCycle.cycleStartDate || latestCycle.lastPeriod).toLocaleDateString()}`;
      }
    }
    
    // Analyze fertility patterns from recent data
    const recentEntries = fertilityData.slice(-7); // Last 7 entries
    const bbtData = recentEntries.filter(e => e.bbt && parseFloat(e.bbt) > 0);
    const mucusData = recentEntries.filter(e => e.cervicalMucus && e.cervicalMucus !== 'none');
    const testData = recentEntries.filter(e => e.ovulationTest && e.ovulationTest !== 'not-tested');
    
    // Calculate BBT trends
    let bbtTrend = 'No BBT data';
    if (bbtData.length >= 2) {
      const latestBbt = parseFloat(bbtData[bbtData.length - 1].bbt);
      const previousBbt = parseFloat(bbtData[bbtData.length - 2].bbt);
      const change = latestBbt - previousBbt;
      if (change > 0.2) bbtTrend = `BBT rising (+${change.toFixed(1)}°F) - possible ovulation`;
      else if (change < -0.2) bbtTrend = `BBT declining (${change.toFixed(1)}°F) - post-ovulation`;
      else bbtTrend = `BBT stable (${change.toFixed(1)}°F change)`;
    }
    
    // Analyze mucus patterns
    let mucusPattern = 'No mucus data';
    if (mucusData.length > 0) {
      const latestMucus = mucusData[mucusData.length - 1];
      if (latestMucus.cervicalMucus === 'egg-white') mucusPattern = 'Egg-white mucus detected - peak fertility';
      else if (latestMucus.cervicalMucus === 'watery') mucusPattern = 'Watery mucus - approaching fertile window';
      else if (latestMucus.cervicalMucus === 'creamy') mucusPattern = 'Creamy mucus - early fertile phase';
      else mucusPattern = `${latestMucus.cervicalMucus} mucus - non-fertile phase`;
    }
    
    // Analyze test results
    let testResults = 'No test data';
    if (testData.length > 0) {
      const latestTest = testData[testData.length - 1];
      if (latestTest.ovulationTest === 'positive' || latestTest.ovulationTest === 'peak') {
        testResults = 'LH surge detected - ovulation imminent';
      } else if (latestTest.ovulationTest === 'negative') {
        testResults = 'LH test negative - not in fertile window';
      }
    }
    
    // Calculate confidence level
    let confidenceFactors = [];
    if (bbtData.length >= 3) confidenceFactors.push('BBT tracking');
    if (mucusData.length >= 2) confidenceFactors.push('Mucus patterns');
    if (testData.length >= 1) confidenceFactors.push('LH testing');
    if (trackingMode === 'advanced') confidenceFactors.push('Advanced tracking');
    
    const confidenceLevel = confidenceFactors.length >= 3 ? 'High' : 
                           confidenceFactors.length >= 2 ? 'Medium' : 'Low';
    const confidencePercent = Math.min(95, 40 + (confidenceFactors.length * 15));
    
    // Build data summary based on tracking mode
    let dataSummary = '';
    if (trackingMode === 'beginner') {
      dataSummary = `
      Tracking Mode: Beginner (Basic fertility indicators)
      ${currentCycleInfo}
      Recent Data Analysis:
      - BBT Trend: ${bbtTrend}
      - Test Results: ${testResults}
      - Libido Level: ${latestEntry?.libido || 'Not recorded'}/10
      - Symptoms: ${latestEntry?.symptoms?.length || 0} recorded
      - Confidence Factors: ${confidenceFactors.join(', ') || 'Limited data'}
      Note: Cervical mucus tracking is only available in Advanced mode
      `;
    } else {
      dataSummary = `
      Tracking Mode: Advanced (Comprehensive fertility indicators)
      ${currentCycleInfo}
      Recent Data Analysis:
      - BBT Trend: ${bbtTrend}
      - Mucus Pattern: ${mucusPattern}
      - Test Results: ${testResults}
      - Cervical Position: ${latestEntry?.cervicalPosition || 'Not recorded'}
      - Cervical Texture: ${latestEntry?.cervicalTexture || 'Not recorded'}
      - Libido Level: ${latestEntry?.libido || 'Not recorded'}/10
      - Symptoms: ${latestEntry?.symptoms?.length || 0} recorded
      - Confidence Factors: ${confidenceFactors.join(', ') || 'Limited data'}
      `;
    }
    
    return `
    You are a compassionate fertility specialist providing comprehensive fertility analysis. Generate a detailed, medically-informed fertility assessment in the following EXACT structure:

    **FERTILITY INSIGHTS** (Compassionate medical summary - ~120 words):
    - Opening line acknowledging the user's fertility journey
    - Integrative summary of current fertility status based on recent data
    - Reflection on fertility patterns and health factors
    - Gentle guidance on fertility optimization
    - Closing line with encouragement and support
    Tone: Calm, reassuring, human, non-alarmist, supportive

    **OVULATION ASSESSMENT** (Ovulation timing and prediction):
    - Current ovulation status: ${bbtTrend.includes('rising') ? 'Likely imminent' : bbtTrend.includes('declining') ? 'Post-ovulation' : 'Uncertain'}
    - Fertility window analysis: ${mucusPattern.includes('egg-white') ? 'Peak fertility window' : mucusPattern.includes('watery') ? 'Approaching fertile window' : 'Non-fertile phase'}
    - Ovulation prediction accuracy: ${testResults.includes('LH surge') ? 'High - LH surge confirmed' : 'Moderate - based on BBT and mucus patterns'}
    ${trackingMode === 'advanced' ? '- Advanced cervical analysis: Position and texture changes' : '- Limited to BBT and ovulation test data'}

    **FERTILITY EVALUATION** (Overall fertility health):
    - Age-related fertility factors: ${age < 30 ? 'Peak fertility age' : age < 35 ? 'Good fertility age' : age < 40 ? 'Declining fertility age' : 'Advanced maternal age'}
    - Health condition impacts: ${conditions.length > 0 ? conditions.join(', ') : 'No known reproductive conditions'}
    - Cycle regularity assessment: Based on ${fertilityData.length} entries
    ${trackingMode === 'advanced' ? '- Comprehensive cervical mucus and position analysis' : '- Basic fertility indicators only'}

    **ACTION ITEM** (Specific next steps):
    - Immediate actionable recommendations based on current data
    - Testing or monitoring suggestions
    - Lifestyle modifications
    ${trackingMode === 'advanced' ? '- Advanced tracking recommendations' : '- Consider upgrading to advanced tracking for cervical mucus and position monitoring'}

    **CONFIDENCE LEVEL** (Assessment reliability):
    - Confidence: ${confidencePercent}% (${confidenceLevel} confidence)
    - Data quality assessment: ${confidenceFactors.length >= 3 ? 'Excellent' : confidenceFactors.length >= 2 ? 'Good' : 'Limited'}
    - Recommendations for improvement: ${confidenceFactors.length < 3 ? 'Continue tracking for better accuracy' : 'Maintain current tracking routine'}
    ${trackingMode === 'advanced' ? '- High confidence due to comprehensive cervical tracking data' : '- Moderate confidence - cervical mucus tracking unavailable in beginner mode'}

    **PERSONALIZED TIPS** (Fertility optimization):
    1. [Specific fertility tip based on ${trackingMode} data and current patterns]
    2. [Lifestyle recommendation based on age and health]
    3. [Timing or tracking suggestion based on current phase]
    4. [Health optimization tip]
    ${trackingMode === 'advanced' ? '5. [Cervical mucus and position monitoring tip]' : '5. [Consider advanced tracking for cervical mucus monitoring]'}

    **GENTLE REMINDERS** (Daily fertility support):
    1. [Encouraging daily reminder]
    2. [Supportive tracking tip]
    3. [Wellness reminder]
    4. [Positive affirmation]
    ${trackingMode === 'advanced' ? '5. [Cervical mucus observation reminder]' : '5. [Consider learning advanced tracking methods]'}

    User Profile: Age ${age}, Conditions: ${conditions.join(', ') || 'None'}, Family History: ${familyHistory.join(', ') || 'None'}
    ${dataSummary}
    `;
  }

  processFertilityInsights(insights, fertilityData, userProfile) {
    // Extract structured content from AI response
    const fertilityInsights = this.extractFertilityInsights(insights);
    const ovulationAssessment = this.extractSection(insights, 'OVULATION ASSESSMENT');
    const fertilityEvaluation = this.extractSection(insights, 'FERTILITY EVALUATION');
    const actionItem = this.extractSection(insights, 'ACTION ITEM');
    const confidenceLevel = this.extractSection(insights, 'CONFIDENCE LEVEL');
    const personalizedTips = this.extractTips(insights, 'PERSONALIZED TIPS');
    const gentleReminders = this.extractTips(insights, 'GENTLE REMINDERS');

    return {
      // Main AI insights - compassionate medical summary
      aiInsights: fertilityInsights,
      
      // Quick check structure (same as cycle tracking)
      quickCheck: {
        ovulationAssessment: ovulationAssessment || 'Continue tracking ovulation patterns for better assessment',
        fertilityEvaluation: fertilityEvaluation || 'Continue monitoring fertility indicators',
        actionItem: actionItem || 'Maintain consistent tracking and healthy lifestyle',
        confidence: confidenceLevel || 'Medium confidence - continue tracking for better assessment'
      },
      
      // Personalized recommendations
      personalizedTips: personalizedTips.length > 0 ? personalizedTips : [
        'Take prenatal vitamins with folic acid daily',
        'Track basal body temperature for ovulation detection',
        'Monitor cervical mucus changes throughout cycle',
        'Maintain healthy weight and regular exercise',
        'Consider ovulation predictor kits for timing'
      ],
      
      // Gentle reminders
      gentleReminders: gentleReminders.length > 0 ? gentleReminders : [
        'Remember to take your prenatal vitamins today',
        'Track your BBT at the same time each morning',
        'Stay hydrated and maintain a balanced diet',
        'Practice stress management techniques',
        'Keep track of your fertility signs daily'
      ],
      
      // Additional fertility-specific data
      ovulationPrediction: this.predictOvulation(fertilityData),
      conceptionTimeline: this.estimateConceptionTimeline(userProfile),
      medicalAlerts: this.generateFertilityAlerts(fertilityData, userProfile)
    };
  }

  extractFertilityInsights(insights) {
    const fertilitySection = this.extractSection(insights, 'FERTILITY INSIGHTS');
    if (fertilitySection) {
      return fertilitySection;
    }
    
    // Fallback compassionate fertility summary
    return "Your fertility journey is unique and personal. Based on your current tracking data, your reproductive health shows positive indicators. Continue monitoring your cycle patterns, maintain a healthy lifestyle, and stay connected with your healthcare provider. Remember, fertility is influenced by many factors, and consistent tracking helps provide valuable insights for your reproductive health journey.";
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

  // ===== CONDITION INSIGHTS =====
  async generateConditionInsights(conditionData, userProfile) {
    try {
      const prompt = this.buildConditionPrompt(conditionData, userProfile);
      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processConditionInsights(response);
    } catch (error) {
      console.error('Error generating condition insights:', error);
      return this.getFallbackConditionInsights(conditionData);
    }
  }

  buildConditionPrompt(conditionData, userProfile) {
    const condition = conditionData.condition;
    const symptoms = conditionData.symptoms || [];
    const severity = conditionData.severity || 'mild';
    const medications = conditionData.medications || [];
    const lifestyle = conditionData.lifestyle || [];
    const weight = conditionData.weight;
    const bloodPressure = conditionData.bloodPressure;
    const bloodSugar = conditionData.bloodSugar;

    return `As a medical AI specializing in women's reproductive health conditions, analyze this ${condition} data and provide comprehensive insights in JSON format:

CONDITION DATA:
- Condition: ${condition}
- Symptoms: ${symptoms.join(', ')}
- Severity: ${severity}
- Medications/Treatments: ${medications.join(', ')}
- Lifestyle Modifications: ${lifestyle.join(', ')}
- Weight: ${weight || 'Not provided'}
- Blood Pressure: ${bloodPressure || 'Not provided'}
- Blood Sugar: ${bloodSugar || 'Not provided'}

USER PROFILE:
- Age: ${userProfile.age}
- Medical History: ${userProfile.medicalHistory?.join(', ') || 'Not provided'}
- Chronic Conditions: ${userProfile.chronicConditions?.join(', ') || 'Not provided'}
- Current Medications: ${userProfile.medications?.join(', ') || 'Not provided'}

Please provide a comprehensive analysis in this EXACT JSON format:
{
  "insights": ["3-5 specific insights about the condition and symptoms"],
  "patterns": "Analysis of condition patterns and trends",
  "alerts": ["Any medical alerts or warning signs"],
  "recommendations": ["5-7 personalized recommendations for management"],
  "riskAssessment": "Assessment of condition risk factors and progression"
}

Focus on:
1. Medical accuracy and evidence-based insights
2. Personalized recommendations based on symptoms and severity
3. When to seek medical attention
4. Lifestyle modifications for condition management
5. Treatment effectiveness evaluation
6. Long-term health considerations

Be supportive, medically accurate, and actionable.`;
  }

  processConditionInsights(response) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [response],
        patterns: parsed.patterns || 'Analyzing condition patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue current treatment plan'],
        riskAssessment: parsed.riskAssessment || 'Evaluating condition risk factors...'
      };
    } catch (error) {
      // If not JSON, return structured response
      return {
        insights: [response],
        patterns: 'Analyzing condition patterns...',
        alerts: [],
        recommendations: ['Continue current treatment plan', 'Monitor symptoms regularly'],
        riskAssessment: 'Evaluating condition risk factors...'
      };
    }
  }

  getFallbackConditionInsights(conditionData) {
    const condition = conditionData.condition;
    const symptoms = conditionData.symptoms || [];
    const severity = conditionData.severity || 'mild';

    return {
      insights: [
        `Based on your ${condition} data, continue monitoring your symptoms and follow your treatment plan.`,
        `Your current symptom severity is ${severity} - this is important information for your healthcare provider.`,
        `Tracking your symptoms regularly helps identify patterns and treatment effectiveness.`
      ],
      patterns: `Continue tracking your ${condition} symptoms to identify patterns and trends over time.`,
      alerts: [],
      recommendations: [
        'Continue current treatment plan',
        'Monitor symptoms regularly',
        'Maintain healthy lifestyle',
        'Keep scheduled appointments with healthcare provider',
        'Track any changes in symptom severity'
      ],
      riskAssessment: `Regular monitoring of your ${condition} helps manage long-term health outcomes.`
    };
  }

  // ===== BREAST HEALTH INSIGHTS =====
  async generateBreastHealthInsights(breastData, userProfile) {
    try {
      const prompt = this.buildBreastHealthPrompt(breastData, userProfile);
      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processBreastHealthInsights(response);
    } catch (error) {
      console.error('Error generating breast health insights:', error);
      return this.getFallbackBreastHealthInsights(breastData);
    }
  }

  buildBreastHealthPrompt(breastData, userProfile) {
    const selfExamPerformed = breastData.selfExamPerformed;
    const examFindings = breastData.examFindings || [];
    const symptoms = breastData.symptoms || [];
    const screeningType = breastData.screeningType;
    const screeningResults = breastData.screeningResults;
    const familyHistory = breastData.familyHistory || [];
    const lifestyle = breastData.lifestyle || [];

    return `As a medical AI specializing in breast health and cancer prevention, analyze this breast health data and provide comprehensive insights in JSON format:

BREAST HEALTH DATA:
- Self-Exam Performed: ${selfExamPerformed ? 'Yes' : 'No'}
- Exam Findings: ${examFindings.join(', ')}
- Symptoms: ${symptoms.join(', ')}
- Screening Type: ${screeningType || 'Not performed'}
- Screening Results: ${screeningResults || 'Not available'}
- Family History: ${familyHistory.join(', ')}
- Lifestyle Factors: ${lifestyle.join(', ')}

USER PROFILE:
- Age: ${userProfile.age}
- Medical History: ${userProfile.medicalHistory?.join(', ') || 'Not provided'}
- Chronic Conditions: ${userProfile.chronicConditions?.join(', ') || 'Not provided'}
- Current Medications: ${userProfile.medications?.join(', ') || 'Not provided'}

Please provide a comprehensive analysis in this EXACT JSON format:
{
  "insights": ["3-5 specific insights about breast health and risk factors"],
  "patterns": "Analysis of breast health patterns and screening history",
  "alerts": ["Any medical alerts or warning signs"],
  "recommendations": ["5-7 personalized recommendations for breast health"],
  "riskAssessment": "Assessment of breast cancer risk factors and prevention strategies"
}

Focus on:
1. Medical accuracy and evidence-based insights
2. Personalized screening recommendations based on age and risk factors
3. Self-exam technique guidance and importance
4. When to seek medical attention
5. Lifestyle modifications for breast health
6. Family history implications and genetic counseling needs
7. Early detection strategies

Be supportive, medically accurate, and actionable.`;
  }

  processBreastHealthInsights(response) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [response],
        patterns: parsed.patterns || 'Analyzing breast health patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue regular self-exams'],
        riskAssessment: parsed.riskAssessment || 'Evaluating breast health risk factors...'
      };
    } catch (error) {
      // If not JSON, return structured response
      return {
        insights: [response],
        patterns: 'Analyzing breast health patterns...',
        alerts: [],
        recommendations: ['Continue regular self-exams', 'Follow screening guidelines'],
        riskAssessment: 'Evaluating breast health risk factors...'
      };
    }
  }

  getFallbackBreastHealthInsights(breastData) {
    const selfExamPerformed = breastData.selfExamPerformed;
    const symptoms = breastData.symptoms || [];
    const screeningType = breastData.screeningType;

    return {
      insights: [
        `Based on your breast health data, continue regular self-exams and follow screening guidelines.`,
        `Self-exam performed: ${selfExamPerformed ? 'Great job maintaining regular monitoring!' : 'Consider performing monthly self-exams.'}`,
        `Tracking your breast health regularly helps with early detection and peace of mind.`
      ],
      patterns: `Continue tracking your breast health to identify any changes or patterns over time.`,
      alerts: [],
      recommendations: [
        'Perform monthly self-exams',
        'Follow age-appropriate screening guidelines',
        'Maintain healthy lifestyle',
        'Report any changes to healthcare provider',
        'Keep up with regular check-ups'
      ],
      riskAssessment: `Regular monitoring and screening are key to maintaining breast health and early detection.`
    };
  }
}

export default AFABAIService;
