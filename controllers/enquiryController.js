

const Enquiry = require('../models/Enquiry');

// ─── GET /contact ──────────────────────────────────────────────────────────────
const getContact = async (req, res) => {
  try {
    const user = req.session.user || null;
    let enquiries = [];

    // Only admins see the enquiry table
    if (user && user.role === 'admin') {
      enquiries = await Enquiry.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    }

    res.render('contact', {
      user,
      enquiries,
      success: req.session.success || null,
      error:   req.session.error   || null,
    });
    delete req.session.success;
    delete req.session.error;
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

// ─── POST /enquiries — Submit Enquiry ─────────────────────────────────────────
// contact.ejs form fields: name, email, subject, message
const createEnquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    await Enquiry.create({
      name,
      email,
      subject,
      message,
      status: 'Pending',
      user:   req.session.userId || null,
    });

    req.session.success = 'Your enquiry has been submitted. We will get back to you shortly!';
    res.redirect('/contact');
  } catch (err) {
    req.session.error = err.message;
    res.redirect('/contact');
  }
};

// ─── PUT /enquiries/:id — Update Enquiry Status (Admin only) ──────────────────
// contact.ejs status form sends: { status: 'Pending' | 'Responded' | 'Closed' }
const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      req.session.error = 'Enquiry not found.';
      return res.redirect('/contact');
    }

    await enquiry.updateStatus(status, req.session.userId);

    req.session.success = 'Enquiry status updated.';
    res.redirect('/contact');
  } catch (err) {
    req.session.error = err.message;
    res.redirect('/contact');
  }
};

module.exports = { getContact, createEnquiry, updateEnquiryStatus };
