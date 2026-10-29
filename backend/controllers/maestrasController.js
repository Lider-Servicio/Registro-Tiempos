const supabase = require('../config/supabaseClient');

// GET /api/maestras/clientes
exports.getClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cliente') // Verifica si en Supabase se llama 'cliente' o 'clientes'
      .select('*');

    if (error) {
      console.error('❌ Error de Supabase al obtener clientes:', error);
      return res.status(500).json({ message: 'Error en la base de datos', error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('❌ Error grave en getClientes:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

// GET /api/maestras/gestiones?clienteId=X
exports.getTiposGestion = async (req, res) => {
  const { clienteId } = req.query;

  // Si no se envía clienteId, retornamos arreglo vacío en lugar de status 400
  if (!clienteId) return res.json([]);

  try {
    const { data: relData, error: relError } = await supabase
      .from('cliente_gestion')
      .select('tipo_gestion')
      .eq('cliente', clienteId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsGestion = relData.map((r) => r.tipo_gestion);

    const { data: gestiones, error: gestError } = await supabase
      .from('tipoGestion')
      .select('id, nombre_gestion')
      .in('id', idsGestion)
      .order('nombre_gestion', { ascending: true });

    if (gestError) throw gestError;
    res.json(gestiones || []);
  } catch (err) {
    console.error('❌ Error al obtener tipos de gestión:', err);
    res.status(500).json({ message: 'Error al obtener tipos de gestión', error: err.message });
  }
};

// GET /api/maestras/actividades?tipoGestionId=X
exports.getTiposActividad = async (req, res) => {
  const { tipoGestionId } = req.query;

  // Si no viene el parámetro, retornamos arreglo vacío
  if (!tipoGestionId) return res.json([]);

  try {
    const { data: relData, error: relError } = await supabase
      .from('tipoGestion_tipoActividad')
      .select('tipo_actividad')
      .eq('tipo_gestion', tipoGestionId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsActividad = relData.map((r) => r.tipo_actividad);

    const { data: actividades, error: actError } = await supabase
      .from('tipoActividad')
      .select('id, tipo_actividad')
      .in('id', idsActividad)
      .order('tipo_actividad', { ascending: true });

    if (actError) throw actError;
    res.json(actividades || []);
  } catch (err) {
    console.error('❌ Error al obtener actividades:', err);
    res.status(500).json({ message: 'Error al obtener tipos de actividad', error: err.message });
  }
};

// GET /api/maestras/estados?tipoActividadId=X
exports.getEstados = async (req, res) => {
  const { tipoActividadId } = req.query;

  if (!tipoActividadId || tipoActividadId === 'undefined') {
    return res.json([]);
  }

  try {
    // 1. Consultar 'tipoActividad_estado' solicitando la columna 'estado'
    const { data: relEspeciales, error: errRel } = await supabase
      .from('tipoActividad_estado')
      .select('estado')
      .eq('tipo_actividad', tipoActividadId);

    if (errRel) {
      console.error('❌ Error al consultar tipoActividad_estado:', errRel);
    }

    // Extraer los códigos de estado especial (ej: ['E0005', 'E0007'])[cite: 4]
    const codigosEspeciales = (relEspeciales || [])
      .map((r) => r.estado)
      .filter(Boolean);

    // 2. Consultar Estados BASE (donde base = 1 o base = true)
    const { data: estadosBase, error: errBase } = await supabase
      .from('estado')
      .select('id, estado')
      .or('base.eq.1,base.eq.true');

    if (errBase) console.error('❌ Error al consultar estados base:', errBase);

    // 3. Consultar los detalles de los Estados ESPECIALES por su código/id[cite: 4]
    let estadosEspeciales = [];
    if (codigosEspeciales.length > 0) {
      const { data: dataEsp, error: errEsp } = await supabase
        .from('estado')
        .select('id, estado')
        .in('id', codigosEspeciales); // Si en 'estado' la llave primaria se llama 'id'

      if (!errEsp && dataEsp) {
        estadosEspeciales = dataEsp;
      }
    }

    // 4. Combinar Base + Especiales y eliminar duplicados por ID
    const listaCombinada = [...(estadosBase || []), ...estadosEspeciales];
    const estadosUnicos = Array.from(
      new Map(listaCombinada.map((item) => [item.id, item])).values()
    );

    // Ordenar alfabéticamente
    estadosUnicos.sort((a, b) => a.estado.localeCompare(b.estado));

    res.json(estadosUnicos);
  } catch (err) {
    console.error('❌ Error grave en getEstados:', err);
    res.status(500).json({ message: 'Error al obtener estados', error: err.message });
  }
};

// GET /api/gestiones/motivos?tipoActividadId=TA00001&estadoId=E0003
exports.getMotivos = async (req, res) => {
  const { tipoActividadId, estadoId } = req.query;

  if (!tipoActividadId) {
    return res.status(400).json({ message: 'El parámetro tipoActividadId es obligatorio' });
  }

  try {
    // 1. Consultar la tabla puente 'actividad_estado_motivo'
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

    // 2. Traer los nombres desde la tabla 'motivo'
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
  console.log('👉 Payload recibido en registrarGestion:', req.body);

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

  // Extraer el prefijo del correo si viene gestionador/email (ej. "lider.servicio")
  let nombreGestionador = gestionador;
  if (!nombreGestionador && userEmail) {
    nombreGestionador = userEmail.split('@')[0];
  } else if (!nombreGestionador && req.user && req.user.email) {
    nombreGestionador = req.user.email.split('@')[0];
  } else if (!nombreGestionador) {
    nombreGestionador = 'Usuario Sistema';
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

      // Campos de ticket
      nro_tk: nroTk || null,
      tipo_caso: tipoCaso || null,
      modulo: modulo || null,
      causa_raiz: causaRaiz || null,

      // Estado y separación de Motivo vs Motivo Llamada
      estado: estadoId ? String(estadoId) : null,
      motivo: !esMotivoLlamada && motivoId ? String(motivoId) : null,
      motivo_llamada: esMotivoLlamada && motivoId ? String(motivoId) : null,

      // Detalle y observaciones
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
      return res.status(400).json({
        message: 'Error al insertar en la base de datos',
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('✅ Gestión registrada exitosamente:', data);
    res.json({ message: 'Gestión registrada exitosamente', data });
  } catch (err) {
    console.error('❌ Error grave en registrarGestion:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};


// GET /api/maestras/motivos?tipoActividadId=X&estadoId=Y
exports.getMotivos = async (req, res) => {
  const { tipoActividadId, estadoId } = req.query;

  if (!tipoActividadId || !estadoId) return res.json([]);

  try {
    const { data: relData, error: relError } = await supabase
      .from('Estado_Motivo')
      .select('motivo')
      .eq('tipo_actividad', tipoActividadId)
      .eq('estado', estadoId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsMotivo = relData.map((r) => r.motivo);

    const { data: motivos, error: motError } = await supabase
      .from('motivo')
      .select('id, motivo')
      .in('id', idsMotivo)
      .order('motivo', { ascending: true });

    if (motError) throw motError;
    res.json(motivos || []);
  } catch (err) {
    console.error('❌ Error al obtener motivos:', err);
    res.status(500).json({ message: 'Error al obtener motivos', error: err.message });
  }
};