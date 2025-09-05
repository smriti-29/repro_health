import React, { useState, useRef, useEffect } from 'react';
import aiReasoningEngine from '../ai/aiReasoning';
import './AIChatbot.css';

const AIChatbot = ({ userProfile }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hello! I'm your AI health assistant. I can help you with reproductive health questions, explain your health insights, and provide personalized guidance. What would you like to know?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiReasoningEngine.handleChatbotQuestion(inputValue.trim(), userProfile);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        timestamp: new Date().toISOString(),
        relatedTopics: response.relatedTopics,
        followUpQuestions: response.followUpQuestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question) => {
    setInputValue(question);
    // Simulate sending the quick question
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await aiReasoningEngine.handleChatbotQuestion(question, userProfile);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        timestamp: new Date().toISOString(),
        relatedTopics: response.relatedTopics,
        followUpQuestions: response.followUpQuestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChatbot}
        aria-label="Toggle AI Health Assistant"
      >
        <span className="chatbot-icon">🤖</span>
        <span className="chatbot-label">AI Health Assistant</span>
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🤖</span>
              <h3>AI Health Assistant</h3>
            </div>
            <button 
              className="close-btn"
              onClick={toggleChatbot}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  
                  {message.relatedTopics && message.relatedTopics.length > 0 && (
                    <div className="related-topics">
                      <span className="topics-label">Related topics:</span>
                      {message.relatedTopics.map((topic, index) => (
                        <span key={index} className="topic-tag">{topic}</span>
                      ))}
                    </div>
                  )}
                  
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <span className="questions-label">You might also want to ask:</span>
                      {message.followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          className="follow-up-btn"
                          onClick={() => handleQuickQuestion(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="message-timestamp">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot loading">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <form onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about your reproductive health..."
                disabled={isLoading}
                className="chatbot-input-field"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className="send-btn"
              >
                <span className="send-icon">📤</span>
              </button>
            </form>
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            <h4>Quick Questions</h4>
            <div className="quick-questions-grid">
              <button 
                className="quick-question-btn"
                onClick={() => handleQuickQuestion("How does my lifestyle affect my reproductive health?")}
              >
                Lifestyle Impact
              </button>
              <button 
                className="quick-question-btn"
                onClick={() => handleQuickQuestion("What screenings should I consider based on my profile?")}
              >
                Health Screenings
              </button>
              <button 
                className="quick-question-btn"
                onClick={() => handleQuickQuestion("How can I improve my fertility naturally?")}
              >
                Fertility Tips
              </button>
              <button 
                className="quick-question-btn"
                onClick={() => handleQuickQuestion("What does my health score mean?")}
              >
                Health Score
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
