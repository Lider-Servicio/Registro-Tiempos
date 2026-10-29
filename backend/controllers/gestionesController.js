const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. GET /api/gestiones/buscar-ticket
exports.buscarTicket = async (req, res) => {
  const { nroTk, clienteId } = req.query;
  if (!nroTk) return res.status(400).json({ message: 'El parámetro nroTk es obligatorio' });

  try {
    let query = supabase
      .from('registros_gestion')
      .select('canal_ingreso, tipo_caso, modulo, causa_raiz, descripcion')
      .eq('nro_tk', String(nroTk));

    if (clienteId) query = query.eq('cliente', String(clienteId));

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 2. GET /api/gestiones/clientes
exports.getClientes = async (req, res) => {
  try {
    const { data, error } = await supabase.from('cliente').select('id, nombre_cliente');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 3. GET /api/gestiones/tipos-gestion
exports.getTiposGestion = async (req, res) => {
  const { clienteId } = req.query;
  try {
    let query = supabase.from('tipo_gestion').select('id, nombre_gestion');
    if (clienteId) query = query.eq('cliente', String(clienteId));
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 4. GET /api/gestiones/tipos-actividad
exports.getTiposActividad = async (req, res) => {
  const { tipoGestionId } = req.query;
  try {
    let query = supabase.from('tipo_actividad').select('id, tipo_actividad');
    if (tipoGestionId) query = query.eq('tipo_gestion', String(tipoGestionId));
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 5. GET /api/gestiones/estados
exports.getEstados = async (req, res) => {
  const { tipoActividadId } = req.query;
  try {
    let query = supabase.from('estado').select('id, estado');
    if (tipoActividadId) query = query.eq('tipo_actividad', String(tipoActividadId));
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 6. GET /api/gestiones/motivos
exports.getMotivos = async (req, res) => {
  const { tipoActividadId, estadoId } = req.query;
  if (!tipoActividadId) return res.status(400).json({ message: 'El parámetro tipoActividadId es obligatorio' });

  try {
    let query = supabase.from('actividad_estado_motivo').select('motivo').eq('actividad', String(tipoActividadId));

    if (estadoId && estadoId !== 'null' && estadoId !== 'undefined' && estadoId !== '') {
      query = query.eq('estado', String(estadoId));
    } else {
      query = query.is('estado', null);
    }

    const { data: puenteData, error: puenteError } = await query;
    if (puenteError) return res.status(400).json({ error: puenteError.message });
    if (!puenteData || puenteData.length === 0) return res.json([]);

    const listaMotivosIds = puenteData.map((item) => item.motivo);
    const { data: motivosData, error: motivosError } = await supabase.from('motivo').select('id, motivo').in('id', listaMotivosIds);
    if (motivosError) return res.status(400).json({ error: motivosError.message });

    res.json(motivosData || []);
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// 7. POST /api/gestiones/registrar
exports.registrarGestion = async (req, res) => {
  const {
    userId, gestionador, userEmail, clienteId, clienteNombre,
    tipoGestionId, tipoActividadId, canalIngreso, nroTk, tipoCaso,
    modulo, causaRaiz, descripcion, estadoId, motivoId, esMotivoLlamada,
    detalle, nuevoResponsable, tiempoInvertido, observaciones
  } = req.body;

  let nombreGestionador = gestionador || (userEmail ? userEmail.split('@')[0] : 'lider.servicio');
  const clienteFinal = clienteId || clienteNombre;

  try {
    const registroPayload = {
      gestionador: nombreGestionador,
      cliente: String(clienteFinal),
      tipo_gestion: String(tipoGestionId),
      tipo_actividad: String(tipoActividadId),
      canal_ingreso: String(canalIngreso),
      descripcion: String(descripcion),
      tiempo_invertido: Number(tiempoInvertido),
      nro_tk: nroTk || null,
      tipo_caso: tipoCaso || null,
      modulo: modulo || null,
      causa_raiz: causaRaiz || null,
      estado: estadoId ? String(estadoId) : null,
      motivo: !esMotivoLlamada && motivoId ? String(motivoId) : null,
      motivo_llamada: esMotivoLlamada && motivoId ? String(motivoId) : null,
      detalle: detalle || null,
      nuevo_responsable: nuevoResponsable || null,
      observaciones: observaciones || null
    };

    if (userId) registroPayload.user_id = userId;

    const { data, error } = await supabase.from('registros_gestion').insert([registroPayload]).select();
    if (error) return res.status(400).json({ message: error.message, details: error.details });

    res.json({ message: 'Gestión registrada exitosamente', data });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};