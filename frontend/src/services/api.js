const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiService = {
  // Clientes
  getClientes: async () => {
    const res = await fetch(`${API_BASE_URL}/gestiones/clientes`);
    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
  },

  // Tipos de Gestión según Cliente
  getTiposGestion: async (clienteId) => {
    const res = await fetch(`${API_BASE_URL}/gestiones/tipos-gestion?clienteId=${encodeURIComponent(clienteId)}`);
    if (!res.ok) throw new Error('Error al obtener tipos de gestión');
    return res.json();
  },

  // Tipos de Actividad según Tipo de Gestión
  getTiposActividad: async (tipoGestionId) => {
    const res = await fetch(`${API_BASE_URL}/gestiones/tipos-actividad?tipoGestionId=${encodeURIComponent(tipoGestionId)}`);
    if (!res.ok) throw new Error('Error al obtener tipos de actividad');
    return res.json();
  },

  // Estados según Tipo de Actividad
  getEstados: async (tipoActividadId) => {
    const res = await fetch(`${API_BASE_URL}/gestiones/estados?tipoActividadId=${encodeURIComponent(tipoActividadId)}`);
    if (!res.ok) throw new Error('Error al obtener estados');
    return res.json();
  },

  // Motivos filtrados por la tabla puente (Actividad + Estado)
  getMotivos: async (tipoActividadId, estadoId) => {
    let url = `${API_BASE_URL}/gestiones/motivos?tipoActividadId=${encodeURIComponent(tipoActividadId)}`;
    if (estadoId) {
      url += `&estadoId=${encodeURIComponent(estadoId)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener motivos');
    return res.json();
  },

  // Búsqueda de Ticket por Nro TK y Cliente
  buscarTicket: async (nroTk, clienteId) => {
    const res = await fetch(
      `${API_BASE_URL}/gestiones/buscar-ticket?nroTk=${encodeURIComponent(nroTk)}&clienteId=${encodeURIComponent(clienteId)}`
    );
    if (!res.ok) throw new Error('Error al buscar ticket');
    return res.json();
  },

  // Registro de Gestión
  registrarGestion: async (payload, token) => {
    const res = await fetch(`${API_BASE_URL}/gestiones/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al registrar gestión');
    }
    return res.json();
  }
};