/**
 * Update Menu Script
 * Replaces all existing products with the Milk & Honey latte menu items.
 * Run: node server/update-menu.js
 */
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const newMenuItems = [
  {
    name: 'Milk and Honey Latte',
    description: 'Made with sweetened condensed milk and pecan honey.',
    price: 7.00,
    category: 'signature-latte',
    tags: ['signature', 'honey', 'hot/iced'],
    milkOptions: ['whole milk', 'breve half & half', 'oat milk'],
    available: true,
    featured: true
  },
  {
    name: 'Horchata Latte',
    description: 'Made with horchata milk and a hint of brown sugar cinnamon.',
    price: 7.00,
    category: 'signature-latte',
    tags: ['signature', 'cinnamon', 'hot/iced'],
    milkOptions: ['whole milk', 'breve half & half', 'oat milk'],
    available: true,
    featured: true
  },
  {
    name: 'Vanilla Latte',
    description: 'Classic vanilla latte, smooth and sweet.',
    price: 6.00,
    category: 'original-latte',
    tags: ['classic', 'hot/iced'],
    milkOptions: ['whole milk', 'breve half & half', 'oat milk'],
    available: true
  },
  {
    name: 'Hazelnut Latte',
    description: 'Rich hazelnut flavor with perfectly pulled espresso.',
    price: 6.00,
    category: 'original-latte',
    tags: ['classic', 'hot/iced'],
    milkOptions: ['whole milk', 'breve half & half', 'oat milk'],
    available: true
  },
  {
    name: 'Caramel Latte',
    description: 'Smooth caramel with espresso and your choice of milk.',
    price: 6.00,
    category: 'original-latte',
    tags: ['classic', 'hot/iced'],
    milkOptions: ['whole milk', 'breve half & half', 'oat milk'],
    available: true
  },
  {
    name: 'Cold Foam',
    description: 'Add cold foam to any drink.',
    price: 0.50,
    category: 'add-on',
    tags: ['add-on'],
    available: true
  }
];

const updateMenu = async () => {
  await connectDB();

  console.log('Removing old menu items...');
  await Product.deleteMany({});
  console.log('Old items removed.');

  console.log('Inserting new Milk & Honey latte menu...');
  const inserted = await Product.insertMany(newMenuItems);
  console.log(`${inserted.length} menu items inserted:`);
  inserted.forEach(item => {
    console.log(`  - ${item.name} ($${item.price.toFixed(2)}) [${item.category}]`);
  });

  console.log('\nMenu update complete!');
  process.exit(0);
};

updateMenu().catch(err => {
  console.error('Error updating menu:', err);
  process.exit(1);
});
