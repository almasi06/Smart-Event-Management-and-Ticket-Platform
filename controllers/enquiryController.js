const Enquiry = require('../models/Enquiry');
const getContact = async (req, res) => {
  try {
    const user = req.session.user || null;
    let enquiries = [];
    let userEnquiries = [];

    if (user) {
      if (user.role === 'admin') {
        
        enquiries = await Enquiry.find({})
          .populate('user', 'name email')
          .populate('resolvedBy', 'name')
          .sort({ createdAt: -1 });
      } else {
      
        userEnquiries = await Enquiry.find({ user: user._id })
          .sort({ createdAt: -1 });
      }
    }

    res.render('contact', {
      user,
      enquiries,
      userEnquiries,
      success: req.session.success || null,
      error:   req.session.error   || null,
    });
    
    
    delete req.session.success;
    delete req.session.error;
  } catch (err) {
    console.error('GetContact error:', err);
    res.status(500).render('error', { message: err.message });
  }
};


const createEnquiry = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    const user = req.session.user || null;

    await Enquiry.create({
      name,
      email,
      subject,
      message,
      phone: phone || '',
      status: 'Pending',
      user: user ? user._id : null,
    });

    req.session.success = 'Your enquiry has been submitted. We will get back to you shortly!';
    res.redirect('/contact');
  } catch (err) {
    console.error('CreateEnquiry error:', err);
    req.session.error = err.message;
    res.redirect('/contact');
  }
};


const updateEnquiryStatus = async (req, res) => {
  try {
    const { status, adminResponse, adminNotes } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    const user = req.session.user;

    if (!enquiry) {
      req.session.error = 'Enquiry not found.';
      return res.redirect('/contact');
    }

  
    await enquiry.updateStatus(
      status,
      user ? user._id : null,
      adminResponse || '',
      adminNotes || ''
    );

    req.session.success = `Enquiry updated. ${adminResponse ? 'Response sent to customer.' : ''}`;
    res.redirect('/contact');
  } catch (err) {
    console.error('UpdateEnquiryStatus error:', err);
    req.session.error = err.message;
    res.redirect('/contact');
  }
};

module.exports = { getContact, createEnquiry, updateEnquiryStatus };