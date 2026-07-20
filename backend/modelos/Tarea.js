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
  estado: {
    type: DataTypes.ENUM('pendiente', 'en curso', 'en espera', 'finalizada'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Tarea;