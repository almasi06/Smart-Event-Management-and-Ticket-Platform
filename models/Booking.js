const mongoose = require('mongoose');

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'refunded'];

const bookingSchema = new mongoose.Schema(
  {
    // dashboard.ejs: booking.event.title, booking.event.date, booking.event.category
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Booking must be for an event'],
    },
    // dashboard.ejs: booking.quantity
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Must book at least 1 ticket'],
      max: [10, 'Cannot book more than 10 tickets at once'],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'ZAR',
      uppercase: true,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUSES,
        message: `Status must be one of: ${BOOKING_STATUSES.join(', ')}`,
      },
      default: 'confirmed',
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    attendeeDetails: {
      name:  { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    cancelledAt:        { type: Date },
    cancellationReason: { type: String, trim: true, maxlength: 300 },
  },
  {
    timestamps: true, // dashboard.ejs: booking.createdAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });

// ─── Pre-save: Generate booking reference ─────────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `AE-${timestamp}-${random}`;
  }
  next();
});

// ─── Instance Method: Cancel booking ─────────────────────────────────────────
bookingSchema.methods.cancel = async function (reason = '') {
  if (this.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  const previousStatus = this.status;
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  await this.save();

  if (previousStatus === 'confirmed') {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(this.event, {
      $inc: { ticketsSold: -this.quantity },
    });
  }
  return this;
};

// ─── Static: Bookings by user ─────────────────────────────────────────────────
// dashboard.ejs accesses: booking.event.title, booking.event.date,
//                         booking.event.category, booking.quantity, booking.createdAt
bookingSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, status: { $ne: 'cancelled' } })
    .populate('event', 'title date category imageUrl ticketPrice')
    .sort({ createdAt: -1 });
};

// ─── Static: Admin analytics ──────────────────────────────────────────────────
// dashboard.ejs needs:
//   analytics.totalBookings        → Number
//   analytics.capacityPercentage   → Number (0–100)
//   analytics.totalEvents          → Number
//   analytics.popularEvents[]      → { title, category, bookingCount, ticketsSold, capacity }
bookingSchema.statics.getAdminStats = async function () {
  const Event = mongoose.model('Event');

  const totalBookings = await this.countDocuments({ status: 'confirmed' });
  const totalEvents   = await Event.countDocuments({ isCancelled: false });

  // Capacity usage: sum of ticketsSold / sum of capacity across all active events
  const capacityAgg = await Event.aggregate([
    { $match: { isCancelled: false } },
    {
      $group: {
        _id: null,
        totalSold:     { $sum: '$ticketsSold' },
        totalCapacity: { $sum: '$capacity' },
      },
    },
  ]);
  const capData = capacityAgg[0] || { totalSold: 0, totalCapacity: 0 };
  const capacityPercentage =
    capData.totalCapacity > 0
      ? Math.round((capData.totalSold / capData.totalCapacity) * 100)
      : 0;

  // Popular events — dashboard.ejs reads:
  //   event.title, event.category, event.bookingCount, event.ticketsSold, event.capacity
  const popularEvents = await this.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $group: {
        _id:          '$event',
        bookingCount: { $sum: 1 },
        totalTickets: { $sum: '$quantity' },
      },
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from:         'events',
        localField:   '_id',
        foreignField: '_id',
        as:           'eventDetails',
      },
    },
    { $unwind: '$eventDetails' },
    {
      $project: {
        _id:          0,
        title:        '$eventDetails.title',
        category:     '$eventDetails.category',
        ticketsSold:  '$eventDetails.ticketsSold',
        capacity:     '$eventDetails.capacity',
        bookingCount: 1,   // dashboard.ejs: event.bookingCount
      },
    },
  ]);

  return { totalBookings, capacityPercentage, totalEvents, popularEvents };
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
