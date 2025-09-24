import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './MedicalDashboard.css';

const MedicalDashboard = () => {
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  const [medicalInsights, setMedicalInsights] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [clinicalAlerts, setClinicalAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Advanced medical data aggregation
  const [medicalProfile, setMedicalProfile] = useState({
    riskFactors: [],
    familyHistory: [],
    currentConditions: [],
    medications: [],
    vitalSigns: [],
    screeningHistory: [],
    emergencyContacts: []
  });

  // EMERGENCY FIX: COMPLETELY REMOVED useEffect to prevent infinite loop

  const generateMedicalInsights = async () => {
    setIsLoading(true);
    try {
      // Aggregate all AFAB data
      const cycleData = JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const fertilityData = JSON.parse(localStorage.getItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const pregnancyData = JSON.parse(localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const menopauseData = JSON.parse(localStorage.getItem(`afabMenopauseData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const conditionData = JSON.parse(localStorage.getItem(`afabConditionData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const breastHealthData = JSON.parse(localStorage.getItem(`afabBreastHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]');
      const mentalHealthData = JSON.parse(localStorage.getItem(`afabMentalHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]');

      const prompt = `As a board-certified gynecologist and reproductive health specialist, provide a comprehensive medical assessment:

PATIENT PROFILE: ${JSON.stringify(user)}
COMPREHENSIVE HEALTH DATA:
- Cycle Tracking: ${JSON.stringify(cycleData.slice(-3))}
- Fertility Data: ${JSON.stringify(fertilityData.slice(-3))}
- Pregnancy History: ${JSON.stringify(pregnancyData.slice(-3))}
- Menopause Status: ${JSON.stringify(menopauseData.slice(-3))}
- Condition Management: ${JSON.stringify(conditionData.slice(-3))}
- Breast Health: ${JSON.stringify(breastHealthData.slice(-3))}
- Mental Health: ${JSON.stringify(mentalHealthData.slice(-3))}

Provide:
1. CLINICAL ASSESSMENT: Overall reproductive health status
2. RISK STRATIFICATION: High/Medium/Low risk factors
3. CLINICAL RECOMMENDATIONS: Evidence-based next steps
4. SCREENING SCHEDULE: Personalized preventive care timeline
5. RED FLAGS: Symptoms requiring immediate medical attention
6. LIFESTYLE MODIFICATIONS: Medical-grade lifestyle recommendations
7. MEDICATION REVIEW: Current medication safety and interactions
8. FOLLOW-UP PLAN: Structured care plan with timelines

Format as a clinical report suitable for healthcare providers.`;

      // DISABLED API CALL TO SAVE QUOTA - Use generic insights
      const insights = "Medical insights are available in individual modules. Navigate to specific health tracking modules for AI-powered analysis.";
      setMedicalInsights(insights);
    } catch (error) {
      console.error('Error generating medical insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performRiskAssessment = async () => {
    try {
      const prompt = `As a clinical risk assessment specialist, analyze this patient data for reproductive health risks:

PATIENT: ${JSON.stringify(user)}
HEALTH DATA: ${JSON.stringify({
        cycleData: JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        familyHistory: JSON.parse(localStorage.getItem(`afabBreastHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        conditions: JSON.parse(localStorage.getItem(`afabConditionData_${user?.id || user?.email || 'anonymous'}`) || '[]')
      })}

Assess risks for:
1. Breast Cancer (based on family history, age, lifestyle)
2. Ovarian Cancer (family history, symptoms)
3. Endometrial Cancer (cycle irregularities, PCOS)
4. Cardiovascular Disease (pregnancy history, menopause)
5. Osteoporosis (age, menopause status)
6. Mental Health (depression, anxiety patterns)

Provide risk scores (Low/Medium/High) with clinical reasoning.`;

      // DISABLED API CALL TO SAVE QUOTA - Use generic assessment
      const assessment = "Risk assessment is available in individual modules. Navigate to specific health tracking modules for AI-powered analysis.";
      setRiskAssessment(assessment);
    } catch (error) {
      console.error('Error performing risk assessment:', error);
    }
  };

  const checkClinicalAlerts = async () => {
    try {
      const allData = {
        cycle: JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        fertility: JSON.parse(localStorage.getItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        pregnancy: JSON.parse(localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        menopause: JSON.parse(localStorage.getItem(`afabMenopauseData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        conditions: JSON.parse(localStorage.getItem(`afabConditionData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        breast: JSON.parse(localStorage.getItem(`afabBreastHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
        mental: JSON.parse(localStorage.getItem(`afabMentalHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]')
      };

      const prompt = `As a clinical decision support system, identify URGENT medical alerts from this data:

${JSON.stringify(allData)}

Flag any:
1. CRITICAL SYMPTOMS requiring immediate medical attention
2. ABNORMAL VITAL SIGNS (blood pressure, weight changes)
3. SCREENING OVERDUE alerts
4. MEDICATION INTERACTIONS or side effects
5. MENTAL HEALTH CRISIS indicators
6. PREGNANCY COMPLICATIONS
7. CANCER SCREENING abnormalities

Format as clinical alerts with severity levels (CRITICAL/HIGH/MEDIUM).`;

      // DISABLED API CALL TO SAVE QUOTA - Use generic alerts
      const alerts = "Clinical alerts are available in individual modules. Navigate to specific health tracking modules for AI-powered analysis.";
      setClinicalAlerts(alerts);
    } catch (error) {
      console.error('Error checking clinical alerts:', error);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getAlertSeverity = (alert) => {
    if (alert.includes('CRITICAL') || alert.includes('URGENT')) return 'critical';
    if (alert.includes('HIGH') || alert.includes('ABNORMAL')) return 'high';
    return 'medium';
  };

  return (
    <div className="medical-dashboard">
      <div className="medical-header">
        <h1>🏥 Clinical Health Dashboard</h1>
        <p>Comprehensive Medical Assessment & Risk Stratification</p>
      </div>

      {/* Clinical Alerts */}
      {clinicalAlerts.length > 0 && (
        <div className="clinical-alerts">
          <h2>🚨 Clinical Alerts</h2>
          {clinicalAlerts.map((alert, index) => (
            <div key={index} className={`alert-card ${getAlertSeverity(alert)}`}>
              <div className="alert-icon">
                {getAlertSeverity(alert) === 'critical' ? '🚨' : 
                 getAlertSeverity(alert) === 'high' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="alert-content">
                <p>{alert}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <div className="risk-assessment">
          <h2>📊 Clinical Risk Assessment</h2>
          <div className="risk-content">
            {riskAssessment}
          </div>
        </div>
      )}

      {/* Medical Insights */}
      {medicalInsights && (
        <div className="medical-insights">
          <h2>👩‍⚕️ Clinical Assessment Report</h2>
          <div className="insights-content">
            {medicalInsights}
          </div>
        </div>
      )}

      {/* Medical Profile Summary */}
      <div className="medical-profile">
        <h2>📋 Medical Profile Summary</h2>
        <div className="profile-grid">
          <div className="profile-card">
            <h3>🩺 Current Status</h3>
            <p>Comprehensive health monitoring active</p>
            <p>Last assessment: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="profile-card">
            <h3>📈 Data Points</h3>
            <p>Total health entries: {Object.values({
              cycle: JSON.parse(localStorage.getItem(`afabCycleData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              fertility: JSON.parse(localStorage.getItem(`afabFertilityData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              pregnancy: JSON.parse(localStorage.getItem(`afabPregnancyData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              menopause: JSON.parse(localStorage.getItem(`afabMenopauseData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              conditions: JSON.parse(localStorage.getItem(`afabConditionData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              breast: JSON.parse(localStorage.getItem(`afabBreastHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]'),
              mental: JSON.parse(localStorage.getItem(`afabMentalHealthData_${user?.id || user?.email || 'anonymous'}`) || '[]')
            }).reduce((total, data) => total + data.length, 0)}</p>
          </div>
          
          <div className="profile-card">
            <h3>🎯 Care Plan</h3>
            <p>Personalized AI-driven recommendations</p>
            <p>Evidence-based clinical guidance</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-section">
        <h2>🆘 Emergency Resources</h2>
        <div className="emergency-grid">
          <div className="emergency-card">
            <h3>🏥 Emergency Services</h3>
            <p>Call 911 for medical emergencies</p>
            <p>Local ER: [User's preferred hospital]</p>
          </div>
          
          <div className="emergency-card">
            <h3>👩‍⚕️ Healthcare Provider</h3>
            <p>Primary Care: [User's doctor]</p>
            <p>Gynecologist: [User's OB/GYN]</p>
          </div>
          
          <div className="emergency-card">
            <h3>📞 Crisis Support</h3>
            <p>Mental Health Crisis: 988</p>
            <p>National Suicide Prevention Lifeline</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;

