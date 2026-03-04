const express = require('express');
const { getPool, sql } = require('../config/db');

const router = express.Router();

function logVenta(step, payload) {
  console.log(`[ventas] ${step}`, payload);
}

function getPaginationParams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

async function getNextFacturaNumber(request) {
  const result = await request.query(`
    SELECT TOP 1 idFactura, noFactura
    FROM Factura
    ORDER BY idFactura DESC
  `);

  const lastFactura = result.recordset[0];
  const nextSequence = (lastFactura?.idFactura || 0) + 1;

  return `FAC-${String(nextSequence).padStart(6, '0')}`;
}

router.get('/next-number', async (req, res) => {
  try {
    const pool = await getPool();
    const noFactura = await getNextFacturaNumber(pool.request());
    logVenta('correlativo:resultado', { noFactura });

    return res.json({ noFactura });
  } catch (error) {
    logVenta('correlativo:error', { error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page, pageSize, offset } = getPaginationParams(req.query);
    logVenta('listado:inicio', { page, pageSize });
    const pool = await getPool();
    const countResult = await pool.request().query(`
      SELECT COUNT(1) AS total
      FROM Factura
    `);
    const result = await pool.request().query(`
      SELECT
        f.idFactura AS id,
        f.noFactura,
        CONVERT(varchar(10), f.fecha, 23) AS fecha,
        LTRIM(RTRIM(CONCAT(p.nombres, ' ', p.apellidos))) AS persona,
        h.nombre AS hospital,
        f.Total AS total,
        COUNT(fd.idFacturaDetalle) AS totalProductos
      FROM Factura f
      INNER JOIN Persona p
        ON p.idPersona = f.idPersona
      INNER JOIN Hospital h
        ON h.idHospital = f.idHospital
      LEFT JOIN FacturaDetalle fd
        ON fd.idFactura = f.idFactura
      GROUP BY f.idFactura, f.noFactura, f.fecha, p.nombres, p.apellidos, h.nombre, f.Total
      ORDER BY f.idFactura DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `);

    const total = countResult.recordset[0].total;
    logVenta('listado:resultado', { page, pageSize, returned: result.recordset.length, total });
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
    logVenta('listado:error', { error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.get('/:idFactura/detalle', async (req, res) => {
  const idFactura = Number(req.params.idFactura);
  logVenta('detalle:request', { idFactura });

  if (!idFactura) {
    return res.status(400).json({
      ok: false,
      error: 'El idFactura es obligatorio.',
    });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('idFactura', sql.Int, idFactura)
      .query(`
        SELECT
          fd.idFacturaDetalle AS id,
          p.nombre AS nombreProducto,
          fd.cantidad,
          fd.precioUnitario,
          fd.total
        FROM FacturaDetalle fd
        INNER JOIN Producto p
          ON p.idProducto = fd.idProducto
        WHERE fd.idFactura = @idFactura
        ORDER BY fd.idFacturaDetalle
      `);

    logVenta('detalle:resultado', {
      idFactura,
      total: result.recordset.length,
      detalle: result.recordset,
    });
    return res.json(result.recordset);
  } catch (error) {
    logVenta('detalle:error', { idFactura, error: error.message });
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  const { noFactura, fecha, idPersona, idHospital, productos } = req.body;
  logVenta('crear:payload-recibido', { noFactura, fecha, idPersona, idHospital, productos });

  if (!fecha || !idPersona || !idHospital || !Array.isArray(productos) || productos.length === 0) {
    logVenta('crear:validacion-error', {
      motivo: 'payload-incompleto',
      noFactura,
      fecha,
      idPersona,
      idHospital,
      productos,
    });
    return res.status(400).json({
      ok: false,
      error: 'Debes enviar fecha, idPersona, idHospital y al menos un producto.',
    });
  }

  const normalizedProducts = productos
    .map((producto) => ({
      idProducto: Number(producto?.idProducto),
      cantidad: Number(producto?.cantidad ?? 1),
    }))
    .filter((producto) => producto.idProducto && producto.cantidad > 0);

  logVenta('crear:productos-normalizados', { normalizedProducts });

  if (normalizedProducts.length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'La lista de productos no es valida.',
    });
  }

  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const generatedNoFactura = noFactura || (await getNextFacturaNumber(transaction.request()));
    logVenta('crear:transaction-begin', {
      noFactura: generatedNoFactura,
      fecha,
      idPersona: Number(idPersona),
      idHospital: Number(idHospital),
    });

    const productosConPrecio = [];

    for (const producto of normalizedProducts) {
      const productResult = await transaction
        .request()
        .input('idProducto', sql.Int, producto.idProducto)
        .query(`
          SELECT TOP 1 idProducto, nombre, Precio
          FROM Producto
          WHERE idProducto = @idProducto
        `);

      const productRecord = productResult.recordset[0];
      logVenta('crear:producto-encontrado', { idProducto: producto.idProducto, productRecord });

      if (!productRecord) {
        throw new Error(`El producto ${producto.idProducto} no existe.`);
      }

      productosConPrecio.push({
        idProducto: productRecord.idProducto,
        nombre: productRecord.nombre,
        cantidad: producto.cantidad,
        precioUnitario: Number(productRecord.Precio || 0),
        total: Number(productRecord.Precio || 0) * producto.cantidad,
      });
    }

    const totalFactura = productosConPrecio.reduce((sum, producto) => sum + producto.total, 0);
    logVenta('crear:totales', { productosConPrecio, totalFactura });

    const facturaResult = await transaction
      .request()
      .input('noFactura', sql.VarChar(50), generatedNoFactura)
      .input('fecha', sql.DateTime2, new Date(fecha))
      .input('total', sql.Decimal(18, 2), totalFactura)
      .input('idPersona', sql.Int, Number(idPersona))
      .input('idHospital', sql.Int, Number(idHospital))
      .query(`
        INSERT INTO Factura (noFactura, fecha, Total, idPersona, idHospital)
        OUTPUT INSERTED.idFactura
        VALUES (@noFactura, @fecha, @total, @idPersona, @idHospital)
      `);

    const idFactura = facturaResult.recordset[0].idFactura;
    logVenta('crear:factura-creada', { idFactura, noFactura: generatedNoFactura });

    for (const producto of productosConPrecio) {
      logVenta('crear:insert-detalle', {
        tabla: 'FacturaDetalle',
        valores: {
          idFactura,
          idProducto: producto.idProducto,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
      });

      await transaction
        .request()
        .input('idFactura', sql.Int, idFactura)
        .input('idProducto', sql.Int, producto.idProducto)
        .input('cantidad', sql.Int, producto.cantidad)
        .input('precioUnitario', sql.Decimal(18, 2), producto.precioUnitario)
        .input('total', sql.Decimal(18, 2), producto.total)
        .query(`
          INSERT INTO FacturaDetalle (idFactura, idProducto, cantidad, precioUnitario, total)
          VALUES (@idFactura, @idProducto, @cantidad, @precioUnitario, @total)
        `);
    }

    await transaction.commit();
    logVenta('crear:transaction-commit', { idFactura, totalFactura });

    return res.status(201).json({
      ok: true,
      idFactura,
      noFactura: generatedNoFactura,
      total: totalFactura,
      message: 'Venta creada correctamente.',
    });
  } catch (error) {
    if (transaction) {
      logVenta('crear:transaction-rollback', { error: error.message });
      await transaction.rollback();
    }

    logVenta('crear:error', {
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
