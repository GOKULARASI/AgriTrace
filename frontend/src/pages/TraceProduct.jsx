import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    CheckCircle, 
    Truck, 
    Store, 
    MapPin, 
    Calendar, 
    CheckSquare, 
    ShieldCheck, 
    ArrowLeft,
    Info,
    Star,
    Factory,
    MessageSquare,
    Send
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StarRating = ({ rating, setRating, label }) => (
    <div className="flex flex-col space-y-2 w-full">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-all duration-200 hover:scale-125 focus:outline-none ${
                        star <= rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-gray-200 hover:text-amber-200'
                    }`}
                >
                    ★
                </button>
            ))}
        </div>
    </div>
);

const TraceProduct = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const { user } = React.useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [feedbackData, setFeedbackData] = useState({
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
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    useEffect(() => {
        const fetchTrace = async () => {
            setLoading(true);
            try {
                const res = await api.get(`supplychain/trace/${batchId}`);
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Product record not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrace();
    }, [batchId]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try {
            await api.post('/feedback/submit', {
                ...feedbackData,
                product_id: product.product_id
            });
            setFeedbackSuccess(true);
        } catch (err) {
            console.error('Feedback error:', err);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 font-bold animate-pulse">Scanning Blockchain Records...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-red-100 text-center">
            <div className="bg-red-50 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-red-500 mb-4">
                <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Record Not Found</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
        </div>
    );

    if (!data) return null;

    const { product, onChainData } = data;
    const farmerLoc = product.farmerLocation || 'Unknown';
    const cropName = onChainData ? onChainData.cropName : product.cropName;
    const batch = product.batchId || batchId;

    const TimelineItem = ({ icon: Icon, title, subtitle, details, color, active, date }) => (
        <div className={`relative pl-12 pb-12 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
            {/* Connector */}
            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100">
                {active && <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-${color}-500 to-transparent animate-pulse`}></div>}
            </div>
            
            {/* Ion */}
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10
                ${active ? `bg-${color}-600 text-white ring-4 ring-${color}-50` : 'bg-gray-100 text-gray-400'}
            `}>
                <Icon size={20} />
            </div>

            <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300
                ${active ? `border-l-4 border-l-${color}-500` : ''}
            `}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
                        <p className={`text-sm font-semibold text-${color}-600`}>{subtitle}</p>
                    </div>
                    {date && (
                        <div className="text-right">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={12} />
                                Verified Date
                             </div>
                             <p className="text-sm font-bold text-gray-700">{new Date(date).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.map((d, i) => (
                        <div key={i} className="bg-gray-50/50 p-3 rounded-xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{d.label}</p>
                            <p className="text-sm font-bold text-gray-800">{d.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold transition-all group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Feed
            </button>

            <header className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ring-1 ring-green-600/20 shadow-sm shadow-green-600/10">
                    <ShieldCheck size={14} />
                    Secured by AgriTrace 4.0
                </div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Provenance Report</h2>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-gray-400 font-bold text-sm">Batch Passport:</p>
                    <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold">{batch}</span>
                </div>
            </header>

            {onChainData && (
                <div className="bg-blue-600 rounded-3xl p-6 mb-12 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Blockchain Verified Instance</h3>
                            <p className="text-blue-100 text-sm font-medium leading-relaxed">
                                This supply chain record has been cross-referenced with the decentralized ledger. Each timestamp and geo-location marker is cryptographically signed and immutable.
                            </p>
                            <div className="mt-4 flex gap-4 text-xs font-black uppercase tracking-widest text-blue-200">
                                <span className="flex items-center gap-1 opacity-70 hover:opacity-100 cursor-help transition-opacity">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    Hash Consistent
                                </span>
                                <span className="opacity-70">Block: 4291823</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                {/* 1. Farmer */}
                <TimelineItem 
                    icon={MapPin}
                    title="Cultivation & Harvesting"
                    subtitle="Initial Agricultural Origin"
                    active={true}
                    color="green"
                    date={product.date || product.created_at}
                    details={[
                        { label: 'Crop Variety', value: cropName },
                        { label: 'Growth Location', value: farmerLoc },
                        { label: 'Harvest Quality', value: 'Grade A Premium' },
                        { label: 'Farmer Wallet', value: onChainData?.farmer.slice(0, 15) + '...' }
                    ]}
                />

                {/* 2. Industry */}
                <TimelineItem 
                    icon={Factory}
                    title="Industrial Processing"
                    subtitle="Processing & Quality Assurance"
                    active={product.currentStatus !== 'Created'}
                    color="blue"
                    date={onChainData?.processingDate}
                    details={[
                        { label: 'Facility', value: 'ABC Food Processing Unit' },
                        { label: 'Process Type', value: 'Wash & Package' },
                        { label: 'Batch Output', value: `${cropName} Processed` },
                        { label: 'Safety Cert', value: 'FSSAI Verified' }
                    ]}
                />

                {/* 3. Transport */}
                <TimelineItem 
                    icon={Truck}
                    title="Logistics & Dispatch"
                    subtitle="Secure Cold Chain Transport"
                    active={['Shipped', 'Received'].includes(product.currentStatus)}
                    color="amber"
                    date={onChainData?.shipmentDate}
                    details={[
                        { label: 'Vehicle ID', value: 'TRANSPORT-01-V' },
                        { label: 'Conditions', value: 'Dry / 24°C' },
                        { label: 'Carrier', value: 'AgriLogistics Hub' },
                        { label: 'ETA', value: 'Delivered' }
                    ]}
                />

                {/* 4. Retail */}
                <TimelineItem 
                    icon={Store}
                    title="Retail Distribution"
                    subtitle="Consumer Ready Point"
                    active={product.currentStatus === 'Received'}
                    color="purple"
                    details={[
                        { label: 'Store Outlet', value: 'Retail Store 1' },
                        { label: 'Store Location', value: 'City Center' },
                        { label: 'Stock Status', value: 'On Shelf' },
                        { label: 'Consumer Feedback', value: (
                            <div className="flex text-amber-500 gap-0.5">
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} className="text-gray-200" fill="currentColor" />
                            </div>
                        )}
                    ]}
                />
            </div>

            {product.currentStatus !== 'Received' && (
                <div className="ml-12 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Scanning for Next Hop...</p>
                    <p className="text-gray-500 font-medium italic">The physical batch is currently moving to the next node in the network.</p>
                </div>
            )}

            {/* 5. Consumer Feedback Section - ONLY for Consumers and Guests */}
            {(!user || user?.user?.role === 'Consumer') && (
                <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden" id="feedback-section">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-8 -mt-8">
                    <MessageSquare size={200} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Consumer Experience & Feedback</h3>
                            <p className="text-gray-500 font-medium italic">Help us maintain blockchain transparency and quality standard</p>
                        </div>
                    </div>

                    {feedbackSuccess ? (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in zoom-in duration-500">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h4>
                            <p className="text-green-700 font-medium">Your response has been cryptographically logged to improve the supply chain.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StarRating 
                                    rating={feedbackData.quality_rating} 
                                    setRating={(val) => setFeedbackData({...feedbackData, quality_rating: val})} 
                                    label="Product Quality & Freshness" 
                                />
                                <StarRating 
                                    rating={feedbackData.trust_rating} 
                                    setRating={(val) => setFeedbackData({...feedbackData, trust_rating: val})} 
                                    label="Trust in Blockchain Records" 
                                />
                                <StarRating 
                                    rating={feedbackData.access_ease_rating} 
                                    setRating={(val) => setFeedbackData({...feedbackData, access_ease_rating: val})} 
                                    label="Ease of Traceability Access" 
                                />
                                <StarRating 
                                    rating={feedbackData.experience_rating} 
                                    setRating={(val) => setFeedbackData({...feedbackData, experience_rating: val})} 
                                    label="Overall Satisfaction" 
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Detailed Review / Issues Encountered</label>
                                    <textarea 
                                        className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-amber-500 transition-colors font-medium text-gray-700 min-h-[100px] outline-none"
                                        placeholder="Enter your experience or report any data mismatch..."
                                        value={feedbackData.issues}
                                        onChange={e => setFeedbackData({...feedbackData, issues: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Overall Rating</label>
                                        <StarRating 
                                            rating={feedbackData.overall_rating} 
                                            setRating={(val) => setFeedbackData({...feedbackData, overall_rating: val})} 
                                            label="" 
                                        />
                                     </div>
                                     <div className="flex items-end">
                                        <button 
                                            type="submit"
                                            disabled={submittingFeedback}
                                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50"
                                        >
                                            {submittingFeedback ? 'Submitting...' : (
                                                <>
                                                    <Send size={18} />
                                                    Submit Traceability Feedback
                                                </>
                                            )}
                                        </button>
                                     </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            )}

            <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Digital Twin Certified</p>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 border rounded-xl flex items-center justify-center grayscale hover:grayscale-0 transition-all">FB</div>
                    <div className="w-10 h-10 border rounded-xl flex items-center justify-center grayscale hover:grayscale-0 transition-all">TW</div>
                    <div className="w-10 h-10 border rounded-xl flex items-center justify-center grayscale hover:grayscale-0 transition-all">IN</div>
                </div>
            </footer>
        </div>
    );
};

export default TraceProduct;
