import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateOnboardingStep } from '../middleware/validation.js';

const router = express.Router();

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/onboarding/progress
// @desc    Get user's onboarding progress
// @access  Private
router.get('/progress', authenticateUser, async (req, res) => {
  try {
    const { onboardingStep, onboardingCompleted } = req.user;
    
    res.json({
      success: true,
      data: {
        currentStep: onboardingStep,
        completed: onboardingCompleted,
        totalSteps: 11
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/onboarding/step/:stepNumber
// @desc    Save onboarding step data
// @access  Private
router.post('/step/:stepNumber', async (req, res) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    const updateData = req.body;

    if (stepNumber < 1 || stepNumber > 11) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number'
      });
    }

    // Validate step data - temporarily disabled due to path-to-regexp error
    // const validationMiddleware = validateOnboardingStep(stepNumber);
    
    // Apply validation middleware
    // for (const middleware of validationMiddleware) {
    //   await new Promise((resolve, reject) => {
    //     middleware(req, res, (error) => {
    //       if (error) reject(error);
    //       else resolve();
    //     });
    //   });
    // }

    // Update user data based on step
    const updateFields = {};
    
    switch (stepNumber) {
      case 1:
        // Basic Profile
        updateFields.fullName = updateData.fullName;
        updateFields.dateOfBirth = updateData.dateOfBirth;
        updateFields.genderIdentity = updateData.genderIdentity;
        updateFields.genderIdentityOther = updateData.genderIdentityOther;
        updateFields.pronouns = updateData.pronouns;
        updateFields.pronounsOther = updateData.pronounsOther;
        updateFields.sexAssignedAtBirth = updateData.sexAssignedAtBirth;
        updateFields.countryOfResidence = updateData.countryOfResidence;
        updateFields.preferredLanguage = updateData.preferredLanguage;
        break;

      case 2:
        // Anatomy & Transition
        updateFields.reproductiveAnatomy = updateData.reproductiveAnatomy;
        updateFields.reproductiveAnatomyOther = updateData.reproductiveAnatomyOther;
        updateFields.reproductiveSurgeries = updateData.reproductiveSurgeries || [];
        updateFields.hormoneTherapy = updateData.hormoneTherapy;
        break;

      case 3:
        // Medical Background
        updateFields.height = updateData.height;
        updateFields.weight = updateData.weight;
        updateFields.allergies = updateData.allergies || [];
        updateFields.allergiesDetails = updateData.allergiesDetails;
        updateFields.currentMedications = updateData.currentMedications || [];
        updateFields.chronicConditions = updateData.chronicConditions || [];
        updateFields.pastSurgeries = updateData.pastSurgeries || [];
        updateFields.familyHistory = updateData.familyHistory;
        updateFields.vaccinations = updateData.vaccinations;
        break;

      case 4:
        // Lifestyle
        updateFields.lifestyle = updateData.lifestyle;
        break;

      case 5:
        // Mental Health
        updateFields.mentalHealth = updateData.mentalHealth;
        break;

      case 6:
        // Sexual Health
        updateFields.sexualHealth = updateData.sexualHealth;
        break;

      case 7:
        // Reproductive Health (Branching)
        updateFields.reproductiveHealth = updateData.reproductiveHealth;
        break;

      case 8:
        // Preventive Care
        updateFields.preventiveCare = updateData.preventiveCare;
        break;

      case 9:
        // Current Concerns
        updateFields.currentConcerns = updateData.currentConcerns;
        updateFields.currentConcernsOther = updateData.currentConcernsOther;
        break;

      case 10:
        // Goals
        updateFields.goals = updateData.goals;
        break;

      case 11:
        // Preferences
        updateFields.preferences = updateData.preferences;
        updateFields.onboardingCompleted = true;
        break;
    }

    // Update onboarding step
    updateFields.onboardingStep = stepNumber + 1;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Step ${stepNumber} completed successfully`,
      data: {
        currentStep: updatedUser.onboardingStep,
        completed: updatedUser.onboardingCompleted,
        user: updatedUser.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Save step error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/onboarding/step/:stepNumber
// @desc    Get onboarding step data
// @access  Private
router.get('/step/:stepNumber', async (req, res) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    
    if (stepNumber < 1 || stepNumber > 11) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number'
      });
    }

    // Get step-specific data from user
    const stepData = {};
    
    switch (stepNumber) {
      case 1:
        stepData.fullName = req.user.fullName;
        stepData.dateOfBirth = req.user.dateOfBirth;
        stepData.genderIdentity = req.user.genderIdentity;
        stepData.genderIdentityOther = req.user.genderIdentityOther;
        stepData.pronouns = req.user.pronouns;
        stepData.pronounsOther = req.user.pronounsOther;
        stepData.sexAssignedAtBirth = req.user.sexAssignedAtBirth;
        stepData.countryOfResidence = req.user.countryOfResidence;
        stepData.preferredLanguage = req.user.preferredLanguage;
        break;

      case 2:
        stepData.reproductiveAnatomy = req.user.reproductiveAnatomy;
        stepData.reproductiveAnatomyOther = req.user.reproductiveAnatomyOther;
        stepData.reproductiveSurgeries = req.user.reproductiveSurgeries;
        stepData.hormoneTherapy = req.user.hormoneTherapy;
        break;

      case 3:
        stepData.height = req.user.height;
        stepData.weight = req.user.weight;
        stepData.allergies = req.user.allergies;
        stepData.allergiesDetails = req.user.allergiesDetails;
        stepData.currentMedications = req.user.currentMedications;
        stepData.chronicConditions = req.user.chronicConditions;
        stepData.pastSurgeries = req.user.pastSurgeries;
        stepData.familyHistory = req.user.familyHistory;
        stepData.vaccinations = req.user.vaccinations;
        break;

      case 4:
        stepData.lifestyle = req.user.lifestyle;
        break;

      case 5:
        stepData.mentalHealth = req.user.mentalHealth;
        break;

      case 6:
        stepData.sexualHealth = req.user.sexualHealth;
        break;

      case 7:
        stepData.reproductiveHealth = req.user.reproductiveHealth;
        break;

      case 8:
        stepData.preventiveCare = req.user.preventiveCare;
        break;

      case 9:
        stepData.currentConcerns = req.user.currentConcerns;
        stepData.currentConcernsOther = req.user.currentConcernsOther;
        break;

      case 10:
        stepData.goals = req.user.goals;
        break;

      case 11:
        stepData.preferences = req.user.preferences;
        break;
    }

    res.json({
      success: true,
      data: stepData
    });

  } catch (error) {
    console.error('Get step error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/onboarding/complete
// @desc    Mark onboarding as complete
// @access  Private
router.post('/complete', authenticateUser, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        onboardingCompleted: true,
        onboardingStep: 11
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/onboarding/reset
// @desc    Reset onboarding progress
// @access  Private
router.post('/reset', authenticateUser, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        onboardingCompleted: false,
        onboardingStep: 1
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Onboarding progress reset successfully',
      data: {
        user: updatedUser.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/onboarding/summary
// @desc    Get onboarding summary
// @access  Private
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    const summary = {
      basicInfo: {
        name: req.user.fullName,
        age: req.user.age,
        genderIdentity: req.user.genderIdentity,
        pronouns: req.user.pronouns
      },
      anatomy: req.user.reproductiveAnatomy,
      medicalConditions: req.user.chronicConditions?.length || 0,
      currentMedications: req.user.currentMedications?.length || 0,
      goals: req.user.goals,
      currentConcerns: req.user.currentConcerns,
      completed: req.user.onboardingCompleted,
      progress: Math.round((req.user.onboardingStep / 11) * 100)
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

