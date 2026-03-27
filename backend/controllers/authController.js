const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');


// Register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (userExists.rows.length > 0) {
    return next(new AppError('Email already registered', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );

  // Send welcome email
  sendWelcomeEmail(newUser.rows[0].id);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please login.',
    user: newUser.rows[0]
  });
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid email or password', 401));
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    return next(new AppError('Account has been deactivated', 403));
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  // Remove password from response
  delete user.password;

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user
  });
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Get user based on POSTed email
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return next(new AppError('No user found with that email address', 404));
  }

  const user = result.rows[0];

  // 2. Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set expiry (e.g., 1 hour from now)
  const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // 4. Save to DB
  await db.query(
    'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
    [hashedToken, tokenExpiry, user.id]
  );

  // 5. Send it via email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Token sent to email!'
    });
  } catch (err) {
    // If error sending email, clear the token fields
    await db.query(
      'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1',
      [user.id]
    );

    return next(new AppError('Error sending the email. Try again later', 500));
  }
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // 1. Get user based on hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const result = await db.query(
    'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const user = result.rows[0];

  // 2. Update password and clear token fields
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
    [hashedPassword, user.id]
  );

  // 3. Respond
  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now log in.'
  });
});