const Usuario = require('../modelos/Usuario');

// Registrar un nuevo usuario
const registro = async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado.' });
    }

    // Crear el usuario en la base de datos
    await Usuario.create({
      nombre,
      email,
      contrasena
    });

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

    // Buscar al usuario por correo y contraseña exactos
    const usuario = await Usuario.findOne({ where: { email, contrasena } });
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }

    // Devolver los datos básicos del usuario para guardarlos en la sesión del navegador
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