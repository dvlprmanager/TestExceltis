CREATE TABLE [tipoProducto] (
  [idTipoProducto] int primary key identity(1,1),
  [nombre] varchar(150)
);

CREATE TABLE [Producto] (
  idProducto int primary key identity(1,1),
  tipoProducto int,
  cantidad int,
  Precio decimal
);

CREATE TABLE [TipoPersona] (
  [idTipoPersona] int primary key identity(1,1),
  [nombre] varchar (150),
  [descripcion] varchar(100)
);

CREATE TABLE [Pais] (
  [idPais] int primary key identity(1,1),
  [nombre] varchar(150),
  [Abreviatura] varchar(10)
);

CREATE TABLE [Persona] (
  [idPersona] int primary key identity(1,1),
  [idTipoPersona] int,
  [idPais] int,
  [nombres] varchar(150),
  [apellidos] varchar(150),
  CONSTRAINT [FK_Persona_idTipoPersona]
    FOREIGN KEY ([idTipoPersona])
      REFERENCES [TipoPersona]([idTipoPersona]),
  CONSTRAINT [FK_Persona_idPais]
    FOREIGN KEY ([idPais])
      REFERENCES [Pais]([idPais])
);

CREATE TABLE [Hospital] (
  [idHospital] int primary key identity(1,1),
  [nombre] varchar(150),
  [idPais] int,
  CONSTRAINT [FK_Hospital_idPais]
    FOREIGN KEY ([idPais])
      REFERENCES [Pais]([idPais])
);

CREATE TABLE [VisitaMedica] (
  [idVisitaMedica] int primary key identity(1,1),
  [idPersona] int,
  [idHospital] int,
  CONSTRAINT [FK_VisitaMedica_idPersona]
    FOREIGN KEY ([idPersona])
      REFERENCES [Persona]([idPersona]),
  CONSTRAINT [FK_VisitaMedica_idHospital]
    FOREIGN KEY ([idHospital])
      REFERENCES [Hospital]([idHospital])
);

CREATE TABLE [DetalleVisitaMedica] (
  [idDetalleVisitaMedica] int primary key identity(1,1),
  [idVisitaMedica] int,
  [idProducto] int,
  CONSTRAINT [FK_DetalleVisitaMedica_idVisitaMedica]
    FOREIGN KEY ([idVisitaMedica])
      REFERENCES [VisitaMedica]([idVisitaMedica]),
  CONSTRAINT [FK_DetalleVisitaMedica_idProducto]
    FOREIGN KEY ([idProducto])
      REFERENCES [Producto]([idProducto])
);

INSERT INTO Pais (nombre, Abreviatura) VALUES
('Guatemala', 'GT'),
('Nicaragua', 'NI'),
('Costa Rica', 'CR'),
('Honduras', 'HN'),
('Espania', 'ES'),
('Republica Dominicana', 'RD'),
('Panama', 'PN');

INSERT INTO TipoPersona (nombre, descripcion) VALUES
('Visitador','Visitador medico'),
('Cliente','Clientes');

INSERT into Hospital (nombre,idPais)
values
('kIELSA 98 - MALL PREMIER COMAYAGUELA (1006152)' ,1),
('KIELSA LAS TORRE CARRETERA BATALLON TEGUCIGALPA',1),
('MILEYDE 2 (COL ELVEL) TEGUCIGALPA (1005707)'	,1),
('MILEYDE 5 (COL ELVEL) TEGUCIGALPA (1005708)'	,1),
('PUNTO FARMA LA GRANJA (BO LA GRANJA) COMAYAGUA (1006434)'	,1),
('PUNTO FARMA METROMALL'	,1),
('PUNTO FARMA SEMESUR CHOLUTECA (1006484)'	,1),
('REGIS TOROCAGUA'	,1),
('DEL AHORRO CATACAMAS #2 (BO EL CAMPO) CATACAMAS (1005600)'	,1),
('DEL AHORRO CENTRO 1 LA HA (RES HACIENDA) TEGUCIGALPA (100549'	,1),
('FARMACITY MEDICAL CENTER (COL LAS MINITAS) TEGUCIGALPA (1005'	,1),
('FARMACITY VIERA (BO EL CENTRO) BARRIO ABAJO (1005615)'	,1),
('AHORRO 33'	,1),
('AHORRO 70	',1),
('F. ASHONPLAFA'	,1),
('FARMACIA ASHONPLAFA'	,1),
('ASHONPLAFA MARCALA'	,1),
('ASHONPLAFA'	,1),
('DEL AHORRO 03 ( CIRCUNVALACION)'	,1),
('FARMATODO MATERNO INFANTIL'	,1),
('FARMATODO SAN JUAN'	,1),
('FARMATODO TECUN UMAN'	,1),
('FARMATODO UNIVERSIDAD	',1),
('FARMACITY MALL LAS CASCAD COMAYAGUELA (1005648)'	,1);

select * from TipoPersona tp;


INSERT INTO Persona(idTipoPersona,idPais, nombres, apellidos)
values
(1,1,'Marco','Ochoa'),
(1,1,'Luis','Torres'),
(1,1,'Manuel','Rogel'),
(1,1,'Juan','Rendon'),
(1,1,'Kenia','Hernandez'),
(1,1,'Francisco','Matos')

INSERT tipoProducto(nombre)
values
	('GEL'),
	('SOLUCION'),
	('TABLETA'),
	('BLISTER');

SELECT * FROM tipoProducto tp ;

ALTER TABLE Producto
ADD FOREIGN KEY (idTipoProducto) REFERENCES tipoProducto (idTipoProducto);

ALTER TABLE Producto
ADD nombre varchar(150);


insert into Producto (nombre,idTipoProducto,cantidad,Precio )
values ('Acertina 28 Caps',1,10,20.50),
('Acicran x 30 comp',2,20,35.80),
('Alfa Interferon 2B 10M',3,15,40.80),
('Alfa Interferon 2B 3M',1,15,25.70),
('Atempa Gel Vaginal',2,35,20),
('Atempa Plus 30 Caps',3,40,34),
('Avamigran  100 comp.',1,23,23.90),
('Avamigran  200 comp.',2,45,36.90),
('Balisart 5mg',3,60,40.60),
('Bemabix 100 Mg/4 Ml 1 Vial',1,6,10),
('Bemabix 400 mg/16 ml',2,25,45.60),
('Budek 200mcg  30 caps.',3,20,60.90),
('Budek 400mcg  30 caps.',1,13,5),
('Budek Spray Nasal 10Ml',2,90,100),
('Caplenal 25 mg x 10 caps',3,25,75);

select * from Producto p ;



ALTER TABLE [VisitaMedica]
ADD
  [creadoPor]       varchar(150) NULL,
  [fechaCreado]     datetime2(0) NULL,
  [modificadoPor]   varchar(150) NULL,
  [fechaModificado] datetime2(0) NULL;


ALTER TABLE [DetalleVisitaMedica]
ADD
  [creadoPor]       varchar(150) NULL,
  [fechaCreado]     datetime2(0) NULL,
  [modificadoPor]   varchar(150) NULL,
  [fechaModificado] datetime2(0) NULL;


ALTER TABLE [DetalleVisitaMedica]
ADD
  [cantidad] int NULL;


CREATE TABLE [InventarioPersona] (
  [idInventarioPersona] int primary key identity(1,1),
  [idPersona] int NOT NULL,
  [idProducto] int NOT NULL,
  [cantidad] int NOT NULL,
  [creadoPor]       varchar(150) NULL,
  [fechaCreado]     datetime2(0) NULL,
  [modificadoPor]   varchar(150) NULL,
  [fechaModificado] datetime2(0) NULL,
  CONSTRAINT [FK_InventarioPersona_idPersona]
    FOREIGN KEY ([idPersona]) REFERENCES [Persona]([idPersona]),
  CONSTRAINT [FK_InventarioPersona_idProducto]
    FOREIGN KEY ([idProducto]) REFERENCES [Producto]([idProducto])
);


CREATE TABLE [Factura] (
  [idFactura] int primary key identity(1,1),
  [noFactura] varchar(50) NOT NULL,
  [fecha] datetime2(0) NOT NULL,
  [Total] decimal(18,2) NOT NULL,
  [idHospital] int NOT NULL,
  [creadoPor]       varchar(150) NULL,
  [fechaCreado]     datetime2(0) NULL,
  [modificadoPor]   varchar(150) NULL,
  [fechaModificado] datetime2(0) NULL,
  CONSTRAINT [FK_Factura_idHospital]
    FOREIGN KEY ([idHospital]) REFERENCES [Hospital]([idHospital])
);

CREATE TABLE [FacturaDetalle] (
  [idFacturaDetalle] int primary key identity(1,1),
  [idFactura] int NOT NULL,
  [idProducto] int NOT NULL,
  [cantidad] int NOT NULL,
  [precioUnitario] decimal(18,2) NOT NULL,
  [total] decimal(18,2) NOT NULL,
  [creadoPor]       varchar(150) NULL,
  [fechaCreado]     datetime2(0) NULL,
  [modificadoPor]   varchar(150) NULL,
  [fechaModificado] datetime2(0) NULL,
  CONSTRAINT [FK_FacturaDetalle_idFactura]
    FOREIGN KEY ([idFactura]) REFERENCES [Factura]([idFactura]),
  CONSTRAINT [FK_FacturaDetalle_idProducto]
    FOREIGN KEY ([idProducto]) REFERENCES [Producto]([idProducto])
);

select * from Pais;

DELETE FROM Persona;

DBCC CHECKIDENT ('Persona', RESEED, 0);


INSERT INTO Persona (idTipoPersona, idPais, nombres, apellidos) VALUES
(1,1,'Juan','Perez'),
(1,1,'Maria','Lopez'),
(1,1,'Carlos','Ramirez'),
(1,2,'Jose','Martinez'),
(1,2,'Ana','Gomez'),
(1,3,'Luis','Rodriguez'),
(1,3,'Daniela','Vargas'),
(1,4,'Pedro','Hernandez'),
(1,4,'Sofia','Castro'),
(1,5,'Miguel','Fernandez'),
(1,5,'Laura','Garcia'),
(1,6,'Andres','Santos'),
(1,6,'Carolina','Diaz'),
(1,7,'Ricardo','Morales'),
(1,7,'Patricia','Torres');

select * from Persona p;


DELETE FROM Hospital;

DBCC CHECKIDENT ('Hospital', RESEED, 0);


INSERT INTO Hospital (nombre, idPais) VALUES
('Hospital General San Juan de Dios',1),
('Hospital Roosevelt',1),
('Hospital Herrera Llerandi',1),

('Hospital Alemán Nicaragüense',2),
('Hospital Vivian Pellas',2),
('Hospital Militar Alejandro Dávila Bolaños',2),

('Hospital México',3),
('Hospital San Juan de Dios Costa Rica',3),
('Hospital CIMA San José',3),

('Hospital Escuela Universitario',4),
('Hospital Mario Catarino Rivas',4),
('Hospital del Valle',4),

('Hospital Universitario La Paz',5),
('Hospital Clínico San Carlos',5),
('Hospital Quirónsalud Madrid',5),

('Hospital General de la Plaza de la Salud',6),
('Hospital Metropolitano de Santiago',6),
('Hospital Doctor Vinicio Calventi',6),

('Hospital Santo Tomás',7),
('Hospital Punta Pacífica',7),
('Hospital Nacional',7);

select * from Hospital h ;

select * from tipoProducto tp;

DELETE  from Producto;

DBCC CHECKIDENT ('Producto', RESEED, 0);

INSERT INTO Producto (nombre, idTipoProducto, cantidad, Precio) VALUES
('Acertina 28 Caps',2,0,38.12),
('Acicran x 30 comp',2,0,6.68),
('Alfa Interferon 2B 10M',3,0,15.99),
('Alfa Interferon 2B 3M',2,0,25.37),
('Atempa Gel Vaginal',4,0,35.67),
('Atempa Plus 30 Caps',2,0,19.98),
('Avamigran  100 comp.',3,0,22.74),
('Avamigran  200 comp.',2,0,4.63),
('Balisart 5mg',4,0,4.75),
('Bemabix 100 Mg/4 Ml 1 Vial',2,0,8.81),
('Bemabix 400 mg/16 ml',4,0,9.35),
('Budek 200mcg  30 caps.',3,0,28.08),
('Budek 400mcg  30 caps.',4,0,12.55),
('Budek Spray Nasal 10Ml',1,0,26.27),
('Caplenal 25 mg x 10 caps',1,0,30.90),
('Cerciora-T 0,75Mg  2 comp.',1,0,24.33),
('Climabel 2,5Mg  30 comp.',1,0,34.21),
('Contraval 1.5 g/15mg x 15 sobres',1,0,35.82),
('Contraval 1.5 g/15mg x 30 sobres',3,0,29.02),
('Daniele 2-0,035Mg  21 comp.',1,0,19.61),
('Deflarin 30mg  10 comp.',3,0,43.86),
('Deflarin 6mg  10 comp.',4,0,11.37),
('Devincal 30 caps',1,0,6.19),
('Dexketoprofeno 25mg (Jeringa prellenada)',1,0,42.19),
('Diatonb 500 Mg  30 comp.',4,0,9.90),
('Dihexazin',3,0,28.73),
('Divinalt  21 comp.',2,0,9.54),
('Dolencar 150 mg',1,0,44.35),
('Dolencar 300 mg',1,0,42.77),
('Dolencar 75 mg',1,0,28.24),
('Drospera  28 comp.',4,0,41.41),
('Efac 150 Mg  1 caps.',1,0,9.13),
('Efac 150 Mg  2 caps.',1,0,3.92),
('Eritropoyetina 10,000 UI 1 amp.',4,0,19.39),
('Eritropoyetina 2,000 UI 1 amp.',3,0,37.36),
('Eritropoyetina 3,000 UI 1 amp.',3,0,28.19),
('Eritropoyetina 4,000 UI 1 amp.',1,0,5.37),
('Eritropoyetina 40,000 UI 1 amp.',2,0,13.79),
('Escidalt 10 Mg  30 comp.',1,0,38.93),
('Escidalt 20Mg  30 comp.',2,0,17.61),
('Escidalt 5 Mg  30 comp.',4,0,27.37),
('Fedralip 10 / 5 mg',1,0,42.20),
('Fedralip 20 / 5 mg',4,0,37.14),
('Fedralip 40 / 5 mg',4,0,13.37),
('Femexin  28 comp.',1,0,47.72),
('Femivital 30 caps.',3,0,9.20),
('Fenorol 12Mcg  30 caps.',3,0,36.66),
('Ferruvenol 5 mL x 5 amp',3,0,45.64),
('Filgrastim 300Ug X 1 Vial',4,0,20.91),
('Fludalt Duo 100mcg  60 caps.',4,0,8.95),
('Fludalt Duo 250mcg  60 caps.',2,0,4.79),
('Gestageno 100Mg X 30',1,0,27.32),
('Gestageno 200Mg X 30',4,0,17.55),
('Gynotran Ovulos x 7',4,0,6.15),
('Helvia Diario 28 Comp. D.I.',1,0,11.49),
('Imbys 500 Mg x 3 comp.',1,0,19.46),
('Imbys 500 Mg x 5 comp.',2,0,8.48),
('Imbys Suspension 15 ml',4,0,10.93),
('Infukoll gel 4 % x 500 ml',4,0,33.60),
('Kamillosan 30 Ml líquido',1,0,38.30),
('Kamillosan Crema 20 grs',3,0,46.94),
('Kamillosan Spray Bucal 30 ml',2,0,20.90),
('Kefentech Sobre con 4 parches',1,0,8.59),
('Kemoter XR 300 mg x 30',1,0,24.75),
('Kemoter XR 50 mg x 30',3,0,37.92),
('Legofer 20 Viales Beb. 15Ml',3,0,34.55),
('Levedalt 1000 Mg  30 comp.',1,0,15.72),
('Levedalt 250 Mg  30 comp.',1,0,6.09),
('Levedalt 500 Mg  30 comp.',2,0,40.25),
('Liposinol 10 mg/20 mg',2,0,43.01),
('Liposinol 10 mg/40 mg',1,0,42.67),
('Maleadex 30 Caps.',1,0,31.54),
('Maleavit 30 Caps',4,0,23.97),
('Memantina 10 mg',3,0,34.68),
('Memantina 20 mg',2,0,20.08),
('Miflonide 200Mcg (3X10) caps.',3,0,26.47),
('Miflonide 400Mcg (3X10) caps.',2,0,44.56),
('Mileva 35 Comp X 21',4,0,19.82),
('Modip x 30 tab',3,0,44.51),
('Noglucet 100mg  30 comp.',2,0,24.70),
('Noglucet Met 50 + 500 mg  30 comp',2,0,38.94),
('Noglucet Met 50/1000 Mg   30 comp.',4,0,40.00),
('Obbiat 2-0,03Mg  21 comp.',3,0,29.26),
('Odica 150 Mg  28 comp.',2,0,39.09),
('Odica 300 Mg  28 comp.',4,0,30.77),
('Odica 50 Mg  28 comp.',4,0,33.95),
('Odica 75 Mg  28 comp.',1,0,49.63),
('Onbrize Breezh Hgci 150Mg Alu 3X10',2,0,45.06),
('Onbrize Breezh Hgci 300Mg Alu 3X10',4,0,26.32),
('Oprah 1x21',2,0,30.87),
('Oxalip Spray Nasal',1,0,41.97),
('Planifert 2-0,03Mg  21 comp.',4,0,22.96),
('Plusargin Solución 10 amp. Beb',4,0,40.24),
('Postelle (drospirenona 2 mg / Estradiol 1 mg)',3,0,44.34),
('Prelone 15 Mg/5Ml Jbe 120 Ml',2,0,30.95),
('Prelone 15 Mg/5Ml Jbe 60 Ml',2,0,7.93),
('Prelone 20 Mg  10 comp.',1,0,35.01),
('Prelone 5 Mg  20 comp.',1,0,34.56),
('Prelone 50 Mg  10 comp.',1,0,18.33),
('Preveginat 0.75mg 28 comp',4,0,39.93);


select * from Producto p;


INSERT INTO InventarioPersona (idPersona, idProducto, cantidad)
SELECT 
    p.idPersona,
    pr.idProducto,
    ABS(CHECKSUM(NEWID())) % 50 + 1 AS cantidad
FROM 
    (VALUES
        (1),(2),(3),(4),(5),
        (6),(7),(8),(9),(10),
        (11),(12),(13),(14),(15)
    ) AS p(idPersona)
CROSS APPLY
(
    SELECT TOP 8 idProducto
    FROM Producto
    WHERE idProducto BETWEEN 1 AND 100
    ORDER BY NEWID()
) pr;



ALTER TABLE Factura
ADD idPersona INT;


ALTER TABLE Factura
ADD CONSTRAINT FK_Factura_Persona
FOREIGN KEY (idPersona) REFERENCES Persona(idPersona);

