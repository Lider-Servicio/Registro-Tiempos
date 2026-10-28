import React, { useEffect, useState } from 'react';
import '../assets/css/Navbar.css';
import logoFlag from '../assets/img/logoFlag.png';

export const Navbar = ({ activeTab, setActiveTab, userEmail, onSignOut }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Alternar el atributo data-theme en el elemento HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      {/* Marca / Logo */}
      <div className="navbar-brand">
        <img src={logoFlag} alt="FLAG SOLUCIONES" className="navbar-logo" />
        <span>FLAG SOLUCIONES</span>
      </div>

      {/* Menú de Opciones */}
      <div className="navbar-menu">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {/* Ícono Dashboard */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Dashboard
        </button>

        <button
          className={`nav-item ${activeTab === 'registrar' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrar')}
        >
          {/* Ícono Registrar */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Registrar
        </button>

        <div className="nav-divider" />

        {/* Botón Cambiar Modo (Oscuro / Claro) */}
        <button
          className="icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? (
            /* Ícono Sol */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Ícono Luna */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Ícono de Perfil */}
        <button
          className="icon-btn"
          onClick={() => setActiveTab('perfil')}
          title={`Perfil (${userEmail})`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Ícono Cerrar Sesión */}
        <button
          className="icon-btn"
          onClick={onSignOut}
          title="Cerrar sesión"
          style={{ color: '#d93025' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
};