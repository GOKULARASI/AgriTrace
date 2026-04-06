const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/feedbackController');

// Submit new feedback
router.post('/submit', submitFeedback);

module.exports = router;
