import React, { useState } from 'react';
import { supabase } from '../lib/supabaseCliente';
import '../assets/css/RegistrarTiempos.css';

export const RegistrarTiemposView = ({ userId }) => {
  // Estados del Formulario
  const [cliente, setCliente] = useState('');
  const [tipoGestion, setTipoGestion] = useState('');
  const [tipoActividad, setTipoActividad] = useState('');
  const [nroTk, setNroTk] = useState('');
  const [tipoCaso, setTipoCaso] = useState('');
  const [modulo, setModulo] = useState('');
  const [causaRaiz, setCausaRaiz] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [nuevoResponsable, setNuevoResponsable] = useState('');
  const [tiempoInvertido, setTiempoInvertido] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Manejadores de cambio con reseteo de dependencias
  const handleClienteChange = (e) => {
    setCliente(e.target.value);
    setTipoGestion('');
    setTipoActividad('');
    setNroTk('');
    resetCamposTicket();
  };

  const handleTipoGestionChange = (e) => {
    setTipoGestion(e.target.value);
    setTipoActividad('');
    setNroTk('');
    resetCamposTicket();
  };

  const handleTipoActividadChange = (e) => {
    setTipoActividad(e.target.value);
    setNroTk('');
    resetCamposTicket();
  };

  const handleNroTkChange = (e) => {
    const val = e.target.value;
    setNroTk(val);
    if (!val.trim()) {
      resetCamposTicket();
    }
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setMotivo('');
    setDetalle('');
    setNuevoResponsable('');
  };

  const resetCamposTicket = () => {
    setTipoCaso('');
    setModulo('');
    setCausaRaiz('');
  };

  const resetForm = () => {
    setCliente('');
    setTipoGestion('');
    setTipoActividad('');
    setNroTk('');
    resetCamposTicket();
    setDescripcion('');
    setEstado('');
    setMotivo('');
    setDetalle('');
    setNuevoResponsable('');
    setTiempoInvertido('');
    setObservaciones('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (parseFloat(tiempoInvertido) <= 0) {
      setError('El tiempo invertido debe ser mayor a 0 minutos.');
      return;
    }

    setLoading(true);

    // Los campos fecha, hora, gestionador y periodo son autoasignados en la BD
    const payload = {
      user_id: userId,
      cliente,
      tipo_gestion: tipoGestion,
      tipo_actividad: tipoActividad,
      nro_tk: nroTk || null,
      tipo_caso: tipoCaso || null,
      modulo: modulo || null,
      causa_raiz: causaRaiz || null,
      descripcion,
      estado: estado || null,
      motivo: motivo || null,
      detalle: detalle || null,
      nuevo_responsable: nuevoResponsable || null,
      tiempo_invertido: parseFloat(tiempoInvertido),
      observaciones: observaciones || null,
    };

    const { error: insertError } = await supabase
      .from('registros_gestion')
      .insert([payload]);

    if (insertError) {
      setError(`Error al registrar gestión: ${insertError.message}`);
    } else {
      setSuccess('¡Gestión registrada con éxito!');
      resetForm();
    }

    setLoading(false);
  };

  return (
    <div className="registro-container" style={{ maxWidth: '800px' }}>
      <h2>Registrar Gestión de Tiempo</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Diligencie los campos requeridos para el registro oficial de actividades.
      </p>

      <form onSubmit={handleSubmit} className="registro-form">
        {/* Bloque 1: Cliente, Tipo Gestión, Tipo Actividad */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select value={cliente} onChange={handleClienteChange} required>
              <option value="">Seleccione cliente...</option>
              <option value="Interno FLAG">Interno FLAG</option>
              <option value="Cliente A">Cliente A</option>
              <option value="Cliente B">Cliente B</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo Gestión *</label>
            <select 
              value={tipoGestion} 
              onChange={handleTipoGestionChange} 
              disabled={!cliente}
              required
            >
              <option value="">Seleccione gestión...</option>
              <option value="Mesa de Ayuda">Mesa de Ayuda</option>
              <option value="Proyecto / Consultoría">Proyecto / Consultoría</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo Actividad *</label>
            <select 
              value={tipoActividad} 
              onChange={handleTipoActividadChange} 
              disabled={!tipoGestion}
              required
            >
              <option value="">Seleccione actividad...</option>
              <option value="Soporte Técnico">Soporte Técnico</option>
              <option value="Desarrollo">Desarrollo</option>
              <option value="Capacitación">Capacitación</option>
              <option value="Reunión">Reunión</option>
            </select>
          </div>
        </div>

        {/* Bloque 2: Ticket y campos dependientes del Ticket */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nro TK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. TK-1092"
              value={nroTk}
              onChange={handleNroTkChange}
              disabled={!tipoActividad}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo Caso</label>
            <select 
              value={tipoCaso} 
              onChange={(e) => setTipoCaso(e.target.value)} 
              disabled={!nroTk}
            >
              <option value="">Seleccione tipo caso...</option>
              <option value="Incidente">Incidente</option>
              <option value="Requerimiento">Requerimiento</option>
              <option value="Consulta">Consulta</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Módulo SAP</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. MM, FI, SD"
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              disabled={!nroTk}
            />
          </div>
        </div>

        {/* Bloque 3: Causa Raíz y Tiempo Invertido */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Causa Raíz</label>
            <input
              type="text"
              className="form-input"
              placeholder="Origen o motivo del ticket"
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              disabled={!nroTk}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Tiempo (Minutos) *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="Ej. 45"
              value={tiempoInvertido}
              onChange={(e) => setTiempoInvertido(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Bloque 4: Descripción */}
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <textarea
            placeholder="Resumen del TK o actividad asociada al registro..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        {/* Bloque 5: Estado, Motivo, Nuevo Responsable */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select 
              value={estado} 
              onChange={handleEstadoChange}
              disabled={!tipoActividad}
            >
              <option value="">Seleccione estado...</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Escalado">Escalado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Motivo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Razón de pendiente/escalado"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={!estado || estado === 'Finalizado'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nuevo Responsable</label>
            <input
              type="text"
              className="form-input"
              placeholder="Persona asignada"
              value={nuevoResponsable}
              onChange={(e) => setNuevoResponsable(e.target.value)}
              disabled={!estado || estado === 'Finalizado'}
            />
          </div>
        </div>

        {/* Bloque 6: Detalle (si aplica) y Observaciones */}
        {estado && estado !== 'Finalizado' && (
          <div className="form-group">
            <label className="form-label">Detalle de Escalado / Pendiente</label>
            <textarea
              placeholder="Desglose de la razón de escalado o estado pendiente..."
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea
            placeholder="Notas u observaciones adicionales sobre el registro..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" disabled={loading} className="btn-primary" id="submit-btn">
          {loading ? 'Guardando...' : 'Registrar Gestión'}
        </button>
      </form>
    </div>
  );
};