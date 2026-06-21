const mongoose = require('mongoose');

/**
 * Product Schema
 * Defines the structure of a product document in MongoDB
 */
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['beverages', 'snacks', 'desserts', 'meals'],
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    image: {
        type: String, // Base64 encoded image or image URL
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt field before updating
productSchema.pre('findByIdAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
