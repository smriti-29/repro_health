import React from 'react';
import PageHeader from './PageHeader';
import './ModuleLayout.css';

const ModuleLayout = ({ 
  title, 
  subtitle, 
  icon,
  children,
  showBackButton = true,
  backPath = '/dashboard',
  className = ''
}) => {
  return (
    <div className={`module-layout ${className}`}>
      <PageHeader 
        title={title}
        subtitle={subtitle}
        icon={icon}
        showBackButton={showBackButton}
        backPath={backPath}
      />
      <div className="module-content">
        {children}
      </div>
    </div>
  );
};

export default ModuleLayout;

