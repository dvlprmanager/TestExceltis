CREATE OR ALTER TRIGGER [TR_DetalleVisitaMedica_DescontarInventario]
ON [DetalleVisitaMedica]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Guardar consumo por Persona + Producto 
    DECLARE @Consumo TABLE (
        idPersona int NOT NULL,
        idProducto int NOT NULL,
        cantidadConsumida int NOT NULL
    );

    INSERT INTO @Consumo (idPersona, idProducto, cantidadConsumida)
    SELECT
        vm.idPersona,
        i.idProducto,
        SUM(ISNULL(i.cantidad, 0)) AS cantidadConsumida
    FROM inserted i
    INNER JOIN VisitaMedica vm
        ON vm.idVisitaMedica = i.idVisitaMedica
    GROUP BY vm.idPersona, i.idProducto;

    /* 1) Validar que exista inventario para cada Persona + Producto */
    IF EXISTS (
        SELECT 1
        FROM @Consumo c
        LEFT JOIN InventarioPersona ip
            ON ip.idPersona = c.idPersona
           AND ip.idProducto = c.idProducto
        WHERE ip.idInventarioPersona IS NULL
    )
    BEGIN
        RAISERROR('No existe inventario asignado para uno o más productos en InventarioPersona.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    /* 2) Validar stock suficiente */
    IF EXISTS (
        SELECT 1
        FROM @Consumo c
        INNER JOIN InventarioPersona ip
            ON ip.idPersona = c.idPersona
           AND ip.idProducto = c.idProducto
        WHERE ip.cantidad < c.cantidadConsumida
    )
    BEGIN
        RAISERROR('Inventario insuficiente para uno o más productos.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    /* 3) Descontar inventario */
    UPDATE ip
       SET ip.cantidad = ip.cantidad - c.cantidadConsumida
    FROM InventarioPersona ip
    INNER JOIN @Consumo c
        ON c.idPersona = ip.idPersona
       AND c.idProducto = ip.idProducto;
END;
GO