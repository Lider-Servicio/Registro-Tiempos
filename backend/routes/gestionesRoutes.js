const express = require('express');
const router = express.Router();
const tiemposController = require('../controllers/tiemposController');

// GET /api/gestiones/clientes
router.get('/clientes', tiemposController.getClientes);

// GET /api/gestiones/tipos-gestion
router.get('/tipos-gestion', tiemposController.getTiposGestion);

// GET /api/gestiones/tipos-actividad
router.get('/tipos-actividad', tiemposController.getTiposActividad);

// GET /api/gestiones/estados
router.get('/estados', tiemposController.getEstados);

// GET /api/gestiones/motivos
router.get('/motivos', tiemposController.getMotivos);

// GET /api/gestiones/buscar-ticket
router.get('/buscar-ticket', tiemposController.buscarTicket);

// POST /api/gestiones/registrar
router.post('/registrar', tiemposController.registrarGestion);

module.exports = router;