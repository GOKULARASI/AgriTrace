const supabase = require('../services/supabaseClient');

const submitFeedback = async (req, res) => {
    try {
        const {
            product_id,
            qr_verified,
            quality_rating,
            trust_rating,
            access_ease_rating,
            experience_rating,
            issues,
            suggestions,
            overall_rating,
            contact_info
        } = req.body;

        if (!product_id) {
            return res.status(400).json({ success: false, message: 'Product ID is required for feedback.' });
        }

        const { data, error } = await supabase
            .from('feedbacks')
            .insert([{
                product_id,
                qr_verified,
                quality_rating,
                trust_rating,
                access_ease_rating,
                experience_rating,
                issues,
                suggestions,
                overall_rating,
                contact_info
            }]);

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ success: false, message: 'Failed to submit feedback.', error: error.message });
        }

        res.status(201).json({ success: true, message: 'Feedback submitted successfully.', feedback: data });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    submitFeedback
};
