import React, { useState, useEffect, useCallback } from 'react';
import { AIReasoningEngine } from '../ai/aiReasoning';
import MedicalRulesEngine from '../utils/medicalRulesEngine';
import AIServiceManager from '../ai/aiServiceManager';
import './SmartInsights.css';

const SmartInsights = ({ userProfile, onboardingData, localHealthData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const medicalRulesEngine = new MedicalRulesEngine();
  const aiReasoningEngine = new AIReasoningEngine();
  const aiServiceManager = new AIServiceManager();

  // Use a ref to track if we've already generated insights
  const hasGeneratedRef = React.useRef(false);

  const generateInsights = React.useCallback(async () => {
    if (isGenerating || hasGeneratedRef.current) {
      console.log('⏳ Already generating or generated, skipping...');
      return;
    }
    
    try {
      setIsGenerating(true);
      setLoading(true);
      setError(null);
      hasGeneratedRef.current = true;

      // Combine all available data
      const combinedData = {
        ...onboardingData,
        ...userProfile,
        healthLogs: localHealthData || []
      };

      console.log('🔍 Generating insights with data:', combinedData);

      // Generate AI insights using the reasoning engine
      const aiInsights = await aiReasoningEngine.generateDashboardInsights(combinedData);

      // Skip LLM calls to avoid quota errors - use fallback immediately
      console.log('🚫 Skipping LLM calls to avoid quota errors, using fallback insights');
      const aiInsightsLLM = generateFallbackInsights(combinedData);
      const aiAlertsLLM = generateFallbackAlerts(combinedData);
      const aiRemindersLLM = generateFallbackReminders(combinedData);
      const aiTipsLLM = generateFallbackTips(combinedData);

      // Generate medical rules-based recommendations
      const personalContext = {
        age: calculateAge(onboardingData?.dateOfBirth),
        reproductiveAnatomy: onboardingData?.reproductiveAnatomy || [],
        chronicConditions: onboardingData?.chronicConditions || [],
        lifestyle: {
          stress: onboardingData?.stressLevel || 'Moderate',
          sleep: onboardingData?.sleepQuality || 'Good',
          smoking: onboardingData?.tobaccoUse || 'No',
          exercise: onboardingData?.exerciseFrequency || 'Moderate'
        },
        screenings: onboardingData?.screenings || {}
      };

      // Generate medical rules-based recommendations using the correct method
      const medicalRulesResult = medicalRulesEngine.applyClinicalRules(personalContext, {
        reproductiveContext: {
          isAFAB: onboardingData?.genderIdentity === 'AFAB' || onboardingData?.genderIdentity === 'Female',
          isAMAB: onboardingData?.genderIdentity === 'AMAB' || onboardingData?.genderIdentity === 'Male',
          isTrans: onboardingData?.genderIdentity === 'Trans' || onboardingData?.genderIdentity === 'Non-binary'
        },
        lifestyleContext: personalContext.lifestyle
      });
      
      const preventiveCare = medicalRulesResult.recommendations || [];
      const healthAlerts = medicalRulesResult.alerts || [];
      const medicationReminders = medicalRulesResult.reminders || [];

      setInsights({
        aiInsights,
        aiInsightsLLM,
        aiAlertsLLM,
        aiRemindersLLM,
        aiTipsLLM,
        preventiveCare,
        healthAlerts,
        medicationReminders
      });

    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Unable to generate insights at this time');
      
      // Set fallback insights so user sees something
      setInsights({
        aiInsights: {
          healthScore: 75,
          healthLevel: 'Good',
          insights: [{
            title: 'Basic Health Monitoring',
            description: 'Continue tracking your health metrics for personalized insights.',
            priority: 'medium',
            clinicalReasoning: 'Regular health monitoring helps identify patterns and trends'
          }]
        },
        aiInsightsLLM: ['Complete your health profile to receive personalized AI insights.'],
        aiAlertsLLM: ['No urgent alerts at this time.'],
        aiRemindersLLM: ['Continue logging your health data for better insights.'],
        aiTipsLLM: ['Maintain a healthy lifestyle with regular exercise and balanced nutrition.'],
        preventiveCare: [],
        healthAlerts: [],
        medicationReminders: []
      });
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Disable ESLint warning for missing dependencies

  useEffect(() => {
    console.log('🔍 SmartInsights useEffect triggered with:', {
      userProfile: !!userProfile,
      onboardingData: !!onboardingData,
      localHealthData: !!localHealthData,
      hasGenerated: hasGeneratedRef.current
    });
    
    // Generate insights automatically when data is available and not already generated
    if (!hasGeneratedRef.current && (userProfile || onboardingData)) {
      console.log('🚀 Triggering generateInsights...');
      // Call generateInsights directly without dependency
      generateInsights();
    } else if (!hasGeneratedRef.current) {
      console.log('❌ No data available for insights generation');
    } else {
      console.log('⏳ Already generated, skipping...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, onboardingData, localHealthData]); // Disable ESLint warning for missing generateInsights


  // Generate AI insights using LLM
  const generateAIInsights = async (userData) => {
    try {
      const age = calculateAge(userData?.dateOfBirth);
      const gender = userData?.genderIdentity;
      const conditions = userData?.chronicConditions || [];
      const lifestyle = userData?.lifestyle || {};
      const recentLogs = userData?.healthLogs || [];

      const prompt = `Generate 5 personalized health insights for this user profile. Be medically accurate, inclusive, and actionable.

User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}, Alcohol ${lifestyle.alcoholUse || 'Not specified'}
- Recent Health Logs: ${recentLogs.length} entries

Generate insights that:
1. Combine multiple factors (age + conditions + lifestyle + recent logs)
2. Are medically relevant and evidence-based
3. Include specific actionable recommendations
4. Are inclusive for all gender identities
5. Address the user's specific health profile

Format each insight as: "🔴/🟡/🟢 [Title]: [Specific recommendation with actionable steps]"

Return exactly 5 insights, one per line:`;

      const response = await aiServiceManager.generateHealthInsights(prompt);
      return response.slice(0, 5);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return ['Unable to generate AI insights at this time.'];
    }
  };

  // Generate AI alerts using LLM
  const generateAIAlerts = async (userData) => {
    try {
      const age = calculateAge(userData?.dateOfBirth);
      const gender = userData?.genderIdentity;
      const conditions = userData?.chronicConditions || [];
      const lifestyle = userData?.lifestyle || {};
      const recentLogs = userData?.healthLogs || [];

      const prompt = `Generate 5 urgent health alerts for this user profile. Focus on high-priority medical concerns.

User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}, Alcohol ${lifestyle.alcoholUse || 'Not specified'}
- Recent Health Logs: ${recentLogs.length} entries

Generate alerts that:
1. Identify urgent medical concerns requiring immediate attention
2. Are based on user's specific health profile and recent logs
3. Include specific actionable steps
4. Use appropriate urgency levels (🚨 HIGH PRIORITY, ⚠️ MEDIUM PRIORITY, 💊 CONDITION ALERT, 🔍 SCREENING ALERT)

Return exactly 5 alerts, one per line:`;

      const response = await aiServiceManager.generateHealthAlerts(prompt);
      return response.slice(0, 5);
    } catch (error) {
      console.error('Error generating AI alerts:', error);
      return ['Unable to generate AI alerts at this time.'];
    }
  };

  // Generate AI reminders using LLM
  const generateAIReminders = async (userData) => {
    try {
      const age = calculateAge(userData?.dateOfBirth);
      const gender = userData?.genderIdentity;
      const conditions = userData?.chronicConditions || [];
      const lifestyle = userData?.lifestyle || {};
      const medications = userData?.currentMedications || [];

      const prompt = `Generate 5 personalized health reminders for this user profile. Focus on screenings, appointments, and health monitoring.

User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Current Medications: ${medications.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Smoking ${lifestyle.tobaccoUse || 'No'}

Generate reminders that:
1. Are age-appropriate and gender-inclusive
2. Include specific screening recommendations
3. Address chronic condition monitoring
4. Include lifestyle modification reminders
5. Are actionable with specific timeframes

Format each reminder as: "📅 [Specific reminder with timeframe]"

Return exactly 5 reminders, one per line:`;

      const response = await aiServiceManager.generateHealthReminders(prompt);
      return response.slice(0, 5);
    } catch (error) {
      console.error('Error generating AI reminders:', error);
      return ['Unable to generate AI reminders at this time.'];
    }
  };

  // Generate AI tips using LLM
  const generateAITips = async (userData) => {
    try {
      const age = calculateAge(userData?.dateOfBirth);
      const gender = userData?.genderIdentity;
      const conditions = userData?.chronicConditions || [];
      const lifestyle = userData?.lifestyle || {};
      const recentLogs = userData?.healthLogs || [];

      const prompt = `Generate 5 personalized health tips for this user profile. Focus on practical, evidence-based recommendations.

User Profile:
- Age: ${age} years
- Gender Identity: ${gender || 'Not specified'}
- Chronic Conditions: ${conditions.join(', ') || 'None'}
- Lifestyle: Exercise ${lifestyle.exerciseFrequency || 'Not specified'}, Diet ${lifestyle.diet || 'Not specified'}, Sleep ${lifestyle.sleepQuality || 'Not specified'}, Stress ${lifestyle.stressLevel || 'Not specified'}
- Recent Health Logs: ${recentLogs.length} entries

Generate tips that:
1. Address the user's specific conditions and lifestyle
2. Include practical, actionable steps
3. Are evidence-based and medically sound
4. Are inclusive for all gender identities
5. Focus on prevention and management

Format each tip as: "💡 [Specific tip with actionable steps]"

Return exactly 5 tips, one per line:`;

      const response = await aiServiceManager.generateHealthTips(prompt);
      return response.slice(0, 5);
    } catch (error) {
      console.error('Error generating AI tips:', error);
      return ['Unable to generate AI tips at this time.'];
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const ageDiff = new Date() - birthDate;
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Fallback functions when AI services are not available
  const generateFallbackInsights = (userData) => {
    const age = calculateAge(userData?.dateOfBirth);
    const gender = userData?.genderIdentity;
    const conditions = userData?.chronicConditions || [];
    
    const insights = [
      `🟢 Age-Based Health Focus: At ${age} years old, focus on preventive care and maintaining healthy habits.`,
      `🟡 Lifestyle Optimization: Regular exercise and balanced nutrition are key to long-term health.`,
      `🟢 Health Monitoring: Continue tracking your health metrics to identify patterns and trends.`,
      `🟡 Stress Management: Practice stress reduction techniques like meditation or deep breathing.`,
      `🟢 Regular Checkups: Schedule annual health checkups to monitor your overall wellness.`
    ];
    
    if (conditions.length > 0) {
      insights[0] = `🔴 Condition Management: Active management of ${conditions.join(', ')} is essential for optimal health.`;
    }
    
    if (gender === 'AFAB' || gender === 'Female') {
      insights.push(`🟡 Reproductive Health: Regular gynecological checkups and screenings are important.`);
    }
    
    return insights.slice(0, 5);
  };

  const generateFallbackAlerts = (userData) => {
    const age = calculateAge(userData?.dateOfBirth);
    const conditions = userData?.chronicConditions || [];
    
    const alerts = [
      `🚨 Annual Health Checkup: Schedule your yearly physical examination.`,
      `⚠️ Lifestyle Review: Assess your exercise and nutrition habits.`,
      `💊 Medication Review: Review current medications with your healthcare provider.`,
      `🔍 Screening Schedule: Check if any age-appropriate screenings are due.`,
      `📅 Follow-up Appointments: Schedule any pending medical follow-ups.`
    ];
    
    if (conditions.length > 0) {
      alerts[0] = `🔴 Condition Monitoring: Regular monitoring of ${conditions.join(', ')} is crucial.`;
    }
    
    return alerts.slice(0, 5);
  };

  const generateFallbackReminders = (userData) => {
    const age = calculateAge(userData?.dateOfBirth);
    const gender = userData?.genderIdentity;
    
    const reminders = [
      `📅 Daily Health Logging: Continue tracking your daily health metrics.`,
      `💧 Hydration: Aim for 8-10 glasses of water daily.`,
      `🏃 Exercise: Include 30 minutes of moderate activity most days.`,
      `😴 Sleep: Maintain 7-9 hours of quality sleep nightly.`,
      `🧘 Stress Management: Practice daily stress reduction techniques.`
    ];
    
    if (gender === 'AFAB' || gender === 'Female') {
      reminders.push(`🩸 Cycle Tracking: Monitor your menstrual cycle patterns.`);
    }
    
    return reminders.slice(0, 5);
  };

  const generateFallbackTips = (userData) => {
    const age = calculateAge(userData?.dateOfBirth);
    const conditions = userData?.chronicConditions || [];
    
    const tips = [
      `💡 Balanced Diet: Focus on whole foods, fruits, vegetables, and lean proteins.`,
      `💡 Regular Exercise: Aim for 150 minutes of moderate activity per week.`,
      `💡 Sleep Hygiene: Maintain consistent sleep schedule and create a restful environment.`,
      `💡 Stress Reduction: Practice mindfulness, meditation, or yoga regularly.`,
      `💡 Preventive Care: Stay up-to-date with vaccinations and health screenings.`
    ];
    
    if (conditions.length > 0) {
      tips[0] = `💡 Condition-Specific Care: Follow your healthcare provider's recommendations for ${conditions.join(', ')}.`;
    }
    
    return tips.slice(0, 5);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="smart-insights loading">
        <div className="loading-spinner"></div>
        <p>Generating your personalized insights...</p>
        <p style={{fontSize: '12px', color: '#666'}}>
          Data check: Profile: {userProfile ? '✅' : '❌'}, Onboarding: {onboardingData ? '✅' : '❌'}, Health: {localHealthData ? '✅' : '❌'}
        </p>
        <p style={{fontSize: '10px', color: '#999', marginTop: '10px'}}>
          🔧 AI Status: {aiServiceManager.getCurrentProvider() === 'gemini' ? 'Using Gemini Pro' : 'Using Ollama (Local)'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-insights error">
        <p>{error}</p>
        <button onClick={() => {
          hasGeneratedRef.current = false;
          generateInsights();
        }} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="smart-insights">
      {/* AI Health Score */}
      <div className="insights-section">
        <h2>🤖 AI Health Intelligence</h2>
        <div className="ai-health-score-card">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{insights.aiInsights.healthScore}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-info">
              <h3>AI Health Score</h3>
              <p>Based on your profile and health patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {insights.healthAlerts.length > 0 && (
        <div className="insights-section">
          <h2>🚨 Health Alerts</h2>
          <div className="alerts-grid">
            {insights.healthAlerts.map((alert, index) => (
              <div key={index} className={`alert-card ${alert.type}`}>
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <h3>{alert.title}</h3>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-action">
                  <strong>Action:</strong> {alert.action}
                </div>
                <div className="alert-reason">
                  <strong>Why:</strong> {alert.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive Care */}
      {insights.preventiveCare.length > 0 && (
        <div className="insights-section">
          <h2>🏥 Preventive Care</h2>
          <div className="care-grid">
            {insights.preventiveCare.map((care, index) => (
              <div key={index} className="care-card">
                <div className="care-header">
                  <span className="care-icon">🩺</span>
                  <h3>{care.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(care.priority) }}
                  >
                    {care.priority}
                  </span>
                </div>
                <p className="care-description">{care.description}</p>
                <div className="care-details">
                  <div className="care-frequency">
                    <strong>Frequency:</strong> {care.frequency}
                  </div>
                  <div className="care-due">
                    <strong>Next Due:</strong> {care.dueDate === 'asap' ? 'ASAP' : care.dueDate}
                  </div>
                </div>
                <div className="care-reason">
                  <strong>Why:</strong> {care.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Reminders */}
      {insights.medicationReminders.length > 0 && (
        <div className="insights-section">
          <h2>💊 Medication Reminders</h2>
          <div className="medication-grid">
            {insights.medicationReminders.map((med, index) => (
              <div key={index} className="medication-card">
                <div className="medication-header">
                  <span className="medication-icon">💊</span>
                  <h3>{med.title}</h3>
                </div>
                <p className="medication-description">{med.description}</p>
                <div className="medication-details">
                  <div className="medication-frequency">
                    <strong>Frequency:</strong> {med.frequency}
                  </div>
                  <div className="medication-action">
                    <strong>Action:</strong> {med.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Pattern Insights */}
      {insights.aiInsights.insights && insights.aiInsights.insights.length > 0 && (
        <div className="insights-section">
          <h2>🔍 AI Pattern Insights</h2>
          <div className="pattern-grid">
            {insights.aiInsights.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="pattern-card">
                <div className="pattern-header">
                  <span className="pattern-icon">💡</span>
                  <h3>{insight.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(insight.priority) }}
                  >
                    {insight.priority}
                  </span>
                </div>
                <p className="pattern-description">{insight.description}</p>
                {insight.clinicalReasoning && (
                  <div className="pattern-reasoning">
                    <strong>AI Reasoning:</strong> {insight.clinicalReasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI LLM Insights */}
      {insights.aiInsightsLLM && insights.aiInsightsLLM.length > 0 && (
        <div className="insights-section">
          <h2>🤖 AI-Powered Health Insights</h2>
          <div className="ai-insights-grid">
            {insights.aiInsightsLLM.map((insight, index) => (
              <div key={index} className="ai-insight-card">
                <div className="ai-insight-content">
                  <p>{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI LLM Alerts */}
      {insights.aiAlertsLLM && insights.aiAlertsLLM.length > 0 && (
        <div className="insights-section">
          <h2>🚨 AI Health Alerts</h2>
          <div className="ai-alerts-grid">
            {insights.aiAlertsLLM.map((alert, index) => (
              <div key={index} className="ai-alert-card">
                <div className="ai-alert-content">
                  <p>{alert}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI LLM Tips */}
      {insights.aiTipsLLM && insights.aiTipsLLM.length > 0 && (
        <div className="insights-section">
          <h2>💡 AI Health Tips</h2>
          <div className="ai-tips-grid">
            {insights.aiTipsLLM.map((tip, index) => (
              <div key={index} className="ai-tip-card">
                <div className="ai-tip-content">
                  <p>{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI LLM Reminders */}
      {insights.aiRemindersLLM && insights.aiRemindersLLM.length > 0 && (
        <div className="insights-section">
          <h2>⏰ AI Health Reminders</h2>
          <div className="ai-reminders-grid">
            {insights.aiRemindersLLM.map((reminder, index) => (
              <div key={index} className="ai-reminder-card">
                <div className="ai-reminder-content">
                  <p>{reminder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="insights-footer">
        <button onClick={() => {
          hasGeneratedRef.current = false;
          generateInsights();
        }} className="refresh-insights-btn">
          🔄 Refresh Insights
        </button>
        <p className="insights-note">
          Insights update based on your latest health data and AI analysis
        </p>
        <p style={{fontSize: '10px', color: '#999', marginTop: '5px'}}>
          🤖 AI Provider: Fallback Mode (Quota Exceeded) | 
          🔄 Status: {isGenerating ? 'Generating...' : 'Ready'}
        </p>
      </div>
    </div>
  );
};

export default SmartInsights;
