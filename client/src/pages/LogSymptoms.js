import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LogSymptoms.css';

const LogSymptoms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    symptoms: [],
    severity: 'mild',
    duration: '',
    triggers: [],
    notes: '',
    medications: [],
    mood: 'neutral',
    energy: 5,
    sleep: 5
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const symptomOptions = [
    { id: 'fatigue', label: 'Fatigue', icon: '😴' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'nausea', label: 'Nausea', icon: '🤢' },
    { id: 'cramps', label: 'Cramps', icon: '😖' },
    { id: 'bloating', label: 'Bloating', icon: '🤰' },
    { id: 'mood_swings', label: 'Mood Swings', icon: '😤' },
    { id: 'breast_tenderness', label: 'Breast Tenderness', icon: '💔' },
    { id: 'acne', label: 'Acne', icon: '😣' },
    { id: 'back_pain', label: 'Back Pain', icon: '😫' },
    { id: 'hot_flashes', label: 'Hot Flashes', icon: '🔥' },
    { id: 'irregular_bleeding', label: 'Irregular Bleeding', icon: '🩸' },
    { id: 'weight_gain', label: 'Weight Gain', icon: '⚖️' },
    { id: 'hair_loss', label: 'Hair Loss', icon: '💇‍♀️' },
    { id: 'insomnia', label: 'Insomnia', icon: '😵' },
    { id: 'anxiety', label: 'Anxiety', icon: '😰' },
    { id: 'depression', label: 'Depression', icon: '😔' }
  ];

  const triggerOptions = [
    'Stress', 'Diet', 'Exercise', 'Sleep', 'Hormones', 
    'Medication', 'Alcohol', 'Caffeine', 'Weather', 'Work'
  ];

  const medicationOptions = [
    'Birth Control', 'Pain Relievers', 'Antibiotics', 'Antidepressants',
    'Hormone Therapy', 'Vitamins', 'Supplements', 'Other'
  ];

  const handleSymptomToggle = (symptomId) => {
    setSymptoms(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(id => id !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  const handleTriggerToggle = (trigger) => {
    setSymptoms(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const handleMedicationToggle = (medication) => {
    setSymptoms(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically save to backend
      console.log('Logging symptoms:', symptoms);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Symptoms logged successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging symptoms:', error);
      alert('Error logging symptoms. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedSymptoms = () => {
    return symptomOptions.filter(option => symptoms.symptoms.includes(option.id));
  };

  return (
    <div className="log-symptoms-container">
      <div className="symptoms-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Log Your Symptoms</h1>
        <p>Track how you're feeling to better understand your health patterns</p>
      </div>

      <form onSubmit={handleSubmit} className="symptoms-form">
        <div className="form-sections">
          {/* Date and Time */}
          <section className="form-section">
            <h2>📅 When did this start?</h2>
            <div className="datetime-grid">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={symptoms.date}
                  onChange={(e) => setSymptoms(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={symptoms.time}
                  onChange={(e) => setSymptoms(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>
          </section>

          {/* Symptoms Selection */}
          <section className="form-section">
            <h2>🤒 What symptoms are you experiencing?</h2>
            <div className="symptoms-grid">
              {symptomOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`symptom-option ${symptoms.symptoms.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => handleSymptomToggle(option.id)}
                >
                  <span className="symptom-icon">{option.icon}</span>
                  <span className="symptom-label">{option.label}</span>
                </button>
              ))}
            </div>
            {symptoms.symptoms.length > 0 && (
              <div className="selected-symptoms">
                <h3>Selected Symptoms:</h3>
                <div className="selected-tags">
                  {getSelectedSymptoms().map(symptom => (
                    <span key={symptom.id} className="selected-tag">
                      {symptom.icon} {symptom.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Severity and Duration */}
          <section className="form-section">
            <h2>📊 How severe are your symptoms?</h2>
            <div className="severity-duration-grid">
              <div className="form-group">
                <label>Severity Level</label>
                <select
                  value={symptoms.severity}
                  onChange={(e) => setSymptoms(prev => ({ ...prev, severity: e.target.value }))}
                  required
                >
                  <option value="mild">Mild - Noticeable but manageable</option>
                  <option value="moderate">Moderate - Affecting daily activities</option>
                  <option value="severe">Severe - Significantly impacting life</option>
                  <option value="extreme">Extreme - Unable to function normally</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select
                  value={symptoms.duration}
                  onChange={(e) => setSymptoms(prev => ({ ...prev, duration: e.target.value }))}
                  required
                >
                  <option value="">Select duration</option>
                  <option value="less_than_1_hour">Less than 1 hour</option>
                  <option value="1_4_hours">1-4 hours</option>
                  <option value="4_12_hours">4-12 hours</option>
                  <option value="12_24_hours">12-24 hours</option>
                  <option value="1_3_days">1-3 days</option>
                  <option value="more_than_3_days">More than 3 days</option>
                </select>
              </div>
            </div>
          </section>

          {/* Triggers */}
          <section className="form-section">
            <h2>🔍 What might have triggered this?</h2>
            <div className="triggers-grid">
              {triggerOptions.map(trigger => (
                <button
                  key={trigger}
                  type="button"
                  className={`trigger-option ${symptoms.triggers.includes(trigger) ? 'selected' : ''}`}
                  onClick={() => handleTriggerToggle(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>
            {symptoms.triggers.length > 0 && (
              <div className="selected-triggers">
                <h3>Selected Triggers:</h3>
                <div className="selected-tags">
                  {symptoms.triggers.map(trigger => (
                    <span key={trigger} className="selected-tag">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Medications */}
          <section className="form-section">
            <h2>💊 Are you taking any medications?</h2>
            <div className="medications-grid">
              {medicationOptions.map(medication => (
                <button
                  key={medication}
                  type="button"
                  className={`medication-option ${symptoms.medications.includes(medication) ? 'selected' : ''}`}
                  onClick={() => handleMedicationToggle(medication)}
                >
                  {medication}
                </button>
              ))}
            </div>
            {symptoms.medications.length > 0 && (
              <div className="selected-medications">
                <h3>Current Medications:</h3>
                <div className="selected-tags">
                  {symptoms.medications.map(medication => (
                    <span key={medication} className="selected-tag">
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Overall Health */}
          <section className="form-section">
            <h2>💪 How are you feeling overall?</h2>
            <div className="overall-health-grid">
              <div className="form-group">
                <label>Mood</label>
                <select
                  value={symptoms.mood}
                  onChange={(e) => setSymptoms(prev => ({ ...prev, mood: e.target.value }))}
                >
                  <option value="excellent">😊 Excellent</option>
                  <option value="good">🙂 Good</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="bad">😔 Bad</option>
                  <option value="terrible">😢 Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Energy Level (1-10)</label>
                <div className="range-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptoms.energy}
                    onChange={(e) => setSymptoms(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                  />
                  <span className="range-value">{symptoms.energy}/10</span>
                </div>
              </div>
              <div className="form-group">
                <label>Sleep Quality (1-10)</label>
                <div className="range-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptoms.sleep}
                    onChange={(e) => setSymptoms(prev => ({ ...prev, sleep: parseInt(e.target.value) }))}
                  />
                  <span className="range-value">{symptoms.sleep}/10</span>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="form-section">
            <h2>📝 Additional Notes</h2>
            <div className="form-group">
              <label>Any other details you'd like to share?</label>
              <textarea
                value={symptoms.notes}
                onChange={(e) => setSymptoms(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describe your symptoms in detail, any patterns you've noticed, or anything else that might be relevant..."
                rows="4"
              />
            </div>
          </section>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || symptoms.symptoms.length === 0}
          >
            {isSubmitting ? 'Logging Symptoms...' : 'Log Symptoms'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogSymptoms;
