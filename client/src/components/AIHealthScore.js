import React, { useState, useEffect } from 'react';
import aiReasoningEngine from '../ai/aiReasoning';
import AIServiceManager from '../ai/aiServiceManager';
import './AIHealthScore.css';

const AIHealthScore = ({ userProfile }) => {
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiService] = useState(() => new AIServiceManager());
  const [lastStoredData, setLastStoredData] = useState(null);

  // Load stored insights from all modules
  useEffect(() => {
    loadStoredInsights();
  }, [userProfile]);

  // Force refresh when localStorage changes (new insights stored)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, refreshing robot icon...');
      loadStoredInsights();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every 2 seconds (for same-tab updates)
    const interval = setInterval(() => {
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const centralKey = `centralAIInsights_${userId}`;
      const currentData = localStorage.getItem(centralKey);
      if (currentData !== lastStoredData) {
        console.log('🔄 Central insights changed, refreshing robot icon...');
        loadStoredInsights();
        setLastStoredData(currentData);
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userProfile]);

  const loadStoredInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // DEBUG: Check what's actually in localStorage
      const userId = userProfile?.id || userProfile?.email || 'anonymous';
      const cycleKey = `aiInsights_cycle_${userId}`;
      const centralKey = `centralAIInsights_${userId}`;
      
      console.log('🔍 DEBUG - Robot icon userProfile:', userProfile);
      console.log('🔍 DEBUG - Robot icon userId:', userId);
      console.log('🔍 DEBUG - Checking localStorage directly:');
      console.log('🔍 Cycle key:', cycleKey);
      console.log('🔍 Central key:', centralKey);
      
      const cycleData = localStorage.getItem(cycleKey);
      const centralData = localStorage.getItem(centralKey);
      
      console.log('🔍 Cycle data in localStorage:', cycleData ? JSON.parse(cycleData) : 'No cycle data');
      console.log('🔍 Central data in localStorage:', centralData ? JSON.parse(centralData) : 'No central data');
      
      // Get all stored insights from modules
      const storedInsights = aiService.getAllStoredInsights(userProfile);
      console.log('🔍 Loaded stored insights for robot icon:', Object.keys(storedInsights));
      console.log('🔍 Cycle insights available:', storedInsights.cycle);
      console.log('🔍 Fertility insights available:', storedInsights.fertility);
      console.log('🔍 Pregnancy insights available:', storedInsights.pregnancy);
      
      // Debug: Check if cycle insights have aiAnalysis.content
      if (storedInsights.cycle) {
        console.log('🔍 Cycle insights structure:', Object.keys(storedInsights.cycle));
        console.log('🔍 Cycle aiAnalysis:', storedInsights.cycle.aiAnalysis);
        console.log('🔍 Cycle aiAnalysis.content length:', storedInsights.cycle.aiAnalysis?.content?.length);
        console.log('🔍 Cycle aiAnalysis.content preview:', storedInsights.cycle.aiAnalysis?.content?.substring(0, 200) + '...');
        console.log('🔍 Cycle aiAnalysis.content exists:', !!storedInsights.cycle.aiAnalysis?.content);
      } else {
        console.log('⚠️ No cycle insights found in stored insights');
      }
      
      if (Object.keys(storedInsights).length > 0) {
        // Generate health score from stored insights
        const scoreData = await generateHealthScoreFromStoredInsights(storedInsights, userProfile);
        setHealthScore(scoreData);
      } else {
        // Fallback to original method
        const scoreData = await aiReasoningEngine.generateHealthScore(userProfile);
        setHealthScore(scoreData);
      }
    } catch (err) {
      console.error('Error loading stored insights:', err);
      setError('Unable to load health insights at this time');
    } finally {
      setLoading(false);
    }
  };

  const generateHealthScoreFromStoredInsights = async (storedInsights, userProfile) => {
    try {
      // Store COMPLETE AI analysis content from all modules
      const completeAIInsights = [];
      const allRecommendations = [];
      const allRiskFactors = [];
      const allPersonalizedTips = [];
      const allGentleReminders = [];
      
      // Process each module's insights
      Object.entries(storedInsights).forEach(([moduleType, moduleInsights]) => {
        console.log(`🔍 Processing ${moduleType} insights:`, moduleInsights);
        
        // Store the COMPLETE Dr. AI Clinical Analysis content
        if (moduleInsights.aiAnalysis?.content) {
          console.log(`🔍 Storing complete ${moduleType} analysis:`, moduleInsights.aiAnalysis.content.substring(0, 200) + '...');
          console.log(`🔍 ${moduleType} content length:`, moduleInsights.aiAnalysis.content.length);
          completeAIInsights.push({
            module: moduleType,
            title: moduleInsights.aiAnalysis.title || `Dr. AI ${moduleType} Analysis`,
            subtitle: moduleInsights.aiAnalysis.subtitle || `Comprehensive ${moduleType} health assessment`,
            content: moduleInsights.aiAnalysis.content, // EVERY WORD of the analysis
            timestamp: moduleInsights.timestamp
          });
          console.log(`✅ Added ${moduleType} to completeAIInsights, total: ${completeAIInsights.length}`);
        } else {
          console.log(`⚠️ No aiAnalysis.content found for ${moduleType}:`, moduleInsights);
          console.log(`⚠️ ${moduleType} structure:`, Object.keys(moduleInsights));
        }
        
        // Store all recommendations
        if (moduleInsights.recommendations) {
          allRecommendations.push(...moduleInsights.recommendations);
        }
        
        // Store all risk factors
        if (moduleInsights.riskAssessment) {
          allRiskFactors.push(...moduleInsights.riskAssessment);
        }
        
        // Store personalized tips
        if (moduleInsights.personalizedTips) {
          allPersonalizedTips.push(...moduleInsights.personalizedTips);
        }
        
        // Store gentle reminders
        if (moduleInsights.gentleReminders) {
          allGentleReminders.push(...moduleInsights.gentleReminders);
        }
      });
      
      // Calculate health score based on insights
      let score = 75; // Base score
      
      // Adjust score based on risk factors
      if (allRiskFactors.length > 0) {
        score -= allRiskFactors.length * 5; // Reduce score for each risk factor
      }
      
      // Adjust score based on positive recommendations
      if (allRecommendations.length > 0) {
        score += Math.min(allRecommendations.length * 2, 15); // Increase score for recommendations
      }
      
      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));
      
            const result = {
              score: Math.round(score),
              explanation: `Based on comprehensive AI analysis from ${Object.keys(storedInsights).length} health modules`,
              factors: allRiskFactors.slice(0, 5), // Top 5 risk factors
              recommendations: allRecommendations.slice(0, 3).map(rec => ({
                title: rec,
                description: `Important health consideration from your tracking data`,
                priority: 'medium'
              })),
              // Store COMPLETE AI insights for robot icon
              completeAIInsights: completeAIInsights, // EVERY WORD of Dr. AI Clinical Analysis
              allPersonalizedTips: allPersonalizedTips,
              allGentleReminders: allGentleReminders,
              moduleCount: Object.keys(storedInsights).length
            };
            
            console.log('🔍 Final health score result:', {
              completeAIInsights: result.completeAIInsights.length,
              allPersonalizedTips: result.allPersonalizedTips.length,
              allGentleReminders: result.allGentleReminders.length,
              moduleCount: result.moduleCount
            });
            
            return result;
    } catch (error) {
      console.error('Error generating health score from stored insights:', error);
      throw error;
    }
  };

  const generateHealthScore = async () => {
    await loadStoredInsights();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="ai-health-score loading">
        <div className="loading-spinner"></div>
        <p>Generating your AI health score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-health-score error">
        <p>{error}</p>
        <button onClick={generateHealthScore} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!healthScore) {
    return null;
  }

  return (
    <div className="ai-health-score">
      <div className="score-header">
        <h3>AI Health Score</h3>
        <span className="score-subtitle">Powered by AI analysis</span>
        <button 
          onClick={loadStoredInsights}
          className="refresh-btn"
          title="Refresh AI Insights"
        >
          🔄
        </button>
      </div>
      
      <div className="score-display">
        <div 
          className="score-circle"
          style={{ 
            background: `conic-gradient(${getScoreColor(healthScore.score)} ${healthScore.score * 3.6}deg, #f0f0f0 0deg)`
          }}
        >
          <div className="score-inner">
            <span className="score-number">{healthScore.score}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
        
        <div className="score-info">
          <h4 className="score-label">{getScoreLabel(healthScore.score)}</h4>
          <p className="score-explanation">{healthScore.explanation}</p>
        </div>
      </div>

      {healthScore.factors.length > 0 && (
        <div className="health-factors">
          <h4>Key Health Factors</h4>
          <div className="factors-list">
            {healthScore.factors.map((factor, index) => (
              <div key={index} className="factor-item">
                <span className="factor-icon">🔍</span>
                <span className="factor-text">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETE AI INSIGHTS - EVERY WORD OF DR. AI CLINICAL ANALYSIS */}
      {console.log('🔍 Robot icon - completeAIInsights:', healthScore.completeAIInsights)}
      {console.log('🔍 Robot icon - completeAIInsights length:', healthScore.completeAIInsights?.length)}
      {console.log('🔍 Robot icon - healthScore keys:', Object.keys(healthScore))}
      {healthScore.completeAIInsights && healthScore.completeAIInsights.length > 0 && (
        <div className="complete-ai-insights">
          <h4>🤖 Complete Dr. AI Clinical Analysis</h4>
          <div className="ai-insights-list">
            {healthScore.completeAIInsights.map((insight, index) => (
              <div key={index} className="ai-insight-item">
                <div className="insight-header">
                  <h5>{insight.title}</h5>
                  <span className="insight-module">{insight.module}</span>
                </div>
                <div className="insight-content">
                  <p>{insight.content}</p>
                </div>
                <div className="insight-timestamp">
                  <small>Generated: {new Date(insight.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FALLBACK: Show if no complete insights but we have healthScore */}
      {(!healthScore.completeAIInsights || healthScore.completeAIInsights.length === 0) && healthScore && (
        <div className="debug-info">
          <h4>🔍 Debug: Robot Icon Status</h4>
          <p>Complete AI Insights: {healthScore.completeAIInsights?.length || 0}</p>
          <p>Health Score: {healthScore.score}</p>
          <p>Module Count: {healthScore.moduleCount || 0}</p>
          <p>All Personalized Tips: {healthScore.allPersonalizedTips?.length || 0}</p>
          <p>All Gentle Reminders: {healthScore.allGentleReminders?.length || 0}</p>
        </div>
      )}

      {/* ALL PERSONALIZED TIPS */}
      {healthScore.allPersonalizedTips && healthScore.allPersonalizedTips.length > 0 && (
        <div className="all-personalized-tips">
          <h4>💡 All Personalized Tips</h4>
          <div className="tips-list">
            {healthScore.allPersonalizedTips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-icon">✨</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL GENTLE REMINDERS */}
      {healthScore.allGentleReminders && healthScore.allGentleReminders.length > 0 && (
        <div className="all-gentle-reminders">
          <h4>🌸 All Gentle Reminders</h4>
          <div className="reminders-list">
            {healthScore.allGentleReminders.map((reminder, index) => (
              <div key={index} className="reminder-item">
                <span className="reminder-icon">🌸</span>
                <span className="reminder-text">{reminder}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {healthScore.recommendations.length > 0 && (
        <div className="ai-recommendations">
          <h4>AI Recommendations</h4>
          <div className="recommendations-list">
            {healthScore.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-icon">💡</span>
                <div className="rec-content">
                  <h5>{rec.title}</h5>
                  <p>{rec.description}</p>
                  <span className={`rec-priority ${rec.priority}`}>
                    {rec.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="score-footer">
        <button onClick={generateHealthScore} className="refresh-btn">
          🔄 Refresh Score
        </button>
        <p className="score-note">
          Score updates based on your latest health data and AI analysis
        </p>
      </div>
    </div>
  );
};

export default AIHealthScore;
