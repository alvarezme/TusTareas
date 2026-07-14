const Tarea = require('../modelos/Tarea');

// Listar tareas del usuario
const obtenerTareas = async (req, res) => {
  try {
    const usuarioId = req.headers['id-usuario'];
    if (!usuarioId) return res.status(401).json({ mensaje: 'No autorizado.' });

    const tareas = await Tarea.findAll({ where: { usuarioId },order: [['createdAt', 'DESC']] }); //agregue el order para que se enlisten desde la mas nueva a la mas antigua
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tareas.' });
  }
};

// Crear una nueva tarea
const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const usuarioId = req.headers['id-usuario'];

    if (!titulo) return res.status(400).json({ mensaje: 'El título es obligatorio.' });

    const nuevaTarea = await Tarea.create({
      titulo,
      descripcion,
      usuarioId
    });
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la tarea.' });
  }
};

// Modificar una tarea existente
const actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, completada } = req.body;
    const usuarioId = req.headers['id-usuario'];

    const tarea = await Tarea.findOne({ where: { id, usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada.' });

    if (titulo !== undefined) tarea.titulo = titulo;
    if (descripcion !== undefined) tarea.descripcion = descripcion;
    if (completada !== undefined) tarea.completada = completada;

    await tarea.save();
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar.' });
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['id-usuario'];

    const tarea = await Tarea.findOne({ where: { id, usuarioId } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada.' });

    await tarea.destroy();
    res.json({ mensaje: 'Tarea eliminada.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar.' });
  }
};

module.exports = { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea };