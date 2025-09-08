import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile analysis functions
  const analyzeProfile = useCallback((userData) => {
    if (!userData) return null;
    
    // Extract key profile information
    const profileInfo = {
      // Basic identity
      genderIdentity: userData.genderIdentity || '',
      sexAssignedAtBirth: userData.sexAssignedAtBirth || '',
      pronouns: userData.pronouns || '',
      
      // Anatomy and transition
      reproductiveAnatomy: userData.reproductiveAnatomy || [],
      hormoneTherapy: userData.hormoneTherapy || 'No',
      surgeries: userData.reproductiveSurgeries || [],
      
      // Health goals
      goals: userData.goals || [],
      concerns: userData.currentConcerns || [],
      
      // Medical info
      medical: {
        chronicConditions: userData.chronicConditions || [],
        medications: userData.medications || '',
        allergies: userData.allergies || ''
      },
      lifestyle: {
        diet: userData.diet || '',
        alcohol: userData.alcohol || '',
        tobacco: userData.tobacco || '',
        exercise: userData.exercise || '',
        sleep: userData.sleep || '',
        stress: userData.stress || ''
      },
      mental: {
        stressLevel: userData.stressLevel || '',
        mentalHealthConditions: userData.mentalHealthConditions || [],
        mentalHealthResources: userData.mentalHealthResources || false
      },
      sexual: userData.sexualHealth || {},
      reproductive: userData.reproductiveHealth || {},
      preventive: userData.preventiveCare || {},
      
      // Preferences
      preferences: {
        personalizedRecommendations: userData.personalizedRecommendations || false,
        dataSharing: userData.dataSharing || false,
        notifications: userData.notifications || true
      }
    };

    // Determine user type for dashboard customization
    const userType = determineUserType(profileInfo);
    
    return {
      ...profileInfo,
      userType,
      dashboardConfig: getDashboardConfig(userType, profileInfo)
    };
  }, []);

  const determineUserType = (profileInfo) => {
    const { genderIdentity, sexAssignedAtBirth, reproductiveAnatomy, hormoneTherapy } = profileInfo;
    
    // Check for trans/non-binary identity
    const isTrans = genderIdentity.toLowerCase().includes('trans') || 
                   genderIdentity.toLowerCase().includes('non-binary') ||
                   genderIdentity.toLowerCase().includes('gender diverse');
    
    // Check for hormone therapy
    const isOnHormones = hormoneTherapy === 'Yes';
    
    // Check anatomy
    const hasUterus = reproductiveAnatomy.includes('Uterus & ovaries') || reproductiveAnatomy.includes('Vagina');
    const hasPenis = reproductiveAnatomy.includes('Penis') || reproductiveAnatomy.includes('Testes') || reproductiveAnatomy.includes('Prostate');
    
    if (isTrans || isOnHormones) {
      if (hasUterus && hasPenis) return 'intersex';
      if (hasUterus) return 'trans_female';
      if (hasPenis) return 'trans_male';
      return 'trans_non_binary';
    }
    
    if (hasUterus) return 'female_afab';
    if (hasPenis) return 'male_amab';
    
    // Fallback based on assigned sex
    if (sexAssignedAtBirth === 'Female') return 'female_afab';
    if (sexAssignedAtBirth === 'Male') return 'male_amab';
    
    return 'non_binary';
  };

  const getDashboardConfig = (userType, profileInfo) => {
    const baseConfig = {
      // Shared sections for all users
      shared: {
        healthOverview: true,
        moodTracking: true,
        sleepLogging: true,
        energyLevels: true,
        stressManagement: true,
        lifestyleHabits: true,
        recentActivity: true,
        reminders: true,
        aiInsights: true
      },
      
      // Gender-specific sections
      genderSpecific: {},
      
      // Quick actions
      quickActions: {
        logSymptoms: true,
        addMedication: true,
        recordAppointment: true,
        uploadRecords: true
      }
    };

    switch (userType) {
      case 'female_afab':
        baseConfig.genderSpecific = {
          cycleTracker: true,
          fertilityInsights: true,
          hormonalHealth: true,
          breastHealth: true,
          pregnancyPlanning: true,
          reproductiveHealth: true,
          menstrualSymptoms: true,
          ovulationTracking: true,
          periodFlow: true,
          pmsTracking: true
        };
        baseConfig.quickActions.cycleTracker = true;
        break;

      case 'male_amab':
        baseConfig.genderSpecific = {
          prostateHealth: true,
          testicularHealth: true,
          cardiovascularHealth: true,
          metabolicHealth: true,
          fitnessTracking: true,
          hormonalBalance: true,
          fertilityTracking: true,
          libidoTracking: true
        };
        baseConfig.quickActions.fitnessTracker = true;
        break;

      case 'trans_female':
        baseConfig.genderSpecific = {
          hormoneTherapy: true,
          genderAffirmingCare: true,
          cycleTracker: true,
          fertilityInsights: true,
          breastHealth: true,
          surgeryRecovery: true,
          dysphoriaTracking: true,
          euphoriaTracking: true
        };
        baseConfig.quickActions.hormoneTracker = true;
        break;

      case 'trans_male':
        baseConfig.genderSpecific = {
          hormoneTherapy: true,
          genderAffirmingCare: true,
          prostateHealth: true,
          testicularHealth: true,
          surgeryRecovery: true,
          dysphoriaTracking: true,
          euphoriaTracking: true,
          fertilityTracking: true
        };
        baseConfig.quickActions.hormoneTracker = true;
        break;

      case 'trans_non_binary':
      case 'non_binary':
        baseConfig.genderSpecific = {
          hormoneTherapy: true,
          genderAffirmingCare: true,
          dysphoriaTracking: true,
          euphoriaTracking: true,
          surgeryRecovery: true,
          inclusiveHealth: true,
          customTracking: true
        };
        baseConfig.quickActions.hormoneTracker = true;
        break;

      case 'intersex':
        baseConfig.genderSpecific = {
          hormoneTherapy: true,
          genderAffirmingCare: true,
          cycleTracker: true,
          fertilityInsights: true,
          prostateHealth: true,
          testicularHealth: true,
          breastHealth: true,
          customTracking: true
        };
        baseConfig.quickActions.hormoneTracker = true;
        break;

      default:
        baseConfig.genderSpecific = {
          inclusiveHealth: true,
          customTracking: true
        };
    }

    return baseConfig;
  };

  // Load profile data when user changes
  React.useEffect(() => {
    if (user) {
      console.log('🔄 ProfileContext: Loading profile for user:', user);
      const analyzedProfile = analyzeProfile(user);
      console.log('📊 ProfileContext: Analyzed profile:', analyzedProfile);
      setProfile(analyzedProfile);
      setLoading(false);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, analyzeProfile]);

  const value = {
    profile,
    loading,
    userType: profile?.userType,
    dashboardConfig: profile?.dashboardConfig,
    isFemale: profile?.userType === 'female_afab',
    isMale: profile?.userType === 'male_amab',
    isTrans: profile?.userType?.startsWith('trans') || profile?.userType === 'non_binary',
    isIntersex: profile?.userType === 'intersex',
    hasUterus: profile?.reproductiveAnatomy?.includes('Uterus & ovaries') || profile?.reproductiveAnatomy?.includes('Vagina'),
    hasPenis: profile?.reproductiveAnatomy?.includes('Penis') || profile?.reproductiveAnatomy?.includes('Testes') || profile?.reproductiveAnatomy?.includes('Prostate'),
    isOnHormones: profile?.hormoneTherapy === 'Yes'
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
