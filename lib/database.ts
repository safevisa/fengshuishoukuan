import mysql from 'mysql2/promise';

// MySQL数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'fengshui_ecommerce',
  charset: 'utf8mb4',
  timezone: '+00:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// 创建连接池
let pool: mysql.Pool | null = null;

export async function getConnection(): Promise<mysql.PoolConnection> {
  if (!pool) {
    console.log('🔌 [数据库] 创建MySQL连接池...');
    pool = mysql.createPool(dbConfig);
    
    // 测试连接
    try {
      const connection = await pool.getConnection();
      console.log('✅ [数据库] MySQL连接成功');
      connection.release();
    } catch (error) {
      console.error('❌ [数据库] MySQL连接失败:', error);
      throw error;
    }
  }
  
  return await pool.getConnection();
}

// 关闭连接池
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 [数据库] MySQL连接池已关闭');
  }
}

// 执行查询
export async function executeQuery<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

// 执行更新
export async function executeUpdate(
  sql: string, 
  params: any[] = []
): Promise<mysql.ResultSetHeader> {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } finally {
    connection.release();
  }
}

// 事务处理
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 健康检查
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [数据库] 健康检查失败:', error);
    return false;
  }
}

export default {
  getConnection,
  closePool,
  executeQuery,
  executeUpdate,
  executeTransaction,
  checkDatabaseHealth
};