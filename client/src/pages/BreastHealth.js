import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIServiceManager from '../ai/aiServiceManager.js';
import './BreastHealth.css';

const BreastHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiService] = useState(() => new AIServiceManager());
  
  // Breast health tracking form state
  const [breastForm, setBreastForm] = useState({
    date: new Date().toISOString().split('T')[0],
    selfExamPerformed: false,
    examFindings: [],
    symptoms: [],
    screeningType: '',
    screeningDate: '',
    screeningResults: '',
    familyHistory: [],
    lifestyle: [],
    notes: ''
  });

  // Breast health data and insights
  const [breastData, setBreastData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextScreening, setNextScreening] = useState(null);

  // Self-exam findings
  const examFindings = [
    'No changes detected',
    'Lump or mass',
    'Thickening',
    'Dimpling',
    'Nipple discharge',
    'Nipple changes',
    'Skin changes',
    'Size changes',
    'Shape changes',
    'Pain or tenderness',
    'Swelling',
    'Redness',
    'Warmth',
    'Other changes'
  ];

  // Breast health symptoms
  const breastSymptoms = [
    'Breast pain',
    'Nipple pain',
    'Breast tenderness',
    'Nipple discharge',
    'Breast swelling',
    'Breast lumps',
    'Skin changes',
    'Nipple changes',
    'Breast asymmetry',
    'No symptoms'
  ];

  // Family history factors
  const familyHistoryOptions = [
    'Breast cancer in mother',
    'Breast cancer in sister',
    'Breast cancer in daughter',
    'Breast cancer in grandmother',
    'Breast cancer in aunt',
    'Ovarian cancer in family',
    'BRCA gene mutation',
    'Multiple family members with breast cancer',
    'Early onset breast cancer in family',
    'No family history'
  ];

  // Lifestyle factors
  const lifestyleFactors = [
    'Regular exercise',
    'Healthy diet',
    'Maintaining healthy weight',
    'Limiting alcohol',
    'Not smoking',
    'Breastfeeding history',
    'Hormone therapy use',
    'Birth control use',
    'Regular mammograms',
    'Genetic counseling'
  ];

  // Load existing breast health data
  useEffect(() => {
    const savedData = localStorage.getItem('afabBreastHealthData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setBreastData(parsed);
      
      // Calculate next screening date
      if (parsed.length > 0) {
        const lastScreening = parsed
          .filter(entry => entry.screeningType && entry.screeningDate)
          .sort((a, b) => new Date(b.screeningDate) - new Date(a.screeningDate))[0];
        
        if (lastScreening) {
          const nextDate = new Date(lastScreening.screeningDate);
          nextDate.setFullYear(nextDate.getFullYear() + 1); // Annual screening
          setNextScreening(nextDate);
        }
      }
    }
  }, []);

  const handleFindingToggle = (finding) => {
    setBreastForm(prev => ({
      ...prev,
      examFindings: prev.examFindings.includes(finding)
        ? prev.examFindings.filter(f => f !== finding)
        : [...prev.examFindings, finding]
    }));
  };

  const handleSymptomToggle = (symptom) => {
    setBreastForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleFamilyHistoryToggle = (history) => {
    setBreastForm(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.includes(history)
        ? prev.familyHistory.filter(h => h !== history)
        : [...prev.familyHistory, history]
    }));
  };

  const handleLifestyleToggle = (lifestyle) => {
    setBreastForm(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleBreastHealthLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const breastEntry = {
        ...breastForm,
        timestamp: new Date().toISOString(),
        moduleType: 'breast-health',
        userId: user?.id
      };
      
      // Save to localStorage
      const updatedData = [...breastData, breastEntry];
      setBreastData(updatedData);
      localStorage.setItem('afabBreastHealthData', JSON.stringify(updatedData));
      
      // Update next screening date if screening was logged
      if (breastEntry.screeningType && breastEntry.screeningDate) {
        const nextDate = new Date(breastEntry.screeningDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        setNextScreening(nextDate);
      }
      
      // Generate AI insights
      const prompt = `As an expert in breast health and cancer prevention, analyze this breast health data and provide personalized insights:

User Profile: ${JSON.stringify(user)}
Latest Breast Health Data: ${JSON.stringify(breastEntry)}
Next Screening: ${nextScreening ? nextScreening.toDateString() : 'Not scheduled'}
Historical Data: ${JSON.stringify(breastData.slice(-3))}

Please provide:
1. Breast health assessment and risk factors
2. Self-exam technique guidance
3. Screening recommendations
4. When to contact healthcare provider
5. Lifestyle modifications for breast health
6. Family history implications

Be medical, accurate, and supportive. Include specific guidance for breast health maintenance and early detection.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      
      // Reset form for next entry
      setBreastForm({
        date: new Date().toISOString().split('T')[0],
        selfExamPerformed: false,
        examFindings: [],
        symptoms: [],
        screeningType: '',
        screeningDate: '',
        screeningResults: '',
        familyHistory: [],
        lifestyle: [],
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging breast health data:', error);
      alert('Error logging breast health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScreeningRecommendations = () => {
    const age = user?.age || 30;
    if (age < 40) {
      return "Clinical breast exams every 1-3 years, mammograms not routinely recommended";
    } else if (age < 50) {
      return "Annual clinical breast exams, mammograms every 1-2 years";
    } else {
      return "Annual mammograms and clinical breast exams";
    }
  };

  return (
    <div className="breast-health-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🌸 Breast Health Tracker</h1>
        <p>Monitor breast health, track screenings, and maintain early detection</p>
      </div>

      <div className="breast-health-content">
        {/* Breast Health Overview */}
        <div className="breast-health-overview">
          <div className="overview-card">
            <h3>📅 Next Screening</h3>
            <p className="screening-display">
              {nextScreening ? formatDate(nextScreening) : 'Schedule screening'}
            </p>
          </div>
          
          <div className="overview-card">
            <h3>📊 Tracking History</h3>
            <p className="count-display">{breastData.length} entries logged</p>
          </div>
          
          <div className="overview-card">
            <h3>💪 Health Status</h3>
            <p className="status-display">Monitoring active</p>
          </div>
        </div>

        {/* Breast Health Logging Form */}
        <div className="breast-health-form-section">
          <h2>Log Your Breast Health Data</h2>
          <form onSubmit={handleBreastHealthLog} className="breast-health-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={breastForm.date}
                  onChange={(e) => setBreastForm({...breastForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Self-Exam Performed</label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={breastForm.selfExamPerformed}
                      onChange={(e) => setBreastForm({...breastForm, selfExamPerformed: e.target.checked})}
                    />
                    <span>Yes, I performed a self-exam</span>
                  </label>
                </div>
              </div>
            </div>

            {breastForm.selfExamPerformed && (
              <div className="form-group">
                <label>Self-Exam Findings</label>
                <div className="findings-grid">
                  {examFindings.map(finding => (
                    <label key={finding} className="finding-option">
                      <input
                        type="checkbox"
                        checked={breastForm.examFindings.includes(finding)}
                        onChange={() => handleFindingToggle(finding)}
                      />
                      <span className="finding-label">{finding}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Breast Health Symptoms</label>
              <div className="symptoms-grid">
                {breastSymptoms.map(symptom => (
                  <label key={symptom} className="symptom-option">
                    <input
                      type="checkbox"
                      checked={breastForm.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="symptom-label">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Screening Type</label>
                <select
                  value={breastForm.screeningType}
                  onChange={(e) => setBreastForm({...breastForm, screeningType: e.target.value})}
                >
                  <option value="">Select screening type</option>
                  <option value="mammogram">Mammogram</option>
                  <option value="clinical-exam">Clinical Breast Exam</option>
                  <option value="ultrasound">Breast Ultrasound</option>
                  <option value="MRI">Breast MRI</option>
                  <option value="biopsy">Biopsy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Screening Date</label>
                <input
                  type="date"
                  value={breastForm.screeningDate}
                  onChange={(e) => setBreastForm({...breastForm, screeningDate: e.target.value})}
                />
              </div>
            </div>

            {breastForm.screeningType && (
              <div className="form-group">
                <label>Screening Results</label>
                <select
                  value={breastForm.screeningResults}
                  onChange={(e) => setBreastForm({...breastForm, screeningResults: e.target.value})}
                >
                  <option value="">Select results</option>
                  <option value="normal">Normal/Negative</option>
                  <option value="abnormal">Abnormal - Follow-up needed</option>
                  <option value="suspicious">Suspicious - Further testing</option>
                  <option value="benign">Benign (non-cancerous)</option>
                  <option value="malignant">Malignant (cancerous)</option>
                  <option value="pending">Results pending</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Family History</label>
              <div className="family-history-grid">
                {familyHistoryOptions.map(history => (
                  <label key={history} className="history-option">
                    <input
                      type="checkbox"
                      checked={breastForm.familyHistory.includes(history)}
                      onChange={() => handleFamilyHistoryToggle(history)}
                    />
                    <span className="history-label">{history}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Lifestyle Factors</label>
              <div className="lifestyle-grid">
                {lifestyleFactors.map(lifestyle => (
                  <label key={lifestyle} className="lifestyle-option">
                    <input
                      type="checkbox"
                      checked={breastForm.lifestyle.includes(lifestyle)}
                      onChange={() => handleLifestyleToggle(lifestyle)}
                    />
                    <span className="lifestyle-label">{lifestyle}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={breastForm.notes}
                onChange={(e) => setBreastForm({...breastForm, notes: e.target.value})}
                placeholder="Any additional notes about your breast health, concerns, or questions for your healthcare provider..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Log Breast Health Data'}
            </button>
          </form>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="insights-section">
            <h2>🤖 AI Breast Health Insights</h2>
            <div className="insights-content">
              {insights}
            </div>
          </div>
        )}

        {/* Breast Health History */}
        {breastData.length > 0 && (
          <div className="breast-health-history">
            <h2>📈 Breast Health History</h2>
            <div className="history-list">
              {breastData.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    {entry.selfExamPerformed && <span>Self-exam: ✓</span>}
                    {entry.screeningType && <span>Screening: {entry.screeningType}</span>}
                    {entry.screeningResults && <span>Results: {entry.screeningResults}</span>}
                    {entry.symptoms.length > 0 && (
                      <span>Symptoms: {entry.symptoms.length}</span>
                    )}
                    {entry.examFindings.length > 0 && (
                      <span>Findings: {entry.examFindings.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Guidelines */}
        <div className="screening-guidelines">
          <h2>📚 Screening Guidelines</h2>
          <div className="guidelines-content">
            <div className="guideline-card">
              <h3>🎯 Current Recommendations</h3>
              <p>{getScreeningRecommendations()}</p>
            </div>
            
            <div className="guideline-card">
              <h3>🔍 Self-Exam Guide</h3>
              <ul>
                <li>Perform monthly, 3-5 days after your period ends</li>
                <li>Look for changes in size, shape, or appearance</li>
                <li>Feel for lumps, thickening, or changes in texture</li>
                <li>Check for nipple discharge or changes</li>
                <li>Report any changes to your healthcare provider</li>
              </ul>
            </div>
            
            <div className="guideline-card">
              <h3>⚠️ When to See a Doctor</h3>
              <ul>
                <li>New lump or mass in breast or underarm</li>
                <li>Changes in breast size, shape, or appearance</li>
                <li>Nipple discharge (especially bloody)</li>
                <li>Persistent breast or nipple pain</li>
                <li>Skin changes (dimpling, redness, scaling)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreastHealth;
