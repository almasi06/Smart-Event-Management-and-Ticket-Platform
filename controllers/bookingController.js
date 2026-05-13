

const Booking = require('../models/Booking');
const Event   = require('../models/Event');

const getDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    if (user.role === 'admin') {
    
      const analytics = await Booking.getAdminStats();
      return res.render('dashboard', { user, bookings: [], analytics });
    }

    const bookings = await Booking.findByUser(req.session.user._id);
    res.render('dashboard', { user, bookings, analytics: null });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

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
      user:       req.session.user._id,
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
    
    await event.incrementSold(qty);

    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

module.exports = { getDashboard, createBooking };
