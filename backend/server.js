require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./configuraciones/db');

const Usuario = require('./modelos/Usuario');
const Tarea = require('./modelos/Tarea');

// Relaciones explícitas antes de sincronizar para evitar errores al sincronizar la base de datos
Usuario.hasMany(Tarea, { foreignKey: 'usuarioId' });
Tarea.belongsTo(Usuario, { foreignKey: 'usuarioId' });

const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasTareas = require('./rutas/rutasTareas');

const app = express();

app.use(cors({
  exposedHeaders: ['id-usuario'],
  allowedHeaders: ['Content-Type', 'id-usuario']
}));
app.use(express.json());

app.use('/api/autenticacion', rutasAutenticacion);
app.use('/api/tareas', rutasTareas);

const PUERTO = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    // Usamos sync normal sin alter para proteger los datos de SQLite
    await sequelize.sync();
    console.log('La base esta andando');
    app.listen(PUERTO, () => console.log(`🚀 Servidor en http://localhost:${PUERTO}`));
  } catch (error) {
    console.error('Error al iniciar la base de datos', error);
    process.exit(1);
  }
}

iniciarServidor();