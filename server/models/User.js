import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Basic Profile
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: false
  },
  genderIdentity: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Trans man', 'Trans woman', 'Non-binary', 'Intersex', 'Other']
  },
  genderIdentityOther: {
    type: String,
    trim: true
  },
  pronouns: {
    type: String,
    required: true,
    enum: ['she/her', 'he/him', 'they/them', 'other']
  },
  pronounsOther: {
    type: String,
    trim: true
  },
  sexAssignedAtBirth: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Intersex', 'Prefer not to say']
  },
  countryOfResidence: {
    type: String,
    required: true
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },

  // Anatomy & Transition
  reproductiveAnatomy: [{
    type: String,
    enum: ['Uterus & ovaries', 'Vagina', 'Penis', 'Testes', 'Prostate', 'Other']
  }],
  reproductiveAnatomyOther: {
    type: String,
    trim: true
  },
  reproductiveSurgeries: [{
    surgery: {
      type: String,
      enum: ['Hysterectomy', 'Orchiectomy', 'Mastectomy', 'Tubal ligation', 'Vasectomy', 'Gender-affirming surgery', 'Other']
    },
    surgeryOther: String,
    date: Date,
    notes: String
  }],
  hormoneTherapy: {
    isOnTherapy: {
      type: Boolean,
      default: false
    },
    medications: [{
      type: String,
      enum: ['Estrogen', 'Testosterone', 'Puberty blockers', 'Progesterone', 'Anti-androgens', 'Other']
    }],
    medicationOther: String,
    startDate: Date,
    dosage: String,
    notes: String
  },

  // Medical Background
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft']
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lbs']
    }
  },
  allergies: [{
    type: String,
    enum: ['Medications', 'Latex', 'Foods', 'Other']
  }],
  allergiesDetails: String,
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    notes: String
  }],
  chronicConditions: [{
    condition: {
      type: String,
      enum: ['Diabetes', 'Thyroid disorder', 'Hypertension', 'Asthma', 'Autoimmune', 'PCOS', 'Endometriosis', 'Other']
    },
    conditionOther: String,
    diagnosedDate: Date,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe']
    },
    notes: String
  }],
  pastSurgeries: [{
    surgery: String,
    date: Date,
    notes: String
  }],

  // Family History
  familyHistory: {
    reproductiveCancers: [{
      type: String,
      enum: ['Breast cancer', 'Ovarian cancer', 'Uterine cancer', 'Prostate cancer', 'Testicular cancer']
    }],
    geneticDisorders: [{
      type: String,
      enum: ['Sickle cell', 'Thalassemia', 'Cystic fibrosis', 'BRCA mutation', 'Other']
    }],
    geneticDisordersOther: String
  },

  // Vaccination History
  vaccinations: {
    hpv: {
      type: String,
      enum: ['Yes', 'No', 'Not sure']
    },
    hepatitisB: {
      type: String,
      enum: ['Yes', 'No', 'Not sure']
    },
    rubellaVaricella: {
      type: String,
      enum: ['Yes', 'No', 'Not sure']
    }
  },

  // Lifestyle Factors
  lifestyle: {
    diet: {
      type: String,
      enum: ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Other']
    },
    dietRestrictions: String,
    supplements: [String],
    alcoholUse: {
      type: String,
      enum: ['Never', 'Occasionally', 'Regularly']
    },
    tobaccoUse: {
      type: String,
      enum: ['Never', 'Occasionally', 'Daily']
    },
    recreationalDrugs: {
      type: String,
      enum: ['Never', 'Occasionally', 'Regularly']
    },
    exerciseFrequency: {
      type: String,
      enum: ['Sedentary', '1-2x week', '3-5x week', 'Daily']
    },
    sleepQuality: {
      type: String,
      enum: ['Poor', 'Fair', 'Good']
    },
    stressLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High']
    }
  },

  // Mental Health
  mentalHealth: {
    diagnosedConditions: [{
      condition: {
        type: String,
        enum: ['Depression', 'Anxiety', 'Bipolar', 'Eating disorder', 'PTSD', 'Other']
      },
      conditionOther: String,
      diagnosedDate: Date,
      notes: String
    }],
    moodChangesRelatedTo: {
      type: String,
      enum: ['Cycle', 'Hormones', 'Life stage', 'None']
    },
    moodChangesDetails: String,
    traumaHistory: {
      type: String,
      enum: ['Yes', 'No', 'Prefer not to say']
    },
    genderDysphoria: {
      type: String,
      enum: ['Yes', 'No', 'Prefer not to say']
    }
  },

  // Sexual & Relationship Health
  sexualHealth: {
    sexualOrientation: {
      type: String,
      enum: ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say']
    },
    sexualOrientationOther: String,
    relationshipStatus: {
      type: String,
      enum: ['Single', 'Partnered', 'Married', 'Other']
    },
    isSexuallyActive: {
      type: Boolean,
      default: false
    },
    partners: [{
      type: String,
      enum: ['Male', 'Female', 'Other']
    }],
    protection: [{
      type: String,
      enum: ['Condoms', 'PrEP', 'Contraception', 'None']
    }],
    stiHistory: [{
      sti: String,
      date: Date,
      treated: Boolean
    }],
    sexualHealthConcerns: [{
      type: String,
      enum: ['Pain', 'Dryness', 'Erectile dysfunction', 'Low libido', 'Orgasm issues', 'Other']
    }],
    sexualHealthConcernsOther: String
  },

  // Reproductive Health (Branching)
  reproductiveHealth: {
    // AFAB-specific
    afab: {
      ageAtFirstPeriod: Number,
      cycleRegularity: {
        type: String,
        enum: ['Regular', 'Irregular', 'Absent']
      },
      averageCycleLength: Number,
      flowIntensity: {
        type: String,
        enum: ['Light', 'Moderate', 'Heavy']
      },
      painfulPeriods: {
        type: Boolean,
        default: false
      },
      pmsPmdd: {
        type: Boolean,
        default: false
      },
      currentStatus: [{
        type: String,
        enum: ['Pregnant', 'Trying to conceive', 'Postpartum', 'Breastfeeding', 'Perimenopause', 'Menopause']
      }],
      conditions: [{
        type: String,
        enum: ['PCOS', 'Endometriosis', 'Fibroids', 'Recurrent infections']
      }],
      contraception: [{
        type: String,
        enum: ['Pill', 'IUD', 'Implant', 'Patch', 'Ring', 'Condoms', 'None']
      }],
      pregnancies: [{
        number: Number,
        outcome: {
          type: String,
          enum: ['Live birth', 'Miscarriage', 'Abortion', 'Stillbirth', 'Ectopic']
        },
        year: Number,
        complications: String
      }],
      pregnancyComplications: [{
        type: String,
        enum: ['Gestational diabetes', 'Preeclampsia', 'Preterm labor', 'Other']
      }],
      lastPapSmear: Date
    },

    // AMAB-specific
    amab: {
      pubertyHistory: {
        type: String,
        enum: ['Normal', 'Early', 'Delayed']
      },
      fertilityConcerns: {
        type: Boolean,
        default: false
      },
      fertilityDetails: String,
      sexualHealthConcerns: [{
        type: String,
        enum: ['Erectile dysfunction', 'Ejaculation problems', 'Pain', 'Other']
      }],
      prostateHealth: {
        urinaryIssues: Boolean,
        familyHistory: Boolean,
        notes: String
      },
      lastProstateScreening: Date
    },

    // Trans/Intersex specific
    transIntersex: {
      hormoneTherapyHistory: [{
        type: String,
        dosage: String,
        duration: String,
        sideEffects: String,
        startDate: Date,
        endDate: Date
      }],
      surgeries: [{
        surgery: String,
        date: Date,
        notes: String
      }],
      menstruationChanges: {
        type: String,
        enum: ['Stopped', 'Reduced', 'Irregular', 'No change', 'N/A']
      },
      fertilityPreservation: {
        type: String,
        enum: ['Egg banking', 'Sperm banking', 'Ovarian tissue freezing', 'None', 'Considering']
      },
      dysphoriaConcerns: String
    }
  },

  // Preventive Care
  preventiveCare: {
    lastMammogram: Date,
    lastBoneHealthCheck: Date,
    otherScreenings: [{
      screening: String,
      date: Date,
      results: String
    }]
  },

  // Current Concerns & Goals
  currentConcerns: [{
    type: String,
    enum: ['Pain or discomfort', 'Irregular cycles/bleeding', 'Fertility support', 'Pregnancy support', 'Postpartum care', 'Contraception guidance', 'Menopause/andropause support', 'Sexual wellness', 'STI concerns', 'Hormone therapy management', 'General preventive check-up', 'Other']
  }],
  currentConcernsOther: String,
  
  goals: [{
    type: String,
    enum: ['Cycle/menstrual tracking', 'Contraceptive management', 'Fertility & conception', 'Pregnancy & postpartum support', 'Menopause/andropause care', 'Gender-affirming health support', 'Sexual health tracking', 'Chronic condition management', 'General wellness & lifestyle support']
  }],

  // Preferences
  preferences: {
    reminders: {
      medication: { type: Boolean, default: true },
      cycle: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true }
    },
    dataSharing: {
      clinician: { type: Boolean, default: false },
      partner: { type: Boolean, default: false },
      private: { type: Boolean, default: true }
    },
    privacySettings: {
      discreetNotifications: { type: Boolean, default: true },
      anonymizedData: { type: Boolean, default: false }
    }
  },

  // Onboarding Status
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 0
  },
  onboardingData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate age
userSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
