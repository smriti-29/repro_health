import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const Onboarding = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Profile
    fullName: '',
    dateOfBirth: '',
    age: '',
    genderIdentity: '',
    pronouns: '',
    sexAssignedAtBirth: '',
    countryOfResidence: '',
    preferredLanguage: 'English',
    
    // Step 2: Anatomy & Transition
    reproductiveAnatomy: [],
    reproductiveSurgeries: '',
    reproductiveSurgeriesList: [],
    hormoneTherapy: '',
    hormoneTherapyList: [],
    hormoneTherapyDetails: '',
    
    // Step 3: Medical Background
    height: '',
    weight: '',
    allergies: '',
    currentMedications: '',
    chronicConditions: [],
    pastSurgeries: '',
    familyHistory: {
      womensConditions: [],
      mensConditions: [],
      generalConditions: [],
      cancerTypes: ''
    },
    vaccinationHistory: {
      hpv: '',
      hepatitisB: '',
      rubellaVaricella: ''
    },
    
    // Step 4: Lifestyle Factors
    diet: '',
    supplements: '',
    alcoholUse: '',
    tobaccoUse: '',
    recreationalDrugs: '',
    exerciseFrequency: '',
    sleepQuality: '',
    stressLevel: '',
    
    // Step 5: Mental & Emotional Health
    mentalHealthStatus: '',
    mentalHealthDiagnosis: '',
    mentalHealthConditions: [],
    mentalHealthTreatment: '',
    psychiatricMedications: [],
    mentalHealthImpact: '',
    moodChanges: '',
    moodChangesDetails: '',
    traumaHistory: '',
    genderDysphoria: '',
    
    // Step 6: Sexual & Relationship Health
    sexualOrientation: '',
    relationshipStatus: '',
    isSexuallyActive: '',
    partnerTypes: [],
    protectionUsed: '',
    protectionTypes: [],
    stiHistory: '',
    stiTypes: [],
    stiHistoryDetails: '',
    sexualHealthConcerns: [],
    
    // Step 7: Reproductive Health (Branching)
    reproductiveHealth: {
      // AFAB specific
      ageAtFirstPeriod: '',
      cycleRegularity: '',
      cycleLength: '',
      flowIntensity: '',
      painfulPeriods: '',
      pmsPmdd: '',
      currentStatus: [],
      contraceptionUse: '',
      pastPregnancies: '',
      pregnancyComplications: '',
      lastPapSmear: '',
      
      // AMAB specific
      pubertyHistory: '',
      fertilityConcerns: '',
      sexualHealthConcerns: '',
      prostateHealth: '',
      lastProstateScreening: '',
      
      // Trans/Intersex specific
      hormoneTherapyHistory: '',
      surgeriesUndergone: '',
      menstruationChanges: '',
      fertilityPreservation: '',
      dysphoriaConcerns: ''
    },
    
    // Step 8: Preventive Care & Screenings
    screenings: {
      papSmear: '',
      mammogram: '',
      pelvicUltrasound: '',
      testicularExam: '',
      prostateScreening: '',
      stiScreening: '',
      hormonePanel: '',
      hormoneMonitoring: '',
      boneDensity: '',
      healthCheckup: ''
    },
    hasPrimaryCare: '',
    
    // Step 9: Current Concerns
    currentConcerns: [],
    otherConcerns: '',
    
    // Step 10: Goals & Expectations
    goals: [],
    goalsDescription: '',
    
    // Step 11: Consent
    personalizedRecommendations: false,
    dataSharing: false,
    notifications: true,
    emergencyContact: false,
    communicationPreferences: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load pending registration data
  useEffect(() => {
    const pendingData = localStorage.getItem('pendingRegistration');
    if (pendingData) {
      const parsedData = JSON.parse(pendingData);
      console.log('📥 Loading pending registration data:', parsedData);
      console.log('📥 Password included:', !!parsedData.password);
      setFormData(prev => ({
        ...prev,
        ...parsedData
      }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user inputs
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };



  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.genderIdentity) newErrors.genderIdentity = 'Gender identity is required';
        if (!formData.pronouns) newErrors.pronouns = 'Pronouns are required';
        if (!formData.sexAssignedAtBirth) newErrors.sexAssignedAtBirth = 'Sex assigned at birth is required';
        if (!formData.countryOfResidence) newErrors.countryOfResidence = 'Country of residence is required';
        break;
        
      case 2:
        if (formData.reproductiveAnatomy.length === 0) newErrors.reproductiveAnatomy = 'Please select at least one option';
        break;
        
      case 3:
        if (!formData.height) newErrors.height = 'Height is required';
        if (!formData.weight) newErrors.weight = 'Weight is required';
        break;
        
      case 4:
        if (!formData.diet) newErrors.diet = 'Diet is required';
        if (!formData.alcoholUse) newErrors.alcoholUse = 'Alcohol use is required';
        if (!formData.tobaccoUse) newErrors.tobaccoUse = 'Tobacco use is required';
        if (!formData.exerciseFrequency) newErrors.exerciseFrequency = 'Exercise frequency is required';
        if (!formData.sleepQuality) newErrors.sleepQuality = 'Sleep quality is required';
        if (!formData.stressLevel) newErrors.stressLevel = 'Stress level is required';
        break;
        
      case 5:
        if (!formData.mentalHealthStatus) newErrors.mentalHealthStatus = 'Mental health status is required';
        break;
        
      case 6:
        if (!formData.isSexuallyActive) newErrors.isSexuallyActive = 'Please indicate if you are sexually active';
        break;
        
      case 9:
        if (formData.currentConcerns.length === 0) newErrors.currentConcerns = 'Please select at least one concern';
        break;
        
      case 10:
        if (formData.goals.length === 0) newErrors.goals = 'Please select at least one goal';
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 11) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create user account with onboarding data
      const userData = {
        ...formData,
        onboardingCompleted: true
      };
      
      // Save user credentials to localStorage for login
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        _id: 'user-' + Date.now(),
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        genderIdentity: formData.genderIdentity,
        pronouns: formData.pronouns,
        sexAssignedAtBirth: formData.sexAssignedAtBirth,
        reproductiveAnatomy: formData.reproductiveAnatomy,
        countryOfResidence: formData.countryOfResidence,
        phone: formData.phone || '',
        emergencyContact: formData.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        },
        // Include all onboarding data
        chronicConditions: formData.chronicConditions || [],
        medications: formData.medications || '',
        allergies: formData.allergies || '',
        familyHistory: formData.familyHistory || '',
        diet: formData.diet || '',
        alcohol: formData.alcohol || '',
        tobacco: formData.tobacco || '',
        exercise: formData.exercise || '',
        sleep: formData.sleep || '',
        stress: formData.stress || '',
        stressLevel: formData.stressLevel || '',
        mentalHealthConditions: formData.mentalHealthConditions || [],
        sexualHealth: formData.sexualHealth || {},
        reproductiveHealth: formData.reproductiveHealth || {},
        preventiveCare: formData.preventiveCare || {},
        currentConcerns: formData.currentConcerns || [],
        goals: formData.goals || [],
        personalizedRecommendations: formData.personalizedRecommendations || false,
        dataSharing: formData.dataSharing || false,
        notifications: formData.notifications || true,
        onboardingCompleted: true
      };
      
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      console.log('💾 Saved user to registeredUsers:', newUser);
      console.log('💾 All registered users:', registeredUsers);
      
      await register(userData);
      localStorage.removeItem('pendingRegistration');
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="onboarding-step">
      <h2>Let's get to know you</h2>
      <p>Hello {formData.fullName || 'there'}! Let's start by getting to know you better. We'll ask for your name, date of birth, gender identity, pronouns, and more. This helps us personalize your experience and ensure we're providing the most relevant information for you.</p>
      
      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>
        
        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Gender Identity *</label>
          <select
            value={formData.genderIdentity}
            onChange={(e) => handleInputChange('genderIdentity', e.target.value)}
            className={errors.genderIdentity ? 'error' : ''}
          >
            <option value="">Select gender identity</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Trans woman">Trans woman</option>
            <option value="Trans man">Trans man</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Gender diverse">Gender diverse</option>
            <option value="Intersex">Intersex</option>
            <option value="Other">Other</option>
          </select>
          {errors.genderIdentity && <span className="error-message">{errors.genderIdentity}</span>}
        </div>
        
        <div className="form-group">
          <label>Pronouns *</label>
          <select
            value={formData.pronouns}
            onChange={(e) => handleInputChange('pronouns', e.target.value)}
            className={errors.pronouns ? 'error' : ''}
          >
            <option value="">Select pronouns</option>
            <option value="she/her">she/her</option>
            <option value="he/him">he/him</option>
            <option value="they/them">they/them</option>
            <option value="she/they">she/they</option>
            <option value="he/they">he/they</option>
            <option value="other">other</option>
          </select>
          {errors.pronouns && <span className="error-message">{errors.pronouns}</span>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Sex Assigned at Birth *</label>
          <select
            value={formData.sexAssignedAtBirth}
            onChange={(e) => handleInputChange('sexAssignedAtBirth', e.target.value)}
            className={errors.sexAssignedAtBirth ? 'error' : ''}
          >
            <option value="">Select sex assigned at birth</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Intersex">Intersex</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.sexAssignedAtBirth && <span className="error-message">{errors.sexAssignedAtBirth}</span>}
        </div>
        
        <div className="form-group">
          <label>Country of Residence *</label>
          <select
            value={formData.countryOfResidence}
            onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
            className={errors.countryOfResidence ? 'error' : ''}
          >
            <option value="">Select country</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
          {errors.countryOfResidence && <span className="error-message">{errors.countryOfResidence}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label>Preferred Language</label>
        <select
          value={formData.preferredLanguage}
          onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Hindi">Hindi</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="onboarding-step">
      <h2>Lifestyle & Habits</h2>
      <p>Tell us about your daily habits and lifestyle to help us provide personalized recommendations.</p>
      
      <div className="form-group">
        <label>Diet *</label>
        <select
          value={formData.diet}
          onChange={(e) => handleInputChange('diet', e.target.value)}
          className={errors.diet ? 'error' : ''}
        >
          <option value="">Select your diet</option>
          <option value="Omnivore">Omnivore</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Pescatarian">Pescatarian</option>
          <option value="Keto">Keto</option>
          <option value="Paleo">Paleo</option>
          <option value="Other">Other</option>
        </select>
        {errors.diet && <span className="error-message">{errors.diet}</span>}
      </div>
      
      <div className="form-group">
        <label>Alcohol Use *</label>
        <select
          value={formData.alcoholUse}
          onChange={(e) => handleInputChange('alcoholUse', e.target.value)}
          className={errors.alcoholUse ? 'error' : ''}
        >
          <option value="">Select alcohol consumption</option>
          <option value="Never">Never</option>
          <option value="Occasionally">Occasionally</option>
          <option value="Moderately">Moderately</option>
          <option value="Regularly">Regularly</option>
          <option value="Heavily">Heavily</option>
        </select>
        {errors.alcoholUse && <span className="error-message">{errors.alcoholUse}</span>}
      </div>
      
      <div className="form-group">
        <label>Tobacco or Nicotine Use *</label>
        <select
          value={formData.tobaccoUse}
          onChange={(e) => handleInputChange('tobaccoUse', e.target.value)}
          className={errors.tobaccoUse ? 'error' : ''}
        >
          <option value="">Select tobacco use</option>
          <option value="Never">Never</option>
          <option value="Former">Former</option>
          <option value="Occasionally">Occasionally</option>
          <option value="Regularly">Regularly</option>
        </select>
        {errors.tobaccoUse && <span className="error-message">{errors.tobaccoUse}</span>}
      </div>
      
      <div className="form-group">
        <label>Exercise Frequency *</label>
        <select
          value={formData.exerciseFrequency}
          onChange={(e) => handleInputChange('exerciseFrequency', e.target.value)}
          className={errors.exerciseFrequency ? 'error' : ''}
        >
          <option value="">Select exercise level</option>
          <option value="Sedentary">Sedentary</option>
          <option value="Light">Light</option>
          <option value="Moderate">Moderate</option>
          <option value="Active">Active</option>
          <option value="Very Active">Very Active</option>
        </select>
        {errors.exerciseFrequency && <span className="error-message">{errors.exerciseFrequency}</span>}
      </div>
      
      <div className="form-group">
        <label>Sleep Quality *</label>
        <select
          value={formData.sleepQuality}
          onChange={(e) => handleInputChange('sleepQuality', e.target.value)}
          className={errors.sleepQuality ? 'error' : ''}
        >
          <option value="">Select sleep quality</option>
          <option value="Poor">Poor</option>
          <option value="Fair">Fair</option>
          <option value="Good">Good</option>
          <option value="Excellent">Excellent</option>
        </select>
        {errors.sleepQuality && <span className="error-message">{errors.sleepQuality}</span>}
      </div>
      
      <div className="form-group">
        <label>Stress Level *</label>
        <select
          value={formData.stressLevel}
          onChange={(e) => handleInputChange('stressLevel', e.target.value)}
          className={errors.stressLevel ? 'error' : ''}
        >
          <option value="">Select stress level</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
          <option value="Very High">Very High</option>
        </select>
        {errors.stressLevel && <span className="error-message">{errors.stressLevel}</span>}
      </div>
    </div>
  );



  // Step rendering functions
  const renderStep2 = () => (
    <div className="onboarding-step">
      <h2>Anatomy & Transition</h2>
      <p>Tell us about your reproductive anatomy and transition-related information.</p>
      
      <div className="form-group">
        <label>Which reproductive anatomy applies to you? (select all that apply) *</label>
        <div className="checkbox-group">
          {['Uterus & ovaries', 'Vagina', 'Penis', 'Testes', 'Prostate', 'Other'].map(anatomy => (
            <label key={anatomy} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.reproductiveAnatomy.includes(anatomy)}
                onChange={(e) => {
                  const current = formData.reproductiveAnatomy || [];
                  const newValue = e.target.checked
                    ? [...current, anatomy]
                    : current.filter(item => item !== anatomy);
                  handleInputChange('reproductiveAnatomy', newValue);
                }}
              />
              <span>{anatomy}</span>
            </label>
          ))}
        </div>
        {errors.reproductiveAnatomy && <span className="error-message">{errors.reproductiveAnatomy}</span>}
      </div>

      <div className="form-group">
        <label>Have you had any reproductive surgeries?</label>
        <select
          value={formData.reproductiveSurgeries}
          onChange={(e) => handleInputChange('reproductiveSurgeries', e.target.value)}
        >
          <option value="">Select option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Conditional dropdown for specific surgeries */}
      {formData.reproductiveSurgeries === 'Yes' && (
        <div className="form-group">
          <label>Which reproductive surgeries have you had? (select all that apply)</label>
          <div className="checkbox-group">
            {[
              'Hysterectomy (uterus removal)',
              'Oophorectomy (ovary removal)',
              'Mastectomy (breast removal)',
              'Orchiectomy (testicle removal)',
              'Top surgery (chest reconstruction)',
              'Bottom surgery (genital reconstruction)',
              'Tubal ligation (fallopian tube closure)',
              'Vasectomy (sperm duct closure)',
              'Other'
            ].map(surgery => (
              <label key={surgery} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.reproductiveSurgeriesList?.includes(surgery) || false}
                  onChange={(e) => {
                    const current = formData.reproductiveSurgeriesList || [];
                    const newValue = e.target.checked
                      ? [...current, surgery]
                      : current.filter(item => item !== surgery);
                    handleInputChange('reproductiveSurgeriesList', newValue);
                  }}
                />
                <span>{surgery}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Are you currently on hormone therapy?</label>
        <select
          value={formData.hormoneTherapy}
          onChange={(e) => handleInputChange('hormoneTherapy', e.target.value)}
        >
          <option value="">Select option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Conditional dropdown for specific hormone therapies */}
      {formData.hormoneTherapy === 'Yes' && (
        <div className="form-group">
          <label>Which hormone therapies are you currently on? (select all that apply)</label>
          <div className="checkbox-group">
            {[
              'Testosterone',
              'Estrogen',
              'Progesterone',
              'Puberty blockers',
              'Anti-androgens',
              'Other'
            ].map(therapy => (
              <label key={therapy} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.hormoneTherapyList?.includes(therapy) || false}
                  onChange={(e) => {
                    const current = formData.hormoneTherapyList || [];
                    const newValue = e.target.checked
                      ? [...current, therapy]
                      : current.filter(item => item !== therapy);
                    handleInputChange('hormoneTherapyList', newValue);
                  }}
                />
                <span>{therapy}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const hasUterus = formData.reproductiveAnatomy?.includes('Uterus & ovaries') || formData.reproductiveAnatomy?.includes('Vagina');
    const hasTestes = formData.reproductiveAnatomy?.includes('Testes') || formData.reproductiveAnatomy?.includes('Penis');

    return (
      <div className="onboarding-step">
        <h2>Medical Background</h2>
        <p>Tell us about your general medical history.</p>
      
      <div className="form-row">
        <div className="form-group">
          <label>Height (cm) *</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder="Enter height in cm"
            className={errors.height ? 'error' : ''}
          />
          {errors.height && <span className="error-message">{errors.height}</span>}
        </div>
        
        <div className="form-group">
          <label>Weight (kg) *</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="Enter weight in kg"
            className={errors.weight ? 'error' : ''}
          />
          {errors.weight && <span className="error-message">{errors.weight}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Allergies (select all that apply)</label>
        <div className="checkbox-group">
          {['Medications', 'Latex', 'Foods', 'Other', 'None'].map(allergy => (
            <label key={allergy} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.allergies?.includes(allergy) || false}
                onChange={(e) => {
                  const current = formData.allergies || [];
                  let newValue;
                  if (allergy === 'None') {
                    // If "None" is selected, clear all other options
                    newValue = e.target.checked ? ['None'] : [];
                  } else {
                    // If other option is selected, remove "None" and add/remove the selected option
                    newValue = e.target.checked
                      ? [...current.filter(item => item !== 'None'), allergy]
                      : current.filter(item => item !== allergy);
                  }
                  handleInputChange('allergies', newValue);
                }}
              />
              <span>{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Chronic Conditions (select all that apply)</label>
        <div className="checkbox-group">
          {['Diabetes', 'Thyroid disorder', 'Hypertension', 'Asthma', 'Autoimmune', 'PCOS', 'Endometriosis', 'Other', 'None'].map(condition => (
            <label key={condition} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.chronicConditions?.includes(condition) || false}
                onChange={(e) => {
                  const current = formData.chronicConditions || [];
                  let newValue;
                  if (condition === 'None') {
                    // If "None" is selected, clear all other options
                    newValue = e.target.checked ? ['None'] : [];
                  } else {
                    // If other option is selected, remove "None" and add/remove the selected option
                    newValue = e.target.checked
                      ? [...current.filter(item => item !== 'None'), condition]
                      : current.filter(item => item !== condition);
                  }
                  handleInputChange('chronicConditions', newValue);
                }}
              />
              <span>{condition}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Past Surgeries</label>
        <input
          type="text"
          value={formData.pastSurgeries}
          onChange={(e) => handleInputChange('pastSurgeries', e.target.value)}
          placeholder="List past surgeries or type 'none'"
        />
      </div>

      <div className="form-group">
        <label>Family History (select all that apply)</label>
        
        {/* Unified family history based on anatomy */}
        {hasUterus && (
          <div className="anatomy-section">
            <div className="checkbox-group">
              {[
                'Endometriosis', 'PCOD/PCOS', 'Breast cancer', 'Ovarian cancer', 'Uterine cancer',
                'Diabetes', 'Heart disease', 'Hypertension', 'Stroke', 'Kidney disease', 
                'Thyroid issues', 'Osteoporosis', 'Mental health conditions', 'Cancer (other types)', 'None'
              ].map(condition => (
                <label key={condition} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.familyHistory?.womensConditions?.includes(condition) || false}
                    onChange={(e) => {
                      const current = formData.familyHistory?.womensConditions || [];
                      let newValue;
                      if (condition === 'None') {
                        newValue = e.target.checked ? ['None'] : [];
                      } else {
                        newValue = e.target.checked
                          ? [...current.filter(item => item !== 'None'), condition]
                          : current.filter(item => item !== condition);
                      }
                      handleInputChange('familyHistory', {
                        ...formData.familyHistory,
                        womensConditions: newValue
                      });
                    }}
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasTestes && (
          <div className="anatomy-section">
            <div className="checkbox-group">
              {[
                'Prostate cancer', 'Testicular cancer', 'Diabetes', 'Heart disease', 'Hypertension',
                'Stroke', 'Kidney disease', 'Thyroid issues', 'Osteoporosis', 'Mental health conditions', 
                'Cancer (other types)', 'None'
              ].map(condition => (
                <label key={condition} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.familyHistory?.mensConditions?.includes(condition) || false}
                    onChange={(e) => {
                      const current = formData.familyHistory?.mensConditions || [];
                      let newValue;
                      if (condition === 'None') {
                        newValue = e.target.checked ? ['None'] : [];
                      } else {
                        newValue = e.target.checked
                          ? [...current.filter(item => item !== 'None'), condition]
                          : current.filter(item => item !== condition);
                      }
                      handleInputChange('familyHistory', {
                        ...formData.familyHistory,
                        mensConditions: newValue
                      });
                    }}
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Cancer type follow-up for general cancer */}
        {(formData.familyHistory?.womensConditions?.includes('Cancer (other types)') || 
          formData.familyHistory?.mensConditions?.includes('Cancer (other types)')) && (
          <div className="form-group">
            <label>What type of cancer runs in your family?</label>
            <input
              type="text"
              value={formData.familyHistory?.cancerTypes || ''}
              onChange={(e) => handleInputChange('familyHistory', {
                ...formData.familyHistory,
                cancerTypes: e.target.value
              })}
              placeholder="e.g., Lung cancer, Colon cancer, etc."
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Vaccination History</label>
        <div className="form-row">
          <div className="form-group">
            <label>HPV Vaccine</label>
            <select
              value={formData.vaccinationHistory?.hpv || ''}
              onChange={(e) => handleInputChange('vaccinationHistory', {
                ...formData.vaccinationHistory,
                hpv: e.target.value
              })}
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Hepatitis B Vaccine</label>
            <select
              value={formData.vaccinationHistory?.hepatitisB || ''}
              onChange={(e) => handleInputChange('vaccinationHistory', {
                ...formData.vaccinationHistory,
                hepatitisB: e.target.value
              })}
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  }
  
  // Comprehensive Mental & Emotional Health Section
  const renderStep5 = () => (
    <div className="onboarding-step">
      <h2>Mental & Emotional Health</h2>
      <p>Tell us about your mental health and emotional well-being.</p>
      
      <div className="form-group">
        <label>How would you describe your current mental health? *</label>
        <select
          value={formData.mentalHealthStatus}
          onChange={(e) => handleInputChange('mentalHealthStatus', e.target.value)}
          className={errors.mentalHealthStatus ? 'error' : ''}
        >
          <option value="">Select option</option>
          <option value="Good/Stable">Good / Stable</option>
          <option value="Occasionally stressed/mild anxiety">Occasionally stressed / mild anxiety</option>
          <option value="Ongoing condition(s)">Ongoing condition(s)</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors.mentalHealthStatus && <span className="error-message">{errors.mentalHealthStatus}</span>}
      </div>

      {/* Conditional questions for stress/anxiety or ongoing conditions */}
      {(formData.mentalHealthStatus === 'Occasionally stressed/mild anxiety' || 
        formData.mentalHealthStatus === 'Ongoing condition(s)') && (
        <>
          <div className="form-group">
            <label>Have you ever been diagnosed with a mental health condition?</label>
            <select
              value={formData.mentalHealthDiagnosis}
              onChange={(e) => handleInputChange('mentalHealthDiagnosis', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Conditional dropdown for specific conditions */}
          {formData.mentalHealthDiagnosis === 'Yes' && (
            <div className="form-group">
              <label>Which mental health conditions have you been diagnosed with? (select all that apply)</label>
              <div className="checkbox-group">
                {[
                  'Depression',
                  'Anxiety disorder / Panic attacks',
                  'PTSD (Post-traumatic stress disorder)',
                  'Bipolar disorder',
                  'Eating disorder (Anorexia, Bulimia, Binge eating disorder)',
                  'OCD (Obsessive-compulsive disorder)',
                  'Schizophrenia / Psychotic disorders',
                  'ADHD',
                  'Other'
                ].map(condition => (
                  <label key={condition} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.mentalHealthConditions?.includes(condition) || false}
                      onChange={(e) => {
                        const current = formData.mentalHealthConditions || [];
                        const newValue = e.target.checked
                          ? [...current, condition]
                          : current.filter(item => item !== condition);
                        handleInputChange('mentalHealthConditions', newValue);
                      }}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Are you currently receiving treatment or support?</label>
            <select
              value={formData.mentalHealthTreatment}
              onChange={(e) => handleInputChange('mentalHealthTreatment', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Yes, medication only">Yes, medication only</option>
              <option value="Yes, therapy/counseling only">Yes, therapy/counseling only</option>
              <option value="Yes, both">Yes, both</option>
              <option value="No, not currently">No, not currently</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Conditional dropdown for psychiatric medications */}
          {(formData.mentalHealthTreatment === 'Yes, medication only' || 
            formData.mentalHealthTreatment === 'Yes, both') && (
            <div className="form-group">
              <label>Are you currently taking any psychiatric medications? (select all that apply)</label>
              <div className="checkbox-group">
                {[
                  'Antidepressants (SSRIs, SNRIs, Tricyclics, MAOIs)',
                  'Anti-anxiety meds (Benzodiazepines, Buspirone, etc.)',
                  'Mood stabilizers (Lithium, Valproate, Carbamazepine, etc.)',
                  'Antipsychotics',
                  'Stimulants (ADHD meds)',
                  'Other'
                ].map(medication => (
                  <label key={medication} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.psychiatricMedications?.includes(medication) || false}
                      onChange={(e) => {
                        const current = formData.psychiatricMedications || [];
                        const newValue = e.target.checked
                          ? [...current, medication]
                          : current.filter(item => item !== medication);
                        handleInputChange('psychiatricMedications', newValue);
                      }}
                    />
                    <span>{medication}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Do you feel your mental health impacts your daily life or reproductive health?</label>
            <select
              value={formData.mentalHealthImpact}
              onChange={(e) => handleInputChange('mentalHealthImpact', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Yes, significantly">Yes, significantly</option>
              <option value="Yes, somewhat">Yes, somewhat</option>
              <option value="Not really">Not really</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  // Comprehensive Sexual & Relationship Health Section
  const renderStep6 = () => (
    <div className="onboarding-step">
      <h2>Sexual & Relationship Health</h2>
      <p>Tell us about your sexual health and relationships.</p>
      
      <div className="form-group">
        <label>Are you currently sexually active? *</label>
        <select
          value={formData.isSexuallyActive}
          onChange={(e) => handleInputChange('isSexuallyActive', e.target.value)}
          className={errors.isSexuallyActive ? 'error' : ''}
        >
          <option value="">Select option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors.isSexuallyActive && <span className="error-message">{errors.isSexuallyActive}</span>}
      </div>

      {/* Conditional questions for sexually active users */}
      {formData.isSexuallyActive === 'Yes' && (
        <>
          <div className="form-group">
            <label>What types of partners do you have? (select all that apply)</label>
            <div className="checkbox-group">
              {[
                'Male partners',
                'Female partners',
                'Transgender partners',
                'Non-binary partners',
                'Prefer not to say'
              ].map(partnerType => (
                <label key={partnerType} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.partnerTypes?.includes(partnerType) || false}
                    onChange={(e) => {
                      const current = formData.partnerTypes || [];
                      const newValue = e.target.checked
                        ? [...current, partnerType]
                        : current.filter(item => item !== partnerType);
                      handleInputChange('partnerTypes', newValue);
                    }}
                  />
                  <span>{partnerType}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Do you use protection/contraception?</label>
            <select
              value={formData.protectionUsed}
              onChange={(e) => handleInputChange('protectionUsed', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Always">Always</option>
              <option value="Sometimes">Sometimes</option>
              <option value="Never">Never</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Conditional dropdown for protection types */}
          {(formData.protectionUsed === 'Always' || formData.protectionUsed === 'Sometimes') && (
            <div className="form-group">
              <label>What type of protection/contraception do you use? (select all that apply)</label>
              <div className="checkbox-group">
                {[
                  'Condom (male/female)',
                  'Oral contraceptive pill',
                  'IUD (Copper / Hormonal)',
                  'Implant',
                  'Injectable contraception',
                  'Emergency pill',
                  'Hormone therapy (used as contraception)',
                  'Sterilization (tubal ligation / vasectomy of partner)',
                  'Withdrawal method',
                  'Fertility awareness method',
                  'Other'
                ].map(protection => (
                  <label key={protection} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.protectionTypes?.includes(protection) || false}
                      onChange={(e) => {
                        const current = formData.protectionTypes || [];
                        const newValue = e.target.checked
                          ? [...current, protection]
                          : current.filter(item => item !== protection);
                        handleInputChange('protectionTypes', newValue);
                      }}
                    />
                    <span>{protection}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Have you ever been diagnosed with a sexually transmitted infection (STI)?</label>
            <select
              value={formData.stiHistory}
              onChange={(e) => handleInputChange('stiHistory', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Conditional dropdown for STI types */}
          {formData.stiHistory === 'Yes' && (
            <div className="form-group">
              <label>Which STIs have you been diagnosed with? (select all that apply)</label>
              <div className="checkbox-group">
                {[
                  'HIV',
                  'Syphilis',
                  'Gonorrhea',
                  'Chlamydia',
                  'HPV',
                  'HSV',
                  'Hepatitis B',
                  'Other'
                ].map(sti => (
                  <label key={sti} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.stiTypes?.includes(sti) || false}
                      onChange={(e) => {
                        const current = formData.stiTypes || [];
                        const newValue = e.target.checked
                          ? [...current, sti]
                          : current.filter(item => item !== sti);
                        handleInputChange('stiTypes', newValue);
                      }}
                    />
                    <span>{sti}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStep7 = () => {
    // Determine user type based on anatomy
    const hasUterus = formData.reproductiveAnatomy?.includes('Uterus & ovaries') || formData.reproductiveAnatomy?.includes('Vagina');
    const hasTestes = formData.reproductiveAnatomy?.includes('Testes') || formData.reproductiveAnatomy?.includes('Penis');
    const isTrans = formData.genderIdentity?.includes('Trans') || formData.genderIdentity === 'Non-binary';
    const isIntersex = formData.genderIdentity === 'Intersex' || formData.sexAssignedAtBirth === 'Intersex';

    return (
      <div className="onboarding-step">
        <h2>Reproductive Health</h2>
        <p>Reproductive health questions based on your anatomy.</p>
        
        {/* AFAB-specific questions */}
        {hasUterus && (
          <div className="anatomy-section">
            <h3>For people with uterus/ovaries:</h3>
            
            <div className="form-group">
              <label>Age at first period</label>
              <input
                type="number"
                value={formData.reproductiveHealth?.ageAtFirstPeriod || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  ageAtFirstPeriod: e.target.value
                })}
                placeholder="Enter age"
                min="8"
                max="20"
              />
            </div>

            <div className="form-group">
              <label>Cycle regularity</label>
              <select
                value={formData.reproductiveHealth?.cycleRegularity || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  cycleRegularity: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Average cycle length (days)</label>
              <input
                type="number"
                value={formData.reproductiveHealth?.cycleLength || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  cycleLength: e.target.value
                })}
                placeholder="Enter days"
                min="21"
                max="35"
              />
            </div>

            <div className="form-group">
              <label>Flow intensity</label>
              <select
                value={formData.reproductiveHealth?.flowIntensity || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  flowIntensity: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Light">Light</option>
                <option value="Moderate">Moderate</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current status (select all that apply)</label>
              <div className="checkbox-group">
                {['Pregnant', 'Trying to conceive', 'Postpartum', 'Breastfeeding', 'Perimenopause', 'Menopause', 'Not currently in any of these stages, just trying to track my cycle'].map(status => (
                  <label key={status} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.reproductiveHealth?.currentStatus?.includes(status) || false}
                      onChange={(e) => {
                        const current = formData.reproductiveHealth?.currentStatus || [];
                        const newValue = e.target.checked
                          ? [...current, status]
                          : current.filter(item => item !== status);
                        handleInputChange('reproductiveHealth', {
                          ...formData.reproductiveHealth,
                          currentStatus: newValue
                        });
                      }}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* AMAB-specific questions */}
        {hasTestes && (
          <div className="anatomy-section">
            <h3>For people with testes/prostate:</h3>
            
            <div className="form-group">
              <label>Puberty history</label>
              <select
                value={formData.reproductiveHealth?.pubertyHistory || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  pubertyHistory: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Normal">Normal</option>
                <option value="Early">Early</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fertility concerns</label>
              <select
                value={formData.reproductiveHealth?.fertilityConcerns || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  fertilityConcerns: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Last prostate screening/PSA test</label>
              <input
                type="date"
                value={formData.reproductiveHealth?.lastProstateScreening || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  lastProstateScreening: e.target.value
                })}
              />
            </div>
          </div>
        )}

        {/* Trans/Intersex specific questions */}
        {(isTrans || isIntersex) && (
          <div className="anatomy-section">
            <h3>For transgender and intersex people:</h3>
            
            <div className="form-group">
              <label>Hormone therapy history</label>
              <textarea
                value={formData.reproductiveHealth?.hormoneTherapyHistory || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  hormoneTherapyHistory: e.target.value
                })}
                placeholder="Describe your hormone therapy history, if any"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Surgeries undergone</label>
              <textarea
                value={formData.reproductiveHealth?.surgeriesUndergone || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  surgeriesUndergone: e.target.value
                })}
                placeholder="List any surgeries you have undergone"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Fertility preservation decisions</label>
              <select
                value={formData.reproductiveHealth?.fertilityPreservation || ''}
                onChange={(e) => handleInputChange('reproductiveHealth', {
                  ...formData.reproductiveHealth,
                  fertilityPreservation: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Egg banking">Egg banking</option>
                <option value="Sperm banking">Sperm banking</option>
                <option value="Ovarian tissue freezing">Ovarian tissue freezing</option>
                <option value="None">None</option>
                <option value="Considering">Considering</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep8 = () => {
    const hasUterus = formData.reproductiveAnatomy?.includes('Uterus & ovaries') || formData.reproductiveAnatomy?.includes('Vagina');
    const hasTestes = formData.reproductiveAnatomy?.includes('Testes') || formData.reproductiveAnatomy?.includes('Penis');
    const hasProstate = formData.reproductiveAnatomy?.includes('Prostate') || formData.reproductiveAnatomy?.includes('Testes');
    const isTrans = formData.genderIdentity?.includes('Trans') || formData.genderIdentity === 'Non-binary';
    const isIntersex = formData.genderIdentity === 'Intersex' || formData.sexAssignedAtBirth === 'Intersex';
    const isOlder = formData.age > 40 || (formData.dateOfBirth && (new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()) > 40);
    const onHormoneTherapy = formData.hormoneTherapy === 'Yes';

    return (
      <div className="onboarding-step">
        <h2>Preventive Care & Screenings</h2>
        <p>Tell us about your preventive care and screening history.</p>
        
        {/* Women's Preventive Screenings */}
        {hasUterus && (
          <div className="anatomy-section">
            <h3>Women's Preventive Screenings</h3>
            
            <div className="form-group">
              <label>Pap Smear / Cervical Screening</label>
              <select
                value={formData.screenings?.papSmear || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  papSmear: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Breast Exam / Mammogram</label>
              <select
                value={formData.screenings?.mammogram || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  mammogram: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pelvic Ultrasound</label>
              <select
                value={formData.screenings?.pelvicUltrasound || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  pelvicUltrasound: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            {isOlder && (
              <div className="form-group">
                <label>Bone Density Test (esp. &gt;40 / menopause)</label>
                <select
                  value={formData.screenings?.boneDensity || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    boneDensity: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>STI / STD Test</label>
              <select
                value={formData.screenings?.stiScreening || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  stiScreening: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last 6 months">Within last 6 months</option>
                <option value="6-12 months ago">6-12 months ago</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="More than 2 years ago">More than 2 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hormone Panel / Blood Test</label>
              <select
                value={formData.screenings?.hormonePanel || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  hormonePanel: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>
        )}

        {/* Men's Preventive Screenings */}
        {hasTestes && (
          <div className="anatomy-section">
            <h3>Men's Preventive Screenings</h3>
            
            {hasProstate && (
              <div className="form-group">
                <label>Prostate Exam / PSA Test</label>
                <select
                  value={formData.screenings?.prostateScreening || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    prostateScreening: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Testicular Exam (self or doctor)</label>
              <select
                value={formData.screenings?.testicularExam || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  testicularExam: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>STI / STD Test</label>
              <select
                value={formData.screenings?.stiScreening || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  stiScreening: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last 6 months">Within last 6 months</option>
                <option value="6-12 months ago">6-12 months ago</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="More than 2 years ago">More than 2 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hormone Panel / Blood Test</label>
              <select
                value={formData.screenings?.hormonePanel || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  hormonePanel: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last year">Within last year</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="3-5 years ago">3-5 years ago</option>
                <option value="More than 5 years ago">More than 5 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>
        )}

        {/* Trans/Non-Binary Personalized Screenings */}
        {(isTrans || isIntersex) && (
          <div className="anatomy-section">
            <h3>Personalized Preventive Screenings</h3>
            <p>Based on your anatomy, transition, and hormone therapy answers</p>
            
            {hasUterus && (
              <div className="form-group">
                <label>Cervical Screening (if has cervix)</label>
                <select
                  value={formData.screenings?.papSmear || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    papSmear: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            {(hasUterus || formData.reproductiveAnatomy?.includes('Breast tissue')) && (
              <div className="form-group">
                <label>Breast Exam / Mammogram (if has breast tissue)</label>
                <select
                  value={formData.screenings?.mammogram || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    mammogram: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            {hasProstate && (
              <div className="form-group">
                <label>Prostate Exam (if has prostate)</label>
                <select
                  value={formData.screenings?.prostateScreening || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    prostateScreening: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            {onHormoneTherapy && (
              <div className="form-group">
                <label>Hormone Monitoring (if on HRT)</label>
                <select
                  value={formData.screenings?.hormoneMonitoring || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    hormoneMonitoring: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last 6 months">Within last 6 months</option>
                  <option value="6-12 months ago">6-12 months ago</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="More than 2 years ago">More than 2 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            {onHormoneTherapy && (
              <div className="form-group">
                <label>Bone Density (if on long-term hormone therapy)</label>
                <select
                  value={formData.screenings?.boneDensity || ''}
                  onChange={(e) => handleInputChange('screenings', {
                    ...formData.screenings,
                    boneDensity: e.target.value
                  })}
                >
                  <option value="">Select option</option>
                  <option value="Within last year">Within last year</option>
                  <option value="1-2 years ago">1-2 years ago</option>
                  <option value="3-5 years ago">3-5 years ago</option>
                  <option value="More than 5 years ago">More than 5 years ago</option>
                  <option value="Never">Never</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>STI / STD Testing</label>
              <select
                value={formData.screenings?.stiScreening || ''}
                onChange={(e) => handleInputChange('screenings', {
                  ...formData.screenings,
                  stiScreening: e.target.value
                })}
              >
                <option value="">Select option</option>
                <option value="Within last 6 months">Within last 6 months</option>
                <option value="6-12 months ago">6-12 months ago</option>
                <option value="1-2 years ago">1-2 years ago</option>
                <option value="More than 2 years ago">More than 2 years ago</option>
                <option value="Never">Never</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>
        )}

        {/* General Health - Full Body Checkup (all genders) */}
        <div className="anatomy-section">
          <h3>General Health</h3>
          
          <div className="form-group">
            <label>Full Body Checkup</label>
            <select
              value={formData.screenings?.healthCheckup || ''}
              onChange={(e) => handleInputChange('screenings', {
                ...formData.screenings,
                healthCheckup: e.target.value
              })}
            >
              <option value="">Select option</option>
              <option value="Within last year">Within last year</option>
              <option value="1-2 years ago">1-2 years ago</option>
              <option value="3-5 years ago">3-5 years ago</option>
              <option value="More than 5 years ago">More than 5 years ago</option>
              <option value="Never">Never</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Do you have a primary care provider?</label>
          <select
            value={formData.hasPrimaryCare || ''}
            onChange={(e) => handleInputChange('hasPrimaryCare', e.target.value)}
          >
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Looking for one">Looking for one</option>
          </select>
        </div>
      </div>
    );
  };

  const renderStep9 = () => {
    const hasUterus = formData.reproductiveAnatomy?.includes('Uterus & ovaries') || formData.reproductiveAnatomy?.includes('Vagina');
    const hasTestes = formData.reproductiveAnatomy?.includes('Testes') || formData.reproductiveAnatomy?.includes('Penis');
    const isTrans = formData.genderIdentity?.includes('Trans') || formData.genderIdentity === 'Non-binary';

    return (
      <div className="onboarding-step">
        <h2>Current Concerns</h2>
        <p>What brings you here today? (select all that apply)</p>
        
        <div className="form-group">
          <label>General concerns</label>
          <div className="checkbox-group">
            {[
              'Pain or discomfort',
              'General wellness check-up',
              'Preventive care',
              'Health education',
              'Other'
            ].map(concern => (
              <label key={concern} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.currentConcerns?.includes(concern) || false}
                  onChange={(e) => {
                    const current = formData.currentConcerns || [];
                    const newValue = e.target.checked
                      ? [...current, concern]
                      : current.filter(item => item !== concern);
                    handleInputChange('currentConcerns', newValue);
                  }}
                />
                <span>{concern}</span>
              </label>
            ))}
          </div>
        </div>

        {hasUterus && (
          <div className="form-group">
            <label>Reproductive health concerns (for people with uterus/ovaries)</label>
            <div className="checkbox-group">
              {[
                'Irregular cycles/bleeding',
                'Painful periods',
                'Heavy bleeding',
                'Fertility support',
                'Pregnancy support',
                'Postpartum care',
                'Contraception guidance',
                'Menopause support',
                'PCOS management',
                'Endometriosis',
                'Fibroids',
                'Other'
              ].map(concern => (
                <label key={concern} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.currentConcerns?.includes(concern) || false}
                    onChange={(e) => {
                      const current = formData.currentConcerns || [];
                      const newValue = e.target.checked
                        ? [...current, concern]
                        : current.filter(item => item !== concern);
                      handleInputChange('currentConcerns', newValue);
                    }}
                  />
                  <span>{concern}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasTestes && (
          <div className="form-group">
            <label>Reproductive health concerns (for people with testes/prostate)</label>
            <div className="checkbox-group">
              {[
                'Fertility concerns',
                'Erectile dysfunction',
                'Testicular pain',
                'Prostate health',
                'Low testosterone',
                'Other'
              ].map(concern => (
                <label key={concern} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.currentConcerns?.includes(concern) || false}
                    onChange={(e) => {
                      const current = formData.currentConcerns || [];
                      const newValue = e.target.checked
                        ? [...current, concern]
                        : current.filter(item => item !== concern);
                      handleInputChange('currentConcerns', newValue);
                    }}
                  />
                  <span>{concern}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isTrans && (
          <div className="form-group">
            <label>Gender-affirming health concerns</label>
            <div className="checkbox-group">
              {[
                'Hormone therapy management',
                'Surgery recovery',
                'Gender dysphoria',
                'Fertility preservation',
                'Voice training',
                'Other'
              ].map(concern => (
                <label key={concern} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.currentConcerns?.includes(concern) || false}
                    onChange={(e) => {
                      const current = formData.currentConcerns || [];
                      const newValue = e.target.checked
                        ? [...current, concern]
                        : current.filter(item => item !== concern);
                      handleInputChange('currentConcerns', newValue);
                    }}
                  />
                  <span>{concern}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Other concerns (please specify)</label>
          <textarea
            value={formData.otherConcerns || ''}
            onChange={(e) => handleInputChange('otherConcerns', e.target.value)}
            placeholder="Please describe any other concerns you have"
            rows="3"
          />
        </div>
      </div>
    );
  };

  const renderStep10 = () => {
    const hasUterus = formData.reproductiveAnatomy?.includes('Uterus & ovaries') || formData.reproductiveAnatomy?.includes('Vagina');
    const hasTestes = formData.reproductiveAnatomy?.includes('Testes') || formData.reproductiveAnatomy?.includes('Penis');
    const isTrans = formData.genderIdentity?.includes('Trans') || formData.genderIdentity === 'Non-binary';

    return (
      <div className="onboarding-step">
        <h2>Goals & Expectations</h2>
        <p>What are you primarily looking for? (select all that apply)</p>
        
        <div className="form-group">
          <label>General health goals</label>
          <div className="checkbox-group">
            {[
              'General wellness & lifestyle support',
              'Health education & information',
              'Preventive care management',
              'Chronic condition management',
              'Medication tracking',
              'Appointment reminders',
              'Health data insights',
              'Other'
            ].map(goal => (
              <label key={goal} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.goals?.includes(goal) || false}
                  onChange={(e) => {
                    const current = formData.goals || [];
                    const newValue = e.target.checked
                      ? [...current, goal]
                      : current.filter(item => item !== goal);
                    handleInputChange('goals', newValue);
                  }}
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>

        {hasUterus && (
          <div className="form-group">
            <label>Reproductive health goals (for people with uterus/ovaries)</label>
            <div className="checkbox-group">
              {[
                'Cycle/menstrual tracking',
                'Contraceptive management',
                'Fertility & conception support',
                'Pregnancy & postpartum support',
                'Menopause/andropause care',
                'PCOS management',
                'Endometriosis support',
                'Fibroid management',
                'Other'
              ].map(goal => (
                <label key={goal} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal) || false}
                    onChange={(e) => {
                      const current = formData.goals || [];
                      const newValue = e.target.checked
                        ? [...current, goal]
                        : current.filter(item => item !== goal);
                      handleInputChange('goals', newValue);
                    }}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasTestes && (
          <div className="form-group">
            <label>Reproductive health goals (for people with testes/prostate)</label>
            <div className="checkbox-group">
              {[
                'Fertility tracking',
                'Testicular health monitoring',
                'Prostate health support',
                'Testosterone level tracking',
                'Erectile dysfunction support',
                'Other'
              ].map(goal => (
                <label key={goal} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal) || false}
                    onChange={(e) => {
                      const current = formData.goals || [];
                      const newValue = e.target.checked
                        ? [...current, goal]
                        : current.filter(item => item !== goal);
                      handleInputChange('goals', newValue);
                    }}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isTrans && (
          <div className="form-group">
            <label>Gender-affirming health goals</label>
            <div className="checkbox-group">
              {[
                'Hormone therapy tracking',
                'Surgery recovery support',
                'Gender dysphoria management',
                'Fertility preservation guidance',
                'Voice training support',
                'Legal transition support',
                'Mental health support',
                'Other'
              ].map(goal => (
                <label key={goal} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal) || false}
                    onChange={(e) => {
                      const current = formData.goals || [];
                      const newValue = e.target.checked
                        ? [...current, goal]
                        : current.filter(item => item !== goal);
                      handleInputChange('goals', newValue);
                    }}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>What do you hope to achieve with this app?</label>
          <textarea
            value={formData.goalsDescription || ''}
            onChange={(e) => handleInputChange('goalsDescription', e.target.value)}
            placeholder="Please describe your specific goals and what you hope to achieve"
            rows="3"
          />
        </div>
      </div>
    );
  };

  const renderStep11 = () => (
    <div className="onboarding-step">
      <h2>Consent & Privacy</h2>
      <p>Final step - let's set up your preferences and create your account.</p>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.personalizedRecommendations}
            onChange={(e) => handleInputChange('personalizedRecommendations', e.target.checked)}
          />
          Allow personalized recommendations based on your answers
        </label>
        <p className="help-text">We'll use your health data to provide personalized insights and recommendations.</p>
      </div>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.dataSharing}
            onChange={(e) => handleInputChange('dataSharing', e.target.checked)}
          />
          Allow data sharing for research (anonymous)
        </label>
        <p className="help-text">Your data will be anonymized and used to improve reproductive health care for everyone.</p>
      </div>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.notifications}
            onChange={(e) => handleInputChange('notifications', e.target.checked)}
          />
          Receive notifications and reminders
        </label>
        <p className="help-text">We'll send you helpful reminders for appointments, medications, and health tracking.</p>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.checked)}
          />
          Allow emergency contact access
        </label>
        <p className="help-text">In case of emergency, we can share relevant health information with your emergency contact.</p>
      </div>

      <div className="form-group">
        <label>How would you like to receive health updates?</label>
        <div className="checkbox-group">
          {['Email', 'SMS', 'Push notifications', 'In-app only'].map(method => (
            <label key={method} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.communicationPreferences?.includes(method) || false}
                onChange={(e) => {
                  const current = formData.communicationPreferences || [];
                  const newValue = e.target.checked
                    ? [...current, method]
                    : current.filter(item => item !== method);
                  handleInputChange('communicationPreferences', newValue);
                }}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="consent-notice">
        <h3>Privacy & Data Protection</h3>
        <p>Your privacy is our priority. We use industry-standard encryption and never share your personal health information without your explicit consent. You can change these settings anytime in your profile.</p>
        
        <p>By creating your account, you agree to our <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.</p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      case 10:
        return renderStep10();
      case 11:
        return renderStep11();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Let's personalize your experience</h1>
          <p>Answer a few essentials. You can edit later in your profile.</p>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 11) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        {errors.submit && (
          <div className="auth-error">{errors.submit}</div>
        )}

        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="btn-secondary"
            >
              Back
            </button>
          )}
          
          <button 
            type="button" 
            onClick={nextStep}
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 
             currentStep === 11 ? 'Create Account & Continue' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
