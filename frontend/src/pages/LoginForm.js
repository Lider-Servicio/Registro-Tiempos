import React, { useState } from 'react';
import { supabase } from '../lib/supabaseCliente';
import '../assets/css/Login.css';
import logoFlag from '../assets/img/logoFlag.png';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Vistas posibles: 'login' | 'signup' | 'forgot'
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const ALLOWED_DOMAIN = 'flagsoluciones.com';

    // Validar que el correo sea del dominio permitido
    const validateDomain = (emailToTest) => {
        const domain = emailToTest.split('@')[1];
        return domain && domain.toLowerCase() === ALLOWED_DOMAIN;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!validateDomain(email)) {
            setError(`Solo se permiten correos del dominio @${ALLOWED_DOMAIN}`);
            return;
        }

        setLoading(true);

        if (view === 'signup') {
            // Modo Registro
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                setMessage('Registro correcto. Revisa tu bandeja de entrada para confirmar el correo.');
            }
        } else if (view === 'login') {
            // Modo Inicio de Sesión
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
            }
        } else if (view === 'forgot') {
            // Modo Olvidé mi Contraseña
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setMessage('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
           
            <div className="login-card">
                {/* Logo pequeño en la parte superior de la tarjeta */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <img src={logoFlag} alt="Logo FLAG" style={{ width: '110px' }} />
                </div>

                <h2 className="login-title">
                    {view === 'signup' && 'Crear cuenta'}
                    {view === 'login' && 'Iniciar sesión'}
                    {view === 'forgot' && 'Recuperar contraseña'}
                </h2>

                <p className="login-subtitle">
                    Uso exclusivo para personal de <strong>FLAG SOLUCIONES S.A.S</strong>
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={`usuario@${ALLOWED_DOMAIN}`}
                            required
                        />
                    </div>

                    {/* El campo contraseña se oculta en el modo 'forgot' */}
                    {view !== 'forgot' && (
                        <div className="form-group">

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label">Contraseña</label>
                            </div>
                            <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>    
                                {view === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => { setView('forgot'); setError(null); setMessage(null); }}
                                        className="btn-link-sm"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {error && <div id="error" className="alert alert-error">{error}</div>}
                    {message && <div id="message" className="alert alert-success">{message}</div>}

                    <button id="submit-btn" type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Procesando...' : (
                            view === 'signup' ? 'Registrarme' :
                                view === 'login' ? 'Entrar' : 'Enviar correo de recuperación'
                        )}
                    </button>
                </form>

                <div className="toggle-container">
                    {view === 'forgot' ? (
                        <button
                            type="button"
                            onClick={() => { setView('login'); setError(null); setMessage(null); }}
                            className="btn-link"
                        >
                            Volver al inicio de sesión
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setView(view === 'signup' ? 'login' : 'signup');
                                setError(null);
                                setMessage(null);
                            }}
                            className="btn-link"
                        >
                            {view === 'signup'
                                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                                : '¿No tienes cuenta? Regístrate aquí'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};