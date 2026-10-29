const express = require('express');
const router = express.Router();
const {
  getClientes,
  getTiposGestion,
  getTiposActividad,
  getEstados,
  getMotivos
} = require('../controllers/maestrasController');

router.get('/clientes', getClientes);
router.get('/gestiones', getTiposGestion);
router.get('/actividades', getTiposActividad);
router.get('/estados', getEstados);
router.get('/motivos', getMotivos);

module.exports = router;