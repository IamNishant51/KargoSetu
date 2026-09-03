const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.json(['Iron Ore', 'Coal', 'Grain', 'Bauxite', 'Limestone']);
});

module.exports = router;
