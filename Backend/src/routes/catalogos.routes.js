const express = require('express');
const { getPool } = require('../config/db');

const router = express.Router();

function getPaginationParams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

async function runCatalogQuery(req, res, config) {
  try {
    const { page, pageSize, offset } = getPaginationParams(req.query);
    const pool = await getPool();
    const countResult = await pool.request().query(`
      SELECT COUNT(1) AS total
      FROM ${config.from}
    `);
    const result = await pool.request().query(`
      ${config.select}
      FROM ${config.from}
      ORDER BY ${config.orderBy}
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `);

    const total = countResult.recordset[0].total;

    return res.json({
      data: result.recordset,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}

router.get('/paises', async (req, res) => {
  return runCatalogQuery(
    req,
    res,
    {
      select: `
        SELECT
          idPais AS id,
          nombre
      `,
      from: 'Pais',
      orderBy: 'nombre',
    }
  );
});

router.get('/personas', async (req, res) => {
  return runCatalogQuery(
    req,
    res,
    {
      select: `
        SELECT
          idPersona AS id,
          LTRIM(RTRIM(CONCAT(nombres, ' ', apellidos))) AS nombre
      `,
      from: 'Persona',
      orderBy: "LTRIM(RTRIM(CONCAT(nombres, ' ', apellidos)))",
    }
  );
});

router.get('/hospitales', async (req, res) => {
  return runCatalogQuery(
    req,
    res,
    {
      select: `
        SELECT
          idHospital AS id,
          nombre
      `,
      from: 'Hospital',
      orderBy: 'nombre',
    }
  );
});

router.get('/productos', async (req, res) => {
  return runCatalogQuery(
    req,
    res,
    {
      select: `
        SELECT
          p.idProducto AS id,
          p.nombre,
          p.Precio AS precio
      `,
      from: 'Producto p',
      orderBy: 'p.nombre',
    }
  );
});

module.exports = router;
