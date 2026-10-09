import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

export default function MonteCarloModule() {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  const [variacionCapex, setVariacionCapex] = useState(15);
  const [variacionOpex, setVariacionOpex] = useState(10);
  const [variacionRetorno, setVariacionRetorno] = useState(20);
  const [iterations, setIterations] = useState(5000);

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

  const selectedProject = proyectos.find((p) => p._id === selectedProjectId);

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

  const exportarSimulacionPDF = () => {
    const element = document.getElementById("simulacion-monte-carlo-pdf");
    if (!element) return;

    const opt = {
      margin:       [6, 6, 6, 6],
      filename:     `Reporte_Consolidado_Riesgo_${resultado.projectName || "TrueNorte"}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#0f172a",
        windowWidth: 1050
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const obtenerFlujoCalculado = (p) => {
    if (!p) return null;
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

  const flujo = selectedProject ? obtenerFlujoCalculado(selectedProject) : null;
  const planTrabajo = selectedProject?.planTrabajo || [
    { nombre: "Identificación de Necesidades", meses: Array(12).fill(false) },
    { nombre: "Análisis", meses: Array(12).fill(false) },
    { nombre: "Ejecución", meses: Array(12).fill(false) },
    { nombre: "Despliegue", meses: Array(12).fill(false) }
  ];

  return (
    <div style={{ padding: "20px", background: "#0f172a", color: "#f8fafc", borderRadius: "12px", fontFamily: "sans-serif" }}>
      <h2 style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#60a5fa", marginTop: 0 }}>
        🎲 Módulo de Simulación de Riesgo Monte Carlo
      </h2>

      {/* Panel de Configuración */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
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
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "⏳ Corriendo algoritmo de simulación estocástica..." : "🚀 Ejecutar Simulación Monte Carlo"}
      </button>

      {/* RESULTADOS + CONTENEDOR INTEGRADO CAPTURABLE PARA PDF */}
      {resultado && (
        <div style={{ marginTop: "25px" }}>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
            <button
              onClick={exportarSimulacionPDF}
              style={{
                padding: "10px 20px",
                backgroundColor: "#15803d",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.95rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📄 Exportar Reporte Consolidado (PDF)
            </button>
          </div>

          {/* CONTENEDOR UNIFICADO PARA CAPTURA PDF */}
          <div id="simulacion-monte-carlo-pdf" style={{ background: "#0f172a", padding: "15px", borderRadius: "10px" }}>
            
            {/* SECCIÓN A: SI HAY PROYECTO SELECCIONADO, RENDERIZA EL CASO DE NEGOCIO V4 COMPLETO */}
            {selectedProject && flujo && (
              <div style={{ marginBottom: "25px" }}>
                
                {/* Header del Caso de Negocio */}
                <div style={{ borderBottom: "2px solid #15803d", paddingBottom: "10px", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "1.4rem" }}>
                    📋 Caso de Negocio V4: {selectedProject.resumenEjecutivo?.nombreProyecto || "Sin Nombre"}
                  </h2>
                  <small style={{ color: "#94a3b8" }}>Fecha de Registro: {selectedProject.resumenEjecutivo?.fecha || "N/A"}</small>
                </div>

                {/* 1. ENTENDIMIENTO DEL PROBLEMA */}
                <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#15803d", color: "#fff", padding: "0.6rem", textAlign: "center", fontWeight: "bold", fontSize: "1rem" }}>
                    Entendimiento del Problema
                  </div>
                  <div style={{ padding: "12px", background: "#1e293b", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px" }}>
                      <div style={{ padding: "8px", fontWeight: "bold", color: "#38bdf8", borderRight: "1px solid #334155" }}>Tipo de problema</div>
                      <div style={{ padding: "8px", fontWeight: "bold" }}>{selectedProject.problema?.tipoProblema || "N/A"}</div>
                    </div>
                    <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#166534", color: "#fff", padding: "4px 10px", fontWeight: "bold", fontSize: "0.8rem" }}>Contexto (Conexión con la estrategia)</div>
                      <div style={{ padding: "10px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {selectedProject.problema?.contexto || selectedProject.resumenEjecutivo?.contexto || "No registrado."}
                      </div>
                    </div>
                    <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#166534", color: "#fff", padding: "4px 10px", fontWeight: "bold", fontSize: "0.8rem" }}>Estado Actual</div>
                      <div style={{ padding: "10px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {selectedProject.problema?.estadoActual || selectedProject.resumenEjecutivo?.estadoActual || "No registrado."}
                      </div>
                    </div>
                    <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#166534", color: "#fff", padding: "4px 10px", fontWeight: "bold", fontSize: "0.8rem" }}>Análisis de Causas</div>
                      <div style={{ padding: "10px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {selectedProject.problema?.analisisCausas || selectedProject.resumenEjecutivo?.causas || "No registrado."}
                      </div>
                    </div>
                    <div style={{ border: "1px solid #334155", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#166534", color: "#fff", padding: "4px 10px", fontWeight: "bold", fontSize: "0.8rem" }}>Estado Deseado / Objetivo SMART</div>
                      <div style={{ padding: "10px", background: "#0f172a", color: "#cbd5e1", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {selectedProject.problema?.estadoDeseado || selectedProject.resumenEjecutivo?.estadoDeseado || "No registrado."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. RESUMEN EJECUTIVO */}
                <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#15803d", color: "#fff", padding: "0.6rem", textAlign: "center", fontWeight: "bold", fontSize: "1rem" }}>
                    Caso de Negocio V4
                  </div>
                  <div style={{ padding: "12px", background: "#1e293b", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #334155", fontSize: "0.85rem" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ width: "180px", padding: "8px", fontWeight: "bold", background: "#0f172a", color: "#38bdf8" }}>Nombre del Proyecto:</td>
                          <td style={{ padding: "8px", fontWeight: "bold" }}>{selectedProject.resumenEjecutivo?.nombreProyecto || "N/A"}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", fontWeight: "bold", background: "#0f172a", color: "#38bdf8" }}>Procesos Impactados:</td>
                          <td style={{ padding: "8px" }}>{selectedProject.resumenEjecutivo?.procesosImpactados || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #334155", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "#166534", color: "#fff" }}>
                          <th colSpan="2" style={{ padding: "6px", textAlign: "center" }}>Resumen Ejecutivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ width: "180px", padding: "8px", background: "#0f172a", fontWeight: "bold" }}>Conexión con la Estrategia</td>
                          <td style={{ padding: "8px" }}>
                            <div><strong>Indicador N4:</strong> {selectedProject.resumenEjecutivo?.indicadorN4 || "N/A"}</div>
                            <div><strong>Indicador N3:</strong> {selectedProject.resumenEjecutivo?.indicadorN3 || "N/A"}</div>
                            <div><strong>Causas:</strong> {selectedProject.resumenEjecutivo?.causas || "N/A"}</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "8px", background: "#0f172a", fontWeight: "bold" }}>Necesidad de Mejora</td>
                          <td style={{ padding: "8px" }}>
                            <div><strong>Estado Actual:</strong> {selectedProject.resumenEjecutivo?.estadoActual || "N/A"}</div>
                            <div><strong>Estado Deseado:</strong> {selectedProject.resumenEjecutivo?.estadoDeseado || "N/A"}</div>
                            <div><strong>Brecha (GAP):</strong> {selectedProject.resumenEjecutivo?.brechaGap || "N/A"} | <strong>Sentido Óptimo:</strong> {selectedProject.resumenEjecutivo?.sentidoOptimo || "Ascendente"}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", background: "#0f172a", fontWeight: "bold" }}>Alcance</td>
                          <td style={{ padding: "8px" }}>{selectedProject.resumenEjecutivo?.alcance || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. CÉLULA DE TRABAJO */}
                <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "6px 10px", fontWeight: "bold", textAlign: "center" }}>
                    Célula de Trabajo
                  </div>
                  <div style={{ padding: "10px", background: "#1e293b" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ width: "160px", padding: "8px", fontWeight: "bold", color: "#fbbf24", background: "#0f172a" }}>Sponsor:</td>
                          <td style={{ padding: "8px" }}>{selectedProject.celula?.sponsor || "No asignado"}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "8px", fontWeight: "bold", color: "#38bdf8", background: "#0f172a" }}>Líder:</td>
                          <td style={{ padding: "8px" }}>{selectedProject.celula?.lider || "No asignado"}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", fontWeight: "bold", color: "#cbd5e1", background: "#0f172a" }}>Equipo:</td>
                          <td style={{ padding: "8px" }}>{selectedProject.celula?.equipo || "No asignado"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. PLAN DE TRABAJO */}
                <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "6px 10px", fontWeight: "bold", textAlign: "center" }}>
                    Plan de Trabajo - Alto Nivel
                  </div>
                  <div style={{ padding: "10px", background: "#1e293b" }}>
                    <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "center" }}>
                      <thead>
                        <tr style={{ background: "#0f172a", color: "#38bdf8", borderBottom: "2px solid #334155" }}>
                          <th style={{ padding: "6px 4px", textAlign: "left", width: "22%" }}>Etapa / Fase</th>
                          {Array.from({ length: 12 }, (_, i) => (
                            <th key={i} style={{ padding: "6px 2px", width: "6.5%" }}>M{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {planTrabajo.map((fase, fIdx) => (
                          <tr key={fIdx} style={{ borderBottom: "1px solid #334155" }}>
                            <td style={{ padding: "6px 4px", textAlign: "left", fontWeight: "bold", background: "#0f172a", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {fase.nombre || fase.placeholder || `Fase ${fIdx + 1}`}
                            </td>
                            {(fase.meses || Array(12).fill(false)).map((activo, mIdx) => (
                              <td key={mIdx} style={{ padding: "6px 2px", background: activo ? "rgba(34, 197, 94, 0.25)" : "transparent" }}>
                                {activo ? <span style={{ color: "#22c55e", fontWeight: "bold" }}>✔</span> : <span style={{ color: "#475569" }}>-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. FLUJO DE CAJA (M1-M12 COMPLETO) */}
                <div style={{ border: "2px solid #15803d", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "6px 10px", fontWeight: "bold", textAlign: "center" }}>
                    Flujo de Caja
                  </div>
                  <div style={{ padding: "10px", background: "#1e293b" }}>
                    <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.68rem", textAlign: "right" }}>
                      <thead>
                        <tr style={{ background: "#0f172a", color: "#38bdf8", borderBottom: "2px solid #334155" }}>
                          <th style={{ padding: "6px 4px", textAlign: "left", width: "22%" }}>(-) Egresos (+) Ingresos (=) Resultado</th>
                          {Array.from({ length: 12 }, (_, i) => (
                            <th key={i} style={{ padding: "6px 2px", width: "6.5%", textAlign: "center" }}>M{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "6px 4px", textAlign: "left", background: "#0f172a", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>(-) Costo de Operación (Opex)</td>
                          {flujo.opex.map((val, idx) => (
                            <td key={idx} style={{ padding: "6px 2px" }}>{Number(val || 0).toLocaleString()}</td>
                          ))}
                        </tr>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "6px 4px", textAlign: "left", background: "#0f172a", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>(+) Retorno del Negocio</td>
                          {flujo.retorno.map((val, idx) => (
                            <td key={idx} style={{ padding: "6px 2px" }}>{Number(val || 0).toLocaleString()}</td>
                          ))}
                        </tr>
                        <tr style={{ borderBottom: "1px solid #334155", background: "#0f172a" }}>
                          <td style={{ padding: "6px 4px", textAlign: "left", fontWeight: "bold", color: "#38bdf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>(=) Flujo Operativo Neto</td>
                          {flujo.flujoOpNeto.map((val, idx) => (
                            <td key={idx} style={{ padding: "6px 2px", fontWeight: "bold", color: val >= 0 ? "#4ade80" : "#ef4444" }}>
                              ${val.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "6px 4px", textAlign: "left", background: "#0f172a", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>(-) Inversión Inicial (Capex)</td>
                          {flujo.capex.map((val, idx) => (
                            <td key={idx} style={{ padding: "6px 2px" }}>{Number(val || 0).toLocaleString()}</td>
                          ))}
                        </tr>
                        <tr style={{ background: "#0f172a" }}>
                          <td style={{ padding: "6px 4px", textAlign: "left", fontWeight: "bold", color: "#fde047", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>(=) Beneficio Neto Acumulado</td>
                          {flujo.beneficioAcum.map((val, idx) => (
                            <td key={idx} style={{ padding: "6px 2px", fontWeight: "bold", color: val >= 0 ? "#22c55e" : "#f87171" }}>
                              ${val.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. TIEMPO DE RETORNO & SOSTENIBILIDAD & APROBACIONES */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div style={{ border: "2px solid #15803d", borderRadius: "8px", background: "#1e293b", padding: "10px" }}>
                    <div style={{ color: "#22c55e", fontWeight: "bold", marginBottom: "6px" }}>🌱 Sostenibilidad</div>
                    <small style={{ color: "#cbd5e1" }}>{selectedProject.indiceSostenibilidad || "Sin observaciones específicas."}</small>
                  </div>
                  <div style={{ border: "2px solid #15803d", borderRadius: "8px", background: "#1e293b", padding: "10px" }}>
                    <div style={{ color: "#38bdf8", fontWeight: "bold", marginBottom: "6px" }}>✍️ Aprobaciones</div>
                    <small style={{ display: "block" }}><strong>Sponsor:</strong> {selectedProject.aprobaciones?.nombreSponsor || selectedProject.celula?.sponsor || "Sin Firma"}</small>
                    <small style={{ display: "block" }}><strong>Líder:</strong> {selectedProject.aprobaciones?.nombreLider || selectedProject.celula?.lider || "Sin Firma"}</small>
                  </div>
                </div>

              </div>
            )}

            {/* SECCIÓN B: ANÁLISIS PROBABILÍSTICO MONTE CARLO Y CAMPANA DE GAUSS */}
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px", border: "2px solid #2563eb" }}>
              <h3 style={{ marginTop: 0, color: "#f8fafc", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
                🎲 Evaluación Estocástica de Riesgo (Monte Carlo): <span style={{ color: "#60a5fa" }}>{resultado.projectName}</span>
              </h3>

              {/* Tarjetas KPI de Riesgo */}
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
                  <small style={{ color: "#94a3b8" }}>Rango P10 / P90</small>
                  <h4 style={{ color: "#fde047", margin: "8px 0 0 0" }}>{resultado.metricas.p10}% a {resultado.metricas.p90}%</h4>
                </div>
              </div>

              {/* Gráfico de Campana de Gauss */}
              <h4 style={{ textAlign: "center", marginTop: "25px", marginBottom: "15px", color: "#cbd5e1" }}>
                Distribución Frecuencia del ROI (Campana de Gauss) - {resultado.iterations.toLocaleString()} iteraciones
              </h4>
              
              <div style={{ height: "230px", display: "flex", alignItems: "flex-end", gap: "6px", background: "#0f172a", padding: "20px 15px 10px 15px", borderRadius: "8px", border: "1px solid #334155" }}>
                {resultado.histogram.map((bin, idx) => {
                  const alturaPct = (bin.frecuencia / resultado.maxFrecuencia) * 100;
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "4px" }}>{bin.frecuencia}</span>
                      <div
                        style={{
                          width: "100%",
                          height: `${alturaPct}%`,
                          backgroundColor: bin.esGanancia ? "#22c55e" : "#ef4444",
                          borderRadius: "3px 3px 0 0"
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

          </div>
        </div>
      )}
    </div>
  );
}
