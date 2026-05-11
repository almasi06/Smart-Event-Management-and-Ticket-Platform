

const User = require('../models/User');

// ─── GET /auth ─────────────────────────────────────────────────────────────────
const getAuth = (req, res) => {
  // Pass flash messages (or null) so EJS conditionals don't throw
  res.render('authentication', {
    error:   req.session.error   || null,
    success: req.session.success || null,
    user:    req.session.user    || null,
  });
  // Clear flash after render
  delete req.session.error;
  delete req.session.success;
};

// ─── POST /register ────────────────────────────────────────────────────────────
// authentication.ejs form fields: name, email, password, role
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      req.session.error = 'An account with that email already exists.';
      return res.redirect('/auth');
    }

    // CRITICAL SECURITY FIX: Force 'user' role for public registration.
    await User.create({ name, email, password, role: 'user' });

    req.session.success = 'Account created successfully! Please log in.';
    res.redirect('/auth');
  } catch (err) {
    req.session.error = err.message;
    res.redirect('/auth');
  }
};

// ─── POST /login ───────────────────────────────────────────────────────────────
// authentication.ejs form fields: email, password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // select('+password') overrides the schema's select:false on password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      req.session.error = 'Invalid email or password.';
      return res.redirect('/auth');
    }

    if (!user.isActive) {
      req.session.error = 'Your account has been deactivated.';
      return res.redirect('/auth');
    }

    // Store safe user object in session (no password)
    req.session.userId = user._id.toString();
    req.session.user = {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    };

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.redirect(user.role === 'admin' ? '/manage' : '/dashboard');
  } catch (err) {
    req.session.error = err.message;
    res.redirect('/auth');
  }
};

// ─── POST /logout ──────────────────────────────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth');
  });
};

module.exports = { getAuth, register, login, logout };
