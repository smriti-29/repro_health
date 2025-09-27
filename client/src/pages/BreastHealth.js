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
  const [isLoading, setIsLoading] = useState(false);
  const [nextScreening, setNextScreening] = useState(null);

  // AI-Powered Breast Health Intelligence (SAME STRUCTURE AS OTHER MODULES)
  const [insights, setInsights] = useState(null);
  const [breastPatterns, setBreastPatterns] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

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
      
      // Generate comprehensive AI insights (SAME STRUCTURE AS OTHER MODULES)
      const userProfile = {
        age: user?.age || 'Not specified',
        medicalHistory: user?.medicalHistory || [],
        chronicConditions: user?.chronicConditions || [],
        medications: user?.medications || [],
        lifestyle: user?.lifestyle || {}
      };

      try {
        // Force Ollama for demo (same as other modules)
        aiService.service = aiService.fallbackService;
        
        const aiInsights = await aiService.generateBreastHealthInsights(breastEntry, userProfile);
        
        // Parse comprehensive AI insights (same structure as other modules)
        if (aiInsights) {
          setInsights(aiInsights.insights || aiInsights);
          setBreastPatterns(aiInsights.patterns || 'Analyzing your breast health patterns...');
          setHealthAlerts(aiInsights.alerts || []);
          setPersonalizedRecommendations(aiInsights.recommendations || []);
          setRiskAssessment(aiInsights.riskAssessment || 'Evaluating your breast health risk factors...');
        }
      } catch (aiError) {
        console.error('AI insights generation failed:', aiError);
        // Fallback insights
        setInsights(`Based on your breast health data, continue regular self-exams and follow screening guidelines.`);
        setHealthAlerts([]);
        setPersonalizedRecommendations(['Perform monthly self-exams', 'Follow screening guidelines', 'Maintain healthy lifestyle']);
      }
      
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
            <h2>✨ Your Breast Health Insights</h2>
            <div className="insights-content">
              {Array.isArray(insights) ? insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">💡</div>
                  <p className="insight-text">{insight}</p>
                </div>
              )) : (
                <div className="insight-item">
                  <div className="insight-icon">💡</div>
                  <p className="insight-text">{insights}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gentle Health Reminders */}
        {healthAlerts.length > 0 && (
          <div className="health-reminders-section">
            <h2>💝 Gentle Reminders</h2>
            <div className="reminders-list">
              {healthAlerts.map((alert, index) => (
                <div key={index} className="reminder-item">
                  <div className="reminder-icon">🌸</div>
                  <div className="reminder-content">
                    <p className="reminder-text">{alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breast Health Overview */}
        {riskAssessment && (
          <div className="breast-health-section">
            <h2>🌺 Your Breast Health</h2>
            <div className="health-content">
              <div className="health-summary">
                <div className="health-icon">🌱</div>
                <p className="health-text">{typeof riskAssessment === 'string' ? riskAssessment : JSON.stringify(riskAssessment)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Breast Health Patterns */}
        {breastPatterns && (
          <div className="breast-patterns-section">
            <h2>📈 Your Breast Health Patterns</h2>
            <div className="patterns-content">
              <div className="pattern-item">
                <div className="pattern-icon">📊</div>
                <p className="pattern-text">{breastPatterns}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Tips */}
        {personalizedRecommendations && personalizedRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>💝 Personalized Tips for You</h2>
            <div className="recommendations-content">
              <div className="recommendation-item">
                <div className="rec-icon">✨</div>
                <p className="rec-text">{Array.isArray(personalizedRecommendations) ? personalizedRecommendations.join(' • ') : personalizedRecommendations}</p>
              </div>
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

        {/* Educational Resources */}
        <div className="educational-resources">
          <h2>📚 Breast Health Education & Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🔍 Breast Self-Exam Guide</h3>
              <p>Step-by-step guide to performing monthly breast self-exams</p>
              <a href="https://www.acog.org/womens-health/faqs/breast-cancer-screening" target="_blank" rel="noopener noreferrer">
                ACOG: Breast Cancer Screening
              </a>
            </div>
            
            <div className="resource-card">
              <h3>📅 Screening Guidelines</h3>
              <p>Current recommendations for mammograms and clinical exams</p>
              <a href="https://www.mayoclinic.org/tests-procedures/mammogram/about/pac-20384806" target="_blank" rel="noopener noreferrer">
                Mayo Clinic: Mammogram Guide
              </a>
            </div>
            
            <div className="resource-card">
              <h3>⚠️ Warning Signs</h3>
              <p>Know the signs and symptoms of breast cancer</p>
              <a href="https://www.healthline.com/health/breast-cancer/signs-and-symptoms" target="_blank" rel="noopener noreferrer">
                Healthline: Breast Cancer Symptoms
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧬 Risk Factors</h3>
              <p>Understanding your personal risk factors for breast cancer</p>
              <a href="https://www.webmd.com/breast-cancer/guide/breast-cancer-risk-factors" target="_blank" rel="noopener noreferrer">
                WebMD: Breast Cancer Risk Factors
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🏃‍♀️ Prevention & Lifestyle</h3>
              <p>Lifestyle changes to reduce breast cancer risk</p>
              <a href="https://www.asrm.org/topics/topics-index/breast-health/" target="_blank" rel="noopener noreferrer">
                ASRM: Breast Health
              </a>
            </div>
            
            <div className="resource-card">
              <h3>🧘 Mental Health & Support</h3>
              <p>Managing anxiety and finding support for breast health concerns</p>
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4447118/" target="_blank" rel="noopener noreferrer">
                Research: Breast Health & Mental Health
              </a>
            </div>
          </div>
        </div>

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
