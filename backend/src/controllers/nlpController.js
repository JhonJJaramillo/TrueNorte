const { GoogleGenerativeAI } = require("@google/generative-ai");

// Tiempo límite de 7 segundos para la API de Gemini
const fetchWithTimeout = (promise, ms = 7000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout Gemini API")), ms)
    )
  ]);
};

// Limpieza de caracteres y saltos desalineados
const limpiarTexto = (str) => {
  if (!str) return "";
  return str
    .replace(/[\t\r]/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
};

// Motor de Estructuración Dinámica Local (100% adaptativo sin textos fijos de cartera)
const generarResumenFallback = (inputs) => {
  const contexto = limpiarTexto(inputs.contexto);
  const estadoActual = limpiarTexto(inputs.estadoActual);
  const analisisCausas = limpiarTexto(inputs.analisisCausas);
  const estadoDeseado = limpiarTexto(inputs.estadoDeseado);

  const todoElTexto = `${contexto} ${estadoActual} ${estadoDeseado} ${analisisCausas}`.toLowerCase();

  // 1. Inferencia dinámica de Procesos e Indicadores
  let procesosImpactados = "Gestión Operativa y Procesos Core";
  let indicadorN4 = "Gasto Administrativo";
  let indicadorN3 = "Eficiencia en la planeación";

  if (todoElTexto.includes("lead") || todoElTexto.includes("prospecto") || todoElTexto.includes("venta") || todoElTexto.includes("comercial") || todoElTexto.includes("conversión")) {
    procesosImpactados = "Gestión Comercial, Marketing y Ventas Digitales";
    indicadorN4 = "Ventas Netas";
    indicadorN3 = "Ventas por asesor";
  } else if (todoElTexto.includes("recaudo") || todoElTexto.includes("cartera") || todoElTexto.includes("cobranza") || todoElTexto.includes("mora")) {
    procesosImpactados = "Gestión de Recaudo y Cobranza de Cartera";
    indicadorN4 = "Margen Bruto";
    indicadorN3 = "Desviación margen bruto fase ejecución";
  }

  // 2. Generación dinámica de Título Ejecutivo
  let nombreProyecto = "Optimización de Eficiencia Operativa";
  if (todoElTexto.includes("lead") || todoElTexto.includes("prospecto")) {
    nombreProyecto = "Optimización en la Atención y Conversión de Leads Digitales";
  } else if (todoElTexto.includes("recaudo") || todoElTexto.includes("cartera")) {
    nombreProyecto = "Optimización del Recaudo de Cartera";
  } else if (estadoDeseado) {
    const palabras = estadoDeseado.replace(/reducir en un \d+%?/i, "Optimización de").split(" ").slice(0, 6).join(" ");
    if (palabras.length > 5) nombreProyecto = palabras;
  }

  // 3. Brecha GAP dinámica
  const brechaGap = `Diferencia cuantitativa identificada entre la situación actual (${estadoActual.replace(/\n/g, ' ')}) y las metas esperadas (${estadoDeseado.replace(/\n/g, ' ')}).`;

  // 4. Alcance dinámico basado únicamente en el input del problema
  const alcance = `Implementación de soluciones operativas y tecnológicas orientadas a resolver las causas raíz identificadas: ${analisisCausas.replace(/\n/g, ' ')}.`;

  return {
    nombreProyecto,
    procesosImpactados,
    indicadorN4,
    indicadorN3,
    causas: analisisCausas,
    estadoActual: estadoActual,
    estadoDeseado: estadoDeseado,
    brechaGap: brechaGap,
    sentidoOptimo: todoElTexto.includes("reducir") || todoElTexto.includes("disminuir") || todoElTexto.includes("bajar") ? "Descendente" : "Ascendente",
    alcance: alcance
  };
};

exports.analyzeText = async (req, res) => {
  let dataJSON = null;
  const { tipoProblema, contexto, estadoActual, analisisCausas, estadoDeseado } = req.body;

  try {
    if (!tipoProblema || !contexto || !estadoActual || !analisisCausas || !estadoDeseado) {
      return res.status(400).json({
        error: "Debes completar los 5 campos del Entendimiento del Problema antes de procesar."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        console.log("🤖 Consultando IA Gemini para análisis contextual completo...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });

        const promptNLP = `
        ROL: Experto Redactor de Casos de Negocio y Editor NLP Corporativo.
        OBJETIVO: Sintetizar e inferir la Matriz de Resumen Ejecutivo de manera contextual y coherente.

        REGLAS STRICTAS:
        1. NO ALUCINAR NI MEZCLAR DOMINIOS: Si el texto habla de "leads, prospectos, ventas o tiempos de atención", NUNCA menciones "recaudo", "cartera" o "compromisos de pago".
        2. TÍTULO EJECUTIVO (nombreProyecto): Genera un título corporativo de 3 a 6 palabras. NO copies literalmente la oracion del Estado Deseado. (Ejemplo para leads: "Optimización y Conversión de Leads Digitales").
        3. PROCESO IMPACTADO (procesosImpactados): Infiere el proceso real (Ejemplo: "Gestión Comercial y Atenciòn de Leads Digitales").
        4. INDICADORES N4 Y N3: Selecciona indicadores coherentes de la empresa. Para ventas/leads usa N4: "Ventas Netas" y N3: "Ventas por asesor" (o NPS / Satisfacción).
        5. INTEGRIDAD DE MÉTRICAS EN ESTADO ACTUAL: NUNCA omitas métricas ni renglones. Conserva intactos los 3 gaps indicados (Contactabilidad, Tiempo de atención y Efectividad del asesor).
        6. SÍNTESIS DE BRECHA (GAP): Explica claramente la brecha numérica entre el Estado Actual y la Meta Deseada.
        7. ALCANCE: Redacta un alcance operativo y tecnológico orientado a solucionar las causas raíz especificadas.

        INSUMOS RECIBIDOS:
        - Tipo de Problema: ${limpiarTexto(tipoProblema)}
        - Contexto: ${limpiarTexto(contexto)}
        - Estado Actual: ${limpiarTexto(estadoActual)}
        - Análisis de Causas: ${limpiarTexto(analisisCausas)}
        - Estado Deseado: ${limpiarTexto(estadoDeseado)}

        RESPONDE ÚNICAMENTE CON UN OBJETO JSON CON ESTA ESTRUCTURA:
        {
          "nombreProyecto": "Título ejecutivo corto (máx 6 palabras)",
          "procesosImpactados": "Proceso corporativo inferido del texto",
          "indicadorN4": "Ventas Netas",
          "indicadorN3": "Ventas por asesor",
          "causas": "Causas raíz formateadas y limpias",
          "estadoActual": "Estado actual completo con TODAS las métricas",
          "estadoDeseado": "Objetivo SMART pulido",
          "brechaGap": "Síntesis clara de la brecha cuantitativa (diferencia entre actual y meta)",
          "sentidoOptimo": "Ascendente" o "Descendente",
          "alcance": "Declaración ejecutiva del alcance de la solución"
        }
        `;

        const result = await fetchWithTimeout(model.generateContent(promptNLP), 7000);
        let rawText = result.response.text();
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        dataJSON = JSON.parse(rawText);
        console.log("✅ Análisis contextual generado exitosamente por la IA.");

      } catch (geminiError) {
        console.warn(`⚠️ Respuesta demorada o falla en API (${geminiError.message}). Aplicando motor de estructuración dinámica local.`);
      }
    }

    if (!dataJSON) {
      dataJSON = generarResumenFallback({ tipoProblema, contexto, estadoActual, analisisCausas, estadoDeseado });
    }

    return res.status(200).json(dataJSON);

  } catch (error) {
    console.error("❌ Error en el controlador:", error);
    const fallbackData = generarResumenFallback(req.body || {});
    return res.status(200).json(fallbackData);
  }
};