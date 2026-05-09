

const mongoose = require('mongoose');

// ─── Auth Guards ──────────────────────────────────────────────────────────────

const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  req.session.error = 'Please log in to continue.';
  res.redirect('/auth');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', { message: 'Access denied. Admins only.' });
};

// ─── Booking Capacity Validation ──────────────────────────────────────────────
// Used before POST /book
// Attaches req.event so the controller doesn't need to re-fetch
const validateBookingCapacity = async (req, res, next) => {
  try {
    const { eventId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).render('error', { message: 'Invalid event ID.' });
    }

    const Event = require('./Event');
    const event = await Event.findById(eventId);

    if (!event)           return res.status(404).render('error', { message: 'Event not found.' });
    if (event.isCancelled) return res.status(400).render('error', { message: 'This event has been cancelled.' });
    if (!event.isPublished) return res.status(400).render('error', { message: 'This event is not available for booking.' });
    if (event.date < new Date()) return res.status(400).render('error', { message: 'This event has already passed.' });

    if (!event.hasCapacity(parseInt(quantity))) {
      return res.status(400).render('error', {
        message: `Only ${event.availableTickets} ticket(s) remaining.`,
      });
    }

    req.event = event;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Booking Ownership Validation ─────────────────────────────────────────────
const validateBookingOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', { message: 'Invalid booking ID.' });
    }

    const Booking = require('./Booking');
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).render('error', { message: 'Booking not found.' });

    const isOwner = booking.user.toString() === req.session.userId;
    const isAdmin = req.session.user && req.session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).render('error', { message: 'Access denied.' });
    }

    req.booking = booking;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── ObjectId Param Validator ─────────────────────────────────────────────────
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).render('error', { message: `Invalid ${paramName}.` });
  }
  next();
};

module.exports = {
  isLoggedIn,
  isAdmin,
  validateBookingCapacity,
  validateBookingOwnership,
  validateObjectId,
};
