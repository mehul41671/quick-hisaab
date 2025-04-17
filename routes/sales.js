const express = require('express');
const router = express.Router();
const Sales = require('../models/Sales');
const auth = require('../middleware/auth');

// Get daily sales for a store
router.get('/daily/:storeId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const sales = await Sales.findOne({
      storeId: req.params.storeId,
      date: new Date(date)
    });
    res.json(sales || { message: 'No sales found for this date' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new daily sales entry
router.post('/', auth, async (req, res) => {
  const sales = new Sales({
    storeId: req.body.storeId,
    date: req.body.date || new Date(),
    ticketSales: req.body.ticketSales,
    onlineSales: req.body.onlineSales || 0,
    lottoPayout: req.body.lottoPayout || 0,
    debitCardDeduction: req.body.debitCardDeduction || 0,
    totalSales: req.body.totalSales,
    netPayout: req.body.netPayout
  });

  try {
    const newSales = await sales.save();
    res.status(201).json(newSales);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update daily sales
router.patch('/:id', auth, async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id);
    if (!sales) {
      return res.status(404).json({ message: 'Sales record not found' });
    }

    if (req.body.ticketSales) sales.ticketSales = req.body.ticketSales;
    if (req.body.onlineSales) sales.onlineSales = req.body.onlineSales;
    if (req.body.lottoPayout) sales.lottoPayout = req.body.lottoPayout;
    if (req.body.debitCardDeduction) sales.debitCardDeduction = req.body.debitCardDeduction;
    if (req.body.totalSales) sales.totalSales = req.body.totalSales;
    if (req.body.netPayout) sales.netPayout = req.body.netPayout;
    if (req.body.status) sales.status = req.body.status;
    if (req.body.notes) sales.notes = req.body.notes;

    const updatedSales = await sales.save();
    res.json(updatedSales);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get monthly sales summary
router.get('/monthly/:storeId', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const sales = await Sales.find({
      storeId: req.params.storeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get yearly sales summary
router.get('/yearly/:storeId', auth, async (req, res) => {
  try {
    const { year } = req.query;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const sales = await Sales.find({
      storeId: req.params.storeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 