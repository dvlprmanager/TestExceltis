const express = require('express');
const { getPool, sql } = require('../config/db');

const router = express.Router();

function logVisita(step, payload) {
  console.log(`[visitas] ${step}`, payload);
}

function getPaginationParams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

router.get('/', async (req, res) => {
  try {
    const { page, pageSize, offset } = getPaginationParams(req.query);
    logVisita('listado:inicio', { page, pageSize });
    const pool = await getPool();
    const countResult = await pool.request().query(`
      SELECT COUNT(1) AS total
      FROM VisitaMedica
    `);
    const result = await pool.request().query(`
      SELECT
        vm.idVisitaMedica AS id,
        LTRIM(RTRIM(CONCAT(p.nombres, ' ', p.apellidos))) AS persona,
        h.nombre AS hospital,
        COUNT(dvm.idDetalleVisitaMedica) AS totalProductos
      FROM VisitaMedica vm
      INNER JOIN Persona p
        ON p.idPersona = vm.idPersona
      INNER JOIN Hospital h
        ON h.idHospital = vm.idHospital
      LEFT JOIN DetalleVisitaMedica dvm
        ON dvm.idVisitaMedica = vm.idVisitaMedica
      GROUP BY vm.idVisitaMedica, p.nombres, p.apellidos, h.nombre
      ORDER BY vm.idVisitaMedica DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `);

    const total = countResult.recordset[0].total;
    logVisita('listado:resultado', { page, pageSize, returned: result.recordset.length, total });
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
    logVisita('listado:error', { error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.get('/:idVisitaMedica/detalle', async (req, res) => {
  const idVisitaMedica = Number(req.params.idVisitaMedica);
  logVisita('detalle:request', { idVisitaMedica });

  if (!idVisitaMedica) {
    return res.status(400).json({
      ok: false,
      error: 'El idVisitaMedica es obligatorio.',
    });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('idVisitaMedica', sql.Int, idVisitaMedica)
      .query(`
        SELECT
          dvm.idDetalleVisitaMedica AS id,
          p.nombre AS nombreProducto,
          ISNULL(dvm.cantidad, 0) AS cantidad,
          ISNULL(p.Precio, 0) AS precio
        FROM DetalleVisitaMedica dvm
        INNER JOIN Producto p
          ON p.idProducto = dvm.idProducto
        WHERE dvm.idVisitaMedica = @idVisitaMedica
        ORDER BY dvm.idDetalleVisitaMedica
      `);

    logVisita('detalle:resultado', {
      idVisitaMedica,
      total: result.recordset.length,
      detalle: result.recordset,
    });

    return res.json(result.recordset);
  } catch (error) {
    logVisita('detalle:error', { idVisitaMedica, error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.get('/inventario/:idPersona', async (req, res) => {
  const idPersona = Number(req.params.idPersona);
  logVisita('inventario:request', { idPersona });

  if (!idPersona) {
    logVisita('inventario:validacion-error', { idPersona });
    return res.status(400).json({
      ok: false,
      error: 'El idPersona es obligatorio.',
    });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('idPersona', sql.Int, idPersona)
      .query(`
        SELECT
          ip.idInventarioPersona AS idInventarioPersona,
          ip.idProducto,
          p.nombre AS nombre,
          ip.cantidad
        FROM InventarioPersona ip
        INNER JOIN Producto p
          ON p.idProducto = ip.idProducto
        WHERE ip.idPersona = @idPersona
          AND ip.cantidad > 0
        ORDER BY p.nombre, ip.idProducto
      `);

    logVisita('inventario:resultado', {
      idPersona,
      total: result.recordset.length,
      productos: result.recordset,
    });
    return res.json(result.recordset);
  } catch (error) {
    logVisita('inventario:error', { idPersona, error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  const { idPersona, idHospital, productos } = req.body;
  logVisita('crear:payload-recibido', { idPersona, idHospital, productos });

  if (!idPersona || !idHospital || !Array.isArray(productos) || productos.length === 0) {
    logVisita('crear:validacion-error', {
      motivo: 'payload-incompleto',
      idPersona,
      idHospital,
      productos,
    });
    return res.status(400).json({
      ok: false,
      error: 'Debes enviar idPersona, idHospital y al menos un producto.',
    });
  }

  const normalizedProducts = productos
    .map((producto) => ({
      idProducto: Number(producto?.idProducto ?? producto),
      cantidad: Number(producto?.cantidad ?? 1),
    }))
    .filter((producto) => producto.idProducto && producto.cantidad > 0);

  logVisita('crear:productos-normalizados', { normalizedProducts });

  if (normalizedProducts.length === 0) {
    logVisita('crear:validacion-error', {
      motivo: 'productos-invalidos',
      productos,
      normalizedProducts,
    });
    return res.status(400).json({
      ok: false,
      error: 'La lista de productos no es valida.',
    });
  }

  const groupedProducts = normalizedProducts.reduce((accumulator, producto) => {
    const existing = accumulator.find((item) => item.idProducto === producto.idProducto);

    if (existing) {
      existing.cantidad += producto.cantidad;
      return accumulator;
    }

    accumulator.push({ ...producto });
    return accumulator;
  }, []);

  logVisita('crear:productos-agrupados', { groupedProducts });

  let transaction;

  try {
    const pool = await getPool();
    logVisita('crear:transaction-begin', { idPersona: Number(idPersona), idHospital: Number(idHospital) });
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    logVisita('crear:insert-visita', {
      tabla: 'VisitaMedica',
      valores: {
        idPersona: Number(idPersona),
        idHospital: Number(idHospital),
      },
    });
    const visitaResult = await transaction
      .request()
      .input('idPersona', sql.Int, Number(idPersona))
      .input('idHospital', sql.Int, Number(idHospital))
      .query(`
        INSERT INTO VisitaMedica (idPersona, idHospital)
        OUTPUT INSERTED.idVisitaMedica
        VALUES (@idPersona, @idHospital)
      `);

    const idVisitaMedica = visitaResult.recordset[0].idVisitaMedica;
    logVisita('crear:visita-creada', { idVisitaMedica });

    for (const producto of groupedProducts) {
      logVisita('crear:consultando-inventario', {
        idPersona: Number(idPersona),
        idProducto: producto.idProducto,
        cantidadSolicitada: producto.cantidad,
      });
      const inventoryResult = await transaction
        .request()
        .input('idPersona', sql.Int, Number(idPersona))
        .input('idProducto', sql.Int, producto.idProducto)
        .query(`
          SELECT TOP 1 idInventarioPersona, cantidad
          FROM InventarioPersona
          WHERE idPersona = @idPersona
            AND idProducto = @idProducto
        `);

      const inventoryRecord = inventoryResult.recordset[0];
      logVisita('crear:inventario-encontrado', {
        idProducto: producto.idProducto,
        inventoryRecord,
      });

      if (!inventoryRecord) {
        logVisita('crear:error-inventario', {
          motivo: 'producto-no-existe-en-inventario',
          idPersona: Number(idPersona),
          idProducto: producto.idProducto,
        });
        throw new Error(`El producto ${producto.idProducto} no existe en el inventario de la persona.`);
      }

      if (inventoryRecord.cantidad < producto.cantidad) {
        logVisita('crear:error-inventario', {
          motivo: 'cantidad-insuficiente',
          idProducto: producto.idProducto,
          disponible: inventoryRecord.cantidad,
          solicitada: producto.cantidad,
        });
        throw new Error(`Cantidad insuficiente para el producto ${producto.idProducto}.`);
      }

      logVisita('crear:insert-detalle', {
        tabla: 'DetalleVisitaMedica',
        valores: {
          idVisitaMedica,
          idProducto: producto.idProducto,
          cantidad: producto.cantidad,
        },
      });
      await transaction
        .request()
        .input('idVisitaMedica', sql.Int, idVisitaMedica)
        .input('idProducto', sql.Int, producto.idProducto)
        .input('cantidad', sql.Int, producto.cantidad)
        .query(`
          INSERT INTO DetalleVisitaMedica (idVisitaMedica, idProducto, cantidad)
          VALUES (@idVisitaMedica, @idProducto, @cantidad)
        `);

      logVisita('crear:inventario-actualizado-por-trigger', {
        idProducto: producto.idProducto,
        idInventarioPersona: inventoryRecord.idInventarioPersona,
        cantidadADescontar: producto.cantidad,
      });
    }

    await transaction.commit();
    logVisita('crear:transaction-commit', { idVisitaMedica, groupedProducts });

    return res.status(201).json({
      ok: true,
      idVisitaMedica,
      message: 'Visita medica creada correctamente.',
    });
  } catch (error) {
    if (transaction) {
      logVisita('crear:transaction-rollback', { error: error.message });
      await transaction.rollback();
    }

    logVisita('crear:error', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;
