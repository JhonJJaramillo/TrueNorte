// --- FIX DNS PARA RESOLVER MONGODB ATLAS (SRV) ---
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// --- IMPORTAR RUTAS MODULARES ---
const nlpRoutes = require("./routes/nlpRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/truenorte";
const JWT_SECRET = process.env.JWT_SECRET || "truenorte_secret_key_2026";

const ADMIN_EMAILS = [
  "jhon.jairo.jaramillo@correounivalle.edu.co",
  "admin@truenorte.com"
];

// Conexión a MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado exitosamente a MongoDB");

    const result = await User.updateOne(
      { email: "jhon.jairo.jaramillo@correounivalle.edu.co" },
      { $set: { rol: "Administrador" } }
    );
    if (result.modifiedCount > 0) {
      console.log("👑 Rol actualizado con éxito: jhon.jairo.jaramillo@correounivalle.edu.co es Administrador.");
    }
  })
  .catch((err) => console.error("❌ Error de conexión en MongoDB:", err.message));

// Modelo de Usuario
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, default: "Usuario TrueNorte" },
  rol: { type: String, default: "Líder de Proyectos" },
  provider: { type: String, default: "local" }
});

const User = mongoose.model("User", UserSchema, "usuarios");

// Auxiliar para asignación de roles
const resolverRol = (email) => {
  if (!email) return "Líder de Proyectos";
  const lowerEmail = email.toLowerCase();
  if (ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.includes("admin")) {
    return "Administrador";
  }
  return "Líder de Proyectos";
};

// --- MIDDLEWARES DE SEGURIDAD ---
const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
};

const esAdmin = (req, res, next) => {
  if (req.user && req.user.rol === "Administrador") {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado. Se requiere rol de Administrador." });
  }
};

// --- RUTAS DE AUTENTICACIÓN ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const rolAsignado = resolverRol(email);

    const newUser = new User({
      email,
      password: hashedPassword,
      nombre: nombre || "Líder de Proyectos",
      rol: rolAsignado,
      provider: "local"
    });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado exitosamente con rol: " + rolAsignado });
  } catch (error) {
    res.status(500).json({ error: "Error en el registro de usuario" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Servicio de BD no disponible." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol }
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor durante el login" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { email, nombre } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const rolAsignado = resolverRol(email || "");

      user = new User({
        email: email || "usuario.google@gmail.com",
        nombre: nombre || "Usuario Google",
        password: randomPassword,
        rol: rolAsignado,
        provider: "google"
      });
      await user.save();
    } else {
      const rolCorrecto = resolverRol(user.email);
      if (user.rol !== rolCorrecto && rolCorrecto === "Administrador") {
        user.rol = "Administrador";
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol }
    });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar el inicio con Google." });
  }
});

app.get("/api/auth/me", verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al validar la sesión" });
  }
});

// --- RUTAS DE ADMINISTRADOR ---

app.get("/api/admin/users", verificarToken, esAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.put("/api/admin/users/:id/role", verificarToken, esAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true, select: "-password" }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
});

// --- MONTAR RUTAS MODULARES ---
app.use("/api/nlp", nlpRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => console.log(`🚀 Servidor TrueNorte en ejecución en puerto ${PORT}`));