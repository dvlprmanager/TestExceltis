const express = require('express');
const { getPool } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');

    res.json({
      ok: true,
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      database: 'disconnected',
      error: error.message,
    });
  }
});

module.exports = router;
