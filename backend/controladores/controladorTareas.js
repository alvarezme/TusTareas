const obtenerConexion = require('../configuraciones/db');

// cargo la lista de tareas
const obtenerTareas = async (req, res) => {
  try {
    const usuarioId = req.headers['id-usuario'];
    if (!usuarioId) return res.status(401).json({ mensaje: 'No autorizado.' });
    const db = await obtenerConexion();
    const tareas = await db.all(
      'SELECT * FROM tareas WHERE usuarioId = ? ORDER BY createdAt DESC',
      [usuarioId]
    );
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tareas.' });
  }
};

// creo una nueva tarea
const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const usuarioId = req.headers['id-usuario'];
    if (!titulo) return res.status(400).json({ mensaje: 'El título es obligatorio.' });

    const db = await obtenerConexion();
    const resultado = await db.run(
      'INSERT INTO tareas (titulo, descripcion, usuarioId) VALUES (?, ?, ?)',
      [titulo, descripcion || '', usuarioId]
    );
    // cargo la tarea creada para actualizar el objeto
    const nuevaTarea = await db.get(
      'SELECT * FROM tareas WHERE id = ?',
      [resultado.lastID]
    );

    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la tarea.' });
  }
};

// modificar tareas
const actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado } = req.body;
    const usuarioId = req.headers['id-usuario'];
    const db = await obtenerConexion();
    const tarea = await db.get(
      'SELECT * FROM tareas WHERE id = ? AND usuarioId = ?',
      [id, usuarioId]
    );
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada.' });

    const nuevoTitulo = titulo !== undefined ? titulo : tarea.titulo;
    const nuevaDescripcion = descripcion !== undefined ? descripcion : tarea.descripcion;
    let nuevoEstado = tarea.estado;
    // Para no guardar cualquier estado se verifica que sea uno de los correctos
    if (estado !== undefined) {
      const estadosPermitidos = ['pendiente', 'en curso', 'en espera', 'finalizada'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ mensaje: 'Estado no válido.' });
      }
      nuevoEstado = estado;
    }
    await db.run(
      'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ? WHERE id = ? AND usuarioId = ?',
      [nuevoTitulo, nuevaDescripcion, nuevoEstado, id, usuarioId]
    );
    const tareaActualizada = await db.get(
      'SELECT * FROM tareas WHERE id = ?',
      [id]
    );

    res.json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar.' });
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['id-usuario'];
    const db = await obtenerConexion();
    const tarea = await db.get(
      'SELECT * FROM tareas WHERE id = ? AND usuarioId = ?',
      [id, usuarioId]
    );
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada.' });
    await db.run('DELETE FROM tareas WHERE id = ? AND usuarioId = ?', [id, usuarioId]);
    res.json({ mensaje: 'Tarea eliminada.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar.' });
  }
};

module.exports = { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea };