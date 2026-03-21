const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    farmerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    industryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    productId: {
        type: Number,
        ref: 'Product'
    },
    amount: { 
        type: Number, 
        required: true 
    },
    type: {
        type: String,
        enum: ['Payment', 'Purchase'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Manual', 'GPay', 'Blockchain'],
        default: 'Manual'
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
