import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import './Insights.css';

const Insights = () => {
  const { user } = useAuth();
  const { userType, isFemale, isMale, isTrans } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading insights
    setTimeout(() => {
      generateInsights();
      setLoading(false);
    }, 1500);
  }, []);

  const generateInsights = () => {
    const baseInsights = [
      {
        id: 1,
        type: 'trend',
        title: 'Health Score Trend',
        description: 'AI-powered health trend analysis - Coming Soon!',
        icon: '📈',
        priority: 'high',
        category: 'overview'
      },
      {
        id: 2,
        type: 'prediction',
        title: 'Sleep Pattern Analysis',
        description: 'AI-powered sleep pattern analysis - Coming Soon!',
        icon: '😴',
        priority: 'medium',
        category: 'sleep'
      },
      {
        id: 3,
        type: 'recommendation',
        title: 'Exercise Recommendation',
        description: 'AI-powered exercise recommendations - Coming Soon!',
        icon: '🏃',
        priority: 'medium',
        category: 'fitness'
      }
    ];

    // Gender-specific insights
    if (isFemale) {
      baseInsights.push({
        id: 4,
        type: 'cycle',
        title: 'Cycle Pattern Detected',
        description: 'AI-powered cycle tracking and predictions - Coming Soon!',
        icon: '🩸',
        priority: 'high',
        category: 'reproductive'
      });
    }

    if (isMale) {
      baseInsights.push({
        id: 5,
        type: 'health',
        title: 'Prostate Health Reminder',
        description: 'AI-powered prostate health monitoring - Coming Soon!',
        icon: '🔬',
        priority: 'high',
        category: 'reproductive'
      });
    }

    if (isTrans) {
      baseInsights.push({
        id: 6,
        type: 'hormone',
        title: 'Hormone Therapy Insights',
        description: 'AI-powered hormone therapy monitoring - Coming Soon!',
        icon: '💉',
        priority: 'high',
        category: 'reproductive'
      });
    }

    setInsights(baseInsights);
  };

  const getInsightsByCategory = (category) => {
    return insights.filter(insight => insight.category === category);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b9d';
      case 'medium': return '#4ecdc4';
      case 'low': return '#ffa726';
      default: return '#4ecdc4';
    }
  };

  const renderOverviewTab = () => (
    <div className="insights-content">
      <div className="insights-header">
        <h2>Health Overview</h2>
        <p>AI-powered insights about your health patterns and recommendations</p>
      </div>

      <div className="insights-grid">
        {insights.map(insight => (
          <div 
            key={insight.id} 
            className="insight-card"
            style={{ borderLeftColor: getPriorityColor(insight.priority) }}
          >
            <div className="insight-header">
              <span className="insight-icon">{insight.icon}</span>
              <div className="insight-meta">
                <h3>{insight.title}</h3>
                <span className={`priority-badge priority-${insight.priority}`}>
                  {insight.priority}
                </span>
              </div>
            </div>
            <p>{insight.description}</p>
            <div className="insight-actions">
              <button className="action-btn">Learn More</button>
              <button className="action-btn secondary">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="insights-content">
      <div className="insights-header">
        <h2>Health Trends</h2>
        <p>Track your health patterns over time</p>
      </div>

      <div className="trends-container">
        <div className="trend-card">
          <h3>📊 Health Score Trend</h3>
          <div className="trend-chart">
            <div className="chart-placeholder">
              <span>AI-powered trend analysis - Coming Soon!</span>
            </div>
          </div>
          <p>AI-powered health trend analysis and predictions - Coming Soon!</p>
        </div>

        <div className="trend-card">
          <h3>😴 Sleep Quality</h3>
          <div className="trend-chart">
            <div className="chart-placeholder">
              <span>AI-powered sleep analysis - Coming Soon!</span>
            </div>
          </div>
          <p>AI-powered sleep pattern analysis and recommendations - Coming Soon!</p>
        </div>

        <div className="trend-card">
          <h3>⚡ Energy Levels</h3>
          <div className="trend-chart">
            <div className="chart-placeholder">
              <span>AI-powered energy analysis - Coming Soon!</span>
            </div>
          </div>
          <p>AI-powered energy level analysis and optimization - Coming Soon!</p>
        </div>
      </div>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="insights-content">
      <div className="insights-header">
        <h2>AI Predictions</h2>
        <p>Predictive insights based on your health data</p>
      </div>

      <div className="predictions-container">
        <div className="prediction-card">
          <div className="prediction-header">
            <span className="prediction-icon">🔮</span>
            <h3>Next Health Check</h3>
          </div>
          <div className="prediction-content">
            <p>AI-powered health check predictions - Coming Soon!</p>
            <div className="prediction-confidence">
              <span>AI Analysis - Coming Soon!</span>
            </div>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-header">
            <span className="prediction-icon">📅</span>
            <h3>Optimal Exercise Time</h3>
          </div>
          <div className="prediction-content">
            <p>AI-powered exercise timing recommendations - Coming Soon!</p>
            <div className="prediction-confidence">
              <span>AI Analysis - Coming Soon!</span>
            </div>
          </div>
        </div>

        {isFemale && (
          <div className="prediction-card">
            <div className="prediction-header">
              <span className="prediction-icon">🩸</span>
              <h3>Cycle Prediction</h3>
            </div>
            <div className="prediction-content">
              <p>AI-powered cycle predictions and fertility tracking - Coming Soon!</p>
              <div className="prediction-confidence">
                <span>AI Analysis - Coming Soon!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="insights-content">
      <div className="insights-header">
        <h2>Personalized Recommendations</h2>
        <p>AI-generated suggestions to improve your health</p>
      </div>

      <div className="recommendations-container">
        <div className="recommendation-card">
          <div className="recommendation-icon">💪</div>
          <h3>Increase Physical Activity</h3>
          <p>AI-powered exercise recommendations - Coming Soon!</p>
          <button className="recommendation-action" onClick={() => alert('AI Workout Plan - Coming Soon!')}>Coming Soon</button>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-icon">😴</div>
          <h3>Optimize Sleep Schedule</h3>
          <p>AI-powered sleep optimization - Coming Soon!</p>
          <button className="recommendation-action" onClick={() => alert('AI Sleep Reminder - Coming Soon!')}>Coming Soon</button>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-icon">🧘</div>
          <h3>Stress Management</h3>
          <p>AI-powered stress management recommendations - Coming Soon!</p>
          <button className="recommendation-action" onClick={() => alert('AI Meditation Guide - Coming Soon!')}>Coming Soon</button>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-icon">🥗</div>
          <h3>Nutrition Optimization</h3>
          <p>AI-powered nutrition recommendations - Coming Soon!</p>
          <button className="recommendation-action" onClick={() => alert('AI Meal Plan - Coming Soon!')}>Coming Soon</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="insights-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header-main">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>AI Health Insights</h1>
        <p>Discover patterns and get personalized recommendations</p>
      </div>

      <div className="insights-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          📈 Trends
        </button>
        <button 
          className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          🔮 Predictions
        </button>
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations
        </button>
      </div>

      <div className="insights-main">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'predictions' && renderPredictionsTab()}
        {activeTab === 'recommendations' && renderRecommendationsTab()}
      </div>
    </div>
  );
};

export default Insights;
