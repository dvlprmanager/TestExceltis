# TestExcelcis

Proyecto dividido en:

- `Backend`: API en Express conectada a SQL Server
- `Frontend/test_exceltis`: aplicación React con Vite
- `DB`: scripts de base de datos

## Requisitos

- Node.js 18 o superior
- SQL Server
- Base de datos creada con los scripts de la carpeta `DB`

## Base de datos

Ejecuta los scripts según corresponda:

- `DB/ScripCreacion.sql`
- `DB/Trigger.sql`
- `DB/KPIS.sql`

## Levantar el backend

1. Entra a la carpeta:

```bash
cd Backend
```

2. Instala dependencias:

```bash
npm install
```

3. Configura el archivo `.env` con estas variables:

```env
PORT=3000
DB_SERVER=localhost
DB_NAME=DB_Test
DB_USER=sa
DB_PASSWORD=Root123!
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

4. Inicia el proyecto:

```bash
npm run dev
```

El backend quedará en `http://localhost:3000`.

## Levantar el frontend

1. Entra a la carpeta:

```bash
cd Frontend/test_exceltis
```

2. Instala dependencias:

```bash
npm install
```

3. Inicia el proyecto:

```bash
npm run dev
```

El frontend quedará en `http://localhost:5173`.

Nota:

- El frontend ya tiene configurado un proxy para `/api` hacia `http://localhost:3000`.

## Orden recomendado

1. Levanta SQL Server y carga la base de datos.
2. Levanta el backend.
3. Levanta el frontend.

## Módulos disponibles

- Visitas Médicas
- Ventas
- Dashboard
