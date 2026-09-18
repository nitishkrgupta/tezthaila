import prisma from '../config/db.js';

const subcategoriesMap = {
  'groceries-staples': [
    { name: 'Rice & Grains', slug: 'rice-grains', description: 'Basmati rice, sonamasuri, brown rice, millets and whole grains' },
    { name: 'Pulses & Dals', slug: 'pulses-dals', description: 'Toor dal, moong dal, chana dal, urad dal and masoor dal' },
    { name: 'Atta & Flours', slug: 'atta-flours', description: 'Whole wheat chakki atta, maida, besan, sooji and multigrain flours' },
    { name: 'Edible Oils & Ghee', slug: 'edible-oils-ghee', description: 'Mustard oil, refined sunflower oil, desi cow ghee and olive oil' },
    { name: 'Spices & Masalas', slug: 'spices-masalas', description: 'Whole spices, garam masala, turmeric, chili and kitchen blended masalas' },
    { name: 'Salt, Sugar & Jaggery', slug: 'salt-sugar-jaggery', description: 'Iodized salt, rock salt, refined sugar, brown sugar and organic jaggery' },
    { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', description: 'Almonds, cashews, raisins, walnuts, pistachios and seeds' }
  ],
  'dairy-breakfast': [
    { name: 'Milk & Cream', slug: 'milk-cream', description: 'Fresh toned milk, cow milk, full cream milk and cooking cream' },
    { name: 'Butter & Ghee', slug: 'butter-ghee', description: 'Salted butter, unsalted butter and pure cow ghee' },
    { name: 'Paneer & Curd', slug: 'paneer-curd', description: 'Fresh malai paneer, thick curd, yogurt and flavored yogurts' },
    { name: 'Cheese', slug: 'cheese', description: 'Cheese slices, mozzarella, cheddar and cheese spreads' },
    { name: 'Bread & Bakery', slug: 'bread-bakery', description: 'White bread, whole wheat bread, pav, buns and bakery rusks' },
    { name: 'Breakfast Cereals & Oats', slug: 'cereals-oats', description: 'Cornflakes, muesli, rolled oats and granola' },
    { name: 'Eggs', slug: 'eggs', description: 'Farm fresh white eggs and organic brown eggs' }
  ],
  'fresh-fruits-vegetables': [
    { name: 'Fresh Vegetables', slug: 'fresh-vegetables', description: 'Potatoes, onions, tomatoes, ginger, garlic and seasonal veggies' },
    { name: 'Fresh Fruits', slug: 'fresh-fruits', description: 'Apples, bananas, oranges, seasonal mangoes and papayas' },
    { name: 'Leafy Greens & Herbs', slug: 'leafy-greens-herbs', description: 'Spinach, coriander, mint, methi and fresh curry leaves' },
    { name: 'Exotic Fruits & Veggies', slug: 'exotic-fruits-veggies', description: 'Broccoli, bell peppers, zucchini, dragonfruit and kiwi' }
  ],
  'snacks-beverages': [
    { name: 'Biscuits & Cookies', slug: 'biscuits-cookies', description: 'Digestive biscuits, chocolate cookies, cream biscuits and rusks' },
    { name: 'Namkeen & Snacks', slug: 'namkeen-snacks', description: 'Bhujia, mixture, potato chips, roasted namkeen and papad' },
    { name: 'Tea & Coffee', slug: 'tea-coffee', description: 'Assam CTC tea, green tea, instant coffee and roast coffee' },
    { name: 'Soft Drinks & Juices', slug: 'soft-drinks-juices', description: 'Cold drinks, packaged fruit juices, coconut water and syrups' },
    { name: 'Chocolates & Sweets', slug: 'chocolates-sweets', description: 'Milk chocolates, dark chocolates and Indian packaged mithai' },
    { name: 'Instant Noodles & Pasta', slug: 'noodles-pasta', description: 'Maggi, instant noodles, macaroni and durum wheat pasta' }
  ],
  'personal-care': [
    { name: 'Bath & Body', slug: 'bath-body', description: 'Soaps, body wash, loofahs and hand washes' },
    { name: 'Hair Care', slug: 'hair-care', description: 'Shampoos, conditioners, hair oils and serums' },
    { name: 'Skin Care', slug: 'skin-care', description: 'Face wash, moisturizers, sunscreen and cold creams' },
    { name: 'Oral Care', slug: 'oral-care', description: 'Toothpaste, toothbrushes and mouthwash' },
    { name: 'Deodorants & Perfumes', slug: 'deodorants-perfumes', description: 'Body sprays, roll-ons and eau de parfum' },
    { name: 'Shaving & Grooming', slug: 'shaving-grooming', description: 'Razors, shaving cream, foam and aftershave' }
  ],
  'household-cleaning': [
    { name: 'Detergents & Fabric Care', slug: 'detergents-fabric-care', description: 'Detergent powders, liquid detergents and fabric softeners' },
    { name: 'Dishwashing', slug: 'dishwashing', description: 'Dishwash bars, gels, liquids and scrub pads' },
    { name: 'Cleaners & Disinfectants', slug: 'cleaners-disinfectants', description: 'Floor cleaners, toilet cleaners, glass cleaners and wipes' },
    { name: 'Fresheners & Repellents', slug: 'fresheners-repellents', description: 'Air fresheners, bathroom fresheners and mosquito repellents' },
    { name: 'Cleaning Tools & Mops', slug: 'cleaning-tools', description: 'Brooms, mops, wipers, garbage bags and dustbins' }
  ],
  'electronics-audio': [
    { name: 'Headphones & Earphones', slug: 'headphones-earphones', description: 'Wireless earbuds, neckbands and over-ear headphones' },
    { name: 'Chargers & Cables', slug: 'chargers-cables', description: 'Fast chargers, Type-C cables, Lightning cables and power banks' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Phone holders, OTG adapters and screen protectors' },
    { name: 'Smart Watches & Bands', slug: 'smart-watches', description: 'Fitness trackers and bluetooth calling smartwatches' },
    { name: 'Bluetooth Speakers', slug: 'bluetooth-speakers', description: 'Portable wireless speakers and soundbars' }
  ],
  'kitchen-dining': [
    { name: 'Cookware & Pans', slug: 'cookware-pans', description: 'Non-stick pans, pressure cookers, tawas and kadhais' },
    { name: 'Storage & Containers', slug: 'storage-containers', description: 'Stainless steel dabbas, airtight glass jars and plastic containers' },
    { name: 'Kitchen Tools & Cutlery', slug: 'kitchen-tools-cutlery', description: 'Knives, peelers, graters, spatulas and spoons' },
    { name: 'Bottles & Flasks', slug: 'bottles-flasks', description: 'Water bottles, thermos flasks and copper jugs' }
  ]
};

async function seedSubcategories() {
  console.log('🔄 Seeding subcategories into MySQL...');
  const categories = await prisma.category.findMany();
  let totalCreated = 0;

  for (const cat of categories) {
    const list = subcategoriesMap[cat.slug] || [
      { name: 'General ' + cat.name, slug: 'general-' + cat.slug, description: 'General items for ' + cat.name }
    ];

    for (const sub of list) {
      const existing = await prisma.subcategory.findFirst({
        where: {
          categoryId: cat.id,
          slug: sub.slug
        }
      });

      if (!existing) {
        await prisma.subcategory.create({
          data: {
            categoryId: cat.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            isActive: true
          }
        });
        totalCreated++;
      }
    }
  }

  console.log(`✅ Subcategories seed complete. Created ${totalCreated} new subcategories.`);

  // Link existing products to suitable subcategories if unassigned
  const products = await prisma.product.findMany({ where: { subcategoryId: null } });
  let productsLinked = 0;
  for (const p of products) {
    const firstSub = await prisma.subcategory.findFirst({
      where: { categoryId: p.categoryId }
    });
    if (firstSub) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          subcategoryId: firstSub.id,
          quantityValue: 1,
          quantityUnit: 'kg'
        }
      });
      productsLinked++;
    }
  }
  console.log(`✅ Linked ${productsLinked} existing products to default subcategories.`);
  process.exit(0);
}

seedSubcategories().catch((err) => {
  console.error('❌ Error seeding subcategories:', err);
  process.exit(1);
});
