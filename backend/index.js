const express = require('express');
const cors = require('cors');
const pool = require('./db');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expensesRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Pocket API is running 🟢' });
});

// Create table on startup if it doesn't exist
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        note TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database table ready');
  } catch (err) {
    console.error('❌ Failed to initialize DB:', err.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
