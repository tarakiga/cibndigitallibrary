import { ConnectionPool, config } from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration from environment variables
const dbConfig: config = {
  user: process.env.CIBN_DB_USER,
  password: process.env.CIBN_DB_PASSWORD,
  server: process.env.CIBN_DB_SERVER || 'localhost',
  database: process.env.CIBN_DB_NAME,
  options: {
    encrypt: true, // Use encryption (recommended for Azure)
    trustServerCertificate: true, // Change to false in production with valid certificate
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

class SQLServerDB {
  private static instance: SQLServerDB;
  private pool: ConnectionPool;

  private constructor() {
    this.pool = new ConnectionPool(dbConfig);
    this.connect();
  }

  public static getInstance(): SQLServerDB {
    if (!SQLServerDB.instance) {
      SQLServerDB.instance = new SQLServerDB();
    }
    return SQLServerDB.instance;
  }

  private async connect() {
    try {
      await this.pool.connect();
      console.log('Connected to SQL Server');
    } catch (error) {
      console.error('Error connecting to SQL Server:', error);
      // Retry connection after delay
      setTimeout(() => this.connect(), 5000);
    }
  }

  public async query<T = any>(query: string, params?: any[]): Promise<T[]> {
    try {
      const request = this.pool.request();
      
      // Add parameters if provided
      if (params) {
        params.forEach((value, index) => {
          request.input(`param${index}`, value);
        });
      }
      
      const result = await request.query(query);
      return result.recordset as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  public async executeProcedure<T = any>(procedureName: string, params?: any[]): Promise<T[]> {
    try {
      const request = this.pool.request();
      
      // Add parameters if provided
      if (params) {
        params.forEach((value, index) => {
          request.input(`param${index}`, value);
        });
      }
      
      const result = await request.execute(procedureName);
      return result.recordset as T[];
    } catch (error) {
      console.error('Stored procedure error:', error);
      throw error;
    }
  }

  public async close() {
    try {
      await this.pool.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

export const sqlServerDB = SQLServerDB.getInstance();
