// const mysql = require('mysql2');
// require('dotenv').config();

// // Tạo connection pool để quản lý kết nối hiệu quả
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 3306, // Mặc định 3306 nếu không có
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Chuyển sang Promise để dễ sử dụng async/await
// const promisePool = pool.promise();

// // Hàm khởi tạo bảng products nếu chưa tồn tại
// async function initDatabase() {
//   try {
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS products (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         description TEXT,
//         price DECIMAL(10, 2) NOT NULL,
//         quantity INT DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `;
    
//     await promisePool.query(createTableQuery);
//     console.log('✓ Database và bảng products đã sẵn sàng');
//   } catch (error) {
//     console.error('✗ Lỗi khởi tạo database:', error);
//     throw error;
//   }
// }

// module.exports = { pool: promisePool, initDatabase };

const mysql = require('mysql2');
require('dotenv').config();

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Mặc định 3306 nếu không có
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Chuyển sang Promise để dễ sử dụng async/await
const promisePool = pool.promise();

// Hàm khởi tạo bảng products nếu chưa tồn tại
async function initDatabase() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await promisePool.query(createTableQuery);
    console.log('✓ Database và bảng products đã sẵn sàng');
  } catch (error) {
    console.error('✗ Lỗi khởi tạo database:', error);
    throw error;
  }
}

module.exports = { pool: promisePool, initDatabase };