const supabase = require('../config/supabaseClient');

// POST /api/gestiones/registrar
exports.registrarGestion = async (req, res) => {
  const {
    userId,
    cliente,
    tipoGestion,
    tipoActividad,
    nroTk,
    tipoCaso,
    modulo,
    causaRaiz,
    descripcion,
    estado,
    motivo,
    detalle,
    nuevoResponsable,
    tiempoInvertido,
    observaciones
  } = req.body;

  // Validación básica del lado del servidor
  if (!userId || !cliente || !tipoGestion || !tipoActividad || !descripcion || !tiempoInvertido) {
    return res.status(400).json({ message: 'Todos los campos obligatorios (*) deben ser completados.' });
  }

  if (parseFloat(tiempoInvertido) <= 0) {
    return res.status(400).json({ message: 'El tiempo invertido debe ser mayor a 0 minutos.' });
  }

  try {
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
      observaciones: observaciones || null
    };

    const { data, error } = await supabase
      .from('registros_gestion')
      .insert([payload])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Gestión registrada exitosamente',
      registro: data[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar la gestión', error: err.message });
  }
};