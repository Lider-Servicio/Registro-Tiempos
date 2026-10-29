import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseCliente';
import { KpiCard } from '../components/KpiCard';
import '../assets/css/Dashboard.css';

export const DashboardView = ({ userId, userEmail }) => {
  const [totalMinutosMes, setTotalMinutosMes] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [ultimosRegistros, setUltimosRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener el periodo actual (YYYY-MM)
  const now = new Date();
  const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Obtener total de minutos del mes actual
      const { data: dataMes, error: errorMes } = await supabase
        .from('registros_gestion')
        .select('tiempo_invertido')
        .eq('user_id', userId)
        .eq('periodo', periodoActual);

      if (!errorMes && dataMes) {
        const sumaMinutos = dataMes.reduce((acc, curr) => acc + Number(curr.tiempo_invertido || 0), 0);
        setTotalMinutosMes(sumaMinutos);
        setTotalRegistros(dataMes.length);
      }

      // 2. Obtener los últimos 5 registros del usuario
      const { data: dataUltimos, error: errorUltimos } = await supabase
        .from('registros_gestion')
        .select('id, fecha, hora, cliente, tipo_gestion, tipo_actividad, nro_tk, tiempo_invertido, estado')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(5);

      if (!errorUltimos && dataUltimos) {
        setUltimosRegistros(dataUltimos);
      }

      setLoading(false);
    };

    if (userId) {
      fetchData();
    }
  }, [userId, periodoActual]);

  const horasTotales = (totalMinutosMes / 60).toFixed(1);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Dashboard de Control</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
          Resumen de gestión correspondiente al periodo <strong>{periodoActual}</strong>
        </p>
      </header>

      {/* Tarjetas KPI */}
      <div className="kpi-grid">
        <KpiCard
          title="Horas Registradas"
          value={loading ? '...' : `${horasTotales} hrs`}
          subtitle={`Equivalente a ${totalMinutosMes} min`}
          isPositive={true}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 16 14" />
            </svg>
          }
        />

        <KpiCard
          title="Gestiones Realizadas"
          value={loading ? '...' : totalRegistros}
          subtitle="Registros este mes"
          isPositive={true}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
        />

        <KpiCard
          title="Promedio por Gestión"
          value={loading ? '...' : totalRegistros > 0 ? `${(totalMinutosMes / totalRegistros).toFixed(0)} min` : '0 min'}
          subtitle="Tiempo medio por tarea"
          isPositive={true}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
      </div>

      {/* Tabla de Registros Recientes */}
      <div style={{ marginTop: '36px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Últimas Gestiones Registradas</h3>
        
        <div style={{
          backgroundColor: 'var(--bg-navbar, #ffffff)',
          border: '1px solid var(--border-navbar, #e5e7eb)',
          borderRadius: '10px',
          overflowX: 'auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--hover-navbar, #f9fafb)',
                borderBottom: '1px solid var(--border-navbar, #e5e7eb)',
                color: '#6b7280'
              }}>
                <th style={{ padding: '12px 16px' }}>Fecha</th>
                <th style={{ padding: '12px 16px' }}>Cliente</th>
                <th style={{ padding: '12px 16px' }}>Tipo Gestión</th>
                <th style={{ padding: '12px 16px' }}>Actividad</th>
                <th style={{ padding: '12px 16px' }}>Nro TK</th>
                <th style={{ padding: '12px 16px' }}>Tiempo</th>
                <th style={{ padding: '12px 16px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                    Cargando registros...
                  </td>
                </tr>
              ) : ultimosRegistros.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                    No hay gestiones registradas aún.
                  </td>
                </tr>
              ) : (
                ultimosRegistros.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-navbar, #f3f4f6)' }}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.fecha}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{row.cliente}</td>
                    <td style={{ padding: '12px 16px' }}>{row.tipo_gestion}</td>
                    <td style={{ padding: '12px 16px' }}>{row.tipo_actividad}</td>
                    <td style={{ padding: '12px 16px' }}>{row.nro_tk || '-'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{row.tiempo_invertido} min</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        backgroundColor: row.estado === 'Finalizado' ? '#d1fae5' : '#fef3c7',
                        color: row.estado === 'Finalizado' ? '#065f46' : '#92400e'
                      }}>
                        {row.estado || 'Registrado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};