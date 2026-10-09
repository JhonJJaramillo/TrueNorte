import { useState, useEffect } from "react";
import "./App.css";

// Diccionario de definiciones para el tipo de problema
const DESCRIPCIONES_PROBLEMA = {
  "1. Contención":
    "Surgen de forma instantánea y necesitan de un proceso reactivo para corregir rápidamente las condiciones adversas y devolver las condiciones al estándar definido.",
  "2. Desviación del estándar":
    "Surgen como evolución de los problemas de contención que se han vuelto repetitivos, lo cual genera un alejamiento progresivo del estándar.",
  "3. Condición Objetivo":
    "Una vez las condiciones se encuentran dentro de su estándar, se establece una condición objetivo, orientado a la mejora continua.",
  "4. Innovación":
    "Mejorará el estándar, como una condición objetivo, cambia disruptivamente la forma como se realiza el proceso."
};

// TABLA DE INDICADORES ESTRATÉGICOS N4 Y N3
const INDICADORES_ESTRATEGICOS = [
  { id: 1, n4: "Margen Bruto", n3: "Productividad por avance de obra" },
  { id: 2, n4: "Margen Bruto", n3: "Desviación costo directo planeación" },
  { id: 3, n4: "Margen Bruto", n3: "Desviación costo directo ejecución" },
  { id: 4, n4: "Margen Bruto", n3: "Desviación margen bruto fase planeación" },
  { id: 5, n4: "Margen Bruto", n3: "Desviación margen bruto fase ejecución" },
  { id: 6, n4: "Margen Bruto", n3: "Eficiencia en el ppto de mercadeo (PUBLICIDAD)" },
  { id: 7, n4: "Entregas", n3: "Inventario construido vendido sin escriturar" },
  { id: 8, n4: "Entregas", n3: "Entregas x asesor" },
  { id: 9, n4: "Entregas", n3: "Desviación Escrituración Vs. Liberación de Producto Terminado" },
  { id: 10, n4: "Entregas", n3: "Liberación de unidades Vs. Linea Base" },
  { id: 11, n4: "Entregas", n3: "Inventario unidades en liberación de calidad" },
  { id: 12, n4: "Entregas", n3: "Cumplimiento cronograma RPH" },
  { id: 13, n4: "Flujo de Caja de Operación", n3: "Cumplimiento radicación desenglobe Catastral" },
  { id: 14, n4: "Gasto Administrativo", n3: "Indice de gasto comercial" },
  { id: 15, n4: "Ventas Netas", n3: "Ventas por asesor" },
  { id: 16, n4: "Ventas Netas", n3: "Cumplimiento volumen en oferta" },
  { id: 17, n4: "Flujo de Caja de Operación", n3: "Rotación de inventario de materiales e insumos" },
  { id: 18, n4: "Flujo de Caja de Operación", n3: "Rotación de cartera de proveedores" },
  { id: 19, n4: "Flujo de Caja de Operación", n3: "Devolución de IVA" },
  { id: 20, n4: "Apalancamiento Financiero", n3: "Eficiencia financiera del terreno" },
  { id: 21, n4: "Apalancamiento Financiero", n3: "Consumo de cupos de capital de trabajo" },
  { id: 22, n4: "Apalancamiento Financiero", n3: "Posición de deuda LP - Sin crédito constructor" },
  { id: 23, n4: "Apalancamiento Financiero", n3: "Gasto Financiero Caja" },
  { id: 24, n4: "Apalancamiento Financiero", n3: "Gestión oportuna permiso de ventas" },
  { id: 25, n4: "Apalancamiento Financiero", n3: "Gestión Oportuna constitución de garantías" },
  { id: 26, n4: "Gasto Administrativo", n3: "Eficiencia gasto administrativo" },
  { id: 27, n4: "Gasto Administrativo", n3: "Representación de Nómina en el gasto admin" },
  { id: 28, n4: "Gasto Administrativo", n3: "Eficiencia en la planeación" },
  { id: 29, n4: "Gasto Administrativo", n3: "Gasto ADMIN por colaborador" },
  { id: 31, n4: "Índice de sostenibilidad", n3: "Carbono Cero" },
  { id: 32, n4: "NPS", n3: "Satisfacción en momentos de verdad" },
  { id: 33, n4: "NPS", n3: "Esfuerzo" },
  { id: 34, n4: "Índice de sostenibilidad", n3: "Influencia de Valor compartido en marca" },
  { id: 35, n4: "Conectados", n3: "Indice de liderazgo" },
  { id: 36, n4: "Conectados", n3: "Indice de cultura" },
  { id: 37, n4: "Conectados", n3: "Span of control" },
  { id: 38, n4: "Conectados", n3: "Indice de Cultura Segura" },
  { id: 39, n4: "Conectados", n3: "Movilidad Interna" },
  { id: 40, n4: "Conectados", n3: "Desempeño de los empleados" },
  { id: 41, n4: "Conectados", n3: "Indice de competitividad Salarial" },
  { id: 42, n4: "Conectados", n3: "Indice de equidad interna" },
  { id: 43, n4: "Headcount", n3: "% Retiros Voluntarios" },
  { id: 44, n4: "NPS", n3: "Cumplimiento fecha entrega estimada en la separación" },
  { id: 45, n4: "Índice de sostenibilidad", n3: "Productividad Digital(TI)" },
  { id: 46, n4: "NPS", n3: "Locativas por inmueble entregado SA + CA" },
  { id: 47, n4: "NPS", n3: "Inmuebles sin pendientes de entrega SA + CA" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminUsers, setAdminUsers] = useState([]);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // 1. Insumos del Entendimiento del Problema
  const [problema, setProblema] = useState({
    tipoProblema: "2. Desviación del estándar",
    contexto: "",
    estadoActual: "",
    analisisCausas: "",
    estadoDeseado: ""
  });

  const listaN4 = Array.from(new Set(INDICADORES_ESTRATEGICOS.map((item) => item.n4)));

  // 2. Resumen Ejecutivo (Fecha siempre HOY)
  const [resumenEjecutivo, setResumenEjecutivo] = useState({
    nombreProyecto: "",
    procesosImpactados: "",
    fecha: new Date().toLocaleDateString("es-CO"),
    indicadorN4: "Margen Bruto",
    indicadorN3: "Productividad por avance de obra",
    causas: "",
    estadoActual: "",
    estadoDeseado: "",
    brechaGap: "",
    sentidoOptimo: "Ascendente",
    alcance: ""
  });

  const listaN3 = INDICADORES_ESTRATEGICOS.filter(
    (item) => item.n4 === resumenEjecutivo.indicadorN4
  ).map((item) => item.n3);

  // 3. Célula de Trabajo
  const [celula, setCelula] = useState({
    sponsor: "",
    lider: "",
    equipo: ""
  });

  // 4. Plan de Trabajo - Fases editables
  const [planTrabajo, setPlanTrabajo] = useState([
    { nombre: "", placeholder: "Identificación de Necesidades", meses: Array(12).fill(false) },
    { nombre: "", placeholder: "Análisis", meses: Array(12).fill(false) },
    { nombre: "", placeholder: "Ejecución", meses: Array(12).fill(false) },
    { nombre: "", placeholder: "Despliegue", meses: Array(12).fill(false) }
  ]);

  // 5. Flujo de Caja (Ceros iniciales)
  const [flujoCaja, setFlujoCaja] = useState({
    opex: Array(12).fill(0),
    retorno: Array(12).fill(0),
    capex: Array(12).fill(0)
  });

  // 6. Índice de Sostenibilidad
  const [indiceSostenibilidad, setIndiceSostenibilidad] = useState("");

  const [aprobaciones, setAprobaciones] = useState({
    nombreSponsor: "",
    nombreLider: ""
  });

  // --- CÁLCULOS FINANCIEROS EN TIEMPO REAL (ROI Y PAYBACK) ---
  const calcularFlujoCaja = () => {
    let flujoOperativoNeto = [];
    let beneficioNetoAcumulado = [];
    let beneficioAcum = 0;

    for (let i = 0; i < 12; i++) {
      const opNeto = flujoCaja.retorno[i] - flujoCaja.opex[i];
      flujoOperativoNeto.push(opNeto);

      beneficioAcum += opNeto - flujoCaja.capex[i];
      beneficioNetoAcumulado.push(beneficioAcum);
    }

    const totalCapex = flujoCaja.capex.reduce((a, b) => a + b, 0);
    const totalRetorno = flujoCaja.retorno.reduce((a, b) => a + b, 0);
    const totalOpex = flujoCaja.opex.reduce((a, b) => a + b, 0);
    const beneficioTotal = totalRetorno - totalOpex - totalCapex;

    let roi = "0.0";
    if (totalCapex > 0) {
      roi = ((beneficioTotal / totalCapex) * 100).toFixed(1);
    } else if (beneficioTotal > 0) {
      roi = "100.0";
    }

    let paybackMes = "Sin retorno registrado";
    const mesPaybackIndex = beneficioNetoAcumulado.findIndex((val) => val >= 0);

    if (totalCapex === 0 && beneficioTotal > 0) {
      paybackMes = "Inmediato (Mes 1)";
    } else if (mesPaybackIndex !== -1) {
      paybackMes = `Mes ${mesPaybackIndex + 1}`;
    } else if (totalCapex > 0) {
      paybackMes = "No recuperado en 12 meses";
    }

    return { flujoOperativoNeto, beneficioNetoAcumulado, roi, paybackMes, beneficioTotal };
  };

  const calculosFinancieros = calcularFlujoCaja();

  const todosLosCamposLlenos =
    problema.tipoProblema.trim() !== "" &&
    problema.contexto.trim() !== "" &&
    problema.estadoActual.trim() !== "" &&
    problema.analisisCausas.trim() !== "" &&
    problema.estadoDeseado.trim() !== "";

  // --- VALIDACIÓN COMPLETA DEL CASO DE NEGOCIO PARA GUARDAR ---
  const resumenCompleto =
    resumenEjecutivo.nombreProyecto.trim() !== "" &&
    resumenEjecutivo.procesosImpactados.trim() !== "" &&
    resumenEjecutivo.indicadorN4.trim() !== "" &&
    resumenEjecutivo.indicadorN3.trim() !== "" &&
    resumenEjecutivo.causas.trim() !== "" &&
    resumenEjecutivo.estadoActual.trim() !== "" &&
    resumenEjecutivo.estadoDeseado.trim() !== "" &&
    resumenEjecutivo.brechaGap.trim() !== "" &&
    resumenEjecutivo.alcance.trim() !== "";

  const celulaCompleta =
    celula.sponsor.trim() !== "" &&
    celula.lider.trim() !== "" &&
    celula.equipo.trim() !== "";

  const planCompleto = planTrabajo.every(
    (fase) => (fase.nombre.trim() !== "" || fase.placeholder) && fase.meses.some((m) => m === true)
  );

  const flujoCompleto =
    flujoCaja.opex.some((v) => v > 0) ||
    flujoCaja.retorno.some((v) => v > 0) ||
    flujoCaja.capex.some((v) => v > 0);

  const sostenibilidadCompleta = indiceSostenibilidad.trim() !== "";

  const aprobacionesCompletas =
    aprobaciones.nombreSponsor.trim() !== "" &&
    aprobaciones.nombreLider.trim() !== "";

  const casoDeNegocioCompleto =
    resumenCompleto &&
    celulaCompleta &&
    planCompleto &&
    flujoCompleto &&
    sostenibilidadCompleta &&
    aprobacionesCompletas;

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    const token = localStorage.getItem("truenorte_token");
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((userData) => setUser(userData))
        .catch(() => localStorage.removeItem("truenorte_token"));
    }
  }, []);

  useEffect(() => {
    if (user && user.rol === "Administrador" && activeTab === "usuarios") {
      fetchUsers();
    }
  }, [user, activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("truenorte_token");
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("truenorte_token");
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rol: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Error al cambiar rol:", err);
    }
  };

  // --- PROCESAR CON EDITOR NLP ---
  const handleProcesarConNLP = async () => {
    if (!todosLosCamposLlenos) {
      alert("⚠️ Debe diligenciar los 5 campos del Entendimiento del Problema.");
      return;
    }

    setNlpLoading(true);
    try {
      const token = localStorage.getItem("truenorte_token");
      const res = await fetch(`${API_BASE}/nlp/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(problema)
      });

      const data = await res.json();

      if (res.ok) {
        setResumenEjecutivo((prev) => ({
          ...prev,
          nombreProyecto: data.nombreProyecto || prev.nombreProyecto,
          procesosImpactados: data.procesosImpactados || prev.procesosImpactados,
          indicadorN4: data.indicadorN4 || prev.indicadorN4,
          indicadorN3: data.indicadorN3 || prev.indicadorN3,
          causas: data.causas || prev.causas,
          estadoActual: data.estadoActual || prev.estadoActual,
          estadoDeseado: data.estadoDeseado || prev.estadoDeseado,
          brechaGap: data.brechaGap || prev.brechaGap,
          sentidoOptimo: data.sentidoOptimo || "Ascendente",
          alcance: data.alcance || prev.alcance
        }));
      } else {
        alert(data.error || "Error al procesar con el Editor NLP");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar NLP.");
    } finally {
      setNlpLoading(false);
    }
  };

  // --- GUARDAR CASO DE NEGOCIO EN MONGODB ---
  const handleGuardarProyecto = async () => {
    if (!casoDeNegocioCompleto) {
      alert("⚠️ Debe diligenciar todas las secciones del Caso de Negocio antes de guardar.");
      return;
    }

    setSavingProject(true);
    try {
      const token = localStorage.getItem("truenorte_token");
      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problema,
          resumenEjecutivo: {
            ...resumenEjecutivo,
            fecha: new Date().toLocaleDateString("es-CO")
          },
          celula,
          planTrabajo,
          flujoCaja,
          calculosFinancieros,
          indiceSostenibilidad,
          aprobaciones
        })
      });

      if (res.ok) {
        alert("✅ ¡Caso de Negocio guardado exitosamente en MongoDB Atlas!");
        setActiveTab("proyectos");
      } else {
        const errData = await res.json();
        alert(`Error al guardar: ${errData.error || "No se pudo guardar el proyecto"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar el proyecto.");
    } finally {
      setSavingProject(false);
    }
  };

  const handleFaseNombreChange = (index, nuevoNombre) => {
    const nuevoPlan = [...planTrabajo];
    nuevoPlan[index].nombre = nuevoNombre;
    setPlanTrabajo(nuevoPlan);
  };

  const togglePlanMes = (faseIndex, mesIndex) => {
    const nuevoPlan = [...planTrabajo];
    nuevoPlan[faseIndex].meses[mesIndex] = !nuevoPlan[faseIndex].meses[mesIndex];
    setPlanTrabajo(nuevoPlan);
  };

  const handleFlujoChange = (tipo, index, valor) => {
    const nuevoFlujo = { ...flujoCaja };
    const num = valor === "" ? 0 : parseFloat(valor);
    nuevoFlujo[tipo][index] = isNaN(num) ? 0 : num;
    setFlujoCaja(nuevoFlujo);
  };

  // --- LOGIN / REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = isRegister ? { nombre, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setMensaje(data.message || "¡Cuenta creada! Ya puedes iniciar sesión.");
          setIsRegister(false);
          setPassword("");
        } else {
          localStorage.setItem("truenorte_token", data.token);
          setUser(data.user);
        }
      } else {
        setError(data.error || "Ocurrió un error");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const emailGoogle = window.prompt("Ingresa tu correo de Google:", "jhon.jairo.jaramillo@correounivalle.edu.co");
    if (!emailGoogle) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailGoogle.trim(),
          nombre: emailGoogle.includes("jhon") ? "Jhon Jaramillo" : "Usuario Google"
        })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("truenorte_token", data.token);
        setUser(data.user);
      } else {
        setError(data.error || "Error al autenticar con Google");
      }
    } catch (err) {
      setError("Error al conectar para autenticar con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("truenorte_token");
    setUser(null);
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a" }}>
        <div style={{ background: "#1e293b", padding: "2rem", borderRadius: "10px", width: "100%", maxWidth: "400px", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "2.5rem" }}>🧭</span>
            <h2 style={{ margin: "0.5rem 0 0 0", color: "#38bdf8" }}>TRUENORTE</h2>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>Inteligencia Estratégica y Simulación Probabilística</p>
          </div>

          {error && <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid #ef4444", padding: "0.6rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem", textAlign: "center" }}>{error}</div>}
          {mensaje && <div style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", border: "1px solid #22c55e", padding: "0.6rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem", textAlign: "center" }}>{mensaje}</div>}

          <button onClick={handleGoogleLogin} disabled={loading} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "none", background: "#fff", color: "#0f172a", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "18px", height: "18px" }} />
            Continuar con Google
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "1rem 0", color: "#64748b" }}>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
            <span style={{ padding: "0 10px", fontSize: "0.75rem" }}>O MEDIANTE CORREO</span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isRegister && (
              <div>
                <label style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Nombre Completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginTop: "0.3rem" }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginTop: "0.3rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Contraseña</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginTop: "0.3rem" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "12px", background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "0.75rem" }}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ padding: "0.75rem", borderRadius: "6px", border: "none", background: "#0284c7", color: "#fff", fontWeight: "bold", cursor: "pointer", marginTop: "0.5rem" }}>
              {loading ? "Cargando..." : isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </button>
          </form>

          <p onClick={() => { setIsRegister(!isRegister); setError(""); setMensaje(""); }} style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}>
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "proyectos", label: "📁 Proyectos" },
    { id: "nlp", label: "📝 Editor NLP" },
    { id: "simulacion", label: "🎲 Monte Carlo" }
  ];

  if (user.rol === "Administrador") {
    menuItems.push({ id: "usuarios", label: "👥 Usuarios (Admin)" });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
      {/* BARRA LATERAL */}
      <aside style={{ width: "250px", backgroundColor: "#1e293b", padding: "1.5rem 1rem", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem", paddingLeft: "0.5rem" }}>
            <span style={{ fontSize: "1.8rem" }}>🧭</span>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0, color: "#38bdf8" }}>TRUENORTE</h2>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", padding: "0.75rem 1rem", borderRadius: "8px", border: "none", backgroundColor: activeTab === item.id ? "#0284c7" : "transparent", color: activeTab === item.id ? "#ffffff" : "#94a3b8", textAlign: "left", cursor: "pointer", fontWeight: activeTab === item.id ? "600" : "normal" }}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ borderTop: "1px solid #334155", paddingTop: "1rem" }}>
          <div style={{ marginBottom: "0.8rem", paddingLeft: "0.5rem" }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>{user.nombre}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: user.rol === "Administrador" ? "#f59e0b" : "#38bdf8", fontWeight: "bold" }}>{user.rol}</p>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ef4444", backgroundColor: "transparent", color: "#f87171", cursor: "pointer", fontWeight: "bold" }}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: "2rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>
            {activeTab === "dashboard" && "Resumen Ejecutivo"}
            {activeTab === "proyectos" && "Gestión de Proyectos"}
            {activeTab === "nlp" && "Procesamiento de Lenguaje Natural (Editor NLP)"}
            {activeTab === "simulacion" && "Simulación de Riesgo Monte Carlo"}
            {activeTab === "usuarios" && "Gestión de Usuarios y Roles"}
          </h1>
          <p style={{ margin: "0.3rem 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Plataforma de Inteligencia Estratégica
          </p>
        </header>

        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ background: "#1e293b", padding: "1.2rem", borderRadius: "10px", border: "1px solid #334155" }}>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Proyectos Activos</p>
                <h2 style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", color: "#38bdf8" }}>3</h2>
              </div>
              <div style={{ background: "#1e293b", padding: "1.2rem", borderRadius: "10px", border: "1px solid #334155" }}>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Simulaciones Ejecutadas</p>
                <h2 style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", color: "#4ade80" }}>12</h2>
              </div>
              <div style={{ background: "#1e293b", padding: "1.2rem", borderRadius: "10px", border: "1px solid #334155" }}>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Análisis NLP Procesados</p>
                <h2 style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", color: "#a855f7" }}>8</h2>
              </div>
            </div>

            <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "10px", border: "1px solid #334155" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>🟢 Estado del Sistema</h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>Conexión directa con MongoDB Atlas activa y autenticada.</p>
            </div>
          </div>
        )}

        {activeTab === "proyectos" && (
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "10px", border: "1px solid #334155" }}>
            <h3>📁 Módulo de Proyectos</h3>
            <p style={{ color: "#94a3b8" }}>Módulo reservado para que los Líderes de Proyectos gestionen sus escenarios.</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA: EDITOR NLP (CASO DE NEGOCIO V4 REPLICADO COMPLETO) */}
        {/* ========================================================= */}
        {activeTab === "nlp" && (
          <div>
            {/* BLOQUE 1: ENTENDIMIENTO DEL PROBLEMA */}
            <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "8px", border: "2px solid #15803d", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#15803d", color: "#fff", padding: "0.8rem", textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}>
                Entendimiento del Problema
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <div style={{ border: "1px solid #334155", borderRadius: "4px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 220px 1fr", background: "#0f172a" }}>
                    <div style={{ padding: "0.8rem", fontWeight: "bold", borderRight: "1px solid #334155", display: "flex", alignItems: "center" }}>Tipo de problema</div>
                    <div style={{ padding: "0.5rem", borderRight: "1px solid #334155", display: "flex", alignItems: "center" }}>
                      <select value={problema.tipoProblema} onChange={(e) => setProblema({ ...problema, tipoProblema: e.target.value })} style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", background: "#1e293b", border: "1px solid #38bdf8", color: "#fff", fontWeight: "bold" }}>
                        <option value="1. Contención">1. Contención</option>
                        <option value="2. Desviación del estándar">2. Desviación del estándar</option>
                        <option value="3. Condición Objetivo">3. Condición Objetivo</option>
                        <option value="4. Innovación">4. Innovación</option>
                      </select>
                    </div>
                    <div style={{ padding: "0.8rem", color: "#cbd5e1", fontSize: "0.85rem", fontStyle: "italic", background: "#1e293b", display: "flex", alignItems: "center" }}>
                      {DESCRIPCIONES_PROBLEMA[problema.tipoProblema]}
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid #334155" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "0.4rem 0.8rem", fontWeight: "bold", fontSize: "0.85rem" }}>Contexto (Conexión con la estrategia)</div>
                  <textarea rows="3" value={problema.contexto} onChange={(e) => setProblema({ ...problema, contexto: e.target.value })} placeholder="Historia que cuenta la necesidad..." style={{ width: "100%", padding: "0.8rem", background: "#0f172a", border: "none", color: "#fff", boxSizing: "border-box" }} />
                </div>

                <div style={{ border: "1px solid #334155" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "0.4rem 0.8rem", fontWeight: "bold", fontSize: "0.85rem" }}>Estado Actual</div>
                  <textarea rows="3" value={problema.estadoActual} onChange={(e) => setProblema({ ...problema, estadoActual: e.target.value })} placeholder="Descripción del gap y métricas..." style={{ width: "100%", padding: "0.8rem", background: "#0f172a", border: "none", color: "#fff", boxSizing: "border-box" }} />
                </div>

                <div style={{ border: "1px solid #334155" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "0.4rem 0.8rem", fontWeight: "bold", fontSize: "0.85rem" }}>Análisis de Causas</div>
                  <textarea rows="3" value={problema.analisisCausas} onChange={(e) => setProblema({ ...problema, analisisCausas: e.target.value })} placeholder="Análisis causa raíz..." style={{ width: "100%", padding: "0.8rem", background: "#0f172a", border: "none", color: "#fff", boxSizing: "border-box" }} />
                </div>

                <div style={{ border: "1px solid #334155" }}>
                  <div style={{ background: "#166534", color: "#fff", padding: "0.4rem 0.8rem", fontWeight: "bold", fontSize: "0.85rem" }}>Estado Deseado / Objetivo SMART</div>
                  <textarea rows="2" value={problema.estadoDeseado} onChange={(e) => setProblema({ ...problema, estadoDeseado: e.target.value })} placeholder="Objetivo SMART..." style={{ width: "100%", padding: "0.8rem", background: "#0f172a", border: "none", color: "#fff", boxSizing: "border-box" }} />
                </div>

                <button onClick={handleProcesarConNLP} disabled={!todosLosCamposLlenos || nlpLoading} style={{ padding: "0.8rem 1.5rem", borderRadius: "6px", border: "none", background: todosLosCamposLlenos ? "#0284c7" : "#475569", color: "#fff", fontWeight: "bold", fontSize: "1rem", cursor: todosLosCamposLlenos ? "pointer" : "not-allowed" }}>
                  {nlpLoading ? "⚡ Procesando con Módulo Editor NLP (Gemini)..." : todosLosCamposLlenos ? "🤖 Refinar y Llenar Resumen Ejecutivo (Editor NLP)" : "🔒 Complete los 5 campos obligatorios"}
                </button>
              </div>
            </div>

            {/* BLOQUE 2: PLANTILLA REPLICADA EXACTA CASO DE NEGOCIO V4 */}
            <div style={{ background: "#ffffff", color: "#000000", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
              <div style={{ backgroundColor: "#15803d", color: "#ffffff", padding: "0.6rem", textAlign: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Caso de Negocio V4
              </div>

              {/* ENCABEZADO (CON FECHA SIEMPRE HOY) */}
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#828282", color: "#fff", fontWeight: "bold", padding: "6px 10px", width: "180px", border: "1px solid #71717a" }}>Nombre del Proyecto:</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <input type="text" value={resumenEjecutivo.nombreProyecto} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, nombreProyecto: e.target.value })} style={{ width: "100%", border: "none", outline: "none", fontWeight: "bold" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#828282", color: "#fff", fontWeight: "bold", padding: "6px 10px", border: "1px solid #71717a" }}>Procesos impactados:</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a", display: "flex", justifyContent: "space-between" }}>
                      <input type="text" value={resumenEjecutivo.procesosImpactados} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, procesosImpactados: e.target.value })} style={{ width: "70%", border: "none", outline: "none" }} />
                      <div><strong>Fecha:</strong> {resumenEjecutivo.fecha}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* RESUMEN EJECUTIVO */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Resumen Ejecutivo
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <tbody>
                  <tr>
                    <td rowSpan="3" style={{ background: "#dcfce7", fontWeight: "bold", textAlign: "center", width: "200px", border: "1px solid #71717a", padding: "10px" }}>Conexion con la estrategia</td>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", width: "120px", border: "1px solid #71717a" }}>Indicador N4</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <select value={resumenEjecutivo.indicadorN4} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, indicadorN4: e.target.value, indicadorN3: INDICADORES_ESTRATEGICOS.find((i) => i.n4 === e.target.value)?.n3 || "" })} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontWeight: "bold" }}>
                        {listaN4.map((n4Val, idx) => (
                          <option key={idx} value={n4Val}>{n4Val}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", border: "1px solid #71717a" }}>Indicador N3</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <select value={resumenEjecutivo.indicadorN3} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, indicadorN3: e.target.value })} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}>
                        {listaN3.map((n3Val, idx) => (
                          <option key={idx} value={n3Val}>{n3Val}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", border: "1px solid #71717a" }}>Causas</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <textarea rows="2" value={resumenEjecutivo.causas} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, causas: e.target.value })} style={{ width: "100%", border: "none", outline: "none", fontFamily: "inherit" }} />
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan="3" style={{ background: "#dcfce7", fontWeight: "bold", textAlign: "center", border: "1px solid #71717a", padding: "10px" }}>Necesidad de Mejora</td>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", border: "1px solid #71717a" }}>Estado actual</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <textarea rows="2" value={resumenEjecutivo.estadoActual} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, estadoActual: e.target.value })} style={{ width: "100%", border: "none", outline: "none", fontFamily: "inherit" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", border: "1px solid #71717a" }}>Estado deseado</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <textarea rows="2" value={resumenEjecutivo.estadoDeseado} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, estadoDeseado: e.target.value })} style={{ width: "100%", border: "none", outline: "none", fontFamily: "inherit" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#e4e4e7", padding: "6px 10px", border: "1px solid #71717a" }}>Brecha (GAP)</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <textarea rows="2" value={resumenEjecutivo.brechaGap} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, brechaGap: e.target.value })} style={{ flex: "1", border: "none", outline: "none", fontFamily: "inherit" }} />
                        <div style={{ borderLeft: "1px solid #71717a", paddingLeft: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Sentido óptimo</span>
                          <select value={resumenEjecutivo.sentidoOptimo} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, sentidoOptimo: e.target.value })} style={{ padding: "4px", border: "1px solid #71717a" }}>
                            <option value="Ascendente">Ascendente ⬆</option>
                            <option value="Descendente">Descendente ⬇</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#dcfce7", fontWeight: "bold", textAlign: "center", border: "1px solid #71717a", padding: "10px" }}>Alcance</td>
                    <td colSpan="2" style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <textarea rows="3" value={resumenEjecutivo.alcance} onChange={(e) => setResumenEjecutivo({ ...resumenEjecutivo, alcance: e.target.value })} style={{ width: "100%", border: "none", outline: "none", fontFamily: "inherit" }} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* CÉLULA DE TRABAJO */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Célula de trabajo
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#dcfce7", fontWeight: "bold", width: "200px", border: "1px solid #71717a", padding: "6px 10px" }}>Sponsor</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <input type="text" placeholder="Nombre del Sponsor" value={celula.sponsor} onChange={(e) => setCelula({ ...celula, sponsor: e.target.value })} style={{ width: "100%", border: "none", outline: "none" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#dcfce7", fontWeight: "bold", border: "1px solid #71717a", padding: "6px 10px" }}>Líder</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <input type="text" placeholder="Líderes asignados" value={celula.lider} onChange={(e) => setCelula({ ...celula, lider: e.target.value })} style={{ width: "100%", border: "none", outline: "none" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: "#dcfce7", fontWeight: "bold", border: "1px solid #71717a", padding: "6px 10px" }}>Equipo</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <input type="text" placeholder="Integrantes del equipo" value={celula.equipo} onChange={(e) => setCelula({ ...celula, equipo: e.target.value })} style={{ width: "100%", border: "none", outline: "none" }} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PLAN DE TRABAJO - ALTO NIVEL */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Plan de Trabajo - Alto nivel
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.8rem", textAlign: "center", marginBottom: "1rem" }}>
                <thead>
                  <tr style={{ background: "#e4e4e7" }}>
                    <th style={{ border: "1px solid #71717a", padding: "6px", width: "220px" }}>Etapa / Fase</th>
                    {Array.from({ length: 12 }, (_, i) => (
                      <th key={i} style={{ border: "1px solid #71717a", padding: "6px" }}>M{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planTrabajo.map((fase, fIndex) => (
                    <tr key={fIndex}>
                      <td style={{ border: "1px solid #71717a", padding: "4px" }}>
                        <input
                          type="text"
                          value={fase.nombre}
                          placeholder={fase.placeholder}
                          onChange={(e) => handleFaseNombreChange(fIndex, e.target.value)}
                          style={{ width: "100%", border: "none", outline: "none", fontWeight: "bold", background: "transparent" }}
                        />
                      </td>
                      {fase.meses.map((activo, mIndex) => (
                        <td key={mIndex} onClick={() => togglePlanMes(fIndex, mIndex)} style={{ border: "1px solid #71717a", padding: "6px", cursor: "pointer", backgroundColor: activo ? "#a1a1aa" : "transparent" }}>
                          {activo ? "✓" : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* FLUJO DE CAJA */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Flujo de Caja
              </div>
              <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.75rem", textAlign: "center" }}>
                  <thead>
                    <tr style={{ background: "#e4e4e7" }}>
                      <th style={{ border: "1px solid #71717a", padding: "6px", width: "220px", textAlign: "left" }}>(-) Egresos (+) Ingresos (=) Resultado</th>
                      {Array.from({ length: 12 }, (_, i) => (
                        <th key={i} style={{ border: "1px solid #71717a", padding: "6px" }}>M{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #71717a", padding: "6px", fontWeight: "bold", textAlign: "left" }}>(-) Costo de Operación (Opex)</td>
                      {flujoCaja.opex.map((val, idx) => (
                        <td key={idx} style={{ border: "1px solid #71717a", padding: "2px" }}>
                          <input type="number" value={val === 0 ? "" : val} placeholder="0" onChange={(e) => handleFlujoChange("opex", idx, e.target.value)} style={{ width: "60px", border: "none", textAlign: "center", fontSize: "0.75rem" }} />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #71717a", padding: "6px", fontWeight: "bold", textAlign: "left" }}>(+) Retorno del Negocio</td>
                      {flujoCaja.retorno.map((val, idx) => (
                        <td key={idx} style={{ border: "1px solid #71717a", padding: "2px" }}>
                          <input type="number" value={val === 0 ? "" : val} placeholder="0" onChange={(e) => handleFlujoChange("retorno", idx, e.target.value)} style={{ width: "60px", border: "none", textAlign: "center", fontSize: "0.75rem" }} />
                        </td>
                      ))}
                    </tr>
                    <tr style={{ background: "#f4f4f5", fontWeight: "bold" }}>
                      <td style={{ border: "1px solid #71717a", padding: "6px", textAlign: "left" }}>(=) Flujo Operativo Neto</td>
                      {calculosFinancieros.flujoOperativoNeto.map((val, idx) => (
                        <td key={idx} style={{ border: "1px solid #71717a", padding: "6px" }}>${val.toLocaleString("es-CO")}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #71717a", padding: "6px", fontWeight: "bold", textAlign: "left" }}>(-) Inversión Inicial (Capex)</td>
                      {flujoCaja.capex.map((val, idx) => (
                        <td key={idx} style={{ border: "1px solid #71717a", padding: "2px" }}>
                          <input type="number" value={val === 0 ? "" : val} placeholder="0" onChange={(e) => handleFlujoChange("capex", idx, e.target.value)} style={{ width: "60px", border: "none", textAlign: "center", fontSize: "0.75rem" }} />
                        </td>
                      ))}
                    </tr>
                    <tr style={{ background: "#ffedd5", fontWeight: "bold" }}>
                      <td style={{ border: "1px solid #71717a", padding: "6px", textAlign: "left" }}>(=) Beneficio Neto Acumulado (Payback)</td>
                      {calculosFinancieros.beneficioNetoAcumulado.map((val, idx) => (
                        <td key={idx} style={{ border: "1px solid #71717a", padding: "6px", color: val < 0 ? "#c2410c" : "#15803d" }}>
                          ${val.toLocaleString("es-CO")}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TABLA MÉTRICAS DINÁMICAS */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Tiempo de Retorno de Inversión (ROI & Payback)
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#e4e4e7", fontWeight: "bold", width: "200px", border: "1px solid #71717a", padding: "6px 10px" }}>Retorno de Inversión (ROI)</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a", fontWeight: "bold", color: "#15803d" }}>
                      {calculosFinancieros.roi}%
                    </td>
                    <td style={{ background: "#e4e4e7", fontWeight: "bold", width: "200px", border: "1px solid #71717a", padding: "6px 10px" }}>Periodo Recuperación (Payback)</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a", fontWeight: "bold", color: "#0284c7" }}>
                      {calculosFinancieros.paybackMes}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* APORTE A LA ESTRATEGIA */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Aporte a la estrategia y Sostenibilidad
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#dcfce7", fontWeight: "bold", width: "200px", border: "1px solid #71717a", padding: "6px 10px" }}>Índice de sostenibilidad</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #71717a" }}>
                      <textarea
                        rows="2"
                        value={indiceSostenibilidad}
                        onChange={(e) => setIndiceSostenibilidad(e.target.value)}
                        placeholder="Se debe realizar la medición del índice de sostenibilidad, como se indica en la matriz adjunta"
                        style={{ width: "100%", border: "none", outline: "none", fontFamily: "inherit", fontStyle: "italic", color: "#1d4ed8" }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* APROBACIONES */}
              <div style={{ background: "#dcfce7", color: "#000", textAlign: "center", fontWeight: "bold", padding: "6px", border: "1px solid #71717a", borderBottom: "none" }}>
                Aprobaciones
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #71717a", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                <tbody>
                  <tr>
                    <td style={{ background: "#e4e4e7", fontWeight: "bold", textAlign: "center", width: "50%", padding: "6px", border: "1px solid #71717a" }}>Sponsor</td>
                    <td style={{ background: "#e4e4e7", fontWeight: "bold", textAlign: "center", width: "50%", padding: "6px", border: "1px solid #71717a" }}>Líder de Proyecto</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", border: "1px solid #71717a", textAlign: "center" }}>
                      <input type="text" placeholder="Firma / Nombre Sponsor" value={aprobaciones.nombreSponsor} onChange={(e) => setAprobaciones({ ...aprobaciones, nombreSponsor: e.target.value })} style={{ width: "90%", padding: "4px", border: "1px solid #cbd5e1", textAlign: "center" }} />
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #71717a", textAlign: "center" }}>
                      <input type="text" placeholder="Firma / Nombre Líder" value={aprobaciones.nombreLider} onChange={(e) => setAprobaciones({ ...aprobaciones, nombreLider: e.target.value })} style={{ width: "90%", padding: "4px", border: "1px solid #cbd5e1", textAlign: "center" }} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* BOTÓN DE GUARDADO DINÁMICO */}
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={handleGuardarProyecto}
                  disabled={!casoDeNegocioCompleto || savingProject}
                  style={{
                    padding: "0.8rem 2rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: casoDeNegocioCompleto ? "#15803d" : "#475569",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: casoDeNegocioCompleto ? "pointer" : "not-allowed",
                    boxShadow: casoDeNegocioCompleto ? "0 4px 10px rgba(0,0,0,0.2)" : "none",
                    transition: "all 0.3s ease"
                  }}
                >
                  {savingProject
                    ? "💾 Guardando en MongoDB Atlas..."
                    : casoDeNegocioCompleto
                    ? "💾 Guardar Caso de Negocio en MongoDB Atlas"
                    : "🔒 Complete todas las secciones del Caso de Negocio para Guardar"}
                </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === "simulacion" && (
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "10px", border: "1px solid #334155" }}>
            <h3>🎲 Simulación Monte Carlo</h3>
            <p style={{ color: "#94a3b8" }}>Motor probabilístico para cálculo de riesgos y rentabilidad.</p>
          </div>
        )}

        {/* TAB DE ADMINISTRADOR */}
        {activeTab === "usuarios" && user.rol === "Administrador" && (
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "10px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>👥 Usuarios Registrados en TrueNorte</h3>
              <button onClick={fetchUsers} style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #38bdf8", background: "transparent", color: "#38bdf8", cursor: "pointer" }}>
                🔄 Actualizar
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                  <th style={{ padding: "0.75rem" }}>Nombre</th>
                  <th style={{ padding: "0.75rem" }}>Correo</th>
                  <th style={{ padding: "0.75rem" }}>Origen</th>
                  <th style={{ padding: "0.75rem" }}>Rol Actual</th>
                  <th style={{ padding: "0.75rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{u.nombre}</td>
                    <td style={{ padding: "0.75rem", color: "#94a3b8" }}>{u.email}</td>
                    <td style={{ padding: "0.75rem" }}>{u.provider === "google" ? "🌐 Google" : "✉️ Email"}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", backgroundColor: u.rol === "Administrador" ? "rgba(245, 158, 11, 0.2)" : "rgba(56, 189, 248, 0.2)", color: u.rol === "Administrador" ? "#f59e0b" : "#38bdf8" }}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <select value={u.rol} onChange={(e) => handleRoleChange(u._id, e.target.value)} style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", background: "#0f172a", color: "#fff", border: "1px solid #334155" }}>
                        <option value="Analista">Analista</option>
                        <option value="Líder de Proyecto">Líder de Proyecto</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}