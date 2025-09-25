import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { HealthDataProvider } from './context/HealthDataContext';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LogSymptoms from './pages/LogSymptoms';
import Insights from './pages/Insights';
import Medications from './pages/Medications';
import TestLogin from './pages/TestLogin';
import CycleTracking from './pages/CycleTracking';
import FertilityTracking from './pages/FertilityTracking';
import SexualHealth from './pages/SexualHealth';
import PregnancyTracking from './pages/PregnancyTracking';
import MenopauseSupport from './pages/MenopauseSupport';
import ConditionSpecific from './pages/ConditionSpecific';
import BreastHealth from './pages/BreastHealth';
import MentalHealth from './pages/MentalHealth';

// AMAB (Male) Health Modules
import GeneralHealthTracker from './pages/GeneralHealthTracker';
import HormonalHealth from './pages/HormonalHealth';
import NutritionIntelligence from './pages/NutritionIntelligence';
import FertilityPreconception from './pages/FertilityPreconception';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// App Routes Component (needs to be inside AuthProvider)
const AppRoutes = () => {
  return (
    <ProfileProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/log-symptoms" element={<ProtectedRoute><LogSymptoms /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
              <Route path="/test-login" element={<TestLogin />} />
              
              {/* AFAB Module Routes */}
              <Route path="/cycle-tracking" element={<ProtectedRoute><CycleTracking /></ProtectedRoute>} />
              <Route path="/fertility-tracking" element={<ProtectedRoute><FertilityTracking /></ProtectedRoute>} />
              <Route path="/sexual-health" element={<ProtectedRoute><SexualHealth /></ProtectedRoute>} />
              <Route path="/pregnancy-tracking" element={<ProtectedRoute><PregnancyTracking /></ProtectedRoute>} />
              <Route path="/menopause-support" element={<ProtectedRoute><MenopauseSupport /></ProtectedRoute>} />
              <Route path="/condition-specific" element={<ProtectedRoute><ConditionSpecific /></ProtectedRoute>} />
              <Route path="/breast-health" element={<ProtectedRoute><BreastHealth /></ProtectedRoute>} />
              <Route path="/mental-health" element={<ProtectedRoute><MentalHealth /></ProtectedRoute>} />
              
              {/* AMAB (Male) Health Module Routes */}
              <Route path="/general-health-tracker" element={<ProtectedRoute><GeneralHealthTracker /></ProtectedRoute>} />
              <Route path="/hormonal-health" element={<ProtectedRoute><HormonalHealth /></ProtectedRoute>} />
              <Route path="/nutrition-intelligence" element={<ProtectedRoute><NutritionIntelligence /></ProtectedRoute>} />
              <Route path="/fertility-preconception" element={<ProtectedRoute><FertilityPreconception /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </HealthDataProvider>
    </ProfileProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
