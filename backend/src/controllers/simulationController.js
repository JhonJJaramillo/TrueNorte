const Project = require("../models/Project");

// Generador con Distribución Triangular (Mínimo, Más Probable, Máximo)
const randomTriangular = (min, mode, max) => {
  const u = Math.random();
  const F = (mode - min) / (max - min);
  if (u < F) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
};

exports.runMonteCarlo = async (req, res) => {
  try {
    const {
      projectId,
      capexBaseInput,
      opexBaseInput,
      retornoBaseInput,
      variacionCapex = 15,   // % volatilidad
      variacionOpex = 10,    // % volatilidad
      variacionRetorno = 20, // % volatilidad
      iterations = 5000      // iteraciones
    } = req.body;

    let capexBase = parseFloat(capexBaseInput) || 0;
    let opexBase = parseFloat(opexBaseInput) || 0;
    let retornoBase = parseFloat(retornoBaseInput) || 0;
    let projectName = "Simulación Manual / Personalizada";

    // Si viene un projectId, leemos los datos reales guardados en MongoDB Atlas
    if (projectId) {
      const projectDoc = await Project.findById(projectId);
      if (projectDoc && projectDoc.flujoCaja) {
        const fc = projectDoc.flujoCaja;
        capexBase = (fc.capex || []).reduce((a, b) => a + Number(b || 0), 0);
        opexBase = (fc.opex || []).reduce((a, b) => a + Number(b || 0), 0);
        retornoBase = (fc.retorno || []).reduce((a, b) => a + Number(b || 0), 0);
        projectName = projectDoc.resumenEjecutivo?.nombreProyecto || "Caso de Negocio seleccionado";
      }
    }

    if (capexBase === 0 && opexBase === 0 && retornoBase === 0) {
      return res.status(400).json({
        error: "El proyecto seleccionado o los valores ingresados no tienen flujo de caja financiero registrado."
      });
    }

    const rois = [];
    let exitos = 0;
    let perdidas = 0;

    // Calculamos rangos min/max para la simulación estocástica
    const capexMin = capexBase * (1 - variacionCapex / 100);
    const capexMax = capexBase * (1 + variacionCapex / 100);

    const opexMin = opexBase * (1 - variacionOpex / 100);
    const opexMax = opexBase * (1 + variacionOpex / 100);

    const retornoMin = retornoBase * (1 - variacionRetorno / 100);
    const retornoMax = retornoBase * (1 + variacionRetorno / 100);

    // Bucle Monte Carlo
    for (let i = 0; i < iterations; i++) {
      const simCapex = randomTriangular(capexMin, capexBase, capexMax);
      const simOpex = randomTriangular(opexMin, opexBase, opexMax);
      const simRetorno = randomTriangular(retornoMin, retornoBase, retornoMax);

      const beneficioNeto = simRetorno - simOpex - simCapex;
      const simRoi = simCapex > 0 ? (beneficioNeto / simCapex) * 100 : 0;

      rois.push(simRoi);

      if (simRoi >= 0) exitos++;
      else perdidas++;
    }

    // Ordenar para percentiles
    rois.sort((a, b) => a - b);

    const sumaRoi = rois.reduce((a, b) => a + b, 0);
    const meanRoi = sumaRoi / iterations;

    const variance = rois.reduce((acc, val) => acc + Math.pow(val - meanRoi, 2), 0) / iterations;
    const stdDev = Math.sqrt(variance);

    const p10 = rois[Math.floor(iterations * 0.10)];
    const p50 = rois[Math.floor(iterations * 0.50)];
    const p90 = rois[Math.floor(iterations * 0.90)];

    const probabilidadExito = ((exitos / iterations) * 100).toFixed(1);
    const probabilidadPerdida = ((perdidas / iterations) * 100).toFixed(1);

    // Construcción del Histograma / Campana de Gauss (15 Barras / Bins)
    const minRoi = rois[0];
    const maxRoi = rois[rois.length - 1];
    const numBins = 15;
    const binSize = (maxRoi - minRoi) / numBins;

    const histogram = Array(numBins).fill(0).map((_, idx) => {
      const rMin = minRoi + idx * binSize;
      const rMax = minRoi + (idx + 1) * binSize;
      return {
        binIndex: idx,
        rangoLabel: `${rMin.toFixed(0)}% a ${rMax.toFixed(0)}%`,
        rangoMid: parseFloat(((rMin + rMax) / 2).toFixed(1)),
        frecuencia: 0,
        esGanancia: (rMin + rMax) / 2 >= 0
      };
    });

    rois.forEach((r) => {
      let binIdx = Math.floor((r - minRoi) / binSize);
      if (binIdx >= numBins) binIdx = numBins - 1;
      histogram[binIdx].frecuencia++;
    });

    const maxFrecuencia = Math.max(...histogram.map(h => h.frecuencia));

    return res.status(200).json({
      projectName,
      lineaBase: { capexBase, opexBase, retornoBase },
      iterations,
      metricas: {
        meanRoi: meanRoi.toFixed(2),
        stdDev: stdDev.toFixed(2),
        p10: p10.toFixed(2),
        p50: p50.toFixed(2),
        p90: p90.toFixed(2),
        probabilidadExito,
        probabilidadPerdida
      },
      histogram,
      maxFrecuencia
    });

  } catch (error) {
    console.error("Error en simulación Monte Carlo:", error);
    return res.status(500).json({ error: "Error interno al ejecutar la simulación." });
  }
};
