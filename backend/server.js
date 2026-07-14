require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const User = require('./models/User');
const Task = require('./models/Task');

// 1. IMPORTAR LAS RUTAS DE AUTENTICACIÓN Y TAREAS
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors({
  exposedHeaders: ['user-id'],
  allowedHeaders: ['Content-Type', 'user-id']
}));
app.use(express.json());

// 2. VINCULAR LAS RUTAS AL SISTEMA
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: '¡Servidor activo y respondiendo! 🚀' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos SQLite.');

    await sequelize.sync({ alter: true });
    console.log('✅ Tablas de la base de datos sincronizadas correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();