const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ---------------------
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ---------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // --- Validation ---
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // --- Check for existing user ---
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // --- Create user ---
    const user = await User.create({
      name,
      email,
      password,
    });

    // --- Generate token & respond ---
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ---------------------
// @route   POST /api/auth/login
// @desc    Authenticate user & return token
// @access  Public
// ---------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // --- Find user (include password for comparison) ---
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // --- Compare password ---
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // --- Generate token & respond ---
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// ---------------------
// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
// ---------------------
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

// ---------------------
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
// ---------------------
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Check if email is being updated to an existing one
      if (req.body.email && req.body.email.toLowerCase() !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email already in use' });
        }
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email ? req.body.email.toLowerCase() : user.email;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// ---------------------
// @route   PUT /api/auth/password
// @desc    Update user password
// @access  Private
// ---------------------
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Find user and select password
    const user = await User.findById(req.user.id).select('+password');

    if (user) {
      // Check old password
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect current password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};
