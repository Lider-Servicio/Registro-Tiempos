import React, { useEffect, useState } from 'react';
import './assets/css/App.css';
import { supabase } from './lib/supabaseCliente';
import { LoginForm } from './pages/LoginForm';
import { ResetPassword } from './pages/ResetPassword';
import { Navbar } from './components/Navbar';
import { DashboardView } from './pages/DashboardView';

function App() {
  const [session, setSession] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isResettingPassword) {
    return <ResetPassword onPasswordResetSuccess={() => setIsResettingPassword(false)} />;
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div>
      {/* Barra de Navegación Fija */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />

      {/* Contenido Principal con compensación por la barra fija */}
      <main style={{ paddingTop: '70px', paddingLeft: '24px', paddingRight: '24px' }}>
        {activeTab === 'dashboard' && (
          <DashboardView userEmail={session.user.email} />
        )}

        {activeTab === 'registrar' && (
          <div>
            <h2>Registrar Tiempos</h2>
            <p>Aquí irá el formulario para el registro de tiempos de trabajo.</p>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div>
            <h2>Perfil de Usuario</h2>
            <p>Correo electrónico: {session.user.email}</p>
            <p>Dominio: @flagsoluciones.com</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;