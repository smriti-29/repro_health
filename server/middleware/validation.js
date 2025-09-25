import { body, validationResult } from 'express-validator';

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('genderIdentity')
    .isIn(['Male', 'Female', 'Trans man', 'Trans woman', 'Non-binary', 'Intersex', 'Other'])
    .withMessage('Please select a valid gender identity'),
  
  body('genderIdentityOther')
    .if(body('genderIdentity').equals('Other'))
    .notEmpty()
    .withMessage('Please specify your gender identity'),
  
  body('pronouns')
    .isIn(['she/her', 'he/him', 'they/them', 'other'])
    .withMessage('Please select valid pronouns'),
  
  body('pronounsOther')
    .if(body('pronouns').equals('other'))
    .notEmpty()
    .withMessage('Please specify your pronouns'),
  
  body('sexAssignedAtBirth')
    .isIn(['Male', 'Female', 'Intersex', 'Prefer not to say'])
    .withMessage('Please select a valid option'),
  
  body('countryOfResidence')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  
  body('preferredLanguage')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Language must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Onboarding validation
export const validateOnboardingStep = (step) => {
  const validations = {
    1: [
      body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
      
      body('dateOfBirth')
        .isISO8601()
        .withMessage('Please enter a valid date of birth'),
      
      body('genderIdentity')
        .isIn(['Male', 'Female', 'Trans man', 'Trans woman', 'Non-binary', 'Intersex', 'Other'])
        .withMessage('Please select a valid gender identity'),
      
      body('pronouns')
        .isIn(['she/her', 'he/him', 'they/them', 'other'])
        .withMessage('Please select valid pronouns'),
      
      body('sexAssignedAtBirth')
        .isIn(['Male', 'Female', 'Intersex', 'Prefer not to say'])
        .withMessage('Please select a valid option'),
      
      body('countryOfResidence')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Country must be between 2 and 100 characters')
    ],
    
    2: [
      body('reproductiveAnatomy')
        .isArray({ min: 1 })
        .withMessage('Please select at least one reproductive anatomy option'),
      
      body('reproductiveAnatomy')
        .custom((value) => {
          if (Array.isArray(value)) {
            const validOptions = ['Uterus & ovaries', 'Vagina', 'Penis', 'Testes', 'Prostate', 'Other'];
            for (const item of value) {
              if (!validOptions.includes(item)) {
                throw new Error('Please select valid anatomy options');
              }
            }
          }
          return true;
        }),
      
      body('reproductiveSurgeries')
        .optional()
        .isArray()
        .withMessage('Surgeries must be an array'),
      
      body('hormoneTherapy.isOnTherapy')
        .isBoolean()
        .withMessage('Please specify if you are on hormone therapy')
    ],
    
    3: [
      body('height.value')
        .optional()
        .isFloat({ min: 50, max: 300 })
        .withMessage('Please enter a valid height'),
      
      body('height.unit')
        .optional()
        .isIn(['cm', 'ft'])
        .withMessage('Please select a valid height unit'),
      
      body('weight.value')
        .optional()
        .isFloat({ min: 20, max: 500 })
        .withMessage('Please enter a valid weight'),
      
      body('weight.unit')
        .optional()
        .isIn(['kg', 'lbs'])
        .withMessage('Please select a valid weight unit'),
      
      body('allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),
      
      body('currentMedications')
        .optional()
        .isArray()
        .withMessage('Medications must be an array'),
      
      body('chronicConditions')
        .optional()
        .isArray()
        .withMessage('Chronic conditions must be an array')
    ],
    
    4: [
      body('lifestyle.diet')
        .isIn(['Vegetarian', 'Non-vegetarian', 'Vegan', 'Other'])
        .withMessage('Please select a valid diet option'),
      
      body('lifestyle.alcoholUse')
        .isIn(['Never', 'Occasionally', 'Regularly'])
        .withMessage('Please select a valid alcohol use option'),
      
      body('lifestyle.tobaccoUse')
        .isIn(['Never', 'Occasionally', 'Daily'])
        .withMessage('Please select a valid tobacco use option'),
      
      body('lifestyle.exerciseFrequency')
        .isIn(['Sedentary', '1-2x week', '3-5x week', 'Daily'])
        .withMessage('Please select a valid exercise frequency'),
      
      body('lifestyle.sleepQuality')
        .isIn(['Poor', 'Fair', 'Good'])
        .withMessage('Please select a valid sleep quality'),
      
      body('lifestyle.stressLevel')
        .isIn(['Low', 'Moderate', 'High'])
        .withMessage('Please select a valid stress level')
    ],
    
    5: [
      body('mentalHealth.diagnosedConditions')
        .optional()
        .isArray()
        .withMessage('Mental health conditions must be an array'),
      
      body('mentalHealth.moodChangesRelatedTo')
        .optional()
        .isIn(['Cycle', 'Hormones', 'Life stage', 'None'])
        .withMessage('Please select a valid option'),
      
      body('mentalHealth.traumaHistory')
        .optional()
        .isIn(['Yes', 'No', 'Prefer not to say'])
        .withMessage('Please select a valid option'),
      
      body('mentalHealth.genderDysphoria')
        .optional()
        .isIn(['Yes', 'No', 'Prefer not to say'])
        .withMessage('Please select a valid option')
    ],
    
    6: [
      body('sexualHealth.relationshipStatus')
        .isIn(['Single', 'Partnered', 'Married', 'Other'])
        .withMessage('Please select a valid relationship status'),
      
      body('sexualHealth.isSexuallyActive')
        .isBoolean()
        .withMessage('Please specify if you are sexually active'),
      
      body('sexualHealth.protection')
        .optional()
        .isArray()
        .withMessage('Protection methods must be an array'),
      
      body('sexualHealth.stiHistory')
        .optional()
        .isArray()
        .withMessage('STI history must be an array')
    ],
    
    7: [
      // AFAB-specific validation
      body('reproductiveHealth.afab.ageAtFirstPeriod')
        .optional()
        .isInt({ min: 8, max: 20 })
        .withMessage('Please enter a valid age at first period'),
      
      body('reproductiveHealth.afab.cycleRegularity')
        .optional()
        .isIn(['Regular', 'Irregular', 'Absent'])
        .withMessage('Please select a valid cycle regularity'),
      
      body('reproductiveHealth.afab.averageCycleLength')
        .optional()
        .isInt({ min: 21, max: 35 })
        .withMessage('Please enter a valid cycle length'),
      
      body('reproductiveHealth.afab.flowIntensity')
        .optional()
        .isIn(['Light', 'Moderate', 'Heavy'])
        .withMessage('Please select a valid flow intensity'),
      
      // AMAB-specific validation
      body('reproductiveHealth.amab.pubertyHistory')
        .optional()
        .isIn(['Normal', 'Early', 'Delayed'])
        .withMessage('Please select a valid puberty history'),
      
      body('reproductiveHealth.amab.fertilityConcerns')
        .optional()
        .isBoolean()
        .withMessage('Please specify fertility concerns'),
      
      // Trans/Intersex specific validation
      body('reproductiveHealth.transIntersex.hormoneTherapyHistory')
        .optional()
        .isArray()
        .withMessage('Hormone therapy history must be an array'),
      
      body('reproductiveHealth.transIntersex.surgeries')
        .optional()
        .isArray()
        .withMessage('Surgeries must be an array'),
      
      body('reproductiveHealth.transIntersex.fertilityPreservation')
        .optional()
        .isIn(['Egg banking', 'Sperm banking', 'Ovarian tissue freezing', 'None', 'Considering'])
        .withMessage('Please select a valid fertility preservation option')
    ],
    
    8: [
      body('preventiveCare.lastMammogram')
        .optional()
        .isISO8601()
        .withMessage('Please enter a valid date'),
      
      body('preventiveCare.lastBoneHealthCheck')
        .optional()
        .isISO8601()
        .withMessage('Please enter a valid date'),
      
      body('preventiveCare.otherScreenings')
        .optional()
        .isArray()
        .withMessage('Other screenings must be an array')
    ],
    
    9: [
      body('currentConcerns')
        .isArray({ min: 1 })
        .withMessage('Please select at least one current concern'),
      
      body('currentConcerns')
        .custom((value) => {
          if (Array.isArray(value)) {
            const validOptions = [
              'Pain or discomfort', 'Irregular cycles/bleeding', 'Fertility support',
              'Pregnancy support', 'Postpartum care', 'Contraception guidance',
              'Menopause/andropause support', 'Sexual wellness', 'STI concerns',
              'Hormone therapy management', 'General preventive check-up', 'Other'
            ];
            for (const item of value) {
              if (!validOptions.includes(item)) {
                throw new Error('Please select valid current concerns');
              }
            }
          }
          return true;
        })
    ],
    
    10: [
      body('goals')
        .isArray({ min: 1 })
        .withMessage('Please select at least one goal'),
      
      body('goals')
        .custom((value) => {
          if (Array.isArray(value)) {
            const validOptions = [
              'Cycle/menstrual tracking', 'Contraceptive management', 'Fertility & conception',
              'Pregnancy & postpartum support', 'Menopause/andropause care',
              'Gender-affirming health support', 'Sexual health tracking',
              'Chronic condition management', 'General wellness & lifestyle support'
            ];
            for (const item of value) {
              if (!validOptions.includes(item)) {
                throw new Error('Please select valid goals');
              }
            }
          }
          return true;
        })
    ],
    
    11: [
      body('preferences.reminders.medication')
        .isBoolean()
        .withMessage('Please specify medication reminder preference'),
      
      body('preferences.reminders.cycle')
        .isBoolean()
        .withMessage('Please specify cycle reminder preference'),
      
      body('preferences.reminders.appointments')
        .isBoolean()
        .withMessage('Please specify appointment reminder preference'),
      
      body('preferences.dataSharing.clinician')
        .isBoolean()
        .withMessage('Please specify clinician data sharing preference'),
      
      body('preferences.dataSharing.partner')
        .isBoolean()
        .withMessage('Please specify partner data sharing preference'),
      
      body('preferences.dataSharing.private')
        .isBoolean()
        .withMessage('Please specify privacy preference'),
      
      body('preferences.privacySettings.discreetNotifications')
        .isBoolean()
        .withMessage('Please specify discreet notification preference'),
      
      body('preferences.privacySettings.anonymizedData')
        .isBoolean()
        .withMessage('Please specify anonymized data preference')
    ]
  };
  
  return [
    ...(validations[step] || []),
    handleValidationErrors
  ];
};

// Generic data validation for updates
export const validateUserUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('preferredLanguage')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Language must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// Medical data validation
export const validateMedicalData = [
  body('height.value')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Please enter a valid height'),
  
  body('weight.value')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Please enter a valid weight'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  
  body('currentMedications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  
  body('chronicConditions')
    .optional()
    .isArray()
    .withMessage('Chronic conditions must be an array'),
  
  handleValidationErrors
];
