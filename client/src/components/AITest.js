import React, { useState } from 'react';
import llmService from '../ai/llmService';

const AITest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testOpenAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test with a simple health question
      const testProfile = {
        age: 25,
        genderIdentity: 'Female',
        conditions: ['PCOS'],
        smoking: false,
        stressLevel: 'medium'
      };
      
      const testRules = {
        afab: {
          pcos: {
            definition: "Polycystic Ovary Syndrome",
            riskLevel: "moderate"
          }
        }
      };
      
      const result = await llmService.generateHealthInsights(testProfile, testRules);
      setTestResult(result);
      console.log('OpenAI API Test Result:', result);
      
    } catch (err) {
      console.error('OpenAI API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      borderRadius: '10px',
      margin: '20px',
      maxWidth: '600px'
    }}>
      <h3>🤖 OpenAI API Test</h3>
      <p>Test if your OpenAI API key is working correctly.</p>
      
      <button 
        onClick={testOpenAI} 
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test OpenAI API'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p>Testing OpenAI API connection...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          background: 'rgba(220, 53, 69, 0.2)', 
          border: '1px solid #dc3545',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#dc3545', margin: '0 0 8px 0' }}>❌ API Error</h4>
          <p style={{ margin: '0', color: '#dc3545' }}>{error}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Check your OpenAI API key in the .env file and restart the app.
          </p>
        </div>
      )}

      {testResult && (
        <div style={{ 
          background: 'rgba(40, 167, 69, 0.2)', 
          border: '1px solid #28a745',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ color: '#28a745', margin: '0 0 8px 0' }}>✅ API Working!</h4>
          <p style={{ margin: '0', color: '#28a745' }}>
            OpenAI API is successfully connected and responding.
          </p>
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#28a745' }}>
              View API Response
            </summary>
            <pre style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '12px', 
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '0.8rem',
              marginTop: '8px'
            }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h4>🔧 Setup Instructions</h4>
        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Get your OpenAI API key from <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>OpenAI Platform</a></li>
          <li>Create a <code>.env</code> file in the <code>client</code> folder</li>
          <li>Add: <code>REACT_APP_OPENAI_API_KEY=sk-your_key_here</code></li>
          <li>Restart your React app</li>
          <li>Click "Test OpenAI API" above</li>
        </ol>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AITest;
