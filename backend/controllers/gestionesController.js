const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/gestiones/buscar-ticket?nroTk=55555&clienteId=C0001
exports.buscarTicket = async (req, res) => {
  const { nroTk, clienteId } = req.query;

  if (!nroTk) {
    return res.status(400).json({ message: 'El parámetro nroTk es obligatorio' });
  }

  try {
    let query = supabase
      .from('registros_gestion')
      .select('canal_ingreso, tipo_caso, modulo, causa_raiz, descripcion')
      .eq('nro_tk', String(nroTk));

    if (clienteId) {
      query = query.eq('cliente', String(clienteId));
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

    if (error) {
      console.error('❌ Error al buscar ticket:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('❌ Error interno en buscarTicket:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// GET /api/gestiones/motivos?tipoActividadId=TA00001&estadoId=E0003
exports.getMotivos = async (req, res) => {
  const { tipoActividadId, estadoId } = req.query;

  if (!tipoActividadId) {
    return res.status(400).json({ message: 'El parámetro tipoActividadId es obligatorio' });
  }

  try {
    let query = supabase
      .from('actividad_estado_motivo')
      .select('motivo')
      .eq('actividad', String(tipoActividadId));

    if (estadoId && estadoId !== 'null' && estadoId !== 'undefined' && estadoId !== '') {
      query = query.eq('estado', String(estadoId));
    } else {
      query = query.is('estado', null);
    }

    const { data: puenteData, error: puenteError } = await query;

    if (puenteError) {
      console.error('❌ Error al consultar actividad_estado_motivo:', puenteError);
      return res.status(400).json({ error: puenteError.message });
    }

    if (!puenteData || puenteData.length === 0) {
      return res.json([]);
    }

    const listaMotivosIds = puenteData.map((item) => item.motivo);

    const { data: motivosData, error: motivosError } = await supabase
      .from('motivo')
      .select('id, motivo')
      .in('id', listaMotivosIds);

    if (motivosError) {
      console.error('❌ Error al consultar la tabla motivo:', motivosError);
      return res.status(400).json({ error: motivosError.message });
    }

    res.json(motivosData || []);
  } catch (err) {
    console.error('❌ Error interno en getMotivos:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// POST /api/gestiones/registrar
exports.registrarGestion = async (req, res) => {
  const {
    userId,
    gestionador,
    userEmail,
    clienteId,
    clienteNombre,
    tipoGestionId,
    tipoActividadId,
    canalIngreso,
    nroTk,
    tipoCaso,
    modulo,
    causaRaiz,
    descripcion,
    estadoId,
    motivoId,
    esMotivoLlamada,
    detalle,
    nuevoResponsable,
    tiempoInvertido,
    observaciones
  } = req.body;

  let nombreGestionador = gestionador;
  if (!nombreGestionador && userEmail) {
    nombreGestionador = userEmail.split('@')[0];
  } else if (!nombreGestionador && req.user && req.user.email) {
    nombreGestionador = req.user.email.split('@')[0];
  } else if (!nombreGestionador) {
    nombreGestionador = 'lider.servicio';
  }

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

    if (userId) {
      registroPayload.user_id = userId;
    }

    const { data, error } = await supabase
      .from('registros_gestion')
      .insert([registroPayload])
      .select();

    if (error) {
      console.error('❌ Error de Supabase al insertar:', error);
      return res.status(400).json({ message: error.message, details: error.details });
    }

    res.json({ message: 'Gestión registrada exitosamente', data });
  } catch (err) {
    console.error('❌ Error grave en registrarGestion:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};