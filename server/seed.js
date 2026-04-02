require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  // Create admin user
  const adminExists = await User.findOne({ email: 'admin@milkandhoney.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@milkandhoney.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created: admin@milkandhoney.com / admin123');
  }

  // Create default site settings
  const settingsExist = await SiteSettings.findOne();
  if (!settingsExist) {
    await SiteSettings.create({
      businessEmail: 'Angel@milkandhoney.co',
      businessAddress: 'San Antonio, TX',
      instagramHandle: 'milkandhoneycoffeecart'
    });
    console.log('Default site settings created');
  }

  // Create sample menu items (showcase — what we serve at events)
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      { name: 'Classic Latte', description: 'Rich espresso with steamed milk, a timeless favorite crafted with love.', price: 0, category: 'hot-coffee', tags: ['popular', 'classic'], available: true, featured: true },
      { name: 'Honey Latte', description: 'Our signature drink — espresso with local honey and steamed milk. Sweet as God\'s promises.', price: 0, category: 'hot-coffee', tags: ['signature', 'popular', 'honey'], available: true, featured: true },
      { name: 'Vanilla Cappuccino', description: 'Velvety espresso with vanilla and perfectly frothed milk.', price: 0, category: 'hot-coffee', tags: ['classic'], available: true },
      { name: 'Caramel Macchiato', description: 'Layered espresso, vanilla, and caramel drizzle. A sweet blessing in a cup.', price: 0, category: 'hot-coffee', tags: ['popular', 'sweet'], available: true, featured: true },
      { name: 'Mocha', description: 'Rich chocolate and espresso topped with whipped cream.', price: 0, category: 'hot-coffee', tags: ['chocolate'], available: true },
      { name: 'Iced Honey Latte', description: 'Our signature honey latte served over ice — refreshing and sweet.', price: 0, category: 'iced-coffee', tags: ['signature', 'popular', 'honey'], available: true, featured: true },
      { name: 'Iced Vanilla Latte', description: 'Smooth vanilla espresso over ice, perfect for a warm Texas day.', price: 0, category: 'iced-coffee', tags: ['popular'], available: true },
      { name: 'Cold Brew', description: 'Slow-steeped for 24 hours. Smooth, bold, and never bitter.', price: 0, category: 'iced-coffee', tags: ['bold'], available: true },
      { name: 'Iced Caramel Latte', description: 'Espresso, milk, and caramel over ice. Pure indulgence.', price: 0, category: 'iced-coffee', tags: ['sweet'], available: true },
      { name: 'Lavender Honey Latte', description: 'A heavenly blend of lavender, local honey, and espresso. Peace in a cup.', price: 0, category: 'specialty', tags: ['unique', 'honey', 'floral'], available: true, featured: true },
      { name: 'Brown Sugar Oat Milk Latte', description: 'Rich brown sugar with creamy oat milk and espresso.', price: 0, category: 'specialty', tags: ['dairy-free'], available: true },
      { name: 'Chai Tea Latte', description: 'Warm spiced chai with steamed milk — comfort and peace.', price: 0, category: 'non-coffee', tags: ['tea'], available: true },
      { name: 'Hot Chocolate', description: 'Rich and creamy hot chocolate, made with love.', price: 0, category: 'non-coffee', tags: ['kid-friendly', 'chocolate'], available: true },
      { name: 'Fresh Lemonade', description: 'Hand-squeezed lemonade, refreshing and bright.', price: 0, category: 'non-coffee', tags: ['refreshing', 'caffeine-free'], available: true }
    ]);
    console.log('Sample menu items created');
  }

  console.log('Seed complete');
  process.exit(0);
};

seedData();
