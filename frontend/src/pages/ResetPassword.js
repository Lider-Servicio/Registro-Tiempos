import React, { useState } from 'react';
import { supabase } from '../lib/supabaseCliente';
import '../assets/css/Login.css';
import logoFlag from '../assets/img/logoFlag.png';

export const ResetPassword = ({ onPasswordResetSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        // Validaciones básicas de la contraseña
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        // Actualizar la contraseña en la sesión activa de Supabase
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setMessage('Tu contraseña ha sido actualizada con éxito.');
            setTimeout(() => {
                if (onPasswordResetSuccess) {
                    onPasswordResetSuccess();
                } else {
                    window.location.href = '/';
                }
            }, 2500);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <img src={logoFlag} alt="FLAG SOLUCIONES S.A.S" className="bg-logo" />

            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <img src={logoFlag} alt="Logo FLAG" style={{ width: '110px' }} />
                </div>

                <h2 className="login-title">Nueva Contraseña</h2>
                <p className="login-subtitle">
                    Ingresa tu nueva contraseña para la cuenta de <strong>FLAG SOLUCIONES S.A.S</strong>
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Nueva contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                        />
                    </div>

                    {error && <div id="error" className="alert alert-error">{error}</div>}
                    {message && <div id="message" className="alert alert-success">{message}</div>}

                    <button id="submit-btn" type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Guardando...' : 'Restablecer contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};