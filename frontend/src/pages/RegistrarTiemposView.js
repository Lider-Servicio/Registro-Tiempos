import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseCliente';
import '../assets/css/RegistrarTiempos.css';

export const RegistrarTiemposView = ({ userId }) => {
  // --- ESTADOS PARA OPCIONES (Consultadas desde la BD) ---
  const [listaClientes, setListaClientes] = useState([]);
  const [listaTiposGestion, setListaTiposGestion] = useState([]);
  const [listaTiposActividad, setListaTiposActividad] = useState([]);
  const [listaEstados, setListaEstados] = useState([]);
  const [listaMotivos, setListaMotivos] = useState([]);

  // --- ESTADOS DEL FORMULARIO ---
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

  // --- ESTADOS DE INTERFAZ ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Cargar Clientes desde la tabla maestras 'cliente'
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from('cliente')
        .select('id, nombre_cliente')
        .order('nombre_cliente', { ascending: true });

      if (error) {
        console.error('Error al cargar clientes:', error.message);
      } else if (data) {
        setListaClientes(data);
      }
    };
    fetchClientes();
  }, []);

  // 2. Cargar Tipos de Gestión según Cliente seleccionado (tabla: cliente_gestion)
  useEffect(() => {
    if (!cliente) {
      setListaTiposGestion([]);
      return;
    }
    const fetchTiposGestion = async () => {
      // Paso A: Obtener IDs de la tabla intermedia
      const { data: relData, error: relError } = await supabase
        .from('cliente_gestion')
        .select('tipo_gestion')
        .eq('cliente', cliente);

      if (relError || !relData || relData.length === 0) {
        setListaTiposGestion([]);
        return;
      }

      const idsGestion = relData.map((r) => r.tipo_gestion);

      // Paso B: Consultar nombres en la tabla maestra tipoGestion
      const { data: gestiones, error: gestError } = await supabase
        .from('tipoGestion')
        .select('id, nombre_gestion')
        .in('id', idsGestion);

      if (!gestError && gestiones) {
        setListaTiposGestion(gestiones);
      }
    };

    fetchTiposGestion();
  }, [cliente]);

  // 3. Cargar Tipos de Actividad según Tipo de Gestión (tabla: tipoGestion_tipoActividad)
  useEffect(() => {
    if (!tipoGestion) {
      setListaTiposActividad([]);
      return;
    }
    const fetchTiposActividad = async () => {
      // Paso A: Obtener IDs de la tabla intermedia
      const { data: relData, error: relError } = await supabase
        .from('tipoGestion_tipoActividad')
        .select('tipo_actividad')
        .eq('tipo_gestion', tipoGestion);

      if (relError || !relData || relData.length === 0) {
        setListaTiposActividad([]);
        return;
      }

      const idsActividad = relData.map((r) => r.tipo_actividad);

      // Paso B: Consultar nombres en la tabla maestra tipoActividad
      const { data: actividades, error: actError } = await supabase
        .from('tipoActividad')
        .select('id, tipo_actividad')
        .in('id', idsActividad);

      if (!actError && actividades) {
        setListaTiposActividad(actividades);
      }
    };

    fetchTiposActividad();
  }, [tipoGestion]);

  // 4. Cargar Estados según Tipo de Actividad (tabla: tipoActividad_estado)
  useEffect(() => {
    if (!tipoActividad) {
      setListaEstados([]);
      return;
    }
    const fetchEstados = async () => {
      // Paso A: Obtener IDs de la tabla intermedia
      const { data: relData, error: relError } = await supabase
        .from('tipoActividad_estado')
        .select('estado')
        .eq('tipo_actividad', tipoActividad);

      if (relError || !relData || relData.length === 0) {
        setListaEstados([]);
        return;
      }

      const idsEstado = relData.map((r) => r.estado);

      // Paso B: Consultar nombres en la tabla maestra estado
      const { data: estados, error: estError } = await supabase
        .from('estado')
        .select('id, estado')
        .in('id', idsEstado);

      if (!estError && estados) {
        setListaEstados(estados);
      }
    };

    fetchEstados();
  }, [tipoActividad]);

  // 5. Cargar Motivos según Tipo Actividad y Estado (tabla: Estado_Motivo)
  useEffect(() => {
    if (!tipoActividad || !estado) {
      setListaMotivos([]);
      return;
    }
    const fetchMotivos = async () => {
      // Paso A: Obtener IDs de la tabla intermedia
      const { data: relData, error: relError } = await supabase
        .from('Estado_Motivo')
        .select('motivo')
        .eq('tipo_actividad', tipoActividad)
        .eq('estado', estado);

      if (relError || !relData || relData.length === 0) {
        setListaMotivos([]);
        return;
      }

      const idsMotivo = relData.map((r) => r.motivo);

      // Paso B: Consultar nombres en la tabla maestra motivo
      const { data: motivos, error: motError } = await supabase
        .from('motivo')
        .select('id, motivo')
        .in('id', idsMotivo);

      if (!motError && motivos) {
        setListaMotivos(motivos);
      }
    };

    fetchMotivos();
  }, [tipoActividad, estado]);

  // --- MANEJADORES DE CAMBIO CON RESETEO DE DEPENDENCIAS ---
  const handleClienteChange = (e) => {
    setCliente(e.target.value);
    setTipoGestion('');
    setTipoActividad('');
    setEstado('');
    setMotivo('');
    setNroTk('');
    resetCamposTicket();
  };

  const handleTipoGestionChange = (e) => {
    setTipoGestion(e.target.value);
    setTipoActividad('');
    setEstado('');
    setMotivo('');
    setNroTk('');
    resetCamposTicket();
  };

  const handleTipoActividadChange = (e) => {
    setTipoActividad(e.target.value);
    setEstado('');
    setMotivo('');
    setNroTk('');
    resetCamposTicket();
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setMotivo('');
    setDetalle('');
    setNuevoResponsable('');
  };

  const handleNroTkChange = (e) => {
    const val = e.target.value;
    setNroTk(val);
    if (!val.trim()) {
      resetCamposTicket();
    }
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

    // Mapear los IDs seleccionados a sus descripciones en texto plano para registros_gestion
    const clienteObj = listaClientes.find((c) => c.id === cliente);
    const gestionObj = listaTiposGestion.find((g) => g.id === tipoGestion);
    const actividadObj = listaTiposActividad.find((a) => a.id === tipoActividad);
    const estadoObj = listaEstados.find((e) => e.id === estado);
    const motivoObj = listaMotivos.find((m) => m.id === motivo);

    const payload = {
      user_id: userId,
      cliente: clienteObj ? clienteObj.nombre_cliente : cliente,
      tipo_gestion: gestionObj ? gestionObj.nombre_gestion : tipoGestion,
      tipo_actividad: actividadObj ? actividadObj.tipo_actividad : tipoActividad,
      nro_tk: nroTk || null,
      tipo_caso: tipoCaso || null,
      modulo: modulo || null,
      causa_raiz: causaRaiz || null,
      descripcion,
      estado: estadoObj ? estadoObj.estado : estado || null,
      motivo: motivoObj ? motivoObj.motivo : motivo || null,
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
    <div className="registro-container">
      <h2>Registro de Gestiones</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Complete los campos seleccionando las opciones registradas en la base de datos.
      </p>

      <form onSubmit={handleSubmit} className="registro-form">
        {/* Fila 1: Cliente, Tipo Gestión, Tipo Actividad */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CLIENTE *</label>
            <select value={cliente} onChange={handleClienteChange} required>
              <option value="">Seleccione cliente...</option>
              {listaClientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_cliente}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">TIPO GESTIÓN *</label>
            <select 
              value={tipoGestion} 
              onChange={handleTipoGestionChange} 
              disabled={!cliente || listaTiposGestion.length === 0} 
              required
            >
              <option value="">Seleccione gestión...</option>
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
              disabled={!tipoGestion || listaTiposActividad.length === 0} 
              required
            >
              <option value="">Seleccione actividad...</option>
              {listaTiposActividad.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tipo_actividad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2: NRO TK, Tipo Caso, Módulo SAP */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">NRO TK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. TK-8492"
              value={nroTk}
              onChange={handleNroTkChange}
              disabled={!tipoActividad}
            />
          </div>

          <div className="form-group">
            <label className="form-label">TIPO CASO</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Incidente, Consulta"
              value={tipoCaso}
              onChange={(e) => setTipoCaso(e.target.value)}
              disabled={!nroTk}
            />
          </div>

          <div className="form-group">
            <label className="form-label">MÓDULO SAP</label>
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

        {/* Fila 3: Causa Raíz y Tiempo Invertido */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">CAUSA RAÍZ</label>
            <input
              type="text"
              className="form-input"
              placeholder="Causa o problema original"
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              disabled={!nroTk}
            />
          </div>

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
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label className="form-label">DESCRIPCIÓN *</label>
          <textarea
            placeholder="Resumen del TK o actividad asociada..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        {/* Fila 4: Estado, Motivo, Nuevo Responsable */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">ESTADO</label>
            <select 
              value={estado} 
              onChange={handleEstadoChange} 
              disabled={!tipoActividad || listaEstados.length === 0}
            >
              <option value="">Seleccione estado...</option>
              {listaEstados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.estado}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">MOTIVO</label>
            <select 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)} 
              disabled={!estado || listaMotivos.length === 0}
            >
              <option value="">Seleccione motivo...</option>
              {listaMotivos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.motivo}
                </option>
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
              disabled={!estado}
            />
          </div>
        </div>

        {/* Detalle (si aplica) */}
        {estado && (
          <div className="form-group">
            <label className="form-label">DETALLE</label>
            <textarea
              placeholder="Desglose de por qué se escaló o quedó pendiente..."
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </div>
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