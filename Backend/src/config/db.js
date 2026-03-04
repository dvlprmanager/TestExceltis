const sql = require('mssql');

let pool;

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'DB_Test',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Root123!',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  },
};

async function connectDB() {
  if (pool) {
    return pool;
  }

  pool = await sql.connect(dbConfig);
  console.log('Conexion a SQL Server establecida');
  return pool;
}

async function getPool() {
  if (!pool) {
    return connectDB();
  }

  return pool;
}

module.exports = {
  sql,
  connectDB,
  getPool,
};
