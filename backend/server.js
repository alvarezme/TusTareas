const express = require('express');
const cors = require('cors');
const obtenerConexion = require('./configuraciones/db');

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
    const db = await obtenerConexion();

    // se crea esta tabla de usuarios si no existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // creo esta tabla de tareas si no existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        usuarioId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

    console.log('La base esta andando');
    app.listen(PUERTO, () => console.log(`🚀 Servidor en http://localhost:${PUERTO}`));
  } catch (error) {
    console.error('Error al iniciar la base de datos', error);
    process.exit(1);
  }
}

iniciarServidor();