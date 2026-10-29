const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiService = {
  // Cargar tablas maestras relacionales
  getClientes: async () => {
    const res = await fetch(`${API_BASE_URL}/maestras/clientes`);
    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
  },

  getTiposGestion: async (clienteId) => {
    const res = await fetch(`${API_BASE_URL}/maestras/gestiones?clienteId=${encodeURIComponent(clienteId)}`);
    if (!res.ok) throw new Error('Error al obtener tipos de gestión');
    return res.json();
  },

  getTiposActividad: async (tipoGestionId) => {
    const res = await fetch(`${API_BASE_URL}/maestras/actividades?tipoGestionId=${encodeURIComponent(tipoGestionId)}`);
    if (!res.ok) throw new Error('Error al obtener tipos de actividad');
    return res.json();
  },

  getEstados: async (tipoActividadId) => {
    const res = await fetch(`${API_BASE_URL}/maestras/estados?tipoActividadId=${encodeURIComponent(tipoActividadId)}`);
    if (!res.ok) throw new Error('Error al obtener estados');
    return res.json();
  },

  getMotivos: async (tipoActividadId, estadoId) => {
    const res = await fetch(`${API_BASE_URL}/maestras/motivos?tipoActividadId=${encodeURIComponent(tipoActividadId)}&estadoId=${encodeURIComponent(estadoId)}`);
    if (!res.ok) throw new Error('Error al obtener motivos');
    return res.json();
  },

  // Registrar gestión
  registrarGestion: async (payload, token) => {
    const res = await fetch(`${API_BASE_URL}/gestiones/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al guardar el registro');
    return data;
  }
};
