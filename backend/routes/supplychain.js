const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supplychainController = require('../controllers/supplychainController');

// Middleware to verify JWT and check role
const auth = (roles = []) => {
    return (req, res, next) => {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretagritrace123');
            req.user = decoded.user;
            
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(401).json({ msg: 'Unauthorized role' });
            }
            next();
        } catch (err) {
            res.status(401).json({ msg: 'Token is not valid' });
        }
    };
};

router.post('/add', auth(['Farmer', 'Admin']), supplychainController.addProduct);
router.post('/process/:productId', auth(['Industry', 'Admin']), supplychainController.processProduct);
router.post('/ship/:productId', auth(['Transport', 'Admin']), supplychainController.shipProduct);
router.post('/receive/:productId', auth(['Retail', 'Admin']), supplychainController.receiveProduct);
router.get('/', supplychainController.getAllProducts);
router.get('/trace/:batchId', supplychainController.traceProduct);
router.post('/transaction/add', auth(['Farmer', 'Industry', 'Admin']), supplychainController.addTransaction);

module.exports = router;
