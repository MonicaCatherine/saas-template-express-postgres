const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const sequelize = require('./config/database');
const User = require('./models/User');
const Organization = require('./models/Organization');
const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const schemaMiddleware = require('./middleware/schemaMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3005',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);

// Serve index.html for all routes (SPA setup)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Define relationships
User.hasMany(Organization, { foreignKey: 'createdBy' });
Organization.belongsTo(User, { foreignKey: 'createdBy' });

// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
