import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import '../assets/css/RegistrarTiempos.css';

export const RegistrarTiemposView = ({ userId, userEmail = 'lider.servicio@flagsoluciones.com', token }) => {
  // --- ESTADOS DE OPCIONES (Listas Maestras) ---
  const [listaClientes, setListaClientes] = useState([]);
  const [listaTiposGestion, setListaTiposGestion] = useState([]);
  const [listaTiposActividad, setListaTiposActividad] = useState([]);
  const [listaEstados, setListaEstados] = useState([]);
  const [listaMotivos, setListaMotivos] = useState([]);

  // --- ESTADOS DEL FORMULARIO ---
  const [cliente, setCliente] = useState('');
  const [tipoGestion, setTipoGestion] = useState('');
  const [tipoActividad, setTipoActividad] = useState('');
  const [canalIngreso, setCanalIngreso] = useState('');
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

  // --- ESTADOS DE LÓGICA DINÁMICA DE TICKET ---
  const [ticketExisteBD, setTicketExisteBD] = useState(false);
  const [buscandoTicket, setBuscandoTicket] = useState(false);

  // --- ESTADOS DE INTERFAZ ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Evaluador flexible para gestión de tipo TK o Ticket
  const gestionSeleccionadaObj = listaTiposGestion.find((g) => String(g.id) === String(tipoGestion));
  const nombreGestionLower = gestionSeleccionadaObj ? gestionSeleccionadaObj.nombre_gestion.toLowerCase() : '';
  const esGestionTk = nombreGestionLower.includes('tk') || nombreGestionLower.includes('ticket');

  // Evaluador de Actividades de llamada o transferencia
  const actividadSeleccionadaObj = listaTiposActividad.find((a) => String(a.id) === String(tipoActividad));
  const nombreActividadLower = actividadSeleccionadaObj ? actividadSeleccionadaObj.tipo_actividad.toLowerCase() : '';
  const esMotivoLlamada = nombreActividadLower.includes('transferida') || nombreActividadLower.includes('llamada');

  // Evaluador para mostrar motivo, detalle y nuevo responsable ("Escalado", "Pendiente" o Actividades de Llamada)
  const estadoSeleccionadoObj = listaEstados.find((e) => String(e.id) === String(estado));
  const nombreEstadoLower = estadoSeleccionadoObj ? estadoSeleccionadoObj.estado.toLowerCase() : '';
  const requiereCamposEspeciales =
    nombreEstadoLower.includes('escalado') || nombreEstadoLower.includes('pendiente') || esMotivoLlamada;

  // 1. Cargar Clientes al montar
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await apiService.getClientes();
        setListaClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar clientes:', err.message);
        setListaClientes([]);
      }
    };
    fetchClientes();
  }, []);

  // 2. Cargar Tipos de Gestión según Cliente
  useEffect(() => {
    if (!cliente) {
      setListaTiposGestion([]);
      return;
    }
    const fetchTiposGestion = async () => {
      try {
        const data = await apiService.getTiposGestion(cliente);
        setListaTiposGestion(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar tipos de gestión:', err.message);
        setListaTiposGestion([]);
      }
    };
    fetchTiposGestion();
  }, [cliente]);

  // 3. Cargar Tipos de Actividad según Tipo de Gestión
  useEffect(() => {
    if (!tipoGestion) {
      setListaTiposActividad([]);
      return;
    }
    const fetchTiposActividad = async () => {
      try {
        const data = await apiService.getTiposActividad(tipoGestion);
        setListaTiposActividad(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar tipos de actividad:', err.message);
        setListaTiposActividad([]);
      }
    };
    fetchTiposActividad();
  }, [tipoGestion]);

  // 4. Cargar Estados según Tipo de Actividad
  useEffect(() => {
    if (!tipoActividad) {
      setListaEstados([]);
      return;
    }
    const fetchEstados = async () => {
      try {
        const data = await apiService.getEstados(tipoActividad);
        setListaEstados(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar estados:', err.message);
        setListaEstados([]);
      }
    };
    fetchEstados();
  }, [tipoActividad]);

  // 5. Cargar Motivos desde la tabla puente 'actividad_estado_motivo'
  useEffect(() => {
    if (!tipoActividad) {
      setListaMotivos([]);
      return;
    }
    const fetchMotivos = async () => {
      try {
        const data = await apiService.getMotivos(tipoActividad, estado || null);
        setListaMotivos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar motivos:', err.message);
        setListaMotivos([]);
      }
    };
    fetchMotivos();
  }, [tipoActividad, estado]);

  // Consulta de ticket en tiempo real
  const verificarTicketEnBD = useCallback(async (numeroTicket) => {
    if (!numeroTicket || !numeroTicket.trim()) {
      setTicketExisteBD(false);
      resetCamposAutocompletados();
      return;
    }

    setBuscandoTicket(true);
    try {
      const data = await apiService.buscarTicket(numeroTicket.trim());
      if (data && data.length > 0) {
        const reg = data[0];
        setTicketExisteBD(true);
        setCanalIngreso(reg.canal_ingreso || 'Portal / Ticket');
        setTipoCaso(reg.tipo_caso || ''); // 👈 Precarga de Tipo Caso desde BD
        setModulo(reg.modulo || '');
        setCausaRaiz(reg.causa_raiz || '');
        setDescripcion(reg.descripcion || '');
      } else {
        setTicketExisteBD(false);
        resetCamposAutocompletados();
      }
    } catch (err) {
      console.error('Error al verificar ticket:', err);
      setTicketExisteBD(false);
    } finally {
      setBuscandoTicket(false);
    }
  }, []);

  // Debounce para el input de Nro Tk
  useEffect(() => {
    if (!esGestionTk || !nroTk) {
      setTicketExisteBD(false);
      return;
    }

    const timer = setTimeout(() => {
      verificarTicketEnBD(nroTk);
    }, 600);

    return () => clearTimeout(timer);
  }, [nroTk, esGestionTk, verificarTicketEnBD]);

  const resetCamposAutocompletados = () => {
    setCanalIngreso('');
    setTipoCaso('');
    setModulo('');
    setCausaRaiz('');
    setDescripcion('');
  };

  // Handlers
  const handleClienteChange = (e) => {
    setCliente(e.target.value);
    setTipoGestion('');
    setTipoActividad('');
    setEstado('');
    setMotivo('');
    setNroTk('');
    setTicketExisteBD(false);
    resetCamposAutocompletados();
  };

  const handleTipoGestionChange = (e) => {
    setTipoGestion(e.target.value);
    setTipoActividad('');
    setEstado('');
    setMotivo('');
    setNroTk('');
    setTicketExisteBD(false);
    resetCamposAutocompletados();
  };

  const handleTipoActividadChange = (e) => {
    setTipoActividad(e.target.value);
    setEstado('');
    setMotivo('');
    setNroTk('');
    setTicketExisteBD(false);
    resetCamposAutocompletados();
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setMotivo('');
    setDetalle('');
    setNuevoResponsable('');
  };

  const resetForm = () => {
    setCliente('');
    setTipoGestion('');
    setTipoActividad('');
    setCanalIngreso('');
    setNroTk('');
    setTipoCaso('');
    setModulo('');
    setCausaRaiz('');
    setDescripcion('');
    setEstado('');
    setMotivo('');
    setDetalle('');
    setNuevoResponsable('');
    setTiempoInvertido('');
    setObservaciones('');
    setTicketExisteBD(false);
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

    const gestionadorNombre = userEmail ? userEmail.split('@')[0] : 'lider.servicio';

    const clienteObj = listaClientes.find((c) => String(c.id) === String(cliente));
    const gestionObj = listaTiposGestion.find((g) => String(g.id) === String(tipoGestion));
    const actividadObj = listaTiposActividad.find((a) => String(a.id) === String(tipoActividad));
    const estadoObj = listaEstados.find((e) => String(e.id) === String(estado));
    const motivoObj = listaMotivos.find((m) => String(m.id) === String(motivo));

    const payload = {
      userId,
      gestionador: gestionadorNombre,
      clienteId: cliente || null,
      clienteNombre: clienteObj ? clienteObj.nombre_cliente : cliente,
      tipoGestionId: tipoGestion || null,
      tipoGestionNombre: gestionObj ? gestionObj.nombre_gestion : tipoGestion,
      tipoActividadId: tipoActividad || null,
      tipoActividadNombre: actividadObj ? actividadObj.tipo_actividad : tipoActividad,
      canalIngreso: canalIngreso || 'Portal / Ticket',
      nroTk: esGestionTk ? nroTk || null : null,
      tipoCaso: tipoCaso || null,
      modulo: modulo || null,
      causaRaiz: causaRaiz || null,
      descripcion: descripcion || 'Gestión sobre ticket existente',
      estadoId: estado || null,
      estadoNombre: estadoObj ? estadoObj.estado : estado || null,
      motivoId: motivo || null,
      motivoNombre: motivoObj ? motivoObj.motivo : motivo || null,
      esMotivoLlamada,
      detalle: detalle || null,
      nuevoResponsable: nuevoResponsable || null,
      tiempoInvertido: parseFloat(tiempoInvertido),
      observaciones: observaciones || null,
    };

    try {
      await apiService.registrarGestion(payload, token);
      setSuccess('¡Gestión registrada con éxito en el backend!');
      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar la gestión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro de Gestiones</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Complete el formulario conectando a la API de Node.js.
      </p>

      <form onSubmit={handleSubmit} className="registro-form">
        {/* Fila 1 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CLIENTE *</label>
            <select value={cliente} onChange={handleClienteChange} required>
              <option value="">Seleccione cliente...</option>
              {listaClientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre_cliente}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">TIPO GESTIÓN *</label>
            <select
              value={tipoGestion}
              onChange={handleTipoGestionChange}
              disabled={!cliente}
              required
            >
              <option value="">Seleccione tipo gestión...</option>
              {listaTiposGestion.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre_gestion}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">TIPO ACTIVIDAD *</label>
            <select
              value={tipoActividad}
              onChange={handleTipoActividadChange}
              disabled={!tipoGestion}
              required
            >
              <option value="">Seleccione actividad...</option>
              {listaTiposActividad.map((a) => (
                <option key={a.id} value={a.id}>{a.tipo_actividad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila NRO TK */}
        {esGestionTk && (
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">NRO TK *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. TK-8492"
                value={nroTk}
                onChange={(e) => setNroTk(e.target.value)}
                required
              />
              {buscandoTicket && (
                <span className="ticket-status-loading">
                  🔍 Buscando ticket en BD...
                </span>
              )}
              {ticketExisteBD && (
                <span className="ticket-status-success">
                  ✓ Ticket registrado. Datos básicos (Canal, Tipo Caso, Módulo, Causa Raíz y Descripción) precargados de la BD.
                </span>
              )}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">TIPO CASO</label>
              <select
                className="form-input"
                value={tipoCaso}
                onChange={(e) => setTipoCaso(e.target.value)}
              >
                <option value="">Seleccione tipo de caso...</option>
                <option value="Solicitud">Solicitud</option>
                <option value="Incidente">Incidente</option>
                <option value="Tarea">Tarea</option>
              </select>
            </div>
          </div>
        )}

        {/* BLOQUE CAMPOS BÁSICOS PRECARGADOS */}
        {!ticketExisteBD && (
          <div className="bloque-datos-basicos">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CANAL DE INGRESO *</label>
                <select
                  className="form-input"
                  value={canalIngreso}
                  onChange={(e) => setCanalIngreso(e.target.value)}
                  required={!ticketExisteBD}
                >
                  <option value="">Seleccione canal...</option>
                  <option value="Correo">Correo</option>
                  <option value="Portal / Ticket">Portal / Ticket</option>
                  <option value="Llamada / Teams">Llamada / Teams</option>
                  <option value="Chat">Chat</option>
                  <option value="Verbal / Presencial">Verbal / Presencial</option>
                </select>
              </div>

              {esGestionTk && (
                <>
                  <div className="form-group">
                    <label className="form-label">MÓDULO SAP</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. MM, FI"
                      value={modulo}
                      onChange={(e) => setModulo(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CAUSA RAÍZ</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Causa o problema original"
                      value={causaRaiz}
                      onChange={(e) => setCausaRaiz(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPCIÓN *</label>
              <textarea
                placeholder="Resumen del TK o actividad..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required={!ticketExisteBD}
              />
            </div>
          </div>
        )}

        {/* Fila Tiempo y Estado */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">TIEMPO INVERTIDO (MIN) *</label>
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

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">ESTADO</label>
            <select
              value={estado}
              onChange={handleEstadoChange}
              disabled={!tipoActividad}
            >
              <option value="">Seleccione estado...</option>
              {listaEstados.map((e) => (
                <option key={e.id} value={e.id}>{e.estado}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos Condicionales de Estado o Llamadas */}
        {requiereCamposEspeciales && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">MOTIVO *</label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                >
                  <option value="">Seleccione motivo...</option>
                  {listaMotivos.map((m) => (
                    <option key={m.id} value={m.id}>{m.motivo}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">NUEVO RESPONSABLE</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Persona asignada"
                  value={nuevoResponsable}
                  onChange={(e) => setNuevoResponsable(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DETALLE</label>
              <textarea
                placeholder="Desglose de por qué se escaló o quedó pendiente..."
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Observaciones */}
        <div className="form-group">
          <label className="form-label">OBSERVACIONES</label>
          <textarea
            placeholder="Notas u observaciones adicionales..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : 'Registrar Gestión'}
        </button>
      </form>
    </div>
  );
};