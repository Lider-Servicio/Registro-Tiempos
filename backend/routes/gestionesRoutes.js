const express = require('express');
const router = express.Router();
const gestionesController = require('../controllers/gestionesController');

// GET /api/gestiones/clientes
router.get('/clientes', gestionesController.getClientes);

// GET /api/gestiones/tipos-gestion
router.get('/tipos-gestion', gestionesController.getTiposGestion);

// GET /api/gestiones/tipos-actividad
router.get('/tipos-actividad', gestionesController.getTiposActividad);

// GET /api/gestiones/estados
router.get('/estados', gestionesController.getEstados);

// GET /api/gestiones/motivos
router.get('/motivos', gestionesController.getMotivos);

// GET /api/gestiones/buscar-ticket
router.get('/buscar-ticket', gestionesController.buscarTicket);

// POST /api/gestiones/registrar
router.post('/registrar', gestionesController.registrarGestion);

module.exports = router;