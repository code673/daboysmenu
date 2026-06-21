const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/products
 * Retrieve all products or filter by category
 * Query params: ?category=beverages
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        // Filter by category if provided
        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

/**
 * POST /api/products
 * Create a new product
 * Body: { name, category, price, quantity, description, image }
 */
router.post('/', async (req, res) => {
    try {
        const { name, category, price, quantity, description, image } = req.body;

        // Validation
        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Missing required fields: name, category, price, quantity' });
        }

        // Create new product
        const product = new Product({
            name,
            category: category.toLowerCase(),
            price: parseFloat(price),
            quantity: parseInt(quantity),
            description: description || '',
            image: image || null
        });

        // Save to database
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

/**
 * PUT /api/products/:id
 * Update an existing product
 * Body: { name, category, price, quantity, description, image }
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, category, price, quantity, description, image } = req.body;

        // Find product
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields if provided
        if (name !== undefined) product.name = name;
        if (category !== undefined) product.category = category.toLowerCase();
        if (price !== undefined) product.price = parseFloat(price);
        if (quantity !== undefined) product.quantity = parseInt(quantity);
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;

        // Save updated product
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

/**
 * DELETE /api/products/:id
 * Delete a product by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

/**
 * POST /api/products/bulk/seed
 * Seed sample products (for testing/demo)
 * This endpoint is optional and can be removed in production
 */
router.post('/bulk/seed', async (req, res) => {
    try {
        // Clear existing products
        await Product.deleteMany({});

        // Create sample products
        const sampleProducts = [
            {
                name: 'Iced Coffee',
                category: 'beverages',
                price: 3.50,
                quantity: 15,
                description: 'Cold brew coffee with ice'
            },
            {
                name: 'Mango Smoothie',
                category: 'beverages',
                price: 4.00,
                quantity: 10,
                description: 'Fresh mango blended smoothie'
            },
            {
                name: 'Chocolate Cake',
                category: 'desserts',
                price: 2.50,
                quantity: 8,
                description: 'Rich chocolate cake slice'
            },
            {
                name: 'Crispy Fries',
                category: 'snacks',
                price: 2.00,
                quantity: 20,
                description: 'Golden crispy french fries'
            },
            {
                name: 'Grilled Chicken Meal',
                category: 'meals',
                price: 8.50,
                quantity: 5,
                description: 'Grilled chicken with rice and vegetables'
            }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);
        res.status(201).json({ message: 'Sample products seeded', products: createdProducts });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding products', error: error.message });
    }
});

module.exports = router;
