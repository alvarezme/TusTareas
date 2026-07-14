const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título de la tarea es obligatorio.' },
      len: { args: [1, 100], msg: 'El título no puede superar los 100 caracteres.' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Sequelize crea automáticamente la clave foránea 'UserId' en la tabla de Tareas.

User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = Task;