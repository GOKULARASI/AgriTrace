import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Server, Bell, Database, Key, Globe, Layout, ArrowLeft, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Check if user is Admin
    if (user?.user?.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-50 text-red-500 p-4 rounded-3xl mb-6">
                    <Shield size={64} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Restricted Access</h2>
                <p className="text-gray-500 max-w-sm mb-8 font-medium">This module is reserved for platform administrators only. Please contact IT if this is a mistake.</p>
                <button onClick={() => navigate('/dashboard')} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">Back to Dashboard</button>
            </div>
        );
    }

    const sections = [
        {
            title: 'Blockchain Core',
            icon: <Server className="text-green-600" size={20} />,
            items: [
                { label: 'Smart Contract Address', value: '0x5FbDB2315678afecb367f032d93F642f64180aa3', status: 'Live' },
                { label: 'Network Endpoint', value: 'http://127.0.0.1:8545 (Localhost)', status: 'Connected' },
                { label: 'Gas Optimization', value: 'Dynamic EIP-1559', type: 'Toggle' }
            ]
        },
        {
            title: 'Database & Security',
            icon: <Database className="text-blue-600" size={20} />,
            items: [
                { label: 'MongoDB Instance', value: 'Cluster-0 (AWS-US-East)', status: 'Healthy' },
                { label: 'JWT Secret Expiry', value: '24 Hours', type: 'Select' },
                { label: 'Two-Factor (2FA)', value: 'Disabled for Demo', type: 'Toggle' }
            ]
        },
        {
            title: 'Frontend Appearance',
            icon: <Layout className="text-purple-600" size={20} />,
            items: [
                { label: 'Theme Mode', value: 'Light (Modern CSS)', type: 'Select' },
                { label: 'Accent Color', value: 'Emerald Green', type: 'Color' },
                { label: 'Sidebar Layout', value: 'Expanded Default', type: 'Toggle' }
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold transition-all group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
                        <SettingsIcon className="text-green-600" size={32} />
                        Control Center
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Administrative Overrides & Config</p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-white p-3 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Node Verified</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                        </div>

                        <div className="space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                        {item.status && (
                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full ring-1 ring-emerald-200 uppercase">
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-700">{item.value}</p>
                                        <button className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Change</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden group col-span-1 md:col-span-2">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Terminal size={140} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h4 className="text-2xl font-bold mb-3 flex items-center gap-2">
                            <Key size={24} className="text-green-500" />
                            Security Protocol 4.0
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            All administrative changes are logged on a private sub-ledger for audit compliance. 
                            Unauthorized attempts to modify Smart Contract interfaces will trigger an immediate IP-Lock and session invalidation.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm flex items-center gap-2">
                                <Globe size={18} />
                                Update DNS
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm backdrop-blur-md">
                                Factory Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
