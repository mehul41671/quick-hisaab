const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

// Get all active tickets for a store
router.get('/active/:storeId', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      storeId: req.params.storeId,
      status: 'active'
    }).sort({ gameNumber: 1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all inactive tickets for a store
router.get('/inactive/:storeId', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      storeId: req.params.storeId,
      status: 'inactive'
    }).sort({ deactivationDate: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new ticket pack
router.post('/', auth, async (req, res) => {
  const ticket = new Ticket({
    gameNumber: req.body.gameNumber,
    gameName: req.body.gameName,
    startSerial: req.body.startSerial,
    endSerial: req.body.endSerial,
    ticketPrice: req.body.ticketPrice,
    storeId: req.body.storeId,
    gameImage: req.body.gameImage,
    totalTickets: req.body.totalTickets,
    remainingTickets: req.body.totalTickets
  });

  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update ticket status (scan, return, etc.)
router.patch('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.body.scannedSerial) {
      // Update scanned count and remaining tickets
      ticket.scannedCount += 1;
      ticket.remainingTickets -= 1;
      ticket.currentSerial = req.body.scannedSerial;
      
      // Auto-update closing number
      ticket.lastClosingNumber = req.body.scannedSerial;
    }

    if (req.body.status) {
      ticket.status = req.body.status;
      if (req.body.status === 'inactive') {
        ticket.deactivationDate = Date.now();
      } else if (req.body.status === 'returned') {
        ticket.returnDate = Date.now();
      }
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get ticket by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 