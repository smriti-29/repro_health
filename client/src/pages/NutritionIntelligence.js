import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AMABAIService from '../ai/amabAIService';
import './NutritionIntelligence.css';

const NutritionIntelligence = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize AMAB AI Service
  const [aiService] = useState(() => new AMABAIService());
  
  // Nutrition tracking state
  const [nutritionData, setNutritionData] = useState([]);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [nutritionInsights, setNutritionInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('log');
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [showSavedMealPlans, setShowSavedMealPlans] = useState(false);

  // Nutrition logging form
  const [nutritionForm, setNutritionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    meal: 'breakfast',
    foods: [],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    micronutrients: {
      vitaminD: 0,
      zinc: 0,
      magnesium: 0,
      omega3: 0,
      antioxidants: 0,
      folate: 0,
      vitaminE: 0,
      selenium: 0
    },
    hydration: 0,
    supplements: [],
    reproductiveHealthFactors: {
      alcoholConsumption: 0, // glasses per day
      caffeineIntake: 0, // cups per day
      processedFoods: 0, // servings per day
      organicFoods: 0, // percentage of diet
      mealTiming: 'regular', // regular, irregular, intermittent
      stressLevel: 5, // 1-10 scale
      sleepQuality: 5, // 1-10 scale
      exerciseIntensity: 'moderate', // low, moderate, high
      // New questions for better fertility tracking
      fiberIntake: 0, // grams per day
      waterIntake: 0, // glasses per day
      saltConsumption: 'moderate', // rare, moderate, high
      processedSugarConsumption: 'moderate' // rare, moderate, high
    },
    notes: ''
  });

  // Food database for reproductive health (including Indian cuisine)
  const reproductiveHealthFoods = {
    // Non-Vegetarian Proteins
    'non-veg': [
      { name: 'Oysters', category: 'protein', zinc: 78, protein: 9, calories: 68, benefits: 'High zinc for testosterone' },
      { name: 'Salmon', category: 'protein', omega3: 1.8, protein: 25, calories: 208, benefits: 'Omega-3 for hormone production' },
      { name: 'Eggs', category: 'protein', protein: 13, vitaminD: 1.1, calories: 155, benefits: 'Complete protein + vitamin D' },
      { name: 'Chicken Curry', category: 'protein', protein: 25, zinc: 2.5, calories: 200, benefits: 'Lean protein + zinc' },
      { name: 'Fish Curry', category: 'protein', omega3: 1.5, protein: 22, calories: 180, benefits: 'Omega-3 + protein' },
      { name: 'Mutton Curry', category: 'protein', protein: 26, zinc: 4.2, calories: 250, benefits: 'High protein + zinc' },
      { name: 'Prawns', category: 'protein', protein: 24, zinc: 1.3, calories: 99, benefits: 'Lean protein + zinc' },
      { name: 'Crab', category: 'protein', protein: 19, zinc: 3.8, calories: 97, benefits: 'Protein + zinc' }
    ],
    
    // Vegetarian Proteins
    'veg-proteins': [
      { name: 'Paneer', category: 'protein', protein: 18, calcium: 200, calories: 265, benefits: 'Complete protein + calcium' },
      { name: 'Dal (Lentils)', category: 'protein', protein: 9, folate: 90, fiber: 8, calories: 116, benefits: 'Plant protein + folate for fertility' },
      { name: 'Rajma (Kidney Beans)', category: 'protein', protein: 8, folate: 130, fiber: 6, calories: 127, benefits: 'Plant protein + folate' },
      { name: 'Chana (Chickpeas)', category: 'protein', protein: 8, folate: 172, zinc: 1.5, calories: 164, benefits: 'Protein + folate + zinc' },
      { name: 'Moong Dal', category: 'protein', protein: 7, folate: 159, fiber: 7, calories: 105, benefits: 'Easy digestible protein' },
      { name: 'Urad Dal', category: 'protein', protein: 8, folate: 98, fiber: 6, calories: 120, benefits: 'Protein + folate' },
      { name: 'Tofu', category: 'protein', protein: 8, calcium: 350, calories: 76, benefits: 'Plant protein + calcium' },
      { name: 'Soya Chunks', category: 'protein', protein: 52, folate: 200, calories: 345, benefits: 'High protein + folate' }
    ],
    
    // Vegetables
    'vegetables': [
      { name: 'Palak (Spinach)', category: 'vegetable', folate: 58, magnesium: 79, iron: 2.7, calories: 23, benefits: 'Folate + magnesium + iron' },
      { name: 'Methi (Fenugreek)', category: 'vegetable', folate: 57, iron: 1.9, calories: 23, benefits: 'Folate + iron for blood health' },
      { name: 'Drumstick (Moringa)', category: 'vegetable', vitaminC: 51, calcium: 185, calories: 26, benefits: 'Vitamin C + calcium' },
      { name: 'Bottle Gourd', category: 'vegetable', fiber: 2, calories: 12, benefits: 'Low calorie + fiber' },
      { name: 'Bitter Gourd', category: 'vegetable', antioxidants: 8, fiber: 2, calories: 17, benefits: 'Antioxidants + blood sugar control' },
      { name: 'Okra (Bhindi)', category: 'vegetable', folate: 60, vitaminC: 23, calories: 33, benefits: 'Folate + vitamin C' },
      { name: 'Carrot', category: 'vegetable', vitaminA: 16, fiber: 3, calories: 41, benefits: 'Vitamin A + fiber' },
      { name: 'Beetroot', category: 'vegetable', folate: 109, antioxidants: 7, calories: 43, benefits: 'Folate + antioxidants' },
      { name: 'Tomato', category: 'vegetable', vitaminC: 23, antioxidants: 3, calories: 18, benefits: 'Vitamin C + antioxidants' },
      { name: 'Onion', category: 'vegetable', antioxidants: 4, fiber: 2, calories: 40, benefits: 'Antioxidants + fiber' }
    ],
    
    // Grains & Carbs
    'grains': [
      { name: 'Brown Rice', category: 'carb', carbs: 23, fiber: 2, calories: 111, benefits: 'Complex carbs + fiber' },
      { name: 'Quinoa', category: 'carb', protein: 4, fiber: 2, calories: 120, benefits: 'Complete protein + fiber' },
      { name: 'Oats', category: 'carb', fiber: 4, protein: 5, calories: 68, benefits: 'Fiber + protein' },
      { name: 'Jowar (Sorghum)', category: 'carb', fiber: 3, protein: 3, calories: 97, benefits: 'Gluten-free + fiber' },
      { name: 'Bajra (Pearl Millet)', category: 'carb', fiber: 2, protein: 4, calories: 97, benefits: 'Gluten-free + protein' },
      { name: 'Ragi (Finger Millet)', category: 'carb', calcium: 344, fiber: 3, calories: 97, benefits: 'High calcium + fiber' },
      { name: 'Wheat', category: 'carb', fiber: 3, protein: 4, calories: 100, benefits: 'Fiber + protein' },
      { name: 'Barley', category: 'carb', fiber: 6, protein: 3, calories: 123, benefits: 'High fiber + protein' }
    ],
    
    // Nuts & Seeds
    'nuts-seeds': [
      { name: 'Cashews', category: 'nuts', zinc: 5.6, magnesium: 292, calories: 553, benefits: 'Zinc + magnesium' },
      { name: 'Walnuts', category: 'nuts', omega3: 2.5, protein: 15, calories: 654, benefits: 'Omega-3 + protein' },
      { name: 'Almonds', category: 'nuts', vitaminE: 7.3, magnesium: 76, calories: 164, benefits: 'Vitamin E for fertility' },
      { name: 'Pumpkin Seeds', category: 'nuts', zinc: 2.2, magnesium: 150, calories: 125, benefits: 'Zinc + magnesium combo' },
      { name: 'Sunflower Seeds', category: 'nuts', vitaminE: 35, magnesium: 325, calories: 584, benefits: 'Vitamin E + magnesium' },
      { name: 'Chia Seeds', category: 'nuts', omega3: 17.8, fiber: 34, calories: 486, benefits: 'High omega-3 + fiber' },
      { name: 'Flaxseeds', category: 'nuts', omega3: 22.8, fiber: 28, calories: 534, benefits: 'High omega-3 + fiber' },
      { name: 'Sesame Seeds', category: 'nuts', calcium: 975, zinc: 7.8, calories: 573, benefits: 'Calcium + zinc' }
    ],
    
    // Fruits
    'fruits': [
      { name: 'Blueberries', category: 'fruit', antioxidants: 9.2, vitaminC: 14, calories: 57, benefits: 'Antioxidants for sperm health' },
      { name: 'Avocado', category: 'fruit', fat: 21, fiber: 7, calories: 234, benefits: 'Healthy fats for hormones' },
      { name: 'Banana', category: 'fruit', potassium: 358, vitaminB6: 0.4, calories: 89, benefits: 'Potassium + B6 for energy' },
      { name: 'Pomegranate', category: 'fruit', antioxidants: 4, vitaminC: 10, calories: 83, benefits: 'Antioxidants + vitamin C' },
      { name: 'Orange', category: 'fruit', vitaminC: 53, folate: 40, calories: 47, benefits: 'Vitamin C + folate' },
      { name: 'Apple', category: 'fruit', fiber: 4, antioxidants: 3, calories: 52, benefits: 'Fiber + antioxidants' },
      { name: 'Mango', category: 'fruit', vitaminA: 25, vitaminC: 67, calories: 60, benefits: 'Vitamin A + C' },
      { name: 'Papaya', category: 'fruit', vitaminC: 61, folate: 37, calories: 43, benefits: 'Vitamin C + folate' }
    ],
    
    // Dairy & Alternatives
    'dairy': [
      { name: 'Greek Yogurt', category: 'dairy', protein: 10, probiotics: true, calories: 100, benefits: 'Probiotics for gut health' },
      { name: 'Milk', category: 'dairy', protein: 8, calcium: 276, calories: 150, benefits: 'Protein + calcium' },
      { name: 'Paneer', category: 'dairy', protein: 18, calcium: 200, calories: 265, benefits: 'Complete protein + calcium' },
      { name: 'Curd (Dahi)', category: 'dairy', protein: 11, probiotics: true, calories: 98, benefits: 'Probiotics + protein' },
      { name: 'Buttermilk', category: 'dairy', probiotics: true, calories: 40, benefits: 'Probiotics + hydration' },
      { name: 'Coconut Milk', category: 'dairy', fat: 24, calories: 230, benefits: 'Healthy fats' }
    ],
    
    // Indian Breakfast Items
    'breakfast': [
      { name: 'Pohe (Flattened Rice)', category: 'breakfast', carbs: 28, calories: 111, benefits: 'Light carbs for energy' },
      { name: 'Upma (Semolina)', category: 'breakfast', carbs: 22, protein: 3, calories: 100, benefits: 'Carbs + protein' },
      { name: 'Idli', category: 'breakfast', carbs: 18, protein: 4, calories: 88, benefits: 'Fermented carbs + protein' },
      { name: 'Dosa', category: 'breakfast', carbs: 25, protein: 3, calories: 120, benefits: 'Fermented carbs + protein' },
      { name: 'Paratha', category: 'breakfast', carbs: 30, fat: 8, calories: 180, benefits: 'Carbs + healthy fats' },
      { name: 'Poha', category: 'breakfast', carbs: 28, fiber: 2, calories: 111, benefits: 'Carbs + fiber' },
      { name: 'Dhokla', category: 'breakfast', carbs: 20, protein: 4, calories: 95, benefits: 'Fermented carbs + protein' },
      { name: 'Thepla', category: 'breakfast', carbs: 25, fiber: 3, calories: 140, benefits: 'Carbs + fiber' }
    ],
    
    // Indian Lunch/Dinner Items
    'lunch-dinner': [
      { name: 'Dal Rice', category: 'meal', protein: 8, carbs: 45, calories: 220, benefits: 'Complete protein + carbs' },
      { name: 'Rajma Rice', category: 'meal', protein: 10, fiber: 8, calories: 250, benefits: 'Protein + fiber' },
      { name: 'Chole Bhature', category: 'meal', protein: 12, carbs: 55, calories: 400, benefits: 'Protein + carbs' },
      { name: 'Biryani', category: 'meal', protein: 15, carbs: 60, calories: 450, benefits: 'Protein + carbs' },
      { name: 'Khichdi', category: 'meal', protein: 6, carbs: 35, calories: 180, benefits: 'Easy digestible meal' },
      { name: 'Sambar Rice', category: 'meal', protein: 7, carbs: 40, calories: 200, benefits: 'Protein + carbs' },
      { name: 'Curd Rice', category: 'meal', protein: 8, probiotics: true, calories: 150, benefits: 'Protein + probiotics' },
      { name: 'Pulao', category: 'meal', carbs: 45, calories: 200, benefits: 'Carbs + vegetables' }
    ]
  };

  // Load existing data and saved meal plans
  useEffect(() => {
    const savedData = localStorage.getItem('amabNutritionData');
    if (savedData) {
      setNutritionData(JSON.parse(savedData));
    }
    
    const savedMealPlansData = localStorage.getItem('amabNutritionMealPlans');
    if (savedMealPlansData) {
      const parsedMealPlans = JSON.parse(savedMealPlansData);
      setSavedMealPlans(parsedMealPlans);
    }
  }, []);

  // Save meal plan functionality
  const saveMealPlan = (mealPlan) => {
    const newMealPlan = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      mealPlan: mealPlan,
      nutritionData: nutritionData[0] // Save the latest nutrition data for context
    };
    const updatedMealPlans = [newMealPlan, ...savedMealPlans];
    setSavedMealPlans(updatedMealPlans);
    localStorage.setItem('amabNutritionMealPlans', JSON.stringify(updatedMealPlans));
    console.log('💾 Meal plan saved:', newMealPlan);
  };

  // Delete meal plan functionality
  const deleteMealPlan = (mealPlanId) => {
    const updatedMealPlans = savedMealPlans.filter(plan => plan.id !== mealPlanId);
    setSavedMealPlans(updatedMealPlans);
    localStorage.setItem('amabNutritionMealPlans', JSON.stringify(updatedMealPlans));
    console.log('🗑️ Meal plan deleted:', mealPlanId);
  };

  // Generate AI Nutrition Analysis
  const generateNutritionAnalysis = async (data) => {
    try {
      console.log('🤖 Generating comprehensive nutrition analysis...');
      
      const userProfile = {
        age: user?.age || 30,
        conditions: user?.conditions || {},
        familyHistory: user?.familyHistory || {},
        lifestyle: user?.lifestyle || {}
      };

      const insights = await generateReproductiveNutritionInsights(data, userProfile);
      console.log('📊 Generated insights:', insights);
      setNutritionInsights(insights);
      
      // Generate personalized nutrition plan
      const plan = await generateNutritionPlan(data, userProfile);
      setNutritionPlan(plan);
      
      console.log('✅ Nutrition analysis completed');
    } catch (error) {
      console.error('❌ Error generating nutrition analysis:', error);
    }
  };

  // Generate Reproductive Nutrition Insights
  const generateReproductiveNutritionInsights = async (data, userProfile) => {
    try {
      const latestData = data[0];
      const prompt = `Analyze this AMAB male nutrition data for reproductive health optimization:

      Latest Nutrition Data: ${JSON.stringify(latestData)}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide comprehensive reproductive health focused nutrition analysis in this exact format:
      
      **NUTRITION STATUS** (Current nutrition assessment for reproductive health)
      - Overall Assessment: [Good/Concerning/Excellent] with specific context
      - Key Strengths: [List 2-3 positive aspects]
      - Areas of Concern: [List 2-3 issues with specific impact]
      - Reproductive Health Score: [X/100] (overall nutrition for fertility)
      
      **PREDICTIONS** (Timeline-based nutrition impact)
      - Short-Term (1-2 weeks): [Immediate effects of current nutrition]
      - Medium-Term (1-3 months): [Nutritional impact on energy, hormones, and fertility markers]
      - Long-Term (6+ months): [Potential effects on sperm quality, testosterone, and reproductive function]
      
      **ACTIONS** (Priority-based nutrition recommendations)
      🔴 High Priority: [Most critical changes with specific reasons and simple tools]
      🟡 Medium Priority: [Important improvements with realistic timelines]
      🟢 Low Priority: [Optimization suggestions for long-term benefits]
      
      **INSIGHTS** (Nutrition-reproductive health correlations)
      - [Clear cause-effect relationships with specific nutrients and reproductive outcomes]
      - [How fiber, water, salt, and sugar specifically impact fertility and testosterone]
      - [Evidence-based connections between nutrition choices and reproductive health]
      
      **HEALTH NUGGET** (Evidence-based nutrition tip with statistics)
      💡 [Specific, actionable tip with research-backed statistics or percentages]
      
      Focus on: zinc, vitamin D, omega-3, antioxidants, folate, magnesium, selenium, fiber intake, water consumption, salt/sugar impact, and how these specifically affect reproductive health, testosterone production, and sperm quality.`;

      const response = await aiService.generateInsights(prompt);
      return response;
    } catch (error) {
      console.error('Error generating nutrition insights:', error);
      return `**NUTRITION STATUS** (Current nutrition assessment for reproductive health)
- Overall Assessment: Basic adequacy but needs optimization for reproductive health
- Key Strengths: Basic macronutrient balance maintained
- Areas of Concern: Low zinc and vitamin D intake, high processed food consumption
- Reproductive Health Score: 65/100 (needs improvement for optimal fertility)

**PREDICTIONS** (Timeline-based nutrition impact)
- Short-Term (1-2 weeks): Current nutrition may cause energy fluctuations and reduced libido
- Medium-Term (1-3 months): Nutrient deficiencies could lead to lower testosterone and reduced sperm motility
- Long-Term (6+ months): May impact sperm quality, fertility potential, and overall reproductive function

**ACTIONS** (Priority-based nutrition recommendations)
🔴 High Priority: Increase zinc-rich foods (oysters, pumpkin seeds) → Add why: "Zinc deficiency is linked to 20-30% lower testosterone levels"
🟡 Medium Priority: Add omega-3 sources (salmon, walnuts) → Add why: "Omega-3 improves sperm morphology by up to 35%"
🟢 Low Priority: Reduce processed foods and ensure adequate vitamin D

**INSIGHTS** (Nutrition-reproductive health correlations)
- Low zinc intake → Reduces testosterone production → Decreases sperm count and quality
- High processed food consumption → Increases inflammation → Negatively impacts reproductive hormones
- Inadequate vitamin D → Reduces calcium absorption → Affects sperm motility and fertility

**HEALTH NUGGET** (Evidence-based nutrition tip with statistics)
💡 Men with higher omega-3 intake show up to 35% better sperm morphology in studies. Adding just 2-3 servings of fatty fish per week can significantly improve reproductive health markers.`;
    }
  };

  // Generate Personalized Nutrition Plan
  const generateNutritionPlan = async (data, userProfile) => {
    try {
      const prompt = `Create a personalized nutrition plan for this AMAB male user focused on reproductive health:

      Nutrition Data: ${JSON.stringify(data.slice(0, 10))}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide a comprehensive nutrition plan including:
      - Daily meal structure with specific portion guidance
      - Specific food recommendations with exact portions (e.g., "1 palm-sized fillet", "1 handful (20-30g)")
      - Vegetarian/vegan alternatives for all animal products
      - Macronutrient targets
      - Micronutrient focus areas
      - Hydration goals
      - Supplement protocol with safety disclaimer
      - Weekly meal prep suggestions
      
      Format as JSON with: dailyMealStructure, foodRecommendations, macronutrientTargets, micronutrientFocus, hydrationGoals, supplementProtocol, weeklyMealPrep, vegetarianAlternatives, portionGuidance`;

      const response = await aiService.generateInsights(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      return {
        dailyMealStructure: [
          "Breakfast: Protein + healthy fats + complex carbs",
          "Mid-morning: Nuts or Greek yogurt",
          "Lunch: Lean protein + vegetables + whole grains",
          "Afternoon: Fruit + nuts",
          "Dinner: Fish + vegetables + sweet potato",
          "Evening: Herbal tea or water"
        ],
        foodRecommendations: [
          "Salmon → 1 palm-sized fillet (3-4 times per week)",
          "Eggs → 2-3 whole eggs (daily)",
          "Nuts → 1 handful (20-30g) (daily)",
          "Blueberries → ½ cup (daily)",
          "Avocado → ½ medium (daily)",
          "Spinach → 2 cups raw or 1 cup cooked (daily)",
          "Oysters → 6-8 medium (2-3 times per week)"
        ],
        portionGuidance: {
          "Protein": "1 palm-sized portion (20-30g protein)",
          "Nuts": "1 handful (20-30g)",
          "Fruits": "1 medium piece or ½ cup",
          "Vegetables": "2 cups raw or 1 cup cooked",
          "Grains": "1 cupped hand (30-40g dry)"
        },
        vegetarianAlternatives: {
          "Salmon": "Flaxseeds/Chia seeds + Walnuts (for omega-3)",
          "Eggs": "Tofu + fortified plant milk (for protein + B12)",
          "Greek Yogurt": "Unsweetened soy/coconut yogurt + probiotics",
          "Oysters": "Pumpkin seeds + cashews (for zinc)"
        },
        macronutrientTargets: {
          protein: "1.6-2.2g per kg body weight",
          carbs: "3-5g per kg body weight",
          fat: "0.8-1.2g per kg body weight",
          calories: "Based on activity level and goals"
        },
        micronutrientFocus: [
          "Zinc: 11mg daily",
          "Vitamin D: 1000-2000 IU daily",
          "Magnesium: 400mg daily",
          "Omega-3: 2-3g daily",
          "Antioxidants: Colorful fruits/vegetables"
        ],
        hydrationGoals: [
          "8-10 glasses of water daily",
          "Start with 2 glasses upon waking",
          "Drink before, during, and after workouts",
          "Limit caffeine to 2-3 cups daily"
        ],
        supplementProtocol: [
          "Morning: Vitamin D3 (1000-2000 IU) + Zinc (11mg)",
          "Evening: Magnesium (400mg) + Omega-3 (2-3g)",
          "As needed: Ashwagandha (300-600mg) for stress",
          "⚠️ Always consult a healthcare provider before starting supplements, especially if you have existing conditions or are on medication."
        ],
        weeklyMealPrep: [
          "Sunday: Prep proteins and vegetables",
          "Cook grains and sweet potatoes",
          "Prepare smoothie ingredients",
          "Wash and cut fruits/vegetables",
          "Portion out nuts and seeds"
        ]
      };
    }
  };

  // Handle nutrition logging
  const handleNutritionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newEntry = {
        ...nutritionForm,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous'
      };

      const updatedData = [newEntry, ...nutritionData];
      setNutritionData(updatedData);
      localStorage.setItem('amabNutritionData', JSON.stringify(updatedData));

      // Generate AI analysis
      console.log('🔄 Starting AI analysis for nutrition data...');
      await generateNutritionAnalysis(updatedData);
      console.log('✅ AI analysis completed');

      // Reset form
      setNutritionForm({
        ...nutritionForm,
        date: new Date().toISOString().split('T')[0],
        foods: [],
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        micronutrients: { vitaminD: 0, zinc: 0, magnesium: 0, omega3: 0, antioxidants: 0, folate: 0, vitaminE: 0, selenium: 0 },
        hydration: 0,
        supplements: [],
        reproductiveHealthFactors: {
          alcoholConsumption: 0,
          caffeineIntake: 0,
          processedFoods: 0,
          organicFoods: 0,
          mealTiming: 'regular',
          stressLevel: 5,
          sleepQuality: 5,
          exerciseIntensity: 'moderate',
          fiberIntake: 0,
          waterIntake: 0,
          saltConsumption: 'moderate',
          processedSugarConsumption: 'moderate'
        },
        notes: ''
      });

      alert('Nutrition data logged successfully! 🍎');
    } catch (error) {
      console.error('Error logging nutrition data:', error);
      alert('Error logging nutrition data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add food to meal
  const addFood = (food) => {
    setNutritionForm({
      ...nutritionForm,
      foods: [...nutritionForm.foods, food],
      macros: {
        calories: nutritionForm.macros.calories + food.calories,
        protein: nutritionForm.macros.protein + (food.protein || 0),
        carbs: nutritionForm.macros.carbs + (food.carbs || 0),
        fat: nutritionForm.macros.fat + (food.fat || 0),
        fiber: nutritionForm.macros.fiber + (food.fiber || 0)
      },
      micronutrients: {
        vitaminD: nutritionForm.micronutrients.vitaminD + (food.vitaminD || 0),
        zinc: nutritionForm.micronutrients.zinc + (food.zinc || 0),
        magnesium: nutritionForm.micronutrients.magnesium + (food.magnesium || 0),
        omega3: nutritionForm.micronutrients.omega3 + (food.omega3 || 0),
        antioxidants: nutritionForm.micronutrients.antioxidants + (food.antioxidants || 0),
        folate: nutritionForm.micronutrients.folate + (food.folate || 0),
        vitaminE: nutritionForm.micronutrients.vitaminE + (food.vitaminE || 0),
        selenium: nutritionForm.micronutrients.selenium + (food.selenium || 0)
      }
    });
  };

  // Remove food from meal
  const removeFood = (index) => {
    const food = nutritionForm.foods[index];
    setNutritionForm({
      ...nutritionForm,
      foods: nutritionForm.foods.filter((_, i) => i !== index),
      macros: {
        calories: nutritionForm.macros.calories - food.calories,
        protein: nutritionForm.macros.protein - (food.protein || 0),
        carbs: nutritionForm.macros.carbs - (food.carbs || 0),
        fat: nutritionForm.macros.fat - (food.fat || 0),
        fiber: nutritionForm.macros.fiber - (food.fiber || 0)
      },
      micronutrients: {
        vitaminD: nutritionForm.micronutrients.vitaminD - (food.vitaminD || 0),
        zinc: nutritionForm.micronutrients.zinc - (food.zinc || 0),
        magnesium: nutritionForm.micronutrients.magnesium - (food.magnesium || 0),
        omega3: nutritionForm.micronutrients.omega3 - (food.omega3 || 0),
        antioxidants: nutritionForm.micronutrients.antioxidants - (food.antioxidants || 0),
        folate: nutritionForm.micronutrients.folate - (food.folate || 0),
        vitaminE: nutritionForm.micronutrients.vitaminE - (food.vitaminE || 0),
        selenium: nutritionForm.micronutrients.selenium - (food.selenium || 0)
      }
    });
  };

  // Parse insights into organized boxes (enhanced format)
  const parseInsightsIntoBoxes = (insights) => {
    if (!insights) return null;
    
    const lines = insights.split('\n').filter(line => line.trim());
    const boxes = [];
    let currentBox = null;
    let currentContent = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for new enhanced format headers
      if (trimmedLine.includes('**NUTRITION STATUS**') || trimmedLine.includes('**NUTRITION STATUS**')) {
        if (currentBox) {
          currentBox.content = currentContent.join('\n');
          boxes.push(currentBox);
        }
        currentBox = { type: 'nutrition-status', title: '🍎 Nutrition Status', icon: '🍎' };
        currentContent = [];
      } else if (trimmedLine.includes('**PREDICTIONS**') || trimmedLine.includes('**PREDICTIONS**')) {
        if (currentBox) {
          currentBox.content = currentContent.join('\n');
          boxes.push(currentBox);
        }
        currentBox = { type: 'predictions', title: '🔮 Predictions', icon: '🔮' };
        currentContent = [];
      } else if (trimmedLine.includes('**ACTIONS**') || trimmedLine.includes('**ACTIONS**')) {
        if (currentBox) {
          currentBox.content = currentContent.join('\n');
          boxes.push(currentBox);
        }
        currentBox = { type: 'actions', title: '💡 Actions', icon: '💡' };
        currentContent = [];
      } else if (trimmedLine.includes('**INSIGHTS**') || trimmedLine.includes('**INSIGHTS**')) {
        if (currentBox) {
          currentBox.content = currentContent.join('\n');
          boxes.push(currentBox);
        }
        currentBox = { type: 'insights', title: '🧠 Insights', icon: '🧠' };
        currentContent = [];
      } else if (trimmedLine.includes('**HEALTH NUGGET**') || trimmedLine.includes('**HEALTH NUGGET**')) {
        if (currentBox) {
          currentBox.content = currentContent.join('\n');
          boxes.push(currentBox);
        }
        currentBox = { type: 'health-nugget', title: '✨ Health Nugget', icon: '✨' };
        currentContent = [];
      } else if (currentBox && trimmedLine && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('1.') && !trimmedLine.startsWith('2.') && !trimmedLine.startsWith('3.') && !trimmedLine.startsWith('4.')) {
        currentContent.push(trimmedLine);
      }
    });

    // Add the last box
    if (currentBox) {
      currentBox.content = currentContent.join('\n');
      boxes.push(currentBox);
    }

    // If no boxes were created with new format, try old format
    if (boxes.length === 0) {
      return parseOldFormatInsights(insights);
    }

    return boxes.map((box, index) => (
      <div key={index} className={`insight-box ${box.type}`}>
        <div className="insight-box-header">
          <span className="insight-icon">{box.icon}</span>
          <h3>{box.title}</h3>
        </div>
        <div className="insight-box-content">
          <div className="enhanced-content">
            {box.content.split('\n').map((line, lineIndex) => {
              if (line.trim()) {
                return (
                  <div key={lineIndex} className="enhanced-line">
                    <div className="enhanced-text">{line}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    ));
  };

  // Fallback function for old format
  const parseOldFormatInsights = (insights) => {
    const lines = insights.split('\n').filter(line => line.trim());
    const boxes = [];
    let currentBox = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('NUTRITION STATUS:') || trimmedLine.includes('1. NUTRITION STATUS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = { type: 'nutrition-status', title: '🍎 Nutrition Status', content: trimmedLine.replace(/^.*NUTRITION STATUS:\s*/, ''), icon: '🍎' };
      } else if (trimmedLine.includes('PREDICTIONS:') || trimmedLine.includes('2. PREDICTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = { type: 'predictions', title: '🔮 Predictions', content: trimmedLine.replace(/^.*PREDICTIONS:\s*/, ''), icon: '🔮' };
      } else if (trimmedLine.includes('ACTIONS:') || trimmedLine.includes('3. ACTIONS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = { type: 'actions', title: '💡 Actions', content: trimmedLine.replace(/^.*ACTIONS:\s*/, ''), icon: '💡' };
      } else if (trimmedLine.includes('INSIGHTS:') || trimmedLine.includes('4. INSIGHTS:')) {
        if (currentBox) boxes.push(currentBox);
        currentBox = { type: 'insights', title: '🧠 Insights', content: trimmedLine.replace(/^.*INSIGHTS:\s*/, ''), icon: '🧠' };
      } else if (currentBox && trimmedLine) {
        currentBox.content += ' ' + trimmedLine;
      }
    });
    if (currentBox) boxes.push(currentBox);
    return boxes.map((box, index) => (
      <div key={index} className={`insight-box ${box.type}`}>
        <div className="insight-box-header">
          <span className="insight-icon">{box.icon}</span>
          <h3>{box.title}</h3>
        </div>
        <div className="insight-box-content">
          <p>{box.content}</p>
        </div>
      </div>
    ));
  };


  // Compact Nutrition Overview Component
  const NutritionOverview = () => (
    <div className="compact-overview">
      <div className="overview-item">
        <div className="overview-icon">🍎</div>
        <div className="overview-label">Meals Logged</div>
        <div className="overview-value">{nutritionData.length}</div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">🔥</div>
        <div className="overview-label">Avg Calories</div>
        <div className="overview-value">
          {nutritionData.length > 0 ? 
            Math.round(nutritionData.reduce((sum, n) => sum + (n.macros?.calories || 0), 0) / nutritionData.length) : 0}
        </div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">💪</div>
        <div className="overview-label">Protein (g)</div>
        <div className="overview-value">
          {nutritionData.length > 0 ? 
            Math.round(nutritionData.reduce((sum, n) => sum + (n.macros?.protein || 0), 0) / nutritionData.length) : 0}
        </div>
      </div>
      <div className="overview-item">
        <div className="overview-icon">💧</div>
        <div className="overview-label">Hydration</div>
        <div className="overview-value">
          {nutritionData.length > 0 ? 
            Math.round(nutritionData.reduce((sum, n) => sum + (n.hydration || 0), 0) / nutritionData.length) : 0} glasses
        </div>
      </div>
    </div>
  );

  return (
    <div className="nutrition-intelligence">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>🍎 Nutrition Intelligence</h1>
        <p>Optimize your nutrition for reproductive health with AI-powered meal planning and tracking</p>
      </div>

      <div className="nutrition-intelligence-content">
        <NutritionOverview />
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            🍽️ Log Food
          </button>
          <button 
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            📋 Meal Plan
          </button>
        </div>


        {/* Log Food Tab */}
        {activeTab === 'log' && (
          <div className="tab-content">
            <div className="nutrition-form-section">
              <h2>🍽️ Log Your Nutrition</h2>
              <form onSubmit={handleNutritionSubmit} className="nutrition-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="meal-type">Meal Type</label>
                    <select
                      id="meal-type"
                      name="meal"
                      value={nutritionForm.meal}
                      onChange={(e) => setNutritionForm({...nutritionForm, meal: e.target.value})}
                      title="Select the type of meal"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="hydration">Hydration (glasses)</label>
                    <input
                      id="hydration"
                      name="hydration"
                      type="number"
                      min="0"
                      max="20"
                      value={nutritionForm.hydration}
                      onChange={(e) => setNutritionForm({...nutritionForm, hydration: parseInt(e.target.value) || 0})}
                      title="Number of glasses of water consumed"
                    />
                  </div>
                </div>

                {/* Reproductive Health Factors */}
                <div className="reproductive-health-section">
                  <h3>🧬 Reproductive Health Factors</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="alcohol">Alcohol (glasses/day)</label>
                      <input
                        id="alcohol"
                        name="alcohol"
                        type="number"
                        min="0"
                        max="10"
                        value={nutritionForm.reproductiveHealthFactors.alcoholConsumption}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            alcoholConsumption: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Daily alcohol consumption in glasses"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="caffeine">Caffeine (cups/day)</label>
                      <input
                        id="caffeine"
                        name="caffeine"
                        type="number"
                        min="0"
                        max="10"
                        value={nutritionForm.reproductiveHealthFactors.caffeineIntake}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            caffeineIntake: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Daily caffeine intake in cups"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="processed-foods">Processed Foods (servings/day)</label>
                      <input
                        id="processed-foods"
                        name="processed-foods"
                        type="number"
                        min="0"
                        max="10"
                        value={nutritionForm.reproductiveHealthFactors.processedFoods}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            processedFoods: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Number of processed food servings per day"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="organic-foods">Organic Foods (%)</label>
                      <input
                        id="organic-foods"
                        name="organic-foods"
                        type="number"
                        min="0"
                        max="100"
                        value={nutritionForm.reproductiveHealthFactors.organicFoods}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            organicFoods: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Percentage of diet that is organic"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="meal-timing">Meal Timing</label>
                      <select
                        id="meal-timing"
                        name="meal-timing"
                        value={nutritionForm.reproductiveHealthFactors.mealTiming}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            mealTiming: e.target.value
                          }
                        })}
                        title="Your typical meal timing pattern"
                      >
                        <option value="regular">Regular</option>
                        <option value="irregular">Irregular</option>
                        <option value="intermittent">Intermittent Fasting</option>
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
                        value={nutritionForm.reproductiveHealthFactors.stressLevel}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            stressLevel: parseInt(e.target.value) || 5
                          }
                        })}
                        title="Current stress level on a scale of 1-10"
                      />
                    </div>
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
                        value={nutritionForm.reproductiveHealthFactors.sleepQuality}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            sleepQuality: parseInt(e.target.value) || 5
                          }
                        })}
                        title="Sleep quality on a scale of 1-10"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="exercise-intensity">Exercise Intensity</label>
                      <select
                        id="exercise-intensity"
                        name="exercise-intensity"
                        value={nutritionForm.reproductiveHealthFactors.exerciseIntensity}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            exerciseIntensity: e.target.value
                          }
                        })}
                        title="Your current exercise intensity level"
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    {/* New Enhanced Questions */}
                    <div className="form-group">
                      <label htmlFor="fiber-intake">Fiber Intake (grams/day)</label>
                      <input
                        id="fiber-intake"
                        name="fiber-intake"
                        type="number"
                        min="0"
                        max="50"
                        value={nutritionForm.reproductiveHealthFactors.fiberIntake}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            fiberIntake: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Daily fiber intake in grams (affects gut health and hormone balance)"
                        placeholder="e.g., 25-35g recommended"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="water-intake">Water Intake (glasses/day)</label>
                      <input
                        id="water-intake"
                        name="water-intake"
                        type="number"
                        min="0"
                        max="20"
                        value={nutritionForm.reproductiveHealthFactors.waterIntake}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            waterIntake: parseInt(e.target.value) || 0
                          }
                        })}
                        title="Daily water intake in glasses (critical for semen volume and hydration)"
                        placeholder="e.g., 8-12 glasses recommended"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="salt-consumption">Salt Consumption</label>
                      <select
                        id="salt-consumption"
                        name="salt-consumption"
                        value={nutritionForm.reproductiveHealthFactors.saltConsumption}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            saltConsumption: e.target.value
                          }
                        })}
                        title="Your typical salt consumption level (affects blood flow and testosterone)"
                      >
                        <option value="rare">Rare (minimal processed foods)</option>
                        <option value="moderate">Moderate (some processed foods)</option>
                        <option value="high">High (frequent processed/packaged foods)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="sugar-consumption">Processed Sugar Consumption</label>
                      <select
                        id="sugar-consumption"
                        name="sugar-consumption"
                        value={nutritionForm.reproductiveHealthFactors.processedSugarConsumption}
                        onChange={(e) => setNutritionForm({
                          ...nutritionForm, 
                          reproductiveHealthFactors: {
                            ...nutritionForm.reproductiveHealthFactors,
                            processedSugarConsumption: e.target.value
                          }
                        })}
                        title="Your typical processed sugar consumption (affects blood flow and testosterone)"
                      >
                        <option value="rare">Rare (minimal sweets/sugary drinks)</option>
                        <option value="moderate">Moderate (occasional sweets/drinks)</option>
                        <option value="high">High (frequent sweets/sugary drinks)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="food-selection">
                  <h3>🥗 Select Foods</h3>
                  
                  {/* Food Categories */}
                  {Object.entries(reproductiveHealthFoods).map(([category, foods]) => (
                    <div key={category} className="food-category">
                      <h4 className="category-title">
                        {category === 'non-veg' && '🍖 Non-Vegetarian Proteins'}
                        {category === 'veg-proteins' && '🥜 Vegetarian Proteins'}
                        {category === 'vegetables' && '🥬 Vegetables'}
                        {category === 'grains' && '🌾 Grains & Carbs'}
                        {category === 'nuts-seeds' && '🥜 Nuts & Seeds'}
                        {category === 'fruits' && '🍎 Fruits'}
                        {category === 'dairy' && '🥛 Dairy & Alternatives'}
                        {category === 'breakfast' && '🌅 Indian Breakfast'}
                        {category === 'lunch-dinner' && '🍽️ Indian Meals'}
                      </h4>
                      <div className="food-grid">
                        {foods.map((food, index) => (
                          <button
                            key={`${category}-${index}`}
                            type="button"
                            className="food-btn"
                            onClick={() => addFood(food)}
                          >
                            <div className="food-name">{food.name}</div>
                            <div className="food-benefits">{food.benefits}</div>
                            <div className="food-nutrients">
                              {food.zinc && `Zn: ${food.zinc}mg `}
                              {food.protein && `Protein: ${food.protein}g `}
                              {food.calories && `Cal: ${food.calories}`}
                              {food.fiber && `Fiber: ${food.fiber}g `}
                              {food.omega3 && `Ω3: ${food.omega3}g `}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="selected-foods">
                  <h3>📝 Selected Foods</h3>
                  {nutritionForm.foods.length === 0 ? (
                    <p className="no-foods">No foods selected yet</p>
                  ) : (
                    <div className="foods-list">
                      {nutritionForm.foods.map((food, index) => (
                        <div key={index} className="selected-food">
                          <span className="food-name">{food.name}</span>
                          <span className="food-calories">{food.calories} cal</span>
                          <button
                            type="button"
                            className="remove-food-btn"
                            onClick={() => removeFood(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="macros-display">
                  <h3>📊 Macronutrients</h3>
                  <div className="macros-grid">
                    <div className="macro-item">
                      <span className="macro-label">Calories:</span>
                      <span className="macro-value">{nutritionForm.macros.calories}</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Protein:</span>
                      <span className="macro-value">{nutritionForm.macros.protein}g</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Carbs:</span>
                      <span className="macro-value">{nutritionForm.macros.carbs}g</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Fat:</span>
                      <span className="macro-value">{nutritionForm.macros.fat}g</span>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <label>Notes</label>
                  <textarea
                    value={nutritionForm.notes}
                    onChange={(e) => setNutritionForm({...nutritionForm, notes: e.target.value})}
                    placeholder="How did this meal make you feel? Any observations..."
                    rows={3}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? '🔄 Logging...' : '🍎 Log Nutrition'}
                </button>
              </form>

              {/* AI Nutrition Insights */}
              {nutritionData.length > 0 && (
                <div className="insights-section">
                  <div className="insights-header">
                    <h2>🤖 AI Nutrition Insights</h2>
                    <button
                      className="analyze-btn"
                      onClick={() => generateNutritionAnalysis(nutritionData)}
                      disabled={isLoading}
                      title="Generate AI analysis of your nutrition data"
                    >
                      {isLoading ? '🔄 Analyzing...' : '🧠 Analyze Nutrition'}
                    </button>
                  </div>
                  {nutritionInsights && (
                    <div className="organized-insights">
                      {parseInsightsIntoBoxes(nutritionInsights)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'plan' && (
          <div className="tab-content">
            <div className="meal-plan-section">
              <div className="meal-plan-header">
                <h2>📋 Personalized Meal Plan</h2>
                {nutritionPlan && (
                  <button
                    className="save-meal-plan-btn"
                    onClick={() => saveMealPlan(nutritionPlan)}
                    title="Save this meal plan for later reference"
                  >
                    💾 Save Meal Plan
                  </button>
                )}
              </div>
              {nutritionPlan ? (
                <div className="plan-content">
                  <div className="plan-section">
                    <h3>🍽️ Daily Meal Structure</h3>
                    <div className="meal-structure">
                      {nutritionPlan.dailyMealStructure?.map((meal, index) => (
                        <div key={index} className="meal-item">
                          <span className="meal-time">
                            {['Breakfast', 'Mid-morning', 'Lunch', 'Afternoon', 'Dinner', 'Evening'][index]}
                          </span>
                          <span className="meal-description">{meal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="plan-section">
                    <h3>🥗 Recommended Foods</h3>
                    <div className="foods-grid">
                      {nutritionPlan.foodRecommendations?.map((food, index) => (
                        <div key={index} className="recommended-food">
                          <span className="food-name">{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Portion Guidance Section */}
                  {nutritionPlan.portionGuidance && (
                    <div className="plan-section">
                      <h3>📏 Portion Guidance</h3>
                      <div className="portion-guidance-grid">
                        {Object.entries(nutritionPlan.portionGuidance).map(([category, guidance], index) => (
                          <div key={index} className="portion-item">
                            <span className="portion-category">{category}</span>
                            <span className="portion-description">{guidance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vegetarian Alternatives Section */}
                  {nutritionPlan.vegetarianAlternatives && (
                    <div className="plan-section">
                      <h3>🌱 Vegetarian/Vegan Alternatives</h3>
                      <div className="alternatives-grid">
                        {Object.entries(nutritionPlan.vegetarianAlternatives).map(([original, alternative], index) => (
                          <div key={index} className="alternative-item">
                            <span className="original-food">{original}</span>
                            <span className="arrow">→</span>
                            <span className="alternative-food">{alternative}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="plan-section">
                    <h3>💊 Supplement Protocol</h3>
                    <div className="supplements-list">
                      {nutritionPlan.supplementProtocol?.map((supplement, index) => (
                        <div key={index} className="supplement-item">
                          <span className="supplement-time">
                            {['Morning', 'Evening', 'As needed'][index] || 'Daily'}
                          </span>
                          <span className="supplement-name">{supplement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="plan-section">
                    <h3>📅 Weekly Meal Prep</h3>
                    <div className="meal-prep-list">
                      {nutritionPlan.weeklyMealPrep?.map((task, index) => (
                        <div key={index} className="prep-task">
                          <span className="prep-day">Sunday</span>
                          <span className="prep-description">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-plan">
                  <p>Log some nutrition data to generate your personalized meal plan!</p>
                </div>
              )}

              {/* Saved Meal Plans - Compact Bar */}
              {savedMealPlans.length > 0 && (
                <div className="saved-meal-plans-bar">
                  <div className="saved-meal-plans-header">
                    <div className="saved-meal-plans-info">
                      <span className="saved-meal-plans-icon">💾</span>
                      <span className="saved-meal-plans-title">Saved Meal Plans</span>
                      <span className="saved-meal-plans-count">({savedMealPlans.length} saved)</span>
                    </div>
                    <button
                      className="view-meal-plans-btn"
                      onClick={() => setShowSavedMealPlans(!showSavedMealPlans)}
                    >
                      {showSavedMealPlans ? 'Hide' : 'View'} Plans
                    </button>
                  </div>

                  {showSavedMealPlans && (
                    <div className="saved-meal-plans-content">
                      <div className="saved-meal-plans-grid">
                        {savedMealPlans.map((plan) => (
                          <div key={plan.id} className="saved-meal-plan-card">
                            <div className="saved-meal-plan-header">
                              <div className="saved-meal-plan-date">
                                <span className="date">{plan.date}</span>
                                <span className="time">{plan.timestamp}</span>
                              </div>
                              <button
                                className="delete-meal-plan-btn"
                                onClick={() => deleteMealPlan(plan.id)}
                                title="Delete this meal plan"
                              >
                                🗑️
                              </button>
                            </div>
                            <div className="saved-meal-plan-content">
                              <div className="plan-section">
                                <h4>🍽️ Daily Meal Structure</h4>
                                <div className="meal-structure">
                                  {plan.mealPlan.dailyMealStructure?.map((meal, index) => (
                                    <div key={index} className="meal-item">
                                      <span className="meal-time">
                                        {['Breakfast', 'Mid-morning', 'Lunch', 'Afternoon', 'Dinner', 'Evening'][index]}
                                      </span>
                                      <span className="meal-description">{meal}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="plan-section">
                                <h4>🥗 Recommended Foods</h4>
                                <div className="foods-grid">
                                  {plan.mealPlan.foodRecommendations?.map((food, index) => (
                                    <div key={index} className="recommended-food">
                                      <span className="food-name">{food}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
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
        )}

      </div>
    </div>
  );
};

export default NutritionIntelligence;
