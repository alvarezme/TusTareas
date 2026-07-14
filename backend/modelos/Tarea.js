const { DataTypes } = require('sequelize');
const sequelize = require('../configuraciones/db');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  completada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Campo explícito para evitar problemas de sincronización
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Tarea;