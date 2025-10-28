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
app.use(express.static('public'));

// Đảm bảo response luôn có charset UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Route trang chủ
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với Product Manager API',
    endpoints: {
      'GET /': 'Trang chủ - Danh sách API',
      'POST /api/products': 'Thêm sản phẩm mới',
      'GET /api/products': 'Lấy tất cả sản phẩm',
      'GET /api/products/:id': 'Lấy chi tiết 1 sản phẩm',
      'PUT /api/products/:id': 'Cập nhật sản phẩm',
      'DELETE /api/products/:id': 'Xóa sản phẩm',
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

// API 3: LẤY TẤT CẢ SẢN PHẨM
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

// API 4: LẤY CHI TIẾT 1 SẢN PHẨM
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM products WHERE id = ?';
    const [products] = await pool.query(query, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết sản phẩm',
      error: error.message
    });
  }
});

// API 5: CẬP NHẬT SẢN PHẨM
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để cập nhật'
      });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên và giá sản phẩm là bắt buộc'
      });
    }

    // Cập nhật sản phẩm
    const query = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?';
    await pool.query(query, [
      name, 
      description || '', 
      price, 
      quantity || 0, 
      id
    ]);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: {
        id: parseInt(id),
        name,
        description,
        price,
        quantity
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sản phẩm',
      error: error.message
    });
  }
});

// API 6: XÓA SẢN PHẨM
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để xóa'
      });
    }

    // Xóa sản phẩm
    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
      data: {
        id: parseInt(id),
        name: existing[0].name
      }
    });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sản phẩm',
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
      console.log(`✓ Web UI: http://localhost:${PORT}/index.html`);
    });
  } catch (error) {
    console.error('✗ Không thể khởi động server:', error);
    process.exit(1);
  }
}

startServer();