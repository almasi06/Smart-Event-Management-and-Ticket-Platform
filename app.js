require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const path           = require('path');
const connectDB      = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Database
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  secret:            process.env.SESSION_SECRET || 'ae-secret-change-in-production',
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, maxAge: 1000 * 60 * 60 * 24 },
}));

// ===== CRITICAL FIX: Make user available to ALL views =====
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes'));

// 404 Handler (FIXED)
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

// Global Error Handler (FIXED)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: err.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
