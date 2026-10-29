// Habilitar bypass SSL solo fuera de producción
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Configurar CORS dinámico para Vercel y entorno local
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Acceso no permitido por política CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Importar rutas (usando el archivo exacto gestionesRouter.js)
const maestrasRoutes = require('./routes/maestrasRoutes');
const gestionesRoutes = require('./routes/gestionesRoutes');

// 4. Ruta de comprobación de salud de la API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor Backend activo y respondiendo.' });
});

// 5. Registrar módulos de rutas
app.use('/api/maestras', maestrasRoutes);
app.use('/api/gestiones', gestionesRoutes);

// 6. Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el servidor' });
});

// 7. Manejador de errores globales del servidor
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 8. Iniciar servidor
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(` Servidor Backend FLAG Soluciones `);
  console.log(` Escuchando en el puerto: ${PORT}  `);
  console.log(`=================================`);
});