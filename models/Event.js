const mongoose = require('mongoose');

// ─── Category values must match EXACTLY what the EJS <select> options send ───
// index.ejs / manage.ejs use: 'conference', 'workshop', 'music festival', 'private'
const EVENT_CATEGORIES = [
  'conference',
  'workshop',
  'music festival',
  'private',
  'networking',
  'exhibition',
  'sports',
  'other',
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EVENT_CATEGORIES,
        message: `Category must be one of: ${EVENT_CATEGORIES.join(', ')}`,
      },
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.date;
        },
        message: 'End date must be after start date',
      },
    },
    venue: {
      name:     { type: String, trim: true, default: 'TBC' },
      address:  { type: String, trim: true, default: '' },
      city:     { type: String, trim: true, default: '' },
      province: { type: String, trim: true, default: '' },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [100000, 'Capacity cannot exceed 100,000'],
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: [0, 'Tickets sold cannot be negative'],
    },
    // manage.ejs create form does NOT include ticketPrice, default to 0
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, 'Ticket price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'ZAR',
      uppercase: true,
      maxlength: 3,
    },
    imageUrl: {
      type: String,
      default: '/images/default-event.jpg',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must have a creator'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isPublished: 1, isCancelled: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
// index.ejs:  event.availableTickets
// manage.ejs: event.availableTickets
// dashboard.ejs: event.ticketsSold / event.capacity
eventSchema.virtual('availableTickets').get(function () {
  return Math.max(0, this.capacity - this.ticketsSold);
});

eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketsSold >= this.capacity;
});

eventSchema.virtual('occupancyPercent').get(function () {
  if (this.capacity === 0) return 0;
  return Math.round((this.ticketsSold / this.capacity) * 100);
});

eventSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'event',
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
eventSchema.methods.hasCapacity = function (quantity = 1) {
  return this.ticketsSold + quantity <= this.capacity;
};

eventSchema.methods.incrementSold = async function (quantity = 1) {
  if (!this.hasCapacity(quantity)) {
    throw new Error('Not enough tickets available');
  }
  this.ticketsSold += quantity;
  return this.save();
};

eventSchema.methods.decrementSold = async function (quantity = 1) {
  this.ticketsSold = Math.max(0, this.ticketsSold - quantity);
  return this.save();
};

// ─── Static Methods ───────────────────────────────────────────────────────────
eventSchema.statics.findUpcoming = function () {
  return this.find({
    date: { $gte: new Date() },
    isPublished: true,
    isCancelled: false,
  }).sort({ date: 1 });
};

eventSchema.statics.findByCategory = function (category) {
  return this.find({
    category: category.toLowerCase(),
    isPublished: true,
    isCancelled: false,
    date: { $gte: new Date() },
  }).sort({ date: 1 });
};

// ─── Pre-save: guard ticketsSold overflow ─────────────────────────────────────
eventSchema.pre('save', function (next) {
  if (this.ticketsSold > this.capacity) {
    return next(new Error('Tickets sold cannot exceed capacity'));
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
