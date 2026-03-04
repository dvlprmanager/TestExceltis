const express = require('express');
const { getPool } = require('../config/db');

const router = express.Router();

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(query) {
  const today = new Date();
  const dateTo = query.dateTo ? new Date(query.dateTo) : today;
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(today);

  if (!query.dateFrom) {
    dateFrom.setDate(today.getDate() - 89);
  }

  return {
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo),
  };
}

router.get('/', async (req, res) => {
  try {
    const { dateFrom, dateTo } = getDateRange(req.query);
    const pool = await getPool();

    const [pieResult, visitsTrendResult, salesTrendResult, summaryResult, bonusByPersonResult, salesByCountryResult] = await Promise.all([
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          h.idHospital,
          h.nombre AS hospital,
          ISNULL(v.visitas, 0) AS visitas,
          ISNULL(fc.facturas, 0) AS facturas
        FROM Hospital h
        LEFT JOIN (
          SELECT
            vm.idHospital,
            COUNT(vm.idVisitaMedica) AS visitas
          FROM VisitaMedica vm
          WHERE CONVERT(date, COALESCE(vm.fechaCreado, GETDATE())) BETWEEN @dateFrom AND @dateTo
          GROUP BY vm.idHospital
        ) v
          ON v.idHospital = h.idHospital
        LEFT JOIN (
          SELECT
            f.idHospital,
            COUNT(f.idFactura) AS facturas
          FROM Factura f
          WHERE CONVERT(date, f.fecha) BETWEEN @dateFrom AND @dateTo
          GROUP BY f.idHospital
        ) fc
          ON fc.idHospital = h.idHospital
        ORDER BY ISNULL(v.visitas, 0) DESC, ISNULL(fc.facturas, 0) DESC, h.nombre
      `),
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          CONVERT(date, COALESCE(vm.fechaCreado, GETDATE())) AS fecha,
          COUNT(vm.idVisitaMedica) AS visitas
        FROM VisitaMedica vm
        WHERE CONVERT(date, COALESCE(vm.fechaCreado, GETDATE())) BETWEEN @dateFrom AND @dateTo
        GROUP BY CONVERT(date, COALESCE(vm.fechaCreado, GETDATE()))
      `),
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          CONVERT(date, f.fecha) AS fecha,
          SUM(f.Total) AS ventas
        FROM Factura f
        WHERE CONVERT(date, f.fecha) BETWEEN @dateFrom AND @dateTo
        GROUP BY CONVERT(date, f.fecha)
      `),
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          (
            SELECT COUNT(1)
            FROM VisitaMedica
            WHERE CONVERT(date, COALESCE(fechaCreado, GETDATE())) BETWEEN @dateFrom AND @dateTo
          ) AS totalVisitas,
          (
            SELECT ISNULL(SUM(Total), 0)
            FROM Factura
            WHERE CONVERT(date, fecha) BETWEEN @dateFrom AND @dateTo
          ) AS ventasRango,
          (
            SELECT COUNT(1)
            FROM Factura
            WHERE CONVERT(date, fecha) BETWEEN @dateFrom AND @dateTo
          ) AS totalVentas
      `),
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          p.idPersona AS idPersona,
          LTRIM(RTRIM(CONCAT(p.nombres, ' ', p.apellidos))) AS persona,
          COUNT(f.idFactura) AS totalFacturas,
          ISNULL(SUM(f.Total), 0) AS ventaReal
        FROM Persona p
        LEFT JOIN Factura f
          ON f.idPersona = p.idPersona
          AND CONVERT(date, f.fecha) BETWEEN @dateFrom AND @dateTo
        GROUP BY p.idPersona, p.nombres, p.apellidos
        ORDER BY ventaReal DESC, persona
      `),
      pool.request()
        .input('dateFrom', dateFrom)
        .input('dateTo', dateTo)
        .query(`
        SELECT
          pa.Abreviatura AS pais,
          ISNULL(SUM(f.Total), 0) AS ventas
        FROM Pais pa
        LEFT JOIN Hospital h
          ON h.idPais = pa.idPais
        LEFT JOIN Factura f
          ON f.idHospital = h.idHospital
          AND CONVERT(date, f.fecha) BETWEEN @dateFrom AND @dateTo
        GROUP BY pa.Abreviatura
        ORDER BY ventas DESC, pa.Abreviatura
      `),
    ]);

    const visitsMap = new Map(
      visitsTrendResult.recordset.map((item) => [formatDate(new Date(item.fecha)), Number(item.visitas || 0)])
    );
    const salesMap = new Map(
      salesTrendResult.recordset.map((item) => [formatDate(new Date(item.fecha)), Number(item.ventas || 0)])
    );

    const trendData = [];
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
      const dateKey = formatDate(current);

      trendData.push({
        date: dateKey,
        ventas: salesMap.get(dateKey) || 0,
        visitas: visitsMap.get(dateKey) || 0,
      });
    }

    return res.json({
      summary: {
        totalVisitas: Number(summaryResult.recordset[0].totalVisitas || 0),
        ventasRango: Number(summaryResult.recordset[0].ventasRango || 0),
        totalVentas: Number(summaryResult.recordset[0].totalVentas || 0),
      },
      filters: {
        dateFrom,
        dateTo,
      },
      pieData: pieResult.recordset.map((item) => ({
        idHospital: item.idHospital,
        hospital: item.hospital,
        visitas: Number(item.visitas || 0),
        facturas: Number(item.facturas || 0),
      })),
      bonusByPerson: bonusByPersonResult.recordset.map((item) => ({
        idPersona: item.idPersona,
        persona: item.persona,
        totalFacturas: Number(item.totalFacturas || 0),
        ventaReal: Number(item.ventaReal || 0),
      })),
      salesByCountry: salesByCountryResult.recordset.map((item) => ({
        pais: item.pais,
        ventas: Number(item.ventas || 0),
      })),
      trendData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;
