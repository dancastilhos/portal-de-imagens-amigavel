
// Express server for MariaDB connection
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_DATABASE || 'HOSTNAME_GEN',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Check if hostname exists
app.get('/api/hostname/exists/:hostname', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM CREATE_HOSTNAME WHERE HOSTNAME = ?',
      [req.params.hostname]
    );
    res.json({ exists: rows[0].count > 0 });
  } catch (error) {
    console.error('Error checking hostname:', error);
    res.status(500).json({ error: 'Failed to check hostname' });
  }
});

// Get all hostnames
app.get('/api/hostname/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CREATE_HOSTNAME ORDER BY UPDATETIME DESC LIMIT 100');
    
    // Convert database column names to camelCase for frontend
    const hostnames = rows.map(row => ({
      id: row.ID,
      code: row.CODE ? row.CODE.toString() : '',
      hostname: row.HOSTNAME,
      domain: row.DOMAIN,
      os: row.OS,
      environment: row.ENVIRONMENT,
      server_function: row.SERVER_FUNCTION,
      node: row.NODE,
      site: row.SITE,
      ip: row.IP,
      sec_ip: row.SEC_IP,
      updated_by: row.UPDATED_BY,
      system: row.SYSTEM,
      description: row.DESCRIPTION,
      object: row.OBJECT,
      alias: row.ALIAS,
      status: row.STATUS,
      project: row.PROJECT,
      owner: row.OWNER,
      updatetime: row.UPDATETIME
    }));
    
    res.json({ hostnames });
  } catch (error) {
    console.error('Error fetching hostnames:', error);
    res.status(500).json({ error: 'Failed to fetch hostnames' });
  }
});

// Save hostname
app.post('/api/hostname/save', async (req, res) => {
  const hostname = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO CREATE_HOSTNAME (
        CODE, HOSTNAME, DOMAIN, OS, ENVIRONMENT, SERVER_FUNCTION, NODE, 
        SITE, IP, SEC_IP, UPDATED_BY, SYSTEM, DESCRIPTION, OBJECT, 
        ALIAS, STATUS, PROJECT, OWNER
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hostname.code,
        hostname.hostname,
        hostname.domain,
        hostname.os,
        hostname.environment,
        hostname.server_function,
        hostname.node,
        hostname.site,
        hostname.ip,
        hostname.sec_ip,
        hostname.updated_by,
        hostname.system,
        hostname.description,
        hostname.object,
        hostname.alias,
        hostname.status,
        hostname.project,
        hostname.owner
      ]
    );
    
    const [newHostname] = await pool.query('SELECT * FROM CREATE_HOSTNAME WHERE ID = ?', [result[0].insertId]);
    
    res.json({ 
      hostname: {
        id: newHostname[0].ID,
        code: newHostname[0].CODE ? newHostname[0].CODE.toString() : '',
        hostname: newHostname[0].HOSTNAME,
        domain: newHostname[0].DOMAIN,
        os: newHostname[0].OS,
        environment: newHostname[0].ENVIRONMENT,
        server_function: newHostname[0].SERVER_FUNCTION,
        node: newHostname[0].NODE,
        site: newHostname[0].SITE,
        ip: newHostname[0].IP,
        sec_ip: newHostname[0].SEC_IP,
        updated_by: newHostname[0].UPDATED_BY,
        system: newHostname[0].SYSTEM,
        description: newHostname[0].DESCRIPTION,
        object: newHostname[0].OBJECT,
        alias: newHostname[0].ALIAS,
        status: newHostname[0].STATUS,
        project: newHostname[0].PROJECT,
        owner: newHostname[0].OWNER,
        updatetime: newHostname[0].UPDATETIME
      }
    });
  } catch (error) {
    console.error('Error saving hostname:', error);
    res.status(500).json({ error: 'Failed to save hostname' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
