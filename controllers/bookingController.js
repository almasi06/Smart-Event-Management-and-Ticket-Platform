

const Booking = require('../models/Booking');
const Event   = require('../models/Event');

// ─── GET /dashboard ───────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    if (user.role === 'admin') {
      // Admin sees analytics
      const analytics = await Booking.getAdminStats();
      return res.render('dashboard', { user, bookings: [], analytics });
    }

    // Regular user sees their booking history
    const bookings = await Booking.findByUser(req.session.userId);
    res.render('dashboard', { user, bookings, analytics: null });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

// ─── POST /book — Create Booking ──────────────────────────────────────────────
// index.ejs form sends: eventId, quantity
const createBooking = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).render('error', { message: 'Event not found.' });
    if (!event.hasCapacity(qty)) {
      return res.status(400).render('error', {
        message: `Only ${event.availableTickets} ticket(s) remaining.`,
      });
    }

    const booking = await Booking.create({
      user:       req.session.userId,
      event:      eventId,
      quantity:   qty,
      totalPrice: event.ticketPrice * qty,
      currency:   event.currency,
      status:     'confirmed',
      attendeeDetails: {
        name:  req.session.user.name,
        email: req.session.user.email,
      },
    });

    // Increment tickets sold on the event
    await event.incrementSold(qty);

    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

module.exports = { getDashboard, createBooking };
