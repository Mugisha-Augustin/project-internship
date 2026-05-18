const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/expenses — get expenses with pagination & filtering
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, category, startDate, endDate } = req.query;
  
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE 1=1';
    const params = [];
    const countParams = [];

    if (category) {
      params.push(category);
      countParams.push(category);
      query += ` AND category = $${params.length}`;
      countQuery += ` AND category = $${countParams.length}`;
    }

    if (startDate) {
      params.push(startDate);
      countParams.push(startDate);
      query += ` AND date >= $${params.length}`;
      countQuery += ` AND date >= $${countParams.length}`;
    }

    if (endDate) {
      params.push(endDate);
      countParams.push(endDate);
      query += ` AND date <= $${params.length}`;
      countQuery += ` AND date <= $${countParams.length}`;
    }

    // Append ordering and pagination limit/offset
    query += ` ORDER BY date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parsedLimit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows,
      total,
      page: parsedPage,
      limit: parsedLimit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/stats — summary stats
router.get('/stats', async (req, res) => {
  try {
    // All-time total and count
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS all_time_total, COUNT(*) AS entries FROM expenses'
    );

    // This month total
    const monthResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS month_total
       FROM expenses
       WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    // Spending by category
    const categoryResult = await pool.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC`
    );

    // Last 7 days trend
    const trendResult = await pool.query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') as day, SUM(amount) as total
       FROM expenses
       WHERE date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
       ORDER BY TO_CHAR(date, 'YYYY-MM-DD') ASC`
    );

    res.json({
      this_month: parseFloat(monthResult.rows[0].month_total),
      all_time: parseFloat(totalResult.rows[0].all_time_total),
      entries: parseInt(totalResult.rows[0].entries, 10),
      by_category: categoryResult.rows.map(row => ({
        category: row.category,
        total: parseFloat(row.total),
      })),
      last_7_days: trendResult.rows.map(row => ({
        day: row.day,
        total: parseFloat(row.total),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — create a new expense
router.post('/', async (req, res) => {
  const { amount, category, note, date } = req.body;

  // Basic validation
  if (!amount || !category) {
    return res.status(400).json({ error: 'amount and category are required' });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (amount, category, note, date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [amount, category, note || null, date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id — delete an expense by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Deleted successfully', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id — update an expense by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, category, note, date } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ error: 'amount and category are required' });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    const result = await pool.query(
      `UPDATE expenses 
       SET amount = $1, category = $2, note = $3, date = $4
       WHERE id = $5
       RETURNING *`,
      [amount, category, note || null, date || new Date().toISOString().split('T')[0], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
