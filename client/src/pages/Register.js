import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const { clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Basic account info
  const [accountInfo, setAccountInfo] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Step 2: Profile info
  const [profileInfo, setProfileInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    genderIdentity: '',
    pronouns: '',
    sexAssignedAtBirth: '',
    countryOfResidence: '',
    preferredLanguage: 'English'
  });
  
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear auth error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  const validateStep1 = () => {
    const newErrors = {};

    // Email validation
    if (!accountInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(accountInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!accountInfo.password) {
      newErrors.password = 'Password is required';
    } else if (accountInfo.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(accountInfo.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(accountInfo.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(accountInfo.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!accountInfo.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (accountInfo.password !== accountInfo.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!profileInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!profileInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!profileInfo.genderIdentity) {
      newErrors.genderIdentity = 'Gender identity is required';
    }
    if (!profileInfo.pronouns) {
      newErrors.pronouns = 'Pronouns are required';
    }
    if (!profileInfo.sexAssignedAtBirth) {
      newErrors.sexAssignedAtBirth = 'Sex assigned at birth is required';
    }
    if (!profileInfo.countryOfResidence.trim()) {
      newErrors.countryOfResidence = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({});
    }
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    console.log('🚀 Step 2 submit triggered');
    
    if (validateStep2()) {
      console.log('✅ Validation passed, navigating to onboarding');
      // Store all registration data and go to onboarding
      const registrationData = {
        ...accountInfo,
        ...profileInfo
      };
      localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
      console.log('💾 Data saved to localStorage:', registrationData);
      console.log('💾 Account info:', accountInfo);
      console.log('💾 Profile info:', profileInfo);
      console.log('💾 Password included:', !!registrationData.password);
      navigate('/onboarding');
    } else {
      console.log('❌ Validation failed:', errors);
    }
  };

  const handleAccountInfoChange = (e) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfileInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Your Account</h1>
          <p>Step {currentStep} of 2</p>
        </div>

        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={accountInfo.email}
                  onChange={handleAccountInfoChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={accountInfo.password}
                  onChange={handleAccountInfoChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a strong password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={accountInfo.confirmPassword}
                  onChange={handleAccountInfoChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="register-button">
              Continue to Profile
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileInfo.fullName}
                  onChange={handleProfileInfoChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profileInfo.dateOfBirth}
                  onChange={handleProfileInfoChange}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="genderIdentity">Gender Identity *</label>
                <select
                  id="genderIdentity"
                  name="genderIdentity"
                  value={profileInfo.genderIdentity}
                  onChange={handleProfileInfoChange}
                  className={errors.genderIdentity ? 'error' : ''}
                >
                  <option value="">Select your gender identity</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Trans man">Trans man</option>
                  <option value="Trans woman">Trans woman</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Intersex">Intersex</option>
                  <option value="Other">Other</option>
                </select>
                {errors.genderIdentity && <span className="error-message">{errors.genderIdentity}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="pronouns">Pronouns *</label>
                <select
                  id="pronouns"
                  name="pronouns"
                  value={profileInfo.pronouns}
                  onChange={handleProfileInfoChange}
                  className={errors.pronouns ? 'error' : ''}
                >
                  <option value="">Select your pronouns</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="other">other</option>
                </select>
                {errors.pronouns && <span className="error-message">{errors.pronouns}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sexAssignedAtBirth">Sex Assigned at Birth *</label>
                <select
                  id="sexAssignedAtBirth"
                  name="sexAssignedAtBirth"
                  value={profileInfo.sexAssignedAtBirth}
                  onChange={handleProfileInfoChange}
                  className={errors.sexAssignedAtBirth ? 'error' : ''}
                >
                  <option value="">Select your sex assigned at birth</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Intersex">Intersex</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.sexAssignedAtBirth && <span className="error-message">{errors.sexAssignedAtBirth}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="countryOfResidence">Country of Residence *</label>
                <input
                  type="text"
                  id="countryOfResidence"
                  name="countryOfResidence"
                  value={profileInfo.countryOfResidence}
                  onChange={handleProfileInfoChange}
                  className={errors.countryOfResidence ? 'error' : ''}
                  placeholder="Enter your country"
                />
                {errors.countryOfResidence && <span className="error-message">{errors.countryOfResidence}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredLanguage">Preferred Language</label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={profileInfo.preferredLanguage}
                  onChange={handleProfileInfoChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row" style={{ gap: 10, marginTop: 10 }}>
              <button type="button" className="register-button secondary" onClick={() => setCurrentStep(1)}>
                Back
              </button>
              <button type="submit" className="register-button">
                Continue to Health Questionnaire
              </button>
            </div>
          </form>
        )}

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
