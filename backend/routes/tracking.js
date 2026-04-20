const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Define authentication/authorization middleware if it exists. 
// Assuming a middleware exists, but to be safe and avoid breaking changes, we might just define simple ones or pull from auth middleware
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, trackingController.createTracking);
router.put('/:productId/harvest', auth, trackingController.updateHarvest);
router.put('/:productId/industry', auth, trackingController.updateIndustry);
router.put('/:productId/transport', auth, trackingController.updateTransport);
router.get('/', trackingController.getAllTracking);
router.get('/activity', trackingController.getActivityLogs);
router.get('/:productId', trackingController.getTrackingHistory);

module.exports = router;
