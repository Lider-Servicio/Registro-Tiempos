const express = require('express');
const router = express.Router();
const gestionesController = require('../controllers/gestionesController');

// GET /api/gestiones/buscar-ticket?nroTk=TK-1234
router.get('/buscar-ticket', gestionesController.buscarTicket);

// POST /api/gestiones/registrar
router.post('/registrar', gestionesController.registrarGestion);

module.exports = router;