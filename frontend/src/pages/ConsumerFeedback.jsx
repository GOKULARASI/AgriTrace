import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StarRating = ({ rating, setRating, label }) => {
    return (
        <div className="flex flex-col space-y-2 w-full">
            <span className="text-gray-700 font-medium">{label}</span>
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl focus:outline-none transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );
};

const ConsumerFeedback = () => {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('productId') || '';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        product_id: productId,
        qr_verified: true,
        quality_rating: 0,
        trust_rating: 0,
        access_ease_rating: 0,
        experience_rating: 0,
        issues: '',
        suggestions: '',
        overall_rating: 0,
        contact_info: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const handleRatingChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const response = await api.post('/feedback/submit', formData);
            if (response.data.success) {
                setSubmitStatus({ type: 'success', message: 'Thank you! Your feedback has been submitted successfully.' });
                setFormData({
                    product_id: productId,
                    qr_verified: true,
                    quality_rating: 0,
                    trust_rating: 0,
                    access_ease_rating: 0,
                    experience_rating: 0,
                    issues: '',
                    suggestions: '',
                    overall_rating: 0,
                    contact_info: ''
                });
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to submit feedback. Please try again later.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
                <div className="bg-emerald-600 px-6 py-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Consumer Feedback</h1>
                    <p className="text-emerald-100 italic">"Consumer feedback focuses on trust, product quality, and transparency in blockchain-based agricultural traceability."</p>
                </div>

                <div className="p-6 md:p-8">
                    {submitStatus.message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border fill-green-50 border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="qr_verified"
                                    checked={formData.qr_verified}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                />
                                <span className="text-gray-800 font-medium">Product verification successful (QR scan & traceability clarity)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StarRating 
                                rating={formData.quality_rating} 
                                setRating={(val) => handleRatingChange('quality_rating', val)} 
                                label="Product Quality & Freshness" 
                            />
                            <StarRating 
                                rating={formData.trust_rating} 
                                setRating={(val) => handleRatingChange('trust_rating', val)} 
                                label="Trust in Blockchain Data" 
                            />
                            <StarRating 
                                rating={formData.access_ease_rating} 
                                setRating={(val) => handleRatingChange('access_ease_rating', val)} 
                                label="Ease of Accessing Information" 
                            />
                            <StarRating 
                                rating={formData.experience_rating} 
                                setRating={(val) => handleRatingChange('experience_rating', val)} 
                                label="Purchase Experience Satisfaction" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium block">Issue Reporting (wrong data / damaged product)</label>
                            <textarea
                                name="issues"
                                value={formData.issues}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-gray-50"
                                placeholder="Describe any issues you encountered..."
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium block">Suggestions for Improvement</label>
                            <textarea
                                name="suggestions"
                                value={formData.suggestions}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-gray-50"
                                placeholder="How can we improve the experience?"
                            ></textarea>
                        </div>

                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 space-y-4">
                            <StarRating 
                                rating={formData.overall_rating} 
                                setRating={(val) => handleRatingChange('overall_rating', val)} 
                                label="Overall Rating & Review" 
                            />
                            
                            <div className="space-y-2 pt-2">
                                <label className="text-gray-700 font-medium block text-sm">Optional Contact for Follow-up</label>
                                <input
                                    type="email"
                                    name="contact_info"
                                    value={formData.contact_info}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors ${
                                    isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConsumerFeedback;
