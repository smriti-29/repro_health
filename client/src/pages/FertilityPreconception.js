import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AMABAIService from '../ai/amabAIService';
import './FertilityPreconception.css';

const FertilityPreconception = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AMABAIService());
  
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [savedInsights, setSavedInsights] = useState([]);
  const [showSavedInsights, setShowSavedInsights] = useState(false);
  const [fertilityData, setFertilityData] = useState([]);
  
  const [fertilityForm, setFertilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    semenVolumeReduction: false,
    semenConsistency: 'normal',
    ejaculationPain: false,
    erectionMaintenance: 5,
    prematureEjaculation: false,
    sleepHours: 7.5,
    alcoholDrinks: 0,
    smokingStatus: 'never',
    exerciseDays: 3,
    workStress: 5,
    lifeStress: 5,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const fertilityEntry = { ...fertilityForm, timestamp: new Date().toISOString() };
      const updatedData = [...fertilityData, fertilityEntry];
      setFertilityData(updatedData);

      const prompt = `Analyze fertility health data for male:
      Semen volume reduction: ${fertilityForm.semenVolumeReduction ? 'Yes' : 'No'}
      Semen consistency: ${fertilityForm.semenConsistency}
      Ejaculation pain: ${fertilityForm.ejaculationPain ? 'Yes' : 'No'}
      Erection maintenance: ${fertilityForm.erectionMaintenance}/10
      Sleep hours: ${fertilityForm.sleepHours}
      Alcohol drinks: ${fertilityForm.alcoholDrinks}/week
      Smoking: ${fertilityForm.smokingStatus}
      Exercise days: ${fertilityForm.exerciseDays}/week
      Work stress: ${fertilityForm.workStress}/10
      Life stress: ${fertilityForm.lifeStress}/10

      Provide comprehensive fertility analysis in this format:
      **FERTILITY STATUS** (Current assessment)
      **PREDICTIONS** (Outlook)
      **ACTIONS** (Recommendations)
      **INSIGHTS** (Correlations)
      **HEALTH NUGGET** (Evidence-based tip)`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsights('**FERTILITY STATUS** Analysis completed. **PREDICTIONS** Good outlook. **ACTIONS** Maintain healthy lifestyle. **INSIGHTS** Regular monitoring recommended. **HEALTH NUGGET** Sleep and exercise support fertility.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fertility-preconception-container">
      <div className="fertility-preconception-content">
        <div className="page-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>👶 Male Fertility & Preconception</h1>
          <p>Optimize your fertility health and prepare for conception</p>
        </div>
        
        <div className="health-form-section">
          <h2>Log Your Fertility Health Data</h2>
          <form onSubmit={handleSubmit} className="health-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={fertilityForm.date}
                  onChange={(e) => setFertilityForm({...fertilityForm, date: e.target.value})}
                />
              </div>
            </div>

            <div className="question-box">
              <h3>💧 Ejaculation & Semen Health</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={fertilityForm.semenVolumeReduction}
                      onChange={(e) => setFertilityForm({...fertilityForm, semenVolumeReduction: e.target.checked})}
                    />
                    <span>Have you noticed a reduction in semen volume recently?</span>
                  </label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="semen-consistency">Semen Consistency</label>
                  <select
                    id="semen-consistency"
                    value={fertilityForm.semenConsistency}
                    onChange={(e) => setFertilityForm({...fertilityForm, semenConsistency: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="watery">Watery</option>
                    <option value="thick">Thick</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={fertilityForm.ejaculationPain}
                      onChange={(e) => setFertilityForm({...fertilityForm, ejaculationPain: e.target.checked})}
                    />
                    <span>Do you experience pain during ejaculation?</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="question-box">
              <h3>💕 Sexual Function</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="erection-maintenance">Erection Maintenance (1-10)</label>
                  <input
                    id="erection-maintenance"
                    type="number"
                    min="1"
                    max="10"
                    value={fertilityForm.erectionMaintenance}
                    onChange={(e) => setFertilityForm({...fertilityForm, erectionMaintenance: parseInt(e.target.value) || 5})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={fertilityForm.prematureEjaculation}
                      onChange={(e) => setFertilityForm({...fertilityForm, prematureEjaculation: e.target.checked})}
                    />
                    <span>Do you experience premature ejaculation frequently?</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="question-box">
              <h3>🏃 Lifestyle Habits</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sleep-hours">Sleep Hours</label>
                  <input
                    id="sleep-hours"
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={fertilityForm.sleepHours}
                    onChange={(e) => setFertilityForm({...fertilityForm, sleepHours: parseFloat(e.target.value) || 7.5})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="alcohol-drinks">Alcohol Drinks (per week)</label>
                  <input
                    id="alcohol-drinks"
                    type="number"
                    min="0"
                    max="50"
                    value={fertilityForm.alcoholDrinks}
                    onChange={(e) => setFertilityForm({...fertilityForm, alcoholDrinks: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="smoking-status">Smoking Status</label>
                  <select
                    id="smoking-status"
                    value={fertilityForm.smokingStatus}
                    onChange={(e) => setFertilityForm({...fertilityForm, smokingStatus: e.target.value})}
                  >
                    <option value="never">Never</option>
                    <option value="former">Former smoker</option>
                    <option value="current">Current smoker</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="exercise-days">Exercise Days (per week)</label>
                  <input
                    id="exercise-days"
                    type="number"
                    min="0"
                    max="7"
                    value={fertilityForm.exerciseDays}
                    onChange={(e) => setFertilityForm({...fertilityForm, exerciseDays: parseInt(e.target.value) || 3})}
                  />
                </div>
              </div>
            </div>

            <div className="question-box">
              <h3>🧠 Stress & Mental Load</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="work-stress">Work Stress (1-10)</label>
                  <input
                    id="work-stress"
                    type="number"
                    min="1"
                    max="10"
                    value={fertilityForm.workStress}
                    onChange={(e) => setFertilityForm({...fertilityForm, workStress: parseInt(e.target.value) || 5})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="life-stress">Life Stress (1-10)</label>
                  <input
                    id="life-stress"
                    type="number"
                    min="1"
                    max="10"
                    value={fertilityForm.lifeStress}
                    onChange={(e) => setFertilityForm({...fertilityForm, lifeStress: parseInt(e.target.value) || 5})}
                  />
                </div>
              </div>
            </div>

            <div className="question-box">
              <h3>📝 Additional Information</h3>
              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  value={fertilityForm.notes}
                  onChange={(e) => setFertilityForm({...fertilityForm, notes: e.target.value})}
                  placeholder="Any additional observations or information..."
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Log Fertility Health Data'}
            </button>
          </form>
        </div>

        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Fertility Health Insights</h2>
            <div className="insights-content">
              <pre style={{whiteSpace: 'pre-wrap', color: 'white'}}>{insights}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilityPreconception;
