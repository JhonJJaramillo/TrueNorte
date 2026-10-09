import React, { useState, useEffect } from "react";

export default function MonteCarloModule() {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  // Parámetros de volatilidad e incertidumbre
  const [variacionCapex, setVariacionCapex] = useState(15);
  const [variacionOpex, setVariacionOpex] = useState(10);
  const [variacionRetorno, setVariacionRetorno] = useState(20);
  const [iterations, setIterations] = useState(5000);

  // Valores manuales si no se selecciona un proyecto
  const [capexManual, setCapexManual] = useState(100000000);
  const [opexManual, setOpexManual] = useState(20000000);
  const [retornoManual, setRetornoManual] = useState(180000000);

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProyectos(data);
      })
      .catch((err) => console.error("Error cargando proyectos:", err));
  }, []);

  const ejecutarSimulacion = async () => {
    setLoading(true);
    try {
      const bodyPayload = {
        projectId: selectedProjectId || undefined,
        capexBaseInput: capexManual,
        opexBaseInput: opexManual,
        retornoBaseInput: retornoManual,
        variacionCapex,
        variacionOpex,
        variacionRetorno,
        iterations
      };

      const response = await fetch("http://localhost:5000/api/simulation/monte-carlo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();
      if (response.ok) {
        setResultado(data);
      } else {
        alert(data.error || "Error al ejecutar la simulación.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor de simulación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#0f172a", color: "#f8fafc", borderRadius: "12px", marginTop: "25px", fontFamily: "sans-serif" }}>
      <h2 style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#60a5fa", marginTop: 0 }}>
        🎲 Módulo de Simulación de Riesgo Monte Carlo
      </h2>

      {/* Panel de Configuración */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Selección de Proyecto o Ingreso Manual */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px", color: "#93c5fd" }}>
            1. Seleccionar Caso de Negocio (MongoDB Atlas):
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0f172a", color: "#fff", border: "1px solid #475569" }}
          >
            <option value="">-- Usar Valores Manuales de Prueba --</option>
            {proyectos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.resumenEjecutivo?.nombreProyecto || `Proyecto: ${p._id}`}
              </option>
            ))}
          </select>

          {!selectedProjectId && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Línea Base Personalizada ($):</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="number" placeholder="Capex Base" value={capexManual} onChange={(e) => setCapexManual(e.target.value)} style={{ width: "33%", padding: "8px", borderRadius: "4px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }} />
                <input type="number" placeholder="Opex Base" value={opexManual} onChange={(e) => setOpexManual(e.target.value)} style={{ width: "33%", padding: "8px", borderRadius: "4px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }} />
                <input type="number" placeholder="Retorno Base" value={retornoManual} onChange={(e) => setRetornoManual(e.target.value)} style={{ width: "33%", padding: "8px", borderRadius: "4px", border: "1px solid #475569", background: "#0f172a", color: "#fff" }} />
              </div>
            </div>
          )}
        </div>

        {/* Sliders de Volatilidad */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px", color: "#93c5fd" }}>
            2. Ajustar Incertidumbre y Volatilidad (±%):
          </label>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span>Volatilidad Capex:</span>
              <strong style={{ color: "#fbbf24" }}>±{variacionCapex}%</strong>
            </div>
            <input type="range" min="1" max="50" value={variacionCapex} onChange={(e) => setVariacionCapex(Number(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span>Volatilidad Opex:</span>
              <strong style={{ color: "#fbbf24" }}>±{variacionOpex}%</strong>
            </div>
            <input type="range" min="1" max="50" value={variacionOpex} onChange={(e) => setVariacionOpex(Number(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span>Volatilidad Retornos:</span>
              <strong style={{ color: "#fbbf24" }}>±{variacionRetorno}%</strong>
            </div>
            <input type="range" min="1" max="50" value={variacionRetorno} onChange={(e) => setVariacionRetorno(Number(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "0.9rem" }}>Iteraciones:</span>
            <select value={iterations} onChange={(e) => setIterations(Number(e.target.value))} style={{ padding: "6px 12px", borderRadius: "4px", background: "#0f172a", color: "#fff", border: "1px solid #475569" }}>
              <option value={1000}>1,000 Simulaciones</option>
              <option value={5000}>5,000 Simulaciones</option>
              <option value={10000}>10,000 Simulaciones</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={ejecutarSimulacion}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          backgroundColor: loading ? "#475569" : "#2563eb",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.05rem",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s"
        }}
      >
        {loading ? "⏳ Corriendo algoritmo de simulación estocástica..." : "🚀 Ejecutar Simulación Monte Carlo"}
      </button>

      {/* Resultados de la Simulación */}
      {resultado && (
        <div style={{ marginTop: "25px", background: "#1e293b", padding: "20px", borderRadius: "10px", border: "1px solid #334155" }}>
          <h3 style={{ marginTop: 0, color: "#f8fafc", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
            📊 Análisis Probabilístico: <span style={{ color: "#60a5fa" }}>{resultado.projectName}</span>
          </h3>

          {/* Tarjetas de Métricas Estadísticas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", margin: "20px 0" }}>
            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}>
              <small style={{ color: "#94a3b8" }}>Probabilidad de Éxito</small>
              <h2 style={{ color: "#22c55e", margin: "6px 0 0 0" }}>{resultado.metricas.probabilidadExito}%</h2>
            </div>
            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <small style={{ color: "#94a3b8" }}>Riesgo de Pérdida (VaR)</small>
              <h2 style={{ color: "#ef4444", margin: "6px 0 0 0" }}>{resultado.metricas.probabilidadPerdida}%</h2>
            </div>
            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
              <small style={{ color: "#94a3b8" }}>ROI Esperado (Mediana P50)</small>
              <h2 style={{ color: "#60a5fa", margin: "6px 0 0 0" }}>{resultado.metricas.p50}%</h2>
            </div>
            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #eab308" }}>
              <small style={{ color: "#94a3b8" }}>Rango P10 (Pesimista) / P90 (Optimista)</small>
              <h4 style={{ color: "#fde047", margin: "8px 0 0 0" }}>{resultado.metricas.p10}% a {resultado.metricas.p90}%</h4>
            </div>
          </div>

          {/* Histograma / Campana de Gauss */}
          <h4 style={{ textAlign: "center", marginTop: "25px", marginBottom: "15px", color: "#cbd5e1" }}>
            Distribución de Frecuencia del ROI (Campana de Gauss) - {resultado.iterations.toLocaleString()} iteraciones
          </h4>
          
          <div style={{ height: "230px", display: "flex", alignItems: "flex-end", gap: "6px", background: "#0f172a", padding: "20px 15px 10px 15px", borderRadius: "8px", border: "1px solid #334155" }}>
            {resultado.histogram.map((bin, idx) => {
              const alturaPct = (bin.frecuencia / resultado.maxFrecuencia) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "4px" }}>{bin.frecuencia}</span>
                  <div
                    title={`Rango ROI: ${bin.rangoLabel}\nFrecuencia: ${bin.frecuencia} escenarios`}
                    style={{
                      width: "100%",
                      height: `${alturaPct}%`,
                      backgroundColor: bin.esGanancia ? "#22c55e" : "#ef4444",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.4s ease"
                    }}
                  />
                  <span style={{ fontSize: "0.65rem", color: "#cbd5e1", marginTop: "6px" }}>{bin.rangoMid}%</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "25px", marginTop: "12px", fontSize: "0.85rem" }}>
            <span style={{ color: "#ef4444", fontWeight: "bold" }}>🔴 Zona de Pérdida (ROI &lt; 0%)</span>
            <span style={{ color: "#22c55e", fontWeight: "bold" }}>🟢 Zona de Retorno Positivo (ROI ≥ 0%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
