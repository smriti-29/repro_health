import React, { useState } from 'react';
import aiReasoningEngine from '../ai/aiReasoning';
import './AIHealthScore.css';

const AIHealthScore = ({ userProfile }) => {
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // EMERGENCY FIX: COMPLETELY REMOVED useEffect to prevent infinite loop

  const generateHealthScore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const scoreData = await aiReasoningEngine.generateHealthScore(userProfile);
      setHealthScore(scoreData);
    } catch (err) {
      console.error('Error generating health score:', err);
      setError('Unable to generate health score at this time');
    } finally {
      setLoading(false);
    }
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
