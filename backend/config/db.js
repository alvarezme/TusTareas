const { Sequelize } = require('sequelize');
const path = require('path');

// Uso SQLite para Almacenar la base de datos en un archivo local
// 'sqlite' no requiere servidor web; Sequelize leerá y escribirá directamente en este archivo físico.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false // Evita consultas SQL en cada petición
});

module.exports = sequelize;