import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './AdvancedTracking.css';

const AdvancedTracking = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData } = useHealthData();
  
  // State management
  const [selectedTracking, setSelectedTracking] = useState('breast-health');
  const [trackingData, setTrackingData] = useState({
    'breast-health': { 
      selfExams: [], 
      mammograms: [], 
      lastScreening: null,
      familyHistory: false
    },
    'ovarian-cancer': { 
      symptoms: [], 
      ca125Tests: [], 
      ultrasounds: [],
      familyHistory: false
    },
    'cervix-cancer': { 
      papSmears: [], 
      hpvTests: [], 
      colposcopies: [],
      vaccinations: []
    },
    'breast-cancer': { 
      screenings: [], 
      biopsies: [], 
      treatments: [],
      familyHistory: false
    }
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [newScreening, setNewScreening] = useState({
    type: '',
    date: '',
    result: '',
    notes: '',
    nextDue: ''
  });

  // AI Service
  const [aiService] = useState(() => new AIServiceManager());

  // Load tracking data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`advancedTracking_${user?.id || 'anonymous'}`);
    if (savedData) {
      setTrackingData(JSON.parse(savedData));
    }
  }, [user?.id]);

  // Save tracking data to localStorage
  useEffect(() => {
    localStorage.setItem(`advancedTracking_${user?.id || 'anonymous'}`, JSON.stringify(trackingData));
  }, [trackingData, user?.id]);

  // Generate AI insights for selected tracking
  const generateAIInsights = async () => {
    setIsLoading(true);
    try {
      const insights = await aiService.generateTrackingInsights(selectedTracking, trackingData[selectedTracking], profileData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new screening
  const addScreening = () => {
    if (!newScreening.type || !newScreening.date) return;
    
    const screening = {
      ...newScreening,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setTrackingData(prev => ({
      ...prev,
      [selectedTracking]: {
        ...prev[selectedTracking],
        [getScreeningKey(selectedTracking)]: [...prev[selectedTracking][getScreeningKey(selectedTracking)], screening]
      }
    }));
    
    setNewScreening({ type: '', date: '', result: '', notes: '', nextDue: '' });
    setShowScreeningForm(false);
  };

  // Get screening key based on tracking type
  const getScreeningKey = (tracking) => {
    const keys = {
      'breast-health': 'mammograms',
      'ovarian-cancer': 'ca125Tests',
      'cervix-cancer': 'papSmears',
      'breast-cancer': 'screenings'
    };
    return keys[tracking];
  };

  // Delete screening
  const deleteScreening = (screeningId) => {
    const key = getScreeningKey(selectedTracking);
    setTrackingData(prev => ({
      ...prev,
      [selectedTracking]: {
        ...prev[selectedTracking],
        [key]: prev[selectedTracking][key].filter(s => s.id !== screeningId)
      }
    }));
  };

  // Get tracking info
  const getTrackingInfo = (tracking) => {
    const trackings = {
      'breast-health': {
        name: 'Breast Health',
        icon: '🌸',
        description: 'Comprehensive breast health monitoring and screening',
        screenings: ['Mammograms', 'Self-exams', 'Clinical exams', 'Ultrasounds']
      },
      'ovarian-cancer': {
        name: 'Ovarian Cancer Tracking',
        icon: '🟣',
        description: 'Ovarian cancer screening and early detection',
        screenings: ['CA-125 tests', 'Pelvic ultrasounds', 'Genetic testing', 'Symptom monitoring']
      },
      'cervix-cancer': {
        name: 'Cervix Cancer Tracking',
        icon: '🟡',
        description: 'Cervical cancer prevention and screening',
        screenings: ['Pap smears', 'HPV tests', 'Colposcopies', 'HPV vaccination']
      },
      'breast-cancer': {
        name: 'Breast Cancer Tracking',
        icon: '🎗️',
        description: 'Breast cancer screening and monitoring',
        screenings: ['Mammograms', 'MRIs', 'Biopsies', 'Genetic testing']
      }
    };
    return trackings[tracking];
  };

  const trackingInfo = getTrackingInfo(selectedTracking);

  // Calculate next screening due
  const getNextScreeningDue = () => {
    const key = getScreeningKey(selectedTracking);
    const screenings = trackingData[selectedTracking][key];
    if (screenings.length === 0) return 'No screenings recorded';
    
    const lastScreening = screenings[screenings.length - 1];
    if (lastScreening.nextDue) {
      const dueDate = new Date(lastScreening.nextDue);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due today';
      return `${diffDays} days`;
    }
    return 'Not specified';
  };

  return (
    <div className="advanced-tracking">
      <div className="tracking-header">
        <h1>🔬 Advanced Tracking</h1>
        <p>Comprehensive cancer screening and preventive care tracking</p>
      </div>

      {/* Tracking Selector */}
      <div className="tracking-selector">
        <button 
          className={`tracking-tab ${selectedTracking === 'breast-health' ? 'active' : ''}`}
          onClick={() => setSelectedTracking('breast-health')}
        >
          🌸 Breast Health
        </button>
        <button 
          className={`tracking-tab ${selectedTracking === 'ovarian-cancer' ? 'active' : ''}`}
          onClick={() => setSelectedTracking('ovarian-cancer')}
        >
          🟣 Ovarian Cancer
        </button>
        <button 
          className={`tracking-tab ${selectedTracking === 'cervix-cancer' ? 'active' : ''}`}
          onClick={() => setSelectedTracking('cervix-cancer')}
        >
          🟡 Cervix Cancer
        </button>
        <button 
          className={`tracking-tab ${selectedTracking === 'breast-cancer' ? 'active' : ''}`}
          onClick={() => setSelectedTracking('breast-cancer')}
        >
          🎗️ Breast Cancer
        </button>
      </div>

      {/* Tracking Overview */}
      <div className="tracking-overview">
        <div className="tracking-info">
          <h2>{trackingInfo.icon} {trackingInfo.name}</h2>
          <p>{trackingInfo.description}</p>
        </div>
        
        <div className="tracking-stats">
          <div className="stat-card">
            <span className="stat-number">
              {trackingData[selectedTracking][getScreeningKey(selectedTracking)].length}
            </span>
            <span className="stat-label">Screenings Recorded</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{getNextScreeningDue()}</span>
            <span className="stat-label">Next Screening</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {trackingData[selectedTracking].familyHistory ? 'Yes' : 'No'}
            </span>
            <span className="stat-label">Family History</span>
          </div>
        </div>
      </div>

      {/* Screening Tracking */}
      <div className="screening-section">
        <div className="section-header">
          <h3>📊 Screening History</h3>
          <button 
            className="add-screening-btn"
            onClick={() => setShowScreeningForm(true)}
          >
            + Add Screening
          </button>
        </div>

        {/* Screening Form */}
        {showScreeningForm && (
          <div className="screening-form">
            <h4>Add New Screening</h4>
            <div className="form-group">
              <label>Screening Type</label>
              <select
                value={newScreening.type}
                onChange={(e) => setNewScreening({...newScreening, type: e.target.value})}
              >
                <option value="">Select screening type</option>
                {trackingInfo.screenings.map((screening, index) => (
                  <option key={index} value={screening}>{screening}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newScreening.date}
                onChange={(e) => setNewScreening({...newScreening, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Result</label>
              <select
                value={newScreening.result}
                onChange={(e) => setNewScreening({...newScreening, result: e.target.value})}
              >
                <option value="">Select result</option>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Inconclusive">Inconclusive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Next Due Date</label>
              <input
                type="date"
                value={newScreening.nextDue}
                onChange={(e) => setNewScreening({...newScreening, nextDue: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newScreening.notes}
                onChange={(e) => setNewScreening({...newScreening, notes: e.target.value})}
                placeholder="Additional details..."
              />
            </div>
            <div className="form-actions">
              <button onClick={addScreening} className="save-btn">Save Screening</button>
              <button onClick={() => setShowScreeningForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Screenings List */}
        <div className="screenings-list">
          {trackingData[selectedTracking][getScreeningKey(selectedTracking)].length === 0 ? (
            <div className="empty-state">
              <p>No screenings recorded yet. Add your first screening to get started.</p>
            </div>
          ) : (
            trackingData[selectedTracking][getScreeningKey(selectedTracking)].map((screening) => (
              <div key={screening.id} className="screening-card">
                <div className="screening-info">
                  <h4>{screening.type}</h4>
                  <div className="screening-details">
                    <span className="date">Date: {new Date(screening.date).toLocaleDateString()}</span>
                    <span className={`result ${screening.result?.toLowerCase()}`}>
                      Result: {screening.result}
                    </span>
                    {screening.nextDue && (
                      <span className="next-due">
                        Next Due: {new Date(screening.nextDue).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {screening.notes && <p className="screening-notes">{screening.notes}</p>}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteScreening(screening.id)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights-section">
        <div className="section-header">
          <h3>🤖 AI Health Insights</h3>
          <button 
            className="generate-insights-btn"
            onClick={generateAIInsights}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>

        {aiInsights && (
          <div className="ai-insights">
            <div className="insight-card">
              <h4>📋 Risk Assessment</h4>
              <p>{Array.isArray(aiInsights.riskAssessment) ? aiInsights.riskAssessment.join(' • ') : JSON.stringify(aiInsights.riskAssessment)}</p>
            </div>
            <div className="insight-card">
              <h4>📅 Screening Recommendations</h4>
              <ul>
                {aiInsights.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            <div className="insight-card">
              <h4>⚠️ Important Alerts</h4>
              <ul>
                {aiInsights.alerts?.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            📅 Schedule Screening
          </button>
          <button className="action-btn">
            🏥 Find Specialist
          </button>
          <button className="action-btn">
            📊 Export Records
          </button>
          <button className="action-btn">
            🔔 Set Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTracking;
