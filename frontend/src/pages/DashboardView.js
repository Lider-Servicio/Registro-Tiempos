import React from 'react';
import { KpiCard } from '../components/KpiCard';
import '../assets/css/Dashboard.css';

export const DashboardView = ({ userEmail }) => {
  return (
    <div style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Dashboard de Control</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
          Resumen general de actividades para <strong>{userEmail}</strong>
        </p>
      </header>

      {/* Seccion de Tarjetas KPI */}
      <div className="kpi-grid">
        <KpiCard
          title="Horas Registradas"
          value="156.5 hrs"
          change="12%"
          isPositive={true}
          subtitle="vs. mes anterior"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <KpiCard
          title="Proyectos Activos"
          value="8"
          change="2 nuevos"
          isPositive={true}
          subtitle="este mes"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
        />

        <KpiCard
          title="Pendientes por Aprobar"
          value="3 de 12"
          change="-5%"
          isPositive={false}
          subtitle="revisión semanal"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />

        <KpiCard
          title="Eficiencia Promedio"
          value="94.2%"
          change="3.1%"
          isPositive={true}
          subtitle="meta: >90%"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
      </div>
    </div>
  );
};