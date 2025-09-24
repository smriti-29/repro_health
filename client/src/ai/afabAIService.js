// AFAB-SPECIFIC AI SERVICE
// Specialized AI service for AFAB reproductive health insights

import AIServiceManager from './aiServiceManager.js';

class AFABAIService extends AIServiceManager {
  constructor() {
    super();
    console.log('🩺 AFAB AI Service initialized - Live AI insights only');
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

  // ===== MEDICATION NLP PARSING =====
  parseMedicationInfo(medicationText) {
    if (!medicationText || medicationText.trim() === '') {
      return {
        medications: [],
        parsedText: 'No medications reported',
        hasMedications: false
      };
    }

    const medications = [];
    const text = medicationText.toLowerCase();
    
    // Common medication patterns
    const medicationPatterns = [
      // Pattern: "Metformin 500mg twice daily"
      /(\w+)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)\s*(?:twice\s+daily|daily|once\s+daily|bid|tid|qid|as\s+needed|prn)/gi,
      // Pattern: "Birth control pill" or "BCP"
      /(?:birth\s+control|bcp|oral\s+contraceptive|pill)/gi,
      // Pattern: "Ibuprofen 200mg as needed"
      /(ibuprofen|acetaminophen|tylenol|advil|motrin)\s+(\d+(?:\.\d+)?)\s*(mg)?\s*(?:as\s+needed|prn|when\s+needed)/gi,
      // Pattern: "Iron supplement" or "Vitamin D"
      /(iron|vitamin\s+\w+|multivitamin|supplement)/gi,
      // Pattern: "Metformin" (just drug name)
      /(metformin|spironolactone|clomid|letrozole|progesterone|estrogen|thyroid|levothyroxine)/gi
    ];

    // Extract medications using patterns
    medicationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const medication = {
          name: match[1] || match[0],
          dosage: match[2] || null,
          unit: match[3] || null,
          frequency: this.extractFrequency(text, match[0]),
          duration: this.extractDuration(text, match[0]),
          type: this.categorizeMedication(match[1] || match[0])
        };
        
        // Avoid duplicates
        if (!medications.some(med => med.name.toLowerCase() === medication.name.toLowerCase())) {
          medications.push(medication);
        }
      }
    });

    // If no patterns matched, try to extract any drug names
    if (medications.length === 0) {
      const commonDrugs = ['metformin', 'spironolactone', 'clomid', 'letrozole', 'progesterone', 'estrogen', 'thyroid', 'levothyroxine', 'ibuprofen', 'acetaminophen', 'iron', 'vitamin'];
      commonDrugs.forEach(drug => {
        if (text.includes(drug)) {
          medications.push({
            name: drug,
            dosage: null,
            unit: null,
            frequency: this.extractFrequency(text, drug),
            duration: this.extractDuration(text, drug),
            type: this.categorizeMedication(drug)
          });
        }
      });
    }

    // Handle unknown medications - extract any word that might be a drug name
    if (medications.length === 0 && text.length > 3) {
      // Look for potential medication names (words with numbers, capital letters, or common drug suffixes)
      const potentialDrugs = text.match(/\b[A-Z][a-z]*(?:[0-9]+|[a-z]*)\b/g) || [];
      potentialDrugs.forEach(potentialDrug => {
        if (potentialDrug.length > 3 && !['None', 'Not', 'Taking', 'Currently'].includes(potentialDrug)) {
          medications.push({
            name: potentialDrug,
            dosage: null,
            unit: null,
            frequency: this.extractFrequency(text, potentialDrug),
            duration: this.extractDuration(text, potentialDrug),
            type: 'unknown - requires AI analysis'
          });
        }
      });
    }

    return {
      medications: medications,
      parsedText: this.formatMedicationSummary(medications),
      hasMedications: medications.length > 0
    };
  }

  extractFrequency(text, medication) {
    const frequencyPatterns = [
      { pattern: /twice\s+daily|bid/gi, frequency: 'twice daily' },
      { pattern: /three\s+times\s+daily|tid/gi, frequency: 'three times daily' },
      { pattern: /four\s+times\s+daily|qid/gi, frequency: 'four times daily' },
      { pattern: /once\s+daily|daily/gi, frequency: 'once daily' },
      { pattern: /as\s+needed|prn|when\s+needed/gi, frequency: 'as needed' },
      { pattern: /weekly/gi, frequency: 'weekly' },
      { pattern: /monthly/gi, frequency: 'monthly' }
    ];

    for (const { pattern, frequency } of frequencyPatterns) {
      if (pattern.test(text)) {
        return frequency;
      }
    }
    return 'unspecified';
  }

  extractDuration(text, medication) {
    const durationPatterns = [
      { pattern: /for\s+(\d+)\s+months?/gi, duration: 'months' },
      { pattern: /for\s+(\d+)\s+weeks?/gi, duration: 'weeks' },
      { pattern: /for\s+(\d+)\s+days?/gi, duration: 'days' },
      { pattern: /since\s+(\w+)/gi, duration: 'ongoing' },
      { pattern: /(\d+)\s+months?/gi, duration: 'months' },
      { pattern: /(\d+)\s+weeks?/gi, duration: 'weeks' }
    ];

    for (const { pattern, duration } of durationPatterns) {
      if (pattern.test(text)) {
        return duration;
      }
    }
    return 'unspecified';
  }

  categorizeMedication(medicationName) {
    const name = medicationName.toLowerCase();
    
    if (name.includes('metformin')) return 'diabetes/PCOS';
    if (name.includes('spironolactone')) return 'hormonal/PCOS';
    if (name.includes('clomid') || name.includes('letrozole')) return 'fertility';
    if (name.includes('progesterone') || name.includes('estrogen')) return 'hormonal';
    if (name.includes('thyroid') || name.includes('levothyroxine')) return 'thyroid';
    if (name.includes('ibuprofen') || name.includes('acetaminophen')) return 'pain relief';
    if (name.includes('iron') || name.includes('vitamin')) return 'supplement';
    if (name.includes('birth control') || name.includes('pill')) return 'contraceptive';
    
    return 'other';
  }

  formatMedicationSummary(medications) {
    if (medications.length === 0) {
      return 'No medications reported';
    }

    return medications.map(med => {
      let summary = med.name;
      if (med.dosage && med.unit) {
        summary += ` ${med.dosage}${med.unit}`;
      }
      if (med.frequency !== 'unspecified') {
        summary += ` (${med.frequency})`;
      }
      if (med.duration !== 'unspecified') {
        summary += ` for ${med.duration}`;
      }
      return summary;
    }).join(', ');
  }

  buildCyclePrompt(cycleData, userProfile) {
    const latestCycle = cycleData[cycleData.length - 1];
    const cycleCount = cycleData.length;
    const age = userProfile.age || 25;
    const username = userProfile.name || 'there';
    
    // Parse medication information
    const medicationInfo = this.parseMedicationInfo(latestCycle.medicationUse);
    console.log('💊 Parsed medications:', medicationInfo);
    
    // Calculate patterns from historical data
    let avgCycleLength = 28;
    let avgPain = 0;
    let commonSymptoms = [];
    
    if (cycleCount > 1) {
      avgCycleLength = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycleCount);
      avgPain = Math.round(cycleData.reduce((sum, cycle) => sum + (cycle.pain || 0), 0) / cycleCount);
      
      // Analyze symptom patterns
      const symptomCounts = {};
      cycleData.forEach(cycle => {
        if (cycle.symptoms) {
          cycle.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          });
        }
      });
      commonSymptoms = Object.entries(symptomCounts)
        .filter(([_, count]) => count >= Math.ceil(cycleCount / 2))
        .map(([symptom, count]) => `${symptom} (${count}/${cycleCount} cycles)`)
        .slice(0, 3);
    }
    
        return `You are an advanced AI assistant specializing in reproductive health and menstrual cycles. 
Your task is to generate actionable, medically accurate, empathetic, and user-friendly content for the dashboard.

You are provided with the following user input data for the current cycle:

- Cycle length: ${latestCycle.cycleLength} days
- Flow intensity: ${latestCycle.flowIntensity} (Light/Medium/Heavy/Very Heavy)
- Pain level: ${latestCycle.pain}/10
- Symptoms: ${Array.isArray(latestCycle.symptoms) ? latestCycle.symptoms.join(', ') : latestCycle.symptoms || 'None'}
- Bleeding pattern: ${latestCycle.bleedingPattern || 'Normal'}
- Blood clots: ${latestCycle.clots || 'None reported'}
- Stress level: ${latestCycle.stressLevel || 5}/10
- Sleep quality: ${latestCycle.sleepQuality || 5}/10
- Exercise frequency: ${latestCycle.exerciseFrequency || 'Moderate'}
- Diet quality: ${latestCycle.dietQuality || 'Good'}
- Medications: ${medicationInfo.parsedText}
- Family history: ${Array.isArray(latestCycle.familyHistory) ? latestCycle.familyHistory.join(', ') : latestCycle.familyHistory || Array.isArray(userProfile.familyHistory) ? userProfile.familyHistory.join(', ') : userProfile.familyHistory || 'None reported'}

**Rules:**

1. **Personalized Tips Section:**
   - Generate 2–3 tips that are **specific, actionable, and relevant** to the user's inputs.
   - Include guidance on diet, exercise, rest, symptom management, or lifestyle.
   - Avoid vague statements like "may help" or "consider doing".
   - Each tip should be concise (1–2 sentences), medically safe, and feasible.

2. **Gentle Reminders Section:**
   - Generate 4 empathetic, supportive reminders.
   - Each reminder should reflect the user's current cycle stage and symptoms.
   - Use positive, encouraging tone with emojis.
   - Include practical reminders (e.g., rest, hydration, heat therapy, pain management, pad changing).

---

OUTPUT STRUCTURE:

### 👋 Greeting
Friendly intro: "Hello 👋 I've reviewed your cycle data. Here's your personalized health analysis."

---

### 🩺 Clinical Summary
- Summarize cycle details: cycle length, period length, flow intensity, pain level, bleeding pattern, clotting.  
- Mention if values fall inside/outside typical ranges.  
- Highlight immediate red flags (e.g., prolonged bleeding, very high pain, excessive flow).

---

### 🧬 Lifestyle & Systemic Factors
- Assess stress, sleep, diet, and exercise.  
- Mention how these factors could affect cycle health.  
- Note any medications, birth control, or family history and their relevance.

---

### 🔬 Clinical Impression (Tiered)
- Most likely explanation based on current inputs (e.g., Primary Dysmenorrhea if pain + heavy flow).  
- If recurrent: add possible secondary causes (e.g., endometriosis, fibroids, hormonal imbalance).  
- Risk considerations: e.g., anemia risk if prolonged heavy bleeding, PCOS risk if metformin + irregular cycles.  

---

### 📋 Action Plan
**Self-Care Guidance:** Apply heat to your abdomen for pain relief. Stay well-hydrated. Rest when needed. Over-the-counter pain relievers like ibuprofen (always follow package instructions) may help manage pain, but should not be used long term without a physician's recommendation.

**Lifestyle Optimization:** Prioritize improving sleep hygiene (aim for 7-9 hours of quality sleep), implement stress-reduction techniques (yoga, meditation, deep breathing), maintain a balanced diet, and continue with your moderate exercise routine.

**When to See a Doctor:** Seek medical attention immediately if you experience fainting, severe dizziness, heavy blood loss (soaking through more than one pad per hour), or persistent, unmanageable pain. If your symptoms persist or worsen over the next few cycles, please schedule an appointment with your gynecologist for a thorough evaluation.

**Future Monitoring:** Continue tracking your cycle length, period length, flow intensity (using a menstrual cup or period tracker app can help quantify flow), pain levels, and any other symptoms you experience. Note the presence or absence of blood clots.

---

### ⚠️ Urgency Flag
- Immediate action needed if: fainting, severe dizziness, heavy blood loss, or persistent severe pain.  
- Otherwise: monitor vs consult timeline (e.g., "if repeated for 2+ cycles, schedule ultrasound/hormonal panel").

---

### 📦 Summary Box (Quick-Read)
- Primary Impression: [condition-like label, e.g., Dysmenorrhea]  
- Contributing Factors: [stress, sleep, meds, family history]  
- Risks: [anemia, hormonal imbalance, secondary causes]  
- Recommendation: [monitor, consult, urgent care triggers]  

---

### 💡 Personalized Tips for You
Generate exactly 3 actionable tips based on the user's specific data. Each tip should be one complete sentence:

1. [First tip based on flow intensity - e.g., "Change your pad every 1-2 hours if flow is heavy to prevent infection"]
2. [Second tip based on pain level - e.g., "Apply a heating pad for 15-20 minutes every 2 hours to reduce cramping"]  
3. [Third tip based on lifestyle factors - e.g., "Aim for 7-9 hours of sleep nightly to improve cycle regularity"]

---

### 🌸 Gentle Reminders
Generate exactly 4 empathetic reminders based on current symptoms. Each reminder should be one complete sentence with emoji:

1. 🌸 [Flow-based reminder - e.g., "Change your pad every 2-3 hours to stay comfortable and prevent irritation"]
2. 🌼 [Pain-based reminder - e.g., "Apply heat therapy for 15 minutes when cramps start"]  
3. 🌸 [Hydration reminder - e.g., "Drink 8-10 glasses of water daily to reduce bloating and fatigue"]
4. 🌼 [Supportive reminder - e.g., "Listen to your body and rest when you need it - you're doing great"]

---

### 📊 Data Visualization Suggestions (JSON block)
Provide structured data for charts (local rendering, no extra API cost):
{
  "pain_trend": { "current_cycle": ${latestCycle.pain}, "average": ${avgPain} },
  "flow_trend": { "current": "${latestCycle.flowIntensity}", "pattern": "consistent" },
  "cycle_health_score": ${Math.round((10 - (latestCycle.pain || 0)) + (latestCycle.sleepQuality || 5) + (10 - (latestCycle.stressLevel || 5))) / 3}/10,
  "risk_flags": ${latestCycle.pain > 7 ? '["High pain level", "Medical evaluation recommended"]' : latestCycle.flowIntensity === 'Heavy' ? '["Heavy flow", "Monitor for anemia"]' : '["Continue monitoring"]'}
}

Remember: This should feel like a real doctor's consultation note - professional, personalized, and actionable. Use their actual data throughout, not generic advice.`;
  }

  processCycleInsights(insights, cycleData, userProfile) {
    try {
      // Parse the structured 6-section response
      const textInsights = insights.toString();

      // Extract the 6 main sections
      const sections = this.extractEnhancedSections(textInsights);

      // Create quick check summary from the sections
      const quickCheck = this.createQuickCheckSummary(sections, cycleData);
      
      return {
        quickCheck: quickCheck,
        aiInsights: {
          greeting: sections.greeting || 'Hello! I\'ve reviewed your cycle data and prepared a comprehensive health assessment.',
          clinicalSummary: sections.clinicalSummary || 'Your cycle data is being analyzed for clinical assessment.',
          lifestyleFactors: sections.lifestyleFactors || 'Lifestyle factors are being evaluated for their impact on your cycle health.',
          clinicalImpression: sections.clinicalImpression || 'Clinical impression is being developed based on your specific data.',
          actionablePlan: sections.actionablePlan || 'Personalized recommendations are being prepared for your health management.',
          summaryBox: sections.summaryBox || 'Summary of findings and recommendations will be provided.'
        },
        riskAssessment: this.extractRiskFromSections(sections),
        recommendations: this.extractRecommendationsFromSections(sections),
        medicalAlerts: this.extractAlertsFromSections(sections),
        personalizedTips: this.extractPersonalizedTipsFromSections(sections),
        gentleReminders: this.extractGentleRemindersFromSections(sections)
      };
    } catch (error) {
      console.error('Error processing cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  extractEnhancedSections(text) {
    const sections = {};
    
    // Extract the 6 enhanced sections with emojis
    sections.greeting = this.extractSection(text, '👋 Greeting');
    sections.clinicalSummary = this.extractSection(text, '🩺 Clinical Summary');
    sections.lifestyleFactors = this.extractSection(text, '🧬 Lifestyle & Systemic Factors');
    sections.clinicalImpression = this.extractSection(text, '🔬 Clinical Impression');
    sections.actionablePlan = this.extractSection(text, '📋 Action Plan');
    sections.urgencyFlag = this.extractSection(text, '⚠️ Urgency Flag');
    sections.summaryBox = this.extractSection(text, '📦 Summary Box');
    
    // Extract the new specific sections for tips and reminders
    sections.personalizedTips = this.extractSection(text, '💡 Personalized Tips for You');
    sections.gentleReminders = this.extractSection(text, '🌸 Gentle Reminders');
    
    // Extract JSON data visualization
    sections.dataVisualization = this.extractJSONSection(text);
    
    return sections;
  }

  extractJSONSection(text) {
    try {
      // Look for JSON block in the response
      const jsonMatch = text.match(/\{[\s\S]*"pain_trend"[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log('Could not parse JSON visualization data:', error);
    }
    return null;
  }

  extractStructuredSections(text) {
    const sections = {};
    
    // Extract Section 1: Clinical Assessment & Differential Considerations
    sections.section1 = this.extractSection(text, 'SECTION 1: 🔬 Clinical Assessment & Differential Considerations', '');
    
    // Extract Section 2: Personalized Health Management Plan  
    sections.section2 = this.extractSection(text, 'SECTION 2: 📊 Personalized Health Management Plan', '');
    
    return sections;
  }

  createQuickCheckSummary(sections, cycleData) {
    const latestCycle = cycleData[cycleData.length - 1];
    
    return {
      flowAssessment: this.extractHealthScore(sections.section2),
      symptomEvaluation: this.extractKeyInsight(sections.section1),
      actionItem: this.extractActionItem(sections.section1),
      confidence: this.extractRiskLevel(sections.section1)
    };
  }

  extractHealthScore(section2) {
    if (!section2) return 'Health score: 7/10 - Good';
    
    const scoreMatch = section2.match(/Cycle Health Score:\s*(\d+\/10)/i);
    return scoreMatch ? `Health score: ${scoreMatch[1]}` : 'Health score: 7/10 - Good';
  }

  extractRiskLevel(section1) {
    if (!section1) return 'GREEN';
    
    const riskKeywords = {
      'RED': ['urgent', 'immediate', 'severe', 'concerning', 'medical attention'],
      'YELLOW': ['monitor', 'watch', 'consider', 'evaluation', 'follow-up'],
      'GREEN': ['normal', 'healthy', 'good', 'stable', 'continue']
    };
    
    const text = section1.toLowerCase();
    for (const [level, keywords] of Object.entries(riskKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return level;
      }
    }
    return 'GREEN';
  }

  extractKeyInsight(section1) {
    if (!section1) return 'Cycle patterns being analyzed';
    
    const summaryMatch = section1.match(/Summary Box:([\s\S]*?)(?=\n\n|\n###|$)/i);
    return summaryMatch ? summaryMatch[1].trim() : 'Cycle patterns being analyzed';
  }

  extractActionItem(section1) {
    if (!section1) return 'Continue tracking for insights';
    
    const guidanceMatch = section1.match(/Clinical Guidance:([\s\S]*?)(?=\n\n|\n###|$)/i);
    return guidanceMatch ? guidanceMatch[1].trim() : 'Continue tracking for insights';
  }

  extractRiskFromSections(sections) {
    console.log('🔍 EXTRACTING RISK - Clinical Summary:', sections.clinicalSummary);
    
    // Generate AI-based risk assessment from current cycle data
    const riskLevel = this.extractRiskLevel(sections.clinicalSummary || sections.section1);
    
    // Determine cycle irregularity based on AI analysis
    let cycleIrregularity = 'Normal';
    if (sections.clinicalSummary && (sections.clinicalSummary.includes('irregular') || sections.clinicalSummary.includes('40 days'))) {
      cycleIrregularity = 'Long cycles';
      console.log('✅ Found irregular cycles in clinical summary');
    } else if (sections.clinicalSummary && sections.clinicalSummary.includes('short')) {
      cycleIrregularity = 'Short cycles';
      console.log('✅ Found short cycles in clinical summary');
    }
    
    // Determine anemia risk based on AI analysis
    let anemiaRisk = 'Low';
    if (sections.clinicalSummary && (sections.clinicalSummary.includes('heavy') || sections.clinicalSummary.includes('clotting') || sections.clinicalSummary.includes('anemia'))) {
      anemiaRisk = 'Moderate';
      console.log('✅ Found anemia risk indicators in clinical summary');
    }
    
    // Determine overall risk based on AI analysis
    let overallRisk = 'Low';
    if (sections.clinicalSummary && (sections.clinicalSummary.includes('severe') || sections.clinicalSummary.includes('urgent') || sections.clinicalSummary.includes('immediate'))) {
      overallRisk = 'High';
      console.log('✅ Found high risk indicators in clinical summary');
    } else if (sections.clinicalSummary && (sections.clinicalSummary.includes('moderate') || sections.clinicalSummary.includes('concern') || sections.clinicalSummary.includes('evaluation'))) {
      overallRisk = 'Moderate';
      console.log('✅ Found moderate risk indicators in clinical summary');
    }
    
    const result = {
      cycleIrregularity: cycleIrregularity,
      anemiaRisk: anemiaRisk,
      overallRisk: overallRisk
    };
    
    console.log('🔍 FINAL RISK ASSESSMENT:', result);
    return result;
  }

  extractRecommendationsFromSections(sections) {
    const recommendations = [];
    
    // Extract from Section 2 lifestyle optimizations
    if (sections.section2) {
      const lifestyleMatch = sections.section2.match(/Lifestyle Optimizations:([\s\S]*?)(?=\n\n|\n###|$)/i);
      if (lifestyleMatch) {
        const bullets = lifestyleMatch[1].match(/•\s*([^\n]+)/g);
        if (bullets) {
          recommendations.push(...bullets.map(b => b.replace('•', '').trim()));
        }
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue tracking your cycle'];
  }

  extractAlertsFromSections(sections) {
    const riskLevel = this.extractRiskLevel(sections.section1);
    
    switch (riskLevel) {
      case 'RED': return ['Medical evaluation recommended'];
      case 'YELLOW': return ['Monitor for changes'];
      default: return ['No immediate alerts'];
    }
  }

  extractTipsFromSection3(section3) {
    if (!section3) return ['Keep tracking for personalized insights'];
    
    const tips = [];
    const bulletMatches = section3.match(/•\s*([^\n]+)/g);
    if (bulletMatches) {
      tips.push(...bulletMatches.map(tip => tip.replace('•', '').trim()));
    }
    
    return tips.length > 0 ? tips : ['Keep tracking for personalized insights'];
  }

  extractPersonalizedTipsFromSections(sections) {
    const tips = [];
    
    console.log('🔍 EXTRACTING TIPS - Personalized Tips Section:', sections.personalizedTips);
    
    // Extract from the new Personalized Tips section
    if (sections.personalizedTips) {
      // Look for numbered lists (1. 2. 3.)
      const numberedTips = sections.personalizedTips.match(/\d+\.\s*([^\n]+)/g);
      if (numberedTips) {
        console.log('✅ Found numbered tips:', numberedTips);
        tips.push(...numberedTips.map(t => t.replace(/\d+\.\s*/, '').trim()));
      }
      
      // Look for bullet points or dash lists
      const bulletPoints = sections.personalizedTips.match(/[-•]\s*([^\n]+)/g);
      if (bulletPoints) {
        console.log('✅ Found bullet points in personalized tips:', bulletPoints);
        tips.push(...bulletPoints.map(b => b.replace(/[-•]\s*/, '').trim()));
      }
      
      // Look for quoted tips
      const quotedTips = sections.personalizedTips.match(/"([^"]+)"/g);
      if (quotedTips) {
        console.log('✅ Found quoted tips:', quotedTips);
        tips.push(...quotedTips.map(q => q.replace(/"/g, '').trim()));
      }
    }
    
    // Fallback to Action Plan if no personalized tips section
    if (tips.length === 0 && sections.actionablePlan) {
      console.log('🔍 FALLBACK: Extracting from Action Plan');
      // Look for self-care guidance with **bold** format
      const selfCareMatch = sections.actionablePlan.match(/\*\*Self-Care Guidance:\*\*([\s\S]*?)(?=\*\*Lifestyle Optimization|\*\*When to see|\*\*Future monitoring|$)/i);
      if (selfCareMatch) {
        console.log('✅ Found self-care guidance:', selfCareMatch[1]);
        // Extract sentences from self-care guidance
        const sentences = selfCareMatch[1].split(/[.!?]+/).filter(s => s.trim().length > 10);
        tips.push(...sentences.map(s => s.trim()).slice(0, 2));
      }
      
      // Look for lifestyle optimization with **bold** format
      const lifestyleMatch = sections.actionablePlan.match(/\*\*Lifestyle Optimization:\*\*([\s\S]*?)(?=\*\*When to see|\*\*Future monitoring|$)/i);
      if (lifestyleMatch) {
        console.log('✅ Found lifestyle optimization:', lifestyleMatch[1]);
        // Extract sentences from lifestyle optimization
        const sentences = lifestyleMatch[1].split(/[.!?]+/).filter(s => s.trim().length > 10);
        tips.push(...sentences.map(s => s.trim()).slice(0, 2));
      }
    }
    
    console.log('🔍 FINAL TIPS EXTRACTED:', tips);
    
    // Fallback tips if no specific tips found
    if (tips.length === 0) {
      console.log('❌ No tips found, using fallback');
      tips.push('Continue comprehensive cycle tracking for better insights');
    }
    
    return tips;
  }

  extractGentleRemindersFromSections(sections) {
    const reminders = [];
    
    console.log('🔍 EXTRACTING REMINDERS - Gentle Reminders Section:', sections.gentleReminders);
    
    // Extract from the new Gentle Reminders section
    if (sections.gentleReminders) {
      // Look for numbered lists with emojis (1. 🌸 2. 🌼 etc.)
      const numberedReminders = sections.gentleReminders.match(/\d+\.\s*[🌸🌼]\s*([^\n]+)/g);
      if (numberedReminders) {
        console.log('✅ Found numbered reminders with emojis:', numberedReminders);
        reminders.push(...numberedReminders.map(r => r.replace(/\d+\.\s*[🌸🌼]\s*/, '').trim()));
      }
      
      // Look for emoji reminders without numbers
      const emojiReminders = sections.gentleReminders.match(/[🌸🌼]\s*([^\n]+)/g);
      if (emojiReminders) {
        console.log('✅ Found emoji reminders:', emojiReminders);
        reminders.push(...emojiReminders.map(r => r.replace(/[🌸🌼]\s*/, '').trim()));
      }
      
      // Look for bullet points or dash lists
      const bulletPoints = sections.gentleReminders.match(/[-•]\s*([^\n]+)/g);
      if (bulletPoints) {
        console.log('✅ Found bullet points in gentle reminders:', bulletPoints);
        reminders.push(...bulletPoints.map(b => b.replace(/[-•]\s*/, '').trim()));
      }
    }
    
    // Fallback to existing logic if no gentle reminders section
    if (reminders.length === 0) {
      console.log('🔍 FALLBACK: Extracting from other sections');
      
      // Extract from Urgency Flag section for gentle reminders
      if (sections.urgencyFlag) {
        if (sections.urgencyFlag.includes('schedule') || sections.urgencyFlag.includes('consult')) {
          reminders.push('🌸 Schedule your medical appointment soon - you deserve timely care');
          console.log('✅ Added schedule reminder from urgency flag');
        }
        if (sections.urgencyFlag.includes('monitor') || sections.urgencyFlag.includes('tracking')) {
          reminders.push('🌼 Keep tracking your symptoms - this data helps your doctor');
          console.log('✅ Added tracking reminder from urgency flag');
        }
      }

      // Extract from Action Plan section for gentle reminders
      if (sections.actionablePlan) {
        if (sections.actionablePlan.includes('blood work') || sections.actionablePlan.includes('ultrasound')) {
          reminders.push('🌸 Consider the recommended tests - they help provide clarity');
          console.log('✅ Added test reminder from action plan');
        }
        if (sections.actionablePlan.includes('track') || sections.actionablePlan.includes('monitor')) {
          reminders.push('🌼 Continue your excellent tracking habits');
          console.log('✅ Added tracking reminder from action plan');
        }
        if (sections.actionablePlan.includes('report') || sections.actionablePlan.includes('changes')) {
          reminders.push('🌸 Trust your body\'s signals and report any changes');
          console.log('✅ Added report reminder from action plan');
        }
      }

      // Extract from Clinical Summary for contextual reminders
      if (sections.clinicalSummary) {
        if (sections.clinicalSummary.includes('pain') && sections.clinicalSummary.includes('8')) {
          reminders.push('🌸 Your pain levels are significant - consider medical evaluation');
          console.log('✅ Added pain reminder from clinical summary');
        }
        if (sections.clinicalSummary.includes('heavy') || sections.clinicalSummary.includes('clotting')) {
          reminders.push('🌼 Monitor your flow patterns for any concerning changes');
          console.log('✅ Added flow reminder from clinical summary');
        }
        if (sections.clinicalSummary.includes('stress') || sections.clinicalSummary.includes('sleep')) {
          reminders.push('🌸 Focus on stress management and quality sleep');
          console.log('✅ Added stress/sleep reminder from clinical summary');
        }
      }
    }

    console.log('🔍 FINAL REMINDERS EXTRACTED:', reminders);

    // Add general supportive reminders if no specific ones found
    if (reminders.length === 0) {
      console.log('❌ No specific reminders found, using fallback');
      reminders.push('🌼 Your detailed tracking provides valuable health insights');
      reminders.push('🌸 You\'re taking great care of your health by tracking this data');
    }
    
    return reminders.length > 0 ? reminders : ['Continue your excellent tracking habits'];
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
    // Look for the new ### SECTION format first
    const newFormatPattern = new RegExp(`### ${sectionName}[\\s\\S]*?(?=### |$)`, 'i');
    const newFormatMatch = text.match(newFormatPattern);
    if (newFormatMatch) {
      return newFormatMatch[0].trim();
    }
    
    // Fallback to old patterns for backward compatibility
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
    const latestCycle = cycleData[cycleData.length - 1];
    const cycleCount = cycleData.length;
    
    return {
      quickCheck: {
        flowAssessment: `${latestCycle.flowIntensity} flow documented - continue monitoring patterns`,
        symptomEvaluation: `Pain level ${latestCycle.pain}/10 with ${latestCycle.symptoms?.length || 0} symptoms tracked`,
        actionItem: 'Continue tracking cycles for pattern analysis',
        confidence: `Limited - based on ${cycleCount} cycle(s) logged`
      },
      aiInsights: [`Your ${latestCycle.cycleLength}-day cycle with ${latestCycle.flowIntensity} flow has been documented. Continue tracking to build a comprehensive health profile that will enable more personalized insights.`],
      personalizedTips: [
        'Track your cycle consistently for better pattern recognition',
        'Note any changes in flow, pain, or symptoms',
        'Maintain a healthy lifestyle with balanced nutrition',
        'Consult healthcare provider for persistent concerns'
      ],
      gentleReminders: [
        'Every cycle you track builds valuable health data',
        'Your body\'s patterns are unique and worth understanding',
        'Consistent tracking leads to better health insights'
      ]
    };
  }


  // ===== FERTILITY ANALYSIS =====
  async generateFertilityInsights(fertilityData, userProfile) {
    const prompt = this.buildFertilityPrompt(fertilityData, userProfile);
    try {
      console.log('🚀 FERTILITY: Starting AI service call...');
      console.log('🔍 FERTILITY: Service status:', this.getServiceStatus());
      console.log('🔍 FERTILITY: Prompt length:', prompt.length);
      
      // Use the parent class's executeWithFallback method for seamless fallback (SAME AS CYCLE TRACKING)
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      
      console.log('✅ FERTILITY: AI service returned insights:', insights);
      console.log('🔍 FERTILITY: Insights type:', typeof insights);
      console.log('🔍 FERTILITY: Insights length:', insights?.length);
      console.log('🔍 FERTILITY: Raw insights content:', insights);
      
      return this.processFertilityInsights(insights, fertilityData, userProfile);
    } catch (error) {
      console.error('❌ FERTILITY: Error generating fertility insights:', error);
      console.error('❌ FERTILITY: Error details:', error.message);
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
    
    return `You are an advanced AI assistant specializing in reproductive health and fertility analysis, with expertise in fertility awareness methods, conception optimization, and natural family planning. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

IMPORTANT: Do not introduce yourself as any specific doctor or use any doctor names. Start directly with the analysis content.

PATIENT CONTEXT:
- Age: ${age} years
- Medical History: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Tracking Mode: ${trackingMode} (${trackingMode === 'advanced' ? 'Full fertility indicators' : 'Basic indicators only'})

FERTILITY GOAL & CONTEXT:
- Primary Goal: ${latestEntry?.fertilityGoal || 'Not specified'}
- Conception Timeline: ${latestEntry?.conceptionTimeline || 'Not specified'}
- Previous Pregnancies: ${latestEntry?.previousPregnancies || 0}
- Previous Miscarriages: ${latestEntry?.previousMiscarriages || 0}
- Fertility Treatments: ${latestEntry?.fertilityTreatments?.join(', ') || 'None'}
- Contraception Method: ${latestEntry?.contraceptionPreference || 'None'}

CURRENT FERTILITY DATA:
${dataSummary}

ANALYSIS SUMMARY:
- BBT Pattern: ${bbtTrend}
${trackingMode === 'advanced' ? `- Cervical Mucus: ${mucusPattern}` : ''}
- LH Testing: ${testResults}
- Confidence Factors: ${confidenceFactors.join(', ') || 'Limited data'}
- Assessment Confidence: ${confidenceLevel} (${confidencePercent}%)

Provide comprehensive fertility analysis in these EXACT sections with emojis, tailored to the user's specific fertility goal:

🩺 **CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current fertility status and key observations. Write like a healthcare professional explaining to a patient.

📊 **INTELLIGENT PATTERN RECOGNITION & CONTEXT**
Compare current fertility data with past entries, highlighting trends, changes, and patterns. Reference historical context and how this entry fits into the broader fertility pattern. Include specific bullet points with data analysis:
- BBT trends: "Your temperature has [risen/fallen/remained stable] from [X]°F to [Y]°F"
- Mucus patterns: "Your cervical mucus shows [pattern] which indicates [fertility status]"
- Ovulation timing: "Based on your data, ovulation likely occurred [timing]"
- Cycle regularity: "Your cycles have been [regular/irregular] with [X] day variation"
- Fertility window: "Your fertile window appears to be [timing] based on [indicators]"
Use both narrative and bullet points for clarity.

🔍 **POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors using accurate but user-friendly medical terms. Consider hormonal factors, cycle phase, lifestyle influences, and other relevant factors. Make it educational but accessible.

🔗 **CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, health monitoring, and other health areas that may be influencing fertility. Show how one area of health influences another.

⚠️ **FERTILITY IMPACT & OPTIMIZATION**
Explain how current fertility patterns may affect conception chances, cycle health, and overall reproductive wellbeing. Be specific about potential implications and optimization strategies.

🎯 **CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, pattern consistency, and any uncertainties. Explain what would increase confidence.

💡 **INTELLIGENT PERSONALIZED ACTION ITEMS**
Based on the user's specific fertility data, age, and goals, provide 3-5 evidence-based, practical, prioritized next steps. Tailor recommendations to their fertility goal:

FOR TRYING TO CONCEIVE (TTC):
- "Try intercourse on [specific dates] based on your fertile window"
- "Your peak fertility window is [dates] - optimal timing for conception"
- "Consider tracking additional indicators for maximum conception chances"
- "Based on your timeline, consider [specific medical advice]"

FOR NATURAL FAMILY PLANNING (NFP):
- "Your safe period begins [date] and continues until [date]"
- "Avoid intercourse during fertile window: [dates]"
- "Your BBT rise indicates ovulation occurred - safe period begins in 3 days"
- "Consider backup contraception during uncertain periods"

FOR HEALTH MONITORING:
- "Your BBT pattern suggests [health status] - consider discussing with healthcare provider"
- "Track consistently to detect any concerning changes early"
- "Your cycle patterns indicate [health insights]"
- "Consider lifestyle modifications based on your patterns"

FOR CYCLE AWARENESS:
- "Continue tracking to better understand your unique patterns"
- "Your cycle shows [specific characteristics]"
- "Consider tracking additional indicators for comprehensive awareness"
- "Your patterns suggest [cycle insights]"

Make each recommendation specific to their actual data and goals.

🌟 **CONTEXTUAL PERSONALIZED TIP**
Based on their specific fertility data, age, and goals, offer one targeted piece of advice. For example:
- If peak fertility detected: "Your egg-white mucus and BBT rise confirm peak fertility - optimal timing for conception"
- If post-ovulation: "Your BBT rise indicates ovulation occurred - safe period begins in 3 days"
- If irregular patterns: "Your cycle variation may benefit from stress management and consistent tracking"
Make it feel like personalized medical advice from a caring healthcare professional.

🌸 **INTELLIGENT CONTEXTUAL REMINDERS**
Based on the user's specific fertility data and goals, provide 3-4 contextual reminders. For example:
- If trying to conceive: "Continue tracking for optimal timing, consider prenatal vitamins, maintain healthy lifestyle"
- If using NFP: "Track consistently for maximum effectiveness, consider backup methods during uncertain periods"
- If monitoring health: "Regular tracking helps detect changes early, discuss patterns with healthcare provider"
- If irregular cycles: "Consistent tracking improves pattern recognition, consider lifestyle factors"
Make each reminder specific to their actual data and goals.

⚖️ **MEDICAL DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on tracking data, not medical diagnosis. Encourage professional consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processFertilityInsights(insights, fertilityData, userProfile) {
    try {
      // Try to parse JSON response from AI (SAME AS CYCLE TRACKING)
      const parsedInsights = JSON.parse(insights);
      
      return {
        quickCheck: {
          ovulationAssessment: parsedInsights.quickCheck?.ovulationAssessment || 'Ovulation patterns analyzed',
          fertilityEvaluation: parsedInsights.quickCheck?.fertilityEvaluation || 'Fertility indicators evaluated',
          actionItem: parsedInsights.quickCheck?.actionItem || 'Continue tracking for comprehensive insights',
          confidence: parsedInsights.quickCheck?.confidence || 'Moderate'
        },
        aiInsights: parsedInsights.aiInsights || [insights],
        riskAssessment: parsedInsights.riskAssessment || 'Continue tracking to assess fertility patterns and overall health',
        recommendations: parsedInsights.recommendations || ['Continue tracking your fertility'],
        medicalAlerts: parsedInsights.medicalAlerts || ['No immediate alerts'],
        personalizedTips: parsedInsights.personalizedTips || ['Keep tracking for personalized insights'],
        gentleReminders: parsedInsights.gentleReminders || ['Continue tracking fertility indicators for better insights']
      };
    } catch (error) {
      // If JSON parsing fails, parse text response for specific sections (SAME AS CYCLE TRACKING)
      const textInsights = insights.toString();
      
      // Extract Fertility Insights (unique insights - predictions, trends, user journey)
      const fertilityInsights = this.extractFertilityInsights(textInsights, insights);
      
      // Extract specific sections for Fertility Patterns
      const ovulationAssessment = this.extractSection(textInsights, 'OVULATION ASSESSMENT', 'Ovulation patterns analyzed');
      const fertilityEvaluation = this.extractSection(textInsights, 'FERTILITY EVALUATION', 'Fertility indicators evaluated');
      const actionItem = this.extractSection(textInsights, 'ACTION ITEM', 'Continue tracking for comprehensive insights');
      const confidence = this.extractSection(textInsights, 'CONFIDENCE LEVEL', 'Moderate');
      const personalizedTips = this.extractTips(textInsights, 'PERSONALIZED TIPS');
      const gentleReminders = this.extractTips(textInsights, 'GENTLE REMINDERS');
      
      return {
        quickCheck: {
          ovulationAssessment: ovulationAssessment,
          fertilityEvaluation: fertilityEvaluation,
          actionItem: actionItem,
          confidence: confidence
        },
        aiInsights: [fertilityInsights], // Use extracted fertility insights, not full response
          riskAssessment: 'Continue tracking to assess fertility patterns and overall health',
        recommendations: ['Continue tracking your fertility'],
        medicalAlerts: ['No immediate alerts'],
        personalizedTips: personalizedTips,
        gentleReminders: gentleReminders
      };
    }
  }

  extractFertilityInsights(text, fallback) {
    // Extract the full Fertility Insights section with multiple paragraphs (SAME AS CYCLE TRACKING)
    const patterns = [
      new RegExp(`\\*\\*FERTILITY INSIGHTS\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`FERTILITY INSIGHTS[:\-]\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
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
    const latestEntry = fertilityData[fertilityData.length - 1];
    const age = userProfile.age || 25;
    const trackingMode = latestEntry?.trackingMode || 'beginner';
    
    return {
      quickCheck: {
        ovulationAssessment: `${trackingMode === 'advanced' ? 'Advanced' : 'Basic'} fertility tracking active - continue monitoring`,
        fertilityEvaluation: `Age ${age} fertility tracking with ${fertilityData.length} entries logged`,
        actionItem: `Continue ${trackingMode} tracking for comprehensive fertility insights`,
        confidence: `Moderate - based on ${fertilityData.length} fertility entries`
      },
      aiInsights: [`Your fertility journey is being carefully tracked with ${fertilityData.length} entries in ${trackingMode} mode. Continue monitoring your indicators to build a comprehensive fertility profile that will enable personalized insights and timing guidance.`],
      personalizedTips: [
        `Maintain consistent ${trackingMode} tracking for pattern recognition`,
        age < 35 ? 'Optimal fertility age - focus on healthy lifestyle' : 'Consider fertility evaluation if trying to conceive',
        trackingMode === 'advanced' ? 'Monitor cervical mucus changes throughout cycle' : 'Consider upgrading to advanced tracking for better insights',
        'Track BBT daily for ovulation confirmation'
      ],
      gentleReminders: [
        'Your fertility data builds valuable insights over time',
        'Every day of tracking contributes to understanding your patterns',
        'Be patient with your body and the tracking process'
      ]
    };
  }

  // ===== PREGNANCY ANALYSIS =====
  async generatePregnancyInsights(pregnancyData, userProfile) {
    const prompt = this.buildPregnancyPrompt(pregnancyData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
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
    
    return `You are a reproductive and women's health AI assistant specializing in pregnancy tracking and prenatal care. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age} years old
- Medical Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Former smoker: ${userProfile.tobaccoUse || 'No'}

CURRENT PREGNANCY DATA:
- Due Date: ${pregnancyData.dueDate || 'Unknown'}
- Trimester: ${pregnancyData.trimester || 'Unknown'}
- Pregnancy Type: ${pregnancyData.pregnancyType || 'Unknown'}
- Complications: ${pregnancyData.complications?.join(', ') || 'None reported'}

CURRENT SYMPTOMS:
- Nausea: ${pregnancyData.symptoms?.nausea || 'Not reported'}
- Fatigue: ${pregnancyData.symptoms?.fatigue || 'Not reported'}
- Mood: ${pregnancyData.symptoms?.mood || 'Not reported'}
- Sleep: ${pregnancyData.symptoms?.sleep || 'Not reported'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current pregnancy status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current pregnancy data with typical patterns for this trimester, highlighting what's normal, what's notable, and how this pregnancy is progressing. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current symptoms and pregnancy status using accurate but user-friendly medical terms. Consider hormonal changes, fetal development stage, maternal adaptations, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, mental health, sleep, nutrition, and other health areas that may be influencing this pregnancy. Show how overall health affects pregnancy.

**HEALTH IMPACT & RISKS**
Explain how current pregnancy patterns may affect daily life, fetal development, delivery preparation, and long-term maternal health. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this pregnancy stage and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, pregnancy-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional prenatal care and consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
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
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
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
    
    return `You are a reproductive and women's health AI assistant specializing in menopause and perimenopause care. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age} years old
- Medical Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Former smoker: ${userProfile.tobaccoUse || 'No'}

CURRENT MENOPAUSE DATA:
- Menopause Type: ${menopauseData.menopauseType || 'Unknown'}
- Is In Menopause: ${menopauseData.isInMenopause ? 'Yes' : 'No'}
- Hormone Therapy: ${menopauseData.hormoneTherapy?.isOnHRT ? 'Yes' : 'No'}

CURRENT SYMPTOMS:
- Hot Flashes: ${menopauseData.symptoms?.hotFlashes || 'Not reported'}
- Night Sweats: ${menopauseData.symptoms?.nightSweats || 'Not reported'}
- Mood Changes: ${menopauseData.symptoms?.moodChanges || 'Not reported'}
- Sleep Disruption: ${menopauseData.symptoms?.sleepDisruption || 'Not reported'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current menopause status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current menopause data with typical patterns for this stage, highlighting what's normal, what's notable, and how this menopause transition is progressing. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current menopause symptoms and status using accurate but user-friendly medical terms. Consider hormonal changes, age factors, lifestyle influences, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, mental health, sleep, bone health, and other health areas that may be influencing menopause. Show how one area of health affects another.

**HEALTH IMPACT & RISKS**
Explain how current menopause patterns may affect daily life, bone health, heart health, sleep, and long-term wellbeing. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this menopause stage and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, menopause-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional menopause care and consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
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

  // ===== MENTAL HEALTH ANALYSIS =====
  async generateMentalHealthInsights(mentalHealthData, userProfile) {
    const prompt = this.buildMentalHealthPrompt(mentalHealthData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processMentalHealthInsights(insights, mentalHealthData, userProfile);
    } catch (error) {
      console.error('Error generating mental health insights:', error);
      return this.getFallbackMentalHealthInsights(mentalHealthData, userProfile);
    }
  }

  buildMentalHealthPrompt(mentalHealthData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.mental || [];
    const medications = userProfile.medications || [];
    
    return `You are a reproductive and women's health AI assistant specializing in mental health and wellness. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age}
- Mental Health Conditions: ${conditions.join(', ') || 'None reported'}
- Current Medications: ${medications.join(', ') || 'None'}
- Lifestyle: ${userProfile.lifestyle?.exerciseFrequency || 'Not specified'}

CURRENT MENTAL HEALTH DATA:
- Date: ${mentalHealthData.date}
- Mood: ${mentalHealthData.mood}
- Anxiety Level: ${mentalHealthData.anxiety}/10
- Depression Level: ${mentalHealthData.depression}/10
- Stress Level: ${mentalHealthData.stress}/10
- Sleep Quality: ${mentalHealthData.sleep}/10
- Energy Level: ${mentalHealthData.energy}/10
- Symptoms: ${mentalHealthData.symptoms?.join(', ') || 'None reported'}
- Triggers: ${mentalHealthData.triggers?.join(', ') || 'None identified'}
- Coping Strategies: ${mentalHealthData.copingStrategies?.join(', ') || 'None used'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current mental health status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current mental health data with typical patterns, highlighting trends, changes, and how current state fits into broader mental health patterns. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current mental health status using accurate but user-friendly medical terms. Consider hormonal factors, stress, sleep, lifestyle influences, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, pregnancy, sleep, stress, and other health areas that may be influencing mental health. Show how one area of health influences another.

**HEALTH IMPACT & RISKS**
Explain how current mental health patterns may affect daily life, relationships, work, physical health, and long-term wellbeing. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this mental health state and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, mental health-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional mental health consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processMentalHealthInsights(response, mentalHealthData, userProfile) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        aiInsights: parsed.aiInsights || [response],
        patterns: parsed.patterns || 'Analyzing mental health patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue monitoring your mental health'],
        riskAssessment: parsed.riskAssessment || 'Mental health monitoring active'
      };
    } catch (error) {
      console.error('Error parsing mental health insights:', error);
      return {
        aiInsights: [response],
        patterns: 'Mental health analysis completed',
        alerts: [],
        recommendations: ['Continue monitoring your mental health'],
        riskAssessment: 'Mental health monitoring active'
      };
    }
  }

  getFallbackMentalHealthInsights(mentalHealthData, userProfile) {
    return {
      aiInsights: ['Mental health tracking is important for overall wellness', 'Continue monitoring your mood and stress levels', 'Consider professional support if symptoms persist'],
      patterns: 'Mental health patterns are being analyzed',
      alerts: [],
      recommendations: ['Practice stress management techniques', 'Maintain regular sleep schedule', 'Stay connected with support network'],
      riskAssessment: 'Mental health monitoring active'
    };
  }

  // ===== SEXUAL HEALTH ANALYSIS =====
  async generateSexualHealthInsights(sexualHealthData, userProfile) {
    const prompt = this.buildSexualHealthPrompt(sexualHealthData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processSexualHealthInsights(insights, sexualHealthData, userProfile);
    } catch (error) {
      console.error('Error generating sexual health insights:', error);
      return this.getFallbackSexualHealthInsights(sexualHealthData, userProfile);
    }
  }

  buildSexualHealthPrompt(sexualHealthData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    
    return `You are a reproductive and women's health AI assistant specializing in sexual health and wellness. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age}
- Reproductive Conditions: ${conditions.join(', ') || 'None reported'}

CURRENT SEXUAL HEALTH DATA:
- Date: ${sexualHealthData.date}
- Symptoms: ${sexualHealthData.symptoms?.join(', ') || 'None reported'}
- STI Screening: ${sexualHealthData.stiScreening || 'Not performed'}
- Contraception: ${sexualHealthData.contraception || 'Not specified'}
- Concerns: ${sexualHealthData.concerns || 'None reported'}
- Notes: ${sexualHealthData.notes || 'None'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current sexual health status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current sexual health data with typical patterns, highlighting trends, changes, and how current state fits into broader sexual health patterns. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current sexual health status using accurate but user-friendly medical terms. Consider hormonal factors, reproductive health, lifestyle influences, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, pregnancy, mental health, and other health areas that may be influencing sexual health. Show how one area of health influences another.

**HEALTH IMPACT & RISKS**
Explain how current sexual health patterns may affect daily life, relationships, reproductive health, and long-term wellbeing. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this sexual health state and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, sexual health-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional sexual health consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processSexualHealthInsights(response, sexualHealthData, userProfile) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        aiInsights: parsed.aiInsights || [response],
        patterns: parsed.patterns || 'Analyzing sexual health patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue monitoring your sexual health'],
        riskAssessment: parsed.riskAssessment || 'Sexual health monitoring active'
      };
    } catch (error) {
      console.error('Error parsing sexual health insights:', error);
      return {
        aiInsights: [response],
        patterns: 'Sexual health analysis completed',
        alerts: [],
        recommendations: ['Continue monitoring your sexual health'],
        riskAssessment: 'Sexual health monitoring active'
      };
    }
  }

  getFallbackSexualHealthInsights(sexualHealthData, userProfile) {
    return {
      aiInsights: ['Sexual health is an important part of overall wellness', 'Regular STI screening is recommended', 'Open communication with partners is key'],
      patterns: 'Sexual health patterns are being analyzed',
      alerts: [],
      recommendations: ['Practice safe sex', 'Get regular STI screenings', 'Communicate openly with partners', 'Use appropriate contraception'],
      riskAssessment: 'Sexual health monitoring active'
    };
  }

  // ===== DASHBOARD INSIGHTS ANALYSIS =====
  async generateDashboardInsights(dashboardData, userProfile) {
    const prompt = this.buildDashboardPrompt(dashboardData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processDashboardInsights(insights, dashboardData, userProfile);
    } catch (error) {
      console.error('Error generating dashboard insights:', error);
      return this.getFallbackDashboardInsights(dashboardData, userProfile);
    }
  }

  buildDashboardPrompt(dashboardData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const mentalHealth = userProfile.conditions?.mental || [];
    const lifestyle = userProfile.lifestyle || {};
    
    return `You are a reproductive and women's health AI assistant providing comprehensive dashboard insights. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age} years old
- Reproductive Conditions: ${conditions.join(', ') || 'None reported'}
- Mental Health: ${mentalHealth.join(', ') || 'None reported'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Stress ${lifestyle.stressLevel || 'Not specified'}

COMPREHENSIVE HEALTH DATA:
- Health Logs: ${dashboardData.healthLogs?.length || 0} entries
- Recent Activity: ${dashboardData.recentLogs?.map(log => `${log.type}: ${log.mood || 'N/A'}`).join(', ') || 'None'}
- Goals: ${dashboardData.healthGoals?.join(', ') || 'General wellness'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the overall health status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current health data with typical patterns, highlighting trends, changes, and how current state fits into broader health patterns. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current health status using accurate but user-friendly medical terms. Consider lifestyle factors, age, conditions, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from all health modules (cycle, fertility, pregnancy, mental health, etc.) that may be influencing overall health. Show how one area of health affects another.

**HEALTH IMPACT & RISKS**
Explain how current health patterns may affect daily life, long-term wellbeing, and specific health outcomes. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, tracking consistency, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this user's overall health situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, health-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional healthcare consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processDashboardInsights(response, dashboardData, userProfile) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        aiInsights: parsed.aiInsights || [response],
        patterns: parsed.patterns || 'Analyzing overall health patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue monitoring your health'],
        riskAssessment: parsed.riskAssessment || 'Health monitoring active'
      };
    } catch (error) {
      console.error('Error parsing dashboard insights:', error);
      return {
        aiInsights: [response],
        patterns: 'Dashboard health analysis completed',
        alerts: [],
        recommendations: ['Continue monitoring your health'],
        riskAssessment: 'Health monitoring active'
      };
    }
  }

  getFallbackDashboardInsights(dashboardData, userProfile) {
    return {
      aiInsights: ['Comprehensive health tracking is important for overall wellness', 'Continue monitoring all health aspects', 'Maintain regular healthcare checkups'],
      patterns: 'Overall health patterns are being analyzed',
      alerts: [],
      recommendations: ['Track health regularly', 'Maintain healthy lifestyle', 'Stay connected with healthcare providers', 'Monitor all health modules'],
      riskAssessment: 'Comprehensive health monitoring active'
    };
  }

  // ===== PCOS ANALYSIS =====
  async generatePCOSInsights(pcosData, userProfile) {
    const prompt = this.buildPCOSPrompt(pcosData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processPCOSInsights(insights, pcosData, userProfile);
    } catch (error) {
      console.error('Error generating PCOS insights:', error);
      return this.getFallbackPCOSInsights(pcosData, userProfile);
    }
  }

  buildPCOSPrompt(pcosData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    
    return `You are a reproductive and women's health AI assistant specializing in PCOS (Polycystic Ovary Syndrome) management. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age} years old
- Reproductive Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Lifestyle: Exercise ${userProfile.lifestyle?.exerciseFrequency || 'Not specified'}, Diet ${userProfile.lifestyle?.diet || 'Not specified'}, Stress ${userProfile.lifestyle?.stressLevel || 'Not specified'}

CURRENT PCOS DATA:
- Condition: ${pcosData.condition || 'PCOS'}
- Severity: ${pcosData.severity || 'Not specified'}
- Weight: ${pcosData.weight || 'Not tracked'} lbs
- Blood Pressure: ${pcosData.bloodPressure || 'Not measured'}
- Glucose: ${pcosData.glucose || 'Not measured'} mg/dL
- Symptoms Count: ${pcosData.symptoms?.length || 0}

CURRENT SYMPTOMS:
- Symptoms: ${pcosData.symptoms?.join(', ') || 'None reported'}
- Severity Level: ${pcosData.severity || 'Not specified'}

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current PCOS status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current PCOS data with typical patterns for this condition, highlighting what's normal, what's notable, and how this PCOS management is progressing. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current PCOS symptoms and status using accurate but user-friendly medical terms. Consider hormonal factors, insulin resistance, lifestyle influences, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, fertility, mental health, weight management, and other health areas that may be influencing PCOS. Show how one area of health affects another.

**HEALTH IMPACT & RISKS**
Explain how current PCOS patterns may affect daily life, fertility, metabolic health, and long-term wellbeing. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this PCOS stage and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, PCOS-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional PCOS care and consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processPCOSInsights(response, pcosData, userProfile) {
    try {
      const parsed = JSON.parse(response);
      return {
        aiInsights: parsed.aiInsights || [response],
        patterns: parsed.patterns || 'Analyzing PCOS patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue PCOS management'],
        riskAssessment: parsed.riskAssessment || 'PCOS monitoring active'
      };
    } catch (error) {
      console.error('Error parsing PCOS insights:', error);
      return {
        aiInsights: [response],
        patterns: 'PCOS analysis completed',
        alerts: [],
        recommendations: ['Continue PCOS management'],
        riskAssessment: 'PCOS monitoring active'
      };
    }
  }

  getFallbackPCOSInsights(pcosData, userProfile) {
    return {
      aiInsights: ['PCOS management requires consistent monitoring and lifestyle modifications', 'Regular tracking helps identify patterns and treatment effectiveness', 'Work closely with your healthcare provider for optimal PCOS care'],
      patterns: 'PCOS patterns are being analyzed',
      alerts: [],
      recommendations: ['Monitor symptoms regularly', 'Maintain healthy lifestyle', 'Follow treatment plan', 'Track metabolic markers'],
      riskAssessment: 'PCOS monitoring active'
    };
  }

  // ===== ENDOMETRIOSIS ANALYSIS =====
  async generateEndometriosisInsights(endometriosisData, userProfile) {
    const prompt = this.buildEndometriosisPrompt(endometriosisData, userProfile);
    try {
      const insights = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.processEndometriosisInsights(insights, endometriosisData, userProfile);
    } catch (error) {
      console.error('Error generating endometriosis insights:', error);
      return this.getFallbackEndometriosisInsights(endometriosisData, userProfile);
    }
  }

  buildEndometriosisPrompt(endometriosisData, userProfile) {
    const age = userProfile.age;
    const conditions = userProfile.conditions?.reproductive || [];
    const familyHistory = userProfile.familyHistory?.womensConditions || [];
    
    return `You are a reproductive and women's health AI assistant specializing in endometriosis management. Generate rich, interconnected, narrative insights that feel like a personalized medical briefing.

PATIENT CONTEXT:
- Age: ${age} years old
- Reproductive Conditions: ${conditions.join(', ') || 'None reported'}
- Family History: ${familyHistory.join(', ') || 'None reported'}
- Lifestyle: Exercise ${userProfile.lifestyle?.exerciseFrequency || 'Not specified'}, Diet ${userProfile.lifestyle?.diet || 'Not specified'}, Stress ${userProfile.lifestyle?.stressLevel || 'Not specified'}

CURRENT ENDOMETRIOSIS DATA:
- Condition: ${endometriosisData.condition || 'Endometriosis'}
- Severity: ${endometriosisData.severity || 'Not specified'}
- Pain Level: ${endometriosisData.painLevel || 'Not specified'}/10
- Symptoms Count: ${endometriosisData.symptoms?.length || 0}

CURRENT SYMPTOMS:
- Symptoms: ${endometriosisData.symptoms?.join(', ') || 'None reported'}
- Pain Severity: ${endometriosisData.painLevel || 'Not specified'}/10

Generate comprehensive insights following this EXACT structure:

**CLINICAL SUMMARY**
Provide 1-2 sentences in plain language describing the current endometriosis status and key observations. Write like a doctor explaining to a patient.

**PATTERN RECOGNITION & CONTEXT**
Compare current endometriosis data with typical patterns for this condition, highlighting what's normal, what's notable, and how this endometriosis management is progressing. Use narrative form, not bullet points.

**POSSIBLE CAUSES / MEDICAL REASONING**
Explain likely contributors to current endometriosis symptoms and status using accurate but user-friendly medical terms. Consider hormonal factors, inflammation, lifestyle influences, and other relevant factors.

**CROSS-MODULE CONNECTIONS**
Link relevant factors from cycle tracking, fertility, pain management, mental health, and other health areas that may be influencing endometriosis. Show how one area of health affects another.

**HEALTH IMPACT & RISKS**
Explain how current endometriosis patterns may affect daily life, fertility, pain levels, and long-term wellbeing. Be specific about potential implications.

**CONFIDENCE LEVEL**
Rate as High/Medium/Low with specific reasoning based on data completeness, symptom reporting, and any uncertainties. Explain what would increase confidence.

**PERSONALIZED ACTION ITEMS**
Provide 3-5 evidence-based, practical, prioritized next steps specific to this endometriosis stage and user's situation. Make them actionable and specific.

**PERSONALIZED TIP**
Offer one supportive, endometriosis-focused, empathetic piece of advice that feels personal and encouraging. This should feel like advice from a caring healthcare provider.

**GENERAL REMINDER / DISCLAIMER**
Include appropriate medical disclaimer about these insights being based on logs, not medical diagnosis. Encourage professional endometriosis care and consultation when needed.

Write in narrative form with clear section headers. Be empathetic, supportive, and non-judgmental. Make insights feel like a personalized medical briefing from a caring healthcare professional. Use precise but accessible medical language.`;
  }

  processEndometriosisInsights(response, endometriosisData, userProfile) {
    try {
      const parsed = JSON.parse(response);
      return {
        aiInsights: parsed.aiInsights || [response],
        patterns: parsed.patterns || 'Analyzing endometriosis patterns...',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || ['Continue endometriosis management'],
        riskAssessment: parsed.riskAssessment || 'Endometriosis monitoring active'
      };
    } catch (error) {
      console.error('Error parsing endometriosis insights:', error);
      return {
        aiInsights: [response],
        patterns: 'Endometriosis analysis completed',
        alerts: [],
        recommendations: ['Continue endometriosis management'],
        riskAssessment: 'Endometriosis monitoring active'
      };
    }
  }

  getFallbackEndometriosisInsights(endometriosisData, userProfile) {
    return {
      aiInsights: ['Endometriosis management requires comprehensive pain and symptom tracking', 'Regular monitoring helps identify triggers and treatment effectiveness', 'Work closely with your healthcare provider for optimal endometriosis care'],
      patterns: 'Endometriosis patterns are being analyzed',
      alerts: [],
      recommendations: ['Track pain patterns regularly', 'Monitor symptom triggers', 'Follow treatment plan', 'Maintain pain management strategies'],
      riskAssessment: 'Endometriosis monitoring active'
    };
  }
}

export default AFABAIService;
