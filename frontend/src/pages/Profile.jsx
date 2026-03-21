import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, MapPin, Phone, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.user?.name || '',
        email: user?.user?.email || '',
        location: user?.user?.location || 'Not set',
        phone: user?.user?.phone || 'Not set',
        role: user?.user?.role || ''
    });

    const handleSave = () => {
        // In a real app, this would be an API call
        const updatedUser = { ...user, user: { ...user.user, ...formData } };
        login(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold transition-all group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Profile</h1>
                <p className="text-gray-500 font-medium">Manage your identity and account settings on AgriTrace.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden text-center p-8 relative">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-4xl font-black text-green-700 border-4 border-white shadow-lg mx-auto overflow-hidden">
                                {formData.name.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.name}</h2>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <Shield size={14} />
                            {formData.role}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-gray-700">{formData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Office</p>
                                    <p className="text-sm font-bold text-gray-700">{formData.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 md:p-10 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-800">Account Particulars</h3>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isEditing ? 'bg-gray-100 text-gray-500' : 'bg-green-600 text-white shadow-lg shadow-green-600/20'}`}
                            >
                                {isEditing ? 'Discard Changes' : 'Update Details'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Display Name</label>
                                <input 
                                    disabled={!isEditing}
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-2xl focus:outline-none focus:border-green-500 transition-colors font-bold text-gray-700 disabled:opacity-60" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Email</label>
                                <input 
                                    disabled={!isEditing}
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-2xl focus:outline-none focus:border-green-500 transition-colors font-bold text-gray-700 disabled:opacity-60" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Linked Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input 
                                        disabled={!isEditing}
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-gray-100 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-green-500 transition-colors font-bold text-gray-700 disabled:opacity-60" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Geo Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input 
                                        disabled={!isEditing}
                                        value={formData.location} 
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-gray-100 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-green-500 transition-colors font-bold text-gray-700 disabled:opacity-60" 
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <button 
                                onClick={handleSave}
                                className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-2 group"
                            >
                                <Save size={20} />
                                Commit Changes to Identity
                            </button>
                        )}

                        <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                            <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
                                <Shield size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900 mb-1">Blockchain Tied Identity</h4>
                                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                    Your role and email are used as primitive identifiers on the supply chain ledger. Significant changes may require re-verification by the network admin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
