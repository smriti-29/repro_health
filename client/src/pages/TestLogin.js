import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestLogin = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState('');

  const testLogin = async (email, password) => {
    try {
      console.log(`Testing login with: ${email}`);
      const result = await login({ email, password });
      console.log('Test result:', result);
      setTestResult(`Login test result: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      console.error('Test login error:', error);
      setTestResult(`Login test error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const runTests = async () => {
    setTestResult('Running tests...\n');
    
    // Test 1: Valid credentials
    const test1 = await testLogin('puja.smriti@gmail.com', 'password123');
    
    // Test 2: Invalid credentials
    const test2 = await testLogin('invalid@email.com', 'wrongpassword');
    
    // Test 3: Valid email, wrong password
    const test3 = await testLogin('puja.smriti@gmail.com', 'wrongpassword');
    
    setTestResult(prev => prev + '\nAll tests completed. Check console for details.');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Login Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Auth State:</h3>
        <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Credentials:</h3>
        <ul>
          <li>Email: puja.smriti@gmail.com</li>
          <li>Password: password123</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={runTests} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Run All Tests
        </button>
        <button onClick={() => testLogin('puja.smriti@gmail.com', 'password123')} style={{ padding: '10px 20px' }}>
          Test Valid Login
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Go to Dashboard
        </button>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px' }}>
          Go to Login Page
        </button>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        <h3>Test Results:</h3>
        <pre>{testResult}</pre>
      </div>
    </div>
  );
};

export default TestLogin;

