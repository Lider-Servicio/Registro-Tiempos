const express = require('express');
const router = express.Router();
const gestionesController = require('../controllers/gestionesController');

// Verificar en consola que las funciones existan al cargar el módulo
console.log('--- Mapeando funciones de gestionesController ---');
console.log('getClientes:', typeof gestionesController.getClientes);
console.log('getTiposGestion:', typeof gestionesController.getTiposGestion);
console.log('getTiposActividad:', typeof gestionesController.getTiposActividad);
console.log('getEstados:', typeof gestionesController.getEstados);
console.log('getMotivos:', typeof gestionesController.getMotivos);
console.log('buscarTicket:', typeof gestionesController.buscarTicket);
console.log('registrarGestion:', typeof gestionesController.registrarGestion);
console.log('-------------------------------------------------');

// Rutas expuestas
router.get('/clientes', gestionesController.getClientes);
router.get('/tipos-gestion', gestionesController.getTiposGestion);
router.get('/tipos-actividad', gestionesController.getTiposActividad);
router.get('/estados', gestionesController.getEstados);
router.get('/motivos', gestionesController.getMotivos);
router.get('/buscar-ticket', gestionesController.buscarTicket);
router.post('/registrar', gestionesController.registrarGestion);

module.exports = router;