import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minDiscount,
      featured,
      bestseller,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = { active: true };

    const searchQuery = search || q;
    if (searchQuery && searchQuery.trim()) {
      where.OR = [
        { name: { contains: searchQuery.trim() } },
        { description: { contains: searchQuery.trim() } }
      ];
    }

    if (category) {
      if (Array.isArray(category)) {
        where.category = { slug: { in: category } };
      } else if (category.includes(',')) {
        where.category = { slug: { in: category.split(',').map((c) => c.trim()) } };
      } else {
        where.category = { slug: category };
      }
    }

    if (brand) {
      const brandsList = Array.isArray(brand)
        ? brand
        : brand.includes(',')
        ? brand.split(',').map((b) => b.trim())
        : [brand];
      where.brand = { name: { in: brandsList } };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    if (minDiscount !== undefined && minDiscount !== '') {
      where.discountPercentage = { gte: parseInt(minDiscount) };
    }

    if (featured === true || featured === 'true') {
      where.featured = true;
    }

    if (bestseller === true || bestseller === 'true') {
      where.bestseller = true;
    }

    // Sorting
    let orderBy = { id: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'discount') {
      orderBy = { discountPercentage: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'popularity') {
      orderBy = { bestseller: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          variants: true,
          images: { select: { id: true, url: true, sortOrder: true } },
          reviews: { select: { rating: true } }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    // Format products for frontend
    const formatted = products.map((p) => {
      const reviewCount = p.reviews?.length || 0;
      const avgRating = reviewCount > 0
        ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 4.5;

      const imgUrls = p.images?.length > 0
        ? p.images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url)
        : [p.thumbnail];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        price: Number(p.price),
        originalPrice: Number(p.originalPrice || p.price),
        discountPercentage: p.discountPercentage,
        stock: p.stock,
        maxQuantityPerOrder: p.maxQuantityPerOrder || 10,
        categoryId: p.categoryId,
        categorySlug: p.category?.slug,
        category: p.category,
        subcategoryId: p.subcategoryId,
        subcategoryName: p.subcategory?.name,
        subcategory: p.subcategory,
        quantityValue: p.quantityValue ? Number(p.quantityValue) : undefined,
        quantityUnit: p.quantityUnit || undefined,
        brandName: p.brand?.name || 'Tez Brand',
        brand: p.brand,
        thumbnail: p.thumbnail,
        images: imgUrls,
        rating: avgRating,
        reviewsCount: reviewCount || 12,
        featured: p.featured,
        bestseller: p.bestseller,
        active: p.active,
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          value: v.value,
          price: Number(v.price),
          stock: v.stock,
          sku: v.sku
        }))
      };
    });

    return sendSuccess(res, 200, 'Products retrieved successfully', {
      products: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 15
        }
      }
    });

    if (!p) {
      return sendError(res, 404, 'Product not found');
    }

    const reviewCount = p.reviews?.length || 0;
    const avgRating = reviewCount > 0
      ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 4.8;

    const imgUrls = p.images?.length > 0
      ? p.images.map((img) => img.url)
      : [p.thumbnail];

    const formattedProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription,
      price: Number(p.price),
      originalPrice: Number(p.originalPrice || p.price),
      discountPercentage: p.discountPercentage,
      stock: p.stock,
      maxQuantityPerOrder: p.maxQuantityPerOrder || 10,
      categoryId: p.categoryId,
      categorySlug: p.category?.slug,
      category: p.category,
      brandName: p.brand?.name || 'Tez Brand',
      brand: p.brand,
      thumbnail: p.thumbnail,
      images: imgUrls,
      rating: avgRating,
      reviewsCount: reviewCount || 1,
      featured: p.featured,
      bestseller: p.bestseller,
      active: p.active,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku
      })),
      reviews: p.reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userName: r.user?.name || 'Verified Buyer',
        userAvatar: r.user?.avatar,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt.toLocaleDateString(),
        verified: r.verifiedPurchase
      }))
    };

    const related = await prisma.product.findMany({
      where: {
        categoryId: p.categoryId,
        id: { not: p.id },
        active: true
      },
      include: {
        category: true,
        brand: true,
        variants: true
      },
      take: 4
    });

    const formattedRelated = related.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sku: r.sku,
      price: Number(r.price),
      originalPrice: Number(r.originalPrice || r.price),
      discountPercentage: r.discountPercentage,
      stock: r.stock,
      thumbnail: r.thumbnail,
      brandName: r.brand?.name || 'Tez Brand',
      categorySlug: r.category?.slug,
      rating: 4.6,
      reviewsCount: 15
    }));

    return sendSuccess(res, 200, 'Product details fetched', {
      product: formattedProduct,
      related: formattedRelated
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      product_name,
      slug,
      sku,
      description,
      shortDescription,
      price,
      originalPrice,
      mrp,
      discountPercentage,
      stock,
      stock_quantity,
      maxQuantityPerOrder,
      max_quantity_per_order,
      categoryId,
      category_id,
      subcategoryId,
      subcategory_id,
      quantityValue,
      quantity_value,
      quantityUnit,
      quantity_unit,
      brandName,
      brand,
      thumbnail,
      image_url,
      featured,
      bestseller
    } = req.body;

    // 1. Validate Category
    const rawCatId = categoryId !== undefined ? categoryId : category_id;
    let targetCategoryId = rawCatId ? parseInt(rawCatId) : null;
    let catExists = null;

    if (targetCategoryId && !isNaN(targetCategoryId)) {
      catExists = await prisma.category.findUnique({ where: { id: targetCategoryId } });
    }

    // If not found by ID, try searching by categorySlug or category name
    if (!catExists && (req.body.categorySlug || req.body.category)) {
      const slugOrName = (req.body.categorySlug || req.body.category || '').toString().trim();
      catExists = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: slugOrName },
            { name: slugOrName }
          ]
        }
      });
      if (catExists) {
        targetCategoryId = catExists.id;
      }
    }

    if (!catExists) {
      // Auto-create category if name or slug provided, or return friendly error
      const catName = req.body.categoryName || req.body.category || `Category ${rawCatId || 'General'}`;
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      catExists = await prisma.category.create({
        data: {
          name: catName,
          slug: `${catSlug}-${Date.now().toString().slice(-4)}`
        }
      });
      targetCategoryId = catExists.id;
    }

    // 2. Validate Subcategory
    const rawSubcatId = subcategoryId !== undefined && subcategoryId !== '' ? subcategoryId : subcategory_id;
    let targetSubcategoryId = rawSubcatId ? parseInt(rawSubcatId) : null;
    if (targetSubcategoryId && !isNaN(targetSubcategoryId)) {
      const subcatExists = await prisma.subcategory.findFirst({
        where: {
          id: targetSubcategoryId,
          categoryId: targetCategoryId
        }
      });
      if (!subcatExists) {
        // If subcategory id doesn't match this category, see if subcategory exists at all
        const anySubcat = await prisma.subcategory.findUnique({ where: { id: targetSubcategoryId } });
        if (!anySubcat) {
          targetSubcategoryId = null;
        }
      }
    } else {
      targetSubcategoryId = null;
    }

    // 3. Validate Product Name
    const resolvedName = (name || product_name || '').trim();
    if (!resolvedName) {
      return sendError(res, 400, 'Product name is required.');
    }

    // 4. Validate Price & MRP
    const resolvedPrice = parseFloat(price);
    if (isNaN(resolvedPrice) || resolvedPrice <= 0) {
      return sendError(res, 400, 'Price must be greater than 0.');
    }

    const rawMrp = mrp !== undefined && mrp !== '' ? mrp : originalPrice;
    const resolvedMrp = rawMrp !== undefined && rawMrp !== '' ? parseFloat(rawMrp) : resolvedPrice;
    if (isNaN(resolvedMrp) || resolvedMrp <= 0) {
      return sendError(res, 400, 'MRP must be greater than 0.');
    }
    if (resolvedPrice > resolvedMrp) {
      return sendError(res, 400, 'MRP cannot be lower than selling price.');
    }

    // Calculate discount automatically
    const calculatedDiscount = resolvedMrp > resolvedPrice
      ? Math.round(((resolvedMrp - resolvedPrice) / resolvedMrp) * 100)
      : (discountPercentage ? parseInt(discountPercentage) : 0);

    // 5. Validate Weight / Unit
    const rawQtyVal = quantityValue !== undefined && quantityValue !== '' ? quantityValue : quantity_value;
    const resolvedQtyVal = rawQtyVal !== undefined && rawQtyVal !== '' ? parseFloat(rawQtyVal) : 1;
    if (isNaN(resolvedQtyVal) || resolvedQtyVal <= 0) {
      return sendError(res, 400, 'Please enter a valid weight/quantity (greater than 0).');
    }

    const supportedUnits = ['kg', 'g', 'mg', 'L', 'ml', 'piece', 'pack', 'dozen', 'pair', 'box'];
    const resolvedQtyUnit = (quantityUnit || quantity_unit || 'kg').trim();
    if (!supportedUnits.includes(resolvedQtyUnit)) {
      return sendError(res, 400, `Unsupported unit '${resolvedQtyUnit}'. Supported units: ${supportedUnits.join(', ')}`);
    }

    // 6. Validate Stock & Max Quantity Per Order
    const rawStock = stock !== undefined && stock !== '' ? stock : stock_quantity;
    const resolvedStock = rawStock !== undefined && rawStock !== '' ? parseInt(rawStock) : 50;
    if (isNaN(resolvedStock) || resolvedStock < 0) {
      return sendError(res, 400, 'Stock quantity cannot be negative.');
    }

    const rawMaxQty = maxQuantityPerOrder !== undefined && maxQuantityPerOrder !== '' ? maxQuantityPerOrder : max_quantity_per_order;
    const resolvedMaxQty = rawMaxQty !== undefined && rawMaxQty !== '' ? parseInt(rawMaxQty) : 10;
    if (isNaN(resolvedMaxQty) || resolvedMaxQty <= 0) {
      return sendError(res, 400, 'Max Quantity Per Order must be greater than 0.');
    }

    // 7. Validate Image
    const resolvedThumbnail = (thumbnail || image_url || '').trim();
    if (!resolvedThumbnail) {
      return sendError(res, 400, 'Please upload or capture a product image.');
    }

    // 8. Resolve Brand
    const resolvedBrandName = (brandName || brand || '').trim();
    let brandId = null;
    if (resolvedBrandName) {
      const existingBrand = await prisma.brand.findFirst({
        where: { name: { equals: resolvedBrandName } }
      });
      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const newBrand = await prisma.brand.create({
          data: {
            name: resolvedBrandName,
            slug: resolvedBrandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        });
        brandId = newBrand.id;
      }
    }

    const generatedSlug = (slug || resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);
    const generatedSku = sku || `TT-${Date.now().toString().slice(-6)}`;
    const weightLabel = `${resolvedQtyVal} ${resolvedQtyUnit}`;

    const newProduct = await prisma.product.create({
      data: {
        name: resolvedName,
        slug: generatedSlug,
        sku: generatedSku,
        description: description || 'Quality authentic item from Tez Thaila.',
        shortDescription: shortDescription || description?.slice(0, 100) || '',
        price: resolvedPrice,
        originalPrice: resolvedMrp,
        discountPercentage: calculatedDiscount,
        stock: resolvedStock,
        maxQuantityPerOrder: resolvedMaxQty,
        categoryId: targetCategoryId,
        subcategoryId: targetSubcategoryId,
        quantityValue: resolvedQtyVal,
        quantityUnit: resolvedQtyUnit,
        brandId,
        thumbnail: resolvedThumbnail,
        featured: Boolean(featured),
        bestseller: Boolean(bestseller),
        active: true,
        variants: {
          create: [
            {
              name: 'Weight/Unit',
              value: weightLabel,
              price: resolvedPrice,
              stock: resolvedStock,
              sku: `${generatedSku}-STD`
            }
          ]
        },
        images: {
          create: [
            {
              url: resolvedThumbnail,
              sortOrder: 0
            }
          ]
        }
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        variants: true
      }
    });

    return sendSuccess(res, 201, 'Product created successfully in MySQL', newProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stock: parseInt(stock) }
    });

    return sendSuccess(res, 200, 'Product stock updated in MySQL', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return sendError(res, 400, 'Invalid product ID');
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return sendError(res, 404, 'Product not found in catalog');
    }

    // Cleanly delete in transaction to ensure integrity across relations
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId } });
      await tx.wishlist.deleteMany({ where: { productId } });
      await tx.review.deleteMany({ where: { productId } });
      await tx.orderItem.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    return sendSuccess(res, 200, `Product "${existingProduct.name}" removed successfully from catalog`);
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendError(res, 400, 'Please provide an array of product IDs to remove.');
    }

    const ids = productIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return sendError(res, 400, 'No valid product IDs provided.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: { in: ids } } });
      await tx.wishlist.deleteMany({ where: { productId: { in: ids } } });
      await tx.review.deleteMany({ where: { productId: { in: ids } } });
      await tx.orderItem.deleteMany({ where: { productId: { in: ids } } });
      await tx.productImage.deleteMany({ where: { productId: { in: ids } } });
      await tx.productVariant.deleteMany({ where: { productId: { in: ids } } });
      await tx.product.deleteMany({ where: { id: { in: ids } } });
    });

    return sendSuccess(res, 200, `Successfully removed ${ids.length} products from catalog!`);
  } catch (error) {
    next(error);
  }
};

export const downloadProductTemplate = async (req, res, next) => {
  try {
    const XLSX = (await import('xlsx')).default;

    const sampleRows = [
      {
        name: 'Aashirvaad Sharbati Whole Wheat Atta 5kg',
        categorySlug: 'groceries-staples',
        brandName: 'Aashirvaad',
        price: 295,
        originalPrice: 340,
        stock: 100,
        maxQuantityPerOrder: 5,
        thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        description: '100% pure Sharbati wheat grains from MP for extra soft rotis.'
      },
      {
        name: 'Amul Pure Cow Ghee 1L Tin',
        categorySlug: 'dairy-breakfast',
        brandName: 'Amul',
        price: 610,
        originalPrice: 650,
        stock: 60,
        maxQuantityPerOrder: 3,
        thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
        description: 'Traditional granular golden pure cow ghee.'
      },
      {
        name: 'Haldiram Nagpur Aloo Bhujia 400g',
        categorySlug: 'snacks-beverages',
        brandName: 'Haldirams',
        price: 99,
        originalPrice: 120,
        stock: 150,
        maxQuantityPerOrder: 10,
        thumbnail: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        description: 'Authentic royal spiced crispy potato snack.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="tez_thaila_product_import_sample.xlsx"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const bulkUploadProducts = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(res, 400, 'Please upload an Excel (.xlsx, .xls) or CSV file.');
    }

    const XLSX = (await import('xlsx')).default;
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!Array.isArray(rows) || rows.length === 0) {
      return sendError(res, 400, 'The uploaded Excel file contains no product rows.');
    }

    // Pre-fetch categories and brands
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c.id;
      catMap[c.name.toLowerCase()] = c.id;
    });

    const brands = await prisma.brand.findMany();
    const brandMap = {};
    brands.forEach((b) => {
      brandMap[b.name.toLowerCase()] = b.id;
    });

    let createdCount = 0;
    const errors = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2;

      const name = row.name || row.Name || row['Product Name'];
      const price = parseFloat(row.price || row.Price || 0);

      if (!name || isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Name and valid Price are required.`);
        continue;
      }

      const originalPrice = parseFloat(row.originalPrice || row.OriginalPrice || row.mrp || row.MRP || price);
      const stock = parseInt(row.stock || row.Stock || 50);
      const maxQuantityPerOrder = parseInt(row.maxQuantityPerOrder || row.MaxQuantityPerOrder || row.limit || 10);
      const discountPercentage = originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const categorySlug = (row.categorySlug || row.Category || 'groceries-staples').toString().trim().toLowerCase();
      let categoryId = catMap[categorySlug] || categories[0]?.id || 1;

      let brandName = (row.brandName || row.Brand || 'Tez Brand').toString().trim();
      let brandId = brandMap[brandName.toLowerCase()];
      if (!brandId && brandName) {
        const newBrand = await prisma.brand.create({
          data: {
            name: brandName,
            slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        });
        brandId = newBrand.id;
        brandMap[brandName.toLowerCase()] = brandId;
      }

      const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100);
      const sku = (row.sku || row.SKU || `TT-${Date.now().toString().slice(-6)}${index}`).toString();
      const thumbnail = row.thumbnail || row.Thumbnail || row.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
      const description = row.description || row.Description || 'Authentic quality item from Tez Thaila.';

      try {
        await prisma.product.create({
          data: {
            name,
            slug: generatedSlug,
            sku,
            description,
            shortDescription: description.slice(0, 100),
            price,
            originalPrice,
            discountPercentage,
            stock,
            maxQuantityPerOrder,
            categoryId,
            brandId,
            thumbnail,
            active: true,
            variants: {
              create: [
                {
                  name: 'Standard',
                  value: '1 Unit',
                  price,
                  stock,
                  sku: `${sku}-STD`
                }
              ]
            }
          }
        });
        createdCount++;
      } catch (err) {
        errors.push(`Row ${rowNum} ("${name}"): ${err.message}`);
      }
    }

    return sendSuccess(res, 201, `Imported ${createdCount} products successfully!`, {
      totalRows: rows.length,
      createdCount,
      errors
    });
  } catch (error) {
    next(error);
  }
};

