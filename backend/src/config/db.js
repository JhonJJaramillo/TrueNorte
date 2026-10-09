const mongoose = require("mongoose");

// Desactivar buffering para que no congele las peticiones sin DB
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 1500
    });
    console.log("🍃 Conexión exitosa a MongoDB");
  } catch (error) {
    console.log("⚠️ MongoDB local no activo. Servidor operando en modo simulado.");
  }
};

module.exports = connectDB;
