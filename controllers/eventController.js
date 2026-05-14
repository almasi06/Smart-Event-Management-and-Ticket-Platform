
const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const { search, category, date, availability } = req.query;
    const query = { isPublished: true, isCancelled: false };

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category.trim()) {
      query.category = category.toLowerCase().trim();
    }

    if (date && date.trim()) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    }

    let events = await Event.find(query).sort({ date: 1 });

    if (availability === 'available') {
      events = events.filter(e => e.availableTickets > 0);
    } else if (availability === 'soldout') {
      events = events.filter(e => e.availableTickets === 0);
    }

    res.render('index', {
      events,
      user: req.session.user || null,
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

const getManage = async (req, res) => {
  try {
    const events = await Event.find({ isCancelled: false }).sort({ date: 1 });
    res.render('manage', {
      events,
      user: req.session.user || null,
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, category, capacity } = req.body;

    await Event.create({
      title,
      description: description || '',
      date: new Date(date),
      category: category.toLowerCase(),
      capacity: parseInt(capacity),
      ticketsSold: 0,
      createdBy: req.session.userId,
    });

    res.redirect('/manage');
  } catch (err) {
    res.status(400).render('error', { message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, capacity, availableTickets } = req.body;
    const cap  = parseInt(capacity);
    const avail = parseInt(availableTickets);

    const ticketsSold = Math.max(0, cap - avail);

    await Event.findByIdAndUpdate(
      req.params.id,
      { title, capacity: cap, ticketsSold },
      { new: true, runValidators: true }
    );

    res.redirect('/manage');
  } catch (err) {
    res.status(400).render('error', { message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/manage');
  } catch (err) {
    res.status(400).render('error', { message: err.message });
  }
};

module.exports = { getEvents, getManage, createEvent, updateEvent, deleteEvent };
