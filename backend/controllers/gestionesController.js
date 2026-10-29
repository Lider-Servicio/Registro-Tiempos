const supabase = require('../config/supabaseClient'); // Ajusta la ruta a tu cliente Supabase

// GET /api/gestiones/buscar-ticket?nroTk=TK-1234
exports.buscarTicket = async (req, res) => {
  const { nroTk } = req.query;

  if (!nroTk || !nroTk.trim()) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabase
      .from('registros_gestion')
      .select('canal_ingreso, modulo, causa_raiz, descripcion')
      .eq('nro_tk', nroTk.trim())
      .limit(1);

    if (error) {
      console.error('❌ Error al buscar ticket:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('❌ Error grave en buscarTicket:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/gestiones/registrar
exports.registrarGestion = async (req, res) => {
  console.log('👉 Payload recibido en registrarGestion:', req.body);

  const {
    userId,
    gestionador, // 👈 Recibimos el nombre o email del usuario (ej. 'juan.perez' o req.user.email)
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
    detalle,
    nuevoResponsable,
    tiempoInvertido,
    observaciones
  } = req.body;

  const clienteFinal = clienteId || clienteNombre;

  // Extraer un nombre de gestionador si no viene en req.body
  const nombreGestionador = gestionador || (req.user && req.user.email ? req.user.email.split('@')[0] : 'Usuario Sistema');

  try {
    const registroPayload = {
      gestionador: nombreGestionador,          // 👈 CAMPO OBLIGATORIO: Se envía explícitamente
      cliente: String(clienteFinal),
      tipo_gestion: String(tipoGestionId),
      tipo_actividad: String(tipoActividadId),
      canal_ingreso: String(canalIngreso),
      descripcion: String(descripcion),
      tiempo_invertido: Number(tiempoInvertido),
      
      // Campos opcionales / condicionales
      nro_tk: nroTk || null,
      tipo_caso: tipoCaso || null,
      modulo: modulo || null,
      causa_raiz: causaRaiz || null,
      estado: estadoId ? String(estadoId) : null,
      motivo: motivoId ? String(motivoId) : null,
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