const express = require('express');
const router = express.Router();
const { registrarGestion } = require('../controllers/gestionesController');

router.post('/registrar', registrarGestion);

module.exports = router;