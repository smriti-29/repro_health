import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const HealthDataContext = createContext();

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState({
    today: null,
    history: [],
    trends: {},
    insights: {},
    reminders: [],
    goals: {}
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load health data from localStorage and calculate insights
  const loadHealthData = useCallback(() => {
    try {
      const healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's log
      const todayLog = healthLogs.find(log => log.date === today);
      
      // Calculate trends and insights
      const trends = calculateTrends(healthLogs);
      const insights = generateInsights(healthLogs, todayLog);
      const reminders = generateReminders(healthLogs, todayLog);
      const goals = loadGoals();
      
      setHealthData({
        today: todayLog,
        history: healthLogs.slice(-30), // Last 30 days
        trends,
        insights,
        reminders,
        goals
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate health trends
  const calculateTrends = (logs) => {
    if (logs.length < 2) return {};
    
    const recentLogs = logs.slice(-7); // Last 7 days
    const trends = {};
    
    // Health score trend
    const scores = recentLogs.map(log => log.healthScore).filter(Boolean);
    if (scores.length > 1) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const trend = scores[scores.length - 1] - scores[0];
      trends.healthScore = {
        average: Math.round(avgScore * 10) / 10,
        trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        change: Math.round(trend * 10) / 10
      };
    }
    
    // Mood trend
    const moodScores = { 'Excellent': 5, 'Good': 4, 'Okay': 3, 'Poor': 2, 'Terrible': 1 };
    const moods = recentLogs.map(log => moodScores[log.mood]).filter(Boolean);
    if (moods.length > 1) {
      const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
      trends.mood = {
        average: Math.round(avgMood * 10) / 10,
        trend: moods[moods.length - 1] > moods[0] ? 'improving' : moods[moods.length - 1] < moods[0] ? 'declining' : 'stable'
      };
    }
    
    // Sleep trend
    const sleepScores = recentLogs.map(log => parseInt(log.sleepQuality)).filter(Boolean);
    if (sleepScores.length > 1) {
      const avgSleep = sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length;
      trends.sleep = {
        average: Math.round(avgSleep * 10) / 10,
        trend: sleepScores[sleepScores.length - 1] > sleepScores[0] ? 'improving' : sleepScores[sleepScores.length - 1] < sleepScores[0] ? 'declining' : 'stable'
      };
    }
    
    return trends;
  };

  // Generate AI insights
  const generateInsights = (logs, todayLog) => {
    const insights = {
      recommendations: [],
      patterns: [],
      alerts: []
    };
    
    if (!todayLog) {
      insights.recommendations.push({
        type: 'logging',
        message: 'Start your health journey by logging today\'s mood, energy, and sleep.',
        priority: 'high'
      });
      return insights;
    }
    
    // Health score insights
    if (todayLog.healthScore < 6) {
      insights.alerts.push({
        type: 'low_score',
        message: 'Your health score is below average. Consider logging more details to get personalized recommendations.',
        priority: 'medium'
      });
    }
    
    // Sleep insights
    if (todayLog.sleepQuality < 6) {
      insights.recommendations.push({
        type: 'sleep',
        message: 'Your sleep quality is low. Try establishing a consistent bedtime routine.',
        priority: 'medium'
      });
    }
    
    // Mood insights
    if (todayLog.mood === 'Poor' || todayLog.mood === 'Terrible') {
      insights.recommendations.push({
        type: 'mood',
        message: 'You\'re feeling down today. Consider talking to a friend or engaging in a favorite activity.',
        priority: 'high'
      });
    }
    
    // Pattern detection
    if (logs.length >= 7) {
      const recentMoods = logs.slice(-7).map(log => log.mood);
      const negativeMoods = recentMoods.filter(mood => mood === 'Poor' || mood === 'Terrible');
      
      if (negativeMoods.length >= 3) {
        insights.patterns.push({
          type: 'mood_pattern',
          message: 'You\'ve been feeling down for several days. Consider reaching out for support.',
          priority: 'high'
        });
      }
    }
    
    return insights;
  };

  // Generate smart reminders
  const generateReminders = (logs, todayLog) => {
    const reminders = [];
    const today = new Date();
    
    // Daily logging reminder
    if (!todayLog) {
      reminders.push({
        id: 'daily_log',
        type: 'logging',
        title: 'Log Your Health',
        message: 'Take a moment to log your mood, energy, and sleep.',
        time: '9:00 AM',
        priority: 'high',
        completed: false
      });
    }
    
    // Weekly health check reminder
    const lastWeekLog = logs.find(log => {
      const logDate = new Date(log.date);
      const daysDiff = (today - logDate) / (1000 * 60 * 60 * 24);
      return daysDiff >= 7;
    });
    
    if (!lastWeekLog) {
      reminders.push({
        id: 'weekly_check',
        type: 'health_check',
        title: 'Weekly Health Review',
        message: 'Review your health patterns and set goals for the week.',
        time: '10:00 AM',
        priority: 'medium',
        completed: false
      });
    }
    
    return reminders;
  };

  // Load user goals
  const loadGoals = () => {
    try {
      return JSON.parse(localStorage.getItem('healthGoals') || '{}');
    } catch (error) {
      return {};
    }
  };

  // Save health data
  const saveHealthData = (newLog) => {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('healthLogs') || '[]');
      const updatedLogs = [...existingLogs, newLog];
      localStorage.setItem('healthLogs', JSON.stringify(updatedLogs));
      
      // Reload data to update insights
      loadHealthData();
      
      return true;
    } catch (error) {
      console.error('Error saving health data:', error);
      return false;
    }
  };

  // Update goals
  const updateGoals = (newGoals) => {
    try {
      localStorage.setItem('healthGoals', JSON.stringify(newGoals));
      setHealthData(prev => ({ ...prev, goals: newGoals }));
      return true;
    } catch (error) {
      console.error('Error updating goals:', error);
      return false;
    }
  };

  // Mark reminder as completed
  const completeReminder = (reminderId) => {
    setHealthData(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, completed: true }
          : reminder
      )
    }));
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadHealthData();
    } else {
      setHealthData({
        today: null,
        history: [],
        trends: {},
        insights: {},
        reminders: [],
        goals: {}
      });
      setLoading(false);
    }
  }, [user, loadHealthData]);

  // Auto-refresh data every 5 minutes - DISABLED to prevent shaking
  // useEffect(() => {
  //   if (user) {
  //     const interval = setInterval(() => {
  //       loadHealthData();
  //     }, 5 * 60 * 1000); // 5 minutes
  //     
  //     return () => clearInterval(interval);
  //   }
  // }, [user, loadHealthData]);

  const value = {
    healthData,
    loading,
    lastUpdate,
    saveHealthData,
    updateGoals,
    completeReminder,
    refreshData: loadHealthData
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};
