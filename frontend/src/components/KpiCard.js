import React from 'react';

export const KpiCard = ({ title, value, change, isPositive, subtitle, icon }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrapper">{icon}</div>
      </div>

      <div className="kpi-value">{value}</div>

      {(change || subtitle) && (
        <div className="kpi-footer">
          {change && (
            <span className={`kpi-trend ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? `+${change}` : change}
            </span>
          )}
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};