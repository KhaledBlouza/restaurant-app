// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuration Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/restaurant');

// Schemas
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  createdAt: { type: Date, default: Date.now }
});

const orderItemSchema = new mongoose.Schema({
  dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  total: Number,
  status: { type: String, default: 'non traitée' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const Category = mongoose.model('Category', categorySchema);
const Dish = mongoose.model('Dish', dishSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes - Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', upload.single('image'), async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { name: req.body.name };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await Dish.deleteMany({ category: req.params.id });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes - Dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const dishes = await Dish.find(query).populate('category');
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dishes/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('category');
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dishes', upload.single('image'), async (req, res) => {
  try {
    const dish = new Dish({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
    await dish.save();
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dishes/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const dish = await Dish.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(dish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dishes/:id', async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dish deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes - Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.dish').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes - Statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();
    
    switch(period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('items.dish');

    // Calcul des statistiques
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Top plats
    const dishStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.dish) {
          const dishId = item.dish._id.toString();
          if (!dishStats[dishId]) {
            dishStats[dishId] = {
              name: item.dish.name,
              count: 0,
              revenue: 0
            };
          }
          dishStats[dishId].count += item.quantity;
          dishStats[dishId].revenue += item.price * item.quantity;
        }
      });
    });

    const topDishes = Object.entries(dishStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, stats]) => ({
        dish: stats.name,
        count: stats.count,
        revenue: stats.revenue
      }));

    res.json({
      totalOrders,
      totalRevenue,
      topDishes,
      revenueByDish: Object.values(dishStats)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(` jawek fesfes Server port ${PORT}`);
});