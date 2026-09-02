const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ status: 'active', service: 'KargoSetu API', timestamp: new Date() });
});

module.exports = router;