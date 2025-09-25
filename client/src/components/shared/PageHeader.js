import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backPath = '/dashboard',
  icon = null,
  gradient = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      {showBackButton && (
        <button className="back-btn" onClick={() => navigate(backPath)}>
          ← Back to Dashboard
        </button>
      )}
      <div className="header-content">
        {icon && <span className="header-icon">{icon}</span>}
        <h1 className={gradient ? 'gradient-text' : ''}>{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;

