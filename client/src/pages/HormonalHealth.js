import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AMABAIService from '../ai/amabAIService';
import {
  AdvancedLineChart,
  AdvancedBarChart,
  AdvancedDoughnutChart,
  HealthScoreGauge,
  TrendIndicator
} from '../components/visualizations/AdvancedHealthCharts';
import './HormonalHealth.css';

const HormonalHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize AMAB AI Service
  const [aiService] = useState(() => new AMABAIService());
  
  // Helper function to safely parse numbers
  const safeParseNumber = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  
  const safeParseInt = (value, defaultValue = 0) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [savedInsights, setSavedInsights] = useState([]);
  const [showSavedInsights, setShowSavedInsights] = useState(false);
  const [hormonalData, setHormonalData] = useState([]);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  
  const [hormonalForm, setHormonalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    
    // Energy & Vitality
    tiredAfterSleep: false,
    afternoonCrashes: false,
    brainFog: false,
    energyLevel: 5, // 1-10 scale
    
    // Sexual Function & Libido
    libidoDecline: false,
    morningErections: 0, // times per week
    erectionDifficulty: false,
    sexualSatisfaction: 5, // 1-10 scale
    
    // Physical Changes
    bellyFatIncrease: false,
    muscleMassReduction: false,
    hairLoss: false,
    temperatureSensitivity: 'normal', // normal, cold, hot
    
    // Mood & Mental Health
    moodSwings: false,
    irritability: 5, // 1-10 scale
    anxiety: 5, // 1-10 scale
    depression: 5, // 1-10 scale
    
    // Sleep & Recovery
    sleepQuality: 5, // 1-10 scale
    sleepDuration: 7.5, // hours
    sleepInterruptions: 0, // times per night
    
    // Lifestyle Factors
    exerciseFrequency: 'moderate', // low, moderate, high
    stressLevel: 5, // 1-10 scale
    alcoholConsumption: 0, // drinks per week
    smokingStatus: 'never', // never, former, current
    
    // Additional Information
    notes: ''
  });

  // Load saved insights from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hormonalHealthInsights');
    if (saved) {
      setSavedInsights(JSON.parse(saved));
    }
  }, []);

  // Save insights functionality
  const saveInsights = (insights) => {
    const newInsight = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      insights: insights,
      healthData: hormonalData[0] // Save the latest health data for context
    };
    
    const updatedInsights = [newInsight, ...savedInsights];
    setSavedInsights(updatedInsights);
    localStorage.setItem('hormonalHealthInsights', JSON.stringify(updatedInsights));
    console.log('💾 Insights saved:', newInsight);
  };

  // Delete insights functionality
  const deleteInsights = (insightId) => {
    const updatedInsights = savedInsights.filter(insight => insight.id !== insightId);
    setSavedInsights(updatedInsights);
    localStorage.setItem('hormonalHealthInsights', JSON.stringify(updatedInsights));
    console.log('🗑️ Insight deleted:', insightId);
  };

  // Parse AI insights into themed boxes
  const parseInsightsIntoBoxes = (insights) => {
    const lines = insights.split('\n').filter(line => line.trim());
    const boxes = [];
    
    let currentBox = null;
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check for section headers
      if (trimmedLine.includes('**HORMONAL STATUS**') || trimmedLine.includes('HORMONAL STATUS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'hormonal-status',
          title: '📊 Hormonal Status',
          content: '',
          icon: '📊',
          hasScoring: true
        };
      } else if (trimmedLine.includes('**PREDICTIONS**') || trimmedLine.includes('PREDICTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'predictions',
          title: '🔮 Predictions',
          content: '',
          icon: '🔮'
        };
      } else if (trimmedLine.includes('**ACTIONS**') || trimmedLine.includes('ACTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'actions',
          title: '💡 Actions',
          content: '',
          icon: '💡',
          hasPriorities: true
        };
      } else if (trimmedLine.includes('**INSIGHTS**') || trimmedLine.includes('INSIGHTS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'insights',
          title: '🧠 Insights',
          content: '',
          icon: '🧠'
        };
      } else if (trimmedLine.includes('**HEALTH NUGGET**') || trimmedLine.includes('HEALTH NUGGET:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = {
          type: 'health-nugget',
          title: '✨ Health Nugget',
          content: '',
          icon: '✨',
          isNugget: true
        };
      } else if (currentBox && trimmedLine && !trimmedLine.startsWith('**')) {
        // Add content to current box
        if (currentBox.content) {
          currentBox.content += '\n' + trimmedLine;
        } else {
          currentBox.content = trimmedLine;
        }
      }
    });
    
    // Add the last box
    if (currentBox) boxes.push(currentBox);
    
    return boxes.map((box, index) => (
      <div key={index} className={`insight-box ${box.type}`}>
        <div className="insight-box-header">
          <span className="insight-icon">{box.icon}</span>
          <h3>{box.title}</h3>
        </div>
        <div className="insight-box-content">
          {box.isNugget ? (
            <div className="health-nugget">
              <p>{box.content}</p>
            </div>
          ) : box.hasScoring ? (
            <div className="enhanced-content">
              {box.content.split('\n').map((line, lineIndex) => {
                if (line.includes('Energy:') || line.includes('Libido:') || line.includes('Physical:') || line.includes('Index:')) {
                  return (
                    <div key={lineIndex} className="enhanced-line">
                      <span className="enhanced-label">{line.split(':')[0]}:</span>
                      <span className="enhanced-value">{line.split(':')[1]}</span>
                    </div>
                  );
                }
                return <div key={lineIndex} className="enhanced-text">{line}</div>;
              })}
            </div>
          ) : box.hasPriorities ? (
            <div className="prioritized-actions">
              {box.content.split('\n').map((line, lineIndex) => {
                if (line.includes('🔴') || line.includes('🟡') || line.includes('🟢')) {
                  const priority = line.includes('🔴') ? 'high' : line.includes('🟡') ? 'medium' : 'low';
                  return (
                    <div key={lineIndex} className={`action-item priority-${priority}`}>
                      <span className="priority-icon">
                        {line.includes('🔴') ? '🔴' : line.includes('🟡') ? '🟡' : '🟢'}
                      </span>
                      <span className="action-text">{line.replace(/[🔴🟡🟢]\s*/, '')}</span>
                    </div>
                  );
                }
                return <div key={lineIndex} className="enhanced-text">{line}</div>;
              })}
            </div>
          ) : (
            <div className="enhanced-content">
              {box.content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="enhanced-text">{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    ));
  };

  // Calculate Hormonal Balance Index
  const calculateHormonalBalanceIndex = (data) => {
    if (data.length === 0) return 0;
    
    const latest = data[data.length - 1];
    
    // Hormonal health factors with weights
    const factors = {
      energy: {
        weight: 0.25,
        score: Math.max(0, (10 - (latest.tiredAfterSleep ? 3 : 0) - (latest.afternoonCrashes ? 2 : 0) - (latest.brainFog ? 2 : 0) - (10 - (latest.energyLevel || 5))) / 10),
        impact: 'Energy levels reflect overall hormonal balance'
      },
      sexual: {
        weight: 0.20,
        score: Math.max(0, ((latest.morningErections || 0) / 7) + ((latest.sexualSatisfaction || 5) / 10) - (latest.libidoDecline ? 0.3 : 0) - (latest.erectionDifficulty ? 0.3 : 0)),
        impact: 'Sexual function indicates testosterone levels'
      },
      physical: {
        weight: 0.20,
        score: Math.max(0, (10 - (latest.bellyFatIncrease ? 3 : 0) - (latest.muscleMassReduction ? 3 : 0) - (latest.hairLoss ? 2 : 0) - (latest.temperatureSensitivity !== 'normal' ? 1 : 0)) / 10),
        impact: 'Physical changes reflect hormonal shifts'
      },
      mood: {
        weight: 0.15,
        score: Math.max(0, (30 - (latest.irritability || 5) - (latest.anxiety || 5) - (latest.depression || 5) - (latest.moodSwings ? 3 : 0)) / 30),
        impact: 'Mood stability indicates hormonal equilibrium'
      },
      sleep: {
        weight: 0.10,
        score: Math.min(1, ((latest.sleepQuality || 5) / 10) + ((latest.sleepDuration || 7.5) / 8) - ((latest.sleepInterruptions || 0) / 10)),
        impact: 'Sleep quality affects hormone production'
      },
      lifestyle: {
        weight: 0.10,
        score: Math.max(0, (10 - (latest.stressLevel || 5) - (latest.alcoholConsumption > 3 ? 2 : latest.alcoholConsumption * 0.3) - (latest.smokingStatus === 'current' ? 3 : latest.smokingStatus === 'former' ? 1 : 0)) / 10),
        impact: 'Lifestyle factors influence hormonal health'
      }
    };
    
    const totalScore = Object.keys(factors).reduce((total, key) => {
      return total + (factors[key].score * factors[key].weight);
    }, 0);
    
    return Math.round(totalScore * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const hormonalEntry = {
        ...hormonalForm,
        timestamp: new Date().toISOString()
      };
      
      const updatedData = [...hormonalData, hormonalEntry];
      setHormonalData(updatedData);

      const hormonalIndex = calculateHormonalBalanceIndex(updatedData);
      
      // Generate AI insights using the AI service
      const prompt = `Analyze hormonal health data for 30-year-old male:

ENERGY & VITALITY:
- Tired after sleep: ${hormonalForm.tiredAfterSleep ? 'Yes' : 'No'}
- Afternoon crashes: ${hormonalForm.afternoonCrashes ? 'Yes' : 'No'}
- Brain fog: ${hormonalForm.brainFog ? 'Yes' : 'No'}
- Energy level: ${hormonalForm.energyLevel}/10

SEXUAL FUNCTION & LIBIDO:
- Libido decline: ${hormonalForm.libidoDecline ? 'Yes' : 'No'}
- Morning erections: ${hormonalForm.morningErections} times/week
- Erection difficulty: ${hormonalForm.erectionDifficulty ? 'Yes' : 'No'}
- Sexual satisfaction: ${hormonalForm.sexualSatisfaction}/10

PHYSICAL CHANGES:
- Belly fat increase: ${hormonalForm.bellyFatIncrease ? 'Yes' : 'No'}
- Muscle mass reduction: ${hormonalForm.muscleMassReduction ? 'Yes' : 'No'}
- Hair loss: ${hormonalForm.hairLoss ? 'Yes' : 'No'}
- Temperature sensitivity: ${hormonalForm.temperatureSensitivity}

MOOD & MENTAL HEALTH:
- Mood swings: ${hormonalForm.moodSwings ? 'Yes' : 'No'}
- Irritability: ${hormonalForm.irritability}/10
- Anxiety: ${hormonalForm.anxiety}/10
- Depression: ${hormonalForm.depression}/10

SLEEP & RECOVERY:
- Sleep quality: ${hormonalForm.sleepQuality}/10
- Sleep duration: ${hormonalForm.sleepDuration} hours
- Sleep interruptions: ${hormonalForm.sleepInterruptions} times/night

LIFESTYLE FACTORS:
- Exercise frequency: ${hormonalForm.exerciseFrequency}
- Stress level: ${hormonalForm.stressLevel}/10
- Alcohol consumption: ${hormonalForm.alcoholConsumption} drinks/week
- Smoking status: ${hormonalForm.smokingStatus}

CALCULATED HORMONAL BALANCE INDEX: ${hormonalIndex}%

Provide comprehensive hormonal health analysis in this EXACT format:

**HORMONAL STATUS** (Current hormonal health assessment with context & scoring)
- Energy: ${hormonalForm.tiredAfterSleep || hormonalForm.afternoonCrashes ? 'Concerning' : 'Good'} (${hormonalForm.energyLevel}/10) – ${hormonalForm.tiredAfterSleep ? 'Fatigue after sleep may indicate cortisol or thyroid issues' : ''}${hormonalForm.afternoonCrashes ? 'Afternoon crashes suggest blood sugar or cortisol imbalance' : ''}${hormonalForm.brainFog ? 'Brain fog may indicate hormonal or nutrient deficiencies' : ''}
- Libido: ${hormonalForm.libidoDecline || hormonalForm.morningErections < 3 ? 'Concerning' : 'Good'} (${hormonalForm.morningErections}/7 week) – ${hormonalForm.libidoDecline ? 'Declining libido may indicate low testosterone' : ''}${hormonalForm.morningErections < 3 ? 'Few morning erections suggest testosterone deficiency' : ''}${hormonalForm.erectionDifficulty ? 'Erection difficulties may indicate vascular or hormonal issues' : ''}
- Physical: ${hormonalForm.bellyFatIncrease || hormonalForm.muscleMassReduction ? 'Concerning' : 'Good'} – ${hormonalForm.bellyFatIncrease ? 'Increased belly fat may indicate cortisol imbalance' : ''}${hormonalForm.muscleMassReduction ? 'Muscle mass loss suggests low testosterone' : ''}${hormonalForm.hairLoss ? 'Hair loss may indicate DHT or thyroid issues' : ''}${hormonalForm.temperatureSensitivity !== 'normal' ? 'Temperature sensitivity may indicate thyroid dysfunction' : ''}
- Hormonal Balance Index: ${hormonalIndex}% (overall hormonal health)

**PREDICTIONS** (Realistic hormonal outlook)
Short-Term (1-2 weeks): ${hormonalForm.sleepDuration < 6 ? 'Poor sleep will continue disrupting hormone production and recovery' : 'Good sleep supports optimal hormone production and recovery'}
Long-Term (3-6 months): ${hormonalForm.stressLevel > 7 ? 'High stress will continue elevating cortisol and suppressing testosterone' : hormonalForm.exerciseFrequency === 'low' ? 'Low exercise will continue reducing testosterone and growth hormone' : 'Current lifestyle factors support healthy hormone balance'}
Lifestyle Impact: ${hormonalForm.alcoholConsumption > 3 ? 'High alcohol consumption will continue disrupting hormone production and liver function' : 'Alcohol consumption supports healthy hormone metabolism'}

**ACTIONS** (Personalized priority-based hormonal recommendations)
🔴 High Priority: ${hormonalForm.morningErections < 3 ? 'Testosterone evaluation → Consult endocrinologist to check testosterone levels and rule out hypogonadism' : hormonalForm.tiredAfterSleep ? 'Sleep optimization → Improve sleep hygiene and consider sleep study for sleep apnea' : hormonalForm.stressLevel > 7 ? 'Stress management → Implement daily stress reduction techniques (meditation, deep breathing)' : 'Maintain current healthy lifestyle practices'}
🟡 Medium Priority: ${hormonalForm.exerciseFrequency === 'low' ? 'Exercise enhancement → Add strength training 3x/week to boost testosterone and growth hormone' : hormonalForm.bellyFatIncrease ? 'Weight management → Focus on reducing belly fat through diet and exercise to improve insulin sensitivity' : 'Continue current fitness and nutrition habits'}
🟢 Low Priority: ${hormonalForm.alcoholConsumption > 3 ? 'Alcohol moderation → Reduce to <3 drinks/week to support liver function and hormone production' : hormonalForm.hairLoss ? 'Hair health → Consider DHT-blocking supplements or consult dermatologist' : 'Maintain current healthy lifestyle choices'}

**INSIGHTS** (Clear cause-effect hormonal relationships)
- ${hormonalForm.morningErections < 3 ? 'Low morning erections → Indicates testosterone deficiency → Affects libido, energy, and muscle mass' : 'Morning erection frequency supports healthy testosterone levels'}
- ${hormonalForm.stressLevel > 7 ? 'High stress → Increases cortisol → Suppresses testosterone → Reduces energy and libido' : 'Stress levels support healthy hormone balance'}
- ${hormonalForm.sleepDuration < 6 ? 'Poor sleep → Disrupts growth hormone and testosterone production → Affects recovery and energy' : 'Sleep patterns support optimal hormone production'}
- ${hormonalForm.bellyFatIncrease ? 'Increased belly fat → Indicates insulin resistance → May affect testosterone and growth hormone' : 'Body composition supports healthy hormone levels'}

**HEALTH NUGGET** (Relatable and motivating evidence-based hormonal tip)
💡 ${hormonalForm.morningErections < 3 ? 'Men who get 7-8 hours of quality sleep see up to 15% increase in testosterone levels within 2-4 weeks' : hormonalForm.stressLevel > 7 ? 'Just 10 minutes of daily meditation can reduce cortisol by 25% and improve testosterone production' : 'Strength training 3x/week increases testosterone by up to 20% and improves morning erection frequency'}

Focus on hormonal optimization, testosterone health, and endocrine balance. Keep under 350 words.`;

      const aiInsights = await aiService.generateHealthInsights(prompt);
      setInsights(aiInsights);
      setDataRefreshKey(prev => prev + 1);
      resetForm();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback analysis
      const hormonalIndex = calculateHormonalBalanceIndex([...hormonalData, {...hormonalForm, timestamp: new Date().toISOString()}]);
      const fallbackInsights = `**HORMONAL STATUS** (Current hormonal health assessment with context & scoring)
- Energy: ${hormonalForm.tiredAfterSleep || hormonalForm.afternoonCrashes ? 'Concerning' : 'Good'} (${hormonalForm.energyLevel}/10) – ${hormonalForm.tiredAfterSleep ? 'Fatigue after sleep may indicate cortisol or thyroid issues' : ''}${hormonalForm.afternoonCrashes ? 'Afternoon crashes suggest blood sugar or cortisol imbalance' : ''}
- Libido: ${hormonalForm.libidoDecline || hormonalForm.morningErections < 3 ? 'Concerning' : 'Good'} (${hormonalForm.morningErections}/7 week) – ${hormonalForm.libidoDecline ? 'Declining libido may indicate low testosterone' : ''}${hormonalForm.morningErections < 3 ? 'Few morning erections suggest testosterone deficiency' : ''}
- Physical: ${hormonalForm.bellyFatIncrease || hormonalForm.muscleMassReduction ? 'Concerning' : 'Good'} – ${hormonalForm.bellyFatIncrease ? 'Increased belly fat may indicate cortisol imbalance' : ''}${hormonalForm.muscleMassReduction ? 'Muscle mass loss suggests low testosterone' : ''}
- Hormonal Balance Index: ${hormonalIndex}% (overall hormonal health)

**PREDICTIONS** (Realistic hormonal outlook)
Short-Term (1-2 weeks): ${hormonalForm.sleepDuration < 6 ? 'Poor sleep will continue disrupting hormone production' : 'Good sleep supports optimal hormone production'}
Long-Term (3-6 months): ${hormonalForm.stressLevel > 7 ? 'High stress will continue elevating cortisol and suppressing testosterone' : 'Current lifestyle factors support healthy hormone balance'}

**ACTIONS** (Personalized priority-based hormonal recommendations)
🔴 High Priority: ${hormonalForm.morningErections < 3 ? 'Testosterone evaluation → Consult endocrinologist to check testosterone levels' : hormonalForm.stressLevel > 7 ? 'Stress management → Implement daily stress reduction techniques' : 'Maintain current healthy lifestyle practices'}
🟡 Medium Priority: ${hormonalForm.exerciseFrequency === 'low' ? 'Exercise enhancement → Add strength training 3x/week to boost testosterone' : 'Continue current fitness habits'}

**INSIGHTS** (Clear cause-effect hormonal relationships)
- ${hormonalForm.morningErections < 3 ? 'Low morning erections → Indicates testosterone deficiency → Affects libido, energy, and muscle mass' : 'Morning erection frequency supports healthy testosterone levels'}
- ${hormonalForm.stressLevel > 7 ? 'High stress → Increases cortisol → Suppresses testosterone → Reduces energy and libido' : 'Stress levels support healthy hormone balance'}

**HEALTH NUGGET** (Relatable and motivating evidence-based hormonal tip)
💡 Men who get 7-8 hours of quality sleep see up to 15% increase in testosterone levels within 2-4 weeks`;
      setInsights(fallbackInsights);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setHormonalForm({
      date: new Date().toISOString().split('T')[0],
      
      // Energy & Vitality
      tiredAfterSleep: false,
      afternoonCrashes: false,
      brainFog: false,
      energyLevel: 5,
      
      // Sexual Function & Libido
      libidoDecline: false,
      morningErections: 0,
      erectionDifficulty: false,
      sexualSatisfaction: 5,
      
      // Physical Changes
      bellyFatIncrease: false,
      muscleMassReduction: false,
      hairLoss: false,
      temperatureSensitivity: 'normal',
      
      // Mood & Mental Health
      moodSwings: false,
      irritability: 5,
      anxiety: 5,
      depression: 5,
      
      // Sleep & Recovery
      sleepQuality: 5,
      sleepDuration: 7.5,
      sleepInterruptions: 0,
      
      // Lifestyle Factors
      exerciseFrequency: 'moderate',
      stressLevel: 5,
      alcoholConsumption: 0,
      smokingStatus: 'never',
      
      // Additional Information
      notes: ''
    });
  };

  return (
    <div className="hormonal-health-container">
      <div className="hormonal-health-content">
      <div className="page-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>⚡ Hormonal Health</h1>
          <p>Track and optimize your hormonal balance for peak performance</p>
      </div>
        <div className="health-form-section">
          <h2>Log Your Hormonal Health Data</h2>
          <form onSubmit={handleSubmit} className="health-form">
            
            {/* Date */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={hormonalForm.date}
                  onChange={(e) => setHormonalForm({...hormonalForm, date: e.target.value})}
                  title="Date of this health entry"
                />
          </div>
          </div>
          
            {/* Energy & Vitality */}
            <div className="question-box energy-vitality">
              <div className="form-section-header">
                <h3>⚡ Energy & Vitality</h3>
          </div>
          
            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.tiredAfterSleep}
                      onChange={(e) => setHormonalForm({...hormonalForm, tiredAfterSleep: e.target.checked})}
                    />
                    <span>Do you often feel tired even after a good night's sleep?</span>
                  </label>
          </div>
        </div>

            <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
              <input
                      type="checkbox"
                      checked={hormonalForm.afternoonCrashes}
                      onChange={(e) => setHormonalForm({...hormonalForm, afternoonCrashes: e.target.checked})}
                    />
                    <span>Do you experience afternoon crashes or brain fog?</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.brainFog}
                      onChange={(e) => setHormonalForm({...hormonalForm, brainFog: e.target.checked})}
                    />
                    <span>Do you experience brain fog or mental fatigue?</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="energy-level">Overall Energy Level (1-10)</label>
                <input
                  id="energy-level"
                  name="energy-level"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.energyLevel}
                  onChange={(e) => setHormonalForm({...hormonalForm, energyLevel: safeParseInt(e.target.value, 5)})}
                  title="Rate your overall energy level"
                />
              </div>
            </div>
            </div>

            {/* Sexual Function & Libido */}
            <div className="question-box sexual-function">
              <div className="form-section-header">
                <h3>💕 Sexual Function & Libido</h3>
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.libidoDecline}
                      onChange={(e) => setHormonalForm({...hormonalForm, libidoDecline: e.target.checked})}
                    />
                    <span>Have you noticed a decline in your sexual desire?</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="morning-erections">Morning Erections (per week)</label>
                <input
                  id="morning-erections"
                  name="morning-erections"
                  type="number"
                  min="0"
                  max="7"
                  value={hormonalForm.morningErections}
                  onChange={(e) => setHormonalForm({...hormonalForm, morningErections: safeParseInt(e.target.value, 0)})}
                  title="Do you wake up with morning erections at least 3–4 times a week?"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.erectionDifficulty}
                      onChange={(e) => setHormonalForm({...hormonalForm, erectionDifficulty: e.target.checked})}
                    />
                    <span>Do you have difficulty maintaining erections?</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="sexual-satisfaction">Sexual Satisfaction (1-10)</label>
                <input
                  id="sexual-satisfaction"
                  name="sexual-satisfaction"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.sexualSatisfaction}
                  onChange={(e) => setHormonalForm({...hormonalForm, sexualSatisfaction: safeParseInt(e.target.value, 5)})}
                  title="Rate your sexual satisfaction"
                />
              </div>
            </div>
            </div>

            {/* Physical Changes */}
            <div className="question-box physical-changes">
              <div className="form-section-header">
                <h3>💪 Physical Changes</h3>
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.bellyFatIncrease}
                      onChange={(e) => setHormonalForm({...hormonalForm, bellyFatIncrease: e.target.checked})}
                    />
                    <span>Have you noticed increased belly fat or reduced muscle mass despite exercise?</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.muscleMassReduction}
                      onChange={(e) => setHormonalForm({...hormonalForm, muscleMassReduction: e.target.checked})}
                    />
                    <span>Have you noticed reduced muscle mass despite exercise?</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.hairLoss}
                      onChange={(e) => setHormonalForm({...hormonalForm, hairLoss: e.target.checked})}
                    />
                    <span>Do you experience unexplained hair loss or thinning?</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="temperature-sensitivity">Temperature Sensitivity</label>
                <select
                  id="temperature-sensitivity"
                  name="temperature-sensitivity"
                  value={hormonalForm.temperatureSensitivity}
                  onChange={(e) => setHormonalForm({...hormonalForm, temperatureSensitivity: e.target.value})}
                  title="Do you feel colder or warmer than usual compared to others?"
                >
                  <option value="normal">Normal</option>
                  <option value="cold">Feel colder than others</option>
                  <option value="hot">Feel warmer than others</option>
                </select>
              </div>
            </div>
            </div>

            {/* Mood & Mental Health */}
            <div className="question-box mood-mental">
              <div className="form-section-header">
                <h3>🧠 Mood & Mental Health</h3>
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={hormonalForm.moodSwings}
                      onChange={(e) => setHormonalForm({...hormonalForm, moodSwings: e.target.checked})}
                    />
                    <span>Do you experience mood swings or emotional instability?</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="irritability">Irritability Level (1-10)</label>
                <input
                  id="irritability"
                  name="irritability"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.irritability}
                  onChange={(e) => setHormonalForm({...hormonalForm, irritability: safeParseInt(e.target.value, 5)})}
                  title="Rate your irritability level"
                />
              </div>
              <div className="form-group">
                <label htmlFor="anxiety">Anxiety Level (1-10)</label>
                <input
                  id="anxiety"
                  name="anxiety"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.anxiety}
                  onChange={(e) => setHormonalForm({...hormonalForm, anxiety: safeParseInt(e.target.value, 5)})}
                  title="Rate your anxiety level"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="depression">Depression Level (1-10)</label>
                <input
                  id="depression"
                  name="depression"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.depression}
                  onChange={(e) => setHormonalForm({...hormonalForm, depression: safeParseInt(e.target.value, 5)})}
                  title="Rate your depression level"
                />
              </div>
            </div>
            </div>

            {/* Sleep & Recovery */}
            <div className="question-box sleep-recovery">
              <div className="form-section-header">
                <h3>😴 Sleep & Recovery</h3>
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sleep-quality">Sleep Quality (1-10)</label>
                <input
                  id="sleep-quality"
                  name="sleep-quality"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.sleepQuality}
                  onChange={(e) => setHormonalForm({...hormonalForm, sleepQuality: safeParseInt(e.target.value, 5)})}
                  title="Rate your sleep quality"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sleep-duration">Sleep Duration (hours)</label>
                <input
                  id="sleep-duration"
                  name="sleep-duration"
                  type="number"
                  min="0"
                  max="12"
                  step="0.5"
                  value={hormonalForm.sleepDuration}
                  onChange={(e) => setHormonalForm({...hormonalForm, sleepDuration: safeParseNumber(e.target.value, 7.5)})}
                  title="Hours of sleep per night"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sleep-interruptions">Sleep Interruptions (per night)</label>
                <input
                  id="sleep-interruptions"
                  name="sleep-interruptions"
                  type="number"
                  min="0"
                  max="10"
                  value={hormonalForm.sleepInterruptions}
                  onChange={(e) => setHormonalForm({...hormonalForm, sleepInterruptions: safeParseInt(e.target.value, 0)})}
                  title="Number of times you wake up during the night"
                />
              </div>
            </div>
            </div>

            {/* Lifestyle Factors */}
            <div className="question-box lifestyle-factors">
              <div className="form-section-header">
                <h3>🏃 Lifestyle Factors</h3>
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exercise-frequency">Exercise Frequency</label>
                <select
                  id="exercise-frequency"
                  name="exercise-frequency"
                  value={hormonalForm.exerciseFrequency}
                  onChange={(e) => setHormonalForm({...hormonalForm, exerciseFrequency: e.target.value})}
                  title="How often do you exercise?"
                >
                  <option value="low">Low (0-1 times/week)</option>
                  <option value="moderate">Moderate (2-3 times/week)</option>
                  <option value="high">High (4+ times/week)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="stress-level">Stress Level (1-10)</label>
                <input
                  id="stress-level"
                  name="stress-level"
                  type="number"
                  min="1"
                  max="10"
                  value={hormonalForm.stressLevel}
                  onChange={(e) => setHormonalForm({...hormonalForm, stressLevel: safeParseInt(e.target.value, 5)})}
                  title="Rate your stress level"
                />
              </div>
            </div>

            <div className="form-row">
            <div className="form-group">
                <label htmlFor="alcohol-consumption">Alcohol Consumption (drinks/week)</label>
              <input
                  id="alcohol-consumption"
                  name="alcohol-consumption"
                type="number"
                min="0"
                  max="50"
                  value={hormonalForm.alcoholConsumption}
                  onChange={(e) => setHormonalForm({...hormonalForm, alcoholConsumption: safeParseInt(e.target.value, 0)})}
                  title="Number of alcoholic drinks per week"
              />
            </div>
              <div className="form-group">
                <label htmlFor="smoking-status">Smoking Status</label>
                <select
                  id="smoking-status"
                  name="smoking-status"
                  value={hormonalForm.smokingStatus}
                  onChange={(e) => setHormonalForm({...hormonalForm, smokingStatus: e.target.value})}
                  title="Do you smoke or use tobacco?"
                >
                  <option value="never">Never</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
            </div>
            </div>

            {/* Additional Information */}
            <div className="question-box additional-info">
              <div className="form-section-header">
                <h3>📝 Additional Information</h3>
              </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={hormonalForm.notes}
                onChange={(e) => setHormonalForm({...hormonalForm, notes: e.target.value})}
                placeholder="Any additional observations or information..."
                title="Additional notes about your hormonal health"
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Log Hormonal Health Data'}
            </button>
            </div>
          </form>
        </div>

        {/* Compact Health Visualizations */}
        {hormonalData.length > 0 && (
          <div className="compact-visualizations-section" key={`visualizations-${dataRefreshKey}-${hormonalData.length}-${Date.now()}`}>
            <h2>📊 Hormonal Health Overview</h2>
            
            <div className="compact-viz-grid">
              {/* Health Score Gauge */}
              <div className="compact-gauge">
                <HealthScoreGauge 
                  score={calculateHormonalBalanceIndex(hormonalData)} 
                  title="Hormonal Balance Index"
                  height={180}
                />
                    </div>
              
              {/* Current Metrics Bar Chart */}
              <div className="compact-metrics">
                <AdvancedBarChart
                  data={[
                    {
                      label: 'Energy Level',
                      value: parseInt(hormonalData[hormonalData.length - 1]?.energyLevel) || 5,
                      color: '#4ecdc4'
                    },
                    {
                      label: 'Morning Erections',
                      value: parseInt(hormonalData[hormonalData.length - 1]?.morningErections) || 0,
                      color: '#ff6b9d'
                    },
                    {
                      label: 'Sleep Quality',
                      value: parseInt(hormonalData[hormonalData.length - 1]?.sleepQuality) || 5,
                      color: '#4ecdc4'
                    }
                  ]}
                  title="Current Metrics"
                  xLabel=""
                  yLabel=""
                  height={180}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        {insights && (
          <div className="insights-section">
            <div className="insights-header">
              <h2>🤖 AI Hormonal Health Insights</h2>
              <button 
                className="save-insights-btn"
                onClick={() => saveInsights(insights)}
                title="Save these insights for later review"
              >
                💾 Save Insights
              </button>
                  </div>
            
            <div className="insights-content">
              {parseInsightsIntoBoxes(insights)}
            </div>
          </div>
        )}

        {/* Saved Insights - Compact Bar */}
        {savedInsights.length > 0 && (
          <div className="saved-insights-bar">
            <div className="saved-insights-header">
              <div className="saved-insights-info">
                <span className="saved-insights-icon">💾</span>
                <span className="saved-insights-title">Saved Hormonal Health Insights</span>
                <span className="saved-insights-count">({savedInsights.length} saved)</span>
              </div>
              <button 
                className="view-insights-btn"
                onClick={() => setShowSavedInsights(!showSavedInsights)}
              >
                {showSavedInsights ? 'Hide' : 'View'} Insights
              </button>
            </div>
            
            {showSavedInsights && (
              <div className="saved-insights-content">
                <div className="saved-insights-grid">
                  {savedInsights.map((insight) => (
                    <div key={insight.id} className="saved-insight-card">
                      <div className="saved-insight-header">
                        <div className="saved-insight-date">
                          <span className="date">{insight.date}</span>
                          <span className="time">{insight.timestamp}</span>
                        </div>
                        <button 
                          className="delete-insight-btn"
                          onClick={() => deleteInsights(insight.id)}
                          title="Delete this insight"
                        >
                          🗑️
                        </button>
            </div>
                      <div className="saved-insight-content">
                        <p>{insight.insights}</p>
            </div>
            </div>
                  ))}
            </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HormonalHealth;
