const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Initializing database connection with config:', {
  database: process.env.DB_NAME || 'saas_template',
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost'
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'saas_template',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: console.log,  // Enable SQL query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection and sync models
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Initialize database
initializeDatabase();

module.exports = sequelize;
