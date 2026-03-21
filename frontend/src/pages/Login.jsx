import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, MapPin, Phone, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Farmer', location: '', phone: ''
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await api.post(endpoint, formData);
            localStorage.setItem('token', res.data.token);
            login(res.data);
            
            // Redirect based on role
            const roleRedirects = {
                'Admin': '/dashboard',
                'Farmer': '/dashboard',
                'Industry': '/dashboard',
                'Transport': '/dashboard',
                'Retail': '/dashboard',
                'Consumer': '/trace/1' // Default or latest batch
            };
            navigate(roleRedirects[res.data.user.role] || '/dashboard');
        } catch (err) {
            const response = err.response;
            const status = response?.status;
            const serverMsg = response?.data?.msg || response?.statusText;
            const fallback = err.message;

            if (response) {
                setError(`Error (${status}): ${serverMsg || 'Unexpected API response'}`);
            } else {
                setError(`Network error: ${fallback}. Make sure backend URL is set and reachable.`);
            }

            console.error('Login/register error details:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900 overflow-y-auto">
            <div className="w-full max-w-lg p-6 my-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="p-8 md:p-12">
                        {/* Logo & Title */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 text-green-600 shadow-inner">
                                <Leaf size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">AgriTrace</h1>
                            <p className="text-gray-500 mt-2 font-medium">Agricultural Supply Chain Tracking</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
                            {isLogin ? 'Welcome Back' : 'Join AgriTrace'}
                        </h2>
                        
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-pulse">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="Full Name"
                                        onChange={handleChange} 
                                        required 
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium" 
                                    />
                                </div>
                            )}
                            
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email Address"
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium" 
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Password"
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium" 
                                />
                            </div>

                            {!isLogin && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select 
                                            name="role" 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium appearance-none"
                                        >
                                            <option value="Farmer">Farmer</option>
                                            <option value="Industry">Industry</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Consumer">Consumer</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input 
                                            type="text" 
                                            name="location" 
                                            placeholder="Location"
                                            onChange={handleChange} 
                                            required 
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium" 
                                        />
                                    </div>
                                    <div className="relative md:col-span-2">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            placeholder="Phone Number"
                                            onChange={handleChange} 
                                            required 
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-gray-700 font-medium" 
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                            <button 
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-gray-500 hover:text-green-600 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                                {isLogin ? "New to AgriTrace? " : "Already have an account? "}
                                <span className="text-green-600 underline">
                                    {isLogin ? "Create an account" : "Sign in here"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-white/60 text-sm mt-8 font-medium">
                    &copy; 2026 AgriTrace. Secure Blockchain Supply Chain.
                </p>
            </div>
        </div>
    );
};

export default Login;
