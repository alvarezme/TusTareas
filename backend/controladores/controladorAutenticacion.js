const obtenerConexion = require('../configuraciones/db');

// Registrar un nuevo usuario
const registro = async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    const db = await obtenerConexion();
    // verifico si el usuario esta registrado
    const usuarioExistente = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado.' });
    }
    // creo el usuario en la base de datos
    await db.run(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
      [nombre, email, contrasena]
    );
    res.status(201).json({ mensaje: 'Usuario registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar al usuario.' });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña obligatorios.' });
    }
    const db = await obtenerConexion();
    // busco al usuario por correo y contraseña exactos
    const usuario = await db.get(
      'SELECT id, nombre, email FROM usuarios WHERE email = ? AND contrasena = ?',
      [email, contrasena]
    );

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }
    // se devuelven los datos del usaurio para guardar localmente en la sesion del navegador
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};

module.exports = { registro, login };