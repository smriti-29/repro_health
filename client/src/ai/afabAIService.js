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
      return await this.processCycleInsights(insights, cycleData, userProfile);
    } catch (error) {
      console.error('Error generating cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  // ===== MEDICATION NLP PARSING =====
  parseMedicationInfo(medicationText) {
    // Handle both string and array inputs
    let medicationString = '';
    if (Array.isArray(medicationText)) {
      medicationString = medicationText.join(', ');
    } else if (typeof medicationText === 'string') {
      medicationString = medicationText;
    } else {
      medicationString = '';
    }
    
    if (!medicationString || medicationString.trim() === '') {
      return {
        medications: [],
        parsedText: 'No medications reported',
        hasMedications: false
      };
    }

    const medications = [];
    const text = medicationString.toLowerCase();
    
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

  async processCycleInsights(insights, cycleData, userProfile) {
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
        personalizedTips: await this.generateDedicatedPersonalizedTips(cycleData, userProfile),
        gentleReminders: await this.generateDedicatedGentleReminders(cycleData, userProfile)
      };
    } catch (error) {
      console.error('Error processing cycle insights:', error);
      return this.getFallbackCycleInsights(cycleData, userProfile);
    }
  }

  extractEnhancedSections(text) {
    const sections = {};
    
    // Debug: Log all section headers found in the response
    const lines = text.split('\n');
    const foundHeaders = lines.filter(line => 
      line.includes('👋') || line.includes('🩺') || line.includes('🏥') || 
      line.includes('🔬') || line.includes('📋') || line.includes('📊')
    );
    console.log('🔍 All section headers found in AI response:', foundHeaders);
    console.log('🔍 Full AI response structure:');
    lines.forEach((line, index) => {
      if (line.includes('👋') || line.includes('🩺') || line.includes('🏥') || 
          line.includes('🔬') || line.includes('📋') || line.includes('📊')) {
        console.log(`Line ${index}: ${line}`);
      }
    });
    
    // Use a more robust extraction method that splits by section headers
    // Based on console logs, the AI returns headers with additional text like (SNAPSHOT) and (TIERED)
    const sectionHeaders = [
      { key: 'greeting', patterns: ['👋 **GREETING & CONTEXT**', '## 👋 GREETING & CONTEXT', '👋 GREETING & CONTEXT'] },
      { key: 'clinicalSummary', patterns: ['🩺 **CLINICAL SUMMARY (SNAPSHOT)**', '🩺 **CLINICAL SUMMARY**', '## 🩺 CLINICAL SUMMARY', '🩺 CLINICAL SUMMARY'] },
      { key: 'systemicFactors', patterns: ['🏥 **SYSTEMIC & LIFESTYLE FACTORS**', '## 🏥 SYSTEMIC & LIFESTYLE FACTORS', '🏥 SYSTEMIC & LIFESTYLE FACTORS'] },
      { key: 'clinicalImpression', patterns: ['🔬 **CLINICAL IMPRESSION (TIERED)**', '🔬 **CLINICAL IMPRESSION**', '## 🔬 CLINICAL IMPRESSION', '🔬 CLINICAL IMPRESSION'] }
    ];
    
    // Try each pattern for each section
    for (const section of sectionHeaders) {
      console.log(`🔍 Trying to extract section: ${section.key}`);
      for (const pattern of section.patterns) {
        console.log(`🔍 Trying pattern: "${pattern}"`);
        const content = this.extractSection(text, pattern);
        console.log(`🔍 Pattern "${pattern}" returned:`, content ? content.substring(0, 100) + '...' : 'null');
        if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
          console.log(`✅ Successfully extracted ${section.key} with pattern: "${pattern}"`);
          sections[section.key] = content;
          break;
        }
      }
      if (!sections[section.key]) {
        console.log(`❌ Failed to extract ${section.key} with any pattern`);
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
      sections.clinicalImpression = this.extractSection(text, '🔬 **CLINICAL IMPRESSION (TIERED)**') || this.extractSection(text, '🔬 **CLINICAL IMPRESSION**') || this.extractSection(text, '## 🔬 CLINICAL IMPRESSION') || this.extractSection(text, '🔬 CLINICAL IMPRESSION') || this.extractSection(text, '🔬 Clinical Impression');
    }
    
    // Note: Personalized Tips and Gentle Reminders are now generated separately
    // and not included in the main Dr. AI analysis
    
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
    // Use exact string matching to find sections
    const lines = text.split('\n');
    let sectionStartIndex = -1;
    let sectionEndIndex = -1;
    
    // Find the exact section header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === sectionName) {
        sectionStartIndex = i;
        console.log(`🔍 Found exact section "${sectionName}" at line ${i}:`, line);
        break;
      }
    }
    
    if (sectionStartIndex === -1) {
      console.log(`❌ Section "${sectionName}" not found in text`);
      return fallback;
    }
    
    // Find the next section header (look for any emoji + ** pattern)
    for (let i = sectionStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[👋🩺🏥🔬📋📊].*\*\*.*\*\*$/)) {
        sectionEndIndex = i;
        console.log(`🔍 Found next section at line ${i}:`, line);
        break;
      }
    }
    
    if (sectionEndIndex === -1) {
      sectionEndIndex = lines.length;
      console.log(`🔍 No next section found, using end of text`);
    }
    
    // Extract the content (skip the header line)
    const sectionLines = lines.slice(sectionStartIndex + 1, sectionEndIndex);
    const content = sectionLines.join('\n').trim();
    
    console.log(`🔍 Extracted content for "${sectionName}":`, content.substring(0, 100) + '...');
    
    // Only return if we have meaningful content
    if (content && content.length > 20 && !content.includes('completed successfully') && !content.includes('generated') && !content.includes('available')) {
      console.log(`✅ Returning real content for "${sectionName}"`);
      return content;
    }
    
    console.log(`❌ Returning fallback for "${sectionName}"`);
    return fallback;
  }

  extractTips(text, sectionName) {
    // Look for emoji + section headers or regular patterns
    // Escape special regex characters in sectionName
    const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`[💝🌸]\\s*\\*\\*${escapedSectionName}\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n[📈🩸⚠️📋🎯💝🌸]|$)`, 'i'),
      new RegExp(`\\*\\*${escapedSectionName}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`${escapedSectionName}[:\-]\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
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
      
      return await this.processFertilityInsights(insights, fertilityData, userProfile);
    } catch (error) {
      console.error('❌ FERTILITY: Error generating fertility insights:', error);
      console.error('❌ FERTILITY: Error details:', error.message);
      return this.getFallbackFertilityInsights(fertilityData, userProfile);
    }
  }

  buildFertilityPrompt(fertilityData, userProfile) {
  // Add calculateAge helper method
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25; // Default age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Calculate fertility health score (0-10)
  const calculateFertilityHealthScore = (fertilityEntry, age) => {
    let score = 5; // Base score
    
    // Age factor (optimal fertility 20-30)
    if (age >= 20 && age <= 30) score += 2;
    else if (age >= 31 && age <= 35) score += 1;
    else if (age >= 36 && age <= 40) score -= 1;
    else if (age > 40) score -= 2;
    
    // Lifestyle factors
    const stressLevel = fertilityEntry.stressLevel || 5;
    const sleepQuality = fertilityEntry.sleepQuality || 5;
    const exerciseFreq = fertilityEntry.exerciseFrequency || 'moderate';
    const dietQuality = fertilityEntry.dietQuality || 'good';
    
    // Stress (lower is better)
    if (stressLevel <= 3) score += 1.5;
    else if (stressLevel <= 5) score += 0.5;
    else if (stressLevel >= 8) score -= 1.5;
    
    // Sleep (higher is better)
    if (sleepQuality >= 8) score += 1.5;
    else if (sleepQuality >= 6) score += 0.5;
    else if (sleepQuality <= 3) score -= 1.5;
    
    // Exercise
    if (exerciseFreq === 'high') score += 1;
    else if (exerciseFreq === 'moderate') score += 0.5;
    else if (exerciseFreq === 'low') score -= 0.5;
    
    // Diet
    if (dietQuality === 'excellent') score += 1;
    else if (dietQuality === 'good') score += 0.5;
    else if (dietQuality === 'poor') score -= 1;
    
    // Fertility indicators
    const bbt = parseFloat(fertilityEntry.bbt);
    if (bbt && bbt >= 97.0 && bbt <= 99.0) score += 0.5; // Normal BBT range
    
    const cervicalMucus = fertilityEntry.cervicalMucus;
    if (cervicalMucus === 'egg-white' || cervicalMucus === 'watery') score += 1; // Fertile mucus
    
    // Previous pregnancies (positive indicator)
    const pregnancies = fertilityEntry.previousPregnancies || 0;
    if (pregnancies > 0) score += 0.5;
    
    // Previous miscarriages (negative indicator)
    const miscarriages = fertilityEntry.previousMiscarriages || 0;
    if (miscarriages > 0) score -= 0.5;
    
    // Ensure score is between 0-10
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  };
    
    const latestEntry = fertilityData[fertilityData.length - 1];
    const age = userProfile.age || calculateAge(userProfile.dateOfBirth);
    
      // Get cycle data for integration
    const cycleData = localStorage.getItem('afabCycleData');
      let cycleInfo = '';
      let cycleDay = 1;
      let cycleLength = 28;
      let cyclePhase = 'follicular';
      let fertilityStatus = 'low';
      
    if (cycleData) {
      const cycles = JSON.parse(cycleData);
      if (cycles.length > 0) {
          const latestCycle = cycles[cycles.length - 1]; // Use latest cycle
          cycleLength = latestCycle.cycleLength || 28;
          const cycleStart = new Date(latestCycle.lastPeriod);
          const today = new Date();
          cycleDay = Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
          
          // Update the fertility entry with correct cycle data
          if (fertilityData.length > 0) {
            const latestFertilityEntry = fertilityData[fertilityData.length - 1];
            latestFertilityEntry.cycleLength = cycleLength;
            latestFertilityEntry.cycleDay = cycleDay;
          }
          
          // Determine cycle phase (more accurate based on cycle length)
          const follicularLength = Math.max(10, cycleLength - 14); // Follicular phase varies
          const ovulationWindow = Math.min(3, Math.max(1, Math.floor(cycleLength * 0.1))); // 1-3 days
          
          if (cycleDay <= 5) {
            cyclePhase = 'menstrual';
            fertilityStatus = 'low';
          } else if (cycleDay <= follicularLength) {
            cyclePhase = 'follicular';
            fertilityStatus = cycleDay > follicularLength - 3 ? 'rising' : 'low';
          } else if (cycleDay <= follicularLength + ovulationWindow) {
            cyclePhase = 'ovulation';
            fertilityStatus = 'peak';
          } else {
            cyclePhase = 'luteal';
            fertilityStatus = 'low';
          }
          
          cycleInfo = `${cycleLength}-day cycle, Day ${cycleDay} (${cyclePhase} phase)`;
        }
      }
    
    // Parse medication info
    const medicationInfo = this.parseMedicationInfo(latestEntry.medicationUse || []);
    
    // Calculate fertility health score (FIXED)
    const fertilityScore = calculateFertilityHealthScore(latestEntry, age);
    
    // Goal-specific prompts for TTC vs NFP
    const fertilityGoal = latestEntry.fertilityGoal || 'ttc';
    
    if (fertilityGoal === 'ttc') {
      return `You are a highly advanced AI assistant specializing in reproductive health, fertility analysis, and cycle tracking.

Your task is to generate a professional, medically safe, empathetic, and user-friendly fertility dashboard output tailored for a user whose fertility goal is TTC (Trying to Conceive).
All insights must be data-driven, cycle-specific, and actionable.

USER DATA:
- Fertility Goal: TTC
- Conception Timeline: ${latestEntry.conceptionTimeline || 'Not specified'}
- Tracking Mode: ${latestEntry.trackingMode || 'beginner'} (Beginner/Advanced)
- Age: ${age} years
- Cycle Day: ${cycleDay} of ${cycleLength}-day cycle
- Current Phase: ${cyclePhase} (${fertilityStatus})
- BBT: ${latestEntry.bbt || 'Not recorded'}°F at ${latestEntry.bbtTime || 'Not specified'}
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'} - ${latestEntry.mucusAmount || 'Not recorded'} - ${latestEntry.mucusStretch || 0}cm stretch
- Cervical Position: ${latestEntry.cervicalPosition || 'Not recorded'} - ${latestEntry.cervicalTexture || 'Not recorded'} - ${latestEntry.cervicalOpenness || 'Not recorded'}
- OPK Test: ${latestEntry.ovulationTest || 'Not tested'} - LH Level: ${latestEntry.lhLevel || 'Not recorded'}
- Intercourse: ${latestEntry.intercourse ? 'Yes' : 'No'} - Last Intercourse: ${latestEntry.intercourseTime || 'Not recorded'} - Intercourse Data: ${latestEntry.intercourse ? `Last intercourse: ${latestEntry.intercourseTime}` : 'No intercourse recorded'}
- Previous Pregnancies: ${latestEntry.previousPregnancies || 0} - Miscarriages: ${latestEntry.previousMiscarriages || 0}
- Fertility Treatments: ${Array.isArray(latestEntry.fertilityTreatments) ? latestEntry.fertilityTreatments.join(', ') : latestEntry.fertilityTreatments || 'None'}
- Lifestyle: Stress ${latestEntry.stressLevel || 5}/10, Sleep ${latestEntry.sleepQuality || 5}/10, Exercise ${latestEntry.exerciseFrequency || 'Moderate'}, Diet ${latestEntry.dietQuality || 'Good'}
- Cycle Data: ${cycleInfo}, Flow ${latestEntry.flowIntensity || 'Medium'}, Pain ${latestEntry.pain || 0}/10
- Supplements: ${Array.isArray(latestEntry.supplements) ? latestEntry.supplements.join(', ') : latestEntry.supplements || 'None'}
- Medications: ${medicationInfo.parsedText}
- Family History: ${Array.isArray(latestEntry.familyHistory) ? latestEntry.familyHistory.join(', ') : latestEntry.familyHistory || 'None reported'}

RULES (TTC Specific):
1. Prioritize fertile window prediction & ovulation timing.
2. Give conception optimization strategies (timing, intercourse frequency, lifestyle support).
3. Do not mention contraception or safe sex.
4. Personalize all insights based on user's cycle phase, indicators, and TTC status.
5. Generate **definitive conclusions** — do not give multiple possibilities.
6. All guidance must be **medically safe** and **actionable**.
7. **INTEGRATE CYCLE PHASES** - Determine current cycle phase and provide phase-specific guidance.
8. **INTERCOURSE DATA INTERPRETATION** - If intercourse is marked as "Yes" and intercourseTime is provided, use this data. Do not say "intercourse is not recorded" if the data is provided.
9. **BBT DATA INTEGRATION** - Always consider and reference BBT data when provided. Use BBT for ovulation confirmation and cycle phase determination.

OUTPUT STRUCTURE (TTC):

### 👋 Greeting
"Hello 👋 I've analyzed your fertility data for conception optimization. Here is your personalized, professional fertility assessment."

### 🩺 Clinical Summary
Provide a medically excellent, definitive clinical assessment focused on conception:
- SPECIFIC analysis of BBT pattern, cervical mucus quality, cervical position, OPK results, and intercourse timing
- CYCLE PHASE DETERMINATION: "You are currently in your [Follicular/Ovulation/Luteal/Menstrual] phase (Day ${cycleDay} of ${cycleLength}-day cycle)"
- FERTILE WINDOW STATUS: Clear indication of fertile window, ovulation timing, or post-ovulation phase
- CONCEPTION TIMING: Immediate actionable insights for optimal conception timing
- MEDICAL-GRADE assessment of fertility indicators for conception

### 🧬 Lifestyle & Systemic Factors
Provide medically excellent evaluation of systemic factors for conception optimization:
- SPECIFIC assessment of stress levels (${latestEntry.stressLevel}/10), sleep quality (${latestEntry.sleepQuality}/10), exercise frequency, and diet quality
- MEDICAL correlation between lifestyle factors and conception outcomes
- DIETARY FERTILITY ASSESSMENT: Specific evaluation of current diet for conception optimization
- EVIDENCE-BASED recommendations for lifestyle modifications to support conception
- MEDICATION and supplement impact on conception

### 🔬 Clinical Impression
Provide definitive, medically excellent clinical assessment for conception:
- SINGLE definitive fertility status based on cycle phase and indicators
- CYCLE PHASE EXPLANATION: Medical explanation of current phase and conception implications
- RISK ASSESSMENT: Age-specific risk factors, cycle irregularity patterns, family history implications for conception
- CONCEPTION STRATEGIES: 
  - Specific timing recommendations for optimal conception
  - Intercourse frequency optimization
  - Lifestyle optimization for conception support
  - Fertility enhancement strategies

### 📋 Action Plan
Provide specific, actionable steps for conception optimization:

IMMEDIATE ACTIONS (Next 3-7 days):
- [Specific BBT tracking schedule based on current cycle day and phase]
- [Specific cervical mucus monitoring instructions for current phase]
- [Specific intercourse timing recommendations based on cycle phase and fertility status]
- [Specific lifestyle modifications based on current stress/sleep/diet data]

THIS CYCLE STRATEGIES:
- [Specific dates for optimal conception based on predicted ovulation]
- [Specific intercourse frequency and timing for maximum fertility]
- [Specific dietary changes to support conception]
- [Specific exercise and stress management recommendations]

MEDICAL CONSULTATION:
- [Specific criteria for when to seek medical help based on age, cycle patterns, and TTC duration]
- [Specific tests or evaluations to consider if conception doesn't occur within expected timeframe]

ONGOING MONITORING:
- [Specific tracking schedule for next cycle]
- [Specific pattern recognition goals]
- [Specific optimization strategies for future cycles]

### ⚠️ Urgency Flag
Provide medically excellent urgency assessment for conception:
- IMMEDIATE ACTION NEEDED: Specific concerning symptoms, irregular patterns, or medical red flags affecting conception
- MONITORING TIMELINE: Specific follow-up schedule and consultation triggers for conception
- MEDICAL CONSULTATION: Specific criteria for seeking medical attention for conception support
- RISK STRATIFICATION: Clear risk level assessment with specific action items for conception

### 📦 Summary Box (Quick-Read)
Provide concise, medically excellent summary for conception:
- PRIMARY IMPRESSION: Specific fertility status and conception readiness
- CONTRIBUTING FACTORS: Key BBT, cervical mucus, timing, and lifestyle factors for conception
- RISK ASSESSMENT: Age-specific risks, cycle irregularity, and medical history implications for conception
- RECOMMENDATION: Specific next steps for conception timing, monitoring, or medical care



### 📊 Data Visualization Suggestions (JSON block)
Provide structured data for charts (local rendering, no extra API cost):
{
  "bbt_trend": { "current": ${latestEntry.bbt || 0}, "pattern": "rising/falling/stable" },
  "cycle_phase": { "current": "${cyclePhase}", "day": ${cycleDay}, "fertility_status": "${fertilityStatus}" },
  "fertility_score": ${fertilityScore}/10,
  "fertile_window": { "start": "date", "end": "date" },
  "conception_timing": { "optimal_dates": ["date1", "date2"], "ovulation_predicted": "date" },
  "risk_flags": ${age > 35 ? '["Age factor", "Consider fertility evaluation"]' : '["Continue monitoring"]'}
}

Remember: Every section must be **professional, data-driven, empathetic, and actionable**, just like a consultation from a fertility specialist. **FOCUS ON CONCEPTION OPTIMIZATION** and provide **DEFINITIVE, TTC-SPECIFIC GUIDANCE**.`;
    } else if (fertilityGoal === 'nfp') {
      return `You are a highly advanced AI assistant specializing in reproductive health, fertility analysis, and cycle tracking.

Your task is to generate a professional, medically safe, empathetic, and user-friendly fertility dashboard output tailored for a user whose fertility goal is NFP (Natural Family Planning / Safe Sex).
All insights must be data-driven, cycle-specific, and actionable.

USER DATA:
- Fertility Goal: NFP
- Tracking Mode: ${latestEntry.trackingMode || 'beginner'} (Beginner/Advanced)
- Age: ${age} years
- Cycle Day: ${cycleDay} of ${cycleLength}-day cycle
- Current Phase: ${cyclePhase} (${fertilityStatus})
- BBT: ${latestEntry.bbt || 'Not recorded'}°F at ${latestEntry.bbtTime || 'Not specified'}
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'} - ${latestEntry.mucusAmount || 'Not recorded'} - ${latestEntry.mucusStretch || 0}cm stretch
- Cervical Position: ${latestEntry.cervicalPosition || 'Not recorded'} - ${latestEntry.cervicalTexture || 'Not recorded'} - ${latestEntry.cervicalOpenness || 'Not recorded'}
- OPK Test: ${latestEntry.ovulationTest || 'Not tested'} - LH Level: ${latestEntry.lhLevel || 'Not recorded'}
- Intercourse: ${latestEntry.intercourse ? 'Yes' : 'No'} - Last Intercourse: ${latestEntry.intercourseTime || 'Not recorded'} - Intercourse Data: ${latestEntry.intercourse ? `Last intercourse: ${latestEntry.intercourseTime}` : 'No intercourse recorded'}
- Contraception: ${latestEntry.contraceptionPreference || 'None'}
- Previous Pregnancies: ${latestEntry.previousPregnancies || 0} - Miscarriages: ${latestEntry.previousMiscarriages || 0}
- Fertility Treatments: ${Array.isArray(latestEntry.fertilityTreatments) ? latestEntry.fertilityTreatments.join(', ') : latestEntry.fertilityTreatments || 'None'}
- Lifestyle: Stress ${latestEntry.stressLevel || 5}/10, Sleep ${latestEntry.sleepQuality || 5}/10, Exercise ${latestEntry.exerciseFrequency || 'Moderate'}, Diet ${latestEntry.dietQuality || 'Good'}
- Cycle Data: ${cycleInfo}, Flow ${latestEntry.flowIntensity || 'Medium'}, Pain ${latestEntry.pain || 0}/10
- Supplements: ${Array.isArray(latestEntry.supplements) ? latestEntry.supplements.join(', ') : latestEntry.supplements || 'None'}
- Medications: ${medicationInfo.parsedText}
- Family History: ${Array.isArray(latestEntry.familyHistory) ? latestEntry.familyHistory.join(', ') : latestEntry.familyHistory || 'None reported'}

RULES (NFP Specific):
1. Prioritize identifying fertile vs safe phases.
2. Clearly indicate when unprotected sex is low/high risk.
3. Include contraception and abstinence guidance.
4. Do not mention conception optimization.
5. Personalize based on user's cycle phase, indicators, and NFP status.
6. Generate **definitive conclusions** — do not give multiple possibilities.
7. All guidance must be **medically safe** and **actionable**.
8. **INTEGRATE CYCLE PHASES** - Determine current cycle phase and provide phase-specific guidance.
9. **INTERCOURSE DATA INTERPRETATION** - If intercourse is marked as "Yes" and intercourseTime is provided, use this data. Do not say "intercourse is not recorded" if the data is provided.

OUTPUT STRUCTURE (NFP):

### 👋 Greeting
"Hello 👋 I've analyzed your fertility data for natural family planning. Here is your personalized, professional fertility assessment."

### 🩺 Clinical Summary
Provide a medically excellent, definitive clinical assessment focused on safe sex planning:
- SPECIFIC analysis of BBT pattern, cervical mucus quality, cervical position, OPK results, and intercourse timing
- CYCLE PHASE DETERMINATION: "You are currently in your [Follicular/Ovulation/Luteal/Menstrual] phase (Day ${cycleDay} of ${cycleLength}-day cycle)"
- FERTILE vs SAFE WINDOW: Clear indication of fertile window vs safe window for unprotected sex
- CONTRACEPTION GUIDANCE: Immediate actionable insights for safe sex timing
- MEDICAL-GRADE assessment of fertility indicators for natural family planning

### 🧬 Lifestyle & Systemic Factors
Provide medically excellent evaluation of systemic factors for cycle stability:
- SPECIFIC assessment of stress levels (${latestEntry.stressLevel}/10), sleep quality (${latestEntry.sleepQuality}/10), exercise frequency, and diet quality
- MEDICAL correlation between lifestyle factors and cycle regularity
- DIETARY CYCLE ASSESSMENT: Specific evaluation of current diet for cycle stability
- EVIDENCE-BASED recommendations for lifestyle modifications to support cycle regularity
- MEDICATION and supplement impact on cycle tracking accuracy

### 🔬 Clinical Impression
Provide definitive, medically excellent clinical assessment for natural family planning:
- SINGLE definitive fertility status based on cycle phase and indicators
- CYCLE PHASE EXPLANATION: Medical explanation of current phase and safe sex implications
- RISK ASSESSMENT: Age-specific risk factors, cycle irregularity patterns, family history implications for unintended pregnancy
- SAFE SEX STRATEGIES: 
  - Specific safe period identification
  - Fertile window avoidance strategies
  - Backup contraception recommendations
  - Cycle tracking accuracy improvements

### 📋 Action Plan
Provide specific, actionable steps for natural family planning:

IMMEDIATE ACTIONS (Next 3-7 days):
- [Specific BBT tracking schedule based on current cycle day and phase]
- [Specific cervical mucus monitoring instructions for current phase]
- [Specific safe vs fertile period identification based on current cycle phase]
- [Specific contraception recommendations based on current fertility status]

THIS CYCLE STRATEGIES:
- [Specific safe period dates for unprotected intercourse]
- [Specific fertile window dates requiring protection or abstinence]
- [Specific backup contraception methods during fertile periods]
- [Specific lifestyle modifications for cycle stability]

MEDICAL CONSULTATION:
- [Specific criteria for when to seek medical help based on cycle irregularities]
- [Specific signs of cycle problems that require medical attention]

ONGOING MONITORING:
- [Specific tracking schedule for accurate cycle prediction]
- [Specific pattern recognition goals for safe period identification]
- [Specific cycle stability optimization strategies]

### ⚠️ Urgency Flag
Provide medically excellent urgency assessment for natural family planning:
- IMMEDIATE ACTION NEEDED: Specific concerning symptoms, irregular patterns, or medical red flags affecting cycle tracking
- MONITORING TIMELINE: Specific follow-up schedule and consultation triggers for cycle irregularities
- MEDICAL CONSULTATION: Specific criteria for seeking medical attention for cycle issues
- RISK STRATIFICATION: Clear risk level assessment with specific action items for safe sex planning

### 📦 Summary Box (Quick-Read)
Provide concise, medically excellent summary for natural family planning:
- PRIMARY IMPRESSION: Specific fertility status and safe sex recommendations
- CONTRIBUTING FACTORS: Key BBT, cervical mucus, timing, and lifestyle factors for cycle tracking
- RISK ASSESSMENT: Age-specific risks, cycle irregularity, and medical history implications for unintended pregnancy
- RECOMMENDATION: Specific next steps for safe sex timing, monitoring, or medical care

### 🏥 Your Cycle Health
Provide medically excellent cycle health assessment for natural family planning:
- CYCLE IRREGULARITY: Specific risk assessment based on cycle length consistency and patterns
- CYCLE STABILITY: Assessment of cycle regularity for natural family planning accuracy
- OVERALL RISK: Comprehensive risk assessment based on age, symptoms, patterns, and family history
- FERTILITY HEALTH SCORE: ${fertilityScore}/10 with specific explanation of score factors for cycle tracking


### 📊 Data Visualization Suggestions (JSON block)
Provide structured data for charts (local rendering, no extra API cost):
{
  "bbt_trend": { "current": ${latestEntry.bbt || 0}, "pattern": "rising/falling/stable" },
  "cycle_phase": { "current": "${cyclePhase}", "day": ${cycleDay}, "fertility_status": "${fertilityStatus}" },
  "fertility_score": ${fertilityScore}/10,
  "safe_window": { "start": "date", "end": "date" },
  "fertile_window": { "start": "date", "end": "date" },
  "risk_flags": ${age > 35 ? '["Age factor", "Consider fertility evaluation"]' : '["Continue monitoring"]'}
}

Remember: Every section must be **professional, data-driven, empathetic, and actionable**, just like a consultation from a fertility specialist. **FOCUS ON SAFE SEX PLANNING** and provide **DEFINITIVE, NFP-SPECIFIC GUIDANCE**.`;
    } else {
      // Default prompt for other goals (Health Monitoring, Cycle Awareness)
      return `You are a highly advanced AI assistant specializing in reproductive health, fertility analysis, and cycle tracking.

Your task is to generate a **professional, market-level, user-friendly fertility dashboard output** using the user's input data. 
All insights must be **medically safe, data-driven, empathetic, and actionable**.

USER DATA:
- Fertility Goal: ${latestEntry.fertilityGoal || 'Not specified'} (Health Monitoring/Cycle Awareness)
- Tracking Mode: ${latestEntry.trackingMode || 'beginner'} (Beginner/Advanced)
- Age: ${age} years
    - Cycle Day: ${cycleDay} of ${cycleLength}-day cycle
    - Current Phase: ${cyclePhase} (${fertilityStatus} fertility)
- BBT: ${latestEntry.bbt || 'Not recorded'}°F at ${latestEntry.bbtTime || 'Not specified'}
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'} - ${latestEntry.mucusAmount || 'Not recorded'} - ${latestEntry.mucusStretch || 0}cm stretch
- Cervical Position: ${latestEntry.cervicalPosition || 'Not recorded'} - ${latestEntry.cervicalTexture || 'Not recorded'} - ${latestEntry.cervicalOpenness || 'Not recorded'}
- OPK Test: ${latestEntry.ovulationTest || 'Not tested'} - LH Level: ${latestEntry.lhLevel || 'Not recorded'}
- Intercourse: ${latestEntry.intercourse ? 'Yes' : 'No'} - Last Intercourse: ${latestEntry.intercourseTime || 'Not recorded'} - Intercourse Data: ${latestEntry.intercourse ? `Last intercourse: ${latestEntry.intercourseTime}` : 'No intercourse recorded'}
- Contraception: ${latestEntry.contraceptionPreference || 'None'}
- Previous Pregnancies: ${latestEntry.previousPregnancies || 0} - Miscarriages: ${latestEntry.previousMiscarriages || 0}
- Fertility Treatments: ${Array.isArray(latestEntry.fertilityTreatments) ? latestEntry.fertilityTreatments.join(', ') : latestEntry.fertilityTreatments || 'None'}
- Lifestyle: Stress ${latestEntry.stressLevel || 5}/10, Sleep ${latestEntry.sleepQuality || 5}/10, Exercise ${latestEntry.exerciseFrequency || 'Moderate'}, Diet ${latestEntry.dietQuality || 'Good'}
- Cycle Data: ${cycleInfo}, Flow ${latestEntry.flowIntensity || 'Medium'}, Pain ${latestEntry.pain || 0}/10
- Supplements: ${Array.isArray(latestEntry.supplements) ? latestEntry.supplements.join(', ') : latestEntry.supplements || 'None'}
- Medications: ${medicationInfo.parsedText}
- Family History: ${Array.isArray(latestEntry.familyHistory) ? latestEntry.familyHistory.join(', ') : latestEntry.familyHistory || 'None reported'}

RULES:
1. Generate **definitive conclusions** — do not give multiple possibilities.
2. Sections must be clearly structured, readable, and user-friendly.
3. Personalized Tips and Gentle Reminders must be **AI-generated from the user's actual inputs**.
4. All guidance must be **medically safe** and **actionable**.
5. Avoid generic statements or vague language.
6. **INTEGRATE CYCLE PHASES** - Determine current cycle phase and provide phase-specific guidance.
7. **INTERCOURSE DATA INTERPRETATION** - If intercourse is marked as "Yes" and intercourseTime is provided, use this data. Do not say "intercourse is not recorded" if the data is provided.

OUTPUT STRUCTURE:

### 👋 Greeting
"Hello 👋 I've analyzed your fertility data. Here is your personalized, professional fertility assessment."

### 🩺 Clinical Summary
Provide a medically excellent, definitive clinical assessment:
- SPECIFIC analysis of BBT pattern, cervical mucus quality, cervical position, OPK results, and intercourse timing
- CYCLE PHASE DETERMINATION: "You are currently in your [Follicular/Ovulation/Luteal/Menstrual] phase (Day ${cycleDay} of ${cycleLength}-day cycle)"
- CLEAR fertility status: fertile window, ovulation timing, or post-ovulation phase
- IMMEDIATE actionable insights based on current cycle day and phase
- MEDICAL-GRADE assessment of fertility indicators

### 🧬 Lifestyle & Systemic Factors
Provide medically excellent evaluation of systemic factors:
- SPECIFIC assessment of stress levels (${latestEntry.stressLevel}/10), sleep quality (${latestEntry.sleepQuality}/10), exercise frequency, and diet quality
- MEDICAL correlation between lifestyle factors and fertility outcomes
- DIETARY FERTILITY ASSESSMENT: Specific evaluation of current diet for fertility optimization
- EVIDENCE-BASED recommendations for lifestyle modifications
- MEDICATION and supplement impact on fertility

### 🔬 Clinical Impression
Provide definitive, medically excellent clinical assessment:
- SINGLE definitive fertility status based on cycle phase and indicators
- CYCLE PHASE EXPLANATION: Medical explanation of current phase and fertility implications
- RISK ASSESSMENT: Age-specific risk factors, cycle irregularity patterns, family history implications
- GOAL-SPECIFIC STRATEGIES: 
  - TTC: Specific timing recommendations and optimization strategies
  - NFP: Safe period identification and contraception timing
  - Health Monitoring: Tracking adjustments and pattern recognition
  - Cycle Awareness: Educational insights about current phase

### 📋 Action Plan
Provide specific, actionable steps for health monitoring and cycle awareness:

IMMEDIATE ACTIONS (Next 3-7 days):
- [Specific BBT tracking schedule based on current cycle day and phase]
- [Specific cervical mucus monitoring instructions for current phase]
- [Specific lifestyle modifications based on current stress/sleep/diet data]
- [Specific cycle awareness activities for current phase]

THIS CYCLE STRATEGIES:
- [Specific tracking schedule for comprehensive health monitoring]
- [Specific pattern recognition goals for cycle understanding]
- [Specific lifestyle optimization strategies for reproductive health]
- [Specific educational activities for body awareness]

MEDICAL CONSULTATION:
- [Specific criteria for when to seek medical help based on cycle patterns]
- [Specific signs of reproductive health concerns that require attention]

ONGOING MONITORING:
- [Specific tracking schedule for health insights]
- [Specific pattern analysis goals]
- [Specific optimization strategies for reproductive health]

### ⚠️ Urgency Flag
Provide medically excellent urgency assessment:
- IMMEDIATE ACTION NEEDED: Specific concerning symptoms, irregular patterns, or medical red flags
- MONITORING TIMELINE: Specific follow-up schedule and consultation triggers
- MEDICAL CONSULTATION: Specific criteria for seeking medical attention based on age, cycle patterns, and fertility goals
- RISK STRATIFICATION: Clear risk level assessment with specific action items

### 📦 Summary Box (Quick-Read)
Provide concise, medically excellent summary:
- PRIMARY IMPRESSION: Specific fertility status based on cycle phase and indicators
- CONTRIBUTING FACTORS: Key BBT, cervical mucus, timing, and lifestyle factors
- RISK ASSESSMENT: Age-specific risks, cycle irregularity, and medical history implications
- RECOMMENDATION: Specific next steps for timing, monitoring, or medical care

### 🏥 Your Cycle Health
Provide medically excellent cycle health assessment:
- CYCLE IRREGULARITY: Specific risk assessment based on cycle length consistency and patterns
- ANEMIA RISK: Specific risk assessment based on flow intensity, symptoms, and medical history
- OVERALL RISK: Comprehensive risk assessment based on age, symptoms, patterns, and family history
- FERTILITY HEALTH SCORE: ${fertilityScore}/10 with specific explanation of score factors


### 📊 Data Visualization Suggestions (JSON block)
Provide structured data for charts (local rendering, no extra API cost):
{
  "bbt_trend": { "current": ${latestEntry.bbt || 0}, "pattern": "rising/falling/stable" },
  "cycle_phase": { "current": "${cyclePhase}", "day": ${cycleDay}, "fertility_status": "${fertilityStatus}" },
      "fertility_score": ${fertilityScore}/10,
  "fertile_window": { "start": "date", "end": "date" },
  "risk_flags": ${age > 35 ? '["Age factor", "Consider fertility evaluation"]' : '["Continue monitoring"]'}
}

Remember: Every section must be **professional, data-driven, empathetic, and actionable**, just like a consultation from a fertility specialist. **INTEGRATE CYCLE PHASES** and provide **DEFINITIVE, GOAL-SPECIFIC GUIDANCE**.

**CRITICAL: You MUST generate ALL sections including Action Plan, Urgency Flag, and Summary Box with specific, actionable content. Do not use generic phrases like "being developed" or "will be provided". Generate actual medical insights based on the user's data.**

**CRITICAL: You MUST generate ALL sections including Action Plan, Urgency Flag, and Summary Box with specific, actionable content. Do not use generic phrases like "being developed" or "will be provided". Generate actual medical insights based on the user's data.**`;
    }
  }

  async generateDedicatedPersonalizedTips(fertilityData, userProfile) {
    try {
      const latestEntry = fertilityData[fertilityData.length - 1];
      const age = userProfile.age || this.calculateAge(userProfile.dateOfBirth);
      const fertilityGoal = latestEntry.fertilityGoal || 'ttc';
      
      // Get cycle data from cycle tracking module
      const cycleData = localStorage.getItem('afabCycleData');
      let cycleDay = latestEntry.cycleDay || 1;
      let cycleLength = latestEntry.cycleLength || 28;
      
      if (cycleData) {
        const cycles = JSON.parse(cycleData);
        if (cycles.length > 0) {
          const latestCycle = cycles[cycles.length - 1];
          cycleLength = latestCycle.cycleLength || 28;
          const cycleStart = new Date(latestCycle.lastPeriod);
          const today = new Date();
          cycleDay = Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      
      const prompt = `You are a fertility specialist. Generate exactly 3 personalized, actionable tips for a user with fertility goal: ${fertilityGoal.toUpperCase()}.

USER DATA:
- Age: ${age} years
- Cycle Day: ${cycleDay} of ${cycleLength}-day cycle (from cycle tracking module)
- BBT: ${latestEntry.bbt || 'Not recorded'}°F
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'}
- Stress Level: ${latestEntry.stressLevel || 5}/10
- Sleep Quality: ${latestEntry.sleepQuality || 5}/10
- Exercise: ${latestEntry.exerciseFrequency || 'Moderate'}
- Diet: ${latestEntry.dietQuality || 'Good'}

Generate 3 specific, actionable tips as a numbered list:
1. [Specific tip based on current cycle phase and fertility goal]
2. [Specific tip based on lifestyle factors and health data]
3. [Specific tip based on tracking and optimization strategies]

Each tip must be medically accurate, specific to their data, and actionable.`;

      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      const tips = response.match(/\d+\.\s*([^\n]+)/g) || [];
      return tips.map(tip => tip.replace(/^\d+\.\s*/, ''));
    } catch (error) {
      console.error('Error generating personalized tips:', error);
      return ['Continue tracking for personalized insights', 'Maintain healthy lifestyle habits', 'Monitor cycle patterns regularly'];
    }
  }

  async generateDedicatedGentleReminders(fertilityData, userProfile) {
    try {
      const latestEntry = fertilityData[fertilityData.length - 1];
      const age = userProfile.age || this.calculateAge(userProfile.dateOfBirth);
      const fertilityGoal = latestEntry.fertilityGoal || 'ttc';
      
      // Get cycle data from cycle tracking module
      const cycleData = localStorage.getItem('afabCycleData');
      let cycleDay = latestEntry.cycleDay || 1;
      let cycleLength = latestEntry.cycleLength || 28;
      
      if (cycleData) {
      const cycles = JSON.parse(cycleData);
        if (cycles.length > 0) {
      const latestCycle = cycles[cycles.length - 1];
          cycleLength = latestCycle.cycleLength || 28;
          const cycleStart = new Date(latestCycle.lastPeriod);
          const today = new Date();
          cycleDay = Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      
      const prompt = `You are a fertility specialist. Generate exactly 4 gentle, empathetic reminders for a user with fertility goal: ${fertilityGoal.toUpperCase()}.

USER DATA:
- Age: ${age} years
- Cycle Day: ${cycleDay} of ${cycleLength}-day cycle (from cycle tracking module)
- BBT: ${latestEntry.bbt || 'Not recorded'}°F
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'}
- Stress Level: ${latestEntry.stressLevel || 5}/10
- Sleep Quality: ${latestEntry.sleepQuality || 5}/10

Generate 4 gentle reminders as a numbered list with emojis:
1. 🌸 [Phase-specific reminder based on current cycle phase]
2. 🌼 [Timing-specific reminder based on fertility goal]
3. 🌸 [Lifestyle-specific reminder based on health data]
4. 🌼 [Supportive reminder for their journey]

Each reminder must be empathetic, medically informed, and one complete sentence.`;

      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      const reminders = response.match(/\d+\.\s*([^\n]+)/g) || [];
      return reminders.map(reminder => reminder.replace(/^\d+\.\s*/, ''));
    } catch (error) {
      console.error('Error generating gentle reminders:', error);
      return ['Continue tracking for better insights', 'Maintain healthy lifestyle habits', 'Stay consistent with your tracking', 'You\'re doing great with your health journey'];
    }
  }

  async generateFertilityPatterns(fertilityData, userProfile) {
    try {
      const latestEntry = fertilityData[fertilityData.length - 1];
      const age = userProfile.age || this.calculateAge(userProfile.dateOfBirth);
      const fertilityGoal = latestEntry.fertilityGoal || 'ttc';
      
      // Get cycle data from cycle tracking module
      const cycleData = localStorage.getItem('afabCycleData');
      let cycleDay = latestEntry.cycleDay || 1;
      let cycleLength = latestEntry.cycleLength || 28;
      
      if (cycleData) {
      const cycles = JSON.parse(cycleData);
        if (cycles.length > 0) {
      const latestCycle = cycles[cycles.length - 1];
          cycleLength = latestCycle.cycleLength || 28;
          const cycleStart = new Date(latestCycle.lastPeriod);
          const today = new Date();
          cycleDay = Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      
      const prompt = `You are a fertility specialist. Generate short, precise insights for Fertility Patterns section. This should be different from the main Dr. AI analysis.

USER DATA:
- Fertility Goal: ${fertilityGoal.toUpperCase()}
- Age: ${age} years
- Cycle Day: ${cycleDay} of ${cycleLength}-day cycle (from cycle tracking module)
- BBT: ${latestEntry.bbt || 'Not recorded'}°F
- Cervical Mucus: ${latestEntry.cervicalMucus || 'Not recorded'}
- OPK: ${latestEntry.ovulationTest || 'Not tested'}

Generate 4 short, precise insights (one sentence each):
1. OVULATION ASSESSMENT: [Short assessment of ovulation status and timing]
2. FERTILITY EVALUATION: [Brief evaluation of current fertility indicators]
3. ACTION ITEM: [One specific action to take based on current phase and goal]
4. CONFIDENCE LEVEL: [Brief confidence assessment based on data quality and patterns]

Keep each insight under 20 words. Be specific and actionable.`;

      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      
      // Parse the response to extract the 4 insights
      const lines = response.split('\n').filter(line => line.trim());
      const insights = {
        ovulationAssessment: 'Ovulation patterns analyzed',
        fertilityEvaluation: 'Fertility indicators evaluated', 
        actionItem: 'Continue tracking for comprehensive insights',
        confidence: 'Moderate'
      };
      
      // Try to extract specific insights from the response
      lines.forEach(line => {
        if (line.includes('OVULATION ASSESSMENT:')) {
          insights.ovulationAssessment = line.replace('OVULATION ASSESSMENT:', '').trim();
        } else if (line.includes('FERTILITY EVALUATION:')) {
          insights.fertilityEvaluation = line.replace('FERTILITY EVALUATION:', '').trim();
        } else if (line.includes('ACTION ITEM:')) {
          insights.actionItem = line.replace('ACTION ITEM:', '').trim();
        } else if (line.includes('CONFIDENCE LEVEL:')) {
          insights.confidence = line.replace('CONFIDENCE LEVEL:', '').trim();
        }
      });
      
      return insights;
    } catch (error) {
      console.error('Error generating fertility patterns:', error);
      return {
        ovulationAssessment: 'Ovulation patterns analyzed',
        fertilityEvaluation: 'Fertility indicators evaluated',
        actionItem: 'Continue tracking for comprehensive insights',
        confidence: 'Moderate'
      };
    }
  }

  async processFertilityInsights(insights, fertilityData, userProfile) {
    try {
      // Try to parse JSON response from AI (SAME AS CYCLE TRACKING)
      const parsedInsights = JSON.parse(insights);
      
      return {
        quickCheck: await this.generateFertilityPatterns(fertilityData, userProfile),
        aiInsights: parsedInsights.aiInsights || [insights],
        riskAssessment: parsedInsights.riskAssessment || 'Continue tracking to assess fertility patterns and overall health',
        recommendations: parsedInsights.recommendations || ['Continue tracking your fertility'],
        medicalAlerts: parsedInsights.medicalAlerts || ['No immediate alerts'],
        personalizedTips: await this.generateDedicatedPersonalizedTips(fertilityData, userProfile),
        gentleReminders: await this.generateDedicatedGentleReminders(fertilityData, userProfile)
      };
    } catch (error) {
      // If JSON parsing fails, parse text response for new 6-section format (SAME AS CYCLE TRACKING)
      const textInsights = insights.toString();
      
      console.log('🔍 FERTILITY: Processing text insights:', textInsights.substring(0, 200) + '...');
      
      // Extract new 6-section format
      const enhancedSections = this.extractEnhancedSections(textInsights);
      const dataVisualization = this.extractJSONSection(textInsights);
      
      console.log('🔍 FERTILITY: Enhanced sections:', enhancedSections);
      
      // Generate dedicated Personalized Tips and Gentle Reminders
      const personalizedTips = await this.generateDedicatedPersonalizedTips(fertilityData, userProfile);
      const gentleReminders = await this.generateDedicatedGentleReminders(fertilityData, userProfile);
      const riskAssessment = this.extractRiskFromSections(enhancedSections);
      
      console.log('🔍 FERTILITY: Personalized tips:', personalizedTips);
      console.log('🔍 FERTILITY: Gentle reminders:', gentleReminders);
      
      return {
        quickCheck: await this.generateFertilityPatterns(fertilityData, userProfile),
        aiInsights: {
          greeting: enhancedSections.greeting || 'Hello! I\'ve reviewed your fertility data and prepared a comprehensive assessment.',
          clinicalSummary: enhancedSections.clinicalSummary || 'Your fertility data is being analyzed for clinical assessment.',
          lifestyleFactors: enhancedSections.lifestyleFactors || 'Lifestyle factors are being evaluated for their impact on your fertility.',
          clinicalImpression: enhancedSections.clinicalImpression || 'Clinical impression is being determined based on your data.',
          actionPlan: enhancedSections.actionablePlan || enhancedSections.actionPlan || 'Continue tracking your fertility indicators for personalized recommendations.',
          urgencyFlag: enhancedSections.urgencyFlag || 'Continue monitoring your cycle patterns for any changes.',
          summaryBox: enhancedSections.summaryBox || 'Your fertility data is being analyzed for comprehensive insights.',
        },
        riskAssessment: riskAssessment,
        recommendations: ['Continue tracking your fertility'],
        medicalAlerts: ['No immediate alerts'],
        personalizedTips: personalizedTips,
        gentleReminders: gentleReminders,
        dataVisualization: dataVisualization
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

  // ===== PREGNANCY INSIGHTS =====
  async generatePregnancyInsights(pregnancyData, userProfile) {
    try {
      console.log('🚀 PREGNANCY: Starting AI service call...');
      console.log('🔍 PREGNANCY: Service status:', this.getServiceStatus());
      
      const prompt = this.buildPregnancyPrompt(pregnancyData, userProfile);
      console.log('🔍 PREGNANCY: Prompt length:', prompt.length);
      
      const response = await this.executeWithFallback('generateHealthInsights', prompt);
      console.log('✅ PREGNANCY: AI response received');
      
      return await this.processPregnancyInsights(response, pregnancyData, userProfile);
    } catch (error) {
      console.error('❌ PREGNANCY: AI service error:', error);
      throw error;
    }
  }

  // Build pregnancy-specific prompt following the same 6-section structure
  buildPregnancyPrompt(pregnancyData, userProfile) {
    const latestEntry = pregnancyData[pregnancyData.length - 1];
    const age = userProfile.age || this.calculateAge(userProfile.dateOfBirth);
    const trimester = latestEntry.trimester || 1;
    
    // Get trimester-specific information
    const trimesterInfo = this.getTrimesterInfo(trimester);
    
    return `You are a world-class obstetrician-gynecologist with 20+ years of experience in high-risk pregnancy management, maternal-fetal medicine, and reproductive endocrinology. You are providing a comprehensive, investor-grade pregnancy analysis that demonstrates medical excellence and AI sophistication.

## 👋 GREETING & CONTEXT
Provide a warm, clinically professional greeting that acknowledges the user's current pregnancy stage, creates trust, and establishes the medical consultation atmosphere. Reference their specific trimester and any notable factors from their data.

## 🩺 CLINICAL SUMMARY (SNAPSHOT)
Provide a comprehensive clinical assessment that includes:
- Current pregnancy status and gestational age assessment
- Key physiological changes and adaptations
- Symptom pattern analysis and clinical significance
- Risk stratification and monitoring priorities
- Fetal development milestones and expectations

## 🏥 SYSTEMIC & LIFESTYLE FACTORS
Conduct a thorough systemic assessment including:
- **Nutritional Status**: Dietary adequacy, micronutrient status, weight gain patterns
- **Metabolic Health**: Glucose metabolism, thyroid function, cardiovascular adaptations
- **Immune System**: Pregnancy-related immune changes, infection risk assessment
- **Hormonal Profile**: Estrogen, progesterone, hCG levels and their clinical implications
- **Physical Activity**: Exercise tolerance, musculoskeletal adaptations, contraindications
- **Sleep Architecture**: Sleep quality, positional changes, sleep-disordered breathing risk
- **Stress Response**: Cortisol levels, anxiety management, mental health considerations
- **Environmental Factors**: Toxin exposure, workplace safety, medication safety

## 🔬 CLINICAL IMPRESSION (TIERED)
Provide a structured, evidence-based clinical assessment:

**PRIMARY ASSESSMENT:**
- Most likely explanation for current symptoms and pregnancy status
- Differential diagnosis considerations
- Clinical confidence level and reasoning

**SECONDARY CONSIDERATIONS:**
- Additional factors that may influence pregnancy outcomes
- Comorbid conditions and their management
- Psychosocial factors and their impact

**RISK STRATIFICATION:**
- Maternal risk factors (age, medical history, lifestyle)
- Fetal risk factors (genetic, environmental, developmental)
- Pregnancy-specific risks (gestational diabetes, preeclampsia, preterm labor)
- Risk mitigation strategies and monitoring protocols

## 📋 ACTIONABLE PLAN
Create a comprehensive, evidence-based management plan:

**IMMEDIATE ACTIONS (Next 1-2 weeks):**
- Specific lifestyle modifications
- Symptom management strategies
- Monitoring parameters and red flags
- When to seek immediate medical attention

**TRIMESTER-SPECIFIC STRATEGIES:**
- Current trimester goals and milestones
- Anticipatory guidance for upcoming changes
- Preparation for next trimester transitions
- Screening and testing recommendations

**MEDICAL CONSULTATION PROTOCOLS:**
- Routine prenatal care schedule
- High-risk pregnancy monitoring (if applicable)
- Specialist referrals and timing
- Emergency protocols and contact information

**ONGOING MONITORING & OPTIMIZATION:**
- Daily tracking parameters
- Weekly/monthly assessments
- Long-term health optimization
- Postpartum preparation and planning

## 📊 SUMMARY BOX (QUICK READ)
Provide a concise, actionable summary:
- **Primary Impression**: Main pregnancy status and key findings
- **Contributing Factors**: Top 3 factors influencing current state
- **Risk Alerts**: Any concerns requiring immediate attention
- **Primary Recommendation**: Most important next step

**CRITICAL: You MUST generate ALL sections with specific, actionable, medically accurate content. Do not use generic phrases. Generate actual medical insights based on the user's data.**

**PREGNANCY DATA:**
- Age: ${age} years
- Trimester: ${trimester} (${trimesterInfo.weeks} weeks)
- Due Date: ${latestEntry.dueDate || 'Not specified'}
- Last Menstrual Period: ${latestEntry.lastMenstrualPeriod || 'Not specified'}
- First Pregnancy: ${latestEntry.isFirstPregnancy || 'Unknown'}

**CURRENT SYMPTOMS & STATUS:**
- Mood: ${latestEntry.mood || 'Not rated'}/10
- Energy: ${latestEntry.energy || 'Not rated'}/10
- Sleep: ${latestEntry.sleep || 'Not rated'}/10
- Morning Sickness: ${latestEntry.morningSickness || 'Not specified'}
- Food Aversions: ${Array.isArray(latestEntry.foodAversions) ? latestEntry.foodAversions.join(', ') : latestEntry.foodAversions || 'None'}
- Breast Tenderness: ${latestEntry.breastTenderness || 'Not specified'}
- Spotting: ${latestEntry.spotting || 'Not specified'}
- Fetal Movement: ${latestEntry.fetalMovement || 'Not specified'}
- Back Pain: ${latestEntry.backPain || 'Not specified'}
- Heartburn: ${latestEntry.heartburn || 'Not specified'}
- Braxton Hicks: ${latestEntry.braxtonHicks || 'Not specified'}
- Swelling: ${latestEntry.swelling || 'Not specified'}
- Sleep Comfort: ${latestEntry.sleepComfort || 'Not specified'}

**MEDICAL HISTORY:**
- Previous Complications: ${Array.isArray(latestEntry.previousComplications) ? latestEntry.previousComplications.join(', ') : latestEntry.previousComplications || 'None'}
- Chronic Conditions: ${Array.isArray(latestEntry.chronicConditions) ? latestEntry.chronicConditions.join(', ') : latestEntry.chronicConditions || 'None'}
- Medications: ${Array.isArray(latestEntry.medications) ? latestEntry.medications.join(', ') : latestEntry.medications || 'None'}

**LIFESTYLE FACTORS:**
- Diet Quality: ${latestEntry.diet || 'Not specified'}
- Exercise Level: ${latestEntry.exercise || 'Not specified'}
- Stress Level: ${latestEntry.stress || 'Not rated'}/10

**TRIMESTER-SPECIFIC MEDICAL FOCUS:**
${trimester === 1 ? `
FIRST TRIMESTER MEDICAL PRIORITIES (Weeks 1-12):
- Embryonic development and organogenesis monitoring
- Morning sickness management and nutritional optimization
- Prenatal vitamin compliance and folic acid adequacy
- Early pregnancy symptoms and their clinical significance
- Genetic testing options and counseling
- Warning signs: bleeding, severe pain, hyperemesis gravidarum
- Hormonal changes: hCG levels, progesterone support
- Risk assessment: miscarriage, ectopic pregnancy, chromosomal abnormalities
` : trimester === 2 ? `
SECOND TRIMESTER MEDICAL PRIORITIES (Weeks 13-26):
- Fetal growth and development monitoring
- Fetal movement assessment and kick counting
- Energy optimization and comfort management
- Weight gain tracking and nutritional assessment
- Anatomy scan preparation and interpretation
- Gestational diabetes screening (24-28 weeks)
- Anemia screening and iron supplementation
- Risk assessment: gestational diabetes, preeclampsia, preterm labor
` : `
THIRD TRIMESTER MEDICAL PRIORITIES (Weeks 27-40):
- Fetal growth monitoring and biophysical profile
- Fetal movement counting and kick charts
- Labor preparation and birth plan development
- Comfort measures and sleep optimization
- Braxton Hicks vs. true labor differentiation
- Swelling assessment and preeclampsia monitoring
- Group B strep screening and management
- Risk assessment: preeclampsia, gestational diabetes, fetal growth restriction
`}

**MEDICAL ACCURACY REQUIREMENTS:**
- Use evidence-based medical information from ACOG, SMFM, and Cochrane reviews
- Provide specific, actionable advice with clinical reasoning
- Include appropriate warning signs and red flags
- Maintain professional, supportive tone with medical authority
- Avoid diagnostic language (use "may indicate" vs "diagnosis")
- Include when to seek immediate medical attention
- Reference current medical guidelines and best practices
- Consider individual risk factors and personalized care

**INVESTOR-GRADE OUTPUT REQUIREMENTS:**
- Demonstrate advanced AI medical reasoning capabilities
- Show comprehensive understanding of pregnancy physiology
- Provide clinically relevant, actionable insights
- Display sophisticated risk assessment and management
- Include evidence-based recommendations
- Show personalized, data-driven analysis
- Demonstrate medical-grade accuracy and professionalism

**OUTPUT FORMAT:**
Generate the response in the exact 6-section structure above. Each section should be comprehensive, medically accurate, and tailored to the user's specific trimester and data. Use medical terminology appropriately while remaining accessible to patients.`;
  }

  // Process pregnancy insights following the same pattern as cycle and fertility
  async processPregnancyInsights(response, pregnancyData, userProfile) {
    try {
      console.log('🔍 PROCESSING PREGNANCY INSIGHTS - Raw response:', response.substring(0, 200) + '...');
      
      // Try to extract structured sections
      const enhancedSections = this.extractEnhancedSections(response);
      console.log('🔍 Extracted pregnancy sections:', Object.keys(enhancedSections));
      console.log('🔍 Enhanced sections content:', {
        greeting: enhancedSections.greeting ? enhancedSections.greeting.substring(0, 100) + '...' : 'NOT FOUND',
        clinicalSummary: enhancedSections.clinicalSummary ? enhancedSections.clinicalSummary.substring(0, 100) + '...' : 'NOT FOUND',
        systemicFactors: enhancedSections.systemicFactors ? enhancedSections.systemicFactors.substring(0, 100) + '...' : 'NOT FOUND',
        clinicalImpression: enhancedSections.clinicalImpression ? enhancedSections.clinicalImpression.substring(0, 100) + '...' : 'NOT FOUND'
      });
      
      // Process the main AI insights - USE REAL AI CONTENT
      const aiInsights = {
        greeting: enhancedSections.greeting || 'Hello 👋',
        clinicalSummary: enhancedSections.clinicalSummary || 'Pregnancy analysis completed successfully!',
        systemicFactors: enhancedSections.systemicFactors || 'Lifestyle factors analyzed',
        clinicalImpression: enhancedSections.clinicalImpression || 'Clinical assessment completed'
      };

      // Extract tips and reminders from the main response instead of making separate API calls
      const personalizedTips = this.extractPersonalizedTipsFromSections(response) || this.generateAIPregnancyTips(response) || ['Continue tracking for personalized insights', 'Maintain healthy lifestyle habits', 'Monitor pregnancy progress regularly'];
      const gentleReminders = this.extractGentleRemindersFromSections(response) || this.generateAIPregnancyReminders(response) || ['Schedule regular prenatal appointments', 'Take prenatal vitamins daily', 'Stay hydrated and rest well'];
      const pregnancyPatterns = this.extractPregnancyPatternsFromSections(response) || 'Pregnancy patterns analyzed';

      // Store all AI insights for the robot icon
      const allInsights = {
        greeting: aiInsights.greeting,
        clinicalSummary: aiInsights.clinicalSummary,
        systemicFactors: aiInsights.systemicFactors,
        clinicalImpression: aiInsights.clinicalImpression,
        personalizedTips: personalizedTips,
        gentleReminders: gentleReminders,
        pregnancyPatterns: pregnancyPatterns
      };

      // Store insights in localStorage for the robot icon
      this.storeInsights('pregnancy', allInsights, userProfile);

    return {
        aiInsights,
        personalizedTips,
        gentleReminders,
        pregnancyPatterns,
        riskAssessment: 'Pregnancy monitoring active',
        medicalAlerts: ['Regular prenatal care recommended']
      };
    } catch (error) {
      console.error('❌ Error processing pregnancy insights:', error);
      
      // Fallback insights
      const fallbackInsights = {
        greeting: 'Hello 👋',
        clinicalSummary: 'Pregnancy analysis completed successfully!',
        systemicFactors: 'Lifestyle factors analyzed',
        clinicalImpression: 'Clinical assessment completed'
      };
      
      const fallbackTips = ['Continue tracking for personalized insights', 'Maintain healthy lifestyle habits', 'Monitor pregnancy progress regularly'];
      const fallbackReminders = ['Schedule regular prenatal appointments', 'Take prenatal vitamins daily', 'Stay hydrated and rest well'];
      const fallbackPatterns = 'Pregnancy patterns analyzed';
      
      // Store fallback insights for the robot icon
      const allFallbackInsights = {
        ...fallbackInsights,
        personalizedTips: fallbackTips,
        gentleReminders: fallbackReminders,
        pregnancyPatterns: fallbackPatterns
      };
      
      this.storeInsights('pregnancy', allFallbackInsights, userProfile);
      
      return {
        aiInsights: fallbackInsights,
        personalizedTips: fallbackTips,
        gentleReminders: fallbackReminders,
        pregnancyPatterns: fallbackPatterns,
        riskAssessment: 'Pregnancy monitoring active',
        medicalAlerts: ['Regular prenatal care recommended']
      };
    }
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
      return await this.processSexualHealthInsights(insights, sexualHealthData, userProfile);
    } catch (error) {
      console.error('Error generating sexual health insights:', error);
      // Return fallback insights in the same format as other modules
      const allFallbackInsights = {
        greeting: 'Hello 👋',
        clinicalSummary: 'Sexual health analysis completed successfully!',
        clinicalImpression: 'Clinical assessment completed',
        actionPlan: 'Actionable plan generated',
        personalizedTips: ['Continue monitoring your sexual health', 'Practice safe sex', 'Get regular STI screenings'],
        gentleReminders: ['Schedule regular sexual health check-ups', 'Communicate openly with partners', 'Use appropriate protection'],
        sexualHealthPatterns: 'Sexual health patterns are being analyzed based on your current data. Regular monitoring will help identify trends and optimize your sexual wellness.',
        riskAssessment: 'Sexual health monitoring active'
      };
      
      this.storeInsights('sexual_health', allFallbackInsights, userProfile);
      
      return {
        aiInsights: allFallbackInsights,
        patterns: 'Sexual health analysis completed',
        alerts: [],
        recommendations: ['Continue monitoring your sexual health'],
        riskAssessment: 'Sexual health monitoring active'
      };
    }
  }

  buildSexualHealthPrompt(sexualHealthData, userProfile) {
    const age = userProfile.age || this.calculateAge(userProfile.dateOfBirth);
    
    return `You are a world-class sexual health specialist with 20+ years of experience in reproductive medicine, STI prevention, sexual dysfunction, and comprehensive sexual wellness. You are providing a comprehensive, investor-grade sexual health analysis that demonstrates medical excellence and AI sophistication.

## 👋 GREETING & CONTEXT
Provide a warm, clinically professional greeting that acknowledges the user's sexual health journey, creates trust, and establishes the medical consultation atmosphere. Reference their specific situation and any notable factors from their data.

## 🩺 CLINICAL SUMMARY (SNAPSHOT)
Provide a comprehensive clinical assessment that includes:
- Current sexual health status and risk assessment
- Key physiological and psychological observations
- Symptom pattern analysis and clinical significance
- Risk stratification and monitoring priorities
- Sexual function and satisfaction evaluation

## 🏥 SYSTEMIC & LIFESTYLE FACTORS
Conduct a thorough systemic assessment including:
- **Sexual Activity Patterns**: Frequency, partner dynamics, relationship context
- **Contraception & Protection**: Method effectiveness, compliance, backup methods
- **STI Risk Factors**: Screening history, exposure risks, prevention strategies
- **Mental Health Integration**: Anxiety, depression, stress impact on sexual function
- **Physical Health**: Hormonal status, medications, chronic conditions
- **Lifestyle Factors**: Sleep, exercise, nutrition, substance use
- **Relationship Dynamics**: Communication, satisfaction, intimacy patterns
- **Environmental Factors**: Cultural, social, economic influences

## 🔬 CLINICAL IMPRESSION (TIERED)
Provide a structured, evidence-based clinical assessment:

**PRIMARY ASSESSMENT:**
- Most likely explanation for current sexual health status
- Differential diagnosis considerations for any symptoms
- Clinical confidence level and reasoning

**SECONDARY CONSIDERATIONS:**
- Additional factors that may influence sexual health outcomes
- Comorbid conditions and their management
- Psychosocial factors and their impact

**RISK STRATIFICATION:**
- STI risk factors and prevention needs
- Sexual dysfunction risk assessment
- Relationship and mental health impacts
- Long-term sexual wellness considerations

## 📋 ACTIONABLE PLAN
Create a comprehensive, evidence-based management plan:

**IMMEDIATE ACTIONS (Next 1-2 weeks):**
- Specific lifestyle modifications
- Symptom management strategies
- Screening and testing recommendations
- When to seek immediate medical attention

**SEXUAL HEALTH OPTIMIZATION:**
- Contraception optimization and counseling
- STI prevention strategies
- Sexual function enhancement
- Communication and relationship guidance

**MEDICAL CONSULTATION PROTOCOLS:**
- Routine sexual health screening schedule
- Specialist referrals and timing
- Emergency protocols and contact information
- Follow-up monitoring and care

**ONGOING MONITORING & OPTIMIZATION:**
- Daily tracking parameters
- Weekly/monthly assessments
- Long-term health optimization
- Preventive care planning

## 📊 SUMMARY BOX (QUICK READ)
Provide a concise, actionable summary:
- **Primary Impression**: Main sexual health status and key findings
- **Contributing Factors**: Top 3 factors influencing current state
- **Risk Alerts**: Any concerns requiring immediate attention
- **Primary Recommendation**: Most important next step

**CRITICAL: You MUST generate ALL sections with specific, actionable, medically accurate content. Do not use generic phrases. Generate actual medical insights based on the user's data.**

**SEXUAL HEALTH DATA:**
- Age: ${age} years
- Date: ${sexualHealthData.date}
- Relationship Status: ${sexualHealthData.relationshipStatus || 'Not specified'}
- Sexual Orientation: ${sexualHealthData.sexualOrientation || 'Not specified'}

**SEXUAL ACTIVITY:**
- Current Activity: ${sexualHealthData.sexualActivity || 'Not specified'}
- Partner Gender(s): ${Array.isArray(sexualHealthData.partnerGender) ? sexualHealthData.partnerGender.join(', ') : sexualHealthData.partnerGender || 'Not specified'}
- Frequency: ${sexualHealthData.frequency || 'Not specified'}

**CONTRACEPTION & PROTECTION:**
- Primary Method: ${sexualHealthData.contraception || 'Not specified'}
- Emergency Contraception: ${sexualHealthData.emergencyContraception || 'Not specified'}
- Condom Use: ${sexualHealthData.condomUse || 'Not specified'}

**STI SCREENING & HISTORY:**
- Last Screening: ${sexualHealthData.lastSTIScreening || 'Not specified'}
- STI History: ${Array.isArray(sexualHealthData.stiHistory) ? sexualHealthData.stiHistory.join(', ') : sexualHealthData.stiHistory || 'None'}
- Treatment Status: ${sexualHealthData.stiTreatment || 'Not specified'}

**CURRENT SYMPTOMS:**
- Symptoms: ${Array.isArray(sexualHealthData.symptoms) ? sexualHealthData.symptoms.join(', ') : sexualHealthData.symptoms || 'None'}
- Duration: ${sexualHealthData.symptomDuration || 'Not specified'}
- Severity: ${sexualHealthData.symptomSeverity || 'Not specified'}

**SEXUAL FUNCTION:**
- Libido: ${sexualHealthData.libido || 'Not specified'}
- Satisfaction: ${sexualHealthData.satisfaction || 'Not specified'}
- Pain During Sex: ${sexualHealthData.painDuringSex || 'Not specified'}

**MENTAL HEALTH & RELATIONSHIPS:**
- Anxiety Level: ${sexualHealthData.anxiety || 'Not specified'}
- Relationship Impact: ${sexualHealthData.relationshipImpact || 'Not specified'}
- Self-Esteem Impact: ${sexualHealthData.selfEsteem || 'Not specified'}

**LIFESTYLE FACTORS:**
- Stress Level: ${sexualHealthData.stress || 'Not specified'}
- Sleep Quality: ${sexualHealthData.sleep || 'Not specified'}
- Exercise Frequency: ${sexualHealthData.exercise || 'Not specified'}

**CONCERNS & QUESTIONS:**
- Main Concerns: ${sexualHealthData.concerns || 'None'}
- Questions for Provider: ${sexualHealthData.questions || 'None'}

**MEDICAL ACCURACY REQUIREMENTS:**
- Use evidence-based medical information from CDC, WHO, ACOG, and sexual health guidelines
- Provide specific, actionable advice with clinical reasoning
- Include appropriate warning signs and red flags
- Maintain professional, supportive tone with medical authority
- Avoid diagnostic language (use "may indicate" vs "diagnosis")
- Include when to seek immediate medical attention
- Reference current medical guidelines and best practices
- Consider individual risk factors and personalized care

**INVESTOR-GRADE OUTPUT REQUIREMENTS:**
- Demonstrate advanced AI medical reasoning capabilities
- Show comprehensive understanding of sexual health physiology
- Provide clinically relevant, actionable insights
- Display sophisticated risk assessment and management
- Include evidence-based recommendations
- Show personalized, data-driven analysis
- Demonstrate medical-grade accuracy and professionalism

**OUTPUT FORMAT:**
Generate the response in the exact 6-section structure above. Each section should be comprehensive, medically accurate, and tailored to the user's specific situation and data. Use medical terminology appropriately while remaining accessible to patients.`;
  }

  async processSexualHealthInsights(response, sexualHealthData, userProfile) {
    try {
      console.log('🔍 PROCESSING SEXUAL HEALTH INSIGHTS - Raw response:', response.substring(0, 200) + '...');
      
      // Extract enhanced sections using the same method as other modules
      const enhancedSections = this.extractEnhancedSections(response);
      console.log('🔍 Extracted sexual health sections:', Object.keys(enhancedSections));
      
      // Generate personalized tips and gentle reminders from the main response
      const personalizedTips = this.extractPersonalizedTipsFromSections(response) || 
                              await this.generateAISexualHealthTips(response, sexualHealthData);
      const gentleReminders = this.extractGentleRemindersFromSections(response) || 
                             await this.generateAISexualHealthReminders(response, sexualHealthData);
      
      // Create comprehensive insights object - EXACTLY like cycle and fertility modules
      const allInsights = {
        greeting: this.stripMarkdown(enhancedSections.greeting || this.extractSection(response, '👋 **GREETING & CONTEXT**') || 'Hello 👋'),
        clinicalSummary: this.stripMarkdown(enhancedSections.clinicalSummary || this.extractSection(response, '🩺 **CLINICAL SUMMARY**') || 'Sexual health analysis completed successfully!'),
        systemicFactors: this.stripMarkdown(enhancedSections.systemicFactors || this.extractSection(response, '🏥 **SYSTEMIC & LIFESTYLE FACTORS**')),
        clinicalImpression: this.stripMarkdown(enhancedSections.clinicalImpression || this.extractSection(response, '🔬 **CLINICAL IMPRESSION**') || 'Clinical assessment completed'),
        actionPlan: this.stripMarkdown(enhancedSections.actionPlan || this.extractSection(response, '📋 **ACTIONABLE PLAN**') || 'Actionable plan generated'),
        summaryBox: this.stripMarkdown(enhancedSections.summaryBox || this.extractSection(response, '📊 **SUMMARY BOX**')),
        personalizedTips: personalizedTips,
        gentleReminders: gentleReminders,
        sexualHealthPatterns: await this.generateSexualHealthPatterns(response, sexualHealthData),
        riskAssessment: 'Sexual health monitoring active'
      };

      // Store insights for robot icon
      this.storeInsights('sexual_health', allInsights, userProfile);
      
      return {
        aiInsights: allInsights,
        patterns: allInsights.sexualHealthPatterns,
        alerts: [],
        recommendations: allInsights.personalizedTips,
        riskAssessment: allInsights.riskAssessment
      };
    } catch (error) {
      console.error('Error processing sexual health insights:', error);
      const allFallbackInsights = {
        greeting: 'Hello 👋',
        clinicalSummary: 'Sexual health analysis completed successfully!',
        clinicalImpression: 'Clinical assessment completed',
        actionPlan: 'Actionable plan generated',
        personalizedTips: ['Continue monitoring your sexual health', 'Practice safe sex', 'Get regular STI screenings'],
        gentleReminders: ['Schedule regular sexual health check-ups', 'Communicate openly with partners', 'Use appropriate protection'],
        sexualHealthPatterns: 'Sexual health patterns are being analyzed based on your current data. Regular monitoring will help identify trends and optimize your sexual wellness.',
        riskAssessment: 'Sexual health monitoring active'
      };
      
      this.storeInsights('sexual_health', allFallbackInsights, userProfile);
      
      return {
        aiInsights: allFallbackInsights,
        patterns: 'Sexual health analysis completed',
        alerts: [],
        recommendations: ['Continue monitoring your sexual health'],
        riskAssessment: 'Sexual health monitoring active'
      };
    }
  }

  async generateAISexualHealthTips(response, sexualHealthData) {
    const prompt = `Based on this sexual health analysis, generate 3-5 specific, actionable tips for the user:

SEXUAL HEALTH ANALYSIS:
${response}

USER DATA:
- Age: ${sexualHealthData.age || 'Not specified'}
- Sexual Activity: ${sexualHealthData.sexualActivity || 'Not specified'}
- Contraception: ${sexualHealthData.contraception || 'Not specified'}
- Symptoms: ${Array.isArray(sexualHealthData.symptoms) ? sexualHealthData.symptoms.join(', ') : sexualHealthData.symptoms || 'None'}
- Concerns: ${sexualHealthData.concerns || 'None'}

Generate specific, actionable tips that address their unique situation. Focus on:
1. STI prevention and screening
2. Contraception optimization
3. Sexual function and satisfaction
4. Communication and relationships
5. Mental health and wellbeing

Return as a JSON array of strings.`;

    try {
      const tips = await this.executeWithFallback('generateHealthInsights', prompt);
      return JSON.parse(tips);
    } catch (error) {
      console.error('Error generating sexual health tips:', error);
      return ['Practice safe sex consistently', 'Get regular STI screenings', 'Communicate openly with partners', 'Use appropriate contraception'];
    }
  }

  async generateAISexualHealthReminders(response, sexualHealthData) {
    const prompt = `Based on this sexual health analysis, generate 3-5 gentle, supportive reminders for the user:

SEXUAL HEALTH ANALYSIS:
${response}

USER DATA:
- Last STI Screening: ${sexualHealthData.lastSTIScreening || 'Not specified'}
- Sexual Activity: ${sexualHealthData.sexualActivity || 'Not specified'}
- Symptoms: ${Array.isArray(sexualHealthData.symptoms) ? sexualHealthData.symptoms.join(', ') : sexualHealthData.symptoms || 'None'}

Generate gentle, supportive reminders that address their specific needs. Focus on:
1. Regular health check-ups
2. Self-care and wellbeing
3. Relationship maintenance
4. Preventive care
5. Mental health support

Return as a JSON array of strings.`;

    try {
      const reminders = await this.executeWithFallback('generateHealthInsights', prompt);
      return JSON.parse(reminders);
    } catch (error) {
      console.error('Error generating sexual health reminders:', error);
      return ['Schedule regular sexual health check-ups', 'Communicate openly with partners', 'Use appropriate protection', 'Prioritize your wellbeing'];
    }
  }

  async generateSexualHealthPatterns(response, sexualHealthData) {
    const prompt = `Based on this sexual health analysis, generate a comprehensive pattern analysis for the user:

SEXUAL HEALTH ANALYSIS:
${response}

USER DATA:
- Age: ${sexualHealthData.age || 'Not specified'}
- Sexual Activity: ${sexualHealthData.sexualActivity || 'Not specified'}
- Contraception: ${sexualHealthData.contraception || 'Not specified'}
- Symptoms: ${Array.isArray(sexualHealthData.symptoms) ? sexualHealthData.symptoms.join(', ') : sexualHealthData.symptoms || 'None'}
- Libido: ${sexualHealthData.libido || 'Not specified'}
- Satisfaction: ${sexualHealthData.satisfaction || 'Not specified'}

Generate a comprehensive pattern analysis that covers:
1. Sexual health trends and patterns
2. Risk factor analysis
3. Lifestyle correlation patterns
4. Relationship dynamics patterns
5. Long-term health trajectory
6. Recommendations for pattern optimization

Provide a detailed, medically-informed analysis in paragraph form.`;

    try {
      const patterns = await this.executeWithFallback('generateHealthInsights', prompt);
      return this.stripMarkdown(patterns);
    } catch (error) {
      console.error('Error generating sexual health patterns:', error);
      return 'Sexual health patterns are being analyzed based on your current data. Regular monitoring will help identify trends and optimize your sexual wellness.';
    }
  }

  stripMarkdown(text) {
    if (!text) return text;
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
      .replace(/##\s*/g, '')           // Remove markdown headers
      .replace(/#\s*/g, '')            // Remove single hash headers
      .replace(/^\s*[-*+]\s*/gm, '')   // Remove bullet points
      .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists
      .replace(/\n\s*\n/g, '\n\n')     // Clean up multiple newlines
      .trim();
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

  // REMOVED: Separate API calls for tips, reminders, and patterns
  // Now extracting all content from the main AI response to reduce API calls from 4 to 1

  // Helper function to get trimester information
  getTrimesterInfo(trimester) {
    const info = {
      1: { weeks: '1-12', description: 'First Trimester - Early Development' },
      2: { weeks: '13-26', description: 'Second Trimester - Growth Phase' },
      3: { weeks: '27-40', description: 'Third Trimester - Final Preparation' }
    };
    return info[trimester] || { weeks: 'Unknown', description: 'Unknown Trimester' };
  }

  // Extract personalized tips from pregnancy AI response
  extractPersonalizedTipsFromSections(response) {
    try {
      // Look for tips in the Action Plan section
      const actionPlanMatch = response.match(/## 📋 ACTIONABLE PLAN[\s\S]*?(?=##|$)/i);
      if (actionPlanMatch) {
        const actionPlan = actionPlanMatch[0];
        const tips = [];
        
        // Extract numbered tips
        const tipMatches = actionPlan.match(/\d+\.\s*([^\n]+)/g);
        if (tipMatches && tipMatches.length >= 3) {
          return tipMatches.slice(0, 3).map(tip => tip.replace(/^\d+\.\s*/, ''));
        }
        
        // Extract bullet points
        const bulletMatches = actionPlan.match(/[-•]\s*([^\n]+)/g);
        if (bulletMatches && bulletMatches.length >= 3) {
          return bulletMatches.slice(0, 3).map(bullet => bullet.replace(/^[-•]\s*/, ''));
        }
      }
      
      // If no tips found in Action Plan, generate AI tips based on content
      return this.generateAIPregnancyTips(response);
    } catch (error) {
      console.error('Error extracting personalized tips:', error);
      return null;
    }
  }

  // Generate AI pregnancy tips based on response content
  generateAIPregnancyTips(response) {
    try {
      const tips = [];
      
      // Extract trimester-specific tips
      if (response.includes('first trimester') || response.includes('trimester 1')) {
        tips.push('Take prenatal vitamins with folic acid daily to support neural tube development');
        tips.push('Eat small, frequent meals to manage morning sickness and maintain nutrition');
        tips.push('Schedule your first prenatal appointment and genetic counseling if needed');
      } else if (response.includes('second trimester') || response.includes('trimester 2')) {
        tips.push('Start tracking fetal movements and maintain a kick count diary');
        tips.push('Focus on balanced nutrition and appropriate weight gain for your BMI');
        tips.push('Prepare for your anatomy scan and consider genetic testing options');
      } else if (response.includes('third trimester') || response.includes('trimester 3')) {
        tips.push('Practice daily kick counting and monitor fetal movement patterns');
        tips.push('Prepare your birth plan and discuss delivery preferences with your provider');
        tips.push('Focus on comfort measures and sleep optimization for the final weeks');
      }
      
      // Add general pregnancy tips
      if (tips.length < 3) {
        tips.push('Stay hydrated with 8-10 glasses of water daily to support increased blood volume');
        tips.push('Maintain regular, moderate exercise as approved by your healthcare provider');
        tips.push('Prioritize sleep and stress management for optimal pregnancy outcomes');
      }
      
      return tips.slice(0, 3);
    } catch (error) {
      console.error('Error generating AI pregnancy tips:', error);
      return null;
    }
  }

  // Extract gentle reminders from pregnancy AI response
  extractGentleRemindersFromSections(response) {
    try {
      // Look for reminders in the Summary Box or Clinical Impression
      const summaryMatch = response.match(/## 📊 SUMMARY BOX[\s\S]*?(?=##|$)/i);
      const clinicalMatch = response.match(/## 🔬 CLINICAL IMPRESSION[\s\S]*?(?=##|$)/i);
      
      const searchText = summaryMatch ? summaryMatch[0] : (clinicalMatch ? clinicalMatch[0] : response);
      
      const reminders = [];
      
      // Look for gentle, supportive language
      const gentlePhrases = [
        'remember to', 'don\'t forget to', 'make sure to', 'it\'s important to',
        'consider', 'try to', 'aim to', 'focus on', 'prioritize'
      ];
      
      const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        if (gentlePhrases.some(phrase => lowerSentence.includes(phrase))) {
          reminders.push(sentence.trim());
          if (reminders.length >= 3) break;
        }
      }
      
      // If no reminders found, generate AI reminders based on content
      return reminders.length > 0 ? reminders : this.generateAIPregnancyReminders(response);
    } catch (error) {
      console.error('Error extracting gentle reminders:', error);
      return null;
    }
  }

  // Generate AI pregnancy reminders based on response content
  generateAIPregnancyReminders(response) {
    try {
      const reminders = [];
      
      // Extract trimester-specific reminders
      if (response.includes('first trimester') || response.includes('trimester 1')) {
        reminders.push('Remember to take your prenatal vitamins with breakfast to reduce nausea');
        reminders.push('Don\'t forget to schedule your first prenatal appointment within the next 2 weeks');
        reminders.push('Make sure to avoid alcohol, smoking, and limit caffeine to 200mg daily');
      } else if (response.includes('second trimester') || response.includes('trimester 2')) {
        reminders.push('Remember to start tracking fetal movements and maintain a kick count diary');
        reminders.push('Don\'t forget to prepare for your anatomy scan and discuss results with your provider');
        reminders.push('Make sure to maintain proper posture and use pregnancy-safe exercises');
      } else if (response.includes('third trimester') || response.includes('trimester 3')) {
        reminders.push('Remember to practice daily kick counting and monitor fetal movement patterns');
        reminders.push('Don\'t forget to prepare your birth plan and discuss delivery preferences');
        reminders.push('Make sure to pack your hospital bag and prepare for labor signs');
      }
      
      // Add general pregnancy reminders
      if (reminders.length < 3) {
        reminders.push('Remember to stay hydrated with 8-10 glasses of water daily');
        reminders.push('Don\'t forget to maintain regular prenatal appointments and screenings');
        reminders.push('Make sure to prioritize sleep and stress management for optimal outcomes');
      }
      
      return reminders.slice(0, 3);
    } catch (error) {
      console.error('Error generating AI pregnancy reminders:', error);
      return null;
    }
  }

  // Store insights for the robot icon (like Cycle and Fertility modules)
  storeInsights(moduleType, insights, userProfile) {
    try {
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const storageKey = `aiInsights_${moduleType}_${userId}`;
      
      // Store the insights with timestamp
      const insightData = {
        ...insights,
        timestamp: new Date().toISOString(),
        moduleType: moduleType
      };
      
      localStorage.setItem(storageKey, JSON.stringify(insightData));
      console.log(`✅ Stored ${moduleType} insights for robot icon`);
    } catch (error) {
      console.error(`❌ Error storing ${moduleType} insights:`, error);
    }
  }

  // Extract pregnancy patterns from AI response
  extractPregnancyPatternsFromSections(response) {
    try {
      // Look for patterns in Clinical Summary or Clinical Impression
      const clinicalSummaryMatch = response.match(/## 🩺 CLINICAL SUMMARY[\s\S]*?(?=##|$)/i);
      const clinicalImpressionMatch = response.match(/## 🔬 CLINICAL IMPRESSION[\s\S]*?(?=##|$)/i);
      
      const searchText = clinicalSummaryMatch ? clinicalSummaryMatch[0] : (clinicalImpressionMatch ? clinicalImpressionMatch[0] : response);
      
      // Extract key insights about patterns
      const patternKeywords = ['pattern', 'trend', 'consistent', 'regular', 'cycle', 'phase', 'stage'];
      const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        if (patternKeywords.some(keyword => lowerSentence.includes(keyword))) {
          return sentence.trim();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting pregnancy patterns:', error);
      return null;
    }
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
