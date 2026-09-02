const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/health');
const requisitionRoutes = require('./routes/requisitions');
const forecastRoutes = require('./routes/forecast');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & Utility Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Enterprise-standard request logging

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/v1/requisitions', requisitionRoutes);
app.use('/api/v1/forecast', forecastRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`✌️ KargoSetu Backend (Node.js/Express)`);
    console.log(`==========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`- Health Check: GET /api/health`);
    console.log(`- Constraint Solver: POST /api/v1/requisitions/evaluate`);
    console.log(`- ML Forecast: GET /api/v1/forecast/rates`);
});