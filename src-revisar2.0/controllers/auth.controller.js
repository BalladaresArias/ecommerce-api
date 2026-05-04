const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });

    if (name.length > 255 || email.length > 255 || password.length > 500)
      return res.status(400).json({ error: 'Campos demasiado largos' });

    const existingUser = await userModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ error: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'cliente';

    const userId = await userModel.createUser(name, email, hashedPassword, assignedRole);
    const newUser = await userModel.findById(userId);

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', detail: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

    const user = await userModel.findByEmail(email);
    if (!user)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', detail: err.message });
  }
};

const profile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil', detail: err.message });
  }
};

module.exports = { register, login, profile };