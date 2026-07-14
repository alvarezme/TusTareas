const Task = require('../models/Task');

// 1. OBTENER TAREAS
const getTasks = async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Leemos el ID directo de la cabecera de la petición
    // ESTA ES LA LÍNEA DE VERIFICACIÓN:
    console.log("ID de usuario recibido en el backend:", userId);
    if (!userId) {
      return res.status(401).json({ message: 'No se proporcionó ID de usuario.' });
    }

    const tasks = await Task.findAll({ where: { userId: userId } });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las tareas.' });
  }
};

// 2. CREAR TAREA
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'No se proporcionó ID de usuario.' });
    }
    if (!title) {
      return res.status(400).json({ message: 'El título es obligatorio.' });
    }

    const newTask = await Task.create({
      title,
      description,
      userId: userId
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la tarea.' });
  }
};

// 3. ACTUALIZAR TAREA
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.headers['user-id'];

    const task = await Task.findOne({ where: { id, userId: userId } });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la tarea.' });
  }
};

// 4. ELIMINAR TAREA
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    const task = await Task.findOne({ where: { id, userId: userId } });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    await task.destroy();
    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la tarea.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };