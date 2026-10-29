const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const maestrasRoutes = require('./routes/maestrasRoutes');
const gestionesRoutes = require('./routes/gestionesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // URL del frontend React
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de comprobación de salud de la API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor Backend activo y respondiendo.' });
});

// Registrar módulos de rutas
app.use('/api/maestras', maestrasRoutes);
app.use('/api/gestiones', gestionesRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el servidor' });
});

// Manejador de errores globales del servidor
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(` Servidor Backend FLAG Soluciones `);
  console.log(` Escuchando en el puerto: ${PORT}  `);
  console.log(`=================================`);
});