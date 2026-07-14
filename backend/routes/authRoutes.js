const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

/* Como son peticiones para enviar y procesar información delicada (credenciales),utilizamos estrictamente el método HTTP POST.*/
router.post('/register', register);
router.post('/login', login);

module.exports = router;