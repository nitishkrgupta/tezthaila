import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Tez Thaila database seed...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Cleaning existing tables...');
  await prisma.returnRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const customerPassword = await bcrypt.hash('Customer@123', salt);

  // 3. Create Users
  console.log('👤 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Tez Admin',
      email: 'admin@tezthaila.com',
      phone: '+919876543210',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isActive: true
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'customer@tezthaila.com',
      phone: '+919876543211',
      password: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isActive: true
    }
  });

  // 4. Create Customer Address & Cart
  console.log('🏠 Creating user addresses & initial cart...');
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Rahul Sharma',
      phone: '9876543211',
      house: 'Flat 402, Green Meadows Apartment',
      street: '100 Feet Road, 12th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      landmark: 'Opposite Metro Pillar 84',
      isDefault: true
    }
  });

  await prisma.cart.create({
    data: {
      userId: customer.id
    }
  });

  // 5. Create Categories
  console.log('📂 Creating categories...');
  const categoriesData = [
    {
      name: 'Groceries & Staples',
      slug: 'groceries-staples',
      description: 'Daily essential flours, pulses, rice, edible oils, and whole spices.',
      image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Dairy & Breakfast',
      slug: 'dairy-breakfast',
      description: 'Farm fresh milk, curd, paneer, butter, cheese, bread, and cereals.',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Fresh Fruits & Vegetables',
      slug: 'fresh-fruits-vegetables',
      description: 'Locally sourced crisp organic vegetables and seasonal fresh fruits.',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Snacks & Beverages',
      slug: 'snacks-beverages',
      description: 'Crispy namkeens, biscuits, gourmet teas, roasted coffee, and fruit juices.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Personal Care',
      slug: 'personal-care',
      description: 'Premium soaps, hair care, skin hydration, oral hygiene, and wellness.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Household & Cleaning',
      slug: 'household-cleaning',
      description: 'Detergents, floor disinfectants, dishwashers, and home fresheners.',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Fast chargers, wireless earbuds, smart watches, and phone accessories.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Kitchen & Dining',
      slug: 'kitchen-dining',
      description: 'Non-stick cookware, stainless steel storage containers, and kitchen tools.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80'
    }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    let existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await prisma.category.create({ data: cat });
    }
    categoryMap[cat.slug] = existing.id;
  }

  // 5b. Create Subcategories
  console.log('📂 Creating subcategories...');
  const subcategoriesData = [
    // Groceries & Staples
    { categorySlug: 'groceries-staples', name: 'Rice & Grains', slug: 'rice-grains' },
    { categorySlug: 'groceries-staples', name: 'Pulses & Dals', slug: 'pulses-dals' },
    { categorySlug: 'groceries-staples', name: 'Atta & Flours', slug: 'atta-flours' },
    { categorySlug: 'groceries-staples', name: 'Edible Oils & Ghee', slug: 'edible-oils-ghee' },
    { categorySlug: 'groceries-staples', name: 'Spices & Masalas', slug: 'spices-masalas' },
    { categorySlug: 'groceries-staples', name: 'Salt, Sugar & Jaggery', slug: 'salt-sugar-jaggery' },
    { categorySlug: 'groceries-staples', name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts' },
    // Dairy & Breakfast
    { categorySlug: 'dairy-breakfast', name: 'Milk & Cream', slug: 'milk-cream' },
    { categorySlug: 'dairy-breakfast', name: 'Butter & Ghee', slug: 'butter-ghee' },
    { categorySlug: 'dairy-breakfast', name: 'Paneer & Curd', slug: 'paneer-curd' },
    { categorySlug: 'dairy-breakfast', name: 'Cheese', slug: 'cheese' },
    { categorySlug: 'dairy-breakfast', name: 'Bread & Bakery', slug: 'bread-bakery' },
    { categorySlug: 'dairy-breakfast', name: 'Breakfast Cereals & Oats', slug: 'cereals-oats' },
    { categorySlug: 'dairy-breakfast', name: 'Eggs', slug: 'eggs' },
    // Fresh Fruits & Vegetables
    { categorySlug: 'fresh-fruits-vegetables', name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
    { categorySlug: 'fresh-fruits-vegetables', name: 'Fresh Fruits', slug: 'fresh-fruits' },
    { categorySlug: 'fresh-fruits-vegetables', name: 'Leafy Greens & Herbs', slug: 'leafy-greens-herbs' },
    { categorySlug: 'fresh-fruits-vegetables', name: 'Exotic Fruits & Veggies', slug: 'exotic-fruits-veggies' },
    // Snacks & Beverages
    { categorySlug: 'snacks-beverages', name: 'Biscuits & Cookies', slug: 'biscuits-cookies' },
    { categorySlug: 'snacks-beverages', name: 'Namkeen & Snacks', slug: 'namkeen-snacks' },
    { categorySlug: 'snacks-beverages', name: 'Tea & Coffee', slug: 'tea-coffee' },
    { categorySlug: 'snacks-beverages', name: 'Soft Drinks & Juices', slug: 'soft-drinks-juices' },
    { categorySlug: 'snacks-beverages', name: 'Chocolates & Sweets', slug: 'chocolates-sweets' },
    { categorySlug: 'snacks-beverages', name: 'Instant Noodles & Pasta', slug: 'noodles-pasta' },
    // Personal Care
    { categorySlug: 'personal-care', name: 'Bath & Body', slug: 'bath-body' },
    { categorySlug: 'personal-care', name: 'Hair Care', slug: 'hair-care' },
    { categorySlug: 'personal-care', name: 'Skin Care', slug: 'skin-care' },
    { categorySlug: 'personal-care', name: 'Oral Care', slug: 'oral-care' },
    { categorySlug: 'personal-care', name: 'Deodorants & Perfumes', slug: 'deodorants-perfumes' },
    { categorySlug: 'personal-care', name: 'Shaving & Grooming', slug: 'shaving-grooming' },
    // Household & Cleaning
    { categorySlug: 'household-cleaning', name: 'Detergents & Fabric Care', slug: 'detergents-fabric-care' },
    { categorySlug: 'household-cleaning', name: 'Dishwashing', slug: 'dishwashing' },
    { categorySlug: 'household-cleaning', name: 'Cleaners & Disinfectants', slug: 'cleaners-disinfectants' },
    { categorySlug: 'household-cleaning', name: 'Fresheners & Repellents', slug: 'fresheners-repellents' },
    { categorySlug: 'household-cleaning', name: 'Cleaning Tools & Mops', slug: 'cleaning-tools' },
    // Electronics & Audio
    { categorySlug: 'electronics-audio', name: 'Headphones & Earphones', slug: 'headphones-earphones' },
    { categorySlug: 'electronics-audio', name: 'Chargers & Cables', slug: 'chargers-cables' },
    { categorySlug: 'electronics-audio', name: 'Mobile Accessories', slug: 'mobile-accessories' },
    { categorySlug: 'electronics-audio', name: 'Smart Watches & Bands', slug: 'smart-watches' },
    { categorySlug: 'electronics-audio', name: 'Bluetooth Speakers', slug: 'bluetooth-speakers' },
    // Kitchen & Dining
    { categorySlug: 'kitchen-dining', name: 'Cookware & Pans', slug: 'cookware-pans' },
    { categorySlug: 'kitchen-dining', name: 'Storage & Containers', slug: 'storage-containers' },
    { categorySlug: 'kitchen-dining', name: 'Kitchen Tools & Cutlery', slug: 'kitchen-tools-cutlery' },
    { categorySlug: 'kitchen-dining', name: 'Bottles & Flasks', slug: 'bottles-flasks' }
  ];

  for (const sub of subcategoriesData) {
    const catId = categoryMap[sub.categorySlug];
    if (catId) {
      const existingSub = await prisma.subcategory.findFirst({
        where: { categoryId: catId, slug: sub.slug }
      });
      if (!existingSub) {
        await prisma.subcategory.create({
          data: {
            categoryId: catId,
            name: sub.name,
            slug: sub.slug
          }
        });
      }
    }
  }

  // 6. Create Brands
  console.log('🏷️ Creating brands...');
  const brandsData = [
    { name: 'Amul', slug: 'amul', logo: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=200&q=80', description: 'The Taste of India — dairy excellence since 1946.' },
    { name: 'Aashirvaad', slug: 'aashirvaad', logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80', description: 'ITC trusted staples with superior Sharbati wheat goodness.' },
    { name: 'Tata Sampann', slug: 'tata-sampann', logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80', description: 'Wholesome unpolished dals and spices with retained natural oils.' },
    { name: 'Fortune', slug: 'fortune', logo: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80', description: 'India’s most trusted refined sunflower, mustard and rice bran oils.' },
    { name: 'Haldiram’s', slug: 'haldirams', logo: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=200&q=80', description: 'Authentic royal traditional Indian sweets and savoury snacks.' },
    { name: 'Dabur', slug: 'dabur', logo: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=200&q=80', description: '135+ years of Ayurvedic herbal wellness and natural health.' },
    { name: 'Surf Excel', slug: 'surf-excel', logo: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=200&q=80', description: 'Advanced stain removal formulas for spotless fabric care.' },
    { name: 'boAt', slug: 'boat', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80', description: 'India’s premier audio wear and smart consumer electronics.' },
    { name: 'Prestige', slug: 'prestige', logo: 'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=200&q=80', description: 'Innovative pressure cookers and kitchenware engineered for longevity.' },
    { name: 'Nescafé', slug: 'nescafe', logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80', description: 'Rich instant aromatic coffee crafted from handpicked coffee beans.' }
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    brandMap[b.slug] = created.id;
  }

  // 7. Create Products with Variants and Images
  console.log('📦 Creating products & variants...');
  const productsData = [
    {
      name: 'Aashirvaad Sharbati Select Whole Wheat Atta',
      slug: 'aashirvaad-sharbati-select-whole-wheat-atta',
      sku: 'AASH-ATTA-001',
      description: 'Made from the King of Wheat – Sharbati grains handpicked from Sehore, Madhya Pradesh. Golden grains that absorb more water, making rotis ultra soft, fluffy, and aromatic for hours.',
      shortDescription: '100% pure Sharbati wheat atta for softest rotis.',
      price: 295.00,
      originalPrice: 340.00,
      discountPercentage: 13,
      stock: 120,
      categoryId: categoryMap['groceries-staples'],
      brandId: brandMap['aashirvaad'],
      thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      featured: true,
      bestseller: true,
      variants: [
        { name: 'Weight', value: '1kg', price: 65.00, stock: 50, sku: 'AASH-ATTA-1KG' },
        { name: 'Weight', value: '5kg', price: 295.00, stock: 70, sku: 'AASH-ATTA-5KG' },
        { name: 'Weight', value: '10kg', price: 575.00, stock: 40, sku: 'AASH-ATTA-10KG' }
      ],
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Tata Sampann Unpolished Toor Dal',
      slug: 'tata-sampann-unpolished-toor-dal',
      sku: 'TATA-DAL-001',
      description: 'Unpolished Arhar/Toor Dal that does not undergo artificial water, oil or stone polishing, retaining its natural dietary fiber, wholesome protein content, and authentic homemade taste.',
      shortDescription: 'Rich in protein, 5-step purity tested unpolished dal.',
      price: 185.00,
      originalPrice: 220.00,
      discountPercentage: 16,
      stock: 85,
      categoryId: categoryMap['groceries-staples'],
      brandId: brandMap['tata-sampann'],
      thumbnail: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      featured: true,
      bestseller: false,
      variants: [
        { name: 'Weight', value: '500g', price: 95.00, stock: 40, sku: 'TATA-DAL-500G' },
        { name: 'Weight', value: '1kg', price: 185.00, stock: 45, sku: 'TATA-DAL-1KG' }
      ],
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Amul Pure Cow Ghee Tin',
      slug: 'amul-pure-cow-ghee-tin',
      sku: 'AMUL-GHEE-001',
      description: 'Traditional granular golden cow ghee made from fresh milk fat. Brings rich divine aroma and wholesome nutrition to your dal tadka, sweets, and parathas.',
      shortDescription: '100% natural, aromatic pure cow ghee.',
      price: 610.00,
      originalPrice: 650.00,
      discountPercentage: 6,
      stock: 60,
      categoryId: categoryMap['dairy-breakfast'],
      brandId: brandMap['amul'],
      thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
      featured: true,
      bestseller: true,
      variants: [
        { name: 'Volume', value: '500ml', price: 320.00, stock: 30, sku: 'AMUL-GHEE-500ML' },
        { name: 'Volume', value: '1 Litre', price: 610.00, stock: 30, sku: 'AMUL-GHEE-1L' }
      ],
      images: [
        'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Fortune Sunlite Refined Sunflower Oil',
      slug: 'fortune-sunlite-refined-sunflower-oil',
      sku: 'FORT-OIL-001',
      description: 'Light, healthy and easy to digest refined sunflower oil enriched with Vitamins A and D. Keeps food lighter and crunchier while taking care of your heart.',
      shortDescription: 'Refined sunflower oil enriched with Vitamin A & D.',
      price: 135.00,
      originalPrice: 165.00,
      discountPercentage: 18,
      stock: 150,
      categoryId: categoryMap['groceries-staples'],
      brandId: brandMap['fortune'],
      thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      featured: false,
      bestseller: true,
      variants: [
        { name: 'Volume', value: '1 Litre Pouch', price: 135.00, stock: 90, sku: 'FORT-OIL-1L' },
        { name: 'Volume', value: '5 Litre Jar', price: 670.00, stock: 60, sku: 'FORT-OIL-5L' }
      ],
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Haldiram’s Nagpur Aloo Bhujia Namkeen',
      slug: 'haldirams-nagpur-aloo-bhujia-namkeen',
      sku: 'HALD-BHUJ-001',
      description: 'The iconic Indian crispy potato and chickpea flour snack seasoned with red chilli, mint, and secret royal spice mix. The perfect companion for chai time.',
      shortDescription: 'Crunchy, tangy spicy Indian potato snack.',
      price: 99.00,
      originalPrice: 120.00,
      discountPercentage: 17,
      stock: 200,
      categoryId: categoryMap['snacks-beverages'],
      brandId: brandMap['haldirams'],
      thumbnail: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
      featured: false,
      bestseller: true,
      variants: [
        { name: 'Pack Size', value: '400g', price: 99.00, stock: 120, sku: 'HALD-BHUJ-400G' },
        { name: 'Pack Size', value: '1kg Family Pack', price: 230.00, stock: 80, sku: 'HALD-BHUJ-1KG' }
      ],
      images: [
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'boAt Airdopes 141 Bluetooth Earbuds',
      slug: 'boat-airdopes-141-bluetooth-earbuds',
      sku: 'BOAT-AIR-141',
      description: 'True Wireless earbuds with up to 42 hours playback, Beast Mode for ultra-low 80ms latency gaming, ASAP Fast Charge (5 mins = 75 mins), ENx Environmental Noise Cancellation technology.',
      shortDescription: '42H playback, Beast Mode, IPX4 sweat resistant.',
      price: 1199.00,
      originalPrice: 4490.00,
      discountPercentage: 73,
      stock: 45,
      categoryId: categoryMap['electronics-audio'],
      brandId: brandMap['boat'],
      thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      featured: true,
      bestseller: true,
      variants: [
        { name: 'Color', value: 'Active Black', price: 1199.00, stock: 25, sku: 'BOAT-AIR-141-BLK' },
        { name: 'Color', value: 'Bold Blue', price: 1199.00, stock: 20, sku: 'BOAT-AIR-141-BLU' }
      ],
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Surf Excel Matic Top Load Liquid Detergent',
      slug: 'surf-excel-matic-top-load-liquid-detergent',
      sku: 'SURF-LIQ-001',
      description: 'Engineered specifically for washing machines. Dissolves completely in water without leaving any chalky residue on clothes, delivering superior fragrance and stain removal.',
      shortDescription: 'Tough stain removal in 1 wash for washing machines.',
      price: 399.00,
      originalPrice: 460.00,
      discountPercentage: 13,
      stock: 75,
      categoryId: categoryMap['household-cleaning'],
      brandId: brandMap['surf-excel'],
      thumbnail: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80',
      featured: false,
      bestseller: true,
      variants: [
        { name: 'Size', value: '1 Litre Bottle', price: 215.00, stock: 35, sku: 'SURF-LIQ-1L' },
        { name: 'Size', value: '2 Litre Pouch', price: 399.00, stock: 40, sku: 'SURF-LIQ-2L' }
      ],
      images: [
        'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Prestige Omega Deluxe Induction Non-Stick Pan',
      slug: 'prestige-omega-deluxe-induction-non-stick-pan',
      sku: 'PRES-PAN-001',
      description: 'Manufactured with state-of-the-art German 3-layer stone finish non-stick coating. Metal spoon friendly, PFOA free, suitable for both induction cooktops and gas stoves.',
      shortDescription: 'Durable 3-layer granite non-stick fry pan (24cm).',
      price: 899.00,
      originalPrice: 1450.00,
      discountPercentage: 38,
      stock: 30,
      categoryId: categoryMap['kitchen-dining'],
      brandId: brandMap['prestige'],
      thumbnail: 'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=600&q=80',
      featured: true,
      bestseller: false,
      variants: [
        { name: 'Diameter', value: '240mm (24cm)', price: 899.00, stock: 18, sku: 'PRES-PAN-240' },
        { name: 'Diameter', value: '280mm (28cm)', price: 1099.00, stock: 12, sku: 'PRES-PAN-280' }
      ],
      images: [
        'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  for (const item of productsData) {
    const { variants, images, ...prodFields } = item;
    const product = await prisma.product.create({
      data: prodFields
    });

    if (variants && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            ...v
          }
        });
      }
    }

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i],
            sortOrder: i
          }
        });
      }
    }
  }

  // 8. Create Coupons
  console.log('🎟️ Creating promotional coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10.00,
        minimumOrderAmount: 499.00,
        maximumDiscount: 150.00,
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'FIRSTORDER',
        type: 'FIXED',
        value: 100.00,
        minimumOrderAmount: 399.00,
        maximumDiscount: 100.00,
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'SAVE500',
        type: 'FIXED',
        value: 500.00,
        minimumOrderAmount: 2499.00,
        maximumDiscount: 500.00,
        usageLimit: 200,
        isActive: true
      },
      {
        code: 'FESTIVE20',
        type: 'PERCENTAGE',
        value: 20.00,
        minimumOrderAmount: 999.00,
        maximumDiscount: 300.00,
        usageLimit: 500,
        isActive: true
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('🔑 Demo Admin Account:');
  console.log('   Email:    admin@tezthaila.com');
  console.log('   Password: Admin@123');
  console.log('🔑 Demo Customer Account:');
  console.log('   Email:    customer@tezthaila.com');
  console.log('   Password: Customer@123');
  console.log('--------------------------------------------------');
}

export async function runSeed() {
  await main();
}

if (process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].includes('seed'))) {
  main()
    .catch((e) => {
      console.error('❌ Error executing seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
