import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import TrackingTimeline from '../components/TrackingTimeline';
import { 
    Search, 
    ArrowLeft, 
    Calendar, 
    User, 
    ClipboardCheck, 
    Truck, 
    Factory,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

const ProductTracking = () => {
    const { batchId: initialBatchId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [productId, setProductId] = useState(initialBatchId || '');
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [updateForm, setUpdateForm] = useState({
        dateOfSowing: '',
        dateOfHarvesting: '',
        dateOfProcessing: '',
        dateOfPacking: '',
        dateOfShipping: '',
        dateOfDelivery: '',
        productName: '',
        farmerName: '',
        industryName: '',
        transporterName: ''
    });

    useEffect(() => {
        if (initialBatchId) {
            fetchTracking(initialBatchId);
        }
    }, [initialBatchId]);

    const fetchTracking = async (id) => {
        setLoading(true);
        setError('');
        setTrack(null);
        try {
            const res = await api.get(`tracking/${id}`);
            setTrack(res.data.track);
            // Pre-fill form with existing names for convenience
            setUpdateForm(prev => ({
                ...prev,
                productName: res.data.track.productName || '',
                farmerName: res.data.track.farmerName || '',
                industryName: res.data.track.industryName || '',
                transporterName: res.data.track.transporterName || ''
            }));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Product tracking record not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (productId) fetchTracking(productId);
    };

    const handleUpdate = async (stage) => {
        setUpdating(true);
        setError('');
        setSuccess('');
        try {
            let endpoint = '';
            let payload = {};

            switch (stage) {
                case 'create':
                    endpoint = 'tracking/create';
                    payload = {
                        productId,
                        productName: updateForm.productName,
                        dateOfSowing: updateForm.dateOfSowing,
                        farmerName: updateForm.farmerName || user?.user?.name
                    };
                    break;
                case 'harvest':
                    endpoint = `tracking/${productId}/harvest`;
                    payload = { dateOfHarvesting: updateForm.dateOfHarvesting };
                    break;
                case 'industry':
                    endpoint = `tracking/${productId}/industry`;
                    payload = {
                        dateOfProcessing: updateForm.dateOfProcessing,
                        dateOfPacking: updateForm.dateOfPacking,
                        industryName: updateForm.industryName || user?.user?.name
                    };
                    break;
                case 'transport':
                    endpoint = `tracking/${productId}/transport`;
                    payload = {
                        dateOfShipping: updateForm.dateOfShipping,
                        dateOfDelivery: updateForm.dateOfDelivery,
                        transporterName: updateForm.transporterName || user?.user?.name
                    };
                    break;
                default:
                    return;
            }

            const res = stage === 'create' 
                ? await api.post(endpoint, payload)
                : await api.put(endpoint, payload);
            
            setTrack(res.data.track);
            setSuccess(`${stage.charAt(0).toUpperCase() + stage.slice(1)} stage updated successfully!`);
            if (stage === 'create') setTrack(res.data.track);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Error updating product tracking');
        } finally {
            setUpdating(false);
        }
    };

    const role = user?.user?.role;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-medium"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Search & Forms */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Search size={20} className="text-blue-600" /> Trace Product
                        </h3>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter Product ID..." 
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors font-bold text-gray-700 pr-12"
                                />
                                <button type="submit" className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-600 animate-in shake duration-300">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-start gap-3 text-green-600 animate-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    {/* Role Specific Update Forms */}
                    {role === 'Farmer' && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-green-600" /> Farmer Updates
                            </h3>
                            
                            {!track ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 font-medium italic mb-4">Initialize tracking for this product ID</p>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Name</label>
                                        <input type="text" placeholder="e.g. Organic Wheat" value={updateForm.productName} onChange={e => setUpdateForm({...updateForm, productName: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Sowing</label>
                                        <input type="date" value={updateForm.dateOfSowing} onChange={e => setUpdateForm({...updateForm, dateOfSowing: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none transition-colors" />
                                    </div>
                                    <button onClick={() => handleUpdate('create')} disabled={updating || !productId} className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold mt-4 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                                        {updating ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={20} />}
                                        Initialize Tracking
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Harvesting</label>
                                        <input type="date" value={updateForm.dateOfHarvesting} onChange={e => setUpdateForm({...updateForm, dateOfHarvesting: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none transition-colors" />
                                    </div>
                                    <button onClick={() => handleUpdate('harvest')} disabled={updating} className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold mt-4 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                                        {updating ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                        Update Harvesting
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {track && role === 'Industry' && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Factory size={20} className="text-blue-600" /> Industry Updates
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Processing</label>
                                    <input type="date" value={updateForm.dateOfProcessing} onChange={e => setUpdateForm({...updateForm, dateOfProcessing: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Packing</label>
                                    <input type="date" value={updateForm.dateOfPacking} onChange={e => setUpdateForm({...updateForm, dateOfPacking: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <button onClick={() => handleUpdate('industry')} disabled={updating} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                    {updating ? <Loader2 className="animate-spin" /> : <Factory size={20} />}
                                    Update Processing
                                </button>
                            </div>
                        </div>
                    )}

                    {track && role === 'Transport' && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Truck size={20} className="text-amber-600" /> Transport Updates
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Shipping</label>
                                    <input type="date" value={updateForm.dateOfShipping} onChange={e => setUpdateForm({...updateForm, dateOfShipping: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-amber-500 outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Delivery</label>
                                    <input type="date" value={updateForm.dateOfDelivery} onChange={e => setUpdateForm({...updateForm, dateOfDelivery: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-amber-500 outline-none transition-colors" />
                                </div>
                                <button onClick={() => handleUpdate('transport')} disabled={updating} className="w-full bg-amber-500 text-white p-4 rounded-2xl font-bold mt-4 hover:bg-amber-600 transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
                                    {updating ? <Loader2 className="animate-spin" /> : <Truck size={20} />}
                                    Update Logistics
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline / History */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-500 font-bold">Retrieving tracking records...</p>
                        </div>
                    ) : track ? (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            {/* Header decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-8 -mt-8">
                                <ClipboardCheck size={200} />
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{track.productName}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product ID:</span>
                                        <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{track.productId}</span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 font-bold text-sm">
                                        <CheckCircle2 size={16} /> Status: {track.status}
                                    </div>
                                </div>
                            </div>

                            <TrackingTimeline track={track} />
                            
                            <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Farmer</p>
                                    <p className="text-sm font-bold text-gray-700">{track.farmerName || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Industry</p>
                                    <p className="text-sm font-bold text-gray-700">{track.industryName || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transporter</p>
                                    <p className="text-sm font-bold text-gray-700">{track.transporterName || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center text-gray-300 mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">Search for a Product ID</h3>
                            <p className="text-gray-400 mt-2 text-center max-w-xs">
                                Enter a unique Product ID to see its full supply chain journey and tracking timeline.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductTracking;
