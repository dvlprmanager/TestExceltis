CREATE VIEW vw_Hospitales_Mas_Muestras
AS
SELECT
    h.idHospital,
    h.nombre AS Hospital,
    COUNT(DISTINCT vm.idVisitaMedica) AS TotalVisitas,
    SUM(dvm.cantidad) AS TotalMuestras
FROM Hospital h
INNER JOIN VisitaMedica vm
    ON vm.idHospital = h.idHospital
INNER JOIN DetalleVisitaMedica dvm
    ON dvm.idVisitaMedica = vm.idVisitaMedica
GROUP BY
    h.idHospital,
    h.nombre;

SELECT *
FROM vw_Hospitales_Mas_Muestras
ORDER BY TotalMuestras DESC;