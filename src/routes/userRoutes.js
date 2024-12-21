const express = require('express');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken, verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      console.error('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    console.log('Creating new user with email:', email);
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Generate token
    const token = generateToken(user);
    console.log('Generated token for user:', { id: user.id });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Register error details:', error);
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Received login request for email:', req.body.email);
    const { email, password } = req.body;

    // Find user with organization
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Organization,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      console.error('Login failed: User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      console.error('Login failed: Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set token in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('Login successful for user:', {
      id: user.id,
      email: user.email,
      hasOrg: user.Organizations && user.Organizations.length > 0
    });

    res.json({
      id: user.id,
      email: user.email,
      organization: user.Organizations?.[0] || null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

// Check auth status and get user info
router.get('/session', verifyToken, async (req, res) => {
  try {
    res.json({
      isLoggedIn: true,
      id: req.user.id,
      email: req.user.email,
      organization: req.organization
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Error checking session' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        organization: req.organization
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

module.exports = router;
