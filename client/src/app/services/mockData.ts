// Realistic Indian E-Commerce Mock Data for Tez Thaila

export const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Groceries & Staples',
    slug: 'groceries-staples',
    description: 'Daily essential flours, pulses, rice, edible oils, and whole spices.',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=600&q=80',
    itemCount: 14,
    subcategories: [
      { id: 1, categoryId: 1, name: 'Rice & Grains', slug: 'rice-grains' },
      { id: 2, categoryId: 1, name: 'Pulses & Dals', slug: 'pulses-dals' },
      { id: 3, categoryId: 1, name: 'Atta & Flours', slug: 'atta-flours' },
      { id: 4, categoryId: 1, name: 'Edible Oils & Ghee', slug: 'edible-oils-ghee' },
      { id: 5, categoryId: 1, name: 'Spices & Masalas', slug: 'spices-masalas' },
      { id: 6, categoryId: 1, name: 'Salt, Sugar & Jaggery', slug: 'salt-sugar-jaggery' },
      { id: 7, categoryId: 1, name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts' }
    ]
  },
  {
    id: 2,
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    description: 'Farm fresh milk, curd, paneer, butter, cheese, bread, and breakfast cereals.',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
    itemCount: 8,
    subcategories: [
      { id: 8, categoryId: 2, name: 'Milk & Cream', slug: 'milk-cream' },
      { id: 9, categoryId: 2, name: 'Butter & Ghee', slug: 'butter-ghee' },
      { id: 10, categoryId: 2, name: 'Paneer & Curd', slug: 'paneer-curd' },
      { id: 11, categoryId: 2, name: 'Cheese', slug: 'cheese' },
      { id: 12, categoryId: 2, name: 'Bread & Bakery', slug: 'bread-bakery' },
      { id: 13, categoryId: 2, name: 'Breakfast Cereals & Oats', slug: 'cereals-oats' },
      { id: 14, categoryId: 2, name: 'Eggs', slug: 'eggs' }
    ]
  },
  {
    id: 3,
    name: 'Fresh Fruits & Vegetables',
    slug: 'fresh-fruits-vegetables',
    description: 'Locally sourced crisp organic vegetables and seasonal fresh fruits.',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    itemCount: 10,
    subcategories: [
      { id: 15, categoryId: 3, name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
      { id: 16, categoryId: 3, name: 'Fresh Fruits', slug: 'fresh-fruits' },
      { id: 17, categoryId: 3, name: 'Leafy Greens & Herbs', slug: 'leafy-greens-herbs' },
      { id: 18, categoryId: 3, name: 'Exotic Fruits & Veggies', slug: 'exotic-fruits-veggies' }
    ]
  },
  {
    id: 4,
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    description: 'Crispy namkeens, biscuits, gourmet teas, roasted coffee, and fruit juices.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80',
    itemCount: 9,
    subcategories: [
      { id: 19, categoryId: 4, name: 'Biscuits & Cookies', slug: 'biscuits-cookies' },
      { id: 20, categoryId: 4, name: 'Namkeen & Snacks', slug: 'namkeen-snacks' },
      { id: 21, categoryId: 4, name: 'Tea & Coffee', slug: 'tea-coffee' },
      { id: 22, categoryId: 4, name: 'Soft Drinks & Juices', slug: 'soft-drinks-juices' },
      { id: 23, categoryId: 4, name: 'Chocolates & Sweets', slug: 'chocolates-sweets' },
      { id: 24, categoryId: 4, name: 'Instant Noodles & Pasta', slug: 'noodles-pasta' }
    ]
  },
  {
    id: 5,
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Premium soaps, hair care, skin hydration, oral hygiene, and Ayurvedic wellness.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    itemCount: 7,
    subcategories: [
      { id: 25, categoryId: 5, name: 'Bath & Body', slug: 'bath-body' },
      { id: 26, categoryId: 5, name: 'Hair Care', slug: 'hair-care' },
      { id: 27, categoryId: 5, name: 'Skin Care', slug: 'skin-care' },
      { id: 28, categoryId: 5, name: 'Oral Care', slug: 'oral-care' },
      { id: 29, categoryId: 5, name: 'Deodorants & Perfumes', slug: 'deodorants-perfumes' },
      { id: 30, categoryId: 5, name: 'Shaving & Grooming', slug: 'shaving-grooming' }
    ]
  },
  {
    id: 6,
    name: 'Household & Cleaning',
    slug: 'household-cleaning',
    description: 'Detergents, floor disinfectants, dishwashers, and aromatic home fresheners.',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    itemCount: 6,
    subcategories: [
      { id: 31, categoryId: 6, name: 'Detergents & Fabric Care', slug: 'detergents-fabric-care' },
      { id: 32, categoryId: 6, name: 'Dishwashing', slug: 'dishwashing' },
      { id: 33, categoryId: 6, name: 'Cleaners & Disinfectants', slug: 'cleaners-disinfectants' },
      { id: 34, categoryId: 6, name: 'Fresheners & Repellents', slug: 'fresheners-repellents' },
      { id: 35, categoryId: 6, name: 'Cleaning Tools & Mops', slug: 'cleaning-tools' }
    ]
  },
  {
    id: 7,
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    description: 'Fast chargers, wireless earbuds, smart watches, and phone accessories.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    itemCount: 8,
    subcategories: [
      { id: 36, categoryId: 7, name: 'Headphones & Earphones', slug: 'headphones-earphones' },
      { id: 37, categoryId: 7, name: 'Chargers & Cables', slug: 'chargers-cables' },
      { id: 38, categoryId: 7, name: 'Mobile Accessories', slug: 'mobile-accessories' },
      { id: 39, categoryId: 7, name: 'Smart Watches & Bands', slug: 'smart-watches' },
      { id: 40, categoryId: 7, name: 'Bluetooth Speakers', slug: 'bluetooth-speakers' }
    ]
  },
  {
    id: 8,
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Non-stick cookware, stainless steel storage containers, and kitchen tools.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    itemCount: 6,
    subcategories: [
      { id: 41, categoryId: 8, name: 'Cookware & Pans', slug: 'cookware-pans' },
      { id: 42, categoryId: 8, name: 'Storage & Containers', slug: 'storage-containers' },
      { id: 43, categoryId: 8, name: 'Kitchen Tools & Cutlery', slug: 'kitchen-tools-cutlery' },
      { id: 44, categoryId: 8, name: 'Bottles & Flasks', slug: 'bottles-flasks' }
    ]
  }
];

export const INITIAL_BRANDS = [
  { id: 1, name: 'Amul', slug: 'amul', logo: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Aashirvaad', slug: 'aashirvaad', logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Tata Sampann', slug: 'tata-sampann', logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80' },
  { id: 4, name: 'Fortune', slug: 'fortune', logo: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80' },
  { id: 5, name: 'Haldiram’s', slug: 'haldirams', logo: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=200&q=80' },
  { id: 6, name: 'Dabur', slug: 'dabur', logo: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=200&q=80' },
  { id: 7, name: 'Surf Excel', slug: 'surf-excel', logo: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=200&q=80' },
  { id: 8, name: 'boAt', slug: 'boat', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80' },
  { id: 9, name: 'Prestige', slug: 'prestige', logo: 'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=200&q=80' },
  { id: 10, name: 'Nescafé', slug: 'nescafe', logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80' }
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Aashirvaad Sharbati Select Whole Wheat Atta',
    slug: 'aashirvaad-sharbati-select-whole-wheat-atta',
    sku: 'AASH-ATTA-001',
    description: 'Made from 100% pure MP Sharbati grains. Ground with traditional chakki process to preserve nutrients, making rotis stay softer and fluffier for longer.',
    shortDescription: '100% pure Sharbati wheat atta for the softest rotis.',
    price: 295,
    originalPrice: 340,
    discountPercentage: 13,
    stock: 120,
    categoryId: 1,
    brandId: 2,
    brandName: 'Aashirvaad',
    categorySlug: 'groceries-staples',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 142,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 101, name: 'Weight', value: '1kg', price: 65, stock: 50, sku: 'AASH-ATTA-1KG' },
      { id: 102, name: 'Weight', value: '5kg', price: 295, stock: 70, sku: 'AASH-ATTA-5KG' },
      { id: 103, name: 'Weight', value: '10kg', price: 575, stock: 40, sku: 'AASH-ATTA-10KG' }
    ]
  },
  {
    id: 2,
    name: 'Tata Sampann Unpolished Toor Dal',
    slug: 'tata-sampann-unpolished-toor-dal',
    sku: 'TATA-DAL-001',
    description: 'Unpolished Arhar/Toor Dal that does not undergo artificial polishing with water, oil, or marble powder, retaining its wholesome dietary fiber and pure taste.',
    shortDescription: 'Rich in dietary fiber and essential plant protein.',
    price: 185,
    originalPrice: 220,
    discountPercentage: 16,
    stock: 85,
    categoryId: 1,
    brandId: 3,
    brandName: 'Tata Sampann',
    categorySlug: 'groceries-staples',
    thumbnail: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewsCount: 89,
    featured: true,
    bestseller: false,
    active: true,
    variants: [
      { id: 104, name: 'Weight', value: '500g', price: 95, stock: 40, sku: 'TATA-DAL-500G' },
      { id: 105, name: 'Weight', value: '1kg', price: 185, stock: 45, sku: 'TATA-DAL-1KG' }
    ]
  },
  {
    id: 3,
    name: 'Amul Pure Cow Ghee Tin',
    slug: 'amul-pure-cow-ghee-tin',
    sku: 'AMUL-GHEE-001',
    description: 'Traditional golden granular cow ghee made from pure milk fat. Offers an appetizing aroma and royal taste to curries, rotis, and Indian sweets.',
    shortDescription: '100% natural, aromatic pure cow ghee.',
    price: 610,
    originalPrice: 650,
    discountPercentage: 6,
    stock: 60,
    categoryId: 2,
    brandId: 1,
    brandName: 'Amul',
    categorySlug: 'dairy-breakfast',
    thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 310,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 106, name: 'Volume', value: '500ml', price: 320, stock: 30, sku: 'AMUL-GHEE-500ML' },
      { id: 107, name: 'Volume', value: '1 Litre', price: 610, stock: 30, sku: 'AMUL-GHEE-1L' }
    ]
  },
  {
    id: 4,
    name: 'Fortune Sunlite Refined Sunflower Oil',
    slug: 'fortune-sunlite-refined-sunflower-oil',
    sku: 'FORT-OIL-001',
    description: 'Light, healthy and easy to digest refined sunflower oil enriched with Vitamins A and D. Retains natural food flavors without heavy greasiness.',
    shortDescription: 'Enriched with Vitamin A & D for a lighter heart.',
    price: 135,
    originalPrice: 165,
    discountPercentage: 18,
    stock: 150,
    categoryId: 1,
    brandId: 4,
    brandName: 'Fortune',
    categorySlug: 'groceries-staples',
    thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 118,
    featured: false,
    bestseller: true,
    active: true,
    variants: [
      { id: 108, name: 'Volume', value: '1L Pouch', price: 135, stock: 90, sku: 'FORT-OIL-1L' },
      { id: 109, name: 'Volume', value: '5L Jar', price: 670, stock: 60, sku: 'FORT-OIL-5L' }
    ]
  },
  {
    id: 5,
    name: 'Haldiram’s Nagpur Aloo Bhujia Namkeen',
    slug: 'haldirams-nagpur-aloo-bhujia-namkeen',
    sku: 'HALD-BHUJ-001',
    description: 'Crisp, spicy Indian potato noodles seasoned with royal mint, red chilli, and secret garam masala blend. The ultimate tea-time companion.',
    shortDescription: 'Crunchy, tangy spicy Indian potato snack.',
    price: 99,
    originalPrice: 120,
    discountPercentage: 17,
    stock: 200,
    categoryId: 4,
    brandId: 5,
    brandName: 'Haldiram’s',
    categorySlug: 'snacks-beverages',
    thumbnail: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 520,
    featured: false,
    bestseller: true,
    active: true,
    variants: [
      { id: 110, name: 'Pack Size', value: '400g', price: 99, stock: 120, sku: 'HALD-BHUJ-400G' },
      { id: 111, name: 'Pack Size', value: '1kg Family', price: 230, stock: 80, sku: 'HALD-BHUJ-1KG' }
    ]
  },
  {
    id: 6,
    name: 'boAt Airdopes 141 True Wireless Earbuds',
    slug: 'boat-airdopes-141-true-wireless-earbuds',
    sku: 'BOAT-AIR-141',
    description: 'True wireless earbuds with 42H total playback, Beast Mode (80ms low latency), ASAP Charge (5 min charge = 75 min playtime), and ENx environmental noise cancellation.',
    shortDescription: '42H Playtime, Beast Mode, IPX4 Water Resistance.',
    price: 1199,
    originalPrice: 4490,
    discountPercentage: 73,
    stock: 45,
    categoryId: 7,
    brandId: 8,
    brandName: 'boAt',
    categorySlug: 'electronics-audio',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.5,
    reviewsCount: 840,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 112, name: 'Color', value: 'Active Black', price: 1199, stock: 25, sku: 'BOAT-AIR-141-BLK' },
      { id: 113, name: 'Color', value: 'Bold Blue', price: 1199, stock: 20, sku: 'BOAT-AIR-141-BLU' }
    ]
  },
  {
    id: 7,
    name: 'Surf Excel Matic Top Load Liquid Detergent',
    slug: 'surf-excel-matic-top-load-liquid-detergent',
    sku: 'SURF-LIQ-001',
    description: 'Engineered specifically for washing machines. Dissolves 100% faster than powders without leaving white powdery residue, giving clothes spotless freshness.',
    shortDescription: 'Tough stain removal in 1 wash for washing machines.',
    price: 399,
    originalPrice: 460,
    discountPercentage: 13,
    stock: 75,
    categoryId: 6,
    brandId: 7,
    brandName: 'Surf Excel',
    categorySlug: 'household-cleaning',
    thumbnail: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 290,
    featured: false,
    bestseller: true,
    active: true,
    variants: [
      { id: 114, name: 'Size', value: '1L Bottle', price: 215, stock: 35, sku: 'SURF-LIQ-1L' },
      { id: 115, name: 'Size', value: '2L Pouch', price: 399, stock: 40, sku: 'SURF-LIQ-2L' }
    ]
  },
  {
    id: 8,
    name: 'Prestige Omega Deluxe Induction Fry Pan',
    slug: 'prestige-omega-deluxe-induction-fry-pan',
    sku: 'PRES-PAN-001',
    description: 'Manufactured with durable 3-layer German granite non-stick coating. Metal spoon friendly, PFOA free, suitable for both gas stoves and induction cooktops.',
    shortDescription: 'Durable 3-layer granite non-stick fry pan (24cm).',
    price: 899,
    originalPrice: 1450,
    discountPercentage: 38,
    stock: 30,
    categoryId: 8,
    brandId: 9,
    brandName: 'Prestige',
    categorySlug: 'kitchen-dining',
    thumbnail: 'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1584990347449-399c56434449?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 95,
    featured: true,
    bestseller: false,
    active: true,
    variants: [
      { id: 116, name: 'Diameter', value: '24cm', price: 899, stock: 18, sku: 'PRES-PAN-240' },
      { id: 117, name: 'Diameter', value: '28cm', price: 1099, stock: 12, sku: 'PRES-PAN-280' }
    ]
  },
  {
    id: 9,
    name: 'Nescafé Classic Instant Coffee Glass Jar',
    slug: 'nescafe-classic-instant-coffee-glass-jar',
    sku: 'NESC-COFF-001',
    description: '100% pure Robusta and Arabica coffee beans roasted to perfection. Signature rich aroma and bold coffee flavor to ignite your mornings.',
    shortDescription: 'Signature rich aroma and bold morning coffee.',
    price: 299,
    originalPrice: 360,
    discountPercentage: 17,
    stock: 90,
    categoryId: 4,
    brandId: 10,
    brandName: 'Nescafé',
    categorySlug: 'snacks-beverages',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 340,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 118, name: 'Weight', value: '100g Jar', price: 299, stock: 50, sku: 'NESC-100G' },
      { id: 119, name: 'Weight', value: '200g Jar', price: 560, stock: 40, sku: 'NESC-200G' }
    ]
  },
  {
    id: 10,
    name: 'Dabur Pure Honey Squeezy Pack',
    slug: 'dabur-pure-honey-squeezy-pack',
    sku: 'DAB-HONY-001',
    description: '100% pure honey sourced directly from select apiaries across the Himalayas. NMR tested for pure quality with zero adulteration or added sugar.',
    shortDescription: '100% Pure, NMR tested honey with zero added sugar.',
    price: 215,
    originalPrice: 250,
    discountPercentage: 14,
    stock: 80,
    categoryId: 1,
    brandId: 6,
    brandName: 'Dabur',
    categorySlug: 'groceries-staples',
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewsCount: 165,
    featured: false,
    bestseller: true,
    active: true,
    variants: [
      { id: 120, name: 'Weight', value: '400g Squeezy', price: 215, stock: 45, sku: 'DAB-HONY-400G' },
      { id: 121, name: 'Weight', value: '1kg Bottle', price: 440, stock: 35, sku: 'DAB-HONY-1KG' }
    ]
  },
  {
    id: 11,
    name: 'Fresh Farm Spinach (Palak)',
    slug: 'fresh-farm-spinach-palak',
    sku: 'VEG-PALAK-001',
    description: 'Hydroponically washed, vibrant green spinach leaves full of iron, potassium, and antioxidants. Harvested early morning for crispy freshness.',
    shortDescription: 'Tender, organic, farm-fresh spinach bunch.',
    price: 25,
    originalPrice: 35,
    discountPercentage: 29,
    stock: 140,
    categoryId: 3,
    brandId: null,
    brandName: 'Farm Fresh',
    categorySlug: 'fresh-fruits-vegetables',
    thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 68,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 122, name: 'Pack', value: '250g Bunch', price: 25, stock: 90, sku: 'PALAK-250G' },
      { id: 123, name: 'Pack', value: '500g Bunch', price: 45, stock: 50, sku: 'PALAK-500G' }
    ]
  },
  {
    id: 12,
    name: 'Royal Shimla Red Apples Box',
    slug: 'royal-shimla-red-apples-box',
    sku: 'FRT-APPL-001',
    description: 'Crisp, sweet, and juicy handpicked mountain apples from the orchards of Shimla, Himachal Pradesh. Packed in safety breathable cartons.',
    shortDescription: 'Crisp, naturally sweet Shimla mountain apples.',
    price: 189,
    originalPrice: 240,
    discountPercentage: 21,
    stock: 70,
    categoryId: 3,
    brandId: null,
    brandName: 'Farm Fresh',
    categorySlug: 'fresh-fruits-vegetables',
    thumbnail: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 112,
    featured: true,
    bestseller: true,
    active: true,
    variants: [
      { id: 124, name: 'Weight', value: '1kg (4-5 pcs)', price: 189, stock: 40, sku: 'APPL-1KG' },
      { id: 125, name: 'Weight', value: '2kg Gift Box', price: 360, stock: 30, sku: 'APPL-2KG' }
    ]
  }
];

export const INITIAL_COUPONS = [
  {
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minimumOrderAmount: 499,
    maximumDiscount: 150,
    description: '10% off up to ₹150 on orders above ₹499'
  },
  {
    code: 'FIRSTORDER',
    type: 'FIXED',
    value: 100,
    minimumOrderAmount: 399,
    maximumDiscount: 100,
    description: 'Flat ₹100 off on your first order above ₹399'
  },
  {
    code: 'SAVE500',
    type: 'FIXED',
    value: 500,
    minimumOrderAmount: 2499,
    maximumDiscount: 500,
    description: 'Flat ₹500 off on mega cart orders above ₹2,499'
  },
  {
    code: 'FESTIVE20',
    type: 'PERCENTAGE',
    value: 20,
    minimumOrderAmount: 999,
    maximumDiscount: 300,
    description: '20% off up to ₹300 on festive celebrations'
  }
];

export const DEMO_USERS = {
  admin: {
    id: 1,
    name: 'Tez Admin',
    email: 'admin@tezthaila.com',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  customer: {
    id: 2,
    name: 'Rahul Sharma',
    email: 'customer@tezthaila.com',
    role: 'CUSTOMER',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  }
};

export const INITIAL_ADDRESSES = [
  {
    id: 1,
    userId: 2,
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
  },
  {
    id: 2,
    userId: 2,
    fullName: 'Rahul Sharma (Office)',
    phone: '9876543211',
    house: 'Level 5, TechHub Tower B',
    street: 'Outer Ring Road, Bellandur',
    area: 'Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    landmark: 'Near Ecospace Flyover',
    isDefault: false
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'TT-2026-884920',
    orderNumber: 'TT-2026-884920',
    userId: 2,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    orderStatus: 'DELIVERED',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    subtotal: 1090,
    discount: 100,
    shippingFee: 0,
    tax: 49,
    totalAmount: 1039,
    couponCode: 'FIRSTORDER',
    trackingNumber: 'TT-EXP-99214',
    estimatedDelivery: new Date(Date.now() - 86400000).toISOString(),
    address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Aashirvaad Sharbati Select Whole Wheat Atta',
        variantName: '5kg',
        quantity: 1,
        price: 295,
        subtotal: 295,
        thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 2,
        productId: 3,
        productName: 'Amul Pure Cow Ghee Tin',
        variantName: '1 Litre',
        quantity: 1,
        price: 610,
        subtotal: 610,
        thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 3,
        productId: 2,
        productName: 'Tata Sampann Unpolished Toor Dal',
        variantName: '1kg',
        quantity: 1,
        price: 185,
        subtotal: 185,
        thumbnail: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80'
      }
    ]
  },
  {
    id: 'TT-2026-904128',
    orderNumber: 'TT-2026-904128',
    userId: 2,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    orderStatus: 'SHIPPED',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    subtotal: 1199,
    discount: 119,
    shippingFee: 0,
    tax: 54,
    totalAmount: 1134,
    couponCode: 'WELCOME10',
    trackingNumber: 'TT-EXP-10492',
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: 4,
        productId: 6,
        productName: 'boAt Airdopes 141 True Wireless Earbuds',
        variantName: 'Active Black',
        quantity: 1,
        price: 1199,
        subtotal: 1199,
        thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80'
      }
    ]
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 1,
    productId: 1,
    userName: 'Priya Sundaram',
    rating: 5,
    title: 'Fluffiest rotis ever!',
    comment: 'Been using Aashirvaad Sharbati atta for the last 6 months. Rotis remain soft even when packed in kids school lunch boxes till evening. Highly recommended!',
    date: '12 Sep 2026',
    verified: true
  },
  {
    id: 2,
    productId: 3,
    userName: 'Vikram Joshi',
    rating: 5,
    title: 'Authentic cow ghee aroma',
    comment: 'Granular texture and divine aroma. Reminds me of homemade desi ghee in our village in Rajasthan.',
    date: '10 Sep 2026',
    verified: true
  },
  {
    id: 3,
    productId: 6,
    userName: 'Arjun Nair',
    rating: 4,
    title: 'Incredible battery life & bass',
    comment: 'Best earbuds under ₹1500. Beast Mode gaming latency is barely noticeable. Fast delivery by Tez Thaila in under 4 hours!',
    date: '14 Sep 2026',
    verified: true
  }
];
