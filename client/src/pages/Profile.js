import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useHealthData } from '../context/HealthDataContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const { profile, userType, isFemale, isMale, isTrans, isIntersex } = useProfile();
  const { healthData, updateGoals } = useHealthData();
  const navigate = useNavigate();

  // Form states
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    dateOfBirth: profile?.dateOfBirth || '',
    pronouns: profile?.pronouns || '',
    location: profile?.location || '',
    emergencyContact: {
      name: profile?.emergencyContact?.name || '',
      relationship: profile?.emergencyContact?.relationship || '',
      phone: profile?.emergencyContact?.phone || ''
    }
  });

  // Health Goals (Gender-specific)
  const [healthGoals, setHealthGoals] = useState({
    general: {
      sleepGoal: 8,
      exerciseGoal: 30,
      waterGoal: 8,
      stressManagement: 'meditation'
    },
    // Female/AFAB specific
    reproductive: {
      cycleTracking: false,
      fertilityAwareness: false,
      breastHealthReminders: false,
      pregnancyPlanning: false
    },
    // Male/AMAB specific
    maleHealth: {
      prostateScreening: false,
      testicularSelfExam: false,
      fitnessTracking: false,
      testosteroneMonitoring: false
    },
    // Trans/Gender Diverse specific
    genderAffirming: {
      hormoneTherapy: false,
      dysphoriaTracking: false,
      surgeryRecovery: false,
      genderExpression: false
    },
    // Intersex specific
    intersexHealth: {
      hormoneMonitoring: false,
      specialistCare: false,
      customTracking: false,
      communitySupport: false
    }
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: {
      healthData: 'private',
      analytics: 'anonymous',
      research: 'opt-out',
      providers: 'consent-required'
    },
    notifications: {
      reminders: true,
      insights: true,
      updates: true,
      marketing: false
    },
    visibility: {
      profile: 'private',
      healthScore: 'private',
      goals: 'private'
    }
  });

  // Profile Picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(user?.profilePicture || null);

  // Load existing data
  useEffect(() => {
    if (profile) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        dateOfBirth: profile.dateOfBirth || prev.dateOfBirth,
        pronouns: profile.pronouns || prev.pronouns,
        location: profile.location || prev.location,
        emergencyContact: {
          name: profile.emergencyContact?.name || prev.emergencyContact.name,
          relationship: profile.emergencyContact?.relationship || prev.emergencyContact.relationship,
          phone: profile.emergencyContact?.phone || prev.emergencyContact.phone
        }
      }));

      // Load existing goals
      const existingGoals = healthData.goals || {};
      setHealthGoals(prev => ({
        ...prev,
        ...existingGoals
      }));
    }
  }, [profile, user, healthData.goals]);

  // Handle form changes with validation
  const handlePersonalChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleGoalChange = (category, field, value) => {
    setHealthGoals(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (category, field, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Handle profile picture upload
  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target.result);
        setProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!personalInfo.fullName.trim()) {
        alert('Full name is required');
        setIsLoading(false);
        return;
      }
      
      if (!personalInfo.email.trim()) {
        alert('Email is required');
        setIsLoading(false);
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalInfo.email)) {
        alert('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate emergency contact if provided
      if (personalInfo.emergencyContact.name.trim() || 
          personalInfo.emergencyContact.phone.trim() || 
          personalInfo.emergencyContact.relationship.trim()) {
        
        if (!personalInfo.emergencyContact.name.trim()) {
          alert('Emergency contact name is required if providing emergency contact information');
          setIsLoading(false);
          return;
        }
        
        if (!personalInfo.emergencyContact.phone.trim()) {
          alert('Emergency contact phone number is required if providing emergency contact information');
          setIsLoading(false);
          return;
        }
        
        if (!validatePhoneNumber(personalInfo.emergencyContact.phone)) {
          alert('Please enter a valid phone number for emergency contact');
          setIsLoading(false);
          return;
        }
        
        if (!personalInfo.emergencyContact.relationship.trim()) {
          alert('Emergency contact relationship is required if providing emergency contact information');
          setIsLoading(false);
          return;
        }
      }

      // Save personal info to localStorage (simulate API call)
      const updatedProfile = {
        ...profile,
        ...personalInfo,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      // Save health goals
      await updateGoals(healthGoals);

      // Save privacy settings
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));

      // Save profile picture (simulate upload)
      if (profilePicture) {
        localStorage.setItem('profilePicture', picturePreview);
        // Update user object with new profile picture
        const updatedUser = { ...user, profilePicture: picturePreview };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export health data
  const handleExportData = () => {
    try {
      const exportData = {
        user: user,
        profile: profile,
        healthData: healthData,
        goals: healthGoals,
        privacySettings: privacySettings,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-${user?.fullName}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert('Health data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      // Clear all data
      localStorage.clear();
      await logout();
      navigate('/');
      alert('Account deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  // Get gender-specific goal categories
  const getGenderSpecificGoals = () => {
    if (isFemale) return ['reproductive'];
    if (isMale) return ['maleHealth'];
    if (isTrans) return ['genderAffirming'];
    if (isIntersex) return ['intersexHealth'];
    return [];
  };

  // Get user type display name
  const getUserTypeDisplay = () => {
    switch (userType) {
      case 'female_afab': return 'Female/AFAB Health Dashboard';
      case 'male_amab': return 'Male/AMAB Health Dashboard';
      case 'trans_female': return 'Trans Female Health Dashboard';
      case 'trans_male': return 'Trans Male Health Dashboard';
      case 'trans_non_binary': return 'Non-Binary Health Dashboard';
      case 'intersex': return 'Intersex Health Dashboard';
      case 'non_binary': return 'Non-Binary Health Dashboard';
      default: return 'Health Dashboard';
    }
  };

  return (
    <div className="profile-container">
      {/* Success Message */}
      {saveSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          Profile updated successfully!
        </div>
      )}

      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <span className="back-icon">←</span>
            Back to Dashboard
          </button>
          <div className="header-center">
            <h1>Profile Settings</h1>
            <div className="user-type-badge">
              {getUserTypeDisplay()}
            </div>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <span className="edit-icon">✏️</span>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to original values
                    setPersonalInfo({
                      fullName: user?.fullName || '',
                      email: user?.email || '',
                      dateOfBirth: profile?.dateOfBirth || '',
                      pronouns: profile?.pronouns || '',
                      location: profile?.location || '',
                      emergencyContact: {
                        name: profile?.emergencyContact?.name || '',
                        relationship: profile?.emergencyContact?.relationship || '',
                        phone: profile?.emergencyContact?.phone || ''
                      }
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={`save-btn ${isLoading ? 'loading' : ''}`}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Picture Section */}
      <section className="profile-picture-section">
        <div className="picture-container">
          <div className="picture-wrapper">
            <img 
              src={picturePreview || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDE0MCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIiByeD0iNzAiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjcwIiBjeT0iNjAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzAgMTIwQzMwIDEwMCA1MCA5MCA3MCA5MEM5MCA5MCAxMTAgMTAwIDExMCAxMjBIMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDBfbGluZWFyXzFfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iMTQwIiB5Mj0iMTQwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+'} 
              alt="Profile" 
              className="profile-picture"
            />
            {isEditing && (
              <div className="picture-overlay">
                <label htmlFor="picture-upload" className="upload-btn">
                  <span className="upload-icon">📷</span>
                  Change Photo
                </label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          <div className="picture-info">
            <h2>{user?.fullName}</h2>
            <p className="user-email">{user?.email}</p>
            <p className="user-pronouns">({profile?.pronouns})</p>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-number">{healthData.history.length}</span>
                <span className="stat-label">Health Logs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {Object.values(healthGoals).flatMap(category => 
                    Object.values(category).filter(goal => typeof goal === 'boolean' && goal)
                  ).length}
                </span>
                <span className="stat-label">Goals Set</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <span className="tab-icon">👤</span>
          Personal Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <span className="tab-icon">🎯</span>
          Health Goals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          <span className="tab-icon">🔒</span>
          Privacy & Security
        </button>
        <button 
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <span className="tab-icon">📊</span>
          Data Management
        </button>
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <section className="personal-info-section">
            <div className="section-header">
              <div className="header-left">
                <h2>Personal Information</h2>
                <p className="section-description">Manage your basic profile information and emergency contacts</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>

              <div className="form-group">
                <label>Pronouns</label>
                <select
                  value={personalInfo.pronouns}
                  onChange={(e) => handlePersonalChange('pronouns', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                >
                  <option value="">Select pronouns</option>
                  <option value="she/her">She/Her</option>
                  <option value="he/him">He/Him</option>
                  <option value="they/them">They/Them</option>
                  <option value="she/they">She/They</option>
                  <option value="he/they">He/They</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="City, State"
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="emergency-contact">
              <div className="emergency-header">
                <h3>🆘 Emergency Contact</h3>
                <p>Someone to contact in case of emergency (optional)</p>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={personalInfo.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    placeholder="Enter contact name"
                    disabled={!isEditing}
                    className={!isEditing ? 'disabled' : ''}
                  />
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={personalInfo.emergencyContact.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Friend"
                    disabled={!isEditing}
                    className={!isEditing ? 'disabled' : ''}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.emergencyContact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    disabled={!isEditing}
                    className={!isEditing ? 'disabled' : ''}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Health Goals Tab */}
        {activeTab === 'goals' && (
          <section className="goals-section">
            <div className="section-header">
              <div className="header-left">
                <h2>Health Goals</h2>
                <p className="section-description">Set personalized health goals based on your needs</p>
              </div>
            </div>

            {/* General Health Goals */}
            <div className="goals-category">
              <h3>🌱 General Health Goals</h3>
              <div className="goals-grid">
                <div className="goal-item">
                  <label>Sleep Goal (hours)</label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    value={healthGoals.general.sleepGoal}
                    onChange={(e) => handleGoalChange('general', 'sleepGoal', parseInt(e.target.value))}
                  />
                </div>

                <div className="goal-item">
                  <label>Exercise Goal (minutes/day)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={healthGoals.general.exerciseGoal}
                    onChange={(e) => handleGoalChange('general', 'exerciseGoal', parseInt(e.target.value))}
                  />
                </div>

                <div className="goal-item">
                  <label>Water Goal (glasses/day)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={healthGoals.general.waterGoal}
                    onChange={(e) => handleGoalChange('general', 'waterGoal', parseInt(e.target.value))}
                  />
                </div>

                <div className="goal-item">
                  <label>Stress Management</label>
                  <select
                    value={healthGoals.general.stressManagement}
                    onChange={(e) => handleGoalChange('general', 'stressManagement', e.target.value)}
                  >
                    <option value="meditation">Meditation</option>
                    <option value="exercise">Exercise</option>
                    <option value="journaling">Journaling</option>
                    <option value="therapy">Therapy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gender-Specific Goals */}
            {getGenderSpecificGoals().map(category => (
              <div key={category} className="goals-category">
                <h3>
                  {category === 'reproductive' && '🩸 Reproductive Health Goals'}
                  {category === 'maleHealth' && '👨 Male Health Goals'}
                  {category === 'genderAffirming' && '🏳️‍⚧️ Gender-Affirming Health Goals'}
                  {category === 'intersexHealth' && '⚧ Intersex Health Goals'}
                </h3>
                <div className="goals-grid">
                  {Object.entries(healthGoals[category]).map(([goal, value]) => (
                    <div key={goal} className="goal-item checkbox-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleGoalChange(category, goal, e.target.checked)}
                        />
                        <span className="checkbox-custom"></span>
                        {goal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Privacy & Security Tab */}
        {activeTab === 'privacy' && (
          <section className="privacy-section">
            <div className="section-header">
              <div className="header-left">
                <h2>Privacy & Security</h2>
                <p className="section-description">Control how your data is shared and used</p>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="privacy-category">
              <h3>📤 Data Sharing Preferences</h3>
              <div className="privacy-grid">
                <div className="privacy-item">
                  <label>Health Data</label>
                  <select
                    value={privacySettings.dataSharing.healthData}
                    onChange={(e) => handlePrivacyChange('dataSharing', 'healthData', e.target.value)}
                  >
                    <option value="private">Private</option>
                    <option value="providers">Healthcare Providers Only</option>
                    <option value="research">Research (Anonymous)</option>
                  </select>
                </div>

                <div className="privacy-item">
                  <label>Analytics</label>
                  <select
                    value={privacySettings.dataSharing.analytics}
                    onChange={(e) => handlePrivacyChange('dataSharing', 'analytics', e.target.value)}
                  >
                    <option value="anonymous">Anonymous</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="privacy-item">
                  <label>Research Participation</label>
                  <select
                    value={privacySettings.dataSharing.research}
                    onChange={(e) => handlePrivacyChange('dataSharing', 'research', e.target.value)}
                  >
                    <option value="opt-out">Opt-out</option>
                    <option value="opt-in">Opt-in</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="privacy-category">
              <h3>🔔 Notification Preferences</h3>
              <div className="privacy-grid">
                {Object.entries(privacySettings.notifications).map(([notification, enabled]) => (
                  <div key={notification} className="privacy-item checkbox-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handlePrivacyChange('notifications', notification, e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      {notification.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="privacy-category">
              <h3>👁️ Profile Visibility</h3>
              <div className="privacy-grid">
                {Object.entries(privacySettings.visibility).map(([item, visibility]) => (
                  <div key={item} className="privacy-item">
                    <label>{item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                    <select
                      value={visibility}
                      onChange={(e) => handlePrivacyChange('visibility', item, e.target.value)}
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <section className="data-section">
            <div className="section-header">
              <div className="header-left">
                <h2>Data Management</h2>
                <p className="section-description">Export your data or manage your account</p>
              </div>
            </div>

            <div className="data-actions">
              <div className="data-action">
                <div className="action-icon">📥</div>
                <h3>Export Health Data</h3>
                <p>Download all your health data in JSON format for backup or transfer</p>
                <button className="export-btn" onClick={handleExportData}>
                  Export Data
                </button>
              </div>

              <div className="data-action">
                <div className="action-icon">🗑️</div>
                <h3>Account Deletion</h3>
                <p>Permanently delete your account and all associated data</p>
                <button 
                  className="delete-btn" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Data Summary */}
            <div className="data-summary">
              <h3>📊 Your Data Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-icon">📝</span>
                  <span className="summary-label">Health Logs</span>
                  <span className="summary-value">{healthData.history.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">📅</span>
                  <span className="summary-label">Days Tracked</span>
                  <span className="summary-value">{healthData.history.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🎯</span>
                  <span className="summary-label">Goals Set</span>
                  <span className="summary-value">
                    {Object.values(healthGoals).flatMap(category => 
                      Object.values(category).filter(goal => typeof goal === 'boolean' && goal)
                    ).length}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🕒</span>
                  <span className="summary-label">Last Updated</span>
                  <span className="summary-value">
                    {profile?.lastUpdated ? 
                      new Date(profile.lastUpdated).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">⚠️</div>
            <h3>Delete Account</h3>
            <p>Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your health data.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
