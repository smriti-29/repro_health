import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import AIServiceManager from '../ai/aiServiceManager';
import './MedicationSupplements.css';

const MedicationSupplements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveHealthData } = useHealthData();
  
  // Initialize AI Service
  const [aiService] = useState(() => new AIServiceManager());
  
  // State for medication and supplement tracking
  const [medicationForm, setMedicationForm] = useState({
    notes: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        prescriber: '',
        purpose: ''
      }
    ],
    supplements: [
      {
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        purpose: ''
      }
    ],
    adherence: {
      medications: 5,
      supplements: 5,
      sideEffects: 5,
      effectiveness: 5
    },
    interactions: {
      known: false,
      symptoms: '',
      concerns: ''
    },
    pharmacy: {
      name: '',
      phone: '',
      address: ''
    }
  });

  const [medicationLogs, setMedicationLogs] = useState([]);
  const [showEducation, setShowEducation] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing medication logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('amabMedicationLogs') || '[]');
    setMedicationLogs(logs);
  }, []);

  // Add new medication
  const addMedication = () => {
    setMedicationForm({
      ...medicationForm,
      medications: [
        ...medicationForm.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          startDate: '',
          prescriber: '',
          purpose: ''
        }
      ]
    });
  };

  // Remove medication
  const removeMedication = (index) => {
    const updatedMedications = medicationForm.medications.filter((_, i) => i !== index);
    setMedicationForm({
      ...medicationForm,
      medications: updatedMedications
    });
  };

  // Update medication
  const updateMedication = (index, field, value) => {
    const updatedMedications = medicationForm.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedicationForm({
      ...medicationForm,
      medications: updatedMedications
    });
  };

  // Add new supplement
  const addSupplement = () => {
    setMedicationForm({
      ...medicationForm,
      supplements: [
        ...medicationForm.supplements,
        {
          name: '',
          dosage: '',
          frequency: '',
          startDate: '',
          purpose: ''
        }
      ]
    });
  };

  // Remove supplement
  const removeSupplement = (index) => {
    const updatedSupplements = medicationForm.supplements.filter((_, i) => i !== index);
    setMedicationForm({
      ...medicationForm,
      supplements: updatedSupplements
    });
  };

  // Update supplement
  const updateSupplement = (index, field, value) => {
    const updatedSupplements = medicationForm.supplements.map((supp, i) => 
      i === index ? { ...supp, [field]: value } : supp
    );
    setMedicationForm({
      ...medicationForm,
      supplements: updatedSupplements
    });
  };

  // Calculate medication management score
  const calculateMedicationScore = (formData) => {
    let score = 100;
    
    // Adherence factors
    if (formData.adherence.medications < 4) score -= 25;
    else if (formData.adherence.medications < 6) score -= 15;
    
    if (formData.adherence.supplements < 4) score -= 15;
    else if (formData.adherence.supplements < 6) score -= 10;
    
    // Side effects
    if (formData.adherence.sideEffects > 6) score -= 20;
    else if (formData.adherence.sideEffects > 4) score -= 10;
    
    // Effectiveness
    if (formData.adherence.effectiveness < 4) score -= 15;
    else if (formData.adherence.effectiveness < 6) score -= 10;
    
    // Interactions
    if (formData.interactions.known) score -= 10;
    
    // Medication count (more medications = more complexity)
    const medicationCount = formData.medications.filter(med => med.name.trim() !== '').length;
    if (medicationCount > 5) score -= 10;
    else if (medicationCount > 3) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 80) return { category: 'Excellent', color: '#4ecdc4', message: 'Great medication management!' };
    if (score >= 60) return { category: 'Good', color: '#ffa726', message: 'Good medication adherence' };
    if (score >= 40) return { category: 'Fair', color: '#ff9800', message: 'Some areas for improvement' };
    return { category: 'Needs Attention', color: '#f44336', message: 'Focus on medication management' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const score = calculateMedicationScore(medicationForm);
      const category = getScoreCategory(score);
      
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...medicationForm,
        score: score,
        category: category
      };

      const updatedLogs = [newLog, ...medicationLogs];
      setMedicationLogs(updatedLogs);
      localStorage.setItem('amabMedicationLogs', JSON.stringify(updatedLogs));

      // Generate insights
      const aiInsights = generateMedicationInsights(newLog);
      setInsights(aiInsights);

      // Reset form
      setMedicationForm({
        notes: '',
        medications: [
          {
            name: '',
            dosage: '',
            frequency: '',
            startDate: '',
            prescriber: '',
            purpose: ''
          }
        ],
        supplements: [
          {
            name: '',
            dosage: '',
            frequency: '',
            startDate: '',
            purpose: ''
          }
        ],
        adherence: {
          medications: 5,
          supplements: 5,
          sideEffects: 5,
          effectiveness: 5
        },
        interactions: {
          known: false,
          symptoms: '',
          concerns: ''
        },
        pharmacy: {
          name: '',
          phone: '',
          address: ''
        }
      });

      alert('Medication & supplement log saved successfully! 💊');
    } catch (error) {
      console.error('Error logging medication data:', error);
      alert('Error logging medication data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate medication insights
  const generateMedicationInsights = (log) => {
    const insights = [];
    
    if (log.score >= 80) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Medication Management',
        message: 'Your medication management is excellent! You\'re doing a great job with adherence and monitoring.'
      });
    } else if (log.score >= 60) {
      insights.push({
        type: 'positive',
        icon: '👍',
        title: 'Good Medication Adherence',
        message: 'Your medication adherence is good. Continue with your current routine and address any gaps.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Medication Management Needs Attention',
        message: 'Your medication management could be improved. Focus on adherence and side effect monitoring.'
      });
    }

    // Specific recommendations
    if (log.adherence.medications < 4) {
      insights.push({
        type: 'warning',
        icon: '💊',
        title: 'Low Medication Adherence',
        message: 'Your medication adherence is low. Consider using reminders or pill organizers to improve consistency.'
      });
    }

    if (log.adherence.sideEffects > 6) {
      insights.push({
        type: 'warning',
        icon: '😣',
        title: 'Significant Side Effects',
        message: 'You\'re experiencing significant side effects. Discuss with your healthcare provider about adjusting medications.'
      });
    }

    if (log.adherence.effectiveness < 4) {
      insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Low Medication Effectiveness',
        message: 'Your medications may not be working as expected. Consider discussing effectiveness with your healthcare provider.'
      });
    }

    if (log.interactions.known) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Known Drug Interactions',
        message: 'You have known drug interactions. Make sure all healthcare providers are aware of all your medications.'
      });
    }

    const medicationCount = log.medications.filter(med => med.name.trim() !== '').length;
    if (medicationCount > 5) {
      insights.push({
        type: 'warning',
        icon: '📋',
        title: 'Complex Medication Regimen',
        message: 'You\'re taking many medications. Consider a medication review with your pharmacist or healthcare provider.'
      });
    }

    return insights;
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div className="medication-supplements">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>💊 Medication & Supplements</h1>
        <p>Track your medications, supplements, and adherence</p>
      </div>

      <div className="medication-content">
        {/* Medication Overview */}
        <div className="medication-overview">
          <div className="overview-card">
            <h3>📊 Total Logs</h3>
            <p className="count-display">{medicationLogs.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>🎯 Latest Score</h3>
            <p className="score-display" style={{ color: medicationLogs.length > 0 ? medicationLogs[0].category?.color || 'white' : 'white' }}>
              {medicationLogs.length > 0 ? `${medicationLogs[0].score}/100` : 'No logs yet'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>💊 Medication Adherence</h3>
            <p className="score-display">
              {medicationLogs.length > 0 ? `${medicationLogs[0].adherence.medications}/10` : 'No data'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>🌿 Supplement Adherence</h3>
            <p className="score-display">
              {medicationLogs.length > 0 ? `${medicationLogs[0].adherence.supplements}/10` : 'No data'}
            </p>
          </div>
        </div>

        {/* Medication & Supplement Form */}
        <div className="medication-form-section">
          <h2>Medication & Supplement Management</h2>
          <form onSubmit={handleSubmit} className="medication-form">
            <div className="form-group">
              <label>How are you feeling about your medications and supplements?</label>
              <input
                type="text"
                value={medicationForm.notes}
                onChange={(e) => setMedicationForm({...medicationForm, notes: e.target.value})}
                placeholder="Describe how you're feeling about your medications and supplements..."
              />
            </div>

            <div className="form-section">
              <div className="section-header">
                <h4>Medications</h4>
                <button type="button" className="add-btn" onClick={addMedication}>
                  + Add Medication
                </button>
              </div>
              
              {medicationForm.medications.map((medication, index) => (
                <div key={index} className="medication-entry">
                  <div className="entry-header">
                    <h5>Medication {index + 1}</h5>
                    {medicationForm.medications.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeMedication(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Medication Name</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Metformin"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={medication.startDate}
                        onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prescriber</label>
                      <input
                        type="text"
                        value={medication.prescriber}
                        onChange={(e) => updateMedication(index, 'prescriber', e.target.value)}
                        placeholder="e.g., Dr. Smith"
                      />
                    </div>
                    <div className="form-group">
                      <label>Purpose</label>
                      <input
                        type="text"
                        value={medication.purpose}
                        onChange={(e) => updateMedication(index, 'purpose', e.target.value)}
                        placeholder="e.g., Blood pressure control"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h4>Supplements</h4>
                <button type="button" className="add-btn" onClick={addSupplement}>
                  + Add Supplement
                </button>
              </div>
              
              {medicationForm.supplements.map((supplement, index) => (
                <div key={index} className="supplement-entry">
                  <div className="entry-header">
                    <h5>Supplement {index + 1}</h5>
                    {medicationForm.supplements.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeSupplement(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Supplement Name</label>
                      <input
                        type="text"
                        value={supplement.name}
                        onChange={(e) => updateSupplement(index, 'name', e.target.value)}
                        placeholder="e.g., Vitamin D"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage</label>
                      <input
                        type="text"
                        value={supplement.dosage}
                        onChange={(e) => updateSupplement(index, 'dosage', e.target.value)}
                        placeholder="e.g., 1000 IU"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency</label>
                      <input
                        type="text"
                        value={supplement.frequency}
                        onChange={(e) => updateSupplement(index, 'frequency', e.target.value)}
                        placeholder="e.g., Daily"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={supplement.startDate}
                        onChange={(e) => updateSupplement(index, 'startDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Purpose</label>
                    <input
                      type="text"
                      value={supplement.purpose}
                      onChange={(e) => updateSupplement(index, 'purpose', e.target.value)}
                      placeholder="e.g., Bone health"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-section">
              <h4>Adherence & Effectiveness</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Medication Adherence: {medicationForm.adherence.medications}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={medicationForm.adherence.medications}
                    onChange={(e) => setMedicationForm({
                      ...medicationForm,
                      adherence: {...medicationForm.adherence, medications: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Supplement Adherence: {medicationForm.adherence.supplements}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={medicationForm.adherence.supplements}
                    onChange={(e) => setMedicationForm({
                      ...medicationForm,
                      adherence: {...medicationForm.adherence, supplements: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Side Effects: {medicationForm.adherence.sideEffects}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={medicationForm.adherence.sideEffects}
                    onChange={(e) => setMedicationForm({
                      ...medicationForm,
                      adherence: {...medicationForm.adherence, sideEffects: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Effectiveness: {medicationForm.adherence.effectiveness}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={medicationForm.adherence.effectiveness}
                    onChange={(e) => setMedicationForm({
                      ...medicationForm,
                      adherence: {...medicationForm.adherence, effectiveness: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Drug Interactions & Concerns</h4>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={medicationForm.interactions.known}
                    onChange={(e) => setMedicationForm({
                      ...medicationForm,
                      interactions: {...medicationForm.interactions, known: e.target.checked}
                    })}
                  />
                  Known drug interactions
                </label>
              </div>
              
              <div className="form-group">
                <label>Interaction Symptoms</label>
                <textarea
                  value={medicationForm.interactions.symptoms}
                  onChange={(e) => setMedicationForm({
                    ...medicationForm,
                    interactions: {...medicationForm.interactions, symptoms: e.target.value}
                  })}
                  placeholder="Describe any symptoms you think might be related to drug interactions..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Concerns</label>
                <textarea
                  value={medicationForm.interactions.concerns}
                  onChange={(e) => setMedicationForm({
                    ...medicationForm,
                    interactions: {...medicationForm.interactions, concerns: e.target.value}
                  })}
                  placeholder="Any concerns about your medications or supplements?"
                  rows="3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Medication Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && insights.length > 0 && (
          <div className="insights-section">
            <h2>🤖 AI Medication Insights</h2>
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

        {/* Medication History */}
        {medicationLogs.length > 0 && (
          <div className="medication-history">
            <h2>📈 Medication History</h2>
            <div className="history-list">
              {medicationLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-date">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span>Score: {log.score}/100</span>
                    <span>Med Adherence: {log.adherence.medications}/10</span>
                    <span>Supp Adherence: {log.adherence.supplements}/10</span>
                    <span>Status: {log.category?.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Medication Education</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>💊 Medication Adherence</h3>
              <p>Learn strategies for taking medications consistently and managing complex regimens</p>
            </div>
            <div className="resource-card">
              <h3>🌿 Supplement Safety</h3>
              <p>Understanding supplement interactions, quality, and when to use them</p>
            </div>
            <div className="resource-card">
              <h3>⚠️ Drug Interactions</h3>
              <p>How to identify and prevent dangerous drug interactions</p>
            </div>
            <div className="resource-card">
              <h3>📋 Medication Management</h3>
              <p>Tools and techniques for organizing and tracking multiple medications</p>
            </div>
            <div className="resource-card">
              <h3>🏥 Healthcare Communication</h3>
              <p>How to effectively communicate with healthcare providers about medications</p>
            </div>
            <div className="resource-card">
              <h3>💰 Cost Management</h3>
              <p>Strategies for managing medication costs and finding affordable options</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationSupplements;