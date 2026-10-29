const supabase = require('../config/supabaseClient');

// GET /api/maestras/clientes
exports.getClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cliente')
      .select('id, nombre_cliente')
      .order('nombre_cliente', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener clientes', error: err.message });
  }
};

// GET /api/maestras/gestiones?clienteId=X
exports.getTiposGestion = async (req, res) => {
  const { clienteId } = req.query;
  if (!clienteId) return res.status(400).json({ message: 'clienteId es requerido' });

  try {
    // 1. Obtener IDs de la tabla intermedia cliente_gestion
    const { data: relData, error: relError } = await supabase
      .from('cliente_gestion')
      .select('tipo_gestion')
      .eq('cliente', clienteId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsGestion = relData.map((r) => r.tipo_gestion);

    // 2. Consultar nombres en la tabla maestra tipoGestion
    const { data: gestiones, error: gestError } = await supabase
      .from('tipoGestion')
      .select('id, nombre_gestion')
      .in('id', idsGestion);

    if (gestError) throw gestError;
    res.json(gestiones);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tipos de gestión', error: err.message });
  }
};

// GET /api/maestras/actividades?tipoGestionId=X
exports.getTiposActividad = async (req, res) => {
  const { tipoGestionId } = req.query;
  if (!tipoGestionId) return res.status(400).json({ message: 'tipoGestionId es requerido' });

  try {
    // 1. Obtener IDs de tipoGestion_tipoActividad
    const { data: relData, error: relError } = await supabase
      .from('tipoGestion_tipoActividad')
      .select('tipo_actividad')
      .eq('tipo_gestion', tipoGestionId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsActividad = relData.map((r) => r.tipo_actividad);

    // 2. Consultar nombres en tipoActividad
    const { data: actividades, error: actError } = await supabase
      .from('tipoActividad')
      .select('id, tipo_actividad')
      .in('id', idsActividad);

    if (actError) throw actError;
    res.json(actividades);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tipos de actividad', error: err.message });
  }
};

// GET /api/maestras/estados?tipoActividadId=X
exports.getEstados = async (req, res) => {
  const { tipoActividadId } = req.query;
  if (!tipoActividadId) return res.status(400).json({ message: 'tipoActividadId es requerido' });

  try {
    // 1. Obtener IDs de tipoActividad_estado
    const { data: relData, error: relError } = await supabase
      .from('tipoActividad_estado')
      .select('estado')
      .eq('tipo_actividad', tipoActividadId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsEstado = relData.map((r) => r.estado);

    // 2. Consultar nombres en estado
    const { data: estados, error: estError } = await supabase
      .from('estado')
      .select('id, estado')
      .in('id', idsEstado);

    if (estError) throw estError;
    res.json(estados);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estados', error: err.message });
  }
};

// GET /api/maestras/motivos?tipoActividadId=X&estadoId=Y
exports.getMotivos = async (req, res) => {
  const { tipoActividadId, estadoId } = req.query;
  if (!tipoActividadId || !estadoId) {
    return res.status(400).json({ message: 'tipoActividadId y estadoId son requeridos' });
  }

  try {
    // 1. Obtener IDs de Estado_Motivo
    const { data: relData, error: relError } = await supabase
      .from('Estado_Motivo')
      .select('motivo')
      .eq('tipo_actividad', tipoActividadId)
      .eq('estado', estadoId);

    if (relError) throw relError;
    if (!relData || relData.length === 0) return res.json([]);

    const idsMotivo = relData.map((r) => r.motivo);

    // 2. Consultar nombres en motivo
    const { data: motivos, error: motError } = await supabase
      .from('motivo')
      .select('id, motivo')
      .in('id', idsMotivo);

    if (motError) throw motError;
    res.json(motivos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener motivos', error: err.message });
  }
};