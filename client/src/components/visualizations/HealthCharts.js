import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import './HealthCharts.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// ===== LINE CHART COMPONENT =====
export const LineChart = ({ data, title, xLabel, yLabel, color = '#4ecdc4', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="line-chart" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill={color}
                className="data-point"
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          <div className="y-axis">
            <span>{maxValue.toFixed(1)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
            <span>{minValue.toFixed(1)}</span>
          </div>
          <div className="x-axis">
            {data.map((point, index) => (
              <span key={index}>{point.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== BAR CHART COMPONENT =====
export const BarChart = ({ data, title, color = '#4ecdc4', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="bar-chart" style={{ height: `${height}px` }}>
        <div className="bars">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div
                className="bar"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color
                }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== RADAR CHART COMPONENT =====
export const RadarChart = ({ data, title, color = '#4ecdc4', size = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;

  const points = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const value = (item.value / maxValue) * radius;
    const x = centerX + value * Math.cos(angle);
    const y = centerY + value * Math.sin(angle);
    return { x, y, label: item.label, value: item.value };
  });

  const pathData = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="radar-chart" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size}>
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Grid lines */}
          {data.map((_, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Data area */}
          <path
            d={pathData}
            fill={color}
            fillOpacity="0.2"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color}
              className="data-point"
            />
          ))}
        </svg>
        
        {/* Labels */}
        <div className="radar-labels">
          {points.map((point, index) => (
            <div
              key={index}
              className="radar-label"
              style={{
                position: 'absolute',
                left: `${point.x}px`,
                top: `${point.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== PIE CHART COMPONENT =====
export const PieChart = ({ data, title, colors = ['#4ecdc4', '#ff6b6b', '#a29bfe', '#feca57'], size = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      pathData,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage: (percentage * 100).toFixed(1)
    };
  });

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="pie-chart" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size}>
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              className="pie-segment"
            />
          ))}
        </svg>
        
        {/* Legend */}
        <div className="pie-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: segment.color }}
              />
              <span className="legend-label">
                {segment.label} ({segment.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== GAUGE CHART COMPONENT =====
export const GaugeChart = ({ value, max = 100, title, color = '#4ecdc4', size = 200 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;
  const strokeWidth = 20;

  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percentage) => {
    if (percentage >= 80) return '#4ecdc4';
    if (percentage >= 60) return '#feca57';
    if (percentage >= 40) return '#ff9ff3';
    return '#ff6b6b';
  };

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="gauge-chart" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
            className="gauge-progress"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="gauge-value"
            fill="white"
            fontSize="24"
            fontWeight="bold"
          >
            {value}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className="gauge-max"
            fill="rgba(255,255,255,0.7)"
            fontSize="12"
          >
            / {max}
          </text>
        </svg>
      </div>
    </div>
  );
};

// ===== TREND INDICATOR COMPONENT =====
export const TrendIndicator = ({ data, title, color = '#4ecdc4' }) => {
  if (!data || data.length < 2) {
    return (
      <div className="trend-indicator">
        <h3>{title}</h3>
        <div className="no-data">Insufficient data for trend analysis</div>
      </div>
    );
  }

  const latest = data[data.length - 1].value;
  const previous = data[data.length - 2].value;
  const change = latest - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  const getTrendIcon = (change) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (change) => {
    if (change > 0) return '#4ecdc4';
    if (change < 0) return '#ff6b6b';
    return '#feca57';
  };

  return (
    <div className="trend-indicator">
      <h3>{title}</h3>
      <div className="trend-content">
        <div className="trend-value">{latest}</div>
        <div 
          className="trend-change"
          style={{ color: getTrendColor(change) }}
        >
          {getTrendIcon(change)} {Math.abs(changePercent).toFixed(1)}%
        </div>
        <div className="trend-period">vs last period</div>
      </div>
    </div>
  );
};

// ===== HEALTH SCORE COMPONENT =====
export const HealthScore = ({ score, max = 100, title, color = '#4ecdc4' }) => {
  const percentage = Math.min((score / max) * 100, 100);
  
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4ecdc4';
    if (percentage >= 60) return '#feca57';
    if (percentage >= 40) return '#ff9ff3';
    return '#ff6b6b';
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="health-score">
      <h3>{title}</h3>
      <div className="score-circle">
        <div 
          className="score-fill"
          style={{
            background: `conic-gradient(${getScoreColor(percentage)} 0deg ${percentage * 3.6}deg, rgba(255,255,255,0.1) ${percentage * 3.6}deg 360deg)`
          }}
        />
        <div className="score-content">
          <div className="score-value">{score}</div>
          <div className="score-max">/ {max}</div>
          <div className="score-label">{getScoreLabel(percentage)}</div>
        </div>
      </div>
    </div>
  );
};

export default {
  LineChart,
  BarChart,
  RadarChart,
  PieChart,
  GaugeChart,
  TrendIndicator,
  HealthScore
};
