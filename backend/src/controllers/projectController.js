const Project = require("../models/Project");
const mongoose = require("mongoose");

// Obtener la lista de proyectos guardados
exports.getProjects = async (req, res) => {
  try {
    // Si MongoDB no está conectado, retornar datos de prueba
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { id: 1, nombre: "Startup Tecnológica", viabilidad: "Alta", color: "badge-alta" },
        { id: 2, nombre: "Expansión Minorista", viabilidad: "Media", color: "badge-media" },
        { id: 3, nombre: "Lanzamiento de Producto", viabilidad: "Baja", color: "badge-baja" }
      ]);
    }

    const projects = await Project.find().sort({ createdAt: -1 });

    if (projects.length === 0) {
      return res.json([
        { id: 1, nombre: "Startup Tecnológica", viabilidad: "Alta", color: "badge-alta" },
        { id: 2, nombre: "Expansión Minorista", viabilidad: "Media", color: "badge-media" },
        { id: 3, nombre: "Lanzamiento de Producto", viabilidad: "Baja", color: "badge-baja" }
      ]);
    }

    return res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error en getProjects:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Crear y guardar un nuevo Caso de Negocio V4
exports.createProject = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Asignar el ID del usuario creador si la solicitud viene autenticada
    if (req.user && req.user._id) {
      payload.creadoPor = req.user._id;
    }

    const project = new Project(payload);
    const proyectoGuardado = await project.save();

    console.log("✅ Caso de Negocio V4 guardado exitosamente en MongoDB Atlas:", proyectoGuardado._id);
    return res.status(201).json(proyectoGuardado);

  } catch (error) {
    console.error("❌ Error al guardar en Mongoose:", error);
    return res.status(400).json({ error: error.message });
  }
};