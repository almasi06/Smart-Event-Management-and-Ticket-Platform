const mongoose = require('mongoose');

const ENQUIRY_STATUSES = ['Pending', 'Responded', 'Closed'];


const enquirySchema = new mongoose.Schema(
  {
    // Submitted by a logged-in user (optional — guests can also enquire)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Related event (optional)
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    // contact.ejs: <input name="name">
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    // contact.ejs: <input name="email">
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    // contact.ejs: <input name="subject"> 
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    // contact.ejs: <textarea name="message">
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
   
    status: {
      type: String,
      enum: {
        values: ENQUIRY_STATUSES,
        message: `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`,
      },
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // contact.ejs reads enquiry.createdAt
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ user: 1 });

// ─── Instance Method: Update status (used by PUT /enquiries/:id) ──────────────
// contact.ejs posts: { status: 'Pending' | 'Responded' | 'Closed' }
enquirySchema.methods.updateStatus = async function (newStatus, adminId = null, notes = '') {
  if (!ENQUIRY_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  this.status = newStatus;
  if (newStatus === 'Closed') {
    this.resolvedAt = new Date();
    this.resolvedBy = adminId;
  }
  if (notes) this.adminNotes = notes;
  return this.save();
};

// ─── Static: Count by status (for admin analytics) ────────────────────────────
enquirySchema.statics.countByStatus = async function () {
  return this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
