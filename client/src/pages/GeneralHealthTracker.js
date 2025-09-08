import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './GeneralHealthTracker.css';

const GeneralHealthTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData, refreshData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for health tracking
  const [healthForm, setHealthForm] = useState({
    mood: '',
    energy: 5,
    stress: 5,
    sleep: 5,
    sleepHours: 7.5,
    weight: '',
    height: user?.height || '', // Get height from user profile
    exercise: '',
    exerciseDuration: 0,
    notes: ''
  });

  const [healthLogs, setHealthLogs] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [healthGoals, setHealthGoals] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing health logs and goals
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabHealthLogs') || '[]');
    const goals = JSON.parse(localStorage.getItem('amabHealthGoals') || '[]');
    setHealthLogs(logs);
    setHealthGoals(goals);
  }, []);

  // BMI calculation function
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100; // Convert cm to meters
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#ff6b6b' };
    if (bmi < 25) return { category: 'Normal', color: '#4ecdc4' };
    if (bmi < 30) return { category: 'Overweight', color: '#ffa726' };
    return { category: 'Obese', color: '#ef5350' };
  };

  // Generate health insights
  const generateHealthInsights = () => {
    if (healthLogs.length < 3) return [];

    const insights = [];
    const recentLogs = healthLogs.slice(0, 7); // Last 7 days

    // Energy trend
    const avgEnergy = recentLogs.reduce((sum, log) => sum + log.energy, 0) / recentLogs.length;
    if (avgEnergy < 5) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Low Energy Levels',
        message: `Your average energy is ${avgEnergy.toFixed(1)}/10. Consider improving sleep quality and nutrition.`
      });
    } else if (avgEnergy > 7) {
      insights.push({
        type: 'positive',
        icon: '🚀',
        title: 'Great Energy Levels',
        message: `Your average energy is ${avgEnergy.toFixed(1)}/10. Keep up the good work!`
      });
    }

    // Sleep analysis
    const avgSleep = recentLogs.reduce((sum, log) => sum + log.sleep, 0) / recentLogs.length;
    const avgSleepHours = recentLogs.reduce((sum, log) => sum + log.sleepHours, 0) / recentLogs.length;
    
    if (avgSleepHours < 7) {
      insights.push({
        type: 'warning',
        icon: '😴',
        title: 'Insufficient Sleep',
        message: `You're averaging ${avgSleepHours.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal health.`
      });
    }

    // Exercise frequency
    const exerciseDays = recentLogs.filter(log => log.exercise && log.exercise !== 'none').length;
    const exerciseRate = (exerciseDays / recentLogs.length) * 100;
    
    if (exerciseRate < 30) {
      insights.push({
        type: 'warning',
        icon: '🏃‍♂️',
        title: 'Low Exercise Frequency',
        message: `You're exercising ${exerciseRate.toFixed(0)}% of the time. Try to increase your activity level.`
      });
    }

    return insights;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Calculate BMI if weight and height are provided
      const bmi = calculateBMI(healthForm.weight, healthForm.height);
      const bmiCategory = bmi ? getBMICategory(bmi) : null;
      
      const newLog = {
        ...healthForm,
        bmi: bmi,
        bmiCategory: bmiCategory,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous'
      };

      // Save to HealthDataContext (which handles persistence)
      saveHealthData(newLog);
      
      // Update local state
      const updatedLogs = [newLog, ...healthLogs];
      setHealthLogs(updatedLogs);

      // Generate AI insights
      try {
        const aiInsights = await aiService.generateModuleInsights(newLog, 'general');
        setInsights(aiInsights);
      } catch (error) {
        console.error('Error generating AI insights:', error);
        // Fallback to basic insights
        const fallbackInsights = generateHealthInsights();
        setInsights(fallbackInsights);
      }

      // Reset form
      setHealthForm({
        mood: '',
        energy: 5,
        stress: 5,
        sleep: 5,
        sleepHours: 7.5,
        weight: '',
        exercise: '',
        exerciseDuration: 0,
        notes: ''
      });

      alert('Health log saved successfully! 🎯');
    } catch (error) {
      console.error('Error logging health data:', error);
      alert('Error logging health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (mood) => {
    const icons = {
      'excellent': '😄',
      'good': '🙂',
      'okay': '😐',
      'bad': '😔',
      'terrible': '😢'
    };
    return icons[mood] || '😐';
  };

  const getExerciseIcon = (exercise) => {
    const icons = {
      'cardio': '🏃‍♂️',
      'strength': '💪',
      'yoga': '🧘‍♂️',
      'swimming': '🏊‍♂️',
      'cycling': '🚴‍♂️',
      'walking': '🚶‍♂️',
      'none': '😴'
    };
    return icons[exercise] || '🏃‍♂️';
  };

  return (
    <div className="general-health-tracker">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🏃‍♂️ General Health Tracker</h1>
        <p>Track your daily wellness metrics and lifestyle factors</p>
      </div>

      <div className="general-health-content">
        {/* Health Overview */}
        <div className="health-overview">
          <div className="overview-card">
            <h3>📊 Total Logs</h3>
            <p className="count-display">{healthLogs.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>⚡ Average Energy</h3>
            <p className="score-display">
              {healthLogs.length > 0 ? Math.round(healthLogs.reduce((sum, log) => sum + log.energy, 0) / healthLogs.length) : 0}/10
            </p>
          </div>
          
          <div className="overview-card">
            <h3>😴 Sleep Quality</h3>
            <p className="score-display">
              {healthLogs.length > 0 ? Math.round(healthLogs.reduce((sum, log) => sum + log.sleep, 0) / healthLogs.length) : 0}/10
            </p>
          </div>
          
          {healthLogs.length > 0 && healthLogs[0].bmi && (
            <div className="overview-card">
              <h3>⚖️ Current BMI</h3>
              <p className="score-display" style={{ color: healthLogs[0].bmiCategory?.color || 'white' }}>
                {healthLogs[0].bmi} ({healthLogs[0].bmiCategory?.category || 'Unknown'})
              </p>
            </div>
          )}
        </div>

        {/* Health Logging Form */}
        <div className="health-form-section">
          <h2>Log Your Health Data</h2>
          <form onSubmit={handleSubmit} className="health-form">
            <div className="form-group">
              <label>How are you feeling today?</label>
              <input
                type="text"
                value={healthForm.mood}
                onChange={(e) => setHealthForm({...healthForm, mood: e.target.value})}
                placeholder="Describe how you're feeling today..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Energy Level: {healthForm.energy}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.energy}
                  onChange={(e) => setHealthForm({...healthForm, energy: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Stress Level: {healthForm.stress}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.stress}
                  onChange={(e) => setHealthForm({...healthForm, stress: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sleep Quality: {healthForm.sleep}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={healthForm.sleep}
                  onChange={(e) => setHealthForm({...healthForm, sleep: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Sleep Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={healthForm.sleepHours}
                  onChange={(e) => setHealthForm({...healthForm, sleepHours: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Weight (lbs) - Optional</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={healthForm.weight}
                  onChange={(e) => setHealthForm({...healthForm, weight: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Height (cm) - Optional</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={healthForm.height}
                  onChange={(e) => setHealthForm({...healthForm, height: e.target.value})}
                  placeholder={user?.height ? `${user.height} cm` : 'Enter height'}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Exercise Type</label>
              <input
                type="text"
                value={healthForm.exercise}
                onChange={(e) => setHealthForm({...healthForm, exercise: e.target.value})}
                placeholder="What type of exercise did you do today?"
              />
            </div>

            {healthForm.exercise && healthForm.exercise.trim() !== '' && (
              <div className="form-group">
                <label>Exercise Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={healthForm.exerciseDuration}
                  onChange={(e) => setHealthForm({...healthForm, exerciseDuration: parseInt(e.target.value)})}
                />
              </div>
            )}

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={healthForm.notes}
                onChange={(e) => setHealthForm({...healthForm, notes: e.target.value})}
                placeholder="How was your day? Any specific observations about your health?"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Health Insights</h2>
            <div className="insights-content">
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-card ${insight.type}`}>
                    <div className="insight-icon">{insight.icon}</div>
                    <div className="insight-content">
                      <h3>{insight.title}</h3>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health History */}
        {healthLogs.length > 0 && (
          <div className="health-history">
            <h2>📈 Health History</h2>
            <div className="history-list">
              {healthLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Energy: {log.energy}/10</span>
                    <span>Sleep: {log.sleep}/10</span>
                    <span>Stress: {log.stress}/10</span>
                    {log.exercise && log.exercise !== 'none' && (
                      <span>Exercise: {log.exercise}</span>
                    )}
                    {log.bmi && (
                      <span>BMI: {log.bmi}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Health Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>💪 Physical Activity</h3>
              <p>Learn about the benefits of regular exercise and how to create a sustainable fitness routine</p>
            </div>
            <div className="resource-card">
              <h3>😴 Sleep Health</h3>
              <p>Understand the importance of quality sleep and how to improve your sleep patterns</p>
            </div>
            <div className="resource-card">
              <h3>🧠 Mental Wellness</h3>
              <p>Discover strategies for managing stress and maintaining good mental health</p>
            </div>
            <div className="resource-card">
              <h3>🥗 Nutrition</h3>
              <p>Learn about balanced nutrition and how it affects your overall health and energy</p>
            </div>
            <div className="resource-card">
              <h3>⚖️ Weight Management</h3>
              <p>Understand BMI, healthy weight ranges, and sustainable weight management strategies</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Health Monitoring</h3>
              <p>Know when to see a healthcare provider and how to track your health effectively</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralHealthTracker;