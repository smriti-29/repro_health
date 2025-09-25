import React from 'react';
import './CompactOverview.css';

const CompactOverview = ({ items = [] }) => {
  return (
    <div className="compact-overview">
      {items.map((item, index) => (
        <div key={index} className="overview-item" style={{ '--item-color': item.color || '#4ecdc4' }}>
          <span className="overview-icon">{item.icon}</span>
          <span className="overview-label">{item.label}</span>
          <span className="overview-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default CompactOverview;

