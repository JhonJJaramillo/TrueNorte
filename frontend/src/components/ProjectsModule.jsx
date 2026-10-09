import React, { useState, useEffect } from "react";

export default function ProjectsModule({ onSelectProjectForSimulation }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroN4, setFiltroN4] = useState("TODOS");
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      if (!response.ok) throw new Error("Error al consultar la base de datos.");
      const data = await response.json();
      if (Array.isArray(data)) setProyectos(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor backend o MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarProyecto = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el Caso de Negocio "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("truenorte_token");
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert("✅ Proyecto eliminado exitosamente.");
        cargarProyectos();
        if (proyectoSeleccionado && proyectoSeleccionado._id === id) {
          setProyectoSeleccionado(null);
        }
      } else {
        const errData = await response.json();
        alert(`Error al eliminar: ${errData.error || "No autorizado"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar el proyecto.");
    }
  };

  const formatoMoneda = (val) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val || 0);

  const listaN4Unicos = ["TODOS", ...Array.from(new Set(proyectos.map((p) => p.resumenEjecutivo?.indicadorN4).filter(Boolean)))];

  const proyectosFiltrados = proyectos.filter((p) => {
    const nombre = p.resumenEjecutivo?.nombreProyecto || "";
    const sponsor = p.celula?.sponsor || "";
    const lider = p.celula?.lider || "";
    const n4 = p.resumenEjecutivo?.indicadorN4 || "";

    const coincideBusqueda = 
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      sponsor.toLowerCase().includes(busqueda.toLowerCase()) ||
      lider.toLowerCase().includes(busqueda.toLowerCase());

    const coincideN4 = filtroN4 === "TODOS" || n4 === filtroN4;

    return coincideBusqueda && coincideN4;
  });

  // Auxiliares para cálculo de Flujo de Caja dentro del Modal
  const obtenerFlujoCalculado = (p) => {
    const opex = p.flujoCaja?.opex || Array(12).fill(0);
    const retorno = p.flujoCaja?.retorno || Array(12).fill(0);
    const capex = p.flujoCaja?.capex || Array(12).fill(0);

    let flujoOpNeto = [];
    let beneficioAcum = [];
    let acum = 0;

    for (let i = 0; i < 12; i++) {
      const opNeto = Number(retorno[i] || 0) - Number(opex[i] || 0);
      flujoOpNeto.push(opNeto);
      acum += opNeto - Number(capex[i] || 0);
      beneficioAcum.push(acum);
    }

    return { opex, retorno, capex, flujoOpNeto, beneficioAcum };
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#f8fafc" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#38bdf8" }}>📁 Gestión de Portafolio de Proyectos</h2>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Consulte, audite y gestione los Casos de Negocio registrados en la organización
          </p>
        </div>
        <button
          onClick={cargarProyectos}
          style={{ padding: "8px 16px", background: "#1e293b", color: "#38bdf8", border: "1px solid #38bdf8", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          🔄 Recargar Proyectos
        </button>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", background: "#1e293b", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, sponsor o líder..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 2, padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid #475569", color: "#fff" }}
        />
        <select
          value={filtroN4}
          onChange={(e) => setFiltroN4(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid #475569", color: "#fff" }}
        >
          {listaN4Unicos.map((item, idx) => (
            <option key={idx} value={item}>
              {item === "TODOS" ? "Todos los Indicadores N4" : `Indicador: ${item}`}
            </option>
          ))}
        </select>
      </div>

      {/* Tarjetas de Proyectos */}
      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "30px" }}>⏳ Cargando portafolio de proyectos...</p>
      ) : error ? (
        <p style={{ color: "#ef4444", textAlign: "center", padding: "30px" }}>⚠️ {error}</p>
      ) : proyectosFiltrados.length === 0 ? (
        <div style={{ background: "#1e293b", padding: "30px", borderRadius: "8px", textAlign: "center", color: "#94a3b8", border: "1px solid #334155" }}>
          No se encontraron Casos de Negocio con los criterios seleccionados.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {proyectosFiltrados.map((p) => {
            const nombre = p.resumenEjecutivo?.nombreProyecto || "Caso de Negocio Sin Nombre";
            const capex = (p.flujoCaja?.capex || []).reduce((a, b) => a + Number(b || 0), 0);
            const retorno = (p.flujoCaja?.retorno || []).reduce((a, b) => a + Number(b || 0), 0);
            const opex = (p.flujoCaja?.opex || []).reduce((a, b) => a + Number(b || 0), 0);
            const beneficio = retorno - opex - capex;
            const roi = capex > 0 ? ((beneficio / capex) * 100).toFixed(1) : "0.0";

            return (
              <div key={p._id} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid #334155", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                      {p.resumenEjecutivo?.indicadorN4 || "General"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {p.resumenEjecutivo?.fecha || "Fecha N/A"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 10px 0", color: "#f8fafc", fontSize: "1.1rem", lineHeight: "1.3" }}>
                    {nombre}
                  </h3>

                  <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                    <strong>Sponsor:</strong> {p.celula?.sponsor || "No asignado"} | <strong>Líder:</strong> {p.celula?.lider || "No asignado"}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#0f172a", padding: "10px", borderRadius: "6px", marginBottom: "15px" }}>
                    <div>
                      <small style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem" }}>Capex Requerido</small>
                      <strong style={{ color: "#fbbf24", fontSize: "0.9rem" }}>{formatoMoneda(capex)}</strong>
                    </div>
                    <div>
                      <small style={{ color: "#94a3b8", display: "block", fontSize: "0.7rem" }}>ROI Estimado</small>
                      <strong style={{ color: Number(roi) >= 0 ? "#22c55e" : "#ef4444", fontSize: "0.9rem" }}>{roi}%</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #334155", paddingTop: "12px", marginTop: "10px" }}>
                  <button
                    onClick={() => setProyectoSeleccionado(p)}
                    style={{ flex: 1, padding: "8px", background: "#334155", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                  >
                    📄 Ver Ficha 360°
                  </button>

                  <button
                    onClick={() => onSelectProjectForSimulation && onSelectProjectForSimulation(p._id)}
                    style={{ flex: 1, padding: "8px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                  >
                    🎲 Simular
                  </button>

                  <button
                    onClick={() => eliminarProyecto(p._id, nombre)}
                    style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                    title="Eliminar Caso de Negocio"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FICHA TÉCNICA 360° COMPLETA Y REPLICADA IGUAL AL CASO DE NEGOCIO V4 ORIGINAL */}
      {proyectoSeleccionado && (() => {
        const flujo = obtenerFlujoCalculado(proyectoSeleccionado);
        const planTrabajo = proyectoSeleccionado.planTrabajo || [
          { nombre: "Identificación de Necesidades", meses: Array(12).fill(false) },
          { nombre: "Análisis", meses: Array(12).fill(false) },
          { nombre: "Ejecución", meses: Array(12).fill(false) },
          { nombre: "Despliegue", meses: Array(12).fill(false) }
        ];

        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#0f172a", width: "100%", maxWidth: "1050px", maxHeight: "92vh", overflowY: "auto", borderRadius: "12px", padding: "25px", border: "1px solid #334155", color: "#f8fafc" }}>
              
              {/* Header del Modal */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #15803d", paddingBottom: "12px", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "1.4rem" }}>
                    📋 Caso de Negocio V4: {proyectoSeleccionado.resumenEjecutivo?.nombreProyecto || "Sin Nombre"}
                  </h2>
                  <small style={{ color: "#94a3b8" }}>Fecha de Registro: {proyectoSeleccionado.resumenEjecutivo?.fecha || "N/A"}</small>
                </div>
                <button onClick={() => setProyectoSeleccionado(null)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "1.8rem", cursor: "pointer", fontWeight: "bold" }}>✖</button>
              </div>

              {/* 1. ENTENDIMIENTO DEL PROBLEMA */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ backgroundColor: "#15803d", color: "#fff", padding: "0.75rem", textAlign: "center", fontWeight: "bold", fontSize: "1.05rem" }}>
                  Entendimiento del Problema
                </div>
                
                <div style={{ padding: "15px", background: "#1e293b", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px" }}>
                    <div style={{ padding: "10px", fontWeight: "bold", color: "#38bdf8", borderRight: "1px solid #334155" }}>Tipo de problema</div>
                    <div style={{ padding: "10px", fontWeight: "bold" }}>{proyectoSeleccionado.problema?.tipoProblema || "N/A"}</div>
                  </div>

                  <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ background: "#166534", color: "#fff", padding: "6px 12px", fontWeight: "bold", fontSize: "0.85rem" }}>Contexto (Conexión con la estrategia)</div>
                    <div style={{ padding: "12px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                      {proyectoSeleccionado.problema?.contexto || proyectoSeleccionado.resumenEjecutivo?.contexto || "No registrado."}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ background: "#166534", color: "#fff", padding: "6px 12px", fontWeight: "bold", fontSize: "0.85rem" }}>Estado Actual</div>
                    <div style={{ padding: "12px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                      {proyectoSeleccionado.problema?.estadoActual || proyectoSeleccionado.resumenEjecutivo?.estadoActual || "No registrado."}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ background: "#166534", color: "#fff", padding: "6px 12px", fontWeight: "bold", fontSize: "0.85rem" }}>Análisis de Causas</div>
                    <div style={{ padding: "12px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                      {proyectoSeleccionado.problema?.analisisCausas || proyectoSeleccionado.resumenEjecutivo?.causas || "No registrado."}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ background: "#166534", color: "#fff", padding: "6px 12px", fontWeight: "bold", fontSize: "0.85rem" }}>Estado Deseado / Objetivo SMART</div>
                    <div style={{ padding: "12px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                      {proyectoSeleccionado.problema?.estadoDeseado || proyectoSeleccionado.resumenEjecutivo?.estadoDeseado || "No registrado."}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CASO DE NEGOCIO V4 - RESUMEN EJECUTIVO */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ backgroundColor: "#15803d", color: "#fff", padding: "0.75rem", textAlign: "center", fontWeight: "bold", fontSize: "1.05rem" }}>
                  Caso de Negocio V4
                </div>

                <div style={{ padding: "15px", background: "#1e293b", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #334155", fontSize: "0.9rem" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ width: "200px", padding: "10px", fontWeight: "bold", background: "#0f172a", color: "#38bdf8" }}>Nombre del Proyecto:</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{proyectoSeleccionado.resumenEjecutivo?.nombreProyecto || "N/A"}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold", background: "#0f172a", color: "#38bdf8" }}>Procesos Impactados:</td>
                        <td style={{ padding: "10px" }}>{proyectoSeleccionado.resumenEjecutivo?.procesosImpactados || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #334155", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#166534", color: "#fff" }}>
                        <th colSpan="2" style={{ padding: "8px", textAlign: "center" }}>Resumen Ejecutivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ width: "200px", padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Conexión con la Estrategia</td>
                        <td style={{ padding: "10px" }}>
                          <div><strong>Indicador N4:</strong> {proyectoSeleccionado.resumenEjecutivo?.indicadorN4 || "N/A"}</div>
                          <div style={{ marginTop: "4px" }}><strong>Indicador N3:</strong> {proyectoSeleccionado.resumenEjecutivo?.indicadorN3 || "N/A"}</div>
                          <div style={{ marginTop: "4px" }}><strong>Causas:</strong> {proyectoSeleccionado.resumenEjecutivo?.causas || "N/A"}</div>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Necesidad de Mejora</td>
                        <td style={{ padding: "10px" }}>
                          <div><strong>Estado Actual:</strong> {proyectoSeleccionado.resumenEjecutivo?.estadoActual || "N/A"}</div>
                          <div style={{ marginTop: "4px" }}><strong>Estado Deseado:</strong> {proyectoSeleccionado.resumenEjecutivo?.estadoDeseado || "N/A"}</div>
                          <div style={{ marginTop: "4px" }}><strong>Brecha (GAP):</strong> {proyectoSeleccionado.resumenEjecutivo?.brechaGap || "N/A"} | <strong>Sentido Óptimo:</strong> {proyectoSeleccionado.resumenEjecutivo?.sentidoOptimo || "Ascendente"}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Alcance</td>
                        <td style={{ padding: "10px" }}>{proyectoSeleccionado.resumenEjecutivo?.alcance || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. CÉLULA DE TRABAJO */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Célula de Trabajo
                </div>
                <div style={{ padding: "15px", background: "#1e293b" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ width: "180px", padding: "10px", fontWeight: "bold", color: "#fbbf24", background: "#0f172a" }}>Sponsor:</td>
                        <td style={{ padding: "10px" }}>{proyectoSeleccionado.celula?.sponsor || "No asignado"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "10px", fontWeight: "bold", color: "#38bdf8", background: "#0f172a" }}>Líder:</td>
                        <td style={{ padding: "10px" }}>{proyectoSeleccionado.celula?.lider || "No asignado"}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold", color: "#cbd5e1", background: "#0f172a" }}>Equipo:</td>
                        <td style={{ padding: "10px" }}>{proyectoSeleccionado.celula?.equipo || "No asignado"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. PLAN DE TRABAJO - ALTO NIVEL (TABLA MES A MES M1 - M12) */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Plan de Trabajo - Alto Nivel
                </div>
                <div style={{ padding: "15px", background: "#1e293b", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "center" }}>
                    <thead>
                      <tr style={{ background: "#0f172a", color: "#38bdf8", borderBottom: "2px solid #334155" }}>
                        <th style={{ padding: "8px", textAlign: "left", width: "200px" }}>Etapa / Fase</th>
                        {Array.from({ length: 12 }, (_, i) => (
                          <th key={i} style={{ padding: "8px", width: "50px" }}>M{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {planTrabajo.map((fase, fIdx) => (
                        <tr key={fIdx} style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "8px", textAlign: "left", fontWeight: "bold", background: "#0f172a", color: "#f8fafc" }}>
                            {fase.nombre || fase.placeholder || `Fase ${fIdx + 1}`}
                          </td>
                          {(fase.meses || Array(12).fill(false)).map((activo, mIdx) => (
                            <td key={mIdx} style={{ padding: "8px", background: activo ? "rgba(34, 197, 94, 0.25)" : "transparent" }}>
                              {activo ? <span style={{ color: "#22c55e", fontWeight: "bold" }}>✔</span> : <span style={{ color: "#475569" }}>-</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. FLUJO DE CAJA MES A MES (M1 - M12) */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Flujo de Caja
                </div>
                <div style={{ padding: "15px", background: "#1e293b", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "right" }}>
                    <thead>
                      <tr style={{ background: "#0f172a", color: "#38bdf8", borderBottom: "2px solid #334155" }}>
                        <th style={{ padding: "8px", textAlign: "left", width: "220px" }}>(-) Egresos (+) Ingresos (=) Resultado</th>
                        {Array.from({ length: 12 }, (_, i) => (
                          <th key={i} style={{ padding: "8px", minWidth: "55px" }}>M{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "8px", textAlign: "left", background: "#0f172a", fontWeight: "bold" }}>(-) Costo de Operación (Opex)</td>
                        {flujo.opex.map((val, idx) => (
                          <td key={idx} style={{ padding: "8px" }}>{Number(val || 0).toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "8px", textAlign: "left", background: "#0f172a", fontWeight: "bold" }}>(+) Retorno del Negocio</td>
                        {flujo.retorno.map((val, idx) => (
                          <td key={idx} style={{ padding: "8px" }}>{Number(val || 0).toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #334155", background: "#0f172a" }}>
                        <td style={{ padding: "8px", textAlign: "left", fontWeight: "bold", color: "#38bdf8" }}>(=) Flujo Operativo Neto</td>
                        {flujo.flujoOpNeto.map((val, idx) => (
                          <td key={idx} style={{ padding: "8px", fontWeight: "bold", color: val >= 0 ? "#4ade80" : "#ef4444" }}>
                            ${val.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "8px", textAlign: "left", background: "#0f172a", fontWeight: "bold" }}>(-) Inversión Inicial (Capex)</td>
                        {flujo.capex.map((val, idx) => (
                          <td key={idx} style={{ padding: "8px" }}>{Number(val || 0).toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr style={{ background: "#0f172a" }}>
                        <td style={{ padding: "8px", textAlign: "left", fontWeight: "bold", color: "#fde047" }}>(=) Beneficio Neto Acumulado (Payback)</td>
                        {flujo.beneficioAcum.map((val, idx) => (
                          <td key={idx} style={{ padding: "8px", fontWeight: "bold", color: val >= 0 ? "#22c55e" : "#f87171" }}>
                            ${val.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. TIEMPO DE RETORNO DE INVERSIÓN (ROI & PAYBACK) */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Tiempo de Retorno de Inversión (ROI & Payback)
                </div>
                <div style={{ padding: "15px", background: "#1e293b" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "220px", padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Retorno de Inversión (ROI):</td>
                        <td style={{ padding: "10px", fontWeight: "bold", color: "#22c55e", fontSize: "1.1rem" }}>
                          {proyectoSeleccionado.calculosFinancieros?.roi || "0.0"}%
                        </td>
                        <td style={{ width: "220px", padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Periodo Recuperación (Payback):</td>
                        <td style={{ padding: "10px", fontWeight: "bold", color: "#38bdf8", fontSize: "1.1rem" }}>
                          {proyectoSeleccionado.calculosFinancieros?.paybackMes || "Mes 1"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. APORTE A LA ESTRATEGIA Y SOSTENIBILIDAD */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Aporte a la Estrategia y Sostenibilidad
                </div>
                <div style={{ padding: "15px", background: "#1e293b" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "220px", padding: "10px", background: "#0f172a", fontWeight: "bold" }}>Índice de Sostenibilidad:</td>
                        <td style={{ padding: "10px", color: "#cbd5e1" }}>
                          {proyectoSeleccionado.indiceSostenibilidad || "Se debe realizar la medición del índice de sostenibilidad, como se indica en la matriz adjunta"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. APROBACIONES */}
              <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "25px", overflow: "hidden" }}>
                <div style={{ background: "#166534", color: "#fff", padding: "8px 12px", fontWeight: "bold", textAlign: "center" }}>
                  Aprobaciones
                </div>
                <div style={{ padding: "15px", background: "#1e293b" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "center" }}>
                    <thead>
                      <tr style={{ background: "#0f172a", color: "#38bdf8" }}>
                        <th style={{ padding: "10px", width: "50%", borderRight: "1px solid #334155" }}>Sponsor</th>
                        <th style={{ padding: "10px", width: "50%" }}>Líder de Proyecto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "15px", borderRight: "1px solid #334155", color: "#4ade80", fontWeight: "bold" }}>
                          {proyectoSeleccionado.aprobaciones?.nombreSponsor || proyectoSeleccionado.celula?.sponsor || "Sin Firma"}
                        </td>
                        <td style={{ padding: "15px", color: "#4ade80", fontWeight: "bold" }}>
                          {proyectoSeleccionado.aprobaciones?.nombreLider || proyectoSeleccionado.celula?.lider || "Sin Firma"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botón de Cierre */}
              <button
                onClick={() => setProyectoSeleccionado(null)}
                style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}
              >
                Cerrar Ficha del Proyecto
              </button>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
