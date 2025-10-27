const express = require('express');
const cors = require('cors');
const { pool, initDatabase } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route trang chủ
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với Product Manager API',
    endpoints: {
      'GET /': 'Trang chủ',
      'POST /api/products': 'Thêm sản phẩm mới',
      'GET /api/products': 'Lấy tất cả sản phẩm',
      'GET /api/products/search?name=...': 'Tìm kiếm sản phẩm theo tên'
    }
  });
});

// API 1: THÊM SẢN PHẨM
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên và giá sản phẩm là bắt buộc'
      });
    }

    // Thêm sản phẩm vào database
    const query = 'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [
      name, 
      description || '', 
      price, 
      quantity || 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      data: {
        id: result.insertId,
        name,
        description,
        price,
        quantity
      }
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm sản phẩm',
      error: error.message
    });
  }
});

// API 2: TÌM KIẾM SẢN PHẨM
app.get('/api/products/search', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp từ khóa tìm kiếm (name)'
      });
    }

    // Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
    const query = 'SELECT * FROM products WHERE name LIKE ? ORDER BY created_at DESC';
    const [products] = await pool.query(query, [`%${name}%`]);

    res.json({
      success: true,
      message: `Tìm thấy ${products.length} sản phẩm`,
      data: products
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm sản phẩm',
      error: error.message
    });
  }
});

// API Bonus: LẤY TẤT CẢ SẢN PHẨM
app.get('/api/products', async (req, res) => {
  try {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    const [products] = await pool.query(query);

    res.json({
      success: true,
      message: `Có ${products.length} sản phẩm`,
      data: products
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
});

// Khởi động server
async function startServer() {
  try {
    // Khởi tạo database trước
    await initDatabase();
    
    // Sau đó mới start server
    app.listen(PORT, () => {
      console.log(`✓ Server đang chạy tại http://localhost:${PORT}`);
      console.log(`✓ API documentation: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Không thể khởi động server:', error);
    process.exit(1);
  }
}

startServer();