'use strict';
require('dotenv/config');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'mysql-29c3ab9d-gitika-9691.b.aivencloud.com',
  port:               Number(process.env.DB_PORT) || 23306,
  database:           process.env.DB_NAME     || 'defaultdb',
  user:               process.env.DB_USER     || 'avnadmin',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
