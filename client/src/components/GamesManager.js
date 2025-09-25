import React, { useState, useEffect } from 'react';
import './GamesManager.css';

const GamesManager = ({ moduleType, onGameComplete }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  // Game configurations for different modules
  const gameConfigs = {
    'reproductive-health': {
      title: '🧬 Reproductive Health Quiz',
      description: 'Test your knowledge about male reproductive health and fertility',
      questions: [
        {
          question: "What is the primary hormone responsible for male reproductive health?",
          options: ["Estrogen", "Testosterone", "Progesterone", "Cortisol"],
          correct: 1,
          explanation: "Testosterone is the primary male sex hormone responsible for reproductive health, muscle mass, and libido."
        },
        {
          question: "Which nutrient is most important for sperm production?",
          options: ["Vitamin C", "Zinc", "Iron", "Calcium"],
          correct: 1,
          explanation: "Zinc is crucial for sperm production and testosterone synthesis. It's found in oysters, lean meats, and nuts."
        },
        {
          question: "How many hours of sleep is optimal for testosterone production?",
          options: ["4-5 hours", "6-7 hours", "7-9 hours", "10+ hours"],
          correct: 2,
          explanation: "7-9 hours of quality sleep is optimal for testosterone production and overall reproductive health."
        },
        {
          question: "Which exercise is most effective for boosting testosterone?",
          options: ["Cardio only", "Strength training", "Yoga", "Walking"],
          correct: 1,
          explanation: "Strength training, especially compound movements like squats and deadlifts, significantly boosts testosterone levels."
        },
        {
          question: "What temperature is optimal for sperm production?",
          options: ["Room temperature", "Body temperature", "Slightly below body temperature", "Cold temperature"],
          correct: 2,
          explanation: "Sperm production is optimal at slightly below body temperature, which is why the testicles are outside the body."
        }
      ]
    },
    'stress-management': {
      title: '🧘‍♂️ Stress Buster Challenge',
      description: 'Interactive stress management techniques and relaxation games',
      questions: [
        {
          question: "What is the 4-7-8 breathing technique?",
          options: ["4 inhale, 7 hold, 8 exhale", "4 exhale, 7 hold, 8 inhale", "4 hold, 7 inhale, 8 exhale", "4 inhale, 7 exhale, 8 hold"],
          correct: 0,
          explanation: "4-7-8 breathing: Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. This activates the parasympathetic nervous system."
        },
        {
          question: "Which of these is NOT a stress hormone?",
          options: ["Cortisol", "Adrenaline", "Testosterone", "Norepinephrine"],
          correct: 2,
          explanation: "Testosterone is not a stress hormone. Cortisol, adrenaline, and norepinephrine are the primary stress hormones."
        },
        {
          question: "How long should you practice meditation daily for stress relief?",
          options: ["5 minutes", "10-20 minutes", "1 hour", "2+ hours"],
          correct: 1,
          explanation: "10-20 minutes of daily meditation is sufficient for stress relief and mental health benefits."
        },
        {
          question: "Which activity is most effective for immediate stress relief?",
          options: ["Deep breathing", "Watching TV", "Eating junk food", "Avoiding the problem"],
          correct: 0,
          explanation: "Deep breathing activates the parasympathetic nervous system and provides immediate stress relief."
        },
        {
          question: "What is progressive muscle relaxation?",
          options: ["Tensing all muscles at once", "Tensing and relaxing muscle groups", "Only relaxing muscles", "Stretching exercises"],
          correct: 1,
          explanation: "Progressive muscle relaxation involves tensing and then relaxing different muscle groups to reduce physical tension."
        }
      ]
    },
    'nutrition': {
      title: '🍎 Nutrition Intelligence Quiz',
      description: 'Test your knowledge about nutrition for reproductive health',
      questions: [
        {
          question: "Which vitamin is essential for testosterone production?",
          options: ["Vitamin A", "Vitamin D", "Vitamin E", "Vitamin K"],
          correct: 1,
          explanation: "Vitamin D is crucial for testosterone production. Low vitamin D levels are linked to low testosterone."
        },
        {
          question: "What percentage of your diet should be healthy fats for hormone production?",
          options: ["10-15%", "20-30%", "40-50%", "60-70%"],
          correct: 1,
          explanation: "20-30% of your diet should be healthy fats (avocado, olive oil, nuts) for optimal hormone production."
        },
        {
          question: "Which mineral is most important for sperm quality?",
          options: ["Calcium", "Zinc", "Iron", "Magnesium"],
          correct: 1,
          explanation: "Zinc is essential for sperm quality, count, and motility. It's found in oysters, lean meats, and pumpkin seeds."
        },
        {
          question: "How much water should you drink daily for optimal reproductive health?",
          options: ["4-6 glasses", "6-8 glasses", "8-10 glasses", "10+ glasses"],
          correct: 2,
          explanation: "8-10 glasses of water daily helps maintain proper hydration and supports reproductive system function."
        },
        {
          question: "Which antioxidant is most beneficial for male fertility?",
          options: ["Vitamin C", "Lycopene", "Beta-carotene", "All of the above"],
          correct: 3,
          explanation: "All antioxidants (Vitamin C, Lycopene, Beta-carotene) are beneficial for male fertility and sperm health."
        }
      ]
    },
    'performance': {
      title: '🚀 Performance Optimization Quiz',
      description: 'Test your knowledge about athletic performance and recovery',
      questions: [
        {
          question: "What is the optimal rest time between sets for strength training?",
          options: ["30 seconds", "1-2 minutes", "2-3 minutes", "5+ minutes"],
          correct: 2,
          explanation: "2-3 minutes rest between sets allows for proper recovery and maximum strength gains."
        },
        {
          question: "Which recovery method is most effective for muscle repair?",
          options: ["Ice baths", "Massage", "Sleep", "All of the above"],
          correct: 3,
          explanation: "All recovery methods (ice baths, massage, sleep) are effective, but sleep is the most important for muscle repair."
        },
        {
          question: "How often should you change your workout routine?",
          options: ["Every week", "Every 4-6 weeks", "Every 3 months", "Never"],
          correct: 1,
          explanation: "Changing your workout routine every 4-6 weeks prevents plateaus and keeps your body adapting."
        },
        {
          question: "What is the best time to work out for testosterone production?",
          options: ["Early morning", "Mid-morning", "Afternoon", "Evening"],
          correct: 2,
          explanation: "Afternoon workouts (2-4 PM) coincide with peak testosterone levels and body temperature."
        },
        {
          question: "Which is more important for performance: training intensity or volume?",
          options: ["Intensity only", "Volume only", "Both equally", "Depends on goals"],
          correct: 3,
          explanation: "The importance of intensity vs volume depends on your specific goals and training phase."
        }
      ]
    }
  };

  // Initialize game when module type changes
  useEffect(() => {
    if (moduleType && gameConfigs[moduleType]) {
      setCurrentGame(moduleType);
      setGameData(gameConfigs[moduleType]);
      setScore(0);
      setCurrentQuestion(0);
      setShowResults(false);
    }
  }, [moduleType]);

  const handleAnswer = (selectedAnswer) => {
    const question = gameData.questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Add to game history
    const newHistory = [...gameHistory, {
      question: question.question,
      selectedAnswer,
      correctAnswer: question.correct,
      isCorrect,
      explanation: question.explanation
    }];
    setGameHistory(newHistory);

    // Move to next question or show results
    if (currentQuestion < gameData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      onGameComplete && onGameComplete(score, gameData.questions.length);
    }
  };

  const resetGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setShowResults(false);
    setGameHistory([]);
  };

  const getScoreMessage = () => {
    const percentage = (score / gameData.questions.length) * 100;
    if (percentage >= 80) return "Excellent! You're a health expert! 🌟";
    if (percentage >= 60) return "Good job! You have solid knowledge! 👍";
    if (percentage >= 40) return "Not bad! Keep learning! 📚";
    return "Keep studying! Knowledge is power! 💪";
  };

  const getScoreColor = () => {
    const percentage = (score / gameData.questions.length) * 100;
    if (percentage >= 80) return "#00b894";
    if (percentage >= 60) return "#fdcb6e";
    if (percentage >= 40) return "#e17055";
    return "#ff6b6b";
  };

  if (!currentGame || !gameData) {
    return (
      <div className="games-manager">
        <div className="no-game">
          <h3>🎮 Select a Game</h3>
          <p>Choose a health module to start playing educational games!</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="games-manager">
        <div className="game-results">
          <h2>🎉 Game Complete!</h2>
          <div className="score-display">
            <div className="score-circle" style={{ borderColor: getScoreColor() }}>
              <div className="score-value" style={{ color: getScoreColor() }}>
                {score}/{gameData.questions.length}
              </div>
              <div className="score-percentage">
                {Math.round((score / gameData.questions.length) * 100)}%
              </div>
            </div>
          </div>
          <p className="score-message" style={{ color: getScoreColor() }}>
            {getScoreMessage()}
          </p>
          
          <div className="results-breakdown">
            <h3>📊 Answer Breakdown</h3>
            {gameHistory.map((item, index) => (
              <div key={index} className={`result-item ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-question">
                  <strong>Q{index + 1}:</strong> {item.question}
                </div>
                <div className="result-answer">
                  <span className={`answer-status ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                    {item.isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="answer-text">
                    Your answer: {gameData.questions[index].options[item.selectedAnswer]}
                  </span>
                </div>
                <div className="result-explanation">
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="game-actions">
            <button className="play-again-btn" onClick={resetGame}>
              🔄 Play Again
            </button>
            <button className="close-game-btn" onClick={() => setCurrentGame(null)}>
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = gameData.questions[currentQuestion];

  return (
    <div className="games-manager">
      <div className="game-header">
        <h2>{gameData.title}</h2>
        <p>{gameData.description}</p>
        <div className="game-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / gameData.questions.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {gameData.questions.length}
          </span>
        </div>
      </div>

      <div className="game-question">
        <h3>{currentQ.question}</h3>
        <div className="game-options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleAnswer(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Progress:</span>
          <span className="stat-value">{Math.round(((currentQuestion + 1) / gameData.questions.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GamesManager;

