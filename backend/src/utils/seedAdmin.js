const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const seedDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD missing, default admin not seeded');
    return;
  }

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: 'super-admin',
  });

  console.log('Default admin created');
};

module.exports = seedDefaultAdmin;
