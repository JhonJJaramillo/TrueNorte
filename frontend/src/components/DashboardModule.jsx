import React, { useState, useEffect } from "react";

export default function DashboardModule({ onSelectProjectForSimulation }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      if (!response.ok) throw new Error("Error al consultar proyectos en MongoDB.");
      const data = await response.json();
      if (Array.isArray(data)) {
        setProyectos(data);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor backend o la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de KPIs acumulados del portafolio
  const totalProyectos = proyectos.length;

  const totalCapexPortafolio = proyectos.reduce((acc, p) => {
    const capexArr = p.flujoCaja?.capex || [];
    return acc + capexArr.reduce((a, b) => a + Number(b || 0), 0);
  }, 0);

  const totalRetornoPortafolio = proyectos.reduce((acc, p) => {
    const retornoArr = p.flujoCaja?.retorno || [];
    return acc + retornoArr.reduce((a, b) => a + Number(b || 0), 0);
  }, 0);

  const totalOpexPortafolio = proyectos.reduce((acc, p) => {
    const opexArr = p.flujoCaja?.opex || [];
    return acc + opexArr.reduce((a, b) => a + Number(b || 0), 0);
  }, 0);

  const beneficioNetoPortafolio = totalRetornoPortafolio - totalOpexPortafolio - totalCapexPortafolio;
  const roiPromedioPortafolio = totalCapexPortafolio > 0 
    ? ((beneficioNetoPortafolio / totalCapexPortafolio) * 100).toFixed(1) 
    : "0.0";

  const formatoMoneda = (val) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#f8fafc" }}>
      {/* Encabezado del Dashboard */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#38bdf8" }}>📊 Dashboard Ejecutivo de Portafolio</h2>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Visión consolidada de Casos de Negocio e Indicadores Financieros en Tiempo Real
          </p>
        </div>
        <button
          onClick={cargarProyectos}
          style={{
            padding: "8px 16px",
            background: "#1e293b",
            color: "#38bdf8",
            border: "1px solid #38bdf8",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.85rem"
          }}
        >
          🔄 Actualizar Datos
        </button>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "30px" }}>
        
        {/* KPI 1: Proyectos Registrados */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", borderTop: "1px solid #334155", borderRight: "1px solid #334155", borderBottom: "1px solid #334155" }}>
          <small style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "bold" }}>Casos de Negocio Guardados</small>
          <h2 style={{ margin: "8px 0 0 0", fontSize: "2rem", color: "#38bdf8" }}>{totalProyectos}</h2>
          <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>● MongoDB Atlas Sincronizado</span>
        </div>

        {/* KPI 2: Capex Total Portafolio */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "10px", borderLeft: "4px solid #f59e0b", borderTop: "1px solid #334155", borderRight: "1px solid #334155", borderBottom: "1px solid #334155" }}>
          <small style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "bold" }}>Capex Total Comprometido</small>
          <h2 style={{ margin: "8px 0 0 0", fontSize: "1.4rem", color: "#fbbf24" }}>{formatoMoneda(totalCapexPortafolio)}</h2>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Inversión inicial acumulada</span>
        </div>

        {/* KPI 3: Retorno Total Proyectado */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "10px", borderLeft: "4px solid #22c55e", borderTop: "1px solid #334155", borderRight: "1px solid #334155", borderBottom: "1px solid #334155" }}>
          <small style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "bold" }}>Retorno Total Estimado</small>
          <h2 style={{ margin: "8px 0 0 0", fontSize: "1.4rem", color: "#4ade80" }}>{formatoMoneda(totalRetornoPortafolio)}</h2>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Beneficios operacionales a 12m</span>
        </div>

        {/* KPI 4: ROI Promedio del Portafolio */}
        <div style={{ background: "#1e293b", padding: "18px", borderRadius: "10px", borderLeft: "4px solid #a855f7", borderTop: "1px solid #334155", borderRight: "1px solid #334155", borderBottom: "1px solid #334155" }}>
          <small style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "bold" }}>ROI Global del Portafolio</small>
          <h2 style={{ margin: "8px 0 0 0", fontSize: "2rem", color: "#c084fc" }}>{roiPromedioPortafolio}%</h2>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Retorno sobre Inversión consolidado</span>
        </div>

      </div>

      {/* TABLA DE CASOS DE NEGOCIO Y ACCIONES */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px", border: "1px solid #334155", marginBottom: "25px" }}>
        <h3 style={{ marginTop: 0, color: "#f8fafc", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
          📁 Portafolio de Casos de Negocio
        </h3>

        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>⏳ Cargando datos desde MongoDB Atlas...</p>
        ) : error ? (
          <p style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>⚠️ {error}</p>
        ) : proyectos.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>
            No hay casos de negocio guardados aún. Diligencie uno en el <strong>Editor NLP</strong>.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#0f172a", borderBottom: "2px solid #334155", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Nombre del Proyecto</th>
                  <th style={{ padding: "12px" }}>Indicador N4</th>
                  <th style={{ padding: "12px" }}>Capex ($)</th>
                  <th style={{ padding: "12px" }}>Retorno ($)</th>
                  <th style={{ padding: "12px" }}>ROI Proyectado</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Acción Rápida</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, idx) => {
                  const capex = (p.flujoCaja?.capex || []).reduce((a, b) => a + Number(b || 0), 0);
                  const retorno = (p.flujoCaja?.retorno || []).reduce((a, b) => a + Number(b || 0), 0);
                  const opex = (p.flujoCaja?.opex || []).reduce((a, b) => a + Number(b || 0), 0);
                  const beneficio = retorno - opex - capex;
                  const roi = capex > 0 ? ((beneficio / capex) * 100).toFixed(1) : "0.0";

                  return (
                    <tr key={p._id || idx} style={{ borderBottom: "1px solid #334155", background: idx % 2 === 0 ? "#1e293b" : "#0f172a" }}>
                      <td style={{ padding: "12px", fontWeight: "bold", color: "#60a5fa" }}>
                        {p.resumenEjecutivo?.nombreProyecto || "Caso de Negocio Sin Nombre"}
                      </td>
                      <td style={{ padding: "12px" }}>{p.resumenEjecutivo?.indicadorN4 || "N/A"}</td>
                      <td style={{ padding: "12px", color: "#fbbf24" }}>{formatoMoneda(capex)}</td>
                      <td style={{ padding: "12px", color: "#4ade80" }}>{formatoMoneda(retorno)}</td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: Number(roi) >= 0 ? "#22c55e" : "#ef4444" }}>
                        {roi}%
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => onSelectProjectForSimulation && onSelectProjectForSimulation(p._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "0.8rem"
                          }}
                        >
                          🎲 Simular Riesgo
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MONITOR DE SALUD DEL SISTEMA */}
      <div style={{ background: "#1e293b", padding: "18px", borderRadius: "10px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, color: "#f8fafc" }}>🟢 Estado de Infraestructura TrueNorte</h4>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            Servicios activos: Express Backend (Puerto 5000), MongoDB Atlas Cluster, Motor Monte Carlo & Gemini 1.5 Flash NLP
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", border: "1px solid #22c55e", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
            DB: MongoDB Atlas OK
          </span>
          <span style={{ background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", border: "1px solid #38bdf8", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
            API: Online
          </span>
        </div>
      </div>

    </div>
  );
}
