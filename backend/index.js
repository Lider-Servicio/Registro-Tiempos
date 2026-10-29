const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'https://tu-app-frontend.vercel.app' // 👈 Sustituye con tu URL real de Vercel
];

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

// Rutas de gestiones
const gestionesRoutes = require('./routes/gestionesRoutes');
app.use('/api/gestiones', gestionesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});