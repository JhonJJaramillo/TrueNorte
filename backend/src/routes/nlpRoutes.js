const express = require("express");
const router = express.Router();
const { analyzeText } = require("../controllers/nlpController");

router.post("/analyze", analyzeText);

module.exports = router;
