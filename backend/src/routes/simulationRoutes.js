const express = require("express");
const router = express.Router();
const simulationController = require("../controllers/simulationController");

router.post("/monte-carlo", simulationController.runMonteCarlo);

module.exports = router;
