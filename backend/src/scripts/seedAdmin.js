require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const env = require('../config/env');

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME || 'Tunisie Telecom Admin';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
  }

  await mongoose.connect(env.MONGO_URI);

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase(), role: 'admin' });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    return;
  }

  const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingUser) {
    throw new Error(`A non-admin user already exists with email ${adminEmail}`);
  }

  const passwordHash = await User.hashPassword(adminPassword);
  const admin = await User.create({
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: 'admin',
    isEmailVerified: true,
  });

  await Profile.create({ user: admin._id, fullName: adminFullName });
  console.log(`Admin created successfully: ${admin.email}`);
}

seedAdmin()
  .catch((err) => {
    console.error(`Admin seed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
