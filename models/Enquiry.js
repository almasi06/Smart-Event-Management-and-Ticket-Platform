const mongoose = require('mongoose');

const ENQUIRY_STATUSES = ['Pending', 'Responded', 'Closed'];

const enquirySchema = new mongoose.Schema(
  {
  
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    
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
     
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    
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
    
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [2000, 'Response cannot exceed 2000 characters'],
      default: '',
    },
    
    
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    },
    
    respondedAt: {
      type: Date,
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
    timestamps: true, 
  }
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ user: 1 });


enquirySchema.methods.updateStatus = async function (newStatus, adminId = null, response = '', notes = '') {
  if (!ENQUIRY_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  this.status = newStatus;
  

  if (response && response.trim()) {
    this.adminResponse = response;
    this.respondedAt = new Date();
  }
  
  if (newStatus === 'Closed') {
    this.resolvedAt = new Date();
    this.resolvedBy = adminId;
  }
  
  if (notes) this.adminNotes = notes;
  
  return this.save();
};


enquirySchema.statics.countByStatus = async function () {
  return this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
