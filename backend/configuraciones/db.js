const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let baseDeDatos = null;

// Función para obtener la conexión única a la base de datos (Patrón Singleton)
async function obtenerConexion() {
  if (!baseDeDatos) {
    baseDeDatos = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });

    // Activar claves foráneas en SQLite (para relaciones entre usuarios y tareas)
    await baseDeDatos.run('PRAGMA foreign_keys = ON');
  }
  return baseDeDatos;
}

module.exports = obtenerConexion;