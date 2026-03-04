const express = require('express');
const catalogosRoutes = require('./catalogos.routes');
const dashboardRoutes = require('./dashboard.routes');
const healthRoutes = require('./health.routes');
const ventasRoutes = require('./ventas.routes');
const visitasRoutes = require('./visitas.routes');


const router = express.Router();

router.use('/catalogos', catalogosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/ventas', ventasRoutes);
router.use('/visitas-medicas', visitasRoutes);


module.exports = router;
