import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
    Plus,
    RefreshCcw,
    Package,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    ExternalLink,
    ChevronRight,
    QrCode,
    Truck,
    Store,
    ShieldCheck,
    Loader2
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchProducts();
        fetchActivities();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('tracking');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const res = await api.get('tracking/activity');
            setActivities(res.data);
        } catch (err) {
            console.error('Activity fetch error:', err);
        }
    };

    const handleAction = async (endpoint, payload, isTracking = false) => {
        // Simple client-side validation
        if (isTracking) {
            if (!payload.productId && !endpoint.includes('create')) {
                alert('Product ID is required');
                return;
            }
        }

        console.log('Action payload:', payload);
        try {
            const base = isTracking ? 'tracking' : 'supplychain';
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const targetUrl = `${base}${cleanEndpoint}`;
            
            const method = (isTracking && !endpoint.includes('create')) ? 'put' : 'post';
            
            const res = await api[method](targetUrl, payload);
            console.log('Action successful:', res.data);
            alert(`Success: ${res.data.msg || 'Action successful!'}`);
            fetchProducts();
            fetchActivities();
            
            // Clear form data after success
            if (isTracking) setFormData({}); 
        } catch (err) {
            console.error('Action error:', err);
            const errorMsg = err.response?.data?.msg || err.message || 'Error occurred';
            alert(`Error: ${errorMsg}`);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Sown': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Harvested': 'bg-green-100 text-green-700 border-green-200',
            'Processed': 'bg-blue-100 text-blue-700 border-blue-200',
            'Packed': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Shipped': 'bg-amber-100 text-amber-700 border-amber-200',
            'Delivered': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const renderRolesHeader = () => {
        const greeting = `Hello, ${user.user?.name || 'User'}`;
        const subtitle = {
            'Farmer': 'Manage your crops and initial harvest details.',
            'Industry': 'Track processing batches and quality checks.',
            'Transport': 'Update shipment logs and logistics data.',
            'Retail': 'Inventory management and store distribution.',
            'Admin': 'Full system oversight and analytics.'
        }[user.user?.role] || 'Manage your supply chain securely.';

        return (
            <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{greeting} 👋</h2>
                <p className="text-gray-500 mt-1 font-medium">{subtitle}</p>
            </div>
        );
    }
    const renderActionArea = () => {
        const role = user.user?.role;
        
        return (
            <>
                {/* Role Specific Forms */}
                {role === 'Farmer' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">1. Initialize Sowing</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product ID</label>
                                    <input type="text" placeholder="e.g. PRD-001" onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Name</label>
                                    <input type="text" placeholder="e.g. Organic Wheat" onChange={e => setFormData({ ...formData, productName: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Sowing</label>
                                    <input type="date" onChange={e => setFormData({ ...formData, dateOfSowing: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors font-medium" />
                                </div>
                            </div>
                            <button onClick={() => handleAction('create', { productId: formData.productId, productName: formData.productName, dateOfSowing: formData.dateOfSowing }, true)} className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 group">
                                Start Tracking
                                <ArrowUpRight size={18} />
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">2. Log Harvesting</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product ID</label>
                                    <input type="text" placeholder="Enter ID" onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Harvesting</label>
                                    <input type="date" onChange={e => setFormData({ ...formData, dateOfHarvesting: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium" />
                                </div>
                            </div>
                            <button onClick={() => handleAction(`${formData.productId}/harvest`, { dateOfHarvesting: formData.dateOfHarvesting }, true)} className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 group">
                                Update Harvest
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {role === 'Industry' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                                <RefreshCcw size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Processing & Packing Updates</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product ID</label>
                                <input type="text" placeholder="Enter ID" onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Processing</label>
                                <input type="date" onChange={e => setFormData({ ...formData, dateOfProcessing: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Packing</label>
                                <input type="date" onChange={e => setFormData({ ...formData, dateOfPacking: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-medium" />
                            </div>
                        </div>
                        <button onClick={() => handleAction(`${formData.productId}/industry`, { dateOfProcessing: formData.dateOfProcessing, dateOfPacking: formData.dateOfPacking }, true)} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group">
                            Update Industry Stage
                            <QrCode size={18} />
                        </button>
                    </div>
                )}

                {role === 'Transport' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 group hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                                <Truck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Logistics & Shipping Updates</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product ID</label>
                                <input type="text" placeholder="Enter ID" onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Shipping</label>
                                <input type="date" onChange={e => setFormData({ ...formData, dateOfShipping: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Delivery</label>
                                <input type="date" onChange={e => setFormData({ ...formData, dateOfDelivery: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors font-medium" />
                            </div>
                        </div>
                        <button onClick={() => handleAction(`${formData.productId}/transport`, { dateOfShipping: formData.dateOfShipping, dateOfDelivery: formData.dateOfDelivery }, true)} className="mt-8 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 group">
                            Update Logistics
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {role === 'Retail' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                                <Store size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Store Acceptance</h3>
                        </div>
                        <div className="space-y-2 max-w-md">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Incoming Product ID</label>
                            <input type="number" placeholder="Enter ID" onChange={e => setFormData({ ...formData, targetId: Number(e.target.value) })} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium" />
                        </div>
                        <button onClick={() => handleAction(`/receive/${formData.targetId}`, {})} className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 group">
                            Stock in Inventory
                            <CheckCircle2 size={18} />
                        </button>
                    </div>
                )}

                {/* Financial Transaction Form (Visible to Admin, Industry, Farmer) */}
                {(role === 'Admin' || role === 'Industry' || role === 'Farmer') && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Record Financial Transaction</h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const payload = { ...formData, type: 'Payment', paymentMethod: 'Manual' };
                                        if (user.user?.role === 'Farmer') payload.farmerId = user.user._id;
                                        if (user.user?.role === 'Industry') payload.industryId = user.user._id;
                                        handleAction('/transaction/add', payload);
                                    }}
                                    className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Manual Log
                                </button>
                                <button
                                    onClick={() => {
                                        const gpaySimId = `GPAY-${Math.floor(Math.random() * 1000000)}`;
                                        const amount = Number(formData.amount) || 500;
                                        const productId = Number(formData.productId) || 101;
                                        const payload = {
                                            transactionId: gpaySimId,
                                            amount,
                                            productId,
                                            type: 'Payment',
                                            paymentMethod: 'GPay'
                                        };

                                        // Append user ID based on role
                                        if (user.user?.role === 'Farmer') payload.farmerId = user.user._id;
                                        if (user.user?.role === 'Industry') payload.industryId = user.user._id;

                                        if (confirm(`Simulating GPay Dialog...\n\nTransaction ID: ${gpaySimId}\nAmount: $${amount}\n\nProceed?`)) {
                                            handleAction('/transaction/add', payload);
                                        }
                                    }}
                                    className="bg-[#4285F4] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#3367D6] transition-colors flex items-center gap-2"
                                >
                                    <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M30 20C30 18.6 29.9 17.3 29.6 16H20V24H25.6C25.1 26.6 22.8 28 20 28C17.2 28 14.9 26.1 14.1 23.5L8.4 27.9C11.1 33.2 16.6 36 21.6 36C27.1 36 32 32.7 34.6 27.8C35.5 26.1 36 24.1 36 22C36 21.3 35.9 20.7 35.8 20H30Z" fill="white" />
                                        <path d="M14.1 16.5C14.9 13.9 17.2 12 20 12C22.8 12 25.1 13.4 25.6 16H31.2C30 11.2 25.4 8 20 8C14.6 8 10 11.2 8.4 16L14.1 16.5Z" fill="white" />
                                    </svg>
                                    Simulate GPay
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Unique Transaction ID</label>
                                <input type="text" value={formData.transactionId || ''} placeholder="TXN-9999 (Manual only)" onChange={e => setFormData({ ...formData, transactionId: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-colors font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Amount (USD)</label>
                                <input type="number" placeholder="500.00" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-colors font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Reference</label>
                                <input type="number" placeholder="Product ID" value={formData.productId || ''} onChange={e => setFormData({ ...formData, productId: Number(e.target.value) })} className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-colors font-bold text-gray-700" />
                            </div>
                        </div>
                        <p className="mt-6 text-xs text-gray-400 font-medium italic">
                            Tip: Use the "Pay with GPay" simulation to auto-generate a secure ID, or log a manual TXN ID to test duplicate prevention.
                        </p>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderRolesHeader()}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Batches</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-black text-gray-900">{products.length}</h4>
                        <div className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">+12%</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Progress</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-black text-gray-900">{products.filter(p => !['Delivered'].includes(p.status)).length}</h4>
                        <div className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full">Active</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Nodes</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-black text-gray-900">124</h4>
                        <ShieldCheck className="text-blue-500 w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <h4 className="text-lg font-bold text-emerald-600">Secure</h4>
                    </div>
                </div>
            </div>

            {renderActionArea()}

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Supply Chain Feed</h3>
                <div className="flex gap-2">
                    <button onClick={fetchProducts} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Fetching secure records...</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product / Batch</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Trace QR</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map(p => (
                                    <tr key={p.productId} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-50 p-2.5 rounded-xl text-green-700">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{p.productName || 'Unknown Product'}</p>
                                                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {p.productId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-gray-600 font-medium">Farmer: {p.farmerName}</p>
                                                <p className="flex items-center text-gray-400 text-xs gap-1">
                                                    <Clock size={12} /> Registered: {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col items-center gap-2">
                                                    <Link 
                                                        to={`/trace/${p.batchId || p.productId}`}
                                                        className="p-2 bg-white rounded-xl shadow-md border border-gray-100 inline-block group-hover:scale-110 transition-transform duration-300 relative cursor-pointer"
                                                        title="Click to view provenance report"
                                                    >
                                                        <QRCodeSVG 
                                                            id={`qr-${p.productId}`}
                                                            value={`${window.location.origin}/trace/${p.batchId || p.productId}`}
                                                            size={80}
                                                            level="H"
                                                            marginSize={4}
                                                            imageSettings={{
                                                                src: "https://cdn-icons-png.flaticon.com/512/3061/3061558.png", 
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 20,
                                                                width: 20,
                                                                excavate: true,
                                                            }}
                                                        />
                                                    </Link>
                                                <button 
                                                    onClick={() => {
                                                        const svg = document.getElementById(`qr-${p.productId}`);
                                                        const svgData = new XMLSerializer().serializeToString(svg);
                                                        const canvas = document.createElement("canvas");
                                                        const ctx = canvas.getContext("2d");
                                                        const img = new Image();
                                                        img.onload = () => {
                                                            canvas.width = 300;
                                                            canvas.height = 300;
                                                            ctx.fillStyle = "white";
                                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                            ctx.drawImage(img, 25, 25, 250, 250);
                                                            const pngFile = canvas.toDataURL("image/png");
                                                            const downloadLink = document.createElement("a");
                                                            downloadLink.download = `QR-${p.productId}.png`;
                                                            downloadLink.href = pngFile;
                                                            downloadLink.click();
                                                        };
                                                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                                    }}
                                                    className="text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1"
                                                >
                                                    <RefreshCcw size={10} /> Download
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <Link
                                                to={`/track/${p.productId}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Trace
                                                <ExternalLink size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {products.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="bg-gray-50 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-gray-300 mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h4 className="text-gray-900 font-bold">No Records Found</h4>
                            <p className="text-gray-500 text-sm mt-1">Start by adding a new harvest to the chain.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-800">System Activity Stream</h3>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">Live Audit</div>
                </div>
                
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((log) => (
                            <div key={log.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-colors group">
                                <div className="bg-gray-50 p-3 rounded-xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Clock size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                            log.role === 'Farmer' ? 'bg-green-100 text-green-700' :
                                            log.role === 'Industry' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>{log.role}</span>
                                        <p className="text-xs text-gray-500 font-medium">{log.performed_by} • Product ID: <span className="font-mono text-gray-700">{log.product_id}</span></p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm font-medium italic">No recent activity detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;