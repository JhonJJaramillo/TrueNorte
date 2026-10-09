const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    problema: mongoose.Schema.Types.Mixed,
    resumenEjecutivo: mongoose.Schema.Types.Mixed,
    celula: mongoose.Schema.Types.Mixed,
    planTrabajo: mongoose.Schema.Types.Mixed,
    flujoCaja: mongoose.Schema.Types.Mixed,
    calculosFinancieros: mongoose.Schema.Types.Mixed,
    indiceSostenibilidad: String,
    aprobaciones: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.model("Project", ProjectSchema);