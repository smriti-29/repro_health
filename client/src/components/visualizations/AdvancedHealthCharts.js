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
  RadialLinearScale,
  Filler
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
  RadialLinearScale,
  Filler
);

// ===== ADVANCED LINE CHART COMPONENT =====
export const AdvancedLineChart = ({ data, title, xLabel, yLabel, color = '#4ecdc4', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((point, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: yLabel || 'Value',
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${yLabel || 'Value'}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xLabel || 'Time',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yLabel || 'Value',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="chart-container advanced-chart">
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// ===== ADVANCED BAR CHART COMPONENT =====
export const AdvancedBarChart = ({ data, title, xLabel, yLabel, colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: yLabel || 'Value',
        data: data.map(d => d.value),
        backgroundColor: colors.map(color => `${color}80`),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: colors[0],
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${yLabel || 'Value'}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xLabel || 'Category',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yLabel || 'Value',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="chart-container advanced-chart">
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// ===== ADVANCED DOUGHNUT CHART COMPONENT =====
export const AdvancedDoughnutChart = ({ data, title, colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff6b6b'], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: colors.map(color => `${color}80`),
        borderColor: colors,
        borderWidth: 3,
        hoverOffset: 10,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: colors[0],
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="chart-container advanced-chart">
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// ===== ADVANCED RADAR CHART COMPONENT =====
export const AdvancedRadarChart = ({ data, title, colors = ['#4ecdc4', '#45b7d1'], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="no-data">No data available for visualization</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: data.map((dataset, index) => ({
      label: dataset.name || `Dataset ${index + 1}`,
      data: dataset.values,
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`,
      borderWidth: 3,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: colors[0],
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          },
          stepSize: 2
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="chart-container advanced-chart">
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

// ===== HEALTH SCORE GAUGE COMPONENT =====
export const HealthScoreGauge = ({ score, title = "Health Score", height = 200 }) => {
  const percentage = Math.min(Math.max(score, 0), 100);
  const color = percentage >= 80 ? '#4ecdc4' : percentage >= 60 ? '#feca57' : '#ff6b6b';
  
  const chartData = {
    labels: ['Health Score', 'Remaining'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
        borderColor: [color, 'rgba(255, 255, 255, 0.2)'],
        borderWidth: 2,
        cutout: '70%',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: false
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="chart-container advanced-chart gauge-chart">
      <div className="chart-wrapper" style={{ height: `${height}px`, position: 'relative' }}>
        <Doughnut data={chartData} options={options} />
        <div className="gauge-center">
          <div className="gauge-score" style={{ color: color }}>
            {score}
          </div>
          <div className="gauge-label">/ 100</div>
        </div>
      </div>
    </div>
  );
};

// ===== TREND INDICATOR COMPONENT =====
export const TrendIndicator = ({ trend, value, label, color = '#4ecdc4' }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#4ecdc4';
      case 'declining': return '#ff6b6b';
      case 'stable': return '#feca57';
      default: return '#ffffff';
    }
  };

  return (
    <div className="trend-indicator">
      <div className="trend-icon">{getTrendIcon(trend)}</div>
      <div className="trend-content">
        <div className="trend-label">{label}</div>
        <div className="trend-value" style={{ color: getTrendColor(trend) }}>
          {value}
        </div>
        <div className="trend-status" style={{ color: getTrendColor(trend) }}>
          {trend}
        </div>
      </div>
    </div>
  );
};
