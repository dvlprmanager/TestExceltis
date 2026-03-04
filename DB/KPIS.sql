-- Dashboard: visitas y facturas por hospital
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
  WHERE MONTH(COALESCE(vm.fechaCreado, GETDATE())) = 2
  GROUP BY vm.idHospital
) v
  ON v.idHospital = h.idHospital
LEFT JOIN (
  SELECT
    f.idHospital,
    COUNT(f.idFactura) AS facturas
  FROM Factura f
  WHERE MONTH(f.fecha) = 2
  GROUP BY f.idHospital
) fc
  ON fc.idHospital = h.idHospital
ORDER BY ISNULL(v.visitas, 0) DESC, ISNULL(fc.facturas, 0) DESC, h.nombre;

-- Dashboard: visitas por fecha
SELECT
  CONVERT(date, COALESCE(vm.fechaCreado, GETDATE())) AS fecha,
  COUNT(vm.idVisitaMedica) AS visitas
FROM VisitaMedica vm
WHERE MONTH(COALESCE(vm.fechaCreado, GETDATE())) = 2
GROUP BY CONVERT(date, COALESCE(vm.fechaCreado, GETDATE()));

-- Dashboard: ventas por fecha
SELECT
  CONVERT(date, f.fecha) AS fecha,
  SUM(f.Total) AS ventas
FROM Factura f
WHERE MONTH(f.fecha) = 2
GROUP BY CONVERT(date, f.fecha);

-- Dashboard: resumen general
SELECT
  (
    SELECT COUNT(1)
    FROM VisitaMedica
    WHERE MONTH(COALESCE(fechaCreado, GETDATE())) = 2
  ) AS totalVisitas,
  (
    SELECT ISNULL(SUM(Total), 0)
    FROM Factura
    WHERE MONTH(fecha) = 2
  ) AS ventasRango,
  (
    SELECT COUNT(1)
    FROM Factura
    WHERE MONTH(fecha) = 2
  ) AS totalVentas;

-- Dashboard: bono mensual por persona
SELECT
  p.idPersona AS idPersona,
  LTRIM(RTRIM(CONCAT(p.nombres, ' ', p.apellidos))) AS persona,
  COUNT(f.idFactura) AS totalFacturas,
  ISNULL(SUM(f.Total), 0) AS ventaReal
FROM Persona p
LEFT JOIN Factura f
  ON f.idPersona = p.idPersona
  AND MONTH(f.fecha) = 2
GROUP BY p.idPersona, p.nombres, p.apellidos
ORDER BY ventaReal DESC, persona;

-- Dashboard: ventas por pais
SELECT
  pa.Abreviatura AS pais,
  ISNULL(SUM(f.Total), 0) AS ventas
FROM Pais pa
LEFT JOIN Hospital h
  ON h.idPais = pa.idPais
LEFT JOIN Factura f
  ON f.idHospital = h.idHospital
  AND MONTH(f.fecha) = 2
GROUP BY pa.Abreviatura
ORDER BY ventas DESC, pa.Abreviatura;
