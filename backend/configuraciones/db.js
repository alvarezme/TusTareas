const { Sequelize } = require('sequelize');

// Creación de la instancia conectada al archivo local de SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Evita textos innecesarios en la terminal al arrancar
});

module.exports = sequelize;