import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './AdvancedConditions.css';

const AdvancedConditions = () => {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const { healthData } = useHealthData();
  
  // State management
  const [selectedCondition, setSelectedCondition] = useState('pcos');
  const [conditionData, setConditionData] = useState({
    pcos: { symptoms: [], medications: [], lastCheckup: null },
    endometriosis: { symptoms: [], painLevel: 0, lastCheckup: null },
    fibroids: { symptoms: [], size: null, lastCheckup: null }
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: 5,
    duration: '',
    notes: ''
  });

  // AI Service
  const [aiService] = useState(() => new AIServiceManager());

  // Load condition data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`advancedConditions_${user?.id || 'anonymous'}`);
    if (savedData) {
      setConditionData(JSON.parse(savedData));
    }
  }, [user?.id]);

  // Save condition data to localStorage
  useEffect(() => {
    localStorage.setItem(`advancedConditions_${user?.id || 'anonymous'}`, JSON.stringify(conditionData));
  }, [conditionData, user?.id]);

  // Generate AI insights for selected condition
  const generateAIInsights = async () => {
    setIsLoading(true);
    try {
      const insights = await aiService.generateConditionInsights(selectedCondition, conditionData[selectedCondition], profileData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new symptom
  const addSymptom = () => {
    if (!newSymptom.name.trim()) return;
    
    const symptom = {
      ...newSymptom,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setConditionData(prev => ({
      ...prev,
      [selectedCondition]: {
        ...prev[selectedCondition],
        symptoms: [...prev[selectedCondition].symptoms, symptom]
      }
    }));
    
    setNewSymptom({ name: '', severity: 5, duration: '', notes: '' });
    setShowSymptomForm(false);
  };

  // Delete symptom
  const deleteSymptom = (symptomId) => {
    setConditionData(prev => ({
      ...prev,
      [selectedCondition]: {
        ...prev[selectedCondition],
        symptoms: prev[selectedCondition].symptoms.filter(s => s.id !== symptomId)
      }
    }));
  };

  // Get condition info
  const getConditionInfo = (condition) => {
    const conditions = {
      pcos: {
        name: 'PCOS (Polycystic Ovary Syndrome)',
        icon: '🦋',
        description: 'A hormonal disorder causing enlarged ovaries with small cysts',
        symptoms: ['Irregular periods', 'Excess hair growth', 'Weight gain', 'Acne', 'Hair loss']
      },
      endometriosis: {
        name: 'Endometriosis',
        icon: '🌺',
        description: 'Tissue similar to uterine lining grows outside the uterus',
        symptoms: ['Pelvic pain', 'Heavy periods', 'Pain during intercourse', 'Infertility', 'Fatigue']
      },
      fibroids: {
        name: 'Uterine Fibroids',
        icon: '🔴',
        description: 'Non-cancerous growths in the uterus',
        symptoms: ['Heavy menstrual bleeding', 'Pelvic pressure', 'Frequent urination', 'Back pain', 'Constipation']
      }
    };
    return conditions[condition];
  };

  const conditionInfo = getConditionInfo(selectedCondition);

  return (
    <div className="advanced-conditions">
      <div className="conditions-header">
        <h1>🏥 Advanced Conditions</h1>
        <p>Comprehensive management for PCOS, Endometriosis, and Fibroids</p>
      </div>

      {/* Condition Selector */}
      <div className="condition-selector">
        <button 
          className={`condition-tab ${selectedCondition === 'pcos' ? 'active' : ''}`}
          onClick={() => setSelectedCondition('pcos')}
        >
          🦋 PCOS
        </button>
        <button 
          className={`condition-tab ${selectedCondition === 'endometriosis' ? 'active' : ''}`}
          onClick={() => setSelectedCondition('endometriosis')}
        >
          🌺 Endometriosis
        </button>
        <button 
          className={`condition-tab ${selectedCondition === 'fibroids' ? 'active' : ''}`}
          onClick={() => setSelectedCondition('fibroids')}
        >
          🔴 Fibroids
        </button>
      </div>

      {/* Condition Overview */}
      <div className="condition-overview">
        <div className="condition-info">
          <h2>{conditionInfo.icon} {conditionInfo.name}</h2>
          <p>{conditionInfo.description}</p>
        </div>
        
        <div className="condition-stats">
          <div className="stat-card">
            <span className="stat-number">{conditionData[selectedCondition].symptoms.length}</span>
            <span className="stat-label">Symptoms Tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {conditionData[selectedCondition].lastCheckup ? 
                Math.floor((new Date() - new Date(conditionData[selectedCondition].lastCheckup)) / (1000 * 60 * 60 * 24)) : 
                'N/A'
              }
            </span>
            <span className="stat-label">Days Since Checkup</span>
          </div>
        </div>
      </div>

      {/* Symptoms Tracking */}
      <div className="symptoms-section">
        <div className="section-header">
          <h3>📊 Symptom Tracking</h3>
          <button 
            className="add-symptom-btn"
            onClick={() => setShowSymptomForm(true)}
          >
            + Add Symptom
          </button>
        </div>

        {/* Symptom Form */}
        {showSymptomForm && (
          <div className="symptom-form">
            <h4>Add New Symptom</h4>
            <div className="form-group">
              <label>Symptom Name</label>
              <input
                type="text"
                value={newSymptom.name}
                onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
                placeholder="e.g., Pelvic pain, Heavy bleeding"
              />
            </div>
            <div className="form-group">
              <label>Severity (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newSymptom.severity}
                onChange={(e) => setNewSymptom({...newSymptom, severity: parseInt(e.target.value)})}
              />
              <span>{newSymptom.severity}/10</span>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={newSymptom.duration}
                onChange={(e) => setNewSymptom({...newSymptom, duration: e.target.value})}
                placeholder="e.g., 3 days, 2 weeks"
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newSymptom.notes}
                onChange={(e) => setNewSymptom({...newSymptom, notes: e.target.value})}
                placeholder="Additional details..."
              />
            </div>
            <div className="form-actions">
              <button onClick={addSymptom} className="save-btn">Save Symptom</button>
              <button onClick={() => setShowSymptomForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Symptoms List */}
        <div className="symptoms-list">
          {conditionData[selectedCondition].symptoms.length === 0 ? (
            <div className="empty-state">
              <p>No symptoms tracked yet. Add your first symptom to get started.</p>
            </div>
          ) : (
            conditionData[selectedCondition].symptoms.map((symptom) => (
              <div key={symptom.id} className="symptom-card">
                <div className="symptom-info">
                  <h4>{symptom.name}</h4>
                  <div className="symptom-details">
                    <span className="severity">Severity: {symptom.severity}/10</span>
                    <span className="duration">Duration: {symptom.duration}</span>
                    <span className="date">{new Date(symptom.timestamp).toLocaleDateString()}</span>
                  </div>
                  {symptom.notes && <p className="symptom-notes">{symptom.notes}</p>}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteSymptom(symptom.id)}
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
              <h4>📋 Clinical Summary</h4>
              <p>{aiInsights.clinicalSummary}</p>
            </div>
            <div className="insight-card">
              <h4>💡 Recommendations</h4>
              <ul>
                {aiInsights.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            <div className="insight-card">
              <h4>⚠️ Medical Alerts</h4>
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
            📅 Schedule Checkup
          </button>
          <button className="action-btn">
            💊 Medication Reminder
          </button>
          <button className="action-btn">
            📊 Export Data
          </button>
          <button className="action-btn">
            🏥 Find Specialist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConditions;
