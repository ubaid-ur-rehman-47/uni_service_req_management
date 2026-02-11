require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@university.edu' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@university.edu',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@university.edu');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
