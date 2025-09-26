// DEMO MONITOR COMPONENT
// Shows real-time API status for demo presentations

import React, { useState, useEffect } from 'react';
import DemoReset from '../utils/demoReset.js';
import './DemoMonitor.css';

const DemoMonitor = ({ show = false }) => {
  const [demoStatus, setDemoStatus] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const demoReset = new DemoReset();

  useEffect(() => {
    if (show) {
      updateStatus();
      const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [show]);

  const updateStatus = () => {
    const status = demoReset.getDemoStatus();
    setDemoStatus(status);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setResetMessage('');
    
    try {
      const result = await demoReset.resetForDemo();
      setResetMessage(result.message);
      updateStatus();
    } catch (error) {
      setResetMessage('Reset failed: ' + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearCache = () => {
    demoReset.clearCache();
    setResetMessage('Cache cleared');
    updateStatus();
  };

  if (!show) return null;

  return (
    <div className="demo-monitor">
      <div className="demo-monitor-header">
        <h3>🚀 Demo Monitor</h3>
        <div className="demo-actions">
          <button 
            onClick={handleReset} 
            disabled={isResetting}
            className="demo-reset-btn"
          >
            {isResetting ? 'Resetting...' : 'Reset for Demo'}
          </button>
          <button 
            onClick={handleClearCache}
            className="demo-cache-btn"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="demo-message">
          {resetMessage}
        </div>
      )}

      {demoStatus && (
        <div className="demo-status">
          <div className="status-section">
            <h4>📊 Rate Limiting</h4>
            <div className="status-item">
              <span>Daily:</span>
              <span className={demoStatus.rateLimiting.daily.split('/')[0] > 1000 ? 'warning' : 'good'}>
                {demoStatus.rateLimiting.daily}
              </span>
            </div>
            <div className="status-item">
              <span>Per Minute:</span>
              <span className={demoStatus.rateLimiting.perMinute.split('/')[0] > 10 ? 'warning' : 'good'}>
                {demoStatus.rateLimiting.perMinute}
              </span>
            </div>
            <div className="status-item">
              <span>Can Make Request:</span>
              <span className={demoStatus.rateLimiting.canMakeRequest ? 'good' : 'error'}>
                {demoStatus.rateLimiting.canMakeRequest ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>

          <div className="status-section">
            <h4>🧠 Cache Status</h4>
            <div className="status-item">
              <span>Cache Size:</span>
              <span className="info">{demoStatus.cache.size} responses</span>
            </div>
            <div className="status-item">
              <span>Pending Requests:</span>
              <span className="info">{demoStatus.cache.pending}</span>
            </div>
          </div>

          <div className="status-section">
            <h4>🔧 Services</h4>
            <div className="status-item">
              <span>Primary (Gemini):</span>
              <span className={demoStatus.services.primary ? 'good' : 'error'}>
                {demoStatus.services.primary ? '✅ Configured' : '❌ Not Configured'}
              </span>
            </div>
            <div className="status-item">
              <span>Fallback (Ollama):</span>
              <span className={demoStatus.services.fallback ? 'good' : 'warning'}>
                {demoStatus.services.fallback ? '✅ Available' : '⚠️ Not Available'}
              </span>
            </div>
            <div className="status-item">
              <span>Active Service:</span>
              <span className="info">{demoStatus.services.active}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoMonitor;
