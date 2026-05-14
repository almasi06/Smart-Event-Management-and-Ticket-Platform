const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin, validateBookingCapacity, validateObjectId } =
  require('../controllers/dbValidation');

const { getAuth, register, login, logout } =
  require('../controllers/authController');

const { getEvents, getManage, createEvent, updateEvent, deleteEvent } =
  require('../controllers/eventController');

const { getDashboard, createBooking } =
  require('../controllers/bookingController');

const { getContact, createEnquiry, updateEnquiryStatus } =
  require('../controllers/enquiryController');

router.get('/auth', getAuth);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.get('/', getEvents);

router.get('/manage', isLoggedIn, isAdmin, getManage);
router.post('/events', isLoggedIn, isAdmin, createEvent);
router.post('/events/:id', isLoggedIn, isAdmin, validateObjectId(), (req, res, next) => {
  const method = req.query._method;
  if (method === 'PUT')    return updateEvent(req, res, next);
  if (method === 'DELETE') return deleteEvent(req, res, next);
  next();
});

router.get('/dashboard', isLoggedIn, getDashboard);

router.post('/book', isLoggedIn, validateBookingCapacity, createBooking);

router.get('/contact', getContact);
router.post('/enquiries', createEnquiry);
router.post('/enquiries/:id', isLoggedIn, isAdmin, validateObjectId(), (req, res, next) => {
  if (req.query._method === 'PUT') return updateEnquiryStatus(req, res, next);
  next();
});

module.exports = router;