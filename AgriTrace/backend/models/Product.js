const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: { type: Number, required: true, unique: true }, // Ties to Blockchain productId
    batchId: { type: String },
    
    // Detailed off-chain attributes 
    cropName: { type: String },
    quantityText: { type: String }, // e.g., "500kg"
    farmerLocation: { type: String },
    
    // Status tracking for UI convenience
    currentStatus: { 
        type: String, 
        enum: ['Created', 'Processed', 'Shipped', 'Received'],
        default: 'Created'
    },
    
    // Optional: Images or documents related to the product
    qualityDocumentUrl: { type: String },
    productImageUrl: { type: String },

    qrCodeUrl: { type: String } // Storing generated QR code URL
});

module.exports = mongoose.model('Product', productSchema);
