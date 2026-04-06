const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const PageContent = require('./models/PageContent');
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

  // Create default page content
  const homeContent = await PageContent.findOne({ page: 'home' });
  if (!homeContent) {
    await PageContent.create({
      page: 'home',
      hero: {
        title: 'Breathe Life into Your Event',
        subtitle: 'Experience the rich flavors of Milk & Honey Coffee Cart',
        verse: '"A land flowing with milk and honey" — Exodus 33:3'
      },
      sections: [
        {
          title: 'Premium Coffee Experience',
          content: 'We bring the full coffee shop experience to you. Our cart is equipped with professional espresso machines and experienced baristas to serve your guests with excellence.',
          order: 0
        }
      ]
    });
    console.log('Default home page content created');
  }

  const aboutContent = await PageContent.findOne({ page: 'about' });
  if (!aboutContent) {
    await PageContent.create({
      page: 'about',
      hero: {
        title: 'Our Story',
        subtitle: 'Rooted in faith, brewed with love',
        verse: '"Your mindset is the engine. Your faith is the fuel. Start showing up."'
      },
      sections: [
        {
          title: 'Who We Are',
          content: 'Milk & Honey Coffee Cart is a Christian-based mobile coffee cart company in San Antonio, Texas. We believe that God brought us to this place and gave us this land flowing with milk and honey. Our mission is to serve the community not just with great coffee, but with the love and grace of Jesus Christ.',
          order: 0
        },
        {
          title: 'Our Faith',
          content: "We want to need Jesus the way people need coffee — like we can't get through the day without Him. Every cup we serve is an opportunity to share His love, offer encouragement, and build community. We don't just make drinks; we make connections that matter.",
          order: 1
        },
        {
          title: 'Our Service',
          content: "We bring the coffee cart to you! Whether it's a church event, wedding, corporate gathering, or community celebration, Milk & Honey Coffee Cart delivers a premium coffee experience with a personal touch. Every event is an opportunity to serve with excellence.",
          order: 2
        }
      ]
    });
    console.log('Default about page content created');
  }

  const menuContent = await PageContent.findOne({ page: 'menu' });
  if (!menuContent) {
    await PageContent.create({
      page: 'menu',
      hero: {
        title: 'Latte — Hot / Iced',
        subtitle: 'Crafted with care, served with love',
        verse: '"Taste and see that the Lord is good" — Psalm 34:8'
      },
      sections: []
    });
    console.log('Default menu page content created');
  }

  // Create menu items matching the Milk & Honey Latte menu
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
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
        subItems: [],
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
      },
      {
        name: 'Oat Milk',
        description: 'Premium creamy oat milk alternative.',
        price: 1.00,
        category: 'milk-option',
        tags: ['vegan', 'dairy-free'],
        available: true
      },
      {
        name: 'Almond Milk',
        description: 'Nutty and light almond milk alternative.',
        price: 1.00,
        category: 'milk-option',
        tags: ['vegan', 'dairy-free'],
        available: true
      }
    ]);
    console.log('Menu items created from Milk & Honey latte menu');
  }

  console.log('Seed complete');
  process.exit(0);
};

seedData();
