// CONDITION-SPECIFIC CARE COMPONENT
// Specialized care for PCOS, Endometriosis, Fibroids, and other AFAB conditions

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AFABAIService from '../ai/afabAIService.js';
import { AFAB_CLINICAL_RULES } from '../ai/clinicalRules.js';
import './ConditionSpecificCare.css';

const ConditionSpecificCare = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData, addHealthLog } = useHealthData();
  
  // State management
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [conditionData, setConditionData] = useState({
    PCOS: {
      symptoms: [],
      medications: [],
      lifestyle: [],
      monitoring: [],
      concerns: []
    },
    Endometriosis: {
      symptoms: [],
      medications: [],
      lifestyle: [],
      monitoring: [],
      concerns: []
    },
    Fibroids: {
      symptoms: [],
      medications: [],
      lifestyle: [],
      monitoring: [],
      concerns: []
    },
    Adenomyosis: {
      symptoms: [],
      medications: [],
      lifestyle: [],
      monitoring: [],
      concerns: []
    },
    POI: {
      symptoms: [],
      medications: [],
      lifestyle: [],
      monitoring: [],
      concerns: []
    }
  });
  
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Service
  const [aiService] = useState(() => new AFABAIService());
  
  // Available conditions
  const availableConditions = [
    {
      id: 'PCOS',
      name: 'PCOS',
      fullName: 'Polycystic Ovary Syndrome',
      description: 'Hormonal disorder affecting women of reproductive age',
      icon: '🔄',
      symptoms: ['irregular_cycles', 'weight_gain', 'acne', 'hirsutism', 'insulin_resistance'],
      risks: ['diabetes', 'infertility', 'heart_disease', 'endometrial_cancer']
    },
    {
      id: 'Endometriosis',
      name: 'Endometriosis',
      fullName: 'Endometriosis',
      description: 'Condition where tissue similar to the lining of the uterus grows outside the uterus',
      icon: '🩸',
      symptoms: ['pelvic_pain', 'heavy_bleeding', 'painful_sex', 'infertility', 'fatigue'],
      risks: ['adhesions', 'ovarian_cysts', 'infertility', 'bowel_bladder_issues']
    },
    {
      id: 'Fibroids',
      name: 'Fibroids',
      fullName: 'Uterine Fibroids',
      description: 'Non-cancerous growths in the uterus that can cause heavy bleeding and pain',
      icon: '🔴',
      symptoms: ['heavy_bleeding', 'pelvic_pressure', 'frequent_urination', 'back_pain'],
      risks: ['anemia', 'pregnancy_complications', 'infertility']
    },
    {
      id: 'Adenomyosis',
      name: 'Adenomyosis',
      fullName: 'Adenomyosis',
      description: 'Condition where the inner lining of the uterus breaks through the muscle wall',
      icon: '💔',
      symptoms: ['heavy_bleeding', 'severe_cramps', 'pelvic_pain', 'enlarged_uterus'],
      risks: ['anemia', 'chronic_pain', 'infertility']
    },
    {
      id: 'POI',
      name: 'POI',
      fullName: 'Premature Ovarian Insufficiency',
      description: 'Loss of normal ovarian function before age 40',
      icon: '⏰',
      symptoms: ['irregular_cycles', 'hot_flashes', 'night_sweats', 'vaginal_dryness'],
      risks: ['osteoporosis', 'heart_disease', 'infertility', 'cognitive_decline']
    }
  ];
  
  // Initialize condition data from user profile
  useEffect(() => {
    if (profileData?.conditions?.reproductive) {
      const userConditions = profileData.conditions.reproductive;
      const updatedConditionData = { ...conditionData };
      
      userConditions.forEach(condition => {
        if (updatedConditionData[condition]) {
          updatedConditionData[condition] = {
            ...updatedConditionData[condition],
            // Add any existing data from profile
          };
        }
      });
      
      setConditionData(updatedConditionData);
    }
  }, [profileData]);
  
  // Handle condition selection
  const handleConditionSelect = (conditionId) => {
    setSelectedCondition(conditionId);
    setShowInsights(false);
  };
  
  // Handle condition data changes
  const handleConditionDataChange = (condition, field, value) => {
    setConditionData(prev => ({
      ...prev,
      [condition]: {
        ...prev[condition],
        [field]: value
      }
    }));
  };
  
  // Handle symptom toggle
  const handleSymptomToggle = (condition, symptom) => {
    const currentSymptoms = conditionData[condition].symptoms;
    const updatedSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    
    handleConditionDataChange(condition, 'symptoms', updatedSymptoms);
  };
  
  // Handle medication toggle
  const handleMedicationToggle = (condition, medication) => {
    const currentMedications = conditionData[condition].medications;
    const updatedMedications = currentMedications.includes(medication)
      ? currentMedications.filter(m => m !== medication)
      : [...currentMedications, medication];
    
    handleConditionDataChange(condition, 'medications', updatedMedications);
  };
  
  // Handle lifestyle toggle
  const handleLifestyleToggle = (condition, lifestyle) => {
    const currentLifestyle = conditionData[condition].lifestyle;
    const updatedLifestyle = currentLifestyle.includes(lifestyle)
      ? currentLifestyle.filter(l => l !== lifestyle)
      : [...currentLifestyle, lifestyle];
    
    handleConditionDataChange(condition, 'lifestyle', updatedLifestyle);
  };
  
  // Save condition data
  const saveConditionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create health log entry
      const healthLog = {
        type: 'condition_specific_care',
        date: new Date().toISOString(),
        data: {
          condition: selectedCondition,
          ...conditionData[selectedCondition]
        },
        userId: user._id
      };
      
      // Add to health data context
      await addHealthLog(healthLog);
      
      // Generate AI insights
      await generateConditionInsights();
      
      // Show success message
      setShowInsights(true);
      
    } catch (err) {
      console.error('Error saving condition data:', err);
      setError('Failed to save condition data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI insights
  const generateConditionInsights = async () => {
    try {
      const userProfile = {
        ...user,
        ...profileData,
        age: user.age || 25,
        conditions: profileData?.conditions || {},
        familyHistory: profileData?.familyHistory || {},
        lifestyle: profileData?.lifestyle || {},
        tobaccoUse: profileData?.tobaccoUse || 'No'
      };
      
      const conditionInfo = availableConditions.find(c => c.id === selectedCondition);
      // DISABLED API CALL TO SAVE QUOTA - Use generic insights
      const insights = `
        User Profile:
        - Age: ${userProfile.age} years old
        - Medical Conditions: ${userProfile.conditions?.reproductive?.join(', ') || 'None reported'}
        - Family History: ${userProfile.familyHistory?.womensConditions?.join(', ') || 'None reported'}
        - Lifestyle: ${userProfile.lifestyle?.exercise?.frequency || 'Not specified'} exercise, ${userProfile.lifestyle?.stress?.level || 'Not specified'} stress
        - Former smoker: ${userProfile.tobaccoUse || 'No'}
        
        Condition: ${conditionInfo?.fullName}
        Current Symptoms: ${conditionData[selectedCondition]?.symptoms?.join(', ') || 'None reported'}
        Current Medications: ${conditionData[selectedCondition]?.medications?.join(', ') || 'None reported'}
        Lifestyle Factors: ${conditionData[selectedCondition]?.lifestyle?.join(', ') || 'None reported'}
        
        Please provide:
        1. Condition-specific insights and recommendations
        2. Symptom management strategies
        3. Medication and treatment considerations
        4. Lifestyle optimization suggestions
        5. Monitoring and screening recommendations
        
        Focus on evidence-based medical insights and personalized recommendations for ${conditionInfo?.fullName}.
      `;
      
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating condition insights:', err);
      setAiInsights('AI insights temporarily unavailable. Continue tracking your condition and consult your healthcare provider.');
    }
  };
  
  // Get condition-specific recommendations
  const getConditionRecommendations = (conditionId) => {
    const rules = AFAB_CLINICAL_RULES.conditionRules[conditionId];
    if (!rules) return [];
    
    return rules.recommendations || [];
  };
  
  // Get condition-specific symptoms
  const getConditionSymptoms = (conditionId) => {
    const condition = availableConditions.find(c => c.id === conditionId);
    return condition?.symptoms || [];
  };
  
  // Get condition-specific medications
  const getConditionMedications = (conditionId) => {
    const medicationMap = {
      PCOS: ['metformin', 'birth_control', 'spironolactone', 'clomiphene'],
      Endometriosis: ['pain_meds', 'hormone_therapy', 'birth_control', 'GnRH_agonists'],
      Fibroids: ['birth_control', 'GnRH_agonists', 'tranexamic_acid'],
      Adenomyosis: ['birth_control', 'pain_meds', 'hormone_therapy'],
      POI: ['hormone_replacement', 'calcium', 'vitamin_d', 'antidepressants']
    };
    
    return medicationMap[conditionId] || [];
  };
  
  // Get condition-specific lifestyle factors
  const getConditionLifestyle = (conditionId) => {
    const lifestyleMap = {
      PCOS: ['low_carb_diet', 'regular_exercise', 'stress_management', 'weight_management'],
      Endometriosis: ['anti_inflammatory_diet', 'stress_reduction', 'gentle_exercise', 'heat_therapy'],
      Fibroids: ['iron_rich_diet', 'exercise', 'stress_management'],
      Adenomyosis: ['anti_inflammatory_diet', 'heat_therapy', 'stress_management'],
      POI: ['bone_healthy_diet', 'weight_bearing_exercise', 'stress_management']
    };
    
    return lifestyleMap[conditionId] || [];
  };
  
  return (
    <div className="condition-specific-care">
      <div className="condition-header">
        <h1>Condition-Specific Care</h1>
        <p>Specialized care for PCOS, Endometriosis, Fibroids, and other AFAB conditions</p>
      </div>
      
      <div className="condition-content">
        {/* Condition Selection */}
        <div className="condition-selection-section">
          <h2>Select Your Condition</h2>
          <div className="condition-grid">
            {availableConditions.map(condition => (
              <div
                key={condition.id}
                className={`condition-card ${selectedCondition === condition.id ? 'selected' : ''}`}
                onClick={() => handleConditionSelect(condition.id)}
              >
                <div className="condition-icon">{condition.icon}</div>
                <h3 className="condition-name">{condition.name}</h3>
                <p className="condition-full-name">{condition.fullName}</p>
                <p className="condition-description">{condition.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Condition-Specific Tracking */}
        {selectedCondition && (
          <div className="condition-tracking-section">
            <h2>{availableConditions.find(c => c.id === selectedCondition)?.fullName} Tracking</h2>
            
            {/* Symptoms */}
            <div className="symptoms-section">
              <h3>Symptoms</h3>
              <div className="symptoms-grid">
                {getConditionSymptoms(selectedCondition).map(symptom => (
                  <button
                    key={symptom}
                    className={`symptom-option ${conditionData[selectedCondition]?.symptoms?.includes(symptom) ? 'selected' : ''}`}
                    onClick={() => handleSymptomToggle(selectedCondition, symptom)}
                  >
                    {symptom.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Medications */}
            <div className="medications-section">
              <h3>Medications</h3>
              <div className="medications-grid">
                {getConditionMedications(selectedCondition).map(medication => (
                  <button
                    key={medication}
                    className={`medication-option ${conditionData[selectedCondition]?.medications?.includes(medication) ? 'selected' : ''}`}
                    onClick={() => handleMedicationToggle(selectedCondition, medication)}
                  >
                    {medication.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lifestyle Factors */}
            <div className="lifestyle-section">
              <h3>Lifestyle Factors</h3>
              <div className="lifestyle-grid">
                {getConditionLifestyle(selectedCondition).map(lifestyle => (
                  <button
                    key={lifestyle}
                    className={`lifestyle-option ${conditionData[selectedCondition]?.lifestyle?.includes(lifestyle) ? 'selected' : ''}`}
                    onClick={() => handleLifestyleToggle(selectedCondition, lifestyle)}
                  >
                    {lifestyle.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Monitoring */}
            <div className="monitoring-section">
              <h3>Monitoring & Screening</h3>
              <div className="monitoring-list">
                {getConditionRecommendations(selectedCondition).map((recommendation, index) => (
                  <div key={index} className="monitoring-item">
                    <span className="monitoring-icon">📊</span>
                    <span className="monitoring-text">{recommendation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Concerns */}
            <div className="concerns-section">
              <h3>Current Concerns</h3>
              <textarea
                value={conditionData[selectedCondition]?.concerns?.join('\n') || ''}
                onChange={(e) => handleConditionDataChange(selectedCondition, 'concerns', e.target.value.split('\n').filter(c => c.trim()))}
                placeholder="List any current concerns or questions about your condition..."
                className="concerns-textarea"
                rows="4"
              />
            </div>
            
            {/* Save Button */}
            <div className="save-section">
              <button
                onClick={saveConditionData}
                disabled={isLoading}
                className="save-condition-btn"
              >
                {isLoading ? 'Saving...' : 'Save Condition Data'}
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
          </div>
        )}
        
        {/* AI Insights */}
        {showInsights && aiInsights && (
          <div className="ai-insights-section">
            <h2>AI-Powered Condition Insights</h2>
            <div className="insights-content">
              <div className="condition-insights">
                <h3>Personalized Insights</h3>
                <p>{aiInsights}</p>
              </div>
              
              <div className="condition-recommendations">
                <h3>Condition-Specific Recommendations</h3>
                <div className="recommendations-list">
                  {getConditionRecommendations(selectedCondition).map((recommendation, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="recommendation-icon">💡</span>
                      <span className="recommendation-text">{recommendation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionSpecificCare;

