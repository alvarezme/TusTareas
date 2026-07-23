const express = require('express');
const router = express.Router();

// Importamos el controlador
const { registro, login } = require('../controladores/controladorAutenticacion');

// Rutas  para el frontend
router.post('/registro', registro);
router.post('/login', login);

module.exports = router;