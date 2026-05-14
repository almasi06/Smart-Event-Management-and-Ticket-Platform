require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const path           = require('path');
const connectDB      = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret:            process.env.SESSION_SECRET || 'ae-secret-change-in-production',
  resave:            false,
  saveUninitialized: false,
  cookie:            { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax', 
    maxAge: 1000 * 60 * 60 * 24 
  },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: err.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
