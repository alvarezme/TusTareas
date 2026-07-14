const express = require('express');
const router = express.Router();

// Importamos el controlador de tareas
const { 
  obtenerTareas, 
  crearTarea, 
  actualizarTarea, 
  eliminarTarea 
} = require('../controladores/controladorTareas');

// Rutas expuestas para la gestión de tareas
router.get('/', obtenerTareas);
router.post('/', crearTarea);
router.put('/:id', actualizarTarea);
router.delete('/:id', eliminarTarea);

module.exports = router;