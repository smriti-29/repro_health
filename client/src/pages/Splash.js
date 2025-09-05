import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Show logo first
    setFadeIn(true);
    
    // After 2 seconds, show login/signup options
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register'); // Changed from /onboarding to /register
  };

  return (
    <div className="splash-container">
      <div className="splash-content">
        {/* App Logo */}
        <div className={`logo-section ${fadeIn ? 'fade-in' : ''}`}>
          <div className="logo-circle">
            <div className="logo-icon">🌸</div>
          </div>
          <h1 className="app-name">ReproHealth</h1>
          <p className="app-tagline">Your comprehensive reproductive health companion</p>
        </div>

        {/* Login/Signup Options */}
        <div className={`auth-options ${showOptions ? 'slide-up' : ''}`}>
          <div className="welcome-text">
            <h2>Welcome to ReproHealth</h2>
            <p>Your journey to better reproductive health starts here</p>
          </div>
          
          <div className="auth-buttons">
            <button 
              className="auth-button primary" 
              onClick={handleSignup}
            >
              <span className="button-icon">✨</span>
              Get Started
              <span className="button-subtitle">Create your account</span>
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <button 
              className="auth-button secondary" 
              onClick={handleLogin}
            >
              <span className="button-icon">🔐</span>
              Sign In
              <span className="button-subtitle">Welcome back</span>
            </button>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Personalized insights</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Private & secure</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-powered analysis</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
    </div>
  );
}


